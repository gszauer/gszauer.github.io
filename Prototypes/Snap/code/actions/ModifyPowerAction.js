/**
 * ModifyPowerAction.js - Modify a Card's Power
 */

class ModifyPowerAction extends GameAction {
    constructor(playedCard, source, amount) {
        super('MODIFY_POWER', ANIM.POWER_CHANGE);
        this.playedCard = playedCard;
        this.source = source;
        this.amount = amount;
        this.previousPower = 0;
        this.newPower = 0;
    }

    execute(game) {
        this.previousPower = this.playedCard.getPower();

        // Check if card can have power reduced (Colossus, Luke Cage)
        if (this.amount < 0 && !game.canAfflict(this.playedCard)) {
            // Power reduction blocked
            this.executed = true;
            this.newPower = this.previousPower;
            return;
        }

        // Add modifier
        this.playedCard.addModifier(this.source, this.amount);

        this.newPower = this.playedCard.getPower();
        this.executed = true;
    }

    getAnimationData() {
        return {
            type: this.type,
            playedCard: this.playedCard,
            source: this.source,
            amount: this.amount,
            previousPower: this.previousPower,
            newPower: this.newPower
        };
    }
}
