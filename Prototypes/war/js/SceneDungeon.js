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
       
        this.load.audio("ButtonHover", ["war/Hover.ogg", "war/Hover.mp3", "war/Hover.m4a"]);
        this.load.audio("ButtonClick", ["war/Click.ogg", "war/Click.mp3", "war/Click.m4a"]);
        this.load.audio("Die", ["war/die.ogg", "war/die.mp3", "war/die.m4a"]);
        this.load.audio("Died", ["war/died.ogg", "war/died.mp3", "war/died.m4a"]);
        this.load.audio("Portal", ["war/portal.ogg", "war/portal.mp3", "war/portal.m4a"]);
        this.load.audio("GameOver", ["war/GameOver.ogg", "war/GameOver.mp3", "war/GameOver.m4a"]);

        this.load.audio("Hit0", ["war/hit0.ogg", "war/hit0.mp3", "war/hit0.m4a"]);
        this.load.audio("Hit1", ["war/hit1.ogg", "war/hit1.mp3", "war/hit1.m4a"]);
        this.load.audio("Hit2", ["war/hit2.ogg", "war/hit2.mp3", "war/hit2.m4a"]);
        this.load.audio("Hit3", ["war/hit3.ogg", "war/hit3.mp3", "war/hit3.m4a"]);
        this.load.audio("Hit4", ["war/hit4.ogg", "war/hit4.mp3", "war/hit4.m4a"]);
       
        this.load.audio("Coin0", ["war/coin0.ogg", "war/coin0.mp3", "war/coin0.m4a"]);
        this.load.audio("Coin1", ["war/coin1.ogg", "war/coin1.mp3", "war/coin1.m4a"]);
        this.load.audio("Coin2", ["war/coin2.ogg", "war/coin2.mp3", "war/coin2.m4a"]);

        this.load.audio("Sword0", ["war/sword0.ogg", "war/sword0.mp3", "war/sword0.m4a"]);
        this.load.audio("Sword1", ["war/sword1.ogg", "war/sword1.mp3", "war/sword1.m4a"]);
        this.load.audio("Sword2", ["war/sword2.ogg", "war/sword2.mp3", "war/sword2.m4a"]);

        this.load.audio("Rustle0", ["war/rustle0.ogg", "war/rustle0.mp3", "war/rustle0.m4a"]);
        this.load.audio("Rustle1", ["war/rustle1.ogg", "war/rustle1.mp3", "war/rustle1.m4a"]);
        this.load.audio("Rustle2", ["war/rustle2.ogg", "war/rustle2.mp3", "war/rustle2.m4a"]);

        this.load.audio("Chest0", ["war/chest0.ogg", "war/chest0.mp3", "war/chest0.m4a"]);
        this.load.audio("Chest1", ["war/chest1.ogg", "war/chest1.mp3", "war/chest1.m4a"]);
        this.load.audio("Chest2", ["war/chest2.ogg", "war/chest2.mp3", "war/chest2.m4a"]);

        this.load.audio("Bgm0", ["war/bgm0.ogg", "war/bgm0.mp3", "war/bgm0.m4a"]);
        this.load.audio("Bgm1", ["war/bgm1.ogg", "war/bgm1.mp3", "war/bgm1.m4a"]);
        this.load.audio("Bgm2", ["war/bgm2.ogg", "war/bgm2.mp3", "war/bgm2.m4a"]);
        
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
            onEnter: () => {
                self.ButtonHover();
            }
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
                self.PlayGameOverMusic();
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
            self.ButtonClick();
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

        this.buttonHoverSound = this.sound.add("ButtonHover");
        this.buttonClickSound = this.sound.add("ButtonClick");
        this.portalSound = this.sound.add("Portal");
        this.dieSound = this.sound.add("Die");
        this.diedSound = this.sound.add("Died");
        this.hitSounds = [
            this.sound.add("Hit0"),
            this.sound.add("Hit1"),
            this.sound.add("Hit2"),
            this.sound.add("Hit3"),
            this.sound.add("Hit4"),
        ];
        this.coinSounds = [
            this.sound.add("Coin0"),
            this.sound.add("Coin1"),
            this.sound.add("Coin2"),
        ];
        this.swordSounds = [
            this.sound.add("Sword0"),
            this.sound.add("Sword1"),
            this.sound.add("Sword2"),
        ];
        this.rustleSounds = [
            this.sound.add("Rustle0"),
            this.sound.add("Rustle1"),
            this.sound.add("Rustle2"),
        ];
        this.chestSounds = [
            this.sound.add("Chest0"),
            this.sound.add("Chest1"),
            this.sound.add("Chest2"),
        ];

        this.backgroundMusics = [
            this.sound.add("Bgm0"),
            this.sound.add("Bgm1"),
            this.sound.add("Bgm2"),
        ];
        this.gameOverMusic =  this.sound.add("GameOver"),
        this.backgroundMusics[0].loop = true;
        this.backgroundMusics[1].loop = true;
        this.backgroundMusics[2].loop = true;
        this.gameOverMusic.loop = true;
        this.backgroundMusics[0].volume = 0.5;
        this.backgroundMusics[1].volume = 0.5;
        this.backgroundMusics[2].volume = 0.5;
        this.backgroundMusic = null;

        this.Reset();
    }

    GameOver() {
        //this.Reset();
        //this.scene.switch('SceneMenu');
        this.gameOver.Open();
    }

    Reset(dontResetMusic) {
        const resetMusic = !dontResetMusic;
        
        if (resetMusic) {
            this.StopBgm();

            const rando = Math.floor(Math.random() * this.backgroundMusics.length);
            this.backgroundMusic = this.backgroundMusics[rando];
            this.backgroundMusic.play();
        }

        this.player.faceSprite.setFrame(CardPlayer.playerFrame);
        this.player.x = this.grid.xCoords[1];
        this.player.startX = this.grid.xCoords[1];
        this.player.Value = 15;
        this.grid.Reset();
    }

    PlayGameOverMusic() {
        this.StopBgm();
        this.backgroundMusic = this.gameOverMusic;
        this.backgroundMusic.play();
    }

    StopBgm() {
        if (this.backgroundMusic != null) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    UpdatePlayerSprite() {
        if (this.player) {
            this.player.faceSprite.setFrame(CardPlayer.playerFrame);
        }
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

    ButtonHover() {
        this.buttonHoverSound.play();
    }

    ButtonClick() {
        this.buttonClickSound.play();
    }

    SoundHit() {
        const rando = Math.floor(Math.random() * this.hitSounds.length);
        this.hitSounds[rando].play();
    }

    SoundCoin() {
        const rando = Math.floor(Math.random() * this.coinSounds.length);
        this.coinSounds[rando].play();
    }

    SoundRustle() {
        const rando = Math.floor(Math.random() * this.rustleSounds.length);
        this.rustleSounds[rando].play();
    }

    SoundSword() {
        const rando = Math.floor(Math.random() * this.swordSounds.length);
        this.swordSounds[rando].play();
    }

    SoundChest() {
        const rando = Math.floor(Math.random() * this.chestSounds.length);
        this.chestSounds[rando].play();
    }

    SoundDie() {
        if (CardPlayer.playerFrame == "CardBoy.png") {
            this.dieSound.play();
        }
        else {
            this.diedSound.play();
        }
    }

    SoundPortal() {
        this.portalSound.play();
    }
}