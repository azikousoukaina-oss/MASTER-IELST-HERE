'use strict';

window.SovereignStorage = (() => {
  const PREFIX = 'sovereign_';

  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[Storage] get error for', key, e);
      return null;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('[Storage] QuotaExceeded - pruning old data');
        _pruneOld();
        try {
          localStorage.setItem(PREFIX + key, JSON.stringify(value));
        } catch (e2) {
          console.error('[Storage] Failed even after pruning:', e2);
        }
      } else {
        console.warn('[Storage] set error for', key, e);
      }
    }
  }

  function update(key, updater) {
    const current = get(key);
    const next = updater(current);
    set(key, next);
    return next;
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function has(key) {
    return localStorage.getItem(PREFIX + key) !== null;
  }

  function getAll() {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        const shortKey = k.slice(PREFIX.length);
        result[shortKey] = get(shortKey);
      }
    }
    return result;
  }

  function clearAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  }

  function _pruneOld() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        const val = localStorage.getItem(k);
        items.push({ key: k, size: val ? val.length : 0 });
      }
    }
    items.sort((a, b) => b.size - a.size);
    // Remove the 3 largest items to free space
    const toRemove = Math.min(3, Math.ceil(items.length * 0.2));
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(items[i].key);
    }
  }

  // IndexedDB for large data (audio blobs, canvas drawings, file attachments)
  let _idb = null;
  const IDB_NAME = 'SovereignDB';
  const IDB_VERSION = 1;

  async function openIDB() {
    if (_idb) return _idb;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('blobs')) {
          db.createObjectStore('blobs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
      };
      req.onsuccess = e => { _idb = e.target.result; resolve(_idb); };
      req.onerror = e => reject(e.target.error);
    });
  }

  async function saveBlob(id, blob) {
    try {
      const db = await openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('blobs', 'readwrite');
        tx.objectStore('blobs').put({ id, blob, savedAt: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = e => reject(e.target.error);
      });
    } catch (e) {
      console.warn('[Storage] saveBlob error:', e);
    }
  }

  async function loadBlob(id) {
    try {
      const db = await openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('blobs', 'readonly');
        const req = tx.objectStore('blobs').get(id);
        req.onsuccess = e => resolve(e.target.result?.blob || null);
        req.onerror = e => reject(e.target.error);
      });
    } catch (e) {
      console.warn('[Storage] loadBlob error:', e);
      return null;
    }
  }

  async function deleteBlob(id) {
    try {
      const db = await openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('blobs', 'readwrite');
        tx.objectStore('blobs').delete(id);
        tx.oncomplete = resolve;
        tx.onerror = e => reject(e.target.error);
      });
    } catch (e) {
      console.warn('[Storage] deleteBlob error:', e);
    }
  }

  return {
    get, set, update, remove, has, getAll, clearAll,
    saveBlob, loadBlob, deleteBlob
  };
})();
