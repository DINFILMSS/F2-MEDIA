const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  load: () => ipcRenderer.invoke('data:load'),
  save: data => ipcRenderer.invoke('data:save', data),
  info: () => ipcRenderer.invoke('data:info'),
  chooseDir: () => ipcRenderer.invoke('data:chooseDir'),
  openDir: () => ipcRenderer.invoke('data:openDir'),
  printPDF: name => ipcRenderer.invoke('print:pdf', name),
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdate: cb => ipcRenderer.on('update:status', (_e, s) => cb(s)),
  onDataChanged: cb => ipcRenderer.on('data:changed', () => cb())
});
