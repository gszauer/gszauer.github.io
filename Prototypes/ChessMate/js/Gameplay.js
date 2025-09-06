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
        this.cameras.main.setBackgroundColor(0x000000);
        
        
        // Add background image aligned to top center
        const bg = this.add.image(700, 160 + 49, 'background');
        bg.setOrigin(0.5, 0);
        
        // Scale to fit width of 1400
        const bgScale = 1600 / bg.width;
        bg.setScale(bgScale);

        // Add header background at the top
        const header = this.add.image(700, -50, 'ui', 'header_ingame.png');
        header.setOrigin(0.5, 0);
        
        // Scale to fit full width if needed
        const headerScale = 1400 / header.width;
        if (headerScale > 1) {
            header.setScale(headerScale);
        }
        
        
        const boardX = (1400 - BOARD_WIDTH * BOARD_TILE_SIZE) / 2;
        const boardY = (3100 - BOARD_HEIGHT * BOARD_TILE_SIZE) / 2 + 49;
        
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
        
        this.levelText = this.add.text(20, 20, `Level ${this.levelId}`, style);
        
        this.messageText = this.add.text(1400 / 2, 100, '', {
            font: '32px Arial',
            fill: '#ffff00'
        });
        this.messageText.setOrigin(0.5);
        
        this.addSettingsButton();
        this.pauseWindow = new PauseWindow(this);
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
                if (this.selectedPiece === clickedPiece) {
                    this.board.clearHighlights();
                    this.selectedPiece = null;
                    this.validMoves = [];
                } else {
                    this.selectPiece(clickedPiece);
                }
                this.selectedEnemy = null;
            } else if (clickedPiece && clickedPiece.color === 'black') {
                if (this.selectedEnemy === clickedPiece) {
                    this.board.clearHighlights();
                    this.selectedEnemy = null;
                } else {
                    this.showEnemyMoves(clickedPiece);
                }
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
        
        // Reuse existing moves array, modify in place
        for (let i = 0; i < this.validMoves.length; i++) {
            const move = this.validMoves[i];
            const targetPiece = this.board.getPieceAt(move.x, move.y);
            move.color = targetPiece && targetPiece.color !== piece.color ? COLORS.captureHighlight : COLORS.highlight;
        }
        
        this.board.highlightSquares(this.validMoves, COLORS.highlight);
    }

    showEnemyMoves(enemyPiece) {
        this.selectedEnemy = enemyPiece;
        const enemyAttacks = enemyPiece.getAttackPositions();
        
        // Modify in place instead of creating new array
        for (let i = 0; i < enemyAttacks.length; i++) {
            enemyAttacks[i].color = COLORS.enemyMoveHighlight;
        }
        
        this.board.highlightSquares(enemyAttacks, COLORS.enemyMoveHighlight);
    }

    makeMove(piece, toX, toY) {
        this.isPlayerTurn = false;
        
        const targetPiece = this.board.getPieceAt(toX, toY);
        
        // Move the piece with a callback for when movement completes
        piece.moveTo(toX, toY, () => {
            // Remove the target piece after movement completes
            if (targetPiece) {
                this.board.removePiece(targetPiece);
                if (targetPiece.unit === 'king' && targetPiece.color === 'black') {
                    this.winLevel();
                    return;
                }
            }
            
            // Immediate enemy retaliation check (no delay)
            this.enemyRetaliation(toX, toY);
        });
        
        this.moveCount++;
        
        this.board.clearHighlights();
        this.selectedPiece = null;
        this.selectedEnemy = null;
    }

    enemyRetaliation(playerX, playerY) {
        const enemyPieces = this.board.pieces.filter(p => p.color === 'black');
        
        let hasRetaliation = false;
        for (let enemy of enemyPieces) {
            const moves = enemy.getValidMoves();
            const canAttack = moves.some(m => m.x === playerX && m.y === playerY);
            
            if (canAttack) {
                hasRetaliation = true;
                const targetPiece = this.board.getPieceAt(playerX, playerY);
                if (targetPiece) {
                    // Move enemy piece with callback to remove target after movement
                    enemy.moveTo(playerX, playerY, () => {
                        this.board.removePiece(targetPiece);
                        if (targetPiece.unit === 'knight') {
                            this.loseLevel('Your knight was captured!');
                        }
                        // Re-enable player turn after enemy move completes
                        this.isPlayerTurn = true;
                    });
                }
                break;
            }
        }
        
        // If no enemy can retaliate, immediately enable player turn
        if (!hasRetaliation) {
            this.isPlayerTurn = true;
        }
    }

    addSettingsButton() {
        /**
         * Creates a self-contained gear button component.
         * @param {Phaser.Scene} scene - The scene to add the button to.
         * @param {number} x - The x-coordinate to position the center of the button.
         * @param {number} y - The y-coordinate to position the center of the button.
         * @returns {Phaser.GameObjects.Container} The created button container.
         */
        function createGearButton(scene, x, y) {
            // Create a container to hold all parts of the button.
            const container = scene.add.container(x, y);
            // Create a graphics object that will be drawn into the container.
            const graphics = scene.add.graphics();
            container.add(graphics);

            // --- Define Colors based on the provided image ---
            const colors = {
                stoneShadow: 0x5D3A1A,
                stoneBase: 0x8C5A2B,
                stoneFace: 0xA46A31,
                stoneHighlight: 0xC17C3A,
                gearShadow: 0x8A5C01, // A darker shade for the gear shadow
                gearBase: 0xFDD835,
                gearHighlight: 0xFFF176
            };

            // --- Define the Button Shape (relative to 0,0) ---
            const buttonSize = 210;
            const cornerCut = 60;
            const buttonPoints = [
                { x: -buttonSize, y: -buttonSize + cornerCut },
                { x: -buttonSize + cornerCut, y: -buttonSize },
                { x: buttonSize - cornerCut, y: -buttonSize },
                { x: buttonSize, y: -buttonSize + cornerCut },
                { x: buttonSize, y: buttonSize - cornerCut },
                { x: buttonSize - cornerCut, y: buttonSize },
                { x: -buttonSize + cornerCut, y: buttonSize },
                { x: -buttonSize, y: buttonSize - cornerCut }
            ];

            // --- Draw the Button ---
            // 1. Draw the main base of the button.
            graphics.fillStyle(colors.stoneBase);
            graphics.fillPoints(buttonPoints, true);
            
            // 2. Draw the beveled edges using filled polygons for clean corners.
            const insetButtonPoints = buttonPoints.map(p => ({ x: p.x * 0.9, y: p.y * 0.9 }));

            // Highlight polygon (top and right sides)
            graphics.fillStyle(colors.stoneHighlight);
            const highlightPolygon = [
                buttonPoints[0], buttonPoints[1], buttonPoints[2], buttonPoints[3],
                insetButtonPoints[3], insetButtonPoints[2], insetButtonPoints[1], insetButtonPoints[0]
            ];
            graphics.fillPoints(highlightPolygon, true);

            // Shadow polygon (bottom and left sides)
            graphics.fillStyle(colors.stoneShadow);
             const shadowPolygon = [
                buttonPoints[4], buttonPoints[5], buttonPoints[6], buttonPoints[7],
                insetButtonPoints[7], insetButtonPoints[6], insetButtonPoints[5], insetButtonPoints[4]
            ];
            graphics.fillPoints(shadowPolygon, true);

            // 3. Draw the slightly inset face of the button on top.
            graphics.fillStyle(colors.stoneFace);
            graphics.fillPoints(insetButtonPoints, true);

            // --- Draw the Gear (relative to 0,0) ---
            const gearRadius = 100;
            const gearTeeth = 8;
            const toothWidth = 50;
            const toothHeight = 35;

            // This helper function draws the complete gear shape.
            const drawGear = (offsetX = 0, offsetY = 0) => {
                // Draw the main body of the gear
                graphics.fillCircle(offsetX, offsetY, gearRadius);

                // Draw the teeth in a loop
                for (let i = 0; i < gearTeeth; i++) {
                    const angle = (i / gearTeeth) * Math.PI * 2;
                    const toothPoints = [
                        { x: gearRadius - 5, y: -toothWidth / 2 },
                        { x: gearRadius + toothHeight, y: -toothWidth / 2 },
                        { x: gearRadius + toothHeight, y: toothWidth / 2 },
                        { x: gearRadius - 5, y: toothWidth / 2 },
                    ];
                    const rotatedToothPoints = toothPoints.map(p => ({
                        x: p.x * Math.cos(angle) - p.y * Math.sin(angle) + offsetX,
                        y: p.x * Math.sin(angle) + p.y * Math.cos(angle) + offsetY
                    }));
                    graphics.fillPoints(rotatedToothPoints, true);
                }
            };
            
            // 1. Draw gear shadow
            graphics.fillStyle(colors.gearShadow);
            drawGear(5, 5);
            
            // 2. Draw main gear
            graphics.fillStyle(colors.gearBase);
            drawGear();

            // 3. Draw gear highlight
            graphics.lineStyle(5, colors.gearHighlight, 1);
            graphics.beginPath();
            const highlightRadius = gearRadius * 0.85;
            const startAngle = Phaser.Math.DegToRad(270 - 55);
            const endAngle = Phaser.Math.DegToRad(270 + 55);
            graphics.arc(0, 0, highlightRadius, startAngle, endAngle);
            graphics.strokePath();

            // 4. Draw the center hole
            graphics.fillStyle(colors.stoneFace);
            graphics.fillCircle(0, 0, gearRadius * 0.45);
            
            return container;
        }

        // Position the gear button in the upper right corner
        const margin = 22; // 15 + 7 = 22px from edges
        const scale = 0.42; // 1.5x the original 0.28 scale
        const buttonRadius = 210 * scale; // Scaled button radius
        const x = this.cameras.main.width - buttonRadius - margin;
        const y = buttonRadius + margin;
        
        const settingsButton = createGearButton(this, x, y);
        settingsButton.setScale(scale); // 1.5x bigger than original
        settingsButton.setDepth(25);
        
        // Make the button interactive
        settingsButton.setInteractive(new Phaser.Geom.Circle(0, 0, 210), Phaser.Geom.Circle.Contains);
        settingsButton.input.cursor = 'pointer';
        
        // Add hover effect
        settingsButton.on('pointerover', () => {
            settingsButton.setScale(scale * 1.07); // Proportional hover scale
        });
        
        settingsButton.on('pointerout', () => {
            settingsButton.setScale(scale);
        });
        
        // Click to open pause window
        settingsButton.on('pointerup', () => {
            this.pauseWindow.show();
        });
    }

    winLevel() {
        this.messageText.setText('Victory!');
        const completed = PlayerData.Instance.GetNumber('chessmate_completed', 0);
        if (this.levelId > completed) {
            PlayerData.Instance.SetNumber('chessmate_completed', this.levelId);
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