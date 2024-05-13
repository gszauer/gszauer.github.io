import SceneDungeon from './SceneDungeon.js'
import SceneMenu from './SceneMenu.js'
import ScenePreloader from './ScenePreloader.js'

window.addEventListener('load', () => {
    const config = {
        width: 1024, 
        height: 2048,
        backgroundColor: '#1d1d1d',
        type: Phaser.AUTO,
        parent: 'phaser-game',
        scene: [ScenePreloader, SceneMenu, SceneDungeon],
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
    game.backgroundElement = null;

    game.SetHTMLTint = (state) => {
        if (game.backgroundElement == null) {
            game.backgroundElement = document.getElementById('phaser-game');
        }

        if (state) {
            game.backgroundElement.style.backgroundColor  ="rgb(0, 0, 0)";            
            game.backgroundElement.style.backgroundImage="url(war/WebBGDark.jpg)";            
        }
        else {
            game.backgroundElement.style.backgroundColor  = "rgb(24, 24, 24)";          
            game.backgroundElement.style.backgroundImage="url(war/WebBG.jpg)";            
        }
    }
    //resize();
    //window.addEventListener("resize", resize, false);
});