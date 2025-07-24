class Tutorial extends Phaser.GameObjects.Container {
    constructor(scene, tutorialNumber = 1, text = "", cardSpriteName = null, fontSize = '26px') {
        super(scene, 0, 0);
        
        // Get screen dimensions
        const screenWidth = scene.cameras.main.width;
        const screenHeight = scene.cameras.main.height;
        
        // Create semi-transparent black background
        this.darkBackground = scene.add.rectangle(
            screenWidth / 2, 
            screenHeight / 2, 
            screenWidth, 
            screenHeight, 
            0x000000, 
            0.85
        );
        this.darkBackground.setInteractive({ useHandCursor: false });
        this.darkBackground.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.flashContinueButton();
        });
        this.darkBackground.on('pointerup', (pointer) => {
            pointer.event.stopPropagation();
        });
        this.darkBackground.on('pointermove', (pointer) => {
            pointer.event.stopPropagation();
        });
        this.add(this.darkBackground);

        if (tutorialNumber < 1) { tutorialNumber = 1;}
        if (tutorialNumber > 4) { tutorialNumber = 4;}
        
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
        else {
            this.cardSprite = null;
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
    
    flashContinueButton() {
        // Don't flash if already flashing or destroyed
        if (this._destroyed || this.isFlashing) return;
        
        console.log('Flashing continue button');
        this.isFlashing = true;
        
        // Store the original background color
        const originalColor = '#4080ff';
        const flashColor = '#40ff40';
        
        // Manual flash sequence
        let flashCount = 0;
        const doFlash = () => {
            if (this._destroyed) {
                this.isFlashing = false;
                return;
            }
            
            // Toggle color
            if (flashCount % 2 === 0) {
                this.continueButton.setBackgroundColor(flashColor);
            } else {
                this.continueButton.setBackgroundColor(originalColor);
            }
            
            flashCount++;
            
            // Continue flashing or stop
            if (flashCount < 4) {
                const timer = this.scene.time.delayedCall(100, doFlash);
                this.activeTimers.push(timer);
            } else {
                this.continueButton.setBackgroundColor(originalColor);
                this.isFlashing = false;
            }
        };
        
        // Start the flash
        doFlash();
    }
    
    AddSwipeGesture() {
        // Create the pointer sprite
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2 - 250;

        this.cardSprite.x = this.scene.cameras.main.width / 2 - 100;

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
    
    AddPointGesture() {
        // Create the hand pointing sprite
        const centerX = this.scene.cameras.main.width / 2;
        const topY = 150; // Position near the top header
        
        this.pointingHand = this.scene.add.image(centerX - 130, topY, 'atlas_03', 'hand_point.png');
        this.pointingHand.setAlpha(0);
        this.pointingHand.setScale(0.5);
        this.add(this.pointingHand);

        this.darkBackground.y = this.scene.cameras.main.height / 2 + 100;
        
        // Store the base Y position
        const baseY = topY;
        
        // Create the bobbing animation
        const animateBob = () => {
            // Check if tutorial is destroyed
            if (this._destroyed) return;
            
            // Fade in the hand
            const fadeInTween = this.scene.tweens.add({
                targets: this.pointingHand,
                alpha: 1,
                duration: 300,
                onComplete: () => {
                    if (this._destroyed) return;
                    
                    // Create continuous bobbing motion
                    const bobTween = this.scene.tweens.add({
                        targets: this.pointingHand,
                        y: baseY - 20, // Bob up 20 pixels
                        duration: 600,
                        ease: 'Sine.easeInOut',
                        yoyo: true,
                        repeat: -1 // Repeat forever
                    });
                    this.activeTweens.push(bobTween);
                }
            });
            this.activeTweens.push(fadeInTween);
        };
        
        // Start the animation
        animateBob();
    }
    
    AddMonsterKillAnimation() {
        // Create a container for both the hand and card
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2 - 150;

        this.cardSprite.x = centerX + 100;
        
        this.monsterKillContainer = this.scene.add.container(centerX, centerY);
        this.add(this.monsterKillContainer);
        
        // Create the hero card sprite
        this.heroCard = this.scene.add.image(0, 0, 'atlas_02', 'char_hero.png');
        this.heroCard.setScale(1.8);
        this.monsterKillContainer.add(this.heroCard);
        
        // Create the pointer sprite on top of the card
        this.killPointer = this.scene.add.image(50, -150, 'atlas_03', 'pointer_up.png');
        this.killPointer.setScale(1.0);
        this.monsterKillContainer.add(this.killPointer);
        
        // Start with container invisible
        this.monsterKillContainer.setAlpha(0);
        
        // Store the starting position
        const startX = centerX - 200;
        
        // Create the animation sequence
        const animateKill = () => {
            // Check if tutorial is destroyed
            if (this._destroyed) return;
            
            // Reset position
            this.monsterKillContainer.x = startX;
            
            // Step 1: Fade in with pointer_up
            const fadeInTween = this.scene.tweens.add({
                targets: this.monsterKillContainer,
                alpha: 1,
                duration: 300,
                onComplete: () => {
                    if (this._destroyed) return;
                    
                    // Step 2: Show pointer_up for 0.3 seconds
                    const timer1 = this.scene.time.delayedCall(300, () => {
                        if (this._destroyed) return;
                        
                        // Step 3: Switch to pointer_down
                        this.killPointer.setTexture('atlas_03', 'pointer_down.png');
                        
                        // Step 4: Stay on pointer_down for 0.75 seconds
                        const timer2 = this.scene.time.delayedCall(750, () => {
                            if (this._destroyed) return;
                            
                            // Step 5: Switch to pointer_clean
                            this.killPointer.setTexture('atlas_03', 'pointer_clean.png');
                            
                            // Step 6: Drag right 100 pixels over 1.0 seconds
                            const dragTween = this.scene.tweens.add({
                                targets: this.monsterKillContainer,
                                x: startX + 250,
                                duration: 1000,
                                ease: 'Power2',
                                onComplete: () => {
                                    if (this._destroyed) return;
                                    
                                    // Step 7: Switch to pointer_up
                                    this.killPointer.setTexture('atlas_03', 'pointer_up.png');
                                    
                                    // Step 8: Stay for 1 second
                                    const timer3 = this.scene.time.delayedCall(1000, () => {
                                        if (this._destroyed) return;
                                        
                                        // Step 9: Fade out
                                        const fadeOutTween = this.scene.tweens.add({
                                            targets: this.monsterKillContainer,
                                            alpha: 0,
                                            duration: 300,
                                            onComplete: () => {
                                                if (this._destroyed) return;
                                                
                                                // Step 10: Wait 0.5 seconds and restart
                                                const timer4 = this.scene.time.delayedCall(500, () => {
                                                    // Only restart if the tutorial is still active
                                                    if (!this._destroyed) {
                                                        animateKill();
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
        animateKill();
    }
    
    ShowSpikeAnimation() {
        // Only animate if we have a card sprite
        if (!this.cardSprite) return;
        
        // Store the current texture
        let isSpikesUp = true;
        
        // Create the spike animation
        const animateSpikes = () => {
            // Check if tutorial is destroyed
            if (this._destroyed) return;
            
            // Toggle between trap sprites
            if (isSpikesUp) {
                this.cardSprite.setTexture('atlas_02', 'char_trap_a.png');
            } else {
                this.cardSprite.setTexture('atlas_02', 'char_trap_b.png');
            }
            isSpikesUp = !isSpikesUp;
            
            // Schedule next toggle
            const timer = this.scene.time.delayedCall(700, () => {
                if (!this._destroyed) {
                    animateSpikes();
                }
            });
            this.activeTimers.push(timer);
        };
        
        // Start the animation
        animateSpikes();
    }
    
    ShowArrowShooting() {
        // Create a container for the hero card, arrow and hand
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2 - 150;

        this.cardSprite.x = centerX + 100;
        
        this.arrowShootContainer = this.scene.add.container(centerX, centerY);
        this.add(this.arrowShootContainer);
        
        // Create the hero card sprite
        this.heroCard = this.scene.add.image(0, 0, 'atlas_02', 'char_hero.png');
        this.heroCard.setScale(1.8);
        this.arrowShootContainer.add(this.heroCard);
        
        // Create the arrow sprite (initially hidden)
        this.arrow = this.scene.add.image(0, 0, 'atlas_02', 'projectile_up.png');
        this.arrow.setRotation(Phaser.Math.DegToRad(90)); // Rotate 90 degrees to face right
        this.arrow.setScale(2.0);
        this.arrow.setAlpha(0);
        this.arrow.setVisible(false);
        this.add(this.arrow); // Add to main container, not the moving container
        
        // Create the pointer sprite on top of the card
        this.shootPointer = this.scene.add.image(50, -150, 'atlas_03', 'pointer_up.png');
        this.shootPointer.setScale(1.0);
        this.arrowShootContainer.add(this.shootPointer);
        
        // Start with container invisible
        this.arrowShootContainer.setAlpha(0);
        
        // Store the starting position
        const startX = centerX - 200;
        
        // Create the animation sequence
        const animateShoot = () => {
            // Check if tutorial is destroyed
            if (this._destroyed) return;
            
            // Reset positions
            this.arrowShootContainer.x = startX;
            this.arrow.setAlpha(0);
            this.arrow.setVisible(false);
            
            // Step 1: Fade in with pointer_up
            const fadeInTween = this.scene.tweens.add({
                targets: this.arrowShootContainer,
                alpha: 1,
                duration: 300,
                onComplete: () => {
                    if (this._destroyed) return;
                    
                    // Step 2: Show pointer_up for 0.3 seconds
                    const timer1 = this.scene.time.delayedCall(150, () => {
                        if (this._destroyed) return;
                        
                        // Step 3: Switch to pointer_down
                        this.shootPointer.setTexture('atlas_03', 'pointer_down.png');
                        
                        // Step 4: Stay on pointer_down for 0.75 seconds
                        const timer2 = this.scene.time.delayedCall(400, () => {
                            if (this._destroyed) return;
                            
                            // Step 5: Switch to pointer_clean
                            this.shootPointer.setTexture('atlas_03', 'pointer_clean.png');
                            
                            // Step 6: Drag right 250 pixels over 1.0 seconds
                            const dragTween = this.scene.tweens.add({
                                targets: this.arrowShootContainer,
                                x: startX + 250,
                                duration: 700,
                                ease: 'Power2',
                                onComplete: () => {
                                    if (this._destroyed) return;
                                    
                                    // Position arrow at the card's location
                                    this.arrow.x = this.arrowShootContainer.x;
                                    this.arrow.y = this.arrowShootContainer.y;
                                    this.arrow.setAlpha(1);
                                    this.arrow.setVisible(true);
                                    
                                    // Shoot the arrow off screen to the right
                                    const arrowTween = this.scene.tweens.add({
                                        targets: this.arrow,
                                        x: this.scene.cameras.main.width + 200,
                                        duration: 800,
                                        ease: 'Power1'
                                    });
                                    // Step 7: Switch to pointer_up
                                    this.shootPointer.setTexture('atlas_03', 'pointer_up.png');
                                    
                                    // Step 8: Fade out
                                    const fadeOutTween = this.scene.tweens.add({
                                        targets: this.arrowShootContainer,
                                        alpha: 0,
                                        duration: 300,
                                        onComplete: () => {
                                            if (this._destroyed) return;
                                            
                                            // Step 10: Wait 0.5 seconds and restart
                                            const timer4 = this.scene.time.delayedCall(500, () => {
                                                // Only restart if the tutorial is still active
                                                if (!this._destroyed) {
                                                    animateShoot();
                                                }
                                            });
                                            this.activeTimers.push(timer4);
                                        }
                                    });
                                    this.activeTweens.push(fadeOutTween);
                                    
                                    this.activeTweens.push(arrowTween);
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
        animateShoot();
    }
}
