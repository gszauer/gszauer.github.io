/**
 * GameScene.js - Main Gameplay Scene
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.GAME_WIDTH = LAYOUT.GAME_WIDTH;
        this.GAME_HEIGHT = LAYOUT.GAME_HEIGHT;
    }

    init() {
        this.allowInput = false;
        this.draggedCard = null;
        this.highlightedLocation = null;
        this.plannedHandCards = [];  // Track cards that are planned but not yet played
        this.cardModalVisible = false;
        this.cardModal = null;
    }

    create() {
        // Root container for scaling
        this.rootContainer = this.add.container(0, 0);

        // Background
        const bg = this.add.rectangle(
            this.GAME_WIDTH / 2,
            this.GAME_HEIGHT / 2,
            this.GAME_WIDTH,
            this.GAME_HEIGHT,
            COLORS.BACKGROUND
        );
        this.rootContainer.add(bg);

        // Initialize game state
        this.initializeGame();

        // Create visual components
        this.createBoard();
        this.createHand();
        this.createUI();

        // Setup input
        this.setupInput();

        // Connect action queue to animations
        this.gameState.actionQueue.onActionStart = (action) => this.onActionStart(action);
        this.gameState.actionQueue.onActionComplete = (action) => this.onActionComplete(action);
        this.gameState.actionQueue.onQueueEmpty = () => this.onQueueEmpty();

        // Scale and position
        this.scaleAndPosition();
        this.scale.on('resize', this.handleResize, this);

        // Start game
        this.turnManager.startTurn();
    }

    initializeGame() {
        // Randomly select decks for player and AI
        const playerDeckIds = ALL_DECK_IDS[Math.floor(Math.random() * ALL_DECK_IDS.length)];
        let aiDeckIds = ALL_DECK_IDS[Math.floor(Math.random() * ALL_DECK_IDS.length)];

        // Try to give AI a different deck if possible
        if (aiDeckIds === playerDeckIds && ALL_DECK_IDS.length > 1) {
            const otherDecks = ALL_DECK_IDS.filter(d => d !== playerDeckIds);
            aiDeckIds = otherDecks[Math.floor(Math.random() * otherDecks.length)];
        }

        const playerDeck = new Deck(playerDeckIds, cardRegistry);
        const aiDeck = new Deck(aiDeckIds, cardRegistry);

        // Create players
        const player = new Player('player', playerDeck, false);
        const ai = new Player('ai', aiDeck, true);

        // Create locations (random 3 from basic set)
        const locations = locationRegistry.createRandom(3, BASIC_LOCATION_IDS);

        // Create game state
        this.gameState = new GameState(
            player, ai, locations,
            cardRegistry, locationRegistry
        );

        // AI controller
        this.aiController = new AIController(ai);

        // Turn manager
        this.turnManager = new TurnManager(this.gameState);
        this.turnManager.setAIController(this.aiController);

        // Draw initial hands
        player.drawInitialHand();
        ai.drawInitialHand();

        console.log('Game initialized');
        console.log('Player hand:', player.hand.getCards().map(c => c.getName()));
    }

    createBoard() {
        this.boardVisual = new BoardVisual(
            this,
            this.GAME_WIDTH / 2,
            LAYOUT.BOARD_CENTER_Y,
            this.gameState
        );
        this.rootContainer.add(this.boardVisual);

        // Setup location click callbacks
        for (let i = 0; i < this.boardVisual.locationVisuals.length; i++) {
            const lv = this.boardVisual.locationVisuals[i];
            lv.onLocationClicked = (location) => this.onLocationClicked(location);
        }
    }

    createHand() {
        this.handVisual = new HandVisual(
            this,
            this.GAME_WIDTH / 2,
            LAYOUT.HAND_Y,
            this.gameState.players[0].hand
        );
        this.rootContainer.add(this.handVisual);

        // Setup hand callbacks
        this.handVisual.onCardDragStart = (cv, hc) => this.onCardDragStart(cv, hc);
        this.handVisual.onCardDrag = (cv, hc, x, y) => this.onCardDrag(cv, hc, x, y);
        this.handVisual.onCardDragEnd = (cv, hc, x, y) => this.onCardDragEnd(cv, hc, x, y);
        this.handVisual.onCardClicked = (cv, hc) => this.onCardClicked(cv);

        this.handVisual.refresh();

        // Gray out cards initially since we can't play yet
        this.handVisual.highlightPlayable(-999);
    }

    createUI() {
        // Header
        this.createHeader();

        // Bottom bar
        this.createBottomBar();
    }

    createHeader() {
        const headerY = LAYOUT.HEADER_Y;

        // Turn counter
        this.turnText = this.add.text(this.GAME_WIDTH / 2, headerY, 'Turn 1', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.rootContainer.add(this.turnText);

        // Player info (left)
        this.playerInfoText = this.add.text(100, headerY, 'YOU', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: COLORS.PRIMARY_HEX
        }).setOrigin(0, 0.5);
        this.rootContainer.add(this.playerInfoText);

        // Enemy info (right)
        this.enemyInfoText = this.add.text(this.GAME_WIDTH - 100, headerY, 'ENEMY', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: COLORS.RETREAT_HEX
        }).setOrigin(1, 0.5);
        this.rootContainer.add(this.enemyInfoText);
    }

    createBottomBar() {
        const barY = LAYOUT.BOTTOM_BAR_Y;

        // Energy display
        this.energyText = this.add.text(this.GAME_WIDTH / 2, barY, '1', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '48px',
            color: COLORS.ENERGY_HEX,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.rootContainer.add(this.energyText);

        // Energy label
        this.energyLabel = this.add.text(this.GAME_WIDTH / 2, barY + 40, 'ENERGY', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
        this.rootContainer.add(this.energyLabel);

        // End Turn button
        this.createEndTurnButton();

        // Retreat button
        this.createRetreatButton();
    }

    createEndTurnButton() {
        const x = this.GAME_WIDTH - 150;
        const y = LAYOUT.BOTTOM_BAR_Y;
        const w = 200;
        const h = 60;

        this.endTurnBg = this.add.graphics();
        this.endTurnBg.fillStyle(COLORS.SUCCESS, 1);
        this.endTurnBg.fillRoundedRect(x - w/2, y - h/2, w, h, 8);
        this.rootContainer.add(this.endTurnBg);

        this.endTurnText = this.add.text(x, y, 'END TURN', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.rootContainer.add(this.endTurnText);

        this.endTurnHit = this.add.rectangle(x, y, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.rootContainer.add(this.endTurnHit);

        this.endTurnHit.on('pointerdown', () => this.onEndTurnClicked());
    }

    createRetreatButton() {
        const x = 150;
        const y = LAYOUT.BOTTOM_BAR_Y;
        const w = 150;
        const h = 50;

        this.retreatBg = this.add.graphics();
        this.retreatBg.fillStyle(COLORS.RETREAT, 0.5);
        this.retreatBg.fillRoundedRect(x - w/2, y - h/2, w, h, 8);
        this.rootContainer.add(this.retreatBg);

        this.retreatText = this.add.text(x, y, 'RETREAT', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.rootContainer.add(this.retreatText);

        this.retreatHit = this.add.rectangle(x, y, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.rootContainer.add(this.retreatHit);

        this.retreatHit.on('pointerdown', () => this.onRetreatClicked());
    }

    setupInput() {
        // Global drag handling is done through HandVisual callbacks
    }

    // ========================================================================
    // CARD DRAG HANDLING
    // ========================================================================

    onCardDragStart(cardVisual, handCard) {
        if (!this.allowInput) {
            this.handVisual.returnCard(cardVisual);
            return;
        }

        this.draggedCard = { visual: cardVisual, handCard: handCard };

        // Update blocked indicators to show where this card can't be played
        this.updateBlockedIndicatorsForCard(handCard);
    }

    onCardDrag(cardVisual, handCard, worldX, worldY) {
        // Update any visual feedback during drag if needed
        // Blocked indicators are already shown from dragStart
    }

    onCardDragEnd(cardVisual, handCard, worldX, worldY) {
        // Clear blocked indicators
        this.clearBlockedIndicators();

        if (!this.allowInput || !this.draggedCard) {
            this.handVisual.returnCard(cardVisual);
            this.draggedCard = null;
            return;
        }

        // Find drop target using world coordinates
        // boardVisual.getDropTarget handles the coordinate conversion internally
        const target = this.boardVisual.getDropTarget(worldX, worldY);

        if (target && target.isPlayer) {
            // Try to plan the card
            if (this.tryPlanCard(handCard, target.location)) {
                // Card was planned - animate to location
                this.animateCardToLocation(cardVisual, handCard, target.location);
            } else {
                // Can't play here - return to hand
                this.handVisual.returnCard(cardVisual);
            }
        } else {
            // Not a valid drop target - return to hand
            this.handVisual.returnCard(cardVisual);
        }

        this.draggedCard = null;
        this.boardVisual.clearHighlights();
    }

    /**
     * Update blocked indicators on all locations for a specific card being dragged
     */
    updateBlockedIndicatorsForCard(handCard) {
        const player = this.gameState.players[0];
        const locationVisuals = this.boardVisual.getLocationVisuals();

        for (let i = 0; i < locationVisuals.length; i++) {
            locationVisuals[i].updateBlockedIndicators(player, this.gameState, handCard);
        }
    }

    /**
     * Clear all blocked indicators (when drag ends)
     */
    clearBlockedIndicators() {
        const locationVisuals = this.boardVisual.getLocationVisuals();

        for (let i = 0; i < locationVisuals.length; i++) {
            locationVisuals[i].clearBlockedIndicators();
        }
    }

    tryPlanCard(handCard, location) {
        // Check if can play
        const player = this.gameState.players[0];
        const remainingEnergy = this.turnManager.getRemainingEnergy();

        if (handCard.getCost() > remainingEnergy) {
            console.log('Not enough energy');
            return false;
        }

        if (!location.hasSpace(player)) {
            console.log('Location full');
            return false;
        }

        // Plan the card
        return this.turnManager.playerPlansCard(handCard, location);
    }

    animateCardToLocation(cardVisual, handCard, location) {
        // Get the card's world position before removing
        const cardWorldPos = this.handVisual.getWorldPoint(cardVisual.x, cardVisual.y);

        // Convert world position to rootContainer-local coordinates
        const startPos = this.getLocalPoint(cardWorldPos.x, cardWorldPos.y);

        // Remove from hand visual (but don't refresh yet - we'll track planned cards)
        const removedVisual = this.handVisual.removeCard(handCard);

        // Get target position (already in rootContainer-local coordinates)
        const endPos = this.boardVisual.getNextSlotPosition(location.index, true);

        // Create new card visual for board (face down) at the correct starting position
        const boardCard = new CardVisual(
            this,
            startPos.x,
            startPos.y,
            handCard,
            LAYOUT.CARD_WIDTH_BOARD,
            LAYOUT.CARD_HEIGHT_BOARD
        );
        boardCard.showBack();
        boardCard.plannedCard = handCard;
        this.rootContainer.add(boardCard);

        // Animate to slot
        this.tweens.add({
            targets: boardCard,
            x: endPos.x,
            y: endPos.y,
            scaleX: LAYOUT.CARD_WIDTH_BOARD / LAYOUT.CARD_WIDTH,
            scaleY: LAYOUT.CARD_HEIGHT_BOARD / LAYOUT.CARD_HEIGHT,
            duration: ANIM.CARD_PLAY,
            ease: ANIM.EASE_OUT,
            onComplete: () => {
                // Add to location visual
                const lv = this.boardVisual.getLocationVisual(location.index);
                boardCard.setPosition(0, 0);
                boardCard.setScale(1);
                lv.addCardVisual(boardCard, true);
            }
        });

        // Destroy original card visual
        cardVisual.destroy();

        // Track this as a planned card so it doesn't reappear in hand
        this.plannedHandCards.push(handCard);
        this.handVisual.setExcludedCards(this.plannedHandCards);

        // Refresh hand first (will exclude planned cards), then update UI to apply highlighting
        this.handVisual.refresh();
        this.updateUI();
    }

    // ========================================================================
    // BUTTON HANDLERS
    // ========================================================================

    onEndTurnClicked() {
        if (!this.allowInput) return;
        if (this.gameState.currentPhase !== Phase.PLANNING) return;

        console.log('End Turn clicked');
        this.allowInput = false;
        this.handVisual.disableInteraction();
        this.updateUI(); // Gray out cards immediately

        // Start reveal phase
        this.turnManager.startRevealPhase();
    }

    onRetreatClicked() {
        if (this.gameState.isGameOver()) return;

        console.log('Retreat clicked');
        this.gameState.players[0].retreat();
        this.turnManager.endGame();
        this.showGameOver();
    }

    // ========================================================================
    // ACTION QUEUE CALLBACKS
    // ========================================================================

    onActionStart(action) {
        console.log('Action start:', action.type);
        this.playActionAnimation(action);
    }

    onActionComplete(action) {
        console.log('Action complete:', action.type);

        // Check for pending reveals after all cards are played
        if (action.type === 'PLAY_CARD' && !this.gameState.actionQueue.hasPending()) {
            // All play actions done, now reveal
            this.turnManager.processReveals();
        }
    }

    onQueueEmpty() {
        console.log('Queue empty, phase:', this.gameState.currentPhase);
        this.handlePhaseTransition();
    }

    playActionAnimation(action) {
        const data = action.getAnimationData();

        switch (action.type) {
            case 'REVEAL_LOCATION':
                this.animateRevealLocation(data);
                break;

            case 'DRAW_CARD':
                this.animateDrawCard(data);
                break;

            case 'PLAY_CARD':
                this.animatePlayCard(data);
                break;

            case 'REVEAL_CARD':
                this.animateRevealCard(data);
                break;

            case 'MODIFY_POWER':
                this.animateModifyPower(data);
                break;
        }
    }

    animateRevealLocation(data) {
        const lv = this.boardVisual.getLocationVisual(data.location.index);
        lv.reveal();
        // Blocked indicators are now shown only when dragging a card
    }

    animateDrawCard(data) {
        // Refresh hand if player
        if (data.player === this.gameState.players[0] && data.drawnCard) {
            this.handVisual.refresh();
            // Immediately apply correct highlighting state (cards should be grayed out
            // until planning phase actually begins with input enabled)
            this.updateUI();
        }
    }

    animatePlayCard(data) {
        // AI cards need to be created and animated
        if (data.player === this.gameState.players[1]) {
            const location = data.location;
            const lv = this.boardVisual.getLocationVisual(location.index);

            // Create card visual (face down)
            const cardVisual = new CardVisual(
                this,
                0, 0,
                data.handCard,
                LAYOUT.CARD_WIDTH_BOARD,
                LAYOUT.CARD_HEIGHT_BOARD
            );
            cardVisual.showBack();

            // Link to played card
            if (data.playedCard) {
                data.playedCard.visual = cardVisual;
            }

            lv.addCardVisual(cardVisual, false);
        } else {
            // Player card - link visual to played card
            if (data.playedCard) {
                // Find the visual we created during planning
                const cards = data.location.getCards(data.player);
                for (let i = 0; i < cards.length; i++) {
                    if (cards[i] === data.playedCard) {
                        const lv = this.boardVisual.getLocationVisual(data.location.index);
                        const cv = lv.getCardVisual(i, true);
                        if (cv) {
                            data.playedCard.visual = cv;
                        }
                    }
                }
            }
        }
    }

    animateRevealCard(data) {
        const playedCard = data.playedCard;
        if (playedCard.visual) {
            playedCard.visual.setCardData(playedCard);

            // Enable click-to-view on revealed cards
            playedCard.visual.enableClickToView((cv) => this.onCardClicked(cv));

            playedCard.visual.flipToFront(() => {
                // Recalculate ongoing effects (for Ant-Man, Punisher, etc.)
                this.gameState.triggerOnGoing();
                // Update all card visuals to reflect new power values
                this.updateAllCardVisuals();
                // Update power display after reveal
                this.boardVisual.updateAllPowers();
            });
        }
    }

    /**
     * Update all card visuals on the board
     */
    updateAllCardVisuals() {
        for (let i = 0; i < this.gameState.locations.length; i++) {
            const location = this.gameState.locations[i];
            const lv = this.boardVisual.getLocationVisual(i);

            // Update player cards
            const playerCards = location.getCards(this.gameState.players[0]);
            for (let j = 0; j < playerCards.length; j++) {
                if (playerCards[j].visual) {
                    playerCards[j].visual.updateDisplay();
                }
            }

            // Update enemy cards
            const enemyCards = location.getCards(this.gameState.players[1]);
            for (let j = 0; j < enemyCards.length; j++) {
                if (enemyCards[j].visual) {
                    enemyCards[j].visual.updateDisplay();
                }
            }
        }
    }

    animateModifyPower(data) {
        // Flash the card and update power
        if (data.playedCard.visual) {
            const color = data.amount > 0 ? COLORS.CARD_POWER_BUFF : COLORS.CARD_POWER_DEBUFF;
            data.playedCard.visual.flash(color);
            data.playedCard.visual.updateDisplay();
        }

        this.boardVisual.updateAllPowers();
    }

    // ========================================================================
    // PHASE TRANSITIONS
    // ========================================================================

    handlePhaseTransition() {
        const phase = this.gameState.currentPhase;

        switch (phase) {
            case Phase.LOCATION_REVEAL:
                // Wait for location reveal animation to complete before enabling input
                // This prevents cards from appearing enabled during the flip animation
                this.time.delayedCall(ANIM.LOCATION_REVEAL, () => {
                    this.turnManager.enterPlanningPhase();
                    this.allowInput = true;
                    this.plannedHandCards = [];
                    this.handVisual.setExcludedCards([]);
                    this.handVisual.enableInteraction();
                    this.handVisual.refresh();
                    this.updateUI();
                });
                break;

            case Phase.CARD_REVEAL:
                // After all cards revealed, end turn
                this.time.delayedCall(500, () => {
                    this.turnManager.endTurn();

                    // Clear planned cards (they've been played now)
                    this.plannedHandCards = [];
                    this.handVisual.setExcludedCards([]);

                    if (!this.gameState.isGameOver()) {
                        // Start next turn - disable input until planning phase
                        this.allowInput = false;
                        this.handVisual.disableInteraction();
                        this.time.delayedCall(500, () => {
                            this.turnManager.startTurn();
                            this.handVisual.refresh();
                            this.updateUI(); // Update to gray out cards
                        });
                    } else {
                        this.showGameOver();
                    }
                });
                break;

            case Phase.PLANNING:
                // Ready for player input
                this.allowInput = true;
                this.handVisual.enableInteraction();
                this.handVisual.refresh();
                break;

            case Phase.TURN_END:
                // Continue to next turn or game over
                break;

            case Phase.GAME_OVER:
                this.showGameOver();
                break;
        }

        this.updateUI();
    }

    // ========================================================================
    // UI UPDATES
    // ========================================================================

    updateUI() {
        const player = this.gameState.players[0];

        // Turn counter
        this.turnText.setText('Turn ' + this.gameState.currentTurn);

        // Energy - never show below 0
        const remainingEnergy = Math.max(0, this.turnManager.getRemainingEnergy());
        this.energyText.setText(remainingEnergy.toString());

        // Update hand playability - ONLY highlight during planning phase when input allowed
        // Must check BOTH conditions - phase must be PLANNING and allowInput must be true
        const canPlay = this.allowInput === true && this.gameState.currentPhase === Phase.PLANNING;
        if (canPlay && remainingEnergy > 0) {
            this.handVisual.highlightPlayable(remainingEnergy);
        } else {
            // Gray out all cards - pass -999 so nothing is playable
            this.handVisual.highlightPlayable(-999);
        }

        // Update location powers
        this.boardVisual.updateAllPowers();

        // Blocked indicators are now shown only when dragging a card
        // (context-sensitive to the specific card being dragged)

        // Trigger ongoing effects (recalculate powers)
        this.gameState.triggerOnGoing();
    }

    update(time, delta) {
        // Process action queue
        if (!this.gameState.actionQueue.isEmpty()) {
            this.gameState.actionQueue.process(this.gameState, delta);
        }

        // Update UI continuously
        if (this.gameState.currentPhase === Phase.PLANNING) {
            // Could add hover effects, etc.
        }
    }

    // ========================================================================
    // GAME OVER
    // ========================================================================

    showGameOver() {
        const result = this.gameState.determineWinner();

        // Overlay
        const overlay = this.add.rectangle(
            this.GAME_WIDTH / 2,
            this.GAME_HEIGHT / 2,
            this.GAME_WIDTH,
            this.GAME_HEIGHT,
            0x000000, 0.8
        );
        this.rootContainer.add(overlay);

        // Result text
        let resultText;
        if (result.winner === this.gameState.players[0]) {
            resultText = 'VICTORY!';
        } else if (result.winner === this.gameState.players[1]) {
            resultText = 'DEFEAT';
        } else {
            resultText = 'TIE';
        }

        const text = this.add.text(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2 - 100, resultText, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '72px',
            color: result.winner === this.gameState.players[0] ? COLORS.SUCCESS_HEX : COLORS.RETREAT_HEX
        }).setOrigin(0.5);
        this.rootContainer.add(text);

        // Locations won
        const locText = this.add.text(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2,
            'Locations won: ' + result.locationsWon.length, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.rootContainer.add(locText);

        // Play Again button
        this.createPlayAgainButton();
    }

    createPlayAgainButton() {
        const x = this.GAME_WIDTH / 2;
        const y = this.GAME_HEIGHT / 2 + 150;
        const w = 250;
        const h = 60;

        const bg = this.add.graphics();
        bg.fillStyle(COLORS.PRIMARY, 1);
        bg.fillRoundedRect(x - w/2, y - h/2, w, h, 8);
        this.rootContainer.add(bg);

        const text = this.add.text(x, y, 'PLAY AGAIN', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.rootContainer.add(text);

        const hit = this.add.rectangle(x, y, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.rootContainer.add(hit);

        hit.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    // ========================================================================
    // SCALING
    // ========================================================================

    scaleAndPosition() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const scale = Math.min(
            screenWidth / this.GAME_WIDTH,
            screenHeight / this.GAME_HEIGHT
        );

        this.rootContainer.setScale(scale);

        const scaledWidth = this.GAME_WIDTH * scale;
        const scaledHeight = this.GAME_HEIGHT * scale;
        this.rootContainer.setPosition(
            (screenWidth - scaledWidth) / 2,
            (screenHeight - scaledHeight) / 2
        );
    }

    handleResize() {
        this.scaleAndPosition();
    }

    // Helper for coordinate conversion
    getLocalPoint(worldX, worldY) {
        const matrix = this.rootContainer.getWorldTransformMatrix();
        const inverse = matrix.invert();
        return inverse.transformPoint(worldX, worldY);
    }

    // ========================================================================
    // CARD DETAIL MODAL
    // ========================================================================

    /**
     * Show a card detail modal
     */
    showCardModal(cardData) {
        if (this.cardModalVisible) return;
        this.cardModalVisible = true;

        // Create modal container (on top of everything)
        this.cardModal = this.add.container(0, 0);
        this.cardModal.setDepth(1000);

        // Blackout overlay
        this.modalBlackout = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000, 0.8
        );
        this.modalBlackout.setInteractive();
        this.modalBlackout.on('pointerdown', () => this.hideCardModal());
        this.cardModal.add(this.modalBlackout);

        // Large card dimensions (about 40% of screen height)
        const modalCardWidth = 280;
        const modalCardHeight = 400;

        // Card background
        const cardBg = this.add.graphics();
        const cardX = this.scale.width / 2;
        const cardY = this.scale.height / 2 - 50;

        // Shadow
        cardBg.fillStyle(0x000000, 0.5);
        cardBg.fillRoundedRect(cardX - modalCardWidth/2 + 8, cardY - modalCardHeight/2 + 8, modalCardWidth, modalCardHeight, 12);

        // Card body
        cardBg.fillStyle(0x1a1a2e, 1);
        cardBg.fillRoundedRect(cardX - modalCardWidth/2, cardY - modalCardHeight/2, modalCardWidth, modalCardHeight, 12);

        // Border
        const borderColor = COLORS.COMMON;
        cardBg.lineStyle(4, borderColor, 1);
        cardBg.strokeRoundedRect(cardX - modalCardWidth/2, cardY - modalCardHeight/2, modalCardWidth, modalCardHeight, 12);

        this.cardModal.add(cardBg);

        // Artwork area (colored based on cost)
        const artworkColors = [0x4ade80, 0x60a5fa, 0xa78bfa, 0xf472b6, 0xfb923c, 0xef4444, 0xfbbf24];
        const cost = this.getCardCost(cardData);
        const artColor = artworkColors[Math.min(cost, artworkColors.length - 1)];

        const artwork = this.add.graphics();
        artwork.fillStyle(artColor, 1);
        artwork.fillRoundedRect(cardX - modalCardWidth/2 + 12, cardY - modalCardHeight/2 + 12, modalCardWidth - 24, modalCardHeight * 0.45, 8);
        this.cardModal.add(artwork);

        // Name banner
        const bannerY = cardY - modalCardHeight/2 + modalCardHeight * 0.45 + 20;
        const banner = this.add.graphics();
        banner.fillStyle(0x000000, 0.9);
        banner.fillRect(cardX - modalCardWidth/2, bannerY, modalCardWidth, 50);
        this.cardModal.add(banner);

        // Card name
        const name = this.getCardName(cardData);
        const nameText = this.add.text(cardX, bannerY + 25, name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.cardModal.add(nameText);

        // Cost badge (top-left)
        const costBadge = this.add.graphics();
        const badgeRadius = 32;
        const costX = cardX - modalCardWidth/2 + badgeRadius;
        const costY = cardY - modalCardHeight/2 + badgeRadius;
        costBadge.fillStyle(COLORS.CARD_COST, 1);
        costBadge.fillCircle(costX, costY, badgeRadius);
        costBadge.lineStyle(3, 0x000000, 0.5);
        costBadge.strokeCircle(costX, costY, badgeRadius);
        this.cardModal.add(costBadge);

        const costText = this.add.text(costX, costY, cost.toString(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.cardModal.add(costText);

        // Power badge (top-right)
        const power = this.getCardPower(cardData);
        const basePower = this.getCardBasePower(cardData);
        const powerBadge = this.add.graphics();
        const powerX = cardX + modalCardWidth/2 - badgeRadius;
        const powerY = costY;

        let powerColor = COLORS.CARD_POWER;
        if (power > basePower) powerColor = COLORS.CARD_POWER_BUFF;
        else if (power < basePower) powerColor = COLORS.CARD_POWER_DEBUFF;

        powerBadge.fillStyle(powerColor, 1);
        powerBadge.fillCircle(powerX, powerY, badgeRadius);
        powerBadge.lineStyle(3, 0x000000, 0.5);
        powerBadge.strokeCircle(powerX, powerY, badgeRadius);
        this.cardModal.add(powerBadge);

        const powerText = this.add.text(powerX, powerY, power.toString(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.cardModal.add(powerText);

        // Description area with semi-transparent background
        const descY = bannerY + 60;
        const descHeight = modalCardHeight - (descY - (cardY - modalCardHeight/2)) - 15;

        const descBg = this.add.graphics();
        descBg.fillStyle(0x000000, 0.7);
        descBg.fillRoundedRect(cardX - modalCardWidth/2 + 10, descY, modalCardWidth - 20, descHeight, 8);
        this.cardModal.add(descBg);

        // Description text
        const description = this.getCardDescription(cardData);
        const descText = this.add.text(cardX, descY + descHeight/2, description, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: modalCardWidth - 40 },
            align: 'center'
        }).setOrigin(0.5);
        this.cardModal.add(descText);

        // Tap to close hint
        const hintText = this.add.text(cardX, cardY + modalCardHeight/2 + 40, 'Tap anywhere to close', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
        this.cardModal.add(hintText);

        // Animate in
        this.cardModal.setAlpha(0);
        this.tweens.add({
            targets: this.cardModal,
            alpha: 1,
            duration: 150,
            ease: 'Quad.easeOut'
        });
    }

    /**
     * Hide the card detail modal
     */
    hideCardModal() {
        if (!this.cardModalVisible || !this.cardModal) return;

        this.tweens.add({
            targets: this.cardModal,
            alpha: 0,
            duration: 100,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.cardModal.destroy();
                this.cardModal = null;
                this.cardModalVisible = false;
            }
        });
    }

    // Helper methods to get card data regardless of type (HandCard, PlayedCard, or Card)
    getCardName(cardData) {
        if (typeof cardData.getName === 'function') return cardData.getName();
        return '???';
    }

    getCardCost(cardData) {
        if (typeof cardData.getCost === 'function') return cardData.getCost();
        if (cardData.getCard && typeof cardData.getCard().getCost === 'function') {
            return cardData.getCard().getCost();
        }
        return 0;
    }

    getCardPower(cardData) {
        if (typeof cardData.getPower === 'function') return cardData.getPower();
        return 0;
    }

    getCardBasePower(cardData) {
        if (typeof cardData.getBasePower === 'function') return cardData.getBasePower();
        return this.getCardPower(cardData);
    }

    getCardDescription(cardData) {
        if (typeof cardData.getDescription === 'function') return cardData.getDescription();
        return '';
    }

    /**
     * Handle card click (show modal if not dragging)
     */
    onCardClicked(cardVisual) {
        // Don't show modal if we're dragging or if modal is already visible
        if (cardVisual.isDragging || this.cardModalVisible) return;

        // Show the card detail modal
        if (cardVisual.cardData) {
            this.showCardModal(cardVisual.cardData);
        }
    }

    // ========================================================================
    // LOCATION DETAIL MODAL
    // ========================================================================

    /**
     * Show a location detail modal
     */
    showLocationModal(location) {
        if (this.cardModalVisible) return;
        this.cardModalVisible = true;

        // Create modal container
        this.cardModal = this.add.container(0, 0);
        this.cardModal.setDepth(1000);

        // Blackout overlay
        this.modalBlackout = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000, 0.8
        );
        this.modalBlackout.setInteractive();
        this.modalBlackout.on('pointerdown', () => this.hideCardModal());
        this.cardModal.add(this.modalBlackout);

        // Large location dimensions
        const modalWidth = 350;
        const modalHeight = 200;
        const locX = this.scale.width / 2;
        const locY = this.scale.height / 2 - 50;

        // Generate color based on location name hash
        let hash = 0;
        const name = location.getName();
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [0x4ade80, 0x60a5fa, 0xa78bfa, 0xf472b6, 0xfb923c, 0xef4444];
        const locColor = colors[Math.abs(hash) % colors.length];

        // Card background
        const locBg = this.add.graphics();

        // Shadow
        locBg.fillStyle(0x000000, 0.5);
        locBg.fillRoundedRect(locX - modalWidth/2 + 8, locY - modalHeight/2 + 8, modalWidth, modalHeight, 12);

        // Background
        locBg.fillStyle(0x1e3a5f, 1);
        locBg.fillRoundedRect(locX - modalWidth/2, locY - modalHeight/2, modalWidth, modalHeight, 12);

        // Border
        locBg.lineStyle(4, COLORS.PRIMARY, 1);
        locBg.strokeRoundedRect(locX - modalWidth/2, locY - modalHeight/2, modalWidth, modalHeight, 12);

        // Artwork area
        locBg.fillStyle(locColor, 0.3);
        locBg.fillRoundedRect(locX - modalWidth/2 + 8, locY - modalHeight/2 + 8, modalWidth - 16, modalHeight - 16, 8);

        this.cardModal.add(locBg);

        // Location name
        const nameText = this.add.text(locX, locY - modalHeight/2 + 35, location.getName(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.cardModal.add(nameText);

        // Description background
        const descBg = this.add.graphics();
        descBg.fillStyle(0x000000, 0.7);
        descBg.fillRoundedRect(locX - modalWidth/2 + 15, locY - 10, modalWidth - 30, modalHeight/2 - 10, 8);
        this.cardModal.add(descBg);

        // Description text
        const descText = this.add.text(locX, locY + modalHeight/4 - 15, location.getDescription(), {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
            wordWrap: { width: modalWidth - 50 },
            align: 'center'
        }).setOrigin(0.5);
        this.cardModal.add(descText);

        // Tap to close hint
        const hintText = this.add.text(locX, locY + modalHeight/2 + 40, 'Tap anywhere to close', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
        this.cardModal.add(hintText);

        // Animate in
        this.cardModal.setAlpha(0);
        this.tweens.add({
            targets: this.cardModal,
            alpha: 1,
            duration: 150,
            ease: 'Quad.easeOut'
        });
    }

    /**
     * Handle location click
     */
    onLocationClicked(location) {
        if (this.cardModalVisible) return;
        if (location && location.isRevealed()) {
            this.showLocationModal(location);
        }
    }
}
