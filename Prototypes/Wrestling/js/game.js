
class Move {
    frame = null;
    texture = null;
    sprite = null;
    button = null;
    onClick = null;

    static counter = 0;
    static all = new Map();

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

        Move.all.set(frameName, this);
    }
}

class Game {
    container = null;
    onReturnToMenu = null;
    movesContainer = null;

    _cards = [];
    _indicators = [];
    _attackPatterns = [];

    player1 = null;
    player2 = null;
    centerPositions = [];

    constructor() {
        this.container = new PIXI.Container();
        this.movesContainer = new PIXI.Container();

        // X +/- ~360
        // Y +/- ~400
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

        // TODO: _attackPatterns
        for (let i = 0; i < 8; ++i) {
            this._attackPatterns.push([]);
        }

        this._attackPatterns[1].push({row: 0, col: 0});
        this._attackPatterns[2].push(
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, 
            {row: 0, col: -1}, {row: 0, col: -2}, {row: 0, col: -3}
        );
        this._attackPatterns[3].push(
            {row: 0, col: 0}, {row: -1, col: 1}, {row: 1, col: 1}, 
            {row: -1, col: -1},  {row: 1, col: -1}
        );
        this._attackPatterns[4].push(
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: -1}, 
            {row: 1, col: 0},  {row: -1, col: 0}
        );
        // TODO: Redo move 5
        // TODO: Redo move 6
        this._attackPatterns[7].push(
            {row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, 
            {row: -1, col: 0},  {row: -2, col: 0}
        );
    }

    async Initialize(width, height) {
        const background = new PIXI.Graphics()
            .rect(0, 0, width, height)
            .fill(0x1d1d1d);
        this.container.addChild(background);

        const blackout = this._blackout = new PIXI.Graphics()
            .rect(-width / 2, 0, width * 2, height)
            .fill(0x000000);
        blackout.alpha = 0.75;

        const self = this;
        const movesContainer = this.movesContainer;
        const atlas1 = await PIXI.Assets.load("atlas1");
        const atlas2 = this._atlas2 = await PIXI.Assets.load("atlas2");

        { // Header
            const topSprite = new PIXI.Sprite(atlas1.textures["playarea_top.png"]);
            this.container.addChild(topSprite);

            const portrait1Sprite = new PIXI.Sprite(atlas2.textures["portrait1.png"]);
            const portrait2Sprite = new PIXI.Sprite(atlas2.textures["portrait2.png"]);
            portrait1Sprite.x = 23; portrait1Sprite.y = 24;
            portrait2Sprite.x = 834;  portrait2Sprite.y = 24;
            this.container.addChild(portrait1Sprite);
            this.container.addChild(portrait2Sprite);

            const p1HealthFill = new PIXI.Sprite(atlas2.textures["p1_fill.png"]);
            const p2HealthFill = new PIXI.Sprite(atlas2.textures["p2_fill.png"]);
            const p1HealthStroke = new PIXI.Sprite(atlas2.textures["p1_bar.png"]);
            const p2HealthStroke = new PIXI.Sprite(atlas2.textures["p2_bar.png"]);
            p2HealthFill.anchor.set(1, 0);
            p1HealthFill.x = 193; p1HealthFill.y = 17;
            p1HealthStroke.x = 186; p1HealthStroke.y = 4;
            p2HealthStroke.x = 424; p2HealthStroke.y = 194;
            p2HealthFill.x = 938; p2HealthFill.y = 200;
            this.container.addChild(p1HealthFill);
            this.container.addChild(p2HealthFill);
            this.container.addChild(p1HealthStroke);
            this.container.addChild(p2HealthStroke);

            const mike = new PIXI.Sprite(atlas2.textures["name1.png"]);
            const ike = new PIXI.Sprite(atlas2.textures["name2.png"]);
            mike.x = 297; mike.y = 126;
            ike.x = 676; ike.y = 131;
            this.container.addChild(mike);
            this.container.addChild(ike);
        }

        { // Grid
            const gridRow1 = new PIXI.Sprite(atlas2.textures["grid_row_1.png"]);
            gridRow1.x = 9; gridRow1.y = 374;
            this.container.addChild(gridRow1);
            const gridRow2 = new PIXI.Sprite(atlas2.textures["grid_row_2.png"]);
            gridRow2.x = 12; gridRow2.y = 761;
            this.container.addChild(gridRow2);
            const gridRow3 = new PIXI.Sprite(atlas2.textures["grid_row_3.png"]);
            gridRow3.x = 9; gridRow3.y = 1162;
            this.container.addChild(gridRow3);
            const gridRow4 = new PIXI.Sprite(atlas2.textures["grid_row_4.png"]);
            gridRow4.x = 12; gridRow4.y = 1567;
            this.container.addChild(gridRow4);
            const gridRow5 = new PIXI.Sprite(atlas2.textures["grid_row_5.png"]);
            gridRow5.x = 10; gridRow5.y = 1961;
            this.container.addChild(gridRow5);

            const gridCol1 = new PIXI.Sprite(atlas2.textures["grid_col_1.png"]);
            gridCol1.x = 9; gridCol1.y = 411;
            this.container.addChild(gridCol1);
            const gridCol2 = new PIXI.Sprite(atlas2.textures["grid_col_2.png"]);
            gridCol2.x = 371; gridCol2.y = 406;
            this.container.addChild(gridCol2);
            const gridCol3 = new PIXI.Sprite(atlas2.textures["grid_col_3.png"]);
            gridCol3.x = 738; gridCol3.y = 406;
            this.container.addChild(gridCol3);
            const gridCol4 = new PIXI.Sprite(atlas2.textures["grid_col_4.png"]);
            gridCol4.x = 1103; gridCol4.y = 408;
            this.container.addChild(gridCol4);
        }

        { // Selectors
            for (let i = 0, len = this.centerPositions.length; i < len; ++i) {
                const pos = this.centerPositions[i];
                const indicator = new PIXI.Sprite(atlas1.textures["indicator.png"]);
                indicator.x = pos.x;
                indicator.y = pos.y - 10;
                indicator.anchor.set(0.5, 1);
                indicator.visible = false;
                this._indicators.push(indicator);
                this.container.addChild(indicator);
            }
        }

        const player1 = this.player1 = new PIXI.Sprite(atlas2.textures["player1.png"]);
        const player2 = this.player2 = new PIXI.Sprite(atlas2.textures["player2.png"]);
        player1.x = this.centerPositions[9].x; player1.y = this.centerPositions[9].y;
        player2.x = this.centerPositions[2].x; player2.y = this.centerPositions[2].y;
        player1.anchor.set(0.5, 1);
        player2.anchor.set(0.5, 1);
        this.container.addChild(player1);
        this.container.addChild(player2);
        //new tweedle_js.Tween(player2).to({ x:player1.x, y:player1.y }, 2500).start();

        player1.hasDefenseBuff = false;
        player2.hasDefenseBuff = false;

        this.container.addChild(blackout);

        const bottomSprite = new PIXI.Sprite(atlas1.textures["playarea_bottom.png"]);
        bottomSprite.y = height - bottomSprite.height;
        this.container.addChild(bottomSprite);

        const selectCardTexture = atlas2.textures["select_card.png"];
        const card1 = new PIXI.Sprite(selectCardTexture);
        const card2 = new PIXI.Sprite(selectCardTexture);
        const card3 = new PIXI.Sprite(selectCardTexture);
        card1.x = 18; card1.y = 2086;
        card2.x = 296; card2.y = 2086;
        card3.x = 566; card3.y = 2086;
        this.container.addChild(card1);
        this.container.addChild(card2);
        this.container.addChild(card3);
        const cards = this._cards = [card1, card2, card3];

        const menuSprite = new PIXI.Sprite(atlas2.textures["menu_button.png"]);
        const selectCardSprite = new PIXI.Sprite(atlas2.textures["select_button.png"]);
        const wrestleSprite = this._wrestleSprite = new PIXI.Sprite(atlas2.textures["wrestle_btn.png"]);
        const ringSpriteOpen = this._ringOpen = new PIXI.Sprite(atlas2.textures["ring_open_btn.png"]);
        menuSprite.x = 875; menuSprite.y = 2104;
        ringSpriteOpen.x = 875; ringSpriteOpen.y = 2090;
        selectCardSprite.x = 866; selectCardSprite.y = 2223;
        wrestleSprite.x = 876; wrestleSprite.y = 2223;
        this.container.addChild(menuSprite);
        this.container.addChild(selectCardSprite);
        this.container.addChild(ringSpriteOpen);
        this.container.addChild(wrestleSprite);

        { // Card Selection
            new Move("card_block.png", atlas2, movesContainer);
            for (let i = 1; i <= 7; ++i) {
                new Move("card_attack_" + i + ".png", atlas2, movesContainer);
            }
            new Move("card_move_down.png" , atlas2, movesContainer);
            new Move("card_move_up.png"   , atlas2, movesContainer);
            new Move("card_move_left.png" , atlas2, movesContainer);
            new Move("card_move_right.png", atlas2, movesContainer);
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
            ringSpriteOpen.visible = true;
            wrestleSprite.visible = true;
            for (const [key, value] of Move.all) {
                value.sprite.tint = 0xffffff;
            }
            ringSpriteOpen.texture = atlas2.textures["ring_open_btn.png"];
            return true;
        }
        this.OpenSelectCards = selectCards;

        const cardSelectBtn = new PIXI.ui.Button(selectCardSprite);
        cardSelectBtn.onPress.connect(selectCards);
        const wrestleBtn = new PIXI.ui.Button(wrestleSprite);
        wrestleBtn.onPress.connect(() => {
            if (card1.texture === selectCardTexture || card2.texture === selectCardTexture || card3.texture === selectCardTexture) {
                return; // Not all cards are filled, don't do anything on click
            }

            // Reset buttons in case wrestle was pressed while cards where hidden
            ringSpriteOpen.texture = atlas2.textures["ring_open_btn.png"];
            movesContainer.visible = true;
            blackout.visible = true;

            selectCardSprite.visible = true;
            menuSprite.visible = true;
            self.ExecuteAllMoves();
        });

        const ringPreviewBtn = new PIXI.ui.Button(ringSpriteOpen);

        /*ringPreviewBtn.onDown.connect(()=>{
            ringSpriteOpen.texture = atlas2.textures["ring_closed_btn.png"];
            movesContainer.visible = false;
            blackout.visible = false;
        });
        ringPreviewBtn.onUp.connect(()=>{
            ringSpriteOpen.texture = atlas2.textures["ring_open_btn.png"];
            movesContainer.visible = true;
            blackout.visible = true;
        });*/

        ringPreviewBtn.onPress.connect(() => {
            if (ringSpriteOpen.texture === atlas2.textures["ring_open_btn.png"]) {
                ringSpriteOpen.texture = atlas2.textures["ring_closed_btn.png"];
                movesContainer.visible = false;
                blackout.visible = false;
            }
            else {
                ringSpriteOpen.texture = atlas2.textures["ring_open_btn.png"];
                movesContainer.visible = true;
                blackout.visible = true;
            }
        });


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

        const findMove = (textureToFind) => {
            for (const [key, value] of Move.all) {
                if (value.texture === textureToFind) {
                    return value;
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

        const updatePlayButton = () => {
            this._wrestleSprite.tint = 0xffffff;
            for (let i = 0, len = cards.length; i < len; ++i) {
                if (cards[i].texture === selectCardTexture) {
                    this._wrestleSprite.tint = 0x7f7f7f;
                    break;
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
            updatePlayButton();
        };

        for (const [key, value] of Move.all) {
            value.onClick = moveClicked;
        }

        const clickedCardSelector = (index) => {
            if (!self.interactive) {
                return;
            }
            if (!selectCards()) {
                const card = cards[index];
                const button = findMove(card.texture);
                card.texture = selectCardTexture;
                if (button !== null) {
                    button.sprite.tint = 0xffffff;
                }
                compressMoves();
                compressMoves();
            }
            updatePlayButton();
        }

        for (let i = 0, len = cards.length; i < len; ++i) {
            const j = i; // To avoid the lambda capturing i
            new PIXI.ui.Button(cards[j]).onPress.connect(() => {
                clickedCardSelector(j);
            });
        }

        // countdown
        const countdownContainer = this._countdownContainer = new PIXI.Container();
        countdownContainer.x = Math.floor(width / 2);
        countdownContainer.y = Math.floor(height / 2);
        this.container.addChild(countdownContainer);

        const countdownBg = this._countdownBg = new PIXI.Sprite(atlas2.textures["countdown_bg.png"]);
        const countdownNumber = this._countdownNumber = new PIXI.Sprite(atlas2.textures["countdown_3.png"]);
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
    _ringOpen = null;
    _wrestleSprite = null;

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

        // TODO: RESET The 3 cards so they all say "select card"

        this._ringOpen.visible = false;
        this._wrestleSprite.visible = false;
        this._wrestleSprite.tint = 0x7f7f7f;

        blackout.visible = false;
        movesContainer.visible = false;

        countdownNumber.visible = false;
        countdownBg.visible = false;


        this.interactive = true; // set to false if intro
        /*countdownBg.texture = atlas2.textures["countdown_bg.png"]
        countdownNumber.texture = atlas2.textures["countdown_3.png"];
        countdownContainer.scale.set(0.25, 0.25);
        const startupTween = new tweedle_js.Tween(countdownContainer.scale).to({ x:1.25, y:1.25 }, 750);
        startupTween.onComplete((tweener, target) => {
            new tweedle_js.Tween(countdownContainer.scale).to({ x:0.5, y:0.5 }, 250).onComplete((tweener, target) => {
                countdownNumber.texture = atlas2.textures["countdown_2.png"];
                new tweedle_js.Tween(countdownContainer.scale).to({ x:1.25, y:1.25 }, 550).onComplete((tweener, target) => {
                    new tweedle_js.Tween(countdownContainer.scale).to({ x:0.5, y:0.5 }, 250).onComplete((tweener, target) => {
                        countdownNumber.texture = atlas2.textures["countdown_1.png"];
                        new tweedle_js.Tween(countdownContainer.scale).to({ x:1.25, y:1.25 }, 550).onComplete((tweener, target) => {
                            new tweedle_js.Tween(countdownContainer.scale).to({ x:0.5, y:0.5 }, 250).onComplete((tweener, target) => {
                                countdownNumber.visible = false;
                                countdownBg.texture = atlas2.textures["countdown_done.png"]
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
        startupTween.start();*/
    }

    async ExecuteAllMoves() {
        const countdownContainer = this._countdownContainer;
        const countdownNumber = this._countdownNumber;
        const countdownBg = this._countdownBg;
        const atlas2 = this._atlas2;
        const selectCards = this.OpenSelectCards;
        const blackout = this._blackout;
        const movesContainer = this.movesContainer;
        const self = this;

        this._ringOpen.visible = false;
        this._wrestleSprite.visible = false;
        this._wrestleSprite.tint = 0x7f7f7f;

        blackout.visible = false;
        movesContainer.visible = false;
        countdownNumber.visible = false;
        countdownBg.visible = false;


        this.interactive = false;
        await this._ExecuteNextMove();
        // TODO: Execute AI Move
        // TODO: Clear buff visuals from board
        await this._ExecuteNextMove();
        // TODO: Execute AI Move
        // TODO: Clear buff visuals from board
        await this._ExecuteNextMove();
        // TODO: Execute AI Move
        // TODO: Clear buff visuals from board
        this.interactive = true;

        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }

    async _ExecuteNextMove() {
        const self = this;
        const FindClosestTile = (x, y) => {
            const centerPositions = self.centerPositions;
            let shortestDistSq = 9999999;
            let closestTilePoint = null;
            let closestTileIndex = -1;
            for (let i = 0, len = centerPositions.length; i < len; ++i) {
                const deltaX = centerPositions[i].x - x;
                const deltaY = centerPositions[i].y - y;
                const distSq = deltaX * deltaX + deltaY * deltaY;
                if (distSq < shortestDistSq) {
                    closestTilePoint = centerPositions[i];
                    closestTileIndex = i;
                    shortestDistSq = distSq;
                }
            }
    
            let row = Math.floor(closestTileIndex / 3);
            let col = Math.floor(closestTileIndex % 3);
            
            return {
                closest: closestTilePoint,
                x: closestTilePoint.x,
                y: closestTilePoint.y,
                index: closestTileIndex,
                row: row,
                col: col
            };
        }

        const atlas2 = this._atlas2;
        const player1 = this.player1;
        const player2 = this.player2;
        const cards = this._cards;
        const selectCardTexture = atlas2.textures["select_card.png"];
        const moveUp =    Move.all.get("card_move_up.png").texture;
        const moveDown =  Move.all.get("card_move_down.png").texture;
        const moveLeft =  Move.all.get("card_move_left.png").texture;
        const moveRight = Move.all.get("card_move_right.png").texture;
        const block =     Move.all.get("card_block.png").texture;
        const ignore = ["select_card.png", "card_move_up.png", "card_move_down.png", "card_move_left.png", "card_move_right.png", "card_block.png"];
        const attacks = [];
        for (const [key, value] of Move.all) {
            if (!ignore.includes(key)) {
                attacks.push(value);
            }
        }

        return new Promise((resolve, reject) => {
            // Grab a move
            let card = null;
            for (let i = 0, len = cards.length; i < len; ++i) {
                if (cards[i].texture !== selectCardTexture) {
                    card = cards[i];
                    break;
                }
            }
            if (card === null) {
                resolve(null); // return null, early out
                return null;
            }

            // Handle moves
            const texture = card.texture;
            if (texture === moveUp || texture === moveDown || texture === moveLeft || texture === moveRight) {
                const playerTile = FindClosestTile(player1.x, player1.y);
                let targetTile = null;
                if (texture === moveUp) {
                    if (playerTile.row === 0) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move up, early out
                        return null;
                    }
                    targetTile = FindClosestTile(player1.x, player1.y - 400);
                }
                else if (texture === moveDown) {
                    if (playerTile.row === 3) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move down, early out
                        return null;
                    }
                    targetTile = FindClosestTile(player1.x, player1.y + 400);
                }
                else if (texture === moveLeft) {
                    if (playerTile.col === 0) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move left, early out
                        return null;
                    }
                    targetTile = FindClosestTile(player1.x - 360, player1.y);
                }
                else if (texture === moveRight) {
                    if (playerTile.col === 2) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move right, early out
                        return null;
                    }
                    targetTile = FindClosestTile(player1.x + 360, player1.y);
                }

                const indicator = self._indicators[targetTile.index];
                indicator.visible = true;
                indicator.tint = 0x8f8f8f;
                new tweedle_js.Tween(player1.position)
                    .to({ x:targetTile.x, y:targetTile.y }, 500)
                    .onComplete((tweener, target) => {
                        setTimeout(() => {
                            indicator.visible = false;
                            card.texture = selectCardTexture;
                            resolve(null);
                        }, 250);
                    })
                    .start();

                const enemyTile = FindClosestTile(player2.x, player2.y);
                if (enemyTile.row === targetTile.row && enemyTile.col === targetTile.col) {
                    new tweedle_js.Tween(player1.anchor).to({ x:1 }, 250).start();
                    new tweedle_js.Tween(player2.anchor).to({ x:0 }, 250).start();
                }
                else {
                    if (player1.anchor.x !== 0.5) {
                        new tweedle_js.Tween(player1.anchor).to({ x:0.5 }, 250).start();
                    }
                    if (player2.anchor.x !== 0.5) {
                        new tweedle_js.Tween(player2.anchor).to({ x:0.5 }, 250).start();
                    }
                }
                player1.hasDefenseBuff = false;
                return null;
            }
            // Handle buffs
            else if (texture === block) {
                const playerTile = FindClosestTile(player1.x, player1.y);
                const indicator = self._indicators[playerTile.index];
                indicator.visible = true;
                indicator.tint = 0x0059c1;
                setTimeout(() => {
                    card.texture = selectCardTexture;
                    indicator.visible = false;
                    player1.hasDefenseBuff = true;
                    resolve(null); // Can't move right, early out
                }, 1000);
                return null;
            }
            // Handle attacks
            else { 
                let label = card.texture.label; // something like card_attack_1.png
                if (!(label.startsWith("card_attack_") && label.endsWith(".png"))) {
                    throw new Error("Invalid attack");
                }
                label = label.substring("card_attack_".length);
                label = label.substring(0, label.length - ".png".length);
                const attack = Number(label);
                const pattern = self._attackPatterns[attack];

                const playerTile = FindClosestTile(player1.x, player1.y);
                const indicators = [];

                for (let i = 0, len = pattern.length; i < len; ++i) {
                    const attackRow = playerTile.row + pattern[i].row;
                    const attackCol = playerTile.col + pattern[i].col;
                    if (attackRow < 0 || attackCol < 0) {
                        continue;
                    }
                    if (attackRow > 3 || attackCol > 2) {
                        continue;
                    }
                    const attackIndicator = self._indicators[attackRow * 3 + attackCol];
                    attackIndicator.visible = true;
                    attackIndicator.tint = 0xbe0000;
                    indicators.push(attackIndicator);
                }

                setTimeout(() => {
                    card.texture = selectCardTexture;
                    for (let i = 0, len = indicators.length; i < len; ++i) {
                        indicators[i].visible = false;
                    }

                    // TODO: Attack logic (and damage ike!)

                    resolve(null); 
                }, 1000);

                player1.hasDefenseBuff = false;
                return null;
            }
        });
    }
}
