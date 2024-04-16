import CardDraggable from "./CardDraggable.js";

export default class CardPlayer extends CardDraggable {
    constructor(data) {
        let {scene, health} = data;
        super(data);
        this.textHealth = new Phaser.GameObjects.BitmapText(this.scene, 0, 94, 'pressstart', health);
        this.textMaxHealth = new Phaser.GameObjects.BitmapText(this.scene, 0, 94, 'pressstart', health, 12);
        this.textArmor = new Phaser.GameObjects.BitmapText(this.scene, 0, 94, 'pressstart');
        //this.spriteArmor = new Phaser.GameObjects.Sprite(scene, 50, -80, 'armor')
        //this.textHealth.tint = 0;
        this.textMaxHealth.tint = 0;
        this.add([this.textHealth, this.textMaxHealth, 
            /*this.spriteArmor,*/ this.textArmor]);
        this.health = health;
        this.maxHealth = health;
        this.armor = 0;
        this.spriteImage.alpha = 0;
    }

    set health (newHealth) {
        this._health = newHealth;
        this.textHealth.text = this._health;
        this.textHealth.x = 46 - this.textHealth.width / 2;
    }
    
    get health() {
        return this._health;
    }

    set maxHealth(newHealth) {
        this._maxHealth = newHealth;

        this.textMaxHealth.text = this._maxHealth;
        this.textMaxHealth.x = -30 - this.textHealth.width / 2;
    }

    get maxHealth() {
        return this._maxHealth;
    }

    set armor(newArmor) {
        this._armor = newArmor;
        this.textArmor.text = this._armor;
        this.textArmor.x = -44 - this.textArmor.width / 2;
        //this.textArmor.alpha = this._armor == 0? 0 : 1;
        //this.spriteArmor.alpha = this._armor == 0 ? 0 : 1;
    }

    get armor() {
        return this._armor;
    }

    attack(attackValue) {
        if (attackValue <= this.armor) {
            this.armor = this.armor - attackValue;
        }
        else {
            this.health = this.health - (attackValue - this.armor);
            this.armor = 0;
        }

        if (this.health <= 0) {
            this.dead = true;
        }
    }

    set dead(value) {
        this.health = 0;
        this.cardName = 'DEAD';
        this.draggable = false;
        this.deadAnimation();
    }

    get dead() {
        return this._cardName == 'DEAD';
    }
}