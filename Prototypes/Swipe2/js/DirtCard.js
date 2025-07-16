class DirtCard extends Card {
    constructor(scene, x, y) {
        super(scene, x, y, 'dirt');
        
        this.background.clear();
        this.background.fillStyle(0x8b4513, 1);
        this.background.fillRoundedRect(-40, -40, 80, 80, 8);
        
        this.labelText = scene.add.text(0, 0, 'dirt', {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center' 
        });
        this.labelText.setOrigin(0.5, 0.5);
        this.add(this.labelText);
    }
    
    onPlayerInteraction(player) {
        this.markForDestruction();
    }
}