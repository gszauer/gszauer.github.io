class TrapToggleCard extends Card {
    constructor(scene, x, y, value = 3, state = 'sharp') {
        super(scene, x, y, 'trap');
        
        this.value = value;
        this.state = state;
        
        this.background.clear();
        this.background.fillStyle(0x34495e, 1);
        this.background.fillRoundedRect(-40, -40, 80, 80, 8);
        
        this.stateText = scene.add.text(0, 0, this.getStateSymbol(), {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center' 
        });
        this.stateText.setOrigin(0.5, 0.5);
        this.add(this.stateText);
    }
    
    getStateSymbol() {
        return `Trap\n${this.state === 'sharp' ? '^' : '_'}`;
    }
    
    postTurn() {
        this.state = this.state === 'sharp' ? 'dull' : 'sharp';
        this.stateText.setText(this.getStateSymbol());
    }
    
    onPlayerInteraction(player) {
        if (this.state === 'sharp') {
            player.takeDamage(this.value);
        }
        this.markForDestruction();
    }
}