/**
 * RevealCardAction.js - Reveal a Played Card and Trigger On-Reveal
 */

class RevealCardAction extends GameAction {
    constructor(playedCard) {
        super('REVEAL_CARD', ANIM.CARD_FLIP);
        this.playedCard = playedCard;
        this.triggeredAbility = false;
    }

    execute(game) {
        // Reveal the card
        this.playedCard.reveal();

        const card = this.playedCard.getCard();
        const location = this.playedCard.getLocation();

        // Check for on-reveal abilities
        if (card.getAbilityType() === AbilityType.ON_REVEAL) {
            // Check if location disables on-reveal
            if (!location.disablesOnReveal()) {
                // Trigger on-reveal
                card.onReveal(game, this.playedCard);
                this.triggeredAbility = true;

                // Check if location doubles on-reveal (Kamar-Taj)
                if (location.doublesOnReveal()) {
                    card.onReveal(game, this.playedCard);
                }
            }
        }

        // Trigger reactive effects for cards already at this location
        this.triggerReactiveEffects(game);

        // Trigger location's onCardRevealed
        if (location.onCardRevealed) {
            location.onCardRevealed(game, this.playedCard);
        }

        this.executed = true;
    }

    /**
     * Trigger reactive effects for cards at this location
     */
    triggerReactiveEffects(game) {
        const location = this.playedCard.getLocation();
        const owner = this.playedCard.getOwner();
        const allCards = location.getAllCards();

        for (let i = 0; i < allCards.length; i++) {
            const otherCard = allCards[i];

            // Skip self
            if (otherCard === this.playedCard) continue;

            // Skip unrevealed cards
            if (!otherCard.isRevealed()) continue;

            // Skip silenced cards
            if (otherCard.isSilenced()) continue;

            const card = otherCard.getCard();

            // afterCardPlayedHere - for same owner (Angela, Bishop)
            if (otherCard.getOwner() === owner) {
                if (card.afterCardPlayedHere) {
                    card.afterCardPlayedHere(game, otherCard, this.playedCard);
                }
            }

            // afterAnyCardPlayedHere - for any card (Silk, Titania)
            if (card.afterAnyCardPlayedHere) {
                card.afterAnyCardPlayedHere(game, otherCard, this.playedCard);
            }
        }

        // Trigger afterYouPlayCard for all of owner's cards anywhere
        const ownerCards = game.getAllPlayedCards().filter(
            pc => pc.getOwner() === owner && pc !== this.playedCard && pc.isRevealed()
        );

        for (let i = 0; i < ownerCards.length; i++) {
            const otherCard = ownerCards[i];
            if (!otherCard.isSilenced()) {
                const card = otherCard.getCard();
                if (card.afterYouPlayCard) {
                    card.afterYouPlayCard(game, otherCard, this.playedCard);
                }
            }
        }
    }

    getAnimationData() {
        return {
            type: this.type,
            playedCard: this.playedCard,
            triggeredAbility: this.triggeredAbility
        };
    }
}
