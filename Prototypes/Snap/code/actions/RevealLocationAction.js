/**
 * RevealLocationAction.js - Reveal a Location
 */

class RevealLocationAction extends GameAction {
    constructor(location) {
        super('REVEAL_LOCATION', ANIM.LOCATION_REVEAL);
        this.location = location;
    }

    execute(game) {
        // Reveal the location
        this.location.reveal();

        // Trigger location's onReveal
        if (this.location.onReveal) {
            this.location.onReveal(game);
        }

        this.executed = true;
    }

    getAnimationData() {
        return {
            type: this.type,
            location: this.location
        };
    }
}
