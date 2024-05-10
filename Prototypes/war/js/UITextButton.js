export default class UITextButton extends Phaser.GameObjects.Container {
    static globalDown = null;

    constructor(data) {
        let {
            scene = null, 
            x = 0, y = 0, 
            onEnter = null, 
            onExit = null, 
            onClick = null,
            text = null,
            tintIdle = 0xffffff,
            tintHover = 0xffffff,
            tintDown = 0xffb2b2,
            textTintIdle = 0xffffff,
            textTintHover = 0xd4d4d4,
            textTintDown = 0xd28080,
        } = data;

        const imgIdle = scene.add.sprite(0, 0, "Clear", "ButtonIdle.png");
        const imgHover = scene.add.sprite(0, 0, "Clear", "ButtonOver.png");
        const bitmapText = scene.add.bitmapText(0, 0, 'Adventure', '');

        const children = [imgIdle, imgHover, bitmapText];
        super(scene, x, y, children);

        const self = this;

        self.imgIdle = imgIdle;
        self.imgHover = imgHover;
        self.bitmapText = bitmapText;
        self.bitmapText.setScale(2, 2);

        self.tintIdle  = tintIdle ;
        self.tintHover = tintHover;
        self.tintDown  = tintDown ;
        self.textTintIdle  = textTintIdle ;
        self.textTintHover = textTintHover;
        self.textTintDown  = textTintDown ;

        self.isDown = false;
        self.scene = scene;
        self.isDisabled = false;

        self.OnEnter = onEnter;
        self.OnExit = onExit;
        self.OnClick = onClick;

        self.text = text;

        self.setSize(imgIdle.width,  imgIdle.height); 
        self.setInteractive();
        self.scene.add.existing(self);

        self.imgIdle.setVisible(true);
        self.imgHover.setVisible(false);
        self._tint = self._clearColor;

        self.on('pointerdown', function(pointer) {
            if (self.Disabled) { return; }

            self.isDown = true;
            UITextButton.globalDown = self;

            self.imgIdle.setVisible(false);
            self.imgHover.setVisible(true);   // needs to be true for tint
            self.imgHover.setTint(self.tintDown);
            self.bitmapText.setTint(self.textTintDown);
        });

        scene.input.on('pointerup', function(pointer) {
            if (self.Disabled) { return; }

            const wasDown = self.isDown;
            self.isDown = false;

            if (UITextButton.globalDown == self) {
                UITextButton.globalDown = null;
            }

            const left = self.x - self.imgIdle.width / 2;
            const right = left + self.imgIdle.width;
            const top = self.y - self.imgIdle.height / 2;
            const bottom = top + self.imgIdle.height;

            let contained = (pointer.x >= left && pointer.x <= right) && 
                            (pointer.y >= top && pointer.y <= bottom);

            if (contained) {
                self.imgIdle.setVisible(false);
                self.imgHover.setVisible(true);   // needs to be true for tint
                self.imgHover.setTint(self.tintHover);
                self.bitmapText.setTint(self.textTintHover);

                if (wasDown) {
                    if (self.OnClick != null) {
                        self.OnClick();
                    }
                }
            }
            else {
                self.imgIdle.setVisible(true);
                self.imgIdle.setTint(self.tintIdle);
                self.imgHover.setVisible(false);   // needs to be true for tint
                self.bitmapText.setTint(self.textTintIdle);
            }
        });

        self.on('pointerover',function(pointer){
            if (self.Disabled) { return; }

            if (self.isDown) {
                self.imgIdle.setVisible(false);
                self.imgHover.setVisible(true);   // needs to be true for tint
                self.imgHover.setTint(self.tintDown);
                self.bitmapText.setTint(self.textTintDown);
            }
            else {
                self.imgIdle.setVisible(false);
                self.imgHover.setVisible(true);   // needs to be true for tint
                self.imgHover.setTint(self.tintHover);
                self.bitmapText.setTint(self.textTintHover);
            }

            if (self.OnEnter !== null) {
                self.OnEnter(self, pointer);
            }
        });
        
        self.on('pointerout',function(pointer){
            if (self.Disabled) { return; }
            
            if (self.isDown) {
                self.imgIdle.setVisible(false);
                self.imgHover.setVisible(true);   // needs to be true for tint
                self.imgHover.setTint(self.tintDown);
                self.bitmapText.setTint(self.textTintDown);
            }
            else {
                self.imgIdle.setVisible(true);
                self.imgIdle.setTint(self.tintIdle);
                self.imgHover.setVisible(false);   // needs to be true for tint
                self.bitmapText.setTint(self.textTintIdle);
            }

            if (self.OnExit !== null) {
                self.OnExit(self, pointer);
            }
        });
    }

    set text(newText) {
        this._text = newText;

        if (newText == null) {
            this.bitmapText.text = "";
        }
        else {
            this.bitmapText.text = newText;
            this.bitmapText.x = -this.bitmapText.width / 2;
            this.bitmapText.y = -this.bitmapText.height / 2;
        }
    }

    get text() {
        if (this._text == null) {
            return "";
        }
        return this._text;
    }

    set Disabled(newVal) {
        // Reset button state
        this.imgIdle.setVisible(true);
        this.imgIdle.setTint(this.tintIdle);
        this.imgHover.setVisible(false);   // needs to be true for tint
        this.imgHover.setTint(this.tintHover);
        this.bitmapText.setTint(this.textTintIdle);

        if (newVal) {
            this.isDisabled = true;
        }
        else {
            this.isDisabled = false;
        }
    }

    get Disabled() {
        if (UITextButton.globalDown != null) {
            return UITextButton.globalDown != this;
        }
        return this.isDisabled;
    }

    UpdateSprites(data) {
        let {
            idle = null,
            hover = null,
            tintIdle = 0xffffff,
            tintHover = 0xffffff,
            tintDown = 0xffffff,
            textTintIdle = 0xffffff,
            textTintHover = 0xffffff,
            textTintDown = 0xffffff,
        } = data;

        this.tintIdle  = tintIdle ;
        this.tintHover = tintHover;
        this.tintDown  = tintDown ;
        this.textTintIdle  = textTintIdle ;
        this.textTintHover = textTintHover;
        this.textTintDown  = textTintDown ;

        this.imgIdle.setTint(this.tintIdle);
        this.imgHover.setTint(this.tintHover);

        this.imgIdle.setFrame(idle);
        this.imgHover.setFrame(hover);
        this.setSize(this.imgIdle.width,  this.imgIdle.height); 

        this.Disabled = false;
    }
}