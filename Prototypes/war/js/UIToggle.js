export default class UISlider extends Phaser.GameObjects.Container {
    constructor(data) {
        let {
            scene = null, 
            x = 0, y = 0, 
            onToggled = null, 
        } = data;

        const unticked = scene.add.sprite(0, 0, "Clear", "CheckboxOff.png");
        const ticked = scene.add.sprite(0, 0, "Clear", "CheckboxOn.png");

        const children = [unticked, ticked];
        super(scene, x, y, children);

        const self = this;
        self.state = false;
        self.isDown = false;

        self.OnToggled = onToggled;
        self.ticked = ticked;
        self.unticked = unticked;

        const idleTint = 0xefefef;
        const hoverTint = 0xffdfa7;
        const downTint = 0xa5865a;

        ticked.setVisible(false);
        unticked.setVisible(true);

        self.on('pointerdown', function(pointer) {
            self.isDown = true;
            unticked.setTint(downTint);
            ticked.setTint(downTint);

            if (!self.state) {
                ticked.setVisible(true);
                unticked.setVisible(false);
            }
            else {
                ticked.setVisible(false);
                unticked.setVisible(true);
            }
        });

        scene.input.on('pointerup', function(pointer) {
            const wasDown = self.isDown;
            self.isDown = false;

            const left   = self.x + unticked.x - unticked.width / 2;
            const right  = left + unticked.width;
            const top    = self.y + unticked.y - unticked.height / 2;
            const bottom = top + unticked.height;

            let contained = (pointer.x >= left && pointer.x <= right) && 
                            (pointer.y >= top && pointer.y <= bottom);

            if (contained) {
                unticked.setTint(hoverTint);
                ticked.setTint(hoverTint);

                if (wasDown) {
                    self.state = !self.state;

                    if (self.OnToggled != null) {
                        self.OnToggled(self.state);
                    }

                    if (self.state) {
                        ticked.setVisible(true);
                        unticked.setVisible(false);
                    }
                    else {
                        ticked.setVisible(false);
                        unticked.setVisible(true);
                    }
                }
            }
            else {
                unticked.setTint(idleTint);
                ticked.setTint(idleTint);

                if (self.state) {
                    ticked.setVisible(true);
                    unticked.setVisible(false);
                }
                else {
                    ticked.setVisible(false);
                    unticked.setVisible(true);
                }
            }
        });

        self.on('pointerover',function(pointer){
            if (self.isDown) {
                unticked.setTint(downTint);
                ticked.setTint(downTint);
            }
            else {
                unticked.setTint(hoverTint);
                ticked.setTint(hoverTint);
            }
        });
        
        self.on('pointerout',function(pointer){
            if (self.isDown) {
                unticked.setTint(downTint);
                ticked.setTint(downTint);
            }
            else {
                unticked.setTint(idleTint);
                ticked.setTint(idleTint);
            }
        });

        self.setSize(unticked.width,  unticked.height); 
        self.setInteractive();
        self.scene.add.existing(self);
    }

    get State() {
        return this.state;
    }

    get Scale() {
        if (this.state) {
            return 1.0;
        }
        return 0.0;
    }
}