class Gameplay extends Phaser.Scene {
    static ShowGraphics = false;
    
    constructor() {
        super('Gameplay');
        this.currentLevel = null;
        this.moveCount = 0;
        this.selectedPiece = null;
        this.selectedEnemy = null;
        this.validMoves = [];
        this.isPlayerTurn = true;
    }

    init(data) {
        this.levelIndex = data.levelIndex !== undefined ? data.levelIndex : 0;
        this.levelId = this.levelIndex + 1;
    }

    create() {
        this.currentLevel = LEVELS[this.levelIndex];
        this.moveCount = 0;
        this.selectedPiece = null;
        this.selectedEnemy = null;
        this.validMoves = [];
        this.isPlayerTurn = true;
        
        this.input.removeAllListeners();
        
        // Add background image aligned to top center
        const bg = this.add.image(700, 160, 'background');
        bg.setOrigin(0.5, 0);
        
        // Scale to fit width of 1400
        const bgScale = 1600 / bg.width;
        bg.setScale(bgScale);
        
        this.cameras.main.setBackgroundColor(0x312E2B);
        
        const boardX = (1400 - BOARD_WIDTH * BOARD_TILE_SIZE) / 2;
        const boardY = (3100 - BOARD_HEIGHT * BOARD_TILE_SIZE) / 2;
        
        this.board = new ChessBoard(this, boardX, boardY, BOARD_TILE_SIZE);
        
        this.createUI();
        this.loadLevel();
        this.setupInput();
    }

    createUI() {
        const style = {
            font: '24px Arial',
            fill: '#ffffff'
        };
        
        this.moveText = this.add.text(20, 20, `Moves: ${this.moveCount}/${this.currentLevel.maxMoves}`, style);
        this.levelText = this.add.text(20, 50, `Level ${this.levelId}`, style);
        
        const backButton = this.add.text(1400 - 100, 20, 'Back', style);
        backButton.setInteractive();
        backButton.on('pointerup', () => {
            this.scene.start('LevelSelect');
        });
        
        this.messageText = this.add.text(1400 / 2, 100, '', {
            font: '32px Arial',
            fill: '#ffff00'
        });
        this.messageText.setOrigin(0.5);
    }

    loadLevel() {
        this.currentLevel.pieces.forEach(pieceData => {
            const worldX = this.board.xOffset + pieceData.x * BOARD_TILE_SIZE + BOARD_TILE_SIZE / 2;
            const worldY = this.board.yOffset + pieceData.y * BOARD_TILE_SIZE + BOARD_TILE_SIZE / 2;
            const piece = new ChessPiece(this, worldX, worldY, pieceData.unit, pieceData.color, this.board);
            this.board.addPiece(piece);
        });
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            if (!this.isPlayerTurn) return;
            
            const boardPos = this.board.getBoardPosition(pointer.x, pointer.y);
            if (!boardPos) {
                this.board.clearHighlights();
                this.selectedPiece = null;
                this.selectedEnemy = null;
                return;
            }
            
            const clickedPiece = this.board.getPieceAt(boardPos.x, boardPos.y);
            
            if (this.selectedPiece && this.validMoves.some(m => m.x === boardPos.x && m.y === boardPos.y)) {
                this.makeMove(this.selectedPiece, boardPos.x, boardPos.y);
            } else if (clickedPiece && clickedPiece.color === 'white') {
                this.selectPiece(clickedPiece);
                this.selectedEnemy = null;
            } else if (clickedPiece && clickedPiece.color === 'black') {
                this.showEnemyMoves(clickedPiece);
                this.selectedPiece = null;
            } else {
                this.board.clearHighlights();
                this.selectedPiece = null;
                this.selectedEnemy = null;
            }
        });
    }

    selectPiece(piece) {
        this.selectedPiece = piece;
        this.validMoves = piece.getValidMoves();
        
        const highlightMoves = this.validMoves.map(move => {
            const targetPiece = this.board.getPieceAt(move.x, move.y);
            return {
                ...move,
                color: targetPiece && targetPiece.color !== piece.color ? COLORS.captureHighlight : COLORS.highlight
            };
        });
        
        this.board.highlightSquares(highlightMoves, COLORS.highlight);
    }

    showEnemyMoves(enemyPiece) {
        this.selectedEnemy = enemyPiece;
        const enemyAttacks = enemyPiece.getAttackPositions();
        
        const highlightMoves = enemyAttacks.map(move => {
            return {
                x: move.x,
                y: move.y,
                color: COLORS.enemyMoveHighlight
            };
        });
        
        this.board.highlightSquares(highlightMoves, COLORS.enemyMoveHighlight);
    }

    makeMove(piece, toX, toY) {
        this.isPlayerTurn = false;
        
        const targetPiece = this.board.getPieceAt(toX, toY);
        if (targetPiece) {
            if (targetPiece.unit === 'king' && targetPiece.color === 'black') {
                this.board.removePiece(targetPiece);
                piece.moveTo(toX, toY);
                this.winLevel();
                return;
            } else {
                this.board.removePiece(targetPiece);
            }
        }
        
        piece.moveTo(toX, toY);
        this.moveCount++;
        this.moveText.setText(`Moves: ${this.moveCount}/${this.currentLevel.maxMoves}`);
        
        this.board.clearHighlights();
        this.selectedPiece = null;
        this.selectedEnemy = null;
        
        if (this.moveCount >= this.currentLevel.maxMoves) {
            this.loseLevel('Too many moves!');
            return;
        }
        
        this.time.delayedCall(400, () => {
            this.enemyRetaliation(toX, toY);
        });
    }

    enemyRetaliation(playerX, playerY) {
        const enemyPieces = this.board.pieces.filter(p => p.color === 'black');
        
        for (let enemy of enemyPieces) {
            const moves = enemy.getValidMoves();
            const canAttack = moves.some(m => m.x === playerX && m.y === playerY);
            
            if (canAttack) {
                const targetPiece = this.board.getPieceAt(playerX, playerY);
                if (targetPiece) {
                    if (targetPiece.unit === 'knight') {
                        enemy.moveTo(playerX, playerY);
                        this.board.removePiece(targetPiece);
                        this.loseLevel('Your knight was captured!');
                        return;
                    } else {
                        enemy.moveTo(playerX, playerY);
                        this.board.removePiece(targetPiece);
                    }
                }
                break;
            }
        }
        
        this.isPlayerTurn = true;
    }

    winLevel() {
        this.messageText.setText('Victory!');
        const completed = parseInt(localStorage.getItem('chessmate_completed') || '0');
        if (this.levelId > completed) {
            localStorage.setItem('chessmate_completed', this.levelId.toString());
        }
        
        this.time.delayedCall(2000, () => {
            if (this.levelIndex < LEVELS.length - 1) {
                this.scene.restart({ levelIndex: this.levelIndex + 1 });
            } else {
                this.scene.start('LevelSelect');
            }
        });
    }

    loseLevel(reason) {
        this.messageText.setText(reason);
        this.isPlayerTurn = false;
        
        this.time.delayedCall(2000, () => {
            this.scene.restart({ levelIndex: this.levelIndex });
        });
    }
}