class NewPieceWindow extends Phaser.GameObjects.Container {
    static KNIGHT_MOVES = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    static KING_MOVES = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    static BISHOP_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    static ROOK_DIRECTIONS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    static QUEEN_DIRECTIONS = [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [0, 1], [0, -1], [1, 0], [-1, 0]
    ];

    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        scene.add.existing(this);

        this.boardSize = 5;
        this.tileSize = 120;
        this.boardPixelSize = this.boardSize * this.tileSize;
        this.boardOrigin = -this.boardPixelSize / 2;
        this.dotSpacing = this.tileSize * 0.55;
        this.dotRadius = this.tileSize * 0.12;

        this.createWindow();
        this.setDepth(1000);
        this.setVisible(false);
    }

    createWindow() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        this.blocker = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        this.blocker.setOrigin(0, 0);
        this.blocker.setInteractive();
        this.add(this.blocker);

        this.windowWidth = 1150;
        this.windowHeight = 1200;
        this.windowCenterX = width / 2;
        this.windowCenterY = height / 2;

        const windowContainer = SettingsWindow.createWindowBackground(
            this.scene,
            this.windowCenterX,
            this.windowCenterY,
            this.windowWidth,
            this.windowHeight
        );
        this.add(windowContainer);

        this.titleText = this.scene.add.text(
            this.windowCenterX,
            this.windowCenterY - this.windowHeight / 2 + 110,
            '',
            {
                fontSize: '110px',
                fontFamily: 'Arial, sans-serif',
                color: '#4A2C17',
                fontStyle: 'bold'
            }
        );
        this.titleText.setOrigin(0.5, 0.5);
        this.add(this.titleText);

        this.boardContainer = this.scene.add.container(this.windowCenterX, this.windowCenterY - 100);
        this.add(this.boardContainer);

        this.boardGraphics = this.scene.add.graphics();
        this.drawMiniBoard();
        this.boardContainer.add(this.boardGraphics);

        this.centerHighlight = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xF6F669, 0.25);
        this.centerHighlight.setOrigin(0.5, 0.5);
        this.boardContainer.add(this.centerHighlight);

        this.moveGraphics = this.scene.add.graphics();
        this.boardContainer.add(this.moveGraphics);

        this.pieceSprite = this.scene.add.image(0, -35, 'characters', 'enemy_rook.png');
        this.pieceSprite.setOrigin(0.5, 0.5);
        this.boardContainer.add(this.pieceSprite);

        const descriptionY = this.boardContainer.y + this.boardPixelSize / 2 + 90;
        this.descriptionText = this.scene.add.text(
            this.windowCenterX,
            descriptionY,
            '',
            {
                fontSize: '48px',
                fontFamily: 'Arial, sans-serif',
                color: '#4A2C17',
                align: 'center',
                wordWrap: { width: this.windowWidth - 280 }
            }
        );
        this.descriptionText.setOrigin(0.5, 0.5);
        this.add(this.descriptionText);

        const buttonY = descriptionY + this.tileSize + 50;
        this.createContinueButton(this.windowCenterX, buttonY);
    }

    drawMiniBoard() {
        this.boardGraphics.clear();
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const isLight = (x + y) % 2 === 0;
                const color = isLight ? COLORS.lightSquare : COLORS.darkSquare;
                const drawX = this.boardOrigin + x * this.tileSize;
                const drawY = this.boardOrigin + y * this.tileSize;

                this.boardGraphics.fillStyle(color, 1);
                this.boardGraphics.fillRect(drawX, drawY, this.tileSize, this.tileSize);
            }
        }
        this.boardGraphics.lineStyle(4, 0x000000, 0.6);
        this.boardGraphics.strokeRect(
            this.boardOrigin,
            this.boardOrigin,
            this.boardPixelSize,
            this.boardPixelSize
        );
    }

    createContinueButton(x, y) {
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        container.add(graphics);

        const colors = {
            baseDark: 0x3A2A10,
            baseMedium: 0x5A3A1F,
            baseLight: 0x7A5030,
            highlight: 0x8B6033,
            hoverBase: 0x6B4423,
            hoverHighlight: 0x9B7043
        };

        const buttonWidth = 200;
        const buttonHeight = 80;
        const cornerCut = 14;
        const shadowOffset = 3;

        const buttonPoints = [
            { x: -buttonWidth, y: -buttonHeight + cornerCut },
            { x: -buttonWidth + cornerCut, y: -buttonHeight },
            { x: buttonWidth - cornerCut, y: -buttonHeight },
            { x: buttonWidth, y: -buttonHeight + cornerCut },
            { x: buttonWidth, y: buttonHeight - cornerCut },
            { x: buttonWidth - cornerCut, y: buttonHeight },
            { x: -buttonWidth + cornerCut, y: buttonHeight },
            { x: -buttonWidth, y: buttonHeight - cornerCut }
        ];

        const shadowPoints = buttonPoints.map(p => ({ x: p.x + shadowOffset, y: p.y + shadowOffset }));
        const insetButtonPoints = buttonPoints.map(p => ({ x: p.x * 0.92, y: p.y * 0.85 }));

        const highlightPolygon = [
            buttonPoints[0], buttonPoints[1], buttonPoints[2], buttonPoints[3],
            insetButtonPoints[3], insetButtonPoints[2], insetButtonPoints[1], insetButtonPoints[0]
        ];

        const shadowPolygon = [
            buttonPoints[4], buttonPoints[5], buttonPoints[6], buttonPoints[7],
            insetButtonPoints[7], insetButtonPoints[6], insetButtonPoints[5], insetButtonPoints[4]
        ];

        let currentBaseColor = colors.baseMedium;
        let currentHighlightColor = colors.highlight;

        const drawButton = () => {
            graphics.clear();
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillPoints(shadowPoints, true);

            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(buttonPoints, true);

            graphics.fillStyle(currentHighlightColor);
            graphics.fillPoints(highlightPolygon, true);

            graphics.fillStyle(colors.baseDark);
            graphics.fillPoints(shadowPolygon, true);

            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(insetButtonPoints, true);
        };

        drawButton();

        const buttonText = this.scene.add.text(0, 0, 'CONTINUE', {
            fontSize: '60px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5, 0.5);
        container.add(buttonText);

        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth, -buttonHeight, buttonWidth * 2, buttonHeight * 2);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        container.input.cursor = 'pointer';

        container.on('pointerover', () => {
            // Play button hover sound
            if (!Gameplay.SfxMuted && this.scene.sound && this.scene.sound.playAudioSprite) {
                this.scene.sound.playAudioSprite('soundbank', 'button_hover', { volume: 0.35 });
            }
            currentBaseColor = colors.hoverBase;
            currentHighlightColor = colors.hoverHighlight;
            drawButton();
            container.setScale(1.05);
        });

        container.on('pointerout', () => {
            currentBaseColor = colors.baseMedium;
            currentHighlightColor = colors.highlight;
            drawButton();
            container.setScale(1.0);
        });

        container.on('pointerup', () => {
            // Play button click sound
            if (!Gameplay.SfxMuted && this.scene.sound && this.scene.sound.playAudioSprite) {
                this.scene.sound.playAudioSprite('soundbank', 'button_click');
            }
            this.hide();
        });

        this.continueButton = container;
        this.add(container);
    }

    show(unit, color) {
        this.currentUnit = unit;
        this.currentColor = color;

        this.updatePieceSprite(unit, color);
        this.updateTitle(unit);
        this.updateDescription(unit, color);
        this.updateMoveIndicators(unit, color);

        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }

    updateTitle(unit) {
        const displayUnit = unit ? unit.toUpperCase() : '';
        this.titleText.setText(displayUnit);
    }

    updateDescription(unit, color) {
        const movementDescriptions = {
            king: 'The king can move one square in any direction.',
            queen: 'The queen sweeps any number of squares in any direction.',
            rook: 'The rook slides horizontally or vertically as far as needed.',
            bishop: 'The bishop glides along diagonals of its color.',
            knight: 'The knight jumps in an L-shape, leaping over pieces.',
            pawn: 'White pawns march straight ahead one square.'
        };

        const attackDescriptions = {
            king: 'The king threatens every adjacent square.',
            queen: 'The queen attacks along ranks, files, and diagonals at range.',
            rook: 'The rook strikes straight lines until blocked.',
            bishop: 'The bishop targets diagonals that match its color.',
            knight: 'The knight pounces in an L-shape to hit distant tiles.',
            pawn: 'Black pawns capture one square down-left or down-right.'
        };

        const copy = color === 'white' ? movementDescriptions : attackDescriptions;
        const prefix = color === 'white' ? 'Movement' : 'Attack';
        const body = copy[unit] || '';
        this.descriptionText.setText(body ? `${prefix}: ${body}` : '');
    }

    updatePieceSprite(unit, color) {
        const prefix = color === 'white' ? 'hero_' : 'enemy_';
        const frameName = `${prefix}${unit}.png`;
        if (this.scene.textures.exists('characters') && this.scene.textures.get('characters').has(frameName)) {
            this.pieceSprite.setTexture('characters', frameName);
        }
        const maxDimension = Math.max(this.pieceSprite.width, this.pieceSprite.height);
        if (maxDimension > 0) {
            const scale = (this.tileSize * 0.7) / maxDimension;
            this.pieceSprite.setScale(scale * 2);
        }
    }

    updateMoveIndicators(unit, color) {
        this.moveGraphics.clear();
        const dotColor = color === 'white' ? 0xFFFFFF : 0xFF4444;
        this.moveGraphics.fillStyle(dotColor, 1);

        const centerIndex = Math.floor(this.boardSize / 2);
        const targets = this.getMoveTargets(unit, color, centerIndex);

        targets.forEach(({ x, y }) => {
            const pos = this.tileCenter(x, y);
            this.moveGraphics.fillCircle(pos.x, pos.y, this.dotRadius);
        });
    }

    getMoveTargets(unit, color, centerIndex) {
        const moves = [];
        const withinBounds = (x, y) => x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
        const addTile = (x, y) => {
            if (withinBounds(x, y)) {
                moves.push({ x, y });
            }
        };

        const addRay = (dx, dy) => {
            let x = centerIndex + dx;
            let y = centerIndex + dy;
            while (withinBounds(x, y)) {
                addTile(x, y);
                x += dx;
                y += dy;
            }
        };

        switch (unit) {
            case 'rook':
                NewPieceWindow.ROOK_DIRECTIONS.forEach(([dx, dy]) => addRay(dx, dy));
                break;
            case 'bishop':
                NewPieceWindow.BISHOP_DIRECTIONS.forEach(([dx, dy]) => addRay(dx, dy));
                break;
            case 'queen':
                NewPieceWindow.QUEEN_DIRECTIONS.forEach(([dx, dy]) => addRay(dx, dy));
                break;
            case 'king':
                NewPieceWindow.KING_MOVES.forEach(([dx, dy]) => addTile(centerIndex + dx, centerIndex + dy));
                break;
            case 'knight':
                NewPieceWindow.KNIGHT_MOVES.forEach(([dx, dy]) => addTile(centerIndex + dx, centerIndex + dy));
                break;
            case 'pawn':
                if (color === 'white') {
                    addTile(centerIndex, centerIndex - 1);
                } else {
                    addTile(centerIndex - 1, centerIndex + 1);
                    addTile(centerIndex + 1, centerIndex + 1);
                }
                break;
        }

        return moves;
    }

    tileCenter(tileX, tileY) {
        return {
            x: this.boardOrigin + tileX * this.tileSize + this.tileSize / 2,
            y: this.boardOrigin + tileY * this.tileSize + this.tileSize / 2
        };
    }

}
