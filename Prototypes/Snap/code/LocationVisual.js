/**
 * LocationVisual.js - Location Visual Component
 * Displays a location with card slots for both players.
 */

class LocationVisual extends Phaser.GameObjects.Container {
    constructor(scene, x, y, location) {
        super(scene, x, y);
        scene.add.existing(this);

        this.location = location;
        this.cardVisuals = { player: [], enemy: [] };

        this.createVisuals();
    }

    createVisuals() {
        const w = LAYOUT.LOCATION_WIDTH;
        const h = LAYOUT.LOCATION_HEIGHT;

        // Draw card slot outlines FIRST (behind everything)
        this.drawCardSlotOutlines();

        // Location card background
        this.background = this.scene.add.graphics();
        this.add(this.background);

        // Location card content
        this.locationContent = this.scene.add.container(0, 0);
        this.add(this.locationContent);

        // Artwork area
        this.artwork = this.scene.add.graphics();
        this.locationContent.add(this.artwork);

        // Name text - BIGGER FONT
        this.nameText = this.scene.add.text(0, -h/2 + 25, '???', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.locationContent.add(this.nameText);

        // Description text - BIGGER FONT
        this.descText = this.scene.add.text(0, 15, '', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#cccccc',
            wordWrap: { width: w - 30 },
            align: 'center'
        }).setOrigin(0.5);
        this.locationContent.add(this.descText);

        // Location back (unrevealed)
        this.locationBack = this.scene.add.container(0, 0);
        const backGraphics = this.scene.add.graphics();
        backGraphics.fillStyle(0x2d2d44, 1);
        backGraphics.fillRoundedRect(-w/2, -h/2, w, h, 8);
        backGraphics.lineStyle(3, COLORS.SECONDARY, 1);
        backGraphics.strokeRoundedRect(-w/2, -h/2, w, h, 8);

        // Question mark
        const questionMark = this.scene.add.text(0, 0, '?', {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#8b5cf6'
        }).setOrigin(0.5);
        this.locationBack.add(backGraphics);
        this.locationBack.add(questionMark);
        this.add(this.locationBack);

        // Power badges
        this.enemyPowerBadge = new PowerBadge(
            this.scene,
            LAYOUT.LOCATION_POWER_OFFSET_X,
            LAYOUT.ENEMY_POWER_OFFSET_Y,
            'location',
            LAYOUT.BADGE_RADIUS + 4
        );
        this.add(this.enemyPowerBadge);

        this.playerPowerBadge = new PowerBadge(
            this.scene,
            LAYOUT.LOCATION_POWER_OFFSET_X,
            LAYOUT.PLAYER_POWER_OFFSET_Y,
            'location',
            LAYOUT.BADGE_RADIUS + 4
        );
        this.add(this.playerPowerBadge);

        // Card slot containers (cards go in these)
        this.enemyCardSlots = this.scene.add.container(0, LAYOUT.ENEMY_CARDS_Y_OFFSET);
        this.playerCardSlots = this.scene.add.container(0, LAYOUT.PLAYER_CARDS_Y_OFFSET);
        this.add(this.enemyCardSlots);
        this.add(this.playerCardSlots);

        // Initialize as unrevealed
        this.locationContent.setVisible(false);
        this.locationBack.setVisible(true);

        this.drawBackground(false);
        this.updatePower(0, 0);

        // Create hit area for location card click
        this.setupClickHandler();

        // Container for blocked slot indicators
        this.blockedIndicators = this.scene.add.container(0, 0);
        this.add(this.blockedIndicators);
    }

    /**
     * Setup click handler for the location card
     */
    setupClickHandler() {
        const w = LAYOUT.LOCATION_WIDTH;
        const h = LAYOUT.LOCATION_HEIGHT;

        // Create invisible hit area over the location card
        this.hitArea = this.scene.add.rectangle(0, 0, w, h, 0x000000, 0);
        this.hitArea.setInteractive({ useHandCursor: true });
        this.add(this.hitArea);

        this.hitArea.on('pointerdown', () => {
            if (this.onLocationClicked) {
                this.onLocationClicked(this.location);
            }
        });
    }

    /**
     * Update blocked slot indicators based on location restrictions
     */
    updateBlockedIndicators(player, game) {
        // Clear existing indicators
        this.blockedIndicators.removeAll(true);

        if (!this.location || !this.location.isRevealed()) return;

        // Check if location blocks card plays
        const canPlay = this.location.canPlayCard(null, player, game);
        if (canPlay) return;

        // Draw X on player slots
        const cardW = LAYOUT.CARD_WIDTH_BOARD;
        const cardH = LAYOUT.CARD_HEIGHT_BOARD;
        const xSpacing = LAYOUT.CARD_SLOT_SPACING_X;
        const ySpacing = LAYOUT.CARD_SLOT_SPACING_Y;

        for (let slot = 0; slot < 4; slot++) {
            const col = slot % 2;
            const row = Math.floor(slot / 2);
            const x = (col - 0.5) * xSpacing;
            const y = LAYOUT.PLAYER_CARDS_Y_OFFSET + (row - 0.5) * ySpacing;

            // Draw X indicator
            const xSize = 30;
            const xGraphics = this.scene.add.graphics();
            xGraphics.lineStyle(4, 0xff4444, 0.8);
            xGraphics.lineBetween(x - xSize/2, y - xSize/2, x + xSize/2, y + xSize/2);
            xGraphics.lineBetween(x + xSize/2, y - xSize/2, x - xSize/2, y + xSize/2);
            this.blockedIndicators.add(xGraphics);
        }
    }

    drawBackground(revealed) {
        const w = LAYOUT.LOCATION_WIDTH;
        const h = LAYOUT.LOCATION_HEIGHT;

        this.background.clear();

        // Shadow
        this.background.fillStyle(0x000000, 0.3);
        this.background.fillRoundedRect(-w/2 + 4, -h/2 + 4, w, h, 8);

        // Background
        if (revealed) {
            this.background.fillStyle(0x1e3a5f, 1);
        } else {
            this.background.fillStyle(0x2d2d44, 1);
        }
        this.background.fillRoundedRect(-w/2, -h/2, w, h, 8);

        // Border
        this.background.lineStyle(3, revealed ? COLORS.PRIMARY : COLORS.SECONDARY, 1);
        this.background.strokeRoundedRect(-w/2, -h/2, w, h, 8);

        // Draw artwork if revealed
        if (revealed) {
            this.artwork.clear();
            this.artwork.fillStyle(this.getLocationColor(), 0.3);
            this.artwork.fillRoundedRect(-w/2 + 5, -h/2 + 35, w - 10, h - 45, 4);
        }
    }

    getLocationColor() {
        // Generate color based on location name hash
        if (!this.location) return COLORS.PRIMARY;
        const name = this.location.getName();
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [0x4ade80, 0x60a5fa, 0xa78bfa, 0xf472b6, 0xfb923c, 0xef4444];
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Draw card slot outlines showing where cards can be placed
     * 2x2 grid above (enemy) and below (player) the location
     */
    drawCardSlotOutlines() {
        this.slotOutlines = this.scene.add.graphics();
        this.add(this.slotOutlines);
        this.sendToBack(this.slotOutlines);

        const cardW = LAYOUT.CARD_WIDTH_BOARD;
        const cardH = LAYOUT.CARD_HEIGHT_BOARD;
        const xSpacing = LAYOUT.CARD_SLOT_SPACING_X;
        const ySpacing = LAYOUT.CARD_SLOT_SPACING_Y;

        // Style for slot outlines - subtle dashed appearance
        this.slotOutlines.lineStyle(2, 0x3a4a5a, 0.5);

        // Draw 4 slots for enemy (above location)
        for (let slot = 0; slot < 4; slot++) {
            const col = slot % 2;
            const row = Math.floor(slot / 2);
            const x = (col - 0.5) * xSpacing;
            const y = LAYOUT.ENEMY_CARDS_Y_OFFSET + (row - 0.5) * ySpacing * -1;

            this.slotOutlines.strokeRoundedRect(
                x - cardW / 2,
                y - cardH / 2,
                cardW,
                cardH,
                6
            );
        }

        // Draw 4 slots for player (below location)
        for (let slot = 0; slot < 4; slot++) {
            const col = slot % 2;
            const row = Math.floor(slot / 2);
            const x = (col - 0.5) * xSpacing;
            const y = LAYOUT.PLAYER_CARDS_Y_OFFSET + (row - 0.5) * ySpacing;

            this.slotOutlines.strokeRoundedRect(
                x - cardW / 2,
                y - cardH / 2,
                cardW,
                cardH,
                6
            );
        }
    }

    // ========================================================================
    // REVEAL
    // ========================================================================

    reveal() {
        // Only flip the location card elements, NOT the power badges or slot outlines
        const flipTargets = [this.background, this.locationContent, this.locationBack];

        // Flip animation
        this.scene.tweens.add({
            targets: flipTargets,
            scaleX: 0,
            duration: ANIM.LOCATION_REVEAL / 2,
            ease: 'Quad.easeIn',
            onComplete: () => {
                // Switch visuals
                this.locationBack.setVisible(false);
                this.locationContent.setVisible(true);

                // Update content
                if (this.location) {
                    this.nameText.setText(this.location.getName());
                    this.descText.setText(this.location.getDescription());
                }

                this.drawBackground(true);

                // Flip back
                this.scene.tweens.add({
                    targets: flipTargets,
                    scaleX: 1,
                    duration: ANIM.LOCATION_REVEAL / 2,
                    ease: 'Quad.easeOut'
                });
            }
        });
    }

    // ========================================================================
    // POWER UPDATES
    // ========================================================================

    updatePower(playerPower, enemyPower) {
        this.playerPowerBadge.setValue(playerPower);
        this.enemyPowerBadge.setValue(enemyPower);

        // Check if location reverses win condition (like Bar With No Name)
        const lowestWins = this.location && this.location.lowestPowerWins && this.location.lowestPowerWins();

        // Update winning state
        let playerWinning = false;
        let enemyWinning = false;

        if (lowestWins) {
            // Lowest power wins
            if (playerPower < enemyPower) {
                playerWinning = true;
            } else if (enemyPower < playerPower) {
                enemyWinning = true;
            }
        } else {
            // Normal: highest power wins
            if (playerPower > enemyPower) {
                playerWinning = true;
            } else if (enemyPower > playerPower) {
                enemyWinning = true;
            }
        }

        this.playerPowerBadge.setWinning(playerWinning);
        this.enemyPowerBadge.setWinning(enemyWinning);
    }

    // ========================================================================
    // CARD MANAGEMENT
    // ========================================================================

    /**
     * Add a card visual to a slot
     */
    addCardVisual(cardVisual, isPlayer) {
        const container = isPlayer ? this.playerCardSlots : this.enemyCardSlots;
        const visuals = isPlayer ? this.cardVisuals.player : this.cardVisuals.enemy;

        const slotIndex = visuals.length;
        visuals.push(cardVisual);

        // Calculate position in 2x2 grid
        const pos = this.getSlotPosition(slotIndex, isPlayer);

        // Set card's local position within the container
        cardVisual.setPosition(pos.x, pos.y);

        // Scale down for board
        const scale = LAYOUT.CARD_WIDTH_BOARD / LAYOUT.CARD_WIDTH;
        cardVisual.setScale(scale);

        container.add(cardVisual);
    }

    /**
     * Get position for a slot index (0-3)
     */
    getSlotPosition(index, isPlayer) {
        const col = index % 2;
        const row = Math.floor(index / 2);

        const xSpacing = LAYOUT.CARD_SLOT_SPACING_X;
        const ySpacing = LAYOUT.CARD_SLOT_SPACING_Y;

        const x = (col - 0.5) * xSpacing;
        const y = (row - 0.5) * ySpacing * (isPlayer ? 1 : -1);

        return { x, y };
    }

    /**
     * Get world position for a slot
     */
    getSlotWorldPosition(index, isPlayer) {
        const container = isPlayer ? this.playerCardSlots : this.enemyCardSlots;
        const localPos = this.getSlotPosition(index, isPlayer);

        // Get world position
        const worldX = this.x + container.x + localPos.x;
        const worldY = this.y + container.y + localPos.y;

        return { x: worldX, y: worldY };
    }

    /**
     * Get next available slot index
     */
    getNextSlotIndex(isPlayer) {
        const visuals = isPlayer ? this.cardVisuals.player : this.cardVisuals.enemy;
        return visuals.length;
    }

    /**
     * Check if location has space
     */
    hasSpace(isPlayer) {
        const visuals = isPlayer ? this.cardVisuals.player : this.cardVisuals.enemy;
        const maxCards = this.location && this.location.getMaxCards
            ? this.location.getMaxCards()
            : RULES.CARDS_PER_LOCATION;
        return visuals.length < maxCards;
    }

    /**
     * Get card visual at slot
     */
    getCardVisual(index, isPlayer) {
        const visuals = isPlayer ? this.cardVisuals.player : this.cardVisuals.enemy;
        return visuals[index] || null;
    }

    /**
     * Remove card visual
     */
    removeCardVisual(cardVisual, isPlayer) {
        const visuals = isPlayer ? this.cardVisuals.player : this.cardVisuals.enemy;
        const index = visuals.indexOf(cardVisual);
        if (index > -1) {
            visuals.splice(index, 1);
        }

        const container = isPlayer ? this.playerCardSlots : this.enemyCardSlots;
        container.remove(cardVisual);
    }

    // ========================================================================
    // HIT TESTING
    // ========================================================================

    /**
     * Check if a point is within this location's drop zone
     */
    containsPoint(x, y) {
        const w = LAYOUT.LOCATION_WIDTH;
        // Extended height to cover all card slots (slots can be up to ~460px from center)
        const h = 1000;

        const localX = x - this.x;
        const localY = y - this.y;

        return localX >= -w/2 && localX <= w/2 &&
               localY >= -h/2 && localY <= h/2;
    }

    // ========================================================================
    // HIGHLIGHT
    // ========================================================================

    /**
     * Set highlight state for drop target feedback
     */
    setHighlight(highlight) {
        if (highlight) {
            // Create highlight overlay if it doesn't exist
            if (!this.highlightOverlay) {
                const w = LAYOUT.LOCATION_WIDTH;
                const h = LAYOUT.LOCATION_HEIGHT;
                this.highlightOverlay = this.scene.add.graphics();
                this.highlightOverlay.fillStyle(0x88ff88, 0.3);
                this.highlightOverlay.fillRoundedRect(-w/2, -h/2, w, h, 8);
                this.highlightOverlay.lineStyle(3, 0x88ff88, 1);
                this.highlightOverlay.strokeRoundedRect(-w/2, -h/2, w, h, 8);
                this.add(this.highlightOverlay);
            }
            this.highlightOverlay.setVisible(true);
        } else {
            if (this.highlightOverlay) {
                this.highlightOverlay.setVisible(false);
            }
        }
    }
}
