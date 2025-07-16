class ShieldCard extends Card {
    constructor(scene, x, y, value = 3) {
        super(scene, x, y, 'shield');
        
        this.value = value;
        
        this.background.clear();
        this.background.fillStyle(0x95a5a6, 1);
        this.background.fillRoundedRect(-40, -40, 80, 80, 8);
        
        this.valueText = scene.add.text(0, 0, `S: ${this.value}`, {
            fontSize: '16px',
            color: '#ffffff'
        });
        this.valueText.setOrigin(0.5, 0.5);
        this.add(this.valueText);
    }
    
    onPlayerInteraction(player) {
        player.addShield(this.value);
        this.markForDestruction();
    }
}