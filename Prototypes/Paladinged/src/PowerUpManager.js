import Projectile from './Projectile.js';
import { UpgradesData } from './UpgradesData.js';

export default class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.activePowerUps = {
            fireball: { active: false, timer: 0, duration: 3000, lastSpawnTime: 0 },
            iceShield: { active: false, applied: false },
            goldTouch: { active: false, timer: 0, duration: 4000 }
        };
        this.projectiles = [];
        this.progressBar = null;
        this.progressBarBg = null;
        this.progressBarFill = null;
        this.fireballCooldown = 500; // Cooldown in milliseconds
        this.updateSpellDurations();
    }
    
    updateSpellDurations() {
        // Get the current spell levels and update durations
        if (this.scene.upgradesManager) {
            const fireLevel = this.scene.upgradesManager.getSpellLevel('spell1');
            const goldLevel = this.scene.upgradesManager.getSpellLevel('spell3');
            
            if (fireLevel >= 0) {
                const fireData = UpgradesData.getSpellData('spell1', fireLevel);
                if (fireData) this.activePowerUps.fireball.duration = fireData.duration;
            }
            
            if (goldLevel >= 0) {
                const goldData = UpgradesData.getSpellData('spell3', goldLevel);
                if (goldData) this.activePowerUps.goldTouch.duration = goldData.duration;
            }
        }
    }
    
    activatePowerUp(type) {
        switch(type) {
            case 'spell1': // Fireball
                this.activateFireball();
                break;
            case 'spell2': // Ice Shield
                this.activateIceShield();
                break;
            case 'spell3': // Gold Touch
                this.activateGoldTouch();
                break;
        }
    }
    
    activateFireball() {
        this.updateSpellDurations(); // Update durations before activating
        this.activePowerUps.fireball.active = true;
        this.activePowerUps.fireball.timer = this.activePowerUps.fireball.duration;
        this.createProgressBar(0xFF4500, 'fireball'); // Orange color for fire
    }
    
    activateIceShield() {
        if (this.activePowerUps.iceShield.applied) return; // Already applied this level
        
        this.activePowerUps.iceShield.active = true;
        this.activePowerUps.iceShield.applied = true;
        
        // Get the current ice shield level and apply appropriate hearts
        let bonusHearts = 1; // Default
        if (this.scene.upgradesManager) {
            const iceLevel = this.scene.upgradesManager.getSpellLevel('spell2');
            if (iceLevel >= 0) {
                const iceData = UpgradesData.getSpellData('spell2', iceLevel);
                if (iceData) bonusHearts = iceData.bonusHearts;
            }
        }
        
        if (this.scene.player) {
            // Track ice shield bonus separately
            if (!this.scene.player.iceShieldBonus) {
                this.scene.player.iceShieldBonus = 0;
            }
            this.scene.player.iceShieldBonus = bonusHearts;
            
            // First heal the player to their normal max HP
            const baseMax = this.scene.player.maxHp;
            if (this.scene.player.hp < baseMax) {
                this.scene.player.hp = baseMax;
            }
            
            // Then add the bonus hearts
            this.scene.player.maxHp += bonusHearts;
            this.scene.player.hp += bonusHearts;
            
            // Update UI to show blue hearts
            if (this.scene.uiManager) {
                this.scene.uiManager.updateHealth(this.scene.player.hp, this.scene.player.maxHp, bonusHearts);
            }
        }
    }
    
    activateGoldTouch() {
        this.updateSpellDurations(); // Update durations before activating
        this.activePowerUps.goldTouch.active = true;
        this.activePowerUps.goldTouch.timer = this.activePowerUps.goldTouch.duration;
        this.createProgressBar(0xFFD700, 'goldTouch'); // Gold color
    }
    
    createProgressBar(color, type) {
        this.clearProgressBar();
        
        const barX = this.scene.game.config.width - 30;
        const barY = this.scene.game.config.height / 2;
        const barHeight = 200;
        const barWidth = 20;
        
        // Background
        this.progressBarBg = this.scene.add.rectangle(
            barX, barY, barWidth, barHeight, 0x333333
        );
        this.progressBarBg.setStrokeStyle(2, 0xffffff);
        
        // Fill
        this.progressBarFill = this.scene.add.rectangle(
            barX, barY, barWidth - 4, barHeight - 4, color
        );
        
        // Store type for update
        this.progressBarType = type;
    }
    
    clearProgressBar() {
        if (this.progressBarBg) {
            this.progressBarBg.destroy();
            this.progressBarBg = null;
        }
        if (this.progressBarFill) {
            this.progressBarFill.destroy();
            this.progressBarFill = null;
        }
        this.progressBarType = null;
    }
    
    update(delta) {
        // Update fireball timer
        if (this.activePowerUps.fireball.active) {
            this.activePowerUps.fireball.timer -= delta;
            if (this.activePowerUps.fireball.timer <= 0) {
                this.activePowerUps.fireball.active = false;
                this.activePowerUps.fireball.timer = 0;
                if (this.progressBarType === 'fireball') {
                    this.clearProgressBar();
                }
            }
        }
        
        // Update gold touch timer
        if (this.activePowerUps.goldTouch.active) {
            this.activePowerUps.goldTouch.timer -= delta;
            if (this.activePowerUps.goldTouch.timer <= 0) {
                this.activePowerUps.goldTouch.active = false;
                this.activePowerUps.goldTouch.timer = 0;
                if (this.progressBarType === 'goldTouch') {
                    this.clearProgressBar();
                }
            }
        }
        
        // Update progress bar
        if (this.progressBarFill && this.progressBarType) {
            let progress = 0;
            if (this.progressBarType === 'fireball') {
                progress = this.activePowerUps.fireball.timer / this.activePowerUps.fireball.duration;
            } else if (this.progressBarType === 'goldTouch') {
                progress = this.activePowerUps.goldTouch.timer / this.activePowerUps.goldTouch.duration;
            }
            
            const barHeight = 196; // Slightly less than background
            this.progressBarFill.setSize(16, barHeight * progress);
            const barY = this.scene.game.config.height / 2;
            this.progressBarFill.y = barY + (barHeight * (1 - progress)) / 2;
        }
        
        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(delta);
            
            // Check collision with monsters
            this.scene.monsters.forEach(monster => {
                if (monster && !monster.isDead && projectile.checkCollisionWithCircle(monster)) {
                    this.burnMonster(monster);
                }
            });
            
            // Check collision with obstacles
            this.scene.obstacles.forEach(obstacle => {
                if (obstacle && !obstacle.destroyed && projectile.checkCollisionWithCircle(obstacle)) {
                    obstacle.destroy();
                    this.scene.levelGold += obstacle.goldValue;
                    this.scene.uiManager.updateGold(this.scene.totalGold + this.scene.levelGold);
                }
            });
            
            return projectile.active;
        });
    }
    
    onHammerSwing() {
        // Spawn fireball projectile when hammer is halfway through swing
        if (this.activePowerUps.fireball.active) {
            const currentTime = this.scene.time.now;
            const timeSinceLastSpawn = currentTime - this.activePowerUps.fireball.lastSpawnTime;
            
            // Only spawn if enough time has passed (300ms is the swing duration)
            if (timeSinceLastSpawn >= 300) {
                this.activePowerUps.fireball.lastSpawnTime = currentTime;
                this.scene.time.delayedCall(150, () => { // Half of 300ms swing duration
                    const projectile = new Projectile(
                        this.scene,
                        this.scene.player.x,
                        this.scene.player.y - 50
                    );
                    this.projectiles.push(projectile);
                });
            }
        }
    }
    
    burnMonster(monster) {
        if (monster.isDead) return;
        
        monster.isDead = true;
        
        // Award gold if gold touch is active
        if (this.activePowerUps.goldTouch.active) {
            const goldValue = this.scene.levelManager.levelConfig.rewards?.obstacleDestroy || 5;
            this.scene.levelGold += goldValue;
            this.scene.uiManager.updateGold(this.scene.totalGold + this.scene.levelGold);
        }
        
        // Get the monster's circle for tinting
        const monsterCircle = monster.monsterCircle;
        
        // Burning animation
        this.scene.tweens.add({
            targets: monster,
            alpha: { from: 1, to: 0 },
            duration: 500,
            ease: 'Power2',
            onUpdate: () => {
                // Flash effect on the circle
                if (monsterCircle) {
                    monsterCircle.setFillStyle(Math.random() > 0.5 ? 0xff0000 : 0xffaa00);
                }
            },
            onComplete: () => {
                // Remove from monsters array
                const index = this.scene.monsters.indexOf(monster);
                if (index > -1) {
                    this.scene.monsters.splice(index, 1);
                }
                monster.destroy();
            }
        });
    }
    
    isGoldTouchActive() {
        return this.activePowerUps.goldTouch.active;
    }
    
    goldTouchKill(monster) {
        if (monster.isDead) return;
        
        monster.isDead = true;
        
        // Award gold for the kill
        const goldValue = this.scene.levelManager.levelConfig.rewards?.obstacleDestroy || 5;
        this.scene.levelGold += goldValue;
        this.scene.uiManager.updateGold(this.scene.totalGold + this.scene.levelGold);
        
        // Get the monster's circle for visual effect
        const monsterCircle = monster.monsterCircle;
        
        // Gold flash animation (similar to burning but with gold colors)
        this.scene.tweens.add({
            targets: monster,
            alpha: { from: 1, to: 0 },
            duration: 500,
            ease: 'Power2',
            onUpdate: () => {
                // Flash effect with gold colors
                if (monsterCircle) {
                    monsterCircle.setFillStyle(Math.random() > 0.5 ? 0xFFD700 : 0xFFA500);
                }
            },
            onComplete: () => {
                // Remove from monsters array
                const index = this.scene.monsters.indexOf(monster);
                if (index > -1) {
                    this.scene.monsters.splice(index, 1);
                }
                monster.destroy();
            }
        });
    }
    
    cleanup() {
        this.clearProgressBar();
        this.projectiles.forEach(p => p.destroy());
        this.projectiles = [];
    }
}