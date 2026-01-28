/**
 * CardRegistry.js - Card Template Registry
 * Manages card templates and creates instances.
 */

class CardRegistry {
    constructor() {
        this.cards = {};
        this.cardData = null;
    }

    // ========================================================================
    // REGISTRATION
    // ========================================================================

    /**
     * Register a card class by ID
     * @param {string} id - Card ID
     * @param {class} CardClass - The card class to instantiate
     */
    register(id, CardClass) {
        // Create instance from class
        const instance = new CardClass();
        this.cards[id] = instance;
    }

    /**
     * Register a basic card from JSON data
     */
    registerFromData(data) {
        const card = new Card(
            data.id,
            data.name,
            data.cost,
            data.power,
            this.parseAbilityType(data.abilities),
            data.description,
            data.series
        );
        this.cards[data.id] = card;
    }

    /**
     * Load card data from JSON and register basic cards
     */
    loadFromJSON(cardDataArray) {
        this.cardData = cardDataArray;

        for (let i = 0; i < cardDataArray.length; i++) {
            const data = cardDataArray[i];
            // Only register if not already registered (allows overrides)
            if (!this.cards[data.id]) {
                this.registerFromData(data);
            }
        }
    }

    /**
     * Parse ability type from abilities array
     */
    parseAbilityType(abilities) {
        if (!abilities || abilities.length === 0) {
            return AbilityType.NONE;
        }

        // Check for specific ability types
        for (let i = 0; i < abilities.length; i++) {
            const ability = abilities[i].toLowerCase();
            if (ability === 'on reveal') return AbilityType.ON_REVEAL;
            if (ability === 'ongoing') return AbilityType.ONGOING;
            if (ability.includes('when destroyed')) return AbilityType.ON_DESTROY;
            if (ability.includes('when discarded')) return AbilityType.ON_DISCARD;
        }

        // Default to ON_REVEAL if has abilities but no clear type
        if (abilities.length > 0 && abilities[0].toLowerCase() !== 'no ability') {
            return AbilityType.ON_REVEAL;
        }

        return AbilityType.NONE;
    }

    // ========================================================================
    // RETRIEVAL
    // ========================================================================

    /**
     * Get a card template by ID
     */
    get(id) {
        return this.cards[id] || null;
    }

    /**
     * Create a new card instance (clone)
     */
    create(id) {
        const card = this.get(id);
        if (card) {
            return card.clone();
        }
        return null;
    }

    /**
     * Check if card exists
     */
    has(id) {
        return this.cards.hasOwnProperty(id);
    }

    /**
     * Get all registered card IDs
     */
    getAllIds() {
        return Object.keys(this.cards);
    }

    /**
     * Get all card templates
     */
    getAll() {
        const all = [];
        for (const id in this.cards) {
            all.push(this.cards[id]);
        }
        return all;
    }

    /**
     * Get cards by cost
     */
    getByCost(cost) {
        const matching = [];
        for (const id in this.cards) {
            if (this.cards[id].getCost() === cost) {
                matching.push(this.cards[id]);
            }
        }
        return matching;
    }

    /**
     * Get cards by series
     */
    getBySeries(series) {
        const matching = [];
        for (const id in this.cards) {
            if (this.cards[id].getSeries() === series) {
                matching.push(this.cards[id]);
            }
        }
        return matching;
    }

    /**
     * Get random card
     */
    getRandom() {
        const ids = this.getAllIds();
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        return this.get(randomId);
    }

    /**
     * Get random card with specific cost
     */
    getRandomByCost(cost) {
        const matching = this.getByCost(cost);
        if (matching.length === 0) return null;
        return matching[Math.floor(Math.random() * matching.length)];
    }

    /**
     * Get card data by ID (from loaded JSON)
     */
    getCardData(id) {
        if (!this.cardData) return null;
        for (let i = 0; i < this.cardData.length; i++) {
            if (this.cardData[i].id === id) {
                return this.cardData[i];
            }
        }
        return null;
    }
}
