import SceneDungeon from './SceneDungeon.js'
import SceneMenu from './SceneMenu.js'

window.addEventListener('load', () => {
    const config = {
        width: 1024, 
        height: 2048,
        backgroundColor: '#1d1d1d',
        type: Phaser.AUTO,
        parent: 'phaser-game',
        scene: [SceneMenu, SceneDungeon],
        scale: {
            mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
    }

    /*const resize = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowRatio = windowWidth / windowHeight;
        
        const gameWidth = game.config.width ;
        const gameHeihgt = game.config.height;
        const gameRatio = gameWidth / gameHeihgt;

        if(windowRatio < gameRatio){
            let targetWidth = windowWidth;
            let targetHeight = windowWidth / gameRatio;
            game.scale.setParentSize(targetWidth, targetHeight);
        }
        else{
            let targetWidth = windowHeight * gameRatio;
            let targetHeight = windowHeight;
            game.scale.setParentSize(targetWidth, targetHeight);
        }
    };*/

    const game = new Phaser.Game(config);
    //resize();
    //window.addEventListener("resize", resize, false);
});