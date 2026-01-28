/**
 * game.js - Phaser 3 Configuration and Bootstrap
 * Marvel Snap Clone
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight,
        autoRound: false
    },
    render: {
        pixelArt: false,
        antialias: true,
        resolution: window.devicePixelRatio || 1
    },
    backgroundColor: COLORS.BACKGROUND,
    scene: [Preloader, MainMenu, GameScene]
};

// Create game instance
const game = new Phaser.Game(config);

// Global registries (initialized in Preloader)
let cardRegistry = null;
let locationRegistry = null;
