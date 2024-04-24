import SceneDungeon from './SceneDungeon.js'

window.addEventListener('load', () => {
    const config = {
        width: 1024, 
        height: 2048,
        backgroundColor: '#1d1d1d',
        type: Phaser.AUTO,
        parent: 'phaser-game',
        scene: [SceneDungeon],
        scale: {
            mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
    }

    const game = new Phaser.Game(config);

    const resize = () => {
        const canvas = document.querySelector("canvas");
        
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
    };
    resize();
    window.addEventListener("resize", resize, false);
});