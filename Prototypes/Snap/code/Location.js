/**
 * Location.js - Base Location Class
 * Locations hold cards and can have special abilities.
 * Each location has slots for 4 cards per player.
 */

class Location {
    constructor(id, name, description, index) {
        this.id = id;
        this.name = name;
        this.description = description || '';
        this.index = index;         // 0 = left, 1 = middle, 2 = right

        // Reveal state
        this.revealed = false;

        // Cards at this location (keyed by player id)
        this.cards = {};

        // Visual reference (set by GameScene)
        this.visual = null;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize card slots for players
     */
    initializeForPlayers(players) {
        for (let i = 0; i < players.length; i++) {
            this.cards[players[i].id] = [];
        }
    }

    // ========================================================================
    // GETTERS
    // ========================================================================
    getId() { return this.id; }
    getName() { return this.name; }
    getDescription() { return this.description; }
    getIndex() { return this.index; }

    // ========================================================================
    // REVEAL STATE
    // ========================================================================
    isRevealed() { return this.revealed; }

    reveal() {
        this.revealed = true;
    }

    // ========================================================================
    // CARD MANAGEMENT
    // ========================================================================

    /**
     * Check if player has space for more cards
     */
    hasSpace(player) {
        const playerCards = this.cards[player.id] || [];
        return playerCards.length < RULES.CARDS_PER_LOCATION;
    }

    /**
     * Get number of cards a player has here
     */
    getCardCount(player) {
        const playerCards = this.cards[player.id] || [];
        return playerCards.length;
    }

    /**
     * Add a card to this location
     */
    addCard(playedCard) {
        const playerId = playedCard.getOwner().id;
        if (!this.cards[playerId]) {
            this.cards[playerId] = [];
        }
        this.cards[playerId].push(playedCard);
        playedCard.setLocation(this);
    }

    /**
     * Remove a card from this location
     */
    removeCard(playedCard) {
        const playerId = playedCard.getOwner().id;
        if (this.cards[playerId]) {
            const index = this.cards[playerId].indexOf(playedCard);
            if (index > -1) {
                this.cards[playerId].splice(index, 1);
            }
        }
    }

    /**
     * Get all cards for a player at this location
     */
    getCards(player) {
        return this.cards[player.id] || [];
    }

    /**
     * Get all cards at this location (all players)
     */
    getAllCards() {
        const allCards = [];
        for (const playerId in this.cards) {
            for (let i = 0; i < this.cards[playerId].length; i++) {
                allCards.push(this.cards[playerId][i]);
            }
        }
        return allCards;
    }

    /**
     * Get all revealed cards for a player
     */
    getRevealedCards(player) {
        const cards = this.getCards(player);
        const revealed = [];
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].isRevealed()) {
                revealed.push(cards[i]);
            }
        }
        return revealed;
    }

    // ========================================================================
    // POWER CALCULATION
    // ========================================================================

    /**
     * Get total power for a player at this location
     * Subclasses may override for special effects (Iron Man doubling, etc.)
     */
    getPower(player, game) {
        let totalPower = 0;
        const cards = this.getCards(player);

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (card.isRevealed()) {
                totalPower += card.getPower();
            }
        }

        // Check for Iron Man doubling
        if (this.hasIronMan(player)) {
            totalPower *= 2;
        }

        return totalPower;
    }

    /**
     * Check if player has Iron Man (ongoing doubling) at this location
     */
    hasIronMan(player) {
        const cards = this.getCards(player);
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (card.isRevealed() && !card.isSilenced() && card.getId() === 'C118') {
                return true;
            }
        }
        return false;
    }

    /**
     * Determine which player is winning this location
     * @returns {Player|null} The winning player, or null for tie
     */
    getWinningPlayer(game) {
        const p1 = game.players[0];
        const p2 = game.players[1];

        const p1Power = this.getPower(p1, game);
        const p2Power = this.getPower(p2, game);

        if (p1Power > p2Power) return p1;
        if (p2Power > p1Power) return p2;
        return null; // Tie
    }

    // ========================================================================
    // HOOKS - Override in subclasses
    // ========================================================================

    /**
     * Called when location is revealed
     */
    onReveal(game) {}

    /**
     * Called every frame (for ongoing effects)
     */
    onGoing(game) {}

    /**
     * Called at the start of each turn
     */
    onTurnStart(game) {}

    /**
     * Called at the end of each turn
     */
    onTurnEnd(game) {}

    /**
     * Called after a specific turn ends
     */
    afterTurn(game, turnNumber) {}

    /**
     * Called when a card is played here
     */
    onCardPlayed(game, playedCard) {}

    /**
     * Called when a card is revealed here
     */
    onCardRevealed(game, playedCard) {}

    // ========================================================================
    // ABILITY MODIFIERS
    // ========================================================================

    /**
     * Does this location disable On Reveal abilities? (Knowhere)
     */
    disablesOnReveal() {
        return false;
    }

    /**
     * Does this location double On Reveal abilities? (Kamar-Taj)
     */
    doublesOnReveal() {
        return false;
    }

    /**
     * Does this location disable Ongoing abilities?
     */
    disablesOngoing() {
        return false;
    }

    // ========================================================================
    // PLAY RESTRICTIONS
    // ========================================================================

    /**
     * Check if a card can be played here
     */
    canPlayCard(handCard, player, game) {
        return this.hasSpace(player);
    }

    /**
     * Get the maximum cards allowed per player (usually 4)
     * Space Throne overrides to 1
     */
    getMaxCards() {
        return RULES.CARDS_PER_LOCATION;
    }

    // ========================================================================
    // WIN CONDITION MODIFIERS
    // ========================================================================

    /**
     * Some locations reverse the win condition (Bar With No Name)
     * @returns {boolean} True if lowest power wins
     */
    lowestPowerWins() {
        return false;
    }

    // ========================================================================
    // CLONE
    // ========================================================================
    clone() {
        const cloned = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        cloned.cards = {};
        cloned.revealed = false;
        return cloned;
    }
}
