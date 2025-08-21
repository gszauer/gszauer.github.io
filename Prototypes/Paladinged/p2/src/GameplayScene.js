import { GameConfig } from './GameConfig.js';
import Player from './Player.js';
import Hammer from './Hammer.js';
import CollisionManager from './CollisionManager.js';
import LevelManager from './LevelManager.js';
import UIManager from './UIManager.js';
import InputManager from './InputManager.js';
import PhysicsManager from './PhysicsManager.js';
import ModalDialog from './ModalDialog.js';
import UpgradesManager from './UpgradesManager.js';
import PowerUpManager from './PowerUpManager.js';

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameplayScene' });
        this.modalDialog = null;
        this.upgradesManager = null;
        this.powerUpManager = null;
    }
    
    init(data) {
        this.currentLevel = data.levelId || 1;
        this.gameState = 'playing';
        this.levelGold = 0;
        this.totalGold = this.loadTotalGold();
        
        // Get upgrades manager from level select or create new one
        this.upgradesManager = data.upgradesManager || new UpgradesManager();
    }
    
    create() {
        this.modalDialog = new ModalDialog(this);
        
        this.levelManager = new LevelManager(this);
        const levelConfig = this.levelManager.loadLevel(this.currentLevel);
        
        this.collisionManager = new CollisionManager(this);
        this.uiManager = new UIManager(this);
        this.inputManager = new InputManager(this);
        this.physicsManager = new PhysicsManager(this, levelConfig);
        this.powerUpManager = new PowerUpManager(this);
        
        this.gridGraphics = this.add.graphics();
        
        // Calculate armor bonus HP
        let armorBonusHp = 0;
        if (this.upgradesManager.isArmorUnlocked()) {
            armorBonusHp = this.upgradesManager.getArmorLevel();
        }
        
        const playerX = this.game.config.width / 2;
        const playerY = this.game.config.height - levelConfig.entities.player.radius - levelConfig.entities.player.padding;
        this.player = new Player(this, playerX, playerY, levelConfig.entities.player, armorBonusHp);
        
        this.hammer = new Hammer(this, this.player, levelConfig.hammer);
        
        const entities = this.levelManager.generateEntities();
        this.monsters = entities.monsters;
        this.obstacles = entities.obstacles;
        this.powerUps = entities.powerUps;
        this.exitDoor = entities.exitDoor;
        
        this.uiManager.create(levelConfig);
        const hasIceShield = this.player.iceShieldBonus > 0;
        this.uiManager.updateHealth(this.player.hp, this.player.maxHp, hasIceShield);
        this.uiManager.updateGold(this.totalGold + this.levelGold);
        this.uiManager.updateLevel(this.levelManager.levelData.name);
        
        this.inputManager.create();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.events.on('hammerSwing', () => {
            if (this.gameState === 'playing') {
                this.hammer.startSwing();
                this.powerUpManager.onHammerSwing();
            } else if (this.gameState === 'gameOver' || this.gameState === 'win') {
                this.restart();
            }
        });
        
        this.events.on('gameOver', () => {
            this.gameOver();
        });
        
        this.events.on('levelComplete', () => {
            this.win();
        });
        
        this.events.on('obstacleDestroyed', (goldValue) => {
            this.levelGold += goldValue;
            this.uiManager.updateGold(this.totalGold + this.levelGold);
        });
        
        this.events.on('monsterObstacleCombo', () => {
            this.levelGold += this.levelManager.levelConfig.rewards.monsterObstacleCombo;
            this.uiManager.updateGold(this.totalGold + this.levelGold);
        });
        
        this.events.on('returnToMenu', () => {
            if (this.gameState === 'gameOver' || this.gameState === 'win') {
                this.returnToLevelSelect();
            }
        });
    }
    
    update(time, delta) {
        if (this.gameState !== 'playing') return;
        
        const scrollOffset = this.levelManager.update(delta);
        
        this.player.update(time, delta);
        this.hammer.update(time, delta);
        
        this.monsters = this.monsters.filter(monster => monster.active);
        this.obstacles = this.obstacles.filter(obstacle => obstacle.active);
        this.powerUps = this.powerUps.filter(powerUp => powerUp.active !== false);
        
        for (const monster of this.monsters) {
            monster.update(time, delta);
        }
        
        // PowerUps are scrolled by LevelManager along with all other entities
        // No need to manually scroll them here
        
        // Update power-up manager
        this.powerUpManager.update(delta);
        
        this.collisionManager.checkCollisions(
            this.player,
            this.hammer,
            this.monsters,
            this.obstacles,
            this.exitDoor,
            this.powerUps
        );
        
        const hasIceShield = this.player.iceShieldBonus > 0;
        this.uiManager.updateHealth(this.player.hp, this.player.maxHp, hasIceShield);
        
        this.renderGrid(scrollOffset);
    }
    
    renderGrid(scrollOffset) {
        this.gridGraphics.clear();
        
        const lanes = this.levelManager.gridDimensions.lanes;
        const laneWidth = this.game.config.width / lanes;
        const rowHeight = this.levelManager.levelConfig.entities.player.radius;
        
        this.gridGraphics.lineStyle(2, 0x333333);
        for (let i = 0; i <= lanes; i++) {
            this.gridGraphics.beginPath();
            this.gridGraphics.moveTo(i * laneWidth, 0);
            this.gridGraphics.lineTo(i * laneWidth, this.game.config.height);
            this.gridGraphics.strokePath();
        }
        
        const offsetY = (scrollOffset % rowHeight);
        
        for (let i = -1; i <= Math.ceil(this.game.config.height / rowHeight) + 1; i++) {
            const y = offsetY + i * rowHeight;
            if (y >= 0 && y <= this.game.config.height) {
                this.gridGraphics.beginPath();
                this.gridGraphics.moveTo(0, y);
                this.gridGraphics.lineTo(this.game.config.width, y);
                this.gridGraphics.strokePath();
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.inputManager.setEnabled(false);
        
        this.modalDialog.createModal({
            title: 'Game Over',
            text: 'You have been defeated!\n\nWould you like to try again?',
            showOkButton: true,
            showCancelButton: true,
            okButtonText: 'Retry',
            cancelButtonText: 'Menu',
            centerButtons: true,
            onOk: () => {
                this.restart();
            },
            onCancel: () => {
                this.returnToLevelSelect();
            }
        });
    }
    
    win() {
        this.gameState = 'win';
        this.inputManager.setEnabled(false);
        this.totalGold += this.levelGold;
        this.saveTotalGold(this.totalGold);
        
        this.saveProgress();
        
        this.modalDialog.createModal({
            title: 'Level Complete!',
            text: `Congratulations!\n\nGold earned: ${this.levelGold}\nTotal gold: ${this.totalGold}`,
            showOkButton: true,
            showCancelButton: true,
            okButtonText: 'Next Level',
            cancelButtonText: 'Menu',
            centerButtons: true,
            onOk: () => {
                const nextLevel = this.currentLevel + 1;
                if (this.levelManager.levelExists(nextLevel)) {
                    this.scene.restart({ 
                        levelId: nextLevel,
                        upgradesManager: this.upgradesManager 
                    });
                } else {
                    this.returnToLevelSelect();
                }
            },
            onCancel: () => {
                this.returnToLevelSelect();
            }
        });
    }
    
    saveProgress() {
        let completedLevels = [];
        const savedProgress = localStorage.getItem('paladinged_progress');
        if (savedProgress) {
            completedLevels = JSON.parse(savedProgress);
        }
        
        if (!completedLevels.includes(this.currentLevel)) {
            completedLevels.push(this.currentLevel);
            localStorage.setItem('paladinged_progress', JSON.stringify(completedLevels));
        }
    }
    
    restart() {
        this.scene.restart({ 
            levelId: this.currentLevel,
            upgradesManager: this.upgradesManager 
        });
    }
    
    returnToLevelSelect() {
        this.scene.start('LevelSelectScene');
    }
    
    loadTotalGold() {
        const savedGold = localStorage.getItem('paladinged_gold');
        return savedGold ? parseInt(savedGold) : 0;
    }
    
    saveTotalGold(amount) {
        localStorage.setItem('paladinged_gold', amount.toString());
    }
}