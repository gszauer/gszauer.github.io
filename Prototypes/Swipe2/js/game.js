const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,
        height: 1280
    },
    resolution: window.devicePixelRatio || 1,
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    scene: [PreloaderScene, LevelSelectScene, GameScene]
};

const game = new Phaser.Game(config);