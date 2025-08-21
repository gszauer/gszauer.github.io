export default class Obstacle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        
        this.scene = scene;  // Store scene reference
        this.config = config;
        this.goldValue = config.goldValue || 5;
        this.durability = config.durability || 1;
        this.radius = config.radius;
        
        this.obstacleCircle = scene.add.circle(0, 0, this.radius, 0x0000ff);
        this.add(this.obstacleCircle);
        
        scene.add.existing(this);
    }
    
    hit() {
        this.durability--;
        
        if (this.durability <= 0) {
            this.scene.tweens.add({
                targets: this,
                scaleX: 0,
                scaleY: 0,
                duration: 200,
                onComplete: () => {
                    this.destroy();
                }
            });
        }
    }
    
    isDestroyed() {
        return this.durability <= 0;
    }
    
    getGoldValue() {
        return this.goldValue;
    }
    
    getCollisionBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }
}