/**
 * GameAction.js - Base Action Class
 * Actions represent discrete game state changes with associated animations.
 */

class GameAction {
    constructor(type, duration) {
        this.type = type;
        this.duration = duration || 500;
        this.elapsed = 0;
        this.executed = false;
        this.animationStarted = false;
    }

    /**
     * Execute the game state change
     * @param {GameState} game - The game state to modify
     */
    execute(game) {
        // Override in subclasses
        this.executed = true;
    }

    /**
     * Update the action's timer
     * @param {number} delta - Time elapsed since last update (ms)
     * @returns {boolean} True if action is complete
     */
    update(delta) {
        this.elapsed += delta;
        return this.isComplete();
    }

    /**
     * Check if action has finished
     */
    isComplete() {
        return this.elapsed >= this.duration;
    }

    /**
     * Get data for the visual layer to animate
     */
    getAnimationData() {
        return {
            type: this.type
        };
    }

    /**
     * Mark animation as started
     */
    startAnimation() {
        this.animationStarted = true;
    }

    /**
     * Check if animation has started
     */
    hasAnimationStarted() {
        return this.animationStarted;
    }
}
