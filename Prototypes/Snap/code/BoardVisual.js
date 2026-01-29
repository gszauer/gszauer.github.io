/**
 * BoardVisual.js - Board Layout Manager
 * Coordinates the 3 location visuals and handles drop targets.
 */

class BoardVisual extends Phaser.GameObjects.Container {
    constructor(scene, x, y, gameState) {
        super(scene, x, y);
        scene.add.existing(this);

        this.gameState = gameState;
        this.locationVisuals = [];

        this.createBoard();
    }

    createBoard() {
        // Create 3 location visuals
        for (let i = 0; i < RULES.NUM_LOCATIONS; i++) {
            const xPos = (i - 1) * LAYOUT.LOCATION_SPACING;
            const location = this.gameState.locations[i];

            const lv = new LocationVisual(this.scene, xPos, 0, location);
            location.visual = lv;

            this.locationVisuals.push(lv);
            this.add(lv);
        }
    }

    /**
     * Get location visual by index
     */
    getLocationVisual(index) {
        return this.locationVisuals[index];
    }

    /**
     * Get all location visuals
     */
    getLocationVisuals() {
        return this.locationVisuals;
    }

    /**
     * Update all location power displays
     */
    updateAllPowers() {
        const player = this.gameState.players[0];
        const enemy = this.gameState.players[1];

        for (let i = 0; i < this.locationVisuals.length; i++) {
            const location = this.gameState.locations[i];
            const playerPower = location.getPower(player, this.gameState);
            const enemyPower = location.getPower(enemy, this.gameState);

            this.locationVisuals[i].updatePower(playerPower, enemyPower);
        }
    }

    /**
     * Find drop target location for a point
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {Object|null} { location, locationVisual, isPlayer }
     */
    getDropTarget(worldX, worldY) {
        // Convert to local coordinates
        const localPoint = this.getLocalPoint(worldX, worldY);

        for (let i = 0; i < this.locationVisuals.length; i++) {
            const lv = this.locationVisuals[i];
            const location = this.gameState.locations[i];

            // Check if point is within this location's area
            if (lv.containsPoint(localPoint.x, localPoint.y)) {
                // Determine if it's the player's side (bottom) or enemy's side (top)
                const relativeY = localPoint.y - lv.y;
                const isPlayer = relativeY > 0;

                return {
                    location: location,
                    locationVisual: lv,
                    isPlayer: isPlayer
                };
            }
        }

        return null;
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
     * Highlight a location as valid drop target
     */
    highlightLocation(index, highlight) {
        const lv = this.locationVisuals[index];
        if (lv.setHighlight) {
            lv.setHighlight(highlight);
        }
    }

    /**
     * Clear all location highlights
     */
    clearHighlights() {
        for (let i = 0; i < this.locationVisuals.length; i++) {
            const lv = this.locationVisuals[i];
            if (lv.setHighlight) {
                lv.setHighlight(false);
            }
        }
    }

    /**
     * Add a card visual to a location
     */
    addCardToLocation(cardVisual, locationIndex, isPlayer) {
        const lv = this.locationVisuals[locationIndex];
        lv.addCardVisual(cardVisual, isPlayer);
    }

    /**
     * Get position for next card slot at location (in parent container coordinates)
     */
    getNextSlotPosition(locationIndex, isPlayer) {
        const lv = this.locationVisuals[locationIndex];
        const slotIndex = lv.getNextSlotIndex(isPlayer);

        // Get local position in location visual
        const localPos = lv.getSlotPosition(slotIndex, isPlayer);

        // Get container for the slot
        const containerOffset = isPlayer
            ? LAYOUT.PLAYER_CARDS_Y_OFFSET
            : LAYOUT.ENEMY_CARDS_Y_OFFSET;

        // Calculate position relative to BoardVisual's parent (rootContainer)
        const x = this.x + lv.x + localPos.x;
        const y = this.y + lv.y + containerOffset + localPos.y;

        return { x: x, y: y };
    }

    /**
     * Check if location has space
     */
    locationHasSpace(locationIndex, isPlayer) {
        const lv = this.locationVisuals[locationIndex];
        return lv.hasSpace(isPlayer);
    }
}
