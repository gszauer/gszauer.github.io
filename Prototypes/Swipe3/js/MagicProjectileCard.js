class MagicProjectileCard extends Card {
    constructor(scene, x, y, value = 3) {
        super(scene, x, y, 'magic');
        
        this.value = value;
        
        // Add magic sparkstone image (omnidirectional)
        this.magicImage = scene.add.image(0, 0, 'atlas_02', 'monster_sparkstone.png');
        this.magicImage.setOrigin(0.5, 0.5);
        this.magicImage.setScale(this.scaleVisual);
        this.add(this.magicImage);
        
        // Add weapon stamp icon
        this.weaponStamp = scene.add.image(-30, -44, 'atlas_02', 'stamp_fight.png');
        this.weaponStamp.setScale(0.35);
        this.add(this.weaponStamp);
        
        // Add value text
        this.valueText = scene.add.text(-30, -44, `${this.value}`, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
        });
        this.valueText.setOrigin(0.5, 0.5);
        this.add(this.valueText);
    }
    
    postTurn() {
        // Magic card is omnidirectional - no rotation needed
    }
    
    onPlayerInteraction(player) {
        // Play fire sound
        if (soundEffectsEnabled) {
            this.scene.sound.playAudioSprite('soundbank', 'fire');
        }
        
        // Fire projectiles in all 4 cardinal directions
        const directions = [
            { dx: 0, dy: -1 },  // up
            { dx: 1, dy: 0 },   // right
            { dx: 0, dy: 1 },   // down
            { dx: -1, dy: 0 }   // left
        ];
        
        directions.forEach(vector => {
            this.scene.events.emit('fireProjectile', {
                startX: this.gridX,
                startY: this.gridY,
                dx: vector.dx,
                dy: vector.dy,
                damage: this.value,
                sprite: 'projectile_fireball.png'
            });
        });
        
        this.markForDestruction();
    }
}