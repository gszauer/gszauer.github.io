/**
 * PlayedCard.js - Mutable Card Instance on Board
 * When played, a HandCard becomes a PlayedCard on the board.
 */

class PlayedCard {
    constructor(handCard, owner, location, turnPlayed) {
        this.card = handCard.getCard();
        this.owner = owner;
        this.location = location;
        this.turnPlayed = turnPlayed;

        // Reveal state
        this.revealed = false;

        // Power modifiers
        this.modifiers = [];        // Array of { source: string, amount: number }

        // Carry over power modifiers from hand (but not cost modifiers)
        this.inheritedPowerMod = handCard.getPowerDelta();

        // Silenced state (disables ongoing abilities)
        this.silenced = false;

        // Arbitrary state for complex abilities
        this.state = {};

        // Visual reference (set by GameScene)
        this.visual = null;
    }

    // ========================================================================
    // CARD REFERENCE
    // ========================================================================
    getCard() { return this.card; }
    getId() { return this.card.getId(); }
    getName() { return this.card.getName(); }
    getAbilityType() { return this.card.getAbilityType(); }
    getDescription() { return this.card.getDescription(); }

    // ========================================================================
    // OWNERSHIP / POSITION
    // ========================================================================
    getOwner() { return this.owner; }

    setOwner(player) {
        this.owner = player;
    }

    getLocation() { return this.location; }

    setLocation(location) {
        this.location = location;
    }

    getTurnPlayed() { return this.turnPlayed; }

    // ========================================================================
    // REVEAL STATE
    // ========================================================================
    isRevealed() { return this.revealed; }

    reveal() {
        this.revealed = true;
    }

    // ========================================================================
    // POWER METHODS
    // ========================================================================
    getBasePower() {
        return this.card.getPower();
    }

    /**
     * Get current power including all modifiers
     */
    getPower() {
        let power = this.getBasePower() + this.inheritedPowerMod;

        // Add board modifiers
        power += this.sumModifiers(this.modifiers);

        return power;
    }

    /**
     * Add a power modifier
     */
    addModifier(source, amount) {
        this.modifiers.push({ source, amount });
    }

    /**
     * Remove all modifiers from a specific source
     */
    removeModifier(source) {
        this.modifiers = this.modifiers.filter(m => m.source !== source);
    }

    /**
     * Check if a modifier from source exists
     */
    hasModifier(source) {
        for (let i = 0; i < this.modifiers.length; i++) {
            if (this.modifiers[i].source === source) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get modifier amount from a specific source
     */
    getModifierAmount(source) {
        let total = 0;
        for (let i = 0; i < this.modifiers.length; i++) {
            if (this.modifiers[i].source === source) {
                total += this.modifiers[i].amount;
            }
        }
        return total;
    }

    /**
     * Remove all modifiers
     */
    removeAllModifiers() {
        this.modifiers = [];
    }

    getModifiers() {
        return [...this.modifiers];
    }

    /**
     * Get total modifier amount (excluding inherited)
     */
    getModifierTotal() {
        return this.sumModifiers(this.modifiers);
    }

    /**
     * Check if card has been buffed (power increased)
     */
    isBuffed() {
        return this.getPower() > this.getBasePower();
    }

    /**
     * Check if card has been debuffed (power decreased)
     */
    isDebuffed() {
        return this.getPower() < this.getBasePower();
    }

    /**
     * Check if card has any negative power modifiers (for Ajax)
     */
    hasNegativeModifier() {
        for (let i = 0; i < this.modifiers.length; i++) {
            if (this.modifiers[i].amount < 0) {
                return true;
            }
        }
        // Also check inherited modifier
        if (this.inheritedPowerMod < 0) {
            return true;
        }
        return false;
    }

    // ========================================================================
    // SILENCING
    // ========================================================================
    isSilenced() { return this.silenced; }

    silence() {
        this.silenced = true;
        // Remove ongoing modifiers when silenced
        // (Implementation depends on how ongoing abilities are tracked)
    }

    // ========================================================================
    // STATE METHODS (for complex abilities)
    // ========================================================================
    setState(key, value) {
        this.state[key] = value;
    }

    getState(key, defaultValue = null) {
        return this.state.hasOwnProperty(key) ? this.state[key] : defaultValue;
    }

    clearState(key) {
        delete this.state[key];
    }

    hasState(key) {
        return this.state.hasOwnProperty(key);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================
    sumModifiers(modifiers) {
        let sum = 0;
        for (let i = 0; i < modifiers.length; i++) {
            sum += modifiers[i].amount;
        }
        return sum;
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================
    serialize() {
        return {
            cardId: this.getId(),
            ownerId: this.owner.id,
            locationIndex: this.location.index,
            turnPlayed: this.turnPlayed,
            revealed: this.revealed,
            silenced: this.silenced,
            modifiers: this.modifiers.map(m => ({ ...m })),
            inheritedPowerMod: this.inheritedPowerMod,
            state: { ...this.state }
        };
    }

    static deserialize(data, game) {
        const card = game.cardRegistry.get(data.cardId);
        const owner = game.getPlayerById(data.ownerId);
        const location = game.locations[data.locationIndex];

        // Create a minimal HandCard to construct PlayedCard
        const tempHandCard = new HandCard(card.clone());

        const playedCard = new PlayedCard(tempHandCard, owner, location, data.turnPlayed);
        playedCard.revealed = data.revealed;
        playedCard.silenced = data.silenced;
        playedCard.modifiers = data.modifiers || [];
        playedCard.inheritedPowerMod = data.inheritedPowerMod || 0;
        playedCard.state = data.state || {};

        return playedCard;
    }
}
