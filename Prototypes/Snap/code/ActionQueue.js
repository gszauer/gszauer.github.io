/**
 * ActionQueue.js - Sequential Action Processing
 * Processes game actions one at a time with animation support.
 */

class ActionQueue {
    constructor() {
        this.queue = [];
        this.currentAction = null;

        // Callbacks for visual layer
        this.onActionStart = null;
        this.onActionComplete = null;
        this.onQueueEmpty = null;
    }

    // ========================================================================
    // QUEUE MANAGEMENT
    // ========================================================================

    /**
     * Add an action to the queue
     */
    enqueue(action) {
        this.queue.push(action);
    }

    /**
     * Add multiple actions to the queue
     */
    enqueueBatch(actions) {
        for (let i = 0; i < actions.length; i++) {
            this.queue.push(actions[i]);
        }
    }

    /**
     * Add an action to the front of the queue (priority)
     */
    enqueuePriority(action) {
        this.queue.unshift(action);
    }

    /**
     * Clear the queue
     */
    clear() {
        this.queue = [];
        this.currentAction = null;
    }

    // ========================================================================
    // PROCESSING
    // ========================================================================

    /**
     * Process the action queue
     * @param {GameState} game - The game state
     * @param {number} delta - Time since last update (ms)
     */
    process(game, delta) {
        // Start next action if none is current
        if (!this.currentAction && this.queue.length > 0) {
            this.currentAction = this.queue.shift();

            // Execute the action's game state change
            this.currentAction.execute(game);

            // Notify visual layer
            if (this.onActionStart) {
                this.onActionStart(this.currentAction);
            }
        }

        // Update current action
        if (this.currentAction) {
            const complete = this.currentAction.update(delta);

            if (complete) {
                // Notify visual layer
                if (this.onActionComplete) {
                    this.onActionComplete(this.currentAction);
                }

                this.currentAction = null;

                // Check if queue is now empty
                if (this.queue.length === 0 && this.onQueueEmpty) {
                    this.onQueueEmpty();
                }
            }
        }
    }

    // ========================================================================
    // QUERIES
    // ========================================================================

    /**
     * Check if queue is empty (no actions pending or processing)
     */
    isEmpty() {
        return this.queue.length === 0 && this.currentAction === null;
    }

    /**
     * Check if queue has pending actions
     */
    hasPending() {
        return this.queue.length > 0;
    }

    /**
     * Check if an action is currently being processed
     */
    isProcessing() {
        return this.currentAction !== null;
    }

    /**
     * Get number of pending actions
     */
    getPendingCount() {
        return this.queue.length;
    }

    /**
     * Get current action
     */
    getCurrentAction() {
        return this.currentAction;
    }

    /**
     * Peek at next action without removing
     */
    peek() {
        return this.queue[0] || null;
    }
}
