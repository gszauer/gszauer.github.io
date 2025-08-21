export default class Monster extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        
        this.config = config;
        this.state = 'idle';
        this.velocityX = 0;
        this.velocityY = 0;
        this.bounceSpeed = config.bounceSpeed || 1500;
        this.monsterType = 'basic';
        this.radius = config.radius;
        
        this.monsterCircle = scene.add.circle(0, 0, this.radius, 0xff0000);
        this.add(this.monsterCircle);
        
        scene.add.existing(this);
    }
    
    update(time, delta) {
        if (this.state === 'bouncing') {
            this.x += this.velocityX * (delta / 1000);
            this.y += this.velocityY * (delta / 1000);
            
            this.checkOutOfBounds();
        }
    }
    
    setBouncing(velocityX, velocityY) {
        this.state = 'bouncing';
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }
    
    checkOutOfBounds() {
        const padding = 100;
        if (this.x < -padding || this.x > this.scene.game.config.width + padding ||
            this.y < -padding || this.y > this.scene.game.config.height + padding) {
            this.destroy();
        }
    }
    
    onHit() {
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