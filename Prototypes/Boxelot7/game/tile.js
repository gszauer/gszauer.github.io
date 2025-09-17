class Tile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, gridX, gridY) {
        super(scene, x, y);
        this.gridX = gridX;
        this.gridY = gridY;

        const tileWidth = Grid.TILE_WIDTH;
        const tileHeight = Grid.TILE_HEIGHT;

        // Set the size and interactive area. The container's origin (x,y) is now effectively its center.
        this.setSize(tileWidth, tileHeight);
        this.setInteractive();
        
        // Tile background sprite instead of graphics
        this.backgroundSprite = scene.add.sprite(0, 0, 'atlas_01', 'dark.png');
        this.backgroundSprite.setDisplaySize(tileWidth, tileHeight);
        this.add(this.backgroundSprite);
        
        // Keep graphics for border
        this.border = scene.add.graphics();
        this.add(this.border);
        
        // Store the random number for light/mid sprite matching (1-5)
        this.spriteVariant = Phaser.Math.Between(1, 5);
        this.spriteVariant2 = Phaser.Math.Between(1, 5);

        // --- Position all visual children relative to the new (0,0) center point ---

        // Monster sprite (initially hidden)
        this.monsterSprite = scene.add.sprite(0, -10, null);
        this.monsterSprite.setVisible(false);
        this.add(this.monsterSprite);
        
        // Stat text is near the bottom edge. (bottom edge is at y = tileHeight / 2)
        this.statText = scene.add.text(0, tileHeight / 2 - 20, '', { fontSize: '18px', fill: '#fff', align: 'center', padding: { x: 10, y: 10 } }).setOrigin(0.5);
        this.add(this.statText);

        // Status effect sprites
        this.freezeSprite = scene.add.sprite(tileWidth / 2 - 30, 
            -tileHeight / 2 + 20, 'atlas_01', 'freeze.png');
        this.freezeSprite.setScale(0.2);
        this.freezeSprite.setVisible(false);
        this.add(this.freezeSprite);
        
        this.poisonSprite = scene.add.sprite(tileWidth / 2 - 15,
            -tileHeight / 2 + 20, 'atlas_01', 'poison.png');
        this.poisonSprite.setScale(0.2);
        this.poisonSprite.setVisible(false);
        this.add(this.poisonSprite);
        
        // Key icon is at the top-left corner.
        this.keyIcon = scene.add.text(-tileWidth / 2 + 15, -tileHeight / 2 + 15, '', { fontSize: '16px', padding: { x: 10, y: 10 } }).setOrigin(0.5);
        this.add(this.keyIcon);
        
        // Key sprite
        this.keySprite = scene.add.sprite(
             -tileWidth / 2 + 25, 
            -tileHeight / 2 + 26, 'atlas_01', 'key.png');
        this.keySprite.setScale(0.3);
        this.keySprite.setVisible(false);
        this.add(this.keySprite);
        
        // Item sprite (initially hidden)
        this.itemSprite = scene.add.sprite(0, -10, null);
        this.itemSprite.setVisible(false);
        this.add(this.itemSprite);
        
        // Question mark sprite for unrevealed tiles
        this.questionMarkSprite = scene.add.sprite(0, -10, 'atlas_01', 'question_mark.png');
        this.questionMarkSprite.setScale(0.6);
        this.questionMarkSprite.setVisible(false);
        this.add(this.questionMarkSprite);
        
        // Cross sprite for blocked tiles
        this.crossSprite = scene.add.sprite(0, -10, 'atlas_01', 'cross.png');
        this.crossSprite.setScale(0.6);
        this.crossSprite.setVisible(false);
        this.add(this.crossSprite);
        
        // Click indicator - null by default
        this.clickIndicator = null;
        
        this.state = TileState.HIDDEN_UNACCESSIBLE;
        this.type = TileType.EMPTY;
        this.content = null;

        this.on('pointerdown', () => this.scene.onTileClicked(this));
        
        scene.add.existing(this);
        this.draw();
    }

    setContent(type, content = null) {
        this.type = type;
        this.content = content;
        if(this.type === TileType.RANDOM_ITEM) {
            this.startCycle();
        }
        this.draw();
    }

    draw() {
        this.border.clear();
        this.statText.setText('');
        if (this.statContainer) {
            this.statContainer.setVisible(false);
        }
        this.keyIcon.setText('');
        this.keySprite.setVisible(false);
        this.freezeSprite.setVisible(false);
        this.poisonSprite.setVisible(false);
        this.questionMarkSprite.setVisible(false);
        this.crossSprite.setVisible(false);

        let spriteName;
        let icon = '';

        switch (this.state) {
            case TileState.HIDDEN_UNACCESSIBLE:
                spriteName = `mid_${this.spriteVariant}.png`;
                if (this.scene.player.hasItem('Lantern') && this.content && this.content.isKeyHolder) {
                    this.keySprite.setVisible(true);
                }
                break;
            case TileState.HIDDEN_BLOCKED:
                spriteName = `mid_${this.spriteVariant}.png`;
                this.crossSprite.setVisible(true);
                if (this.scene.player.hasItem('Lantern') && this.content && this.content.isKeyHolder) {
                    this.keySprite.setVisible(true);
                }
                break;
            case TileState.HIDDEN_NORMAL:
                spriteName = `light_${this.spriteVariant2}.png`;
                this.questionMarkSprite.setVisible(true);
                if (this.scene.player.hasItem('Lantern') && this.content && this.content.isKeyHolder) {
                    this.keySprite.setVisible(true);
                }
                break;
            case TileState.REVEALED:
                spriteName = 'dark.png';
                switch (this.type) {
                    case TileType.EMPTY: break;
                    case TileType.DOOR:
                        // Door will use sprite instead of icon
                        break;
                    case TileType.MONSTER:
                        icon = this.content.icon;
                        // Create stat container if not exists
                        if (!this.statContainer) {
                            this.statContainer = this.scene.add.container(0, Grid.TILE_HEIGHT / 2 - 20);
                            this.add(this.statContainer);
                            
                            // Heart icon
                            this.heartIcon = this.scene.add.sprite(-40, 0, 'atlas_01', 'heart.png').setScale(0.2);
                            this.statContainer.add(this.heartIcon);
                            
                            // HP text
                            this.hpStatText = this.scene.add.text(-26, 0, '', { fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);
                            this.statContainer.add(this.hpStatText);
                            
                            // Blade icon
                            this.bladeIcon = this.scene.add.sprite(18, 0, 'atlas_01', 'blade.png').setScale(0.2);
                            this.statContainer.add(this.bladeIcon);
                            
                            // Attack text
                            this.atkStatText = this.scene.add.text(28, 0, '', { fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);
                            this.statContainer.add(this.atkStatText);
                        }
                        
                        this.hpStatText.setText(`${this.content.hp}`);
                        this.atkStatText.setText(`${this.content.attack}`);
                        this.statContainer.setVisible(true);
                        this.statText.setVisible(false);
                        if (this.content.isKeyHolder && (!this.content.firstAttack || this.scene.player.hasItem('Lantern'))) {
                            this.keySprite.setVisible(true);
                        } else {
                            this.keySprite.setVisible(false);
                        }
                        
                        // Show/hide status effect sprites
                        this.poisonSprite.setVisible(this.content.status.poison > 0);
                        this.freezeSprite.setVisible(this.content.status.freeze > 0);
                        
                        // Adjust positions if both are shown
                        if(this.content.status.poison > 0 && this.content.status.freeze > 0) {
                            this.freezeSprite.x = Grid.TILE_WIDTH / 2 - 46;
                            this.poisonSprite.x = Grid.TILE_WIDTH / 2 - 20;
                        } else {
                            this.freezeSprite.x = Grid.TILE_WIDTH / 2 - 20;
                            this.poisonSprite.x = Grid.TILE_WIDTH / 2 - 20;
                        }
                        break;
                    case TileType.ITEM:
                        // Items will use sprites instead of icon text
                        break;
                    case TileType.BARREL: 
                        // Barrel will use sprite instead of icon
                        break;
                    case TileType.RANDOM_ITEM: 
                        // Random items will use sprites instead of icon text
                        break;
                    case TileType.SHOP: 
                        // Shop will use sprite instead of icon
                        break;
                    case TileType.CHALLENGE: 
                        // Challenge will use sprite instead of icon
                        break;
                    case TileType.TRAP: break; // Handled on reveal
                }
                break;
        }
        
        // Update background sprite
        this.backgroundSprite.setFrame(spriteName);
        
        // Draw border
        //this.border.lineStyle(2, Colors.BLACK).strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Handle sprite vs text icon
        if (this.type === TileType.MONSTER && this.state === TileState.REVEALED && this.content) {
            // Show monster sprite
            this.monsterSprite.setVisible(true);
            this.itemSprite.setVisible(false);
            // Monster sprites are now in atlas_02 as individual images
            // Each monster image (e.g., 'skeleton.png') contains 4 frames arranged in 2x2
            const frameIndex = this.content.getAnimationFrame();
            const frameX = (frameIndex % 2) * MONSTER_SPRITE_CONFIG.FRAME_WIDTH;
            const frameY = Math.floor(frameIndex / 2) * MONSTER_SPRITE_CONFIG.FRAME_HEIGHT;
            
            // Set the texture
            this.monsterSprite.setTexture('atlas_02', `${this.content.icon}.png`);
            
            // Use setCrop to show only the desired frame
            this.monsterSprite.setCrop(frameX, frameY, MONSTER_SPRITE_CONFIG.FRAME_WIDTH, MONSTER_SPRITE_CONFIG.FRAME_HEIGHT);
            
            // Calculate the origin point for the cropped frame
            // The origin needs to be relative to the full texture size
            const fullWidth = MONSTER_SPRITE_CONFIG.FRAME_WIDTH * 2;
            const fullHeight = MONSTER_SPRITE_CONFIG.FRAME_HEIGHT * 2;
            const originX = (frameX + MONSTER_SPRITE_CONFIG.FRAME_WIDTH / 2) / fullWidth;
            const originY = (frameY + MONSTER_SPRITE_CONFIG.FRAME_HEIGHT / 2) / fullHeight;
            
            // Set position and origin
            this.monsterSprite.setPosition(0, -10);
            this.monsterSprite.setOrigin(originX, originY);
            
            // Enable texture smoothing for smooth scaling
            this.monsterSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            
            // Scale sprite to fit tile nicely
            const scaleFactor = Math.min(
                (this.width  * 0.9)  / MONSTER_SPRITE_CONFIG.FRAME_WIDTH,
                (this.height * 0.9)  / MONSTER_SPRITE_CONFIG.FRAME_HEIGHT
            );
            this.monsterSprite.setScale(scaleFactor);
        } else if (this.type === TileType.ITEM && this.state === TileState.REVEALED && this.content && this.content.sprite) {
            // Show item sprite
            this.monsterSprite.setVisible(false);
            this.itemSprite.setVisible(true);
            this.itemSprite.setTexture('atlas_01', this.content.sprite);
            
            // Enable texture smoothing for smooth scaling
            this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            
            // Scale sprite to fit tile nicely (items are 124x124 in atlas)
            const itemSize = 124;
            const scaleFactor = Math.min(
                (this.width  * GameSettings.GLOBAL_TILE_ICON_SCALE) / itemSize,
                (this.height * GameSettings.GLOBAL_TILE_ICON_SCALE) / itemSize
            );
            this.itemSprite.setScale(scaleFactor);
        } else if (this.type === TileType.RANDOM_ITEM && this.state === TileState.REVEALED && this.content && this.content.sprite) {
            // Show random item sprite
            this.monsterSprite.setVisible(false);
            this.itemSprite.setVisible(true);
            this.itemSprite.setTexture('atlas_01', this.content.sprite);
            
            // Enable texture smoothing for smooth scaling
            this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            
            // Scale sprite to fit tile nicely (items are 124x124 in atlas)
            const itemSize = 124;
            const scaleFactor = Math.min(
                (this.width  * GameSettings.GLOBAL_TILE_ICON_SCALE) / itemSize,
                (this.height * GameSettings.GLOBAL_TILE_ICON_SCALE) / itemSize
            );
            this.itemSprite.setScale(scaleFactor);
        } else if (this.type === TileType.SHOP && this.state === TileState.REVEALED) {
            // Show shop sprite
            this.monsterSprite.setVisible(false);
            this.itemSprite.setVisible(true);
            this.itemSprite.setTexture('atlas_01', 'shop.png');
            this.itemSprite.setY(GameSettings.GLOBAL_TILE_KEY_ICON_Y_OFFSET);
            
            // Enable texture smoothing for smooth scaling
            this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            
            // Scale sprite to fit tile nicely (shop is 128x128 in atlas)
            const shopSize = 128;
            const scaleFactor = Math.min(
                (this.width  * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE) / shopSize,
                (this.height * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE) / shopSize
            );
            this.itemSprite.setScale(scaleFactor);
        } else if (this.type === TileType.BARREL && this.state === TileState.REVEALED) {
            // Show barrel sprite
            this.monsterSprite.setVisible(false);
            this.itemSprite.setVisible(true);
            this.itemSprite.setTexture('atlas_01', 'barrel.png');
            this.itemSprite.setY(GameSettings.GLOBAL_TILE_KEY_ICON_Y_OFFSET);
            
            // Enable texture smoothing for smooth scaling
            this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            
            // Scale sprite to fit tile nicely (barrel is 128x128 in atlas)
            const barrelSize = 128;
            const scaleFactor = Math.min(
                (this.width  * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE) / barrelSize,
                (this.height * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE) / barrelSize
            );
            this.itemSprite.setScale(scaleFactor);
        } else if (this.type === TileType.CHALLENGE && this.state === TileState.REVEALED) {
            // Show challenge sprite
            this.monsterSprite.setVisible(false);
            this.itemSprite.setVisible(true);
            this.itemSprite.setTexture('atlas_01', 'challenge_door.png');
            this.itemSprite.setY(GameSettings.GLOBAL_TILE_KEY_ICON_Y_OFFSET);
            
            // Enable texture smoothing for smooth scaling
            this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            
            // Scale sprite to fit tile nicely (challenge is 128x128 in atlas)
            const challengeSize = 128;
            const scaleFactor = Math.min(
                (this.width  * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE) / challengeSize,
                (this.height * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE) / challengeSize
            );
            this.itemSprite.setScale(scaleFactor);
        } else if (this.type === TileType.DOOR && this.state === TileState.REVEALED) {
            // Show door sprite
            this.monsterSprite.setVisible(false);
            this.itemSprite.setVisible(true);
            const doorSprite = this.scene.player.hasKey ? 'door_open.png' : 'door_locked.png';
            this.itemSprite.setTexture('atlas_01', doorSprite);
            this.itemSprite.setY(GameSettings.GLOBAL_TILE_KEY_ICON_Y_OFFSET);
            
            // Enable texture smoothing for smooth scaling
            this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            
            // Scale sprite to fit tile nicely (door is 128x128 in atlas)
            const doorSize = 128;
            const scaleFactor = Math.min(
                (this.width  * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE * 1.2) / doorSize,
                (this.height * GameSettings.GLOBAL_TILE_KEY_ICON_SCALE * 1.2) / doorSize
            );
            this.itemSprite.setScale(scaleFactor);
        } else {
            // Use text icon for everything else
            this.monsterSprite.setVisible(false);
            this.itemSprite.setVisible(false);
        }
    }
    
    reveal() {
        
        if (this.state !== TileState.HIDDEN_NORMAL) return;
        this.state = TileState.REVEALED;
        // Only stop cycling for non-random item tiles
        if (this.type !== TileType.RANDOM_ITEM) {
            this.stopCycle();
        } else {
            // Ensure cycling is active (in case it was stopped for some reason)
            this.stopCycle();
            this.startCycle();
        }
        this.scene.onTileRevealed(this);
        
        // Play swoosh sound for tile reveal
        if (!this.scene.isMuted) {
            const swooshSounds = ['swoosh_1', 'swoosh_2'];
            const randomSound = swooshSounds[Math.floor(Math.random() * swooshSounds.length)];
            this.scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: this.scene.soundVolume
            });
        }
        
        this.draw();
    }
    
    startCycle() {
        if (this.type !== TileType.RANDOM_ITEM) return;
        const outcomes = ['Potion', 'Blade Scroll', 'Poison Vial', 'Freeze Scroll', 'Sheep Scroll', 'Explosive', 'Coin', 'Heart'];
        this.cycleEvent = this.scene.time.addEvent({
            delay: 400,
            callback: () => {
                // Validate tile still exists
                if (!this.scene) {
                    this.stopCycle();
                    return;
                }
                const randomItemName = outcomes[Math.floor(Math.random() * outcomes.length)];
                this.content = createItem(randomItemName);
                this.draw();
            },
            loop: true
        });
    }

    stopCycle() {
        if (this.cycleEvent) {
            this.cycleEvent.destroy();
            this.cycleEvent = null;
        }
    }
    
    
    flashRed() {
        // Temporarily tint the sprite red
        this.backgroundSprite.setTint(0xff0000);
        
        // Add thick red border
        this.border.clear();
        this.border.lineStyle(4, Colors.RED).strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        this.scene.time.delayedCall(300, () => {
            // Validate tile still exists
            if (!this.scene || !this.backgroundSprite) return;
            // Clear tint and redraw
            this.backgroundSprite.clearTint();
            this.draw();
        });
    }
    
    showClickIndicator() {
        if (this.clickIndicator) return; // Already showing
        
        // Create click indicator sprite
        this.clickIndicator = this.scene.add.sprite(15, -50, 'atlas_01', 'finger_down.png');
        this.clickIndicator.setScale(0.5);
        this.clickIndicator.setDepth(100); // Make sure it's on top
        this.add(this.clickIndicator);
        
        // Track when indicator was shown for minimum display time
        this.clickIndicatorShownTime = this.scene.time.now;
        this.clickIndicatorMinDisplayTime = 0;//500; // Minimum 800ms display time
        
        // Create animation between finger_up and finger_down
        this.clickIndicatorTimer = this.scene.time.addEvent({
            delay: 500, // 0.5 seconds
            callback: () => {
                if (!this.clickIndicator || !this.scene) return;
                // Toggle between frames
                const currentFrame = this.clickIndicator.frame.name;
                const newFrame = currentFrame === 'finger_down.png' ? 'finger_up.png' : 'finger_down.png';
                this.clickIndicator.setFrame(newFrame);
            },
            loop: true
        });
    }
    
    hideClickIndicator(forceHide = false) {
        if (!this.clickIndicator) return;
        
        // If not forcing hide, check minimum display time
        if (!forceHide && this.clickIndicatorShownTime) {
            const elapsedTime = this.scene.time.now - this.clickIndicatorShownTime;
            if (elapsedTime < this.clickIndicatorMinDisplayTime) {
                // Schedule hide after minimum time has passed
                const remainingTime = this.clickIndicatorMinDisplayTime - elapsedTime;
                if (remainingTime <= 0) {
                    this.hideClickIndicator(true);
                }
                else {
                    this.scene.time.delayedCall(remainingTime, () => {
                        this.hideClickIndicator(true);
                    });
                }
                return;
            }
        }
        
        // Clean up timer
        if (this.clickIndicatorTimer) {
            this.clickIndicatorTimer.destroy();
            this.clickIndicatorTimer = null;
        }
        
        // Remove sprite
        this.clickIndicator.destroy();
        this.clickIndicator = null;
        this.clickIndicatorShownTime = null;
    }
    
    destroy() {
        // Clean up any active timers before destroying
        this.stopCycle();
        this.hideClickIndicator(true); // Force hide immediately when destroying
        super.destroy();
    }
}