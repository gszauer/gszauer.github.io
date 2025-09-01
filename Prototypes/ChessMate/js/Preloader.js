class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        this.load.image('background', 'assets/background.png');
        this.load.atlas('characters', 'assets/characters.png', 'assets/characters.json');
        this.load.atlas('ui', 'assets/ui.png', 'assets/ui.json');
    }

    create() {
        this.makeCheckerTexture('checker', TILE_SIZE, COLORS.lightSquare, COLORS.darkSquare);
        this.makeLevelIconTexture('gold_icon', ICON_DIAMETER, 0xF5F5F5, 0x808080);  // White checker with gray edge
        this.makeLevelIconTexture('silver_icon', ICON_DIAMETER, 0x2A2A2A, 0x000000);  // Black checker with black edge
        
        this.texturesReady = true;
    }
    
    update() {
        // Transition only once after all textures are created
        if (this.texturesReady) {
            this.scene.start('LevelSelect');
        }
    }

    makeCheckerTexture(key, tileSize, colorA, colorB) {
        const tex = this.textures.createCanvas(key, tileSize * 2, tileSize * 2);
        const ctx = tex.getContext();
        ctx.fillStyle = '#' + colorA.toString(16).padStart(6, '0');
        ctx.fillRect(0, 0, tileSize, tileSize);
        ctx.fillRect(tileSize, tileSize, tileSize, tileSize);
        ctx.fillStyle = '#' + colorB.toString(16).padStart(6, '0');
        ctx.fillRect(tileSize, 0, tileSize, tileSize);
        ctx.fillRect(0, tileSize, tileSize, tileSize);
        tex.refresh();
    }

    makeLevelIconTexture(key, d, baseColor, edgeColor) {
        const tex = this.textures.createCanvas(key, d, d);
        const ctx = tex.getContext();
        const cx = d / 2, cy = d / 2;
        
        const grad = ctx.createRadialGradient(cx - d * 0.18, cy - d * 0.18, d * 0.05, cx, cy, d * 0.55);
        // Adjust highlight based on whether it's white or black checker
        const isWhite = baseColor > 0x800000;
        grad.addColorStop(0, isWhite ? '#FFFFFF' : '#555555');  // Highlight
        grad.addColorStop(0.45, '#' + baseColor.toString(16).padStart(6, '0'));
        grad.addColorStop(1, '#' + edgeColor.toString(16).padStart(6, '0'));
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, d * 0.48, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(cx, cy, d * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = '#' + edgeColor.toString(16).padStart(6, '0');
        ctx.lineWidth = d * 0.06;
        ctx.stroke();
        
        tex.refresh();
    }
}