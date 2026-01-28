/**
 * BasicLocations.js - Basic Location Implementations
 * All values match all_locations.txt exactly.
 */

// ============================================================================
// VANILLA LOCATION (No effect)
// ============================================================================

class Ruins extends Location {
    constructor(index) {
        super('L077', 'Ruins', 'None', index);
    }
}

// ============================================================================
// POWER BONUS LOCATIONS
// ============================================================================

class Atlantis extends Location {
    constructor(index) {
        super('L006', 'Atlantis',
            'If you only have one card here, it has +5 Power.', index);
    }

    onGoing(game) {
        for (let i = 0; i < game.players.length; i++) {
            const player = game.players[i];
            const cards = this.getCards(player);

            if (cards.length === 1) {
                const card = cards[0];
                if (card.isRevealed() && !card.hasModifier('atlantis_ongoing')) {
                    card.addModifier('atlantis_ongoing', 5);
                }
            } else {
                // Remove bonus if more than one card
                for (let j = 0; j < cards.length; j++) {
                    cards[j].removeModifier('atlantis_ongoing');
                }
            }
        }
    }
}

class Xandar extends Location {
    constructor(index) {
        super('L082', 'Xandar',
            'Cards here have +1 Power.', index);
    }

    onGoing(game) {
        const allCards = this.getAllCards();
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            if (card.isRevealed() && !card.hasModifier('xandar_ongoing')) {
                card.addModifier('xandar_ongoing', 1);
            }
        }
    }
}

// ============================================================================
// WIN CONDITION MODIFIERS
// ============================================================================

class BarWithNoName extends Location {
    constructor(index) {
        super('L011', 'Bar With No Name',
            'Whoever has the least Power here wins.', index);
    }

    lowestPowerWins() {
        return true;
    }

    // Override getWinningPlayer to reverse the logic
    getWinningPlayer(game) {
        const p1 = game.players[0];
        const p2 = game.players[1];

        const p1Power = this.getPower(p1, game);
        const p2Power = this.getPower(p2, game);

        // Lowest power wins
        if (p1Power < p2Power) return p1;
        if (p2Power < p1Power) return p2;
        return null; // Tie
    }
}

// ============================================================================
// ABILITY MODIFIER LOCATIONS
// ============================================================================

class Knowhere extends Location {
    constructor(index) {
        super('L044', 'Knowhere',
            'On Reveal effects do not happen at this location.', index);
    }

    disablesOnReveal() {
        return true;
    }
}

class KamarTaj extends Location {
    constructor(index) {
        super('L043', 'Kamar-Taj',
            'On Reveal effects happen twice at this location.', index);
    }

    doublesOnReveal() {
        return true;
    }
}

// ============================================================================
// PLAY RESTRICTION LOCATIONS
// ============================================================================

class SanctumSanctorum extends Location {
    constructor(index) {
        super('L080', 'Sanctum Sanctorum',
            "Cards can't be played here.", index);
    }

    canPlayCard(handCard, player, game) {
        // Only block plays after the location is revealed
        if (this.isRevealed()) {
            return false;
        }
        // Before reveal, use normal rules
        return this.hasSpace(player);
    }
}

// ============================================================================
// CLONE/COPY LOCATIONS
// ============================================================================

class CloningVats extends Location {
    constructor(index) {
        super('L021', 'Cloning Vats',
            'After you play a card here, add a copy to your hand.', index);
    }

    onCardRevealed(game, playedCard) {
        const owner = playedCard.getOwner();

        // Don't copy tokens
        if (playedCard.getId().startsWith('TOKEN_')) return;

        // Add a copy to hand
        if (!owner.hand.isFull()) {
            const cardTemplate = cardRegistry.get(playedCard.getId());
            if (cardTemplate) {
                const handCard = new HandCard(cardTemplate.clone());
                owner.hand.addCard(handCard);
                game.triggerOnCardAddedToHand(owner, handCard);
            }
        }
    }
}

// ============================================================================
// AFTER TURN LOCATIONS
// ============================================================================

class Asgard extends Location {
    constructor(index) {
        super('L002', 'Asgard',
            'After turn 4, whoever is winning here draws 2 cards.', index);
    }

    afterTurn(game, turnNumber) {
        if (turnNumber === 4) {
            const winner = this.getWinningPlayer(game);
            if (winner) {
                // Draw 2 cards for winner
                game.actionQueue.enqueue(new DrawCardAction(winner));
                game.actionQueue.enqueue(new DrawCardAction(winner));
            }
        }
    }
}

// ============================================================================
// REGISTRATION
// ============================================================================

function registerBasicLocations(registry) {
    // Vanilla
    registry.register('L077', Ruins);

    // Power bonus
    registry.register('L006', Atlantis);
    registry.register('L082', Xandar);

    // Win condition modifier
    registry.register('L011', BarWithNoName);

    // Ability modifiers
    registry.register('L044', Knowhere);
    registry.register('L043', KamarTaj);

    // Play restrictions
    registry.register('L080', SanctumSanctorum);

    // Clone/copy
    registry.register('L021', CloningVats);

    // After turn
    registry.register('L002', Asgard);

    console.log('Registered', 9, 'basic locations');
}
