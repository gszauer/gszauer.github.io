import SceneDungeon from './SceneDungeon.js'

const config = {
    //width: 1024,
    //hheight: 2048,
    width: 2048,
    height: 4096,
    backgroundColor: '#1d1d1d',
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [SceneDungeon],
    scale: {
        mode: Phaser.Scale.FIT
    }
}
new Phaser.Game(config);