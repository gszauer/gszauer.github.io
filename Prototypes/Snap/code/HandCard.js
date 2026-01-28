/**
 * HandCard.js - Mutable Card Instance in Hand
 * When drawn, a Card template is cloned into a HandCard.
 * HandCards can receive modifiers (e.g., Scorpion reducing power).
 */

class HandCard {
    constructor(card) {
        this.card = card;
        this.costModifiers = [];    // Array of { source: string, amount: number }
        this.powerModifiers = [];   // Array of { source: string, amount: number }
        this.state = {};            // Arbitrary state for complex abilities
        this.overriddenBasePower = null;  // For Agent Venom and similar effects
    }

    // ========================================================================
    // CARD REFERENCE
    // ========================================================================
    getCard() { return this.card; }
    getId() { return this.card.getId(); }
    getName() { return this.card.getName(); }
    getAbilityType() { return this.card.getAbilityType(); }
    getDescription() { return this.card.getDescription(); }
    getSeries() { return this.card.getSeries(); }

    // ========================================================================
    // COST METHODS
    // ========================================================================
    getBaseCost() {
        return this.card.getCost();
    }

    getCost() {
        const base = this.getBaseCost();
        const modifier = this.sumModifiers(this.costModifiers);
        return Math.max(0, base + modifier);
    }

    addCostModifier(source, amount) {
        this.costModifiers.push({ source, amount });
    }

    removeCostModifier(source) {
        this.costModifiers = this.costModifiers.filter(m => m.source !== source);
    }

    getCostModifiers() {
        return [...this.costModifiers];
    }

    // ========================================================================
    // POWER METHODS
    // ========================================================================
    getBasePower() {
        // Use overridden power if set (Agent Venom)
        if (this.overriddenBasePower !== null) {
            return this.overriddenBasePower;
        }
        return this.card.getPower();
    }

    /**
     * Set the base power to a specific value (Agent Venom)
     */
    setBasePower(power) {
        this.overriddenBasePower = power;
    }

    getPower() {
        const base = this.getBasePower();
        const modifier = this.sumModifiers(this.powerModifiers);
        return base + modifier;
    }

    addPowerModifier(source, amount) {
        this.powerModifiers.push({ source, amount });
    }

    removePowerModifier(source) {
        this.powerModifiers = this.powerModifiers.filter(m => m.source !== source);
    }

    getPowerModifiers() {
        return [...this.powerModifiers];
    }

    /**
     * Get the total power change from modifiers
     */
    getPowerDelta() {
        return this.sumModifiers(this.powerModifiers);
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

    /**
     * Check if card is playable with given energy
     */
    isPlayable(energy) {
        return this.getCost() <= energy;
    }

    // ========================================================================
    // SERIALIZATION
    // ========================================================================
    serialize() {
        return {
            cardId: this.getId(),
            costModifiers: this.costModifiers.map(m => ({ ...m })),
            powerModifiers: this.powerModifiers.map(m => ({ ...m })),
            state: { ...this.state }
        };
    }

    static deserialize(data, cardRegistry) {
        const card = cardRegistry.get(data.cardId);
        const handCard = new HandCard(card.clone());
        handCard.costModifiers = data.costModifiers || [];
        handCard.powerModifiers = data.powerModifiers || [];
        handCard.state = data.state || {};
        return handCard;
    }
}
