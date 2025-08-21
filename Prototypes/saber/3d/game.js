class Block extends Phaser.GameObjects.Container {
    constructor(scene, x, y, color, direction) {
        super(scene, x, y);
        
        this.color = color;
        this.direction = direction;
        this.startScale = 0.1;
        this.endScale = 1.5;
        this.duration = 5000;
        this.startTime = scene.time.now;
        this.progress = 0;
        
        const blockColor = color === 'red' ? 0xff0000 : 0x0000ff;
        this.block = scene.add.rectangle(0, 0, 80, 80, blockColor);
        this.add(this.block);
        
        const arrowGraphics = scene.add.graphics();
        arrowGraphics.lineStyle(3, 0xffffff, 1);
        
        switch(direction) {
            case 'up':
                arrowGraphics.moveTo(0, 15);
                arrowGraphics.lineTo(0, -15);
                arrowGraphics.lineTo(-10, -5);
                arrowGraphics.moveTo(0, -15);
                arrowGraphics.lineTo(10, -5);
                break;
            case 'down':
                arrowGraphics.moveTo(0, -15);
                arrowGraphics.lineTo(0, 15);
                arrowGraphics.lineTo(-10, 5);
                arrowGraphics.moveTo(0, 15);
                arrowGraphics.lineTo(10, 5);
                break;
            case 'left':
                arrowGraphics.moveTo(15, 0);
                arrowGraphics.lineTo(-15, 0);
                arrowGraphics.lineTo(-5, -10);
                arrowGraphics.moveTo(-15, 0);
                arrowGraphics.lineTo(-5, 10);
                break;
            case 'right':
                arrowGraphics.moveTo(-15, 0);
                arrowGraphics.lineTo(15, 0);
                arrowGraphics.lineTo(5, -10);
                arrowGraphics.moveTo(15, 0);
                arrowGraphics.lineTo(5, 10);
                break;
        }
        
        arrowGraphics.strokePath();
        this.add(arrowGraphics);
        
        this.setScale(this.startScale);
        scene.add.existing(this);
    }
    
    update(time) {
        const elapsed = time - this.startTime;
        this.progress = Math.min(elapsed / this.duration, 1);
        
        const scale = this.startScale + (this.endScale - this.startScale) * this.progress;
        this.setScale(scale);
        
        if (this.progress < 0.8) {
            this.block.setAlpha(0.4);
        } else {
            this.block.setAlpha(1);
        }
        
        if (this.progress >= 1) {
            this.destroy();
            return true;
        }
        return false;
    }
    
    isSliceable() {
        return this.progress >= 0.8;
    }
    
    getBounds() {
        const size = 80 * this.scaleX;
        return new Phaser.Geom.Rectangle(
            this.x - size / 2,
            this.y - size / 2,
            size,
            size
        );
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.blocks = [];
        this.gridPositions = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1200;
        this.score = 0;
        this.activePointers = new Map();
        this.swipeGraphics = null;
    }
    
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        const width = this.scale.width;
        const height = this.scale.height;
        const gridSize = 4;
        const cellWidth = width / (gridSize + 1);
        const cellHeight = height / (gridSize + 1);
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = cellWidth * (col + 1);
                const y = cellHeight * (row + 1);
                this.gridPositions.push({ x, y });
            }
        }
        
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x333333, 0.3);
        
        for (let i = 1; i <= gridSize; i++) {
            gridGraphics.moveTo(cellWidth * i, 0);
            gridGraphics.lineTo(cellWidth * i, height);
            gridGraphics.moveTo(0, cellHeight * i);
            gridGraphics.lineTo(width, cellHeight * i);
        }
        gridGraphics.strokePath();
        
        this.scoreText = this.add.text(width - 20, 20, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(1, 0);
        
        this.swipeGraphics = this.add.graphics();
        
        this.input.addPointer(9);
        
        this.input.on('pointerdown', (pointer) => {
            this.activePointers.set(pointer.id, {
                points: [{ x: pointer.x, y: pointer.y, time: this.time.now }],
                lastX: pointer.x,
                lastY: pointer.y
            });
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.activePointers.has(pointer.id)) {
                const pointerData = this.activePointers.get(pointer.id);
                pointerData.points.push({ x: pointer.x, y: pointer.y, time: this.time.now });
                if (pointerData.points.length > 20) {
                    pointerData.points.shift();
                }
                this.checkBlockCollisions(pointer.x, pointer.y, pointerData.points);
                pointerData.lastX = pointer.x;
                pointerData.lastY = pointer.y;
            }
        });
        
        this.input.on('pointerup', (pointer) => {
            this.activePointers.delete(pointer.id);
        });
    }
    
    update(time) {
        if (this.blocks.length < 5 && time - this.lastSpawnTime > this.spawnInterval) {
            this.spawnBlock();
            this.lastSpawnTime = time;
        }
        
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            if (this.blocks[i].update(time)) {
                this.blocks.splice(i, 1);
            }
        }
        
        this.swipeGraphics.clear();
        const currentTime = this.time.now;
        
        this.activePointers.forEach((pointerData, pointerId) => {
            pointerData.points = pointerData.points.filter(point => 
                currentTime - point.time < 300
            );
            
            if (pointerData.points.length > 1) {
                for (let i = 0; i < pointerData.points.length - 1; i++) {
                    const age = currentTime - pointerData.points[i].time;
                    const alpha = Math.max(0, 1 - age / 300);
                    this.swipeGraphics.lineStyle(4, 0xffff00, alpha);
                    this.swipeGraphics.moveTo(pointerData.points[i].x, pointerData.points[i].y);
                    this.swipeGraphics.lineTo(pointerData.points[i + 1].x, pointerData.points[i + 1].y);
                    this.swipeGraphics.strokePath();
                }
            }
        });
    }
    
    checkBlockCollisions(x, y, swipePoints) {
        if (swipePoints.length < 3) return;
        
        const swipeDirection = this.getSwipeDirection(swipePoints);
        if (!swipeDirection) return;
        
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (block.isSliceable()) {
                const bounds = block.getBounds();
                if (bounds.contains(x, y)) {
                    if (block.direction === swipeDirection) {
                        this.score += 100;
                        this.scoreText.setText('Score: ' + this.score);
                        block.destroy();
                        this.blocks.splice(i, 1);
                        
                        const flash = this.add.rectangle(block.x, block.y, 100, 100, 0xffffff, 0.5);
                        this.tweens.add({
                            targets: flash,
                            alpha: 0,
                            scale: 2,
                            duration: 300,
                            onComplete: () => flash.destroy()
                        });
                    }
                }
            }
        }
    }
    
    getSwipeDirection(swipePoints) {
        if (swipePoints.length < 3) return null;
        
        const startPoint = swipePoints[0];
        const endPoint = swipePoints[swipePoints.length - 1];
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        
        const minDistance = 30;
        if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) return null;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }
    
    spawnBlock() {
        const randomPosition = Phaser.Math.RND.pick(this.gridPositions);
        const colors = ['red', 'blue'];
        const directions = ['up', 'down', 'left', 'right'];
        const color = Phaser.Math.RND.pick(colors);
        const direction = Phaser.Math.RND.pick(directions);
        
        const block = new Block(this, randomPosition.x, randomPosition.y, color, direction);
        this.blocks.push(block);
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: GameScene
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});