class LevelSelectMenuWindow extends Window {
    constructor(scene) {
        super(scene, 600, 450);
        
        // Calculate window center position
        const windowCenterX = scene.cameras.main.width / 2;
        const windowCenterY = scene.cameras.main.height / 2;
        
        // Create Sound Effects checkbox
        this.soundEffectsCheckbox = this.createCheckbox(
            scene,
            windowCenterX - 180,
            windowCenterY - 100,
            'Sound Effects',
            soundEffectsEnabled,
            (enabledOrNot) => {
                soundEffectsEnabled = enabledOrNot;
            }
        );
        
        // Create Background Music checkbox
        this.backgroundMusicCheckbox = this.createCheckbox(
            scene,
            windowCenterX - 180,
            windowCenterY,
            'Background Music',
            !MusicManager.isMuted,
            (enabledOrNot) => {
                if (enabledOrNot) {
                    MusicManager.unmuteBackgroundMusic();
                } else {
                    MusicManager.muteBackgroundMusic();
                }
            }
        );
        
        // Create Reset Progress button
        this.resetButton = this.createButton(
            scene,
            windowCenterX,
            windowCenterY + 110,
            'Reset Progress',
            () => {
                // Close the window first
                this.close();
                // Reset player progress
                PlayerData.Instance.Reset();
                // Refresh the scene to show updated progress
                scene.scene.restart();
            }
        );
        
        // Create close button in upper right
        this.createCloseButton(scene);
    }
    
    createCheckbox(scene, x, y, label, checked = false, onClicked = null) {
        // Create checkbox container
        const container = scene.add.container(x, y);
        
        // Create checkbox box
        const box = scene.add.rectangle(0, 0, 48, 48, 0xe7c28d);
        box.setStrokeStyle(4, 0x84471c);
        box.setInteractive();
        
        // Create checkmark
        const checkmark = scene.add.text(0, 0, '✓', {
            fontSize: '40px',
            color: '#45280f',
            fontFamily: 'Arial'
        });
        checkmark.setOrigin(0.5);
        checkmark.setVisible(checked);
        
        // Create label
        const labelText = scene.add.text(50, 0, label, {
            fontSize: '40px',
            color: '#45280f',
            fontFamily: 'Arial'
        });
        labelText.setOrigin(0, 0.5);
        
        // Handle click
        box.on('pointerdown', () => {
            if (soundEffectsEnabled) {
                scene.sound.playAudioSprite('soundbank', 'click');
            }
            checked = !checked;
            checkmark.setVisible(checked);

            if (onClicked) {
                onClicked(checked);
            }
        });
        
        // Add hover effect
        box.on('pointerover', () => {
            if (soundEffectsEnabled) {
                scene.sound.playAudioSprite('soundbank', 'hover');
            }
            box.setStrokeStyle(4, 0x8f632f);
        });
        
        box.on('pointerout', () => {
            box.setStrokeStyle(4, 0x84471c);
        });
        
        container.add([box, checkmark, labelText]);
        this.add(container);
        
        return {
            container: container,
            isChecked: () => checked,
            setChecked: (value) => {
                checked = value;
                checkmark.setVisible(checked);
            }
        };
    }
    
    createButton(scene, x, y, text, callback) {
        // Create drop shadow
        const shadow = scene.add.graphics();
        shadow.fillStyle(0x45280f, 0.5);
        shadow.fillRoundedRect(x - 150 + 4, y - 40 + 4, 300, 80, 12);
        
        // Create button background with rounded corners
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x84471c);
        buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
        buttonBg.lineStyle(4, 0x45280f);
        buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        
        // Create invisible hit area for interaction
        const button = scene.add.rectangle(x, y, 300, 80, 0x000000, 0);
        button.setInteractive();
        
        // Create button text
        const buttonText = scene.add.text(x, y, text, {
            fontSize: '36px',
            color: '#e7c28d',
            fontFamily: 'Arial'
        });
        buttonText.setOrigin(0.5);
        
        // Add hover effects
        button.on('pointerover', () => {
            if (soundEffectsEnabled) {
                scene.sound.playAudioSprite('soundbank', 'hover');
            }
            buttonBg.clear();
            buttonBg.fillStyle(0x8f632f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        button.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x84471c);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        button.on('pointerdown', () => {
            if (soundEffectsEnabled) {
                scene.sound.playAudioSprite('soundbank', 'click');
            }
            buttonBg.clear();
            buttonBg.fillStyle(0x45280f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
            if (callback) callback();
        });
        
        button.on('pointerup', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x8f632f);
            buttonBg.fillRoundedRect(x - 150, y - 40, 300, 80, 12);
            buttonBg.lineStyle(4, 0x45280f);
            buttonBg.strokeRoundedRect(x - 150, y - 40, 300, 80, 12);
        });
        
        this.add([shadow, buttonBg, button, buttonText]);
        
        return button;
    }
    
    createCloseButton(scene) {
        // Calculate window position
        const screenWidth = scene.cameras.main.width;
        const screenHeight = scene.cameras.main.height;
        const windowX = (screenWidth - this.windowWidth) / 2;
        const windowY = (screenHeight - this.windowHeight) / 2;
        
        // Create close button
        const closeButton = scene.add.image(
            windowX + this.windowWidth - 40,  // Position near right edge
            windowY + 40,  // Position near top edge
            'atlas_03',
            'window_x_button.png'
        );
        
        // Set scale and make interactive
        closeButton.setScale(0.5);
        closeButton.setInteractive({ useHandCursor: true });
        
        // Add hover effects
        closeButton.on('pointerover', () => {
            if (soundEffectsEnabled) {
                scene.sound.playAudioSprite('soundbank', 'hover');
            }
            closeButton.setScale(0.55);
            closeButton.setTint(0xffcccc);
        });
        
        closeButton.on('pointerout', () => {
            closeButton.setScale(0.5);
            closeButton.clearTint();
        });
        
        closeButton.on('pointerdown', () => {
            closeButton.setScale(0.45);
        });
        
        closeButton.on('pointerup', () => {
            if (soundEffectsEnabled) {
                scene.sound.playAudioSprite('soundbank', 'click');
            }
            closeButton.setScale(0.55);
            this.close();
        });
        
        // Add to container
        this.add(closeButton);
    }
    
    createNineSliceWindow(scene, x, y, width, height) {
        // Call parent method first
        super.createNineSliceWindow(scene, x, y, width, height);
        
        // Replace the top right image with the X version
        const scale = 0.5;
        const leftWidth = this.topLeft.displayWidth;
        
        // Remove the original top right
        const originalTopRightIndex = this.getIndex(this.topRight);
        this.topRight.destroy();
        
        // Create new top right with X
        this.topRight = scene.add.image(x + width, y, 'atlas_03', 'window_top_right_x.png');
        this.topRight.setScale(scale);
        this.topRight.setOrigin(1, 0);
        
        // Add it back at the same index to maintain layer order
        this.addAt(this.topRight, originalTopRightIndex);
    }
}