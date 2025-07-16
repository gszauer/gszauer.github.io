class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const titleText = this.add.text(width / 2, 50, 'Select Level', {
            fontSize: '32px',
            color: '#ffffff'
        });
        titleText.setOrigin(0.5, 0.5);

        // Get the level configurations
        const levelConfigs = this.cache.json.get('levelConfig');
        const totalLevels = levelConfigs.length;

        const buttonWidth = 80;
        const buttonHeight = 60;
        const padding = 20;
        const buttonsPerRow = 5;
        const rows = Math.ceil(totalLevels / buttonsPerRow);
        
        // Center the button grid
        const totalWidth = buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * padding;
        const startX = (width - totalWidth) / 2;
        const startY = 120;

        for (let i = 0; i < totalLevels; i++) {
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;
            const levelNumber = i + 1;
            
            const x = startX + col * (buttonWidth + padding) + buttonWidth / 2;
            const y = startY + row * (buttonHeight + padding) + buttonHeight / 2;

            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x3498db);
            button.setInteractive({ useHandCursor: true });

            const buttonText = this.add.text(x, y, levelNumber.toString(), {
                fontSize: '24px',
                color: '#ffffff'
            });
            buttonText.setOrigin(0.5, 0.5);

            button.on('pointerover', () => {
                button.setFillStyle(0x5dade2);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x3498db);
            });

            button.on('pointerdown', () => {
                this.scene.start('GameScene', { level: levelNumber });
            });
        }
    }
}