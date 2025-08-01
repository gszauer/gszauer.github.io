class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        // Set background color
        this.cameras.main.setBackgroundColor('#2a2a2a');

        // Create containers for layout (matching game positions)
        this.displayContainer = this.add.container(360, 320);
        this.buttonsContainer = this.add.container(360, 920);

        // Draw the display area (mimicking the game screen)
        this.createDisplay();
        
        // Draw empty button placeholders
        this.createEmptyButtons();

        // Create loading text (positioned in the middle of the screen)
        this.loadingText = this.add.text(0, 0, 'Loading', {
            fontSize: '60px',
            color: '#2a2a2a',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.displayContainer.add(this.loadingText);

        // Create progress bar
        this.progressBar = this.add.graphics();
        this.progressBox = this.add.graphics();
        this.displayContainer.add(this.progressBox);
        this.displayContainer.add(this.progressBar);
        
        // Draw progress box background (positioned below loading text)
        this.progressBox.fillStyle(0x2a2a2a, 0.8);
        this.progressBox.fillRoundedRect(-200, 50, 400, 50, 25);
        
        // Setup load progress callbacks
        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x2a2a2a, 1);
            this.progressBar.fillRoundedRect(-195, 55, 390 * value, 40, 20);
        });

        this.load.on('complete', () => {
            AdManager.instance.LoadingFinished();
            this.onLoadComplete();
        });

        // Load the soundbank audio sprite
        this.load.audioSprite('soundbank', 
            'assets/soundbank.json',
            [
                'assets/soundbank.ogg',
                'assets/soundbank.m4a',
                'assets/soundbank.mp3',
                'assets/soundbank.ac3'
            ]
        );

    }

    create() {
        // Scene is ready, waiting for player to click PLAY
    }

    createDisplay() {
        // Display background (relative to container)
        const displayBg = this.add.graphics();
        displayBg.fillStyle(0x1a1a1a, 1);
        displayBg.fillRoundedRect(-340, -300, 680, 500, 20);
        this.displayContainer.add(displayBg);

        // Calculator screen (relative to container)
        const screen = this.add.graphics();
        screen.fillStyle(0x8fb98f, 1);
        screen.fillRoundedRect(-320, -220, 640, 400, 15);
        this.displayContainer.add(screen);

        // Solar panel decoration (relative to container)
        const solar = this.add.graphics();
        solar.fillStyle(0x444444, 1);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 2; j++) {
                solar.fillRect(240 + i * 20, -280 + j * 20, 15, 15);
            }
        }
        this.displayContainer.add(solar);
    }

    createEmptyButtons() {
        const buttonSize = 180;
        const spacing = 20;
        const startX = -(buttonSize + spacing);
        const startY = -(buttonSize + spacing);

        this.buttons = [];
        this.buttonBackgrounds = [];

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = startX + col * (buttonSize + spacing);
                const y = startY + row * (buttonSize + spacing);

                // Create shadow
                const shadow = this.add.graphics();
                shadow.fillStyle(0x000000, 0.3);
                shadow.fillRoundedRect(x - buttonSize/2 + 5, y - buttonSize/2 + 5, buttonSize, buttonSize, 15);
                this.buttonsContainer.add(shadow);

                // Create empty button background
                const buttonBg = this.add.graphics();
                buttonBg.fillStyle(0x444444, 1);
                buttonBg.fillRoundedRect(x - buttonSize/2, y - buttonSize/2, buttonSize, buttonSize, 15);
                this.buttonsContainer.add(buttonBg);
                this.buttonBackgrounds.push(buttonBg);

                // Store button info for later
                const index = row * 3 + col;
                this.buttons.push({ x: x, y: y, index: index, bg: buttonBg, size: buttonSize });
            }
        }
    }

    createSmileyFace() {
        const smileyContainer = this.add.container(0, -20); // Center in the screen area
        
        // Left eye
        const leftEye = this.add.graphics();
        leftEye.fillStyle(0x2a2a2a, 1);
        leftEye.fillCircle(-120, -80, 40);
        smileyContainer.add(leftEye);
        
        // Right eye
        const rightEye = this.add.graphics();
        rightEye.fillStyle(0x2a2a2a, 1);
        rightEye.fillCircle(120, -80, 40);
        smileyContainer.add(rightEye);
        
        // Smile (half circle)
        const smile = this.add.graphics();
        smile.lineStyle(20, 0x2a2a2a, 1);
        smile.beginPath();
        smile.arc(0, 20, 120, 0, Math.PI, false);
        smile.strokePath();
        
        smileyContainer.add(smile);
        this.displayContainer.add(smileyContainer);
    }

    onLoadComplete() {
        // Remove loading text and progress bar
        this.loadingText.destroy();
        this.progressBar.destroy();
        this.progressBox.destroy();

        // Create smiley face where the loading bar was
        this.createSmileyFace();

        // Change middle button (index 4) to blue PLAY button
        const middleButton = this.buttons[4];
        
        // Clear the empty button
        middleButton.bg.clear();
        
        // Draw blue button background
        middleButton.bg.fillStyle(0x4444ff, 1);
        middleButton.bg.fillRoundedRect(
            middleButton.x - middleButton.size/2, 
            middleButton.y - middleButton.size/2, 
            middleButton.size, 
            middleButton.size, 
            15
        );
        
        // Add PLAY text
        const playText = this.add.text(
            middleButton.x, 
            middleButton.y, 
            'PLAY', 
            {
                fontSize: '48px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.buttonsContainer.add(playText);

        // Make the play button interactive
        const playButton = this.add.rectangle(
            360 + middleButton.x, 
            920 + middleButton.y, 
            middleButton.size, 
            middleButton.size
        );
        playButton.setInteractive({ useHandCursor: true });
        
        playButton.on('pointerdown', () => {
            this.sound.playAudioSprite('soundbank', 'click', { volume: 0.7 });
            AdManager.instance.GameplayStart();
            this.scene.start('GameScene');
        });

        playButton.on('pointerover', () => {
            middleButton.bg.clear();
            middleButton.bg.fillStyle(0x6666ff, 1);
            middleButton.bg.fillRoundedRect(
                middleButton.x - middleButton.size/2, 
                middleButton.y - middleButton.size/2, 
                middleButton.size, 
                middleButton.size, 
                15
            );
        });

        playButton.on('pointerout', () => {
            middleButton.bg.clear();
            middleButton.bg.fillStyle(0x4444ff, 1);
            middleButton.bg.fillRoundedRect(
                middleButton.x - middleButton.size/2, 
                middleButton.y - middleButton.size/2, 
                middleButton.size, 
                middleButton.size, 
                15
            );
        });
    }
}