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
        const yOFfset = cardHeight + cardPadding * 2 + (cardHeight + cardPadding) * 0.2;
        yCoords[0] -= yOFfset;
        yCoords[1] -= yOFfset;
        yCoords[2] -= yOFfset;

        const monsters = [];
        for (let i = 0; i < numColumns; ++i) {
            for (let j = 0; j < numRows; ++j) {
                let monster = new CardBase({
                    scene: scene, 
                    x: xCoords[i], y: yCoords[j], 
                    name: "The Fool",
                    sprite: "TheFool.png",
                    depth: 1,
                    value: 0,
                    type: "random" 
                });

                monsters.push(monster);
            }
        }
        for (let i = 0, size = monsters.length; i < size; ++i) {
            monsters[i].ReplaceWithRandom(monsters);
        }

        this.xCoords = xCoords;
        this.yCoords = yCoords;
        this.monsters = monsters;
        this.numColumns = numColumns;
        this.numRows = numRows;
        this._highlightActive = false;
        this.cardHeight = cardHeight;
        this.cardWidth = cardWidth;
        this.cardPadding = cardPadding;
        this.scene = scene;
        this.yOffset = yOFfset;
    }

    get HighlightActive() {
        return this._highlightActive;
    }

    set HighlightActive(newVal) {
        this._highlightActive = newVal;
        if (!newVal) {
            this.SetHighlightPosition(0, this.scene.game.config.height); // unhighlight
        }
    }

    _GetTargetIndex(x, y) {
        let highlight = -1;
        const allowHighlight = y <= this.yCoords[2] + this.cardHeight + this.cardHeight / 2;
        
        if (allowHighlight && this._highlightActive) {
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

        if (highlight < 0) {
            return -1;
        }

        let player = -1;
        const playerX = this.scene.player.startX;
        if (playerX < this.xCoords[0] + this.cardWidth / 2) {
            player = 2;
        }
        else if (playerX < this.xCoords[1] + this.cardWidth / 2) {
            player = 5;
        }
        else {
            player = 8;
        }


        if (player == highlight) {
            // Always allow?
        }
        else if (player == 2 || player == 8) {
            if (highlight != 5) {
                highlight = -1;
            }
        }
        else if (player == 5) {
            if (highlight != 2 && highlight != 8) {
                highlight = -1;
            }
        }

        return highlight;
    }

    SetHighlightPosition(x, y) {
        let targetIndex = this._GetTargetIndex(x, y);
        
        let color = 0xFFFFFF;
        for (let i = 0, size = this.monsters.length; i < size; ++i) {
            this.monsters[i].TintCard(color);
        }

        if (targetIndex >= 0) {
            this.monsters[targetIndex].TintCard(0xCCCC88);
        }
    }

   

    TryToMove(gameObject, x, y) {
        const targetIndex = this._GetTargetIndex(x, y);
        
        if (targetIndex < 0) {
            return -1;
        }

        const monster = this.monsters[targetIndex];

        this.scene.Coins -= monster.Value;
        if (this.scene.Coins > 0) {
            this.scene.player.disableInteractive();

            monster.Value = 0;
            this.scene.tweens.add({ // Flash
                targets: [monster.faceSprite, monster.footerSprite, monster.valueSprite, monster.valueText, monster.nameText],
                alpha: 0,
                duration: 120,
                repeat: 1,
                yoyo: true,
            });

            setTimeout(() => {
                const row1 = [this.monsters[0], this.monsters[3], this.monsters[6]];
                const row2 = [this.monsters[1], this.monsters[4], this.monsters[7]];
                const row3 = [this.monsters[2], this.monsters[5], this.monsters[8]];
                this.scene.tweens.add( {
                    targets: row1,
                    duration: 400,
                    y: this.yCoords[1],
                });
                this.scene.tweens.add( {
                    targets: row2,
                    duration: 400,
                    y: this.yCoords[2],
                });
                this.scene.tweens.add( {
                    targets: row3,
                    duration: 400,
                    y: this.yCoords[2] + this.cardHeight + this.cardPadding,
                });
                this.scene.tweens.add( {
                    targets: row3,
                    duration: 400,
                    alpha: 0,
                    onComplete: () => {
                        for (let i = 0; i < 3; ++i) {
                            row1[i].y = this.yCoords[0];
                            row2[i].y = this.yCoords[1];
                            row3[i].y = this.yCoords[2];

                            row3[i].ReplaceWith(row2[i]);
                            row2[i].ReplaceWith(row1[i]);
                            row1[i].ReplaceWithRandom(this.monsters);

                            row3[i].alpha = 1;

                            this.scene.player.setInteractive();
                        }
                    } 
                });
            }, 100);
            // Kill Monster
        }
        else {
            this.scene.tweens.add({ // Flash
                targets: [this.scene.player],
                alpha: 0,
                duration: 120,
                repeat: 1,
                yoyo: true,
                onComplete: () => {
                    this.scene.Reset();
                }
            });
            // Kill Player
        }

        
        return targetIndex;
    }
}