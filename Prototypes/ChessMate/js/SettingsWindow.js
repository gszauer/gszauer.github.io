class SettingsWindow extends Phaser.GameObjects.Container {
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
        
        // Window dimensions
        const windowWidth = 1250;
        const windowHeight = 800;  // Shorter window
        const windowX = width / 2;  // Center X position
        const windowY = height / 2; // Center Y position
        
        // Create window using the static function
        const windowContainer = SettingsWindow.createWindowBackground(this.scene, windowX, windowY, windowWidth, windowHeight);
        this.add(windowContainer);
        
        // Title text (now relative to window center)
        this.titleText = this.scene.add.text(windowX, windowY - windowHeight/2 + 100, 'SETTINGS', {
            fontSize: '100px',
            fontFamily: 'Arial, sans-serif',
            color: '#4A2C17',
            fontStyle: 'bold'
        });
        this.titleText.setOrigin(0.5, 0.5);
        this.add(this.titleText);
        
        // Create close button using graphics (overlapping window edge)
        const closeX = windowX + windowWidth/2 - 25;
        const closeY = windowY - windowHeight/2 + 25;
        this.createCloseButton(closeX, closeY);
        
        // Create checkboxes for sound settings
        this.createSoundCheckboxes(windowX, windowY);
        
        // Create reset data button at bottom
        const resetX = windowX;
        const resetY = windowY + windowHeight/2 - 120;  // Adjusted for shorter window
        this.createResetButton(resetX, resetY);
    }
    
    createSoundCheckboxes(centerX, centerY) {
        // Starting position for checkboxes
        const startY = centerY - 175;  // Adjusted for shorter window
        const checkboxSize = 120;  // 3x bigger
        const spacing = 180;       // Increased spacing for bigger checkboxes
        
        // Create Sound Effects checkbox (starts unchecked)
        // Position more to the left (using window edge as reference)
        this.createCheckbox(
            centerX - 500,  // More to the left
            startY,
            checkboxSize,
            'Mute Sound Effects',
            false,
            (checked) => {
                // Handle sound effects muting logic here if needed
                console.log('Sound effects muted:', checked);
            }
        );
        
        // Create Music checkbox (starts unchecked)
        this.createCheckbox(
            centerX - 500,  // More to the left
            startY + spacing,
            checkboxSize,
            'Mute Music',
            false,
            (checked) => {
                // Handle music muting logic here if needed
                console.log('Music muted:', checked);
            }
        );
    }
    
    createCheckbox(x, y, size, label, initialChecked, onToggle) {
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        
        // Checkbox state
        let isChecked = initialChecked;
        
        // Colors matching the window theme
        const colors = {
            boxBorder: 0x5C3D1F,      // Dark wood for border
            boxFill: 0xC1A888,         // Parchment for unchecked
            checkMark: 0x4A2C17,       // Dark brown for checkmark
            hoverBorder: 0x8B6233,     // Lighter wood on hover
            textColor: '#4A2C17'       // Dark brown text
        };
        
        // Draw checkbox function
        const drawCheckbox = (hover = false) => {
            graphics.clear();
            
            // Draw border (thicker for bigger checkbox)
            graphics.lineStyle(8, hover ? colors.hoverBorder : colors.boxBorder);
            graphics.strokeRect(0, 0, size, size);
            
            // Draw fill
            graphics.fillStyle(colors.boxFill);
            graphics.fillRect(4, 4, size - 8, size - 8);
            
            // Draw checkmark if checked
            if (isChecked) {
                graphics.lineStyle(15, colors.checkMark);  // Much thicker checkmark
                graphics.lineCap = 'round';
                
                // Draw checkmark path
                graphics.beginPath();
                graphics.moveTo(size * 0.2, size * 0.5);
                graphics.lineTo(size * 0.4, size * 0.7);
                graphics.lineTo(size * 0.8, size * 0.3);
                graphics.strokePath();
            }
        };
        
        // Initial draw
        drawCheckbox();
        container.add(graphics);
        
        // Add label text (much bigger)
        const labelText = this.scene.add.text(size + 30, size / 2, label, {
            fontSize: '64px',  // Much bigger text
            fontFamily: 'Arial, sans-serif',
            color: colors.textColor,
            fontStyle: 'bold'
        });
        labelText.setOrigin(0, 0.5);
        container.add(labelText);
        
        // Make the checkbox interactive
        const hitArea = new Phaser.Geom.Rectangle(0, 0, size + labelText.width + 20, size);
        graphics.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        graphics.input.cursor = 'pointer';
        
        // Hover effects
        graphics.on('pointerover', () => {
            drawCheckbox(true);
        });
        
        graphics.on('pointerout', () => {
            drawCheckbox(false);
        });
        
        // Click to toggle
        graphics.on('pointerup', () => {
            isChecked = !isChecked;
            drawCheckbox();
            if (onToggle) {
                onToggle(isChecked);
            }
        });
        
        this.add(container);
    }
    
    createCloseButton(x, y) {
        // Create a container for the close button
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        container.add(graphics);
        
        // Define colors for the red close button (more desaturated)
        const colors = {
            shadowDark: 0x6B1010,    // Dark red shadow
            shadowMedium: 0x8B3030,  // Brown-red for depth
            baseRed: 0xA03030,       // Main red color (desaturated)
            highlight: 0xC05555,     // Light red highlight (desaturated)
            xColor: 0xFFFFFF,        // White X
            hoverRed: 0xCC4040,      // Bright red on hover (desaturated)
            hoverHighlight: 0xDD6666 // Brighter highlight on hover (desaturated)
        };
        
        // Button properties (1.25x bigger)
        const buttonRadius = 56;
        const cornerCut = 15;
        const shadowOffset = 3;
        
        // Pre-calculate all button geometry once
        const buttonPoints = [
            { x: -buttonRadius, y: -buttonRadius + cornerCut },
            { x: -buttonRadius + cornerCut, y: -buttonRadius },
            { x: buttonRadius - cornerCut, y: -buttonRadius },
            { x: buttonRadius, y: -buttonRadius + cornerCut },
            { x: buttonRadius, y: buttonRadius - cornerCut },
            { x: buttonRadius - cornerCut, y: buttonRadius },
            { x: -buttonRadius + cornerCut, y: buttonRadius },
            { x: -buttonRadius, y: buttonRadius - cornerCut }
        ];
        
        // Pre-calculate shadow points once
        const shadowPoints = buttonPoints.map(p => ({ 
            x: p.x + shadowOffset, 
            y: p.y + shadowOffset 
        }));
        
        // Pre-calculate inset points once
        const insetButtonPoints = buttonPoints.map(p => ({ x: p.x * 0.85, y: p.y * 0.85 }));
        
        // Pre-calculate polygons once
        const highlightPolygon = [
            buttonPoints[0], buttonPoints[1], buttonPoints[2], buttonPoints[3],
            insetButtonPoints[3], insetButtonPoints[2], insetButtonPoints[1], insetButtonPoints[0]
        ];
        
        const shadowPolygon = [
            buttonPoints[4], buttonPoints[5], buttonPoints[6], buttonPoints[7],
            insetButtonPoints[7], insetButtonPoints[6], insetButtonPoints[5], insetButtonPoints[4]
        ];
        
        // Store original colors for hover effect
        let currentBaseColor = colors.baseRed;
        let currentHighlightColor = colors.highlight;
        
        // Function to draw the button
        const drawButton = () => {
            graphics.clear();
            
            // Draw shadow layer (offset)
            graphics.fillStyle(colors.shadowDark);
            graphics.fillPoints(shadowPoints, true);
            
            // Draw main button base
            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(buttonPoints, true);
            
            // Draw beveled edges for 3D effect
            // Top and right highlight
            graphics.fillStyle(currentHighlightColor);
            graphics.fillPoints(highlightPolygon, true);
            
            // Bottom and left shadow
            graphics.fillStyle(colors.shadowMedium);
            graphics.fillPoints(shadowPolygon, true);
            
            // Draw inner face
            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(insetButtonPoints, true);
            
            // Draw X symbol (scaled up with button)
            const xThickness = 10;
            const xSize = buttonRadius * 0.5;
            
            graphics.lineStyle(xThickness, colors.xColor, 1);
            graphics.lineCap = 'round';
            
            // First diagonal of X
            graphics.beginPath();
            graphics.moveTo(-xSize, -xSize);
            graphics.lineTo(xSize, xSize);
            graphics.strokePath();
            
            // Second diagonal of X
            graphics.beginPath();
            graphics.moveTo(xSize, -xSize);
            graphics.lineTo(-xSize, xSize);
            graphics.strokePath();
        };
        
        // Initial draw
        drawButton();
        
        // Make the button interactive
        container.setInteractive(new Phaser.Geom.Circle(0, 0, buttonRadius), Phaser.Geom.Circle.Contains);
        container.input.cursor = 'pointer';
        
        // Hover effect
        container.on('pointerover', () => {
            currentBaseColor = colors.hoverRed;
            currentHighlightColor = colors.hoverHighlight;
            drawButton();
            container.setScale(1.05);
        });
        
        container.on('pointerout', () => {
            currentBaseColor = colors.baseRed;
            currentHighlightColor = colors.highlight;
            drawButton();
            container.setScale(1.0);
        });
        
        // Click to close
        container.on('pointerup', () => {
            this.hide();
        });
        
        this.add(container);
    }
    
    createResetButton(x, y) {
        // Create a container for the reset button
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        container.add(graphics);
        
        // Define colors for the brown reset button
        const colors = {
            shadowDark: 0x2B1810,    // Very dark brown shadow
            shadowMedium: 0x4A2C17,  // Medium brown for depth
            baseBrown: 0x5A3A1F,     // Main dark brown color
            highlight: 0x7A5030,     // Light brown highlight
            textColor: 0xFFE4C4,     // Light beige text
            hoverBrown: 0x6B4423,    // Lighter brown on hover
            hoverHighlight: 0x8B6033 // Brighter highlight on hover
        };
        
        // Button properties - wider for text
        const buttonWidth = 280;
        const buttonHeight = 80;
        const cornerCut = 15;
        const shadowOffset = 3;
        
        // Pre-calculate all button geometry once
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
        
        // Pre-calculate shadow points once
        const shadowPoints = buttonPoints.map(p => ({ 
            x: p.x + shadowOffset, 
            y: p.y + shadowOffset 
        }));
        
        // Pre-calculate inset points once
        const insetButtonPoints = buttonPoints.map(p => ({ x: p.x * 0.92, y: p.y * 0.85 }));
        
        // Pre-calculate polygons once
        const highlightPolygon = [
            buttonPoints[0], buttonPoints[1], buttonPoints[2], buttonPoints[3],
            insetButtonPoints[3], insetButtonPoints[2], insetButtonPoints[1], insetButtonPoints[0]
        ];
        
        const shadowPolygon = [
            buttonPoints[4], buttonPoints[5], buttonPoints[6], buttonPoints[7],
            insetButtonPoints[7], insetButtonPoints[6], insetButtonPoints[5], insetButtonPoints[4]
        ];
        
        // Store original colors for hover effect
        let currentBaseColor = colors.baseBrown;
        let currentHighlightColor = colors.highlight;
        
        // Function to draw the button
        const drawButton = () => {
            graphics.clear();
            
            // Draw shadow layer (offset)
            graphics.fillStyle(colors.shadowDark);
            graphics.fillPoints(shadowPoints, true);
            
            // Draw main button base
            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(buttonPoints, true);
            
            // Draw beveled edges for 3D effect
            // Top and right highlight
            graphics.fillStyle(currentHighlightColor);
            graphics.fillPoints(highlightPolygon, true);
            
            // Bottom and left shadow
            graphics.fillStyle(colors.shadowMedium);
            graphics.fillPoints(shadowPolygon, true);
            
            // Draw inner face
            graphics.fillStyle(currentBaseColor);
            graphics.fillPoints(insetButtonPoints, true);
        };
        
        // Initial draw
        drawButton();
        
        // Add text on top of the button
        const buttonText = this.scene.add.text(0, 0, 'RESET ALL DATA', {
            fontSize: '56px',
            fontFamily: 'Arial, sans-serif',
            color: '#D4A574',
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
            currentBaseColor = colors.hoverBrown;
            currentHighlightColor = colors.hoverHighlight;
            drawButton();
            container.setScale(1.05);
        });
        
        container.on('pointerout', () => {
            currentBaseColor = colors.baseBrown;
            currentHighlightColor = colors.highlight;
            drawButton();
            container.setScale(1.0);
        });
        
        // Click to open reset confirmation window
        container.on('pointerup', () => {
            // Create reset window if it doesn't exist
            if (!this.scene.resetWindow) {
                this.scene.resetWindow = new ResetWindow(this.scene);
            }
            // Show the reset confirmation window
            this.scene.resetWindow.show();
            // Hide settings window
            this.hide();
        });
        
        this.add(container);
    }
    
    /**
     * Creates a decorative game window as a Phaser Container.
     * @param {Phaser.Scene} scene The scene to add the window to.
     * @param {number} x The horizontal center position of the window.
     * @param {number} y The vertical center position of the window.
     * @param {number} width The width of the main content area.
     * @param {number} height The height of the main content area.
     * @returns {Phaser.GameObjects.Container} A container with the window graphics.
     */
    static createWindowBackground(scene, x, y, width, height) {
        // Create a container for all the window elements.
        // The container's origin (0,0) will be its center.
        const container = scene.add.container(x, y);

        // Local coordinates, relative to the container's center
        const w_half = width / 2;
        const h_half = height / 2;

        // Color palette is self-contained within the function
        const colors = {
            woodBase: 0x8B6233,
            woodLight: 0xC4915C,
            woodDark: 0x5C3D1F,
            woodShadow: 0x3E2415,
            metalDark: 0x4A4A4A,
            metalLight: 0x7A7A7A,
            metalShine: 0x9A9A9A,
            parchmentBase: 0xAE946D,
            parchmentHighlight: 0xC1A888
        };

        const graphics = scene.add.graphics();

        // Main wooden frame - outer layer (2x thicker)
        graphics.fillStyle(colors.woodDark);
        graphics.fillRoundedRect(-w_half - 30, -h_half - 30, width + 60, height + 60, 24);

        // Wooden frame - middle layer (2x thicker)
        graphics.fillStyle(colors.woodBase);
        graphics.fillRoundedRect(-w_half - 20, -h_half - 20, width + 40, height + 40, 20);

        // Inner bevel highlight on the frame (2x thicker)
        graphics.fillStyle(colors.woodLight);
        graphics.fillRect(-w_half - 16, -h_half - 16, width + 32, 6); // Top
        graphics.fillRect(-w_half - 16, -h_half - 16, 6, height + 32); // Left

        // Inner bevel shadow on the frame (2x thicker)
        graphics.fillStyle(colors.woodShadow);
        graphics.fillRect(-w_half - 16, h_half + 10, width + 32, 6); // Bottom
        graphics.fillRect(w_half + 10, -h_half - 16, 6, height + 32); // Right

        // --- CONTENT AREA ---
        // Content area background (dark parchment base)
        graphics.fillStyle(colors.parchmentBase);
        graphics.fillRoundedRect(-w_half, -h_half, width, height, 6);

        // Inner content shadow for depth
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillRoundedRect(-w_half + 2, -h_half + 2, width - 4, height - 4, 4);

        // Actual content area (lighter parchment)
        graphics.fillStyle(colors.parchmentHighlight);
        graphics.fillRoundedRect(-w_half + 5, -h_half + 5, width - 10, height - 10, 4);
        // --- END CONTENT AREA ---

        // Decorative metal corner pieces (2x bigger)
        const cornerSize = 60;
        const cornerInset = 10;

        // Top-left corner
        graphics.fillStyle(colors.metalDark);
        graphics.fillTriangle(-w_half - cornerInset, -h_half - cornerInset, -w_half + cornerSize, -h_half - cornerInset, -w_half - cornerInset, -h_half + cornerSize);
        graphics.fillStyle(colors.metalLight);
        graphics.fillTriangle(-w_half - cornerInset, -h_half - cornerInset, -w_half + cornerSize - 10, -h_half - cornerInset, -w_half - cornerInset, -h_half + cornerSize - 10);

        // Top-right corner
        graphics.fillStyle(colors.metalDark);
        graphics.fillTriangle(w_half + cornerInset, -h_half - cornerInset, w_half - cornerSize, -h_half - cornerInset, w_half + cornerInset, -h_half + cornerSize);
        graphics.fillStyle(colors.metalLight);
        graphics.fillTriangle(w_half + cornerInset, -h_half - cornerInset, w_half - cornerSize + 10, -h_half - cornerInset, w_half + cornerInset, -h_half + cornerSize - 10);

        // Bottom-left corner
        graphics.fillStyle(colors.metalDark);
        graphics.fillTriangle(-w_half - cornerInset, h_half + cornerInset, -w_half + cornerSize, h_half + cornerInset, -w_half - cornerInset, h_half - cornerSize);
        graphics.fillStyle(colors.metalLight);
        graphics.fillTriangle(-w_half - cornerInset + 4, h_half + cornerInset - 4, -w_half + cornerSize - 10, h_half + cornerInset - 4, -w_half - cornerInset + 4, h_half - cornerSize + 10);

        // Bottom-right corner
        graphics.fillStyle(colors.metalDark);
        graphics.fillTriangle(w_half + cornerInset, h_half + cornerInset, w_half - cornerSize, h_half + cornerInset, w_half + cornerInset, h_half - cornerSize);
        graphics.fillStyle(colors.metalLight);
        graphics.fillTriangle(w_half + cornerInset - 4, h_half + cornerInset - 4, w_half - cornerSize + 10, h_half + cornerInset - 4, w_half + cornerInset - 4, h_half - cornerSize + 10);

        // Decorative rivets/bolts on the main content area (2x bigger)
        const rivetPositions = [
            { x: -w_half + 25, y: -h_half + 25 },
            { x: w_half - 25, y: -h_half + 25 },
            { x: -w_half + 25, y: h_half - 25 },
            { x: w_half - 25, y: h_half - 25 }
        ];

        rivetPositions.forEach(pos => {
            graphics.fillStyle(colors.metalDark, 0.7);
            graphics.fillCircle(pos.x + 2, pos.y + 2, 10);
            graphics.fillStyle(colors.metalLight);
            graphics.fillCircle(pos.x, pos.y, 10);
            graphics.fillStyle(colors.metalShine);
            graphics.fillCircle(pos.x - 2, pos.y - 2, 5);
        });

        // Add a subtle inner glow to the content area (thicker)
        graphics.lineStyle(4, 0xFFFFFF, 0.15);
        graphics.strokeRoundedRect(-w_half + 7, -h_half + 7, width - 14, height - 14, 2);

        // Add the graphics object to the container
        container.add(graphics);
        
        return container;
    }
    
    show() {
        this.setVisible(true);
    }
    
    hide() {
        this.setVisible(false);
    }
}