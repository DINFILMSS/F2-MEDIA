/* F2 Equipamentos — aplicação */
(function () {
'use strict';

// ============================================================
// Utilidades
// ============================================================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = (n, l = 4) => String(n).padStart(l, '0');
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const money = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const parseMoney = s => { const t = String(s ?? '').replace(/[^\d,.-]/g, ''); if (!t) return 0; return Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t) || 0; };
const fDate = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
const fDT = d => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const toInput = d => { const x = d ? new Date(d) : new Date(); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
const fromInput = s => s ? new Date(s).toISOString() : null;
const relDays = d => {
  const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);
  if (diff === 0) return 'hoje'; if (diff === 1) return 'amanhã'; if (diff === -1) return 'ontem';
  return diff > 0 ? `em ${diff} dias` : `há ${-diff} dias`;
};

const P = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  out: '<path d="M7 17 17 7M8 7h9v9"/>',
  in: '<path d="M17 7 7 17M16 17H7V8"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  video: '<path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  aperture: '<circle cx="12" cy="12" r="10"/><path d="m14.3 8 5.7 9.9M9.7 8h11.5M7.4 12l5.7-9.9M9.7 16 4 6.1M14.3 16H2.8M16.6 12l-5.7 9.9"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 17v5M8 22h8"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a6 6 0 0 1-12 0V8z"/>',
  hdd: '<path d="M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M6 16h.01M10 16h.01"/>',
  tripod: '<path d="M8 3h8v4H8zM12 7v4M12 11 5 21M12 11l7 10M12 11v10"/>',
  drone: '<circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m7 7 3 3M17 7l-3 3M7 17l3-3M17 17l-3-3"/><rect x="10" y="10" width="4" height="4" rx="1"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M11 8v8M15 8v8M18 8v8"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  money: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>'
};
const ic = (n, cls = '') => `<svg viewBox="0 0 24 24" class="i ${cls}">${P[n] || P.box}</svg>`;

const CAT_ICONS = [
  [/c[aâ]mera|corpo/, 'video'], [/lente|[oó]tica/, 'aperture'], [/ilumin|luz|led/, 'bulb'], [/[aá]udio|som|microf/, 'mic'],
  [/grip|maquin/, 'wrench'], [/monitor|v[ií]deo assist/, 'monitor'], [/bateria|energia/, 'battery'], [/cabo|conex/, 'plug'],
  [/armazen|cart[aã]o|ssd|hd/, 'hdd'], [/trip[eé]|estabiliz|gimbal/, 'tripod'], [/drone/, 'drone']
];
const catIcon = c => { const n = norm(c); const f = CAT_ICONS.find(([r]) => r.test(n)); return f ? f[1] : 'box'; };
const photo = (eq, cls = '') => `<div class="ph ${cls}">${eq && eq.foto ? `<img src="${eq.foto}" alt="">` : ic(catIcon(eq && eq.categoria))}</div>`;

const STATUS = { disponivel: 'Disponível', em_uso: 'Em uso', manutencao: 'Manutenção', baixado: 'Baixado' };
const MOV_STATUS = { aberta: 'Em aberto', parcial: 'Retorno parcial', fechada: 'Concluída', atrasada: 'Atrasada' };
const CONDICOES = { ok: 'OK', avaria: 'Com avaria', incompleto: 'Faltando acessório' };
const pill = (k, map = STATUS) => `<span class="pill ${k}">${map[k] || k}</span>`;

// ============================================================
// Banco de dados
// ============================================================
const DEFAULT_TERMO = `Declaro ter recebido os equipamentos relacionados acima, em perfeito estado de conservação e funcionamento, de propriedade de {empresa}, comprometendo-me a utilizá-los exclusivamente para a produção indicada e a devolvê-los até a data prevista de retorno, nas mesmas condições em que os recebi.
Em caso de dano, perda, furto ou extravio, assumo a responsabilidade pelo ressarcimento do valor de reposição indicado neste termo, salvo desgaste natural decorrente do uso adequado.`;

const DEFAULT_SETTINGS = {
  empresa: 'F2 Produtora', subtitulo: 'Controle de equipamentos', cnpj: '', endereco: '', telefone: '', email: '', site: '',
  logo: null, accent: '#ff4d2e', prefixo: 'F2', seqEquip: 1, seqSaida: 1, seqEntrada: 1,
  categorias: ['Câmeras', 'Lentes', 'Iluminação', 'Áudio', 'Grip & Maquinária', 'Monitores', 'Baterias & Energia', 'Cabos & Conexões', 'Armazenamento', 'Tripés & Estabilizadores', 'Drones', 'Acessórios'],
  termo: DEFAULT_TERMO, operador: '',
  label: { model: 't50x30', qr: true, barcode: false, logo: true, nome: true, serie: true, prop: true, copies: 1 }
};

let db = { settings: { ...DEFAULT_SETTINGS }, equipamentos: [], movimentacoes: [] };
let saving = Promise.resolve();

async function loadDB() {
  const data = await Store.load();
  if (data && data.settings) {
    db = data;
    db.settings = { ...DEFAULT_SETTINGS, ...data.settings, label: { ...DEFAULT_SETTINGS.label, ...(data.settings.label || {}) } };
    db.equipamentos = db.equipamentos || []; db.movimentacoes = db.movimentacoes || [];
  }
}
function commit() {
  saving = saving.then(() => Store.save(db)).catch(e => toast('Erro ao salvar: ' + e.message, 'err'));
  renderNav();
  return saving;
}

const eqById = id => db.equipamentos.find(e => e.id === id);
const eqByCode = code => { const c = norm(code).trim(); return db.equipamentos.find(e => norm(e.codigo) === c) || db.equipamentos.find(e => e.serie && norm(e.serie) === c); };
const movById = id => db.movimentacoes.find(m => m.id === id);
const nextCode = () => { let c; do { c = `${db.settings.prefixo}-${pad(db.settings.seqEquip++)}`; } while (db.equipamentos.some(e => e.codigo === c)); return c; };

function movState(m) {
  const pend = m.itens.filter(i => !i.retornado).length;
  if (m.cancelada) return 'cancelada';
  if (pend === 0) return 'fechada';
  if (m.previsaoRetorno && new Date(m.previsaoRetorno) < new Date()) return 'atrasada';
  return pend < m.itens.length ? 'parcial' : 'aberta';
}
const openMovs = () => db.movimentacoes.filter(m => !m.cancelada && m.itens.some(i => !i.retornado));
const lateMovs = () => openMovs().filter(m => movState(m) === 'atrasada');
function eqLog(eq, txt, tipo = 'misc') { (eq.log = eq.log || []).push({ t: new Date().toISOString(), tipo, txt }); }

// ============================================================
// UI básica: toast, modal, confirm
// ============================================================
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = ic(type === 'err' ? 'alert' : type === 'warn' ? 'alert' : 'check') + `<span>${msg}</span>`;
  $('#toast-root').appendChild(el);
  setTimeout(() => { el.style.transition = '.3s'; el.style.opacity = 0; el.style.transform = 'translateX(20px)'; setTimeout(() => el.remove(), 300); }, 3200);
}
function modal({ title, body, foot = '', size = '', onMount, onClose }) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="modal ${size}"><div class="modal-head"><h2>${title}</h2><button class="btn ghost icon" data-x>${ic('x')}</button></div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
  const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = e => { if (e.key === 'Escape' && $('#modal-root').lastElementChild === ov) close(); };
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  ov.querySelector('[data-x]').onclick = close;
  document.addEventListener('keydown', onKey);
  $('#modal-root').appendChild(ov);
  const api = { el: ov, close };
  onMount && onMount(ov, api);
  return api;
}
function confirmBox(title, text, okLabel = 'Confirmar', danger = true) {
  return new Promise(res => {
    let done = false;
    const m = modal({
      title, size: 'sm', body: `<p style="margin:0;color:var(--muted)">${text}</p>`,
      foot: `<button class="btn" data-no>Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${okLabel}</button>`,
      onClose: () => { if (!done) res(false); },
      onMount: (el, api) => {
        el.querySelector('[data-no]').onclick = () => api.close();
        el.querySelector('[data-ok]').onclick = () => { done = true; res(true); api.close(); };
      }
    });
    return m;
  });
}
function promptBox(title, label, value = '') {
  return new Promise(res => {
    let done = false;
    modal({
      title, size: 'sm', body: `<div class="field"><label>${label}</label><input class="input" data-in value="${esc(value)}"></div>`,
      foot: `<button class="btn" data-no>Cancelar</button><button class="btn primary" data-ok>OK</button>`,
      onClose: () => { if (!done) res(null); },
      onMount: (el, api) => {
        const i = el.querySelector('[data-in]'); i.focus();
        const ok = () => { done = true; res(i.value.trim() || null); api.close(); };
        el.querySelector('[data-no]').onclick = () => api.close();
        el.querySelector('[data-ok]').onclick = ok;
        i.onkeydown = e => { if (e.key === 'Enter') ok(); };
      }
    });
  });
}
function resizeImage(file, max = 900) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        res(file.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = rej; img.src = r.result;
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
function pickFile(accept) {
  return new Promise(res => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept;
    i.onchange = () => res(i.files[0] || null); i.click();
  });
}
function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ============================================================
// Tema / marca
// ============================================================
function brandInitials() {
  const w = (db.settings.empresa || 'F2').trim().split(/\s+/);
  return (w[0].length <= 3 ? w[0] : w.map(x => x[0]).join('')).slice(0, 3).toUpperCase();
}
function applyBrand() {
  const s = db.settings;
  document.documentElement.style.setProperty('--accent', s.accent || '#ff4d2e');
  const initials = brandInitials();
  $('#brand').innerHTML = `<div class="logo ${s.logo ? 'img' : ''}">${s.logo ? `<img src="${s.logo}" alt="">` : esc(initials)}</div><div><b>${esc(s.empresa)}</b><small>Equipamentos</small></div>`;
  document.title = `${s.empresa} — Equipamentos`;
}

// ============================================================
// Navegação
// ============================================================
const NAV = [
  { sec: 'Operação' },
  { href: '#/', icon: 'dashboard', label: 'Painel' },
  { href: '#/catalogo', icon: 'box', label: 'Catálogo', badge: () => db.equipamentos.length || '' },
  { href: '#/saida/nova', icon: 'out', label: 'Nova saída' },
  { href: '#/movimentacoes', icon: 'swap', label: 'Saídas & Entradas', badge: () => { const l = lateMovs().length; return l ? { v: l, cls: '' } : (openMovs().length ? { v: openMovs().length, cls: 'warn' } : ''); } },
  { sec: 'Ferramentas' },
  { href: '#/etiquetas', icon: 'tag', label: 'Etiquetas' },
  { href: '#/config', icon: 'settings', label: 'Configurações' }
];
function renderNav() {
  const cur = location.hash || '#/';
  $('#nav').innerHTML = NAV.map(n => {
    if (n.sec) return `<div class="sec">${n.sec}</div>`;
    const active = cur === n.href || (n.href !== '#/' && cur.startsWith(n.href)) || (n.href === '#/movimentacoes' && /^#\/(entrada|doc)/.test(cur));
    let b = n.badge && n.badge();
    const badge = b ? (typeof b === 'object' ? `<span class="badge ${b.cls}">${b.v}</span>` : `<span class="badge" style="background:#2a2e38;color:#b9bdc8">${b}</span>`) : '';
    return `<a href="${n.href}" class="${active ? 'active' : ''}">${ic(n.icon)}${n.label}${badge}</a>`;
  }).join('');
}

const routes = [];
const route = (re, view) => routes.push([re, view]);
let current = null;
function router() {
  const h = location.hash || '#/';
  ui.scan = null;
  for (const [re, view] of routes) {
    const m = h.match(re);
    if (m) {
      current = view;
      $('#crumbs').innerHTML = view.crumbs ? view.crumbs(...m.slice(1)) : '';
      $('#view').innerHTML = view.render(...m.slice(1));
      $('#view').scrollTop = 0;
      view.mount && view.mount(...m.slice(1));
      renderNav();
      return;
    }
  }
  location.hash = '#/';
}
const go = h => { if (location.hash === h) router(); else location.hash = h; };
const crumb = (...parts) => parts.map((p, i) => i === parts.length - 1 ? `<b>${p}</b>` : `<span>${p}</span><span>/</span>`).join('');

const ui = {
  cat: 'Todas', status: 'todos', q: '', view: 'grid', sel: new Set(), movTab: 'abertas', movQ: '',
  draft: null, ret: null, scan: null, lblItems: null
};

// ============================================================
// Leitor de código de barras / QR (teclado) + busca global
// ============================================================
(function scanner() {
  let buf = '', last = 0;
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#globalSearch').focus(); $('#globalSearch').select(); return; }
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const now = Date.now();
    if (now - last > 60) buf = '';
    last = now;
    if (e.key === 'Enter') { if (buf.length >= 3) { e.preventDefault(); handleScan(buf); } buf = ''; return; }
    if (e.key.length === 1) buf += e.key;
  });
})();
function handleScan(code) {
  code = code.trim();
  if (ui.scan && ui.scan(code)) return;
  const eq = eqByCode(code);
  if (eq) openEquip(eq.id);
  else toast(`Código "${esc(code)}" não encontrado`, 'warn');
}

(function globalSearch() {
  const inp = $('#globalSearch'), box = $('#searchResults');
  let items = [], sel = 0;
  const draw = () => {
    const q = norm(inp.value).trim();
    if (!q) { box.classList.remove('open'); return; }
    const eqs = db.equipamentos.filter(e => norm([e.codigo, e.nome, e.marca, e.modelo, e.serie, e.categoria].join(' ')).includes(q)).slice(0, 7);
    const movs = db.movimentacoes.filter(m => norm([m.numero, m.projeto, m.cliente, m.responsavel].join(' ')).includes(q)).slice(0, 4);
    items = [...eqs.map(e => ({ t: 'e', e })), ...movs.map(m => ({ t: 'm', m }))];
    sel = 0;
    box.innerHTML = items.length ? items.map((it, i) => it.t === 'e'
      ? `<div class="sr ${i === sel ? 'sel' : ''}" data-i="${i}">${photo(it.e, 'thumb')}<div><b>${esc(it.e.nome)}</b><small><span class="mono">${esc(it.e.codigo)}</span> · ${esc(it.e.categoria || '')}</small></div><div style="margin-left:auto">${pill(it.e.status)}</div></div>`
      : `<div class="sr ${i === sel ? 'sel' : ''}" data-i="${i}"><div class="ph thumb">${ic('file')}</div><div><b>${esc(it.m.numero)} · ${esc(it.m.projeto)}</b><small>${esc(it.m.responsavel)} · ${fDate(it.m.dataSaida)}</small></div><div style="margin-left:auto">${pill(movState(it.m), MOV_STATUS)}</div></div>`).join('')
      : `<div class="sr"><small>Nada encontrado para "${esc(inp.value)}"</small></div>`;
    box.classList.add('open');
  };
  const pick = i => {
    const it = items[i]; if (!it) return;
    inp.value = ''; box.classList.remove('open'); inp.blur();
    if (it.t === 'e') openEquip(it.e.id); else go(`#/doc/saida/${it.m.id}`);
  };
  inp.addEventListener('input', draw);
  inp.addEventListener('focus', draw);
  inp.addEventListener('blur', () => setTimeout(() => box.classList.remove('open'), 150));
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(items.length, 1);
      $$('.sr', box).forEach((el, i) => el.classList.toggle('sel', i === sel));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const exact = eqByCode(inp.value);
      if (exact) { inp.value = ''; box.classList.remove('open'); inp.blur(); if (!(ui.scan && ui.scan(exact.codigo))) openEquip(exact.id); }
      else pick(sel);
    } else if (e.key === 'Escape') { inp.blur(); }
  });
  box.addEventListener('mousedown', e => { const el = e.target.closest('[data-i]'); if (el) pick(+el.dataset.i); });
})();

document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); go(g.dataset.go); }
});

// ============================================================
// PAINEL
// ============================================================
route(/^#\/?$/, {
  crumbs: () => crumb('Painel'),
  render() {
    const E = db.equipamentos, s = db.settings;
    if (!E.length) return `
      <div class="card" style="max-width:640px;margin:60px auto;text-align:center;padding:44px">
        <div style="width:64px;height:64px;border-radius:18px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;margin:0 auto 18px">${ic('sparkle')}</div>
        <h1 style="margin:0 0 8px;font-size:26px">Bem-vindo ao ${esc(s.empresa)} Equipamentos</h1>
        <p class="muted" style="margin:0 0 26px">Cadastre o inventário, controle retiradas e devoluções com termo assinado e imprima etiquetas com QR Code para cada item.</p>
        <div class="actions" style="justify-content:center">
          <button class="btn primary" id="firstAdd">${ic('plus')}Cadastrar primeiro equipamento</button>
          <button class="btn" id="demo">${ic('sparkle')}Carregar dados de exemplo</button>
        </div>
        <p class="muted" style="font-size:12.5px;margin-top:22px">Dica: personalize nome, logo e cores em <a href="#/config" style="color:var(--accent)">Configurações</a>.</p>
      </div>`;
    const cnt = k => E.filter(e => e.status === k).length;
    const total = E.filter(e => e.status !== 'baixado').reduce((a, e) => a + (+e.valor || 0), 0);
    const emUsoValor = E.filter(e => e.status === 'em_uso').reduce((a, e) => a + (+e.valor || 0), 0);
    const late = lateMovs(), open = openMovs();
    const cats = {}; E.forEach(e => { cats[e.categoria || 'Sem categoria'] = (cats[e.categoria || 'Sem categoria'] || 0) + 1; });
    const catArr = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 8), maxC = Math.max(...catArr.map(c => c[1]), 1);
    const events = [];
    db.movimentacoes.forEach(m => {
      events.push({ t: m.dataSaida, k: 'out', txt: `<b>${esc(m.numero)}</b> saída · ${esc(m.projeto)}`, sub: `${m.itens.length} itens · ${esc(m.responsavel)}`, go: `#/doc/saida/${m.id}` });
      (m.retornos || []).forEach(r => events.push({ t: r.data, k: 'in', txt: `<b>${esc(r.numero)}</b> entrada · ${esc(m.projeto)}`, sub: `${r.itens.length} itens · recebido por ${esc(r.recebidoPor || '—')}`, go: `#/doc/entrada/${m.id}/${r.id}` }));
    });
    events.sort((a, b) => new Date(b.t) - new Date(a.t));
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const upcoming = open.filter(m => movState(m) !== 'atrasada').sort((a, b) => new Date(a.previsaoRetorno) - new Date(b.previsaoRetorno));
    return `
      <div class="page-head"><div><h1>${greet}${s.operador ? ', ' + esc(s.operador.split(' ')[0]) : ''} 👋</h1><p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · visão geral do inventário</p></div>
        <div class="actions"><button class="btn" data-go="#/catalogo">${ic('box')}Catálogo</button><button class="btn" id="dashAdd">${ic('plus')}Equipamento</button></div></div>
      <div class="kpis">
        <div class="kpi acc" data-go="#/catalogo"><div class="ico">${ic('box')}</div><div class="lbl">Itens no inventário</div><div class="val">${E.length}</div><div class="sub">${catArr.length} categorias</div></div>
        <div class="kpi ok" data-k="disponivel"><div class="ico">${ic('check')}</div><div class="lbl">Disponíveis</div><div class="val">${cnt('disponivel')}</div><div class="sub">${Math.round(cnt('disponivel') / E.length * 100)}% do total</div></div>
        <div class="kpi warn" data-k="em_uso"><div class="ico">${ic('out')}</div><div class="lbl">Em uso / fora</div><div class="val">${cnt('em_uso')}</div><div class="sub">${money(emUsoValor)} em campo</div></div>
        <div class="kpi info" data-k="manutencao"><div class="ico">${ic('wrench')}</div><div class="lbl">Manutenção</div><div class="val">${cnt('manutencao')}</div><div class="sub">aguardando reparo</div></div>
        <div class="kpi ${late.length ? 'bad' : 'ok'}" data-go="#/movimentacoes"><div class="ico">${ic('clock')}</div><div class="lbl">Devoluções atrasadas</div><div class="val">${late.length}</div><div class="sub">${open.length} saídas em aberto</div></div>
        <div class="kpi acc"><div class="ico">${ic('money')}</div><div class="lbl">Patrimônio</div><div class="val" style="font-size:21px;padding-top:8px">${money(total)}</div><div class="sub">valor de reposição</div></div>
      </div>
      <div class="dash">
        <div>
          ${late.length ? `<div class="card" style="border-color:rgba(255,84,104,.35)"><h3><span style="color:var(--bad);display:flex;gap:8px;align-items:center">${ic('alert')}Atrasados</span><span class="muted">${late.length}</span></h3>${movTable(late)}</div>` : ''}
          <div class="card"><h3>Saídas em aberto <span class="muted">${upcoming.length}</span></h3>${upcoming.length ? movTable(upcoming) : `<div class="empty" style="padding:26px">${ic('check')}<h4>Tudo em casa</h4>Nenhum equipamento fora no momento.</div>`}</div>
        </div>
        <div>
          <div class="card"><h3>Por categoria</h3><div class="bars">${catArr.map(([c, n]) => `<div class="bar-row"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c)}</span><div class="track"><div class="fill" style="width:${n / maxC * 100}%"></div></div><span>${n}</span></div>`).join('')}</div></div>
          <div class="card"><h3>Atividade recente</h3>${events.length ? `<div class="timeline">${events.slice(0, 7).map(ev => `<div class="tl" style="cursor:pointer" data-go="${ev.go}"><div class="b ${ev.k}">${ic(ev.k)}</div><div>${ev.txt}<small>${ev.sub} · ${fDT(ev.t)}</small></div></div>`).join('')}</div>` : '<p class="muted" style="margin:0">Sem movimentações ainda.</p>'}</div>
        </div>
      </div>`;
  },
  mount() {
    const demoBtn = $('#demo'); if (demoBtn) demoBtn.onclick = loadDemo;
    const fa = $('#firstAdd'); if (fa) fa.onclick = () => editEquip();
    const da = $('#dashAdd'); if (da) da.onclick = () => editEquip();
    $$('.kpi[data-k]').forEach(k => k.onclick = () => { ui.status = k.dataset.k; ui.cat = 'Todas'; go('#/catalogo'); });
  }
});

function movTable(list) {
  return `<table class="table"><thead><tr><th>Nº</th><th>Produção</th><th>Responsável</th><th>Retorno</th><th>Itens</th><th></th></tr></thead><tbody>
  ${list.map(m => {
    const st = movState(m), ret = m.itens.filter(i => i.retornado).length;
    return `<tr class="click" data-go="#/doc/saida/${m.id}"><td class="mono" style="color:var(--accent);font-weight:600">${esc(m.numero)}</td><td><b>${esc(m.projeto)}</b><div class="muted" style="font-size:12px">${esc(m.cliente || '')}</div></td><td>${esc(m.responsavel)}</td>
    <td>${fDate(m.previsaoRetorno)}<div style="font-size:12px;color:${st === 'atrasada' ? 'var(--bad)' : 'var(--muted)'}">${m.previsaoRetorno ? relDays(m.previsaoRetorno) : ''}</div></td>
    <td><span class="progress"><i style="width:${ret / m.itens.length * 100}%"></i></span><span class="muted">${ret}/${m.itens.length}</span></td>
    <td class="r">${st !== 'fechada' && st !== 'cancelada' ? `<button class="btn sm" data-go="#/entrada/${m.id}">${ic('in')}Entrada</button>` : ''}</td></tr>`;
  }).join('')}</tbody></table>`;
}

// ============================================================
// CATÁLOGO
// ============================================================
route(/^#\/catalogo$/, {
  crumbs: () => crumb('Catálogo'),
  render() {
    const cats = ['Todas', ...db.settings.categorias];
    const count = c => c === 'Todas' ? db.equipamentos.length : db.equipamentos.filter(e => e.categoria === c).length;
    return `
      <div class="page-head"><div><h1>Catálogo</h1><p>${db.equipamentos.length} equipamentos cadastrados</p></div>
        <div class="actions">
          <button class="btn" id="selMode">${ic('tag')}Selecionar p/ etiquetas</button>
          <button class="btn" id="exportCsv">${ic('download')}Exportar planilha</button>
          <button class="btn primary" id="addEq">${ic('plus')}Novo equipamento</button>
        </div></div>
      <div class="toolbar">
        <div class="search">${ic('search')}<input class="input" id="catQ" placeholder="Buscar por nome, código, marca, modelo, nº de série…" value="${esc(ui.q)}"></div>
        <select class="input" id="catStatus">
          <option value="todos">Todos os status</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${ui.status === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <div class="seg"><button data-v="grid" class="${ui.view === 'grid' ? 'on' : ''}" title="Grade">${ic('grid')}</button><button data-v="list" class="${ui.view === 'list' ? 'on' : ''}" title="Lista">${ic('list')}</button></div>
      </div>
      <div class="chips">${cats.filter(c => c === 'Todas' || count(c)).map(c => `<button class="chip ${ui.cat === c ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}<span class="n">${count(c)}</span></button>`).join('')}</div>
      <div id="eqList"></div>
      <div id="selBar"></div>`;
  },
  mount() {
    const draw = () => {
      const q = norm(ui.q);
      const list = db.equipamentos.filter(e =>
        (ui.cat === 'Todas' || e.categoria === ui.cat) &&
        (ui.status === 'todos' || e.status === ui.status) &&
        (!q || norm([e.codigo, e.nome, e.marca, e.modelo, e.serie, e.categoria, e.obs].join(' ')).includes(q))
      ).sort((a, b) => a.codigo.localeCompare(b.codigo, 'pt', { numeric: true }));
      const box = $('#eqList');
      box.className = ui.sel.size ? 'selecting' : '';
      if (!list.length) { box.innerHTML = `<div class="empty">${ic('search')}<h4>Nenhum equipamento encontrado</h4>Ajuste os filtros ou cadastre um novo item.</div>`; }
      else if (ui.view === 'grid') {
        box.innerHTML = `<div class="eq-grid">${list.map(e => `
          <div class="eq-card ${ui.sel.has(e.id) ? 'sel' : ''}" data-id="${e.id}">
            <div class="check" data-check>${ic('check')}</div>
            ${photo(e)}
            <div class="body"><div class="code">${esc(e.codigo)}</div><div class="name" title="${esc(e.nome)}">${esc(e.nome)}</div>
            <div class="meta">${esc([e.marca, e.modelo].filter(Boolean).join(' · ') || e.categoria || '')}</div>
            <div class="foot">${pill(e.status)}<span class="muted" style="font-size:12px">${e.valor ? money(e.valor) : ''}</span></div></div>
          </div>`).join('')}</div>`;
      } else {
        box.innerHTML = `<div class="card" style="padding:6px 8px"><table class="table"><thead><tr><th style="width:30px"></th><th>Equipamento</th><th>Código</th><th>Categoria</th><th>Nº série</th><th>Status</th><th class="r">Valor</th></tr></thead><tbody>
          ${list.map(e => `<tr class="click" data-id="${e.id}"><td><div class="cbox ${ui.sel.has(e.id) ? 'on' : ''}" data-check>${ic('check')}</div></td>
          <td><div class="cell-eq">${photo(e, 'thumb')}<div><b>${esc(e.nome)}</b><small>${esc([e.marca, e.modelo].filter(Boolean).join(' · '))}</small></div></div></td>
          <td class="mono" style="color:var(--accent)">${esc(e.codigo)}</td><td>${esc(e.categoria || '')}</td><td class="mono muted">${esc(e.serie || '—')}</td><td>${pill(e.status)}</td><td class="r">${e.valor ? money(e.valor) : '—'}</td></tr>`).join('')}
        </tbody></table></div>`;
      }
      drawSel();
    };
    const drawSel = () => {
      $('#selBar').innerHTML = ui.sel.size ? `<div class="selbar"><b>${ui.sel.size} selecionado(s)</b><div class="actions">
        <button class="btn ghost" id="selAll">Selecionar visíveis</button><button class="btn ghost" id="selClear">Limpar</button>
        <button class="btn" id="selOut">${ic('out')}Criar saída</button><button class="btn primary" id="selLbl">${ic('tag')}Imprimir etiquetas</button></div></div>` : '';
      if (!ui.sel.size) return;
      $('#selClear').onclick = () => { ui.sel.clear(); draw(); };
      $('#selAll').onclick = () => { $$('#eqList [data-id]').forEach(el => ui.sel.add(el.dataset.id)); draw(); };
      $('#selLbl').onclick = () => { ui.lblItems = [...ui.sel]; go('#/etiquetas'); };
      $('#selOut').onclick = () => {
        newDraft();
        const skipped = [];
        [...ui.sel].forEach(id => { const e = eqById(id); if (e.status === 'disponivel') ui.draft.itens.push(id); else skipped.push(e.codigo); });
        if (skipped.length) toast(`${skipped.length} item(ns) indisponível(is) ignorado(s)`, 'warn');
        ui.sel.clear(); go('#/saida/nova');
      };
    };
    $('#eqList').addEventListener('click', e => {
      const card = e.target.closest('[data-id]'); if (!card) return;
      const id = card.dataset.id;
      if (e.target.closest('[data-check]') || ui.sel.size || e.ctrlKey || e.metaKey) {
        ui.sel.has(id) ? ui.sel.delete(id) : ui.sel.add(id); draw();
      } else openEquip(id);
    });
    $('#catQ').addEventListener('input', e => { ui.q = e.target.value; draw(); });
    $('#catStatus').onchange = e => { ui.status = e.target.value; draw(); };
    $$('.chip').forEach(c => c.onclick = () => { ui.cat = c.dataset.cat; $$('.chip').forEach(x => x.classList.toggle('on', x === c)); draw(); });
    $$('.seg button').forEach(b => b.onclick = () => { ui.view = b.dataset.v; $$('.seg button').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    $('#addEq').onclick = () => editEquip();
    $('#selMode').onclick = () => { $$('#eqList [data-id]').forEach(el => ui.sel.add(el.dataset.id)); draw(); };
    $('#exportCsv').onclick = exportCSV;
    current.refresh = draw;
    draw();
  }
});

function exportCSV() {
  const cols = ['codigo', 'nome', 'categoria', 'marca', 'modelo', 'serie', 'status', 'valor', 'aquisicao', 'acessorios', 'obs'];
  const head = ['Código', 'Nome', 'Categoria', 'Marca', 'Modelo', 'Nº série', 'Status', 'Valor', 'Aquisição', 'Acessórios', 'Observações'];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = db.equipamentos.map(e => cols.map(c => c === 'status' ? STATUS[e.status] : c === 'valor' ? String(e.valor || 0).replace('.', ',') : e[c]).map(q).join(';'));
  download(`inventario-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + [head.map(q).join(';'), ...rows].join('\r\n'), 'text/csv;charset=utf-8');
  toast('Planilha exportada (abre no Excel)');
}

// ---------- Detalhe do equipamento ----------
function openEquip(id) {
  const e = eqById(id); if (!e) return;
  const hist = [];
  db.movimentacoes.forEach(m => {
    if (m.cancelada) return;
    const it = m.itens.find(i => i.eqId === id); if (!it) return;
    hist.push({ t: m.dataSaida, k: 'out', txt: `Saída <b>${esc(m.numero)}</b> · ${esc(m.projeto)}`, sub: `Responsável: ${esc(m.responsavel)}`, go: `#/doc/saida/${m.id}` });
    (m.retornos || []).forEach(r => { const ri = r.itens.find(x => x.eqId === id); if (ri) hist.push({ t: r.data, k: 'in', txt: `Retorno <b>${esc(r.numero)}</b> · ${CONDICOES[ri.condicao] || 'OK'}`, sub: ri.obs ? esc(ri.obs) : `Recebido por ${esc(r.recebidoPor || '—')}`, go: `#/doc/entrada/${m.id}/${r.id}` }); });
  });
  (e.log || []).forEach(l => hist.push({ t: l.t, k: 'misc', txt: esc(l.txt), sub: '' }));
  hist.sort((a, b) => new Date(b.t) - new Date(a.t));
  const uses = db.movimentacoes.filter(m => !m.cancelada && m.itens.some(i => i.eqId === id)).length;
  const openMov = openMovs().find(m => m.itens.some(i => i.eqId === id && !i.retornado));
  modal({
    title: `<span class="mono" style="color:var(--accent);margin-right:10px">${esc(e.codigo)}</span>${esc(e.nome)}`, size: 'lg',
    body: `<div class="detail">
      <div>${photo(e)}
        <div class="codes-box"><div class="qr">${Codes.qrSVG(e.codigo, { size: 92 })}</div><div class="bc">${Codes.code128SVG(e.codigo, { height: 46 })}${esc(e.codigo)}</div></div>
      </div>
      <div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px">${pill(e.status)}<span class="muted" style="font-size:12.5px">· ${uses} uso(s) registrado(s)</span></div>
        ${openMov ? `<div class="card" style="padding:12px 14px;margin-bottom:16px;border-color:rgba(255,176,32,.35);background:rgba(255,176,32,.05)"><b>Fora com ${esc(openMov.responsavel)}</b> — ${esc(openMov.projeto)} <span class="muted">(${esc(openMov.numero)}, retorno ${fDate(openMov.previsaoRetorno)})</span></div>` : ''}
        <dl class="dl">
          <dt>Categoria</dt><dd>${esc(e.categoria || '—')}</dd>
          <dt>Marca / Modelo</dt><dd>${esc([e.marca, e.modelo].filter(Boolean).join(' · ') || '—')}</dd>
          <dt>Nº de série</dt><dd class="mono">${esc(e.serie || '—')}</dd>
          <dt>Valor de reposição</dt><dd>${e.valor ? money(e.valor) : '—'}</dd>
          <dt>Aquisição</dt><dd>${e.aquisicao ? fDate(e.aquisicao + 'T12:00') : '—'}</dd>
          <dt>Acessórios inclusos</dt><dd>${esc(e.acessorios || '—')}</dd>
          <dt>Observações</dt><dd style="white-space:pre-line">${esc(e.obs || '—')}</dd>
        </dl>
        <h3 style="font-size:13px;margin:22px 0 12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Histórico</h3>
        ${hist.length ? `<div class="timeline">${hist.slice(0, 12).map(h => `<div class="tl" ${h.go ? `style="cursor:pointer" data-hgo="${h.go}"` : ''}><div class="b ${h.k}">${ic(h.k === 'misc' ? 'edit' : h.k)}</div><div>${h.txt}<small>${fDT(h.t)}${h.sub ? ' · ' + h.sub : ''}</small></div></div>`).join('')}</div>` : '<p class="muted">Sem histórico.</p>'}
      </div></div>`,
    foot: `<button class="btn danger" data-a="del" style="margin-right:auto">${ic('trash')}Excluir</button>
      <select class="input" data-a="status" style="width:auto">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${e.status === k ? 'selected' : ''} ${k === 'em_uso' && e.status !== 'em_uso' ? 'disabled' : ''}>${v}</option>`).join('')}</select>
      <button class="btn" data-a="dup">${ic('copy')}Duplicar</button>
      <button class="btn" data-a="lbl">${ic('tag')}Etiqueta</button>
      <button class="btn primary" data-a="edit">${ic('edit')}Editar</button>`,
    onMount(el, api) {
      el.querySelector('[data-a=edit]').onclick = () => { api.close(); editEquip(id); };
      el.querySelector('[data-a=dup]').onclick = () => { api.close(); editEquip(null, e); };
      el.querySelector('[data-a=lbl]').onclick = () => { api.close(); ui.lblItems = [id]; go('#/etiquetas'); };
      el.querySelector('[data-a=status]').onchange = ev => {
        const v = ev.target.value;
        if (e.status === 'em_uso') { toast('Item está em uso — registre a entrada primeiro', 'warn'); ev.target.value = e.status; return; }
        eqLog(e, `Status alterado: ${STATUS[e.status]} → ${STATUS[v]}`); e.status = v; commit(); api.close(); openEquip(id); refreshView();
      };
      el.querySelector('[data-a=del]').onclick = async () => {
        if (e.status === 'em_uso') return toast('Não é possível excluir um item em uso', 'err');
        if (!await confirmBox('Excluir equipamento', `Excluir <b>${esc(e.codigo)} – ${esc(e.nome)}</b>? O histórico dos documentos é mantido.`, 'Excluir')) return;
        db.equipamentos = db.equipamentos.filter(x => x.id !== id); commit(); api.close(); toast('Equipamento excluído'); refreshView();
      };
      el.querySelectorAll('[data-hgo]').forEach(h => h.onclick = () => { api.close(); go(h.dataset.hgo); });
    }
  });
}
const refreshView = () => { if (current && current.refresh) current.refresh(); else router(); };

// ---------- Formulário ----------
function editEquip(id, template) {
  const e = id ? eqById(id) : null;
  const d = e ? { ...e } : template ? { ...template, id: null, codigo: '', serie: '', foto: template.foto, status: 'disponivel', log: [] } : { status: 'disponivel', categoria: ui.cat !== 'Todas' ? ui.cat : '' };
  const previewCode = e ? e.codigo : `${db.settings.prefixo}-${pad(db.settings.seqEquip)}`;
  let foto = d.foto || null;
  const opts = db.settings.categorias.map(c => `<option ${d.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('');
  modal({
    title: e ? 'Editar equipamento' : 'Novo equipamento', size: 'lg',
    body: `<div class="eq-form">
      <div><div class="photo-drop" id="pd">${foto ? `<img src="${foto}">` : `<div>${ic('image')}<div style="margin-top:8px;font-size:12.5px">Clique ou arraste<br>uma foto</div></div>`}</div>
      ${foto ? '' : ''}<button class="btn sm ghost" id="pdRm" style="margin-top:8px;width:100%;justify-content:center;${foto ? '' : 'display:none'}">${ic('trash')}Remover foto</button></div>
      <div class="grid2">
        <div class="field span2"><label>Nome do equipamento <span class="req">*</span></label><input class="input" id="f_nome" value="${esc(d.nome)}" placeholder="Ex.: Câmera Sony FX6"></div>
        <div class="field"><label>Categoria</label><select class="input" id="f_cat"><option value="">—</option>${opts}<option value="__new">+ Nova categoria…</option></select></div>
        <div class="field"><label>Código de patrimônio</label><input class="input mono" id="f_cod" value="${esc(e ? e.codigo : '')}" placeholder="${esc(previewCode)} (automático)"></div>
        <div class="field"><label>Marca</label><input class="input" id="f_marca" value="${esc(d.marca)}" list="dl_marcas"></div>
        <div class="field"><label>Modelo</label><input class="input" id="f_modelo" value="${esc(d.modelo)}"></div>
        <div class="field"><label>Nº de série</label><input class="input mono" id="f_serie" value="${esc(d.serie)}"></div>
        <div class="field"><label>Valor de reposição (R$)</label><input class="input" id="f_valor" value="${d.valor ? String(d.valor).replace('.', ',') : ''}" placeholder="0,00" inputmode="decimal"></div>
        <div class="field"><label>Data de aquisição</label><input class="input" type="date" id="f_aq" value="${esc(d.aquisicao || '')}"></div>
        <div class="field"><label>Status</label><select class="input" id="f_status" ${d.status === 'em_uso' ? 'disabled' : ''}>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${d.status === k ? 'selected' : ''} ${k === 'em_uso' && d.status !== 'em_uso' ? 'disabled' : ''}>${v}</option>`).join('')}</select></div>
        <div class="field span2"><label>Acessórios inclusos</label><input class="input" id="f_acc" value="${esc(d.acessorios)}" placeholder="Ex.: 2 baterias, carregador, case, tampa de lente"></div>
        <div class="field span2"><label>Observações</label><textarea class="input" id="f_obs" rows="3">${esc(d.obs)}</textarea></div>
        ${e ? '' : `<div class="field"><label>Quantidade de unidades</label><input class="input" type="number" min="1" max="200" id="f_qtd" value="1"></div><div class="field" style="justify-content:flex-end"><small class="muted">Cada unidade recebe um código próprio e sequencial.</small></div>`}
      </div></div>
      <datalist id="dl_marcas">${[...new Set(db.equipamentos.map(x => x.marca).filter(Boolean))].map(m => `<option value="${esc(m)}">`).join('')}</datalist>`,
    foot: `<button class="btn" data-c>Cancelar</button>${e ? '' : `<button class="btn" data-save="more">Salvar e cadastrar outro</button>`}<button class="btn primary" data-save="1">${ic('check')}Salvar</button>`,
    onMount(el, api) {
      const pd = el.querySelector('#pd'), rm = el.querySelector('#pdRm');
      const setPhoto = f => { foto = f; pd.innerHTML = f ? `<img src="${f}">` : `<div>${ic('image')}<div style="margin-top:8px;font-size:12.5px">Clique ou arraste<br>uma foto</div></div>`; rm.style.display = f ? '' : 'none'; };
      const take = async file => { if (file && file.type.startsWith('image/')) setPhoto(await resizeImage(file)); };
      pd.onclick = async () => take(await pickFile('image/*'));
      rm.onclick = () => setPhoto(null);
      pd.ondragover = ev => { ev.preventDefault(); pd.classList.add('drag'); };
      pd.ondragleave = () => pd.classList.remove('drag');
      pd.ondrop = ev => { ev.preventDefault(); pd.classList.remove('drag'); take(ev.dataTransfer.files[0]); };
      el.addEventListener('paste', ev => { const f = [...(ev.clipboardData.files || [])][0]; if (f) take(f); });
      el.querySelector('#f_cat').onchange = ev => {
        if (ev.target.value !== '__new') return;
        const sel = ev.target;
        promptBox('Nova categoria', 'Nome da categoria').then(n => {
          if (n) {
            if (!db.settings.categorias.includes(n)) db.settings.categorias.push(n);
            const o = document.createElement('option'); o.textContent = n; o.selected = true;
            sel.insertBefore(o, sel.lastElementChild);
          } else sel.value = '';
        });
      };
      el.querySelector('[data-c]').onclick = api.close;
      el.querySelector('#f_nome').focus();
      el.querySelectorAll('[data-save]').forEach(b => b.onclick = () => {
        const v = s => el.querySelector(s).value.trim();
        const nome = v('#f_nome');
        if (!nome) { el.querySelector('#f_nome').focus(); return toast('Informe o nome do equipamento', 'err'); }
        const codigo = v('#f_cod');
        if (codigo && db.equipamentos.some(x => x.codigo.toLowerCase() === codigo.toLowerCase() && x.id !== id)) return toast('Esse código já existe', 'err');
        const data = {
          nome, categoria: v('#f_cat') === '__new' ? '' : v('#f_cat'), marca: v('#f_marca'), modelo: v('#f_modelo'), serie: v('#f_serie'),
          valor: parseMoney(v('#f_valor')), aquisicao: v('#f_aq'), acessorios: v('#f_acc'), obs: v('#f_obs'), foto
        };
        if (e) {
          if (!el.querySelector('#f_status').disabled && e.status !== v('#f_status')) eqLog(e, `Status alterado: ${STATUS[e.status]} → ${STATUS[v('#f_status')]}`);
          Object.assign(e, data, { codigo: codigo || e.codigo, status: el.querySelector('#f_status').disabled ? e.status : v('#f_status') });
          eqLog(e, 'Cadastro atualizado');
          toast('Equipamento atualizado');
        } else {
          const qtd = Math.max(1, Math.min(200, +el.querySelector('#f_qtd').value || 1));
          for (let i = 0; i < qtd; i++) {
            const n = { id: uid(), ...data, codigo: i === 0 && codigo ? codigo : nextCode(), status: v('#f_status'), criadoEm: new Date().toISOString(), log: [] };
            if (i > 0) n.serie = '';
            eqLog(n, 'Equipamento cadastrado');
            db.equipamentos.push(n);
          }
          toast(qtd > 1 ? `${qtd} unidades cadastradas` : 'Equipamento cadastrado');
        }
        commit(); api.close(); refreshView();
        if (b.dataset.save === 'more') editEquip(null, { ...data, foto: null });
      });
    }
  });
}

// ============================================================
// NOVA SAÍDA
// ============================================================
function newDraft() {
  const now = new Date(), ret = new Date(); ret.setDate(ret.getDate() + 2); ret.setHours(18, 0, 0, 0);
  ui.draft = { projeto: '', cliente: '', local: '', responsavel: '', documento: '', telefone: '', entreguePor: db.settings.operador || '', dataSaida: toInput(now), previsaoRetorno: toInput(ret), obs: '', itens: [] };
}
route(/^#\/saida\/nova$/, {
  crumbs: () => crumb('Saídas & Entradas', 'Nova saída'),
  render() {
    if (!ui.draft) newDraft();
    const d = ui.draft;
    const f = (k, label, req, attrs = '') => `<div class="field"><label>${label}${req ? ' <span class="req">*</span>' : ''}</label><input class="input" data-f="${k}" value="${esc(d[k])}" ${attrs}></div>`;
    return `
      <div class="page-head"><div><h1>Nova saída</h1><p>Registre a retirada e gere o termo de responsabilidade.</p></div>
        <div class="actions"><button class="btn ghost" id="discard">Limpar</button><button class="btn primary" id="saveOut">${ic('file')}Registrar saída e gerar termo</button></div></div>
      <div class="out-layout">
        <div class="card">
          <h3>Dados da retirada</h3>
          <div class="grid2">
            <div class="span2">${f('projeto', 'Produção / Projeto', true, 'placeholder="Ex.: Comercial Natura – Diária 1"')}</div>
            ${f('cliente', 'Cliente')}${f('local', 'Local de uso', false, 'placeholder="Estúdio, locação…"')}
            ${f('responsavel', 'Responsável pela retirada', true, 'list="dl_resp"')}${f('documento', 'Documento (RG/CPF)')}
            ${f('telefone', 'Telefone')}${f('entreguePor', 'Liberado por')}
            ${f('dataSaida', 'Data/hora de saída', true, 'type="datetime-local"')}${f('previsaoRetorno', 'Previsão de retorno', true, 'type="datetime-local"')}
            <div class="field span2"><label>Observações</label><textarea class="input" data-f="obs" rows="2">${esc(d.obs)}</textarea></div>
          </div>
          <datalist id="dl_resp">${[...new Set(db.movimentacoes.map(m => m.responsavel))].map(r => `<option value="${esc(r)}">`).join('')}</datalist>
        </div>
        <div class="card">
          <h3>Equipamentos <span class="muted" id="cartCount"></span></h3>
          <div class="scanbox">${ic('scan')}<input id="pickQ" placeholder="Bipe o código ou busque pelo nome…" autocomplete="off"><button class="btn sm" id="pickToggle">${ic('list')}Ver disponíveis</button></div>
          <div class="picker hidden" id="picker"></div>
          <div class="cart" id="cart" style="margin-top:14px"></div>
        </div>
      </div>`;
  },
  mount() {
    const d = ui.draft;
    $$('[data-f]').forEach(i => i.addEventListener('input', () => { d[i.dataset.f] = i.value; }));
    const respInput = $('[data-f=responsavel]');
    respInput.addEventListener('change', () => {
      const prev = [...db.movimentacoes].reverse().find(m => m.responsavel === respInput.value);
      if (prev) { ['documento', 'telefone'].forEach(k => { if (!d[k]) { d[k] = prev[k] || ''; $(`[data-f=${k}]`).value = d[k]; } }); }
    });
    const add = (id, silent) => {
      const e = eqById(id); if (!e) return false;
      if (d.itens.includes(id)) { if (!silent) toast(`${e.codigo} já está na lista`, 'warn'); return true; }
      if (e.status !== 'disponivel') { toast(`${e.codigo} está ${STATUS[e.status].toLowerCase()}`, 'err'); return true; }
      d.itens.push(id); drawCart(); drawPicker();
      const it = $(`#cart [data-id="${id}"]`); it && it.classList.add('flash');
      return true;
    };
    const drawCart = () => {
      const items = d.itens.map(eqById).filter(Boolean);
      $('#cartCount').textContent = items.length ? `${items.length} item(ns)` : '';
      $('#cart').innerHTML = items.length ? items.map((e, i) => `<div class="cart-item" data-id="${e.id}"><span class="muted mono" style="width:22px;text-align:right">${i + 1}</span>${photo(e, 'thumb')}<div class="grow"><b>${esc(e.nome)}</b><small><span class="mono" style="color:var(--accent)">${esc(e.codigo)}</span>${e.serie ? ' · SN ' + esc(e.serie) : ''}${e.acessorios ? ' · ' + esc(e.acessorios) : ''}</small></div><span class="muted" style="font-size:12.5px">${e.valor ? money(e.valor) : ''}</span><button class="btn ghost icon sm" data-rm="${e.id}">${ic('x')}</button></div>`).join('')
        + `<div class="cart-total"><span>Valor total de reposição</span><span>${money(items.reduce((a, e) => a + (+e.valor || 0), 0))}</span></div>`
        : `<div class="empty" style="padding:30px">${ic('scan')}<h4>Nenhum item ainda</h4>Use um leitor de código de barras/QR ou busque acima.</div>`;
      $$('[data-rm]').forEach(b => b.onclick = () => { d.itens = d.itens.filter(x => x !== b.dataset.rm); drawCart(); drawPicker(); });
    };
    let pickOpen = false;
    const drawPicker = () => {
      const q = norm($('#pickQ').value).trim();
      const pk = $('#picker');
      if (!q && !pickOpen) { pk.classList.add('hidden'); return; }
      const list = db.equipamentos.filter(e => !q || norm([e.codigo, e.nome, e.marca, e.modelo, e.serie, e.categoria].join(' ')).includes(q))
        .sort((a, b) => (a.status === 'disponivel' ? 0 : 1) - (b.status === 'disponivel' ? 0 : 1) || a.codigo.localeCompare(b.codigo, 'pt', { numeric: true })).slice(0, 60);
      pk.classList.remove('hidden');
      pk.innerHTML = list.length ? list.map(e => {
        const inCart = d.itens.includes(e.id), off = e.status !== 'disponivel' || inCart;
        return `<div class="pick ${off ? 'off' : ''}" data-pid="${e.id}">${photo(e, 'thumb')}<div class="grow"><b>${esc(e.nome)}</b><small><span class="mono">${esc(e.codigo)}</span> · ${esc(e.categoria || '')}</small></div>${inCart ? '<span class="muted" style="font-size:12px">na lista</span>' : e.status !== 'disponivel' ? pill(e.status) : `<span class="add">${ic('plus')}</span>`}</div>`;
      }).join('') : `<div class="pick off"><small>Nada encontrado</small></div>`;
    };
    $('#picker').addEventListener('click', e => { const p = e.target.closest('[data-pid]'); if (p && !p.classList.contains('off')) add(p.dataset.pid); });
    $('#pickQ').addEventListener('input', drawPicker);
    $('#pickQ').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const v = e.target.value.trim(); if (!v) return;
      const ex = eqByCode(v);
      if (ex) { add(ex.id); e.target.value = ''; drawPicker(); return; }
      const first = $('#picker .pick:not(.off)'); if (first) { add(first.dataset.pid); e.target.value = ''; drawPicker(); }
      else toast('Nenhum item disponível com esse código', 'warn');
    });
    $('#pickToggle').onclick = () => { pickOpen = !pickOpen; drawPicker(); };
    ui.scan = code => { const e = eqByCode(code); if (!e) { toast(`Código "${esc(code)}" não encontrado`, 'warn'); return true; } add(e.id); return true; };
    $('#discard').onclick = async () => { if (d.itens.length && !await confirmBox('Limpar formulário', 'Descartar os dados e itens desta saída?', 'Limpar')) return; newDraft(); router(); };
    $('#saveOut').onclick = () => {
      const miss = [['projeto', 'Produção / Projeto'], ['responsavel', 'Responsável'], ['dataSaida', 'Data de saída'], ['previsaoRetorno', 'Previsão de retorno']].find(([k]) => !String(d[k]).trim());
      if (miss) { $(`[data-f=${miss[0]}]`).focus(); return toast(`Preencha: ${miss[1]}`, 'err'); }
      if (!d.itens.length) return toast('Adicione ao menos um equipamento', 'err');
      if (new Date(d.previsaoRetorno) < new Date(d.dataSaida)) return toast('A previsão de retorno é anterior à saída', 'err');
      const bad = d.itens.map(eqById).filter(e => !e || e.status !== 'disponivel');
      if (bad.length) return toast('Há itens que não estão mais disponíveis', 'err');
      const m = {
        id: uid(), numero: `S-${pad(db.settings.seqSaida++)}`, tipo: 'saida',
        projeto: d.projeto.trim(), cliente: d.cliente.trim(), local: d.local.trim(), responsavel: d.responsavel.trim(), documento: d.documento.trim(), telefone: d.telefone.trim(), entreguePor: d.entreguePor.trim(),
        dataSaida: fromInput(d.dataSaida), previsaoRetorno: fromInput(d.previsaoRetorno), obs: d.obs.trim(), criadoEm: new Date().toISOString(),
        itens: d.itens.map(id => { const e = eqById(id); return { eqId: id, codigo: e.codigo, nome: e.nome, marca: e.marca, modelo: e.modelo, serie: e.serie, valor: +e.valor || 0, acessorios: e.acessorios || '', retornado: false }; }),
        retornos: []
      };
      m.itens.forEach(i => { eqById(i.eqId).status = 'em_uso'; });
      db.movimentacoes.push(m);
      if (d.entreguePor) db.settings.operador = d.entreguePor;
      ui.draft = null; commit();
      toast(`Saída ${m.numero} registrada`);
      go(`#/doc/saida/${m.id}`);
    };
    drawCart();
  }
});

// ============================================================
// MOVIMENTAÇÕES
// ============================================================
route(/^#\/movimentacoes$/, {
  crumbs: () => crumb('Saídas & Entradas'),
  render() {
    const all = db.movimentacoes.filter(m => !m.cancelada);
    const tabs = { abertas: openMovs(), atrasadas: lateMovs(), concluidas: all.filter(m => movState(m) === 'fechada'), todas: all };
    return `
      <div class="page-head"><div><h1>Saídas & Entradas</h1><p>Controle de retiradas, devoluções e documentos.</p></div>
        <div class="actions"><button class="btn primary" data-go="#/saida/nova">${ic('out')}Nova saída</button></div></div>
      <div class="tabs">${[['abertas', 'Em aberto'], ['atrasadas', 'Atrasadas'], ['concluidas', 'Concluídas'], ['todas', 'Todas']].map(([k, l]) => `<button data-t="${k}" class="${ui.movTab === k ? 'on' : ''}">${l}<span class="n">${tabs[k].length}</span></button>`).join('')}
        <div style="margin-left:auto;padding-bottom:6px" class="search toolbar"><div class="search" style="min-width:280px">${ic('search')}<input class="input" id="movQ" placeholder="Nº, produção, responsável, cliente…" value="${esc(ui.movQ)}"></div></div></div>
      <div class="card" style="padding:6px 8px" id="movList"></div>`;
  },
  mount() {
    const draw = () => {
      const all = db.movimentacoes.filter(m => !m.cancelada);
      let list = ui.movTab === 'abertas' ? openMovs() : ui.movTab === 'atrasadas' ? lateMovs() : ui.movTab === 'concluidas' ? all.filter(m => movState(m) === 'fechada') : all;
      const q = norm(ui.movQ);
      if (q) list = list.filter(m => norm([m.numero, m.projeto, m.cliente, m.responsavel, ...(m.retornos || []).map(r => r.numero), ...m.itens.map(i => i.codigo + ' ' + i.nome)].join(' ')).includes(q));
      list = [...list].sort((a, b) => new Date(b.dataSaida) - new Date(a.dataSaida));
      $('#movList').innerHTML = list.length ? `<table class="table"><thead><tr><th>Nº</th><th>Produção</th><th>Responsável</th><th>Saída</th><th>Retorno previsto</th><th>Devolvidos</th><th>Status</th><th></th></tr></thead><tbody>
        ${list.map(m => {
          const st = movState(m), ret = m.itens.filter(i => i.retornado).length;
          return `<tr class="click" data-go="#/doc/saida/${m.id}"><td class="mono" style="color:var(--accent);font-weight:600">${esc(m.numero)}</td>
          <td><b>${esc(m.projeto)}</b><div class="muted" style="font-size:12px">${esc([m.cliente, m.local].filter(Boolean).join(' · '))}</div></td>
          <td>${esc(m.responsavel)}</td><td>${fDT(m.dataSaida)}</td>
          <td>${fDT(m.previsaoRetorno)}${st !== 'fechada' ? `<div style="font-size:12px;color:${st === 'atrasada' ? 'var(--bad)' : 'var(--muted)'}">${relDays(m.previsaoRetorno)}</div>` : ''}</td>
          <td><span class="progress"><i style="width:${ret / m.itens.length * 100}%"></i></span><span class="muted">${ret}/${m.itens.length}</span></td>
          <td>${pill(st, MOV_STATUS)}</td>
          <td class="r"><div class="actions" style="justify-content:flex-end">${(m.retornos || []).length ? `<span class="muted" style="font-size:12px">${m.retornos.map(r => esc(r.numero)).join(', ')}</span>` : ''}${st !== 'fechada' ? `<button class="btn sm" data-go="#/entrada/${m.id}">${ic('in')}Entrada</button>` : ''}</div></td></tr>`;
        }).join('')}</tbody></table>` : `<div class="empty">${ic('swap')}<h4>Nada por aqui</h4>${ui.movTab === 'atrasadas' ? 'Nenhuma devolução atrasada. 🎬' : 'Nenhuma movimentação encontrada.'}</div>`;
    };
    $$('.tabs [data-t]').forEach(b => b.onclick = () => { ui.movTab = b.dataset.t; $$('.tabs [data-t]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    $('#movQ').addEventListener('input', e => { ui.movQ = e.target.value; draw(); });
    current.refresh = draw;
    draw();
  }
});

// ============================================================
// ENTRADA (devolução)
// ============================================================
route(/^#\/entrada\/([\w]+)$/, {
  crumbs: id => { const m = movById(id); return crumb('Saídas & Entradas', m ? `Entrada · ${esc(m.numero)}` : 'Entrada'); },
  render(id) {
    const m = movById(id);
    if (!m) return `<div class="empty">${ic('alert')}<h4>Saída não encontrada</h4></div>`;
    if (!ui.ret || ui.ret.movId !== id) ui.ret = { movId: id, sel: {}, devolvidoPor: m.responsavel, recebidoPor: db.settings.operador || '', data: toInput(), obs: '' };
    const r = ui.ret, pend = m.itens.filter(i => !i.retornado), st = movState(m);
    return `
      <div class="page-head"><div><h1>Registrar entrada</h1><p>Devolução referente à saída <b class="mono" style="color:var(--accent)">${esc(m.numero)}</b> · ${esc(m.projeto)} · ${esc(m.responsavel)} ${pill(st, MOV_STATUS)}</p></div>
        <div class="actions"><button class="btn" data-go="#/doc/saida/${m.id}">${ic('file')}Ver termo de saída</button><button class="btn primary" id="saveIn">${ic('check')}Confirmar entrada</button></div></div>
      <div class="out-layout" style="grid-template-columns:1.5fr 1fr">
        <div class="card">
          <h3>Itens pendentes <span class="muted"><span id="selCount">0</span>/${pend.length} conferidos</span></h3>
          <div class="scanbox" style="margin-bottom:14px">${ic('scan')}<input id="retQ" placeholder="Bipe cada equipamento que está voltando…" autocomplete="off"><button class="btn sm" id="allOk">${ic('check')}Marcar todos</button></div>
          <div id="retList">
          ${m.itens.map((it, idx) => {
            const e = eqById(it.eqId) || it;
            if (it.retornado) return `<div class="ret-item done"><div class="cbox on">${ic('check')}</div>${photo(e, 'thumb')}<div><b>${esc(it.nome)}</b><div class="muted" style="font-size:12px"><span class="mono">${esc(it.codigo)}</span> · devolvido ${fDate(it.dataRetorno)}</div></div><div class="muted" style="font-size:12.5px">${CONDICOES[it.condicao] || 'OK'}</div></div>`;
            const s = r.sel[idx] || {};
            return `<div class="ret-item ${s.on ? 'on' : ''}" data-idx="${idx}"><div class="cbox" data-tog>${ic('check')}</div>${photo(e, 'thumb')}
              <div style="min-width:0"><b>${esc(it.nome)}</b><div class="muted" style="font-size:12px"><span class="mono" style="color:var(--accent)">${esc(it.codigo)}</span>${it.serie ? ' · SN ' + esc(it.serie) : ''}${it.acessorios ? ' · ' + esc(it.acessorios) : ''}</div></div>
              <select class="input" data-cond>${Object.entries(CONDICOES).map(([k, v]) => `<option value="${k}" ${(s.cond || 'ok') === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
              <input class="input obs ${s.cond && s.cond !== 'ok' ? '' : 'hidden'}" data-obs placeholder="Descreva a avaria / o que está faltando…" value="${esc(s.obs || '')}"></div>`;
          }).join('')}
          </div>
        </div>
        <div class="card">
          <h3>Dados da devolução</h3>
          <div class="grid2" style="grid-template-columns:1fr">
            <div class="field"><label>Devolvido por</label><input class="input" data-r="devolvidoPor" value="${esc(r.devolvidoPor)}"></div>
            <div class="field"><label>Recebido / conferido por</label><input class="input" data-r="recebidoPor" value="${esc(r.recebidoPor)}"></div>
            <div class="field"><label>Data/hora da entrada</label><input class="input" type="datetime-local" data-r="data" value="${esc(r.data)}"></div>
            <div class="field"><label>Observações</label><textarea class="input" data-r="obs" rows="3">${esc(r.obs)}</textarea></div>
          </div>
          <p class="muted" style="font-size:12.5px;margin:14px 0 0">Itens marcados "Com avaria" voltam ao catálogo com status <b>Manutenção</b>. Itens não marcados continuam pendentes nesta saída.</p>
        </div>
      </div>`;
  },
  mount(id) {
    const m = movById(id); if (!m) return;
    const r = ui.ret;
    const count = () => { $('#selCount').textContent = Object.values(r.sel).filter(s => s.on).length; };
    const toggle = (idx, on) => {
      const row = $(`.ret-item[data-idx="${idx}"]`); if (!row) return;
      const s = r.sel[idx] = r.sel[idx] || { cond: 'ok' };
      s.on = on === undefined ? !s.on : on;
      row.classList.toggle('on', s.on); count();
    };
    $('#retList').addEventListener('click', e => { const t = e.target.closest('[data-tog]'); if (t) toggle(t.closest('[data-idx]').dataset.idx); });
    $$('[data-cond]').forEach(sel => sel.onchange = () => {
      const idx = sel.closest('[data-idx]').dataset.idx; const s = r.sel[idx] = r.sel[idx] || {};
      s.cond = sel.value; sel.closest('[data-idx]').querySelector('[data-obs]').classList.toggle('hidden', sel.value === 'ok');
      if (!s.on) toggle(idx, true);
    });
    $$('[data-obs]').forEach(i => i.oninput = () => { const idx = i.closest('[data-idx]').dataset.idx; (r.sel[idx] = r.sel[idx] || {}).obs = i.value; });
    $$('[data-r]').forEach(i => i.oninput = () => { r[i.dataset.r] = i.value; });
    const byCode = code => {
      const idx = m.itens.findIndex(it => !it.retornado && (norm(it.codigo) === norm(code) || (it.serie && norm(it.serie) === norm(code))));
      if (idx < 0) { toast(`"${esc(code)}" não pertence a esta saída (ou já foi devolvido)`, 'warn'); return true; }
      toggle(idx, true); const row = $(`.ret-item[data-idx="${idx}"]`); row.classList.add('flash'); row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return true;
    };
    ui.scan = byCode;
    $('#retQ').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.value.trim()) { e.preventDefault(); byCode(e.target.value.trim()); e.target.value = ''; } });
    $('#allOk').onclick = () => m.itens.forEach((it, idx) => !it.retornado && toggle(idx, true));
    count();
    $('#saveIn').onclick = () => {
      const chosen = Object.entries(r.sel).filter(([, s]) => s.on).map(([idx, s]) => [+idx, s]);
      if (!chosen.length) return toast('Marque ao menos um item devolvido', 'err');
      const missingObs = chosen.find(([, s]) => s.cond && s.cond !== 'ok' && !String(s.obs || '').trim());
      if (missingObs) return toast('Descreva a avaria / o item faltante', 'err');
      const data = fromInput(r.data) || new Date().toISOString();
      const ret = { id: uid(), numero: `E-${pad(db.settings.seqEntrada++)}`, data, devolvidoPor: r.devolvidoPor.trim(), recebidoPor: r.recebidoPor.trim(), obs: r.obs.trim(), itens: [] };
      chosen.forEach(([idx, s]) => {
        const it = m.itens[idx]; const cond = s.cond || 'ok';
        it.retornado = true; it.dataRetorno = data; it.condicao = cond; it.obsRetorno = s.obs || ''; it.retornoId = ret.id;
        ret.itens.push({ eqId: it.eqId, codigo: it.codigo, nome: it.nome, serie: it.serie, valor: it.valor, condicao: cond, obs: s.obs || '' });
        const e = eqById(it.eqId);
        if (e) { e.status = cond === 'avaria' ? 'manutencao' : 'disponivel'; if (cond !== 'ok') eqLog(e, `${CONDICOES[cond]} na devolução ${ret.numero}: ${s.obs || ''}`); }
      });
      (m.retornos = m.retornos || []).push(ret);
      if (r.recebidoPor) db.settings.operador = r.recebidoPor;
      ui.ret = null; commit();
      toast(`Entrada ${ret.numero} registrada`);
      go(`#/doc/entrada/${m.id}/${ret.id}`);
    };
  }
});

// ============================================================
// DOCUMENTOS
// ============================================================
function docHeader(title, numero, tagText, tagColor) {
  const s = db.settings;
  const info = [s.cnpj && `CNPJ ${s.cnpj}`, s.endereco, [s.telefone, s.email, s.site].filter(Boolean).join(' · ')].filter(Boolean);
  const initials = brandInitials();
  return `<div class="dh"><div class="co">${s.logo ? `<img src="${s.logo}">` : `<div class="mono-logo">${esc(initials)}</div>`}<div><b>${esc(s.empresa)}</b>${info.map(l => `<small>${esc(l)}</small>`).join('')}</div></div>
    <div class="num"><div class="t">${title}</div><div class="n">${esc(numero)}</div><span class="tag" style="background:${tagColor}">${tagText}</span></div></div>`;
}
function docFooter(code) {
  return `<div class="ft"><span>Documento gerado em ${fDT(new Date())} · ${esc(db.settings.empresa)} — Sistema de Equipamentos</span>${Codes.qrSVG(code, { size: 52 })}</div>`;
}
function docSaida(m) {
  const total = m.itens.reduce((a, i) => a + (+i.valor || 0), 0);
  const termo = (db.settings.termo || '').replace(/\{empresa\}/g, db.settings.empresa).replace(/\{responsavel\}/g, m.responsavel);
  return `<div class="docp">
    ${docHeader('Termo de retirada', m.numero, 'SAÍDA', 'var(--accent)')}
    <h1>Termo de retirada e responsabilidade de equipamentos</h1>
    <div class="info">
      <div class="w2"><span>Produção / Projeto</span><b>${esc(m.projeto)}</b></div><div><span>Cliente</span><b>${esc(m.cliente || '—')}</b></div>
      <div><span>Responsável pela retirada</span><b>${esc(m.responsavel)}</b></div><div><span>Documento</span><b>${esc(m.documento || '—')}</b></div><div><span>Telefone</span><b>${esc(m.telefone || '—')}</b></div>
      <div><span>Data de saída</span><b>${fDT(m.dataSaida)}</b></div><div><span>Previsão de retorno</span><b>${fDT(m.previsaoRetorno)}</b></div><div><span>Local de uso</span><b>${esc(m.local || '—')}</b></div>
    </div>
    <table><thead><tr><th style="width:7mm">#</th><th style="width:22mm">Código</th><th>Equipamento</th><th style="width:32mm">Nº série</th><th class="r" style="width:28mm">Valor</th><th style="width:12mm;text-align:center">Ret.</th></tr></thead><tbody>
      ${m.itens.map((i, n) => `<tr><td>${n + 1}</td><td><b>${esc(i.codigo)}</b></td><td><b>${esc(i.nome)}</b>${(() => { const sub = [[i.marca, i.modelo].filter(Boolean).join(' · '), i.acessorios && 'Acompanha: ' + i.acessorios].filter(Boolean).join(' — '); return sub ? `<br><span style="color:#666;font-size:7.8pt">${esc(sub)}</span>` : ''; })()}</td><td>${esc(i.serie || '—')}</td><td class="r">${money(i.valor)}</td><td style="text-align:center">${i.retornado ? '✔' : '☐'}</td></tr>`).join('')}
    </tbody></table>
    <div class="tot"><span>${m.itens.length} ${m.itens.length === 1 ? 'item' : 'itens'}</span><span>Valor total de reposição: ${money(total)}</span></div>
    ${m.obs ? `<div class="obs"><span>Observações</span>${esc(m.obs)}</div>` : ''}
    <div class="terms">${esc(termo)}</div>
    <div class="signs"><div>${esc(m.entreguePor || db.settings.empresa)}<small>Liberado por (${esc(db.settings.empresa)})</small></div><div>${esc(m.responsavel)}<small>Responsável pela retirada${m.documento ? ' · ' + esc(m.documento) : ''}</small></div></div>
    ${docFooter(m.numero)}
  </div>`;
}
function docEntrada(m, r) {
  const pend = m.itens.filter(i => !i.retornado || (i.retornoId && m.retornos.findIndex(x => x.id === i.retornoId) > m.retornos.findIndex(x => x.id === r.id)));
  return `<div class="docp">
    ${docHeader('Termo de devolução', r.numero, 'ENTRADA', '#1a9e5a')}
    <h1>Termo de devolução de equipamentos</h1>
    <div class="info">
      <div class="w2"><span>Produção / Projeto</span><b>${esc(m.projeto)}</b></div><div><span>Referente à saída</span><b>${esc(m.numero)} · ${fDate(m.dataSaida)}</b></div>
      <div><span>Devolvido por</span><b>${esc(r.devolvidoPor || m.responsavel)}</b></div><div><span>Recebido por</span><b>${esc(r.recebidoPor || '—')}</b></div><div><span>Data da devolução</span><b>${fDT(r.data)}</b></div>
    </div>
    <table><thead><tr><th style="width:7mm">#</th><th style="width:22mm">Código</th><th>Equipamento</th><th style="width:30mm">Nº série</th><th style="width:34mm">Condição</th></tr></thead><tbody>
      ${r.itens.map((i, n) => `<tr><td>${n + 1}</td><td><b>${esc(i.codigo)}</b></td><td><b>${esc(i.nome)}</b>${i.obs ? `<br><span style="color:#c00;font-size:8pt">${esc(i.obs)}</span>` : ''}</td><td>${esc(i.serie || '—')}</td><td><span class="cond ${i.condicao !== 'ok' ? 'bad' : ''}">${CONDICOES[i.condicao] || 'OK'}</span></td></tr>`).join('')}
    </tbody></table>
    <div class="tot"><span>${r.itens.length} ${r.itens.length === 1 ? 'item devolvido' : 'itens devolvidos'}</span></div>
    ${pend.length ? `<div class="pend"><b>Itens ainda pendentes nesta saída (${pend.length}):</b> ${pend.map(i => `${esc(i.codigo)} – ${esc(i.nome)}`).join('; ')}</div>` : `<div class="obs" style="color:#1a9e5a;font-weight:700">✔ Todos os itens da saída ${esc(m.numero)} foram devolvidos.</div>`}
    ${r.obs ? `<div class="obs"><span>Observações</span>${esc(r.obs)}</div>` : ''}
    <div class="terms">Declaramos que os equipamentos acima foram devolvidos e conferidos na data indicada, nas condições descritas. Avarias ou faltas apontadas ficam sob responsabilidade de ${esc(m.responsavel)} conforme o termo de retirada ${esc(m.numero)}.</div>
    <div class="signs"><div>${esc(r.devolvidoPor || m.responsavel)}<small>Devolvido por</small></div><div>${esc(r.recebidoPor || db.settings.empresa)}<small>Recebido e conferido por (${esc(db.settings.empresa)})</small></div></div>
    ${docFooter(r.numero)}
  </div>`;
}

async function printHTML(html, pageCss = '@page { size: A4; margin: 0; }', pdfName) {
  $('#page-style').textContent = pageCss;
  $('#print-root').innerHTML = html;
  await new Promise(r => setTimeout(r, 120));
  try {
    if (pdfName && Store.desktop) { const p = await Store.desktop.printPDF(pdfName); if (p) toast('PDF salvo'); }
    else window.print();
  } finally {
    setTimeout(() => { $('#print-root').innerHTML = ''; }, 500);
  }
}

route(/^#\/doc\/(saida|entrada)\/([\w]+)(?:\/([\w]+))?$/, {
  crumbs: (t, id) => { const m = movById(id); return crumb('Saídas & Entradas', m ? esc(m.numero) : 'Documento'); },
  render(tipo, id, rid) {
    const m = movById(id);
    if (!m) return `<div class="empty">${ic('alert')}<h4>Documento não encontrado</h4></div>`;
    const r = rid && (m.retornos || []).find(x => x.id === rid);
    const st = movState(m);
    const docs = [`<button class="btn sm ${tipo === 'saida' ? 'primary' : ''}" data-go="#/doc/saida/${m.id}">${esc(m.numero)} · Saída</button>`,
      ...(m.retornos || []).map(x => `<button class="btn sm ${r && r.id === x.id ? 'primary' : ''}" data-go="#/doc/entrada/${m.id}/${x.id}">${esc(x.numero)} · Entrada</button>`)].join('');
    return `
      <div class="page-head"><div><h1>${tipo === 'saida' ? 'Termo de retirada' : 'Termo de devolução'} <span class="mono" style="color:var(--accent)">${esc(r ? r.numero : m.numero)}</span></h1>
        <p>${esc(m.projeto)} · ${esc(m.responsavel)} · ${pill(st, MOV_STATUS)}</p></div>
        <div class="actions">
          ${tipo === 'saida' && st !== 'fechada' ? `<button class="btn danger" id="cancelMov">${ic('x')}Cancelar saída</button><button class="btn" data-go="#/entrada/${m.id}">${ic('in')}Registrar entrada</button>` : ''}
          ${Store.desktop ? `<button class="btn" id="pdf">${ic('pdf')}Salvar PDF</button>` : ''}
          <button class="btn primary" id="print">${ic('printer')}Imprimir</button></div></div>
      <div class="actions" style="margin-bottom:6px">${docs}</div>
      <div class="doc-wrap"><div class="paper" id="paper">${tipo === 'saida' ? docSaida(m) : r ? docEntrada(m, r) : ''}</div></div>`;
  },
  mount(tipo, id, rid) {
    const m = movById(id); if (!m) return;
    const r = rid && m.retornos.find(x => x.id === rid);
    const name = `${r ? r.numero : m.numero} ${m.projeto}`.replace(/[\\/:*?"<>|]/g, '-') + '.pdf';
    $('#print').onclick = () => printHTML(`<div class="paper">${$('#paper').innerHTML}</div>`);
    const pdf = $('#pdf'); if (pdf) pdf.onclick = () => printHTML(`<div class="paper">${$('#paper').innerHTML}</div>`, undefined, name);
    const c = $('#cancelMov');
    if (c) c.onclick = async () => {
      if ((m.retornos || []).length) return toast('Esta saída já tem entradas registradas — registre a devolução dos itens restantes', 'warn');
      if (!await confirmBox('Cancelar saída', `Cancelar <b>${esc(m.numero)}</b>? Todos os itens voltam a ficar disponíveis.`, 'Cancelar saída')) return;
      m.cancelada = true; m.itens.forEach(i => { const e = eqById(i.eqId); if (e && e.status === 'em_uso') e.status = 'disponivel'; });
      commit(); toast('Saída cancelada'); go('#/movimentacoes');
    };
  }
});

// ============================================================
// ETIQUETAS
// ============================================================
const LABEL_MODELS = {
  t40x25: { name: 'Térmica 40 × 25 mm', desc: 'Compacta — QR + código', w: 40, h: 25, qr: 19, code: 9, nm: 6, sn: 0, bc: false, thermal: true },
  t50x30: { name: 'Térmica 50 × 30 mm', desc: 'Padrão para câmeras, lentes, cases', w: 50, h: 30, qr: 23, code: 10.5, nm: 6.6, sn: 5.6, bc: true, thermal: true },
  t60x40: { name: 'Térmica 60 × 40 mm', desc: 'Grande — cabe código de barras', w: 60, h: 40, qr: 30, code: 13, nm: 8, sn: 6.5, bc: true, thermal: true },
  a4: { name: 'Folha A4 · 24 etiquetas', desc: '63,5 × 33,9 mm (Pimaco A4356/A4256)', w: 63.5, h: 33.9, qr: 25, code: 11, nm: 7, sn: 6, bc: true, thermal: false }
};
function labelHTML(e, mk, o) {
  const M = LABEL_MODELS[mk], s = db.settings, padmm = 1.8;
  const showBc = o.barcode && M.bc;
  const qrSize = o.qr ? Math.min(M.qr, M.h - padmm * 2) : 0;
  const textParts = [];
  if (o.logo && s.logo && M.h >= 30) textParts.push(`<img class="llogo" src="${s.logo}" style="height:${M.h * 0.15}mm;max-width:${M.w * 0.4}mm;align-self:flex-start;margin-bottom:.6mm">`);
  else if (o.prop) textParts.push(`<div style="font-size:${Math.max(4.6, M.nm - 1.6)}pt;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#444;margin-bottom:.3mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.empresa)}</div>`);
  textParts.push(`<div class="lco" style="font-size:${M.code}pt">${esc(e.codigo)}</div>`);
  if (o.nome) textParts.push(`<div class="lna" style="font-size:${M.nm}pt;margin-top:.4mm">${esc(e.nome)}</div>`);
  if (o.serie && M.sn && e.serie) textParts.push(`<div class="lsn" style="font-size:${M.sn}pt;margin-top:.3mm">SN ${esc(e.serie)}</div>`);
  if (showBc) textParts.push(`<div class="lbc" style="margin-top:.8mm;height:${M.h * 0.17}mm">${Codes.code128SVG(e.codigo, { height: 40 }).replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"')}</div>`);
  return `<div class="label" style="width:${M.w}mm;height:${M.h}mm;padding:${padmm}mm ${padmm}mm ${padmm}mm ${padmm + 1.2}mm;gap:${padmm}mm">
    <div class="lco-strip" style="width:1.2mm"></div>
    ${o.qr ? `<div class="lq" style="width:${qrSize}mm;height:${qrSize}mm;align-self:center">${Codes.qrSVG(e.codigo, { size: 100, border: 1 })}</div>` : ''}
    <div class="lt">${textParts.join('')}</div></div>`;
}
route(/^#\/etiquetas$/, {
  crumbs: () => crumb('Etiquetas'),
  render() {
    const o = db.settings.label;
    if (!ui.lblItems) ui.lblItems = [];
    const sw = (k, l) => `<div class="opt ${o[k] ? 'on' : ''}" data-sw="${k}"><span class="switch"></span>${l}</div>`;
    return `
      <div class="page-head"><div><h1>Etiquetas</h1><p>Identifique cada equipamento com QR Code e código de barras — compatível com qualquer leitor USB.</p></div>
        <div class="actions"><button class="btn primary" id="printLbl">${ic('printer')}Imprimir etiquetas</button></div></div>
      <div class="lbl-layout">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card"><h3>Modelo</h3><div class="radio-cards">${Object.entries(LABEL_MODELS).map(([k, m]) => `<div class="rc ${o.model === k ? 'on' : ''}" data-model="${k}"><b>${m.name}</b><small>${m.desc}</small></div>`).join('')}</div></div>
          <div class="card"><h3>Conteúdo</h3>${sw('qr', 'QR Code')}${sw('barcode', 'Código de barras (Code 128)')}${sw('nome', 'Nome do equipamento')}${sw('serie', 'Nº de série')}${sw('logo', 'Logo da empresa')}${sw('prop', 'Nome da empresa')}
            <div class="field" style="margin-top:10px"><label>Cópias de cada etiqueta</label><input class="input" type="number" min="1" max="20" id="copies" value="${o.copies || 1}"></div></div>
        </div>
        <div class="card">
          <h3>Itens <span class="muted" id="lblCount"></span></h3>
          <div class="scanbox" style="margin-bottom:10px">${ic('search')}<input id="lblQ" placeholder="Adicionar por código, nome ou categoria…" autocomplete="off">
            <button class="btn sm" id="lblAll">Todos</button><button class="btn sm" id="lblNew">Sem etiqueta</button><button class="btn sm ghost" id="lblClr">Limpar</button></div>
          <div class="picker hidden" id="lblPicker" style="margin-bottom:14px"></div>
          <div class="lbl-preview" id="lblPrev"></div>
        </div>
      </div>`;
  },
  mount() {
    const o = db.settings.label;
    const draw = () => {
      const items = ui.lblItems.map(eqById).filter(Boolean);
      $('#lblCount').textContent = items.length ? `${items.length} item(ns) · ${items.length * (o.copies || 1)} etiqueta(s)` : '';
      const zoom = o.model === 'a4' ? 1.25 : o.model === 't40x25' ? 1.9 : 1.5;
      $('#lblPrev').innerHTML = items.length ? items.map(e => `<div style="position:relative;zoom:${zoom}" class="preview-label" title="Clique para remover" data-rm="${e.id}">${labelHTML(e, o.model, o)}</div>`).join('')
        : `<div class="empty" style="align-self:center">${ic('tag')}<h4>Escolha os itens</h4>Busque acima ou selecione no Catálogo.</div>`;
    };
    $('#lblPrev').addEventListener('click', e => { const r = e.target.closest('[data-rm]'); if (r) { ui.lblItems = ui.lblItems.filter(x => x !== r.dataset.rm); draw(); } });
    $$('[data-model]').forEach(r => r.onclick = () => { o.model = r.dataset.model; $$('[data-model]').forEach(x => x.classList.toggle('on', x === r)); commit(); draw(); });
    $$('[data-sw]').forEach(s => s.onclick = () => { o[s.dataset.sw] = !o[s.dataset.sw]; s.classList.toggle('on', o[s.dataset.sw]); commit(); draw(); });
    $('#copies').oninput = e => { o.copies = Math.max(1, Math.min(20, +e.target.value || 1)); commit(); draw(); };
    const addIds = ids => { ids.forEach(id => { if (!ui.lblItems.includes(id)) ui.lblItems.push(id); }); draw(); };
    $('#lblAll').onclick = () => addIds(db.equipamentos.map(e => e.id));
    $('#lblNew').onclick = () => { const n = db.equipamentos.filter(e => !e.etiquetado); addIds(n.map(e => e.id)); if (!n.length) toast('Todos os itens já tiveram etiqueta impressa'); };
    $('#lblClr').onclick = () => { ui.lblItems = []; draw(); };
    const pk = $('#lblPicker');
    const drawPick = () => {
      const q = norm($('#lblQ').value).trim();
      if (!q) { pk.classList.add('hidden'); return; }
      const list = db.equipamentos.filter(e => norm([e.codigo, e.nome, e.marca, e.modelo, e.categoria].join(' ')).includes(q)).slice(0, 40);
      pk.classList.remove('hidden');
      pk.innerHTML = (list.length > 1 ? `<div class="pick" data-addall><span class="add">${ic('plus')}</span><div class="grow"><b>Adicionar todos (${list.length})</b></div></div>` : '') +
        list.map(e => `<div class="pick ${ui.lblItems.includes(e.id) ? 'off' : ''}" data-pid="${e.id}">${photo(e, 'thumb')}<div class="grow"><b>${esc(e.nome)}</b><small class="mono">${esc(e.codigo)}</small></div><span class="add">${ic('plus')}</span></div>`).join('');
      pk.querySelector('[data-addall]') && (pk.querySelector('[data-addall]').onclick = () => { addIds(list.map(e => e.id)); $('#lblQ').value = ''; drawPick(); });
    };
    pk.addEventListener('click', e => { const p = e.target.closest('[data-pid]'); if (p) { addIds([p.dataset.pid]); drawPick(); } });
    $('#lblQ').addEventListener('input', drawPick);
    $('#lblQ').addEventListener('keydown', e => { if (e.key === 'Enter') { const ex = eqByCode(e.target.value); if (ex) { addIds([ex.id]); e.target.value = ''; drawPick(); } } });
    ui.scan = code => { const ex = eqByCode(code); if (ex) addIds([ex.id]); else toast('Código não encontrado', 'warn'); return true; };
    $('#printLbl').onclick = () => {
      const items = ui.lblItems.map(eqById).filter(Boolean);
      if (!items.length) return toast('Adicione itens para imprimir', 'err');
      const M = LABEL_MODELS[o.model], copies = o.copies || 1;
      const all = []; items.forEach(e => { for (let i = 0; i < copies; i++) all.push(e); });
      let html, css;
      if (M.thermal) {
        css = `@page { size: ${M.w}mm ${M.h}mm; margin: 0; }`;
        html = all.map(e => `<div class="print-page" style="width:${M.w}mm;height:${M.h}mm;overflow:hidden">${labelHTML(e, o.model, o)}</div>`).join('');
      } else {
        css = '@page { size: A4; margin: 0; }';
        const per = 24, pages = [];
        for (let i = 0; i < all.length; i += per) pages.push(all.slice(i, i + per));
        html = pages.map(pg => `<div class="print-page" style="width:210mm;height:296mm;padding:12.9mm 7.2mm 0;box-sizing:border-box;display:grid;grid-template-columns:repeat(3,63.5mm);grid-auto-rows:33.9mm;column-gap:2.5mm">${pg.map(e => labelHTML(e, o.model, o)).join('')}</div>`).join('');
      }
      items.forEach(e => { e.etiquetado = true; });
      commit();
      printHTML(html, css);
    };
    draw();
  }
});

// ============================================================
// CONFIGURAÇÕES
// ============================================================
route(/^#\/config$/, {
  crumbs: () => crumb('Configurações'),
  render() {
    const s = db.settings;
    const f = (k, l, attrs = '') => `<div class="field"><label>${l}</label><input class="input" data-s="${k}" value="${esc(s[k])}" ${attrs}></div>`;
    const colors = ['#ff4d2e', '#ff2d55', '#ffb020', '#2fd47a', '#4da3ff', '#8b5cf6', '#e5e7eb'];
    return `
      <div class="page-head"><div><h1>Configurações</h1><p>Identidade da empresa, documentos, dados e atualizações.</p></div></div>
      <div class="cfg">
        <div class="cfg-nav"><a data-to="c-emp">Empresa</a><a data-to="c-doc">Documentos</a><a data-to="c-cat">Categorias</a><a data-to="c-dados">Dados & backup</a><a data-to="c-upd">Atualizações</a></div>
        <div>
          <section class="card" id="c-emp"><h3>Empresa & identidade visual</h3>
            <div class="logo-up" style="margin-bottom:18px"><div class="lp">${s.logo ? `<img src="${s.logo}">` : `<span style="color:#999;font-size:12px">sem logo</span>`}</div>
              <div><b>Logo</b><p class="muted" style="margin:4px 0 10px;font-size:12.5px">PNG com fundo transparente funciona melhor. Aparece no menu, nos termos e nas etiquetas.</p>
              <div class="actions"><button class="btn" id="logoUp">${ic('upload')}Enviar logo</button>${s.logo ? `<button class="btn ghost danger" id="logoRm">Remover</button>` : ''}</div></div></div>
            <div class="grid2">${f('empresa', 'Nome da empresa')}${f('cnpj', 'CNPJ')}<div class="span2">${f('endereco', 'Endereço')}</div>${f('telefone', 'Telefone')}${f('email', 'E-mail')}${f('site', 'Site')}${f('operador', 'Seu nome (operador padrão)')}</div>
            <div class="field" style="margin-top:16px"><label>Cor de destaque</label><div class="colors">${colors.map(c => `<button style="background:${c}" data-color="${c}" class="${s.accent === c ? 'on' : ''}"></button>`).join('')}<input type="color" id="colorPick" value="${esc(s.accent)}" style="width:30px;height:30px;border:0;background:none;padding:0;cursor:pointer"></div></div>
          </section>
          <section class="card" id="c-doc"><h3>Documentos & códigos</h3>
            <div class="grid3">${f('prefixo', 'Prefixo do código de patrimônio', 'maxlength="6"')}
              <div class="field"><label>Próximo código</label><input class="input mono" data-n="seqEquip" type="number" min="1" value="${s.seqEquip}"></div>
              <div class="field"><label>Próx. nº de saída / entrada</label><div style="display:flex;gap:8px"><input class="input mono" data-n="seqSaida" type="number" min="1" value="${s.seqSaida}"><input class="input mono" data-n="seqEntrada" type="number" min="1" value="${s.seqEntrada}"></div></div></div>
            <div class="field" style="margin-top:14px"><label>Texto do termo de responsabilidade (use {empresa} e {responsavel})</label><textarea class="input" data-s="termo" rows="6">${esc(s.termo)}</textarea></div>
            <div class="actions" style="margin-top:10px"><button class="btn sm ghost" id="termoReset">Restaurar texto padrão</button></div>
          </section>
          <section class="card" id="c-cat"><h3>Categorias</h3>
            <div class="cat-list" id="catList">${s.categorias.map((c, i) => `<span class="cat-tag">${ic(catIcon(c))}${esc(c)}<button data-delcat="${i}" title="Remover">${ic('x')}</button></span>`).join('')}</div>
            <div style="display:flex;gap:8px;margin-top:14px;max-width:420px"><input class="input" id="newCat" placeholder="Nova categoria"><button class="btn" id="addCat">${ic('plus')}Adicionar</button></div>
          </section>
          <section class="card" id="c-dados"><h3>Dados & backup</h3>
            <div id="storageInfo" class="muted" style="font-size:13px;margin-bottom:14px"></div>
            <div class="actions">
              ${Store.desktop ? `<button class="btn" id="chDir">${ic('folder')}Mudar pasta de dados</button><button class="btn" id="opDir">${ic('folder')}Abrir pasta</button>` : ''}
              <button class="btn" id="bkExp">${ic('download')}Exportar backup</button><button class="btn" id="bkImp">${ic('upload')}Restaurar backup</button>
              <button class="btn" id="csvExp">${ic('download')}Exportar inventário (Excel)</button>
              ${db.equipamentos.length ? '' : `<button class="btn" id="demo2">${ic('sparkle')}Carregar exemplo</button>`}
              <button class="btn danger" id="wipe" style="margin-left:auto">${ic('trash')}Apagar tudo</button>
            </div>
            <p class="muted" style="font-size:12.5px;margin:14px 0 0">💡 Para usar em vários computadores, aponte a pasta de dados para uma pasta compartilhada (rede, Google Drive, OneDrive ou Dropbox). Um backup automático é feito a cada 10 minutos de uso.</p>
          </section>
          <section class="card" id="c-upd"><h3>Atualizações</h3>
            <div style="display:flex;align-items:center;gap:14px"><div style="width:44px;height:44px;border-radius:12px;background:var(--panel2);display:grid;place-items:center">${ic('github')}</div>
              <div style="flex:1"><b id="verLbl">—</b><div class="muted" style="font-size:12.5px">O app procura novas versões no GitHub ao abrir e a cada hora. A atualização é baixada em segundo plano e instalada ao reiniciar — sem desinstalar nada e sem perder dados.</div></div>
              <button class="btn" id="chkUpd">${ic('refresh')}Verificar agora</button></div>
          </section>
        </div>
      </div>`;
  },
  mount() {
    const s = db.settings;
    $$('[data-to]').forEach(a => a.onclick = () => $('#' + a.dataset.to).scrollIntoView({ behavior: 'smooth' }));
    let t;
    $$('[data-s]').forEach(i => i.addEventListener('input', () => {
      s[i.dataset.s] = i.dataset.s === 'prefixo' ? i.value.toUpperCase().replace(/[^A-Z0-9]/g, '') : i.value;
      clearTimeout(t); t = setTimeout(() => { commit(); applyBrand(); }, 400);
    }));
    $$('[data-n]').forEach(i => i.addEventListener('change', () => { s[i.dataset.n] = Math.max(1, +i.value || 1); commit(); }));
    $('#termoReset').onclick = () => { s.termo = DEFAULT_TERMO; $('[data-s=termo]').value = DEFAULT_TERMO; commit(); };
    $('#logoUp').onclick = async () => { const f = await pickFile('image/*'); if (!f) return; s.logo = await resizeImage(f, 600); commit(); applyBrand(); router(); toast('Logo atualizado'); };
    const lr = $('#logoRm'); if (lr) lr.onclick = () => { s.logo = null; commit(); applyBrand(); router(); };
    const setColor = c => { s.accent = c; applyBrand(); commit(); $$('[data-color]').forEach(b => b.classList.toggle('on', b.dataset.color === c)); };
    $$('[data-color]').forEach(b => b.onclick = () => setColor(b.dataset.color));
    $('#colorPick').oninput = e => setColor(e.target.value);
    $('#catList').addEventListener('click', async e => {
      const b = e.target.closest('[data-delcat]'); if (!b) return;
      const c = s.categorias[+b.dataset.delcat], n = db.equipamentos.filter(x => x.categoria === c).length;
      if (n && !await confirmBox('Remover categoria', `${n} equipamento(s) usam "${esc(c)}". Eles ficarão sem categoria.`, 'Remover')) return;
      db.equipamentos.forEach(x => { if (x.categoria === c) x.categoria = ''; });
      s.categorias.splice(+b.dataset.delcat, 1); commit(); router();
    });
    const addCat = () => { const v = $('#newCat').value.trim(); if (!v || s.categorias.includes(v)) return; s.categorias.push(v); commit(); router(); };
    $('#addCat').onclick = addCat; $('#newCat').onkeydown = e => e.key === 'Enter' && addCat();
    $('#bkExp').onclick = () => { download(`backup-equipamentos-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(db, null, 1), 'application/json'); toast('Backup exportado'); };
    $('#csvExp').onclick = exportCSV;
    $('#bkImp').onclick = async () => {
      const f = await pickFile('.json,application/json'); if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data.settings || !Array.isArray(data.equipamentos)) throw new Error('arquivo inválido');
        if (!await confirmBox('Restaurar backup', `Substituir os dados atuais por <b>${data.equipamentos.length}</b> equipamentos e <b>${(data.movimentacoes || []).length}</b> movimentações do backup?`, 'Restaurar')) return;
        db = data; db.movimentacoes = db.movimentacoes || []; db.settings = { ...DEFAULT_SETTINGS, ...db.settings };
        await commit(); applyBrand(); router(); toast('Backup restaurado');
      } catch (err) { toast('Não foi possível ler o backup: ' + err.message, 'err'); }
    };
    $('#wipe').onclick = async () => {
      if (!await confirmBox('Apagar tudo', 'Isso remove <b>todos</b> os equipamentos e movimentações. Exporte um backup antes. Continuar?', 'Apagar tudo')) return;
      db.equipamentos = []; db.movimentacoes = []; s.seqEquip = s.seqSaida = s.seqEntrada = 1; commit(); router(); toast('Dados apagados');
    };
    const d2 = $('#demo2'); if (d2) d2.onclick = loadDemo;
    if (Store.desktop) {
      const info = async () => { const i = await Store.desktop.info(); $('#storageInfo').innerHTML = `Dados salvos em: <span class="mono" style="color:var(--text)">${esc(i.file)}</span>`; $('#verLbl').textContent = `Versão ${i.version}`; };
      info();
      $('#chDir').onclick = async () => {
        const dir = await Store.desktop.chooseDir(); if (!dir) return;
        const existing = await Store.load();
        if (existing && existing.settings && await confirmBox('Pasta com dados', 'Já existem dados nessa pasta. Carregar os dados dela? (Cancelar = copiar os dados atuais para lá)', 'Carregar dados da pasta', false)) { await loadDB(); applyBrand(); }
        else await Store.save(db);
        info(); router(); toast('Pasta de dados alterada');
      };
      $('#opDir').onclick = () => Store.desktop.openDir();
      $('#chkUpd').onclick = () => { manualCheck = true; Store.desktop.checkUpdate(); toast('Procurando atualizações…'); };
    } else {
      $('#storageInfo').textContent = 'Versão web: dados salvos neste navegador. Instale o app desktop para salvar em pasta e receber atualizações automáticas.';
      $('#verLbl').textContent = 'Versão web';
      $('#chkUpd').onclick = () => toast('Atualizações automáticas funcionam no app instalado', 'warn');
    }
  }
});

// ============================================================
// Atualizações (app desktop)
// ============================================================
let manualCheck = false;
function setupUpdates() {
  if (!Store.desktop) { $('#version').textContent = 'versão web'; return; }
  Store.desktop.info().then(i => { $('#version').textContent = `v${i.version}`; });
  const b = $('#update-banner');
  Store.desktop.onUpdate(s => {
    if (s.status === 'available') { b.classList.remove('hidden'); b.innerHTML = `${ic('download')}Baixando a versão ${esc(s.version)}…`; }
    else if (s.status === 'downloading') { b.classList.remove('hidden'); b.innerHTML = `${ic('download')}Baixando atualização… ${s.percent}%`; }
    else if (s.status === 'ready') {
      b.classList.remove('hidden');
      b.innerHTML = `${ic('sparkle')}Nova versão ${esc(s.version)} pronta para instalar.<button class="btn primary sm" id="doUpd">${ic('refresh')}Reiniciar e atualizar</button>`;
      $('#doUpd').onclick = () => Store.desktop.installUpdate();
    } else if (s.status === 'none' && manualCheck) { toast('Você já está na versão mais recente'); manualCheck = false; }
    else if (s.status === 'error' && manualCheck) { toast('Não foi possível verificar: ' + esc(s.message), 'err'); manualCheck = false; }
    else if (s.status === 'dev') toast('Modo desenvolvimento: atualizações só funcionam no app instalado', 'warn');
  });
  Store.desktop.onDataChanged(async () => {
    await loadDB(); applyBrand(); refreshView(); renderNav();
    toast('Dados atualizados por outro computador', 'warn');
  });
}

// ============================================================
// Dados de exemplo
// ============================================================
async function loadDemo() {
  const D = (d, h = 10) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(h, 0, 0, 0); return x.toISOString(); };
  const raw = [
    ['Câmera Sony FX6', 'Câmeras', 'Sony', 'ILME-FX6V', '5021834', 42900, '2 baterias BP-U70, carregador, top handle, case Pelican'],
    ['Câmera Sony FX3', 'Câmeras', 'Sony', 'ILME-FX3', '4410293', 24900, '3 baterias NP-FZ100, XLR handle, gaiola SmallRig'],
    ['Câmera Canon C70', 'Câmeras', 'Canon', 'EOS C70', '1938201', 31500, '2 baterias BP-A30, carregador'],
    ['Blackmagic Pocket 6K Pro', 'Câmeras', 'Blackmagic', 'BMPCC 6K Pro', 'BM6K-88213', 15800, 'EVF, 4 baterias NP-F570, SSD T5'],
    ['Lente Sigma 18-35mm f/1.8 Art', 'Lentes', 'Sigma', '18-35 Art EF', '53819203', 5200, 'Tampa, parasol, bag'],
    ['Lente Sony 24-70mm f/2.8 GM II', 'Lentes', 'Sony', 'SEL2470GM2', '1820394', 13900, 'Tampa, parasol'],
    ['Lente Sony 85mm f/1.4 GM', 'Lentes', 'Sony', 'SEL85F14GM', '1029384', 9800, 'Tampa, parasol'],
    ['Kit Lentes Cine DZOFilm Vespid (3x)', 'Lentes', 'DZOFilm', 'Vespid 25/50/75', 'DZ-VSP-221', 32000, 'Case rígido, 3 lentes PL/EF'],
    ['Aputure LS 600d Pro', 'Iluminação', 'Aputure', 'LS 600d Pro', 'AP600-12093', 14500, 'Reator, cabo, refletor Hyper, case'],
    ['Aputure LS 300x', 'Iluminação', 'Aputure', 'LS 300x', 'AP300X-4421', 6900, 'Reator, refletor, bolsa'],
    ['Amaran 200x S', 'Iluminação', 'Amaran', '200x S', 'AM200-1192', 2800, 'Fonte, refletor'],
    ['Nanlite Forza 60', 'Iluminação', 'Nanlite', 'Forza 60', 'NL60-55102', 2400, 'Fonte, grip de bateria'],
    ['Softbox Light Dome II', 'Iluminação', 'Aputure', 'Light Dome II', '', 1700, 'Grid, 2 difusores'],
    ['Microfone Sennheiser MKE 600', 'Áudio', 'Sennheiser', 'MKE 600', 'SN600-77310', 2300, 'Espuma, deadcat, cabo XLR'],
    ['Gravador Zoom F6', 'Áudio', 'Zoom', 'F6', 'ZF6-001928', 4600, 'Cartão SD 64GB, sled NP-F'],
    ['Kit Lapela Sennheiser EW 112P G4', 'Áudio', 'Sennheiser', 'EW 112P G4', 'EW-G4-31092', 4200, 'TX, RX, lapela ME2, cabos'],
    ['Boom Rode Boompole Pro', 'Áudio', 'Rode', 'Boompole Pro', '', 1300, 'Bolsa'],
    ['Gimbal DJI RS 3 Pro', 'Tripés & Estabilizadores', 'DJI', 'RS 3 Pro', 'DJIRS3P-8812', 5900, 'Bateria, tripé, case, cabos'],
    ['Tripé Sachtler Ace XL', 'Tripés & Estabilizadores', 'Sachtler', 'Ace XL', 'SAC-1018', 6800, 'Spreader, bolsa'],
    ['Monitor Atomos Ninja V', 'Monitores', 'Atomos', 'Ninja V', 'ATO-NV-2231', 4700, 'SSD 1TB, 2 baterias, cabo HDMI'],
    ['Monitor SmallHD 703 Ultrabright', 'Monitores', 'SmallHD', '703 UltraBright', 'SHD703-9921', 12900, 'Placa V-mount, parasol'],
    ['Bateria V-mount 150Wh', 'Baterias & Energia', 'SWIT', 'MINO-S150', '', 1500, ''],
    ['Bateria V-mount 150Wh', 'Baterias & Energia', 'SWIT', 'MINO-S150', '', 1500, ''],
    ['Carregador Duplo V-mount', 'Baterias & Energia', 'SWIT', 'PC-P430S', '', 1200, 'Fonte'],
    ['SSD Samsung T7 1TB', 'Armazenamento', 'Samsung', 'T7 1TB', 'S5SXNS0R1029', 750, 'Cabo USB-C'],
    ['Cartão CFexpress Tipo A 160GB', 'Armazenamento', 'Sony', 'CEA-G160T', '', 1900, 'Case'],
    ['Drone DJI Mavic 3 Cine', 'Drones', 'DJI', 'Mavic 3 Cine', '1581F5BK2', 29900, '3 baterias, RC Pro, filtros ND, case'],
    ['C-Stand 40" com braço', 'Grip & Maquinária', 'Avenger', 'A2033', '', 1100, 'Braço, garra'],
    ['C-Stand 40" com braço', 'Grip & Maquinária', 'Avenger', 'A2033', '', 1100, 'Braço, garra'],
    ['Cabo SDI 12G 10m', 'Cabos & Conexões', 'Canare', 'L-5CFB', '', 280, ''],
    ['Rádio Comunicador Motorola (kit 4)', 'Acessórios', 'Motorola', 'Talkabout T470', '', 1600, '4 rádios, base carregadora, fones']
  ];
  db.settings.seqEquip = 1;
  db.equipamentos = raw.map(([nome, categoria, marca, modelo, serie, valor, acessorios], i) => ({
    id: uid() + i, codigo: nextCode(), nome, categoria, marca, modelo, serie, valor, acessorios, obs: '',
    aquisicao: `202${3 + (i % 3)}-0${1 + (i % 9)}-15`, status: 'disponivel', foto: null, criadoEm: D(-90), log: [{ t: D(-90), tipo: 'misc', txt: 'Equipamento cadastrado' }]
  }));
  const E = c => db.equipamentos.find(e => e.codigo === `${db.settings.prefixo}-${pad(c)}`);
  const mk = (num, projeto, cliente, local, resp, doc, tel, saida, ret, codes) => ({
    id: uid(), numero: `S-${pad(num)}`, tipo: 'saida', projeto, cliente, local, responsavel: resp, documento: doc, telefone: tel, entreguePor: 'Diego Almeida',
    dataSaida: saida, previsaoRetorno: ret, obs: '', criadoEm: saida, retornos: [],
    itens: codes.map(c => { const e = E(c); return { eqId: e.id, codigo: e.codigo, nome: e.nome, marca: e.marca, modelo: e.modelo, serie: e.serie, valor: e.valor, acessorios: e.acessorios, retornado: false }; })
  });
  const m1 = mk(1, 'Comercial Natura – Ekos', 'Natura', 'Estúdio Vila Leopoldina', 'Marina Costa', '123.456.789-00', '(11) 98888-1020', D(-12, 8), D(-10, 19), [1, 5, 6, 9, 10, 14, 15, 19, 22]);
  const m2 = mk(2, 'Videoclipe "Maré Alta"', 'Selo Onda', 'Ilhabela – SP', 'Rafael Nunes', '234.567.890-11', '(11) 97777-3344', D(-5, 7), D(-1, 20), [2, 7, 18, 27, 25, 16]);
  const m3 = mk(3, 'Institucional Banco Horizonte', 'Banco Horizonte', 'Av. Paulista, 1000', 'Juliana Prado', '345.678.901-22', '(11) 96666-5566', D(-1, 9), D(2, 18), [3, 11, 12, 20, 23, 28]);
  const m4 = mk(4, 'Doc. "Raízes" – Diária 3', 'Produção própria', 'Cunha – SP', 'Rafael Nunes', '234.567.890-11', '(11) 97777-3344', D(0, 7), D(1, 21), [4, 8, 21, 13]);
  // m1: devolvido completo (um item com avaria)
  const r1 = { id: uid(), numero: 'E-0001', data: D(-10, 18), devolvidoPor: 'Marina Costa', recebidoPor: 'Diego Almeida', obs: '', itens: [] };
  m1.itens.forEach((it, i) => {
    const cond = i === 4 ? 'avaria' : 'ok', obs = cond === 'avaria' ? 'Ventoinha fazendo ruído alto' : '';
    Object.assign(it, { retornado: true, dataRetorno: r1.data, condicao: cond, obsRetorno: obs, retornoId: r1.id });
    r1.itens.push({ eqId: it.eqId, codigo: it.codigo, nome: it.nome, serie: it.serie, valor: it.valor, condicao: cond, obs });
  });
  m1.retornos.push(r1);
  E(10).status = 'manutencao'; E(10).log.push({ t: r1.data, tipo: 'misc', txt: 'Com avaria na devolução E-0001: Ventoinha fazendo ruído alto' });
  // m2: parcial e atrasada
  const r2 = { id: uid(), numero: 'E-0002', data: D(-1, 21), devolvidoPor: 'Rafael Nunes', recebidoPor: 'Diego Almeida', obs: 'Drone e gimbal ficaram com a equipe para diária extra.', itens: [] };
  m2.itens.forEach((it, i) => {
    if (i === 1 || i === 4 || i === 5) {
      Object.assign(it, { retornado: true, dataRetorno: r2.data, condicao: 'ok', obsRetorno: '', retornoId: r2.id });
      r2.itens.push({ eqId: it.eqId, codigo: it.codigo, nome: it.nome, serie: it.serie, valor: it.valor, condicao: 'ok', obs: '' });
    }
  });
  m2.retornos.push(r2);
  [m2, m3, m4].forEach(m => m.itens.forEach(it => { if (!it.retornado) E(+it.codigo.split('-')[1]).status = 'em_uso'; }));
  db.movimentacoes = [m1, m2, m3, m4];
  db.settings.seqSaida = 5; db.settings.seqEntrada = 3;
  if (!db.settings.operador) db.settings.operador = 'Diego Almeida';
  await commit(); router(); toast('Dados de exemplo carregados');
}

// ============================================================
// Início
// ============================================================
(async function init() {
  await loadDB();
  applyBrand();
  setupUpdates();
  window.addEventListener('hashchange', router);
  router();
})();

})();
