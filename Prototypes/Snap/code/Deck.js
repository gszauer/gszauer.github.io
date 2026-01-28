/**
 * Deck.js - Deck Management
 * Handles deck creation, shuffling, and drawing.
 */

class Deck {
    constructor(cardIds, cardRegistry) {
        this.cards = [];
        this.cardRegistry = cardRegistry;

        // Create cards from IDs
        for (let i = 0; i < cardIds.length; i++) {
            const card = cardRegistry.get(cardIds[i]);
            if (card) {
                this.cards.push(card.clone());
            } else {
                console.warn('Card not found in registry:', cardIds[i]);
            }
        }

        this.shuffle();
    }

    // ========================================================================
    // DECK OPERATIONS
    // ========================================================================

    /**
     * Fisher-Yates shuffle
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

    /**
     * Draw a card from the deck
     * @returns {HandCard|null} A new HandCard, or null if deck is empty
     */
    draw() {
        if (this.cards.length === 0) {
            return null;
        }

        const card = this.cards.pop();
        return new HandCard(card);
    }

    /**
     * Draw a specific card (for Quicksilver starting hand)
     * @param {string} cardId - The card ID to draw
     * @returns {HandCard|null} The drawn card or null if not found
     */
    drawSpecific(cardId) {
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].getId() === cardId) {
                const card = this.cards.splice(i, 1)[0];
                return new HandCard(card);
            }
        }
        return null;
    }

    /**
     * Add a card to the deck (for cards that shuffle back)
     */
    addCard(card) {
        this.cards.push(card.clone());
    }

    /**
     * Add a card to the top of the deck
     */
    addToTop(card) {
        this.cards.push(card.clone());
    }

    /**
     * Add a card to the bottom of the deck
     */
    addToBottom(card) {
        this.cards.unshift(card.clone());
    }

    // ========================================================================
    // QUERIES
    // ========================================================================

    isEmpty() {
        return this.cards.length === 0;
    }

    getCount() {
        return this.cards.length;
    }

    /**
     * Get all cards in the deck (for Agent Venom, etc.)
     */
    getCards() {
        return this.cards;
    }

    /**
     * Remove a specific card from the deck
     */
    removeCard(card) {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Check if deck contains a card with specific ID
     */
    contains(cardId) {
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].getId() === cardId) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get cards that start in opening hand (Quicksilver)
     */
    getStartingHandCards() {
        const startingCards = [];
        for (let i = this.cards.length - 1; i >= 0; i--) {
            if (this.cards[i].startsInHand && this.cards[i].startsInHand()) {
                const card = this.cards.splice(i, 1)[0];
                startingCards.push(new HandCard(card));
            }
        }
        return startingCards;
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================
    serialize() {
        return {
            cardIds: this.cards.map(c => c.getId())
        };
    }

    static deserialize(data, cardRegistry) {
        return new Deck(data.cardIds, cardRegistry);
    }
}
