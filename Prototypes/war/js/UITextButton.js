export default class UITextButton extends Phaser.GameObjects.Container {
    static globalDown = null;

    constructor(data) {
        let {
            scene = null, 
            x = 0, y = 0, 
            onEnter = null, 
            onExit = null, 
            onClick = null,
            text = null
        } = data;

        const imgIdle = scene.add.sprite(0, 0, "Clear", "ButtonIdle.png");
        const imgHover = scene.add.sprite(0, 0, "Clear", "ButtonOver.png");
        const bitmapText = scene.add.bitmapText(0, 0, 'Adventure', '');

        const children = [imgIdle, imgHover, bitmapText];
        super(scene, x, y, children);

        const self = this;

        self.imgIdle = imgIdle ;
        self.imgHover = imgHover;
        self.bitmapText = bitmapText;
        self.bitmapText.setScale(2, 2);

        self._clearColor = 0xFFFFFF;
        self._darkerColor = 0xc6c6c6;
        self._tinterColor = 0xc58282;
        self._tintColor = 0xffc1c1;
        
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
            self._tint = self._tintColor; // over visible = true
            self.bitmapText.setTint(self._tinterColor);
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
                self.imgHover.setVisible(true);
                self._tint = self._clearColor; // over visible = false
                self.bitmapText.setTint(self._darkerColor);

                if (wasDown) {
                    if (self.OnClick != null) {
                        self.OnClick();
                    }
                }
            }
            else {
                self.imgIdle.setVisible(true);
                self.imgHover.setVisible(false);
                self._tint = self._clearColor; // over visible = false
            }
        });

        self.on('pointerover',function(pointer){
            if (self.Disabled) { return; }

            if (self.isDown) {
                self.imgIdle.setVisible(false);
                self.imgHover.setVisible(true);   // needs to be true for tint
                self._tint = self._tintColor; // over visible = true
                self.bitmapText.setTint(self._tinterColor);
            }
            else {
                self.imgIdle.setVisible(false);
                self.imgHover.setVisible(true);  
                self._tint = self._clearColor; // over visible = false
                self.bitmapText.setTint(self._darkerColor);
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
                self._tint = self._tintColor; // over visible = true
                self.bitmapText.setTint(self._tinterColor);
            }
            else {
                self.imgIdle.setVisible(true);
                self.imgHover.setVisible(false);
                self._tint = self._clearColor; // over visible = false
            }

            if (self.OnExit !== null) {
                self.OnExit(self, pointer);
            }
        });
    }

    set _tint(newTint) {
        this.imgHover.setTint(newTint);
        this.bitmapText.setTint(newTint);
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
        this.imgHover.setVisible(false);
        this._tint = this._clearColor; // over visible = false

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
            clearColor = 0xFFFFFF,
            darkerColor = 0xc6c6c6,
            tinterColor = 0xc58282,
            tintColor = 0xffc1c1
        } = data;

        this._clearColor = clearColor;
        this._darkerColor = darkerColor;
        this._tinterColor = tinterColor;
        this._tintColor = tintColor;

        this.imgIdle.setFrame(idle);
        this.imgHover.setFrame(hover);
        this.setSize(this.imgIdle.width,  this.imgIdle.height); 

        this.Disabled = false;
    }
}