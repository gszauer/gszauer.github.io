/**
 * TurnManager.js - Turn and Phase Management
 * Handles turn progression and phase transitions.
 */

class TurnManager {
    constructor(gameState) {
        this.game = gameState;
        this.plannedActions = [];   // Player's planned plays
        this.aiPlannedActions = []; // AI's planned plays
        this.aiController = null;
    }

    // ========================================================================
    // AI CONTROLLER
    // ========================================================================

    setAIController(controller) {
        this.aiController = controller;
    }

    // ========================================================================
    // TURN START
    // ========================================================================

    /**
     * Start a new turn
     */
    startTurn() {
        this.game.currentTurn++;
        const turn = this.game.currentTurn;

        console.log('=== Turn', turn, 'Start ===');

        // Reset turn-specific tracking
        this.game.firstCardPlayedThisTurn = null;
        this.plannedActions = [];
        this.aiPlannedActions = [];

        // Set energy for all players
        for (let i = 0; i < this.game.players.length; i++) {
            this.game.players[i].setEnergyForTurn(turn);
        }

        // Draw cards (except turn 1)
        if (turn > 1) {
            for (let i = 0; i < this.game.players.length; i++) {
                this.game.actionQueue.enqueue(new DrawCardAction(this.game.players[i]));
            }
        }

        // Trigger onTurnStart
        this.game.triggerOnTurnStart();

        // Location reveal (turns 1-3)
        if (turn <= 3) {
            this.game.setPhase(Phase.LOCATION_REVEAL);
            const location = this.game.locations[turn - 1];
            this.game.actionQueue.enqueue(new RevealLocationAction(location));
        } else {
            this.game.setPhase(Phase.PLANNING);
        }
    }

    // ========================================================================
    // PLANNING PHASE
    // ========================================================================

    /**
     * Enter planning phase
     */
    enterPlanningPhase() {
        console.log('Entering Planning Phase');
        this.game.setPhase(Phase.PLANNING);
        this.plannedActions = [];
        this.aiPlannedActions = [];
    }

    /**
     * Player plans to play a card
     */
    playerPlansCard(handCard, location) {
        // Check if already planned
        for (let i = 0; i < this.plannedActions.length; i++) {
            if (this.plannedActions[i].handCard === handCard) {
                console.warn('Card already planned');
                return false;
            }
        }

        // Check if location has space (considering planned cards)
        const plannedAtLocation = this.plannedActions.filter(
            a => a.location === location
        ).length;
        const existingAtLocation = location.getCardCount(this.game.players[0]);

        if (plannedAtLocation + existingAtLocation >= RULES.CARDS_PER_LOCATION) {
            console.warn('Location full');
            return false;
        }

        // Check energy (considering planned plays)
        const plannedEnergyCost = this.plannedActions.reduce(
            (sum, a) => sum + a.handCard.getCost(), 0
        );
        const availableEnergy = this.game.players[0].getEnergy() - plannedEnergyCost;

        if (handCard.getCost() > availableEnergy) {
            console.warn('Not enough energy');
            return false;
        }

        // Check card's canBePlayed
        if (!handCard.getCard().canBePlayed(this.game, this.game.players[0], location)) {
            console.warn('Card cannot be played here');
            return false;
        }

        // Check location's canPlayCard
        if (!location.canPlayCard(handCard, this.game.players[0], this.game)) {
            console.warn('Location blocks this card');
            return false;
        }

        this.plannedActions.push({
            player: this.game.players[0],
            handCard: handCard,
            location: location,
            playOrder: this.plannedActions.length
        });

        console.log('Planned:', handCard.getName(), 'at', location.getName());
        return true;
    }

    /**
     * Player removes a planned play
     */
    playerRemovesPlan(handCard) {
        const index = this.plannedActions.findIndex(a => a.handCard === handCard);
        if (index > -1) {
            this.plannedActions.splice(index, 1);
            // Reindex play order
            for (let i = 0; i < this.plannedActions.length; i++) {
                this.plannedActions[i].playOrder = i;
            }
            console.log('Removed plan for:', handCard.getName());
            return true;
        }
        return false;
    }

    /**
     * Get planned actions
     */
    getPlannedActions() {
        return [...this.plannedActions];
    }

    /**
     * Get energy after planned plays (never returns below 0)
     */
    getRemainingEnergy() {
        const plannedCost = this.plannedActions.reduce(
            (sum, a) => sum + a.handCard.getCost(), 0
        );
        const remaining = this.game.players[0].getEnergy() - plannedCost;
        return Math.max(0, remaining);
    }

    // ========================================================================
    // REVEAL PHASE
    // ========================================================================

    /**
     * Start the reveal phase (after planning)
     */
    startRevealPhase() {
        console.log('Starting Reveal Phase');
        this.game.setPhase(Phase.CARD_REVEAL);

        // Get AI's planned actions
        if (this.aiController) {
            this.aiPlannedActions = this.aiController.planTurn(this.game);
        }

        // Merge all actions
        const allActions = [...this.plannedActions, ...this.aiPlannedActions];

        if (allActions.length === 0) {
            console.log('No cards to reveal');
            return;
        }

        // Calculate priority
        const priorityPlayer = this.game.getPriorityPlayer();
        console.log('Priority player:', priorityPlayer.id);

        // Sort actions by: priority player first, then location index, then play order
        allActions.sort((a, b) => {
            // Priority player reveals first
            if (a.player === priorityPlayer && b.player !== priorityPlayer) return -1;
            if (b.player === priorityPlayer && a.player !== priorityPlayer) return 1;

            // Same player: by location index
            if (a.location.index !== b.location.index) {
                return a.location.index - b.location.index;
            }

            // Same location: by play order
            return a.playOrder - b.playOrder;
        });

        // Queue play and reveal actions
        for (let i = 0; i < allActions.length; i++) {
            const action = allActions[i];

            // Queue play action (card moves to board face down)
            this.game.actionQueue.enqueue(
                new PlayCardAction(action.handCard, action.player, action.location)
            );
        }

        // After all cards are played, queue reveal actions in same order
        // We need to do this after all plays so cards are on the board
        // Use a delayed callback approach
        const revealActions = allActions.map(action => {
            return { player: action.player, location: action.location };
        });

        // Store for later reveal
        this.pendingReveals = revealActions;
    }

    /**
     * Process pending reveals (called after play actions complete)
     */
    processReveals() {
        if (!this.pendingReveals || this.pendingReveals.length === 0) return;

        // Collect all unrevealed cards across all locations
        const cardsToReveal = [];
        const alreadyQueued = new Set();

        for (let i = 0; i < this.pendingReveals.length; i++) {
            const reveal = this.pendingReveals[i];
            const cards = reveal.location.getCards(reveal.player);

            // Find all unrevealed cards for this player at this location
            for (let j = 0; j < cards.length; j++) {
                const card = cards[j];
                if (!card.isRevealed() && !alreadyQueued.has(card)) {
                    cardsToReveal.push({ card, reveal });
                    alreadyQueued.add(card);
                }
            }
        }

        // Queue reveal actions for all unrevealed cards
        for (let i = 0; i < cardsToReveal.length; i++) {
            this.game.actionQueue.enqueue(new RevealCardAction(cardsToReveal[i].card));
        }

        this.pendingReveals = [];
    }

    // ========================================================================
    // TURN END
    // ========================================================================

    /**
     * End the current turn
     */
    endTurn() {
        console.log('=== Turn', this.game.currentTurn, 'End ===');
        this.game.setPhase(Phase.TURN_END);

        // Recalculate ongoing effects
        this.game.triggerOnGoing();

        // Trigger onTurnEnd
        this.game.triggerOnTurnEnd();

        // Check for game over
        if (this.game.currentTurn >= this.game.maxTurns) {
            this.endGame();
        }
    }

    /**
     * End the game
     */
    endGame() {
        console.log('=== Game Over ===');

        // Trigger onGameEnd abilities (Captain Marvel, etc.)
        this.game.triggerOnGameEnd();

        this.game.setPhase(Phase.GAME_OVER);

        const result = this.game.determineWinner();
        if (result.winner) {
            console.log('Winner:', result.winner.id);
        } else {
            console.log('Tie!');
        }
    }

    // ========================================================================
    // PHASE CHECKS
    // ========================================================================

    isPlanningPhase() {
        return this.game.currentPhase === Phase.PLANNING;
    }

    isRevealPhase() {
        return this.game.currentPhase === Phase.CARD_REVEAL;
    }

    isGameOver() {
        return this.game.currentPhase === Phase.GAME_OVER;
    }
}
