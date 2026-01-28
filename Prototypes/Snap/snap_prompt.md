# Card Battle Game - Design Document

## Overview

A single-player card game inspired by Marvel Snap. Two players compete across three locations over six turns. The player who controls the majority of locations (by having higher total Power) wins.

---

## Core Rules

### Win Condition
- Control 2 of 3 locations at end of turn 6
- A location is controlled by the player with higher total Power there
- Ties at a location mean neither player controls it

### Turn Structure
- Game lasts exactly 6 turns
- Energy equals turn number (turn 1 = 1 energy, turn 6 = 6 energy)
- Energy does not carry over between turns

### Deck Rules
- 12 cards per deck
- Starting hand: 3 cards
- Draw 1 card per turn
- 4 card slots per location per player (12 total board slots)

---

## Game Phases

```
Phase.LOCATION_REVEAL  - Reveal one location (turns 1-3 only)
Phase.PLANNING         - Players select cards and target locations
Phase.CARD_REVEAL      - Cards reveal and abilities trigger
Phase.TURN_END         - End of turn effects resolve
Phase.GAME_OVER        - Winner determined
```

### Per-Turn Flow

1. **Turn Start**
   - Set energy to turn number
   - Trigger `onTurnStart` for all cards and locations

2. **Location Reveal** (turns 1-3)
   - Reveal location at index (turn - 1)
   - Trigger location's `onReveal`

3. **Planning Phase**
   - Both players secretly select cards to play
   - Each play is an Action with player, card, location, and play order

4. **Card Reveal Phase**
   - Calculate priority (lower total power reveals first)
   - Sort actions by: priority → location index → play order
   - Reveal cards one at a time via action queue
   - Trigger `onReveal` abilities as each card flips

5. **Turn End**
   - Trigger `onTurnEnd` for all cards and locations
   - If turn 6, determine winner

---

## Priority System

The player with **lower total Power across all locations** has priority and reveals first.

Ties are broken by a coin flip determined at game start.

Priority matters because:
- Earlier reveals can destroy/move opponent cards before they trigger
- Later reveals have more information

---

## Card System

### Card (Immutable Template)

Cards are pure data templates with hook methods. They are never modified directly.

```javascript
class Card {
    constructor(id, name, cost, power, abilityType) {}

    getId() {}
    getName() {}
    getCost() {}
    getPower() {}
    getAbilityType() {}

    // Hooks - override in subclasses
    onReveal(game, playedCard) {}
    onGoing(game, playedCard) {}
    onMove(game, playedCard, fromLocation, toLocation) {}
    onDestroy(game, playedCard) {}
    onDiscard(game, handCard) {}
    onTurnStart(game, playedCard) {}
    onTurnEnd(game, playedCard) {}
    onGameEnd(game, playedCard) {}

    // Reactive triggers
    afterCardPlayedHere(game, playedCard, otherCard) {}  // Angela, Bishop
    afterAnyCardPlayedHere(game, playedCard, otherCard) {} // Silk, Titania, Negasonic
    afterYouPlayCard(game, playedCard, otherCard) {}     // Bishop (anywhere)
    onCardMovedHere(game, playedCard, movedCard) {}      // Kraven
    onEnemyCardMovedHere(game, playedCard, movedCard) {} // Kingpin
    onCardAddedToHand(game, playedCard, handCard) {}     // The Collector

    // Play restrictions
    canBePlayed(game, player, location) { return true; } // Giganto, Infinaut

    clone() {}
}
```

### Ability Types

```javascript
const AbilityType = {
    NONE: 'none',           // Vanilla, no ability
    ON_REVEAL: 'on_reveal', // Triggers once when revealed
    ONGOING: 'ongoing',     // Passive effect while in play
    ON_DESTROY: 'on_destroy', // Triggers when destroyed (Nova, Deadpool, Nimrod)
    ON_DISCARD: 'on_discard', // Triggers when discarded (Apocalypse, Helicarrier)
    REACTIVE: 'reactive',   // Triggers in response to events (Angela, Bishop, Kraven)
    GAME_END: 'game_end'    // Triggers at end of game (Captain Marvel, Dracula, M'Baku)
};
```

### HandCard (Mutable Instance in Hand)

When drawn, a Card template is cloned into a HandCard. HandCards can receive modifiers (e.g., Scorpion reducing power).

```javascript
class HandCard {
    constructor(card) {}

    getCard() {}
    getId() {}
    getName() {}

    // Cost (can be modified)
    getBaseCost() {}
    getCost() {}
    addCostModifier(source, amount) {}
    removeCostModifier(source) {}

    // Power (can be modified)
    getBasePower() {}
    getPower() {}
    addPowerModifier(source, amount) {}
    removePowerModifier(source) {}
    getModifiers() {}

    // Arbitrary state for complex abilities
    setState(key, value) {}
    getState(key, defaultValue) {}

    // Serialization
    serialize() {}
    static deserialize(data, cardRegistry) {}
}
```

### PlayedCard (Mutable Instance on Board)

When played, a HandCard becomes a PlayedCard on the board.

```javascript
class PlayedCard {
    constructor(handCard, owner, location, turnPlayed) {}

    getCard() {}
    getId() {}
    getName() {}

    // Ownership / position
    getOwner() {}
    setOwner(player) {}
    getLocation() {}
    setLocation(location) {}
    getTurnPlayed() {}

    // Reveal state
    isRevealed() {}
    reveal() {}

    // Power
    getBasePower() {}
    getPower() {}
    addModifier(source, amount) {}
    removeModifier(source) {}
    removeAllModifiers() {}
    getModifiers() {}

    // Silencing (disables ongoing abilities)
    isSilenced() {}
    silence() {}

    // Arbitrary state for complex abilities
    setState(key, value) {}
    getState(key, defaultValue) {}
    clearState(key) {}
    getAllState() {}

    // Serialization
    serialize() {}
    static deserialize(data, cardRegistry, owner, location) {}
}
```

---

## Location System

```javascript
class Location {
    constructor(id, name, index) {}

    getId() {}
    getName() {}
    getIndex() {}               // 0 = left, 1 = middle, 2 = right

    // Card management
    addCard(playedCard) {}
    removeCard(playedCard) {}
    getCards(player) {}
    getAllCards() {}
    hasSpace(player) {}         // Max 4 cards per player
    getSlotCount() {}

    // Power calculation
    getPower(player) {}

    // Reveal state
    isRevealed() {}
    reveal() {}

    // Hooks - override in subclasses
    onReveal(game) {}
    onGoing(game) {}
    onTurnStart(game) {}
    onTurnEnd(game) {}
    afterTurn(game, turnNumber) {}           // Scheduled effects after specific turn
    afterCardPlayedHere(game, playedCard) {} // Altar of Death, Bar Sinister, Shuri's Lab
    afterCardMovedHere(game, movedCard) {}   // Fisk Tower, K'un-Lun
    onLocationFilled(game, player) {}        // The Raft, White Hot Room

    // Play restrictions
    canPlayCard(handCard, player, game) {}   // Cost/turn restrictions
    canMoveHere(game) { return true; }       // New York (turn 6 only)

    // Win condition overrides
    getWinningPlayer(game) { return null; }  // Return player or null for default (Bar With No Name)
    countsForWin() { return true; }          // Cancun returns false

    // Ability modifiers
    doublesOnReveal() { return false; }      // Kamar-Taj returns true
    disablesOnReveal() { return false; }     // Knowhere returns true
    doublesOngoing() { return false; }       // Onslaught's Citadel returns true
    disablesOngoing() { return false; }      // Isle of Silence returns true

    // Cross-location power (for Nexus, Baxter Building, Crown City, Clown City)
    getBonusPowerAtLocation(game, otherLocation, player) { return 0; }

    // Serialization
    serialize() {}
    static deserialize(data, locationRegistry) {}
}
```

### Location Reveal Schedule

| Turn | Location Revealed |
|------|-------------------|
| 1    | Left (index 0)    |
| 2    | Middle (index 1)  |
| 3    | Right (index 2)   |

---

## Deck and Hand

### Deck

Holds Card templates. Drawing clones into HandCard.

```javascript
class Deck {
    constructor(cards) {}

    shuffle() {}
    draw() {}                   // Returns new HandCard
    addCard(card) {}
    addCardToBottom(card) {}
    peek(count) {}
    isEmpty() {}
    getSize() {}

    serialize() {}
    static deserialize(data, cardRegistry) {}
}
```

### Hand

Holds HandCard instances.

```javascript
class Hand {
    constructor(maxSize) {}

    addCard(handCard) {}
    removeCard(handCard) {}
    getCard(index) {}
    getCards() {}
    findById(cardId) {}
    getPlayableCards(energy) {}
    isFull() {}
    getSize() {}

    serialize() {}
    static deserialize(data, cardRegistry) {}
}
```

---

## Player

```javascript
class Player {
    constructor(id, deck) {}

    getId() {}

    // Energy
    getEnergy() {}
    setEnergy(amount) {}
    spendEnergy(amount) {}

    // Card flow
    drawCard() {}               // Deck -> Hand

    // State access
    getHand() {}
    getDeck() {}
    getTotalPower(game) {}
    getPowerAtLocation(location) {}

    // Snap system
    snap() {}
    hasSnapped() {}
    retreat() {}
    hasRetreated() {}

    // Serialization
    serialize() {}
    static deserialize(data, cardRegistry) {}
}
```

---

## Snap System (Stakes/Betting)

Each match is worth Cosmic Cubes.

| Scenario | Stakes |
|----------|--------|
| No snaps | 1 cube |
| One player snapped | 2 cubes |
| Both players snapped | 4 cubes |

Either player can **retreat** to forfeit at current stake value.

---

## Action System

### Planning Action

Represents a player's intent during planning phase.

```javascript
class Action {
    constructor(player, handCard, targetLocation, playOrder) {}

    getPlayer() {}
    getHandCard() {}
    getTargetLocation() {}
    getPlayOrder() {}
}
```

### Action Queue

Processes game actions sequentially with animation support.

```javascript
class ActionQueue {
    constructor() {}

    enqueue(action) {}
    enqueueBatch(actions) {}
    process(deltaTime) {}
    getCurrentAction() {}
    isEmpty() {}
    clear() {}
}
```

### Game Actions

Base class and concrete implementations for all game events.

```javascript
class GameAction {
    constructor(duration) {}

    execute(game) {}            // Apply state change
    update(deltaTime) {}        // Tick animation time
    isComplete() {}
    getType() {}
}

// Concrete actions
class PlayCardAction extends GameAction {
    constructor(handCard, player, location, duration) {}
}

class RevealCardAction extends GameAction {
    constructor(playedCard, duration) {}
}

class DestroyCardAction extends GameAction {
    constructor(playedCard, duration) {}
}

class DiscardCardAction extends GameAction {
    constructor(handCard, player, duration) {}
}

class ModifyPowerAction extends GameAction {
    constructor(target, source, amount, duration) {}
}

class DrawCardAction extends GameAction {
    constructor(player, duration) {}
}

class MoveCardAction extends GameAction {
    constructor(playedCard, toLocation, duration) {}
}

class CreateCardAction extends GameAction {
    constructor(cardId, location, owner, duration) {}
}

class AddToHandAction extends GameAction {
    constructor(cardId, player, duration) {}
}

class SwitchSidesAction extends GameAction {
    constructor(playedCard, duration) {}
}

class RevealLocationAction extends GameAction {
    constructor(location, duration) {}
}

class SilenceCardAction extends GameAction {
    constructor(playedCard, duration) {}
}

class SetPowerAction extends GameAction {
    constructor(target, power, duration) {} // Absolute power (Valkyrie, Taskmaster)
}

class SetCostAction extends GameAction {
    constructor(target, cost, duration) {} // Cost manipulation (Baron Mordo)
}

class ReturnToHandAction extends GameAction {
    constructor(playedCard, duration) {} // Beast, Kitty Pryde, Sabretooth
}

class TransformCardAction extends GameAction {
    constructor(playedCard, newCardId, duration) {} // Bruce Banner → Hulk, Sersi
}

class MergeCardAction extends GameAction {
    constructor(sourceCard, targetCard, duration) {} // Agony, Hulkbuster, Blob
}

class StealPowerAction extends GameAction {
    constructor(source, target, amount, duration) {} // Cassandra Nova, Scream
}

class BanishCardAction extends GameAction {
    constructor(target, duration) {} // Yondu (remove from game, not destroy)
}

class ReviveCardAction extends GameAction {
    constructor(cardId, location, owner, duration) {} // Hela, Ghost Rider, Elixir
}

class ChangeLocationAction extends GameAction {
    constructor(locationIndex, newLocationId, duration) {} // Magik, Scarlet Witch
}

class CopyTextAction extends GameAction {
    constructor(target, sourceCard, duration) {} // Absorbing Man, Mystique, Rogue
}

class ModifyMaxEnergyAction extends GameAction {
    constructor(player, amount, duration) {} // Electro, Corvus Glaive, Wiccan
}

class ModifyBonusEnergyAction extends GameAction {
    constructor(player, amount, turnCount, duration) {} // Psylocke, Hope Summers
}

class SwapLocationsAction extends GameAction {
    constructor(locationIndex1, locationIndex2, duration) {} // Quake
}

class AddToDeckAction extends GameAction {
    constructor(cardId, player, position, duration) {} // Korg adds Rock to opponent's deck
}

class RemoveTextAction extends GameAction {
    constructor(target, duration) {} // Spider-Ham replaces text with "oink!"
}

// Location-specific actions
class ShuffleHandIntoDeckAction extends GameAction {
    constructor(player, duration) {} // Attilan, Crystal Towers
}

class SwapHandsAction extends GameAction {
    constructor(duration) {} // Mindscape
}

class ForcePlayFromHandAction extends GameAction {
    constructor(player, handCard, location, duration) {} // Grand Central, Sakaar
}

class SwapWithDeckAction extends GameAction {
    constructor(playedCard, duration) {} // Quantum Tunnel
}

class SetMaxTurnsAction extends GameAction {
    constructor(turns, duration) {} // Limbo (turn 7)
}

class FloodLocationAction extends GameAction {
    constructor(locationIndex, duration) {} // Eternals' Ark, Flooding → Flooded
}
```

### Animation Flow

1. Abilities queue actions instead of executing directly
2. `Game.update()` processes queue one action at a time
3. Each action has a duration for animation timing
4. Reactions (e.g., Nova triggering on destroy) append to queue
5. Renderer watches current action and plays appropriate animation

---

## Game Class

```javascript
class Game {
    constructor(player1, player2, locations, cardRegistry, locationRegistry) {}

    // Core loop
    update(deltaTime) {}
    render(renderer) {}

    // Turn structure
    startGame() {}
    startTurn() {}
    endTurn() {}

    // Phase management
    getCurrentPhase() {}
    setPhase(phase) {}

    // Actions
    queueAction(action) {}
    getActionQueue() {}

    // Turn state
    getCurrentTurn() {}
    getEnergy() {}

    // Priority
    calculatePriority() {}
    getPriorityPlayer() {}

    // Board queries
    getLocations() {}
    getLocation(index) {}
    getPlayers() {}
    getPlayer(id) {}
    getOpponent(player) {}

    // Card queries
    getAllPlayedCards() {}
    getPlayedCardsForPlayer(player) {}
    getPlayedCardsAtLocation(location) {}
    findPlayedCardsWhere(predicate) {}

    // Effect checks (for reactive cards like Armor, Cosmo)
    canDestroy(playedCard) {}
    canTriggerOnReveal(location) {}
    canMove(playedCard, toLocation) {}
    canAfflict(playedCard) {}          // Luke Cage blocks power reduction
    canPlayCard(handCard, player, location) {} // Check all play restrictions

    // Game history tracking
    getDestroyedCards(player) {}       // For Death, Knull, revive effects
    getDiscardedCards(player) {}       // For Hela, Ghost Rider, Morbius
    getBanishedCards(player) {}        // Cards removed from game (Yondu)
    getLastCardPlayed(player) {}       // For Absorbing Man, Aero, Blink
    getMoveCount(player) {}            // For Hydra Stomper
    getDestroyCount() {}               // For Death cost reduction

    // Board state queries
    hasEmptyLocation(player) {}        // For Warpath
    getUnspentEnergy(player) {}        // For Sunspot, Bruce Banner
    isLocationFull(location, player) {} // For Ant-Man, Dazzler, Elsa
    getCardsWithOngoing(player) {}     // For Spectrum
    getCardsWithNoAbility(player) {}   // For Patriot

    // Location-specific queries
    getWinningPlayerAtLocation(location) {} // For conditional location bonuses
    getAdjacentLocations(location) {}       // For Crown City, Clown City
    getForcedPlayLocation() {}              // Avengers Compound, Pet Mansion
    setForcedPlayLocation(locationIndex) {}
    getFirstCardPlayedThisTurn(player) {}   // For Morag restriction

    // Turn count management
    getMaxTurns() {}                   // Default 6, can be modified by Limbo
    setMaxTurns(turns) {}

    // Energy system
    getMaxEnergy(player) {}
    setMaxEnergy(player, amount) {}
    getBonusEnergy(player) {}
    setBonusEnergy(player, amount) {}

    // Snap system
    snap(player) {}
    retreat(player) {}
    getCubeStakes() {}

    // Win condition
    getWinner() {}
    isGameOver() {}

    // Registries
    getCardRegistry() {}
    getLocationRegistry() {}

    // Serialization
    serialize() {}
    static deserialize(data, cardRegistry, locationRegistry) {}
}
```

---

## Registries

Cards and Locations are registered by ID so serialization can reconstruct them.

```javascript
class CardRegistry {
    constructor() {}

    register(id, cardClass) {}
    create(id) {}
    createHandCard(id) {}
    has(id) {}
    getAll() {}
}

class LocationRegistry {
    constructor() {}

    register(id, locationClass) {}
    create(id, index) {}
    has(id) {}
    getAll() {}
}
```

---

## Serialization

Game state is serialized at turn boundaries for save/resume.

```javascript
class GameState {
    static serialize(game) {}
    static deserialize(data, cardRegistry, locationRegistry) {}
    static toJSON(game) {}
    static fromJSON(json, cardRegistry, locationRegistry) {}
}
```

### Serialized Shape

```javascript
{
    turn: 4,
    phase: 'turn_end',
    cubeStakes: 2,
    priorityPlayerId: 'p1',
    tiebreakWinner: 'p1',

    // Game history tracking
    destroyedCards: {
        p1: [{ cardId: 'card_nova', turnDestroyed: 3 }],
        p2: []
    },
    discardedCards: {
        p1: [{ cardId: 'card_apocalypse', turnDiscarded: 2 }],
        p2: []
    },
    banishedCards: {
        p1: [],
        p2: [{ cardId: 'card_wasp', turnBanished: 1 }]
    },
    moveCount: { p1: 2, p2: 0 },
    destroyCount: 1,

    // Location-related state
    maxTurns: 6,                            // Default 6, Limbo sets to 7
    forcedPlayLocation: null,               // Index for Avengers Compound, Pet Mansion
    firstCardPlayedThisTurn: { p1: 'card_hawkeye', p2: null }, // For Morag

    players: {
        p1: {
            id: 'p1',
            snapped: true,
            energy: 0,
            maxEnergy: 4,        // For Electro, Wiccan effects
            bonusEnergy: 1,      // For Psylocke, Hope Summers effects
            playedLastTurn: true, // For Infinaut restriction
            lastCardPlayed: 'card_medusa',
            deck: ['card_hulk', 'card_nova'],
            hand: [
                { 
                    cardId: 'card_ironman', 
                    costModifiers: [],
                    powerModifiers: [{ source: 'scorpion', amount: -1 }],
                    state: {}
                }
            ]
        },
        p2: { /* ... */ }
    },

    locations: [
        {
            id: 'loc_ruins',
            index: 0,
            revealed: true,
            cards: {
                p1: [
                    { 
                        cardId: 'card_medusa', 
                        revealed: true, 
                        modifiers: [], 
                        silenced: false,
                        state: {} 
                    }
                ],
                p2: []
            }
        },
        { /* ... */ },
        { /* ... */ }
    ]
}
```

---

## Reactive Effect Checks

Some cards block or modify actions. The Game class provides query methods:

- `game.canDestroy(playedCard)` — Returns false if Armor is at that location, or Caiera protects 1/6-cost
- `game.canTriggerOnReveal(location)` — Returns false if Cosmo is at that location
- `game.canMove(playedCard, toLocation)` — Returns false if Colossus, Professor X, or Mercury blocks
- `game.canAfflict(playedCard)` — Returns false if Luke Cage is in play

These are checked before executing destruction, reveals, moves, or power reduction.

---

## Ability Pattern Categories

### Trigger-Based Patterns

| Pattern | Hook | Example Cards |
|---------|------|---------------|
| When revealed | `onReveal()` | Medusa, Ironheart, Odin |
| While in play | `onGoing()` | Iron Man, Blue Marvel, Patriot |
| When destroyed | `onDestroy()` | Nova, Deadpool, Nimrod, Wolverine |
| When discarded | `onDiscard()` | Apocalypse, Helicarrier, Wolverine |
| End of turn | `onTurnEnd()` | Sunspot, Adam Warlock, Black Cat |
| Start of turn | `onTurnStart()` | Kitty Pryde, Nebula |
| End of game | `onGameEnd()` | Captain Marvel, Dracula, M'Baku |
| When this moves | `onMove()` | Human Torch, Dagger, Vulture |
| After you play card here | `afterCardPlayedHere()` | Angela, Elsa Bloodstone |
| After ANY card played here | `afterAnyCardPlayedHere()` | Silk, Titania, Negasonic |
| After you play any card | `afterYouPlayCard()` | Bishop |
| When card moves here | `onCardMovedHere()` | Kraven |
| When enemy card moves here | `onEnemyCardMovedHere()` | Kingpin |
| When card added to hand | `onCardAddedToHand()` | The Collector |

### Power Manipulation Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Add/subtract power modifier | `ModifyPowerAction` | Ironheart, Hazmat, Blue Marvel |
| Set power to exact value | `SetPowerAction` | Valkyrie, Taskmaster, Agent Venom |
| Double power | `ModifyPowerAction` (self) | Black Panther, Human Torch |
| Steal power | `StealPowerAction` | Cassandra Nova, Scream, Silver Sable |
| Power based on condition | `onGoing()` recalculates | Devil Dinosaur, Ronan, Knull |

### Cost Manipulation Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Reduce cost by amount | `SetCostAction` | Zabu, Sera, Death |
| Increase cost | `SetCostAction` | Iceman, Baron Mordo |
| Set cost to exact value | `SetCostAction` | Sabretooth (0), Anti-Venom |
| Swap cost and power | `SetCostAction` + `SetPowerAction` | Mister Negative |

### Card Zone Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Add card to hand | `AddToHandAction` | Agent 13, Sentinel, Moon Girl |
| Add card to location | `CreateCardAction` | Brood, White Tiger, Jubilee |
| Return to hand | `ReturnToHandAction` | Beast, Toxin, Kitty Pryde |
| Discard from hand | `DiscardCardAction` | Blade, Lady Sif, M.O.D.O.K. |
| Shuffle into deck | `AddToDeckAction` | Korg |
| Pull from deck to location | `CreateCardAction` | Baron Zemo |
| Revive destroyed/discarded | `ReviveCardAction` | Hela, Ghost Rider, Elixir |
| Banish (remove from game) | `BanishCardAction` | Yondu |

### Movement Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Move self once | Manual move flag | Nightcrawler, Jeff |
| Move self each turn | `onTurnStart()` move | Vision |
| Move other friendly cards | `MoveCardAction` | Doctor Strange, Heimdall |
| Move enemy cards | `MoveCardAction` | Aero, Magneto, Polaris |
| Pull cards here | `MoveCardAction` | Spider-Man |

### Transform Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Transform into other card | `TransformCardAction` | Bruce Banner → Hulk |
| Transform other cards | `TransformCardAction` | Sersi |
| Merge cards together | `MergeCardAction` | Hulkbuster, Agony, Blob |

### Location Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Replace location | `ChangeLocationAction` | Scarlet Witch, Magik |
| Swap location positions | `SwapLocationsAction` | Quake |
| Copy location to others | `ChangeLocationAction` | Legion |

### Play Restriction Patterns

| Pattern | Implementation | Example Cards |
|---------|----------------|---------------|
| Can only play at specific location | `canBePlayed()` | Giganto (left only) |
| Can't play if condition | `canBePlayed()` | The Infinaut (played last turn) |
| Block cards by cost at location | Location `canAcceptCard()` | Goose (blocks 4-6 cost) |
| Force first card at location | Location ongoing effect | Jean Grey |
| Lock location from new cards | Location ongoing effect | Professor X |

### Text Manipulation Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Copy On Reveal text | `CopyTextAction` | Absorbing Man |
| Copy Ongoing text | `CopyTextAction` | Mystique |
| Steal Ongoing text | `CopyTextAction` + silence | Rogue |
| Remove text (silence) | `SilenceCardAction` | Enchantress, Alioth, Leech |

### Energy Patterns

| Pattern | Action | Example Cards |
|---------|--------|---------------|
| Increase max energy | `ModifyMaxEnergyAction` | Electro, Wiccan |
| Decrease max energy | `ModifyMaxEnergyAction` | Havok |
| Bonus energy next turn | `ModifyBonusEnergyAction` | Psylocke, Hope Summers |

---

## Location Ability Pattern Categories

### Trigger-Based Location Patterns

| Pattern | Hook | Example Locations |
|---------|------|-------------------|
| When location reveals | `onReveal()` | Camp Lehigh, Great Portal, Sokovia |
| While location active | `onGoing()` | Necrosha, Negative Zone, Nidavellir |
| End of every turn | `onTurnEnd()` | Jotunheim, Madripoor, Muir Island, Warrior Falls |
| After specific turn | `afterTurn(turnNumber)` | Asgard (4), Murderworld (3), Stark Tower (5) |
| After card played here | `afterCardPlayedHere()` | Altar of Death, Bar Sinister, Shuri's Lab |
| When card moves here | `afterCardMovedHere()` | Fisk Tower, K'un-Lun |
| When location filled | `onLocationFilled()` | The Raft, White Hot Room |

### Win Condition Modifiers

| Pattern | Implementation | Example Locations |
|---------|----------------|-------------------|
| Reverse win condition | `getWinningPlayer()` returns lowest | Bar With No Name |
| Power doesn't count | `countsForWin()` returns false | Cancun |
| Bonus power at others | `getBonusPowerAtLocation()` | The Nexus, Baxter Building |
| Adjacent location bonus | `getBonusPowerAtLocation()` + `getAdjacentLocations()` | Crown City, Clown City |

### Ability Effect Modifiers

| Pattern | Implementation | Example Locations |
|---------|----------------|-------------------|
| Disable On Reveal | `disablesOnReveal()` returns true | Knowhere |
| Double On Reveal | `doublesOnReveal()` returns true | Kamar-Taj |
| Disable Ongoing | `disablesOngoing()` returns true | Isle of Silence |
| Double Ongoing | `doublesOngoing()` returns true | Onslaught's Citadel |

### Play Restriction Patterns

| Pattern | Implementation | Example Locations |
|---------|----------------|-------------------|
| Block by cost range | `canPlayCard()` checks cost | Crimson Cosmos (1-3), The Big House (4-6) |
| Block by exact cost | `canPlayCard()` checks cost | Hellfire Club (1 only), Plunder Castle (only 6) |
| Block by power | `canPlayCard()` checks power | Pit of Exile (10+ power) |
| Block by turn | `canPlayCard()` checks turn | Kyln (after 4), The Vault (turn 6) |
| Block all plays | `canPlayCard()` returns false | Flooded, Sanctum Sanctorum |
| Force plays here | `game.getForcedPlayLocation()` | Avengers Compound, Pet Mansion |
| First card restriction | `game.getFirstCardPlayedThisTurn()` | Morag |

### Movement Restrictions

| Pattern | Implementation | Example Locations |
|---------|----------------|-------------------|
| Allow moves on turn | `canMoveHere()` checks turn | New York (turn 6 only) |
| Auto-move on play | `afterCardPlayedHere()` + `MoveCardAction` | Spider Island, Asteroid M |
| Mass move after turn | `afterTurn()` + `MoveCardAction` | Bifrost, Strange Academy |

### Power Modification Patterns

| Pattern | Action/Hook | Example Locations |
|---------|-------------|-------------------|
| Static power bonus | `onGoing()` + `ModifyPowerAction` | Nidavellir (+5), Necrosha (-2) |
| Conditional power bonus | `onGoing()` checks condition | Atlantis (+5 if one card), Lake Hellas (+2 to 1-cost) |
| Double power | `afterCardPlayedHere()` + `ModifyPowerAction` | Shuri's Lab |
| Set power after turn | `afterTurn()` + `SetPowerAction` | Camelot (set to 5) |

### Card Zone Actions

| Pattern | Action | Example Locations |
|---------|--------|-------------------|
| Add card to hand | `AddToHandAction` | Camp Lehigh, Cloning Vats, Great Portal |
| Add card to location | `CreateCardAction` | Asgard Besieged, X-Mansion |
| Return to hand | `ReturnToHandAction` | Luke's Bar, Mercworld |
| Shuffle hand to deck | `ShuffleHandIntoDeckAction` | Attilan, Crystal Towers |
| Force play from hand | `ForcePlayFromHandAction` | Grand Central, Sakaar |
| Swap with deck | `SwapWithDeckAction` | Quantum Tunnel |

### Transform Patterns

| Pattern | Action | Example Locations |
|---------|--------|-------------------|
| Transform cards | `TransformCardAction` | Gamma Lab (all → Hulk) |
| Switch sides | `SwitchSidesAction` | Castle Zemo, Oscorp Tower |
| Destroy cards | `DestroyCardAction` | Death's Domain, Murderworld, Hala |
| Revive cards | `ReviveCardAction` | Valley of The Hand |

### Location Transform Patterns

| Pattern | Action | Example Locations |
|---------|--------|-------------------|
| Transform self | `ChangeLocationAction` | Flooding → Flooded, Westview |
| Flood others | `FloodLocationAction` | Eternals' Ark |
| Add turn | `SetMaxTurnsAction` | Limbo (turn 7) |

### Energy Manipulation Patterns

| Pattern | Action | Example Locations |
|---------|--------|-------------------|
| Immediate energy | `onReveal()` + energy modification | Project Pegasus (+5), Tinkerer's Workshop (+1) |
| Energy next turn | `ModifyBonusEnergyAction` | Altar of Death (+2), F.E.A.S.T. (+1 both) |
| Ongoing energy bonus | `onTurnStart()` checks condition | Castle Blackstone, Star Brand Crater, The Superflow |
| Max energy bonus | `ModifyMaxEnergyAction` | Sakaar Grand Prix, White Hot Room |
| Cost reduction | `onGoing()` + cost modifiers | Elysium (-1), Titan (-1 for 6-cost) |

### Cross-Location Effect Patterns

| Pattern | Implementation | Example Locations |
|---------|----------------|-------------------|
| Power affects others | `getBonusPowerAtLocation()` | The Nexus (power granted to all) |
| Winning bonus at others | `getWinningPlayerAtLocation()` + bonus | Baxter Building (+4 at others if winning) |
| Losing bonus at adjacent | `getAdjacentLocations()` + bonus | Clown City (+4 at adjacent if losing) |
| Winning bonus at adjacent | `getAdjacentLocations()` + bonus | Crown City (+4 at adjacent if winning) |

---

## Card State System

For complex abilities (like Hawkeye tracking if a card was played), PlayedCard has a generic state bag:

```javascript
// Hawkeye on reveal
onReveal(game, playedCard) {
    playedCard.setState('watchingForPlay', true);
    playedCard.setState('watchTurn', game.getCurrentTurn());
}

// Hawkeye on turn start
onTurnStart(game, playedCard) {
    if (playedCard.getState('watchingForPlay')) {
        const watchTurn = playedCard.getState('watchTurn');
        if (game.getCurrentTurn() === watchTurn + 1) {
            // Check if card was played at this location last turn
            // Apply +3 power if so
        }
        playedCard.clearState('watchingForPlay');
    }
}
```

This state is serialized automatically.

---

## Summary

### Data Flow

```
Card (template in registry)
    ↓ clone on draw
HandCard (in hand, mutable modifiers)
    ↓ play to board
PlayedCard (on board, mutable modifiers + state)
```

### Turn Flow

```
startTurn()
    → set energy
    → onTurnStart hooks
    → reveal location (turns 1-3)
    
planning phase
    → collect Actions from both players
    
reveal phase
    → sort by priority, location, play order
    → queue RevealCardAction for each
    → process queue (with animations)
    
endTurn()
    → onTurnEnd hooks
    → check win condition
    → serialize state
```

### Serialization

- Serialize at turn boundaries only
- Card/Location IDs reference registry classes
- Modifiers stored as `[{ source, amount }]` arrays
- State stored as key-value objects 
