import CardBase from "./CardBase.js";

export default class SceneDungeon extends Phaser.Scene {
    constructor() {
        super('SceneDungeon');
    }

    preload() {
        this.load.atlas('tarotcards', 'assets/atlas.png', 'assets/atlas.json');
        this.load.bitmapFont('morgamon', 'assets/morgamon_0.png', 'assets/morgamon.fnt');
        this.cardNameFont = 'morgamon';
        this.cardNameFontSize  = 56;

    }

    create() {
        
        const cardWidth = 632;
        const cardHeight = 714;
        const cardPadding = 20;

        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 4; ++j) {
                const x = i * cardWidth + cardPadding + cardPadding * i;
                const y = j * cardHeight + cardPadding + cardPadding * j - cardHeight / 2;

                new CardBase({
                    scene: this, 
                    x: x, y: y, 
                    name: "The Fool",
                    sprite: "TheFool.png",
                    depth: 1
                });
            }
        }

        const playerY = 4 * cardHeight + cardPadding + cardPadding * 4 - cardHeight / 2 + 150; // + 40 is our own offset
        const playerX = cardWidth + cardPadding + cardPadding;

        new CardBase({
            scene: this, 
            x: playerX, y: playerY, 
            name: "The Fool",
            sprite: "TheFool.png",
            depth: 1
        });
    }

    update(time, delta) {
       
    }
}