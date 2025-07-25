class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create map background container
        this.mapContainer = this.add.container(0, 0);
        
        // Add map images from bottom to top (map_1 at bottom, map_4 at top)
        const map1 = this.add.image(0, 0, 'atlas_01', 'map_1.png');
        const map2 = this.add.image(0, 0, 'atlas_01', 'map_2.png');
        const map3 = this.add.image(0, 0, 'atlas_01', 'map_3.png');
        const map4 = this.add.image(0, 0, 'atlas_01', 'map_4.png');
        
        // Set origin to top-left for all maps
        map1.setOrigin(0, 0);
        map2.setOrigin(0, 0);
        map3.setOrigin(0, 0);
        map4.setOrigin(0, 0);
        
        // Get actual heights of images
        const map1Height = map1.height;
        const map2Height = map2.height;
        const map3Height = map3.height;
        const map4Height = map4.height;
        
        // Stack images vertically (map_1 at bottom, map_4 at top)
        let currentY = 0;
        map4.y = currentY;
        currentY += map4Height;
        map3.y = currentY;
        currentY += map3Height;
        map2.y = currentY;
        currentY += map2Height;
        map1.y = currentY;
        
        // Add all maps to container
        this.mapContainer.add([map1, map2, map3, map4]);
        
        // Calculate total height and scale to fit screen width
        const mapWidth = map1.width;
        this.mapTotalHeight = map1Height + map2Height + map3Height + map4Height;
        this.scaleToFit = width / mapWidth;
        
        // Scale the container
        this.mapContainer.setScale(this.scaleToFit);
        
        // Store scaled height for constraint calculations
        this.scaledMapHeight = this.mapTotalHeight * this.scaleToFit;
        
        // Position container so bottom is at bottom of screen
        this.mapContainer.setPosition(0, height - this.scaledMapHeight);
        
        // Send to back so UI elements appear on top
        this.mapContainer.setDepth(-1);
        
        // Enable dragging
        this.setupMapDragging();

        // Get the level configurations
        const levelConfigs = this.cache.json.get('levelConfig');
        const totalLevels = levelConfigs.length;

        // Get cleared level from PlayerData
        const playerData = PlayerData.Instance;
        const clearedLevel = playerData.GetNumber('clearedLevel');

        const buttonHeight = 332 * 0.5;
        const padding = 50;
        
        // Initialize cursor at bottom center
        const centerX = (this.cameras.main.width / 2) / this.scaleToFit;
        let cursorX = centerX;
        let cursorY = this.mapTotalHeight - padding - buttonHeight / 2; // Start from bottom
        
        // Track the Y position of the current level
        let currentLevelY = null;
        let lastButtonY = null;
        
        // Arrays to store level button positions for pointer placement
        const levelPositions = [];
        
        for (let i = 0; i < totalLevels; i++) {
            const levelNumber = i + 1;
            const config = levelConfigs[i];
            
            // Get xOffset and yOffset from config (default to 0 if not provided)
            const xOffset = config.xOffset || 0;
            const yOffset = config.yOffset || 0;
            
            // Apply offsets to current level position
            // X is always relative to center
            const x = centerX + xOffset;
            
            // Y position is current cursor position plus offset
            const y = cursorY + yOffset;
            
            // Store position for levels 1 and 2
            if (levelNumber <= 2) {
                levelPositions[levelNumber - 1] = { x, y };
            }
            
            // Track the last button Y position
            lastButtonY = y;
            
            // Move cursor up for next level (automatic spacing only)
            cursorY -= (buttonHeight + padding);

            // Determine which trophy sprite to use based on progress
            let trophySprite;
            if (levelNumber <= clearedLevel) {
                trophySprite = 'trophy_win.png';
            } else if (levelNumber === clearedLevel + 1) {
                trophySprite = 'trophy_play.png';
                // Track the current level's Y position
                currentLevelY = y;
                
                // Add rotating highlights behind the current level
                const highlight0 = this.add.image(x, y, 'atlas_03', 'highlight_0.png');
                highlight0.setOrigin(0.5);
                highlight0.setScale(0.65);
                this.mapContainer.add(highlight0);
                
                const highlight1 = this.add.image(x, y, 'atlas_03', 'highlight_1.png');
                highlight1.setOrigin(0.5);
                highlight1.setScale(0.65);
                this.mapContainer.add(highlight1);
                
                // Create rotation tweens
                this.tweens.add({
                    targets: highlight0,
                    angle: 360,
                    duration: 20000,
                    repeat: -1
                });
                
                this.tweens.add({
                    targets: highlight1,
                    angle: -360,
                    duration: 16000,
                    repeat: -1
                });
            } else {
                trophySprite = 'trophy_lock.png';
            }

            const button = this.add.image(x, y, 'atlas_03', trophySprite);
            button.setInteractive({ useHandCursor: true });
            button.setOrigin(0.5);
            button.setScale(0.7);

            const buttonText = this.add.text(x, y + 54, levelNumber.toString(), {
                fontSize: '50px',
                 color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3,
            });
            buttonText.setOrigin(0.5);

            // Track which button was pressed down
            button.levelNumber = levelNumber;
            
            button.on('pointerover', () => {
                button.setTint(0x5dade2);
            });

            button.on('pointerout', () => {
                button.clearTint();
            });

            button.on('pointerdown', (pointer) => {
                // Store which button was pressed
                this.pressedButton = button;
                
                // Also trigger the drag start behavior
                this.isDragging = true;
                this.dragStartY = pointer.y;
                this.containerStartY = this.mapContainer.y;
                this.wasDragging = false;
            });

            button.on('pointerup', () => {
                // Only load level if we're releasing on the same button we pressed
                if (this.pressedButton === button && !this.wasDragging) {
                    const devDomain = isDevelopmentDomain();
                    // Check if level is unlocked
                    if (levelNumber <= clearedLevel + 1 || devDomain) {
                        AdManager.instance.GameplayStart();
                        this.scene.start('GameScene', { level: levelNumber });
                    } else {
                        // Show locked message
                        this.showLockedMessage();
                    }
                }
            });

            this.mapContainer.add([button, buttonText]);
        }
        
        // Add animated pointer based on cleared level
        if (clearedLevel <= 0 && levelPositions[0]) {
            // Add pointer behind level 1
            const pos = levelPositions[0];
            const pointer = this.add.image(pos.x + 90, pos.y - 90, 'atlas_03', 'pointer_down.png');
            pointer.setOrigin(0.5);
            pointer.setDepth(-1); // Behind buttons but above map
            this.mapContainer.add(pointer);
            
            // Create animation timer
            this.time.addEvent({
                delay: 750,
                callback: () => {
                    if (pointer.texture.key === 'atlas_03' && pointer.frame.name === 'pointer_down.png') {
                        pointer.setTexture('atlas_03', 'pointer_up.png');
                    } else {
                        pointer.setTexture('atlas_03', 'pointer_down.png');
                    }
                },
                loop: true
            });
        } else if (clearedLevel === 1 && levelPositions[1]) {
            // Add pointer behind level 2
            const pos = levelPositions[1];
            const pointer = this.add.image(pos.x + 90, pos.y - 90, 'atlas_03', 'pointer_down.png');
            pointer.setOrigin(0.5);
            pointer.setDepth(-1); // Behind buttons but above map
            this.mapContainer.add(pointer);
            
            // Create animation timer
            this.time.addEvent({
                delay: 750,
                callback: () => {
                    if (pointer.texture.key === 'atlas_03' && pointer.frame.name === 'pointer_down.png') {
                        pointer.setTexture('atlas_03', 'pointer_up.png');
                    } else {
                        pointer.setTexture('atlas_03', 'pointer_down.png');
                    }
                },
                loop: true
            });
        }
        
        // If no current level was found (clearedLevel > totalLevels), use the last button
        if (currentLevelY === null && lastButtonY !== null) {
            currentLevelY = lastButtonY;
        }
        
        // Center the current level on screen if we found one
        if (currentLevelY !== null) {
            // Convert the button's local Y to world Y considering the container scale
            const worldButtonY = currentLevelY * this.scaleToFit;
            
            // Calculate the container Y position to center the button
            const screenCenterY = height / 2;
            const targetContainerY = screenCenterY - worldButtonY;
            
            // Apply constraints
            const maxY = height - this.scaledMapHeight;
            const minY = 0;
            
            // Clamp the position
            this.mapContainer.y = Math.max(maxY, Math.min(minY, targetContainerY));
        }
    }
    
    showLockedMessage() {
        // Create the locked message if it doesn't exist
        if (!this.lockedMessage) {
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            
            // Create semi-transparent black background
            this.lockedBackground = this.add.rectangle(centerX, centerY, 400, 150, 0x000000, 0.7);
            this.lockedBackground.setDepth(99);
            this.lockedBackground.setAlpha(0);
            
            this.lockedMessage = this.add.text(centerX, centerY, 'Level Locked', {
                fontSize: '48px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6,
            });
            this.lockedMessage.setOrigin(0.5);
            this.lockedMessage.setDepth(100); // Above everything
            this.lockedMessage.setAlpha(0);
        }
        
        // Cancel any existing tween
        if (this.lockedTween) {
            this.lockedTween.stop();
        }
        
        // Flash the message
        this.lockedMessage.setAlpha(1);
        this.lockedMessage.setScale(0.8);
        this.lockedBackground.setAlpha(1);
        
        this.lockedTween = this.tweens.add({
            targets: [this.lockedMessage, this.lockedBackground],
            alpha: 0,
            scale: 1.2,
            duration: 2000,
            ease: 'Power2'
        });
    }
    
    setupMapDragging() {
        const height = this.cameras.main.height;
        
        // Initialize drag tracking variables as instance properties
        this.isDragging = false;
        this.dragStartY = 0;
        this.containerStartY = 0;
        this.wasDragging = false;
        this.dragThreshold = 5; // pixels
        
        // Create an invisible interactive zone covering the entire screen
        const dragZone = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height);
        dragZone.setOrigin(0, 0);
        dragZone.setInteractive();
        dragZone.setDepth(-2); // Behind the map
        
        dragZone.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.containerStartY = this.mapContainer.y;
            this.wasDragging = false;
            this.pressedButton = null; // Clear any pressed button when starting drag
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const deltaY = pointer.y - this.dragStartY;
                
                // Check if we've moved enough to consider it a drag
                if (Math.abs(deltaY) > this.dragThreshold) {
                    this.wasDragging = true;
                }
                
                let newY = this.containerStartY + deltaY;
                
                // Apply constraints
                // Bottom constraint: map bottom cannot go above screen bottom
                const maxY = height - this.scaledMapHeight;
                
                // Top constraint: map top cannot go below screen top
                const minY = 0;
                
                // Clamp the position
                newY = Math.max(maxY, Math.min(minY, newY));
                
                this.mapContainer.y = newY;
            }
        });
        
        this.input.on('pointerup', () => {
            this.isDragging = false;
        });
        
        // Also stop dragging if pointer leaves the game
        this.input.on('pointerout', () => {
            this.isDragging = false;
        });
        
        // Add mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            let newY = this.mapContainer.y - deltaY;
            
            // Apply constraints
            const maxY = height - this.scaledMapHeight;
            const minY = 0;
            
            // Clamp the position
            newY = Math.max(maxY, Math.min(minY, newY));
            
            this.mapContainer.y = newY;
        });
    }
    
    shutdown() {
        // Clean up all input event listeners
        this.input.off('pointermove');
        this.input.off('pointerup');
        this.input.off('pointerout');
        this.input.off('wheel');
        
        // Clean up button event listeners
        if (this.mapContainer) {
            this.mapContainer.list.forEach(child => {
                if (child.type === 'Image' && child.input) {
                    child.off('pointerover');
                    child.off('pointerout');
                    child.off('pointerdown');
                    child.off('pointerup');
                }
            });
        }
    }
}