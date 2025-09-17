class Player {
    constructor(scene) {
        this.scene = scene;
        this.maxHp = 20;
        this.hp = 20;
        this.attack = 3;
        this.gold = 0;
        this.inventory = [];
        this.floor = 1;
        this.hasKey = false;
        this.godMode = false;
    }

    isAlive() {
        return this.hp > 0;
    }

    reset() {
        this.maxHp = 20;
        this.hp = 20;
        this.attack = 3;
        this.gold = 0;
        this.inventory = [];
        this.floor = 1;
        this.hasKey = false;
        this.godMode = false;
    }

    getAttack() {
        let currentAttack = this.attack;
        if (this.hasItem('Attack Rune')) currentAttack += 10;
        if (this.hasItem('Cursed Rune')) currentAttack *= 0.5;
        return Math.floor(currentAttack);
    }

    getBaseAttack() {
        return Math.floor(this.attack);
    }

    getMaxHp() {
        let currentMaxHp = this.maxHp;
        if (this.hasItem('Defense Rune')) currentMaxHp += 10;
        if (this.hasItem('Cursed Rune')) {
            const lostAtk = this.attack - (this.attack * 0.5);
            currentMaxHp += (lostAtk * 2);
        }
        return Math.floor(currentMaxHp);
    }

    getBaseMaxHp() {
        return Math.floor(this.maxHp);
    }

    takeDamage(amount) {
        if (this.godMode) {
            // This turned out to be annoying. Just hide it.
            //this.scene.showGameMessage('God Mode!');
            return;
        }
        
        if (this.hasItem('Shield') && Math.random() < 0.1) {
            this.scene.showGameMessage(Localization[Game.language]["dodged"]);
            return;
        }

        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;

        if (this.hasItem('Amulet of Greed')) {
            const goldGained = Math.floor(this.floor * (amount / this.floor));
            if (goldGained > 0) {
                this.addGold(goldGained);
                this.scene.showGameMessage(Localization[Game.language]["gold_gained"].replace("{amount}", goldGained));
            }
        }
        this.scene.updatePlayerUI();
        this.scene.flashPlayerHP();
    }

    heal(amount) {
        this.hp = Math.min(this.getMaxHp(), this.hp + amount);
        this.scene.updatePlayerUI();
    }

    addGold(amount) {
        this.gold += amount;
        this.scene.updatePlayerUI();
    }

    addItem(item) {
        if (this.inventory.length >= GameSettings.INVENTORY_SIZE - GameSettings.LOCKED_INVENTORY_SLOTS) {
            this.scene.showGameMessage(Localization[Game.language]["inventory_full"]);
            this.scene.flashInventoryFull();
            return false;
        }
        this.inventory.push(item);
        this.scene.updateInventoryUI();
        return true;
    }

    removeItem(item) {
        const index = this.inventory.findIndex(invItem => invItem.key === item.key);
        if (index > -1) {
            this.inventory.splice(index, 1);
            this.scene.updateInventoryUI();
            return true;
        }
        return false;
    }

    hasItem(itemKey) {
        return this.inventory.some(item => item.key === itemKey);
    }
}
