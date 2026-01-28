/**
 * MainMenu.js - Main Menu Scene
 */

class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
        this.GAME_WIDTH = LAYOUT.GAME_WIDTH;
        this.GAME_HEIGHT = LAYOUT.GAME_HEIGHT;
    }

    create() {
        // Root container for scaling
        this.rootContainer = this.add.container(0, 0);

        // Background
        const bg = this.add.rectangle(
            this.GAME_WIDTH / 2,
            this.GAME_HEIGHT / 2,
            this.GAME_WIDTH,
            this.GAME_HEIGHT,
            COLORS.BACKGROUND
        );
        this.rootContainer.add(bg);

        // Title
        const title = this.add.text(this.GAME_WIDTH / 2, 400, 'SNAP', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '120px',
            color: COLORS.PRIMARY_HEX,
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        this.rootContainer.add(title);

        // Subtitle
        const subtitle = this.add.text(this.GAME_WIDTH / 2, 520, 'Card Battle Game', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            color: '#888888'
        }).setOrigin(0.5);
        this.rootContainer.add(subtitle);

        // Start button
        this.createButton(
            this.GAME_WIDTH / 2,
            800,
            'START GAME',
            () => this.startGame()
        );

        // Info text
        const infoText = this.add.text(this.GAME_WIDTH / 2, this.GAME_HEIGHT - 100,
            '6 Turns • 3 Locations • Control 2 to Win', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: '#666666'
        }).setOrigin(0.5);
        this.rootContainer.add(infoText);

        // Scale and position
        this.scaleAndPosition();
        this.scale.on('resize', this.handleResize, this);
    }

    createButton(x, y, text, callback) {
        const buttonWidth = 300;
        const buttonHeight = 70;

        // Button background
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(COLORS.PRIMARY, 1);
        buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 12);
        buttonBg.lineStyle(3, 0x000000, 0.3);
        buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 12);
        this.rootContainer.add(buttonBg);

        // Button text
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.rootContainer.add(buttonText);

        // Hit area
        const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.rootContainer.add(hitArea);

        // Hover effects
        hitArea.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x00c8ff, 1);
            buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 12);
            buttonBg.lineStyle(3, 0x000000, 0.3);
            buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 12);
        });

        hitArea.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(COLORS.PRIMARY, 1);
            buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 12);
            buttonBg.lineStyle(3, 0x000000, 0.3);
            buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 12);
        });

        hitArea.on('pointerdown', callback);

        return { buttonBg, buttonText, hitArea };
    }

    startGame() {
        this.scene.start('GameScene');
    }

    scaleAndPosition() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const scale = Math.min(
            screenWidth / this.GAME_WIDTH,
            screenHeight / this.GAME_HEIGHT
        );

        this.rootContainer.setScale(scale);

        const scaledWidth = this.GAME_WIDTH * scale;
        const scaledHeight = this.GAME_HEIGHT * scale;
        this.rootContainer.setPosition(
            (screenWidth - scaledWidth) / 2,
            (screenHeight - scaledHeight) / 2
        );
    }

    handleResize() {
        this.scaleAndPosition();
    }
}
