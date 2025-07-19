class DoorCard extends Card {
    constructor(scene, x, y) {
        super(scene, x, y, 'door');
        
        this.doorSprite = scene.add.image(0, 0, 'atlas_02', 'char_door.png');
        this.doorSprite.setScale(this.scaleVisual);
        this.add(this.doorSprite);
    }
    
    onPlayerInteraction(player) {
        this.scene.events.emit('levelComplete');
    }
}