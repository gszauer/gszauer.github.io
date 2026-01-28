/**
 * Player.js - Player State
 * Manages player's deck, hand, energy, and game state.
 */

class Player {
    constructor(id, deck, isAI) {
        this.id = id;
        this.deck = deck;
        this.hand = new Hand(RULES.MAX_HAND_SIZE);
        this.isAI = isAI || false;

        // Energy
        this.energy = 0;
        this.maxEnergy = 0;
        this.bonusEnergy = 0;

        // Snap state
        this.snapped = false;
        this.retreated = false;

        // Statistics
        this.totalCardsPlayed = 0;
        this.totalCardsDestroyed = 0;
        this.moveCount = 0;
    }

    // ========================================================================
    // DRAWING
    // ========================================================================

    /**
     * Draw a card from deck to hand
     * @returns {HandCard|null} The drawn card, or null if deck empty or hand full
     */
    drawCard() {
        if (this.hand.isFull()) {
            return null;
        }

        const handCard = this.deck.draw();
        if (handCard) {
            this.hand.addCard(handCard);
        }
        return handCard;
    }

    /**
     * Draw initial hand (includes starting hand cards like Quicksilver)
     */
    drawInitialHand() {
        // First, get any cards that start in hand
        const startingCards = this.deck.getStartingHandCards();
        for (let i = 0; i < startingCards.length; i++) {
            this.hand.addCard(startingCards[i]);
        }

        // Then draw up to starting hand size
        const cardsNeeded = RULES.STARTING_HAND - this.hand.getCount();
        for (let i = 0; i < cardsNeeded; i++) {
            this.drawCard();
        }
    }

    // ========================================================================
    // ENERGY
    // ========================================================================

    /**
     * Set energy for turn start
     */
    setEnergyForTurn(turnNumber) {
        this.maxEnergy = turnNumber;
        this.energy = turnNumber + this.bonusEnergy;
        this.bonusEnergy = 0;
    }

    /**
     * Spend energy to play a card
     * @returns {boolean} True if energy was spent
     */
    spendEnergy(amount) {
        if (amount > this.energy) {
            return false;
        }
        this.energy -= amount;
        return true;
    }

    /**
     * Add bonus energy for next turn
     */
    addBonusEnergy(amount) {
        this.bonusEnergy += amount;
    }

    /**
     * Get current energy
     */
    getEnergy() {
        return this.energy;
    }

    /**
     * Refund energy (for undoing plays during planning)
     */
    refundEnergy(amount) {
        this.energy += amount;
    }

    // ========================================================================
    // HAND ACCESS
    // ========================================================================

    getHand() {
        return this.hand;
    }

    getHandCards() {
        return this.hand.getCards();
    }

    getPlayableCards() {
        return this.hand.getPlayableCards(this.energy);
    }

    // ========================================================================
    // SNAP/RETREAT
    // ========================================================================

    snap() {
        this.snapped = true;
    }

    hasSnapped() {
        return this.snapped;
    }

    retreat() {
        this.retreated = true;
    }

    hasRetreated() {
        return this.retreated;
    }

    // ========================================================================
    // POWER CALCULATION
    // ========================================================================

    /**
     * Get total power across all locations
     */
    getTotalPower(game) {
        let totalPower = 0;
        for (let i = 0; i < game.locations.length; i++) {
            totalPower += game.locations[i].getPower(this, game);
        }
        return totalPower;
    }

    // ========================================================================
    // STATISTICS
    // ========================================================================

    incrementCardsPlayed() {
        this.totalCardsPlayed++;
    }

    incrementCardsDestroyed() {
        this.totalCardsDestroyed++;
    }

    incrementMoveCount() {
        this.moveCount++;
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================
    serialize() {
        return {
            id: this.id,
            isAI: this.isAI,
            deck: this.deck.serialize(),
            hand: this.hand.serialize(),
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            bonusEnergy: this.bonusEnergy,
            snapped: this.snapped,
            retreated: this.retreated,
            totalCardsPlayed: this.totalCardsPlayed,
            totalCardsDestroyed: this.totalCardsDestroyed,
            moveCount: this.moveCount
        };
    }

    static deserialize(data, cardRegistry) {
        const deck = Deck.deserialize(data.deck, cardRegistry);
        const player = new Player(data.id, deck, data.isAI);
        player.hand = Hand.deserialize(data.hand, cardRegistry);
        player.energy = data.energy;
        player.maxEnergy = data.maxEnergy;
        player.bonusEnergy = data.bonusEnergy;
        player.snapped = data.snapped;
        player.retreated = data.retreated;
        player.totalCardsPlayed = data.totalCardsPlayed;
        player.totalCardsDestroyed = data.totalCardsDestroyed;
        player.moveCount = data.moveCount;
        return player;
    }
}
