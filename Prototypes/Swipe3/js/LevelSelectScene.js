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

        const buttonWidth = 80;
        const buttonHeight = 60;
        const padding = 20;
        
        // Single column layout
        const x = (this.cameras.main.width / 2) / this.scaleToFit; // Center horizontally in middle of screen
        const startY = this.mapTotalHeight - padding; // Start from bottom of container

        for (let i = 0; i < totalLevels; i++) {
            const levelNumber = i + 1;
            
            // Position buttons from bottom to top
            const y = startY - (i * (buttonHeight + padding)) - buttonHeight / 2;

            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x3498db);
            button.setInteractive({ useHandCursor: true });

            const buttonText = this.add.text(x, y, levelNumber.toString(), {
                fontSize: '24px',
                color: '#ffffff'
            });
            buttonText.setOrigin(0.5, 0.5);

            button.on('pointerover', () => {
                button.setFillStyle(0x5dade2);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x3498db);
            });

            button.on('pointerdown', () => {
                this.scene.start('GameScene', { level: levelNumber });
            });

            this.mapContainer.add([button, buttonText]);
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
}