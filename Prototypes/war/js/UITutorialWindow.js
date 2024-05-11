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
        blackout.x = blackout.y = 0;
        blackout.scaleX = 8;
        blackout.scaleY = 16;

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

        const closeBtn = new UITextButton({
            scene: scene,
            x: 917, y: 597 - 260,
        });

        const children = [
            blackout, background, L, R, T, B, TL, TR, BL, BR, skull, closeBtn
        ];
        super(scene, 0, 0, children);

        const self = this;
        self.scene = scene;

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
        }

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
    }

    Open() {
        this._ApplyOpenVisuals(true);
        if (this.OnOpen != null) {
            this.OnOpen();
        }
    }

    Close() {
        this._ApplyOpenVisuals(false);
        if (this.OnClose != null) {
            this.OnClose();
        }
    }
}