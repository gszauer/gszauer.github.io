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

            button.on('pointerover', () => {
                button.setTint(0x5dade2);
            });

            button.on('pointerout', () => {
                button.clearTint();
            });

            button.on('pointerdown', () => {
                this.scene.start('GameScene', { level: levelNumber });
            });

            this.mapContainer.add([button, buttonText]);
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
    
    setupMapDragging() {
        const height = this.cameras.main.height;
        let isDragging = false;
        let dragStartY = 0;
        let containerStartY = 0;
        
        // Create an invisible interactive zone covering the entire screen
        const dragZone = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height);
        dragZone.setOrigin(0, 0);
        dragZone.setInteractive();
        dragZone.setDepth(-2); // Behind the map
        
        dragZone.on('pointerdown', (pointer) => {
            isDragging = true;
            dragStartY = pointer.y;
            containerStartY = this.mapContainer.y;
        });
        
        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                const deltaY = pointer.y - dragStartY;
                let newY = containerStartY + deltaY;
                
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
            isDragging = false;
        });
        
        // Also stop dragging if pointer leaves the game
        this.input.on('pointerout', () => {
            isDragging = false;
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
                }
            });
        }
    }
}