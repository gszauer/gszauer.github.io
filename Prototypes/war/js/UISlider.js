export default class UISlider extends Phaser.GameObjects.Container {
    constructor(data) {
        let {
            scene = null, 
            x = 0, y = 0, 
            onValueChanged = null, 
            onClick = null,
            text = "Volume",
            t = 1.0
        } = data;

        const imgTrack = scene.add.sprite(0, 0, "Clear", "VolumeTrack.png");
        const imgHandle = scene.add.sprite(0, 0, "Clear", "VolumeKnob.png");
        const txtLabel = scene.add.bitmapText(0, 0, 'Adventure', text);

        const children = [txtLabel, imgTrack, imgHandle];
        super(scene, x, y, children);

        const self = this;

        self._value = t;

        const left = -imgTrack.width / 2 + imgHandle.width / 2;
        const right = imgTrack.width / 2 - imgHandle.width / 2;
        imgHandle.x  = (right - left) * (t - 0.5);

        self.imgTrack = imgTrack ;
        self.imgHandle = imgHandle;
        self.txtLabel = txtLabel;

        self.txtLabel.setTint(0xb88151);
        self.txtLabel.setScale(0.8, 0.8);
        self.txtLabel.x = -(imgTrack.width / 2) - 15;
        self.txtLabel.y = -(imgHandle.height / 2)- self.txtLabel.height - 10;

        self.isDown = false;
        self.scene = scene;
        self.isDisabled = false;

        self.OnValueChanged = onValueChanged;
        self.OnClick = onClick;
        self.text = text;

        const idleTint = 0xefefef;
        const hoverTint = 0xffdfa7;
        const downTint = 0xa5865a;
        
        imgHandle.setTint(idleTint);

        imgHandle.on('pointerdown', function(pointer) {
            self.isDown = true;
            imgHandle.setTint(downTint);
        });

        scene.input.on('pointerup', function(pointer) {
            const wasDown = self.isDown;
            self.isDown = false;

            const left   = imgHandle.x - imgHandle.width / 2;
            const right  = left   + imgHandle.width;
            const top    = imgHandle.y - imgHandle.height / 2;
            const bottom = top    + imgHandle.height;

            let contained = (pointer.x >= left && pointer.x <= right) && 
                            (pointer.y >= top && pointer.y <= bottom);

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

    get Value() {
        return this._value;
    }
}