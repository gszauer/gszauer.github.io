class AdManager {
    static #instance = null;
    static #demoMode = false;
    static #commercialCounter = 0;

    static get instance() {
        if (!AdManager.#instance) {
            AdManager.#instance = new AdManager();
        }
        return AdManager.#instance;
    }

    static Initialize(callback) {
        if (AdManager.#instance) {
            console.error("Initialize: Multiple copies of AdManager");
            return;
        }

        if (AdManager.#demoMode) {
            if (callback) {
                callback();
            }
            return;
        }

        //const currentDomain = window.location.hostname;
        //const isDevelopmentDomain = DomainProtection.DEVELOPMENT_DOMAINS.includes(currentDomain);

        if (typeof window.CrazyGames === "undefined") {
            console.log("No CrazyGames SDK detected");
            if (callback) {
                callback();
            }
            AdManager.instance.isInitialized = false;
            return;
        }

        window.CrazyGames.SDK.init().then(() => {
            console.log("CrazyGames SDK successfully initialized");
            if (callback) {
                callback();
            }
            AdManager.instance.isInitialized = true;//!isDevelopmentDomain;
        }).catch(() => {
            console.error("CrazyGames SDK initialization failed");
            if (callback && !AdManager.#instance) {
                callback();
            }
            window.CrazyGames = undefined;
            AdManager.instance.isInitialized = false;
        });
    }

    isInitialized = false;
    game = null;

    constructor() {
        if (AdManager.#instance) {
            throw new Error("Constructor: Multiple copies of AdManager");
        }
        
        this.isInitialized = false;
    }

     LoadingStarted() {
        if (!this.isInitialized) {
            return;
        }
        if (AdManager.#demoMode) {
            return;
        }
        window.CrazyGames.SDK.game.loadingStart();
    }

    LoadingFinished() {
        if (!this.isInitialized) {
            return;
        }
        if (AdManager.#demoMode) {
            return;
        }
        window.CrazyGames.SDK.game.loadingStop();
    }

    GameplayStart() {
        if (!this.isInitialized) {
            return;
        }
        if (AdManager.#demoMode) {
            return;
        }
        window.CrazyGames.SDK.game.gameplayStart();
    }

    GameplayStop() {
        if (!this.isInitialized) {
            return;
        }
        if (AdManager.#demoMode) {
            return;
        }
        window.CrazyGames.SDK.game.gameplayStop();
    }

    CommercialBreak() {
        if (!this.isInitialized) {
            return;
        }
        if (AdManager.#demoMode) {
            return;
        }

        /*AdManager.#commercialCounter += 1;
        if (AdManager.#commercialCounter >= 8) {
            AdManager.#commercialCounter = 0;
        }
        else {
            return;
        }*/

        const wasEverythingMuted = (this.game)? this.game.isMuted : false;

        if (this.game) {
            this.game.setMuted(true);
        }

        const callbacks = {
            adFinished: () => { 
                if (this.game) {
                    this.game.setMuted(wasEverythingMuted);
                }
                console.log("Ad finished") 
            },
            adError: (error) => {  
                if (this.game) {
                    this.game.setMuted(wasEverythingMuted);
                }
            },
            adStarted: () => {
                console.log("Ad started") 
             },
        };

        window.CrazyGames.SDK.ad.requestAd("midgame", callbacks);
    }

    static #failTest = true;
    RewardBreak(callback) {
        if (AdManager.#demoMode) {
            if (callback) {
                callback(true);
            }
            return;
        }

        if (!this.isInitialized) {
            if (callback) {
                callback(false);
            }
            return;
        }

        const wasEverythingMuted = (this.game)? this.game.isMuted : false;

        if (this.game) {
            this.game.setMuted(true);
        }

        const callbacks = {
            adFinished: () => { 
                if (callback) {
                    callback(true);
                }
                if (this.game) {
                    this.game.setMuted(wasEverythingMuted);
                }
                console.log("Ad finished") 
            },
            adError: (error) => {  
                if (callback) {
                    callback(false);
                }
                if (this.game) {
                    this.game.setMuted(wasEverythingMuted);
                }
            },
            adStarted: () => {
                console.log("Ad started") 
             },
        };

        window.CrazyGames.SDK.ad.requestAd("rewarded", callbacks);
    }
} 
