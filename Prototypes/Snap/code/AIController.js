/**
 * AIController.js - AI Opponent Logic
 * Simple AI that plays cards strategically.
 */

class AIController {
    constructor(player) {
        this.player = player;
    }

    /**
     * Plan the AI's turn
     * @param {GameState} game - The game state
     * @returns {Array} Planned actions
     */
    planTurn(game) {
        const actions = [];
        const hand = this.player.hand.getCards();
        let remainingEnergy = this.player.getEnergy();

        // Get playable cards sorted by power (highest first)
        const playableCards = hand
            .filter(hc => hc.getCost() <= remainingEnergy)
            .sort((a, b) => b.getPower() - a.getPower());

        // Track cards played to each location this turn
        const plannedAtLocation = [0, 0, 0];

        for (let i = 0; i < playableCards.length; i++) {
            const handCard = playableCards[i];

            if (handCard.getCost() > remainingEnergy) continue;

            // Choose best location for this card
            const targetLocation = this.chooseLocation(game, handCard, plannedAtLocation);

            if (!targetLocation) continue;

            // Check if card can be played
            if (!handCard.getCard().canBePlayed(game, this.player, targetLocation)) {
                continue;
            }

            if (!targetLocation.canPlayCard(handCard, this.player, game)) {
                continue;
            }

            actions.push({
                player: this.player,
                handCard: handCard,
                location: targetLocation,
                playOrder: actions.length
            });

            remainingEnergy -= handCard.getCost();
            plannedAtLocation[targetLocation.index]++;

            console.log('AI plans:', handCard.getName(), 'at', targetLocation.getName());
        }

        return actions;
    }

    /**
     * Choose the best location to play a card
     */
    chooseLocation(game, handCard, plannedAtLocation) {
        // Get locations with space
        const availableLocations = [];

        for (let i = 0; i < game.locations.length; i++) {
            const location = game.locations[i];
            const existingCards = location.getCardCount(this.player);
            const plannedCards = plannedAtLocation[i];
            const maxCards = location.getMaxCards ? location.getMaxCards() : RULES.CARDS_PER_LOCATION;

            if (existingCards + plannedCards < maxCards) {
                availableLocations.push(location);
            }
        }

        if (availableLocations.length === 0) return null;

        // Score each location
        const scored = availableLocations.map(location => {
            return {
                location: location,
                score: this.scoreLocation(game, location, handCard)
            };
        });

        // Sort by score (highest first)
        scored.sort((a, b) => b.score - a.score);

        return scored[0].location;
    }

    /**
     * Score a location for playing a card
     * Higher score = better to play here
     */
    scoreLocation(game, location, handCard) {
        let score = 0;
        const opponent = game.getOpponent(this.player);

        // Get current power at location
        const myPower = location.getPower(this.player, game);
        const oppPower = location.getPower(opponent, game);

        // Prioritize locations where we're losing
        if (oppPower > myPower) {
            score += 30;

            // Extra priority if close to winning
            if (myPower + handCard.getPower() > oppPower) {
                score += 20;
            }
        }
        // Neutral locations
        else if (oppPower === myPower) {
            score += 20;
        }
        // Winning locations - lower priority
        else {
            score += 10;
        }

        // Bonus for middle location (for Medusa)
        if (location.index === 1 && handCard.getId() === 'C156') {
            score += 50; // Medusa gets +3 in middle
        }

        // Bonus for locations where opponent has cards (for Punisher)
        if (handCard.getId() === 'C190') {
            const oppCards = location.getCardCount(opponent);
            score += oppCards * 10;
        }

        // Consider location abilities
        if (location.doublesOnReveal() &&
            handCard.getCard().getAbilityType() === AbilityType.ON_REVEAL) {
            score += 30; // Kamar-Taj doubles on-reveal
        }

        if (location.disablesOnReveal() &&
            handCard.getCard().getAbilityType() === AbilityType.ON_REVEAL) {
            score -= 50; // Knowhere disables on-reveal
        }

        // Bonus for filling locations (Ant-Man bonus)
        if (handCard.getId() === 'C017') {
            const myCards = location.getCardCount(this.player);
            if (myCards >= 3) {
                score += 40; // Would trigger Ant-Man's +4
            }
        }

        // Random factor for variety
        score += Math.random() * 5;

        return score;
    }

    /**
     * Decide whether to snap
     */
    shouldSnap(game) {
        // Simple logic: snap if winning 2+ locations
        let winning = 0;
        const opponent = game.getOpponent(this.player);

        for (let i = 0; i < game.locations.length; i++) {
            const location = game.locations[i];
            const myPower = location.getPower(this.player, game);
            const oppPower = location.getPower(opponent, game);

            if (myPower > oppPower) winning++;
        }

        // Snap if clearly winning after turn 4
        if (game.currentTurn >= 4 && winning >= 2) {
            return Math.random() < 0.5; // 50% chance
        }

        return false;
    }

    /**
     * Decide whether to retreat
     */
    shouldRetreat(game) {
        // Simple logic: retreat if losing badly after turn 5
        if (game.currentTurn < 5) return false;

        let losing = 0;
        const opponent = game.getOpponent(this.player);

        for (let i = 0; i < game.locations.length; i++) {
            const location = game.locations[i];
            const myPower = location.getPower(this.player, game);
            const oppPower = location.getPower(opponent, game);

            if (oppPower > myPower + 10) losing++;
        }

        // Retreat if losing 2+ locations by a lot
        if (losing >= 2) {
            return Math.random() < 0.3; // 30% chance
        }

        return false;
    }
}
