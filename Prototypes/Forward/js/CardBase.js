export default class CardBase extends Phaser.GameObjects.Container {
    static rotationCounter = 0;

    constructor(data) {
        const { scene, x, y, name, sprite, depth, value, type} = data;

        let set = 'set1';
        if (!scene.set1.includes(sprite)) {
            set = 'set2';
        }

        const faceSprite = scene.add.sprite(0, 0, set, sprite);
        const footerSprite = scene.add.sprite(0, faceSprite.height / 2, scene.GetSet("BottomFrame.png"), "BottomFrame.png");

        const nameText = new Phaser.GameObjects.BitmapText(scene, 0,0, scene.cardNameFont, name, scene.cardNameFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        
        const valueSprite = scene.add.sprite(0, 0, scene.GetSet("Value.png"), "Value.png");
        valueSprite.y = -faceSprite.height / 2 + valueSprite.height / 2 + 2;
        valueSprite.x = -faceSprite.width / 2 + valueSprite.width / 2 + 205;

        const valueText = new Phaser.GameObjects.BitmapText(scene, 0,0, 
            scene.cardValueFont, value, scene.cardValueFontSize, 
            Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        valueText.y = valueSprite.y - valueText.height / 2 - 10;

        super(scene, x, y, [faceSprite, footerSprite, valueSprite, nameText, valueText]);

        this.depth = depth;
        this.scene = scene;
        this.sprite = sprite;
        this.valueText = valueText;
        this.footerSprite = footerSprite;
        this.faceSprite = faceSprite;
        this.nameText = nameText;
        this.valueSprite = valueSprite;

        this.Name = name;
        { //this.Value = value;
            this.value = value;
            this.valueText.text = this.value;
            this.valueText.setTint(0);
            this.valueText.x = this.valueSprite.x - this.valueText.width / 2;
        }

        this.setSize( footerSprite.width,  footerSprite.height + faceSprite.height); 
        this.ApplyRandomRotation();

        this.scene.add.existing(this);
    }

    ApplyRandomRotation() {
        const maxRotationDegrees = 3;
        if (CardBase.rotationCounter++ % 2 == 0) {
            this.angle = -(Math.random() * maxRotationDegrees);
        }
        else {
            this.angle = Math.random() * maxRotationDegrees;
        }
        if (CardBase.rotationCounter > 100) {
            CardBase.rotationCounter -= 100;
        }
    }
    
    TintCard(color) {
        this.faceSprite.tint = color;
        this.footerSprite.tint = color;
        this.valueSprite.tint = color;
    }

    set Name(newName) {
        this.name = newName;
        this.nameText.text = this.name;
        this.nameText.setScale(0.48, 0.48);
        this.nameText.maxWidth = this.footerSprite.width;
        this.nameText.setTint(0xe1b95c);
        this.nameText.x = -this.nameText.width / 2;
        this.nameText.y = this.footerSprite.y  - this.nameText.height / 2;
    }

    get Name() {
        return this.name;
    }

    set Value(newValue) {
        this.value = newValue;
        this.valueText.text = this.value;
        this.valueText.setTint(0);
        this.valueText.x = this.valueSprite.x - this.valueText.width / 2;
       

        if (newValue < 0) {
            this.valueSprite.setActive(false).setVisible(false);
            this.valueText.setActive(false).setVisible(false);
        }
        else {
            this.valueSprite.setActive(true).setVisible(true);
            this.valueText.setActive(true).setVisible(true);
        }
    }

    get Value() {
        return this.value;
    }

    SetVisibility(newValue) {
        this.faceSprite.setActive(newValue).setVisible(newValue);
        this.footerSprite.setActive(newValue).setVisible(newValue);
        this.footerSprite.setActive(newValue).setVisible(newValue);
        this.nameText.setActive(newValue).setVisible(newValue);
        this.valueSprite.setActive(newValue).setVisible(newValue);
        this.valueText.setActive(newValue).setVisible(newValue);
    }
}