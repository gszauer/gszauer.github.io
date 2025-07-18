class Projectile extends Phaser.GameObjects.Container {
    constructor(scene, data) {
        const { startX, startY, dx, dy, damage } = data;
        
        // Get starting position from grid
        const startTile = scene.gameGrid.tiles[startY][startX];
        const x = startTile.x * scene.gameGrid.scaleX + scene.gameGrid.x;
        const y = startTile.y * scene.gameGrid.scaleY + scene.gameGrid.y;
        
        super(scene, x, y);
        
        this.scene = scene;
        this.startX = startX;
        this.startY = startY;
        this.dx = dx;
        this.dy = dy;
        this.damage = damage;
        this.gameGrid = scene.gameGrid;
        
        // Create projectile visual
        this.projectileGraphic = scene.add.graphics();
        this.projectileGraphic.fillStyle(0xffff00, 1);
        this.projectileGraphic.fillCircle(0, 0, 10);
        this.add(this.projectileGraphic);
        
        scene.add.existing(this);
        
        // Find target and animate
        this.findTargetAndFire();
    }
    
    findTargetAndFire() {
        // Find target monster in the projectile's path
        let targetX = this.startX + this.dx;
        let targetY = this.startY + this.dy;
        let targetMonster = null;
        let targetTile = null;
        
        while (targetX >= 0 && targetX < this.gameGrid.gridWidth &&
               targetY >= 0 && targetY < this.gameGrid.gridHeight) {
            const tile = this.gameGrid.tiles[targetY][targetX];
            if (tile.card && tile.card.type === 'monster') {
                targetMonster = tile.card;
                targetTile = tile;
                break;
            }
            targetX += this.dx;
            targetY += this.dy;
        }
        
        // Calculate final position and duration
        let finalX, finalY;
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const baseSpeed = screenWidth / 500; // 0.5 seconds to cross screen width
        
        if (targetTile) {
            // Go to monster position
            finalX = targetTile.x * this.gameGrid.scaleX + this.gameGrid.x;
            finalY = targetTile.y * this.gameGrid.scaleY + this.gameGrid.y;
        } else {
            // Calculate off-screen position - just barely off screen
            const projectileRadius = 10; // Size of the projectile circle
            
            if (this.dx !== 0) {
                // Horizontal movement
                finalX = this.dx > 0 ? 
                    screenWidth + projectileRadius :
                    -projectileRadius;
                finalY = this.y;
            } else {
                // Vertical movement  
                finalX = this.x;
                finalY = this.dy > 0 ?
                    screenHeight + projectileRadius :
                    -projectileRadius;
            }
        }
        
        // Calculate distance and duration
        const distance = Math.sqrt(
            Math.pow(finalX - this.x, 2) + 
            Math.pow(finalY - this.y, 2)
        );
        const duration = (distance / baseSpeed);
        
        // Create single tween to target
        this.scene.tweens.add({
            targets: this,
            x: finalX,
            y: finalY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                if (targetMonster) {
                    this.onHitMonster(targetMonster);
                }
                this.destroy();
            }
        });
    }
    
    onHitMonster(monster) {
        monster.takeDamage(this.damage);
        
        // Check if monster was killed and update win progress
        if (monster.requestDestroy && this.gameGrid.winCondition && 
            this.gameGrid.winCondition.type === 'kill') {
            this.gameGrid.winProgress++;
            this.scene.updateWinConditionDisplay();
            this.gameGrid.checkWinCondition();
        }
        
        // Destroy marked cards and spawn new ones
        this.gameGrid.destroyMarkedCards();
        this.gameGrid.spawnCardsOnEmptyTiles();
    }
}