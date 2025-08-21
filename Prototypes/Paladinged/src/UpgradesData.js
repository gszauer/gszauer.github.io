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
                levels: [
                    {
                        level: 0,
                        name: "Unlock Fire Blast",
                        description: "Unleash a powerful fire attack (3 seconds)",
                        cost: 300,
                        duration: 3000,
                        owned: false
                    },
                    {
                        level: 1,
                        name: "Fire Blast II",
                        description: "+2 seconds duration (5 seconds total)",
                        cost: 400,
                        duration: 5000,
                        owned: false
                    },
                    {
                        level: 2,
                        name: "Fire Blast III",
                        description: "+4 seconds duration (7 seconds total)",
                        cost: 600,
                        duration: 7000,
                        owned: false
                    }
                ]
            },
            {
                id: "spell2",
                name: "Ice Shield",
                description: "Create a protective ice barrier",
                levels: [
                    {
                        level: 0,
                        name: "Unlock Ice Shield",
                        description: "Grants 1 extra heart",
                        cost: 300,
                        bonusHearts: 1,
                        owned: false
                    },
                    {
                        level: 1,
                        name: "Ice Shield II",
                        description: "Grants 2 extra hearts",
                        cost: 400,
                        bonusHearts: 2,
                        owned: false
                    },
                    {
                        level: 2,
                        name: "Ice Shield III",
                        description: "Grants 3 extra hearts",
                        cost: 600,
                        bonusHearts: 3,
                        owned: false
                    }
                ]
            },
            {
                id: "spell3",
                name: "Gold Touch",
                description: "Monsters drop gold when defeated",
                levels: [
                    {
                        level: 0,
                        name: "Unlock Gold Touch",
                        description: "Monsters drop gold when defeated (4 seconds)",
                        cost: 300,
                        duration: 4000,
                        owned: false
                    },
                    {
                        level: 1,
                        name: "Gold Touch II",
                        description: "+2 seconds duration (6 seconds total)",
                        cost: 400,
                        duration: 6000,
                        owned: false
                    },
                    {
                        level: 2,
                        name: "Gold Touch III",
                        description: "+4 seconds duration (8 seconds total)",
                        cost: 600,
                        duration: 8000,
                        owned: false
                    }
                ]
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
    
    getSpellPrice(spellId, level = 0) {
        const spell = this.magic.spells.find(s => s.id === spellId);
        if (!spell || !spell.levels[level]) return 0;
        return spell.levels[level].cost;
    },
    
    getSpellData(spellId, level = 0) {
        const spell = this.magic.spells.find(s => s.id === spellId);
        if (!spell || !spell.levels[level]) return null;
        return spell.levels[level];
    }
};