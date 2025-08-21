export default class Player extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config, bonusHp = 0) {
        super(scene, x, y);
        
        this.config = config;
        this.bonusHp = bonusHp;
        this.baseHp = config.startHp;
        this.maxHp = this.baseHp + this.bonusHp;
        this.hp = this.maxHp;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.radius = config.radius;
        
        this.playerCircle = scene.add.circle(0, 0, this.radius, 0x00ff00);
        this.add(this.playerCircle);
        
        scene.add.existing(this);
    }
    
    takeDamage(amount) {
        if (this.invulnerable) return false;
        
        this.hp -= amount;
        this.invulnerable = true;
        this.invulnerabilityTimer = this.config.invulnerabilityTime;
        
        this.scene.tweens.add({
            targets: this.playerCircle,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.playerCircle.alpha = 1;
            }
        });
        
        return true;
    }
    
    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    }
    
    update(time, delta) {
        if (this.invulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }
    }
    
    isAlive() {
        return this.hp > 0;
    }
    
    getCollisionBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }
    
    reset() {
        this.hp = this.maxHp;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.playerCircle.alpha = 1;
    }
}