/**
 * PowerBadge.js - Power/Cost Display Component
 * A circular badge that displays a number.
 */

class PowerBadge extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type, radius) {
        super(scene, x, y);
        scene.add.existing(this);

        this.badgeType = type || 'power';  // 'power', 'cost', 'location'
        this.radius = radius || LAYOUT.BADGE_RADIUS;
        this.currentValue = 0;
        this.baseValue = 0;
        this.isWinning = false;

        this.createBadge();
    }

    createBadge() {
        // Background circle
        this.background = this.scene.add.graphics();
        this.add(this.background);

        // Text
        this.text = this.scene.add.text(0, 0, '0', {
            fontFamily: 'Arial Black, Arial',
            fontSize: (this.radius * 1.2) + 'px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add(this.text);

        this.drawBackground();
    }

    drawBackground() {
        this.background.clear();

        let color;
        if (this.badgeType === 'cost') {
            color = COLORS.CARD_COST;
        } else if (this.badgeType === 'location') {
            if (this.isWinning) {
                color = COLORS.LOCATION_WINNING;
            } else {
                color = COLORS.PRIMARY;
            }
        } else {
            // Power badge - color based on buff/debuff
            if (this.currentValue > this.baseValue) {
                color = COLORS.CARD_POWER_BUFF;
            } else if (this.currentValue < this.baseValue) {
                color = COLORS.CARD_POWER_DEBUFF;
            } else {
                color = COLORS.CARD_POWER;
            }
        }

        // Draw circle
        this.background.fillStyle(color, 1);
        this.background.fillCircle(0, 0, this.radius);

        // Border
        this.background.lineStyle(2, 0x000000, 0.5);
        this.background.strokeCircle(0, 0, this.radius);
    }

    setValue(value, baseValue) {
        this.currentValue = value;
        if (baseValue !== undefined) {
            this.baseValue = baseValue;
        }
        this.text.setText(value.toString());
        this.drawBackground();
    }

    getValue() {
        return this.currentValue;
    }

    setWinning(winning) {
        this.isWinning = winning;
        this.drawBackground();
    }

    /**
     * Animate value change
     */
    animateChange(fromValue, toValue, duration) {
        duration = duration || ANIM.POWER_CHANGE;

        this.scene.tweens.addCounter({
            from: fromValue,
            to: toValue,
            duration: duration,
            onUpdate: (tween) => {
                const value = Math.round(tween.getValue());
                this.setValue(value, this.baseValue);
            }
        });

        // Scale pulse effect
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: duration / 2,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }
}
