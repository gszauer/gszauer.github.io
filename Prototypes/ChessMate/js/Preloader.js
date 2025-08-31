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
        
        this.time.delayedCall(100, () => {
            this.scene.start('LevelSelect');
        });
    }

    create() {
        this.makeCheckerTexture('checker', TILE_SIZE, 0x2C8D43, 0x287B3B);
        this.makeLevelIconTexture('gold_icon', ICON_DIAMETER, COLORS.gold, 0xB3882E);
        this.makeLevelIconTexture('silver_icon', ICON_DIAMETER, COLORS.silver, COLORS.grayEdge);
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
        grad.addColorStop(0, '#FFF6A5');
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