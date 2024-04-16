import CardBase from "./CardBase.js";

export default class SceneDungeon extends Phaser.Scene {
    constructor() {
        super('SceneDungeon');
    }

    preload() {
        this.load.atlas('set1', 'assets/set1.jpg', 'assets/set1.json');
        this.load.atlas('set2', 'assets/set2.png', 'assets/set2.json');
        this.load.bitmapFont('morgamon', 'assets/morgamon_0.png', 'assets/morgamon.fnt');
        
        this.cardNameFont = 'morgamon';
        this.cardNameFontSize  = 56;
        
        this.scaleFactor = 1.0;
        this.set1 = ["Anubis.png","Sword.png","Death.png","Justice.png","Merchant.png","TheEmperor.png","TheEmpress.png","TheFool.png","TheHangedMan.png","TheHeirophant.png","TheHermit.png","TheHighPriestess.png","TheMagician.png","TheMoon.png","TheStar.png","Treasure.png","ClownTown.png","Jester.png","Judgement.png","Ninja.png","SkullPile1.png","SkullPile2.png","SkullPile3.png","Strength.png","Temperance.png","TheChariot.png","TheDevil.png","TheLovers.png","TheSun.png","TheTower.png","TheWorld.png","WheelOfFortune.png","WhereWolf.png","Wizard.png","WorldKnight.png","Assasin.png"];
        this.names1 = ["Anubis","Sword","Death","Justice","Merchant","The Emperor","The Empress","The Fool","The Hanged Man","The Heirophant","The Hermit","The High Priestess","The Magician","The Moon","The Star","Coins","Assasin","Another Fool","Judgement","Ninja","Dead Bones","Dead Bones","Dead Bones","Strength","Temperance","The Chariot","The Devil","The Lovers","The Sun","The Tower","The World","Wheel Of Fortune","Warewolf","Evil Wizard","Evil Knight","Assasin"];
    }

    create() {
        const numRows = 3;
        const numColumns = 3;
        const cardWidth = 300;
        const cardHeight = 420;
        const cardPadding = 25;
        const padLeft = 10; // Add to card padding on left to center playing field

        for (let i = 0; i < numColumns; ++i) {
            for (let j = 0; j < numRows; ++j) {
                const x = i * cardWidth + cardPadding + cardPadding * i + padLeft;
                const y = j * cardHeight + cardPadding + cardPadding * j;

                let random =  Math.floor(Math.random() * this.set1.length);

                new CardBase({
                    scene: this, 
                    x: x, y: y, 
                    name: this.names1[random],
                    sprite: this.set1[random],
                    depth: 1
                });
            }
        }

        const playerY = numRows * cardHeight + cardPadding + cardPadding * numRows + 75;
        const playerX = cardWidth + cardPadding + cardPadding + padLeft;

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