// F2 Equipamentos — processo principal (Electron)
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let autoUpdater = null;
try { autoUpdater = require('electron-updater').autoUpdater; } catch (_) { /* rodando sem dependências instaladas */ }

let win;
const CONFIG_FILE = () => path.join(app.getPath('userData'), 'config.json');

function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE(), 'utf8')); } catch { return {}; }
}
function writeConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_FILE()), { recursive: true });
  fs.writeFileSync(CONFIG_FILE(), JSON.stringify(cfg, null, 2));
}
function dataDir() {
  const cfg = readConfig();
  return cfg.dataDir && fs.existsSync(cfg.dataDir) ? cfg.dataDir : app.getPath('userData');
}
const dataFile = () => path.join(dataDir(), 'f2-equipamentos-dados.json');
const backupDir = () => path.join(dataDir(), 'backups-f2');

// ---------- Dados ----------
ipcMain.handle('data:load', () => {
  try { return JSON.parse(fs.readFileSync(dataFile(), 'utf8')); } catch { return null; }
});

let lastBackup = 0;
ipcMain.handle('data:save', (_e, data) => {
  const file = dataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // backup automático (no máx. 1 a cada 10 min, guarda os 30 mais recentes)
  if (fs.existsSync(file) && Date.now() - lastBackup > 10 * 60 * 1000) {
    fs.mkdirSync(backupDir(), { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(file, path.join(backupDir(), `backup-${stamp}.json`));
    lastBackup = Date.now();
    const old = fs.readdirSync(backupDir()).filter(f => f.endsWith('.json')).sort().reverse().slice(30);
    old.forEach(f => fs.unlinkSync(path.join(backupDir(), f)));
  }
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, file);
  ignoreWatchUntil = Date.now() + 1500;
  return { ok: true, path: file };
});

ipcMain.handle('data:info', () => ({ dir: dataDir(), file: dataFile(), version: app.getVersion() }));

ipcMain.handle('data:chooseDir', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Escolha a pasta onde os dados serão guardados (ex.: pasta de rede compartilhada)',
    properties: ['openDirectory', 'createDirectory']
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const cfg = readConfig(); cfg.dataDir = r.filePaths[0]; writeConfig(cfg);
  startWatch();
  return r.filePaths[0];
});

ipcMain.handle('data:openDir', () => shell.openPath(dataDir()));

// Vários computadores na mesma pasta de rede: avisa a tela quando o arquivo muda
let watcher = null; let ignoreWatchUntil = 0;
function startWatch() {
  try { watcher && watcher.close(); } catch {}
  try {
    fs.mkdirSync(dataDir(), { recursive: true });
    watcher = fs.watch(dataDir(), (_ev, name) => {
      if (name !== path.basename(dataFile()) || Date.now() < ignoreWatchUntil) return;
      win && win.webContents.send('data:changed');
    });
  } catch {}
}

// ---------- PDF ----------
ipcMain.handle('print:pdf', async (_e, suggestedName) => {
  const r = await dialog.showSaveDialog(win, {
    title: 'Salvar documento em PDF',
    defaultPath: path.join(app.getPath('documents'), suggestedName || 'documento.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (r.canceled || !r.filePath) return null;
  const pdf = await win.webContents.printToPDF({ printBackground: true, preferCSSPageSize: true, pageSize: 'A4', margins: { marginType: 'none' } });
  fs.writeFileSync(r.filePath, pdf);
  shell.openPath(r.filePath);
  return r.filePath;
});

// ---------- Atualizações via GitHub Releases ----------
function sendUpdate(status, extra = {}) { win && win.webContents.send('update:status', { status, ...extra }); }

function setupUpdater() {
  if (!autoUpdater || !app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('checking-for-update', () => sendUpdate('checking'));
  autoUpdater.on('update-available', i => sendUpdate('available', { version: i.version }));
  autoUpdater.on('update-not-available', () => sendUpdate('none'));
  autoUpdater.on('download-progress', p => sendUpdate('downloading', { percent: Math.round(p.percent) }));
  autoUpdater.on('update-downloaded', i => sendUpdate('ready', { version: i.version }));
  autoUpdater.on('error', err => sendUpdate('error', { message: String(err && err.message || err) }));
  autoUpdater.checkForUpdates().catch(() => {});
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 60 * 60 * 1000);
}
ipcMain.handle('update:check', async () => {
  if (!autoUpdater || !app.isPackaged) { sendUpdate('dev'); return; }
  try { await autoUpdater.checkForUpdates(); } catch (e) { sendUpdate('error', { message: e.message }); }
});
ipcMain.handle('update:install', () => { autoUpdater && autoUpdater.quitAndInstall(false, true); });

// ---------- Janela ----------
function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700,
    backgroundColor: '#0e0f12',
    title: 'F2 Equipamentos',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('did-finish-load', () => setupUpdater());
}

const single = app.requestSingleInstanceLock();
if (!single) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => { createWindow(); startWatch(); });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}
