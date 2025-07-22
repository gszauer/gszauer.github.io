class Tutorial extends Phaser.GameObjects.Container {
    constructor(scene, tutorialNumber = 1, text = "", cardSpriteName = null, fontSize = '26px') {
        super(scene, 0, 0);
        
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
            0.85
        );
        this.add(this.darkBackground);

        if (tutorialNumber < 1) { tutorialNumber = 1;}
        if (tutorialNumber > 3) { tutorialNumber = 3;}
        
        // Create tutorial frog sprite
        const frogSpriteName = `tutorial_frog_${tutorialNumber}.png`;
        this.frog = scene.add.image(0, screenHeight, 'atlas_03', frogSpriteName);
        this.frog.setOrigin(0, 1); // Bottom-left origin
        this.add(this.frog);
        
        // Create bubble at upper right of the frog
        const bubbleX = this.frog.x + this.frog.displayWidth - 90;
        const bubbleY = this.frog.y - this.frog.displayHeight + 80;
        this.bubble = scene.add.image(bubbleX, bubbleY, 'atlas_03', 'bubble.png');
        this.bubble.setOrigin(0, 1);
        this.add(this.bubble);
        
        // Add text inside the bubble
        const textPadding = 30;
        const maxTextWidth = this.bubble.displayWidth - (textPadding * 2);
        this.tutorialText = scene.add.text(
            bubbleX + textPadding,
            bubbleY + textPadding - this.bubble.displayHeight,
            text,
            {
                fontSize: fontSize,
                color: '#000000',
                wordWrap: { width: maxTextWidth, useAdvancedWrap: true }
            }
        );
        this.add(this.tutorialText);
        
        // Create card sprite if provided
        if (cardSpriteName) {
            const cardX = this.scene.cameras.main.width / 2.0;
            const cardY = this.scene.cameras.main.height / 2.0 - 150;
            this.cardSprite = scene.add.image(cardX, cardY, 'atlas_02', cardSpriteName);
            this.cardSprite.setOrigin(0.5);
            this.cardSprite.setScale(1.8);
            this.add(this.cardSprite);
        }
        
        // Create "Ok, Continue" button
        this.continueButton = scene.add.text(
            bubbleX + this.bubble.displayWidth / 2 + 40,
            bubbleY - 30,
            'Ok, Continue',
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#4080ff',
                padding: { x: 20, y: 10 },
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
            }
        );
        this.continueButton.setOrigin(0.5, 0);
        this.continueButton.setInteractive({ useHandCursor: true });
        
        // Add button hover effects
        this.continueButton.on('pointerover', () => {
            this.continueButton.setBackgroundColor('#5090ff');
        });
        
        this.continueButton.on('pointerout', () => {
            this.continueButton.setBackgroundColor('#4080ff');
        });
        
        // Close tutorial on button click
        this.continueButton.on('pointerdown', () => {
            this.close();
        });
        
        this.add(this.continueButton);
        
        // Add to scene
        scene.add.existing(this);
        
        // Set high depth to ensure tutorial is on top
        this.setDepth(2000);
        
        // Mark tutorial as open
        Window.tutorialWindowOpen = true;
        
        // Store scene reference
        this.scene = scene;
        
        // Initialize arrays to track active animations
        this.activeTimers = [];
        this.activeTweens = [];
    }
    
    close() {
        // Mark tutorial as closed
        Window.tutorialWindowOpen = false;
        
        // Cancel all active timers
        if (this.activeTimers) {
            this.activeTimers.forEach(timer => {
                if (timer && !timer.hasDispatched) {
                    timer.remove();
                }
            });
            this.activeTimers = [];
        }
        
        // Stop all active tweens
        if (this.activeTweens) {
            this.activeTweens.forEach(tween => {
                if (tween && tween.isPlaying()) {
                    tween.stop();
                }
            });
            this.activeTweens = [];
        }
        
        // Mark as destroyed to prevent further animations
        this._destroyed = true;
        
        // Destroy the tutorial
        this.destroy();
    }
    
    AddSwipeGesture() {
        // Create the pointer sprite
        const centerX = this.scene.cameras.main.width / 2 + 110;
        const centerY = this.scene.cameras.main.height / 2 - 250;
        
        this.swipePointer = this.scene.add.image(centerX, centerY , 'atlas_03', 'pointer_up.png');
        this.swipePointer.setAlpha(0);
        this.swipePointer.setScale(1.0);
        this.add(this.swipePointer);
        
        // Store the starting position
        const startX = centerX;
        
        // Create the animation sequence
        const animateSwipe = () => {
            // Check if tutorial is destroyed
            if (this._destroyed) return;
            
            // Reset position
            this.swipePointer.x = startX;
            
            // Step 1: Fade in with pointer_up
            const fadeInTween = this.scene.tweens.add({
                targets: this.swipePointer,
                alpha: 1,
                duration: 300,
                onComplete: () => {
                    if (this._destroyed) return;
                    
                    // Step 2: Show pointer_up for 0.5 seconds
                    const timer1 = this.scene.time.delayedCall(500, () => {
                        if (this._destroyed) return;
                        
                        // Step 3: Switch to pointer_down
                        this.swipePointer.setTexture('atlas_03', 'pointer_down.png');
                        
                        // Step 4: Stay on pointer_down for 0.75 seconds
                        const timer2 = this.scene.time.delayedCall(750, () => {
                            if (this._destroyed) return;
                            
                            // Step 5: Switch to pointer_clean
                            this.swipePointer.setTexture('atlas_03', 'pointer_clean.png');
                            
                            // Step 6: Drag right 200 pixels over 1.5 seconds
                            const dragTween = this.scene.tweens.add({
                                targets: this.swipePointer,
                                x: startX + 200,
                                duration: 1500,
                                ease: 'Power2',
                                onComplete: () => {
                                    if (this._destroyed) return;
                                    
                                    // Step 7: Switch to pointer_up
                                    this.swipePointer.setTexture('atlas_03', 'pointer_up.png');
                                    
                                    // Step 8: Stay for 1 second
                                    const timer3 = this.scene.time.delayedCall(1000, () => {
                                        if (this._destroyed) return;
                                        
                                        // Step 9: Fade out
                                        const fadeOutTween = this.scene.tweens.add({
                                            targets: this.swipePointer,
                                            alpha: 0,
                                            duration: 300,
                                            onComplete: () => {
                                                if (this._destroyed) return;
                                                
                                                // Step 10: Wait 0.5 seconds and restart
                                                const timer4 = this.scene.time.delayedCall(500, () => {
                                                    // Only restart if the tutorial is still active
                                                    if (!this._destroyed) {
                                                        animateSwipe();
                                                    }
                                                });
                                                this.activeTimers.push(timer4);
                                            }
                                        });
                                        this.activeTweens.push(fadeOutTween);
                                    });
                                    this.activeTimers.push(timer3);
                                }
                            });
                            this.activeTweens.push(dragTween);
                        });
                        this.activeTimers.push(timer2);
                    });
                    this.activeTimers.push(timer1);
                }
            });
            this.activeTweens.push(fadeInTween);
        };
        
        // Start the animation
        animateSwipe();
    }
}
