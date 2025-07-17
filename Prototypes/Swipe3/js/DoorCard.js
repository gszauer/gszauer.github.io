class DoorCard extends Card {
    constructor(scene, x, y) {
        super(scene, x, y, 'door');
        
        this.background.clear();
        this.background.fillStyle(0xf39c12, 1);
        this.background.fillRoundedRect(-40, -60, 80, 120, 8);
        
        this.labelText = scene.add.text(0, 0, 'door', {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center' 
        });
        this.labelText.setOrigin(0.5, 0.5);
        this.add(this.labelText);
    }
    
    onPlayerInteraction(player) {
        this.scene.events.emit('levelComplete');
    }
}