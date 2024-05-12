"use strict";

import CardBase from "./CardBase.js";

export default class CardPlayer extends CardBase {
    static playerFrame = "CardBoy.png";
    
    constructor(data) {
        super(data);
        const { scene, x, y, name, sprite, depth, value, type} = data;

        this.OnValueChanged = null;

        this.Value = value;
        this.OnDragStart = null;
        this.OnDragEnd = null;
        this.OnDrag = null;
        this.dragging = false;

        this.startX = x;
        this.startY = y;

        this.setInteractive();
        this.scene.input.setDraggable(this);

        const self = this;

        this.scene.input.on('dragstart', (pointer, gameObject) => {
            if (gameObject != self) { return; }
            self.dragging = true;
            self.setScale(1.1, 1.1); 
            self.ApplyRandomRotation();
            
            if (self.OnDragStart !== null) {
                self.OnDragStart(pointer, gameObject);
            }
        });

        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject != self) { return; }
            self.dragging = true;
            gameObject.x = dragX;
            gameObject.y = dragY;

            if (self.OnDrag !== null) {
                self.OnDrag(pointer, gameObject, dragX, dragY);
            }
        });

        this.scene.input.on('dragend', (pointer, gameObject) => {
            if (gameObject != self) { return; }
            gameObject.x = self.startX;
            gameObject.y = self.startY;

            self.dragging = false;
            self.setScale(1.0, 1.0); 
            self.ApplyRandomRotation();

            if (self.OnDragEnd !== null) {
                self.OnDragEnd(pointer, gameObject);
            }
        });

        this.valueSprite.setFrame("BlueBanner.png");
    }


    set Value(newValue) {
        super.Value = newValue;

        if (this.OnValueChanged != null) {
            this.OnValueChanged(newValue);
        }
    }

    get Value() {
        return super.Value;
    }

    SetVisibility(newValue) {
        super.SetVisibility(newValue);

        this.valueSprite.setActive(true).setVisible(true);
        this.valueText.setActive(true).setVisible(true);
    }
}