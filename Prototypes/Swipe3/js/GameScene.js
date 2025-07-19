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
        
        this.gameGrid = new GameGrid(this, 0, 0, config);
        this.add.existing(this.gameGrid);
        
        this.createUI();
        this.createDragVisualization();
        this.setupEventListeners();
        
        // Delay input setup to prevent carry-over from level select
        this.time.delayedCall(100, () => {
            this.setupInput();
        });
    }
    
    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.levelText = this.add.text(20, 20, `Level: ${this.currentLevel}`, {
            fontSize: '24px',
            color: '#ffffff'
        });
        
        const backButton = this.add.rectangle(
            width - 80, 30, 120, 40, 0x27ae60
        );
        backButton.setInteractive({ useHandCursor: true });
        
        const backText = this.add.text(width - 80, 30, 'Back', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        backButton.on('pointerover', () => backButton.setFillStyle(0x2ecc71));
        backButton.on('pointerout', () => backButton.setFillStyle(0x27ae60));
        backButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('LevelSelectScene');
        });
        
        if (this.gameGrid.winCondition) {
            this.winConditionText = this.add.text(20, 50, this.getWinConditionText(), {
                fontSize: '24px',
                color: '#ffffff'
            });
        }
    }
    
    getWinConditionText() {
        const condition = this.gameGrid.winCondition;
        if (!condition) return '';
        
        if (condition.type === 'kill') {
            return `Kill ${this.gameGrid.winProgress}/${condition.target} monsters`;
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
        
        this.input.keyboard.on('keydown-UP', () => this.tryMove('up'));
        this.input.keyboard.on('keydown-DOWN', () => this.tryMove('down'));
        this.input.keyboard.on('keydown-LEFT', () => this.tryMove('left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.tryMove('right'));
        this.input.keyboard.on('keydown-W', () => this.tryMove('up'));
        this.input.keyboard.on('keydown-S', () => this.tryMove('down'));
        this.input.keyboard.on('keydown-A', () => this.tryMove('left'));
        this.input.keyboard.on('keydown-D', () => this.tryMove('right'));
    }
    
    setupEventListeners() {
        this.events.on('levelComplete', () => {
            this.handleLevelComplete();
        });
        
        
        this.events.on('fireProjectile', (data) => {
            this.fireProjectile(data);
        });
        
        this.events.on('updateWinCondition', () => {
            this.updateWinConditionDisplay();
        });
    }
    
    handlePointerDown(pointer) {
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
        if (this.gameGrid.isAnimating) return;
        
        const moved = this.gameGrid.shiftPlayer(direction);
        
        if (moved) {
            this.updateWinConditionDisplay();
            this.checkGameOver();
        }
    }
    
    checkGameOver() {
        if (this.gameGrid.playerCard && this.gameGrid.playerCard.isDead()) {
            this.handleGameOver();
        }
    }
    
    handleGameOver() {
        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Game Over!',
            {
                fontSize: '48px',
                color: '#ff0000'
            }
        ).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            this.scene.stop();
            this.scene.start('LevelSelectScene');
        });
    }
    
    handleLevelComplete() {
        const completeText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Level Complete!',
            {
                fontSize: '48px',
                color: '#00ff00'
            }
        ).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => {
            if (this.currentLevel < 15) {
                this.scene.restart({ level: this.currentLevel + 1 });
            } else {
                this.scene.stop();
                this.scene.start('LevelSelectScene');
            }
        });
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