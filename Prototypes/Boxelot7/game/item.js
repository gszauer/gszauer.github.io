class Item {
    constructor(config, key) {
        this.key = key; // Store the key for lookups
        this.name = config.name;

        this.sprite = config.sprite; // Sprite name in atlas
        this.type = config.type; // 'durable', 'usable', 'instant'
        this.description = config.description;
        this.sellValue = config.sellValue || 0;
        this.effect = config.effect;
        this.color = config.color;
    }
}

const calculateBladeScrollDamage = (player) => {
    const attackBase = Math.max(1, player.getBaseAttack());
    const floorBonus = 4 + Math.floor(player.floor * 1.4);
    return Math.max(6, Math.round((attackBase * 1.6) + floorBonus));
};

const calculateCoinPickupAmount = (player) => {
    const baseRoll = Phaser.Math.Between(3, 5);
    return Math.max(3, baseRoll + Math.floor(player.floor * 1.5));
};

const calculateHeartPickupAmount = (player) => {
    const baseRoll = Phaser.Math.Between(2, 4);
    return Math.max(2, baseRoll + Math.floor(player.floor * 1.2));
};

const ItemData = {
    // Durable Items
    'Attack Rune': { name: Localization[Game.language]["item_attack_rune_name"], loc: 'item_attack_rune_name', sprite: 'attack_rune.png', type: 'durable', description: (p) => Localization[Game.language]["item_attack_rune_desc"], sellValue: 20 },
    'Defense Rune': { name: Localization[Game.language]["item_defense_rune_name"], loc: 'item_defense_rune_name', sprite: 'defense_rune.png', type: 'durable', description: (p) => Localization[Game.language]["item_defense_rune_desc"], sellValue: 20 },
    'Shield': { name: Localization[Game.language]["item_shield_name"], loc: 'item_shield_name', sprite: 'shield.png', type: 'durable', description: (p) => Localization[Game.language]["item_shield_desc"], sellValue: 25 },
    'Spike Trap': { name: Localization[Game.language]["item_spike_trap_name"], loc: 'item_spike_trap_name', sprite: 'spike_trap.png', type: 'durable', description: (p) => Localization[Game.language]["item_spike_trap_desc"], sellValue: 15 },
    'Lantern': { name: Localization[Game.language]["item_lantern_name"], loc: 'item_lantern_name', sprite: 'lantern.png', type: 'durable', description: (p) => Localization[Game.language]["item_lantern_desc"], sellValue: 15 },
    'Invisibility Cloak': { name: Localization[Game.language]["item_invisibility_cloak_name"], loc: 'item_invisibility_cloak_name', sprite: 'cloak.png', type: 'durable', description: (p) => Localization[Game.language]["item_invisibility_cloak_desc"], sellValue: 30 },
    'Vampire Ring': { name: Localization[Game.language]["item_vampire_ring_name"], loc: 'item_vampire_ring_name', sprite: 'ring.png', type: 'durable', description: (p) => Localization[Game.language]["item_vampire_ring_desc"], sellValue: 20 },
    'Amulet of Greed': { name: Localization[Game.language]["item_idol_name"], loc: 'item_idol_name', sprite: 'greed.png', type: 'durable', description: (p) => Localization[Game.language]["item_idol_desc"], sellValue: 15 },
    'Cursed Rune': { name: Localization[Game.language]["item_cursed_doll_name"], loc: 'item_cursed_doll_name', sprite: 'cursed.png', type: 'durable', description: (p) => Localization[Game.language]["item_cursed_doll_desc"], sellValue: 5 },

    // Usable Items
    'Potion': { name: Localization[Game.language]["item_potion_name"], loc: 'item_potion_name', sprite: 'potion.png', type: 'usable', 
        description: (p) => Localization[Game.language]["item_potion_desc"].replace("{hp}", Math.max(5, Math.floor(p.getMaxHp() * 0.25)))
        , sellValue: 5, color: Colors.ITEM_POTION, effect: (scene) => {
        const player = scene.player;
        player.heal(Math.max(5, Math.floor(player.getMaxHp() * 0.25)));
        scene.showGameMessage(Localization[Game.language]["healed"]);
        
        // Play potion sound
        if (!scene.isMuted) {
            const potionSounds = ['potion_1', 'potion_2'];
            const randomSound = potionSounds[Math.floor(Math.random() * potionSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},
    'Blade Scroll': { name: Localization[Game.language]["item_sword_name"], loc: 'item_sword_name', sprite: 'blade.png', type: 'usable', 
        description: (p) =>  Localization[Game.language]["item_sword_desc"].replace("{dmg}", calculateBladeScrollDamage(p))
        , sellValue: 8, color: Colors.ITEM_SCROLL, effect: (scene) => {
        const damage = calculateBladeScrollDamage(scene.player);
        scene.damageAllMonsters(damage);
        scene.showGameMessage(Localization[Game.language]["blade_storm_damage"].replace("{damage}", damage));

        // Play sword sound
        if (!scene.isMuted) {
            const swordSounds = ['sword_1', 'sword_2', 'sword_3'];
            const randomSound = swordSounds[Math.floor(Math.random() * swordSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},
    'Poison Vial': { name: Localization[Game.language]["item_poison_name"], loc: 'item_poison_name', sprite: 'poison.png', type: 'usable', 
        description: (p) => Localization[Game.language]["item_poison_desc"], sellValue: 7, color: Colors.ITEM_VIAL, effect: (scene) => {
        scene.poisonAllMonsters(Phaser.Math.Between(3, 5));
        scene.showGameMessage(Localization[Game.language]["monsters_poisoned"]);
        
        // Play potion sound
        if (!scene.isMuted) {
            const potionSounds = ['potion_1', 'potion_2'];
            const randomSound = potionSounds[Math.floor(Math.random() * potionSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},
    'Freeze Scroll': { name: Localization[Game.language]["item_freeze_name"], loc: 'item_freeze_name', sprite: 'freeze.png', type: 'usable', 
        description: (p) => Localization[Game.language]["item_freeze_desc"], sellValue: 10, color: Colors.ITEM_SCROLL, effect: (scene) => {
        scene.freezeAllMonsters(3);
        scene.showGameMessage(Localization[Game.language]["monsters_frozen"]);
        
        // Play freeze sound
        if (!scene.isMuted) {
            scene.sound.playAudioSprite('soundbank', 'freeze_1', {
                volume: scene.soundVolume
            });
        }
    }},
    'Sheep Scroll': { name: Localization[Game.language]["item_sheep_name"], loc: 'item_sheep_name', sprite: 'sheep.png', type: 'usable', 
        description:(p) => Localization[Game.language]["item_sheep_desc"], sellValue: 12, color: Colors.ITEM_SHEEP, effect: (scene) => {
        scene.sheepAllMonsters();
        scene.showGameMessage(Localization[Game.language]["sheep_spell_baa"]);
        
        // Play sheep sound
        if (!scene.isMuted) {
            const sheepSounds = ['sheep_1', 'sheep_2', 'sheep_3', 'sheep_4'];
            const randomSound = sheepSounds[Math.floor(Math.random() * sheepSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},
    'Lock Pick': { name: Localization[Game.language]["item_lock_pick_name"], loc: 'item_lock_pick_name', sprite: 'pick.png', type: 'usable', 
        description: (p) => Localization[Game.language]["item_lock_pick_desc"], sellValue: 15, color: Colors.ITEM_PICK, effect: (scene) => {
        scene.player.hasKey = true;
        scene.updateDoorState();
        scene.showGameMessage(Localization[Game.language]["door_unlocked"]);
        
        // Play door unlock sound
        if (!scene.isMuted) {
            const doorSounds = ['door_1', 'door_2', 'door_3'];
            const randomSound = doorSounds[Math.floor(Math.random() * doorSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},

    // Instant Items
    'Key': { name: Localization[Game.language]["item_key_name"], loc: 'item_key_name', sprite: 'key.png', type: 'instant', color: Colors.ITEM_KEY, effect: (scene) => {
        scene.player.hasKey = true;
        scene.updateDoorState();
        scene.updatePlayerUI();
        
        // Add click indicator to door after key is picked up during tutorial
        if (!Game.isTutorialFinished && scene.player.floor === 1 && scene.pendingDoorClickIndicator) {
            if (typeof scene.pendingDoorClickIndicator.showClickIndicator === 'function') {
                scene.pendingDoorClickIndicator.showClickIndicator();
            }
            scene.pendingDoorClickIndicator = null;
        }
        
        // Play door unlock sound
        if (!scene.isMuted) {
            const doorSounds = ['door_1', 'door_2', 'door_3'];
            const randomSound = doorSounds[Math.floor(Math.random() * doorSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},
    'Coin': { name: Localization[Game.language]["item_coin_name"], loc: 'item_coin_name', sprite: 'coin.png', type: 'instant', color: Colors.ITEM_COIN, effect: (scene, tile) => {
        const amount = tile.customAmount || calculateCoinPickupAmount(scene.player);
        scene.player.addGold(amount);
        scene.showGameMessage(Localization[Game.language]["gold_gained"].replace("{amount}", amount));

        // Play coin pickup sound
        if (!scene.isMuted) {
            const coinSounds = ['coins_1', 'coins_2'];
            const randomSound = coinSounds[Math.floor(Math.random() * coinSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},
    'Heart': { name: Localization[Game.language]["item_heart_name"], loc: 'item_heart_name', sprite: 'heart.png', type: 'instant', color: Colors.ITEM_HEART, effect: (scene, tile) => {
        const healAmount = tile.customAmount || calculateHeartPickupAmount(scene.player);
        scene.player.heal(healAmount);
        scene.showGameMessage(Localization[Game.language]["hp_gained"].replace("{amount}", healAmount));

        // Play heart pickup sound
        if (!scene.isMuted) {
            scene.sound.playAudioSprite('soundbank', 'heart_1', {
                volume: scene.soundVolume
            });
        }
    }},
    'Explosive': { name: Localization[Game.language]["item_explosive_name"], loc: 'item_explosive_name', sprite: 'explosive.png', type: 'instant', color: Colors.ITEM_EXPLOSIVE, effect: (scene) => {
        const damage = 2 + Math.floor(scene.player.floor / 5);
        scene.player.takeDamage(damage);
        scene.showGameMessage(Localization[Game.language]["item_explosize_tamage"].replace("{damage}", damage));
        // Play bomb explosion sound
        if (!scene.isMuted) {
            const bombSounds = ['bomb_1', 'bomb_2'];
            const randomSound = bombSounds[Math.floor(Math.random() * bombSounds.length)];
            scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: scene.soundVolume
            });
        }
    }},
};

const createItem = (key) => {
    if (!ItemData[key]) {
        console.error(`Item with key ${key} not found!`);
        return null;
    }
    const result = new Item(ItemData[key], key);
    result.name = Localization[Game.language][ItemData[key].loc]; 
    //console.warn("NAME SET TO: " + result.name);
    return result;
};
