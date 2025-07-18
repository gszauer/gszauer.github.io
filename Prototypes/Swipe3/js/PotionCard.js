
class PotionCard extends Card {
    constructor(scene, x, y, value = 5) {
        super(scene, x, y, 'potion');
        
        this.value = value;
        
        this.background.clear();
        
        this.potionSprite = scene.add.image(0, 0, 'atlas_02', 'char_potion.png');
        this.potionSprite.setScale(0.5);
        this.add(this.potionSprite);
        
        this.valueText = scene.add.text(0, 15, `${this.value}`, {
            fontSize: '35px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
        });
        this.valueText.setOrigin(0.5, 0.5);
        this.add(this.valueText);
    }
    
    onPlayerInteraction(player) {
        player.heal(this.value);
        this.markForDestruction();
    }
}