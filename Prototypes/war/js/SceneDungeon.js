import CardBase from "./CardBase.js";
import CardPlayer from "./CardPlayer.js";
import EnemyGrid from "./EnemyGrid.js";
import UITextButton from "./UITextButton.js";
import UIPauseWindow from "./UIPauseWindow.js";
import UIGameOverWindow from "./UIGameOverWindow.js";

export default class SceneDungeon extends Phaser.Scene {
    constructor() {
        super('SceneDungeon');
    }

    preload() {
        this.load.atlas('Solid', 'war/Solid.jpg', 'war/Solid.json');
        this.load.atlas('Clear', 'war/Clear.png', 'war/Clear.json');
        this.load.bitmapFont('Adventure', 'war/Adventure.png', 'war/Adventure.fnt');
        this.load.bitmapFont('LifeCraft', 'war/LifeCraft.png', 'war/LifeCraft.fnt');
        this.load.image('Background', 'war/Background.jpg');
        
        this.cardValueFont = 'LifeCraft';
        this.cardValueFontSize  = 70;
        
        this.cardPadding = 25;
        this.cardWidth = 300;
        this.cardHeight = 460;
    }

    create() {
        const self = this;
        const numRows = 3;
        const numColumns = 3;

        const cardWidth = this.cardWidth;
        const cardHeight = this.cardHeight;
        const cardPadding = this.cardPadding;

        this.background = {};
        {
            this.background.top = this.add.image(0, 0, "Background");
            this.background.top.x += this.background.top.width / 2;
            this.background.top.y += this.background.top.height / 2;
            this.background.top.depth = -100;

            this.background.bottom = this.add.image(0, 0, "Background");
            this.background.bottom.x = this.background.top.x;
            this.background.bottom.y = this.background.top.y + this.background.top.height;
            this.background.bottom.flipY = true;
            this.background.bottom.depth = -100;
        }

        const settingsButton = new UITextButton({
            scene: this,
            x: 1024 -128, y: 2048 - 128,
        });

        let grid = new EnemyGrid(this);
        
        const playerY = (numRows * cardHeight) + (numRows * cardHeight  / 2) - grid.yOffset + (cardPadding * numRows) + cardPadding;

        const player = new CardPlayer({
            scene: this, 
            x: grid.xCoords[1], y: playerY, 
            sprite: "CardBoy.png",
            depth: -1,
            value: 100,
            type: "fool" 
        });

        this.player = player;
        this.grid = grid;

        this.Reset();

        const pause = new UIPauseWindow({
            scene: self,

            onOpen: () => {
                self.input.setDraggable(player, false);
                settingsButton.Disabled = true;
            },
            onClose: () => {
                self.input.setDraggable(player, true);
                settingsButton.Disabled = false;
            }
        });

        const gameOver = new UIGameOverWindow( {
            scene: self,

            onOpen: () => {
                self.input.setDraggable(player, false);
                settingsButton.Disabled = true;
            },
            onClose: () => {
                self.input.setDraggable(player, true);
                settingsButton.Disabled = false;
            }
        });
        //gameOver.Open();

        this.gameOver = gameOver;

        settingsButton.UpdateSprites({
            idle:  "PauseButton.png",
            hover: "PauseButton.png",
            tintIdle: 0xffffff,
            tintHover: 0xb2b2b2,
            tintDown: 0xffb2b2,
        });
        settingsButton.OnClick = () => {
            pause.Open();
        }

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
    }

    GameOver() {
        //this.Reset();
        //this.scene.switch('SceneMenu');
        this.gameOver.Open();
    }

    Reset() {
        this.player.x = this.grid.xCoords[1];
        this.player.startX = this.grid.xCoords[1];
        this.player.Value = 15;
        this.grid.Reset();
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

    update(time, delta) {
       
    }

    GenerateNextCardValue() {
        return Math.floor(Math.random() * 9) + 1;
    }
}