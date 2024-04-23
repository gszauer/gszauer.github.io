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
        const yOFfset = cardHeight + cardPadding * 4;
        yCoords[0] -= yOFfset;
        yCoords[1] -= yOFfset;
        yCoords[2] -= yOFfset;

        const monsters = [];
        for (let i = 0; i < numColumns; ++i) {
            for (let j = 0; j < numRows; ++j) {
                let monster = new CardBase({
                    scene: scene, 
                    x: xCoords[i], y: yCoords[j], 
                    name: "",
                    sprite: "CardBackTopOnly.png",
                    depth: 1,
                    value: 0,
                    type: "random" 
                });

                monsters.push(monster);
            }
        }
        for (let i = 0, size = monsters.length; i < size; ++i) {
            monsters[i].Value = 0;
        }

        this.cardBacks = [
            scene.add.sprite(0, 0, scene.GetSet("CardBack.png"), "CardBack.png"),
            scene.add.sprite(0, 0, scene.GetSet("CardBack.png"), "CardBack.png"),
            scene.add.sprite(0, 0, scene.GetSet("CardBack.png"), "CardBack.png")
        ];
        this.SetCardBackVisibility(false);
        

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

    SetCardBackVisibility(newVal) {
        this.cardBacks[0].setActive(newVal).setVisible(newVal);
        this.cardBacks[1].setActive(newVal).setVisible(newVal);
        this.cardBacks[2].setActive(newVal).setVisible(newVal);
    }

    PositionCardBacksAtRow0() {
        this.cardBacks[0].x = this.xCoords[0];
        this.cardBacks[1].x = this.xCoords[1];
        this.cardBacks[2].x = this.xCoords[2];

        this.cardBacks[0].y = this.yCoords[0] - this.cardHeight - this.cardPadding;
        this.cardBacks[1].y = this.yCoords[0] - this.cardHeight - this.cardPadding;
        this.cardBacks[2].y = this.yCoords[0] - this.cardHeight - this.cardPadding;

        this.cardBacks[0].scaleX = 1;
        this.cardBacks[1].scaleX = 1;
        this.cardBacks[2].scaleX = 1;

        this.cardBacks[0].angle = CardBase.GetRandomRotation();
        this.cardBacks[1].angle = CardBase.GetRandomRotation();
        this.cardBacks[2].angle = CardBase.GetRandomRotation();
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

        if (monster.cardType == "empty") {
            
        }
        else if (monster.cardType == "sword") {
            let deadMonsters = [];

            for (let i = 0; i < this.numColumns * this.numRows; ++i) {
                const target = this.monsters[i];
                if (target.cardType == "monster" && target.Value > 0) {
                    target.Value -= monster.Value;
                    if (target.Value <= 0) {
                        target.Value = 0;
                        deadMonsters.push(target);
                    }
                }
            }

            if (deadMonsters.length > 0) {
                this.scene.player.disableInteractive();

                this.scene.tweens.add({ // Flash dead monsters
                    targets: deadMonsters,
                    alpha: 0,
                    duration: 100,
                    repeat: 1,
                    yoyo: true,
                    onComplete: () => {
                        this.scene.tweens.add( { // Flip dead monsters
                            targets: deadMonsters,
                            duration: 150,
                            scaleX: 0,
                            onComplete: () => {
                                for (let i = 0, len = deadMonsters.length; i < len; ++i) {
                                    deadMonsters[i].ReplaceOnDeath();
                                }

                                this.scene.tweens.add( { // Flip them back!
                                    targets: deadMonsters,
                                    duration: 150,
                                    scaleX: 1,
                                    onComplete: () => {
                                        this._AdvanceBoard(monster);
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                this._AdvanceBoard(monster);
            }
        }
        else if (monster.cardType == "coin") {
            this.scene.Coins += monster.Value;
            this._AdvanceBoard(monster);
        }
        else if (monster.cardType == "monster") {
            this.scene.Coins -= monster.Value;

            if (this.scene.Coins > 0) { // Kill Monster
                monster.Value = 0;
                this._AdvanceBoard(monster);
            }
            else { // Kill Player
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
                
            }
        }
        
        return targetIndex;
    }

    _AdvanceBoard(monster) {
        this.scene.player.disableInteractive();
        this.scene.tweens.add({ // Flash
            targets: [monster.faceSprite, monster.footerSprite, monster.valueSprite, monster.valueText, monster.nameText],
            alpha: 0,
            duration: 120,
            repeat: 1,
            yoyo: true,
        });

        setTimeout(() => {
            this.SetCardBackVisibility(true);
            this.PositionCardBacksAtRow0();

            const row1 = [this.monsters[0], this.monsters[3], this.monsters[6]];
            const row2 = [this.monsters[1], this.monsters[4], this.monsters[7]];
            const row3 = [this.monsters[2], this.monsters[5], this.monsters[8]];
            this.scene.tweens.add( {
                targets: this.cardBacks,
                duration: 400,
                y: this.yCoords[0],
            });
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

                        let randomNumber = Math.floor(Math.random() * 18);
                        if (randomNumber == 0 || randomNumber == 7 || randomNumber == 12) { //One in three chance for a coin
                            row1[i].ReplaceWithCoin();
                        }
                        else {
                            randomNumber = Math.floor(Math.random() *  24);
                            if (randomNumber == 1 || randomNumber == 4 || randomNumber == 11 || randomNumber == 17) { //One in three
                                row1[i].ReplaceWithSword();
                            }
                        }

                        row3[i].alpha = 1;
                        row1[i].scaleX = 0;
                    }

                    this.scene.player.setInteractive();

                    this.scene.tweens.add( {
                        targets: this.cardBacks,
                        duration: 300,
                        scaleX: 0,
                        onComplete: () => {
                            this.scene.tweens.add( {
                                targets: row1,
                                duration: 300,
                                scaleX: 1,
                                onComplete: () => {
                                }
                            });
                        }
                    });
                } 
            });
        }, 100);
    }

    Reset() {
        this.scene.player.disableInteractive();

        this.scene.tweens.add( { // Flip  monsters
            targets: this.monsters,
            duration: 300,
            scaleX: 0,
            onComplete: () => {
                for (let i = 0, len = this.monsters.length; i < len; ++i) {
                    this.monsters[i].ReplaceWithRandom(this.monsters);
                }

                const limit = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < limit; ++i) {
                    let rando = Math.floor(Math.random() * 3);
                    if (rando == 0) {
                        rando = 1;
                    }
                    else if (rando == 1) {
                        rando = 4;
                    }
                    else if (rando == 2) {
                        rando = 7;
                    }

                    if (this.monsters[0]._OneInFive()) {
                        this.monsters[rando].ReplaceWithCoin();
                    }
                    else if (this.monsters[0]._OneInFive()) {
                        this.monsters[rando].ReplaceWithSword();
                    }
                }

                this.scene.tweens.add( { // Flip them back!
                    targets: this.monsters,
                    duration: 300,
                    scaleX: 1,
                    onComplete: () => {
                        this.scene.player.setInteractive();
                    }
                });
            }
        });
    }
}