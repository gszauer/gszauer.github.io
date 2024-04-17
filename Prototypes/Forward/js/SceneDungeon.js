import CardBase from "./CardBase.js";
import CardMonster from "./CardMonster.js";

export default class SceneDungeon extends Phaser.Scene {
    constructor() {
        super('SceneDungeon');
    }

    preload() {
        this.load.atlas('set1', 'assets/set1.png', 'assets/set1.json');
        this.load.bitmapFont('morgamon', 'assets/morgamon_0.png', 'assets/morgamon.fnt');
        this.load.bitmapFont('magicstary', 'assets/magicstary_0.png', 'assets/magicstary.fnt');
        
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
        const padTop = -240;

        for (let i = 0; i < numColumns; ++i) {
            for (let j = 0; j < numRows; ++j) {
                const x = i * cardWidth + cardPadding + cardPadding * i + padLeft;
                const y = j * cardHeight + cardPadding + cardPadding * j + padTop;

                let randomCard =  Math.floor(Math.random() * this.set1.length);
                let randomValue = Math.floor(Math.random() * 21) + 1;
                let randomType = "random"; // TODO: monster, heal, shield, sword, chest, empty

                if (this.names1[randomCard] == "Dead Bones") {
                    randomValue = -1;
                }

                new CardMonster({
                    scene: this, 
                    x: x, y: y, 
                    name: this.names1[randomCard],
                    sprite: this.set1[randomCard],
                    depth: 1,
                    value: randomValue,
                    type: randomType 
                });
            }
        }

        const playerY = numRows * cardHeight + cardPadding + cardPadding * numRows + padTop + 120;
        const playerX = cardWidth + cardPadding + cardPadding + padLeft;

        new CardBase({
            scene: this, 
            x: playerX, y: playerY, 
            name: "The Fool",
            sprite: "TheFool.png",
            depth: 1
        });

        const dividerSprite = this.add.sprite(0, 2, this.GetSet("Divider.png"), "Divider.png");
        dividerSprite.setOrigin(0, 0);
        dividerSprite.y = playerY + cardHeight + cardPadding  + 5;
        dividerSprite.setScale(8, 1);

        const shieldSprite = this.add.sprite(40, dividerSprite.y + cardPadding, this.GetSet("Shield.png"), "Shield.png");
        shieldSprite.setOrigin(0, 0);

        const shieldText = this.add.bitmapText(0, 0, this.cardValueFont, Math.floor(Math.random() * 21), this.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        shieldText.x = (shieldSprite.x + shieldSprite.width / 2) - (shieldText.width / 2);
        shieldText.y = (shieldSprite.y + shieldSprite.height / 2) - (shieldText.height / 2) + 5;
        shieldText.setTint(0);

        const heartSprite = this.add.sprite(shieldSprite.x + shieldSprite.width + 100, shieldSprite.y, this.GetSet("Heart.png"), "Heart.png");
        heartSprite.setOrigin(0, 0);

        const currentHeartText = this.add.bitmapText(0, 0, this.cardValueFont, Math.floor(Math.random() * 21) + 10, this.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        currentHeartText.x = (heartSprite.x + heartSprite.width / 2) - (currentHeartText.width / 2);
        currentHeartText.y = (heartSprite.y + heartSprite.height / 2) - (currentHeartText.height / 2);
        currentHeartText.setTint(0);

        const coinSprite = this.add.sprite(heartSprite.x + heartSprite.width + 100, shieldSprite.y, this.GetSet("Coin.png"), "Coin.png");
        coinSprite.setOrigin(0, 0);

        const coinText = this.add.bitmapText(0, 0, this.cardValueFont, Math.floor(Math.random() * 21), this.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        coinText.x = (coinSprite.x + coinSprite.width / 2) - (coinText.width / 2) - 20;
        coinText.y = (coinSprite.y + coinSprite.height / 2) - (coinText.height / 2) + 5;
        coinText.setTint(0);

        const cogSprite = this.add.sprite(coinSprite.x + coinSprite.width + 100, shieldSprite.y - 5, this.GetSet("Cog.png"), "Cog.png");
        cogSprite.setOrigin(0, 0);


    }

    GetSet(spriteName) {
        return "set1"; // TODO
    }

    update(time, delta) {
       
    }
}