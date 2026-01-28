/**
 * HandVisual.js - Hand Fan Layout Component
 * Displays player's hand cards in a fan arrangement.
 */

class HandVisual extends Phaser.GameObjects.Container {
    constructor(scene, x, y, hand) {
        super(scene, x, y);
        scene.add.existing(this);

        this.hand = hand;
        this.cardVisuals = [];
        this.excludedCards = [];  // Cards that are planned but not yet played

        // Callbacks
        this.onCardDragStart = null;
        this.onCardDragEnd = null;
        this.onCardClicked = null;
    }

    /**
     * Set cards to exclude from display (e.g., planned cards)
     */
    setExcludedCards(cards) {
        this.excludedCards = cards || [];
    }

    /**
     * Refresh the hand display
     */
    refresh() {
        // Clear existing visuals
        for (let i = 0; i < this.cardVisuals.length; i++) {
            this.cardVisuals[i].destroy();
        }
        this.cardVisuals = [];

        // Get cards, filtering out any that are planned/excluded
        let cards = this.hand.getCards();
        if (this.excludedCards && this.excludedCards.length > 0) {
            cards = cards.filter(c => this.excludedCards.indexOf(c) === -1);
        }
        if (cards.length === 0) return;

        // Calculate positions
        const positions = this.calculateCardPositions(cards.length);

        // Create card visuals
        for (let i = 0; i < cards.length; i++) {
            const handCard = cards[i];
            const pos = positions[i];

            const cardVisual = new CardVisual(
                this.scene,
                pos.x,
                pos.y,
                handCard,
                LAYOUT.CARD_WIDTH_HAND,
                LAYOUT.CARD_HEIGHT_HAND
            );

            cardVisual.setAngle(pos.angle);
            cardVisual.setDepth(i);
            cardVisual.handCard = handCard;
            cardVisual.handIndex = i;

            // Enable dragging
            cardVisual.enableDrag();
            this.setupCardInteraction(cardVisual);

            this.add(cardVisual);
            this.cardVisuals.push(cardVisual);
        }
    }

    /**
     * Calculate positions for cards - straight line with very minor curve, NO overlap
     */
    calculateCardPositions(count) {
        const positions = [];
        const maxWidth = LAYOUT.HAND_WIDTH;
        const cardWidth = LAYOUT.CARD_WIDTH_HAND;

        // Space cards evenly with small gap between them (no overlap)
        const gap = 10; // Small gap between cards
        const totalWidth = count * cardWidth + (count - 1) * gap;

        // If total width exceeds max, we need to reduce spacing
        let spacing = cardWidth + gap;
        if (totalWidth > maxWidth && count > 1) {
            spacing = (maxWidth - cardWidth) / (count - 1);
        }

        const actualTotalWidth = (count - 1) * spacing + cardWidth;
        const startX = -actualTotalWidth / 2 + cardWidth / 2;

        // Very minor angle - just a subtle curve
        const maxAngle = LAYOUT.HAND_MAX_ANGLE || 3; // degrees

        for (let i = 0; i < count; i++) {
            const x = startX + i * spacing;

            // Very subtle angle based on position from center
            const normalizedPos = count > 1 ? (i - (count - 1) / 2) / ((count - 1) / 2 || 1) : 0;
            const angle = normalizedPos * maxAngle;

            // Very subtle arc - cards at edges slightly lower
            const y = Math.abs(normalizedPos) * 10;

            positions.push({ x, y, angle });
        }

        return positions;
    }

    /**
     * Setup drag interaction for a card
     */
    setupCardInteraction(cardVisual) {
        cardVisual.on('dragstart', (pointer) => {
            cardVisual.isDragging = true;
            cardVisual.savePosition();

            // Bring to front
            this.bringToTop(cardVisual);
            cardVisual.setScale(1.2);
            cardVisual.setAngle(0);

            if (this.onCardDragStart) {
                this.onCardDragStart(cardVisual, cardVisual.handCard);
            }
        });

        cardVisual.on('drag', (pointer, dragX, dragY) => {
            // Convert to local coordinates
            const localPoint = this.getLocalPoint(pointer.x, pointer.y);
            cardVisual.x = localPoint.x;
            cardVisual.y = localPoint.y;
        });

        cardVisual.on('dragend', (pointer) => {
            cardVisual.isDragging = false;

            if (this.onCardDragEnd) {
                const worldPoint = this.getWorldPoint(cardVisual.x, cardVisual.y);
                this.onCardDragEnd(cardVisual, cardVisual.handCard, worldPoint.x, worldPoint.y);
            }
        });

        // Track if this was a drag or just a click
        cardVisual.on('pointerdown', (pointer) => {
            cardVisual.clickStartTime = Date.now();
            cardVisual.clickStartX = pointer.x;
            cardVisual.clickStartY = pointer.y;
        });

        cardVisual.on('pointerup', (pointer) => {
            // Only count as click if it was quick and didn't move much
            const timeDiff = Date.now() - (cardVisual.clickStartTime || 0);
            const distX = Math.abs(pointer.x - (cardVisual.clickStartX || 0));
            const distY = Math.abs(pointer.y - (cardVisual.clickStartY || 0));

            if (timeDiff < 300 && distX < 10 && distY < 10 && !cardVisual.isDragging) {
                if (this.onCardClicked) {
                    this.onCardClicked(cardVisual, cardVisual.handCard);
                }
            }
        });
    }

    /**
     * Convert world coordinates to local container coordinates
     */
    getLocalPoint(worldX, worldY) {
        const matrix = this.getWorldTransformMatrix();
        const inverse = matrix.invert();
        const point = inverse.transformPoint(worldX, worldY);
        return { x: point.x, y: point.y };
    }

    /**
     * Convert local coordinates to world coordinates
     */
    getWorldPoint(localX, localY) {
        const matrix = this.getWorldTransformMatrix();
        const point = matrix.transformPoint(localX, localY);
        return { x: point.x, y: point.y };
    }

    /**
     * Highlight playable cards based on energy
     */
    highlightPlayable(energy) {
        for (let i = 0; i < this.cardVisuals.length; i++) {
            const cv = this.cardVisuals[i];
            const playable = cv.handCard.getCost() <= energy;
            cv.setPlayable(playable);
        }
    }

    /**
     * Return a card to its position in hand
     */
    returnCard(cardVisual) {
        const positions = this.calculateCardPositions(this.cardVisuals.length);
        const pos = positions[cardVisual.handIndex];

        this.scene.tweens.add({
            targets: cardVisual,
            x: pos.x,
            y: pos.y,
            angle: pos.angle,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Quad.easeOut'
        });
    }

    /**
     * Remove a card from hand display
     */
    removeCard(handCard) {
        for (let i = 0; i < this.cardVisuals.length; i++) {
            if (this.cardVisuals[i].handCard === handCard) {
                const cv = this.cardVisuals[i];
                this.cardVisuals.splice(i, 1);
                return cv;
            }
        }
        return null;
    }

    /**
     * Get card visual for a hand card
     */
    getCardVisual(handCard) {
        for (let i = 0; i < this.cardVisuals.length; i++) {
            if (this.cardVisuals[i].handCard === handCard) {
                return this.cardVisuals[i];
            }
        }
        return null;
    }

    /**
     * Disable all card interactions
     */
    disableInteraction() {
        for (let i = 0; i < this.cardVisuals.length; i++) {
            this.cardVisuals[i].disableDrag();
        }
    }

    /**
     * Enable all card interactions
     */
    enableInteraction() {
        for (let i = 0; i < this.cardVisuals.length; i++) {
            this.cardVisuals[i].enableDrag();
        }
    }
}
