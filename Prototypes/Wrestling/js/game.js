
class Move {
    frame = null;
    texture = null;
    sprite = null;
    button = null;
    onClick = null;

    static counter = 0;
    constructor(frameName, atlas, container) {
        this.frame = frameName;
        this.texture = atlas.textures[frameName];
        this.sprite = new PIXI.Sprite(this.texture);
        container.addChild(this.sprite);

        const index = Move.counter++;
        const row = Math.floor(index / 3);
        const col = Math.floor(index % 3);

        const top = 383;
        const left = 82;

        this.sprite.y = top + row * (805-383);
        this.sprite.x = left + col * (442 - 82);

        const self = this;
        this.button = new PIXI.ui.Button(this.sprite);
        this.button.onPress.connect(() => {
            if (self.onClick !== null) {
                self.onClick(self);
            }
        });
    }
}

class Game {
    container = null;
    onReturnToMenu = null;
    movesContainer = null;

    allMoves = [];
    actionQueue = [];

    player1 = null;
    player2 = null;
    centerPositions = [];

    constructor() {
        this.container = new PIXI.Container();
        this.movesContainer = new PIXI.Container();
        this.actionQueue.push(null);
        this.actionQueue.push(null);
        this.actionQueue.push(null);
        for (let i = 0; i < 12; i++) {
            this.allMoves.push(null);
        }

        this.centerPositions.push({x: 193, y: 768});
        this.centerPositions.push({x: 566, y: 768});
        this.centerPositions.push({x: 929, y: 768});
        this.centerPositions.push({x: 193, y: 1170});
        this.centerPositions.push({x: 566, y: 1170});
        this.centerPositions.push({x: 929, y: 1170});
        this.centerPositions.push({x: 193, y: 1570});
        this.centerPositions.push({x: 566, y: 1570});
        this.centerPositions.push({x: 929, y: 1570});
        this.centerPositions.push({x: 193, y: 1968});
        this.centerPositions.push({x: 566, y: 1968});
        this.centerPositions.push({x: 929, y: 1968});
    }

    async Initialize(width, height) {
        const background = new PIXI.Graphics()
            .rect(0, 0, width, height)
            .fill(0x1d1d1d);
        this.container.addChild(background);

        const blackout = this._blackout = new PIXI.Graphics()
            .rect(0, 0, width, height)
            .fill(0x000000);
        blackout.alpha = 0.75;

        const self = this;
        const movesContainer = this.movesContainer;
        const allMoves = this.allMoves;
        const atlas1 = await PIXI.Assets.load('atlas1');
        const atlas2 = this._atlas2 = await PIXI.Assets.load('atlas2');

        { // Header
            const topSprite = new PIXI.Sprite(atlas1.textures['playarea_top.png']);
            this.container.addChild(topSprite);

            const portrait1Sprite = new PIXI.Sprite(atlas2.textures['portrait1.png']);
            const portrait2Sprite = new PIXI.Sprite(atlas2.textures['portrait2.png']);
            portrait1Sprite.x = 23; portrait1Sprite.y = 24;
            portrait2Sprite.x = 834;  portrait2Sprite.y = 24;
            this.container.addChild(portrait1Sprite);
            this.container.addChild(portrait2Sprite);

            const p1HealthFill = new PIXI.Sprite(atlas2.textures['p1_fill.png']);
            const p2HealthFill = new PIXI.Sprite(atlas2.textures['p2_fill.png']);
            const p1HealthStroke = new PIXI.Sprite(atlas2.textures['p1_bar.png']);
            const p2HealthStroke = new PIXI.Sprite(atlas2.textures['p2_bar.png']);
            p2HealthFill.anchor.set(1, 0);
            p1HealthFill.x = 193; p1HealthFill.y = 17;
            p1HealthStroke.x = 186; p1HealthStroke.y = 4;
            p2HealthStroke.x = 424; p2HealthStroke.y = 194;
            p2HealthFill.x = 938; p2HealthFill.y = 200;
            this.container.addChild(p1HealthFill);
            this.container.addChild(p2HealthFill);
            this.container.addChild(p1HealthStroke);
            this.container.addChild(p2HealthStroke);

            const mike = new PIXI.Sprite(atlas2.textures['name1.png']);
            const ike = new PIXI.Sprite(atlas2.textures['name2.png']);
            mike.x = 297; mike.y = 126;
            ike.x = 676; ike.y = 131;
            this.container.addChild(mike);
            this.container.addChild(ike);
        }

        { // Grid
            const gridRow1 = new PIXI.Sprite(atlas2.textures['grid_row_1.png']);
            gridRow1.x = 9; gridRow1.y = 374;
            this.container.addChild(gridRow1);
            const gridRow2 = new PIXI.Sprite(atlas2.textures['grid_row_2.png']);
            gridRow2.x = 12; gridRow2.y = 761;
            this.container.addChild(gridRow2);
            const gridRow3 = new PIXI.Sprite(atlas2.textures['grid_row_3.png']);
            gridRow3.x = 9; gridRow3.y = 1162;
            this.container.addChild(gridRow3);
            const gridRow4 = new PIXI.Sprite(atlas2.textures['grid_row_4.png']);
            gridRow4.x = 12; gridRow4.y = 1567;
            this.container.addChild(gridRow4);
            const gridRow5 = new PIXI.Sprite(atlas2.textures['grid_row_5.png']);
            gridRow5.x = 10; gridRow5.y = 1961;
            this.container.addChild(gridRow5);

            const gridCol1 = new PIXI.Sprite(atlas2.textures['grid_col_1.png']);
            gridCol1.x = 9; gridCol1.y = 411;
            this.container.addChild(gridCol1);
            const gridCol2 = new PIXI.Sprite(atlas2.textures['grid_col_2.png']);
            gridCol2.x = 371; gridCol2.y = 406;
            this.container.addChild(gridCol2);
            const gridCol3 = new PIXI.Sprite(atlas2.textures['grid_col_3.png']);
            gridCol3.x = 738; gridCol3.y = 406;
            this.container.addChild(gridCol3);
            const gridCol4 = new PIXI.Sprite(atlas2.textures['grid_col_4.png']);
            gridCol4.x = 1103; gridCol4.y = 408;
            this.container.addChild(gridCol4);
        }

        const player1 = this.player1 = new PIXI.Sprite(atlas2.textures['player1.png']);
        const player2 = this.player2 = new PIXI.Sprite(atlas2.textures['player2.png']);
        player1.x = this.centerPositions[9].x; player1.y = this.centerPositions[9].y;
        player2.x = this.centerPositions[2].x; player2.y = this.centerPositions[2].y;
        player1.anchor.set(0.5, 1);
        player2.anchor.set(0.5, 1);
        this.container.addChild(player1);
        this.container.addChild(player2);
        //new tweedle_js.Tween(player2).to({ x:player1.x, y:player1.y }, 2500).start();

        this.container.addChild(blackout);

        const bottomSprite = new PIXI.Sprite(atlas1.textures['playarea_bottom.png']);
        bottomSprite.y = height - bottomSprite.height;
        this.container.addChild(bottomSprite);

        const selectCardTexture = atlas2.textures['select_card.png'];
        const card1 = new PIXI.Sprite(selectCardTexture);
        const card2 = new PIXI.Sprite(selectCardTexture);
        const card3 = new PIXI.Sprite(selectCardTexture);
        card1.x = 18; card1.y = 2086;
        card2.x = 296; card2.y = 2086;
        card3.x = 566; card3.y = 2086;
        this.container.addChild(card1);
        this.container.addChild(card2);
        this.container.addChild(card3);
        const cards = [card1, card2, card3];

        const menuSprite = new PIXI.Sprite(atlas2.textures['menu_button.png']);
        const selectCardSprite = new PIXI.Sprite(atlas2.textures['select_button.png']);
        menuSprite.x = 875; menuSprite.y = 2104;
        selectCardSprite.x = 866; selectCardSprite.y = 2223;
        this.container.addChild(menuSprite);
        this.container.addChild(selectCardSprite);

        { // Card Selection
            allMoves[0] = new Move("card_block.png", atlas2, movesContainer);
            for (let i = 1; i <= 7; ++i) {
                allMoves[i] = new Move("card_attack_" + i + ".png", atlas2, movesContainer);
            }
            allMoves[8] = new Move("card_move_down.png" , atlas2, movesContainer);
            allMoves[9] = new Move("card_move_up.png"   , atlas2, movesContainer);
            allMoves[10] = new Move("card_move_left.png" , atlas2, movesContainer);
            allMoves[11] = new Move("card_move_right.png", atlas2, movesContainer);
        }
        this.container.addChild(movesContainer);
        movesContainer.visible = false;
        blackout.visible = false;

        const selectCards = () => {
            if (blackout.visible) {
                return false;
            }

            blackout.visible = true;
            movesContainer.visible = true;
            selectCardSprite.visible = false;
            menuSprite.visible = false;
            return true;
        }
        this.OpenSelectCards = selectCards;

        const cardSelectBtn = new PIXI.ui.Button(selectCardSprite);
        cardSelectBtn.onPress.connect(selectCards);

        const getFreeCard = () => {
            for (let i = 0, len = cards.length; i < len; ++i) {
                if (cards[i].texture === selectCardTexture) {
                    return cards[i];
                }
            }
            return null;
        };

        const findCard = (buttonToFind) => {
            for (let i = 0, len = cards.length; i < len; ++i) {
                if (cards[i].texture === buttonToFind.texture) {
                    return cards[i];
                }
            }
            return null;
        }

        const findButton = (textureToFind) => {
            for (let i = 0, len = allMoves.length; i < len; ++i) {
                if (allMoves[i].texture === textureToFind) {
                    return allMoves[i];
                }
            }
            return null;
        }

        const compressMoves = () => {
            for (let i = 1, len = cards.length; i < len; ++i) {
                if (cards[i - 1].texture === selectCardTexture && cards[i].texture !== selectCardTexture) {
                    cards[i - 1].texture = cards[i].texture;
                    cards[i].texture = selectCardTexture;
                }
            }
        }

        const moveClicked = (moveButton) => {
            if (!self.interactive) {
                return;
            }
            if (!blackout.visible) {
                return;
            }

            if (moveButton.sprite.tint != 0xffffff) { // Return card
                const target = findCard(moveButton);
                if (target === null) {
                    return;
                }

                moveButton.sprite.tint = 0xffffff;
                target.texture = selectCardTexture;

                compressMoves();
                compressMoves();
            }
            else { // Place card
                const target = getFreeCard();
                if (target === null) {
                    return;
                }

                target.texture = moveButton.texture;
                moveButton.sprite.tint = 0x4c4c4c;
            }
        };

        for (let i = 0, len = allMoves.length; i < len; ++i) {
            allMoves[i].onClick = moveClicked;
        }

        const clickedCardSelector = (index) => {
            if (!self.interactive) {
                return;
            }
            if (!selectCards()) {
                const card = cards[index];
                const button = findButton(card.texture);
                card.texture = selectCardTexture;
                if (button !== null) {
                    button.sprite.tint = 0xffffff;
                }
                compressMoves();
                compressMoves();
            }
        }

        new PIXI.ui.Button(card1).onPress.connect(() => {
            clickedCardSelector(0);
        });
        new PIXI.ui.Button(card2).onPress.connect(() => {
            clickedCardSelector(1);
        });
        new PIXI.ui.Button(card3).onPress.connect(() => {
            clickedCardSelector(2);
        });

        // countdown
        const countdownContainer = this._countdownContainer = new PIXI.Container();
        countdownContainer.x = Math.floor(width / 2);
        countdownContainer.y = Math.floor(height / 2);
        this.container.addChild(countdownContainer);

        const countdownBg = this._countdownBg = new PIXI.Sprite(atlas2.textures['countdown_bg.png']);
        const countdownNumber = this._countdownNumber = new PIXI.Sprite(atlas2.textures['countdown_3.png']);
        countdownBg.anchor.set(0.5, 0.5);
        countdownNumber.anchor.set(0.5, 0.5);
        countdownContainer.addChild(countdownBg);
        countdownContainer.addChild(countdownNumber);
    }

    _countdownContainer = null;
    _countdownNumber = null;
    _countdownBg = null;
    _atlas2 = null;
    _blackout = null;

    interactive = true;
    OpenSelectCards = null;

    Reset() {
        const countdownContainer = this._countdownContainer;
        const countdownNumber = this._countdownNumber;
        const countdownBg = this._countdownBg;
        const atlas2 = this._atlas2;
        const selectCards = this.OpenSelectCards;
        const blackout = this._blackout;
        const movesContainer = this.movesContainer;
        const self = this;
        this.interactive = false;

        blackout.visible = false;
        movesContainer.visible = false;

        countdownNumber.visible = true;
        countdownBg.visible = true;
        countdownBg.texture = atlas2.textures['countdown_bg.png']
        countdownNumber.texture = atlas2.textures['countdown_3.png'];

        countdownContainer.scale.set(0.25, 0.25);
        const startupTween = new tweedle_js.Tween(countdownContainer.scale).to({ x:1.25, y:1.25 }, 750);
        startupTween.onComplete((tweener, target) => {
            new tweedle_js.Tween(countdownContainer.scale).to({ x:0.5, y:0.5 }, 250).onComplete((tweener, target) => {
                countdownNumber.texture = atlas2.textures['countdown_2.png'];
                new tweedle_js.Tween(countdownContainer.scale).to({ x:1.25, y:1.25 }, 550).onComplete((tweener, target) => {
                    new tweedle_js.Tween(countdownContainer.scale).to({ x:0.5, y:0.5 }, 250).onComplete((tweener, target) => {
                        countdownNumber.texture = atlas2.textures['countdown_1.png'];
                        new tweedle_js.Tween(countdownContainer.scale).to({ x:1.25, y:1.25 }, 550).onComplete((tweener, target) => {
                            new tweedle_js.Tween(countdownContainer.scale).to({ x:0.5, y:0.5 }, 250).onComplete((tweener, target) => {
                                countdownNumber.visible = false;
                                countdownBg.texture = atlas2.textures['countdown_done.png']
                                new tweedle_js.Tween(countdownContainer.scale).to({ x:1.3, y:1.3 }, 500).onComplete((tweener, target) => {
                                    new tweedle_js.Tween(countdownContainer.scale).to({ x:1, y:1 }, 250).onComplete((tweener, target) => {
                                        setTimeout(() => {
                                            countdownNumber.visible = false;
                                            countdownBg.visible = false;
                                            selectCards();
                                            self.interactive = true;
                                        }, 500);
                                    }).start();
                                }).start();
                            }).start();
                        }).start();
                    }).start();
                }).start();
            }).start();
        });
        startupTween.start();
    }
}
