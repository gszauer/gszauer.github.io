import { LevelData } from './LevelData.js';
import ModalDialog from './ModalDialog.js';
import UpgradesManager from './UpgradesManager.js';
import { UpgradesData } from './UpgradesData.js';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.availableLevels = [];
        this.completedLevels = [];
        this.selectedLevel = null;
        this.currentTab = 'levels';
        this.levelsContainer = null;
        this.upgradesContainer = null;
        this.levelsTabButton = null;
        this.upgradesTabButton = null;
        this.totalGold = 0;
        this.modalDialog = null;
        this.upgradesManager = null;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.text(width / 2, 100, 'PALADINGED', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.modalDialog = new ModalDialog(this);
        this.upgradesManager = new UpgradesManager();
        
        this.loadPlayerProgress();
        this.loadTotalGold();
        this.createGoldDisplay();
        
        this.createTabs();
        
        this.levelsContainer = this.add.container(0, 0);
        this.upgradesContainer = this.add.container(0, 0);
        
        this.createLevelContent();
        this.createUpgradesContent();
        
        this.showTab('levels');
        
        // Add help button for testing modal
        this.createHelpButton();
    }
    
    createHelpButton() {
        const helpButton = this.add.text(
            this.cameras.main.width - 40,
            40,
            '?',
            {
                fontSize: '32px',
                fill: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 10, y: 5 }
            }
        );
        helpButton.setOrigin(0.5);
        helpButton.setInteractive({ useHandCursor: true });
        
        helpButton.on('pointerover', () => {
            helpButton.setBackgroundColor('#66BB6A');
        });
        
        helpButton.on('pointerout', () => {
            helpButton.setBackgroundColor('#4CAF50');
        });
        
        helpButton.on('pointerdown', () => {
            this.modalDialog.createModal({
                title: 'How to Play',
                text: 'Select a level to begin your adventure!\n\nSwing your hammer to defeat monsters and break obstacles.\n\nCollect gold and complete levels to unlock new challenges.',
                showCloseButton: true,
                showOkButton: true,
                okButtonText: 'Reset All Data',
                onOk: () => {
                    this.showResetConfirmation();
                }
            });
        });
    }
    
    createTabs() {
        const width = this.cameras.main.width;
        const tabWidth = 200;
        const tabHeight = 50;
        const tabY = 180;
        const tabSpacing = 10;
        
        const levelsX = width / 2 - tabWidth / 2 - tabSpacing / 2;
        const upgradesX = width / 2 + tabWidth / 2 + tabSpacing / 2;
        
        this.levelsTabButton = this.add.graphics();
        this.levelsTabButton.fillStyle(0x4CAF50, 1);
        this.levelsTabButton.fillRoundedRect(levelsX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight, 10);
        
        const levelsTabArea = new Phaser.Geom.Rectangle(levelsX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight);
        this.levelsTabButton.setInteractive(levelsTabArea, Phaser.Geom.Rectangle.Contains);
        
        this.add.text(levelsX, tabY, 'Levels', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.upgradesTabButton = this.add.graphics();
        this.upgradesTabButton.fillStyle(0x666666, 1);
        this.upgradesTabButton.fillRoundedRect(upgradesX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight, 10);
        
        const upgradesTabArea = new Phaser.Geom.Rectangle(upgradesX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight);
        this.upgradesTabButton.setInteractive(upgradesTabArea, Phaser.Geom.Rectangle.Contains);
        
        this.add.text(upgradesX, tabY, 'Upgrades', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.levelsTabButton.on('pointerdown', () => {
            this.showTab('levels');
        });
        
        this.upgradesTabButton.on('pointerdown', () => {
            this.showTab('upgrades');
        });
    }
    
    showTab(tab) {
        const width = this.cameras.main.width;
        const tabWidth = 200;
        const tabHeight = 50;
        const tabY = 180;
        const tabSpacing = 10;
        
        const levelsX = width / 2 - tabWidth / 2 - tabSpacing / 2;
        const upgradesX = width / 2 + tabWidth / 2 + tabSpacing / 2;
        
        if (tab === 'levels') {
            this.currentTab = 'levels';
            this.levelsContainer.setVisible(true);
            this.upgradesContainer.setVisible(false);
            
            this.levelsTabButton.clear();
            this.levelsTabButton.fillStyle(0x4CAF50, 1);
            this.levelsTabButton.fillRoundedRect(levelsX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight, 10);
            
            this.upgradesTabButton.clear();
            this.upgradesTabButton.fillStyle(0x666666, 1);
            this.upgradesTabButton.fillRoundedRect(upgradesX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight, 10);
        } else if (tab === 'upgrades') {
            this.currentTab = 'upgrades';
            this.levelsContainer.setVisible(false);
            this.upgradesContainer.setVisible(true);
            
            this.levelsTabButton.clear();
            this.levelsTabButton.fillStyle(0x666666, 1);
            this.levelsTabButton.fillRoundedRect(levelsX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight, 10);
            
            this.upgradesTabButton.clear();
            this.upgradesTabButton.fillStyle(0x4CAF50, 1);
            this.upgradesTabButton.fillRoundedRect(upgradesX - tabWidth / 2, tabY - tabHeight / 2, tabWidth, tabHeight, 10);
        }
    }
    
    createLevelContent() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const subtitle = this.add.text(width / 2, 250, 'Select a Level', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.levelsContainer.add(subtitle);
        
        this.createLevelButtons();
        
        const hint = this.add.text(width / 2, height - 50, 'Click or tap a level to start', {
            fontSize: '20px',
            fill: '#888888'
        }).setOrigin(0.5);
        this.levelsContainer.add(hint);
    }
    
    createUpgradesContent() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Clear existing content
        this.upgradesContainer.removeAll(true);
        
        const title = this.add.text(width / 2, 250, 'Upgrades', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.upgradesContainer.add(title);
        
        // Create scrollable area for upgrades
        const startY = 320;
        let currentY = startY;
        
        // Hammer upgrades section
        this.createHammerSection(currentY);
        currentY += 180;
        
        // Armor upgrades section
        this.createArmorSection(currentY);
        currentY += 180;
        
        // Magic spells section
        this.createMagicSection(currentY);
    }
    
    createHammerSection(startY) {
        const width = this.cameras.main.width;
        const sectionX = 60;
        
        // Section title
        const hammerTitle = this.add.text(sectionX, startY, '⚒️ Hammer', {
            fontSize: '24px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        this.upgradesContainer.add(hammerTitle);
        
        // Current level display
        const currentLevel = this.upgradesManager.getHammerLevel();
        const currentUpgrade = UpgradesData.hammer.levels[currentLevel];
        
        const levelText = this.add.text(sectionX, startY + 35, 
            `Current: ${currentUpgrade.name} (Level ${currentLevel})`, {
            fontSize: '18px',
            fill: '#ffffff'
        });
        this.upgradesContainer.add(levelText);
        
        // Next upgrade button
        const nextUpgrade = this.upgradesManager.getNextHammerUpgrade();
        if (nextUpgrade) {
            this.createUpgradeButton(
                width - 200, 
                startY + 20,
                nextUpgrade,
                'hammer',
                nextUpgrade.level
            );
        } else {
            const maxText = this.add.text(width - 200, startY + 35, 'MAX LEVEL', {
                fontSize: '20px',
                fill: '#00ff00',
                fontStyle: 'bold'
            });
            maxText.setOrigin(0.5);
            this.upgradesContainer.add(maxText);
        }
        
        // Description
        if (nextUpgrade) {
            const descText = this.add.text(sectionX, startY + 65, 
                `Next: ${nextUpgrade.description}`, {
                fontSize: '16px',
                fill: '#aaaaaa',
                wordWrap: { width: width - 300 }
            });
            this.upgradesContainer.add(descText);
        }
    }
    
    createArmorSection(startY) {
        const width = this.cameras.main.width;
        const sectionX = 60;
        
        // Section title
        const armorTitle = this.add.text(sectionX, startY, '🛡️ Armor', {
            fontSize: '24px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        this.upgradesContainer.add(armorTitle);
        
        // Current level display
        const isUnlocked = this.upgradesManager.isArmorUnlocked();
        const currentLevel = this.upgradesManager.getArmorLevel();
        
        let statusText;
        if (!isUnlocked) {
            statusText = 'Current: Not Unlocked';
        } else {
            const currentArmor = UpgradesData.armor.levels[currentLevel - 1];
            statusText = `Current: ${currentArmor.name} (Level ${currentLevel})`;
        }
        
        const levelText = this.add.text(sectionX, startY + 35, statusText, {
            fontSize: '18px',
            fill: '#ffffff'
        });
        this.upgradesContainer.add(levelText);
        
        // Next upgrade button
        const nextUpgrade = this.upgradesManager.getNextArmorUpgrade();
        if (nextUpgrade) {
            this.createUpgradeButton(
                width - 200, 
                startY + 20,
                nextUpgrade,
                'armor',
                isUnlocked ? currentLevel + 1 : 1
            );
        } else if (isUnlocked) {
            const maxText = this.add.text(width - 200, startY + 35, 'MAX LEVEL', {
                fontSize: '20px',
                fill: '#00ff00',
                fontStyle: 'bold'
            });
            maxText.setOrigin(0.5);
            this.upgradesContainer.add(maxText);
        }
        
        // Description
        if (nextUpgrade) {
            const actionText = !isUnlocked ? 'Unlock: ' : 'Next: ';
            const descText = this.add.text(sectionX, startY + 65, 
                `${actionText}${nextUpgrade.description}`, {
                fontSize: '16px',
                fill: '#aaaaaa',
                wordWrap: { width: width - 300 }
            });
            this.upgradesContainer.add(descText);
        }
    }
    
    createMagicSection(startY) {
        const width = this.cameras.main.width;
        const sectionX = 60;
        
        // Section title
        const magicTitle = this.add.text(sectionX, startY, '✨ Magic Spells', {
            fontSize: '24px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        this.upgradesContainer.add(magicTitle);
        
        // Display each spell
        let spellY = startY + 40;
        UpgradesData.magic.spells.forEach((spell, index) => {
            const currentLevel = this.upgradesManager.getSpellLevel(spell.id);
            const isOwned = currentLevel >= 0;
            const nextLevel = currentLevel + 1;
            const hasNextLevel = nextLevel < spell.levels.length;
            
            // Spell name and level
            let spellNameText = spell.name;
            if (isOwned) {
                const levelData = spell.levels[currentLevel];
                spellNameText = `${spell.name} - ${levelData.name}`;
            }
            
            const spellText = this.add.text(sectionX, spellY, 
                spellNameText, {
                fontSize: '18px',
                fill: isOwned ? '#00ff00' : '#ffffff'
            });
            this.upgradesContainer.add(spellText);
            
            // Spell description
            let descriptionText = spell.description;
            if (isOwned) {
                const levelData = spell.levels[currentLevel];
                descriptionText = levelData.description;
            } else if (hasNextLevel) {
                const nextLevelData = spell.levels[nextLevel];
                descriptionText = nextLevelData.description;
            }
            
            const descText = this.add.text(sectionX + 20, spellY + 25, 
                descriptionText, {
                fontSize: '14px',
                fill: '#888888'
            });
            this.upgradesContainer.add(descText);
            
            // Upgrade/Purchase button if there's a next level
            if (hasNextLevel) {
                this.createSpellButton(
                    width - 200,
                    spellY + 10,
                    spell,
                    nextLevel
                );
            } else if (isOwned) {
                // Max level reached
                const maxText = this.add.text(width - 200, spellY + 20, 
                    'MAX LEVEL', {
                    fontSize: '16px',
                    fill: '#FFD700',
                    fontStyle: 'bold'
                });
                maxText.setOrigin(0.5);
                this.upgradesContainer.add(maxText);
            }
            
            spellY += 60;
        });
    }
    
    createUpgradeButton(x, y, upgrade, category, level) {
        const cost = category === 'hammer' ? 
            UpgradesData.getUpgradePrice('hammer', level) :
            UpgradesData.getUpgradePrice('armor', level);
        
        const canAfford = this.totalGold >= cost;
        const buttonColor = canAfford ? 0x4CAF50 : 0x666666;
        const textColor = canAfford ? '#ffffff' : '#999999';
        
        const button = this.add.graphics();
        button.fillStyle(buttonColor, 1);
        button.fillRoundedRect(x - 80, y, 160, 50, 5);
        
        const buttonText = this.add.text(x, y + 15, `Buy: ${cost} gold`, {
            fontSize: '18px',
            fill: textColor,
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        
        if (canAfford) {
            const hitArea = new Phaser.Geom.Rectangle(x - 80, y, 160, 50);
            button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            
            button.on('pointerover', () => {
                button.clear();
                button.fillStyle(0x66BB6A, 1);
                button.fillRoundedRect(x - 80, y, 160, 50, 5);
                this.input.setDefaultCursor('pointer');
            });
            
            button.on('pointerout', () => {
                button.clear();
                button.fillStyle(buttonColor, 1);
                button.fillRoundedRect(x - 80, y, 160, 50, 5);
                this.input.setDefaultCursor('default');
            });
            
            button.on('pointerdown', () => {
                this.purchaseUpgrade(category, level);
            });
        }
        
        this.upgradesContainer.add(button);
        this.upgradesContainer.add(buttonText);
    }
    
    createSpellButton(x, y, spell, level) {
        const levelData = spell.levels[level];
        const cost = levelData.cost;
        const canAfford = this.totalGold >= cost;
        const buttonColor = canAfford ? 0x9C27B0 : 0x666666;
        const textColor = canAfford ? '#ffffff' : '#999999';
        
        const button = this.add.graphics();
        button.fillStyle(buttonColor, 1);
        button.fillRoundedRect(x - 80, y, 160, 40, 5);
        
        const buttonLabel = level === 0 ? 'Buy' : 'Upgrade';
        const buttonText = this.add.text(x, y + 20, `${buttonLabel}: ${cost} gold`, {
            fontSize: '16px',
            fill: textColor,
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        
        if (canAfford) {
            const hitArea = new Phaser.Geom.Rectangle(x - 80, y, 160, 40);
            button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            
            button.on('pointerover', () => {
                button.clear();
                button.fillStyle(0xAB47BC, 1);
                button.fillRoundedRect(x - 80, y, 160, 40, 5);
                this.input.setDefaultCursor('pointer');
            });
            
            button.on('pointerout', () => {
                button.clear();
                button.fillStyle(buttonColor, 1);
                button.fillRoundedRect(x - 80, y, 160, 40, 5);
                this.input.setDefaultCursor('default');
            });
            
            button.on('pointerdown', () => {
                this.purchaseSpell(spell.id);
            });
        }
        
        this.upgradesContainer.add(button);
        this.upgradesContainer.add(buttonText);
    }
    
    purchaseUpgrade(category, level) {
        let result;
        if (category === 'hammer') {
            result = this.upgradesManager.purchaseHammerUpgrade(this.totalGold);
        } else if (category === 'armor') {
            result = this.upgradesManager.purchaseArmorUpgrade(this.totalGold);
        }
        
        if (result.success) {
            this.totalGold -= result.cost;
            this.saveTotalGold(this.totalGold);
            this.goldDisplay.setText(`Gold: ${this.totalGold}`);
            
            // Refresh the upgrades display immediately
            this.createUpgradesContent();
        }
    }
    
    purchaseSpell(spellId) {
        const result = this.upgradesManager.purchaseSpell(spellId, this.totalGold);
        
        if (result.success) {
            this.totalGold -= result.cost;
            this.saveTotalGold(this.totalGold);
            this.goldDisplay.setText(`Gold: ${this.totalGold}`);
            
            // Refresh the upgrades display immediately
            this.createUpgradesContent();
        }
    }
    
    createLevelButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const levelCount = LevelData.getLevelCount();
        const buttonsPerRow = 3;
        const buttonSize = 120;
        const buttonSpacing = 150;
        const startY = 350;
        
        for (let i = 0; i < levelCount; i++) {
            const level = LevelData.getLevel(i + 1);
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;
            
            const totalWidth = (buttonsPerRow - 1) * buttonSpacing;
            const startX = (width - totalWidth) / 2;
            
            const x = startX + col * buttonSpacing;
            const y = startY + row * buttonSpacing;
            
            const isUnlocked = i === 0 || this.completedLevels.includes(i);
            
            this.createLevelButton(x, y, level, isUnlocked);
        }
    }
    
    createLevelButton(x, y, level, isUnlocked) {
        const buttonColor = isUnlocked ? 0x4CAF50 : 0x666666;
        const textColor = isUnlocked ? '#ffffff' : '#333333';
        
        const button = this.add.graphics();
        button.fillStyle(buttonColor, 1);
        button.fillRoundedRect(x - 60, y - 60, 120, 120, 10);
        this.levelsContainer.add(button);
        
        const levelNumber = this.add.text(x, y - 10, level.id.toString(), {
            fontSize: '48px',
            fill: textColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.levelsContainer.add(levelNumber);
        
        const levelName = this.add.text(x, y + 30, level.name, {
            fontSize: '14px',
            fill: textColor
        }).setOrigin(0.5);
        this.levelsContainer.add(levelName);
        
        if (this.completedLevels.includes(level.id - 1)) {
            const star = this.add.text(x + 40, y - 40, '⭐', {
                fontSize: '24px'
            }).setOrigin(0.5);
            this.levelsContainer.add(star);
        }
        
        if (isUnlocked) {
            const hitArea = new Phaser.Geom.Rectangle(x - 60, y - 60, 120, 120);
            button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            
            button.on('pointerover', () => {
                button.clear();
                button.fillStyle(0x66BB6A, 1);
                button.fillRoundedRect(x - 60, y - 60, 120, 120, 10);
            });
            
            button.on('pointerout', () => {
                button.clear();
                button.fillStyle(buttonColor, 1);
                button.fillRoundedRect(x - 60, y - 60, 120, 120, 10);
            });
            
            button.on('pointerdown', () => {
                this.selectLevel(level.id);
            });
        }
    }
    
    selectLevel(levelNumber) {
        this.selectedLevel = levelNumber;
        this.scene.start('GameplayScene', { 
            levelId: levelNumber,
            upgradesManager: this.upgradesManager 
        });
    }
    
    loadPlayerProgress() {
        const savedProgress = localStorage.getItem('paladinged_progress');
        if (savedProgress) {
            this.completedLevels = JSON.parse(savedProgress);
        } else {
            this.completedLevels = [];
        }
    }
    
    loadTotalGold() {
        const savedGold = localStorage.getItem('paladinged_gold');
        this.totalGold = savedGold ? parseInt(savedGold) : 0;
    }
    
    saveTotalGold(gold) {
        localStorage.setItem('paladinged_gold', gold.toString());
    }
    
    createGoldDisplay() {
        this.goldDisplay = this.add.text(20, 20, `Gold: ${this.totalGold}`, {
            fontSize: '28px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
    }
    
    showResetConfirmation() {
        this.modalDialog.createModal({
            title: 'Confirm Reset',
            text: '⚠️ WARNING ⚠️\n\nThis will permanently delete ALL game data:\n• Level progress\n• Gold collected\n• All upgrades\n\nAre you sure you want to reset everything?',
            showOkButton: true,
            showCancelButton: true,
            okButtonText: 'Yes, Reset',
            cancelButtonText: 'Cancel',
            centerButtons: true,
            backgroundColor: 0xffeeee,
            onOk: () => {
                this.resetAllGameData();
            },
            onCancel: () => {
                // Do nothing, just close the modal
            }
        });
    }
    
    resetAllGameData() {
        // Clear all localStorage data
        localStorage.removeItem('paladinged_progress');
        localStorage.removeItem('paladinged_gold');
        localStorage.removeItem('paladinged_upgrades');
        
        // Reset current session data
        this.completedLevels = [];
        this.totalGold = 0;
        this.upgradesManager.resetUpgrades();
        
        // Update gold display
        this.goldDisplay.setText('Gold: 0');
        
        // Refresh the current tab content
        if (this.currentTab === 'upgrades') {
            this.createUpgradesContent();
        } else {
            this.createLevelContent();
        }
    }
}