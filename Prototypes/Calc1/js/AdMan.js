class AdManager {
    static #instance = null;
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

        const isDevelopmentDomain =  ['localhost', '127.0.0.1', 'gabormakesgames.com', 'gszauer.github.io'].includes(window.location.hostname);

        if (typeof PokiSDK === "undefined") {
            console.log("No Poki SDK detected");
            if (callback) {
                callback();
            }
            AdManager.instance.isInitialized = false;
            return;
        }

        PokiSDK.init().then(() => {
            console.log("Poki SDK successfully initialized");
            if (callback) {
                callback();
            }
            AdManager.instance.isInitialized = !isDevelopmentDomain;
        }).catch(() => {
            console.error("Poki SDK initialization failed");
            if (callback && !AdManager.#instance) {
                callback();
            }
            AdManager.instance.isInitialized = false;
        });
    }

    isInitialized = false;

    constructor() {
        if (AdManager.#instance) {
            throw new Error("Constructor: Multiple copies of AdManager");
        }

        this.isInitialized = false;
    }


    LoadingFinished() {
        if (!this.isInitialized) {
            return;
        }
        PokiSDK.gameLoadingFinished();
    }

    GameplayStart() {
        if (!this.isInitialized) {
            return;
        }
        PokiSDK.gameplayStart();
    }

    GameplayStop() {
        if (!this.isInitialized) {
            return;
        }
        PokiSDK.gameplayStop();
    }

    CommercialBreak() {
        if (!this.isInitialized) {
            return;
        }

        this.GameplayStop();

        PokiSDK.commercialBreak(() => {
            muteBackgroundMusic();
        }).then(() => {
            unmuteBackgroundMusic();
            this.GameplayStart();
        });
    }

    RewardBreak(callback) {
        if (!this.isInitialized) {
            if (callback) {
                callback(false);
            }
            return;
        }

        this.GameplayStop();

        PokiSDK.rewardedBreak(() => {
            muteBackgroundMusic();
        }).then((success) => {
            if (callback) {
                callback(success? true : false);
            }

            unmuteBackgroundMusic();
            this.GameplayStart();
        });
    }
} 
