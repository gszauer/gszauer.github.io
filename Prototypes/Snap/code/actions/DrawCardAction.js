/**
 * DrawCardAction.js - Draw a Card from Deck to Hand
 */

class DrawCardAction extends GameAction {
    constructor(player) {
        super('DRAW_CARD', ANIM.DRAW_CARD);
        this.player = player;
        this.drawnCard = null;
    }

    execute(game) {
        this.drawnCard = this.player.drawCard();
        this.executed = true;

        // Trigger onCardAddedToHand for cards that care (The Collector)
        if (this.drawnCard) {
            game.triggerOnCardAddedToHand(this.player, this.drawnCard);
        }
    }

    getAnimationData() {
        return {
            type: this.type,
            player: this.player,
            drawnCard: this.drawnCard
        };
    }
}
