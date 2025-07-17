class TrapToggleCard extends Card {
    constructor(scene, x, y, value = 3, state = 'sharp') {
        super(scene, x, y, 'trap');
        
        this.value = value;
        this.state = state;
        
        this.background.clear();
        
        this.trapSprite = scene.add.image(0, 0, 'atlas_02', state === 'sharp' ? 'char_trap_b.png' : 'char_trap_a.png');
        this.trapSprite.setScale(0.5);
        this.add(this.trapSprite);
        
        this.stateText = scene.add.text(0, 0, `${this.value}`, {
            fontSize: '35px',
            color: '#000000',
            fontStyle: 'bold',
            align: 'center'
        });
        this.stateText.setOrigin(0.5, 0.5);
        this.add(this.stateText);
    }
    
    postTurn() {
        this.state = this.state === 'sharp' ? 'dull' : 'sharp';
        this.stateText.setText(`${this.value}`);
        this.trapSprite.setFrame(this.state === 'sharp' ? 'char_trap_b.png' : 'char_trap_a.png');
    }
    
    onPlayerInteraction(player) {
        if (this.state === 'sharp') {
            player.takeDamage(this.value);
        }
        this.markForDestruction();
    }
}