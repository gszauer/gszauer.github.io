class ChessPiece extends Phaser.GameObjects.Container {
    constructor(scene, x, y, unit, color, board) {
        super(scene, x, y);
        this.unit = unit;
        this.color = color;
        this.board = board;
        this.boardX = Math.floor((x - board.xOffset) / board.tileSize);
        this.boardY = Math.floor((y - board.yOffset) / board.tileSize);
        
        scene.add.existing(this);
        this.createPieceGraphics();
        this.setSize(board.tileSize * 0.8, board.tileSize * 0.8);
        this.setInteractive();
        this.setDepth(20);
    }

    createPieceGraphics() {
        const graphics = this.scene.add.graphics();
        const size = this.board.tileSize * 0.7;
        const fillColor = this.color === 'white' ? 0xFFFFFF : 0x333333;
        const strokeColor = this.color === 'white' ? 0x333333 : 0xFFFFFF;
        
        graphics.fillStyle(fillColor, 1);
        graphics.lineStyle(2, strokeColor, 1);
        
        switch(this.unit) {
            case 'knight':
                this.drawKnight(graphics, size);
                break;
            case 'king':
                this.drawKing(graphics, size);
                break;
            case 'pawn':
                this.drawPawn(graphics, size);
                break;
            case 'bishop':
                this.drawBishop(graphics, size);
                break;
        }
        
        this.add(graphics);
    }

    drawKnight(graphics, size) {
        graphics.beginPath();
        graphics.moveTo(-size * 0.3, size * 0.4);
        graphics.lineTo(-size * 0.3, size * 0.1);
        graphics.lineTo(-size * 0.2, -size * 0.1);
        graphics.lineTo(-size * 0.1, -size * 0.3);
        graphics.lineTo(0, -size * 0.35);
        graphics.lineTo(size * 0.15, -size * 0.3);
        graphics.lineTo(size * 0.25, -size * 0.15);
        graphics.lineTo(size * 0.3, 0);
        graphics.lineTo(size * 0.25, size * 0.2);
        graphics.lineTo(size * 0.1, size * 0.4);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-size * 0.05, -size * 0.15, size * 0.05);
    }

    drawKing(graphics, size) {
        graphics.fillRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
        graphics.fillRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.3);
        graphics.fillRect(-size * 0.15, -size * 0.25, size * 0.3, size * 0.15);
        
        graphics.fillRect(-size * 0.05, -size * 0.4, size * 0.1, size * 0.15);
        graphics.fillRect(-size * 0.1, -size * 0.35, size * 0.2, size * 0.05);
        
        graphics.strokeRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
        graphics.strokeRect(-size * 0.2, -size * 0.1, size * 0.4, size * 0.3);
        graphics.strokeRect(-size * 0.15, -size * 0.25, size * 0.3, size * 0.15);
        graphics.strokeRect(-size * 0.05, -size * 0.4, size * 0.1, size * 0.15);
        graphics.strokeRect(-size * 0.1, -size * 0.35, size * 0.2, size * 0.05);
    }

    drawPawn(graphics, size) {
        graphics.fillCircle(0, -size * 0.15, size * 0.2);
        graphics.fillRect(-size * 0.15, 0, size * 0.3, size * 0.2);
        graphics.fillRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
        
        graphics.strokeCircle(0, -size * 0.15, size * 0.2);
        graphics.strokeRect(-size * 0.15, 0, size * 0.3, size * 0.2);
        graphics.strokeRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.2);
    }

    drawBishop(graphics, size) {
        graphics.beginPath();
        graphics.moveTo(-size * 0.25, size * 0.4);
        graphics.lineTo(-size * 0.15, size * 0.1);
        graphics.lineTo(-size * 0.1, -size * 0.1);
        graphics.lineTo(-size * 0.05, -size * 0.25);
        graphics.lineTo(0, -size * 0.35);
        graphics.lineTo(size * 0.05, -size * 0.25);
        graphics.lineTo(size * 0.1, -size * 0.1);
        graphics.lineTo(size * 0.15, size * 0.1);
        graphics.lineTo(size * 0.25, size * 0.4);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(0, -size * 0.35, size * 0.08);
    }

    moveTo(boardX, boardY) {
        this.boardX = boardX;
        this.boardY = boardY;
        const newX = this.board.xOffset + boardX * this.board.tileSize + this.board.tileSize / 2;
        const newY = this.board.yOffset + boardY * this.board.tileSize + this.board.tileSize / 2;
        
        this.scene.tweens.add({
            targets: this,
            x: newX,
            y: newY,
            duration: 300,
            ease: 'Power2'
        });
    }

    getValidMoves() {
        const moves = [];
        
        switch(this.unit) {
            case 'knight':
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                knightMoves.forEach(([dx, dy]) => {
                    const newX = this.boardX + dx;
                    const newY = this.boardY + dy;
                    if (newX >= 0 && newX < BOARD_WIDTH && newY >= 0 && newY < BOARD_HEIGHT) {
                        const pieceAt = this.board.getPieceAt(newX, newY);
                        if (!pieceAt || pieceAt.color !== this.color) {
                            moves.push({ x: newX, y: newY });
                        }
                    }
                });
                break;
                
            case 'pawn':
                const direction = this.color === 'white' ? -1 : 1;
                const forwardY = this.boardY + direction;
                if (forwardY >= 0 && forwardY < BOARD_HEIGHT) {
                    const pieceAtForward = this.board.getPieceAt(this.boardX, forwardY);
                    if (!pieceAtForward) {
                        moves.push({ x: this.boardX, y: forwardY });
                    }
                    
                    [-1, 1].forEach(dx => {
                        const captureX = this.boardX + dx;
                        if (captureX >= 0 && captureX < BOARD_WIDTH) {
                            const pieceAtCapture = this.board.getPieceAt(captureX, forwardY);
                            if (pieceAtCapture && pieceAtCapture.color !== this.color) {
                                moves.push({ x: captureX, y: forwardY });
                            }
                        }
                    });
                }
                break;
                
            case 'bishop':
                const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                bishopDirections.forEach(([dx, dy]) => {
                    for (let i = 1; i < Math.max(BOARD_WIDTH, BOARD_HEIGHT); i++) {
                        const newX = this.boardX + dx * i;
                        const newY = this.boardY + dy * i;
                        if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) break;
                        
                        const piece = this.board.getPieceAt(newX, newY);
                        if (piece) {
                            if (piece.color !== this.color) {
                                moves.push({ x: newX, y: newY });
                            }
                            break;
                        }
                        moves.push({ x: newX, y: newY });
                    }
                });
                break;
                
            case 'king':
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                kingMoves.forEach(([dx, dy]) => {
                    const newX = this.boardX + dx;
                    const newY = this.boardY + dy;
                    if (newX >= 0 && newX < BOARD_WIDTH && newY >= 0 && newY < BOARD_HEIGHT) {
                        const pieceAt = this.board.getPieceAt(newX, newY);
                        if (!pieceAt || pieceAt.color !== this.color) {
                            moves.push({ x: newX, y: newY });
                        }
                    }
                });
                break;
        }
        
        return moves;
    }

    getAttackPositions() {
        const attacks = [];
        
        switch(this.unit) {
            case 'pawn':
                const direction = this.color === 'white' ? -1 : 1;
                const forwardY = this.boardY + direction;
                if (forwardY >= 0 && forwardY < BOARD_HEIGHT) {
                    [-1, 1].forEach(dx => {
                        const captureX = this.boardX + dx;
                        if (captureX >= 0 && captureX < BOARD_WIDTH) {
                            attacks.push({ x: captureX, y: forwardY });
                        }
                    });
                }
                break;
                
            default:
                // For all other pieces, attack positions are the same as valid moves
                return this.getValidMoves();
        }
        
        return attacks;
    }
}