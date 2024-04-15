import SceneDungeon from './SceneDungeon.js'

const config = {
    //width: 1024,
    //height: 2048,
    width: 1976,
    height: 3952,
    backgroundColor: '#1d1d1d',
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [SceneDungeon],
    scale: {
        mode: Phaser.Scale.FIT
    }
}
new Phaser.Game(config);