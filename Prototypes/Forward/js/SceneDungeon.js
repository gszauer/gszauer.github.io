import CardBase from "./CardBase.js";

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
    }

    create() {
        const numRows = 3;
        const numColumns = 3;
        const cardWidth = 300;
        const cardHeight = 460;
        const cardPadding = 25;
        const padLeft = 10; // Add to card padding on left to center playing field
        const padTop = -130;

        const backgroundImage = this.add.image(0, 0, 'background');
        backgroundImage.setOrigin(0, 0);

        const cogSprite = this.add.sprite(0, 2048, this.GetSet("Cog.png"), "Cog.png");
        cogSprite.x += cogSprite.width / 2 + cardPadding;
        cogSprite.y -= cogSprite.height / 2 + cardPadding;
        cogSprite.setScale(0.90, 0.90);

        const coinSprite = this.add.sprite(1024,2048, this.GetSet("Coin.png"), "Coin.png");
        coinSprite.x -= coinSprite.width / 2 + cardPadding;
        coinSprite.y -= coinSprite.height / 2 + cardPadding;
        coinSprite.setScale(0.98, 0.98);

        const coinText = this.add.bitmapText(0, 0, this.cardValueFont, "-", this.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        coinText.x = (coinSprite.x) - (coinText.width / 2) - 20;
        coinText.y = (coinSprite.y) - (coinText.height / 2) + 5;
        coinText.setTint(0);


        const monsters = [];
        for (let i = 0; i < numColumns; ++i) {
            for (let j = 0; j < numRows; ++j) {
                const x = i * cardWidth + cardPadding + cardPadding * i + padLeft;
                const y = j * cardHeight + cardPadding + cardPadding * j + padTop;

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
            }
        }

        const playerY = numRows * cardHeight + cardPadding + 
                        cardPadding * numRows + padTop + 150;
        const playerX = cardWidth + cardPadding + cardPadding + padLeft;

        const player = new CardBase({
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
        this.coinText = coinText;
        this.coinSprite = coinSprite;


        this.Coins =Math.floor(Math.random() * 21) + 1;


        // Debug code
        /*var keyObj = this.input.keyboard.addKey('H');
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
        });*/
    }

    set Coins(newValue) {
        if (newValue < 0) { newValue = 0; }
        this.coins = newValue;
        this.coinText.text = newValue;
        this.coinText.x = (this.coinSprite.x) - (this.coinText.width / 2) - 20;
        this.coinText.y = (this.coinSprite.y) - (this.coinText.height / 2) + 5;
    }

    GetSet(spriteName) {
        return "set1"; // TODO
    }

    update(time, delta) {
       
    }
}