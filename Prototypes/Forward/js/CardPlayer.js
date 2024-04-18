import CardBase from './CardBase.js'

export default class CardPlayer extends CardBase {
    
    constructor(data) {
        super(data);

        // Values from super
        const { scene, x, y, name, sprite, depth} = data;
        // values for self
        const { health, maxHealth, shield, coins, hud } = data;

        this.hud = hud;
        this.MaxHealth = maxHealth;
        this.Health = health;
        this.Shield = shield;
        this.Coins = coins;
    }

    set Health(newValue) {
        if (newValue < 0) {newValue = 0;}
        if (newValue > this.maxHealth) { newValue = this.maxHealth; }

        if (this.hud !== null) {
            this.hud.Health = newValue;
        }
        this.health = this.health;
    }

    set MaxHealth(newValue) {
        if (newValue < 0) {newValue = 0;}

        if (this.hud !== null) {
            this.hud.MaxHealth = newValue;
        }
        this.maxHealth = this.health;
    }

    set Shield(newValue) {
        if (newValue < 0) {newValue = 0;}

        if (this.hud !== null) {
            this.hud.Shield = newValue;
        }
        this.shield = this.health;
    }

    set Coins(newValue) {
        if (newValue < 0) {newValue = 0;}

        if (this.hud !== null) {
            this.hud.Coins = newValue;
        }
        this.coins = this.health;
    }
}