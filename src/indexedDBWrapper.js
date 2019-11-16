window.indexeddbResult =
  window.indexeddbResult ||
  window.mozIndexeddbResult ||
  window.webkitIndexeddbResult ||
  window.msIndexeddbResult;

window.IdbResultTransaction = window.IdbResultTransaction ||
  window.webkitIdbResultTransaction ||
  window.msIdbResultTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IdbResultKeyRange =
  window.IdbResultKeyRange ||
  window.webkitIdbResultKeyRange ||
  window.msIdbResultKeyRange;

const dbName = "faviconDB112345";
const storeName = "faviconStorage";
const dbVersion = 1;

class IndexedDBWrapper {
  constructor() {
    this.db;
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
  }

  openDB(callback = () => {}) {
    if (!window.indexedDB) {
      callback({ message: "Unsupported indexedDB" });
    }
    let request = window.indexedDB.open(this.dbName, this.dbVersion);

    request.onsuccess = e => {
      this.db = request.result;
    };
    request.onerror = e => callback(e.target.error);
    request.onupgradeneeded = e => {
      this.db = e.target.result;
      this.db.createObjectStore(this.storeName, { keyPath: "sitePattern" });
      this.db.onabort = e2 => callback(e2.target.error);
      this.db.error = e2 => callback(e2.target.error);
    };
  }

  deleteDB() {
    if (window.indexedDB) {
      window.indexedDB.deleteDatabase(this.dbName);
    }
  }

  deleteStore(storeName, callback = () => {}) {
    if (this.db) {
      this.db.deleteObjectStore();
      this.db.oncomplete = e => callback(e.target.result);
      this.db.onabort = e => callback(e.target.error);
      this.db.error = e => callback(e.target.error);
    }
  }

  upsert(data, callback = () => {}) {
    if (this.db && data) {
      let transaction = this.db.transaction([this.storeName], "readwrite");
      transaction.onabort = te => callback(te.target.error);
      transaction.onerror = te => callback(te.target.error);

      let request = transaction.objectStore(storeName).put(data);
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

  get(storeName, key, callback = () => {}) {
    if (this.db && key) {
      let request = this.db
        .transaction([storeName])
        .objectStore()
        .get(key);
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

  getAll(callback = () => {}) {
    if (this.db) {
      let request = this.db
        .transaction(this.storeName)
        .objectStore(this.storeName)
        .openCursor(null, IDBCursor.NEXT);
      let results = [];
      request.onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
          results.push({ [cursor.key]: cursor.value });
          cursor.continue();
        } else {
          callback(results);
        }
      };
      request.onerror = e => callback(e.target.error);
    }
  }

  remove(key, callback = () => {}) {
    if (this.db) {
      let request = this.db
        .transaction([this.storeName], "readwrite")
        .objectStore(this.storeName)
        .delete(key);
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

  clear(storeName, callback = () => {}) {
    if (this.db) {
      let request = this.db
        .transaction([storeName], "readwrite")
        .objectStore(storeName)
        .clear();
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }

  count(storeName, callback = () => {}) {
    if (this.db) {
      let request = this.db
        .transaction([storeName])
        .objectStore(storeName)
        .count();
      request.onerror = e => callback(e.target.error);
      request.onsuccess = e => callback(e.target.result);
    }
  }
}
