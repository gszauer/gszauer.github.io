/**
 * StarterCards.js - Card Implementations
 * All values match all_cards.txt exactly.
 */

// ============================================================================
// VANILLA CARDS (No ability)
// ============================================================================

class Abomination extends Card {
    constructor() {
        super('C001', 'Abomination', 5, 9, AbilityType.NONE,
            'Foolish rabble! You are beneath me!', 'Starter');
    }
}

class Cyclops extends Card {
    constructor() {
        super('C055', 'Cyclops', 3, 5, AbilityType.NONE,
            "Let's move, X-Men.", 'Starter');
    }
}

class Hulk extends Card {
    constructor() {
        super('C111', 'Hulk', 6, 14, AbilityType.NONE,
            'HULK SMASH!', 'Starter');
    }
}

class MistyKnight extends Card {
    constructor() {
        super('C162', 'Misty Knight', 1, 3, AbilityType.NONE,
            "We've got to save this city.", 'Starter');
    }
}

class Shocker extends Card {
    constructor() {
        super('C213', 'Shocker', 2, 4, AbilityType.NONE,
            '', 'Starter');
    }
}

class TheThing extends Card {
    constructor() {
        super('C237', 'The Thing', 4, 7, AbilityType.NONE,
            "It's clobberin' time!", 'Starter');
    }
}

// ============================================================================
// ON REVEAL CARDS
// ============================================================================

class AbsorbingMan extends Card {
    constructor() {
        super('C002', 'Absorbing Man', 4, 5, AbilityType.ON_REVEAL,
            'On Reveal: If the last card you played has an On Reveal, copy its text. (if able)', 'Series 3');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const lastCard = game.getLastPlayedCard(owner);

        // Check if last card exists and has On Reveal ability
        if (lastCard && lastCard !== playedCard && lastCard.getCard().abilityType === AbilityType.ON_REVEAL) {
            // Copy the On Reveal ability
            const lastCardTemplate = lastCard.getCard();
            if (typeof lastCardTemplate.onReveal === 'function') {
                lastCardTemplate.onReveal(game, playedCard);
            }
        }
    }
}

class Aero extends Card {
    constructor() {
        super('C005', 'Aero', 5, 9, AbilityType.ON_REVEAL,
            'On Reveal: The last card your opponent played moves to this location.', 'Series 3');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const lastCard = game.getLastPlayedCard(opponent);

        if (lastCard && lastCard.getLocation() !== playedCard.getLocation()) {
            // Check if card can be moved
            if (game.canMove(lastCard)) {
                game.moveCard(lastCard, playedCard.getLocation());
            }
        }
    }
}

class Agent13 extends Card {
    constructor() {
        super('C006', 'Agent 13', 1, 2, AbilityType.ON_REVEAL,
            'On Reveal: Add a random card to your hand.', 'Series 2');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();

        if (!owner.hand.isFull()) {
            // Get a random card from the registry
            const randomCard = this.getRandomCard();
            if (randomCard) {
                const handCard = new HandCard(randomCard.clone());
                owner.hand.addCard(handCard);
                game.triggerOnCardAddedToHand(owner, handCard);
            }
        }
    }

    getRandomCard() {
        const allIds = cardRegistry.getAllIds();
        if (allIds.length === 0) return null;
        const randomId = allIds[Math.floor(Math.random() * allIds.length)];
        return cardRegistry.get(randomId);
    }
}

class AgentCoulson extends Card {
    constructor() {
        super('C007', 'Agent Coulson', 3, 4, AbilityType.ON_REVEAL,
            'On Reveal: Add a random 4-Cost and 5-Cost card to your hand.', 'Series 3');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();

        // Add a random 4-cost card
        if (!owner.hand.isFull()) {
            const card4 = this.getRandomCardByCost(4);
            if (card4) {
                const handCard = new HandCard(card4.clone());
                owner.hand.addCard(handCard);
                game.triggerOnCardAddedToHand(owner, handCard);
            }
        }

        // Add a random 5-cost card
        if (!owner.hand.isFull()) {
            const card5 = this.getRandomCardByCost(5);
            if (card5) {
                const handCard = new HandCard(card5.clone());
                owner.hand.addCard(handCard);
                game.triggerOnCardAddedToHand(owner, handCard);
            }
        }
    }

    getRandomCardByCost(cost) {
        const allIds = cardRegistry.getAllIds();
        const matchingCards = [];
        for (let i = 0; i < allIds.length; i++) {
            const card = cardRegistry.get(allIds[i]);
            if (card && card.getCost() === cost) {
                matchingCards.push(card);
            }
        }
        if (matchingCards.length === 0) return null;
        return matchingCards[Math.floor(Math.random() * matchingCards.length)];
    }
}

class AgentVenom extends Card {
    constructor() {
        super('C008', 'Agent Venom', 2, 5, AbilityType.ON_REVEAL,
            'On Reveal: Set the Power of all cards in your deck to 3.', 'Series 5');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const deckCards = owner.deck.getCards();

        for (let i = 0; i < deckCards.length; i++) {
            // Set base power to 3
            deckCards[i].setBasePower(3);
        }
    }
}

class AdamantiumInfusion extends Card {
    constructor() {
        super('C004', 'Adamantium Infusion', 4, 0, AbilityType.ON_REVEAL,
            'On Reveal: Revive your highest-Power destroyed card here with its Power doubled.', 'Series 5');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const destroyed = game.getDestroyedCards(owner);

        if (destroyed.length === 0) return;

        // Find highest power destroyed card
        let highestCard = destroyed[0];
        for (let i = 1; i < destroyed.length; i++) {
            if (destroyed[i].getPower() > highestCard.getPower()) {
                highestCard = destroyed[i];
            }
        }

        // Revive with doubled power (implementation depends on game support)
        // For now, create a copy with doubled power
        const location = playedCard.getLocation();
        if (location.hasSpace(owner)) {
            const cardTemplate = cardRegistry.get(highestCard.getId());
            if (cardTemplate) {
                const handCard = new HandCard(cardTemplate.clone());
                const revivedCard = new PlayedCard(handCard, owner, location, game.currentTurn);
                revivedCard.reveal();
                // Double the power
                revivedCard.addModifier('adamantium_double', highestCard.getBasePower());
                location.addCard(revivedCard);
            }
        }
    }
}

class Alioth extends Card {
    constructor() {
        super('C012', 'Alioth', 6, 8, AbilityType.ON_REVEAL,
            'On Reveal: Remove the text from all unrevealed enemy cards here.', 'Series 5');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const location = playedCard.getLocation();
        const enemyCards = location.getCards(opponent);

        for (let i = 0; i < enemyCards.length; i++) {
            const card = enemyCards[i];
            if (!card.isRevealed()) {
                // Silence the card (remove abilities)
                card.silence();
            }
        }
    }
}

class Medusa extends Card {
    constructor() {
        super('C156', 'Medusa', 2, 2, AbilityType.ON_REVEAL,
            'On Reveal: If this is at the middle location, +3 Power.', 'Starter');
    }

    onReveal(game, playedCard) {
        // Middle location has index 1
        if (playedCard.getLocation().index === 1) {
            game.actionQueue.enqueue(
                new ModifyPowerAction(playedCard, 'medusa_reveal', 3)
            );
        }
    }
}

class Hawkeye extends Card {
    constructor() {
        super('C100', 'Hawkeye', 1, 1, AbilityType.ON_REVEAL,
            'On Reveal: If you play a card at this location next turn, +3 Power.', 'Starter');
    }

    onReveal(game, playedCard) {
        // Set state to watch for next turn
        playedCard.setState('watchingForPlay', true);
        playedCard.setState('watchTurn', game.currentTurn);
        playedCard.setState('watchLocation', playedCard.getLocation().index);
    }

    onTurnEnd(game, playedCard) {
        if (playedCard.getState('watchingForPlay')) {
            const watchTurn = playedCard.getState('watchTurn');

            // Check if we're on the turn after the card was played
            if (game.currentTurn === watchTurn + 1) {
                // Check if player played a card at this location this turn
                const location = playedCard.getLocation();
                const cardsHere = location.getCards(playedCard.getOwner());

                let playedThisTurn = false;
                for (let i = 0; i < cardsHere.length; i++) {
                    const card = cardsHere[i];
                    if (card !== playedCard && card.getTurnPlayed() === game.currentTurn) {
                        playedThisTurn = true;
                        break;
                    }
                }

                if (playedThisTurn) {
                    game.actionQueue.enqueue(
                        new ModifyPowerAction(playedCard, 'hawkeye_watch', 3)
                    );
                }

                // Clear the watch state
                playedCard.clearState('watchingForPlay');
            }
        }
    }
}

class Ironheart extends Card {
    constructor() {
        super('C120', 'Ironheart', 3, 0, AbilityType.ON_REVEAL,
            'On Reveal: Give 2 of your other cards +3 Power.', 'Starter');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();

        // Get all other revealed cards owned by this player
        const allCards = game.getAllRevealedCards();
        const otherCards = [];
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            if (card.getOwner() === owner && card !== playedCard) {
                otherCards.push(card);
            }
        }

        // Shuffle and pick up to 2
        this.shuffleArray(otherCards);
        const targets = otherCards.slice(0, Math.min(2, otherCards.length));

        // Buff the targets
        for (let i = 0; i < targets.length; i++) {
            game.actionQueue.enqueue(
                new ModifyPowerAction(targets[i], 'ironheart_reveal', 3)
            );
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}

class StarLord extends Card {
    constructor() {
        super('C225', 'Star-Lord', 2, 2, AbilityType.ON_REVEAL,
            'On Reveal: If your opponent played a card here this turn, +4 Power.', 'Starter');
    }

    onReveal(game, playedCard) {
        const opponent = game.getOpponent(playedCard.getOwner());
        const location = playedCard.getLocation();
        const opponentCards = location.getCards(opponent);

        // Check if opponent played a card here this turn
        let opponentPlayedHere = false;
        for (let i = 0; i < opponentCards.length; i++) {
            if (opponentCards[i].getTurnPlayed() === game.currentTurn) {
                opponentPlayedHere = true;
                break;
            }
        }

        if (opponentPlayedHere) {
            game.actionQueue.enqueue(
                new ModifyPowerAction(playedCard, 'starlord_reveal', 4)
            );
        }
    }
}

class Sentinel extends Card {
    constructor() {
        super('C208', 'Sentinel', 2, 3, AbilityType.ON_REVEAL,
            'On Reveal: Add another Sentinel to your hand.', 'Starter');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();

        // Create a new Sentinel card and add to hand
        const sentinelTemplate = cardRegistry.get('C208');
        if (sentinelTemplate && !owner.hand.isFull()) {
            const handCard = new HandCard(sentinelTemplate.clone());
            owner.hand.addCard(handCard);

            // Trigger onCardAddedToHand
            game.triggerOnCardAddedToHand(owner, handCard);
        }
    }
}

// ============================================================================
// ONGOING CARDS
// ============================================================================

class AntMan extends Card {
    constructor() {
        super('C017', 'Ant Man', 1, 1, AbilityType.ONGOING,
            'Ongoing: If your side of this location is full, +4 Power.', 'Starter');
    }

    onGoing(game, playedCard) {
        const location = playedCard.getLocation();
        const myCards = location.getRevealedCards(playedCard.getOwner());

        // Check if location is full (4 revealed cards)
        if (myCards.length >= RULES.CARDS_PER_LOCATION) {
            if (!playedCard.hasModifier('antman_ongoing')) {
                playedCard.addModifier('antman_ongoing', 4);
            }
        } else {
            playedCard.removeModifier('antman_ongoing');
        }
    }
}

class IronMan extends Card {
    constructor() {
        super('C118', 'Iron Man', 5, 0, AbilityType.ONGOING,
            'Ongoing: Your total Power is doubled here.', 'Starter');
    }

    // Iron Man's doubling is handled in Location.getPower()
    // No onGoing needed - the Location class checks for Iron Man
}

class Punisher extends Card {
    constructor() {
        super('C190', 'Punisher', 3, 3, AbilityType.ONGOING,
            'Ongoing: +1 Power for each enemy card here.', 'Starter');
    }

    onGoing(game, playedCard) {
        const opponent = game.getOpponent(playedCard.getOwner());
        const location = playedCard.getLocation();
        const enemyCards = location.getCards(opponent);

        // Count revealed enemy cards
        let enemyCount = 0;
        for (let i = 0; i < enemyCards.length; i++) {
            if (enemyCards[i].isRevealed()) {
                enemyCount++;
            }
        }

        // Update modifier
        playedCard.removeModifier('punisher_ongoing');
        if (enemyCount > 0) {
            playedCard.addModifier('punisher_ongoing', enemyCount);
        }
    }
}

class JessicaJones extends Card {
    constructor() {
        super('C124', 'Jessica Jones', 4, 5, AbilityType.ON_REVEAL,
            "On Reveal: If you don't play a card at this location next turn, +5 Power.", 'Starter');
    }

    onReveal(game, playedCard) {
        // Set state to watch for next turn
        playedCard.setState('watchingNoPlay', true);
        playedCard.setState('watchTurn', game.currentTurn);
    }

    onTurnEnd(game, playedCard) {
        if (playedCard.getState('watchingNoPlay')) {
            const watchTurn = playedCard.getState('watchTurn');

            // Check if we're on the turn after the card was played
            if (game.currentTurn === watchTurn + 1) {
                // Check if player did NOT play a card at this location this turn
                const location = playedCard.getLocation();
                const cardsHere = location.getCards(playedCard.getOwner());

                let playedThisTurn = false;
                for (let i = 0; i < cardsHere.length; i++) {
                    const card = cardsHere[i];
                    if (card !== playedCard && card.getTurnPlayed() === game.currentTurn) {
                        playedThisTurn = true;
                        break;
                    }
                }

                if (!playedThisTurn) {
                    game.actionQueue.enqueue(
                        new ModifyPowerAction(playedCard, 'jessicajones_watch', 5)
                    );
                }

                // Clear the watch state
                playedCard.clearState('watchingNoPlay');
            }
        }
    }
}

class Colossus extends Card {
    constructor() {
        super('C050', 'Colossus', 2, 4, AbilityType.ONGOING,
            "Ongoing: Can't be destroyed, moved, or have its Power reduced.", 'Starter');
    }

    // Colossus protection is handled by GameState.canDestroy(), canMove(), canAfflict()
}

class Ajax extends Card {
    constructor() {
        super('C011', 'Ajax', 5, 7, AbilityType.ONGOING,
            'Ongoing: +1 Power for each card in play afflicted with negative Power.', 'Series 5');
    }

    onGoing(game, playedCard) {
        // Count all cards in play with negative power modifiers
        let afflictedCount = 0;
        const allCards = game.getAllRevealedCards();

        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            // Check if card has any negative modifiers
            if (card.hasNegativeModifier && card.hasNegativeModifier()) {
                afflictedCount++;
            } else {
                // Fallback: check if current power < base power
                if (card.getPower() < card.getBasePower()) {
                    afflictedCount++;
                }
            }
        }

        // Update modifier
        playedCard.removeModifier('ajax_ongoing');
        if (afflictedCount > 0) {
            playedCard.addModifier('ajax_ongoing', afflictedCount);
        }
    }
}

// ============================================================================
// END OF TURN CARDS
// ============================================================================

class AdamWarlock extends Card {
    constructor() {
        super('C003', 'Adam Warlock', 2, 0, AbilityType.REACTIVE,
            "End of Turn: Draw a card if you're winning here. Otherwise, +1 Power.", 'Series 3');
    }

    onTurnEnd(game, playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();
        const winner = location.getWinningPlayer(game);

        if (winner === owner) {
            // Draw a card
            game.actionQueue.enqueue(new DrawCardAction(owner));
        } else {
            // +1 Power
            game.actionQueue.enqueue(
                new ModifyPowerAction(playedCard, 'adamwarlock_turn_' + game.currentTurn, 1)
            );
        }
    }
}

// ============================================================================
// REACTIVE CARDS
// ============================================================================

class Angela extends Card {
    constructor() {
        super('C015', 'Angela', 2, 3, AbilityType.REACTIVE,
            'After you play a card here, +1 Power.', 'Starter');
    }

    afterCardPlayedHere(game, playedCard, otherCard) {
        // Only trigger for owner's cards, not self
        if (otherCard.getOwner() === playedCard.getOwner() && otherCard !== playedCard) {
            game.actionQueue.enqueue(
                new ModifyPowerAction(playedCard, 'angela_react_' + game.currentTurn + '_' + Date.now(), 1)
            );
        }
    }
}

class Agony extends Card {
    constructor() {
        super('C009', 'Agony', 1, 3, AbilityType.REACTIVE,
            'After you play a card here, merge this into it.', 'Series 4');
    }

    afterCardPlayedHere(game, playedCard, otherCard) {
        // Only trigger for owner's cards, not self
        if (otherCard.getOwner() === playedCard.getOwner() && otherCard !== playedCard) {
            // Merge: add this card's power to the other card
            const power = playedCard.getPower();
            game.actionQueue.enqueue(
                new ModifyPowerAction(otherCard, 'agony_merge', power)
            );

            // Destroy this card
            game.destroyCard(playedCard);
        }
    }
}

// ============================================================================
// ON DESTROY CARDS
// ============================================================================

class AirWalker extends Card {
    constructor() {
        super('C010', 'Air-Walker', 3, 4, AbilityType.ON_DESTROY,
            'When Destroyed: Replace this with a 4-Cost card from your hand or deck.', 'Series 4');
    }

    onDestroy(game, playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();

        // Try to find a 4-cost card in hand first
        const handCards = owner.hand.getCards();
        let replacement = null;

        for (let i = 0; i < handCards.length; i++) {
            if (handCards[i].getCost() === 4) {
                replacement = handCards[i];
                owner.hand.removeCard(handCards[i]);
                break;
            }
        }

        // If not in hand, try deck
        if (!replacement) {
            const deckCards = owner.deck.getCards();
            for (let i = 0; i < deckCards.length; i++) {
                if (deckCards[i].getCost() === 4) {
                    replacement = deckCards[i];
                    owner.deck.removeCard(deckCards[i]);
                    break;
                }
            }
        }

        // Play the replacement card at this location
        if (replacement && location.hasSpace(owner)) {
            const newCard = new PlayedCard(replacement, owner, location, game.currentTurn);
            newCard.reveal();
            location.addCard(newCard);
        }
    }
}

// ============================================================================
// NEW CARDS - C021-C028
// ============================================================================

class Armor extends Card {
    constructor() {
        super('C021', 'Armor', 2, 3, AbilityType.ONGOING,
            "Ongoing: Cards here can't be destroyed.", 'Series 1');
    }

    // Armor protection is handled by GameState.canDestroy()
}

class ArnimZola extends Card {
    constructor() {
        super('C022', 'Arnim Zola', 6, 0, AbilityType.ON_REVEAL,
            'On Reveal: Destroy one of your other cards here to copy it at the other locations.', 'Series 3');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();
        const myCards = location.getCards(owner);

        // Find other cards (not this one)
        const otherCards = [];
        for (let i = 0; i < myCards.length; i++) {
            if (myCards[i] !== playedCard && myCards[i].isRevealed()) {
                otherCards.push(myCards[i]);
            }
        }

        if (otherCards.length === 0) return;

        // Pick a random card to destroy
        const targetCard = otherCards[Math.floor(Math.random() * otherCards.length)];
        const cardId = targetCard.getId();

        // Destroy the card
        game.destroyCard(targetCard);

        // Copy to other locations
        for (let i = 0; i < game.locations.length; i++) {
            const otherLocation = game.locations[i];
            if (otherLocation !== location && otherLocation.hasSpace(owner)) {
                const cardTemplate = cardRegistry.get(cardId);
                if (cardTemplate) {
                    const handCard = new HandCard(cardTemplate.clone());
                    const newCard = new PlayedCard(handCard, owner, otherLocation, game.currentTurn);
                    newCard.reveal();
                    otherLocation.addCard(newCard);
                }
            }
        }
    }
}

class AstralProjection extends Card {
    constructor() {
        super('C023', 'Astral Projection', 4, 0, AbilityType.ON_REVEAL,
            'On Reveal: Copy the text of an On Reveal card in your hand.', 'Series 4');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const handCards = owner.hand.getCards();

        // Find On Reveal cards in hand
        const onRevealCards = [];
        for (let i = 0; i < handCards.length; i++) {
            if (handCards[i].getAbilityType() === AbilityType.ON_REVEAL) {
                onRevealCards.push(handCards[i]);
            }
        }

        if (onRevealCards.length === 0) return;

        // Pick a random On Reveal card and copy its ability
        const targetHandCard = onRevealCards[Math.floor(Math.random() * onRevealCards.length)];
        const targetTemplate = targetHandCard.getCard();

        if (typeof targetTemplate.onReveal === 'function') {
            targetTemplate.onReveal(game, playedCard);
        }
    }
}

class Attuma extends Card {
    constructor() {
        super('C024', 'Attuma', 4, 10, AbilityType.REACTIVE,
            'End of Turn: Destroy one of your cards here with less Power.', 'Series 3');
    }

    onTurnEnd(game, playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();
        const myCards = location.getCards(owner);
        const myPower = playedCard.getPower();

        // Find cards with less power
        const weakerCards = [];
        for (let i = 0; i < myCards.length; i++) {
            const card = myCards[i];
            if (card !== playedCard && card.isRevealed() && card.getPower() < myPower) {
                weakerCards.push(card);
            }
        }

        if (weakerCards.length === 0) return;

        // Destroy a random weaker card
        const target = weakerCards[Math.floor(Math.random() * weakerCards.length)];
        game.destroyCard(target);
    }
}

class BaronMordo extends Card {
    constructor() {
        super('C025', 'Baron Mordo', 3, 3, AbilityType.ON_REVEAL,
            "On Reveal: The top card of your opponent's deck costs 6.", 'Series 3');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const deckCards = opponent.deck.getCards();

        if (deckCards.length === 0) return;

        // Top card is at the end of the array (will be drawn next)
        const topCard = deckCards[deckCards.length - 1];
        // Set its cost to 6 by adding a modifier that brings it to 6
        const currentCost = topCard.getCost();
        topCard.baseCost = 6;
    }
}

class BaronZemo extends Card {
    constructor() {
        super('C026', 'Baron Zemo', 3, 5, AbilityType.ON_REVEAL,
            "On Reveal: Recruit a card that costs the least from your opponent's deck to your side of this location.", 'Series 5');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const location = playedCard.getLocation();
        const deckCards = opponent.deck.getCards();

        if (deckCards.length === 0 || !location.hasSpace(owner)) return;

        // Find lowest cost card
        let lowestCard = deckCards[0];
        let lowestIndex = 0;
        for (let i = 1; i < deckCards.length; i++) {
            if (deckCards[i].getCost() < lowestCard.getCost()) {
                lowestCard = deckCards[i];
                lowestIndex = i;
            }
        }

        // Remove from opponent's deck
        deckCards.splice(lowestIndex, 1);

        // Play on owner's side
        const handCard = new HandCard(lowestCard);
        const newCard = new PlayedCard(handCard, owner, location, game.currentTurn);
        newCard.reveal();
        location.addCard(newCard);
    }
}

class Bast extends Card {
    constructor() {
        super('C027', 'Bast', 1, 1, AbilityType.ON_REVEAL,
            'On Reveal: Set the Power of all cards in your hand to 3.', 'Series 3');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const handCards = owner.hand.getCards();

        for (let i = 0; i < handCards.length; i++) {
            handCards[i].setBasePower(3);
        }
    }
}

class Bastion extends Card {
    constructor() {
        super('C028', 'Bastion', 4, 3, AbilityType.ON_REVEAL,
            'On Reveal: Add copies of your other cards here to your hand. Set their Costs to 2 and Power to 3.', 'Series 5');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();
        const myCards = location.getCards(owner);

        for (let i = 0; i < myCards.length; i++) {
            const card = myCards[i];
            if (card !== playedCard && card.isRevealed() && !owner.hand.isFull()) {
                const cardTemplate = cardRegistry.get(card.getId());
                if (cardTemplate) {
                    const newHandCard = new HandCard(cardTemplate.clone());
                    // Set cost to 2 and power to 3
                    newHandCard.setBasePower(3);
                    newHandCard.addCostModifier('bastion_cost', 2 - newHandCard.getBaseCost());
                    owner.hand.addCard(newHandCard);
                    game.triggerOnCardAddedToHand(owner, newHandCard);
                }
            }
        }
    }
}

// ============================================================================
// NEW CARDS - C039-C052
// ============================================================================

class BruceBanner extends Card {
    constructor() {
        super('C039', 'Bruce Banner', 2, 1, AbilityType.REACTIVE,
            "End of Turn: If you have unspent Energy, 33% chance to turn into the hulk.", 'Series 5');
    }

    onTurnEnd(game, playedCard) {
        const owner = playedCard.getOwner();

        // Check if player has unspent energy
        if (owner.energy > 0) {
            // 33% chance to transform
            if (Math.random() < 0.33) {
                // Transform into Hulk
                game.transformCard(playedCard, 'C111'); // Hulk ID
            }
        }
    }
}

class Cable extends Card {
    constructor() {
        super('C040', 'Cable', 2, 4, AbilityType.ON_REVEAL,
            "On Reveal: Draw a card from your opponent's deck.", 'Series 1');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const deckCards = opponent.deck.getCards();

        if (deckCards.length === 0 || owner.hand.isFull()) return;

        // Draw from opponent's deck (top card)
        const drawnCard = opponent.deck.draw();
        if (drawnCard) {
            owner.hand.addCard(drawnCard);
            game.triggerOnCardAddedToHand(owner, drawnCard);
        }
    }
}

class Caiera extends Card {
    constructor() {
        super('C041', 'Caiera', 3, 4, AbilityType.ONGOING,
            "Ongoing: Your 1 and 6-Cost cards can't be destroyed.", 'Series 5');
    }

    // Protection is handled by GameState.canDestroy()
}

class Cannonball extends Card {
    constructor() {
        super('C042', 'Cannonball', 5, 6, AbilityType.ON_REVEAL,
            "On Reveal: Move the highest-Power enemy card here away. If you can't, destroy it with a Rock.", 'Series 4');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const location = playedCard.getLocation();
        const enemyCards = location.getCards(opponent);

        // Find highest power enemy card
        let highestCard = null;
        let highestPower = -Infinity;
        for (let i = 0; i < enemyCards.length; i++) {
            const card = enemyCards[i];
            if (card.isRevealed() && card.getPower() > highestPower) {
                highestPower = card.getPower();
                highestCard = card;
            }
        }

        if (!highestCard) return;

        // Try to move to another location
        let moved = false;
        for (let i = 0; i < game.locations.length; i++) {
            const otherLocation = game.locations[i];
            if (otherLocation !== location && otherLocation.hasSpace(opponent)) {
                if (game.canMove(highestCard)) {
                    game.moveCard(highestCard, otherLocation);
                    moved = true;
                    break;
                }
            }
        }

        // If couldn't move, destroy and add a Rock
        if (!moved) {
            game.destroyCard(highestCard);
            // Add a Rock to opponent's side (Rock is a 0/1 card)
            if (location.hasSpace(opponent)) {
                const rockCard = new HandCard(new Rock());
                const rock = new PlayedCard(rockCard, opponent, location, game.currentTurn);
                rock.reveal();
                location.addCard(rock);
            }
        }
    }
}

// Rock token for Cannonball
class Rock extends Card {
    constructor() {
        super('TOKEN_ROCK', 'Rock', 0, 1, AbilityType.NONE, '', 'Token');
    }
}

class CaptainAmerica extends Card {
    constructor() {
        super('C043', 'Captain America', 3, 3, AbilityType.ONGOING,
            'Ongoing: Your other Ongoing cards here have +2 Power.', 'Series 1');
    }

    onGoing(game, playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();
        const myCards = location.getCards(owner);

        for (let i = 0; i < myCards.length; i++) {
            const card = myCards[i];
            if (card !== playedCard && card.isRevealed() && !card.isSilenced()) {
                // Check if card has ONGOING ability type
                if (card.getAbilityType() === AbilityType.ONGOING) {
                    if (!card.hasModifier('captainamerica_ongoing')) {
                        card.addModifier('captainamerica_ongoing', 2);
                    }
                } else {
                    card.removeModifier('captainamerica_ongoing');
                }
            }
        }
    }
}

class CaptainMarvel extends Card {
    constructor() {
        super('C044', 'Captain Marvel', 4, 5, AbilityType.REACTIVE,
            'At the end of the game, move to a location that wins you the game. (If possible)', 'Series 3');
    }

    onGameEnd(game, playedCard) {
        const owner = playedCard.getOwner();
        const currentLocation = playedCard.getLocation();

        // Check if we can move
        if (!game.canMove(playedCard)) return;

        // Try each location to see if moving there would win the game
        for (let i = 0; i < game.locations.length; i++) {
            const targetLocation = game.locations[i];
            if (targetLocation === currentLocation) continue;
            if (!targetLocation.hasSpace(owner)) continue;

            // Simulate the move
            const myPower = targetLocation.getPower(owner, game) + playedCard.getPower();
            const currentPowerHere = currentLocation.getPower(owner, game);
            const opponent = game.getOpponent(owner);
            const opponentPower = targetLocation.getPower(opponent, game);

            // Check if moving here would make us win this location
            if (myPower > opponentPower) {
                // Count how many locations we'd win
                let locationsWon = 0;
                for (let j = 0; j < game.locations.length; j++) {
                    const loc = game.locations[j];
                    let ownerPower = loc.getPower(owner, game);
                    let oppPower = loc.getPower(opponent, game);

                    if (loc === currentLocation) {
                        ownerPower -= playedCard.getPower();
                    } else if (loc === targetLocation) {
                        ownerPower += playedCard.getPower();
                    }

                    if (ownerPower > oppPower) {
                        locationsWon++;
                    }
                }

                // If moving wins us the game (2+ locations), do it
                if (locationsWon >= 2) {
                    game.moveCard(playedCard, targetLocation);
                    return;
                }
            }
        }
    }
}

class Carnage extends Card {
    constructor() {
        super('C045', 'Carnage', 2, 2, AbilityType.ON_REVEAL,
            'On Reveal: Destroy your other cards here. +2 Power for each destroyed.', 'Series 1');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const location = playedCard.getLocation();
        const myCards = location.getCards(owner);

        // Collect cards to destroy (not this card)
        const toDestroy = [];
        for (let i = 0; i < myCards.length; i++) {
            const card = myCards[i];
            if (card !== playedCard && card.isRevealed()) {
                toDestroy.push(card);
            }
        }

        // Destroy each card and gain +2 power per destroyed
        let destroyedCount = 0;
        for (let i = 0; i < toDestroy.length; i++) {
            if (game.destroyCard(toDestroy[i])) {
                destroyedCount++;
            }
        }

        if (destroyedCount > 0) {
            game.actionQueue.enqueue(
                new ModifyPowerAction(playedCard, 'carnage_destroy', destroyedCount * 2)
            );
        }
    }
}

class CassandraNova extends Card {
    constructor() {
        super('C046', 'Cassandra Nova', 3, 0, AbilityType.ON_REVEAL,
            "On Reveal: Steal 1 Power from each card in your opponent's deck.", 'Series 5');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const deckCards = opponent.deck.getCards();

        // Steal 1 power from each card
        let stolenPower = 0;
        for (let i = 0; i < deckCards.length; i++) {
            const card = deckCards[i];
            const currentPower = card.getPower();
            if (currentPower > 0) {
                card.setBasePower(card.getPower() - 1);
                stolenPower++;
            }
        }

        if (stolenPower > 0) {
            game.actionQueue.enqueue(
                new ModifyPowerAction(playedCard, 'cassandranova_steal', stolenPower)
            );
        }
    }
}

class Cerebro extends Card {
    constructor() {
        super('C047', 'Cerebro', 3, 0, AbilityType.ONGOING,
            'Ongoing: Your highest-Power cards have +3 Power.', 'Series 3');
    }

    onGoing(game, playedCard) {
        const owner = playedCard.getOwner();
        const allCards = game.getPlayerCards(owner);

        // Find the highest base power among revealed cards
        let highestBasePower = -Infinity;
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            if (card.isRevealed() && card !== playedCard) {
                const basePower = card.getBasePower();
                if (basePower > highestBasePower) {
                    highestBasePower = basePower;
                }
            }
        }

        // Apply +3 to all cards with that base power
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            if (card.isRevealed() && card !== playedCard) {
                if (card.getBasePower() === highestBasePower) {
                    if (!card.hasModifier('cerebro_ongoing')) {
                        card.addModifier('cerebro_ongoing', 3);
                    }
                } else {
                    card.removeModifier('cerebro_ongoing');
                }
            }
        }
    }
}

class Cloak extends Card {
    constructor() {
        super('C048', 'Cloak', 2, 4, AbilityType.ON_REVEAL,
            'On Reveal: Next turn, both players can move cards to this location.', 'Series 2');
    }

    onReveal(game, playedCard) {
        const location = playedCard.getLocation();
        // Set state on the played card to track the effect
        playedCard.setState('cloakActiveTurn', game.currentTurn + 1);
        playedCard.setState('cloakLocation', location.index);
    }

    // Note: The actual movement enabling would need to be handled in the movement system
    // For now, this sets up the state for the effect
}

class ColleenWing extends Card {
    constructor() {
        super('C049', 'Colleen Wing', 2, 3, AbilityType.ON_REVEAL,
            'On Reveal: Discard the card that costs the least from your hand.', 'Series 3');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const handCards = owner.hand.getCards();

        if (handCards.length === 0) return;

        // Find lowest cost card
        let lowestCard = handCards[0];
        for (let i = 1; i < handCards.length; i++) {
            if (handCards[i].getCost() < lowestCard.getCost()) {
                lowestCard = handCards[i];
            }
        }

        // Discard it
        game.discardCard(owner, lowestCard);
    }
}

// C050 Colossus is already implemented above

class CorvusGlaive extends Card {
    constructor() {
        super('C051', 'Corvus Glaive', 3, 5, AbilityType.ON_REVEAL,
            'On Reveal: Discard 2 cards from your hand to get +1 Max Energy.', 'Series 4');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const handCards = owner.hand.getCards();

        // Need at least 2 cards to discard
        if (handCards.length < 2) return;

        // Shuffle and discard 2 random cards
        const shuffled = [...handCards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }

        // Discard 2 cards
        game.discardCard(owner, shuffled[0]);
        game.discardCard(owner, shuffled[1]);

        // Add +1 max energy (bonus energy for next turn)
        owner.addBonusEnergy(1);
    }
}

class CosmicGhostRider extends Card {
    constructor() {
        super('C052', 'Cosmic Ghost Rider', 5, 6, AbilityType.ON_REVEAL,
            'On Reveal: Remove the text from front-row enemy cards here.', 'Series 5');
    }

    onReveal(game, playedCard) {
        const owner = playedCard.getOwner();
        const opponent = game.getOpponent(owner);
        const location = playedCard.getLocation();
        const enemyCards = location.getCards(opponent);

        // "Front-row" typically means the first 2 cards played (indices 0 and 1)
        // Silence them
        for (let i = 0; i < Math.min(2, enemyCards.length); i++) {
            const card = enemyCards[i];
            if (card.isRevealed()) {
                card.silence();
            }
        }
    }
}

// ============================================================================
// SPECIAL CARDS
// ============================================================================

class Quicksilver extends Card {
    constructor() {
        super('C192', 'Quicksilver', 1, 2, AbilityType.NONE,
            'Starts in your opening hand.', 'Starter');
    }

    startsInHand() {
        return true;
    }
}

// ============================================================================
// REGISTRATION
// ============================================================================

function registerStarterCards(registry) {
    // Vanilla cards
    registry.register('C001', Abomination);
    registry.register('C055', Cyclops);
    registry.register('C111', Hulk);
    registry.register('C162', MistyKnight);
    registry.register('C213', Shocker);
    registry.register('C237', TheThing);

    // On Reveal cards
    registry.register('C002', AbsorbingMan);
    registry.register('C004', AdamantiumInfusion);
    registry.register('C005', Aero);
    registry.register('C006', Agent13);
    registry.register('C007', AgentCoulson);
    registry.register('C008', AgentVenom);
    registry.register('C012', Alioth);
    registry.register('C100', Hawkeye);
    registry.register('C120', Ironheart);
    registry.register('C156', Medusa);
    registry.register('C208', Sentinel);
    registry.register('C225', StarLord);

    // Ongoing cards
    registry.register('C011', Ajax);
    registry.register('C017', AntMan);
    registry.register('C021', Armor);
    registry.register('C050', Colossus);
    registry.register('C118', IronMan);
    registry.register('C124', JessicaJones);
    registry.register('C190', Punisher);

    // End of Turn cards
    registry.register('C003', AdamWarlock);
    registry.register('C024', Attuma);

    // Reactive cards
    registry.register('C009', Agony);
    registry.register('C015', Angela);

    // On Destroy cards
    registry.register('C010', AirWalker);

    // On Reveal cards (C022-C028)
    registry.register('C022', ArnimZola);
    registry.register('C023', AstralProjection);
    registry.register('C025', BaronMordo);
    registry.register('C026', BaronZemo);
    registry.register('C027', Bast);
    registry.register('C028', Bastion);

    // New cards (C039-C052)
    registry.register('C039', BruceBanner);
    registry.register('C040', Cable);
    registry.register('C041', Caiera);
    registry.register('C042', Cannonball);
    registry.register('C043', CaptainAmerica);
    registry.register('C044', CaptainMarvel);
    registry.register('C045', Carnage);
    registry.register('C046', CassandraNova);
    registry.register('C047', Cerebro);
    registry.register('C048', Cloak);
    registry.register('C049', ColleenWing);
    registry.register('C051', CorvusGlaive);
    registry.register('C052', CosmicGhostRider);

    // Special cards
    registry.register('C192', Quicksilver);

    console.log('Registered', 50, 'cards');
}
