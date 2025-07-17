class ProjectileCard extends Card {
    constructor(scene, x, y, value = 3, startDirection = 0) {
        super(scene, x, y, 'projectile');
        
        this.value = value;
        this.currentDirection = startDirection; // 0=up, 1=right, 2=down, 3=left
        
        this.background.clear();
        this.background.fillStyle(0x9b59b6, 1);
        this.background.fillRoundedRect(-40, -60, 80, 120, 8);
        
        this.directionText = scene.add.text(0, 0, this.getDirectionSymbol(), {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        });
        this.directionText.setOrigin(0.5, 0.5);
        this.add(this.directionText);
    }
    
    getDirectionSymbol() {
        const symbols = ['^', '>', 'v', '<']; // up, right, down, left
        return `Shooter\n${this.value}  ${symbols[this.currentDirection]}`;
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
        this.directionText.setText(this.getDirectionSymbol());
    }
    
    onPlayerInteraction(player) {
        const vector = this.getDirectionVector();
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