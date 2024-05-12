import UITextButton from "./UITextButton.js";
import UISlider from "./UISlider.js";
import UIToggle from "./UIToggle.js";

export default class UISettingsWindow extends Phaser.GameObjects.Container {
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
        background.y = 586;
        background.scaleX = 1.93;
        background.scaleY = 1.6;

        const TL = scene.add.sprite(220, 714, "Clear", "WindowCorner.png");
        const TR = scene.add.sprite(804, 714, "Clear", "WindowCorner.png");
        const BL = scene.add.sprite(220, 1142, "Clear", "WindowCorner.png");
        const BR = scene.add.sprite(804, 1142, "Clear", "WindowCorner.png");

        const L = scene.add.sprite(92, 930, "Solid", "WindowConnector.png");
        const R = scene.add.sprite(932, 930, "Solid", "WindowConnector.png");
        const T = scene.add.sprite(516, 587, "Solid", "WindowConnector.png");
        const B = scene.add.sprite(516, 1269, "Solid", "WindowConnector.png");

        const skull = scene.add.sprite(507, 1285, "Clear", "SettingsDeco.png");

        const titleText = scene.add.bitmapText(505, 684, 'LifeCraft', 'SETTINGS');
        const titleTextShadow = scene.add.bitmapText(515, 694, 'LifeCraft', 'SETTINGS');

        const closeBtn = new UITextButton({
            scene: scene,
            x: 917, y: 597,
        });

        const mute = new UIToggle({
            scene: scene,
            x: 395, y: 1080,
            text: "Mute",
            // On toggled added below
        });

        const volume = new UISlider({
            scene: scene,
            x: 512, y: 910,
            onValueChanged: (t) => {
                scene.sound.volume = t * mute.Scale;
            },
            text: "Volume"
        });

        mute.onToggled = () => {
            scene.sound.volume = volume.Value * mute.Scale;
        }

        const volLabel = scene.add.bitmapText(0, 0, 'Adventure', "Mute");
        volLabel.setScale(1.28, 1.28);
        volLabel.setTint(0xb88151);
        volLabel.x = mute.x - volLabel.width - mute.ticked.width / 2 - 15;
        volLabel.y = mute.y - volLabel.height / 2;

        const children = [
            blackout, background, L, R, T, B, TL, TR, BL, BR, skull, closeBtn, titleTextShadow, titleText, volume, mute, volLabel
        ];
        super(scene, 0, 0, children);

        const self = this;
        self.scene = scene;

        closeBtn.UpdateSprites({
            idle: "SettingsClose.png",
            hover: "SettingsClose.png",
            tintIdle: 0xffffff,
            tintHover: 0xb2b2b2,
            tintDown: 0xffb2b2,
        });
        closeBtn.OnClick = () => {
            self.Close();
        }

        titleText.setTint(0xc42a2a);
        titleText.setScale(1.75, 1.75);
        titleText.x = titleText.x - titleText.width / 2;
        titleText.y = titleText.y - titleText.height / 2;

        titleTextShadow.setTint(0x000000);
        titleTextShadow.setScale(1.75, 1.75);
        titleTextShadow.x = titleTextShadow.x - titleTextShadow.width / 2;
        titleTextShadow.y = titleTextShadow.y - titleTextShadow.height / 2;

        TL.flipY = TR.flipY = true;
        BR.flipX = TR.flipX = true;
        B.flipY = true;
        R.angle = 90;
        L.angle = -90;

        self.blackout = blackout;
        self.background = background;
        self.titleText = titleText;
        self.closeBtn = closeBtn;
        self.titleTextShadow = titleTextShadow;
        self.volume = volume;
        self.mute = mute;
        self.TL = TL;
        self.TR = TR;
        self.BL = BL;
        self.BR = BR;
        self.L = L;
        self.R = R;
        self.T = T;
        self.B = B;
        self.skull = skull;
        self.muteLabel = volLabel;

        self.x = self.y = 0;
        self.setSize(scene.sys.game.config.width,  scene.sys.game.config.height);

        self.OnClose = onClose;
        self.OnOpen = onOpen;

        self.scene.add.existing(self);
        self._ApplyOpenVisuals(false);
    }

    _ApplyOpenVisuals(state) {
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
        this.titleText.setActive(state).setVisible(state);
        this.titleTextShadow.setActive(state).setVisible(state);
        this.volume.setActive(state).setVisible(state);
        this.mute.setActive(state).setVisible(state);
        this.muteLabel.setActive(state).setVisible(state);
    }

    Open() {
        this.scene.game.SetHTMLTint(true);
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