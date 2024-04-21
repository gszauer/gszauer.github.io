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
        

        const playerY = numRows * cardHeight + cardPadding + 
                        cardPadding * numRows + 140;

        const player = new CardPlayer({
            scene: this, 
            x: grid.xCoords[1], y: playerY, 
            name: "The Fool",
            sprite: "TheFool.png",
            depth: 1,
            value: 10,
            type: "fool" 
        });

        this.player = player;
        this.cogSprite = cogSprite;


        this.Coins = Math.floor(Math.random() * 21) + 1;

        this.player.OnDragStart = (pointer, gameObject) => {
            grid.HighlightActive = true;
        }

        this.player.OnDrag = (pointer, gameObject, dragX, dragY) => {
            grid.SetHighlightPosition(dragX, dragY);

            
        }

        this.player.OnDragEnd = (pointer, gameObject) => {
            grid.HighlightActive = false;
            if (pointer.x < grid.xCoords[0] + this.cardWidth / 2) {
                gameObject.x = grid.xCoords[0];
            }
            else if (pointer.x < grid.xCoords[1] + this.cardWidth / 2) {
                gameObject.x = grid.xCoords[1];
            }
            else {
                gameObject.x = grid.xCoords[2];
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

    set Coins(newValue) {
        this.player.Value = newValue;
    }

    GetSet(spriteName) {
        return "set1"; // TODO
    }

    update(time, delta) {
       
    }
}