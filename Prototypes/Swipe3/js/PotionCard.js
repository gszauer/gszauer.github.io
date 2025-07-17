class PotionCard extends Card {
    constructor(scene, x, y, value = 5) {
        super(scene, x, y, 'potion');
        
        this.value = value;
        
        this.background.clear();
        this.background.fillStyle(0x27ae60, 1);
        this.background.fillRoundedRect(-40, -60, 80, 120, 8);
        
        this.valueText = scene.add.text(0, 0, `Potion\n${this.value}`, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center' 
        });
        this.valueText.setOrigin(0.5, 0.5);
        this.add(this.valueText);
    }
    
    onPlayerInteraction(player) {
        player.heal(this.value);
        this.markForDestruction();
    }
}