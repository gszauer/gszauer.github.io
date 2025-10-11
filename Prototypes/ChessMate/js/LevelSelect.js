class LevelSelect extends Phaser.Scene {
    constructor() {
        super('LevelSelect');
        // Set unlocked levels based on saved progress
        const completedLevels = PlayerData.Instance.GetNumber('chessmate_completed', 0);
        this.unlockedLevels = Math.min(completedLevels + 1, LEVELS.length);
        // Ensure at least 1 level is unlocked
        if (this.unlockedLevels < 1) this.unlockedLevels = 1;

        // Store references for updating
        this.levelIcons = [];
        this.pathGraphics = [];
        this.levelSelectMusic = null;
    }

    create() {
        // Check and update progress on scene start
        const completedLevels = PlayerData.Instance.GetNumber('chessmate_completed', 0);
        let newUnlockedLevels = Math.min(completedLevels + 1, LEVELS.length);
        if (newUnlockedLevels < 1) newUnlockedLevels = 1;
        
        // Only rebuild if progress changed
        if (newUnlockedLevels !== this.unlockedLevels) {
            this.unlockedLevels = newUnlockedLevels;
            
            // Clear old elements if they exist
            this.pathGraphics.forEach(g => g.destroy());
            this.pathGraphics = [];
            this.levelIcons.forEach(icon => icon.destroy());
            this.levelIcons = [];
        }
        
        this.addCheckerBackground();
        this.addMapHeader();
        this.createLevelPaths();
        this.createLevelIcons();
        this.addDebugButton();
        this.addSettingsButton();
        this.debugWindow = new DebugWindow(this);
        this.settingsWindow = new SettingsWindow(this);
        this.startLevelSelectMusic();
    }

    startLevelSelectMusic() {
        // Stop any existing music first to prevent stacking
        if (this.levelSelectMusic) {
            if (typeof this.levelSelectMusic.stop === 'function') {
                this.levelSelectMusic.stop();
            } else if (typeof this.levelSelectMusic.destroy === 'function') {
                this.levelSelectMusic.destroy();
            } else {
                // Last resort: stop all sounds from soundbank
                this.sound.stopByKey('soundbank');
            }
            this.levelSelectMusic = null;
        }

        // Only play music if not muted
        if (!Gameplay.BgmMuted) {
            this.levelSelectMusic = this.sound.playAudioSprite('soundbank', 'level_select_bg', {
                loop: true,
                volume: 0.1
            });
            console.log('Started level select music:', this.levelSelectMusic);
        }
    }

    updateMusicVolume() {
        // When muted, stop music completely. When unmuted, start it.
        if (Gameplay.BgmMuted) {
            // Stop and destroy music if it's playing
            if (this.levelSelectMusic) {
                if (typeof this.levelSelectMusic.stop === 'function') {
                    this.levelSelectMusic.stop();
                } else if (typeof this.levelSelectMusic.destroy === 'function') {
                    this.levelSelectMusic.destroy();
                } else {
                    // Last resort: stop all sounds from soundbank
                    this.sound.stopByKey('soundbank');
                }
                this.levelSelectMusic = null;
            }
        } else {
            // Start music if it's not playing
            if (!this.levelSelectMusic) {
                this.levelSelectMusic = this.sound.playAudioSprite('soundbank', 'level_select_bg', {
                    loop: true,
                    volume: 0.1
                });
            }
        }
    }

    shutdown() {
        // Stop music when leaving the scene
        if (this.levelSelectMusic) {
            console.log('Shutdown: stopping level select music');
            // For audio sprites, we need to use the sound's stop method if available
            if (typeof this.levelSelectMusic.stop === 'function') {
                this.levelSelectMusic.stop();
            } else if (typeof this.levelSelectMusic.destroy === 'function') {
                this.levelSelectMusic.destroy();
            } else {
                // Last resort: stop all sounds from soundbank
                this.sound.stopByKey('soundbank');
            }
            this.levelSelectMusic = null;
        }
    }
    
    addDebugButton() {
        const buttonSize = 120;  // 2x bigger
        const margin = 20;
        const x = margin;  // Upper left instead of upper right
        const y = margin;
        
        // Button background
        const debugButton = this.add.rectangle(x, y, buttonSize, buttonSize, 0x606060);
        debugButton.setOrigin(0, 0);
        debugButton.setInteractive({ useHandCursor: true });
        debugButton.setStrokeStyle(3, 0x404040);
        debugButton.setDepth(25);
        
        // Bug emoji
        const debugText = this.add.text(x + buttonSize / 2, y + buttonSize / 2, '🐞', {
            fontSize: '64px',  // 2x bigger
            fontFamily: 'Arial, sans-serif'
        });
        debugText.setOrigin(0.5, 0.5);
        debugText.setDepth(26);
        
        // Hover effect
        debugButton.on('pointerover', () => {
            debugButton.setFillStyle(0x808080);
        });
        
        debugButton.on('pointerout', () => {
            debugButton.setFillStyle(0x606060);
        });
        
        // Click to open debug window
        debugButton.on('pointerup', () => {
            this.debugWindow.show();
        });
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
            // Play button hover sound
            if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                this.sound.playAudioSprite('soundbank', 'button_hover', { volume: 0.35 });
            }
            settingsButton.setScale(scale * 1.07); // Proportional hover scale
        });
        
        settingsButton.on('pointerout', () => {
            settingsButton.setScale(scale);
        });
        
        // Click to open settings window
        settingsButton.on('pointerup', () => {
            // Play button click sound
            if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                this.sound.playAudioSprite('soundbank', 'button_click');
            }
            this.settingsWindow.show();
        });
    }
    
    addMapHeader() {
        const header = this.add.image(0, 0, 'ui', 'map_header.png');
        header.setOrigin(0, 0);
        
        // Scale to match screen width
        const screenWidth = this.cameras.main.width;
        const scale = screenWidth / header.width;
        header.setScale(scale);
        
        header.setDepth(20);
        
        // Add separator below header
        const separator = this.add.image(0, header.height * scale - 1, 'ui', 'header_seperator.png');
        separator.setOrigin(0, 0);
        
        // Scale separator to match screen width
        const separatorScale = screenWidth / separator.width;
        separator.setScale(separatorScale);
        
        separator.setDepth(20);
    }

    addCheckerBackground() {
        const ts = this.add.tileSprite(0, 0, 1400, 2556, 'checker');
        ts.setOrigin(0, 0);
    }

    createLevelPaths() {
        // Draw paths only between unlocked levels (stop at last unlocked level)
        for (let i = 0; i < Math.min(this.unlockedLevels - 1, LEVEL_POSITIONS.length - 1); i++) {
            if (i >= LEVELS.length - 1) break;
            
            const aGrid = LEVEL_POSITIONS[i];
            const bGrid = LEVEL_POSITIONS[i + 1];
            const points = this.generateTrailPoints(aGrid, bGrid);
            
            const g = this.add.graphics();
            g.fillStyle(0x808080, 1);  // Gray dots for path between levels
            g.setDepth(6);
            
            points.forEach(p => {
                g.fillCircle(p.x, p.y, DOT_RADIUS);
            });
            
            this.pathGraphics.push(g);
        }
    }

    createLevelIcons() {
        LEVEL_POSITIONS.slice(0, LEVELS.length).forEach((pos, i) => {
            const worldPos = this.gridToWorld(pos.gx, pos.gy);
            const isLocked = i >= this.unlockedLevels;
            this.addLevelIcon(worldPos, i + 1, isLocked, i);
        });
    }

    addLevelIcon(pos, label, isLocked, levelIndex) {
        const container = this.add.container(pos.x, pos.y);
        this.levelIcons.push(container);
        const key = isLocked ? 'silver_icon' : 'gold_icon';
        const circle = this.add.image(0, 0, key);
        circle.setDisplaySize(ICON_DIAMETER, ICON_DIAMETER);
        container.add(circle);
        container.setDepth(10);

        if (isLocked) {
            const lockGraphics = this.add.graphics();
            this.drawLock(lockGraphics, 0, 0, 0.45 * (ICON_DIAMETER / 65));
            lockGraphics.setDepth(12);
            container.add(lockGraphics);
        } else {
            const text = this.add.text(0, 0, String(label), {
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: Math.floor(ICON_DIAMETER * 0.42) + 'px',
                fontStyle: 'bold',
                color: '#000000'  // Black text on white checker
            });
            text.setOrigin(0.5, 0.54);
            text.setStroke('#FFFFFF', 2);  // White stroke for better contrast
            text.setShadow(0, 2, 'rgba(0,0,0,0.2)', 2);
            container.add(text);
        }

        if (!isLocked) {
            circle.setInteractive({ useHandCursor: true });
            
            circle.on('pointerover', () => {
                // Play level button hover sound
                if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                    this.sound.playAudioSprite('soundbank', 'level_button_hover', { volume: 0.35 });
                }
                this.tweens.add({
                    targets: container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100,
                    ease: 'Power2'
                });
            });

            circle.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Power2'
                });
            });

            circle.on('pointerup', () => {
                // Play level button click sound
                if (!Gameplay.SfxMuted && this.sound && this.sound.playAudioSprite) {
                    this.sound.playAudioSprite('soundbank', 'level_button_click', { volume: 0.35 });
                }
                // Stop level select music before transitioning
                if (this.levelSelectMusic) {
                    console.log('Stopping level select music, object type:', this.levelSelectMusic);
                    // For audio sprites, we need to use the sound's stop method if available
                    if (typeof this.levelSelectMusic.stop === 'function') {
                        this.levelSelectMusic.stop();
                    } else if (typeof this.levelSelectMusic.destroy === 'function') {
                        this.levelSelectMusic.destroy();
                    } else {
                        // Last resort: stop all sounds from soundbank (not ideal but works)
                        this.sound.stopByKey('soundbank');
                    }
                    this.levelSelectMusic = null;
                }
                this.scene.start('Gameplay', { levelIndex: levelIndex });
            });
        }
    }

    drawLock(graphics, x, y, scale) {
        const bodyWidth = 60 * scale;
        const bodyHeight = 45 * scale;
        const bodyCornerRadius = 8 * scale;
        const shackleRadius = 20 * scale;
        const shackleThickness = 12 * scale;
        const shackleY = (shackleRadius - bodyHeight) / 2;

        // Silver/light gray shackle for visibility on black
        graphics.lineStyle(shackleThickness, 0xA0A0A0, 1);
        graphics.beginPath();
        graphics.arc(x, y + shackleY, shackleRadius, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
        graphics.strokePath();

        // Silver/metallic lock body
        graphics.fillStyle(0x606060, 1);
        graphics.fillRoundedRect(x - bodyWidth / 2, y + shackleY, bodyWidth, bodyHeight, bodyCornerRadius);

        // Darker keyhole
        graphics.fillStyle(0x202020, 1);
        graphics.fillCircle(x, y + shackleY + bodyHeight / 3, 6 * scale);
        
        graphics.beginPath();
        graphics.moveTo(x - 2 * scale, y + shackleY + bodyHeight / 3);
        graphics.lineTo(x - 4 * scale, y + shackleY + bodyHeight / 3 + 18 * scale);
        graphics.lineTo(x + 4 * scale, y + shackleY + bodyHeight / 3 + 18 * scale);
        graphics.lineTo(x + 2 * scale, y + shackleY + bodyHeight / 3);
        graphics.closePath();
        graphics.fillPath();
    }

    gridToWorld(gx, gy) {
        return {
            x: GRID_OFFSET.x + gx * TILE_SIZE + TILE_SIZE / 2,
            y: GRID_OFFSET.y + gy * TILE_SIZE + TILE_SIZE / 2
        };
    }

    generateTrailPoints(aGrid, bGrid) {
        const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
        const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
        const mul = (a, s) => ({ x: a.x * s, y: a.y * s });
        const len = (v) => Math.hypot(v.x, v.y);
        const norm = (v) => { const L = len(v) || 1; return { x: v.x / L, y: v.y / L }; };
        const dot = (a, b) => a.x * b.x + a.y * b.y;
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        
        const routeManhattan = (a, b) => {
            const nodes = [{ gx: a.gx, gy: a.gy }];
            let gx = a.gx, gy = a.gy;
            const stepX = Math.sign(b.gx - gx);
            const stepY = Math.sign(b.gy - gy);
            
            while (gx !== b.gx) {
                gx += stepX;
                nodes.push({ gx, gy });
            }
            while (gy !== b.gy) {
                gy += stepY;
                nodes.push({ gx, gy });
            }
            return nodes;
        };
        
        const nodesGrid = routeManhattan(aGrid, bGrid);
        const pts = [];
        if (nodesGrid.length < 2) return pts;
        
        const nodes = nodesGrid.map(n => this.gridToWorld(n.gx, n.gy));
        let carry = 0;
        let current = { ...nodes[0] };
        
        function pushLine(from, to) {
            const v = sub(to, from);
            const L = len(v);
            if (L <= 1e-6) return;
            let dist = DOT_STEP - carry;
            const dir = { x: v.x / L, y: v.y / L };
            while (dist <= L + 1e-6) {
                const p = add(from, mul(dir, dist));
                pts.push(p);
                dist += DOT_STEP;
            }
            carry = (carry + L) % DOT_STEP;
            current = { ...to };
        }
        
        function pushArc(center, pre, post) {
            const rVec0 = sub(pre, center);
            const r = len(rVec0) || 1;
            const v0 = { x: rVec0.x / r, y: rVec0.y / r };
            const rVec1 = sub(post, center);
            const v1 = { x: rVec1.x / r, y: rVec1.y / r };
            const d = clamp(dot(v0, v1), -1, 1);
            let theta = Math.acos(d);
            const z = v0.x * v1.y - v0.y * v1.x;
            if (z < 0) theta = -theta;
            const arcLen = Math.abs(theta) * r;
            if (arcLen <= 1e-6) return;
            let dist = DOT_STEP - carry;
            while (dist <= arcLen + 1e-6) {
                const t = dist / arcLen;
                const phi = t * theta;
                const vp = {
                    x: v0.x * Math.cos(phi) + (-v0.y) * Math.sin(phi),
                    y: v0.y * Math.cos(phi) + (v0.x) * Math.sin(phi)
                };
                const p = add(center, mul(vp, r));
                pts.push(p);
                dist += DOT_STEP;
            }
            carry = (carry + arcLen) % DOT_STEP;
            current = { ...post };
        }
        
        const rr = Math.min(CORNER_RADIUS, TILE_SIZE * 0.49);
        for (let i = 0; i < nodes.length - 1; i++) {
            const A = nodes[i];
            const B = nodes[i + 1];
            const prevDir = norm(sub(B, A));
            const next = i + 2 < nodes.length ? nodes[i + 2] : null;
            
            if (next) {
                const nextDir = norm(sub(next, B));
                const isTurn = Math.abs(prevDir.x - nextDir.x) > 1e-6 || Math.abs(prevDir.y - nextDir.y) > 1e-6;
                if (isTurn) {
                    const pre = add(B, mul(prevDir, -rr));
                    const post = add(B, mul(nextDir, rr));
                    const center = add(add(B, mul(prevDir, -rr)), mul(nextDir, rr));
                    pushLine(current, pre);
                    pushArc(center, pre, post);
                    current = { ...post };
                    continue;
                }
            }
            pushLine(current, B);
        }
        
        const start = nodes[0];
        const end = nodes[nodes.length - 1];
        const trimmed = [];
        let lastKeptIndex = -1;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            const ds = Math.hypot(p.x - start.x, p.y - start.y);
            const de = Math.hypot(p.x - end.x, p.y - end.y);
            if (ds < GUARD || de < GUARD) continue;
            trimmed.push(p);
            lastKeptIndex = i;
        }
        
        if (lastKeptIndex >= 0 && lastKeptIndex + 1 < pts.length) {
            trimmed.push(pts[lastKeptIndex + 1]);
        }
        
        return trimmed;
    }

}