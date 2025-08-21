class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.levelConfig = {
            lanes: 7,
            rows: 24,
            scrollSpeed: 300,
            playerRadius: 100,
            playerPadding: 10,
            hammerLength: 200,
            hammerHeadWidth: 70,
            hammerHeadHeight: 140,
            hammerMinAngle: -90,
            hammerMaxAngle: 90,
            monsterRadius: 60,
            obstacleRadius: 40,
            exitDoorSize: 50,
            knockbackBias: 150
        };

        this.levelData = [
            '*******',
            '*M*****',
            '*******',
            '**M****',
            '****O**',
            '*******',
            '****O**',
            'M**M**M',
            '*M*M*M*',
            '***M***',
            '*M***M*',
            '**M*M**',
            '*M*M*M*',
            '***M***',
            '**O****',
            '*******',
            '*M*****',
            '*******',
            '*******',
            'O******',
            '*******',
            '*MMM***',
            '*******',
            '*******'
        ];

        this.playerHP = 3;
        this.gold = 0;
        this.hammerAngle = this.levelConfig.hammerMaxAngle;
        this.hammerSwinging = false;
        this.hammerDirection = 1;
        this.scrollOffset = 0;
        this.gameState = 'playing';
        this.monsters = [];
        this.obstacles = [];
        
        this.laneWidth = 720 / this.levelConfig.lanes;
        this.rowHeight = this.levelConfig.playerRadius;
        this.levelHeight = this.levelConfig.rows * this.rowHeight;
        
        this.hammerOBB = {
            center: { x: 0, y: 0 },
            halfExtents: { 
                x: this.levelConfig.hammerHeadWidth / 2, 
                y: this.levelConfig.hammerHeadHeight / 2 
            },
            rotation: 0
        };
    }

    create() {
        this.graphics = this.add.graphics();
        
        this.generateLevel();
        
        this.playerX = this.game.config.width / 2;
        this.playerY = this.game.config.height - this.levelConfig.playerRadius - this.levelConfig.playerPadding;
        
        this.heartsText = this.add.text(20, 20, '', { 
            fontSize: '32px', 
            fill: '#ff0000' 
        });
        
        this.goldText = this.add.text(20, 60, 'Gold: 0', { 
            fontSize: '24px', 
            fill: '#ffff00' 
        });
        
        this.gameOverOverlay = this.add.graphics();
        this.gameOverOverlay.fillStyle(0x000000, 0.7);
        this.gameOverOverlay.fillRect(0, 0, this.game.config.width, this.game.config.height);
        this.gameOverOverlay.setVisible(false);
        
        this.gameOverText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, 
            'GAME OVER', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5).setVisible(false);
        
        this.restartText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 50,
            'Press SPACE or click to restart', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5).setVisible(false);
        
        this.winText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50,
            'YOU WIN!', {
            fontSize: '48px',
            fill: '#00ff00'
        }).setOrigin(0.5).setVisible(false);
        
        this.winGoldText = this.add.text(this.game.config.width / 2, this.game.config.height / 2,
            '', {
            fontSize: '32px',
            fill: '#ffff00'
        }).setOrigin(0.5).setVisible(false);
        
        this.input.on('pointerdown', () => {
            if (this.gameState === 'playing') {
                this.swingHammer();
            } else if (this.gameState === 'gameOver' || this.gameState === 'win') {
                this.scene.restart();
            }
        });
        
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.gameState === 'playing') {
                this.swingHammer();
            } else if (this.gameState === 'gameOver' || this.gameState === 'win') {
                this.scene.restart();
            }
        });
    }

    generateLevel() {
        for (let row = 0; row < this.levelConfig.rows; row++) {
            const rowData = this.levelData[(this.levelConfig.rows - 1) - row];
            for (let col = 0; col < this.levelConfig.lanes; col++) {
                const char = rowData[col];
                const x = col * this.laneWidth + this.laneWidth / 2;
                const y = -(this.levelHeight - (row * this.rowHeight + this.rowHeight / 2));
                
                if (char === 'M') {
                    this.monsters.push({
                        x: x,
                        y: y,
                        velocityX: 0,
                        velocityY: 0,
                        bouncing: false,
                        radius: this.levelConfig.monsterRadius
                    });
                } else if (char === 'O') {
                    this.obstacles.push({
                        x: x,
                        y: y,
                        radius: this.levelConfig.obstacleRadius
                    });
                }
            }
        }
        
        this.exitDoorX = this.game.config.width / 2;
        this.exitDoorY = -this.levelHeight + this.levelConfig.exitDoorSize / 2;
    }

    swingHammer() {
        if (this.hammerSwinging) return;
        
        this.hammerSwinging = true;
        const targetAngle = this.hammerDirection === 1 ? 
            this.levelConfig.hammerMinAngle : this.levelConfig.hammerMaxAngle;
        
        this.tweens.add({
            targets: this,
            hammerAngle: targetAngle,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.hammerSwinging = false;
                this.hammerDirection *= -1;
            }
        });
    }

    update(time, delta) {
        if (this.gameState !== 'playing') return;
        
        this.scrollOffset += this.levelConfig.scrollSpeed * (delta / 1000);
        
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            monster.y += this.levelConfig.scrollSpeed * (delta / 1000);
            
            if (monster.bouncing) {
                monster.x += monster.velocityX * (delta / 1000);
                monster.y += monster.velocityY * (delta / 1000);
                
                if (monster.x < -100 || monster.x > this.game.config.width + 100 ||
                    monster.y < -100 || monster.y > this.game.config.height + 100) {
                    this.monsters.splice(i, 1);
                    continue;
                }
            }
            
            if (!monster.bouncing && this.checkCircleCollision(
                monster.x, monster.y, monster.radius,
                this.playerX, this.playerY, this.levelConfig.playerRadius
            )) {
                this.playerHP--;
                this.monsters.splice(i, 1);
                
                if (this.playerHP <= 0) {
                    this.gameOver();
                }
            }
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.levelConfig.scrollSpeed * (delta / 1000);
            
            if (obstacle.y > this.game.config.height + 100) {
                this.obstacles.splice(i, 1);
            }
        }
        
        this.exitDoorY += this.levelConfig.scrollSpeed * (delta / 1000);
        
        if (this.exitDoorY > this.playerY - this.levelConfig.playerRadius &&
            this.exitDoorY < this.playerY + this.levelConfig.playerRadius &&
            Math.abs(this.exitDoorX - this.playerX) < this.levelConfig.exitDoorSize) {
            this.win();
        }
        
        if (this.hammerSwinging) {
            this.updateHammerOBB();
            this.checkHammerCollisions();
        }
        
        this.checkMonsterMonsterCollisions();
        this.checkBouncingMonsterObstacleCollisions();
        
        this.render();
    }

    updateHammerOBB() {
        const angleRad = Phaser.Math.DegToRad(this.hammerAngle - 90);
        const hammerX = this.playerX + Math.cos(angleRad) * this.levelConfig.hammerLength;
        const hammerY = this.playerY + Math.sin(angleRad) * this.levelConfig.hammerLength;
        
        this.hammerOBB.center.x = hammerX;
        this.hammerOBB.center.y = hammerY;
        this.hammerOBB.rotation = angleRad;
    }

    checkHammerCollisions() {
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            if (!monster.bouncing && this.checkOBBCircleCollision(this.hammerOBB, monster)) {
                const dx = monster.x - this.hammerOBB.center.x;
                const dy = monster.y - this.hammerOBB.center.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    monster.velocityX = (dx / dist) * 1500;
                    monster.velocityY = (dy / dist) * 1500 - this.levelConfig.knockbackBias;
                } else {
                    monster.velocityX = 1500;
                    monster.velocityY = -this.levelConfig.knockbackBias;
                }
                
                monster.bouncing = true;
            }
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            if (this.checkOBBCircleCollision(this.hammerOBB, obstacle)) {
                this.obstacles.splice(i, 1);
                this.gold += 5;
            }
        }
    }

    checkMonsterMonsterCollisions() {
        for (let i = 0; i < this.monsters.length; i++) {
            const monster1 = this.monsters[i];
            if (!monster1.bouncing) continue;
            
            for (let j = 0; j < this.monsters.length; j++) {
                if (i === j) continue;
                const monster2 = this.monsters[j];
                
                if (!monster2.bouncing && this.checkCircleCollision(
                    monster1.x, monster1.y, monster1.radius,
                    monster2.x, monster2.y, monster2.radius
                )) {
                    const dx = monster2.x - monster1.x;
                    const dy = monster2.y - monster1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 0) {
                        monster2.velocityX = (dx / dist) * 1500;
                        monster2.velocityY = (dy / dist) * 1500 - this.levelConfig.knockbackBias;
                    } else {
                        monster2.velocityX = 1500;
                        monster2.velocityY = -this.levelConfig.knockbackBias;
                    }
                    
                    monster2.bouncing = true;
                }
            }
        }
    }

    checkBouncingMonsterObstacleCollisions() {
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            if (!monster.bouncing) continue;
            
            for (let j = this.obstacles.length - 1; j >= 0; j--) {
                const obstacle = this.obstacles[j];
                
                if (this.checkCircleCollision(
                    monster.x, monster.y, monster.radius,
                    obstacle.x, obstacle.y, obstacle.radius
                )) {
                    this.monsters.splice(i, 1);
                    this.obstacles.splice(j, 1);
                    this.gold += 10;
                    break;
                }
            }
        }
    }

    checkCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    }

    checkOBBCircleCollision(obb, circle) {
        const cos = Math.cos(-obb.rotation);
        const sin = Math.sin(-obb.rotation);
        
        const circleLocalX = (circle.x - obb.center.x) * cos - (circle.y - obb.center.y) * sin;
        const circleLocalY = (circle.x - obb.center.x) * sin + (circle.y - obb.center.y) * cos;
        
        const closestX = Math.max(-obb.halfExtents.x, Math.min(obb.halfExtents.x, circleLocalX));
        const closestY = Math.max(-obb.halfExtents.y, Math.min(obb.halfExtents.y, circleLocalY));
        
        const dx = circleLocalX - closestX;
        const dy = circleLocalY - closestY;
        
        return (dx * dx + dy * dy) < (circle.radius * circle.radius);
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.gameOverOverlay.setVisible(true);
        this.gameOverText.setVisible(true);
        this.restartText.setVisible(true);
    }

    win() {
        this.gameState = 'win';
        this.gameOverOverlay.setVisible(true);
        this.winText.setVisible(true);
        this.winGoldText.setText(`Gold collected: ${this.gold}`);
        this.winGoldText.setVisible(true);
        this.restartText.setVisible(true);
    }

    render() {
        this.graphics.clear();
        
        this.graphics.lineStyle(2, 0x333333);
        for (let i = 0; i <= this.levelConfig.lanes; i++) {
            this.graphics.beginPath();
            this.graphics.moveTo(i * this.laneWidth, 0);
            this.graphics.lineTo(i * this.laneWidth, this.game.config.height);
            this.graphics.strokePath();
        }
        
        const offsetY = (this.scrollOffset % this.rowHeight);
        
        for (let i = -1; i <= Math.ceil(this.game.config.height / this.rowHeight) + 1; i++) {
            const y = offsetY + i * this.rowHeight;
            if (y >= 0 && y <= this.game.config.height) {
                this.graphics.beginPath();
                this.graphics.moveTo(0, y);
                this.graphics.lineTo(this.game.config.width, y);
                this.graphics.strokePath();
            }
        }
        
        this.graphics.fillStyle(0x00ff00);
        this.graphics.fillRect(
            this.exitDoorX - this.levelConfig.exitDoorSize / 2,
            this.exitDoorY - this.levelConfig.exitDoorSize / 2,
            this.levelConfig.exitDoorSize,
            this.levelConfig.exitDoorSize
        );
        
        this.obstacles.forEach(obstacle => {
            this.graphics.fillStyle(0x0000ff);
            this.graphics.fillCircle(obstacle.x, obstacle.y, obstacle.radius);
        });
        
        this.monsters.forEach(monster => {
            this.graphics.fillStyle(0xff0000);
            this.graphics.fillCircle(monster.x, monster.y, monster.radius);
        });
        
        this.graphics.fillStyle(0x00ff00);
        this.graphics.fillCircle(this.playerX, this.playerY, this.levelConfig.playerRadius);
        
        const angleRad = Phaser.Math.DegToRad(this.hammerAngle - 90);
        const hammerX = this.playerX + Math.cos(angleRad) * this.levelConfig.hammerLength;
        const hammerY = this.playerY + Math.sin(angleRad) * this.levelConfig.hammerLength;
        
        this.graphics.lineStyle(18, 0x8b4513);
        this.graphics.beginPath();
        this.graphics.moveTo(this.playerX, this.playerY);
        this.graphics.lineTo(hammerX, hammerY);
        this.graphics.strokePath();
        
        this.graphics.save();
        this.graphics.translateCanvas(hammerX, hammerY);
        this.graphics.rotateCanvas(angleRad);
        this.graphics.fillStyle(0x8b4513);
        this.graphics.fillRect(
            -this.levelConfig.hammerHeadWidth / 2,
            -this.levelConfig.hammerHeadHeight / 2,
            this.levelConfig.hammerHeadWidth,
            this.levelConfig.hammerHeadHeight
        );
        this.graphics.restore();
        
        let heartsDisplay = '';
        for (let i = 0; i < this.playerHP; i++) {
            heartsDisplay += '❤️ ';
        }
        this.heartsText.setText(heartsDisplay);
        this.goldText.setText(`Gold: ${this.gold}`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const config = {
        type: Phaser.AUTO,
        width: 720,
        height: 1280,
        parent: 'game-container',
        backgroundColor: '#1a1a1a',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: GameScene
    };

    const game = new Phaser.Game(config);
});