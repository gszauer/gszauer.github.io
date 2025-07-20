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

        const currentDomain = window.location.hostname;
        const isDevelopmentDomain = DomainProtection.DEVELOPMENT_DOMAINS.includes(currentDomain);

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
    game = null;

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

        const wasEverythingMuted = (this.game)? this.game.isMuted : false;

        this.GameplayStop();
        PokiSDK.commercialBreak(() => {
            if (this.game) {
                this.game.setMuted(true);
            }
        }).then(() => {
            if (this.game) {
                this.game.setMuted(wasEverythingMuted);
            }
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

        const wasEverythingMuted = (this.game)? this.game.isMuted : false;

        this.GameplayStop();
        PokiSDK.rewardedBreak(() => {
            if (this.game) {
                this.game.setMuted(true);
            }
        }).then((success) => {
            if (callback) {
                callback(success? true : false);
            }

            if (this.game) {
                this.game.setMuted(wasEverythingMuted);
            }
            this.GameplayStart();
        });
    }
} 
