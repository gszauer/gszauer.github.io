const getMonsterHpBase = (floor) => {
    if (floor <= 0) return 10;
    if (floor <= 3) return 10 + floor * 3;
    if (floor <= 6) return 19 + (floor - 3) * 4;
    if (floor <= 10) return 31 + (floor - 6) * 5;
    if (floor <= 15) return 51 + (floor - 10) * 6;
    return 81 + (floor - 15) * 7;
};

const getMonsterAttackBase = (floor) => {
    if (floor <= 0) return 1.5;
    if (floor <= 3) return 2;
    if (floor <= 6) return 2.5 + (floor - 3) * 0.7; // Gradual ramp to early midgame
    if (floor <= 10) return 4.6 + (floor - 6) * 0.8;
    if (floor <= 15) return 7.8 + (floor - 10) * 0.9;
    return 12.3 + (floor - 15);
};

const getTargetHitsForFloor = (floor) => {
    if (floor <= 3) return 12;
    if (floor <= 6) return 10;
    if (floor <= 10) return 9;
    if (floor <= 15) return 8;
    return 7;
};

const getScaleFactor = (modifier = 1) => {
    return 1 + (modifier - 1) * 0.7;
};

class Monster {
    constructor(scene, config, player, key) {
        this.scene = scene;
        this.key = key; // Store the key for lookups
        this.name = config.name;
        this.icon = config.icon;
        this.description = config.description;
        this.special = config.special;
        this.scaleModifier = config.scaleModifier || 1;
        
        // Dynamic Scaling
        const hpMultiplier = Phaser.Math.FloatBetween(0.9, 1.1);
        const hpScale = getScaleFactor(this.scaleModifier);
        const baseHpValue = getMonsterHpBase(player.floor) * hpScale;
        const adaptiveHp = player.getBaseAttack() * 0.2;
        this.maxHp = Math.max(1, Math.round((baseHpValue + adaptiveHp) * hpMultiplier));
        this.hp = this.maxHp;

        const targetHits = getTargetHitsForFloor(player.floor);
        const attackScale = getScaleFactor(this.scaleModifier);
        const baseAttackValue = getMonsterAttackBase(player.floor) * attackScale;
        const desiredAttack = player.getBaseMaxHp() > 0
            ? (player.getBaseMaxHp() / targetHits) * attackScale
            : 1;
        const adaptiveAttack = player.getBaseMaxHp() * 0.02 * attackScale;
        this.attack = Math.max(1, Math.round((baseAttackValue * 0.6) + (desiredAttack * 0.4) + adaptiveAttack));

        // Status Effects
        this.status = {
            poison: 0, // duration
            freeze: 0, // duration
            isSheep: false
        };

        this.transformData = config.transform;
        this.firstAttack = true;
        this.isKeyHolder = false;
        this.isBoss = config.isBoss || false;
        
        // Animation state machine
        this.animationState = 'idle'; // 'idle', 'attack', 'damage', 'dead'
        this.animationTimer = null;
        this.isAnimating = false;
        
        // Healer specific properties
        if (this.special === 'healer') {
            this.healingCooldown = 0;
            this.hasAttackedThisTurn = false;
        }
        
        // Necromancer specific properties
        if (this.special === 'summons') {
            this.summoningCooldown = 0;
            this.hasAttackedThisTurn = false;
        }
    }

    takeDamage(amount) {
        if (Game.character === 'hero_knight' && Math.random() < 0.1) {
            this.hp = 0;
            return;
        }

        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }
    
    isAlive() {
        return this.hp > 0;
    }

    isFrozen() {
        return this.status.freeze > 0;
    }
    
    canBeInteracted() {
        return !this.isAnimating;
    }
    
    turnIntoSheep() {
        this.status.isSheep = true;
        this.name = 'Sheep';
        this.icon = 'sheep';
        this.attack = 1;
        this.hp = 5;
        this.maxHp = 5;
        this.special = null;
        this.transformData = null;
    }
    
    transform() {
        if (!this.transformData) return false;
        
        this.name = this.transformData.name;
        this.icon = this.transformData.icon;
        this.maxHp = Math.ceil(this.maxHp * this.transformData.hpRatio);
        this.hp = this.maxHp;
        this.attack = Math.ceil(this.attack * this.transformData.atkRatio);
        this.transformData = null; // Can only transform once
        return true;
    }
    
    // Animation methods
    startAnimation(state, duration, callback) {
        // Clear any existing animation
        if (this.animationTimer) {
            this.animationTimer.destroy();
        }
        
        this.animationState = state;
        this.isAnimating = true;
        
        // Set timer to end animation
        this.animationTimer = this.scene.time.delayedCall(duration, () => {
            // Validate scene still exists
            if (!this.scene) return;
            this.endAnimation();
            if (callback) callback();
        });
    }
    
    endAnimation() {
        this.animationState = 'idle';
        this.isAnimating = false;
        if (this.animationTimer) {
            this.animationTimer.destroy();
            this.animationTimer = null;
        }
    }
    
    getAnimationFrame() {
        switch (this.animationState) {
            case 'idle': return 0;    // top-left
            case 'attack': return 1;  // top-right
            case 'damage': return 2;  // bottom-left
            case 'dead': return 3;    // bottom-right
            default: return 0;
        }
    }
    
    playAttackAnimation() {
        this.startAnimation('attack', 500); // 0.5 seconds
    }
    
    playDamageAnimation() {
        this.startAnimation('damage', 500); // 0.5 seconds
    }
    
    playDeathAnimation(callback) {
        this.startAnimation('dead', 500, callback); // 0.5 seconds
    }
}

const MonsterData = {
    // Regular Monsters
    'Spider': { name: Localization[Game.language]["monster_spider_name"], icon: 'spider', description: Localization[Game.language]["monster_spider_desc"], scaleModifier: 0.25 },
    'Wolf': { name: Localization[Game.language]["monster_wolf_name"], icon: 'wolf', description: Localization[Game.language]["monster_wolf_desc"], scaleModifier: 0.9 },
    'Devil': { name: Localization[Game.language]["monster_devil_name"], icon: 'devil', description: Localization[Game.language]["monster_devil_desc"], scaleModifier: 0.6 },
    'Bat': { name: Localization[Game.language]["monster_bat_name"], icon: 'bat', description: Localization[Game.language]["monster_bat_desc"], scaleModifier: 0.3 },
    'Skeleton': { name: Localization[Game.language]["monster_skeleton_name"], icon: 'skeleton', description: Localization[Game.language]["monster_skeleton_desc"], scaleModifier: 0.35 },
    'Zombie': { name: Localization[Game.language]["monster_zombie_name"], icon: 'zombie', description: Localization[Game.language]["monster_zombie_desc"], scaleModifier: 1.1 },
    'Demon': { name: Localization[Game.language]["monster_demon_name"], icon: 'demon', description: Localization[Game.language]["monster_demon_desc"], scaleModifier: 1.2 },
    'Ogre': { name: Localization[Game.language]["monster_ogre_name"], icon: 'ogre', description: Localization[Game.language]["monster_ogre_desc"], scaleModifier: 1.3 },

    // Skilled Monsters
    'Thief': { name: Localization[Game.language]["monster_thief_name"], icon: 'thief', description: Localization[Game.language]["monster_thief_desc"], special: 'steals_gold', scaleModifier: 0.9 },
    'Assassin': { name: Localization[Game.language]["monster_assassin_name"], icon: 'assasin', description: Localization[Game.language]["monster_assassin_desc"], special: 'attacks_on_reveal', scaleModifier: 1.0 },
    'Dark Healer': { name: Localization[Game.language]["monster_dark_healer_name"], icon: 'dark_healer', description: Localization[Game.language]["monster_dark_healer_desc"], special: 'healer', scaleModifier: 1.1 },
    'Evil Archer': { name: Localization[Game.language]["monster_evil_archer_name"], icon: 'evil_archer', description: Localization[Game.language]["monster_evil_archer_desc"], special: 'archer', scaleModifier: 1.2 },
    'Necromancer': { name: Localization[Game.language]["monster_necromancer_name"], icon: 'necromancer', description: Localization[Game.language]["monster_necromancer_desc"], special: 'summons', scaleModifier: 1.2 },
    
    // Shapeshifters
    'Shellshifter': { name: Localization[Game.language]["monster_shellshifter_name"], icon: 'shellshifter', description: Localization[Game.language]["monster_shellshifter_desc"], 
        transform: { name: Localization[Game.language]["monster_slime_name"], icon: 'shell', hpRatio: 0.5, atkRatio: 0.33 }, scaleModifier: 1.1 },
    'Phoenix': { name: Localization[Game.language]["monster_phoenix_name"], icon: 'phoenix', description: Localization[Game.language]["monster_phoenix_desc"], 
        transform: { name: Localization[Game.language]["monster_phoenix_transformed_name"], icon: 'eagle', hpRatio: 0.6, atkRatio: 0.6 }, scaleModifier: 1.4 },
    'Skeleton King': { name: Localization[Game.language]["monster_skeleton_king_name"], icon: 'skeleton_king', description: Localization[Game.language]["monster_skeleton_king_desc"], 
        transform: { name: Localization[Game.language]["monster_skeleton_king_transformed_name"], icon: 'skeleton', hpRatio: 0.4, atkRatio: 0.5 }, scaleModifier: 1.3 },

    // Bosses
    'Orc Boss': { name: Localization[Game.language]["monster_orc_boss_name"], icon: 'orc_boss', description: Localization[Game.language]["monster_orc_boss_desc"], scaleModifier: 2.5, isBoss: true },
    'Ghost Boss': { name: Localization[Game.language]["monster_ghost_boss_name"], icon: 'ghost_boss', description: Localization[Game.language]["monster_ghost_boss_desc"], scaleModifier: 2.8, isBoss: true },
    'Squid Boss': { name: Localization[Game.language]["monster_squid_boss_name"], icon: 'squid_boss', description: Localization[Game.language]["monster_squid_boss_desc"], scaleModifier: 3.5, isBoss: true },
    'Lizard Boss': { name: Localization[Game.language]["monster_lizard_boss_name"], icon: 'lizard_boss', description: Localization[Game.language]["monster_lizard_boss_desc"], transform: { name: Localization[Game.language]["monster_dragon_name"], icon: 'dragon_boss', hpRatio: 1.0, atkRatio: 1.5 }, scaleModifier: 3.0, isBoss: true },
    'Master Thief': { name: 'Master Thief', icon: 'master_thief', description: 'Steals a valuable item on reveal.', special: 'steals_durable', scaleModifier: 2.0, isBoss: true },
};

const createMonster = (scene, key, player) => {
    if (!MonsterData[key]) {
        console.error(`Monster with key ${key} not found!`);
        return null;
    }
    return new Monster(scene, MonsterData[key], player, key);
};

const createSummonedSkeleton = (scene, player) => {
    // Create a custom skeleton with specific stats
    const skeletonConfig = {
        name: 'Summoned Skeleton',
        icon: 'skeleton',
        description: 'A weak skeleton summoned by necromancer.',
        scaleModifier: 1.0
    };
    
    const skeleton = new Monster(scene, skeletonConfig, player);
    
    // Override the dynamic scaling with specific stats
    const skeletonBaseHp = getMonsterHpBase(player.floor) * 0.4;
    skeleton.maxHp = Math.max(5, Math.round(skeletonBaseHp));
    skeleton.hp = skeleton.maxHp;
    const targetHits = getTargetHitsForFloor(player.floor);
    const desiredAttack = player.getBaseMaxHp() > 0 ? player.getBaseMaxHp() / targetHits : 1;
    skeleton.attack = Math.max(1, Math.round(desiredAttack * 0.4));
    
    return skeleton;
};
