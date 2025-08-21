import { GameConfig } from './GameConfig.js';
import { LevelData } from './LevelData.js';
import Monster from './Monster.js';
import WalkingMonster from './WalkingMonster.js';
import Obstacle from './Obstacle.js';
import ExitDoor from './ExitDoor.js';

export default class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevelId = 1;
        this.levelData = null;
        this.scrollSpeed = 300;
        this.scrollOffset = 0;
        this.spawnedEntities = [];
        this.gridDimensions = null;
        this.levelConfig = null;
    }
    
    loadLevel(levelId) {
        this.currentLevelId = levelId;
        this.levelData = LevelData.getLevel(levelId);
        
        if (!this.levelData) {
            throw new Error(`Level ${levelId} not found`);
        }
        
        this.gridDimensions = LevelData.getGridDimensions(levelId);
        this.levelConfig = this.mergeConfigs(GameConfig, this.levelData.config);
        this.scrollSpeed = this.levelConfig.scrollSpeed || 300;
        this.scrollOffset = 0;
        
        return this.levelConfig;
    }
    
    getWalkingMonsterConfig(row, col) {
        const monsterSpeeds = this.levelData.monsterSpeeds || {};
        const positionKey = `${row},${col}`;
        
        let speed = this.levelConfig.defaultWalkSpeed || 50;
        if (monsterSpeeds[positionKey]) {
            speed = monsterSpeeds[positionKey];
        }
        
        return {
            radius: this.levelConfig.entities.monster.radius,
            speed: speed
        };
    }
    
    generateEntities() {
        const entities = {
            monsters: [],
            obstacles: [],
            exitDoor: null
        };
        
        const laneWidth = this.scene.game.config.width / this.gridDimensions.lanes;
        const rowHeight = this.levelConfig.entities.player.radius;
        const levelHeight = this.gridDimensions.rows * rowHeight;
        
        for (let row = 0; row < this.gridDimensions.rows; row++) {
            const rowData = this.levelData.data[row];
            
            for (let col = 0; col < this.gridDimensions.lanes; col++) {
                const char = rowData[col];
                const x = col * laneWidth + laneWidth / 2;
                const y = -(levelHeight - (row * rowHeight + rowHeight / 2));
                
                if (char === 'M') {
                    const monsterConfig = this.levelConfig.entities.monster;
                    const monster = new Monster(this.scene, x, y, monsterConfig);
                    entities.monsters.push(monster);
                    this.spawnedEntities.push(monster);
                } else if (char === 'W') {
                    const walkingMonsterConfig = this.getWalkingMonsterConfig(row, col);
                    const walkingMonster = new WalkingMonster(this.scene, x, y, walkingMonsterConfig);
                    entities.monsters.push(walkingMonster);
                    this.spawnedEntities.push(walkingMonster);
                } else if (char === 'O') {
                    const obstacleConfig = this.levelConfig.entities.obstacle;
                    const obstacle = new Obstacle(this.scene, x, y, obstacleConfig);
                    entities.obstacles.push(obstacle);
                    this.spawnedEntities.push(obstacle);
                }
            }
        }
        
        const exitX = this.scene.game.config.width / 2;
        const exitY = -levelHeight + this.levelConfig.entities.exitDoor.size / 2;
        entities.exitDoor = new ExitDoor(this.scene, exitX, exitY, this.levelConfig.entities.exitDoor);
        this.spawnedEntities.push(entities.exitDoor);
        
        return entities;
    }
    
    update(delta) {
        this.scrollOffset += this.scrollSpeed * (delta / 1000);
        
        for (const entity of this.spawnedEntities) {
            if (entity && entity.active) {
                entity.y += this.scrollSpeed * (delta / 1000);
            }
        }
        
        this.spawnedEntities = this.spawnedEntities.filter(entity => entity && entity.active);
        
        return this.scrollOffset;
    }
    
    mergeConfigs(baseConfig, levelOverrides = {}) {
        const merged = JSON.parse(JSON.stringify(baseConfig));
        
        const merge = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        };
        
        merge(merged, levelOverrides);
        
        if (levelOverrides.playerHp) {
            merged.entities.player.startHp = levelOverrides.playerHp;
        }
        
        if (levelOverrides.scrollSpeed) {
            merged.scrollSpeed = levelOverrides.scrollSpeed;
        }
        
        return merged;
    }
    
    getTotalLevelHeight() {
        if (!this.gridDimensions || !this.levelConfig) return 0;
        return this.gridDimensions.rows * this.levelConfig.entities.player.radius;
    }
    
    isLevelComplete() {
        return this.scrollOffset >= this.getTotalLevelHeight();
    }
    
    reset() {
        this.scrollOffset = 0;
        for (const entity of this.spawnedEntities) {
            if (entity && entity.destroy) {
                entity.destroy();
            }
        }
        this.spawnedEntities = [];
    }
}