class LevelSelect extends Phaser.Scene {
    constructor() {
        super('LevelSelect');
        this.unlockedLevels = 2;
    }

    create() {
        this.addCheckerBackground();
        this.createLevelPaths();
        this.createLevelIcons();
    }

    addCheckerBackground() {
        const ts = this.add.tileSprite(0, 0, 1179, 2556, 'checker');
        ts.setOrigin(0, 0);
    }

    createLevelPaths() {
        for (let i = 0; i < Math.min(this.unlockedLevels, LEVEL_POSITIONS.length - 1); i++) {
            if (i >= LEVELS.length - 1) break;
            
            const aGrid = LEVEL_POSITIONS[i];
            const bGrid = LEVEL_POSITIONS[i + 1];
            const points = this.generateTrailPoints(aGrid, bGrid);
            
            const g = this.add.graphics();
            g.fillStyle(0xF8E57C, 1);
            g.setDepth(6);
            
            points.forEach(p => {
                g.fillCircle(p.x, p.y, DOT_RADIUS);
            });
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
                color: '#2e2e2e'
            });
            text.setOrigin(0.5, 0.54);
            text.setStroke('#2b230a', 2);
            text.setShadow(0, 2, 'rgba(0,0,0,0.35)', 3);
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

        graphics.lineStyle(shackleThickness, 0x4d4d4d, 1);
        graphics.beginPath();
        graphics.arc(x, y + shackleY, shackleRadius, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
        graphics.strokePath();

        graphics.fillStyle(0x8C5E3A, 1);
        graphics.fillRoundedRect(x - bodyWidth / 2, y + shackleY, bodyWidth, bodyHeight, bodyCornerRadius);

        graphics.fillStyle(0x4d4d4d, 1);
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

    update() {
        const completedLevels = parseInt(localStorage.getItem('chessmate_completed') || '0');
        if (completedLevels + 1 > this.unlockedLevels) {
            this.unlockedLevels = Math.min(completedLevels + 1, LEVELS.length);
            this.scene.restart();
        }
    }
}