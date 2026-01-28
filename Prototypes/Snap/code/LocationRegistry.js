/**
 * LocationRegistry.js - Location Template Registry
 * Manages location templates and creates instances.
 */

class LocationRegistry {
    constructor() {
        this.locations = {};
        this.locationData = null;
    }

    // ========================================================================
    // REGISTRATION
    // ========================================================================

    /**
     * Register a location class by ID
     * @param {string} id - Location ID
     * @param {class} LocationClass - The location class to instantiate
     */
    register(id, LocationClass) {
        this.locations[id] = LocationClass;
    }

    /**
     * Register a basic location from JSON data
     */
    registerFromData(data) {
        // Create a basic location (no special abilities)
        // Store the data for creating instances
        this.locations[data.id] = {
            isData: true,
            data: data
        };
    }

    /**
     * Load location data from JSON and register basic locations
     */
    loadFromJSON(locationDataArray) {
        this.locationData = locationDataArray;

        for (let i = 0; i < locationDataArray.length; i++) {
            const data = locationDataArray[i];
            // Only register if not already registered (allows overrides)
            if (!this.locations[data.id]) {
                this.registerFromData(data);
            }
        }
    }

    // ========================================================================
    // RETRIEVAL
    // ========================================================================

    /**
     * Create a new location instance
     * @param {string} id - Location ID
     * @param {number} index - Location index (0, 1, or 2)
     */
    create(id, index) {
        const entry = this.locations[id];

        if (!entry) {
            console.warn('Location not found:', id);
            // Return a basic "Ruins" location as fallback
            return new Location(id, 'Unknown', 'Unknown location', index);
        }

        // If it's a class, instantiate it
        if (typeof entry === 'function') {
            return new entry(index);
        }

        // If it's data, create a basic Location
        if (entry.isData) {
            return new Location(
                entry.data.id,
                entry.data.name,
                entry.data.description,
                index
            );
        }

        return null;
    }

    /**
     * Check if location exists
     */
    has(id) {
        return this.locations.hasOwnProperty(id);
    }

    /**
     * Get all registered location IDs
     */
    getAllIds() {
        return Object.keys(this.locations);
    }

    /**
     * Get random location IDs
     * @param {number} count - Number of locations to get
     * @param {string[]} preferredIds - Preferred IDs to use first
     */
    getRandomIds(count, preferredIds) {
        const available = preferredIds && preferredIds.length > 0
            ? preferredIds.filter(id => this.has(id))
            : this.getAllIds();

        // Shuffle available IDs
        const shuffled = [...available];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }

        return shuffled.slice(0, count);
    }

    /**
     * Create random locations
     * @param {number} count - Number of locations to create
     * @param {string[]} preferredIds - Preferred IDs to use
     */
    createRandom(count, preferredIds) {
        const ids = this.getRandomIds(count, preferredIds);
        const locations = [];

        for (let i = 0; i < ids.length; i++) {
            locations.push(this.create(ids[i], i));
        }

        // If not enough, fill with basic locations
        while (locations.length < count) {
            locations.push(new Location(
                'L_RUINS',
                'Ruins',
                'No special effect.',
                locations.length
            ));
        }

        return locations;
    }

    /**
     * Get location data by ID (from loaded JSON)
     */
    getLocationData(id) {
        if (!this.locationData) return null;
        for (let i = 0; i < this.locationData.length; i++) {
            if (this.locationData[i].id === id) {
                return this.locationData[i];
            }
        }
        return null;
    }
}
