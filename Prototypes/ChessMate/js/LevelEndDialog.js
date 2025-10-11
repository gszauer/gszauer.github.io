class LevelEndDialog extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        scene.add.existing(this);

        this.buttonSpacing = 520;
        this.isClosing = false;

        this.buildDialog();
        this.setupParticles();
        this.setVisible(false);
        this.setAlpha(0);
        this.setDepth(1200);
    }

    buildDialog() {
        const camera = this.scene.cameras.main;
        const width = camera.width;
        const height = camera.height;

        this.blocker = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.65);
        this.blocker.setOrigin(0, 0);
        this.blocker.setInteractive();
        this.blocker.setAlpha(0);
        this.add(this.blocker);

        const windowWidth = 1100;
        const windowHeight = 950;
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;

        this.windowRoot = this.scene.add.container(width / 2, height / 2);
        this.windowRoot.setScale(0.85);
        this.windowRoot.setAlpha(0);
        this.add(this.windowRoot);

        const background = SettingsWindow.createWindowBackground(this.scene, 0, 0, windowWidth, windowHeight);
        background.setPosition(0, 0);
        this.windowRoot.add(background);

        this.titleText = this.scene.add.text(0, -windowHeight / 2 + 115, 'Victory!', {
            fontSize: '120px',
            fontFamily: 'Arial, sans-serif',
            color: '#4A2C17',
            fontStyle: 'bold'
        });
        this.titleText.setOrigin(0.5, 0.5);
        this.windowRoot.add(this.titleText);

        this.bannerImage = this.scene.add.image(0, 0, 'ui', 'player_win.png');
        this.bannerImage.setOrigin(0.5, 0.5);
        const bannerTargetWidth = windowWidth - 40;
        const bannerScale = bannerTargetWidth / this.bannerImage.width;
        this.bannerImage.setScale(bannerScale);
        this.bannerImage.setY(this.titleText.y + this.bannerImage.displayHeight / 2 + 80);
        this.windowRoot.add(this.bannerImage);

        const buttonY = windowHeight / 2 - 180;
        this.primaryButton = this.createActionButton(0, buttonY, 'Next Level');
        this.menuButton = this.createActionButton(0, buttonY, 'Back to Menu');

        this.windowRoot.add(this.primaryButton.container);
        this.windowRoot.add(this.menuButton.container);
    }

    setupParticles() {
        this.particleGroups = {
            win: this.createParticleGroup('win', {
                fill: 0xF2D089,
                stroke: 0xFFFFFF,
                blendMode: Phaser.BlendModes.ADD,
                gravity: 150,
                quantity: 25
            }),
            lose: this.createParticleGroup('lose', {
                fill: 0x2A2A2A,
                stroke: 0x000000,
                blendMode: Phaser.BlendModes.NORMAL,
                gravity: 200,
                quantity: 20
            })
        };

        this.activeParticleGroup = null;
    }

    createParticleGroup(suffix, options) {
        const types = ['pawn', 'rook', 'knight'];
        const group = [];
        types.forEach((type, index) => {
            const key = `level-end-${suffix}-${type}`;
            this.generatePieceTexture(key, options.fill, options.stroke, type);

            const emitter = this.scene.add.particles(0, 0, key, {
                emitting: false,
                lifespan: 4250,
                gravityY: options.gravity,
                speed: { min: 400, max: 800 },
                angle: { min: 0, max: 360 },
                rotate: { min: -720, max: 720 },
                alpha: 1,
                scale: { start: 1.2 - index * 0.1, end: 0.3 },
                frequency: -1,
                quantity: options.quantity,
                blendMode: options.blendMode,
                follow: this.windowRoot,
                followOffset: { x: 0, y: 0 },
                emitZone: {
                    type: 'random',
                    source: new Phaser.Geom.Circle(0, 0, 20)
                }
            });

            emitter.setVisible(false);
            emitter.setDepth(-5);
            this.addAt(emitter, 1);

            group.push({ manager: emitter, emitter });
        });

        return group;
    }

    generatePieceTexture(key, fillColor, strokeColor, type) {
        if (this.scene.textures.exists(key)) {
            return;
        }

        const size = 96;
        const centerX = size / 2;
        const centerY = size / 2;
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.clear();
        graphics.fillStyle(fillColor, 1);
        graphics.lineStyle(Math.max(2, size * 0.05), strokeColor, 0.85);

        switch (type) {
            case 'rook':
                this.drawRook(graphics, centerX, centerY, size);
                break;
            case 'knight':
                this.drawKnight(graphics, centerX, centerY, size, fillColor, strokeColor);
                break;
            case 'pawn':
            default:
                this.drawPawn(graphics, centerX, centerY, size);
                break;
        }

        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    drawPawn(graphics, cx, cy, size) {
        const headRadius = size * 0.18;
        const bodyWidth = size * 0.28;
        const bodyHeight = size * 0.24;
        const baseWidth = size * 0.42;
        const baseHeight = size * 0.12;

        graphics.fillCircle(cx, cy - size * 0.16, headRadius);
        graphics.strokeCircle(cx, cy - size * 0.16, headRadius);

        graphics.fillRect(cx - bodyWidth / 2, cy - bodyHeight / 2, bodyWidth, bodyHeight);
        graphics.strokeRect(cx - bodyWidth / 2, cy - bodyHeight / 2, bodyWidth, bodyHeight);

        graphics.fillRect(cx - baseWidth / 2, cy + bodyHeight / 2, baseWidth, baseHeight);
        graphics.strokeRect(cx - baseWidth / 2, cy + bodyHeight / 2, baseWidth, baseHeight);
    }

    drawRook(graphics, cx, cy, size) {
        const towerWidth = size * 0.36;
        const towerHeight = size * 0.36;
        const baseWidth = size * 0.52;
        const baseHeight = size * 0.14;
        const battlementWidth = size * 0.12;
        const battlementHeight = size * 0.12;

        const towerTop = cy - towerHeight / 2;

        graphics.fillRect(cx - towerWidth / 2, towerTop, towerWidth, towerHeight);
        graphics.strokeRect(cx - towerWidth / 2, towerTop, towerWidth, towerHeight);

        for (let i = -1; i <= 1; i++) {
            const x = cx + i * battlementWidth * 0.95;
            graphics.fillRect(x - battlementWidth / 2, towerTop - battlementHeight, battlementWidth, battlementHeight);
            graphics.strokeRect(x - battlementWidth / 2, towerTop - battlementHeight, battlementWidth, battlementHeight);
        }

        const baseY = towerTop + towerHeight;
        graphics.fillRect(cx - baseWidth / 2, baseY, baseWidth, baseHeight);
        graphics.strokeRect(cx - baseWidth / 2, baseY, baseWidth, baseHeight);
    }

    drawKnight(graphics, cx, cy, size, fillColor, strokeColor) {
        const neckHeight = size * 0.24;
        const neckWidth = size * 0.16;
        const snoutLength = size * 0.24;
        const headHeight = size * 0.28;
        const baseWidth = size * 0.48;
        const baseHeight = size * 0.12;

        const startY = cy + neckHeight / 2;

        graphics.beginPath();
        graphics.moveTo(cx - neckWidth, startY);
        graphics.lineTo(cx - neckWidth * 0.8, cy - headHeight);
        graphics.lineTo(cx + snoutLength * 0.1, cy - headHeight * 1.1);
        graphics.lineTo(cx + snoutLength, cy - headHeight * 0.6);
        graphics.lineTo(cx + neckWidth, cy - headHeight * 0.2);
        graphics.lineTo(cx + neckWidth * 0.9, cy + neckHeight * 0.4);
        graphics.lineTo(cx + baseWidth / 2, startY + baseHeight);
        graphics.lineTo(cx - baseWidth / 2, startY + baseHeight);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();

        graphics.fillStyle(strokeColor, 0.9);
        graphics.fillCircle(cx + snoutLength * 0.45, cy - headHeight * 0.7, size * 0.04);
        graphics.fillStyle(fillColor, 1);
    }

    createActionButton(x, y, label) {
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        container.add(graphics);

        const buttonWidth = 220;
        const buttonHeight = 95;
        const cornerCut = 22;
        const shadowOffset = 6;

        const basePoints = [
            { x: -buttonWidth, y: -buttonHeight + cornerCut },
            { x: -buttonWidth + cornerCut, y: -buttonHeight },
            { x: buttonWidth - cornerCut, y: -buttonHeight },
            { x: buttonWidth, y: -buttonHeight + cornerCut },
            { x: buttonWidth, y: buttonHeight - cornerCut },
            { x: buttonWidth - cornerCut, y: buttonHeight },
            { x: -buttonWidth + cornerCut, y: buttonHeight },
            { x: -buttonWidth, y: buttonHeight - cornerCut }
        ];

        const shadowPoints = basePoints.map(p => ({ x: p.x + shadowOffset, y: p.y + shadowOffset }));
        const insetPoints = basePoints.map(p => ({ x: p.x * 0.9, y: p.y * 0.85 }));

        const highlightPolygon = [
            basePoints[0], basePoints[1], basePoints[2], basePoints[3],
            insetPoints[3], insetPoints[2], insetPoints[1], insetPoints[0]
        ];

        const shadowPolygon = [
            basePoints[4], basePoints[5], basePoints[6], basePoints[7],
            insetPoints[7], insetPoints[6], insetPoints[5], insetPoints[4]
        ];

        const colors = {
            base: 0x7A5030,
            highlight: 0x9B7043,
            shadow: 0x4A2C17,
            hoverBase: 0xA06B3E,
            hoverHighlight: 0xC88A56
        };

        let currentBase = colors.base;
        let currentHighlight = colors.highlight;

        const drawButton = () => {
            graphics.clear();
            graphics.fillStyle(0x000000, 0.25);
            graphics.fillPoints(shadowPoints, true);

            graphics.fillStyle(currentBase);
            graphics.fillPoints(basePoints, true);

            graphics.fillStyle(currentHighlight);
            graphics.fillPoints(highlightPolygon, true);

            graphics.fillStyle(colors.shadow);
            graphics.fillPoints(shadowPolygon, true);

            graphics.fillStyle(currentBase);
            graphics.fillPoints(insetPoints, true);
        };

        drawButton();

        const labelText = this.scene.add.text(0, 0, label, {
            fontSize: '66px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        labelText.setOrigin(0.5, 0.5);
        container.add(labelText);

        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth, -buttonHeight, buttonWidth * 2, buttonHeight * 2);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        container.input.cursor = 'pointer';

        container.on('pointerover', () => {
            // Play button hover sound
            if (!Gameplay.SfxMuted && this.scene.sound && this.scene.sound.playAudioSprite) {
                this.scene.sound.playAudioSprite('soundbank', 'button_hover', { volume: 0.35 });
            }
            currentBase = colors.hoverBase;
            currentHighlight = colors.hoverHighlight;
            drawButton();
            container.setScale(1.05);
        });

        container.on('pointerout', () => {
            currentBase = colors.base;
            currentHighlight = colors.highlight;
            drawButton();
            container.setScale(1);
        });

        container.on('pointerdown', () => {
            container.setScale(0.98);
        });

        container.on('pointerup', () => {
            // Play button click sound
            if (!Gameplay.SfxMuted && this.scene.sound && this.scene.sound.playAudioSprite) {
                this.scene.sound.playAudioSprite('soundbank', 'button_click');
            }
            container.setScale(1);
            if (container._pressHandler) {
                container._pressHandler();
            }
        });

        return {
            container,
            label: labelText,
            setLabel: (text) => {
                labelText.setText(text);
                labelText.setOrigin(0.5, 0.5);
            },
            setHandler: (fn) => {
                container._pressHandler = fn ? () => {
                    if (!this.isClosing && container.input.enabled) {
                        fn();
                    }
                } : null;
            },
            setVisible: (visible) => {
                container.setVisible(visible);
                container.input.enabled = visible;
            }
        };
    }

    startParticlesEarly(isWin) {
        // Start particles immediately, even before the dialog is visible
        this.setVisible(true);
        this.setAlpha(1);
        this.switchParticles(isWin ? 'win' : 'lose');
        // Hide the dialog again until show() is called
        this.setVisible(false);
        this.setAlpha(0);
    }

    show(config) {
        const {
            isWin,
            onPrimary,
            onMenu,
            showMenuButton,
            primaryLabel,
            bannerFrame
        } = config;

        this.isClosing = false;
        this.setVisible(true);
        this.setAlpha(1);

        this.titleText.setText(isWin ? 'Victory!' : 'Defeat!');

        // Play win or lose sound effect
        if (!Gameplay.SfxMuted && this.scene.sound && this.scene.sound.playAudioSprite) {
            const soundToPlay = isWin ? 'win' : 'loose';
            this.scene.sound.playAudioSprite('soundbank', soundToPlay, { volume: 0.35 });
        }

        // Start particles if not already started
        if (!this.activeParticleGroup) {
            this.switchParticles(isWin ? 'win' : 'lose');
        }

        if (bannerFrame) {
            this.bannerImage.setFrame(bannerFrame);
        } else {
            this.bannerImage.setFrame(isWin ? 'player_win.png' : 'player_loss.png');
        }

        const bannerTargetWidth = this.windowWidth - 40;
        const newScale = bannerTargetWidth / this.bannerImage.width;
        this.bannerImage.setScale(newScale);
        this.bannerImage.setY(this.titleText.y + this.bannerImage.displayHeight / 2 + 80);

        const label = primaryLabel ? primaryLabel : (isWin ? 'Next Level' : 'Retry');
        this.primaryButton.setLabel(label);
        this.primaryButton.setHandler(() => {
            this.hide(onPrimary);
        });

        if (showMenuButton) {
            this.menuButton.setLabel('Back to Menu');
            this.menuButton.setHandler(() => {
                this.hide(onMenu);
            });
            this.menuButton.container.x = -this.buttonSpacing / 2;
            this.menuButton.setVisible(true);
            this.primaryButton.container.x = this.buttonSpacing / 2;
        } else {
            this.menuButton.setHandler(null);
            this.menuButton.setVisible(false);
            this.primaryButton.container.x = 0;
        }

        this.blocker.alpha = 0;
        this.windowRoot.alpha = 0;
        this.windowRoot.setScale(0.85);

        this.scene.tweens.add({
            targets: this.blocker,
            alpha: 0.65,
            duration: 220,
            ease: 'Quad.easeOut'
        });

        this.playBounceIn();
    }

    hide(onComplete) {
        if (this.isClosing) {
            return;
        }
        this.isClosing = true;

        this.stopParticles();

        this.scene.tweens.add({
            targets: this.blocker,
            alpha: 0,
            duration: 180,
            ease: 'Quad.easeIn'
        });

        this.playBounceOut(() => {
            this.setVisible(false);
            this.setAlpha(0);
            this.windowRoot.setScale(0.85);
            this.windowRoot.setAlpha(0);
            this.isClosing = false;
            if (onComplete) {
                onComplete();
            }
        });
    }

    playBounceIn() {
        if (this.openTimeline) {
            this.openTimeline.remove();
            this.openTimeline = null;
        }

        this.windowRoot.setScale(0.78);
        this.windowRoot.setAlpha(0);

        this.openTimeline = this.scene.tweens.chain({
            targets: this.windowRoot,
            tweens: [
                {
                    alpha: 1,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 260,
                    ease: 'Back.Out'
                },
                {
                    scaleX: 0.96,
                    scaleY: 0.96,
                    duration: 120,
                    ease: 'Quad.easeInOut'
                },
                {
                    scaleX: 1,
                    scaleY: 1,
                    duration: 140,
                    ease: 'Quad.easeOut'
                }
            ],
            onComplete: () => {
                this.openTimeline = null;
            }
        });
    }

    playBounceOut(onComplete) {
        if (this.closeTimeline) {
            this.closeTimeline.remove();
            this.closeTimeline = null;
        }

        this.closeTimeline = this.scene.tweens.chain({
            targets: this.windowRoot,
            tweens: [
                {
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 90,
                    ease: 'Quad.easeOut'
                },
                {
                    alpha: 0,
                    scaleX: 0.75,
                    scaleY: 0.75,
                    duration: 190,
                    ease: 'Quad.easeIn'
                }
            ],
            onComplete: () => {
                this.closeTimeline = null;
                if (onComplete) {
                    onComplete();
                }
            }
        });
    }

    switchParticles(key) {
        if (this.activeParticleGroup === key) {
            this.restartParticles();
            return;
        }

        this.stopParticles();
        const group = this.particleGroups[key];
        if (!group) {
            return;
        }

        group.forEach(({ emitter }) => {
            emitter.setVisible(true);
            this.setEmitterActive(emitter, true);
        });

        this.activeParticleGroup = key;
    }

    restartParticles() {
        if (!this.activeParticleGroup) {
            return;
        }
        const group = this.particleGroups[this.activeParticleGroup];
        group.forEach(({ emitter }) => {
            emitter.explode();
        });
    }

    stopParticles() {
        if (!this.activeParticleGroup) {
            return;
        }

        const group = this.particleGroups[this.activeParticleGroup];
        group.forEach(({ emitter }) => {
            this.setEmitterActive(emitter, false);
            emitter.setVisible(false);
        });

        this.activeParticleGroup = null;
    }

    setEmitterActive(emitter, shouldEmit) {
        if (!emitter) {
            return;
        }

        if (shouldEmit) {
            emitter.explode();
        } else {
            emitter.stop();
        }
    }
}
