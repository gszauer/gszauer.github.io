
class Game {

    container = null;
    onReturnToMenu = null;

    constructor() {
        this.container = new PIXI.Container();
    }

    async Initialize(width, height) {
        const background = new PIXI.Graphics()
            .rect(0, 0, width, height)
            .fill(0x1d1d1d);
        this.container.addChild(background);

        const self = this;
        /*new PIXI.ui.Button(background).onPress.connect(() => {
            if (self.onReturnToMenu !== null) {
                self.onReturnToMenu();
            }
        });*/

        const atlas1 = await PIXI.Assets.load('atlas1');
        const atlas2 = await PIXI.Assets.load('atlas2');

        const topSprite = new PIXI.Sprite(atlas1.textures['playarea_top.png']);
        const bottomSprite = new PIXI.Sprite(atlas1.textures['playarea_bottom.png']);
        bottomSprite.y = height - bottomSprite.height;

        this.container.addChild(topSprite);
        this.container.addChild(bottomSprite);

        const portrait1Sprite = new PIXI.Sprite(atlas2.textures['portrait1.png']);
        const portrait2Sprite = new PIXI.Sprite(atlas2.textures['portrait2.png']);
        portrait1Sprite.x = 23;
        portrait1Sprite.y = 24;
        portrait2Sprite.x = 834;
        portrait2Sprite.y = 24;

        this.container.addChild(portrait1Sprite);
        this.container.addChild(portrait2Sprite);

        const p1HealthFill = new PIXI.Sprite(atlas2.textures['p1_fill.png']);
        const p2HealthFill = new PIXI.Sprite(atlas2.textures['p2_fill.png']);
        const p1HealthStroke = new PIXI.Sprite(atlas2.textures['p1_bar.png']);
        const p2HealthStroke = new PIXI.Sprite(atlas2.textures['p2_bar.png']);
        p2HealthFill.anchor.set(1, 0);

        p1HealthFill.x = 193;
        p1HealthFill.y = 17;
        p1HealthStroke.x = 186;
        p1HealthStroke.y = 4;
        p2HealthStroke.x = 424;
        p2HealthStroke.y = 194;
        p2HealthFill.x = 938;
        p2HealthFill.y = 200;

        this.container.addChild(p1HealthFill);
        this.container.addChild(p2HealthFill);
        this.container.addChild(p1HealthStroke);
        this.container.addChild(p2HealthStroke);

        const mike = new PIXI.Sprite(atlas2.textures['name1.png']);
        const ike = new PIXI.Sprite(atlas2.textures['name2.png']);
        mike.x = 297;
        mike.y = 126;
        ike.x = 676;
        ike.y = 131;
        this.container.addChild(mike);
        this.container.addChild(ike);

        const card1 = new PIXI.Sprite(atlas2.textures['select_card.png']);
        const card2 = new PIXI.Sprite(atlas2.textures['select_card.png']);
        const card3 = new PIXI.Sprite(atlas2.textures['select_card.png']);

        card1.x = 18;
        card1.y = 2086;
        card2.x = 296;
        card2.y = 2086;
        card3.x = 566;
        card3.y = 2086;

        this.container.addChild(card1);
        this.container.addChild(card2);
        this.container.addChild(card3);

        const menuSprite = new PIXI.Sprite(atlas2.textures['menu_button.png']);
        const selectCardSprite = new PIXI.Sprite(atlas2.textures['select_button.png']);
        menuSprite.x = 875;
        menuSprite.y = 2104;
        selectCardSprite.x = 866;
        selectCardSprite.y = 2223;
        this.container.addChild(menuSprite);
        this.container.addChild(selectCardSprite);

        const gridRow1 = new PIXI.Sprite(atlas2.textures['grid_row_1.png']);
        gridRow1.x = 9;
        gridRow1.y = 374;
        this.container.addChild(gridRow1);
        const gridRow2 = new PIXI.Sprite(atlas2.textures['grid_row_2.png']);
        gridRow2.x = 12;
        gridRow2.y = 761;
        this.container.addChild(gridRow2);
        const gridRow3 = new PIXI.Sprite(atlas2.textures['grid_row_3.png']);
        gridRow3.x = 9;
        gridRow3.y = 1162;
        this.container.addChild(gridRow3);
        const gridRow4 = new PIXI.Sprite(atlas2.textures['grid_row_4.png']);
        gridRow4.x = 12;
        gridRow4.y = 1567;
        this.container.addChild(gridRow4);
        const gridRow5 = new PIXI.Sprite(atlas2.textures['grid_row_5.png']);
        gridRow5.x = 10;
        gridRow5.y = 1961;
        this.container.addChild(gridRow5);

        const gridCol1 = new PIXI.Sprite(atlas2.textures['grid_col_1.png']);
        gridCol1.x = 9;
        gridCol1.y = 411;
        this.container.addChild(gridCol1);
        const gridCol2 = new PIXI.Sprite(atlas2.textures['grid_col_2.png']);
        gridCol2.x = 371;
        gridCol2.y = 406;
        this.container.addChild(gridCol2);
        const gridCol3 = new PIXI.Sprite(atlas2.textures['grid_col_3.png']);
        gridCol3.x = 738;
        gridCol3.y = 406;
        this.container.addChild(gridCol3);
        const gridCol4 = new PIXI.Sprite(atlas2.textures['grid_col_4.png']);
        gridCol4.x = 1103;
        gridCol4.y = 408;
        this.container.addChild(gridCol4);
    }
}
