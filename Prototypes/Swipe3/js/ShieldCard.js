class ShieldCard extends Card {
    constructor(scene, x, y, value = 3) {
        super(scene, x, y, 'shield');
        
        this.value = value;
        
        this.shieldSprite = scene.add.image(0, 0, 'atlas_02', 'char_chield.png');
        this.shieldSprite.setScale(this.scaleVisual);
        this.add(this.shieldSprite);
        
        this.valueText = scene.add.text(-1, 2, `${this.value}`, {
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
        if (soundEffectsEnabled) {
            this.scene.sound.playAudioSprite('soundbank', 'shield');
        }
        player.addShield(this.value);
        this.markForDestruction();
    }
}