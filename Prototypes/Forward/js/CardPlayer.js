"use strict";

import CardBase from "./CardBase.js";

export default class CardPlayer extends CardBase {
    constructor(data) {
        super(data);
        const { scene, x, y, name, sprite, depth, value, type} = data;

        this.valueText.destroy();
        this.valueSprite.destroy();

        this.valueSprite = scene.add.sprite(1024,2048, scene.GetSet("Coin.png"), "Coin.png");
        this.valueSprite.x -= this.valueSprite.width / 2 + scene.cardPadding;
        this.valueSprite.y -= this.valueSprite.height / 2 + scene.cardPadding;
        this.valueSprite.setScale(0.98, 0.98);

        this.valueText = scene.add.bitmapText(0, 0, scene.cardValueFont, "-", scene.cardValueFontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        this.valueText.x = (this.valueSprite.x) - (this.valueText.width / 2) - 20;
        this.valueText.y = (this.valueSprite.y) - (this.valueText.height / 2) + 5;
        this.valueText.setTint(0);

        this.OnValueChanged = null;

        this.Name = name;
        this.Value = value;

        this.OnDragStart = null;
        this.OnDragEnd = null;
        this.dragging = false;

        this.startX = x;
        this.startY = y;

        this.setInteractive();
        this.scene.input.setDraggable(this);

        this.scene.input.on('dragstart', (pointer, gameObject) => {
            this.dragging = true;
            this.setScale(1.1, 1.1); 
            // TODO: Set tint? Or Show moves? Not sure!
            if (this.OnDragStart !== null) {
                this.OnDragStart(pointer, gameObject);
            }
        });

        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            this.dragging = true;
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        this.scene.input.on('dragend', (pointer, gameObject) => {
            this.dragging = false;
            this.setScale(1.0, 1.0); 
            if (this.OnDragEnd !== null) {
                this.OnDragEnd(pointer, gameObject);
            }
            gameObject.x = this.startX;
            gameObject.y = this.startY;
        });
    }

    set Value(newValue) {
        super.Value = newValue;

        if (newValue < 0) { // Always show coins
            this.valueSprite.setActive(true).setVisible(true);
            this.valueText.setActive(true).setVisible(true);
        }
        this.valueText.x = (this.valueSprite.x) - (this.valueText.width / 2) - 20;

        if (this.OnValueChanged != null) {
            this.OnValueChanged(newValue);
        }
    }

    SetVisibility(newValue) {
        super.SetVisibility(newValue);

        this.valueSprite.setActive(true).setVisible(true);
        this.valueText.setActive(true).setVisible(true);
    }
}