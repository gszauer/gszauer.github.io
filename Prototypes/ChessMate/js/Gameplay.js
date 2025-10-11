class Gameplay extends Phaser.Scene {
    static ShowGraphics = false;
    static SfxMuted = false;
    static BgmMuted = false;

    constructor() {
        super('Gameplay');
        this.currentLevel = null;
        this.moveCount = 0;
        this.selectedPiece = null;
        this.selectedEnemy = null;
        this.validMoves = [];
        this.isPlayerTurn = true;
        this.activeTutorial = null;
        this.tapIndicator = null;
        this.levelOneFollowupShown = false;
        this.requireKingCapture = false;
        this.restrictSelectionToEnemyKing = false;
        this.restrictSelectionToKnight = false;
        this.restrictToKnightSelection = false;
        this.gameplayMusic = null;
        this.stopMusicOnShutdown = true;
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
        this.levelOneFollowupShown = false;
        this.requireKingCapture = false;
        this.restrictSelectionToEnemyKing = false;
        this.restrictSelectionToKnight = false;
        this.restrictToKnightSelection = false;
        this.cameras.main.setBackgroundColor(0x000000);
        this.startGameplayMusic();
        
        // Add header bar at the very top
        const header = this.add.image(700, 0, 'ui', 'header_ingame.png');
        header.setOrigin(0.5, 0);

        const headerScale = 1400 / header.width;
        if (headerScale > 1) {
            header.setScale(headerScale);
        }
        header.setDepth(5);

        const headerHeight = header.displayHeight;
        this.headerHeight = headerHeight;

        // Add the decorative image directly below the bar
        const playAreaY = headerHeight - 2;
        const bg = this.add.image(0, playAreaY, 'ui', 'playing.png');
        bg.setOrigin(0, 0);

        const bgScale = 1400 / bg.width;
        bg.setScale(bgScale);

        this.playAreaOffset = bg.y;

        const footerHeight = 300;
        const footer = this.add.rectangle(0, this.cameras.main.height, 1400, footerHeight, 0x4A2C17, 1);
        footer.setOrigin(0, 1);
        footer.setDepth(1);

        const boardX = (1400 - BOARD_WIDTH * BOARD_TILE_SIZE) / 2;
        const boardY = bg.y + bg.displayHeight;

        this.board = new ChessBoard(this, boardX, boardY, BOARD_TILE_SIZE);
        this.board.setDepth(2);

        this.createUI();
        this.loadLevel();
        this.setupInput();
        this.ensureTapAnimation();
        this.startTutorialIfNeeded();

    }

    startGameplayMusic() {
        // Only play music if not muted
        if (!Gameplay.BgmMuted) {
            const existing = this.sound.get('gameplay_music');
            this.gameplayMusic = existing || this.sound.add('gameplay_music', { loop: true, volume: 0.2 });
            this.gameplayMusic.setLoop(true);
            this.gameplayMusic.setVolume(0.2);
            if (!this.gameplayMusic.isPlaying) {
                this.gameplayMusic.play();
            }
        }

        this.stopMusicOnShutdown = true;
        this.events.once('shutdown', this.stopGameplayMusic, this);
    }

    stopGameplayMusic() {
        if (!this.stopMusicOnShutdown) {
            this.stopMusicOnShutdown = true;
            return;
        }
        const music = this.gameplayMusic || this.sound.get('gameplay_music');
        if (music && music.isPlaying) {
            music.stop();
        }
        this.gameplayMusic = null;
    }

    createUI() {
        const messageY = (this.playAreaOffset || 0) + 100;
        this.messageText = this.add.text(1400 / 2, messageY, '', {
            font: '32px Arial',
            fill: '#ffff00'
        });
        this.messageText.setOrigin(0.5);
        
        const headerCenterY = (this.headerHeight || 0) * 0.5;
        const settingsYOffset = headerCenterY + 4;
        const settingsBtn = this.addSettingsButton();
        settingsBtn.y = settingsYOffset;
        this.levelBadge = this.addLevelBadge(settingsBtn);
        if (this.levelBadge) {
            this.levelBadge.y = settingsYOffset;
        }
        this.pauseWindow = new PauseWindow(this);
        this.newPieceWindow = new NewPieceWindow(this);
        this.levelEndDialog = new LevelEndDialog(this);

        this.inputBlocker = this.add.rectangle(0, 0, this.cameras.main.width, this.headerHeight, 0x000000, 0.0);
        this.inputBlocker.setOrigin(0, 0);
        this.inputBlocker.setInteractive();
        this.inputBlocker.setDepth(99);
        this.inputBlocker.visible = false;
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
            if (this.newPieceWindow && this.newPieceWindow.visible) return;
            if (!this.isPlayerTurn) return;
            
            const boardPos = this.board.getBoardPosition(pointer.x, pointer.y);
            if (!boardPos) {
                if ((this.activeTutorial && this.activeTutorial.isActive()) || this.tapIndicator) {
                    return;
                }
                this.board.clearHighlights();
                this.selectedPiece = null;
                this.selectedEnemy = null;
                return;
            }
            
            const clickedPiece = this.board.getPieceAt(boardPos.x, boardPos.y);

            if (this.restrictSelectionToEnemyKing) {
                const king = this.findPiece('king', 'black');
                if (!king) {
                    this.restrictSelectionToEnemyKing = false;
                } else {
                    const isKingTarget = boardPos.x === king.boardX && boardPos.y === king.boardY;
                    if (!isKingTarget) {
                        return;
                    }
                }
            }

            if (this.restrictSelectionToKnight) {
                const knight = this.findPiece('knight', 'white');
                if (!knight) {
                    this.restrictSelectionToKnight = false;
                } else {
                    const isKnightTarget = boardPos.x === knight.boardX && boardPos.y === knight.boardY;
                    if (!isKnightTarget) {
                        return;
                    }
                }
            }

            if (this.levelId === 1 && this.requireKingCapture) {
                const king = this.findPiece('king', 'black');
                const isKingTarget = king && boardPos.x === king.boardX && boardPos.y === king.boardY;
                const isWhitePiece = clickedPiece && clickedPiece.color === 'white';
                if (!isKingTarget && !isWhitePiece) {
                    return;
                }
            }
            
            if (this.selectedPiece && this.validMoves.some(m => m.x === boardPos.x && m.y === boardPos.y)) {
                this.hideTapIndicator();
                this.makeMove(this.selectedPiece, boardPos.x, boardPos.y);
            } else if (clickedPiece && clickedPiece.color === 'white') {
                if (this.levelId === 1 && this.requireKingCapture && clickedPiece.unit === 'knight') {
                    return;
                }
                if (this.restrictSelectionToKnight && clickedPiece.unit === 'knight') {
                    this.showTapIndicatorOverEnemyKingRestricted();
                }
                this.maybeDismissTapIndicator(clickedPiece);
                if (this.selectedPiece === clickedPiece) {
                    this.board.clearHighlights();
                    this.selectedPiece = null;
                    this.validMoves = [];
                } else {
                    this.selectPiece(clickedPiece);
                }
                this.selectedEnemy = null;
            } else if (clickedPiece && clickedPiece.color === 'black') {
                if (this.restrictToKnightSelection) return;
                if (this.restrictSelectionToEnemyKing && clickedPiece.unit === 'king') {
                    this.showTapIndicatorOverKnightRestricted();
                }
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

    startTutorialIfNeeded() {
        const tutorialFlows = {
            1: [
                [1, 'The knight looks like a horse. It can move in an L shape. Click on your knight to see the spaces it can move to.']
            ],
            2: [
                [2, 'Enemy pieces strike back. Click on an enemy to see dangerous tiles that you should avoid.'],
            ],
            3: [
                [3, 'A new enemy! You can tap and hold on enemies for more info!']
            ]
        };

        const steps = tutorialFlows[this.levelId];
        if (!steps || !steps.length) {
            return;
        }

        const handleDismiss = () => {
            this.activeTutorial = null;
            if (this.levelId === 1) {
                this.showTapIndicatorOverKnight();
            }
            if (this.levelId === 2) {
                this.showTapIndicatorOverEnemyKingRestricted();
            }
        };

        this.activeTutorial = new TutorialInstruction(this, steps, handleDismiss);
    }

    ensureTapAnimation() {
        if (this.anims.exists('tutorial_tap')) {
            return;
        }
        this.anims.create({
            key: 'tutorial_tap',
            frames: [
                { key: 'ui', frame: 'tutorial_up.png' },
                { key: 'ui', frame: 'tutorial_down.png' }
            ],
            frameRate: 2,
            yoyo: true,
            repeat: -1
        });
    }

    showTapIndicatorOverKnight() {
        const knight = this.findPiece('knight', 'white');
        if (!knight) {
            return;
        }
        this.requireKingCapture = false;
        this.restrictToKnightSelection = true;
        this.showTapIndicatorForPiece(knight);
    }

    showTapIndicatorOverKing() {
        const king = this.findPiece('king', 'black');
        if (!king) {
            return;
        }
        this.showTapIndicatorForPiece(king);
        this.requireKingCapture = true;
    }

    showTapIndicatorOverEnemyKingRestricted() {
        const king = this.findPiece('king', 'black');
        if (!king) {
            return;
        }
        this.showTapIndicatorForPiece(king);
        this.restrictSelectionToEnemyKing = true;
    }

    showTapIndicatorOverKnightRestricted() {
        const knight = this.findPiece('knight', 'white');
        if (!knight) {
            return;
        }
        this.showTapIndicatorForPiece(knight);
        this.restrictSelectionToKnight = true;
    }

    hideTapIndicator() {
        if (!this.tapIndicator) {
            return;
        }
        if (this.tapIndicator.anims) {
            this.tapIndicator.anims.stop();
        }
        this.tapIndicator.destroy();
        this.tapIndicator = null;
        this.inputBlocker.visible = false;
        this.requireKingCapture = false;
        this.restrictSelectionToEnemyKing = false;
        this.restrictSelectionToKnight = false;
        this.restrictToKnightSelection = false;
    }

    maybeDismissTapIndicator(piece) {
        if (!this.tapIndicator) {
            return;
        }
        if (this.levelId !== 1) {
            return;
        }
        if (this.requireKingCapture) {
            return;
        }
        if (piece && piece.unit === 'knight' && piece.color === 'white') {
            this.hideTapIndicator();
            this.showLevelOneFollowupTutorial();
        }
    }

    showTapIndicatorForPiece(piece, offsetX, offsetY) {
        if (!piece || !this.board) {
            return;
        }

        const xOffset = offsetX !== undefined ? offsetX : TAP_INDICATOR_OFFSET.x;
        const yOffset = offsetY !== undefined ? offsetY : TAP_INDICATOR_OFFSET.y;

        this.hideTapIndicator();

        const indicator = this.add.sprite(
            piece.x + xOffset,
            piece.y + yOffset,
            'ui',
            'tutorial_up.png'
        );
        indicator.setScale(0.9);
        indicator.setDepth(100);
        if (this.anims.exists('tutorial_tap')) {
            indicator.play('tutorial_tap');
        }

        this.tapIndicator = indicator;
        this.inputBlocker.visible = true;
    }

    showLevelOneFollowupTutorial() {
        if (this.levelId !== 1) {
            return;
        }
        if (this.levelOneFollowupShown) {
            return;
        }
        if (this.activeTutorial && typeof this.activeTutorial.isActive === 'function' && this.activeTutorial.isActive()) {
            return;
        }

        this.levelOneFollowupShown = true;

        const steps = [
            [1, 'The goal of every level is to take the enemy king. Click on the king to win!']
        ];

        const handleDismiss = () => {
            this.activeTutorial = null;
            this.showTapIndicatorOverKing();
        };

        this.activeTutorial = new TutorialInstruction(this, steps, handleDismiss);
    }

    findPiece(unit, color) {
        if (!this.board || !Array.isArray(this.board.pieces)) {
            return null;
        }
        return this.board.pieces.find(piece => piece.unit === unit && piece.color === color) || null;
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
        const isCapture = targetPiece !== null && targetPiece !== undefined;

        // Move the piece with a callback for when movement completes
        piece.moveTo(toX, toY, () => {
            // Remove the target piece after movement completes
            if (targetPiece) {
                // Play capture sound
                console.log('Player capturing piece - SfxMuted:', Gameplay.SfxMuted);
                if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                    console.log('Playing piece_hit sound for player capture');
                    this.sound.playAudioSprite('soundbank', 'piece_hit');
                }
                this.board.removePiece(targetPiece);
                if (targetPiece.unit === 'king' && targetPiece.color === 'black') {
                    this.winLevel();
                    return;
                }
            }

            // Immediate enemy retaliation check (no delay)
            this.enemyRetaliation(toX, toY);
        }, isCapture);
        
        this.moveCount++;
        
        this.board.clearHighlights();
        this.selectedPiece = null;
        this.selectedEnemy = null;
    }

    enemyRetaliation(playerX, playerY) {
        console.log('=== Enemy Retaliation Check ===');
        console.log(`Player moved to: (${playerX}, ${playerY})`);
        
        const enemyPieces = this.board.pieces.filter(p => p.color === 'black');
        const playerPieces = this.board.pieces.filter(p => p.color === 'white');
        
        console.log(`Found ${enemyPieces.length} enemy pieces`);
        console.log(`Found ${playerPieces.length} player pieces`);
        
        let hasRetaliation = false;
        
        // Check each enemy piece for possible attacks
        for (let enemy of enemyPieces) {
            console.log(`\nChecking enemy ${enemy.unit} at board position (${enemy.boardX}, ${enemy.boardY})`);
            const moves = enemy.getValidMoves();
            console.log(`  Valid moves:`, moves.map(m => `(${m.x},${m.y})`).join(' '));
            
            // Find all player pieces this enemy can attack
            let possibleTargets = [];
            for (let playerPiece of playerPieces) {
                console.log(`  Checking if can attack ${playerPiece.unit} at board position (${playerPiece.boardX}, ${playerPiece.boardY})`);
                const canAttack = moves.some(m => m.x === playerPiece.boardX && m.y === playerPiece.boardY);
                if (canAttack) {
                    const distance = Math.abs(enemy.boardX - playerPiece.boardX) + Math.abs(enemy.boardY - playerPiece.boardY);
                    console.log(`    YES! Can attack. Distance: ${distance}`);
                    possibleTargets.push({ piece: playerPiece, distance: distance });
                } else {
                    console.log(`    No, cannot attack`);
                }
            }
            
            // If this enemy can attack any player piece, attack the closest one
            if (possibleTargets.length > 0) {
                hasRetaliation = true;
                // Sort by distance and take the closest target
                possibleTargets.sort((a, b) => a.distance - b.distance);
                const target = possibleTargets[0].piece;
                
                console.log(`  >>> ATTACKING: ${target.unit} at board position (${target.boardX}, ${target.boardY})`);
                
                // Move enemy piece with callback to remove target after movement
                enemy.moveTo(target.boardX, target.boardY, () => {
                    // Play capture sound
                    console.log('Enemy capturing piece - SfxMuted:', Gameplay.SfxMuted);
                    if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                        console.log('Playing piece_hit sound for enemy capture');
                        this.sound.playAudioSprite('soundbank', 'piece_hit');
                    }
                    this.board.removePiece(target);
                    if (target.unit === 'knight') {
                        this.loseLevel('Your knight was captured!');
                    }
                    // Re-enable player turn after enemy move completes
                    this.isPlayerTurn = true;
                }, true);
                break; // Only one enemy moves per turn
            } else {
                console.log(`  No targets available for this enemy`);
            }
        }
        
        // If no enemy can retaliation, immediately enable player turn
        if (!hasRetaliation) {
            console.log('\nNo enemy retaliation possible');
            this.isPlayerTurn = true;
        }
        console.log('=== End Enemy Retaliation Check ===\n');
    }

    addLevelBadge(settingsButton) {
        const baseHeight = 420;
        const buttonScale = Math.max(Math.abs(settingsButton.scaleY || settingsButton.scaleX || 1), 0.01);
        const targetHeight = baseHeight * buttonScale;
        const targetY = settingsButton.y;
        const marginLeft = 20;

        const container = this.add.container(0, 0);
        container.setDepth(25);

        const colors = {
            baseDark: 0x3A2A10,
            baseMedium: 0x5A3A1F,
            baseLight: 0x7A5030,
            highlight: 0x8B6033
        };

        const labelStyle = {
            fontSize: `${Math.round(targetHeight * 0.42)}px`,
            fontFamily: 'Arial, sans-serif',
            color: '#F1D9AA',
            fontStyle: 'bold'
        };

        const labelText = this.add.text(0, 0, `LEVEL ${this.levelId}`, labelStyle);
        labelText.setOrigin(0.5, 0.5);

        const paddingX = targetHeight * 0.6;
        const panelWidth = Math.max(labelText.width + paddingX, targetHeight * 2.6);
        const panelHeight = targetHeight;
        const halfWidth = panelWidth / 2;
        const halfHeight = panelHeight / 2;
        const cornerCut = Math.min(panelHeight * 0.22, panelWidth * 0.12);
        const shadowOffset = Math.max(4, panelHeight * 0.06);
        const insetAmount = panelHeight * 0.08;

        const buttonPoints = [
            { x: -halfWidth, y: -halfHeight + cornerCut },
            { x: -halfWidth + cornerCut, y: -halfHeight },
            { x: halfWidth - cornerCut, y: -halfHeight },
            { x: halfWidth, y: -halfHeight + cornerCut },
            { x: halfWidth, y: halfHeight - cornerCut },
            { x: halfWidth - cornerCut, y: halfHeight },
            { x: -halfWidth + cornerCut, y: halfHeight },
            { x: -halfWidth, y: halfHeight - cornerCut }
        ];

        const shadowPoints = buttonPoints.map(p => ({ x: p.x + shadowOffset, y: p.y + shadowOffset }));
        const insetButtonPoints = buttonPoints.map(p => {
            const vector = new Phaser.Math.Vector2(p.x, p.y);
            const length = vector.length();
            if (length === 0) {
                return { x: 0, y: 0 };
            }
            const scale = Math.max((length - insetAmount) / length, 0);
            return { x: vector.x * scale, y: vector.y * scale };
        });

        const highlightPolygon = [
            buttonPoints[0], buttonPoints[1], buttonPoints[2], buttonPoints[3],
            insetButtonPoints[3], insetButtonPoints[2], insetButtonPoints[1], insetButtonPoints[0]
        ];

        const shadowPolygon = [
            buttonPoints[4], buttonPoints[5], buttonPoints[6], buttonPoints[7],
            insetButtonPoints[7], insetButtonPoints[6], insetButtonPoints[5], insetButtonPoints[4]
        ];

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.35);
        graphics.fillPoints(shadowPoints, true);

        graphics.fillStyle(colors.baseMedium);
        graphics.fillPoints(buttonPoints, true);

        graphics.fillStyle(colors.highlight);
        graphics.fillPoints(highlightPolygon, true);

        graphics.fillStyle(colors.baseDark);
        graphics.fillPoints(shadowPolygon, true);

        graphics.fillStyle(colors.baseLight);
        graphics.fillPoints(insetButtonPoints, true);

        container.add(graphics);
        container.add(labelText);

        container.setPosition(marginLeft + halfWidth, targetY);

        // Make the button interactive
        const hitArea = new Phaser.Geom.Polygon(buttonPoints);
        container.setInteractive(hitArea, Phaser.Geom.Polygon.Contains);
        container.input.cursor = 'pointer';

        // Add hover effect
        const originalScale = container.scale;
        container.on('pointerover', () => {
            if (this.activeTutorial && this.activeTutorial.isActive() || this.tapIndicator) return;
            // Play button hover sound
            if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                this.sound.playAudioSprite('soundbank', 'button_hover', { volume: 0.35 });
            }
            this.tweens.add({
                targets: container,
                scaleX: originalScale * 1.07,
                scaleY: originalScale * 1.07,
                duration: 150,
                ease: 'Sine.easeInOut'
            });
        });
        
        container.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 150,
                ease: 'Sine.easeInOut'
            });
        });
        
        // Click to open pause window
        container.on('pointerup', () => {
            if (this.activeTutorial && this.activeTutorial.isActive() || this.tapIndicator) return;
            // Play button click sound
            if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                this.sound.playAudioSprite('soundbank', 'button_click');
            }
            this.pauseWindow.show();
        });

        labelText.setDepth(1);
        this.levelLabelText = labelText;
        return container;
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
                gearShadow: 0xB09060, // A darker shade for the gear shadow
                gearBase: 0xE0C89A,
                gearHighlight: 0xF0D8AA
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
            if (this.activeTutorial && this.activeTutorial.isActive() || this.tapIndicator) return;
            // Play button hover sound
            if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                this.sound.playAudioSprite('soundbank', 'button_hover', { volume: 0.35 });
            }
            settingsButton.setScale(scale * 1.07); // Proportional hover scale
        });
        
        settingsButton.on('pointerout', () => {
            settingsButton.setScale(scale);
        });
        
        // Click to open pause window
        settingsButton.on('pointerup', () => {
            if (this.activeTutorial && this.activeTutorial.isActive() || this.tapIndicator) return;
            // Play button click sound
            if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                this.sound.playAudioSprite('soundbank', 'button_click');
            }
            this.pauseWindow.show();
        });

        return settingsButton;
    }

    winLevel() {
        this.isPlayerTurn = false;
        this.messageText.setText('');

        const completed = PlayerData.Instance.GetNumber('chessmate_completed', 0);
        if (this.levelId > completed) {
            PlayerData.Instance.SetNumber('chessmate_completed', this.levelId);
        }

        const hasNextLevel = this.levelIndex < LEVELS.length - 1;
        const showMenuButton = this.levelId > 2;

        const onPrimary = () => {
            if (hasNextLevel) {
                this.stopMusicOnShutdown = false;
                this.scene.restart({ levelIndex: this.levelIndex + 1 });
            } else {
                this.scene.start('LevelSelect');
            }
        };

        const onMenu = () => {
            this.scene.start('LevelSelect');
        };

        // Start particles early for instant effect
        this.levelEndDialog.startParticlesEarly(true);

        // Show the dialog with a slight delay for better effect
        this.time.delayedCall(100, () => {
            this.levelEndDialog.show({
                isWin: true,
                onPrimary,
                onMenu: showMenuButton ? onMenu : null,
                showMenuButton,
                primaryLabel: hasNextLevel ? 'Next Level' : 'Level Select'
            });
        });
    }

    loseLevel(reason) {
        this.isPlayerTurn = false;
        this.messageText.setText('');

        const showMenuButton = this.levelId > 2;

        const onRetry = () => {
            this.stopMusicOnShutdown = false;
            this.scene.restart({ levelIndex: this.levelIndex });
        };

        const onMenu = () => {
            this.scene.start('LevelSelect');
        };

        // Start particles early for instant effect
        this.levelEndDialog.startParticlesEarly(false);

        // Show the dialog with a slight delay for better effect
        this.time.delayedCall(100, () => {
            this.levelEndDialog.show({
                isWin: false,
                onPrimary: onRetry,
                onMenu: showMenuButton ? onMenu : null,
                showMenuButton,
                primaryLabel: 'Retry'
            });
        });
    }
}
