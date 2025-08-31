class ChessBoard extends Phaser.GameObjects.Container {
    constructor(scene, xOffset, yOffset, tileSize) {
        super(scene, 0, 0);
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.tileSize = tileSize;
        this.pieces = [];
        this.highlights = [];
        
        scene.add.existing(this);
        this.createBoard();
    }

    createBoard() {
        const graphics = this.scene.add.graphics();
        
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const isLight = (x + y) % 2 === 0;
                const color = isLight ? COLORS.lightSquare : COLORS.darkSquare;
                
                graphics.fillStyle(color, 1);
                graphics.fillRect(
                    this.xOffset + x * this.tileSize,
                    this.yOffset + y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
        
        graphics.lineStyle(2, 0x000000, 0.5);
        graphics.strokeRect(
            this.xOffset,
            this.yOffset,
            BOARD_WIDTH * this.tileSize,
            BOARD_HEIGHT * this.tileSize
        );
        
        this.add(graphics);
        //graphics.alpha = 0.2;
        this.boardGraphics = graphics;
    }

    addPiece(piece) {
        this.pieces.push(piece);
        this.add(piece);
    }

    removePiece(piece) {
        const index = this.pieces.indexOf(piece);
        if (index > -1) {
            this.pieces.splice(index, 1);
            piece.destroy();
        }
    }

    getPieceAt(boardX, boardY) {
        return this.pieces.find(p => p.boardX === boardX && p.boardY === boardY);
    }

    clearHighlights() {
        this.highlights.forEach(h => h.destroy());
        this.highlights = [];
    }

    highlightSquares(squares, defaultColor = COLORS.highlight) {
        this.clearHighlights();
        
        squares.forEach((square) => {
            const x = square.x;
            const y = square.y;
            const color = square.color || defaultColor;
            
            const highlight = this.scene.add.graphics();
            highlight.fillStyle(color, 0.5);
            highlight.fillRect(
                this.xOffset + x * this.tileSize,
                this.yOffset + y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
            highlight.setDepth(10);
            this.highlights.push(highlight);
            this.add(highlight);
        });
    }

    getBoardPosition(worldX, worldY) {
        const boardX = Math.floor((worldX - this.xOffset) / this.tileSize);
        const boardY = Math.floor((worldY - this.yOffset) / this.tileSize);
        
        if (boardX >= 0 && boardX < BOARD_WIDTH && boardY >= 0 && boardY < BOARD_HEIGHT) {
            return { x: boardX, y: boardY };
        }
        return null;
    }
}