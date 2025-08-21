export default class WalkingMonster extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        
        this.config = config;
        this.state = 'idle';
        this.radius = config.radius;
        this.speed = config.speed || 50;
        this.hasStartedWalking = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.bounceSpeed = 1500;
        
        this.monsterCircle = scene.add.circle(0, 0, this.radius, 0x9932CC);
        this.add(this.monsterCircle);
        
        this.typeText = scene.add.text(0, 0, 'W', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.typeText);
        
        scene.add.existing(this);
    }
    
    update(time, delta) {
        if (!this.active) return;
        
        if (this.state === 'bouncing') {
            this.x += this.velocityX * (delta / 1000);
            this.y += this.velocityY * (delta / 1000);
        } else {
            if (!this.hasStartedWalking && this.isOnScreen()) {
                this.hasStartedWalking = true;
                this.state = 'walking';
            }
            
            if (this.state === 'walking' && this.scene.player && this.scene.player.active) {
                this.moveTowardsPlayer(delta);
            }
        }
        
        this.checkOutOfBounds();
    }
    
    moveTowardsPlayer(delta) {
        const player = this.scene.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.radius + player.radius) {
            // Calculate movement toward player (delta is in ms, speed is in pixels/second)
            const moveX = (dx / distance) * this.speed * (delta / 1000);
            const moveY = (dy / distance) * this.speed * (delta / 1000);
            
            const newX = this.x + moveX;
            const newY = this.y + moveY;
            
            // First, push away from any overlapping entities
            this.separateFromOverlaps();
            
            // Then try to move toward player
            if (!this.checkCollisions(newX, newY)) {
                this.x = newX;
                this.y = newY;
            } else {
                // Try to slide along obstacles
                const canMoveX = !this.checkCollisions(newX, this.y);
                const canMoveY = !this.checkCollisions(this.x, newY);
                
                if (canMoveX) {
                    this.x = newX;
                } 
                if (canMoveY) {
                    this.y = newY;
                }
                
                // If completely blocked, try perpendicular movement to get around obstacle
                if (!canMoveX && !canMoveY) {
                    // Try moving perpendicular to the intended direction
                    const perpX1 = -moveY;  // 90 degrees clockwise
                    const perpY1 = moveX;
                    const perpX2 = moveY;   // 90 degrees counter-clockwise
                    const perpY2 = -moveX;
                    
                    if (!this.checkCollisions(this.x + perpX1, this.y + perpY1)) {
                        this.x += perpX1 * 0.5;
                        this.y += perpY1 * 0.5;
                    } else if (!this.checkCollisions(this.x + perpX2, this.y + perpY2)) {
                        this.x += perpX2 * 0.5;
                        this.y += perpY2 * 0.5;
                    }
                }
            }
        }
    }
    
    separateFromOverlaps() {
        const separationForce = 2;
        
        if (this.scene.monsters) {
            for (const monster of this.scene.monsters) {
                if (monster !== this && monster.active && !monster.isBouncing()) {
                    const dx = this.x - monster.x;
                    const dy = this.y - monster.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = this.radius + monster.radius;
                    
                    if (distance < minDistance && distance > 0) {
                        // Push away from overlapping monster
                        const pushX = (dx / distance) * separationForce;
                        const pushY = (dy / distance) * separationForce;
                        this.x += pushX;
                        this.y += pushY;
                    }
                }
            }
        }
    }
    
    checkCollisions(newX, newY) {
        const checkRadius = this.radius;
        
        // Only check collisions with other monsters, not obstacles
        if (this.scene.monsters) {
            for (const monster of this.scene.monsters) {
                if (monster !== this && monster.active) {
                    const dx = newX - monster.x;
                    const dy = newY - monster.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = checkRadius + monster.radius;
                    
                    if (distance < minDistance) {
                        return true;
                    }
                }
            }
        }
        
        // WalkingMonsters can walk through obstacles
        
        return false;
    }
    
    isOnScreen() {
        const padding = this.radius;
        return this.y > -padding && 
               this.y < this.scene.game.config.height + padding &&
               this.x > -padding && 
               this.x < this.scene.game.config.width + padding;
    }
    
    checkOutOfBounds() {
        const padding = 200;
        if (this.state === 'bouncing') {
            // Don't check upper bound (y < -padding) since monsters spawn above the screen
            if (this.x < -padding || this.x > this.scene.game.config.width + padding ||
                this.y > this.scene.game.config.height + padding) {
                this.destroy();
            }
        } else {
            if (this.y > this.scene.game.config.height + padding) {
                this.destroy();
            }
        }
    }
    
    setBouncing(velocityX, velocityY) {
        this.state = 'bouncing';
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }
    
    onHit() {
        // WalkingMonsters bounce when hit, just like regular monsters
        // The setBouncing is called by CollisionManager when hit by hammer
    }
    
    onCollideWithPlayer(player) {
        player.takeDamage(1);
        this.destroy();
    }
    
    getCollisionBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }
    
    isBouncing() {
        return this.state === 'bouncing';
    }
}