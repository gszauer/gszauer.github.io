export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
        this.loadingBar = null;
        this.loadingText = null;
        this.assetsToLoad = [];
    }
    
    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0xffffff, 0.8);
        
        this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.load.on('progress', (value) => {
            this.updateLoadingBar(value);
        });
        
        this.load.on('complete', () => {
            this.loadingBar.destroy();
            this.loadingText.destroy();
        });
    }
    
    create() {
        this.scene.start('LevelSelectScene');
    }
    
    updateLoadingBar(percentage) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const barWidth = 300;
        const barHeight = 30;
        const x = (width - barWidth) / 2;
        const y = height / 2;
        
        this.loadingBar.clear();
        this.loadingBar.fillStyle(0xffffff, 0.3);
        this.loadingBar.fillRect(x, y, barWidth, barHeight);
        this.loadingBar.fillStyle(0xffffff, 0.8);
        this.loadingBar.fillRect(x, y, barWidth * percentage, barHeight);
        
        this.loadingText.setText(`Loading... ${Math.floor(percentage * 100)}%`);
    }
}