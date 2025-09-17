class Game extends Phaser.Scene {
    static isTutorialFinished = false;
    static language = "en";

    static character = 'hero_knight';
    static possible_characters = ['hero_knight', 'hero_archer', 'hero_artificer', 'hero_wizard'];
    static character_unlocked = {
        hero_knight: true, 
        hero_archer: false,
        hero_artificer: false,
        hero_wizard: false
    };

    constructor() {
        super({ key: 'Game' });
        this.grid = [];
        this.tutorialStep = 0;
        this.revealedTilesCount = 0;
        
        // Tile removal control variables for creating custom level shapes
        this.removeTop = 0;
        this.removeBottom = 0;
        this.removeLeft = 0;
        this.removeRight = 0;
        this.poisonCounter = 0;
        this.freezeCounter = 0;
    }

    detectUserLanguage() {
        // Get supported languages from the Localization table
        const supportedLanguages = Object.keys(Localization);
        
        // First check for language parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang && supportedLanguages.includes(urlLang.toLowerCase())) {
            Game.language = urlLang.toLowerCase();
            console.log(`Using language from URL parameter: ${Game.language}`);
            return;
        }
        
        // If no URL parameter, fall back to browser language detection
        const browserLang = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage;
        
        // Extract just the language code (e.g., 'en' from 'en-US')
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Use detected language if supported, otherwise default to English
        if (supportedLanguages.includes(langCode)) {
            Game.language = langCode;
        } else {
            Game.language = 'en'; // Default fallback
        }
        
        console.log(`Detected browser language: ${browserLang}, using: ${Game.language}`);
    }

    updateLanguageUI() {
        // Update the language icon if it exists
        if (this.languageIcon) {
            this.languageIcon.setTexture('atlas_01', Game.language + '.png');
        }
        
        // Update all panels if they exist
        if (this.itemPanel) this.itemPanel.relocalize();
        if (this.shopPanel) this.shopPanel.relocalize();
        if (this.gameOverPanel) this.gameOverPanel.relocalize();
        if (this.debugPanel) this.debugPanel.relocalize();
        if (this.unlockItemSlotPanel) this.unlockItemSlotPanel.relocalize();
        if (this.challengePanel) this.challengePanel.relocalize();
        if (this.settingsPanel) this.settingsPanel.relocalize();
        // Tutorial UI doesn't need relocalization - it uses dynamic text
        if (this.languagePanel) this.languagePanel.relocalize();
    }

    checkDomainAuthorization() {
        const currentDomain = window.location.hostname;
        const currentUrl = window.location.href.toLowerCase();
        const referrer = document.referrer.toLowerCase();
        
        // Check 1: Basic domain validation
        let isDomainAuthorized = DomainProtection.ALLOWED_DOMAINS.includes(currentDomain);
        
        // Check 2: Iframe detection - game should not run in frames unless on authorized domain
        let isInFrame = window.parent !== window;
        let isFrameAuthorized = !isInFrame || isDomainAuthorized;
        
        // Check 4: Common piracy site patterns
        const piracySitePatterns = [
            'free-games', 'pirate', 'crack', 'hack', 'cheat', 'nulled', 
            'warez', 'torrent', 'download-game', 'game-download',
            'unblocked', 'proxy', 'mirror', 'clone'
        ];
        
        // Check 5: Protocol validation (should be https on production domains)
        let isSecureProtocol = window.location.protocol === 'https:' || 
            currentDomain === 'localhost' || 
            currentDomain === '127.0.0.1';

        
        const isPortal = DomainProtection.SAFE_URL_KEYS.some(pattern => 
            currentUrl.includes(pattern) || referrer.includes(pattern)
        );

        if (isPortal) {
            isDomainAuthorized = true;
            isFrameAuthorized = true;
        }
            
        /* The above check should handle this
        if (currentDomain.includes("poki")) {
            isDomainAuthorized = true;
            isFrameAuthorized = true;
        }*/

        // Combine all checks
        const isAuthorized = isDomainAuthorized && 
                           isFrameAuthorized && 
                           isSecureProtocol;
       
        
        if (!isAuthorized) {
            // Log the violation for debugging (will be obfuscated)
            console.error('Authorization failed:', {
                domain: currentDomain,
                inFrame: isInFrame,
                referrer: referrer.substring(0, 50),
                protocol: window.location.protocol
            });
            
            // Hide the game canvas
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'none';
            }
            
             // Clear the page and show error message
           document.body.innerHTML = DomainProtection.getErrorMessage(currentDomain, currentUrl, referrer,isDomainAuthorized, isFrameAuthorized, true, false, isSecureProtocol);
            
            // Disable right-click and common shortcuts
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.addEventListener('keydown', e => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
                    e.preventDefault();
                }
            });
            
            // Stop the game completely
            if (this.scene) {
                this.scene.pause();
            }
            
            return false;
        }
        
        return true;
    }

    setupPeriodicValidation() {
        // Check authorization every 2 minutes during gameplay
        this.time.addEvent({
            delay: 120000, // 2 minutes
            callback: () => {
                if (!this.checkDomainAuthorization()) {
                    return;
                }
            },
            loop: true
        });
        
        // Additional check on window focus (detects tab switching, potential tampering)
        window.addEventListener('focus', () => {
            // Small delay to allow for legitimate tab switching
            setTimeout(() => {
                this.checkDomainAuthorization();
            }, 1000);
        });
        
        // Check if developer tools are open (basic detection)
        let devtools = {
            open: false,
            orientation: null
        };
        
        const threshold = 160;
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    //console.warn('Developer tools detected');
                    // Trigger additional validation when dev tools are detected
                    this.checkDomainAuthorization();
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }

    preload() {
        if (PlayerData._instance === null) {
            const playerData = new PlayerData((status) => {
                console.log("Player data created, initialized:", status);
            });
        }

        AdManager.instance.LoadingStarted();
        this.createLoadingBar();
        
        // Load all game assets
        this.load.atlas('atlas_01', 'assets/atlas_01.png', 'assets/atlas_01.json');
        this.load.atlas('atlas_02', 'assets/atlas_02.png', 'assets/atlas_02.json');
        this.load.audioSprite('soundbank', 'assets/soundbank.json', ['assets/soundbank.mp3']);
    }

    createLoadingBar() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(centerX - 160, centerY - 25, 320, 50);

        const loadingText = this.make.text({
            x: centerX,
            y: centerY - 50,
            text: Localization[Game.language]["loading"],
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: centerX,
            y: centerY,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(centerX - 150, centerY - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();


            AdManager.instance.LoadingFinished();
        });
    }

    create() {
        // Detect and set user's language first
        this.detectUserLanguage();
        
        // Check domain authorization first
        if (!this.checkDomainAuthorization()) {
            return; // Stop game initialization if domain is not authorized
        }
        
        // Ignore periodic validation for now. Might re-implement in the future.
        // this.setupPeriodicValidation();
        
        // Create a tiled background using repeat_background.png
        this.createTiledBackground();
        this.player = new Player(this);

        // Create main game container
        this.gameUIContainer = this.add.container(0, 0);
        this.mainContainer = this.add.container(0, 0);
        
        this.calculateDynamicLayout();
        this.createUI();
        
        // Scale and center the game container
        this.scaleAndPositionUI();
        this.updateTiledBackground();
        
        // Handle window resize
        this.scale.on('resize', this.handleResize, this);
        
        // Initialize game message system
        this.gameMessage = this.add.text(300, 450, '', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(10000).setVisible(false);
        this.gameMessageTimer = 0;
        
        // Check if PlayerData is initialized and tutorial is done
        const checkTutorialAndStart = () => {
            if (PlayerData.Instance && PlayerData.Instance.initialized) {
                const tutorialDone = PlayerData.Instance.GetNumber("tutorial_done") === 1;
                console.log("Tutorial done status:", tutorialDone, "Value:", PlayerData.Instance.GetNumber("tutorial_done"));
                
                // Sync Game.isTutorialFinished with PlayerData
                if (tutorialDone) {
                    Game.isTutorialFinished = true;
                }
                
                // Load character unlocks from PlayerData
                if (PlayerData.Instance.GetNumber("archer_unlocked") === 1) {
                    Game.character_unlocked.hero_archer = true;
                }
                if (PlayerData.Instance.GetNumber("artificer_unlocked") === 1) {
                    Game.character_unlocked.hero_artificer = true;
                }
                if (PlayerData.Instance.GetNumber("wizard_unlocked") === 1) {
                    Game.character_unlocked.hero_wizard = true;
                }
                
                if (tutorialDone) {
                    // Show menu as usual
                    this.restartGame();
                } else {
                    // Skip menu and go directly to gameplay (tutorial)
                    this.restartGame(false); // Don't show character select UI
                    this.generateFloor(); // Start the game directly
                    AdManager.instance.GameplayStart(); // Track gameplay start for tutorial
                }
            } else {
                // PlayerData not ready yet, wait a bit and try again
                this.time.delayedCall(100, checkTutorialAndStart);
            }
        };
        
        checkTutorialAndStart();

    }
    
    update(time, delta) {
        // Handle game message fading
        if (this.gameMessage && this.gameMessage.visible && this.gameMessageTimer > 0) {
            const elapsed = time - this.gameMessageTimer;
            const displayDuration = 1500; // 1.5 seconds before starting to fade
            const fadeDuration = 500; // 0.5 seconds to fade out
            
            if (elapsed > displayDuration) {
                const fadeProgress = Math.min((elapsed - displayDuration) / fadeDuration, 1);
                this.gameMessage.setAlpha(1 - fadeProgress);
                
                if (fadeProgress >= 1) {
                    this.gameMessage.setVisible(false);
                    this.gameMessageTimer = 0;
                }
            }
        }
    }
    
    calculateDynamicLayout() {
        // Use original game dimensions (600x900)
        const screenWidth = 600;
        const screenHeight = 900;
        
        // Calculate available space (gameUI is at bottom)
        const availableHeight = screenHeight - Grid.GAMEUI_HEIGHT - Grid.BOTTOM_PADDING;
        const availableWidth = screenWidth - (Grid.PADDING * 2);
        
        // Calculate tile size based on height (since we want to fit height perfectly)
        const tileHeight = Math.floor(availableHeight / Grid.ROWS);
        const tileWidth = Math.floor(tileHeight * 0.77); // Maintain aspect ratio similar to original (100/130)
        
        // Check if it fits horizontally, if not, scale based on width
        const totalGridWidth = tileWidth * Grid.COLS;
        if (totalGridWidth > availableWidth) {
            Grid.TILE_WIDTH = Math.floor(availableWidth / Grid.COLS);
            Grid.TILE_HEIGHT = Math.floor(Grid.TILE_WIDTH / 0.77);
        } else {
            Grid.TILE_WIDTH = tileWidth;
            Grid.TILE_HEIGHT = tileHeight;
        }
        
        // Calculate centered position
        const gridWidth = Grid.TILE_WIDTH * Grid.COLS;
        const gridHeight = Grid.TILE_HEIGHT * Grid.ROWS;
        
        // Center horizontally
        Grid.X_OFFSET = Math.floor((screenWidth - gridWidth) / 2) + Grid.TILE_WIDTH / 2;
        
        // Position tiles from bottom up, starting at bottom of available space
        const totalGridHeight = Grid.ROWS * Grid.TILE_HEIGHT + Grid.PADDING / 2;
        const containerBottomY = screenHeight - Grid.GAMEUI_HEIGHT - Grid.BOTTOM_PADDING;
        Grid.Y_OFFSET = containerBottomY - totalGridHeight + Grid.TILE_HEIGHT / 2;
    }
    
    restartGame(showCharacterUI = true) {
        this.revealedTilesCount = 0;
        this.poisonCounter = 0;
        this.freezeCounter = 0;

        this.player.reset();
        this.gameOverPanel.close();
        this.updateInventoryUI();

        this.setFloorTileRemoval();

        // Show character select UI at the start of the game
        if (showCharacterUI) {
            this.characterSelectUI.show();
        }
        this.playerAnimationState = 'idle';
        this.updatePlayerMonsterFrame();
    }

    createUI() {
        // Add footer background image from atlas (behind all other content)
        const footerBg = this.add.image(300, 10, 'atlas_01', 'footer.png');
        footerBg.setOrigin(0.5, 0);
        footerBg.setDepth(-10);
        // Scale footer to fit screen width
        const footerScale = 600 / 1443; // 1443 is the original width of the footer image
        footerBg.setScale(footerScale);
        footerBg.disableInteractive();
        
        // Add player monster sprite
        this.playerMonster = this.add.sprite(100, 100, 'atlas_02', `${Game.character}.png`);
        this.playerMonster.setDepth(-5); // Above background, below other UI elements
        
        // Set initial cropping to show idle frame (top-left)
        this.playerMonster.setCrop(0, 0, MONSTER_SPRITE_CONFIG.FRAME_WIDTH, MONSTER_SPRITE_CONFIG.FRAME_HEIGHT);
        
        // Calculate proper scale and origin
        const monsterScale = 80 / MONSTER_SPRITE_CONFIG.FRAME_WIDTH * 2; // Target size of 80 pixels
        this.playerMonster.setScale(monsterScale);
        
        // Set origin to center of the cropped frame relative to full texture
        const originX = (0 + MONSTER_SPRITE_CONFIG.FRAME_WIDTH / 2) / MONSTER_SPRITE_CONFIG.TOTAL_WIDTH;
        const originY = (0 + MONSTER_SPRITE_CONFIG.FRAME_HEIGHT / 2) / MONSTER_SPRITE_CONFIG.TOTAL_HEIGHT;
        this.playerMonster.setOrigin(originX, originY);
        
        // Initialize animation state
        this.playerAnimationState = 'idle';
        this.playerAnimationTimer = null;
        
        const labelSize = '20px';
        const iconScale = 0.20;

        // Header
        // HP icon and text
        this.hpIcon = this.add.sprite(190, 55, 'atlas_01', 'heart.png').setScale(iconScale);
        this.hpText = this.add.text(this.hpIcon.x + 8, this.hpIcon.y - 22, '', 
            { fontSize: labelSize, fill: '#fff', padding: { x: 10, y: 10 } });
        
        // Attack icon and text
        this.atkIcon = this.add.sprite(190, 85, 'atlas_01', 'blade.png').setScale(iconScale);
        this.atkText = this.add.text(this.atkIcon.x + 8, this.atkIcon.y - 22, '', 
            { fontSize: labelSize, fill: '#fff', padding: { x: 10, y: 10 } });
        
        // Gold icon and text
        this.goldIcon = this.add.sprite(190, 115, 'atlas_01', 'coin.png').setScale(iconScale);
        this.goldText = this.add.text(this.goldIcon.x + 8, this.goldIcon.y - 22, '', 
            { fontSize: labelSize, fill: '#fff', padding: { x: 10, y: 10 } });

        // Floor icon and text
        this.floorIcon = this.add.sprite(190, 145, 'atlas_01', 'door_icon_top.png').setScale(iconScale);
        this.floorText = this.add.text(this.floorIcon.x + 8, this.floorIcon.y - 22, '', 
            { fontSize: labelSize, fill: '#fff', padding: { x: 10, y: 10 } });
        
        // Key indicator
        this.keyIndicator = this.add.sprite(140, this.floorIcon.y - 10, 'atlas_01', 'key.png').setScale(0.35).setVisible(false);
        
        this.gameUIContainer.add([footerBg, this.playerMonster, this.hpText, this.atkIcon, this.atkText, this.floorIcon, this.floorText, this.goldIcon, this.goldText, this.keyIndicator, this.hpIcon]);

        //this.hpIcon.setScale(iconScale);
        if (IsDevEnv()) {
            this.hpIcon.setInteractive({ useHandCursor: true, pixelPerfect: false });

            this.hpIcon.on('pointerdown', () => {
                this.openDebugMenu();
            });
        }
       
        
        this.helpButton = this.add.sprite(270, this.goldIcon.y - 15, 'atlas_01', 'help_btn_hover.png')
            .setScale(0.4)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.helpButton.setTexture('atlas_01', 'help_btn.png');
            })
            .on('pointerout', () => {
                this.helpButton.setTexture('atlas_01', 'help_btn_hover.png');
            })
            .on('pointerdown', () => this.openHelpMenu());

        // Add language flag icon to help button
        this.languageIcon = this.add.sprite(this.helpButton.x, this.helpButton.y, 'atlas_01', Game.language + '.png')
            .setScale(0.4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.openHelpMenu());

        // Settings button with hover states
        this.settingsButton = this.add.sprite(this.helpButton.x, this.helpButton.y + 40, 'atlas_01', 'settings_btn_hover.png')
            .setScale(0.4)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.settingsButton.setTexture('atlas_01', 'setings_btn.png');
            })
            .on('pointerout', () => {
                this.settingsButton.setTexture('atlas_01', 'settings_btn_hover.png');
            })
            .on('pointerdown', () => this.openSettingsMenu());
        
        // Add buttons to container
        this.gameUIContainer.add([this.helpButton, this.languageIcon, this.settingsButton]);


        // Footer - Inventory
        this.inventorySlots = [];
        const slotSize = 60;
        const slotSpacing = 9;
        const slotsPerRow = 4;
        const rowSpacing = 9;
        const totalInventoryWidth = (slotSize + slotSpacing) * slotsPerRow - slotSpacing;
        const inventoryStartX = (600 - totalInventoryWidth) - 29;
        const inventoryStartY = 63;
        
        for (let i = 0; i < GameSettings.INVENTORY_SIZE; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            const x = inventoryStartX + col * (slotSize + slotSpacing) + slotSize / 2;
            const y = inventoryStartY + row * (slotSize + rowSpacing);
            const slot = this.add.container(x, y);
            const icon = this.add.text(0, 0, '', { fontSize: '32px', padding: { x: 10, y: 10 } }).setOrigin(0.5);
            const sprite = this.add.sprite(0, 0, null);
            sprite.setVisible(false);
            slot.add([icon, sprite]);
            
            slot.setInteractive(new Phaser.Geom.Rectangle(-slotSize/2, -slotSize/2, slotSize, slotSize), Phaser.Geom.Rectangle.Contains)
                 .on('pointerdown', () => this.onInventoryClick(i));
            
            this.inventorySlots.push(slot);
            // Add inventory slot to container
            this.gameUIContainer.add(slot);
        }

        // Modals
        this.itemPanel = new ItemPanel(this);
        this.shopPanel = new ShopPanel(this);
        this.gameOverPanel = new GameOverPanel(this);
        this.debugPanel = new DebugPanel(this);
        this.unlockItemSlotPanel = new UnlockItemSlotPanel(this);
        this.challengePanel = new ChallengePanel(this);
        this.settingsPanel = new SettingsPanel(this);
        this.confirmResetPanel = new ConfirmResetPanel(this);
        this.tutorialUI = new TutorialUI(this);
        this.languagePanel = new LanguagePanel(this);
        this.characterSelectUI = new CharacterSelectUI(this);
        
        // Initialize audio system
        this.initializeAudio();
        
        // Update language UI after everything is created
        this.updateLanguageUI();
        
        this.updatePlayerUI();
    }
    
    scaleAndPositionUI() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        const gameWidth = 600;
        const gameHeight = 900;

        // --- Game UI Pinning ---
        const gameUIHeight = Grid.GAMEUI_HEIGHT;

        // Calculate scale to fit the main game area, leaving space for UI
        const scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight);
        
        // Scale the main game container
        this.mainContainer.setScale(scale);
        const scaledGameWidth = gameWidth * scale;
        const scaledGameHeight = gameHeight * scale;
        
        // Position main game container so bottom tiles align with UI
        const uiStartY = screenHeight - (gameUIHeight * scale);
        const gridTotalHeight = Grid.ROWS * Grid.TILE_HEIGHT * scale;
        const gameContainerY = uiStartY - (Grid.BOTTOM_PADDING * scale) - gridTotalHeight + 20;
        
        this.mainContainer.setPosition(
            (screenWidth - scaledGameWidth) / 2,
            gameContainerY
        );

        // Scale gameUI to match the width of the game area
        this.gameUIContainer.setScale(scale);

        // Pin gameUI to the bottom
        this.gameUIContainer.setPosition((screenWidth - scaledGameWidth) / 2, screenHeight - (gameUIHeight * scale));
    }
    
    handleResize(gameSize, baseSize, displaySize, resolution) {
        // Re-scale and center the game container when window is resized
        this.scaleAndPositionUI();
        // Update the tiled background to cover the new screen size
        this.updateTiledBackground();

        // Resize any open panels
        const panels = [this.itemPanel, this.shopPanel, this.gameOverPanel, this.debugPanel, this.unlockItemSlotPanel, this.challengePanel, this.settingsPanel, this.languagePanel];
        panels.forEach(panel => {
            if (panel && panel.visible) {
                panel.handleResize();
            }
        });
    }
    
    createTiledBackground() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Create a single TileSprite that covers the entire screen
        this.backgroundTileSprite = this.add.tileSprite(0, 0, screenWidth, screenHeight, 'atlas_01', 'repeat_background.png');
        this.backgroundTileSprite.setOrigin(0, 0);
        this.backgroundTileSprite.setDepth(-1000); // Put behind everything
    }
    
    updateTiledBackground() {
        if (!this.backgroundTileSprite) return;
        
        // Update TileSprite dimensions to match new screen size
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        this.backgroundTileSprite.setSize(screenWidth, screenHeight);
    }
    
    updatePlayerUI() {
        this.hpText.setText(`${this.player.hp}/${this.player.getMaxHp()}`);
        this.atkText.setText(`${this.player.getAttack()}`);
        this.goldText.setText(`${this.player.gold}`);
        this.floorText.setText(`${this.player.floor}`);
        this.keyIndicator.setVisible(this.player.hasKey);
    }
    
    updateInventoryUI() {
        for(let i = 0; i < GameSettings.INVENTORY_SIZE; i++) {
            const icon = this.inventorySlots[i].getAt(0);
            const sprite = this.inventorySlots[i].getAt(1);
            const isLockedSlot = i >= (GameSettings.INVENTORY_SIZE - GameSettings.LOCKED_INVENTORY_SLOTS);
            
            if (i < this.player.inventory.length) {
                const item = this.player.inventory[i];
                if (item.sprite) {
                    // Use sprite
                    icon.setVisible(false);
                    sprite.setVisible(true);
                    sprite.setTexture('atlas_01', item.sprite);
                    sprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                    // Scale to fit inventory slot (items are 124x124, slots are 60x60)
                    const scaleFactor = 48 / 124; // Leave some padding
                    sprite.setScale(scaleFactor);
                } else {
                    // Fallback to text icon
                    icon.setVisible(true);
                    sprite.setVisible(false);
                    icon.setText(item.icon);
                }
            } else if (isLockedSlot) {
                // Show locked slot sprite
                icon.setVisible(false);
                sprite.setVisible(true);
                sprite.setTexture('atlas_01', 'locked_item_slot.png');
                sprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                const scaleFactor = 48 / 124;
                sprite.setScale(scaleFactor);
            } else {
                // Empty slot
                icon.setVisible(true);
                sprite.setVisible(false);
                icon.setText('');
            }
        }
    }
    
    flashPlayerHP() {
        this.tweens.add({
            targets: this.hpText,
            scale: 1.2,
            duration: 100,
            yoyo: true,
            onStart: () => this.hpText.setColor('#ff0000'),
            onComplete: () => this.hpText.setColor('#ffffff').setScale(1.0)
        });
    }
    
    flashInventoryFull() {
        // Play error sound when inventory is full
        if (!this.isMuted) {
            this.sound.playAudioSprite('soundbank', 'error_sound', {
                volume: this.soundVolume
            });
        }
        
        // Flash all inventory slots red by changing tint
        this.inventorySlots.forEach(slot => {
            const icon = slot.getAt(0);
            const sprite = slot.getAt(1);
            
            this.tweens.add({
                targets: slot,
                scale: 1.1,
                duration: 100,
                yoyo: true,
                onStart: () => {
                    // Tint both icon and sprite red
                    icon.setTint(0xff0000);
                    sprite.setTint(0xff0000);
                },
                onComplete: () => {
                    // Clear tint
                    icon.clearTint();
                    sprite.clearTint();
                    slot.setScale(1.0);
                }
            });
        });
    }
    
    showGameMessage(text) {
        if (!this.gameMessage) return;
        if (!text) return;
        if (text.length == 0) return;

        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        this.gameMessage.setPosition(screenWidth / 2, screenHeight / 2);
        this.gameMessage.setText(text);
        
        // Reset scale to default
        this.gameMessage.setScale(1);
        
        // Check if text is too long and scale down if needed
        const maxWidth = screenWidth * 0.9; // 90% of screen width
        const textBounds = this.gameMessage.getBounds();
        
        if (textBounds.width > maxWidth) {
            const scale = maxWidth / textBounds.width;
            this.gameMessage.setScale(scale);
        }
        
        this.gameMessage.setVisible(true);
        this.gameMessage.setAlpha(1);
        this.gameMessageTimer = this.time.now;
    }

    generateTutorialFloor() {
        //console.log("Gen tutorial floor");
        this.grid.forEach(tile => tile.destroy());
        this.grid = [];
        this.player.hasKey = false;
        this.turnInProgress = false;
        this.floorClearBonusAwarded = false;
        this.revealedTilesCount = 0;

        for (let y = 0; y < Grid.ROWS; y++) {
            for (let x = 0; x < Grid.COLS; x++) {
                // Skip creating tiles in removed areas
                if (this.shouldSkipTile(x, y)) {
                    continue;
                }
                
                const tileX = Grid.X_OFFSET + x * Grid.TILE_WIDTH;
                const tileY = Grid.Y_OFFSET + y * Grid.TILE_HEIGHT;
                const tile = new Tile(this, tileX, tileY, x, y);
                this.mainContainer.add(tile);
                tile.setContent(TileType.EMPTY);
                this.grid.push(tile);
            }
        }

        // Place door on a random tile from the active tiles
        if (this.grid.length > 0) {
            const doorTile = this.grid[Math.floor(Math.random() * this.grid.length)];
            doorTile.setContent(TileType.DOOR);
            doorTile.state = TileState.REVEALED;
        }

        this.updateTileAccessibility();
        this.updatePlayerUI();
        
        // On floor 1, show a pointer on a random tile (not the door) at the start
        if (this.player.floor === 1 && this.revealedTilesCount === 0) {
            const hiddenTiles = this.grid.filter(t => t.state === TileState.HIDDEN_NORMAL && t.type !== TileType.DOOR);
            if (hiddenTiles.length > 0) {
                const randomTile = hiddenTiles[Math.floor(Math.random() * hiddenTiles.length)];
                randomTile.showClickIndicator();
                
                // Store reference to hide it when any tile is clicked
                this.tutorialInitialPointer = randomTile;
            }
        }
    }

    populateTutorialFloor1() {
        const unrevealedTiles = this.grid.filter(t => t.state !== TileState.REVEALED);
        Phaser.Utils.Array.Shuffle(unrevealedTiles);

        for (let i = 0; i < 3; i++) {
            if (unrevealedTiles[i]) {
                unrevealedTiles[i].setContent(TileType.MONSTER, createMonster(this, this.getRandomMonsterName(true), this.player));
            }
        }

        for (let i = 3; i < 6; i++) {
            if (unrevealedTiles[i]) {
                const coin = createItem('Coin');
                coin.customAmount = Phaser.Math.Between(1, 3);
                unrevealedTiles[i].setContent(TileType.ITEM, coin);
            }
        }
    }

    populateTutorialFloor2() {
        const unrevealedTiles = this.grid.filter(t => t.state !== TileState.REVEALED);
        Phaser.Utils.Array.Shuffle(unrevealedTiles);

        // Populate with some monsters and items
        for (let i = 0; i < unrevealedTiles.length; i++) {
            if (i < 5) {
                unrevealedTiles[i].setContent(TileType.MONSTER, createMonster(this, this.getRandomMonsterName(true), this.player));
            } else if (i < 10) {
                const coin = createItem('Coin');
                coin.customAmount = Phaser.Math.Between(1, 5);
                unrevealedTiles[i].setContent(TileType.ITEM, coin);
            }
        }
    }

    generateFloor() {
        // Check if tutorial is done from PlayerData
        const tutorialDone = PlayerData.Instance && PlayerData.Instance.initialized && 
                           PlayerData.Instance.GetNumber("tutorial_done") === 1;
        
        // If tutorial is not finished and player is on floor 1 or 2, generate tutorial floor
        if (!Game.isTutorialFinished && !tutorialDone && (this.player.floor === 1 || this.player.floor === 2)) {
            this.generateTutorialFloor();
            return;
        }

        //console.log("Generate floor");
        
        // 1. Clear previous floor
        this.grid.forEach(tile => tile.destroy());
        this.grid = [];
        this.player.hasKey = false;
        this.turnInProgress = false;
        this.floorClearBonusAwarded = false;

        // 2. Initialize grid layout and content
        const tileTypes = this.getFloorTileConfig();
        
        for (let y = 0; y < Grid.ROWS; y++) {
            for (let x = 0; x < Grid.COLS; x++) {
                // Skip creating tiles in removed areas
                if (this.shouldSkipTile(x, y)) {
                    continue;
                }
                
                const tileX = Grid.X_OFFSET + x * Grid.TILE_WIDTH;
                const tileY = Grid.Y_OFFSET + y * Grid.TILE_HEIGHT;
                const tile = new Tile(this, tileX, tileY, x, y);
                // Add tile to the game container
                this.mainContainer.add(tile);

                const typeIndex = Math.floor(Math.random() * tileTypes.length);
                const typeData = tileTypes.splice(typeIndex, 1)[0];
                
                let content = null;
                if(typeData.type === TileType.MONSTER) content = createMonster(this, typeData.name, this.player);
                if(typeData.type === TileType.ITEM) content = createItem(typeData.name);
                if(typeData.type === TileType.CHALLENGE) content = { type: typeData.challengeType, tile: tile };
                
                tile.setContent(typeData.type, content);
                if (typeData.isKeyHolder) {
                    content.isKeyHolder = true;
                }
                
                // Set test drop for QA monsters
                if (typeData.type === TileType.MONSTER && typeData.testDrop) {
                    content.testDrop = typeData.testDrop;
                    content.testDropAmount = typeData.testDropAmount;
                }
                
                this.grid.push(tile);
            }
        }
        
        // 3. Find the door and reveal it to start the floor
        let doorTile = this.grid.find(tile => tile.type === TileType.DOOR);
        if (doorTile) {
            doorTile.state = TileState.REVEALED;
        } else {
            //console.log("Error, no door found");
            // Fallback: Place door on a random tile
            if (this.grid.length > 0) {
                const randomTile = this.grid[Math.floor(Math.random() * this.grid.length)];
                randomTile.setContent(TileType.DOOR);
                randomTile.state = TileState.REVEALED;
                doorTile = randomTile;
                //console.log("Placed fallback door on tile", randomTile.gridX, randomTile.gridY);
            }
        }
        
        // 4. Validate key holder exists
        const keyHolderExists = this.grid.some(tile => 
            tile.type === TileType.MONSTER && 
            tile.content && 
            tile.content.isKeyHolder
        );
        
        if (!keyHolderExists) {
            //console.log("No key holder found, placing fallback key");
            // Find a monster to make a key holder, or place a key item
            const monsterTiles = this.grid.filter(tile => 
                tile.type === TileType.MONSTER && tile.content
            );
            
            if (monsterTiles.length > 0) {
                // Make a random monster the key holder
                const randomMonster = monsterTiles[Math.floor(Math.random() * monsterTiles.length)];
                randomMonster.content.isKeyHolder = true;
                //console.log("Made monster key holder on tile", randomMonster.gridX, randomMonster.gridY);
            } else {
                // No monsters available, place key item on empty tile
                const emptyTiles = this.grid.filter(tile => tile.type === TileType.EMPTY);
                if (emptyTiles.length > 0) {
                    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
                    randomTile.setContent(TileType.ITEM, createItem('Key'));
                    //console.log("Placed fallback key item on tile", randomTile.gridX, randomTile.gridY);
                }
            }
        }

        // 5. Update accessibility for all other tiles based on the revealed door
        this.updateTileAccessibility();
        this.updatePlayerUI();
    }
    
    getFloorTileConfig() {
        const config = [];
        const floor = this.player.floor;
        
        // Check if we're in test monsters mode
        if (this.testMonstersMode) {
            this.testMonstersMode = false; // Reset the flag
            
            // Add door first
            config.push({type: TileType.DOOR});
            
            // Get all monster types and assign specific drops for QA testing
            const testMonstersWithDrops = [
                // Durable Items
                {monster: 'Spider', drop: 'Attack Rune'},
                {monster: 'Wolf', drop: 'Defense Rune'},
                {monster: 'Devil', drop: 'Shield'},
                {monster: 'Bat', drop: 'Spike Trap'},
                {monster: 'Skeleton', drop: 'Lantern'},
                {monster: 'Zombie', drop: 'Invisibility Cloak'},
                {monster: 'Demon', drop: 'Vampire Ring'},
                {monster: 'Ogre', drop: 'Amulet of Greed'},
                {monster: 'Thief', drop: 'Cursed Rune'},
                
                // Usable Items
                {monster: 'Assassin', drop: 'Potion'},
                {monster: 'Dark Healer', drop: 'Blade Scroll'},
                {monster: 'Evil Archer', drop: 'Poison Vial'},
                {monster: 'Necromancer', drop: 'Freeze Scroll'},
                {monster: 'Shellshifter', drop: 'Sheep Scroll'},
                {monster: 'Phoenix', drop: 'Lock Pick'},
                
                // Instant Items with custom amounts
                {monster: 'Orc Boss', drop: 'Coin', amount: 100},
                {monster: 'Ghost Boss', drop: 'Heart', amount: 25},
                {monster: 'Squid Boss', drop: 'Explosive'},
                
                // Key holder
                {monster: 'Lizard Boss', drop: 'Key', isKeyHolder: true},
                
                // Extra monsters if needed
                {monster: 'Master Thief', drop: 'Coin', amount: 50}
            ];
            
            // Add monsters with guaranteed drops (up to active tile count minus door)
            const activeTileCount = this.getActiveTileCount();
            const maxMonsters = Math.min(testMonstersWithDrops.length, activeTileCount - 1);
            for (let i = 0; i < maxMonsters; i++) {
                const monsterConfig = testMonstersWithDrops[i];
                config.push({
                    type: TileType.MONSTER, 
                    name: monsterConfig.monster, 
                    isKeyHolder: monsterConfig.isKeyHolder || false,
                    testDrop: monsterConfig.drop,
                    testDropAmount: monsterConfig.amount
                });
            }
            
            // Fill remaining with empty tiles
            while(config.length < activeTileCount) {
                config.push({type: TileType.EMPTY});
            }
            
            return config; // Return without shuffling to maintain sequential order
        }
        
        // 3. Place guaranteed elements
        config.push({type: TileType.DOOR});
        
        // Determine if this is a boss floor
        const isBossFloor = floor === 4 || floor === 8 || floor === 10 || (floor > 10 && (floor - 10) % 5 === 0);
        
        if (isBossFloor) {
            let possibleBosses;
            if (floor <= 10) {
                // Specific bosses for early floors
                if (floor === 4) {
                    possibleBosses = ['Orc Boss'];
                } else if (floor === 8) {
                    // Check if player has any durable items
                    const hasDurableItems = this.player.inventory.some(item => item.type === 'durable');
                    if (hasDurableItems) {
                        possibleBosses = ['Master Thief'];
                    } else {
                        possibleBosses = ['Orc Boss', 'Ghost Boss'];
                    }
                } else if (floor === 10) {
                    possibleBosses = ['Master Thief', 'Lizard Boss'];
                }
            } else {
                // After floor 10, any boss can spawn (but check Master Thief requirement)
                const hasDurableItems = this.player.inventory.some(item => item.type === 'durable');
                if (hasDurableItems) {
                    possibleBosses = ['Orc Boss', 'Ghost Boss', 'Squid Boss', 'Lizard Boss', 'Master Thief'];
                } else {
                    possibleBosses = ['Orc Boss', 'Ghost Boss', 'Squid Boss', 'Lizard Boss'];
                }
            }
            
            // Always spawn a boss on boss floors
            const bossName = possibleBosses[Math.floor(Math.random() * possibleBosses.length)];
            config.push({type: TileType.MONSTER, name: bossName});
        }
        
        // Place key holder (never a boss)
        config.push({type: TileType.MONSTER, name: this.getRandomMonsterName(true), isKeyHolder: true});
        
        if (floor > 4 && floor % 3 === 0) {
            // Randomly select a challenge type
            const challengeTypes = [ChallengeType.GREEDY, ChallengeType.BRAVE, ChallengeType.MORTAL, ChallengeType.MATERIAL];
            const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
            config.push({type: TileType.CHALLENGE, challengeType: challengeType});
        }
        if (floor % 4 === 0) config.push({type: TileType.SHOP});
        
        // 4. Place monsters
        let baseMonsterCount = Phaser.Math.Between(4, Math.min(12, 4 + floor));
        // Reduce monster count by 2 for early floors
        if (floor <= 3) {
            baseMonsterCount = Math.max(1, baseMonsterCount - 2);
        }
        const monsterCount = baseMonsterCount;
        let darkHealerSpawned = false;
        
        for(let i=0; i < monsterCount; i++) {
            let monsterName = this.getRandomMonsterName(true);
            
            // If we rolled a dark healer but one already spawned, reroll
            if (monsterName === 'Dark Healer' && darkHealerSpawned) {
                // Keep rerolling until we get a non-dark healer
                while (monsterName === 'Dark Healer') {
                    monsterName = this.getRandomMonsterName(true);
                }
            }
            
            if (monsterName === 'Dark Healer') {
                darkHealerSpawned = true;
            }
            
            config.push({type: TileType.MONSTER, name: monsterName});
        }
        
        // 5. Place items
        const itemCount = Phaser.Math.Between(2, 4);
        for(let i=0; i < itemCount; i++) {
            config.push({type: TileType.ITEM, name: this.getRandomItemName()});
        }
        
        // 6. Place barrels
        if (floor > 2) {
            const barrelCount = Phaser.Math.Between(1, 2);
            for(let i=0; i < barrelCount; i++) config.push({type: TileType.BARREL});
        }
        
        // 7. Place random tiles
        if (floor >= 2 && Math.random() < 0.2) config.push({type: TileType.RANDOM_ITEM});

        // 8. Fill remaining with empty
        const activeTileCount = this.getActiveTileCount();
        while(config.length < activeTileCount) {
            config.push({type: TileType.EMPTY});
        }
        
        // Key failsafe check (though monster key holder is guaranteed)
        if (!config.some(c => c.isKeyHolder)) {
            const monsterTiles = config.filter(c => c.type === TileType.MONSTER);
            if (monsterTiles.length > 0) {
                monsterTiles[0].isKeyHolder = true;
            } else { // emergency fallback
                 config.find(c => c.type === TileType.EMPTY).type = TileType.ITEM;
                 config.find(c => c.type === TileType.ITEM).name = 'Key';
            }
        }
        
        return Phaser.Utils.Array.Shuffle(config);
    }
    
    shouldSkipTile(x, y) {
        // Check if tile should be skipped based on removal variables
        if (y < this.removeTop) return true;
        if (y >= Grid.ROWS - this.removeBottom) return true;
        if (x < this.removeLeft) return true;
        if (x >= Grid.COLS - this.removeRight) return true;
        return false;
    }
    
    getActiveTileCount() {
        // Calculate how many tiles will actually be created after removals
        const activeRows = Grid.ROWS - this.removeTop - this.removeBottom;
        const activeCols = Grid.COLS - this.removeLeft - this.removeRight;
        return Math.max(0, activeRows * activeCols);
    }
    
    resetTileRemoval() {
        // Reset all tile removal variables to 0
        this.removeTop = 0;
        this.removeBottom = 0;
        this.removeLeft = 0;
        this.removeRight = 0;
    }
    
    setTileRemoval(top = 0, bottom = 0, left = 0, right = 0) {
        // Set tile removal variables
        this.removeTop = Math.max(0, top);
        this.removeBottom = Math.max(0, bottom);
        this.removeLeft = Math.max(0, left);
        this.removeRight = Math.max(0, right);
        
        // Validate that we don't remove all tiles
        const activeRows = Grid.ROWS - this.removeTop - this.removeBottom;
        const activeCols = Grid.COLS - this.removeLeft - this.removeRight;
        if (activeRows <= 0 || activeCols <= 0) {
            console.warn('Tile removal settings would remove all tiles, resetting to safe values');
            this.resetTileRemoval();
        }
    }
    
    setFloorTileRemoval() {
        // Define floor-specific tile removal patterns
        const floor = this.player.floor;
        
        // Reset to default (no removal) first
        this.resetTileRemoval();
        
        // Apply floor-specific patterns
        switch(floor) {
            case 1:
                this.setTileRemoval(2, 1, 1, 1);
                break;
            case 2:
                this.setTileRemoval(1, 1, 1, 1);
                break;
            case 3:
                this.setTileRemoval(1, 1, 0, 0);
                break;
            case 4:
                this.setTileRemoval(1, 0, 0, 0);
                break;
            default:
                // For floors beyond 10, create interesting patterns based on floor number
                if (false) {
                    const pattern = floor % 6;
                    switch(pattern) {
                        case 1: this.setTileRemoval(1, 0, 0, 0); break; // Top
                        case 2: this.setTileRemoval(0, 1, 0, 0); break; // Bottom
                        case 3: this.setTileRemoval(0, 0, 1, 0); break; // Left
                        case 4: this.setTileRemoval(0, 0, 0, 1); break; // Right
                        case 5: this.setTileRemoval(0, 0, 1, 1); break; // Vertical corridor
                        case 0: this.setTileRemoval(1, 1, 0, 0); break; // Horizontal corridor
                    }
                }
                this.setTileRemoval(0, 0, 0, 0);
                break;
        }
        
        //console.log(`Floor ${floor}: Tile removal set to top:${this.removeTop}, bottom:${this.removeBottom}, left:${this.removeLeft}, right:${this.removeRight}`);
    }
    
    getRandomMonsterName(excludeBosses = false) {
        const floor = this.player.floor;
        let pool = ['Spider', 'Skeleton', 'Bat', 'Devil', 'Demon'];
        if (floor >= 4) pool.push('Wolf', 'Assassin', 'Shellshifter', 'Skeleton King', 'Thief', 'Zombie', 'Ogre');
        if (floor >= 7) pool.push('Dark Healer', 'Evil Archer', 'Necromancer', 'Phoenix');
        
        // Don't add bosses to the random pool if excludeBosses is true
        if (!excludeBosses) {
            if (floor === 4 || floor === 8) pool.push('Orc Boss');
            if (floor === 10) pool.push('Master Thief', 'Lizard Boss');
        }
        // ... add more boss/monster logic
        return pool[Math.floor(Math.random() * pool.length)];
    }
    
    getRandomItemName() {
        const pool = ['Coin', 'Heart'];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    updateTileAccessibility() {
        const revealedTiles = this.grid.filter(t => t.state === TileState.REVEALED);
        const monsterTiles = revealedTiles.filter(t => t.type === TileType.MONSTER && t.content.isAlive());
        const hasCloak = this.player.hasItem('Invisibility Cloak');

        this.grid.forEach(tile => {
            if (tile.state === TileState.REVEALED) {
                tile.draw(); // Redraw revealed tiles to update their content (e.g. door icon)
                return;
            }
            
            const isAdjacentToRevealed = revealedTiles.some(rt => this.areTilesAdjacent(tile, rt) && rt.type !== TileType.MONSTER); // Non-monsters make tiles accessible
            const isAdjacentToMonsterFreeRevealed = revealedTiles.some(rt => this.areTilesAdjacent(tile, rt) && (rt.type !== TileType.MONSTER || (rt.type === TileType.MONSTER && !rt.content.isAlive())));


            const isAdjacentToAnyRevealed = revealedTiles.some(rt => this.areTilesAdjacent(tile, rt));

            if (!isAdjacentToAnyRevealed) {
                tile.state = TileState.HIDDEN_UNACCESSIBLE;
            } else {
                const isBlockedByMonster = !hasCloak && monsterTiles.some(mt => this.areTilesAdjacent(tile, mt));
                tile.state = isBlockedByMonster ? TileState.HIDDEN_BLOCKED : TileState.HIDDEN_NORMAL;
            }
            tile.draw();
        });
    }

    areTilesAdjacent(tile1, tile2) {
        return Math.abs(tile1.gridX - tile2.gridX) + Math.abs(tile1.gridY - tile2.gridY) === 1;
    }
    
    // --- Turn Flow & Actions ---

    isAnyModalOpen() {
        return this.itemPanel.visible || 
               this.shopPanel.visible || 
               this.gameOverPanel.visible || 
               this.challengePanel.visible || 
               this.debugPanel.visible || 
               this.unlockItemSlotPanel.visible ||
               this.settingsPanel.visible ||
               this.tutorialUI.visible ||
               this.languagePanel.visible;
    }

    onTileClicked(tile) {
        // Check if we should block the click first
        if(this.turnInProgress || this.isAnyModalOpen()) {
            // If tutorial is showing, dismiss it but don't process the click
            if (this.tutorialUI && this.tutorialUI.visible) {
                this.tutorialUI.hide();
            }
            return;
        }
        
        // Hide the initial tutorial pointer when any tile is clicked
        if (this.tutorialInitialPointer && this.tutorialInitialPointer.clickIndicator) {
            this.tutorialInitialPointer.hideClickIndicator();
            this.tutorialInitialPointer = null;
        }
        
        // Hide click indicator when tile is successfully clicked
        if (tile.clickIndicator) {
            tile.hideClickIndicator();
        }
        
        switch (tile.state) {
            case TileState.HIDDEN_NORMAL:
                tile.reveal();
                break;
            case TileState.REVEALED:
                this.handleRevealedTileInteraction(tile);
                break;
        }
    }
    
    onTileRevealed(tile) {
        // Handle on-reveal effects
        if (!Game.isTutorialFinished && this.player.floor === 1) {
            this.revealedTilesCount++;
            if (this.revealedTilesCount === 3) {
                // Spawn demon key holder
                tile.setContent(TileType.MONSTER, createMonster(this, 'Demon', this.player));
                tile.content.isKeyHolder = true;
                tile.draw();
                this.tutorialUI.show(Localization[Game.language]["tutorial_attack_monsters"], () => {
                    // Add click indicator to the monster after tutorial is dismissed
                    if (tile && typeof tile.showClickIndicator === 'function') {
                        tile.showClickIndicator();
                    }
                });
            }
        } else if (!Game.isTutorialFinished && this.player.floor === 2) {
            this.revealedTilesCount++;
            if (this.revealedTilesCount === 4) {
                tile.setContent(TileType.BARREL);
                tile.draw();
                this.tutorialUI.show(Localization[Game.language]["tutorial_special_tiles"], () => {
                    // Add click indicator to the barrel after tutorial is dismissed
                    if (tile && typeof tile.showClickIndicator === 'function') {
                        tile.showClickIndicator();
                    }
                });
            } else if (this.revealedTilesCount === 6) {
                tile.setContent(TileType.MONSTER, createMonster(this, 'Demon', this.player));
                tile.content.isKeyHolder = true;
                tile.draw();
                this.populateTutorialFloor2();
            }
        }

        if (tile.type === TileType.MONSTER) {
            const monster = tile.content;
            if (monster.special === 'attacks_on_reveal') {
                monster.startAnimation('attack', 500, () => {
                    // Validate tile still exists
                    if (!tile || !tile.scene || tile.scene !== this) return;
                    tile.draw(); // Redraw when attack animation ends to show idle
                });
                tile.draw();
                const dmg = Phaser.Math.Between(1,6);
                this.playerTakeDamage(dmg);
                this.showGameMessage(Localization[Game.language]["assassin_strikes"].replace("{dmg}", dmg));
                this.playMonsterAttackSound();
            }
            if (monster.special === 'steals_gold') {
                monster.startAnimation('attack', 500, () => {
                    // Validate tile still exists
                    if (!tile || !tile.scene || tile.scene !== this) return;
                    tile.draw(); // Redraw when attack animation ends to show idle
                });
                tile.draw();
                const stolen = Phaser.Math.Between(1,9);
                if (this.player.gold >= stolen) {
                    this.player.gold -= stolen;
                    monster.stolenGold = stolen;
                    this.showGameMessage(Localization[Game.language]["thief_stole_gold"].replace("{stolen}", stolen));
                    this.updatePlayerUI();
                    this.playMonsterAttackSound();
                }
            }
            if (monster.special === 'steals_durable') {
                monster.startAnimation('attack', 500, () => {
                    // Validate tile still exists
                    if (!tile || !tile.scene || tile.scene !== this) return;
                    tile.draw(); // Redraw when attack animation ends to show idle
                });
                tile.draw();
                const durableItems = this.player.inventory.filter(item => item.type === 'durable');
                if (durableItems.length > 0) {
                    const randomIndex = Math.floor(Math.random() * durableItems.length);
                    const stolenItem = durableItems[randomIndex];
                    this.player.removeItem(stolenItem);
                    monster.stolenDurableItem = stolenItem;
                    this.showGameMessage(Localization[Game.language]["master_thief_stole_item"].replace("{item_name}", stolenItem.name));
                    this.updateInventoryUI();
                    this.playMonsterAttackSound();
                }
            }
            if (this.player.hasItem('Spike Trap')) {
                const trapBase = 2 + Math.floor(this.player.floor * 1.2);
                const trapBonus = Math.floor(this.player.getBaseAttack() * 0.5);
                const dmg = Math.max(3, trapBase + trapBonus);
                monster.takeDamage(dmg);
                //this.showGameMessage(`Spike Trap deals ${dmg}!`);
                
                // Check if monster died immediately from spike trap
                if (!monster.isAlive()) {
                    this.handleMonsterDeath(tile);
                    this.checkMortalChallenge();
                    return;
                }
                
                // Always play damage animation first
                this.playMonsterHurtSound();
                monster.startAnimation('damage', 500, () => {
                    // Validate tile and scene still exist
                    if (!tile || !tile.scene || tile.scene !== this) return;
                    if (!monster.isAlive()) {
                        // Monster died after spike trap damage animation
                        this.handleMonsterDeath(tile);
                        // Check for MORTAL challenge completion
                        this.checkMortalChallenge();
                    } else {
                        // Monster survived, reset to idle
                        tile.draw();
                    }
                });
                tile.draw();
            }
        } else if (tile.type === TileType.TRAP) {
            const damage = 5 + this.player.floor;
            this.playerTakeDamage(damage);
            this.showGameMessage(Localization[Game.language]["hit_trap"].replace("{damage}", damage));
            tile.setContent(TileType.EMPTY);
        } else if (tile.type === TileType.ITEM) {
            // Items stay on tiles for player to click and use
        }
        
        this.updateTileAccessibility();
        // tile.draw(); is called inside updateTileAccessibility now
        this.endTurn();
    }
    
    handleRevealedTileInteraction(tile) {
        switch (tile.type) {
            case TileType.MONSTER:
                this.attackMonster(tile);
                break;
            case TileType.DOOR:
                if (this.player.hasKey) {
                    // Check domain authorization before advancing floor
                    if (!this.checkDomainAuthorization()) {
                        return;
                    }
                    // Play footstep sound when entering next floor
                    if (!this.isMuted) {
                        const footSounds = ['foot_1', 'foot_2', 'foot_3'];
                        const randomSound = footSounds[Math.floor(Math.random() * footSounds.length)];
                        this.sound.playAudioSprite('soundbank', randomSound, {
                            volume: this.soundVolume
                        });
                    }
                    this.advanceFloor(); // increments floor, calls generateFloor, checks domain auth, does commercial
                } else {
                    // Play door creak sound for locked door
                    if (!this.isMuted) {
                        const creakSounds = ['creek_1', 'creek_2'];
                        const randomSound = creakSounds[Math.floor(Math.random() * creakSounds.length)];
                        this.sound.playAudioSprite('soundbank', randomSound, {
                            volume: this.soundVolume
                        });
                    }
                    this.showGameMessage(Localization[Game.language]["door_locked"]);
                }
                break;
            case TileType.SHOP:
                this.shopPanel.open();
                break;
            case TileType.CHALLENGE:
                this.handleChallengeClick(tile);
                break;
            case TileType.BARREL:
                this.openBarrel(tile);
                if (!Game.isTutorialFinished && this.player.floor === 2) {
                    this.tutorialUI.show(Localization[Game.language]["tutorial_found_heart"], () => {
                        // Add click indicator to the heart after tutorial is dismissed
                        if (tile.type === TileType.ITEM && tile.content && tile.content.key === 'Heart') {
                            if (tile && typeof tile.showClickIndicator === 'function') {
                                tile.showClickIndicator();
                            }
                        }
                    });
                }
                break;
            case TileType.RANDOM_ITEM:
                tile.stopCycle();
                // Convert to regular item tile
                tile.type = TileType.ITEM;
                // Now treat it like a regular item pickup
                this.handleRevealedTileInteraction(tile);
                break;
            case TileType.ITEM:
                if(tile.content.type === 'instant') {
                    // Check if heart item can be used
                    if (tile.content.key === 'Heart' && this.player.hp >= this.player.getMaxHp()) {
                        this.showGameMessage(Localization[Game.language]["health_full"]);
                        return;
                    }
                    
                    // Use instant items immediately when clicked
                    tile.content.effect(this, tile);
                    tile.setContent(TileType.EMPTY);
                    tile.draw();
                    this.updateTileAccessibility();
                    this.endTurn();
                } else {
                    // Try to add to inventory
                    if (this.player.addItem(tile.content)) {
                        tile.setContent(TileType.EMPTY);
                        tile.draw();
                        this.updateTileAccessibility();
                        this.endTurn();
                    }
                }
                // Tutorial logic for key pickup removed from here
                break;
        }
    }
    
    attackMonster(tile) {
        const monster = tile.content;
        const player = this.player;
        if (!monster.isAlive() || !monster.canBeInteracted()) return;
        
        if (monster.firstAttack) {
            monster.firstAttack = false;
        }
        
        // Player attacks
        const playerDamage = player.getAttack();
        monster.takeDamage(playerDamage);
        this.playPlayerAttackAnimation();

        // Archer character special ability
        if (Game.character === 'hero_archer') {
            const mainTarget = tile;
            const otherMonsters = this.grid.filter(t => 
                t !== mainTarget &&
                t.type === TileType.MONSTER && 
                t.state === TileState.REVEALED &&
                t.content && t.content.isAlive()
            );

            if (otherMonsters.length > 0) {
                // Randomly select up to 2 other monsters
                const targets = Phaser.Utils.Array.Shuffle(otherMonsters).slice(0, 2);
                
                targets.forEach(targetTile => {
                    const targetMonster = targetTile.content;
                    const ricochetDamage = playerDamage;
                    targetMonster.takeDamage(ricochetDamage);
                    
                    // Play damage animation on ricochet target
                    this.playMonsterHurtSound();
                    targetMonster.startAnimation('damage', 500, () => {
                        if (!targetMonster.isAlive()) {
                            this.handleMonsterDeath(targetTile);
                        } else {
                            targetTile.draw(); // Redraw to show idle state
                        }
                    });
                    targetTile.draw();
                });
            }
        }
        
        if (player.hasItem('Vampire Ring')) {
            const heal = Phaser.Math.Between(1, 3);
            player.heal(heal);
        }

        // Freeze ticks down only on direct attack
        if (monster.isFrozen()) {
            if (Game.character != 'hero_wizard') {
                monster.status.freeze--;
            }
        }

        // Check if monster died immediately (safety check)
        if (!monster.isAlive()) {
            // Monster died immediately - start death sequence without damage animation
            this.handleMonsterDeath(tile);
            this.checkMortalChallenge();
            this.endTurn(tile);
            return;
        }
        
        // Always play damage animation first
        this.playMonsterHurtSound();
        monster.startAnimation('damage', 500, () => {
            // Validate tile and scene still exist
            if (!tile || !tile.scene || tile.scene !== this) return;
            // Double-check monster is still alive in callback
            if (!monster.isAlive()) {
                // Monster died - start death sequence
                this.handleMonsterDeath(tile);
                // Check for MORTAL challenge completion
                this.checkMortalChallenge();
                this.endTurn(tile);
            } else {
                // Monster survived - reset to idle and handle counter-attack
                tile.draw();
                
                // Monster counter-attacks
                if (!monster.isFrozen()) {
                    monster.startAnimation('attack', 500, () => {
                        // Validate tile still exists
                        if (!tile || !tile.scene || tile.scene !== this) return;
                        tile.draw(); // Redraw when attack animation ends to show idle
                    });
                    tile.draw();
                    this.playerTakeDamage(monster.attack);
                    this.playMonsterAttackSound();
                    // Mark that healer/necromancer has attacked this turn
                    if (monster.special === 'healer' || monster.special === 'summons') {
                        monster.hasAttackedThisTurn = true;
                    }

                    if (!Game.isTutorialFinished && this.player.floor === 1) {
                        this.tutorialUI.show(Localization[Game.language]["tutorial_turn_based_combat"], () => {
                            // Only show pointer on the first monster (revealed at tile count 3)
                            if (this.revealedTilesCount === 3) {
                                // Add click indicator to a nearby monster after tutorial is dismissed
                                const nearbyMonsters = this.grid.filter(t => 
                                    t.type === TileType.MONSTER && 
                                    t.state === TileState.REVEALED &&
                                    t.content && t.content.isAlive()
                                );
                                if (nearbyMonsters.length > 0 && typeof nearbyMonsters[0].showClickIndicator === 'function') {
                                    nearbyMonsters[0].showClickIndicator();
                                }
                            }
                        });
                    }
                }
                this.endTurn(tile);
            }
        });
        tile.draw();
    }
    
    handleMonsterDeath(tile) {
        const monster = tile.content;
        
        // Handle shapeshifters
        if (monster.transform()) {
            this.showGameMessage(Localization[Game.language]["monster_transformed"].replace("{monster_name}", monster.name));
            tile.draw();
            return;
        }
        
        // Play monster death sound
        if (!this.isMuted) {
            const deathSounds = ['death_1', 'death_2', 'death_3'];
            const randomSound = deathSounds[Math.floor(Math.random() * deathSounds.length)];
            this.sound.playAudioSprite('soundbank', randomSound, {
                volume: this.soundVolume
            });
        }
        
        // Start death animation
        monster.startAnimation('dead', 500, () => {
            // Validate tile still exists and is in current scene
            if (!tile || !tile.scene || tile.scene !== this) return;
            // After death animation, process drops and remove monster
            this.processMonsterDrops(tile);
        });
        
        // Immediately unlock adjacent tiles when death state starts
        this.updateTileAccessibility();
        tile.draw();
    }
    
    processMonsterDrops(tile) {
        const monster = tile.content;

        // Prevent all drops except key on tutorial floors
        if (!Game.isTutorialFinished && (this.player.floor === 1 || this.player.floor === 2)) {
            if (!monster.isKeyHolder) {
                tile.setContent(TileType.EMPTY);
                tile.draw();
                return;
            }
        }

        // Check for QA test drops first
        if (monster.testDrop) {
            const item = createItem(monster.testDrop);
            if (monster.testDropAmount) {
                item.customAmount = monster.testDropAmount;
            }
            tile.setContent(TileType.ITEM, item);
            tile.state = TileState.REVEALED;
            tile.draw();
            return; // Skip normal drop logic
        }

        // Handle drops
        if (monster.isKeyHolder) {
            tile.setContent(TileType.ITEM, createItem('Key'));
            tile.state = TileState.REVEALED;
            tile.draw();
            if (!Game.isTutorialFinished && this.player.floor === 1) {
                // Add click indicator to the key immediately
                if (tile && typeof tile.showClickIndicator === 'function') {
                    tile.showClickIndicator();
                }
                this.populateTutorialFloor1();
            }
        } else if (monster.stolenGold) {
            const dropAmount = monster.stolenGold + Phaser.Math.Between(3,7);
            tile.setContent(TileType.ITEM, createItem('Coin'));
            tile.content.customAmount = dropAmount;
            tile.state = TileState.REVEALED;
            tile.draw();
        } else if (monster.stolenDurableItem && !monster.isBoss) {
            // Return stolen durable item to player if there's room (non-boss thieves)
            if (this.player.addItem(monster.stolenDurableItem)) {
                this.showGameMessage(Localization[Game.language]["recovered_item"].replace("{item_name}", monster.stolenDurableItem.name));
                this.updateInventoryUI();
            } else {
                // No room in inventory, drop it on a tile
                const dropTile = this.findEmptyTile();
                if (dropTile) {
                    dropTile.setContent(TileType.ITEM, monster.stolenDurableItem);
                    dropTile.state = TileState.REVEALED;
                    dropTile.draw();
                } else {
                    // No empty tile, drop on this tile and clear monster
                    tile.setContent(TileType.ITEM, monster.stolenDurableItem);
                    tile.state = TileState.REVEALED;
                    tile.draw();
                }
                this.showGameMessage(Localization[Game.language]["item_dropped_on_ground"].replace("{item_name}", monster.stolenDurableItem.name));
            }
        } else if (monster.isBoss) {
            // Handle stolen item return for boss thieves first
            if (monster.stolenDurableItem) {
                if (this.player.addItem(monster.stolenDurableItem)) {
                    this.showGameMessage(Localization[Game.language]["recovered_item"].replace("{item_name}", monster.stolenDurableItem.name));
                    this.updateInventoryUI();
                } else {
                    // No room in inventory, drop it on a tile
                    const dropTile = this.findEmptyTile();
                    if (dropTile) {
                        dropTile.setContent(TileType.ITEM, monster.stolenDurableItem);
                        dropTile.state = TileState.REVEALED;
                        dropTile.draw();
                    } else {
                        // No empty tile, will handle boss drop logic below instead
                        // The boss drop will replace the monster
                    }
                    this.showGameMessage(Localization[Game.language]["item_dropped_on_ground"].replace("{item_name}", monster.stolenDurableItem.name));
                }
            }
            
            // Now handle boss drop
            // Get all durable items
            const allDurableItems = ['Attack Rune', 'Defense Rune', 'Shield', 'Spike Trap', 
                                    'Lantern', 'Invisibility Cloak', 'Vampire Ring', 
                                    'Amulet of Greed', 'Cursed Rune'];
            
            // Find which durable items the player doesn't have
            const playerItemKeys = this.player.inventory.map(item => item.key);
            const missingDurableItems = allDurableItems.filter(itemKey => !playerItemKeys.includes(itemKey));
            
            if (missingDurableItems.length > 0) {
                // Drop a random durable item the player doesn't have
                const randomItem = missingDurableItems[Math.floor(Math.random() * missingDurableItems.length)];
                tile.setContent(TileType.ITEM, createItem(randomItem));
                tile.state = TileState.REVEALED;
                tile.draw();
            } else {
                // Player has all durable items, drop 50 gold
                tile.setContent(TileType.ITEM, createItem('Coin'));
                tile.content.customAmount = 50; // Set custom amount for the coin
                tile.state = TileState.REVEALED;
                tile.draw();
            }
        } else {
            // Regular monster drops (60% total drop rate)
            const dropRoll = Math.random();
            
            if (dropRoll < 0.20) {
                // 20% chance to drop coin scaled by floor depth
                const coinBase = Phaser.Math.Between(3, 5);
                const coinAmount = Math.max(3, coinBase + Math.floor(this.player.floor * 1.5));
                tile.setContent(TileType.ITEM, createItem('Coin'));
                tile.content.customAmount = coinAmount;
                tile.state = TileState.REVEALED;
                tile.draw();
            } else if (dropRoll < 0.30) {
                // 10% chance to drop usable item
                const usableItems = ['Potion', 'Blade Scroll', 'Poison Vial', 'Freeze Scroll', 'Sheep Scroll', 'Lock Pick'];
                const randomUsable = usableItems[Math.floor(Math.random() * usableItems.length)];
                tile.setContent(TileType.ITEM, createItem(randomUsable));
                tile.state = TileState.REVEALED;
                tile.draw();
            } else if (dropRoll < 0.60) {
                // 30% chance to drop heart scaled by floor depth
                // Prevent heart drops on tutorial floors
                if (!Game.isTutorialFinished && (this.player.floor === 1 || this.player.floor === 2)) {
                    tile.setContent(TileType.EMPTY);
                    tile.draw();
                } else {
                    const heartBase = Phaser.Math.Between(2, 4);
                    const heartAmount = Math.max(2, heartBase + Math.floor(this.player.floor * 1.2));
                    tile.setContent(TileType.ITEM, createItem('Heart'));
                    tile.content.customAmount = heartAmount;
                    tile.state = TileState.REVEALED;
                    tile.draw();
                }
            } else {
                // 40% chance no drop
                tile.setContent(TileType.EMPTY);
                tile.draw();
            }
        }
        
        // Check if this was the last monster AND no barrels remain
        const monstersAlive = this.grid.some(t => t.type === TileType.MONSTER && t.content && t.content.isAlive());
        const barrelsRemaining = this.grid.some(t => t.type === TileType.BARREL && t.state === TileState.REVEALED);
        
        
        if (!monstersAlive && !barrelsRemaining && !this.floorClearBonusAwarded && this.player.floor >= 3) {
            this.floorClearBonusAwarded = true;
            this.player.addGold(10);
            this.showGameMessage(Localization[Game.language]["floor_cleared_bonus"]);
            // Play trumpet sound for floor cleared bonus
            if (!this.isMuted) {
                const trumpetSounds = ['trumpet_1', 'trumpet_2', 'trumpet_3'];
                const randomSound = trumpetSounds[Math.floor(Math.random() * trumpetSounds.length)];
                this.sound.playAudioSprite('soundbank', randomSound, {
                    volume: this.soundVolume
                });
            }
        }
    }
    
    openBarrel(tile) {
        // Play wood breaking sound
        if (!this.isMuted) {
            const woodSounds = ['wood_1', 'wood_2', 'wood_3'];
            const randomSound = woodSounds[Math.floor(Math.random() * woodSounds.length)];
            this.sound.playAudioSprite('soundbank', randomSound, {
                volume: this.soundVolume
            });
        }
        
        let outcome;
        if (!Game.isTutorialFinished) {
            outcome = {type: TileType.ITEM, name: 'Heart'};
        } else {
            const roll = Math.random();
            if (roll < 0.30) outcome = {type: TileType.MONSTER, name: this.getRandomMonsterName()};
            else if (roll < 0.55) outcome = {type: TileType.ITEM, name: 'Coin'};
            else if (roll < 0.70) outcome = {type: TileType.ITEM, name: 'Potion'};
            else if (roll < 0.80) outcome = {type: TileType.ITEM, name: 'Heart'};
            else outcome = {type: TileType.EMPTY};
        }
        
        let content = null;
        if(outcome.type === TileType.MONSTER) content = createMonster(this, outcome.name, this.player);
        if(outcome.type === TileType.ITEM) content = createItem(outcome.name);
        
        tile.setContent(outcome.type, content);
        tile.state = TileState.REVEALED; // Reveal instantly
        this.onTileRevealed(tile);
        
        // Check for floor clear bonus after opening barrel
        const monstersAlive = this.grid.some(t => t.type === TileType.MONSTER && t.content && t.content.isAlive());
        const barrelsRemaining = this.grid.some(t => t.type === TileType.BARREL && t.state === TileState.REVEALED);
        
        if (!monstersAlive && !barrelsRemaining && !this.floorClearBonusAwarded && this.player.floor >= 3) {
            this.floorClearBonusAwarded = true;
            this.player.addGold(10);
            this.showGameMessage(Localization[Game.language]["floor_cleared_bonus"]);
            // Play trumpet sound for floor cleared bonus
            if (!this.isMuted) {
                const trumpetSounds = ['trumpet_1', 'trumpet_2', 'trumpet_3'];
                const randomSound = trumpetSounds[Math.floor(Math.random() * trumpetSounds.length)];
                this.sound.playAudioSprite('soundbank', randomSound, {
                    volume: this.soundVolume
                });
            }
        }
    }
    
    endTurn(justAttackedTile = null) {
        if(this.turnInProgress) return;
        this.turnInProgress = true;
        
        // Reset sound flags for this turn
        this.swordSoundPlayed = false;
        this.hurtSoundPlayed = false;
        
        // Automated processes
        const revealedMonsters = this.grid.filter(t => t.type === TileType.MONSTER && t.state === TileState.REVEALED && t.content.isAlive());

        revealedMonsters.forEach(tile => {
            const monster = tile.content;
            if (tile === justAttackedTile) return; // Skip monster that just counter-attacked
            
            // Apply poison damage
            if (monster.status.poison > 0) {
                const poisonDamage = Math.ceil(monster.maxHp * 0.1); // 10% of max HP
                monster.takeDamage(poisonDamage);
                if (Game.character != 'hero_artificer') {
                    monster.status.poison--;
                }
                this.showGameMessage(Localization[Game.language]["monster_poison_damage"].replace("{monster_name}", monster.name).replace("{damage}", poisonDamage));
                
                // Check if monster died immediately from poison
                if (!monster.isAlive()) {
                    this.handleMonsterDeath(tile);
                    this.checkMortalChallenge();
                    return;
                }
                
                // Always play damage animation first
                this.playMonsterHurtSound();
                monster.startAnimation('damage', 500, () => {
                    // Validate tile and scene still exist
                    if (!tile || !tile.scene || tile.scene !== this) return;
                    if (!monster.isAlive()) {
                        // Monster died after poison damage animation
                        this.handleMonsterDeath(tile);
                        // Check for MORTAL challenge completion
                        this.checkMortalChallenge();
                    } else {
                        // Monster survived, reset to idle
                        tile.draw();
                    }
                });
                tile.draw();
                return; // Skip other actions for this monster this turn
            }
            
            if (monster.isFrozen()) return;

            // Archer attacks
            if (monster.special === 'archer') {
                monster.startAnimation('attack', 500, () => {
                    tile.draw(); // Redraw when attack animation ends to show idle
                });
                tile.draw();
                this.playerTakeDamage(monster.attack);
                this.showGameMessage(Localization[Game.language]["archer_shoots"].replace("{damage}", monster.attack));
                this.playMonsterAttackSound();
            }
            
            // Dark Healer healing
            if (monster.special === 'healer' && !monster.hasAttackedThisTurn) {
                if (monster.healingCooldown <= 0) {
                    // Find wounded monsters to heal (excluding self and frozen monsters)
                    const woundedMonsters = revealedMonsters.filter(t => {
                        const m = t.content;
                        return t !== tile && m.isAlive() && m.hp < m.maxHp && !m.isFrozen();
                    });
                    
                    if (woundedMonsters.length > 0) {
                        // Pick random wounded monster
                        const targetTile = Phaser.Utils.Array.GetRandom(woundedMonsters);
                        const targetMonster = targetTile.content;
                        
                        // Play attack animation for the healer to show action
                        monster.startAnimation('attack', 500, () => {
                            // Validate tile still exists
                            if (!tile || !tile.scene || tile.scene !== this) return;
                            // Return to idle animation after healing
                            tile.draw(); // Update healer tile display
                        });
                        tile.draw(); // Immediately update to show attack frame
                        
                        // Heal amount equals current floor
                        const healAmount = this.player.floor;
                        targetMonster.hp = Math.min(targetMonster.hp + healAmount, targetMonster.maxHp);
                        
                        this.showGameMessage(Localization[Game.language]["healer_heals"].replace("{healer_name}", monster.name).replace("{target_name}", targetMonster.name).replace("{amount}", healAmount));
                        targetTile.draw();
                        
                        // Set random cooldown between 2-5 turns
                        monster.healingCooldown = Phaser.Math.Between(2, 5);
                    }
                } else {
                    // Decrement cooldown
                    monster.healingCooldown--;
                }
            }
            
            // Necromancer summoning
            if (monster.special === 'summons' && !monster.hasAttackedThisTurn) {
                if (monster.summoningCooldown <= 0) {
                    // Find empty tiles that are revealed or adjacent to revealed
                    const emptyTiles = this.grid.filter(t => {
                        return t.type === TileType.EMPTY && 
                               (t.state === TileState.REVEALED || t.isAccessible);
                    });
                    
                    if (emptyTiles.length > 0) {
                        // Pick random empty tile
                        const targetTile = Phaser.Utils.Array.GetRandom(emptyTiles);
                        
                        // Create summoned skeleton
                        const skeleton = createSummonedSkeleton(this, this.player);
                        targetTile.setContent(TileType.MONSTER, skeleton);
                        targetTile.state = TileState.REVEALED;
                        
                        this.showGameMessage(Localization[Game.language]["necromancer_summons"].replace("{monster_name}", monster.name));
                        targetTile.draw();
                        
                        // Set random cooldown between 2-4 turns
                        monster.summoningCooldown = Phaser.Math.Between(2, 4);
                    }
                } else {
                    // Decrement cooldown
                    monster.summoningCooldown--;
                }
            }
            
            // Reset attack flag for next turn
            if (monster.special === 'healer' || monster.special === 'summons') {
                monster.hasAttackedThisTurn = false;
            }
        });
        
        // Check for game over
        if (this.player.hp <= 0) {
            // Play game over sound
            if (!this.isMuted) {
                const gameOverSounds = ['game_over_1', 'game_over_2', 'game_over_3'];
                const randomSound = gameOverSounds[Math.floor(Math.random() * gameOverSounds.length)];
                this.sound.playAudioSprite('soundbank', randomSound, {
                    volume: this.soundVolume
                });
            }
            
            this.gameOverPanel.open(this.player.floor);
            return;
        }
        
        this.updatePlayerUI();
        this.time.delayedCall(100, () => { 
            // Validate scene still exists
            if (!this.scene) return;
            this.turnInProgress = false; 
        });
    }
    
    onInventoryClick(index) {
        // Block inventory interactions when modal is open or turn in progress
        if (this.turnInProgress || this.isAnyModalOpen()) return;
        
        if (index < this.player.inventory.length) {
            const item = this.player.inventory[index];
            this.itemPanel.open(item);
        } else {
            // Check if this is a locked slot
            const isLockedSlot = index >= (GameSettings.INVENTORY_SIZE - GameSettings.LOCKED_INVENTORY_SLOTS);
            if (isLockedSlot) {
                this.unlockItemSlotPanel.open();
            }
        }
    }
    
    findEmptyTile() {
        return this.grid.find(t => t.type === TileType.EMPTY && t.state === TileState.REVEALED);
    }
    
    // --- Bulk Item Effects ---
    
    damageAllMonsters(damage) {
        this.grid.filter(t => t.type === TileType.MONSTER && t.state === TileState.REVEALED && t.content.isAlive()).forEach(tile => {
            const monster = tile.content;
            monster.takeDamage(damage);
            
            // Check if monster died immediately
            if (!monster.isAlive()) {
                this.handleMonsterDeath(tile);
                this.checkMortalChallenge();
                return;
            }
            
            // Always play damage animation first
            this.playMonsterHurtSound();
            monster.startAnimation('damage', 500, () => {
                // Validate tile and scene still exist
                if (!tile || !tile.scene || tile.scene !== this) return;
                if (!monster.isAlive()) {
                    // Monster died after damage animation
                    this.handleMonsterDeath(tile);
                    // Check for MORTAL challenge completion
                    this.checkMortalChallenge();
                } else {
                    // Monster survived, reset to idle
                    tile.draw();
                }
            });
            tile.draw();
        });
    }

    freezeAllMonsters(duration) {
        this.grid.filter(t => t.type === TileType.MONSTER && t.state === TileState.REVEALED && t.content.isAlive()).forEach(tile => {
            tile.content.status.freeze = duration;
            tile.draw();
        });
        this.freezeCounter += 1;
        if (this.freezeCounter >= 15) {
            Game.character_unlocked.hero_wizard = true;
            PlayerData.Instance.SetNumber("wizard_unlocked", 1);
        }
    }

    poisonAllMonsters(duration) {
        this.grid.filter(t => t.type === TileType.MONSTER && t.state === TileState.REVEALED && t.content.isAlive()).forEach(tile => {
            tile.content.status.poison = duration;
            tile.draw();
        });
        this.poisonCounter += 1;
        if (this.poisonCounter >= 10) {
            Game.character_unlocked.hero_artificer = true;
            PlayerData.Instance.SetNumber("artificer_unlocked", 1);
        }
    }

    sheepAllMonsters() {
        this.grid.filter(t => t.type === TileType.MONSTER && t.state === TileState.REVEALED && t.content.isAlive()).forEach(tile => {
            const monster = tile.content;
            // Transform into sheep but preserve key holder status
            const wasKeyHolder = monster.isKeyHolder;
            monster.turnIntoSheep();
            monster.isKeyHolder = wasKeyHolder; // Restore key holder status after transformation
            tile.draw();
        });
    }
    
    updateDoorState() {
        const doorTile = this.grid.find(t => t.type === TileType.DOOR);
        if(doorTile) {
            doorTile.draw();
            // Store door tile for later click indicator
            if (!Game.isTutorialFinished && this.player.floor === 1 && this.player.hasKey) {
                this.pendingDoorClickIndicator = doorTile;
            }
        }
        this.updatePlayerUI();
    }
    
    openDebugMenu() {
        // Block debug menu when modal is open or turn in progress
        if (this.turnInProgress || this.isAnyModalOpen()) return;
        
        this.debugPanel.open();
    }

    openHelpMenu() {
        if (this.turnInProgress || this.isAnyModalOpen()) return;
        
        // Open the language panel
        this.languagePanel.open();
    }

    openSettingsMenu() {
        // Block settings menu when modal is open or turn in progress
        if (this.turnInProgress || this.isAnyModalOpen()) return;
        
        this.settingsPanel.open();
    }
    
    advanceFloor() { 
        if (!this.checkDomainAuthorization()) {
            return;
        }
        
        this.player.floor++;
        if (this.player.floor >= 3) {
            Game.isTutorialFinished = true; // Force finish
            PlayerData.Instance.SetNumber("tutorial_done", 1);
        }
        if (this.player.floor >= 15) {
            Game.character_unlocked.hero_archer = true;
            PlayerData.Instance.SetNumber("archer_unlocked", 1);
        }
        
        // Set floor-specific tile removal patterns
        this.setFloorTileRemoval();
        
        this.revealedTilesCount = 0;
        this.generateFloor();
        
        if (this.player.floor >= 4) {
            AdManager.instance.CommercialBreak();
        }
    }
    
    fillInventoryWithRandomItems() {
        // Get all inventory-suitable items (exclude instant items)
        const inventoryItems = [
            'Attack Rune', 'Defense Rune', 'Shield', 'Spike Trap', 'Lantern', 
            'Invisibility Cloak', 'Vampire Ring', 'Amulet of Greed', 'Cursed Rune',
            'Potion', 'Blade Scroll', 'Poison Vial', 'Freeze Scroll', 
            'Sheep Scroll', 'Lock Pick'
        ];
        
        // Clear current inventory
        this.player.inventory = [];
        
        // Fill with random items (up to available slots)
        const maxSlots = GameSettings.INVENTORY_SIZE - GameSettings.LOCKED_INVENTORY_SLOTS;
        for (let i = 0; i < maxSlots; i++) {
            const randomItemName = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
            const item = createItem(randomItemName);
            this.player.inventory.push(item);
        }
        
        this.updateInventoryUI();
        this.showGameMessage(Localization[Game.language]["inventory_filled_random"]);
    }
    
    handleChallengeClick(tile) {
        const challenge = tile.content;
        
        // Play door creak sound for challenge door
        if (!this.isMuted) {
            const creakSounds = ['creek_1', 'creek_2'];
            const randomSound = creakSounds[Math.floor(Math.random() * creakSounds.length)];
            this.sound.playAudioSprite('soundbank', randomSound, {
                volume: this.soundVolume
            });
        }
        
        // Always open the panel, regardless of requirements
        this.challengePanel.open(challenge);
    }
    
    checkMortalChallenge() {
        // Check if any MORTAL challenge is revealed
        const mortalChallenge = this.grid.find(tile => 
            tile.type === TileType.CHALLENGE && 
            tile.state === TileState.REVEALED && 
            tile.content && 
            tile.content.type === ChallengeType.MORTAL
        );
        
        if (mortalChallenge) {
            this.completeChallengeFromEvent(mortalChallenge);
        }
    }
    
    checkMaterialChallenge() {
        // Check if any MATERIAL challenge is revealed
        const materialChallenge = this.grid.find(tile => 
            tile.type === TileType.CHALLENGE && 
            tile.state === TileState.REVEALED && 
            tile.content && 
            tile.content.type === ChallengeType.MATERIAL
        );
        
        if (materialChallenge) {
            this.completeChallengeFromEvent(materialChallenge);
        }
    }
    
    completeChallengeFromEvent(tile) {
        this.showGameMessage(Localization[Game.language]["challenge_completed_generic"].replace("{challenge_type}", tile.content.type));
        this.grantChallengeReward(tile.content, tile);
        this.updateTileAccessibility();
    }
    
    grantChallengeReward(challenge, challengeTile) {
        // Play unlock sound for challenge completion
        if (!this.isMuted) {
            const unlockSounds = ['unlock_1', 'unlock_2'];
            const randomSound = unlockSounds[Math.floor(Math.random() * unlockSounds.length)];
            this.sound.playAudioSprite('soundbank', randomSound, {
                volume: this.soundVolume
            });
        }
        
        // Get all durable items
        const allDurableItems = ['Attack Rune', 'Defense Rune', 'Shield', 'Spike Trap', 
                                'Lantern', 'Invisibility Cloak', 'Vampire Ring', 
                                'Amulet of Greed', 'Cursed Rune'];
        
        // Find which durable items the player doesn't have
        const playerItemKeys = this.player.inventory.map(item => item.key);
        const missingDurableItems = allDurableItems.filter(itemKey => !playerItemKeys.includes(itemKey));
        
        if (missingDurableItems.length > 0) {
            // Drop a random durable item the player doesn't have on the challenge tile
            const randomItem = missingDurableItems[Math.floor(Math.random() * missingDurableItems.length)];
            const item = createItem(randomItem);
            
            challengeTile.setContent(TileType.ITEM, item);
            challengeTile.state = TileState.REVEALED;
            challengeTile.draw();
            this.showGameMessage(Localization[Game.language]["item_appears"].replace("{item_name}", randomItem));
        } else {
            // Player has all durable items, drop 50 gold on the challenge tile
            const coin = createItem('Coin');
            coin.customAmount = 50;
            challengeTile.setContent(TileType.ITEM, coin);
            challengeTile.state = TileState.REVEALED;
            challengeTile.draw();
            this.showGameMessage(Localization[Game.language]["gold_appears"]);
        }
    }
    
    initializeAudio() {
        // Create audio sprite
        this.audioSprite = this.sound.addAudioSprite('soundbank');
        
        // Set initial volume on the audio sprite
        this.audioSprite.volume = 1.0;
        
        // Store initial volume settings
        this.musicVolume = 1.0;
        this.soundVolume = 1.0;
        this.isMuted = false;
        
        // Start playing background music
        this.audioSprite.play('background', {
            loop: true
        });
        
        // Connect settings panel callbacks to game audio controls
        this.settingsPanel.MusicVolumeChanged = (volume) => this.setMusicVolume(volume);
        this.settingsPanel.SoundVolumeChanged = (volume) => this.setSoundVolume(volume);
        this.settingsPanel.Muted = (muted) => this.setMuted(muted);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (!this.isMuted && this.audioSprite) {
            this.audioSprite.volume = volume;
        }
    }
    
    setSoundVolume(volume) {
        this.soundVolume = volume;
        // This will be used for sound effects when they are added
    }
    
    setMuted(muted) {
        this.isMuted = muted;
        if (this.audioSprite) {
            if (muted) {
                this.audioSprite.volume = 0;
            } else {
                this.audioSprite.volume = this.musicVolume;
            }
        }
    }
    
    playMonsterAttackSound() {
        // Only play one sword sound per frame
        if (this.swordSoundPlayed || this.isMuted) return;
        
        this.swordSoundPlayed = true;
        
        // Choose a random sword sound
        const swordSounds = ['sword_1', 'sword_2', 'sword_3'];
        const randomSound = swordSounds[Math.floor(Math.random() * swordSounds.length)];
        
        // Play the sound effect using playAudioSprite for simultaneous playback
        this.sound.playAudioSprite('soundbank', randomSound, {
            volume: this.soundVolume
        });
    }
    
    playMonsterHurtSound() {
        // Only play one hurt sound per frame
        if (this.hurtSoundPlayed || this.isMuted) return;
        
        this.hurtSoundPlayed = true;
        
        // Choose a random hurt sound
        const hurtSounds = ['hurt_1', 'hurt_2', 'hurt_3', 'hurt_4'];
        const randomSound = hurtSounds[Math.floor(Math.random() * hurtSounds.length)];
        
        // Play the sound effect using playAudioSprite for simultaneous playback
        this.sound.playAudioSprite('soundbank', randomSound, {
            volume: this.soundVolume
        });
    }
    
    // Player monster animation methods
    updatePlayerMonsterAnimation(state) {
        // Don't interrupt animations unless dead
        if (this.playerAnimationTimer && state !== 'dead') {
            return;
        }
        
        // If already dead, stay dead
        if (this.playerAnimationState === 'dead' && state !== 'idle') {
            return;
        }
        
        this.playerAnimationState = state;
        this.updatePlayerMonsterFrame();
        
        // Set up timer to return to idle or dead
        if (state === 'attack' || state === 'damage') {
            // Clear any existing timer
            if (this.playerAnimationTimer) {
                this.playerAnimationTimer.destroy();
            }
            
            this.playerAnimationTimer = this.time.delayedCall(500, () => {
                this.playerAnimationTimer = null;
                if (this.playerAnimationState !== 'dead') {
                    this.playerAnimationState = 'idle';
                    this.updatePlayerMonsterFrame();
                }
            });
        }
    }
    
    updatePlayerMonsterFrame() {
        if (!this.playerMonster) return;
        
        // Get frame index based on animation state
        let frameIndex;
        switch (this.playerAnimationState) {
            case 'idle': frameIndex = 0; break;    // top-left
            case 'attack': frameIndex = 1; break;  // top-right
            case 'damage': frameIndex = 2; break;  // bottom-left
            case 'dead': frameIndex = 3; break;    // bottom-right
            default: frameIndex = 0; break;
        }
        
        // Calculate frame position in sprite sheet
        const frameX = (frameIndex % 2) * MONSTER_SPRITE_CONFIG.FRAME_WIDTH;
        const frameY = Math.floor(frameIndex / 2) * MONSTER_SPRITE_CONFIG.FRAME_HEIGHT;
        
        // Update crop to show the correct frame
        this.playerMonster.setCrop(frameX, frameY, MONSTER_SPRITE_CONFIG.FRAME_WIDTH, MONSTER_SPRITE_CONFIG.FRAME_HEIGHT);
        
        // Update origin for the new frame
        const originX = (frameX + MONSTER_SPRITE_CONFIG.FRAME_WIDTH / 2) / MONSTER_SPRITE_CONFIG.TOTAL_WIDTH;
        const originY = (frameY + MONSTER_SPRITE_CONFIG.FRAME_HEIGHT / 2) / MONSTER_SPRITE_CONFIG.TOTAL_HEIGHT;
        this.playerMonster.setOrigin(originX, originY);
    }
    
    playPlayerAttackAnimation() {
        this.updatePlayerMonsterAnimation('attack');
    }
    
    playPlayerDamageAnimation() {
        this.updatePlayerMonsterAnimation('damage');
    }
    
    setPlayerDead() {
        this.updatePlayerMonsterAnimation('dead');
    }
    
    playerTakeDamage(damage) {
        this.player.takeDamage(damage);
        this.playPlayerDamageAnimation();
        if (!this.player.isAlive()) {
            this.setPlayerDead();
        }
    }
    
    updatePlayerMonsterSprite() {
        if (!this.playerMonster) return;
        
        // Update texture to new character
        this.playerMonster.setTexture('atlas_02', `${Game.character}.png`);
        
        // Reset to idle animation
        this.playerAnimationState = 'idle';
        this.updatePlayerMonsterFrame();
    }
}
