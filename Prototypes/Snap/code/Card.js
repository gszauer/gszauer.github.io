/**
 * Card.js - Base Card Template Class (Immutable)
 * Cards are pure data templates with hook methods.
 * They are never modified directly - instances are created via clone().
 */

class Card {
    constructor(id, name, cost, power, abilityType, description, series) {
        this.id = id;
        this.name = name;
        this.baseCost = cost;
        this.basePower = power;
        this.abilityType = abilityType || AbilityType.NONE;
        this.description = description || '';
        this.series = series || 'Unknown';
    }

    // ========================================================================
    // GETTERS
    // ========================================================================
    getId() { return this.id; }
    getName() { return this.name; }
    getCost() { return this.baseCost; }
    getPower() { return this.basePower; }
    getAbilityType() { return this.abilityType; }
    getDescription() { return this.description; }
    getSeries() { return this.series; }

    // ========================================================================
    // SETTERS (for effects like Agent Venom)
    // ========================================================================

    /**
     * Set the base power (used by Agent Venom to set deck cards to 3)
     */
    setBasePower(power) {
        this.basePower = power;
    }

    // ========================================================================
    // HOOKS - Override in subclasses
    // ========================================================================

    /**
     * Called when card is revealed on the board
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     */
    onReveal(game, playedCard) {}

    /**
     * Called every frame while card is in play (for ongoing abilities)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     */
    onGoing(game, playedCard) {}

    /**
     * Called when card moves from one location to another
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     * @param {Location} fromLocation - The location the card moved from
     * @param {Location} toLocation - The location the card moved to
     */
    onMove(game, playedCard, fromLocation, toLocation) {}

    /**
     * Called when card is destroyed
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     */
    onDestroy(game, playedCard) {}

    /**
     * Called when card is discarded from hand
     * @param {GameState} game - The game state
     * @param {HandCard} handCard - The discarded hand card
     */
    onDiscard(game, handCard) {}

    /**
     * Called at the start of each turn
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     */
    onTurnStart(game, playedCard) {}

    /**
     * Called at the end of each turn
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     */
    onTurnEnd(game, playedCard) {}

    /**
     * Called at end of game (before winner determination)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     */
    onGameEnd(game, playedCard) {}

    // ========================================================================
    // REACTIVE HOOKS - For cards that respond to events
    // ========================================================================

    /**
     * Called after owner plays another card at this location (Angela, Bishop)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     * @param {PlayedCard} otherCard - The card that was played
     */
    afterCardPlayedHere(game, playedCard, otherCard) {}

    /**
     * Called after any card is played at this location (Silk, Titania)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     * @param {PlayedCard} otherCard - The card that was played
     */
    afterAnyCardPlayedHere(game, playedCard, otherCard) {}

    /**
     * Called after owner plays any card anywhere (Bishop global)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     * @param {PlayedCard} otherCard - The card that was played
     */
    afterYouPlayCard(game, playedCard, otherCard) {}

    /**
     * Called when a friendly card moves to this location (Kraven)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     * @param {PlayedCard} movedCard - The card that moved here
     */
    onCardMovedHere(game, playedCard, movedCard) {}

    /**
     * Called when an enemy card moves to this location (Kingpin)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     * @param {PlayedCard} movedCard - The card that moved here
     */
    onEnemyCardMovedHere(game, playedCard, movedCard) {}

    /**
     * Called when a card is added to owner's hand (The Collector)
     * @param {GameState} game - The game state
     * @param {PlayedCard} playedCard - This card's played instance
     * @param {HandCard} handCard - The card added to hand
     */
    onCardAddedToHand(game, playedCard, handCard) {}

    // ========================================================================
    // PLAY RESTRICTIONS
    // ========================================================================

    /**
     * Check if this card can be played at a location
     * @param {GameState} game - The game state
     * @param {Player} player - The player attempting to play
     * @param {Location} location - The target location
     * @returns {boolean} True if card can be played
     */
    canBePlayed(game, player, location) {
        return true;
    }

    // ========================================================================
    // SPECIAL HOOKS
    // ========================================================================

    /**
     * Called when card is drawn (for Quicksilver starting hand)
     * @returns {boolean} True if this card should start in opening hand
     */
    startsInHand() {
        return false;
    }

    // ========================================================================
    // CLONE
    // ========================================================================

    /**
     * Create a copy of this card template
     * Used when drawing a card to create a HandCard
     */
    clone() {
        const cloned = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        return cloned;
    }
}
