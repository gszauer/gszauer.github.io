
class Move {
    frame = null;
    texture = null;
    sprite = null;
    button = null;
    onClick = null;
    damage = 0;
    cooldown = 0;

    static counter = 0;
    static all = new Map();

    constructor(frameName, atlas, container, damage, cooldown) {
        this.frame = frameName;
        this.texture = atlas.textures[frameName];
        this.sprite = new PIXI.Sprite(this.texture);
        container.addChild(this.sprite);

        this.damage = damage;
        this.cooldown = cooldown;

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
    winLooseContainer = null;
    countdownContainer = null;
    pauseContainer = null;

    _useRandomAi = false;
    _aiCheckboxNormal = null;
    _aiCheckboxRandom = null;

    _cards = [];
    _aiCards = [];
    _indicators = [];
    _attackPatterns = [];
    
    _atlas1 = null;
    _atlas2 = null;
    _atlas3 = null;

    player1 = null;
    player2 = null;
    centerPositions = [];

    onBackToMenu = null;

    _winSprite = null;
    _looseSprite = null;
    _tieSprite = null;
    _backSprite = null;
    _replaySprite = null;

    _countdownNumber = null;
    _countdownBg = null;
    _blackout = null;
    _fullBlackout = null;
    _ringOpen = null;
    _wrestleSprite = null;

    interactive = true;
    OpenSelectCards = null;

    GetGlobalVolume = null;
    SetGlobalVolume = null;
    _volumeSlider = null;

    _soundWalk = null;
    _soundHit = null;
    _soundBlock = null;

    constructor() {
        this.container = new PIXI.Container();
        this.movesContainer = new PIXI.Container();
        this.winLooseContainer = new PIXI.Container();
        this.pauseContainer = new PIXI.Container();

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

        for (let i = 0; i < 8 + 4; ++i) {
            this._attackPatterns.push([]);
        } // Attack patterns (obciously)
        this._attackPatterns[1].push({row: 0, col: 0});
        this._attackPatterns[2].push(
            {row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, 
            {row: -1, col: 0},  {row: -2, col: 0}
        );
        this._attackPatterns[3].push(
            {row: 0, col: 0}, {row: -1, col: 1}, {row: 1, col: 1}, 
            {row: -1, col: -1},  {row: 1, col: -1}
        );
        this._attackPatterns[4].push(
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: -1}, 
            {row: 1, col: 0},  {row: -1, col: 0}
        );
        this._attackPatterns[5].push(
            {row: -2, col: -1 }, { row: -2, col: 0 }, {row:-2, col: 1},
            {row: -1, col: 0}
        );
        this._attackPatterns[6].push(
            {row: 2, col: -1 }, { row: 2, col: 0 }, {row:2, col: 1},
            {row: 1, col: 0}
        );
        this._attackPatterns[7].push(
            {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, 
            {row: 0, col: -1}, {row: 0, col: -2}, {row: 0, col: -3}
        );
    }

    async Initialize(allSounds, width, height) {
        const p1HealthMask = new PIXI.Graphics();
        this.container.addChild(p1HealthMask);
        const p2HealthMask = new PIXI.Graphics();
        this.container.addChild(p2HealthMask);

        const background = new PIXI.Graphics()
            .rect(0, 0, width, height)
            .fill(0x1d1d1d);
        this.container.addChild(background);

        const blackout = this._blackout = new PIXI.Graphics()
            .rect(-width / 2, 0, width * 2, height)
            .fill(0x000000);
        blackout.alpha = 0.75;

        const fullBlackout = this._fullBlackout = new PIXI.Graphics()
            .rect(-width / 2, 0, width * 2, height)
            .fill(0x000000);
        fullBlackout.alpha = 0.75;

        const self = this;
        const movesContainer = this.movesContainer;
        const atlas1 = this._atlas1 = await PIXI.Assets.load("atlas1");
        const atlas2 = this._atlas2 = await PIXI.Assets.load("atlas2");
        const atlas3 = this._atlas3 = await PIXI.Assets.load("atlas3");

        { // sfx
            PIXI.Assets.add({ alias: 'walk', src: 'sound/walk.wav' });
            this._soundWalk = await PIXI.Assets.load('walk');
            allSounds.push(this._soundWalk);

            PIXI.Assets.add({ alias: 'hit', src: 'sound/hit.wav' });
            this._soundHit = await PIXI.Assets.load('hit');
            allSounds.push(this._soundHit);

            PIXI.Assets.add({ alias: 'block', src: 'sound/block.wav' });
            this._soundBlock = await PIXI.Assets.load('block');
            allSounds.push(this._soundBlock);
        }
        const player1 = this.player1 = new PIXI.Sprite(atlas2.textures["player1.png"]);
        const player2 = this.player2 = new PIXI.Sprite(atlas2.textures["player2.png"]);
       
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
            p1HealthFill.mask = p1HealthMask;
            p2HealthFill.mask = p2HealthMask;

            p1HealthMask.clear();
            p1HealthMask.rect(p1HealthFill.x , p1HealthFill.y ,  p1HealthFill.width, p1HealthFill.height );
            p1HealthMask.fill(0xff0000);

            p2HealthMask.clear();
            p2HealthMask.rect(p2HealthFill.x - p2HealthFill.width, p2HealthFill.y ,  p2HealthFill.width, p2HealthFill.height );
            p2HealthMask.fill(0xff0000);

            const mike = new PIXI.Sprite(atlas2.textures["name1.png"]);
            const ike = new PIXI.Sprite(atlas2.textures["name2.png"]);
            mike.x = 297; mike.y = 126;
            ike.x = 676; ike.y = 131;
            this.container.addChild(mike);
            this.container.addChild(ike);

            const maxHealth = 100;
            //Object.defineProperty(player1, '_health', maxHealth);
            //Object.defineProperty(player2, '_health', maxHealth);
            player1._health = maxHealth;
            player2._health = maxHealth;

            const _p1HealthDisplay = [];
            const _p2HealthDisplay = [];
            const initialSprites = [
                atlas1.textures["num_1.png"], atlas1.textures["num_0.png"], atlas1.textures["num_0.png"],
                atlas1.textures["slash.png"],
                atlas1.textures["num_1.png"], atlas1.textures["num_0.png"], atlas1.textures["num_0.png"]
            ];
            for (let i = 0; i < 7; ++i) {
                const texture = initialSprites[i];
                const p1Sprite = new PIXI.Sprite(texture);
                const p2Sprite = new PIXI.Sprite(texture);
                _p1HealthDisplay.push(p1Sprite);
                _p2HealthDisplay.push(p2Sprite);
                this.container.addChild(p1Sprite);
                this.container.addChild(p2Sprite);
                p1Sprite.x = p1HealthFill.x + p1Sprite.width * i;
                p1Sprite.x = Math.floor(p1Sprite.x  + p1HealthFill.width / 2);
                p1Sprite.x -= Math.floor(p1Sprite.width * 7 / 2)
                p1Sprite.y = Math.floor(p1HealthFill.y + p1HealthFill.height / 2 - p1Sprite.height / 2);
                p2Sprite.x = p2HealthFill.x - p2HealthFill.width + p2Sprite.width * i;
                p2Sprite.y = Math.floor(p2HealthFill.y + p2HealthFill.height / 2 - p1Sprite.height / 2);
                p2Sprite.x = Math.floor(p2Sprite.x + p2HealthFill.width / 2);
                p2Sprite.x -= Math.floor(p2Sprite.width * 7 / 2)
            }

            Object.defineProperty(player1, 'health', {
                get: function() {return this._health;},
                set: function(v) {
                    //v = Number(v);
                    if (v < 0) { v = 0; }
                    if (v > maxHealth) { v = maxHealth; }
                    const t = v / maxHealth;
        
                    p1HealthMask.clear();
                    p1HealthMask.rect(p1HealthFill.x , p1HealthFill.y ,  Math.floor(p1HealthFill.width * t), p1HealthFill.height);
                    p1HealthMask.fill(0xff0000);

                    this._health = v;

                    if (v == 100) {
                        _p1HealthDisplay[0].visible = true;
                        _p1HealthDisplay[1].visible = true;
                        _p1HealthDisplay[2].visible = true;
                        _p1HealthDisplay[0].texture = atlas1.textures["num_1.png"];
                        _p1HealthDisplay[1].texture = atlas1.textures["num_2.png"];
                        _p1HealthDisplay[2].texture = atlas1.textures["num_3.png"];
                    }
                    else {
                        _p1HealthDisplay[0].visible = false;
                        if (v < 10) {
                            _p1HealthDisplay[1].visible = false;
                            _p1HealthDisplay[2].visible = true;
                            _p1HealthDisplay[2].texture = atlas1.textures["num_" + v + ".png"];
                        }
                        else {
                            _p1HealthDisplay[1].visible = true;
                            _p1HealthDisplay[2].visible = true;
                            let _v = Math.floor(v / 10);
                            _p1HealthDisplay[1].texture = atlas1.textures["num_" + _v + ".png"];
                            _v = v - _v * 10;
                            _p1HealthDisplay[2].texture = atlas1.textures["num_" + _v + ".png"];
                        }
                    }
                }
            });
            Object.defineProperty(player2, 'health', {
                get: function() {return this._health;},
                set: function(v) {
                    //v = Number(v);
                    if (v < 0) { v = 0; }
                    if (v > maxHealth) { v = maxHealth; }
                    const t = v / maxHealth;

                    p2HealthMask.clear();
                    p2HealthMask.rect(p2HealthFill.x - p2HealthFill.width, p2HealthFill.y ,  Math.floor(p2HealthFill.width * t), p2HealthFill.height );
                    p2HealthMask.fill(0xff0000);

                    this._health = v;

                    if (v == 100) {
                        _p2HealthDisplay[0].visible = true;
                        _p2HealthDisplay[1].visible = true;
                        _p2HealthDisplay[2].visible = true;
                        _p2HealthDisplay[0].texture = atlas1.textures["num_1.png"];
                        _p2HealthDisplay[1].texture = atlas1.textures["num_2.png"];
                        _p2HealthDisplay[2].texture = atlas1.textures["num_3.png"];
                    }
                    else {
                        _p2HealthDisplay[0].visible = false;
                        if (v < 10) {
                            _p2HealthDisplay[1].visible = false;
                            _p2HealthDisplay[2].visible = true;
                            _p2HealthDisplay[2].texture = atlas1.textures["num_" + v + ".png"];
                        }
                        else {
                            _p2HealthDisplay[1].visible = true;
                            _p2HealthDisplay[2].visible = true;
                            let _v = Math.floor(v / 10);
                            _p2HealthDisplay[1].texture = atlas1.textures["num_" + _v + ".png"];
                            _v = v - _v * 10;
                            _p2HealthDisplay[2].texture = atlas1.textures["num_" + _v + ".png"];
                        }
                    }
                }
            });
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
                indicator.row = Math.floor(i / 3);
                indicator.col = Math.floor(i % 3);
                this._indicators.push(indicator);
                this.container.addChild(indicator);
            }
        }
        
        player1.x = this.centerPositions[9].x; player1.y = this.centerPositions[9].y;
        player2.x = this.centerPositions[2].x; player2.y = this.centerPositions[2].y;
        player1.anchor.set(0.5, 1);
        player2.anchor.set(0.5, 1);
        this.container.addChild(player1);
        this.container.addChild(player2);

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
        
        const aiCard1 = new PIXI.Sprite(selectCardTexture);
        const aiCard2 = new PIXI.Sprite(selectCardTexture);
        const aiCard3 = new PIXI.Sprite(selectCardTexture);
        aiCard1.x = 18 + width; aiCard1.y = -5000;//2086 - 700;
        aiCard2.x = 18 + width; aiCard2.y = -5000;//2086 - 350;
        aiCard3.x = 18 + width; aiCard3.y = -5000;//2086;
        this.container.addChild(aiCard1);
        this.container.addChild(aiCard2);
        this.container.addChild(aiCard3);
        const aiCards = this._aiCards = [aiCard1, aiCard2, aiCard3];

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
            let move = new Move("card_block.png", atlas2, movesContainer, 0, 0);
            move.pattern = [];

            for (let i = 1; i <= 7; ++i) {
                move = new Move("card_attack_" + i + ".png", atlas2, movesContainer, 25, 0);
                move.pattern = self._attackPatterns[i];
            }
            move = new Move("card_move_down.png" , atlas2, movesContainer, 0, 0);
            move.pattern = [];
            
            move = new Move("card_move_up.png"   , atlas2, movesContainer, 0, 0);
            move.pattern = [];
            
            move = new Move("card_move_left.png" , atlas2, movesContainer, 0, 0);
            move.pattern = [];
            
            move = new Move("card_move_right.png", atlas2, movesContainer, 0, 0);
            move.pattern = [];
        }
        this.container.addChild(movesContainer);
        movesContainer.visible = false;
        blackout.visible = false;

        this.container.addChild(fullBlackout);
        fullBlackout.visible = false;

        const selectCards = () => {
            if (blackout.visible) {
                return false;
            }
            if (!self.interactive) {
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
            if (!self.interactive) {
                return;
            }
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

        new PIXI.ui.Button(menuSprite).onPress.connect(() => {
            if (!self.interactive) {
                return;
            }
            self.interactive = false;
            self._fullBlackout.visible = true;
            self.pauseContainer.visible = true;
            const volume = self.GetGlobalVolume();
            self._volumeSlider.value = Math.floor(volume * 100);
            self._aiCheckboxNormal.checked = !self._useRandomAi;
            self._aiCheckboxRandom.checked = self._useRandomAi;
        });

        const ringPreviewBtn = new PIXI.ui.Button(ringSpriteOpen);

        ringPreviewBtn.onPress.connect(() => {
            if (!self.interactive) {
                return;
            }

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

        { // countdown
            const countdownContainer = this.countdownContainer = new PIXI.Container();
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

        { // Win / loosw
            const winLooseContainer = this.winLooseContainer;
            winLooseContainer.x = Math.floor(width / 2);
            winLooseContainer.y = Math.floor(height / 2) - 120;

            this.container.addChild(winLooseContainer);
            const belt = new PIXI.Sprite(atlas3.textures["belt.png"]);
            belt.anchor.set(0.5, 0.5);
            winLooseContainer.addChild(belt);
            const winSprite = this._winSprite = new PIXI.Sprite(atlas3.textures["win.png"]);
            winSprite.anchor.set(0.5, 0.5);
            winSprite.x = 10;
            winSprite.y = 50;
            winLooseContainer.addChild(winSprite);
            winSprite.visible = false;
            
            const looseSprite = this._looseSprite = new PIXI.Sprite(atlas3.textures["loose.png"]);
            looseSprite.anchor.set(0.5, 0.5);
            looseSprite.x = 15;
            looseSprite.y = 60;
            winLooseContainer.addChild(looseSprite);
            looseSprite.visible = false;

            const tieSprite = this._tieSprite = new PIXI.Sprite(atlas3.textures["tie.png"]);
            tieSprite.anchor.set(0.5, 0.5);
            tieSprite.x = 5;
            tieSprite.y = 60;
            winLooseContainer.addChild(tieSprite);

            const backToMenu = this._backSprite = new PIXI.Sprite(atlas3.textures["menu.png"]);
            backToMenu.y = Math.floor(belt.height / 2 + backToMenu.height );
            backToMenu.anchor.set(0.5, 0.5);
            winLooseContainer.addChild(backToMenu);
            
            const replay = this._replaySprite = new PIXI.Sprite(atlas3.textures["play.png"]);
            replay.y = Math.floor(belt.height / 2 + backToMenu.height * 2 + 40 );
            replay.anchor.set(0.5, 0.5);
            winLooseContainer.addChild(replay);

            new PIXI.ui.Button(backToMenu).onPress.connect(() => {
                if (self.onBackToMenu !== null) {
                    self.onBackToMenu();
                }
            });

            new PIXI.ui.Button(replay).onPress.connect(() => {
                self.Reset();
            });

            winLooseContainer.visible = false;
        }

        { // Pause
            const pauseContainer = self.pauseContainer;
            this.container.addChild(pauseContainer);

            const pauseBg = new PIXI.Graphics()
                .rect(0, 555, width, 1901 - 555)
                .fill(0x323232);
            const pauseHeader = new PIXI.Sprite(atlas3.textures["settings_header.png"]);
            const pausefooter = new PIXI.Sprite(atlas3.textures["settings_footer.png"]);
            pauseContainer.addChild(pauseBg);
            pauseContainer.addChild(pauseHeader);
            pauseContainer.addChild(pausefooter);
            pauseHeader.x = 0; pauseHeader.y = 542;
            pauseHeader.x = 0; pausefooter.y = 1888;

            const volumeLabel = new PIXI.Sprite(atlas3.textures["volume_label.png"]);
            const volumeBar = new PIXI.Sprite(atlas3.textures["volume_track.png"]);
            const volumeKnob = new PIXI.Sprite(atlas3.textures["volume_knob.png"]);
            pauseContainer.addChild(volumeLabel);
            volumeLabel.x = 63; volumeLabel.y = 882;
            volumeBar.x = 0; volumeBar.y = 1005;
            volumeKnob.x = 342 - 180; 
            volumeKnob.y = Math.floor(1036 - volumeKnob.height * 0.25);

            const volumeSlider = self._volumeSlider =  new PIXI.ui.Slider({
                bg: volumeBar,
                fill: volumeBar,
                slider: volumeKnob,
                min: 0,
                max: 100,
                step: 1,
                value: 80,
                showValue: false,
            });
            volumeSlider.x = 180;
            pauseContainer.addChild(volumeSlider);

            volumeSlider.onChange.connect((value) => {
                if (value < 0) { value = 0; }
                value = value / 100;
                if (value > 1) { value = 1; }
                self.SetGlobalVolume(value);
            });

            const aiLabel = new PIXI.Sprite(atlas3.textures["ai_label.png"]);
            pauseContainer.addChild(aiLabel);
            aiLabel.x = 63; aiLabel.y = 1126;

            const normalOff = new PIXI.Sprite(atlas3.textures["checkbox_off.png"]);
            const normalOn = new PIXI.Sprite(atlas3.textures["checkbox_on.png"]);
            const labelnormal = new PIXI.Sprite(atlas3.textures["normal.png"]);
            normalOff.x = 127; normalOff.y = 1253;
            normalOn.x = 127; normalOn.y = 1253;
            labelnormal.x = 226; labelnormal.y = 1272;
            pauseContainer.addChild(labelnormal);
            const checkboxNormal = self._aiCheckboxNormal = new PIXI.ui.CheckBox({
                checked: true,
                style: {
                    unchecked: normalOff,
                    checked: normalOn,
                }
            });
            pauseContainer.addChild(checkboxNormal);

            const randomOff = new PIXI.Sprite(atlas3.textures["checkbox_off.png"]);
            const randomOn = new PIXI.Sprite(atlas3.textures["checkbox_on.png"]);
            const labelRandom = new PIXI.Sprite(atlas3.textures["random.png"]);
            randomOn.x = 615; randomOn.y = 1253;
            randomOff.x = 615; randomOff.y = 1253;
            labelRandom.x = 717; labelRandom.y = 1278;
            pauseContainer.addChild(labelRandom);
            const checkboxRandom = self._aiCheckboxRandom = new PIXI.ui.CheckBox({
                style: {
                    unchecked: randomOff,
                    checked: randomOn,
                }
            });
            pauseContainer.addChild(checkboxRandom);

            checkboxRandom.onCheck.connect((checked) => {
                if (checked) {
                    checkboxNormal.checked = false;
                    self._useRandomAi = true;
                }
            });

            checkboxNormal.onCheck.connect((checked) => {
                if (checked) {
                    checkboxRandom.checked = false;
                    self._useRandomAi = false;
                }
            });

            const buttonReset = new PIXI.Sprite(atlas3.textures["reset_btn.png"]);
            buttonReset.x = 127; buttonReset.y = 1481;
            pauseContainer.addChild(buttonReset);

            new PIXI.ui.Button(buttonReset).onPress.connect(() => {
                self.Reset();
            });

            const buttonExit = new PIXI.Sprite(atlas3.textures["exit_btn.png"]);
            buttonExit.x = 606; buttonExit.y = 1483;
            pauseContainer.addChild(buttonExit);

            new PIXI.ui.Button(buttonExit).onPress.connect(() => {
                if (self.onBackToMenu !== null) {
                    self.onBackToMenu();
                }
            });

            const buttonResume = new PIXI.Sprite(atlas3.textures["resume_btn.png"]);
            buttonResume.x = 292; buttonResume.y = 1703;
            pauseContainer.addChild(buttonResume);

            new PIXI.ui.Button(buttonResume).onPress.connect(() => {
                self.interactive = true;
                self._fullBlackout.visible = false;
                self.pauseContainer.visible = false;
            });
        }
    }

    Reset() {
        const countdownContainer = this.countdownContainer;
        const countdownNumber = this._countdownNumber;
        const countdownBg = this._countdownBg;
        const atlas2 = this._atlas2;
        const selectCards = this.OpenSelectCards;
        const blackout = this._blackout;
        const fullBlackout = this._fullBlackout;
        const movesContainer = this.movesContainer;
        const self = this;

        self._aiCheckboxNormal.checked = !self._useRandomAi;
        self._aiCheckboxRandom.checked = self._useRandomAi;

        const selectCardTexture = this._atlas2.textures["select_card.png"];
        this._aiCards[0].texture = selectCardTexture;
        this._aiCards[1].texture = selectCardTexture;
        this._aiCards[2].texture = selectCardTexture;
        this._cards[0].texture = selectCardTexture;
        this._cards[1].texture = selectCardTexture;
        this._cards[2].texture = selectCardTexture;

        self.pauseContainer.visible = false;
        self.winLooseContainer.visible = false;
        self.player1.health = 100;
        self.player2.health = 100;
        self.player1.x = this.centerPositions[9].x; self.player1.y = this.centerPositions[9].y;
        self.player2.x = this.centerPositions[2].x; self.player2.y = this.centerPositions[2].y;
        self.player1.anchor.set(0.5, 1);
        self.player2.anchor.set(0.5, 1);

        this._ringOpen.visible = false;
        this._wrestleSprite.visible = false;
        this._wrestleSprite.tint = 0x7f7f7f;

        blackout.visible = false;
        fullBlackout.visible = false;
        movesContainer.visible = false;

        this.interactive = false;
        countdownNumber.visible = true;
        countdownBg.visible = true;
        countdownBg.texture = atlas2.textures["countdown_bg.png"]
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
        startupTween.start();
    }

    async CheckIfGameOver() {
        const player1 = this.player1;
        const player2 = this.player2;
        const winLooseContainer = this.winLooseContainer;
        const fullBlackout = this._fullBlackout;
        const backSprite = this._backSprite;
        const replaySprite = this._replaySprite;

        if (player1.health === 0 && player2.health === 0) {
            this._winSprite.visible = false;
            this._looseSprite.visible = false;
            this._tieSprite.visible = true;
        }
        else if (player1.health === 0) {
            this._looseSprite.visible = true;
            this._winSprite.visible = false;
            this._tieSprite.visible = false;
        }
        else if (player2.health === 0) {
            this._winSprite.visible = true;
            this._looseSprite.visible = false;
            this._tieSprite.visible = false;
        }
       
        if (player1.health === 0 || player2.health === 0) {
            return new Promise((resolve, reject) => {
                winLooseContainer.visible = true;
                fullBlackout.visible = true;
                backSprite.visible = false;
                replaySprite.visible = false;

                winLooseContainer.scale.x = 0.25;
                winLooseContainer.scale.y = 0.25;

                new tweedle_js.Tween(winLooseContainer.scale)
                    .to({ x:1.25, y:1.25 }, 500)
                    .onComplete((tweener, target) => {
                        new tweedle_js.Tween(winLooseContainer.scale)
                            .to({ x:1.0, y:1.0 }, 120)
                            .onComplete((tweener, target) => {
                                backSprite.visible = true;
                                replaySprite.visible = true;
                                resolve(player1.health === 0 || player2.health === 0);
                            })
                        .start();
                    })
                .start();
            });
        }

        return new Promise((resolve, reject) => {
            resolve(player1.health === 0 || player2.health === 0);
        });
    };

    async ExecuteAllMoves() {
        let isGameOver = false;
        
        this._ringOpen.visible = false;
        this._wrestleSprite.visible = false;
        this._wrestleSprite.tint = 0x7f7f7f;

        this._blackout.visible = false;
        this._fullBlackout.visible = false;
        this.movesContainer.visible = false;
        this._countdownNumber.visible = false;
        this._countdownBg.visible = false;

        this.player1.hasDefenseBuff = false;
        this.player2.hasDefenseBuff = false;

        this.interactive = false;
        {
            if (this._useRandomAi) {
                this._QueueUpRandomAiMoves();
            }
            else {
                this._QueueUpAiMoves();
            }

            await this._ExecuteNextMove(this.player1, this.player2, this._cards);
            await this._ExecuteNextMove(this.player2, this.player1, this._aiCards);
            isGameOver = await this.CheckIfGameOver();

            if (!isGameOver) {
                await this._ExecuteNextMove(this.player1, this.player2, this._cards);
                await this._ExecuteNextMove(this.player2, this.player1, this._aiCards);
                isGameOver = await this.CheckIfGameOver();
                if (!isGameOver) {
                    await this._ExecuteNextMove(this.player1, this.player2, this._cards);
                    await this._ExecuteNextMove(this.player2, this.player1, this._aiCards);
                    isGameOver = await this.CheckIfGameOver();
                }
            }
        }

        if (!isGameOver) {
            this.interactive = true;
        }

        return new Promise((resolve, reject) => {
            resolve(isGameOver);
        });
    }

    _GetMoveUpDown(player1, player2) {
        const moveDown =  Move.all.get("card_move_down.png");
        const moveUp =  Move.all.get("card_move_up.png");

        const p1Tile = this.FindClosestTile(player1.x, player1.y);
        const p2Tile = this.FindClosestTile(player2.x, player2.y);

        if (p2Tile.row < p1Tile.row) {
            return moveUp;
        }
        else if (p2Tile.row > p1Tile.row) {
            return moveDown;
        }
        return null;
    }

    _GetMoveLeftRight(player1, player2) {
        const moveLeft =  Move.all.get("card_move_left.png");
        const movRight =  Move.all.get("card_move_right.png");

        const p1Tile = this.FindClosestTile(player1.x, player1.y);
        const p2Tile = this.FindClosestTile(player2.x, player2.y);

        if (p2Tile.col < p1Tile.col) {
            return moveLeft;
        }
        else if (p2Tile.col > p1Tile.col) {
            return movRight;
        }
        return null;
    }

    _QueueUpRandomAiMoves() {
        const cards = this._aiCards;
        const selectCardTexture = this._atlas2.textures["select_card.png"];

        cards[0].texture = selectCardTexture;
        cards[1].texture = selectCardTexture;
        cards[2].texture = selectCardTexture;

        const allMoves = []; // Collect available attacks
        for (const [key, value] of Move.all) {
            allMoves.push(value);
        }

        let randomIndex = Math.floor(Math.random() * allMoves.length);
        let randomMove = allMoves[randomIndex];
        allMoves.splice(randomIndex, 1);
        cards[0].texture = randomMove.texture;

        randomIndex = Math.floor(Math.random() * allMoves.length);
        randomMove = allMoves[randomIndex];
        allMoves.splice(randomIndex, 1);
        cards[1].texture = randomMove.texture;

        randomIndex = Math.floor(Math.random() * allMoves.length);
        randomMove = allMoves[randomIndex];
        allMoves.splice(randomIndex, 1);
        cards[2].texture = randomMove.texture;
    }

    _QueueUpAiMoves() {
        const cards = this._aiCards;
        const atlas2 = this._atlas2;
        const selectCardTexture = atlas2.textures["select_card.png"];

        cards[0].texture = selectCardTexture;
        cards[1].texture = selectCardTexture;
        cards[2].texture = selectCardTexture;

        let canMoveUpDown = true;
        let canMoveLeftRight = true;
        let canDefend = true;

        const attacks = []; // Collect available attacks
        const ignore = ["select_card.png", "card_move_up.png", "card_move_down.png", "card_move_left.png", "card_move_right.png", "card_block.png"];
        for (const [key, value] of Move.all) {
            if (!ignore.includes(key)) {
                attacks.push(value);
            }
        }

        const playerTile = this.FindClosestTile(this.player1.x, this.player1.y);
        const enemyTile = this.FindClosestTile(this.player2.x, this.player2.y);

        const RemoveAttackIfOneIsAvailable = () => {
            for (let i = 0, len = attacks.length; i < len; ++i) {
                const pattern = attacks[i].pattern;
                for (let j = 0, count = pattern.length; j < count; ++j) {
                    const newRow = enemyTile.row + pattern[j].row;
                    const newCol = enemyTile.col + pattern[j].col;
                    if (newRow === playerTile.row && newCol === playerTile.col) {
                        const result = attacks[i];
                        attacks.splice(i, 1);
                        return result;
                    }
                }
            }
            return null;
        }
        
        let card = cards[0];
        const AdvanceIterator = () => {
            if (card === cards[0]) { 
                card = cards[1]; 
            }
            else if (card === cards[1]) { 
                card = cards[2];
            }
            else {  // Breaks loop
                card = null; 
            } 
        }

        while (card != null) {
            let availableAttack = RemoveAttackIfOneIsAvailable();
            if (availableAttack) {
                card.texture = availableAttack.texture;
                AdvanceIterator();
                continue;
            }

            const moveUpDown = this._GetMoveUpDown(this.player2, this.player1);
            if (canMoveUpDown && moveUpDown != null) {
                card.texture = moveUpDown.texture;
                canMoveUpDown = false;
                AdvanceIterator();
                continue;
            }

            const moveLeftRight = this._GetMoveLeftRight(this.player2, this.player1);
            if (canMoveLeftRight && moveLeftRight != null) {
                card.texture = moveLeftRight.texture;
                canMoveLeftRight = false;
                AdvanceIterator();
                continue;
            }

            if (canDefend) {
                card.texture = Move.all.get("card_block.png").texture;
                canDefend = false;
                AdvanceIterator();
                continue;
            }

            // PICK RANDOM ATTACK
            const randomAttackIndex = Math.floor(Math.random() * attacks.length);
            const randomAttack = attacks[randomAttackIndex];
            attacks.splice(randomAttackIndex, 1);
            card.texture = randomAttack.texture;
            AdvanceIterator();
        }
    }

    FindClosestTile(x, y) {
        const self = this;
        if (self === null || self === undefined) {
            throw new Error("Undefined this");
        }
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

    async _ExecuteNextMove(player1, player2, cards) {
        const self = this;

        const atlas2 = this._atlas2;
        const selectCardTexture = atlas2.textures["select_card.png"];
        const moveUp =    Move.all.get("card_move_up.png").texture;
        const moveDown =  Move.all.get("card_move_down.png").texture;
        const moveLeft =  Move.all.get("card_move_left.png").texture;
        const moveRight = Move.all.get("card_move_right.png").texture;
        const block =     Move.all.get("card_block.png").texture;
        
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
            
                const playerTile = self.FindClosestTile(player1.x, player1.y);
                let targetTile = null;
                if (texture === moveUp) {
                    if (playerTile.row === 0) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move up, early out
                        return null;
                    }
                    targetTile = self.FindClosestTile(player1.x, player1.y - 400);
                }
                else if (texture === moveDown) {
                    if (playerTile.row === 3) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move down, early out
                        return null;
                    }
                    targetTile = self.FindClosestTile(player1.x, player1.y + 400);
                }
                else if (texture === moveLeft) {
                    if (playerTile.col === 0) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move left, early out
                        return null;
                    }
                    targetTile = self.FindClosestTile(player1.x - 360, player1.y);
                }
                else if (texture === moveRight) {
                    if (playerTile.col === 2) {
                        card.texture = selectCardTexture;
                        resolve(null); // Can't move right, early out
                        return null;
                    }
                    targetTile = self.FindClosestTile(player1.x + 360, player1.y);
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
                self._soundWalk.play();

                const enemyTile = self.FindClosestTile(player2.x, player2.y);
                if (enemyTile.row === targetTile.row && enemyTile.col === targetTile.col) {
                    new tweedle_js.Tween(self.player1.anchor).to({ x:1 }, 250).start();
                    new tweedle_js.Tween(self.player2.anchor).to({ x:0 }, 250).start();
                }
                else {
                    if (self.player1.anchor.x !== 0.5) {
                        new tweedle_js.Tween(self.player1.anchor).to({ x:0.5 }, 250).start();
                    }
                    if (self.player2.anchor.x !== 0.5) {
                        new tweedle_js.Tween(self.player2.anchor).to({ x:0.5 }, 250).start();
                    }
                }
                player1.hasDefenseBuff = false;
                return null;
            }
            // Handle buffs
            else if (texture === block) {
                const playerTile = self.FindClosestTile(player1.x, player1.y);
                const indicator = self._indicators[playerTile.index];
                indicator.visible = true;
                indicator.tint = 0x0059c1;
                setTimeout(() => {
                    self._soundBlock.play();
                }, 200);
                setTimeout(() => {
                    card.texture = selectCardTexture;
                    indicator.visible = false;
                    player1.hasDefenseBuff = true;
                    resolve(null); // Can't move right, early out
                }, 1000);
                return null;
            }
            // Handle attack moves
            else { 
                let label = card.texture.label; // something like card_attack_1.png
                const move = Move.all.get(label);
                if (!(label.startsWith("card_attack_") && label.endsWith(".png"))) {
                    throw new Error("Invalid attack");
                }
                label = label.substring("card_attack_".length);
                label = label.substring(0, label.length - ".png".length);
                const attackIndex = Number(label);
                const pattern = self._attackPatterns[attackIndex];

                const playerTile = self.FindClosestTile(player1.x, player1.y);
                const enemyTile = self.FindClosestTile(player2.x, player2.y);
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

                    if (attackIndicator.row === enemyTile.row && attackIndicator.col === enemyTile.col) {
                        let damage = move.damage;
                        if (player2.hasDefenseBuff) {
                            damage = Math.floor(damage / 3);
                            player2.hasDefenseBuff = false;
                        }
                        player2.health = player2.health - damage;
                        Game._FlashSprite(player2, 0xff0000);
                    }
                }

                setTimeout(() => {
                    self._soundHit.play();
                }, 200);

                setTimeout(() => {
                    card.texture = selectCardTexture;
                    for (let i = 0, len = indicators.length; i < len; ++i) {
                        indicators[i].visible = false;
                    }
                    resolve(null); 
                }, 1000);

                player1.hasDefenseBuff = false;
                return null;
            }
        });
    }

    static _FlashSprite(sprite, color) {
        const duration = 170;
        sprite.tint = color;
        setTimeout(() => {
            sprite.tint = sprite.tint === color? 0xffffff : color;
            setTimeout(() => {
                sprite.tint = sprite.tint === color? 0xffffff : color;
                setTimeout(() => {
                    sprite.tint = sprite.tint === color? 0xffffff : color;
                    setTimeout(() => {
                        sprite.tint = sprite.tint === color? 0xffffff : color;
                        setTimeout(() => {
                            sprite.tint = sprite.tint === color? 0xffffff : color;
                            /*setTimeout(() => {
                                sprite.tint = sprite.tint === color? 0xffffff : color;
                                setTimeout(() => {
                                    sprite.tint = sprite.tint === color? 0xffffff : color;
                                }, duration);
                            }, duration);*/
                        }, duration);
                    }, duration);
                }, duration);
            }, duration);
        }, duration);
    }
}
