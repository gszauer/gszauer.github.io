import { createOBB } from './CollisionUtils.js';

export default class Hammer extends Phaser.GameObjects.Container {
    constructor(scene, player, config) {
        super(scene, 0, 0);
        
        this.player = player;
        this.config = config;
        this.hammerAngle = config.maxAngle;
        this.minAngle = config.minAngle;
        this.maxAngle = config.maxAngle;
        this.hammerLength = config.length;
        this.headWidth = config.headWidth;
        this.headHeight = config.headHeight;
        this.swinging = false;
        this.swingDirection = 1;
        this.swingTween = null;
        
        this.hammerGraphics = scene.add.graphics();
        this.add(this.hammerGraphics);
        
        this.obb = createOBB(0, 0, this.headWidth / 2, this.headHeight / 2, 0);
        
        scene.add.existing(this);
    }
    
    startSwing() {
        if (this.swinging) return;
        
        this.swinging = true;
        const targetAngle = this.swingDirection === 1 ? 
            this.minAngle : this.maxAngle;
        
        this.swingTween = this.scene.tweens.add({
            targets: this,
            hammerAngle: targetAngle,
            duration: this.config.swingDuration,
            ease: 'Power2',
            onComplete: () => {
                this.swinging = false;
                this.swingDirection *= -1;
            }
        });
    }
    
    update(time, delta) {
        this.x = this.player.x;
        this.y = this.player.y;
        
        const angleRad = Phaser.Math.DegToRad(this.hammerAngle - 90);
        const hammerX = Math.cos(angleRad) * this.hammerLength;
        const hammerY = Math.sin(angleRad) * this.hammerLength;
        
        this.obb.center.x = this.x + hammerX;
        this.obb.center.y = this.y + hammerY;
        this.obb.rotation = angleRad;
        
        this.render(hammerX, hammerY, angleRad);
    }
    
    render(hammerX, hammerY, angleRad) {
        this.hammerGraphics.clear();
        
        this.hammerGraphics.lineStyle(18, 0x8b4513);
        this.hammerGraphics.beginPath();
        this.hammerGraphics.moveTo(0, 0);
        this.hammerGraphics.lineTo(hammerX, hammerY);
        this.hammerGraphics.strokePath();
        
        this.hammerGraphics.save();
        this.hammerGraphics.translateCanvas(hammerX, hammerY);
        this.hammerGraphics.rotateCanvas(angleRad);
        this.hammerGraphics.fillStyle(0x8b4513);
        this.hammerGraphics.fillRect(
            -this.headWidth / 2,
            -this.headHeight / 2,
            this.headWidth,
            this.headHeight
        );
        this.hammerGraphics.restore();
    }
    
    getOBB() {
        return this.obb;
    }
    
    isSwinging() {
        return this.swinging;
    }
    
    stopSwing() {
        if (this.swingTween) {
            this.swingTween.stop();
            this.swingTween = null;
        }
        this.swinging = false;
    }
    
    reset() {
        this.stopSwing();
        this.hammerAngle = this.maxAngle;
        this.swingDirection = 1;
    }
}