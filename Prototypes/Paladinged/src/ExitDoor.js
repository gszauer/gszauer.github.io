export default class ExitDoor extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        
        this.config = config;
        this.size = config.size;
        this.triggered = false;
        
        this.doorRect = scene.add.rectangle(0, 0, this.size, this.size, 0x00ff00);
        this.add(this.doorRect);
        
        scene.add.existing(this);
    }
    
    checkPlayerCollision(player) {
        if (this.triggered) return false;
        
        const playerBounds = player.getCollisionBounds();
        
        if (this.y > playerBounds.y - playerBounds.radius &&
            this.y < playerBounds.y + playerBounds.radius &&
            Math.abs(this.x - playerBounds.x) < this.size) {
            this.triggered = true;
            return true;
        }
        
        return false;
    }
    
    getCollisionBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
    
    reset() {
        this.triggered = false;
    }
}