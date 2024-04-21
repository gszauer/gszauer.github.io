"use strict";

import CardBase from "./CardBase.js";

export default class EnemyGrid {
    constructor(scene) {
        const stage = {
            w: scene.game.config.width,
            h: scene.game.config.height
        } ;

        const halfStage = {
            w: scene.game.config.width / 2,
            h: scene.game.config.height / 2
        };

        const cardHeight = scene.cardHeight;
        const cardWidth = scene.cardWidth;
        const cardPadding = scene.cardPadding;

        const numColumns = 3;
        const numRows = 3;

        const thirdW = Math.floor(scene.game.config.width / 3);
        const xCoords = [
            halfStage.w - thirdW,
            halfStage.w,
            halfStage.w + thirdW,
        ];
        const yCoords = [
            halfStage.h - (cardHeight + cardPadding),
            halfStage.h,
            halfStage.h + (cardHeight + cardPadding),
        ];
        // Adjust to go off screen
        yCoords[0] -= cardHeight + cardPadding * 2;
        yCoords[1] -= cardHeight + cardPadding * 2;
        yCoords[2] -= cardHeight + cardPadding * 2;

        const monsters = [];
        for (let i = 0; i < numColumns; ++i) {
            for (let j = 0; j < numRows; ++j) {
                let randomCard =  Math.floor(Math.random() * scene.set1.length);
                let randomValue = Math.floor(Math.random() * 21) + 1;
                let randomType = "random"; 
               
                let monster = new CardBase({
                    scene: scene, 
                    x: xCoords[i], y: yCoords[j], 
                    name: scene.names1[randomCard],
                    sprite: scene.set1[randomCard],
                    depth: 1,
                    value: randomValue,
                    type: randomType 
                });
                monsters.push(monster);
            }
        }

        this.xCoords = xCoords;
        this.yCoords = yCoords;
        this.monsters = monsters;
        this.numColumns = numColumns;
        this.numRows = numRows;
        this._highlightActive = false;
        this.cardHeight = cardHeight;
        this.cardWidth = cardWidth;
    }

    get HighlightActive() {
        return this._highlightActive;
    }

    set HighlightActive(newVal) {
        this._highlightActive = newVal;
        if (!newVal) {
            this.SetHighlightPosition(0, 0); // unhighlight
        }
    }

    SetHighlightPosition(x, y) {
        let highlight = -1;

        const allowHighlight = y <= this.yCoords[2] + this.cardHeight + this.cardHeight / 2;
        
        if (allowHighlight && this._highlightActive) {
            const last = this.monsters.length - 1;
            if (x < this.xCoords[0] + this.cardWidth / 2) {
                highlight = 2;
            }
            else if (x < this.xCoords[1] + this.cardWidth / 2) {
                highlight = 5;
            }
            else {
                highlight = 8;
            }
        }
        
        let color = 0xFFFFFF;
        for (let i = 0, size = this.monsters.length; i < size; ++i) {
            this.monsters[i].TintCard(color);
        }

        if (highlight >= 0) {
            this.monsters[highlight].TintCard(0xCCCC88);
        }
    }
}