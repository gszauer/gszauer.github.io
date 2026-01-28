/**
 * Hand.js - Hand Management
 * Manages cards in a player's hand.
 */

class Hand {
    constructor(maxSize) {
        this.maxSize = maxSize || RULES.MAX_HAND_SIZE;
        this.cards = [];
    }

    // ========================================================================
    // CARD MANAGEMENT
    // ========================================================================

    /**
     * Add a card to hand
     * @param {HandCard} handCard - The card to add
     * @returns {boolean} True if card was added, false if hand is full
     */
    addCard(handCard) {
        if (this.cards.length >= this.maxSize) {
            return false;
        }
        this.cards.push(handCard);
        return true;
    }

    /**
     * Remove a card from hand
     * @param {HandCard} handCard - The card to remove
     * @returns {boolean} True if card was removed
     */
    removeCard(handCard) {
        const index = this.cards.indexOf(handCard);
        if (index > -1) {
            this.cards.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Remove card by index
     */
    removeCardAt(index) {
        if (index >= 0 && index < this.cards.length) {
            return this.cards.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * Get card by index
     */
    getCardAt(index) {
        return this.cards[index] || null;
    }

    /**
     * Find card by ID
     */
    findCard(cardId) {
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].getId() === cardId) {
                return this.cards[i];
            }
        }
        return null;
    }

    // ========================================================================
    // QUERIES
    // ========================================================================

    /**
     * Get all cards in hand
     */
    getCards() {
        return [...this.cards];
    }

    /**
     * Get number of cards in hand
     */
    getCount() {
        return this.cards.length;
    }

    /**
     * Check if hand is full
     */
    isFull() {
        return this.cards.length >= this.maxSize;
    }

    /**
     * Check if hand is empty
     */
    isEmpty() {
        return this.cards.length === 0;
    }

    /**
     * Get cards that can be played with available energy
     */
    getPlayableCards(energy) {
        const playable = [];
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].getCost() <= energy) {
                playable.push(this.cards[i]);
            }
        }
        return playable;
    }

    /**
     * Get cards sorted by cost
     */
    getCardsSortedByCost() {
        const sorted = [...this.cards];
        sorted.sort((a, b) => a.getCost() - b.getCost());
        return sorted;
    }

    /**
     * Get cards sorted by power
     */
    getCardsSortedByPower() {
        const sorted = [...this.cards];
        sorted.sort((a, b) => b.getPower() - a.getPower());
        return sorted;
    }

    /**
     * Get random card from hand
     */
    getRandomCard() {
        if (this.cards.length === 0) return null;
        const index = Math.floor(Math.random() * this.cards.length);
        return this.cards[index];
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================
    serialize() {
        return {
            cards: this.cards.map(c => c.serialize())
        };
    }

    static deserialize(data, cardRegistry) {
        const hand = new Hand();
        for (let i = 0; i < data.cards.length; i++) {
            const handCard = HandCard.deserialize(data.cards[i], cardRegistry);
            hand.addCard(handCard);
        }
        return hand;
    }
}
