class DirtCard extends Card {
    constructor(scene, x, y) {
        super(scene, x, y, 'dirt');
        
        // Add dirt card image
        this.dirtImage = scene.add.image(0, 0, 'atlas_02', 'card_dirt.png');
        this.dirtImage.setOrigin(0.5, 0.5);
        this.dirtImage.setScale(this.scaleVisual);
        this.add(this.dirtImage);
    }
    
    onPlayerInteraction(player) {
        this.markForDestruction();
    }
}