class Window extends Phaser.GameObjects.Container {
    static openWindows = [];
    static externalWindowOpen = false;
    static tutorialWindowOpen = false;
    
    constructor(scene, width, height) {
        super(scene, 0, 0);
        
        this.windowWidth = width;
        this.windowHeight = height;
        
        // Get screen dimensions
        const screenWidth = scene.cameras.main.width;
        const screenHeight = scene.cameras.main.height;
        
        // Create full screen input blocker
        this.inputBlocker = scene.add.rectangle(
            screenWidth / 2, 
            screenHeight / 2, 
            screenWidth, 
            screenHeight, 
            0x000000, 
            0
        );
        this.inputBlocker.setInteractive({ useHandCursor: false });
        this.inputBlocker.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
        });
        this.inputBlocker.on('pointerup', (pointer) => {
            pointer.event.stopPropagation();
        });
        this.inputBlocker.on('pointermove', (pointer) => {
            pointer.event.stopPropagation();
        });
        this.add(this.inputBlocker);
        
        // Create semi-transparent black background
        this.darkBackground = scene.add.rectangle(
            screenWidth / 2, 
            screenHeight / 2, 
            screenWidth, 
            screenHeight, 
            0x000000, 
            0.5
        );
        this.add(this.darkBackground);
        
        // Calculate window position (centered)
        const windowX = (screenWidth - width) / 2;
        const windowY = (screenHeight - height) / 2;
        
        // Create nine-slice window frame
        this.createNineSliceWindow(scene, windowX, windowY, width, height);
        
        // Add this window to the scene (ensures it's on top)
        scene.add.existing(this);
        
        // Track this window as open
        Window.openWindows.push(this);
        
        // Set high depth to ensure window is on top
        this.setDepth(1000);
        
        // Store scene reference
        this.scene = scene;
    }
    
    createNineSliceWindow(scene, x, y, width, height) {
        const scale = 0.5;
        
        // Create all sprites first to get their dimensions
        this.topLeft = scene.add.image(0, 0, 'atlas_03', 'window_top_left.png');
        this.topCenter = scene.add.image(0, 0, 'atlas_03', 'window_top_center.png');
        this.topRight = scene.add.image(0, 0, 'atlas_03', 'window_top_right.png');
        
        this.centerLeft = scene.add.image(0, 0, 'atlas_03', 'window_center_left.png');
        this.centerCenter = scene.add.image(0, 0, 'atlas_03', 'window_center_center.png');
        this.centerRight = scene.add.image(0, 0, 'atlas_03', 'window_center_right.png');
        
        this.bottomLeft = scene.add.image(0, 0, 'atlas_03', 'window_bottom_left.png');
        this.bottomCenter = scene.add.image(0, 0, 'atlas_03', 'window_bottom_center.png');
        this.bottomRight = scene.add.image(0, 0, 'atlas_03', 'window_bottom_right.png');
        
        // Apply scale to all sprites
        const allSprites = [
            this.topLeft, this.topCenter, this.topRight,
            this.centerLeft, this.centerCenter, this.centerRight,
            this.bottomLeft, this.bottomCenter, this.bottomRight
        ];
        
        allSprites.forEach(sprite => sprite.setScale(scale));
        
        // Get actual dimensions after scaling
        const leftWidth = this.topLeft.displayWidth;
        const centerWidth = this.topCenter.displayWidth;
        const rightWidth = this.topRight.displayWidth;
        
        const topHeight = this.topLeft.displayHeight;
        const middleHeight = this.centerLeft.displayHeight;
        const bottomHeight = this.bottomLeft.displayHeight;
        
        // Calculate stretched dimensions
        const stretchedCenterWidth = width - leftWidth - rightWidth;
        const stretchedMiddleHeight = height - topHeight - bottomHeight;
        
        // Destroy the temporary center sprites and recreate as tile sprites
        this.topCenter.destroy();
        this.centerLeft.destroy();
        this.centerCenter.destroy();
        this.centerRight.destroy();
        this.bottomCenter.destroy();
        
        // Create tile sprites with proper dimensions
        this.topCenter = scene.add.tileSprite(0, 0, stretchedCenterWidth / scale, topHeight / scale, 'atlas_03', 'window_top_center.png');
        this.centerLeft = scene.add.tileSprite(0, 0, leftWidth / scale, stretchedMiddleHeight / scale, 'atlas_03', 'window_center_left.png');
        this.centerCenter = scene.add.tileSprite(0, 0, stretchedCenterWidth / scale, stretchedMiddleHeight / scale, 'atlas_03', 'window_center_center.png');
        this.centerRight = scene.add.tileSprite(0, 0, rightWidth / scale, stretchedMiddleHeight / scale, 'atlas_03', 'window_center_right.png');
        this.bottomCenter = scene.add.tileSprite(0, 0, stretchedCenterWidth / scale, bottomHeight / scale, 'atlas_03', 'window_bottom_center.png');
        
        // Apply scale to tile sprites
        this.topCenter.setScale(scale);
        this.centerLeft.setScale(scale);
        this.centerCenter.setScale(scale);
        this.centerRight.setScale(scale);
        this.bottomCenter.setScale(scale);
        
        // Position all elements
        // Top row
        this.topLeft.setPosition(x, y);
        this.topLeft.setOrigin(0, 0);
        
        this.topCenter.setPosition(x + leftWidth, y);
        this.topCenter.setOrigin(0, 0);
        
        this.topRight.setPosition(x + width, y);
        this.topRight.setOrigin(1, 0);
        
        // Middle row
        this.centerLeft.setPosition(x, y + topHeight);
        this.centerLeft.setOrigin(0, 0);
        
        this.centerCenter.setPosition(x + leftWidth, y + topHeight);
        this.centerCenter.setOrigin(0, 0);
        
        this.centerRight.setPosition(x + width - rightWidth, y + topHeight);
        this.centerRight.setOrigin(0, 0);
        
        // Bottom row
        this.bottomLeft.setPosition(x, y + height);
        this.bottomLeft.setOrigin(0, 1);
        
        this.bottomCenter.setPosition(x + leftWidth, y + height - bottomHeight);
        this.bottomCenter.setOrigin(0, 0);
        
        this.bottomRight.setPosition(x + width, y + height);
        this.bottomRight.setOrigin(1, 1);
        
        // Add all sprites to the container
        this.add(this.topLeft);
        this.add(this.topCenter);
        this.add(this.topRight);
        this.add(this.centerLeft);
        this.add(this.centerCenter);
        this.add(this.centerRight);
        this.add(this.bottomLeft);
        this.add(this.bottomCenter);
        this.add(this.bottomRight);
    }
    
    close() {
        // Remove from open windows list
        const index = Window.openWindows.indexOf(this);
        if (index > -1) {
            Window.openWindows.splice(index, 1);
        }
        
        // Destroy the window
        this.destroy();
    }
    
    static hasOpenWindows() {
        return Window.openWindows.length > 0 || Window.externalWindowOpen || Window.tutorialWindowOpen;
    }
    
    static closeAllWindows() {
        // Close all windows in reverse order (newest first)
        while (Window.openWindows.length > 0) {
            const window = Window.openWindows[Window.openWindows.length - 1];
            window.close();
        }
    }
}