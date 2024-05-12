export default class UISlider extends Phaser.GameObjects.Container {
    constructor(data) {
        let {
            scene = null, 
            x = 0, y = 0, 
            onValueChanged = null, 
            onClick = null,
            onEnter = null,
            text = "Volume",
            t = 1.0
        } = data;

        const imgTrack = scene.add.sprite(0, 0, "Clear", "VolumeTrack.png");
        const imgHandle = scene.add.sprite(0, 0, "Clear", "VolumeKnob.png");
        const txtLabel = scene.add.bitmapText(0, 0, 'Adventure', text);

        const children = [txtLabel, imgTrack, imgHandle];
        super(scene, x, y, children);

        const self = this;

        self.imgTrack = imgTrack ;
        self.imgHandle = imgHandle;
        self.txtLabel = txtLabel;

        self._value = 0;
        self.Value = t;

        self.txtLabel.setTint(0xb88151);
        self.txtLabel.setScale(1.2, 1.2);
        self.txtLabel.x = -(imgTrack.width / 2) - 15;
        self.txtLabel.y = -(imgHandle.height / 2)- self.txtLabel.height + 5;

        self.isDown = false;
        self.scene = scene;
        self.isDisabled = false;

        self.OnValueChanged = onValueChanged;
        self.OnClick = onClick;
        self.OnEnter = onEnter;
        self.text = text;

        const idleTint = 0xefefef;
        const hoverTint = 0xffdfa7;
        const downTint = 0xa5865a;
        
        imgHandle.setTint(idleTint);

        imgHandle.on('pointerdown', function(pointer) {
            self.isDown = true;
            imgHandle.setTint(downTint);
        });

        scene.input.on('pointerup', function(pointer, gameObject) {
            const wasDown = self.isDown;
            self.isDown = false;

            const left   = self.x + imgHandle.x - imgHandle.width / 2;
            const right  = left   + imgHandle.width;
            const top    = self.y + imgHandle.y - imgHandle.height / 2;
            const bottom = top    + imgHandle.height;

            const containedX =(pointer.x >= left && pointer.x <= right);
            const containedY = (pointer.y >= top && pointer.y <= bottom);
            const contained = containedX && containedY;

            if (contained) {
                imgHandle.setTint(hoverTint);

                if (wasDown) {
                    if (self.OnClick != null) {
                        self.OnClick();
                    }
                }
            }
            else {
                imgHandle.setTint(idleTint);
            }
        });

        imgHandle.on('pointerover',function(pointer){
            if (self.isDown) {
                imgHandle.setTint(downTint);
            }
            else {
                imgHandle.setTint(hoverTint);
            }

            if (self.OnEnter !== null) {
                self.OnEnter(self, pointer);
            }
        });
        
        imgHandle.on('pointerout',function(pointer){
            if (self.isDown) {
                imgHandle.setTint(downTint);
            }
            else {
                imgHandle.setTint(idleTint);
            }
        });

        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject != imgHandle) { return; }

            const left = -imgTrack.width / 2 + imgHandle.width / 2;
            const right = imgTrack.width / 2 - imgHandle.width / 2;
            gameObject.x = dragX;
            if (gameObject.x < left) {
                gameObject.x = left;
            }
            else if (gameObject.x > right) {
                gameObject.x = right;
            }

            const t = gameObject.x / (right - left) + 0.5;
            self._value = t;

            if (self.OnValueChanged != null) {
                self.OnValueChanged(t);
            }
        });

        imgHandle.setSize(imgHandle.width,  imgHandle.height); 
        imgHandle.setInteractive();
        scene.input.setDraggable(imgHandle);
        self.scene.add.existing(self);
    }

    set Value(newVal) {
        if (newVal < 0) {
            newVal = 0;
        }
        else if (newVal > 1) {
            newVal = 1;
        }
        this._value = newVal;
        
        const left = (-this.imgTrack.width / 2) + (this.imgHandle.width / 2);
        const right = left + this.imgTrack.width - this.imgHandle.width;
        this.imgHandle.x = (right - left) * (newVal - 0.5);
    }

    get Value() {
        return this._value;
    }
}