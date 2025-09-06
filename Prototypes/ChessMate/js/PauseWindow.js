class PauseWindow extends Phaser.GameObjects.Container {
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
        const windowHeight = 900;  // Taller window to fit both buttons
        const windowX = width / 2;  // Center X position
        const windowY = height / 2; // Center Y position
        
        // Create window using the static function from SettingsWindow
        const windowContainer = SettingsWindow.createWindowBackground(this.scene, windowX, windowY, windowWidth, windowHeight);
        this.add(windowContainer);
        
        // Title text (now relative to window center)
        this.titleText = this.scene.add.text(windowX, windowY - windowHeight/2 + 100, 'PAUSED', {
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
        
        // Create action buttons at bottom
        const buttonSpacing = 550;  // Increased spacing to prevent overlap
        const buttonsY = windowY + windowHeight/2 - 120;
        
        // Back to menu button (left)
        this.createMenuButton(windowX - buttonSpacing/2, buttonsY);
        
        // Restart level button (right)
        this.createRestartButton(windowX + buttonSpacing/2, buttonsY);
    }
    
    createSoundCheckboxes(centerX, centerY) {
        // Starting position for checkboxes
        const startY = centerY - 200;  // Adjusted for taller window
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
    
    createMenuButton(x, y) {
        // Create a container for the menu button
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        container.add(graphics);
        
        // Define colors for the dark brown menu button
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
        const buttonWidth = 240;
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
        const buttonText = this.scene.add.text(0, 0, 'BACK TO MENU', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFE4C4',  // Light beige text
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
        
        // Click to go back to menu
        container.on('pointerup', () => {
            this.hide();
            this.scene.scene.start('LevelSelect');
        });
        
        this.add(container);
    }
    
    createRestartButton(x, y) {
        // Create a container for the restart button
        const container = this.scene.add.container(x, y);
        const graphics = this.scene.add.graphics();
        container.add(graphics);
        
        // Define colors for the dark brown restart button
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
        const buttonWidth = 240;
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
        const buttonText = this.scene.add.text(0, 0, 'RESTART LEVEL', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#FFE4C4',  // Light beige text
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
        
        // Click to restart level
        container.on('pointerup', () => {
            this.hide();
            this.scene.scene.restart({ levelIndex: this.scene.levelIndex });
        });
        
        this.add(container);
    }
    
    show() {
        this.setVisible(true);
    }
    
    hide() {
        this.setVisible(false);
    }
}