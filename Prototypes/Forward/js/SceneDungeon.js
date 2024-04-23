import CardBase from "./CardBase.js";
import CardPlayer from "./CardPlayer.js";
import EnemyGrid from "./EnemyGrid.js";

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
        
        this.set1 = [ "Death.png", "Justice.png", "Strength.png", "TheEmperor.png", "TheEmpress.png", "TheFool.png", "TheHangedMan.png", "TheHeriophant.png", "TheHermit.png", "TheHighPriestess.png", "TheMagician.png", "TheMoon.png", "TheStar.png", "TheSun.png", "TheTower.png", "Judgement.png", "Temperance.png", "TheChariot.png", "TheDevil.png", "TheLovers.png", "TheWheelOfFortune.png" ];
        this.names1 = [ "Death", "Justice", "Strength", "The Emperor", "The Empress", "The Fool", "The HangedMan", "The Heriophant", "The Hermit", "The High Priestess", "The Magician", "The Moon", "The Star", "The Sun", "The Tower", "Judgement", "Temperance", "The Chariot", "The Devil", "The Lovers", "The Wheel Of Fortune" ];
   
        this.cardPadding = 25;
        this.cardWidth = 300;
        this.cardHeight = 460;
    }

    create() {
        const numRows = 3;
        const numColumns = 3;

        const cardWidth = this.cardWidth;
        const cardHeight = this.cardHeight;
        const cardPadding = this.cardPadding;

        const backgroundImage = this.add.image(0, 0, 'background');
        backgroundImage.setOrigin(0, 0);

        const cogSprite = this.add.sprite(0, 2048, this.GetSet("Cog.png"), "Cog.png");
        cogSprite.x += cogSprite.width / 2 + cardPadding;
        cogSprite.y -= cogSprite.height / 2 + cardPadding;
        cogSprite.setScale(0.90, 0.90);

        let grid = new EnemyGrid(this);
        
        const playerY = (numRows * cardHeight) + (numRows * cardHeight  / 2) - grid.yOffset + (cardPadding * numRows) + cardPadding;

        const player = new CardPlayer({
            scene: this, 
            x: grid.xCoords[1], y: playerY, 
            name: "The Fool",
            sprite: "TheFool.png",
            depth: 1,
            value: 100,
            type: "fool" 
        });

        this.player = player;
        this.grid = grid;
        this.cogSprite = cogSprite;

        this.Reset();

        this.player.OnDragStart = (pointer, gameObject) => {
            grid.HighlightActive = true;
            gameObject.x = pointer.x;
            gameObject.y = pointer.y - this.cardHeight / 3;
        }

        this.player.OnDrag = (pointer, gameObject, dragX, dragY) => {
            grid.SetHighlightPosition(pointer.x, pointer.y);
            gameObject.x = pointer.x;
            gameObject.y = pointer.y - this.cardHeight / 3;
        }

        this.player.OnDragEnd = (pointer, gameObject) => {
            const moveTarget = grid.TryToMove(gameObject, pointer.x, pointer.y);
            grid.HighlightActive = false;

            if (moveTarget < 0) {
                gameObject.x = gameObject.startX;
            }
            else {
                gameObject.x = gameObject.startX = grid.monsters[moveTarget].x;
            }
        };


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

    Reset() {
        this.player.x = this.grid.xCoords[1];
        this.player.startX = this.grid.xCoords[1];
        this.player.Value = 15;
    }

    set Coins(newValue) {
        this.player.Value = newValue;
    }

    get Coins() {
        return this.player.Value;
    }

    GetCoins() {
        return this.player.Value;
    }

    GetSet(spriteName) {
        return "set1"; // TODO
    }

    update(time, delta) {
       
    }

    GenerateNextCardValue() {
        return Math.floor(Math.random() * 9) + 1;
    }
}