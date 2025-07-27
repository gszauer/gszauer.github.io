class ProjectileCard extends Card {
    constructor(scene, x, y, value = 3, startDirection = 0) {
        super(scene, x, y, 'projectile');
        
        this.value = value;
        this.currentDirection = startDirection; // 0=up, 1=right, 2=down, 3=left
        
        // Add crossbow background image based on direction
        this.crossbowImage = scene.add.image(0, 0, 'atlas_02', this.getCrossbowImageName());
        this.crossbowImage.setOrigin(0.5, 0.5);
        this.crossbowImage.setScale(this.scaleVisual);
        this.add(this.crossbowImage);
        
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
    
    getCrossbowImageName() {
        const imageNames = [
            'crossbow_up_loaded.png',    // 0 = up
            'crossbow_right_loaded.png', // 1 = right
            'crossbow_down_loaded.png',  // 2 = down
            'crossbow_left_loaded.png'   // 3 = left
        ];
        return imageNames[this.currentDirection];
    }
    
    getDirectionVector() {
        const vectors = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];
        return vectors[this.currentDirection];
    }
    
    postTurn() {
        // Rotate clockwise
        this.currentDirection = (this.currentDirection + 1) % 4;
        // Update the crossbow image
        this.crossbowImage.setFrame(this.getCrossbowImageName());
    }
    
    onPlayerInteraction(player) {
        const vector = this.getDirectionVector();
        if (soundEffectsEnabled) {
            this.scene.sound.playAudioSprite('soundbank', 'arrow');
        }
        this.scene.events.emit('fireProjectile', {
            startX: this.gridX,
            startY: this.gridY,
            dx: vector.dx,
            dy: vector.dy,
            damage: this.value
        });
        
        this.markForDestruction();
    }
}