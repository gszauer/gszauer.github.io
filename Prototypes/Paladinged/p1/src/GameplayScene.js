import { GameConfig } from './GameConfig.js';
import Player from './Player.js';
import Hammer from './Hammer.js';
import CollisionManager from './CollisionManager.js';
import LevelManager from './LevelManager.js';
import UIManager from './UIManager.js';
import InputManager from './InputManager.js';
import PhysicsManager from './PhysicsManager.js';

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameplayScene' });
    }
    
    init(data) {
        this.currentLevel = data.levelId || 1;
        this.gameState = 'playing';
        this.gold = 0;
    }
    
    create() {
        this.levelManager = new LevelManager(this);
        const levelConfig = this.levelManager.loadLevel(this.currentLevel);
        
        this.collisionManager = new CollisionManager(this);
        this.uiManager = new UIManager(this);
        this.inputManager = new InputManager(this);
        this.physicsManager = new PhysicsManager(this, levelConfig);
        
        this.gridGraphics = this.add.graphics();
        
        const playerX = this.game.config.width / 2;
        const playerY = this.game.config.height - levelConfig.entities.player.radius - levelConfig.entities.player.padding;
        this.player = new Player(this, playerX, playerY, levelConfig.entities.player);
        
        this.hammer = new Hammer(this, this.player, levelConfig.hammer);
        
        const entities = this.levelManager.generateEntities();
        this.monsters = entities.monsters;
        this.obstacles = entities.obstacles;
        this.exitDoor = entities.exitDoor;
        
        this.uiManager.create(levelConfig);
        this.uiManager.updateHealth(this.player.hp, this.player.maxHp);
        this.uiManager.updateGold(this.gold);
        this.uiManager.updateLevel(this.levelManager.levelData.name);
        
        this.inputManager.create();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.events.on('hammerSwing', () => {
            if (this.gameState === 'playing') {
                this.hammer.startSwing();
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
            this.gold += goldValue;
            this.uiManager.updateGold(this.gold);
        });
        
        this.events.on('monsterObstacleCombo', () => {
            this.gold += this.levelManager.levelConfig.rewards.monsterObstacleCombo;
            this.uiManager.updateGold(this.gold);
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
        
        for (const monster of this.monsters) {
            monster.update(time, delta);
        }
        
        this.collisionManager.checkCollisions(
            this.player,
            this.hammer,
            this.monsters,
            this.obstacles,
            this.exitDoor
        );
        
        this.uiManager.updateHealth(this.player.hp, this.player.maxHp);
        
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
        this.uiManager.showGameOver();
        
        this.time.delayedCall(500, () => {
            this.inputManager.setEnabled(true);
        });
    }
    
    win() {
        this.gameState = 'win';
        this.inputManager.setEnabled(false);
        this.uiManager.showWin(this.gold);
        
        this.saveProgress();
        
        this.time.delayedCall(500, () => {
            this.inputManager.setEnabled(true);
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
        this.scene.restart({ levelId: this.currentLevel });
    }
    
    returnToLevelSelect() {
        this.scene.start('LevelSelectScene');
    }
}