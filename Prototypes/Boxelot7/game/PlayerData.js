class PlayerData {
    static _instance = null;
    
    static get Instance() {
        if (!PlayerData._instance) {
            console.error("[PlayerData] No player data instance exists, create a panic one.")
            PlayerData._instance = new PlayerData();
        }
        return PlayerData._instance;
    }

    constructor(callback) {
        PlayerData._instance = this;
        this.initialized = false;
        
        try {
            if (typeof window.CrazyGames === "undefined" || !window.CrazyGames.SDK || !window.CrazyGames.SDK.data) {
                console.warn('[PlayerData] CrazyGames SDK data module not available, falling back to localStorage');
                this.storage = window.localStorage;
            } else {
                console.log("[PlayerData] Crazy Games SDK used");
                this.storage = window.CrazyGames.SDK.data;
            }
            this.initialized = true;
            if (callback) callback(true);
        } catch (error) {
            console.error('[PlayerData] Error initializing player data:', error);
            this.storage = window.localStorage;
            this.initialized = true;
            if (callback) callback(true);
        }
    }

    SetNumber(name, number) {
        try {
            const numValue = Number(number);
            if (!isNaN(numValue)) {
                this.storage.setItem(name, numValue);
                console.log("[PlayerData] SetNumber: " + name + ", " + number);
            }
        } catch (error) {
            console.error('[PlayerData] Error setting number:', error);
        }
    }

    GetNumber(name, defaultValue = 0) {
        try {
            const value = this.storage.getItem(name);
            if (value !== null) {
                const numValue = Number(value);
                const result = isNaN(numValue) ? defaultValue : numValue;
                console.log("[PlayerData] GetNumber: " + name + " = " + result);
                return result;
            }
            return defaultValue;
        } catch (error) {
            console.error('[PlayerData] Error getting number:', error);
            return defaultValue;
        }
    }

    SetString(name, string) {
        try {
            this.storage.setItem(name, String(string));
            console.log("[PlayerData] SetString: " + name + ", " + string);
        } catch (error) {
            console.error('[PlayerData] Error setting string:', error);
        }
    }

    GetString(name, defaultValue = "") {
        try {
            const value = this.storage.getItem(name);
            const result = value !== null ? String(value) : defaultValue;
            console.log("[PlayerData] GetString: " + name + " = " + result);
            return result;
        } catch (error) {
            console.error('[PlayerData] Error getting string:', error);
            return defaultValue;
        }
    }

    ContainsKey(keyString) {
        try {
            console.log("[PlayerData] Contains: " + keyString);
            return this.storage.getItem(keyString) !== null;
        } catch (error) {
            console.error('[PlayerData] Error checking key:', error);
            return false;
        }
    }

    Reset() {
        try {
            this.storage.clear();
            console.log("[PlayerData] Reset");
        } catch (error) {
            console.error('[PlayerData] Error resetting player data:', error);
        }
    }
}