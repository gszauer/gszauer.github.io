import SceneMenu from './SceneMenu.js'
import SceneDungeon from './SceneDungeon.js'

export default class ScenePreloader extends Phaser.Scene {
    constructor() {
        super('ScenePreloader');
    }

    preload() {
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);

        const screenWidth = this.game.config.width;
        const screenHeight = this.game.config.height;

        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        const height = 40;
        const width = 500;

        const borderSize = 10;
        progressBox.fillRect(centerX - width / 2 - borderSize / 2, centerY - height / 2 - borderSize / 2, width + borderSize, height + borderSize);

        const loadingText = this.make.text({
            x: centerX,
            y: 0,
            text: 'Loading',
            style: {
                font: '60px monospace',
                fill: '#424242'
            }
        });
        loadingText.y = centerY - height / 2 - loadingText.height / 2 - borderSize;
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: centerX,
            y: centerY,
            text: '0%',
            style: {
                font: '35px monospace',
                fill: '#808080'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: centerX,
            y: 0,
            text: 'Loading',
            style: {
                font: '20px monospace',
                fill: '#424242'
            }
        });
        assetText.y = centerY + height / 2 + assetText.height / 2 + borderSize;
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            //console.log("Preloader Progress: " + value);

            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(centerX - width / 2, centerY - height / 2, width * value, height);
            
            percentText.setText(parseInt(value * 100) + '%');
        });
                    
        this.load.on('fileprogress', function (file) {
            //console.log("Preloader File: " + file.src);

            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', function () {
            //console.log('Preloader Complete');
            loadingText.setText("Done");
            assetText.setText("Done");
        });

        SceneMenu.DoPreload(this);
        SceneDungeon.DoPreload(this);
    }

    update() {
        this.scene.switch('SceneMenu'); 
    }
}