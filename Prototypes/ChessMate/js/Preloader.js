class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Set black background
        this.cameras.main.setBackgroundColor(0x000000);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.progressBar = this.add.graphics();
        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(width / 2 - 480, height / 2 - 75, 960, 150);  // 3x size

        this.loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 150,  // Adjusted for bigger bar
            text: 'Loading...',
            style: {
                font: '60px monospace',  // 3x size
                color: '#ffffff'
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xffffff, 1);
            this.progressBar.fillRect(width / 2 - 450, height / 2 - 45, 900 * value, 90);  // 3x size
        });

        this.load.on('complete', () => {
            // Remove loading bar and text
            this.progressBar.destroy();
            this.progressBox.destroy();
            this.loadingText.destroy();
        });

        this.load.image('background', 'assets/background.png');
        this.load.atlas('characters', 'assets/characters.png', 'assets/characters.json');
        this.load.atlas('ui', 'assets/ui.png', 'assets/ui.json');
    }

    create() {
        this.makeCheckerTexture('checker', TILE_SIZE, COLORS.lightSquare, COLORS.darkSquare);
        this.makeLevelIconTexture('gold_icon', ICON_DIAMETER, 0xF5F5F5, 0x808080);  // White checker with gray edge
        this.makeLevelIconTexture('silver_icon', ICON_DIAMETER, 0x2A2A2A, 0x000000);  // Black checker with black edge
        
        // Show logo and play button
        this.showLogo();
        this.createPlayButton();
        this.showMoveGuide();
    }
    
    showLogo() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Display the logo higher up
        const logo = this.add.image(width / 2, height / 2 - 500, 'ui', 'logo_transparent.png');
        logo.setOrigin(0.5, 0.5);
        
        // Scale the logo appropriately (adjust scale as needed)
        logo.setScale(1.5);
        
        // Fade in animation
        logo.setAlpha(0);
        this.tweens.add({
            targets: logo,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }
    
    createPlayButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create play button container - positioned lower
        const container = this.add.container(width / 2, height / 2 + 380);
        const graphics = this.add.graphics();
        container.add(graphics);
        
        // Button properties - smaller size
        const buttonWidth = 250;
        const buttonHeight = 100;
        const cornerCut = 15;
        const shadowOffset = 4;
        
        // Colors - green theme for play
        const colors = {
            baseDark: 0x2E5A2E,      // Dark green
            baseMedium: 0x4A8B4A,    // Medium green
            baseLight: 0x6AB56A,     // Light green
            highlight: 0x8BC78B,     // Green highlight
            hoverBase: 0x5A9C5A,     // Hover green
            hoverHighlight: 0x9BD89B // Hover highlight
        };
        
        // Pre-calculate button geometry (octagonal shape)
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
        
        // Shadow points
        const shadowPoints = buttonPoints.map(p => ({ 
            x: p.x + shadowOffset, 
            y: p.y + shadowOffset 
        }));
        
        // Inset points
        const insetButtonPoints = buttonPoints.map(p => ({ x: p.x * 0.92, y: p.y * 0.85 }));
        
        // Polygons for 3D effect
        const highlightPolygon = [
            buttonPoints[0], buttonPoints[1], buttonPoints[2], buttonPoints[3],
            insetButtonPoints[3], insetButtonPoints[2], insetButtonPoints[1], insetButtonPoints[0]
        ];
        
        const shadowPolygon = [
            buttonPoints[4], buttonPoints[5], buttonPoints[6], buttonPoints[7],
            insetButtonPoints[7], insetButtonPoints[6], insetButtonPoints[5], insetButtonPoints[4]
        ];
        
        // Store current colors for hover effect
        let currentBaseColor = colors.baseMedium;
        let currentHighlightColor = colors.highlight;
        
        // Draw button function
        const drawButton = () => {
            graphics.clear();
            
            // Draw shadow layer
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillPoints(shadowPoints, true);
            
            // Draw main button base
            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(buttonPoints, true);
            
            // Draw beveled edges
            graphics.fillStyle(currentHighlightColor);
            graphics.fillPoints(highlightPolygon, true);
            
            graphics.fillStyle(colors.baseDark);
            graphics.fillPoints(shadowPolygon, true);
            
            // Draw inner face
            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(insetButtonPoints, true);
        };
        
        // Initial draw
        drawButton();
        
        // Add button text - keep it big
        const playText = this.add.text(0, 0, 'PLAY', {
            fontSize: '96px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        playText.setOrigin(0.5, 0.5);
        container.add(playText);
        
        // Make the button interactive
        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth, -buttonHeight, buttonWidth * 2, buttonHeight * 2);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        container.input.cursor = 'pointer';
        
        // Hover effect
        container.on('pointerover', () => {
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
        
        // Click to start
        container.on('pointerup', () => {
            this.scene.start('LevelSelect');
        });
        
        // Fade in animation
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }
    
    showMoveGuide() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Display the move guide below the play button
        const moveGuide = this.add.image(width / 2, height / 2 + 900, 'ui', 'move_guide.png');
        moveGuide.setOrigin(0.5, 0.5);
        
        // Scale the guide appropriately
        moveGuide.setScale(1.4);
        
        // Fade in animation
        moveGuide.setAlpha(0);
        this.tweens.add({
            targets: moveGuide,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            delay: 200
        });
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