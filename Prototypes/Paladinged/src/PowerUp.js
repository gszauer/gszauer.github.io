export default class PowerUp extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type) {
        super(scene, x, y);
        
        this.type = type; // 'spell1' (fireball), 'spell2' (ice shield), or 'spell3' (gold touch)
        this.radius = 30;
        this.collected = false;
        
        // Create the yellow circle visual
        this.circle = scene.add.circle(0, 0, this.radius, 0xFFD700);
        this.add(this.circle);
        
        // Add icon or text to indicate spell type
        const iconMap = {
            'spell1': '🔥',  // Fireball
            'spell2': '❄️',   // Ice Shield
            'spell3': '💰'   // Gold Touch
        };
        
        this.icon = scene.add.text(0, 0, iconMap[type] || '✨', {
            fontSize: '24px'
        });
        this.icon.setOrigin(0.5);
        this.add(this.icon);
        
        // Add pulsing animation
        scene.tweens.add({
            targets: this.circle,
            scaleX: 1.1,
            scaleY: 1.1,
            alpha: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        scene.add.existing(this);
    }
    
    collect() {
        if (this.collected) return false;
        
        this.collected = true;
        
        // Collection animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });
        
        return true;
    }
    
    getCollisionBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }
    
}