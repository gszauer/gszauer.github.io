/**
 * Preloader.js - Asset Loading Scene
 * Loads game data and assets.
 */

class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Load JSON data files
        this.load.json('cards', 'data/cards.json');
        this.load.json('locations', 'data/locations.json');
    }

    createLoadingBar() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background
        this.add.rectangle(width/2, height/2, width, height, COLORS.BACKGROUND);

        // Title
        this.add.text(width/2, height/2 - 100, 'SNAP', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '64px',
            color: COLORS.PRIMARY_HEX
        }).setOrigin(0.5);

        // Loading text
        this.loadingText = this.add.text(width/2, height/2, 'Loading...', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Progress bar background
        const barWidth = 400;
        const barHeight = 20;
        const barX = width/2 - barWidth/2;
        const barY = height/2 + 50;

        this.add.rectangle(barX + barWidth/2, barY + barHeight/2, barWidth, barHeight, 0x333333);

        // Progress bar fill
        this.progressBar = this.add.rectangle(barX, barY, 0, barHeight, COLORS.PRIMARY);
        this.progressBar.setOrigin(0, 0);

        // Progress events
        this.load.on('progress', (value) => {
            this.progressBar.width = barWidth * value;
        });

        this.load.on('complete', () => {
            this.loadingText.setText('Complete!');
        });
    }

    create() {
        // Initialize registries
        cardRegistry = new CardRegistry();
        locationRegistry = new LocationRegistry();

        // Load card data
        const cardsData = this.cache.json.get('cards');
        if (cardsData) {
            cardRegistry.loadFromJSON(cardsData);
            console.log('Loaded', cardRegistry.getAllIds().length, 'cards');
        }

        // Load location data
        const locationsData = this.cache.json.get('locations');
        if (locationsData) {
            locationRegistry.loadFromJSON(locationsData);
            console.log('Loaded', locationRegistry.getAllIds().length, 'locations');
        }

        // Register custom card implementations (overrides basic data)
        this.registerStarterCards();

        // Register custom location implementations
        this.registerBasicLocations();

        // Transition to main menu
        this.time.delayedCall(500, () => {
            this.scene.start('MainMenu');
        });
    }

    registerStarterCards() {
        // These override the basic card data with actual implementations
        if (typeof registerStarterCards === 'function') {
            registerStarterCards(cardRegistry);
        }
    }

    registerBasicLocations() {
        // These override the basic location data with actual implementations
        if (typeof registerBasicLocations === 'function') {
            registerBasicLocations(locationRegistry);
        }
    }
}
