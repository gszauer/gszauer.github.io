class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameGrid = null;
        this.isAnimating = false;
        this.dragStartPos = null;
        this.currentLevel = 1;
        this.dragVisuals = null;
    }
    
    init(data) {
        this.currentLevel = data.level || 1;
        this.dragStartPos = null;
        this.backgroundNumber = ((this.currentLevel - 1) % 6) + 1;

        if (this.currentLevel >= 5) {
            AdManager.instance.CommercialBreak();
        }
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        const backgroundKey = `background_${this.backgroundNumber}.png`;
        const background = this.add.image(width / 2, height / 2, 'atlas_01', backgroundKey);
        
        // Scale uniformly to cover the screen
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Load level configuration
        const levelConfigs = this.cache.json.get('levelConfig');
        const levelIndex = Math.min(this.currentLevel - 1, levelConfigs.length - 1);
        const config = levelConfigs[Math.max(0, levelIndex)];
        
        // Pass level number along with config
        config.levelNumber = this.currentLevel;
        this.gameGrid = new GameGrid(this, 0, 0, config);
        this.add.existing(this.gameGrid);
        
        this.createUI();
        this.createDragVisualization();
        this.setupEventListeners();
        
        // Show tutorial for level 1
        if (this.currentLevel === 1) {
            // Delay slightly to ensure everything is set up
            this.time.delayedCall(200, () => {
                const tutorial = new Tutorial(this, 1, "This is your hero. Swipe around to move!", "char_hero.png");
                tutorial.AddSwipeGesture();
            });
        }
        if (this.currentLevel === 2) {
            // Delay slightly to ensure everything is set up
            this.time.delayedCall(200, () => {
                const tutorial = new Tutorial(this, 1, "If you have a shield, it takes damage instead of your HP", "char_chield.png");
            });
        }
        
        // Delay input setup to prevent carry-over from level select
        this.time.delayedCall(100, () => {
            this.setupInput();
        });
    }
    
    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add menu header tile sprite
        const headerHeight = 100; // Adjust this based on your sprite's height
        this.menuHeader = this.add.tileSprite(0, 0, width, headerHeight, 'atlas_03', 'menu_header.png');
        this.menuHeader.setOrigin(0, 0);
        
        const backButton = this.add.image(width - 80, 50, 'atlas_03', 'button_menu.png');
        backButton.setInteractive({ useHandCursor: true });
        backButton.setScale(0.6);

        backButton.on('pointerover', () => backButton.setTint(0xcccccc));
        backButton.on('pointerout', () => backButton.clearTint());
        backButton.on('pointerdown', () => {
            new GameMenuWindow(this);
            //new Tutorial(this, 3, "Welcome to the game! Hope you have a good time here", "char_hero.png");
        });
        
        if (this.gameGrid.winCondition) {
            this.winConditionText = this.add.text(20, 25, this.getWinConditionText(), {
                fontSize: '42px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3,
            });
        }
    }
    
    getWinConditionText() {
        const condition = this.gameGrid.winCondition;
        if (!condition) return '';
        
        if (condition.type === 'kill') {
            return `Defeat ${this.gameGrid.winProgress}/${condition.target} monsters`;
        } else if (condition.type === 'collect') {
            return `Collect ${this.gameGrid.winProgress}/${condition.target} items`;
        }
        return '';
    }
    
    updateWinConditionDisplay() {
        if (this.winConditionText) {
            this.winConditionText.setText(this.getWinConditionText());
        }
    }
    
    createDragVisualization() {
        this.dragVisuals = {
            line: this.add.graphics().setDepth(1000)
        };
    }
    
    setupInput() {
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointerup', this.handlePointerUp, this);
        this.input.on('pointerupoutside', this.handlePointerUp, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        
        this.input.keyboard.on('keydown-UP', () => { if (!Window.hasOpenWindows()) this.tryMove('up'); });
        this.input.keyboard.on('keydown-DOWN', () => { if (!Window.hasOpenWindows()) this.tryMove('down'); });
        this.input.keyboard.on('keydown-LEFT', () => { if (!Window.hasOpenWindows()) this.tryMove('left'); });
        this.input.keyboard.on('keydown-RIGHT', () => { if (!Window.hasOpenWindows()) this.tryMove('right'); });
        this.input.keyboard.on('keydown-W', () => { if (!Window.hasOpenWindows()) this.tryMove('up'); });
        this.input.keyboard.on('keydown-S', () => { if (!Window.hasOpenWindows()) this.tryMove('down'); });
        this.input.keyboard.on('keydown-A', () => { if (!Window.hasOpenWindows()) this.tryMove('left'); });
        this.input.keyboard.on('keydown-D', () => { if (!Window.hasOpenWindows()) this.tryMove('right'); });
    }
    
    setupEventListeners() {
        this.events.on('levelComplete', () => {
            this.handleLevelComplete();
        });
        
        this.events.on('playerDied', () => {
            this.handleGameOver();
        });
        
        this.events.on('fireProjectile', (data) => {
            this.fireProjectile(data);
        });
        
        this.events.on('updateWinCondition', () => {
            this.updateWinConditionDisplay();
        });
    }
    
    cleanupEventListeners() {
        // Clean up all event listeners
        this.events.off('levelComplete');
        this.events.off('playerDied');
        this.events.off('fireProjectile');
        this.events.off('updateWinCondition');
        
        // Clean up keyboard listeners
        this.input.keyboard.off('keydown-W');
        this.input.keyboard.off('keydown-S');
        this.input.keyboard.off('keydown-A');
        this.input.keyboard.off('keydown-D');
        
        // Clean up pointer listeners
        this.input.off('pointerdown');
        this.input.off('pointerup');
        this.input.off('pointermove');
    }
    
    shutdown() {
        // Called automatically by Phaser when scene stops
        this.cleanupEventListeners();
    }
    
    handlePointerDown(pointer) {
        if (Window.hasOpenWindows()) return;
        if (!this.gameGrid.isAnimating) {
            this.dragStartPos = { x: pointer.x, y: pointer.y };
            this.clearDragVisuals();
            
            if (this.gameGrid.playerCard) {
                // Store the original position
                this.playerCardOriginalX = this.gameGrid.playerCard.x;
                this.playerCardOriginalY = this.gameGrid.playerCard.y;
                
                this.tweens.add({
                    targets: this.gameGrid.playerCard,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
            }
        }
    }
    
    handlePointerUp(pointer) {
        if (Window.hasOpenWindows()) return;
        if (this.dragStartPos && !this.gameGrid.isAnimating) {
            const dx = pointer.x - this.dragStartPos.x;
            const dy = pointer.y - this.dragStartPos.y;
            const threshold = 20;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > threshold) {
                let direction = null;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    direction = dx > 0 ? 'right' : 'left';
                } else {
                    direction = dy > 0 ? 'down' : 'up';
                }
                
                this.tryMove(direction);
            } else {
                // Small movement - check if it's a click on an adjacent tile
                if (this.gameGrid.playerCard) {
                    // Convert pointer to local grid coordinates
                    const localX = (pointer.x - this.gameGrid.x) / this.gameGrid.scale;
                    const localY = (pointer.y - this.gameGrid.y) / this.gameGrid.scale;
                    
                    // Get player's current grid position
                    const playerRow = this.gameGrid.playerRow;
                    const playerCol = this.gameGrid.playerCol;
                    
                    // Check each adjacent tile
                    const adjacentTiles = [
                        { row: playerRow - 1, col: playerCol, dir: 'up' },
                        { row: playerRow + 1, col: playerCol, dir: 'down' },
                        { row: playerRow, col: playerCol - 1, dir: 'left' },
                        { row: playerRow, col: playerCol + 1, dir: 'right' }
                    ];
                    
                    for (const adj of adjacentTiles) {
                        if (adj.row >= 0 && adj.row < this.gameGrid.gridHeight &&
                            adj.col >= 0 && adj.col < this.gameGrid.gridWidth) {
                            
                            const tile = this.gameGrid.tiles[adj.row][adj.col];
                            if (!tile.disabled) {
                                // Check if click is within this tile's bounds
                                const tileLeft = tile.x - this.gameGrid.tileSizeX / 2;
                                const tileRight = tile.x + this.gameGrid.tileSizeX / 2;
                                const tileTop = tile.y - this.gameGrid.tileSizeY / 2;
                                const tileBottom = tile.y + this.gameGrid.tileSizeY / 2;
                                
                                if (localX >= tileLeft && localX <= tileRight &&
                                    localY >= tileTop && localY <= tileBottom) {
                                    // Click is on an adjacent tile - move there
                                    this.tryMove(adj.dir);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            this.dragStartPos = null;
            this.clearDragVisuals();
            
            if (this.gameGrid.playerCard) {
                this.gameGrid.playerCard.x = this.playerCardOriginalX;
                this.gameGrid.playerCard.y = this.playerCardOriginalY;
                this.gameGrid.playerCard.setScale(1, 1);
            }
        }
    }
    
    handlePointerMove(pointer) {
        if (Window.hasOpenWindows()) return;
        if (this.dragStartPos && !this.gameGrid.isAnimating) {
            const dx = pointer.x - this.dragStartPos.x;
            const dy = pointer.y - this.dragStartPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const threshold = 20; // TODO: This is duplicated!
            
            this.updateDragVisuals(pointer, dx, dy, distance);
            
            if (this.gameGrid.playerCard) {
                if (distance > threshold) {
                    // Show directional preview by moving the card slightly
                    const previewDistance = 15; // How far to move the card for preview
                    let offsetX = 0;
                    let offsetY = 0;
                    
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // Horizontal movement
                        offsetX = dx > 0 ? previewDistance : -previewDistance;
                    } else {
                        // Vertical movement
                        offsetY = dy > 0 ? previewDistance : -previewDistance;
                    }
                    
                    // Move the card slightly in the direction it will go
                    this.gameGrid.playerCard.x = this.playerCardOriginalX + offsetX;
                    this.gameGrid.playerCard.y = this.playerCardOriginalY + offsetY;
                } else {
                    // If distance is too small, return card to center
                    this.gameGrid.playerCard.x = this.playerCardOriginalX;
                    this.gameGrid.playerCard.y = this.playerCardOriginalY;
                }
            }
        }
    }
    
    updateDragVisuals(pointer, dx, dy, distance) {
        const { line } = this.dragVisuals;
        
        line.clear();
        
        if (distance > 20) {
            line.lineStyle(3, 0x00ff00, 0.5);
        } else {
            line.lineStyle(3, 0xff0000, 0.3);
            
        }
        line.beginPath();
        line.moveTo(this.dragStartPos.x, this.dragStartPos.y);
        line.lineTo(pointer.x, pointer.y);
        line.closePath();
        line.strokePath();
    }
    
    clearDragVisuals() {
        if (this.dragVisuals) {
            this.dragVisuals.line.clear();
        }
    }
    
    tryMove(direction) {
        if (Window.hasOpenWindows()) return;
        if (this.gameGrid.isAnimating) return;
        
        const moved = this.gameGrid.shiftPlayer(direction);
        
        if (moved) {
            this.updateWinConditionDisplay();
        }
    }
    
    checkGameOver() {
        if (this.gameGrid.playerCard && this.gameGrid.playerCard.isDead()) {
            this.handleGameOver();
        }
    }
    
    handleGameOver() {
        // Play game over sound
        if (soundEffectsEnabled) {
            this.sound.playAudioSprite('soundbank', 'loose');
        }
        
        // Prevent any further game actions
        Window.externalWindowOpen = true;
        
        // Create fullscreen black blocker with 50% opacity
        const blocker = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.5
        );
        blocker.setDepth(999);
        blocker.setInteractive(); // Block all input to the game layer below
        
        // Create defeat screen image
        const defeatScreen = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 170,
            'atlas_03',
            'defeat_screen.png'
        );
        defeatScreen.setDepth(1000);
        
        // Create Try Again button (left button)
        this.createDefeatButton(
            this.cameras.main.width / 2 - 170,
            this.cameras.main.height / 2 + 160,
            'Restart Level',
            () => {
                Window.externalWindowOpen = false;
                this.cleanupEventListeners();
                this.scene.restart({ level: this.currentLevel });
            }
        );
        
        // Create Continue button (right button)
        const continueButton = this.createDefeatButton(
            this.cameras.main.width / 2 + 170,
            this.cameras.main.height / 2 + 160,
            'Continue',
            () => {
                // Disable button during ad
                continueButton.disableInteractive();
                
                AdManager.instance.RewardBreak((success) => {
                    if (success) {
                        // Remove defeat UI and continue game
                        blocker.destroy();
                        defeatScreen.destroy();
                        continueButton.destroy();
                        
                        // Find and destroy the Try Again button too
                        const tryAgainButton = this.children.list.find(child => 
                            child.x === this.cameras.main.width / 2 - 170 && 
                            child.y === this.cameras.main.height / 2 + 160 &&
                            child.setInteractive
                        );
                        if (tryAgainButton) {
                            tryAgainButton.destroy();
                            // Also destroy associated graphics and text
                            const elementsToDestroy = this.children.list.filter(child => 
                                child.depth >= 1001 && child.depth <= 1004
                            );
                            elementsToDestroy.forEach(element => element.destroy());
                        }
                        
                        // Revive the player
                        if (this.gameGrid.playerCard) {
                            this.gameGrid.playerCard.power = this.gameGrid.playerCard.maxPower;
                            if (this.gameGrid.playerCard.shield < 0) { this.gameGrid.playerCard.shield = 0; }
                            this.gameGrid.playerCard.shield += 10;
                            this.gameGrid.playerCard.updateDisplay();
                        }
                        
                        // Re-enable game input
                        Window.externalWindowOpen = false;
                    } else {
                        // Change button to Level Select
                        continueButton.buttonText.setText('Level Select');
                        if (continueButton.subTextObj) {
                            continueButton.subTextObj.setText('(Ad not available)');
                        }
                        
                        // Update callback to go to level select
                        continueButton.removeAllListeners('pointerdown');
                        continueButton.on('pointerdown', () => {
                            Window.externalWindowOpen = false;
                            this.cleanupEventListeners();
                            AdManager.instance.GameplayStop();
                            this.scene.start('LevelSelectScene');
                        });
                        
                        // Re-enable button
                        continueButton.setInteractive();
                    }
                });
            },
            '(Watch Ad)'
        );
    }
    
    handleLevelComplete() {
        // Play win sound
        if (soundEffectsEnabled) {
            this.sound.playAudioSprite('soundbank', 'win');
        }
        
        // Prevent any further game actions
        Window.externalWindowOpen = true;
        
        // Update cleared level in PlayerData
        const playerData = PlayerData.Instance;
        const clearedLevel = playerData.GetNumber('clearedLevel', 0);
        //console.log(`Cleared: ${this.currentLevel}, highest cleared: ${clearedLevel}`)
        if (this.currentLevel > clearedLevel) {
            playerData.SetNumber('clearedLevel', this.currentLevel);
        }
        
        // Create fullscreen black blocker with 50% opacity
        const blocker = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.5
        );
        blocker.setDepth(999);
        blocker.setInteractive(); // Block all input to the game layer below
        
        // Create victory screen image
        const victoryScreen = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 170,
            'atlas_03',
            'victory_screen.png'
        );
        victoryScreen.setDepth(1000);
        
        // Create Level Select button (left button)
        this.createVictoryButton(
            this.cameras.main.width / 2 - 170,
            this.cameras.main.height / 2 + 160,
            'Level Select',
            () => {
                Window.externalWindowOpen = false;
                this.cleanupEventListeners();
                AdManager.instance.GameplayStop();
                this.scene.start('LevelSelectScene');
            }
        );
        
        // Create Next Level button (right button)
        this.createVictoryButton(
            this.cameras.main.width / 2 + 170,
            this.cameras.main.height / 2 + 160,
            'Next Level',
            () => {
                Window.externalWindowOpen = false;
                this.cleanupEventListeners();
                if (this.currentLevel <= 3) {
                    // Track tutorial levels as start / stop events
                    AdManager.instance.GameplayStop();
                    AdManager.instance.GameplayStart();
                }
                this.scene.restart({ level: this.currentLevel + 1 });
            }
        );
    }
    
    createVictoryButton(x, y, text, callback) {
        // Create drop shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x45280f, 0.5);
        shadow.fillRoundedRect(x - 150 + 4, y - 40 + 4, 300, 80, 12);
        shadow.setDepth(1001);
        
        // Create button background with rounded corners
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x84471c);
        buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
        buttonBg.lineStyle(4, 0x45280f);
        buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        buttonBg.setDepth(1002);
        
        // Create invisible hit area for interaction
        const button = this.add.rectangle(x, y, 300, 80, 0x000000, 0);
        button.setInteractive();
        button.setDepth(1003);
        
        // Create button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: '36px',
            color: '#e7c28d',
            fontFamily: 'Arial'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(1004);
        
        // Add hover effects
        button.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x8f632f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        button.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x84471c);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        button.on('pointerdown', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x45280f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
            if (callback) callback();
        });
        
        button.on('pointerup', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x8f632f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        return button;
    }
    
    createDefeatButton(x, y, text, callback, subText = null) {
        // Create drop shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x45280f, 0.5);
        shadow.fillRoundedRect(x - 150 + 4, y - 40 + 4, 300, 80, 12);
        shadow.setDepth(1001);
        
        // Create button background with rounded corners
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x84471c);
        buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
        buttonBg.lineStyle(4, 0x45280f);
        buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        buttonBg.setDepth(1002);
        
        // Create invisible hit area for interaction
        const button = this.add.rectangle(x, y, 300, 80, 0x000000, 0);
        button.setInteractive();
        button.setDepth(1003);
        
        // Create button text
        const buttonText = this.add.text(x, subText ? y - 15 : y, text, {
            fontSize: '36px',
            color: '#e7c28d',
            fontFamily: 'Arial'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(1004);
        
        // Create sub text if provided
        let subTextObj = null;
        if (subText) {
            subTextObj = this.add.text(x, y + 15, subText, {
                fontSize: '24px',
                color: '#e7c28d',
                fontFamily: 'Arial'
            });
            subTextObj.setOrigin(0.5);
            subTextObj.setDepth(1004);
        }
        
        // Add hover effects
        button.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x8f632f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        button.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x84471c);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        button.on('pointerdown', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x45280f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
            if (callback) callback();
        });
        
        button.on('pointerup', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x8f632f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        // Store references for updating text later
        button.buttonText = buttonText;
        button.subTextObj = subTextObj;
        
        return button;
    }
    
    
    fireProjectile(data) {
        // Create a new projectile using the Projectile class
        // Add sprite and direction to data
        const projectileData = {
            ...data,
            sprite: data.sprite || 'projectile_up.png',
            direction: data.direction || null // Will be inferred from dx/dy if not provided
        };
        new Projectile(this, projectileData);
    }
}