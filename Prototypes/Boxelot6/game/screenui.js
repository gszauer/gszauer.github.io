class TutorialUI extends Phaser.GameObjects.Container {
    static shownMessages = new Set();
     
    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.showCount = 0;
        
        // Position in bottom-left corner - will be updated in updateScale()
        const padding = 20;
        this.basePadding = padding;
        this.updateScale();
        
        // Create orc character
        this.orc = scene.add.sprite(0, 0, 'atlas_01', 'ftue.png');
        this.orc.setOrigin(0, 1); // Bottom-left anchor
        this.orc.setScale(0.8); // Scale down a bit to fit better
        
        // Create speech bubble positioned relative to orc
        this.bubble = scene.add.sprite(
            this.orc.displayWidth + 30, // Overlap slightly with orc
            -this.orc.displayHeight - 20, // Position at top-right of orc
            'atlas_01', 
            'bubble.png'
        );
        this.bubble.setOrigin(0.5);
        
        // Create text for the bubble
        this.tutorialText = scene.add.text(
            this.bubble.x,
            this.bubble.y - this.bubble.displayHeight / 2 + 30,
            '',
            {
                fontSize: '24px',
                fill: '#333',
                align: 'center',
                wordWrap: { width: 310 }
            }
        );
        this.tutorialText.setOrigin(0.5, 0);
        
        // Add all components to container
        this.add([this.orc, this.bubble, this.tutorialText]);
        
        // Initially hidden
        this.setVisible(false);
        this.setDepth(10000); // Ensure it's on top of everything, including panels
        
        // Handle screen resize
        scene.scale.on('resize', this.onResize, this);
        
        // Make the orc and bubble sprites individually clickable to dismiss
        this.orc.setInteractive();
        this.bubble.setInteractive();
        
        // Add click handlers to both sprites
        this.orc.on('pointerdown', () => this.hide());
        this.bubble.on('pointerdown', () => this.hide());
        
        // Track shown messages
    }
    
    show(message, onDismissCallback = null) {
        // Don't show if already shown
        if (TutorialUI.shownMessages.has(message)) {
            if (onDismissCallback) {
                onDismissCallback(); // Call immediately if already shown
            }
            return;
        }

        this.showCount += 1;
        if (this.showCount % 2 === 0) {
            this.orc.setFrame('ftue2.png');
        } else {
            this.orc.setFrame('ftue.png');
        }
        this.orc.setOrigin(0, 1); // Bottom-left anchor
        this.orc.setScale(0.8); // Scale down a bit to fit better
        
        this.currentMessage = message;
        this.onDismissCallback = onDismissCallback;
        this.tutorialText.setText(message);
        
        this.setVisible(true);
        this.setAlpha(1);
        
        // Add subtle animation
        this.updateScale();
        this.adjustLanguageScale();
    }

    adjustLanguageScale() {
        if (Game.language === "fr") {
            this.tutorialText.setScale(0.8);
        }
        else if (Game.language === "de" || Game.language === "pt" || 
            Game.language === "es" || Game.language === "tr") {
            this.tutorialText.setScale(0.9);
        }
        else {
            this.tutorialText.setScale(1.0);
        }
    }
    
    hide() {
        if (!this.visible) return;
        
        // Mark message as shown
        if (this.currentMessage) {
            TutorialUI.shownMessages.add(this.currentMessage);
        }
        
        // Trigger callback when tutorial is dismissed
        if (this.onDismissCallback) {
            this.onDismissCallback();
            this.onDismissCallback = null;
        }
        
        this.setVisible(false);
        this.setAlpha(0);
    }
    
    updateScale() {
        // Calculate the same scale that the main container uses
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const gameWidth = 600;
        const gameHeight = 900;
        
        const scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight);
        this.setScale(scale);
        
        // Position at bottom-left of the actual screen
        this.setPosition(
            0,
            screenHeight 
        );
    }
    
    onResize(gameSize) {
        // Update scale and position when screen resizes
        this.updateScale();
    }
    
    destroy() {
        this.scene.scale.off('resize', this.onResize, this);
        super.destroy();
    }
}



class CharacterSelectUI extends Phaser.GameObjects.Container {
    playSwooshSound() {
        const swooshSounds = ['unlock_1'];
        const randomSound = swooshSounds[Math.floor(Math.random() * swooshSounds.length)];
        this.scene.sound.playAudioSprite('soundbank', randomSound, {
            volume: this.scene.soundVolume
        });
    }

    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

    
        
        // Position at center of screen
        this.updatePosition();
        
        // Create black background block for tall windows
        this.background_block = scene.add.graphics();
        this.background_block.fillStyle(0x09090e, 1);
        //this.background_block.setScale(0.45);
        
        // Create background image
        this.background = scene.add.sprite(0, 30, 'atlas_01', 'character_background.png');
        this.background.setOrigin(0.5);
        this.background.setScale(0.45);
        
        // Create logo
        this.logo = scene.add.sprite(0, -450, 'atlas_01', 'character_logo.png');
        this.logo.setOrigin(0.5, 0.0);
        this.logo.setScale(0.8);
        
        // Create character card below logo
        this.characterCard = scene.add.sprite(0, 70, 'atlas_01', 'character_card.png');
        this.characterCard.setOrigin(0.5, 0);
        this.characterCard.setScale(0.9);
        
        // Create character sprite
        this.currentCharacterIndex = Game.possible_characters.indexOf(Game.character);
        if (this.currentCharacterIndex === -1) this.currentCharacterIndex = 0;
        
        this.characterSprite = scene.add.sprite(0, 0, 'atlas_02', Game.character + '.png');
        
        // Create hero name text
        this.heroNameText = scene.add.text(0, 115, '', {
            fontSize: '54px',
            fill: '#ed9515',
            align: 'center',
            fontStyle: 'bold'
        });
        this.heroNameText.setOrigin(0.5);
        
        // Create hero description text
        this.heroDescText = scene.add.text(0, 220, '', {
            fontSize: '24px',
            fill: '#00',
            align: 'center',
            wordWrap: { width: 280 }
        });
        this.heroDescText.setOrigin(0.5);
        
        // Add subtle bobbing animation
        this.bobbingTween = scene.tweens.add({
            targets: this.characterSprite,
            y: '-=10',
            duration: 1000,
            ease: 'Sine.linear',
            yoyo: true,
            repeat: -1
        });
        
        const navi_button_y = 120;

        // Create previous button
        this.prevButton = scene.add.sprite(-220, navi_button_y, 'atlas_01', 'character_prev_normal.png');
        this.prevButton.setOrigin(0.5);
        this.prevButton.setScale(0.4);
        this.prevButton.setInteractive({ useHandCursor: true });
        
        // Add hover effects for previous button
        this.prevButton.on('pointerover', () => {
            this.prevButton.setTexture('atlas_01', 'character_prev_over.png');
        });
        this.prevButton.on('pointerout', () => {
            this.prevButton.setTexture('atlas_01', 'character_prev_normal.png');
        });
        this.prevButton.on('pointerdown', () => {
            this.playSwooshSound();
            this.currentCharacterIndex--;
            if (this.currentCharacterIndex < 0) {
                this.currentCharacterIndex = Game.possible_characters.length - 1;
            }
            const newCharacter = Game.possible_characters[this.currentCharacterIndex];
            Game.character = newCharacter;
            this.setSprite(newCharacter);
            if (scene.updatePlayerMonsterSprite) {
                scene.updatePlayerMonsterSprite();
            }
            if (scene.updatePlayerMonsterSprite) {
                scene.updatePlayerMonsterSprite();
            }
        });

        // Create next button
        this.nextButton = scene.add.sprite(220, navi_button_y, 'atlas_01', 'character_next_normal.png');
        this.nextButton.setOrigin(0.5);
        this.nextButton.setScale(0.4);
        this.nextButton.setInteractive({ useHandCursor: true });
        
        // Add hover effects for next button
        this.nextButton.on('pointerover', () => {
            this.nextButton.setTexture('atlas_01', 'character_next_over.png');
        });
        this.nextButton.on('pointerout', () => {
            this.nextButton.setTexture('atlas_01', 'character_next_normal.png');
        });
        this.nextButton.on('pointerdown', () => {
            this.playSwooshSound();
            this.currentCharacterIndex++;
            if (this.currentCharacterIndex >= Game.possible_characters.length) {
                this.currentCharacterIndex = 0;
            }
            const newCharacter = Game.possible_characters[this.currentCharacterIndex];
            Game.character = newCharacter;
            this.setSprite(newCharacter);
            if (scene.updatePlayerMonsterSprite) {
                scene.updatePlayerMonsterSprite();
            }
            if (scene.updatePlayerMonsterSprite) {
                scene.updatePlayerMonsterSprite();
            }
        });
        
        // Create button below character card
        this.selectButton = scene.add.sprite(0, 350, 'atlas_01', 'character_btn_regular.png');
        this.selectButton.setOrigin(0.5);
        this.selectButton.setScale(0.75);
        this.selectButton.setInteractive({ useHandCursor: true });
        
        // Add hover effects for select button
        this.selectButton.on('pointerover', () => {
            if (this.selectButton.frame.name !==  'character_btn_disabled.png') {
                this.selectButton.setTexture('atlas_01', 'character_btn_over.png');
            }
        });
        this.selectButton.on('pointerout', () => {
            if (this.selectButton.frame.name !==  'character_btn_disabled.png') {
                this.selectButton.setTexture('atlas_01', 'character_btn_regular.png');
            }
        });
        this.selectButton.on('pointerdown', () => {
            // Only proceed if character is unlocked
            if (Game.character_unlocked[Game.character]) {
                AdManager.instance.GameplayStart();

                // Hide character select UI
                this.hide();

                TutorialUI.shownMessages.clear();

                // Call restartGame function
                this.scene.restartGame(false);
                // Generate the initial floor
                this.scene.generateFloor();
                AdManager.instance.GameplayStart();
            }
            else {
                //this.playSwooshSound();
                AdManager.instance.RewardBreak((success) => {
                    if (success) {
                        Game.character_unlocked[Game.character] = true;
                        // Save unlock to PlayerData
                        const characterKey = Game.character.replace('hero_', '') + '_unlocked';
                        PlayerData.Instance.SetNumber(characterKey, 1);
                        this.setSprite(Game.character);
                                    }
                    else {
                        // Keep button enabled and allow retry
                        // Show a message that ad failed but keep the unlock button active
                        this.showMessage("Ad failed to play");
                        // Keep the same button appearance and text so user can try again
                    }
                });
            }
        });
        
        // Create "Play" text for the select button
        this.playText = scene.add.text(0, 346, Localization[Game.language]["hero_action_play"], {
            fontSize: '62px',
            fill: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        });
        this.playText.setOrigin(0.5);
        
        // Create message text for showing ad failures
        this.messageText = scene.add.text(0, 0, '', {
            fontSize: '28px',
            fill: '#fff',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setVisible(false);
        
        // Add components to container (background_block first so it's behind everything)
        this.add([this.background_block, this.background, this.logo, this.characterCard, this.characterSprite, this.heroNameText, this.heroDescText, this.prevButton, this.nextButton, this.selectButton, this.playText, this.messageText]);
        
        // Initially hidden
        this.setVisible(false);
        this.setDepth(20000); // Higher than tutorial UI
        
        // Handle screen resize
        scene.scale.on('resize', this.onResize, this);
    }
    
    setSprite(characterName) {
        this.characterSprite.setTexture('atlas_02', characterName + '.png');
        
        const frameIndex = 1; // attack
        const frameX = (frameIndex % 2) * MONSTER_SPRITE_CONFIG.FRAME_WIDTH;
        const frameY = Math.floor(frameIndex / 2) * MONSTER_SPRITE_CONFIG.FRAME_HEIGHT;
        
        this.characterSprite.setCrop(frameX, frameY, MONSTER_SPRITE_CONFIG.FRAME_WIDTH, MONSTER_SPRITE_CONFIG.FRAME_HEIGHT);
        this.characterSprite.setOrigin(0.5, 0.5);
        this.characterSprite.x = -MONSTER_SPRITE_CONFIG.FRAME_WIDTH / 2 + 15;
        
        if (!this.lockIcon) {
            this.lockIcon = this.scene.add.sprite(0, 0, 'atlas_01', 'locked_item_slot.png');
            this.lockIcon.setOrigin(0.5);
            this.lockIcon.setDepth(this.characterSprite.depth + 1);
            this.add(this.lockIcon);
        }

        this.lockIcon.setPosition(this.characterSprite.x + MONSTER_SPRITE_CONFIG.FRAME_WIDTH / 2, this.characterSprite.y - MONSTER_SPRITE_CONFIG.FRAME_HEIGHT / 2);

       // Update hero text with current character
        if (this.heroNameText && this.heroDescText) {
            this.currentCharacterIndex = Game.possible_characters.indexOf(characterName);
            if (this.currentCharacterIndex === -1) this.currentCharacterIndex = 0;

            const currentCharacter = Game.possible_characters[this.currentCharacterIndex];
            this.heroNameText.setText(Localization[Game.language][currentCharacter + "_name"]);
            if (Game.character_unlocked[currentCharacter]) {
                this.characterSprite.clearTint();
                this.lockIcon.setVisible(false);
                this.heroDescText.setText(Localization[Game.language][currentCharacter + "_desc"]);
                this.selectButton.setTexture('atlas_01', 'character_btn_regular.png');

                this.playText.setText(Localization[Game.language]["hero_action_play"]);
                this.playText.setStyle({ fontSize: '62px' });
                this.playText.setFill('#7e8277');
            }
            else {
                this.characterSprite.setTint(0x404040);
                this.lockIcon.setVisible(true);
                this.heroDescText.setText(Localization[Game.language][currentCharacter + "_lock"]);
                
                // Always show the unlock button for locked characters
                this.selectButton.setTexture('atlas_01', 'character_btn_regular.png');
                this.playText.setText(Localization[Game.language]["hero_action_unlock"]);
                this.playText.setStyle({ fontSize: '28px' });
                this.playText.setFill('#7e8277');
            }
        }
    }
    
    showMessage(text) {
        // Show a temporary message on the character select screen
        this.messageText.setText(text);
        this.messageText.setVisible(true);
        this.messageText.setAlpha(1);
        
        // Hide after 4 seconds
        this.scene.time.delayedCall(4000, () => {
            if (this.messageText) {
                this.scene.tweens.add({
                    targets: this.messageText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.messageText) {
                            this.messageText.setVisible(false);
                        }
                    }
                });
            }
        });
    }
    
    show() {

        // Hide game containers
        if (this.scene.gameUIContainer) this.scene.gameUIContainer.setVisible(false);
        if (this.scene.mainContainer) this.scene.mainContainer.setVisible(false);
        if (this.scene.footerContainer) this.scene.footerContainer.setVisible(false);
        if (this.scene.tutorialUI) this.scene.tutorialUI.setVisible(false);
        
        this.setSprite(Game.character);
        this.updatePosition();

        // Show this UI
        this.setVisible(true);
        this.setAlpha(1);
    }
    
    hide() {
        if (this.scene.gameUIContainer) this.scene.gameUIContainer.setVisible(true);
        if (this.scene.mainContainer) this.scene.mainContainer.setVisible(true);
        if (this.scene.footerContainer) this.scene.footerContainer.setVisible(true);
        this.setVisible(false);
    }
    
    updatePosition() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        const gameWidth = 600;
        const gameHeight = 900;
        
        // Calculate scale to fit the screen (same as main game container)
        const scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight);
        this.setScale(scale);
        
        // Center the UI on screen
        this.setPosition(screenWidth / 2, screenHeight / 2);
        
        // Update background block
        if (this.background_block && this.background) {
            this.background_block.clear();
            
            // Calculate the bottom of the background sprite in world coordinates
            const backgroundBottom = this.background.y + (this.background.displayHeight / 2);
            const screenBottom = screenHeight / (2 * scale);
            const blockHeight = screenBottom - backgroundBottom;
            
            // Only draw if there's a gap to fill
            if (blockHeight > 0) {
                this.background_block.fillStyle(0x09090e, 1);
                this.background_block.fillRect(
                    -this.background.displayWidth / 2 + 33,
                    backgroundBottom,
                    this.background.displayWidth - 53,
                    blockHeight
                );
            }
        }
        
        // Adjust logo position to be at the top of the screen
        if (this.logo) {
            let logoTopY = -screenHeight / (2 * scale);
            this.logo.setY(logoTopY );
        }
    }
    
    onResize(gameSize) {
        this.updatePosition();
    }
    
    destroy() {
        this.scene.scale.off('resize', this.onResize, this);
        if (this.bobbingTween) {
            this.bobbingTween.remove();
        }
        super.destroy();
    }
} 
