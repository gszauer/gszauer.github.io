import CardBase from "./CardBase.js";

export default class CardGrid extends CardBase {
    constructor(data) {
        let { value, type } = data;
        super(data);

        this.textValue = new Phaser.GameObjects.BitmapText(this.scene, 0, -100, 'pressstart', value);
        this.add(this.textValue);
        this.value = value;
        this.cardType = type;
    }

    set value(newValue) {
        this._value = newValue;
        this.textValue.text = this._value;
        this.textValue.x = -44 - this.textValue.width / 2;
        this.textValue.tint = 0;
    }

    get value() {
        return this._value;
    }

    set highlighted(highlight) {
        let color = 0xFFFFFF;
        if (highlight) {
            color = 0xCCCC88;
        }
        this.spriteCard.tint = color;
        this.spriteImage.tint = color;
    }
}