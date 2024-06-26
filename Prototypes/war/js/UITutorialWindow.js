import UITextButton from "./UITextButton.js";
import UISlider from "./UISlider.js";
import UIToggle from "./UIToggle.js";

export default class UITutorialWindow extends Phaser.GameObjects.Container {
    constructor(data) {
        let {
            scene = null, 
            onClose = null,
            onOpen = null,
        } = data;

        const blackout = scene.add.sprite(0, 0, "Clear", "CardBlackout.png");
        blackout.setOrigin(0, 0);
        blackout.alpha = 0.85;
        blackout.x = blackout.y = -5;
        blackout.scaleX = 8.1;
        blackout.scaleY = 16.1;

        const background = scene.add.sprite(0, 0, "Solid", "WindowBackground.png");
        background.setOrigin(0, 0);
        background.x = 93;
        background.y = 586 - 260;
        background.scaleX = 1.93;
        background.scaleY = 2.8;

        const TL = scene.add.sprite(220, 714 - 260, "Clear", "WindowCorner.png");
        const TR = scene.add.sprite(804, 714 - 260, "Clear", "WindowCorner.png");
        const BL = scene.add.sprite(220, 1142 + 260, "Clear", "WindowCorner.png");
        const BR = scene.add.sprite(804, 1142 + 260, "Clear", "WindowCorner.png");

        const L = scene.add.sprite(92, 930, "Solid", "WindowConnector.png");
        const R = scene.add.sprite(932, 930, "Solid", "WindowConnector.png");
        const T = scene.add.sprite(516, 587 - 260, "Solid", "WindowConnector.png");
        const B = scene.add.sprite(516, 1269 + 260, "Solid", "WindowConnector.png");

       // const skull = scene.add.sprite(507, T.y, "Clear", "SettingsDeco.png");
        const skull = scene.add.sprite(507, T.y - 65, "Clear", "WindowBat.png");

        const tutorial = scene.add.sprite(512, 0, "Tutorial", "Tutorial1.png");
        tutorial.setScale(0.95, 0.95);
        tutorial.y = T.y + tutorial.height / 2 + 35;

        const tutorialTextBg = scene.add.sprite(0, 0, "Clear", "CardBlackout.png");
        tutorialTextBg.setOrigin(0, 0);
        tutorialTextBg.x = tutorial.x - tutorial.width / 2 + 20;
        tutorialTextBg.y = tutorial.y + tutorial.height / 2 + 20;
        tutorialTextBg.scaleX = 6.05;
        tutorialTextBg.scaleY = 3.5;
        tutorialTextBg.alpha = 0.7;

        const tutorialLAbel = scene.add.bitmapText(0, 0, 'Adventure', "Tutorial Text");
        tutorialLAbel.setTint(0xb88151);
        tutorialLAbel.x = tutorialTextBg.x + 15;
        tutorialLAbel.y =  tutorialTextBg.y + 15;

        const closeBtn = new UITextButton({
            scene: scene,
            x: 917, y: 597 - 260,
            onEnter: () => {
                scene.ButtonHover();
            }
        });

        const prevBtn = new UITextButton({
            scene: scene,
            text: "Prev",
            onEnter: () => {
                scene.ButtonHover();
            }
        });
        prevBtn.setScale(0.4, 0.4);
        prevBtn.x = (tutorialTextBg.x) + (prevBtn.width * prevBtn.scaleX / 2);
        prevBtn.y = (tutorialTextBg.y + tutorialTextBg.height * tutorialTextBg.scaleY) 
                    + (prevBtn.height * prevBtn.scaleY / 2) + 20;

        const nextBtn = new UITextButton({
            scene: scene,
            text: "Next",
            onEnter: () => {
                scene.ButtonHover();
            }
        });
        nextBtn.setScale(0.4, 0.4);
        nextBtn.x = (tutorialTextBg.x + tutorialTextBg.width * tutorialTextBg.scaleX) 
                    - (prevBtn.width * prevBtn.scaleX / 2);
        nextBtn.y = (tutorialTextBg.y + tutorialTextBg.height * tutorialTextBg.scaleY) 
                    + (prevBtn.height * prevBtn.scaleY / 2) + 20;

        const children = [
            blackout, background, L, R, T, B, TL, TR, BL, BR, skull, 
            tutorial, tutorialTextBg, closeBtn, prevBtn, nextBtn, tutorialLAbel
        ];
        super(scene, 0, 0, children);

        const self = this;
        self.scene = scene;
        self.TutorialIndex = 1;

        prevBtn.OnClick = () => {
            self.TutorialIndex -= 1;
            self.UpdateTutorial();
            scene.ButtonClick();
        }

        nextBtn.OnClick = () => {
            self.TutorialIndex += 1;
            self.UpdateTutorial();
            scene.ButtonClick();
        }

        TL.flipY = TR.flipY = true;
        BR.flipX = TR.flipX = true;
        B.flipY = true;
        R.angle = 90;
        L.angle = -90;

        L.setScale(1.2, 1.0);
        R.setScale(1.2, 1.0);

        self.blackout = blackout;
        self.background = background;
        self.TL = TL;
        self.TR = TR;
        self.BL = BL;
        self.BR = BR;
        self.L = L;
        self.R = R;
        self.T = T;
        self.B = B;
        self.skull = skull;
        self.closeBtn = closeBtn;
        self.tutorial  = tutorial;
        self.tutorialTextBg = tutorialTextBg;
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
        this.tutorialLAbel = tutorialLAbel;

        self.x = self.y = 0;
        self.setSize(scene.sys.game.config.width,  scene.sys.game.config.height);

        self.OnClose = onClose;
        self.OnOpen = onOpen;

        closeBtn.UpdateSprites({
            idle: "SettingsClose.png",
            hover: "SettingsClose.png",
            tintIdle: 0xffffff,
            tintHover: 0xb2b2b2,
            tintDown: 0xffb2b2,
        });
        closeBtn.OnClick = () => {
            self.Close();
            scene.ButtonClick();
        }

        self.scene.add.existing(self);
        self._ApplyOpenVisuals(false);
    }

    _ApplyOpenVisuals(state) {
        this.UpdateTutorial();
        this.blackout.setActive(state).setVisible(state);
        this.TL.setActive(state).setVisible(state);
        this.TR.setActive(state).setVisible(state);
        this.BL.setActive(state).setVisible(state);
        this.BR.setActive(state).setVisible(state);
        this.L.setActive(state).setVisible(state);
        this.R.setActive(state).setVisible(state);
        this.T.setActive(state).setVisible(state);
        this.B.setActive(state).setVisible(state);
        this.skull.setActive(state).setVisible(state);
        this.background.setActive(state).setVisible(state);
        this.closeBtn.setActive(state).setVisible(state);
        this.tutorial.setActive(state).setVisible(state);
        this.tutorialTextBg.setActive(state).setVisible(state);
        this.prevBtn.setActive(state).setVisible(state);
        this.nextBtn.setActive(state).setVisible(state);
        this.tutorialLAbel.setActive(state).setVisible(state);

        if (this.TutorialIndex == 1) {
            this.prevBtn.setActive(false).setVisible(false);
        }
        else if (this.TutorialIndex == 6) {
            this.nextBtn.setActive(false).setVisible(false);
        }
    }

    UpdateTutorial() {
        if (this.TutorialIndex < 1) {
            this.TutorialIndex = 1;
        }
        else if (this.TutorialIndex > 6) {
            this.TutorialIndex = 6;
        }
        if (this.TutorialIndex == 1) {
            this.prevBtn.setActive(false).setVisible(false);
        }
        else {
            this.prevBtn.setActive(true).setVisible(true);
        }
        
        if (this.TutorialIndex == 6) {
            this.nextBtn.setActive(false).setVisible(false);
        }
        else {
            this.nextBtn.setActive(true).setVisible(true);
        }

        if (this.TutorialIndex == 1) {
            this.tutorialLAbel.text = "Drag the hero card up \nor diagonally to move.";
        }
        else if (this.TutorialIndex == 2) {
            this.tutorialLAbel.text = "You can only move up or \ndiagonally by one square. \nThis means you can't move \nfrom the right side to the left \nside without going to the \nmiddle first.";
        }
        else if (this.TutorialIndex == 3) {
            this.tutorialLAbel.text = "Your hero has a value (blue), \nand enemy monsters have \na value (red). Inspired by \n'war', the bigger value wins. \nThe losing cards value is \nsubtracted from the winners.";
        }
        else if (this.TutorialIndex == 4) {
            this.tutorialLAbel.text = "Enemy monsters don't have \nspecial abilities, only power. \nTheir value is always in a \nred banner.";
        }
        else if (this.TutorialIndex == 5) {
            this.tutorialLAbel.text = "When defeated, a monster \nwill drop loot or a skull. \nSkulls don't do anything, \nthey are a free move. Loot \ncan be any item.";
        }
        else if (this.TutorialIndex == 6) {
            this.tutorialLAbel.text = "Loot is any of the following \nitems: \nCoins: Increase hero value\nSword: Damage monsters\nTreasure: Change next row\nPortal: Change all cards";

        }

        this.tutorial.setFrame("Tutorial" + this.TutorialIndex + ".png");
    }

    Open() {
        this.scene.game.SetHTMLTint(true);
        this.TutorialIndex = 1;
        this._ApplyOpenVisuals(true);
        if (this.OnOpen != null) {
            this.OnOpen();
        }
    }

    Close() {
        this.scene.game.SetHTMLTint(false);
        this._ApplyOpenVisuals(false);
        if (this.OnClose != null) {
            this.OnClose();
        }
    }
}