import { LevelData } from './LevelData.js';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.availableLevels = [];
        this.completedLevels = [];
        this.selectedLevel = null;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.text(width / 2, 100, 'PALADINGED', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 150, 'Select a Level', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.loadPlayerProgress();
        this.createLevelButtons();
        
        this.add.text(width / 2, height - 50, 'Click or tap a level to start', {
            fontSize: '20px',
            fill: '#888888'
        }).setOrigin(0.5);
    }
    
    createLevelButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const levelCount = LevelData.getLevelCount();
        const buttonsPerRow = 3;
        const buttonSize = 120;
        const buttonSpacing = 150;
        const startY = 300;
        
        for (let i = 0; i < levelCount; i++) {
            const level = LevelData.getLevel(i + 1);
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;
            
            const totalWidth = (buttonsPerRow - 1) * buttonSpacing;
            const startX = (width - totalWidth) / 2;
            
            const x = startX + col * buttonSpacing;
            const y = startY + row * buttonSpacing;
            
            const isUnlocked = i === 0 || this.completedLevels.includes(i);
            
            this.createLevelButton(x, y, level, isUnlocked);
        }
    }
    
    createLevelButton(x, y, level, isUnlocked) {
        const buttonColor = isUnlocked ? 0x4CAF50 : 0x666666;
        const textColor = isUnlocked ? '#ffffff' : '#333333';
        
        const button = this.add.graphics();
        button.fillStyle(buttonColor, 1);
        button.fillRoundedRect(x - 60, y - 60, 120, 120, 10);
        
        const levelNumber = this.add.text(x, y - 10, level.id.toString(), {
            fontSize: '48px',
            fill: textColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const levelName = this.add.text(x, y + 30, level.name, {
            fontSize: '14px',
            fill: textColor
        }).setOrigin(0.5);
        
        if (this.completedLevels.includes(level.id - 1)) {
            this.add.text(x + 40, y - 40, '⭐', {
                fontSize: '24px'
            }).setOrigin(0.5);
        }
        
        if (isUnlocked) {
            const hitArea = new Phaser.Geom.Rectangle(x - 60, y - 60, 120, 120);
            button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            
            button.on('pointerover', () => {
                button.clear();
                button.fillStyle(0x66BB6A, 1);
                button.fillRoundedRect(x - 60, y - 60, 120, 120, 10);
            });
            
            button.on('pointerout', () => {
                button.clear();
                button.fillStyle(buttonColor, 1);
                button.fillRoundedRect(x - 60, y - 60, 120, 120, 10);
            });
            
            button.on('pointerdown', () => {
                this.selectLevel(level.id);
            });
        }
    }
    
    selectLevel(levelNumber) {
        this.selectedLevel = levelNumber;
        this.scene.start('GameplayScene', { levelId: levelNumber });
    }
    
    loadPlayerProgress() {
        const savedProgress = localStorage.getItem('paladinged_progress');
        if (savedProgress) {
            this.completedLevels = JSON.parse(savedProgress);
        } else {
            this.completedLevels = [];
        }
    }
}