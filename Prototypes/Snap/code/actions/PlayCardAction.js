/**
 * PlayCardAction.js - Play a Card from Hand to Board
 */

class PlayCardAction extends GameAction {
    constructor(handCard, player, location) {
        super('PLAY_CARD', ANIM.CARD_PLAY);
        this.handCard = handCard;
        this.player = player;
        this.location = location;
        this.playedCard = null;
    }

    execute(game) {
        // Remove from hand
        this.player.hand.removeCard(this.handCard);

        // Spend energy
        this.player.spendEnergy(this.handCard.getCost());

        // Create played card (face down initially)
        this.playedCard = new PlayedCard(
            this.handCard,
            this.player,
            this.location,
            game.currentTurn
        );

        // Add to location
        this.location.addCard(this.playedCard);

        // Update statistics
        this.player.incrementCardsPlayed();

        // Track last played card for abilities (Absorbing Man, Aero, etc.)
        game.setLastPlayedCard(this.player, this.playedCard);

        this.executed = true;

        // Trigger location's onCardPlayed
        if (this.location.onCardPlayed) {
            this.location.onCardPlayed(game, this.playedCard);
        }
    }

    getAnimationData() {
        return {
            type: this.type,
            handCard: this.handCard,
            player: this.player,
            location: this.location,
            playedCard: this.playedCard
        };
    }
}
