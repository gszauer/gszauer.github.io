class ResetWindow extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        scene.add.existing(this);
        
        this.createWindow();
        this.setDepth(1000);
        this.setVisible(false);
    }
    
    createWindow() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Modal background blocker with tint
        this.blocker = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        this.blocker.setOrigin(0, 0);
        this.blocker.setInteractive();
        this.add(this.blocker);
        
        // Window dimensions - bigger for better readability
        const windowWidth = 1100;
        const windowHeight = 750;
        const windowX = width / 2;  // Center X position
        const windowY = height / 2; // Center Y position
        
        // Create window using the static function from SettingsWindow
        const windowContainer = SettingsWindow.createWindowBackground(this.scene, windowX, windowY, windowWidth, windowHeight);
        this.add(windowContainer);
        
        // Title text
        this.titleText = this.scene.add.text(windowX, windowY - windowHeight/2 + 120, 'RESET ALL DATA', {
            fontSize: '100px',
            fontFamily: 'Arial, sans-serif',
            color: '#4A2C17',
            fontStyle: 'bold'
        });
        this.titleText.setOrigin(0.5, 0.5);
        this.add(this.titleText);
        
        // Warning text - positioned higher
        const warningText = 'This will remove all saved progress and\nreset the game to its initial state.\nProceed?';
        this.warningText = this.scene.add.text(windowX, windowY - 35, warningText, {
            fontSize: '52px',
            fontFamily: 'Arial, sans-serif',
            color: '#4A2C17',
            align: 'center',
            lineSpacing: 15
        });
        this.warningText.setOrigin(0.5, 0.5);
        this.add(this.warningText);
        
        // Create Yes/No buttons - more spacing
        const buttonY = windowY + 200;
        const buttonSpacing = 400;  // Increased spacing between buttons
        
        // Yes button (red/danger colored)
        this.createButton(
            windowX - buttonSpacing/2,
            buttonY,
            'YES',
            {
                baseDark: 0x8B2020,      // Dark red
                baseMedium: 0xA03030,    // Medium red
                baseLight: 0xCC4040,     // Light red
                highlight: 0xDD5555,     // Red highlight
                hoverBase: 0xCC4040,     // Hover red
                hoverHighlight: 0xFF6666 // Hover highlight
            },
            () => {
                // Reset all player data
                PlayerData.Instance.Reset();
                // Reload the game
                this.scene.scene.start('LevelSelect');
                this.hide();
            }
        );
        
        // No button (safe brown colored)
        this.createButton(
            windowX + buttonSpacing/2,
            buttonY,
            'NO',
            {
                baseDark: 0x3A2A10,      // Dark brown
                baseMedium: 0x5A3A1F,    // Medium brown
                baseLight: 0x7A5030,     // Light brown
                highlight: 0x8B6033,     // Brown highlight
                hoverBase: 0x6B4423,     // Hover brown
                hoverHighlight: 0x9B7043 // Hover highlight
            },
            () => {
                this.hide();
            }
        );
    }
    
    createButton(x, y, text, colors, onClick) {
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        container.add(graphics);
        
        // Button properties - bigger buttons
        const buttonWidth = 180;
        const buttonHeight = 90;
        const cornerCut = 15;
        const shadowOffset = 3;
        
        // Pre-calculate button geometry
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
        
        // Add button text - bigger font
        const buttonText = this.scene.add.text(0, 0, text, {
            fontSize: '64px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5, 0.5);
        container.add(buttonText);
        
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
        
        // Click handler
        container.on('pointerup', onClick);
        
        this.add(container);
    }
    
    show() {
        this.setVisible(true);
    }
    
    hide() {
        this.setVisible(false);
    }
}