import CardBase from './CardBase.js'

export default class CardMonster extends CardBase {
    
    constructor(data) {
        super(data);

        // Values from super
        const { scene, x, y, name, sprite, depth} = data;
        // values for self
        const { value, type } = data;
        
        const valueSprite = scene.add.sprite(205, 2, scene.GetSet("Value.png"), "Value.png");
        valueSprite.setOrigin(0, 0);

        const valueText = new Phaser.GameObjects.BitmapText(scene, 0,0, 
            scene.cardValueFont, value, scene.cardValueFontSize, 
            Phaser.GameObjects.BitmapText.ALIGN_CENTER);

        this.add([valueSprite, valueText]);

        this.valueSprite = valueSprite;
        this.valueText = valueText;

        this.Value = value;
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
}