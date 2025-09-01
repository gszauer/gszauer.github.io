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
        this.debugWindow = new DebugWindow(this);
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
    
    addMapHeader() {
        const header = this.add.image(0, 0, 'ui', 'map_header.png');
        header.setOrigin(0, 0);
        
        // Scale to match screen width
        const screenWidth = this.cameras.main.width;
        const scale = screenWidth / header.width;
        header.setScale(scale);
        
        header.setDepth(20);
        
        // Add separator below header
        const separator = this.add.image(0, header.height * scale, 'ui', 'header_seperator.png');
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