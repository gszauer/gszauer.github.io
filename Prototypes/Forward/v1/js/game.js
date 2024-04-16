import MainScene from './MainScene.js'

const config = {
    width: 640,
    height: 1024,
    backgroundColor: '#1d1d1d',
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [MainScene],
    scale: {
        mode: Phaser.Scale.FIT
    }
}

new Phaser.Game(config);