export default class Projectile extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.speed = 600; // pixels per second
        this.width = scene.game.config.width; // Full width of play field
        this.height = 25;
        this.active = true;
        
        // Create the projectile visual (orange-red rectangle for fireball)
        this.rect = scene.add.rectangle(0, 0, this.width, this.height, 0xFF4500, 0.8);
        this.add(this.rect);
        
        // Add flame particles effect
        const particles = scene.add.particles(0, 0, 'flares', {
            frame: 'white',
            color: [0xfacc22, 0xf89800, 0xf83600, 0x9c2a2a],
            colorEase: 'quad.out',
            lifespan: 300,
            scale: { start: 0.3, end: 0, ease: 'sine.out' },
            speed: { min: 50, max: 150 },
            advance: 2000,
            frequency: 30,
            blendMode: 'ADD',
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Rectangle(-this.width/2, -this.height/2, this.width, this.height),
                quantity: 48,
                yoyo: false
            }
        });
        
        // If particles texture doesn't exist, create simple visual fallback
        if (!scene.textures.exists('flares')) {
            particles.destroy();
            // Add simple flame effect
            this.flame1 = scene.add.rectangle(-this.width/3, 0, 20, this.height * 0.8, 0xFFAA00, 0.5);
            this.flame2 = scene.add.rectangle(0, 0, 20, this.height * 0.8, 0xFF6600, 0.5);
            this.flame3 = scene.add.rectangle(this.width/3, 0, 20, this.height * 0.8, 0xFFAA00, 0.5);
            this.add([this.flame1, this.flame2, this.flame3]);
            
            // Animate flames
            scene.tweens.add({
                targets: [this.flame1, this.flame2, this.flame3],
                scaleY: 1.2,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: -1
            });
        } else {
            this.add(particles);
        }
        
        scene.add.existing(this);
    }
    
    update(delta) {
        if (!this.active) return;
        
        // Move projectile upward
        this.y -= this.speed * delta / 1000;
        
        // Destroy if off screen
        if (this.y < -this.height) {
            this.deactivate();
        }
    }
    
    getCollisionBounds() {
        return {
            x: this.x - this.width/2,
            y: this.y - this.height/2,
            width: this.width,
            height: this.height
        };
    }
    
    checkCollisionWithCircle(entity) {
        if (!this.active || !entity) return false;
        
        const bounds = this.getCollisionBounds();
        const entityBounds = entity.getCollisionBounds();
        
        // Rectangle vs Circle collision
        const closestX = Math.max(bounds.x, Math.min(entityBounds.x, bounds.x + bounds.width));
        const closestY = Math.max(bounds.y, Math.min(entityBounds.y, bounds.y + bounds.height));
        
        const distanceX = entityBounds.x - closestX;
        const distanceY = entityBounds.y - closestY;
        
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (entityBounds.radius * entityBounds.radius);
    }
    
    deactivate() {
        this.active = false;
        this.destroy();
    }
}