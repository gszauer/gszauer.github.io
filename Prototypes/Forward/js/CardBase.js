export default class CardBase extends Phaser.GameObjects.Container {
    static rotationCounter = 0;

    constructor(data) {
        const { scene, x, y, name, sprite, depth, value, type} = data;

        let set = 'set1';
        if (!scene.set1.includes(sprite)) {
            set = 'set2';
        }

        const faceSprite = scene.add.sprite(0, 0, set, sprite);
        faceSprite.setOrigin(0, 0);

        const footerSprite = scene.add.sprite(0, faceSprite.height, scene.GetSet("BottomFrame.png"), "BottomFrame.png");
        footerSprite.setOrigin(0, 0);

        const nameText = new Phaser.GameObjects.BitmapText(scene, 0,0, scene.cardNameFont, name, scene.cardNameFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        
        const valueSprite = scene.add.sprite(205, 2, scene.GetSet("Value.png"), "Value.png");
        valueSprite.setOrigin(0, 0);

        const valueText = new Phaser.GameObjects.BitmapText(scene, 0,0, 
            scene.cardValueFont, value, scene.cardValueFontSize, 
            Phaser.GameObjects.BitmapText.ALIGN_CENTER);

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
        this.Value = value;

        this.setSize( footerSprite.width,  footerSprite.height + faceSprite.height); 
        //this.setScale(0.92, 0.92); // To give wiggle room for rotation

        const maxRotationDegrees = 3;
        if (CardBase.rotationCounter++ % 2 == 0) {
            this.angle = -(Math.random() * maxRotationDegrees);
        }
        else {
            this.angle = Math.random() * maxRotationDegrees;
        }
        if (CardBase.rotationCounter > 10) {
            CardBase.rotationCounter -= 10;
        }

        this.scene.add.existing(this);
    }

    set Name(newName) {
        this.name = newName;
        this.nameText.text = this.name;
        this.nameText.setScale(0.48, 0.48);
        this.nameText.maxWidth = this.footerSprite.width;
        this.nameText.setTint(0xe1b95c);
        this.nameText.x = this.footerSprite.width / 2 - this.nameText.width / 2;
        this.nameText.y = this.footerSprite.y + this.footerSprite.height / 2 - this.nameText.height / 2;
    }

    set Value(newValue) {
        this.value = newValue;
        this.valueText.text = this.value;
        this.valueText.setTint(0);
        this.valueText.x = this.valueSprite.x + this.valueSprite.width / 2 - this.valueText.width / 2;
        const valueSquareHeight = 107; // not: this.valueSprite.height
        this.valueText.y = this.valueSprite.y + valueSquareHeight / 2 - this.valueText.height / 2;

        if (newValue < 0) {
            this.valueSprite.visible = false;
            this.valueText.visible = false;
        }
        else {
            this.valueSprite.visible = true;
            this.valueText.visible = true;
        }
    }

    SetVisibility(newValue) {
        this.faceSprite.visible = newValue;
        this.footerSprite.visible = newValue;
        this.footerSprite.visible = newValue;
        this.nameText.visible = newValue;
        this.valueSprite.visible = newValue;
        this.valueText.visible = newValue;
    }
}