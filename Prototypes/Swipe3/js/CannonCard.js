class CannonCard extends Card {
    constructor(scene, x, y, value = 3, direction = 0) {
        super(scene, x, y, 'cannon');
        
        this.value = value;
        this.direction = direction; // 0=up, 1=right, 2=down, 3=left
        
        // Add cannon background image based on direction
        this.cannonImage = scene.add.image(0, 0, 'atlas_02', this.getCannonImageName());
        this.cannonImage.setOrigin(0.5, 0.5);
        this.cannonImage.setScale(this.scaleVisual);
        this.add(this.cannonImage);
    }
    
    getCannonImageName() {
        const imageNames = [
            'cannon_up.png',    // 0 = up
            'cannon_right.png', // 1 = right
            'cannon_down.png',  // 2 = down
            'cannon_left.png'   // 3 = left
        ];
        return imageNames[this.direction];
    }
    
    getDirectionVector() {
        const vectors = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];
        return vectors[this.direction];
    }
    
    postTurn() {
        // Cannon is static - it doesn't rotate after turns
    }
    
    onPlayerInteraction(player) {
        const vector = this.getDirectionVector();
        if (soundEffectsEnabled) {
            this.scene.sound.playAudioSprite('soundbank', 'cannon');
        }
        this.scene.events.emit('fireProjectile', {
            startX: this.gridX,
            startY: this.gridY,
            dx: vector.dx,
            dy: vector.dy,
            damage: this.value,
            sprite: 'cannonball.png'
        });
        
        this.markForDestruction();
    }
}