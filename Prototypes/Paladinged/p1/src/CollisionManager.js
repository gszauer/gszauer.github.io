import { circleCircleCollision, obbCircleCollision } from './CollisionUtils.js';

export default class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }
    
    checkCollisions(player, hammer, monsters, obstacles, exitDoor) {
        this.checkPlayerExitCollision(player, exitDoor);
        
        this.checkMonsterPlayerCollisions(monsters, player);
        
        if (hammer.isSwinging()) {
            this.checkHammerMonsterCollisions(hammer, monsters);
            this.checkHammerObstacleCollisions(hammer, obstacles);
        }
        
        this.checkMonsterMonsterCollisions(monsters);
        
        this.checkMonsterObstacleCollisions(monsters, obstacles);
    }
    
    checkPlayerExitCollision(player, exitDoor) {
        if (exitDoor.checkPlayerCollision(player)) {
            this.scene.events.emit('levelComplete');
        }
    }
    
    checkMonsterPlayerCollisions(monsters, player) {
        for (let i = monsters.length - 1; i >= 0; i--) {
            const monster = monsters[i];
            if (!monster.isBouncing()) {
                const monsterBounds = monster.getCollisionBounds();
                const playerBounds = player.getCollisionBounds();
                
                if (circleCircleCollision(monsterBounds, playerBounds)) {
                    monster.onCollideWithPlayer(player);
                    if (!player.isAlive()) {
                        this.scene.events.emit('gameOver');
                    }
                }
            }
        }
    }
    
    checkHammerMonsterCollisions(hammer, monsters) {
        const hammerOBB = hammer.getOBB();
        
        for (let i = monsters.length - 1; i >= 0; i--) {
            const monster = monsters[i];
            if (!monster.isBouncing()) {
                const monsterBounds = monster.getCollisionBounds();
                
                if (obbCircleCollision(hammerOBB, monsterBounds)) {
                    const dx = monsterBounds.x - hammerOBB.center.x;
                    const dy = monsterBounds.y - hammerOBB.center.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    let velocityX, velocityY;
                    if (dist > 0) {
                        velocityX = (dx / dist) * this.scene.physicsManager.knockbackForce;
                        velocityY = (dy / dist) * this.scene.physicsManager.knockbackForce - this.scene.physicsManager.knockbackBias;
                    } else {
                        velocityX = this.scene.physicsManager.knockbackForce;
                        velocityY = -this.scene.physicsManager.knockbackBias;
                    }
                    
                    monster.setBouncing(velocityX, velocityY);
                    monster.onHit();
                }
            }
        }
    }
    
    checkHammerObstacleCollisions(hammer, obstacles) {
        const hammerOBB = hammer.getOBB();
        
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            const obstacleBounds = obstacle.getCollisionBounds();
            
            if (obbCircleCollision(hammerOBB, obstacleBounds)) {
                obstacle.hit();
                if (obstacle.isDestroyed()) {
                    this.scene.events.emit('obstacleDestroyed', obstacle.getGoldValue());
                }
            }
        }
    }
    
    checkMonsterMonsterCollisions(monsters) {
        for (let i = 0; i < monsters.length; i++) {
            const monster1 = monsters[i];
            if (!monster1.isBouncing()) continue;
            
            for (let j = 0; j < monsters.length; j++) {
                if (i === j) continue;
                const monster2 = monsters[j];
                
                if (!monster2.isBouncing()) {
                    const bounds1 = monster1.getCollisionBounds();
                    const bounds2 = monster2.getCollisionBounds();
                    
                    if (circleCircleCollision(bounds1, bounds2)) {
                        const dx = bounds2.x - bounds1.x;
                        const dy = bounds2.y - bounds1.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        let velocityX, velocityY;
                        if (dist > 0) {
                            velocityX = (dx / dist) * this.scene.physicsManager.knockbackForce;
                            velocityY = (dy / dist) * this.scene.physicsManager.knockbackForce - this.scene.physicsManager.knockbackBias;
                        } else {
                            velocityX = this.scene.physicsManager.knockbackForce;
                            velocityY = -this.scene.physicsManager.knockbackBias;
                        }
                        
                        monster2.setBouncing(velocityX, velocityY);
                    }
                }
            }
        }
    }
    
    checkMonsterObstacleCollisions(monsters, obstacles) {
        for (let i = monsters.length - 1; i >= 0; i--) {
            const monster = monsters[i];
            if (!monster.isBouncing()) continue;
            
            const monsterBounds = monster.getCollisionBounds();
            
            for (let j = obstacles.length - 1; j >= 0; j--) {
                const obstacle = obstacles[j];
                
                // Skip obstacles that are already destroyed (hit by hammer this frame)
                if (obstacle.isDestroyed()) continue;
                
                const obstacleBounds = obstacle.getCollisionBounds();
                
                if (circleCircleCollision(monsterBounds, obstacleBounds)) {
                    // Only destroy the obstacle, not the monster
                    obstacle.destroy();
                    this.scene.events.emit('obstacleDestroyed', obstacle.getGoldValue());
                }
            }
        }
    }
}