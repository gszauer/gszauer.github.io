// IndexedDB File System Manager
class FileSystemManager {
    constructor() {
        this.db = null;
        this.dbName = 'AIWorkbenchFS';
        this.storeName = 'files';
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'path' });
                    store.createIndex('parent', 'parent', { unique: false });
                }
            };
        });
    }

    async saveFile(path, content, type = 'file') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const parent = this.getParentPath(path);
            const name = this.getFileName(path);

            const request = store.put({
                path: path,
                name: name,
                parent: parent,
                content: content,
                type: type,
                lastModified: new Date().toISOString()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getFile(path) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(path);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFiles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(path) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Delete the file/folder and all children
            const getAllRequest = store.getAll();
            getAllRequest.onsuccess = () => {
                const files = getAllRequest.result;
                const toDelete = files.filter(f => f.path === path || f.path.startsWith(path + '/'));

                toDelete.forEach(file => {
                    store.delete(file.path);
                });

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
        });
    }

    async clearAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    getParentPath(path) {
        const parts = path.split('/');
        parts.pop();
        return parts.join('/') || '/';
    }

    getFileName(path) {
        const parts = path.split('/');
        return parts[parts.length - 1];
    }
} 
