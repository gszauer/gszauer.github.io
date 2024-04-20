import CardBase from "./CardBase.js";
import CardPlayer from "./CardPlayer.js";

export default class SceneDungeon extends Phaser.Scene {
    constructor() {
        super('SceneDungeon');
    }

    preload() {
        this.load.atlas('set1', 'assets/set1.png', 'assets/set1.json');
        this.load.bitmapFont('morgamon', 'assets/morgamon_0.png', 'assets/morgamon.fnt');
        this.load.bitmapFont('magicstary', 'assets/magicstary_0.png', 'assets/magicstary.fnt');
        this.load.image('background', 'assets/background.jpg');
        
        this.cardNameFont = 'morgamon';
        this.cardValueFont = 'magicstary';
        this.cardNameFontSize  = 56;
        this.cardValueFontSize  = 96;
        
        this.scaleFactor = 1.0;
        this.set1 = [ "Death.png", "Justice.png", "Strength.png", "TheEmperor.png", "TheEmpress.png", "TheFool.png", "TheHangedMan.png", "TheHeriophant.png", "TheHermit.png", "TheHighPriestess.png", "TheMagician.png", "TheMoon.png", "TheStar.png", "TheSun.png", "TheTower.png", "Judgement.png", "Temperance.png", "TheChariot.png", "TheDevil.png", "TheLovers.png", "TheWheelOfFortune.png" ];
        this.names1 = [ "Death", "Justice", "Strength", "The Emperor", "The Empress", "The Fool", "The HangedMan", "The Heriophant", "The Hermit", "The High Priestess", "The Magician", "The Moon", "The Star", "The Sun", "The Tower", "Judgement", "Temperance", "The Chariot", "The Devil", "The Lovers", "The Wheel Of Fortune" ];
   
        this.cardPadding = 25;
        this.cardWidth = 300;
        this.cardHeight = 460;
    }

    create() {
        const numRows = 3;
        const numColumns = 3;
        const padLeft = this.cardWidth / 2 + 10; // Add to card padding on left to center playing field
        const padTop = 60;

        const cardWidth = this.cardWidth;
        const cardHeight = this.cardHeight;
        const cardPadding = this.cardPadding;

        const backgroundImage = this.add.image(0, 0, 'background');
        backgroundImage.setOrigin(0, 0);

        const cogSprite = this.add.sprite(0, 2048, this.GetSet("Cog.png"), "Cog.png");
        cogSprite.x += cogSprite.width / 2 + cardPadding;
        cogSprite.y -= cogSprite.height / 2 + cardPadding;
        cogSprite.setScale(0.90, 0.90);

        const monsters = [];
        for (let i = 0; i < numColumns; ++i) {
            for (let j = 0; j < numRows; ++j) {
                const x = (i * cardWidth)  + cardPadding + (cardPadding * i) + padLeft;
                const y = (j * cardHeight) + cardPadding + (cardPadding * j) + padTop;

                let randomCard =  Math.floor(Math.random() * this.set1.length);
                let randomValue = Math.floor(Math.random() * 21) + 1;
                let randomType = "random"; // TODO: monster, heal, shield, sword, chest, empty
               
                let monster = new CardBase({
                    scene: this, 
                    x: x, y: y, 
                    name: this.names1[randomCard],
                    sprite: this.set1[randomCard],
                    depth: 1,
                    value: randomValue,
                    type: randomType 
                });
                monsters.push(monster);
                //monster.SetVisibility(false);
            }
        }

        const playerY = numRows * cardHeight + cardPadding + 
                        cardPadding * numRows + padTop + 150;
        const playerX = cardWidth + cardPadding + cardPadding + padLeft;

        const player = new CardPlayer({
            scene: this, 
            x: playerX, y: playerY, 
            name: "The Fool",
            sprite: "TheFool.png",
            depth: 1,
            value: 10,
            type: "fool" 
        });

        this.player = player;
        this.monsters = monsters;
        this.cogSprite = cogSprite;


        this.Coins = Math.floor(Math.random() * 21) + 1;


        // Debug code
        var keyObj = this.input.keyboard.addKey('H');
        keyObj.on('up', function(event) { 
            player.SetVisibility(false);
            for (let i = 0, size = monsters.length; i < size; ++i) {
                monsters[i].SetVisibility(false);
            }
            
        });
        var keyObj = this.input.keyboard.addKey('S');
        keyObj.on('up', function(event) { 
            player.SetVisibility(true);
            for (let i = 0, size = monsters.length; i < size; ++i) {
                monsters[i].SetVisibility(true);
            }
        });
    }

    set Coins(newValue) {
        this.player.Value = newValue;
    }

    GetSet(spriteName) {
        return "set1"; // TODO
    }

    update(time, delta) {
       
    }
}