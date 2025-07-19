class Card extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type) {
        super(scene, x, y);
        this.type = type;
        this.gridX = 0;
        this.gridY = 0;
        this.requestDestroy = false;
        this.scaleVisual = 0.58;
        
        scene.add.existing(this);
    }
    
    setGridPosition(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
    }
    
    animateMoveTo(x, y, duration = 500, onComplete = null) {
        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            duration: duration,
            ease: 'Power2',
            onComplete: onComplete
        });
    }
    
    fadeIn(delay = 100) {
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200,
            delay: delay
        });
    }
    
    markForDestruction() {
        this.requestDestroy = true;
    }
    
    preTurn() {
    }
    
    postTurn() {
    }
    
    onPlayerInteraction(player) {
    }
}