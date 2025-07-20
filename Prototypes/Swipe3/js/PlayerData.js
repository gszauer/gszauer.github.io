class PlayerData {
    static _instance = null;
    
    static get Instance() {
        if (!PlayerData._instance) {
            console.error("No player data instance exists, create a panic one.")
            PlayerData._instance = new PlayerData();
        }
        return PlayerData._instance;
    }

    constructor(callback) {
        PlayerData._instance = this;
        this.initialized = false;
        this.data = {};
        this.db = null;
        this.dbName = 'SlideSwiped';
        this.storeName = 'playerData';
        this.dataKey = 'gameData';
        
        this._initializeDB(callback);
    }

    async _initializeDB(callback) {
        try {
            if (!window.indexedDB) {
                console.warn('IndexedDB not available');
                if (callback) callback(false);
                return;
            }

            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                if (callback) callback(false);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this._loadData(callback);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        } catch (error) {
            console.error('Error initializing IndexedDB:', error);
            if (callback) callback(false);
        }
    }

    async _loadData(callback) {
        try {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(this.dataKey);

            request.onsuccess = () => {
                if (request.result) {
                    this.data = request.result;
                } else {
                    this.data = {};
                }
                this.initialized = true;
                if (callback) callback(true);
            };

            request.onerror = () => {
                console.error('Failed to load data:', request.error);
                this.data = {};
                this.initialized = true;
                if (callback) callback(true);
            };
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = {};
            this.initialized = true;
            if (callback) callback(true);
        }
    }

    async _saveData() {
        if (!this.initialized || !this.db) {
            return;
        }

        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(this.data, this.dataKey);

            request.onerror = () => {
                console.error('Failed to save data:', request.error);
            };
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    SetNumber(name, number) {
        if (!this.initialized) {
            return;
        }

        try {
            const numValue = Number(number);
            if (!isNaN(numValue)) {
                this.data[name] = numValue;
                this._saveData();
            }
        } catch (error) {
            console.error('Error setting number:', error);
        }
    }

    GetNumber(name, defaultValue = 0) {
        if (!this.initialized) {
            return defaultValue;
        }

        try {
            if (name in this.data) {
                const value = Number(this.data[name]);
                return isNaN(value) ? defaultValue : value;
            }
            return defaultValue;
        } catch (error) {
            console.error('Error getting number:', error);
            return defaultValue;
        }
    }

    SetString(name, string) {
        if (!this.initialized) {
            return;
        }

        try {
            this.data[name] = String(string);
            this._saveData();
        } catch (error) {
            console.error('Error setting string:', error);
        }
    }

    GetString(name, defaultValue = "") {
        if (!this.initialized) {
            return defaultValue;
        }

        try {
            if (name in this.data) {
                return String(this.data[name]);
            }
            return defaultValue;
        } catch (error) {
            console.error('Error getting string:', error);
            return defaultValue;
        }
    }

    ContainsKey(keyString) {
        if (!this.initialized) {
            return false;
        }

        try {
            return keyString in this.data;
        } catch (error) {
            console.error('Error checking key:', error);
            return false;
        }
    }
} 
