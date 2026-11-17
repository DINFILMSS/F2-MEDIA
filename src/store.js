// Camada de armazenamento: arquivo JSON (app desktop) ou IndexedDB (navegador)
(function (global) {
  'use strict';
  const IDB_NAME = 'f2-equipamentos', IDB_STORE = 'kv', KEY = 'db';

  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(IDB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(IDB_STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function idbGet() {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(KEY);
      t.onsuccess = () => res(t.result || null); t.onerror = () => rej(t.error);
    });
  }
  async function idbSet(v) {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction(IDB_STORE, 'readwrite');
      t.objectStore(IDB_STORE).put(v, KEY);
      t.oncomplete = () => res(); t.onerror = () => rej(t.error);
    });
  }

  const desktop = global.desktop && global.desktop.isDesktop ? global.desktop : null;

  global.Store = {
    desktop,
    async load() { return desktop ? desktop.load() : idbGet(); },
    async save(data) { return desktop ? desktop.save(data) : idbSet(JSON.parse(JSON.stringify(data))); }
  };
})(window);
