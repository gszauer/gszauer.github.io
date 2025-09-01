class DebugWindow extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        scene.add.existing(this);
        
        this.createWindow();
        this.setDepth(1000);
        this.setVisible(false);
    }
    
    createWindow() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Modal background blocker with tint
        this.blocker = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        this.blocker.setOrigin(0, 0);
        this.blocker.setInteractive();
        this.add(this.blocker);
        
        // Window dimensions (2.5x bigger)
        const windowWidth = 1250;
        const windowHeight = 1000;
        const windowX = (width - windowWidth) / 2;
        const windowY = (height - windowHeight) / 2;
        
        // Window background
        this.windowBg = this.scene.add.rectangle(windowX, windowY, windowWidth, windowHeight, 0xF0F0F0);
        this.windowBg.setOrigin(0, 0);
        this.windowBg.setStrokeStyle(2, 0x404040);
        this.add(this.windowBg);
        
        // Title bar (scaled up)
        const titleBarHeight = 100;
        this.titleBar = this.scene.add.rectangle(windowX, windowY, windowWidth, titleBarHeight, 0x404040);
        this.titleBar.setOrigin(0, 0);
        this.add(this.titleBar);
        
        // Title text (scaled up)
        this.titleText = this.scene.add.text(windowX + 25, windowY + titleBarHeight / 2, 'Debug', {
            fontSize: '50px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.titleText.setOrigin(0, 0.5);
        this.add(this.titleText);
        
        // Close button (X) (scaled up)
        const closeButtonSize = 75;
        const closeX = windowX + windowWidth - closeButtonSize - 12;
        const closeY = windowY + 12;
        
        this.closeButton = this.scene.add.rectangle(closeX, closeY, closeButtonSize, closeButtonSize, 0xFF4444);
        this.closeButton.setOrigin(0, 0);
        this.closeButton.setInteractive({ useHandCursor: true });
        this.add(this.closeButton);
        
        this.closeText = this.scene.add.text(closeX + closeButtonSize / 2, closeY + closeButtonSize / 2, 'X', {
            fontSize: '45px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.closeText.setOrigin(0.5, 0.5);
        this.add(this.closeText);
        
        // Close button hover effect
        this.closeButton.on('pointerover', () => {
            this.closeButton.setFillStyle(0xFF6666);
        });
        
        this.closeButton.on('pointerout', () => {
            this.closeButton.setFillStyle(0xFF4444);
        });
        
        this.closeButton.on('pointerup', () => {
            this.hide();
        });
        
        // Content area
        const contentY = windowY + titleBarHeight + 50;
        
        // Unlock All Levels button (scaled up)
        const buttonWidth = 500;
        const buttonHeight = 100;
        const buttonX = windowX + (windowWidth - buttonWidth) / 2;
        const buttonY = contentY;
        
        this.unlockButton = this.scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x4CAF50);
        this.unlockButton.setOrigin(0, 0);
        this.unlockButton.setInteractive({ useHandCursor: true });
        this.unlockButton.setStrokeStyle(5, 0x45A049);
        this.add(this.unlockButton);
        
        this.unlockText = this.scene.add.text(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, 'Unlock All Levels', {
            fontSize: '40px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.unlockText.setOrigin(0.5, 0.5);
        this.add(this.unlockText);
        
        // Unlock button hover effect
        this.unlockButton.on('pointerover', () => {
            this.unlockButton.setFillStyle(0x45A049);
        });
        
        this.unlockButton.on('pointerout', () => {
            this.unlockButton.setFillStyle(0x4CAF50);
        });
        
        this.unlockButton.on('pointerup', () => {
            this.unlockAllLevels();
        });
    }
    
    unlockAllLevels() {
        // Set completed levels to total levels minus 1 (since we unlock n+1 levels when n are completed)
        const totalLevels = LEVELS.length;
        PlayerData.Instance.SetNumber('chessmate_completed', totalLevels - 1);
        
        // Show confirmation (scaled up)
        const width = this.scene.cameras.main.width;
        const confirmText = this.scene.add.text(width / 2, this.scene.cameras.main.height / 2 + 250, 
            'All levels unlocked!', {
            fontSize: '60px',
            fontFamily: 'Arial, sans-serif',
            color: '#4CAF50',
            fontStyle: 'bold',
            backgroundColor: '#FFFFFF',
            padding: { x: 25, y: 12 }
        });
        confirmText.setOrigin(0.5, 0.5);
        this.add(confirmText);
        
        // Remove confirmation after 1.5 seconds
        this.scene.time.delayedCall(1500, () => {
            confirmText.destroy();
        });
        
        // If we're in the LevelSelect scene, restart it to show unlocked levels
        if (this.scene.scene.key === 'LevelSelect') {
            this.scene.time.delayedCall(1600, () => {
                this.hide();
                this.scene.scene.restart();
            });
        }
    }
    
    show() {
        this.setVisible(true);
    }
    
    hide() {
        this.setVisible(false);
    }
}