import { UpgradesData } from './UpgradesData.js';

export default class UpgradesManager {
    constructor() {
        this.upgrades = {
            hammer: {
                currentLevel: 0
            },
            armor: {
                currentLevel: 0,
                unlocked: false
            },
            magic: {
                spell1: -1, // -1 means not owned, 0+ is the current level
                spell2: -1,
                spell3: -1
            }
        };
        
        this.loadUpgrades();
    }
    
    loadUpgrades() {
        const savedUpgrades = localStorage.getItem('paladinged_upgrades');
        if (savedUpgrades) {
            this.upgrades = JSON.parse(savedUpgrades);
        }
    }
    
    saveUpgrades() {
        localStorage.setItem('paladinged_upgrades', JSON.stringify(this.upgrades));
    }
    
    getHammerLevel() {
        return this.upgrades.hammer.currentLevel;
    }
    
    getArmorLevel() {
        return this.upgrades.armor.currentLevel;
    }
    
    isArmorUnlocked() {
        return this.upgrades.armor.unlocked;
    }
    
    hasSpell(spellId) {
        return this.upgrades.magic[spellId] >= 0;
    }
    
    getSpellLevel(spellId) {
        return this.upgrades.magic[spellId] >= 0 ? this.upgrades.magic[spellId] : -1;
    }
    
    canPurchaseHammerUpgrade(gold) {
        const nextLevel = this.upgrades.hammer.currentLevel + 1;
        if (nextLevel >= UpgradesData.hammer.levels.length) {
            return false;
        }
        const cost = UpgradesData.getUpgradePrice('hammer', nextLevel);
        return gold >= cost;
    }
    
    canPurchaseArmorUpgrade(gold) {
        if (!this.upgrades.armor.unlocked) {
            // First purchase unlocks armor
            const cost = UpgradesData.getUpgradePrice('armor', 1);
            return gold >= cost;
        }
        
        const nextLevel = this.upgrades.armor.currentLevel + 1;
        if (nextLevel > 3) {
            return false;
        }
        const cost = UpgradesData.getUpgradePrice('armor', nextLevel);
        return gold >= cost;
    }
    
    canPurchaseSpell(spellId, gold) {
        const currentLevel = this.getSpellLevel(spellId);
        const nextLevel = currentLevel + 1;
        
        // Check if there's a next level available
        const spell = UpgradesData.magic.spells.find(s => s.id === spellId);
        if (!spell || nextLevel >= spell.levels.length) {
            return false;
        }
        
        const cost = UpgradesData.getSpellPrice(spellId, nextLevel);
        return gold >= cost;
    }
    
    purchaseHammerUpgrade(gold) {
        if (!this.canPurchaseHammerUpgrade(gold)) {
            return { success: false, message: "Not enough gold or max level reached" };
        }
        
        const nextLevel = this.upgrades.hammer.currentLevel + 1;
        const cost = UpgradesData.getUpgradePrice('hammer', nextLevel);
        
        this.upgrades.hammer.currentLevel = nextLevel;
        this.saveUpgrades();
        
        return { 
            success: true, 
            cost: cost,
            newLevel: nextLevel,
            upgradeName: UpgradesData.hammer.levels[nextLevel].name
        };
    }
    
    purchaseArmorUpgrade(gold) {
        if (!this.canPurchaseArmorUpgrade(gold)) {
            return { success: false, message: "Not enough gold or max level reached" };
        }
        
        let cost;
        let upgradeName;
        
        if (!this.upgrades.armor.unlocked) {
            // First purchase
            this.upgrades.armor.unlocked = true;
            this.upgrades.armor.currentLevel = 1;
            cost = UpgradesData.getUpgradePrice('armor', 1);
            upgradeName = UpgradesData.armor.levels[0].name;
        } else {
            const nextLevel = this.upgrades.armor.currentLevel + 1;
            this.upgrades.armor.currentLevel = nextLevel;
            cost = UpgradesData.getUpgradePrice('armor', nextLevel);
            upgradeName = UpgradesData.armor.levels[nextLevel - 1].name;
        }
        
        this.saveUpgrades();
        
        return { 
            success: true, 
            cost: cost,
            newLevel: this.upgrades.armor.currentLevel,
            upgradeName: upgradeName
        };
    }
    
    purchaseSpell(spellId, gold) {
        if (!this.canPurchaseSpell(spellId, gold)) {
            return { success: false, message: "Not enough gold or max level reached" };
        }
        
        const currentLevel = this.getSpellLevel(spellId);
        const nextLevel = currentLevel + 1;
        const spellData = UpgradesData.getSpellData(spellId, nextLevel);
        
        this.upgrades.magic[spellId] = nextLevel;
        this.saveUpgrades();
        
        return { 
            success: true, 
            cost: spellData.cost,
            spellName: spellData.name,
            newLevel: nextLevel
        };
    }
    
    getNextHammerUpgrade() {
        const nextLevel = this.upgrades.hammer.currentLevel + 1;
        if (nextLevel >= UpgradesData.hammer.levels.length) {
            return null;
        }
        return UpgradesData.hammer.levels[nextLevel];
    }
    
    getNextArmorUpgrade() {
        if (!this.upgrades.armor.unlocked) {
            return UpgradesData.armor.levels[0];
        }
        
        const nextLevel = this.upgrades.armor.currentLevel;
        if (nextLevel >= UpgradesData.armor.levels.length) {
            return null;
        }
        return UpgradesData.armor.levels[nextLevel];
    }
    
    getAvailableSpells() {
        return UpgradesData.magic.spells.map(spell => {
            const currentLevel = this.getSpellLevel(spell.id);
            const nextLevel = currentLevel + 1;
            if (nextLevel < spell.levels.length) {
                return {
                    ...spell,
                    currentLevel: currentLevel,
                    nextLevel: nextLevel,
                    nextLevelData: spell.levels[nextLevel]
                };
            }
            return null;
        }).filter(spell => spell !== null);
    }
    
    getOwnedSpells() {
        return UpgradesData.magic.spells.filter(spell => this.hasSpell(spell.id)).map(spell => {
            const level = this.getSpellLevel(spell.id);
            return {
                ...spell,
                currentLevel: level,
                levelData: spell.levels[level]
            };
        });
    }
    
    resetUpgrades() {
        this.upgrades = {
            hammer: {
                currentLevel: 0
            },
            armor: {
                currentLevel: 0,
                unlocked: false
            },
            magic: {
                spell1: -1, // -1 means not owned, 0+ is the current level
                spell2: -1,
                spell3: -1
            }
        };
        this.saveUpgrades();
    }
}