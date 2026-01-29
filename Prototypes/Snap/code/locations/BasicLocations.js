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

        // Safety check - must be revealed
        if (!playedCard.isRevealed()) return;

        // Don't copy tokens
        if (playedCard.getId().startsWith('TOKEN_')) return;

        // Add a copy to hand at end of turn (after all On Reveal effects resolve)
        playedCard.setState('cloningVatsPending', true);
    }

    onTurnEnd(game) {
        // Process all pending clones after On Reveal effects have resolved
        const allCards = this.getAllCards();
        for (let i = 0; i < allCards.length; i++) {
            const playedCard = allCards[i];
            if (playedCard.getState('cloningVatsPending')) {
                playedCard.clearState('cloningVatsPending');

                const owner = playedCard.getOwner();
                if (!owner.hand.isFull()) {
                    const cardTemplate = cardRegistry.get(playedCard.getId());
                    if (cardTemplate) {
                        const handCard = new HandCard(cardTemplate.clone());

                        // Copy power modifiers from the played card
                        const modifiers = playedCard.getModifiers();
                        for (let j = 0; j < modifiers.length; j++) {
                            const mod = modifiers[j];
                            handCard.addPowerModifier(mod.source + '_clone', mod.amount);
                        }

                        owner.hand.addCard(handCard);
                        game.triggerOnCardAddedToHand(owner, handCard);
                    }
                }
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

class Attilan extends Location {
    constructor(index) {
        super('L007', 'Attilan',
            'After turn 3, shuffle your hand into your deck. Draw 3 cards.', index);
    }

    afterTurn(game, turnNumber) {
        if (turnNumber === 3) {
            for (let i = 0; i < game.players.length; i++) {
                const player = game.players[i];

                // Shuffle hand into deck
                const handCards = [...player.hand.getCards()];
                for (let j = 0; j < handCards.length; j++) {
                    player.hand.removeCard(handCards[j]);
                    player.deck.addCard(handCards[j]);
                }
                player.deck.shuffle();

                // Draw 3 cards
                for (let j = 0; j < 3; j++) {
                    game.actionQueue.enqueue(new DrawCardAction(player));
                }
            }
        }
    }
}

class TheBifrost extends Location {
    constructor(index) {
        super('L013', 'The Bifrost',
            'After turn 4, move all cards one location to the right.', index);
    }

    afterTurn(game, turnNumber) {
        if (turnNumber === 4) {
            // Move cards from left to middle to right
            // Process from right to left to avoid overwriting
            for (let locIdx = game.locations.length - 2; locIdx >= 0; locIdx--) {
                const fromLocation = game.locations[locIdx];
                const toLocation = game.locations[locIdx + 1];

                const allCards = [...fromLocation.getAllCards()];
                for (let i = 0; i < allCards.length; i++) {
                    const card = allCards[i];
                    if (card.isRevealed() && game.canMove(card) && toLocation.hasSpace(card.getOwner())) {
                        game.moveCard(card, toLocation);
                    }
                }
            }
        }
    }
}

class Camelot extends Location {
    constructor(index) {
        super('L014', 'Camelot',
            'After turn 5, set all cards here to 5 Power.', index);
    }

    afterTurn(game, turnNumber) {
        if (turnNumber === 5) {
            const allCards = this.getAllCards();
            for (let i = 0; i < allCards.length; i++) {
                const card = allCards[i];
                if (card.isRevealed()) {
                    // Clear modifiers and set to 5
                    card.clearModifiers();
                    const basePower = card.getBasePower();
                    card.addModifier('camelot_set', 5 - basePower);
                }
            }
        }
    }
}

class CaveOfTheDragon extends Location {
    constructor(index) {
        super('L019', 'Cave of The Dragon',
            'After turn 4, add a random 5-Cost card to each side.', index);
    }

    afterTurn(game, turnNumber) {
        if (turnNumber === 4) {
            for (let i = 0; i < game.players.length; i++) {
                const player = game.players[i];
                if (this.hasSpace(player)) {
                    const card5 = this.getRandomCardByCost(5);
                    if (card5) {
                        const handCard = new HandCard(card5.clone());
                        const playedCard = new PlayedCard(handCard, player, this, game.currentTurn);
                        playedCard.reveal();
                        this.addCard(playedCard);
                    }
                }
            }
        }
    }

    getRandomCardByCost(cost) {
        const allIds = cardRegistry.getAllIds();
        const matchingCards = [];
        for (let i = 0; i < allIds.length; i++) {
            const card = cardRegistry.get(allIds[i]);
            if (card && card.getCost() === cost && !allIds[i].startsWith('TOKEN_')) {
                matchingCards.push(card);
            }
        }
        if (matchingCards.length === 0) return null;
        return matchingCards[Math.floor(Math.random() * matchingCards.length)];
    }
}

// ============================================================================
// ON REVEAL LOCATIONS
// ============================================================================

class CampLehigh extends Location {
    constructor(index) {
        super('L015', 'Camp Lehigh',
            'Add a random 3-Cost card to each player\'s hand.', index);
    }

    onReveal(game) {
        for (let i = 0; i < game.players.length; i++) {
            const player = game.players[i];
            if (!player.hand.isFull()) {
                const card3 = this.getRandomCardByCost(3);
                if (card3) {
                    const handCard = new HandCard(card3.clone());
                    player.hand.addCard(handCard);
                    game.triggerOnCardAddedToHand(player, handCard);
                }
            }
        }
    }

    getRandomCardByCost(cost) {
        const allIds = cardRegistry.getAllIds();
        const matchingCards = [];
        for (let i = 0; i < allIds.length; i++) {
            const card = cardRegistry.get(allIds[i]);
            if (card && card.getCost() === cost && !allIds[i].startsWith('TOKEN_')) {
                matchingCards.push(card);
            }
        }
        if (matchingCards.length === 0) return null;
        return matchingCards[Math.floor(Math.random() * matchingCards.length)];
    }
}

class CrystalTowers extends Location {
    constructor(index) {
        super('L025', 'Crystal Towers',
            'Shuffle your hand into your deck. Draw 3 cards.', index);
    }

    onReveal(game) {
        for (let i = 0; i < game.players.length; i++) {
            const player = game.players[i];

            // Shuffle hand into deck
            const handCards = [...player.hand.getCards()];
            for (let j = 0; j < handCards.length; j++) {
                player.hand.removeCard(handCards[j]);
                player.deck.addCard(handCards[j]);
            }
            player.deck.shuffle();

            // Draw 3 cards
            for (let j = 0; j < 3; j++) {
                game.actionQueue.enqueue(new DrawCardAction(player));
            }
        }
    }
}

class CelestialBurialGround extends Location {
    constructor(index) {
        super('L020', 'Celestial Burial Ground',
            'Discard a card. Replace it with one that costs the same.', index);
    }

    onReveal(game) {
        for (let i = 0; i < game.players.length; i++) {
            const player = game.players[i];
            const handCards = player.hand.getCards();

            if (handCards.length === 0) continue;

            // Pick a random card to discard
            const randomIndex = Math.floor(Math.random() * handCards.length);
            const discardedCard = handCards[randomIndex];
            const cost = discardedCard.getCost();

            // Discard it
            game.discardCard(player, discardedCard);

            // Add a replacement of the same cost
            if (!player.hand.isFull()) {
                const replacement = this.getRandomCardByCost(cost);
                if (replacement) {
                    const handCard = new HandCard(replacement.clone());
                    player.hand.addCard(handCard);
                    game.triggerOnCardAddedToHand(player, handCard);
                }
            }
        }
    }

    getRandomCardByCost(cost) {
        const allIds = cardRegistry.getAllIds();
        const matchingCards = [];
        for (let i = 0; i < allIds.length; i++) {
            const card = cardRegistry.get(allIds[i]);
            if (card && card.getCost() === cost && !allIds[i].startsWith('TOKEN_')) {
                matchingCards.push(card);
            }
        }
        if (matchingCards.length === 0) return null;
        return matchingCards[Math.floor(Math.random() * matchingCards.length)];
    }
}

// ============================================================================
// CARD PLAY EFFECT LOCATIONS
// ============================================================================

class AuntMays extends Location {
    constructor(index) {
        super('L008', 'Aunt May\'s',
            'The next card you play here gains +3 Power and moves.', index);
        this.triggered = {}; // Track per player
    }

    onCardRevealed(game, playedCard) {
        const owner = playedCard.getOwner();

        // Only trigger once per player
        if (this.triggered[owner.id]) return;
        this.triggered[owner.id] = true;

        // Add +3 power
        playedCard.addModifier('auntmays_bonus', 3);

        // Move to a random other location
        const otherLocations = game.locations.filter(
            loc => loc !== this && loc.hasSpace(owner)
        );

        if (otherLocations.length > 0 && game.canMove(playedCard)) {
            const targetLocation = otherLocations[Math.floor(Math.random() * otherLocations.length)];
            game.moveCard(playedCard, targetLocation);
        }
    }
}

class BarSinister extends Location {
    constructor(index) {
        super('L010', 'Bar Sinister',
            'After you play a card here, fill this location with copies of it.', index);
    }

    onCardRevealed(game, playedCard) {
        const owner = playedCard.getOwner();
        const cardId = playedCard.getId();

        // Don't copy tokens
        if (cardId.startsWith('TOKEN_')) return;

        // Fill remaining slots with copies
        while (this.hasSpace(owner)) {
            const cardTemplate = cardRegistry.get(cardId);
            if (cardTemplate) {
                const handCard = new HandCard(cardTemplate.clone());
                const copy = new PlayedCard(handCard, owner, this, game.currentTurn);
                copy.reveal();
                this.addCard(copy);
            } else {
                break;
            }
        }
    }
}

class CastleZemo extends Location {
    constructor(index) {
        super('L018', 'Castle Zemo',
            'The next card you play here switches sides.', index);
        this.triggered = {}; // Track per player
    }

    onCardRevealed(game, playedCard) {
        const owner = playedCard.getOwner();

        // Only trigger once per player
        if (this.triggered[owner.id]) return;
        this.triggered[owner.id] = true;

        const opponent = game.getOpponent(owner);

        // Check if opponent has space
        if (this.hasSpace(opponent)) {
            // Remove from owner's side
            this.removeCard(playedCard);

            // Change ownership and add to opponent's side
            playedCard.owner = opponent;
            this.addCard(playedCard);
        }
    }
}

class DangerRoom extends Location {
    constructor(index) {
        super('L026', 'Danger Room',
            'Cards played here have a 25% chance to be destroyed.', index);
    }

    onCardRevealed(game, playedCard) {
        // 25% chance to destroy
        if (Math.random() < 0.25) {
            game.destroyCard(playedCard);
        }
    }
}

class DeathsDomain extends Location {
    constructor(index) {
        super('L027', 'Death\'s Domain',
            'After you play a card here, destroy it.', index);
    }

    onCardRevealed(game, playedCard) {
        // Destroy the card after it's revealed
        game.destroyCard(playedCard);
    }
}

// ============================================================================
// PLAY RESTRICTION LOCATIONS
// ============================================================================

class AvengersCompound extends Location {
    constructor(index) {
        super('L009', 'Avengers Compound',
            'On turn 5, all cards must be played here.', index);
    }

    // This needs to be checked in GameScene/planning phase
    // For now, we mark it - the actual restriction logic would need UI integration
    forcesPlayHere(game) {
        return game.currentTurn === 5;
    }
}

class CrimsonCosmos extends Location {
    constructor(index) {
        super('L023', 'Crimson Cosmos',
            'Cards that cost 1, 2, or 3 can\'t be played here.', index);
    }

    canPlayCard(handCard, player, game) {
        if (!this.isRevealed()) {
            return this.hasSpace(player);
        }

        const cost = handCard.getCost();
        if (cost >= 1 && cost <= 3) {
            return false;
        }
        return this.hasSpace(player);
    }
}

// ============================================================================
// COST MODIFIER LOCATIONS
// ============================================================================

class DreamDimension extends Location {
    constructor(index) {
        super('L028', 'Dream Dimension',
            'On turn 5, cards cost 1 more.', index);
    }

    // Cost modification would need to be applied in hand/planning phase
    getCostModifier(game) {
        if (game.currentTurn === 5) {
            return 1;
        }
        return 0;
    }
}

class Elysium extends Location {
    constructor(index) {
        super('L029', 'Elysium',
            'Cards cost 1 less.', index);
    }

    getCostModifier(game) {
        return -1;
    }
}

// ============================================================================
// ONGOING POWER BONUS LOCATIONS
// ============================================================================

class BaxterBuilding extends Location {
    constructor(index) {
        super('L012', 'Baxter Building',
            'Whoever is winning this location gets +4 Power at the others.', index);
    }

    onGoing(game) {
        const winner = this.getWinningPlayer(game);

        // Clear previous bonuses
        for (let i = 0; i < game.locations.length; i++) {
            if (game.locations[i] === this) continue;

            const allCards = game.locations[i].getAllCards();
            for (let j = 0; j < allCards.length; j++) {
                allCards[j].removeModifier('baxterbuilding_ongoing');
            }
        }

        if (!winner) return;

        // Apply +4 to winner's cards at other locations
        for (let i = 0; i < game.locations.length; i++) {
            if (game.locations[i] === this) continue;

            const cards = game.locations[i].getCards(winner);
            for (let j = 0; j < cards.length; j++) {
                if (cards[j].isRevealed() && !cards[j].hasModifier('baxterbuilding_ongoing')) {
                    cards[j].addModifier('baxterbuilding_ongoing', 4);
                }
            }
        }
    }
}

class ClownCity extends Location {
    constructor(index) {
        super('L022', 'Clown City',
            'Whoever is losing here has +4 Power at adjacent locations.', index);
    }

    onGoing(game) {
        const winner = this.getWinningPlayer(game);
        const loser = winner ? game.getOpponent(winner) : null;

        // Get adjacent locations
        const adjacentIndices = [];
        if (this.index > 0) adjacentIndices.push(this.index - 1);
        if (this.index < game.locations.length - 1) adjacentIndices.push(this.index + 1);

        // Clear previous bonuses at adjacent locations
        for (let i = 0; i < adjacentIndices.length; i++) {
            const loc = game.locations[adjacentIndices[i]];
            const allCards = loc.getAllCards();
            for (let j = 0; j < allCards.length; j++) {
                allCards[j].removeModifier('clowncity_ongoing');
            }
        }

        if (!loser) return;

        // Apply +4 to loser's cards at adjacent locations
        for (let i = 0; i < adjacentIndices.length; i++) {
            const loc = game.locations[adjacentIndices[i]];
            const cards = loc.getCards(loser);
            for (let j = 0; j < cards.length; j++) {
                if (cards[j].isRevealed() && !cards[j].hasModifier('clowncity_ongoing')) {
                    cards[j].addModifier('clowncity_ongoing', 4);
                }
            }
        }
    }
}

class CrownCity extends Location {
    constructor(index) {
        super('L024', 'Crown City',
            'Whoever is winning here gets +4 Power at adjacent locations.', index);
    }

    onGoing(game) {
        const winner = this.getWinningPlayer(game);

        // Get adjacent locations
        const adjacentIndices = [];
        if (this.index > 0) adjacentIndices.push(this.index - 1);
        if (this.index < game.locations.length - 1) adjacentIndices.push(this.index + 1);

        // Clear previous bonuses at adjacent locations
        for (let i = 0; i < adjacentIndices.length; i++) {
            const loc = game.locations[adjacentIndices[i]];
            const allCards = loc.getAllCards();
            for (let j = 0; j < allCards.length; j++) {
                allCards[j].removeModifier('crowncity_ongoing');
            }
        }

        if (!winner) return;

        // Apply +4 to winner's cards at adjacent locations
        for (let i = 0; i < adjacentIndices.length; i++) {
            const loc = game.locations[adjacentIndices[i]];
            const cards = loc.getCards(winner);
            for (let j = 0; j < cards.length; j++) {
                if (cards[j].isRevealed() && !cards[j].hasModifier('crowncity_ongoing')) {
                    cards[j].addModifier('crowncity_ongoing', 4);
                }
            }
        }
    }
}

// ============================================================================
// SPECIAL WIN CONDITION LOCATIONS
// ============================================================================

class Cancun extends Location {
    constructor(index) {
        super('L016', 'Cancun',
            'Power here doesn\'t count toward winning the game.', index);
    }

    // This location's power doesn't count - handled in GameState.determineWinner
    powerCountsForGame() {
        return false;
    }
}

// ============================================================================
// ENERGY MODIFIER LOCATIONS
// ============================================================================

class CastleBlackstone extends Location {
    constructor(index) {
        super('L017', 'Castle Blackstone',
            'The player winning here gets +1 Energy each turn.', index);
    }

    onTurnStart(game) {
        const winner = this.getWinningPlayer(game);
        if (winner) {
            winner.energy += 1;
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

    // Win condition modifiers
    registry.register('L011', BarWithNoName);
    registry.register('L016', Cancun);

    // Ability modifiers
    registry.register('L044', Knowhere);
    registry.register('L043', KamarTaj);

    // Play restrictions
    registry.register('L080', SanctumSanctorum);
    registry.register('L009', AvengersCompound);
    registry.register('L023', CrimsonCosmos);

    // Clone/copy
    registry.register('L021', CloningVats);
    registry.register('L010', BarSinister);

    // After turn effects
    registry.register('L002', Asgard);
    registry.register('L007', Attilan);
    registry.register('L013', TheBifrost);
    registry.register('L014', Camelot);
    registry.register('L019', CaveOfTheDragon);

    // On reveal effects
    registry.register('L015', CampLehigh);
    registry.register('L020', CelestialBurialGround);
    registry.register('L025', CrystalTowers);

    // Card play effects
    registry.register('L008', AuntMays);
    registry.register('L018', CastleZemo);
    registry.register('L026', DangerRoom);
    registry.register('L027', DeathsDomain);

    // Ongoing power bonuses
    registry.register('L012', BaxterBuilding);
    registry.register('L022', ClownCity);
    registry.register('L024', CrownCity);

    // Cost modifiers
    registry.register('L028', DreamDimension);
    registry.register('L029', Elysium);

    // Energy modifiers
    registry.register('L017', CastleBlackstone);

    console.log('Registered', 30, 'basic locations');
}
