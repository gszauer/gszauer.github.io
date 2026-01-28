/**
 * GameState.js - Core Game State Manager
 * Coordinates all game systems without visual concerns.
 */

class GameState {
    constructor(player1, player2, locations, cardRegistry, locationRegistry) {
        this.players = [player1, player2];
        this.locations = locations;
        this.cardRegistry = cardRegistry;
        this.locationRegistry = locationRegistry;

        // Turn tracking
        this.currentTurn = 0;
        this.maxTurns = RULES.MAX_TURNS;
        this.currentPhase = Phase.LOCATION_REVEAL;

        // Action queue
        this.actionQueue = new ActionQueue();

        // Priority tiebreaker (random at game start)
        this.tiebreakWinner = Math.random() < 0.5 ? player1 : player2;

        // History tracking
        this.destroyedCards = {};
        this.discardedCards = {};
        this.banishedCards = {};

        for (let i = 0; i < this.players.length; i++) {
            const p = this.players[i];
            this.destroyedCards[p.id] = [];
            this.discardedCards[p.id] = [];
            this.banishedCards[p.id] = [];
        }

        // Turn-specific tracking
        this.lastCardPlayed = {};  // Per player: { playerId: playedCard }
        this.firstCardPlayedThisTurn = null;

        // Initialize per-player tracking
        for (let i = 0; i < this.players.length; i++) {
            this.lastCardPlayed[this.players[i].id] = null;
        }

        // Initialize locations for players
        for (let i = 0; i < locations.length; i++) {
            locations[i].initializeForPlayers(this.players);
        }
    }

    // ========================================================================
    // PHASE MANAGEMENT
    // ========================================================================

    setPhase(phase) {
        this.currentPhase = phase;
    }

    getPhase() {
        return this.currentPhase;
    }

    // ========================================================================
    // PLAYER ACCESS
    // ========================================================================

    getPlayer() {
        return this.players[0];
    }

    getAI() {
        return this.players[1];
    }

    getOpponent(player) {
        return player === this.players[0] ? this.players[1] : this.players[0];
    }

    getPlayerById(id) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                return this.players[i];
            }
        }
        return null;
    }

    // ========================================================================
    // PRIORITY CALCULATION
    // ========================================================================

    /**
     * Get the player who reveals first (lower total power)
     */
    getPriorityPlayer() {
        const p1Power = this.players[0].getTotalPower(this);
        const p2Power = this.players[1].getTotalPower(this);

        if (p1Power < p2Power) return this.players[0];
        if (p2Power < p1Power) return this.players[1];

        // Tie - use tiebreaker
        return this.tiebreakWinner;
    }

    // ========================================================================
    // CARD QUERIES
    // ========================================================================

    /**
     * Get all played cards on the board
     */
    getAllPlayedCards() {
        const cards = [];
        for (let i = 0; i < this.locations.length; i++) {
            const locationCards = this.locations[i].getAllCards();
            for (let j = 0; j < locationCards.length; j++) {
                cards.push(locationCards[j]);
            }
        }
        return cards;
    }

    /**
     * Get all revealed cards on the board
     */
    getAllRevealedCards() {
        const cards = this.getAllPlayedCards();
        const revealed = [];
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].isRevealed()) {
                revealed.push(cards[i]);
            }
        }
        return revealed;
    }

    /**
     * Get all cards for a specific player
     */
    getPlayerCards(player) {
        const cards = [];
        for (let i = 0; i < this.locations.length; i++) {
            const locationCards = this.locations[i].getCards(player);
            for (let j = 0; j < locationCards.length; j++) {
                cards.push(locationCards[j]);
            }
        }
        return cards;
    }

    // ========================================================================
    // ABILITY CHECKS
    // ========================================================================

    /**
     * Check if a card can be destroyed (Armor, Caiera protection)
     */
    canDestroy(playedCard) {
        // Check for Armor at location
        const location = playedCard.getLocation();
        const cards = location.getCards(playedCard.getOwner());

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (card.isRevealed() && !card.isSilenced()) {
                // Armor protects other cards at same location
                if (card.getId() === 'C021' && card !== playedCard) { // Armor
                    return false;
                }
            }
        }

        // Check for Caiera (protects 1 and 6 cost cards globally)
        const owner = playedCard.getOwner();
        const cardCost = playedCard.getCard().getCost();
        if (cardCost === 1 || cardCost === 6) {
            const allOwnerCards = this.getPlayerCards(owner);
            for (let i = 0; i < allOwnerCards.length; i++) {
                const card = allOwnerCards[i];
                if (card.isRevealed() && !card.isSilenced() && card.getId() === 'C041') { // Caiera
                    return false;
                }
            }
        }

        // Colossus can't be destroyed
        if (playedCard.getId() === 'C050' && !playedCard.isSilenced()) { // Colossus
            return false;
        }

        return true;
    }

    /**
     * Check if a card can trigger On Reveal at a location
     */
    canTriggerOnReveal(location) {
        return !location.disablesOnReveal();
    }

    /**
     * Check if a card can be moved
     */
    canMove(playedCard) {
        // Colossus can't be moved
        if (playedCard.getId() === 'C050' && !playedCard.isSilenced()) { // Colossus
            return false;
        }

        // Check for Professor X at destination (blocks all movement)
        // This would need more context about destination

        return true;
    }

    /**
     * Check if a card can have its power reduced (Luke Cage, Colossus)
     */
    canAfflict(playedCard) {
        // Colossus can't have power reduced
        if (playedCard.getId() === 'C050' && !playedCard.isSilenced()) { // Colossus
            return false;
        }

        // Luke Cage protects all cards at same location from power reduction
        const location = playedCard.getLocation();
        const cards = location.getCards(playedCard.getOwner());

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (card.isRevealed() && !card.isSilenced()) {
                // Luke Cage (C147) - need to check ID
                if (card.getName() === 'Luke Cage') {
                    return false;
                }
            }
        }

        return true;
    }

    // ========================================================================
    // CARD TRACKING
    // ========================================================================

    /**
     * Set the last played card for a player
     */
    setLastPlayedCard(player, playedCard) {
        this.lastCardPlayed[player.id] = playedCard;
    }

    /**
     * Get the last card played by a player
     */
    getLastPlayedCard(player) {
        return this.lastCardPlayed[player.id] || null;
    }

    /**
     * Get destroyed cards for a player
     */
    getDestroyedCards(player) {
        return this.destroyedCards[player.id] || [];
    }

    /**
     * Destroy a card (remove from board, add to destroyed pile)
     */
    destroyCard(playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();

        // Check if card can be destroyed
        if (!this.canDestroy(playedCard)) {
            return false;
        }

        // Trigger onDestroy ability
        if (!playedCard.isSilenced()) {
            const card = playedCard.getCard();
            if (card.onDestroy) {
                card.onDestroy(this, playedCard);
            }
        }

        // Remove from location
        location.removeCard(playedCard);

        // Add to destroyed pile
        this.destroyedCards[owner.id].push(playedCard);

        return true;
    }

    /**
     * Move a card to a new location
     */
    moveCard(playedCard, newLocation) {
        const owner = playedCard.getOwner();
        const oldLocation = playedCard.getLocation();

        // Check if card can be moved
        if (!this.canMove(playedCard)) {
            return false;
        }

        // Check if new location has space
        if (!newLocation.hasSpace(owner)) {
            return false;
        }

        // Remove from old location
        oldLocation.removeCard(playedCard);

        // Add to new location
        newLocation.addCard(playedCard);

        // Trigger any move-related abilities (K'un-Lun, Fisk Tower, etc.)
        if (newLocation.onCardMoved) {
            newLocation.onCardMoved(this, playedCard);
        }

        return true;
    }

    /**
     * Discard a card from a player's hand
     */
    discardCard(player, handCard) {
        // Trigger onDiscard ability
        const card = handCard.getCard();
        if (card.onDiscard) {
            card.onDiscard(this, handCard);
        }

        // Remove from hand
        player.hand.removeCard(handCard);

        // Add to discarded pile
        this.discardedCards[player.id].push(handCard);

        return true;
    }

    /**
     * Get discarded cards for a player
     */
    getDiscardedCards(player) {
        return this.discardedCards[player.id] || [];
    }

    /**
     * Transform a played card into another card
     */
    transformCard(playedCard, newCardId) {
        const location = playedCard.getLocation();
        const owner = playedCard.getOwner();

        // Get the new card template
        const newCardTemplate = this.cardRegistry.get(newCardId);
        if (!newCardTemplate) return false;

        // Remove old card from location (without destroying)
        location.removeCard(playedCard);

        // Create new card at same location
        const handCard = new HandCard(newCardTemplate.clone());
        const newPlayedCard = new PlayedCard(handCard, owner, location, this.currentTurn);
        newPlayedCard.reveal();
        location.addCard(newPlayedCard);

        return newPlayedCard;
    }

    // ========================================================================
    // EVENT TRIGGERS
    // ========================================================================

    /**
     * Trigger onTurnStart for all cards and locations
     */
    triggerOnTurnStart() {
        // Locations
        for (let i = 0; i < this.locations.length; i++) {
            const location = this.locations[i];
            if (location.isRevealed() && location.onTurnStart) {
                location.onTurnStart(this);
            }
        }

        // Cards
        const cards = this.getAllRevealedCards();
        for (let i = 0; i < cards.length; i++) {
            const playedCard = cards[i];
            if (!playedCard.isSilenced()) {
                playedCard.getCard().onTurnStart(this, playedCard);
            }
        }
    }

    /**
     * Trigger onTurnEnd for all cards and locations
     */
    triggerOnTurnEnd() {
        // Locations
        for (let i = 0; i < this.locations.length; i++) {
            const location = this.locations[i];
            if (location.isRevealed()) {
                if (location.onTurnEnd) {
                    location.onTurnEnd(this);
                }
                if (location.afterTurn) {
                    location.afterTurn(this, this.currentTurn);
                }
            }
        }

        // Cards
        const cards = this.getAllRevealedCards();
        for (let i = 0; i < cards.length; i++) {
            const playedCard = cards[i];
            if (!playedCard.isSilenced()) {
                playedCard.getCard().onTurnEnd(this, playedCard);
            }
        }
    }

    /**
     * Trigger onGameEnd for all cards (Captain Marvel, etc.)
     */
    triggerOnGameEnd() {
        const cards = this.getAllRevealedCards();
        for (let i = 0; i < cards.length; i++) {
            const playedCard = cards[i];
            if (!playedCard.isSilenced()) {
                playedCard.getCard().onGameEnd(this, playedCard);
            }
        }
    }

    /**
     * Trigger onGoing for all cards (ongoing ability calculation)
     */
    triggerOnGoing() {
        const cards = this.getAllRevealedCards();
        for (let i = 0; i < cards.length; i++) {
            const playedCard = cards[i];
            if (!playedCard.isSilenced() &&
                playedCard.getCard().getAbilityType() === AbilityType.ONGOING) {
                playedCard.getCard().onGoing(this, playedCard);
            }
        }

        // Location ongoing effects
        for (let i = 0; i < this.locations.length; i++) {
            const location = this.locations[i];
            if (location.isRevealed() && location.onGoing) {
                location.onGoing(this);
            }
        }
    }

    /**
     * Trigger onCardAddedToHand for relevant cards (The Collector)
     */
    triggerOnCardAddedToHand(player, handCard) {
        const cards = this.getPlayerCards(player);
        for (let i = 0; i < cards.length; i++) {
            const playedCard = cards[i];
            if (playedCard.isRevealed() && !playedCard.isSilenced()) {
                const card = playedCard.getCard();
                if (card.onCardAddedToHand) {
                    card.onCardAddedToHand(this, playedCard, handCard);
                }
            }
        }
    }

    // ========================================================================
    // WIN CONDITION
    // ========================================================================

    /**
     * Check if game is over
     */
    isGameOver() {
        return this.currentPhase === Phase.GAME_OVER ||
               this.currentTurn >= this.maxTurns ||
               this.players[0].hasRetreated() ||
               this.players[1].hasRetreated();
    }

    /**
     * Determine the winner
     * @returns {{ winner: Player|null, locationsWon: number[] }}
     */
    determineWinner() {
        // Check for retreat
        if (this.players[0].hasRetreated()) {
            return { winner: this.players[1], locationsWon: [0, 1, 2] };
        }
        if (this.players[1].hasRetreated()) {
            return { winner: this.players[0], locationsWon: [0, 1, 2] };
        }

        // Count locations controlled
        const p1Locations = [];
        const p2Locations = [];

        for (let i = 0; i < this.locations.length; i++) {
            const location = this.locations[i];
            let winner;

            // Check for reversed win condition
            if (location.lowestPowerWins()) {
                const p1Power = location.getPower(this.players[0], this);
                const p2Power = location.getPower(this.players[1], this);

                if (p1Power < p2Power) winner = this.players[0];
                else if (p2Power < p1Power) winner = this.players[1];
                else winner = null;
            } else {
                winner = location.getWinningPlayer(this);
            }

            if (winner === this.players[0]) {
                p1Locations.push(i);
            } else if (winner === this.players[1]) {
                p2Locations.push(i);
            }
        }

        // Determine overall winner
        if (p1Locations.length >= 2) {
            return { winner: this.players[0], locationsWon: p1Locations };
        }
        if (p2Locations.length >= 2) {
            return { winner: this.players[1], locationsWon: p2Locations };
        }

        // Tie - compare total power
        const p1Total = this.players[0].getTotalPower(this);
        const p2Total = this.players[1].getTotalPower(this);

        if (p1Total > p2Total) {
            return { winner: this.players[0], locationsWon: p1Locations };
        }
        if (p2Total > p1Total) {
            return { winner: this.players[1], locationsWon: p2Locations };
        }

        // Complete tie
        return { winner: null, locationsWon: [] };
    }

    // ========================================================================
    // CUBE CALCULATION
    // ========================================================================

    /**
     * Calculate cubes at stake
     */
    getCubesAtStake() {
        let cubes = 1;

        if (this.players[0].hasSnapped()) cubes *= 2;
        if (this.players[1].hasSnapped()) cubes *= 2;

        return cubes;
    }
}
