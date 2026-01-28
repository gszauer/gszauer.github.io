/**
 * CardVisual.js - Card Visual Component
 * A Phaser container representing a card on screen.
 */

class CardVisual extends Phaser.GameObjects.Container {
    constructor(scene, x, y, cardData, width, height) {
        super(scene, x, y);
        scene.add.existing(this);

        this.cardData = cardData;  // HandCard or PlayedCard
        this.cardWidth = width || LAYOUT.CARD_WIDTH;
        this.cardHeight = height || LAYOUT.CARD_HEIGHT;

        this.showingBack = false;
        this.isHovered = false;
        this.isDragging = false;
        this.originalPosition = { x: x, y: y };

        this.createVisuals();
    }

    createVisuals() {
        const w = this.cardWidth;
        const h = this.cardHeight;

        // Card background
        this.background = this.scene.add.graphics();
        this.drawBackground(COLORS.COMMON);
        this.add(this.background);

        // Card face content (hidden when showing back)
        this.faceContent = this.scene.add.container(0, 0);
        this.add(this.faceContent);

        // Artwork area (placeholder colored rectangle)
        this.artwork = this.scene.add.graphics();
        this.artwork.fillStyle(this.getArtworkColor(), 1);
        this.artwork.fillRoundedRect(-w/2 + 6, -h/2 + 6, w - 12, h * 0.55, 6);
        this.faceContent.add(this.artwork);

        // Name banner - bigger
        const nameY = h * 0.15;
        const bannerHeight = 36;
        this.nameBanner = this.scene.add.graphics();
        this.nameBanner.fillStyle(0x000000, 0.8);
        this.nameBanner.fillRect(-w/2, nameY, w, bannerHeight);
        this.faceContent.add(this.nameBanner);

        // Name text - MUCH BIGGER
        this.nameText = this.scene.add.text(0, nameY + bannerHeight/2, this.getName(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.faceContent.add(this.nameText);

        // Cost badge (top-left) - bigger
        const badgeRadius = Math.max(22, w * 0.16);
        this.costBadge = new PowerBadge(
            this.scene,
            -w/2 + badgeRadius - 4,
            -h/2 + badgeRadius - 4,
            'cost',
            badgeRadius
        );
        this.faceContent.add(this.costBadge);

        // Power badge (top-right) - bigger
        this.powerBadge = new PowerBadge(
            this.scene,
            w/2 - badgeRadius + 4,
            -h/2 + badgeRadius - 4,
            'power',
            badgeRadius
        );
        this.faceContent.add(this.powerBadge);

        // Card back
        this.cardBack = this.scene.add.container(0, 0);
        this.add(this.cardBack);

        const backGraphics = this.scene.add.graphics();
        backGraphics.fillStyle(COLORS.SECONDARY, 1);
        backGraphics.fillRoundedRect(-w/2, -h/2, w, h, 8);
        backGraphics.lineStyle(4, 0x000000, 0.3);
        backGraphics.strokeRoundedRect(-w/2, -h/2, w, h, 8);

        // Pattern on back - scaled for larger cards
        backGraphics.fillStyle(0x000000, 0.15);
        const stripeSpacing = h / 12;
        for (let i = -5; i <= 5; i++) {
            backGraphics.fillRect(-w/2 + 12, i * stripeSpacing, w - 24, stripeSpacing * 0.3);
        }

        this.cardBack.add(backGraphics);
        this.cardBack.setVisible(false);

        // Update display
        this.updateDisplay();
    }

    drawBackground(borderColor) {
        const w = this.cardWidth;
        const h = this.cardHeight;

        this.background.clear();

        // Card shadow
        this.background.fillStyle(0x000000, 0.3);
        this.background.fillRoundedRect(-w/2 + 4, -h/2 + 4, w, h, 8);

        // Card body
        this.background.fillStyle(0x1a1a2e, 1);
        this.background.fillRoundedRect(-w/2, -h/2, w, h, 6);

        // Border
        this.background.lineStyle(3, borderColor, 1);
        this.background.strokeRoundedRect(-w/2, -h/2, w, h, 6);
    }

    getArtworkColor() {
        // Generate color based on card cost for variety
        const cost = this.getCost();
        const colors = [
            0x4ade80, // 0-cost green
            0x60a5fa, // 1-cost blue
            0xa78bfa, // 2-cost purple
            0xf472b6, // 3-cost pink
            0xfb923c, // 4-cost orange
            0xef4444, // 5-cost red
            0xfbbf24  // 6-cost gold
        ];
        return colors[Math.min(cost, colors.length - 1)];
    }

    // ========================================================================
    // DATA ACCESS
    // Handles both HandCard and PlayedCard types
    // ========================================================================

    getName() {
        if (!this.cardData) return '???';
        return this.cardData.getName();
    }

    getCost() {
        if (!this.cardData) return 0;
        // HandCard has getCost(), PlayedCard doesn't
        if (typeof this.cardData.getCost === 'function') {
            return this.cardData.getCost();
        }
        // PlayedCard - get cost from card template
        if (this.cardData.getCard) {
            return this.cardData.getCard().getCost();
        }
        return 0;
    }

    getPower() {
        if (!this.cardData) return 0;
        return this.cardData.getPower();
    }

    getBasePower() {
        if (!this.cardData) return 0;
        return this.cardData.getBasePower();
    }

    // ========================================================================
    // DISPLAY UPDATE
    // ========================================================================

    updateDisplay() {
        if (!this.cardData) return;

        this.costBadge.setValue(this.getCost());
        this.powerBadge.setValue(this.getPower(), this.getBasePower());
        this.nameText.setText(this.getName());
    }

    setCardData(cardData) {
        this.cardData = cardData;
        this.updateDisplay();
    }

    // ========================================================================
    // FACE/BACK
    // ========================================================================

    showFront() {
        this.showingBack = false;
        this.faceContent.setVisible(true);
        this.cardBack.setVisible(false);
    }

    showBack() {
        this.showingBack = true;
        this.faceContent.setVisible(false);
        this.cardBack.setVisible(true);
    }

    isShowingBack() {
        return this.showingBack;
    }

    // ========================================================================
    // FLIP ANIMATION
    // ========================================================================

    flipToFront(onComplete) {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            duration: ANIM.CARD_FLIP / 2,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.showFront();
                this.updateDisplay();
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1,
                    duration: ANIM.CARD_FLIP / 2,
                    ease: 'Quad.easeOut',
                    onComplete: onComplete
                });
            }
        });
    }

    flipToBack(onComplete) {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            duration: ANIM.CARD_FLIP / 2,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.showBack();
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1,
                    duration: ANIM.CARD_FLIP / 2,
                    ease: 'Quad.easeOut',
                    onComplete: onComplete
                });
            }
        });
    }

    // ========================================================================
    // INTERACTION
    // ========================================================================

    enableDrag() {
        const hitArea = new Phaser.Geom.Rectangle(
            -this.cardWidth/2,
            -this.cardHeight/2,
            this.cardWidth,
            this.cardHeight
        );

        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        this.scene.input.setDraggable(this);

        this.on('pointerover', () => {
            if (!this.isDragging) {
                this.isHovered = true;
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
            }
        });

        this.on('pointerout', () => {
            if (!this.isDragging) {
                this.isHovered = false;
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            }
        });
    }

    disableDrag() {
        this.disableInteractive();
    }

    /**
     * Enable click-to-view for board cards (no drag, just click to see details)
     */
    enableClickToView(callback) {
        // Avoid adding duplicate listeners
        if (this.clickToViewEnabled) return;
        this.clickToViewEnabled = true;

        if (!this.input) {
            const hitArea = new Phaser.Geom.Rectangle(
                -this.cardWidth/2,
                -this.cardHeight/2,
                this.cardWidth,
                this.cardHeight
            );
            this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        }

        this.on('pointerdown', (pointer) => {
            if (callback) {
                callback(this);
            }
        });
    }

    /**
     * Get description text for modal display
     */
    getDescription() {
        if (!this.cardData) return '';
        if (typeof this.cardData.getDescription === 'function') {
            return this.cardData.getDescription();
        }
        return '';
    }

    setPlayable(playable) {
        if (playable) {
            this.setAlpha(1);
        } else {
            this.setAlpha(0.5);
        }
    }

    // ========================================================================
    // ANIMATION HELPERS
    // ========================================================================

    moveTo(x, y, duration, onComplete) {
        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            duration: duration || ANIM.CARD_PLAY,
            ease: ANIM.EASE_OUT,
            onComplete: onComplete
        });
    }

    savePosition() {
        this.originalPosition = { x: this.x, y: this.y };
    }

    returnToPosition(duration) {
        this.moveTo(this.originalPosition.x, this.originalPosition.y, duration || 200);
    }

    // ========================================================================
    // VISUAL EFFECTS
    // ========================================================================

    flash(color, duration) {
        const flash = this.scene.add.graphics();
        flash.fillStyle(color || 0xffffff, 0.5);
        flash.fillRoundedRect(
            -this.cardWidth/2,
            -this.cardHeight/2,
            this.cardWidth,
            this.cardHeight,
            6
        );
        this.add(flash);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: duration || 300,
            onComplete: () => flash.destroy()
        });
    }

    shake(intensity, duration) {
        const originalX = this.x;
        intensity = intensity || 5;
        duration = duration || 300;

        this.scene.tweens.add({
            targets: this,
            x: originalX + intensity,
            duration: 50,
            yoyo: true,
            repeat: Math.floor(duration / 100),
            onComplete: () => {
                this.x = originalX;
            }
        });
    }
}
