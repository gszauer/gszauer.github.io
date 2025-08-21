export const UpgradesData = {
    hammer: {
        name: "Hammer",
        description: "Upgrade your trusty hammer",
        levels: [
            {
                level: 0,
                name: "Default Hammer",
                description: "What the player starts out with",
                cost: 0,
                owned: true
            },
            {
                level: 1,
                name: "Extended Reach",
                description: "Slightly longer hammer for better range",
                cost: 100,
                owned: false
            },
            {
                level: 2,
                name: "Heavy Head",
                description: "Larger hammer head for more impact",
                cost: 250,
                owned: false
            },
            {
                level: 3,
                name: "Quick Recovery",
                description: "Reduced cooldown between swings",
                cost: 500,
                owned: false
            },
            {
                level: 4,
                name: "Lightning Swing",
                description: "Swings faster for rapid attacks",
                cost: 1000,
                owned: false
            }
        ]
    },
    
    armor: {
        name: "Armor",
        description: "Protect yourself with magical armor",
        locked: true,
        levels: [
            {
                level: 1,
                name: "Light Armor",
                description: "Grants one additional heart",
                cost: 150,
                owned: false
            },
            {
                level: 2,
                name: "Medium Armor",
                description: "Grants two additional hearts",
                cost: 400,
                owned: false
            },
            {
                level: 3,
                name: "Heavy Armor",
                description: "Grants three additional hearts",
                cost: 800,
                owned: false
            }
        ]
    },
    
    magic: {
        name: "Magic Spells",
        description: "Unlock powerful magical abilities",
        spells: [
            {
                id: "spell1",
                name: "Fire Blast",
                description: "Unleash a powerful fire attack",
                cost: 300,
                owned: false,
                locked: true
            },
            {
                id: "spell2",
                name: "Ice Shield",
                description: "Create a protective ice barrier",
                cost: 300,
                owned: false,
                locked: true
            },
            {
                id: "spell3",
                name: "Gold Touch",
                description: "Monsters drop gold when defeated",
                cost: 300,
                owned: false,
                locked: true
            }
        ]
    },
    
    getUpgradePrice(category, level) {
        if (category === 'hammer') {
            return this.hammer.levels[level]?.cost || 0;
        } else if (category === 'armor') {
            return this.armor.levels[level - 1]?.cost || 0;
        }
        return 0;
    },
    
    getSpellPrice(spellId) {
        const spell = this.magic.spells.find(s => s.id === spellId);
        return spell?.cost || 0;
    }
};