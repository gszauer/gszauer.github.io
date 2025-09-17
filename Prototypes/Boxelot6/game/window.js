class BasePanel extends Phaser.GameObjects.Container {
    constructor(scene, width, height, title) {
        super(scene, 0, 0);
        this.width = width;
        this.height = height;
        this.scene = scene;

        // Blocker - covers the entire game area
        this.blocker = scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } })
            .setInteractive()
            .on('pointerdown', () => {}); // Prevent clicking through

        // Title
        this.titleText = scene.add.text(-width / 2 + 20, -height / 2 + 20, title, { fontSize: '24px', fill: '#af9371', fontStyle: 'bold' });


        const panelWidth = this.width;
        const spriteWidth = 826;
        const scale = panelWidth / spriteWidth;

        // Close Button - sprite-based with hover states
        this.closeButton = scene.add.sprite(width / 2, -height / 2, 'atlas_01', 'popup_x.png')
            .setScale(scale)
            .setOrigin(1, 0) // Top-right alignment
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.closeButton.setTexture('atlas_01', 'popup_x_hover.png');
                this.closeButton.setOrigin(1, 0) // Top-right alignment
            })
            .on('pointerout', () => {
                this.closeButton.setTexture('atlas_01', 'popup_x.png');
                this.closeButton.setOrigin(1, 0) // Top-right alignment
            })
            .on('pointerdown', () => this.close());
        
        this.closeButton.setTexture('atlas_01', 'popup_x.png');
        this.closeButton.setOrigin(1, 0) // Top-right alignment
            
        this.add([this.blocker, this.titleText, this.closeButton]);
        
        // Add panel to the game container instead of directly to scene
        if (scene.mainContainer) {
            scene.mainContainer.add(this);
        } else {
            scene.add.existing(this);
        }
        
        this.setDepth(100);
        this.setVisible(false);
    }
    
    open() {
        this.setVisible(true);
        this.handleResize(); // Call the new resize handler
        
        // Bring panel to front within the game container
        if (this.scene.mainContainer) {
            this.scene.mainContainer.bringToTop(this);
        }
    }

    handleResize() {
        if (!this.visible) {
            return;
        }
        const mainContainer = this.scene.mainContainer;
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        // Center the panel on the screen, calculating position relative to the scaled and positioned mainContainer
        if (mainContainer && mainContainer.scale !== 0) {
            this.x = (screenWidth / 2 - mainContainer.x) / mainContainer.scale;
            this.y = (screenHeight / 2 - mainContainer.y) / mainContainer.scale;
        }
        
        // Position and scale the blocker to cover the entire screen
        if (mainContainer && mainContainer.scale !== 0) {
            const blockerX = (0 - mainContainer.x) / mainContainer.scale - this.x;
            const blockerY = (0 - mainContainer.y) / mainContainer.scale - this.y;
            const blockerWidth = screenWidth / mainContainer.scale;
            const blockerHeight = screenHeight / mainContainer.scale;
            this.blocker.clear().fillStyle(0x000000, 0.5).fillRect(blockerX, blockerY, blockerWidth, blockerHeight);
        }
    }""

    close() {
        this.setVisible(false);
    }

    // Helper to play close sound
    playCloseSound() {
        if (!this.scene.isMuted) {
            const grindSounds = ['grind_1', 'grind_2', 'grind_3'];
            const randomSound = grindSounds[Math.floor(Math.random() * grindSounds.length)];
            this.scene.sound.playAudioSprite('soundbank', randomSound, {
                volume: this.scene.soundVolume
            });
        }
    }

    // Helper to create buttons
    createButton(x, y, text, callback, btnWidth = 200) {
        const button = this.scene.add.container(x, y);
        const btnHeight = 40;
        
        const bg = this.scene.add.graphics({ fillStyle: { color: Colors.TILE_HIDDEN }})
            .fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8)
            .setInteractive(new Phaser.Geom.Rectangle(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', callback)
            .on('pointerover', () => bg.clear().fillStyle(0x7a7a7a).fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8))
            .on('pointerout', () => bg.clear().fillStyle(Colors.TILE_HIDDEN).fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8));

        const txt = this.scene.add.text(0, 0, text, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        button.add([bg, txt]);
        this.add(button);
        return button;
    }
    
    // Helper to create sprite-based buttons with popup styling
    createSpriteButton(x, y, text, callback, fontSize = '20px') {
        // Create button container
        const button = this.scene.add.container(x, y);
        button.callback = callback;
        
        // Create button sprite background with hover states
        const buttonSprite = this.scene.add.sprite(0, 0, 'atlas_01', 'popup_btn.png')
            .setScale(0.5) // Scale down to fit nicely
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                buttonSprite.setTexture('atlas_01', 'popup_btn_hover.png');
            })
            .on('pointerout', () => {
                buttonSprite.setTexture('atlas_01', 'popup_btn.png');
            })
            .on('pointerdown', button.callback);
        
        // Create button text label
        const buttonText = this.scene.add.text(0, 0, text, { 
            fontSize: fontSize, 
            fill: '#af9371', 
            fontStyle: 'bold' ,
            align: 'center'
        }).setOrigin(0.5);
        
        // Add sprite and text to container
        button.add([buttonSprite, buttonText]);
        
        // Add button to panel
        this.add(button);

        button.buttonText = buttonText;
        button.buttonSprite = buttonSprite;
        
        return button;
    }
    
    // Helper to create small sprite-based buttons with popup styling
    createSmallSpriteButton(x, y, text, callback, fontSize = '20px') {
        // Create button container
        const button = this.scene.add.container(x, y);
        
        // Create button sprite background with hover states using small button sprites
        const buttonSprite = this.scene.add.sprite(0, 0, 'atlas_01', 'small_btn.png')
            .setScale(0.7) // Scale down to fit nicely
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                buttonSprite.setTexture('atlas_01', 'small_btn_hover.png');
            })
            .on('pointerout', () => {
                buttonSprite.setTexture('atlas_01', 'small_btn.png');
            })
            .on('pointerdown', callback);
        
        // Create button text label
        const buttonText = this.scene.add.text(0, 0, text, { 
            fontSize: fontSize, 
            fill: '#af9371', 
            fontStyle: 'bold' 
        }).setOrigin(0.5);
        
        // Add sprite and text to container
        button.add([buttonSprite, buttonText]);
        
        // Add button to panel
        this.add(button);

        button.buttonText = buttonText;
        button.buttonSprite = buttonSprite;
        
        return button;
    }
    
    // Base relocalize method - override in child classes
    relocalize() {
        // Update title if it's a localized key
        // Child classes should override this method to update their specific texts
    }
    
    // Helper to create tileable popup background
    createTileableBackground(useAltTop = false) {
        const panelWidth = this.width;
        const panelHeight = this.height;
        
        // Get popup sprite dimensions from atlas
        // popup_top.png: 826x174
        // popup_mid.png: 826x153  
        // popup_bottom.png: 826x196
        
        const topHeight = 174;
        const midHeight = 153;
        const bottomHeight = 196;
        const spriteWidth = 826;
        
        // Calculate scale to fit panel width
        const scale = panelWidth / spriteWidth;
        const scaledTopHeight = topHeight * scale;
        const scaledMidHeight = midHeight * scale;
        const scaledBottomHeight = bottomHeight * scale;
        
        // Calculate how many middle sections we need
        const availableMiddleSpace = panelHeight - scaledTopHeight - scaledBottomHeight;
        const middleSections = Math.max(1, Math.ceil(availableMiddleSpace / scaledMidHeight));
        
        // Top section
        this.popupTop = this.scene.add.sprite(0, -panelHeight/2 + scaledTopHeight/2, 'atlas_01', useAltTop? 'popup_top_alt.png' : 'popup_top.png');
        this.popupTop.setScale(scale);
        this.add(this.popupTop);
        
        // Middle section(s) - tile them vertically
        this.popupMidSprites = [];
        for (let i = 0; i < middleSections; i++) {
            const yPos = -panelHeight/2 + scaledTopHeight + (i * scaledMidHeight) + scaledMidHeight/2;
            const midSprite = this.scene.add.sprite(0, yPos, 'atlas_01', 'popup_mid.png');
            midSprite.setScale(scale);
            this.popupMidSprites.push(midSprite);
            this.add(midSprite);
        }
        
        // Bottom section
        this.popupBottom = this.scene.add.sprite(0, panelHeight/2 - scaledBottomHeight/2, 'atlas_01', 'popup_bottom.png');
        this.popupBottom.setScale(scale);
        this.add(this.popupBottom);
        
        // Bring close button to front so it renders on top of the new background
        this.bringToTop(this.closeButton);
        this.bringToTop(this.titleText);
    }
}

class ItemPanel extends BasePanel {
    constructor(scene) {
        super(scene, 400, 300, Localization[Game.language]["item_panel_title"]);
        this.item = null;

        // Create the new tileable background
        this.createTileableBackground();

        this.itemSprite = this.scene.add.sprite(0, -40, null);
        this.itemSprite.setVisible(false);
        this.itemDesc = this.scene.add.text(0, 25, '', { fontSize: '20px', fill: '#ddd', align: 'center', wordWrap: { width: 380 } }).setOrigin(0.5);

        // Create custom sprite-based buttons
        this.useButton = this.createSpriteButton(90, 110, Localization[Game.language]["use_button"], () => this.useItem());
        this.sellButton = this.createSpriteButton(-90, 110, Localization[Game.language]["sell_button"], () => this.sellItem());
        
        this.add([this.itemSprite, this.itemDesc]);
    }
    
    relocalize() {
        // Update panel title - if item is open, use its name, otherwise use default title
        if (this.item) {
            // Re-create the item to get fresh localized values
            const freshItem = createItem(this.item.key);
            if (freshItem) {
                // Update the title to show the localized item name
                this.titleText.setText(freshItem.name);
                
                // Update the description
                if (typeof freshItem.description === 'function') {
                    this.itemDesc.setText(freshItem.description(this.scene.player));
                } else {
                    this.itemDesc.setText(freshItem.description);
                }
            }
            
            // Update sell button with price
            const sellPrice = this.item.sellValue + this.scene.player.floor;
            this.sellButton.buttonText.setText(Localization[Game.language]["sell_price"].replace("{sell_price}", sellPrice));
        } else {
            this.titleText.setText(Localization[Game.language]["item_panel_title"]);
        }

        // Update button texts
        this.useButton.buttonText.setText(Localization[Game.language]["use_button"]);
        this.sellButton.buttonText.setText(Localization[Game.language]["sell_button"]);
    }

    open(item) {
        this.item = item;
        
        // Update title 
        this.titleText.setText(item.name);
        
        // Show sprite or icon
        if (item.sprite) {
            this.itemSprite.setVisible(true);
            this.itemSprite.setTexture('atlas_01', item.sprite);
            this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            this.itemSprite.setScale(0.6); // Scale to fit nicely
        } else {
            this.itemSprite.setVisible(false);
        }
        
        const sellPrice = item.sellValue + this.scene.player.floor;
        
        if (typeof item.description === 'function') {
            this.itemDesc.setText(item.description(this.scene.player));
        } else {
            this.itemDesc.setText(item.description);
        }

        if (item.type === 'durable') {
            this.useButton.setVisible(false);
            this.sellButton.setPosition(0, 110);
            //this.cancelButton.setVisible(false); // Change to just 'Close'
        } else {
            this.useButton.setVisible(true);
            this.sellButton.setPosition(-90, 110);
            this.useButton.setPosition(90, 110);
            //this.cancelButton.setVisible(true);
        }
        
        // Update sell button text
        this.sellButton.getAt(1).setText(Localization[Game.language]["sell_price"].replace("{sell_price}", sellPrice));

        super.open();
        this.relocalize();
    }

    useItem() {
        if (this.item && this.item.type === 'usable') {
            // Check if monster-affecting items have targets
            const monsterAffectingItems = ['Blade Scroll', 'Poison Vial', 'Freeze Scroll', 'Sheep Scroll'];
            if (monsterAffectingItems.includes(this.item.key)) {
                const visibleMonsters = this.scene.grid.filter(t => 
                    t.type === TileType.MONSTER && 
                    t.state === TileState.REVEALED && 
                    t.content.isAlive()
                );
                
                if (visibleMonsters.length === 0) {
                    this.scene.showGameMessage(Localization[Game.language]["no_visible_monsters"]);
                    return;
                }
            }
            
            // Check if healing items can be used
            if (this.item.key === 'Potion' && this.scene.player.hp >= this.scene.player.getMaxHp()) {
                this.scene.showGameMessage(Localization[Game.language]["health_full"]);
                return;
            }
            
            this.item.effect(this.scene);
            this.scene.player.removeItem(this.item);
            // Check for MATERIAL challenge completion
            this.scene.checkMaterialChallenge();
            this.close();
            this.scene.endTurn();
        }
    }

    sellItem() {
        if (this.item) {
            const sellPrice = this.item.sellValue + this.scene.player.floor;
            const player = this.scene.player;
            
            // Store old max HP before removing item
            const oldMaxHp = player.getMaxHp();
            
            // Remove the item first
            player.addGold(sellPrice);
            player.removeItem(this.item);
            
            // Play coin sound for sale
            if (!this.scene.isMuted) {
                const coinSounds = ['coins_1', 'coins_2'];
                const randomSound = coinSounds[Math.floor(Math.random() * coinSounds.length)];
                this.scene.sound.playAudioSprite('soundbank', randomSound, {
                    volume: this.scene.soundVolume
                });
            }
            
            // Handle HP adjustment for items that affect max HP
            if (this.item.key === 'Defense Rune' || this.item.key === 'Cursed Rune') {
                const newMaxHp = player.getMaxHp();
                // If current HP exceeds new max HP, adjust it down
                if (player.hp > newMaxHp) {
                    player.hp = newMaxHp;
                }
            }
            
            this.scene.showGameMessage(Localization[Game.language]["sold_item"].replace("{item_name}", this.item.name));
            this.scene.updatePlayerUI(); // Update UI to reflect stat changes
            this.close();
            // Selling does not consume a turn
        }
    }
}

class ShopPanel extends BasePanel {
    constructor(scene) {
        super(scene, 450, 470, Localization[Game.language]["shop_panel_title"]);
        this.costs = { hp: 10, atk: 10, heal: 5 };
        this.itemSlotCosts = { item1: 5, item2: 5 }; // Persistent item slot costs
        this.purchases = { hp: 0, atk: 0 };
        this.randomItems = [];
        this.itemsPurchased = { item1: false, item2: false };
        this.currentFloor = -1; // Track which floor's shop this is

        this.titleText.setFontSize(30);
        this.titleText.x += 5;
        this.titleText.y += 3;
        
        // Create the new tileable background
        this.createTileableBackground();
        
        this.createShopItems();
    }
    
    createShopItems() {
        const y_start = -120;
        const left = -190;
        const right = 130;
        const spacing = 60;

        const textSize = '22px';
        const textCol = '#fff';

        // Max HP
        this.hpText = this.scene.add.text(left, y_start, '', { fontSize: textSize, fill: textCol }).setOrigin(0, 0.5);
        this.hpButton = this.createSmallSpriteButton(right, y_start, '', () => this.buy('hp'));
        
        // Attack
        this.atkText = this.scene.add.text(left, y_start + spacing, '', { fontSize: textSize, fill: textCol }).setOrigin(0, 0.5);
        this.atkButton = this.createSmallSpriteButton(right, y_start + spacing, '', () => this.buy('atk'));

        // Full Heal
        this.healText = this.scene.add.text(left, y_start + spacing * 2, Localization[Game.language]["shop_full_heal_text"], { fontSize: textSize, fill: textCol }).setOrigin(0, 0.5);
        this.healButton = this.createSmallSpriteButton(right, y_start + spacing * 2, '', () => this.buy('heal'));
        
        // Random Item 1
        this.item1Container = this.scene.add.container(left, y_start + spacing * 3);
        this.item1Text = this.scene.add.text(20, 0, '', { fontSize: textSize, fill: textCol, padding: { x: 10, y: 10 } }).setOrigin(0, 0.5);
        this.item1Sprite = this.scene.add.sprite(20, 0, null);
        this.item1Sprite.setVisible(false);
        this.item1Container.add([this.item1Sprite, this.item1Text]);
        this.item1Button = this.createSmallSpriteButton(right, y_start + spacing * 3, '', () => this.buy('item1'));
        
        // Random Item 2
        this.item2Container = this.scene.add.container(left, y_start + spacing * 4);
        this.item2Text = this.scene.add.text(20, 0, '', { fontSize: textSize, fill: textCol, padding: { x: 10, y: 10 } }).setOrigin(0, 0.5);
        this.item2Sprite = this.scene.add.sprite(20, 0, null);
        this.item2Sprite.setVisible(false);
        this.item2Container.add([this.item2Sprite, this.item2Text]);
        this.item2Button = this.createSmallSpriteButton(right, y_start + spacing * 4, '', () => this.buy('item2'));
        
        this.add([this.hpText, this.atkText, this.healText, this.item1Container, this.item2Container]);
    }
    
    updatePrices() {
        const player = this.scene.player;
        const hpBonus = 1 + Math.floor(player.floor / 5) + Math.floor(this.purchases.hp / 2);
        const atkBonus = 1 + Math.floor(player.floor / 5) + Math.floor(this.purchases.atk / 2);
        
        this.hpText.setText(Localization[Game.language]["shop_hp_text"].replace("{hp_bonus}", hpBonus));
        this.atkText.setText(Localization[Game.language]["shop_atk_text"].replace("{atk_bonus}", atkBonus));
        
        this.hpButton.buttonText.setText(Localization[Game.language]["shop_item_price"].replace("{price}", this.costs.hp));
        this.atkButton.buttonText.setText(Localization[Game.language]["shop_item_price"].replace("{price}", this.costs.atk));
        this.healButton.buttonText.setText(Localization[Game.language]["shop_item_price"].replace("{price}", this.costs.heal));
        
        // Update random items
        if (this.randomItems[0]) {
            const item = this.randomItems[0];
            if (item.sprite) {
                this.item1Sprite.setVisible(true);
                this.item1Sprite.setTexture('atlas_01', item.sprite);
                this.item1Sprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                this.item1Sprite.setScale(0.3); // Scale down to fit
                this.item1Text.setText(` ${item.name}`);
                this.item1Text.setX(20); // Offset text to make room for sprite
            } else {
                this.item1Sprite.setVisible(false);
                this.item1Text.setText(`${item.icon} ${item.name}`);
                this.item1Text.setX(0);
            }
            this.item1Button.buttonText.setText(this.itemsPurchased.item1 ? Localization[Game.language]["shop_item_sold"] : Localization[Game.language]["shop_item_price"].replace("{price}", this.itemSlotCosts.item1));
        }
        
        if (this.randomItems[1]) {
            const item = this.randomItems[1];
            if (item.sprite) {
                this.item2Sprite.setVisible(true);
                this.item2Sprite.setTexture('atlas_01', item.sprite);
                this.item2Sprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                this.item2Sprite.setScale(0.3); // Scale down to fit
                this.item2Text.setText(` ${item.name}`);
                this.item2Text.setX(20); // Offset text to make room for sprite
            } else {
                this.item2Sprite.setVisible(false);
                this.item2Text.setText(`${item.icon} ${item.name}`);
                this.item2Text.setX(0);
            }
            this.item2Button.buttonText.setText(this.itemsPurchased.item2 ? Localization[Game.language]["shop_item_sold"] : Localization[Game.language]["shop_item_price"].replace("{price}", this.itemSlotCosts.item2));
        }
        
        // Only disable buttons for items that are already purchased
        this.item1Button.buttonSprite.input.enabled = !this.itemsPurchased.item1;
        this.item2Button.buttonSprite.input.enabled = !this.itemsPurchased.item2;
    }
    
    buy(stat) {
        const player = this.scene.player;
        const cost = (stat === 'item1' || stat === 'item2') ? this.itemSlotCosts[stat] : this.costs[stat];
        if (player.gold < cost) {
            this.scene.showGameMessage(Localization[Game.language]["shop_not_enough_gold"]);
            return;
        }
        
        // Check if full heal is needed
        if (stat === 'heal' && player.hp >= player.getMaxHp()) {
            this.scene.showGameMessage(Localization[Game.language]["window_health_is_full"]);
            return;
        }
        
        // Check if buying an item
        if (stat === 'item1' || stat === 'item2') {
            const itemIndex = stat === 'item1' ? 0 : 1;
            const item = this.randomItems[itemIndex];
            
            if (this.itemsPurchased[stat]) {
                this.scene.showGameMessage(Localization[Game.language]["shop_already_purchased"]);
                return;
            }
            
            if (player.inventory.length >= GameSettings.INVENTORY_SIZE - GameSettings.LOCKED_INVENTORY_SLOTS) {
                this.scene.showGameMessage(Localization[Game.language]["inventory_full"]);
                this.scene.flashInventoryFull();
                return;
            }
            
            player.gold -= this.itemSlotCosts[stat];
            player.addItem(item);
            this.itemsPurchased[stat] = true;
            this.itemSlotCosts[stat] += 2;
            this.scene.showGameMessage(Localization[Game.language]["shop_item_bought"].replace("{item_name}", item.name));
            
            // Play coin sound for purchase
            if (!this.scene.isMuted) {
                const coinSounds = ['coins_1', 'coins_2'];
                const randomSound = coinSounds[Math.floor(Math.random() * coinSounds.length)];
                this.scene.sound.playAudioSprite('soundbank', randomSound, {
                    volume: this.scene.soundVolume
                });
            }
        } else {
            player.gold -= this.costs[stat];
            
            // Play coin sound for purchase
            if (!this.scene.isMuted) {
                const coinSounds = ['coins_1', 'coins_2'];
                const randomSound = coinSounds[Math.floor(Math.random() * coinSounds.length)];
                this.scene.sound.playAudioSprite('soundbank', randomSound, {
                    volume: this.scene.soundVolume
                });
            }
            
            if(stat === 'hp') {
                const hpBonus = 1 + Math.floor(player.floor / 5) + Math.floor(this.purchases.hp / 2);
                player.maxHp += hpBonus;
                player.hp += hpBonus;
                this.costs.hp += 2;
                this.purchases.hp++;
            } else if (stat === 'atk') {
                const atkBonus = 1 + Math.floor(player.floor / 5) + Math.floor(this.purchases.atk / 2);
                player.attack += atkBonus;
                this.costs.atk += 2;
                this.purchases.atk++;
            } else if (stat === 'heal') {
                player.hp = player.getMaxHp();
                this.costs.heal += 1;
            }
        }
        
        // Reset all button hover states to prevent them from getting stuck
        this.hpButton.buttonSprite.setTexture('atlas_01', 'small_btn.png');
        this.atkButton.buttonSprite.setTexture('atlas_01', 'small_btn.png');
        this.healButton.buttonSprite.setTexture('atlas_01', 'small_btn.png');
        this.item1Button.buttonSprite.setTexture('atlas_01', 'small_btn.png');
        this.item2Button.buttonSprite.setTexture('atlas_01', 'small_btn.png');
        
        this.scene.updatePlayerUI();
        this.updatePrices();
    }
    
    open() {
        // Only generate new items if this is a new floor's shop
        if (this.currentFloor !== this.scene.player.floor) {
            this.currentFloor = this.scene.player.floor;
            
            // Generate two random items from the pool
            const itemPool = ['Blade Scroll', 'Potion', 'Poison Vial', 'Freeze Scroll', 'Sheep Scroll'];
            const shuffled = Phaser.Utils.Array.Shuffle([...itemPool]);
            
            this.randomItems = [
                createItem(shuffled[0]),
                createItem(shuffled[1])
            ];
            
            // Reset purchase status for items on new floor (but not costs)
            this.itemsPurchased = { item1: false, item2: false };
        }
        
        this.updatePrices();
        super.open();
    }
    
    relocalize() {
        // Update panel title
        this.titleText.setText(Localization[Game.language]["shop_panel_title"]);
        
        // Update static texts
        this.healText.setText(Localization[Game.language]["shop_full_heal_text"]);
        
        // Update dynamic texts and prices
        this.updatePrices();
    }
}

class GameOverPanel extends BasePanel {
    cost = 0;

     constructor(scene) {
        super(scene, 400, 250, Localization[Game.language]["game_over_panel_title"]);
        this.cost = 0;
        
        // Create the new tileable background
        this.createTileableBackground(true);
        
        this.scoreText = this.scene.add.text(0, -10, '', { 
            fontSize: '28px',
            fill: '#fff', 
            align: 'center',
            wordWrap: { width: 360 }
        }).setOrigin(0.5);

        
        // Create custom sprite-based buttons
        this.continueButton = this.createSpriteButton(-90, 85, Localization[Game.language]["game_over_continue_ad"], () => {
            if (this.cost === 0) {
                AdManager.instance.RewardBreak((success) => {
                    if (success) {
                        this.cost = 0;
                        this.continueGame();
                    }
                    else {
                        this.continueButton.buttonText.text = Localization[Game.language]["game_over_continue_gold"];
                        this.cost = 100;
                        this.scene.showGameMessage(Localization[Game.language]["game_over_ad_fail"]);
                    }
                });
            }
            else {
                this.cost = 100;
                this.continueGame();
            }
        });
        this.continueButton.buttonText.y -= 2;
        this.continueButton.buttonText.setAlign('center');
        this.replayButton = this.createSpriteButton(90, 85, Localization[Game.language]["game_over_restart_button"], 
            () => {
                AdManager.instance.GameplayStop();
                this.scene.restartGame();

            });
        
        this.add([this.scoreText]);
        this.closeButton.setVisible(false); // Cannot close this panel
     }
     
     open(floor) {
        this.cost = 0;
        this.continueButton.buttonText.text = Localization[Game.language]["game_over_continue_ad"];
        this.scoreText.setText(Localization[Game.language]["game_over_floor_reached"].replace("{floor}", floor));
        super.open();
     }
     
     continueGame() {
        const player = this.scene.player;
        if (player.gold < this.cost) {
            this.scene.showGameMessage(Localization[Game.language]["shop_not_enough_gold"]);
            return;
        }


        if (GameSettings.CLEAR_ENEMIES_ON_CONTINUE) {
            // Check for key holder and drop key, only kill visible enemies
            this.scene.grid.forEach(tile => {
                if (tile.type === TileType.MONSTER && tile.content && tile.content.isAlive()) {
                    // If this monster is a key holder, always drop the key (even if hidden)
                    if (tile.content.isKeyHolder) {
                        tile.setContent(TileType.ITEM, createItem('Key'));
                        tile.state = TileState.REVEALED;
                        tile.draw();
                    } else if (tile.state === TileState.REVEALED) {
                        // Only kill visible (revealed) monsters
                        tile.setContent(TileType.EMPTY);
                        tile.draw();
                    }
                    // Hidden monsters (not key holders) remain untouched
                }
            });
            
            // Show success message
                    this.scene.showGameMessage(Localization[Game.language]["challenge_completed"].replace("{challenge_type}", tile.content.type));
        } else {
            // Just check for key holder and drop key if needed
            this.scene.grid.forEach(tile => {
                if (tile.type === TileType.MONSTER && tile.content && tile.content.isAlive() && tile.content.isKeyHolder) {
                    tile.setContent(TileType.ITEM, createItem('Key'));
                    tile.state = TileState.REVEALED;
                    tile.draw();
                }
            });
            
            // Show success message
            this.scene.showGameMessage(Localization[Game.language]["game_over_health_restored"]);
            this.scene.playerAnimationState = 'idle';
            this.scene.updatePlayerMonsterFrame();
        }
        
        // Reset game over flags
        this.scene.turnInProgress = false;
        
        // Fully heal the player
        this.scene.player.hp = this.scene.player.getMaxHp();
        this.scene.updatePlayerUI();
        
        // Close the game over panel
        this.close();
        
        // Update tile accessibility since monsters are gone
        this.scene.updateTileAccessibility();
        
        // Resume gameplay tracking (Don't track, this is the same session if the player does not see the menu)
        //AdManager.instance.GameplayStart();
     }
     
     relocalize() {
        // Update panel title
        this.titleText.setText(Localization[Game.language]["game_over_panel_title"]);
        
        // Update button texts
        this.continueButton.buttonText.setText(this.cost === 0 ? 
            Localization[Game.language]["game_over_continue_ad"] : 
            Localization[Game.language]["game_over_continue_gold"]);
        this.replayButton.buttonText.setText(Localization[Game.language]["game_over_restart_button"]);
        
        // Update score text if panel is open
        if (this.visible) {
            const floor = this.scene.player.floor;
            this.scoreText.setText(Localization[Game.language]["game_over_floor_reached"].replace("{floor}", floor));
        }
     }
}

class DebugPanel extends BasePanel {
    constructor(scene) {
        const wndHeight = 500; // Increased height to accommodate new button
        const wndWidth = 500;
        const wndTop = wndHeight * -0.5;
        super(scene, wndWidth, wndHeight, Localization[Game.language]["debug_menu_title"]);
        
        // Create the new tileable background
        this.createTileableBackground();
        
        let placementCursor = wndTop;
        placementCursor += 120;

        const wndLeft = -120;
        const wndRight = 120;

        // Debug options
        this.addGoldButton = this.createButton(wndLeft, placementCursor, 'Add 100 Gold', () => {
            this.scene.player.addGold(100);
            this.scene.updatePlayerUI();
            this.scene.showGameMessage(Localization[Game.language]["debug_add_gold"]);
            // Bring debug panel back to front
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });
        
        this.healButton = this.createButton(wndRight, placementCursor, 'Full Heal', () => {
            this.scene.player.hp = this.scene.player.getMaxHp();
            this.scene.updatePlayerUI();
            this.scene.showGameMessage(Localization[Game.language]["debug_fully_healed"]);
            // Bring debug panel back to front
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });

        placementCursor += 60;

        this.revealAllButton = this.createButton(wndLeft, placementCursor, 'Reveal All Tiles', () => {
            this.scene.grid.forEach(tile => {
                if (tile.state !== TileState.REVEALED) {
                    tile.state = TileState.REVEALED;
                    tile.draw();
                }
            });
            this.scene.showGameMessage('All tiles revealed!');
            // Bring debug panel back to front
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });
        
        this.skipFloorButton = this.createButton(wndRight, placementCursor, 'Skip to Next Floor', () => {
            this.scene.advanceFloor();
            // Bring debug panel back to front after floor generation
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });

        placementCursor += 60;
        
        this.godModeButton = this.createButton(wndLeft, placementCursor, 'Toggle God Mode', () => {
            this.scene.player.godMode = !this.scene.player.godMode;
            const status = this.scene.player.godMode ? 'ON' : 'OFF';
            this.scene.showGameMessage(`God Mode: ${status}`);
            this.updateGodModeButton();
            // Bring debug panel back to front
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });
        
        this.fillInventoryButton = this.createButton(wndRight, placementCursor, 'Fill Inventory', () => {
            this.scene.fillInventoryWithRandomItems();
            // Bring debug panel back to front
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });

        placementCursor += 60;

         this.fillInventoryButton = this.createButton(wndLeft, placementCursor, 'One (1) Health', () => {
            this.scene.player.hp = 1;
            this.scene.updatePlayerUI();
            // Bring debug panel back to front
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });
        
      
        this.testMonstersButton = this.createButton(wndRight, placementCursor, 'Test Monsters', () => {
            this.scene.testMonstersMode = true;
            this.scene.advanceFloor();
            // Bring debug panel back to front after floor generation
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });

        placementCursor += 60;

        this.testTileRemovalButton = this.createButton(wndLeft, placementCursor, 'Test Tile Removal', () => {
            // Cycle through different tile removal patterns for testing
            if (!this.scene.tileRemovalTestMode) this.scene.tileRemovalTestMode = 0;
            this.scene.tileRemovalTestMode = (this.scene.tileRemovalTestMode + 1) % 5;
            
            switch(this.scene.tileRemovalTestMode) {
                case 0: this.scene.resetTileRemoval(); break;
                case 1: this.scene.setTileRemoval(1, 0, 0, 0); break; // Remove top row
                case 2: this.scene.setTileRemoval(0, 1, 0, 0); break; // Remove bottom row
                case 3: this.scene.setTileRemoval(0, 0, 1, 0); break; // Remove left column
                case 4: this.scene.setTileRemoval(0, 0, 0, 1); break; // Remove right column
            }
            
            this.scene.advanceFloor();
            // Bring debug panel back to front after floor generation
            if (this.scene.mainContainer) {
                this.scene.mainContainer.bringToTop(this);
            }
        });
        
        this.updateGodModeButton();
    }
    
    updateGodModeButton() {
        const status = this.scene.player.godMode ? 'ON' : 'OFF';
        this.godModeButton.getAt(1).setText(`God Mode: ${status}`);
    }
    
    open() {
        this.updateGodModeButton();
        super.open();
    }
    
    relocalize() {
        // Update panel title
        this.titleText.setText(Localization[Game.language]["debug_menu_title"]);
        
        // Note: Debug panel texts are hardcoded in English
        // If you want to localize debug menu, add keys to Localization object
    }
}

class UnlockItemSlotPanel extends BasePanel {
    cost = 0;

    constructor(scene) {
        super(scene, 400, 250, Localization[Game.language]["unlock_item_slot_panel_title"]);
        this.cost = 0;
        
        // Create the new tileable background
        this.createTileableBackground();
        
        this.descriptionText = this.scene.add.text(0, -10, Localization[Game.language]["unlock_item_slot_description"], { 
            fontSize: '20px', 
            fill: '#fff', 
            align: 'center',
            wordWrap: { width: 360 }
        }).setOrigin(0.5);
        
       
        // Create custom sprite-based unlock button
        
        this.unlockButton = this.createSpriteButton(0, 85, Localization[Game.language]["unlock_button_watch_ad"], () => {
            if (this.cost === 0) {
                AdManager.instance.RewardBreak((success) => {
                    if (success) {
                        this.cost = 0;
                        this.unlockSlot();
                    }
                    else {
                        this.unlockButton.buttonText.text = Localization[Game.language]["unlock_button_gold"];
                        this.unlockButton.buttonSprite.scaleX = 0.7;
                        this.cost = 100;
                        this.scene.showGameMessage(Localization[Game.language]["game_over_ad_fail"]);
                    }
                });
            }
            else {
                this.cost = 100;
                this.unlockSlot();
            }
        }, '24px');

        //this.unlockButton = this.createSpriteButton(0, 85, `Unlock (100G)`, () => this.unlockSlot(), '24px');
        //this.unlockButton.buttonSprite.scaleX = 0.7;

        this.add([this.descriptionText]);
    }
    
    unlockSlot() {
        const player = this.scene.player;

        if (player.gold < this.cost) {
            this.scene.showGameMessage(Localization[Game.language]["shop_not_enough_gold"]);
            return;
        }
        
        // Unlock the next locked slot (left to right)
        if (GameSettings.LOCKED_INVENTORY_SLOTS > 0) {
            player.gold -= this.cost;
            GameSettings.LOCKED_INVENTORY_SLOTS--;
            
            // Update visual appearance of newly unlocked slot
            const unlockedSlotIndex = GameSettings.INVENTORY_SIZE - GameSettings.LOCKED_INVENTORY_SLOTS - 1;
            const slot = this.scene.inventorySlots[unlockedSlotIndex];
            
            // Play unlock sound effect
            if (!this.scene.isMuted) {
                const unlockSounds = ['unlock_1', 'unlock_2'];
                const randomSound = unlockSounds[Math.floor(Math.random() * unlockSounds.length)];
                this.scene.sound.playAudioSprite('soundbank', randomSound, {
                    volume: this.scene.soundVolume
                });
            }
            
            this.scene.updatePlayerUI();
            this.scene.updateInventoryUI();
            this.scene.showGameMessage(Localization[Game.language]["item_slot_unlocked"]);
        }
        
        this.close();
    }

    open() {
        this.cost = 0;
                this.unlockButton.buttonText.text = Localization[Game.language]["unlock_button_watch_ad"];
        this.unlockButton.buttonSprite.scaleX = 0.5;

        super.open();
    }
    
    relocalize() {
        // Update panel title
        this.titleText.setText(Localization[Game.language]["unlock_item_slot_panel_title"]);
        
        // Update description
        this.descriptionText.setText(Localization[Game.language]["unlock_item_slot_description"]);
        
        // Update button text
        this.unlockButton.buttonText.setText(this.cost === 0 ? 
            Localization[Game.language]["unlock_button_watch_ad"] : 
            Localization[Game.language]["unlock_button_gold"]);
    }
}

class ChallengePanel extends BasePanel {
    constructor(scene) {
        super(scene, 400, 300, Localization[Game.language]["challenge_panel_title"]);
        this.challenge = null;

        
        // Create the new tileable background
        this.createTileableBackground();

        this.iconSprite = this.scene.add.sprite(0, -35, null);
        this.iconSprite.setVisible(false);
        this.requirementText = this.scene.add.text(0, 30, '', { fontSize: '16px', fill: '#ddd', align: 'center', wordWrap: { width: 380 } }).setOrigin(0.5);

        // Create custom sprite-based button
        this.attemptButton = this.createSpriteButton(0, 110, Localization[Game.language]["attempt_button"], () => this.attemptChallenge());
        
        this.add([this.iconSprite, this.requirementText]);
    }

    open(challenge) {
        this.challenge = challenge;
        this.titleText.setText(`Challenge`);
        
        let requirementText = '';
        let canAttempt = false;
        let challengeSprite = '';
        
        switch (challenge.type) {
            case ChallengeType.GREEDY:
                challengeSprite = 'greedy.png';
                const hasGold = this.scene.player.gold >= 50;
                requirementText = Localization[Game.language]["challenge_greedy_requirement"];
                if (!hasGold) {
                    requirementText += Localization[Game.language]["challenge_greedy_requires"];
                }
                canAttempt = hasGold;
                break;
            case ChallengeType.BRAVE:
                challengeSprite = 'brave.png';
                const hasHP = this.scene.player.hp >= 20;
                requirementText = Localization[Game.language]["challenge_brave_requirement"];
                if (!hasHP) {
                    requirementText += Localization[Game.language]["challenge_brave_requires"];
                }
                canAttempt = hasHP;
                break;
            case ChallengeType.MORTAL:
                challengeSprite = 'mortal.png';
                requirementText = Localization[Game.language]["challenge_mortal_requirement"];
                canAttempt = false; // Event-based, no button interaction
                break;
            case ChallengeType.MATERIAL:
                challengeSprite = 'material.png';
                requirementText = Localization[Game.language]["challenge_material_requirement"];
                canAttempt = false; // Event-based, no button interaction
                break;
        }

        
        // Show sprite instead of emoji
        this.iconSprite.setVisible(true);
        this.iconSprite.setTexture('atlas_01', challengeSprite);
        this.iconSprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.iconSprite.setScale(0.6); // Scale to fit nicely
        this.requirementText.setText(requirementText);
        this.attemptButton.setVisible(canAttempt);
        
        super.open();
    }

    attemptChallenge() {
        if (!this.challenge) return;
        
        switch (this.challenge.type) {
            case ChallengeType.GREEDY:
                if (this.scene.player.gold >= 50) {
                    const cost = Math.floor(Math.random() * 51); // 0-50
                    this.scene.player.gold -= cost;
                    this.scene.updatePlayerUI();
                    this.completeChallenge();
                }
                break;
            case ChallengeType.BRAVE:
                if (this.scene.player.hp >= 20) {
                    const cost = Math.floor(Math.random() * 11); // 0-10
                    this.scene.player.takeDamage(cost);
                    this.completeChallenge();
                }
                break;
        }
    }

    completeChallenge() {
        // Grant reward on the challenge tile
        this.scene.grantChallengeReward(this.challenge, this.challenge.tile);
        
        this.close();
        this.scene.updateTileAccessibility();
        this.scene.endTurn();
    }
    
    relocalize() {
        // Update panel title
        this.titleText.setText(Localization[Game.language]["challenge_panel_title"]);
        
        // Update button text
        this.attemptButton.buttonText.setText(Localization[Game.language]["attempt_button"]);
        
        // If panel is open with a challenge, update requirement text
        if (this.challenge && this.visible) {
            this.open(this.challenge);
        }
    }
}

class SettingsPanel extends BasePanel {
    constructor(scene) {
        super(scene, 450, 390, Localization[Game.language]["settings_panel_title"]);
        
        // Create the new tileable background
        this.createTileableBackground();
        
        // Adjust title styling to match shop panel
        this.titleText.setFontSize(30);
        this.titleText.x += 5;
        this.titleText.y += 3;
        
        // Default values - will be synced with game values when opened
        this.musicVolume = 1.0;
        this.soundVolume = 1.0;
        this.muteAll = false;
        
        // Store references to controls for updating
        this.musicSlider = null;
        this.soundSlider = null;
        this.muteCheckbox = null;
        
        // Create settings controls
        this.createSettingsControls();
    }
    
    createSettingsControls() {
        let yPos = -60;
        const spacing = 80;
        
        // Music Volume
        this.musicSlider = this.createVolumeSlider(-190, yPos, Localization[Game.language]["music_volume"], this.musicVolume, (value) => {
            this.musicVolume = value;
            // Call the callback if it exists
            if (this.MusicVolumeChanged) {
                this.MusicVolumeChanged(value);
            }
        });
        
        yPos += spacing;
        
        // Sound Volume
        this.soundSlider = this.createVolumeSlider(-190, yPos, Localization[Game.language]["sound_volume"], this.soundVolume, (value) => {
            this.soundVolume = value;
            // Call the callback if it exists
            if (this.SoundVolumeChanged) {
                this.SoundVolumeChanged(value);
            }
        });
        
        yPos += spacing * 0.5;
        yPos += 8;
        
        // Mute All
        this.muteCheckbox = this.createCheckbox(-180, yPos, Localization[Game.language]["mute_all"], this.muteAll, (value) => {
            this.muteAll = value;
            // Call the callback if it exists
            if (this.Muted) {
                this.Muted(value);
            }
        });
        
        yPos += spacing;
        yPos += 2;
        
        // Reset Game Button (moved to the left)
        this.resetButton = this.createSpriteButton(-90, yPos, 
            Localization[Game.language]["reset_game"], () => {
                // Close settings panel first, then show confirmation dialog
                this.close();
                this.scene.confirmResetPanel.open();
        });
        
        // Exit to Menu Button (on the right)
        this.exitButton = this.createSpriteButton(90, yPos, 
            "Exit to Menu", () => {
                this.exitToMenu();
        });
        
        // Hide buttons initially - will be shown/hidden in open() based on tutorial status
        this.resetButton.setVisible(false);
        this.exitButton.setVisible(false);
    }
    
    createVolumeSlider(x, y, labelText, currentValue, callback) {
        // Label
        const label = this.scene.add.text(x, y - 30, labelText, {
            fontSize: '20px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add(label);
        
        // Slider container
        const sliderWidth = 300;
        const sliderContainer = this.scene.add.container(x + 15 + sliderWidth * 0.5, y);
        
        // Store label reference for relocalization
        sliderContainer.label = label;
        
        
        // Track background
        const track = this.scene.add.graphics();
        track.fillStyle(0x444444);
        track.fillRoundedRect(-sliderWidth/2, -4, sliderWidth, 8, 4);
        
        // Handle
        const handle = this.scene.add.graphics();
        handle.fillStyle(0xaf9371);
        handle.fillCircle(0, 0, 12);
        handle.setInteractive(
            new Phaser.Geom.Circle(0, 0, 20), // Larger hit area for mobile
            Phaser.Geom.Circle.Contains
        );
        handle.input.useHandCursor = true;
        this.scene.input.setDraggable(handle);
        
        // Position handle based on current value
        const handlePos = (currentValue * sliderWidth) - sliderWidth/2;
        handle.x = handlePos;
        
        // Value display
        const valueText = this.scene.add.text(sliderWidth/2 + 20, 0, Math.round(currentValue * 100) + '%', {
            fontSize: '18px',
            fill: '#af9371'
        }).setOrigin(0, 0.5);
        
        sliderContainer.add([track, handle, valueText]);
        this.add(sliderContainer);
        
        // Drag functionality
        handle.on('drag', (pointer, dragX, dragY) => {
            // For dragging, we can use the dragX directly as it's already in local coordinates
            const clampedX = Phaser.Math.Clamp(dragX, -sliderWidth/2, sliderWidth/2);
            handle.x = clampedX;
            const value = (clampedX + sliderWidth/2) / sliderWidth;
            valueText.setText(Math.round(value * 100) + '%');
            callback(value);
        });
        
        // Click on track to jump to position - larger hit area for mobile
        track.setInteractive(
            new Phaser.Geom.Rectangle(-sliderWidth/2, -15, sliderWidth, 30),
            Phaser.Geom.Rectangle.Contains
        );
        track.on('pointerdown', (pointer, localX, localY) => {
            // Use the localX parameter which is already converted to object coordinates
            const clampedX = Phaser.Math.Clamp(localX, -sliderWidth/2, sliderWidth/2);
            handle.x = clampedX;
            const value = (clampedX + sliderWidth/2) / sliderWidth;
            valueText.setText(Math.round(value * 100) + '%');
            callback(value);
            
            // Start dragging the handle when clicking on the track
            this.scene.input.setDragState(handle, 1, pointer);
        });
        
        // Store references to handle and valueText on the container for updating
        sliderContainer.handle = handle;
        sliderContainer.valueText = valueText;
        sliderContainer.sliderWidth = sliderWidth;
        
        return sliderContainer;
    }
    
    createCheckbox(x, y, labelText, isChecked, callback) {
        const container = this.scene.add.container(x, y);
        
        // Checkbox background
        const checkboxBg = this.scene.add.graphics();
        checkboxBg.fillStyle(isChecked ? 0x7a7a7a : 0x444444);
        checkboxBg.fillRoundedRect(-15, -15, 30, 30, 5);
        checkboxBg.setInteractive(
            new Phaser.Geom.Rectangle(-15, -15, 30, 30), 
            Phaser.Geom.Rectangle.Contains
        );
        
        // Checkmark
        const checkmark = this.scene.add.text(0, 0, '✓', {
            fontSize: '22px',
            fill: '#af9371',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(isChecked);
        
        // Label
        const label = this.scene.add.text(40, 0, labelText, {
            fontSize: '20px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        
        container.add([checkboxBg, checkmark, label]);
        this.add(container);
        
        // Click handler
        checkboxBg.on('pointerdown', () => {
            container.isChecked = !container.isChecked;
            checkboxBg.clear();
            checkboxBg.fillStyle(container.isChecked ? 0x7a7a7a : 0x444444);
            checkboxBg.fillRoundedRect(-15, -15, 30, 30, 5);
            checkmark.setVisible(container.isChecked);
            callback(container.isChecked);
        });
        
        // Store references for updating
        container.checkboxBg = checkboxBg;
        container.checkmark = checkmark;
        container.isChecked = isChecked;
        container.callback = callback;
        
        return container;
    }
    
    resetGame() {
        AdManager.instance.GameplayStop();
        // Reset player data
        PlayerData.Instance.Reset();
        // Reset tutorial status
        Game.isTutorialFinished = false;
        // Reset character unlocks
        Game.character_unlocked.hero_archer = false;
        Game.character_unlocked.hero_artificer = false;
        Game.character_unlocked.hero_wizard = false;
        // Call the scene's restartGame method (same as game over screen)
        this.scene.restartGame();
        // Close the settings panel
        this.close();
    }
    
    exitToMenu() {
        AdManager.instance.GameplayStop();
        // Call the scene's restartGame method to return to menu
        this.scene.restartGame();
        // Close the settings panel
        this.close();
    }
    
    open() {
        // Sync with current game values
        if (this.scene.musicVolume !== undefined) {
            this.musicVolume = this.scene.musicVolume;
            this.updateSlider(this.musicSlider, this.musicVolume);
        }
        
        if (this.scene.soundVolume !== undefined) {
            this.soundVolume = this.scene.soundVolume;
            this.updateSlider(this.soundSlider, this.soundVolume);
        }
        
        if (this.scene.isMuted !== undefined) {
            this.muteAll = this.scene.isMuted;
            this.updateCheckbox(this.muteCheckbox, this.muteAll);
        }
        
        // Show/hide Reset Game and Exit to Menu buttons based on tutorial completion
        const showButtons = Game.isTutorialFinished;
        this.resetButton.setVisible(showButtons);
        this.exitButton.setVisible(showButtons);
        
        super.open();
    }
    
    updateSlider(slider, value) {
        if (!slider) return;
        
        const sliderWidth = slider.sliderWidth;
        const handlePos = (value * sliderWidth) - sliderWidth/2;
        slider.handle.x = handlePos;
        slider.valueText.setText(Math.round(value * 100) + '%');
    }
    
    updateCheckbox(checkbox, isChecked) {
        if (!checkbox) return;
        
        checkbox.isChecked = isChecked;
        checkbox.checkboxBg.clear();
        checkbox.checkboxBg.fillStyle(isChecked ? 0x7a7a7a : 0x444444);
        checkbox.checkboxBg.fillRoundedRect(-15, -15, 30, 30, 5);
        checkbox.checkmark.setVisible(isChecked);
    }
    
    relocalize() {
        // Update panel title
        this.titleText.setText(Localization[Game.language]["settings_panel_title"]);
        
        // Update slider labels
        if (this.musicSlider && this.musicSlider.label) {
            this.musicSlider.label.setText(Localization[Game.language]["music_volume"]);
        }
        
        if (this.soundSlider && this.soundSlider.label) {
            this.soundSlider.label.setText(Localization[Game.language]["sound_volume"]);
        }
        
        // Update mute checkbox label
        if (this.muteCheckbox && this.muteCheckbox.list[2]) {
            this.muteCheckbox.list[2].setText(Localization[Game.language]["mute_all"]);
        }
        
        // Update reset button
        this.resetButton.buttonText.setText(Localization[Game.language]["reset_game"]);
    }
}

class ConfirmResetPanel extends BasePanel {
    constructor(scene) {
        super(scene, 500, 300, 'Confirm');
        
        // Create the tileable background
        this.createTileableBackground();
        
        // Make the title text larger
        this.titleText.setFontSize(30);
        
        // Add confirmation text - moved even lower
        this.confirmText = scene.add.text(0, 0, 'This will reset all player data.\nProceed?', {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        });
        this.confirmText.setOrigin(0.5);
        this.add(this.confirmText);
        
        // Yes button - moved even lower
        this.yesButton = this.createSpriteButton(-90, 100, 'Yes', () => {
            this.close();
            // Perform the actual reset
            this.performReset();
        });
        
        // No button - moved even lower
        this.noButton = this.createSpriteButton(90, 100, 'No', () => {
            this.close();
        });
        
        this.add([this.yesButton, this.noButton]);
    }
    
    performReset() {
        AdManager.instance.GameplayStop();
        // Reset player data
        PlayerData.Instance.Reset();
        // Reset tutorial status
        Game.isTutorialFinished = false;
        // Reset character unlocks
        Game.character_unlocked.hero_archer = false;
        Game.character_unlocked.hero_artificer = false;
        Game.character_unlocked.hero_wizard = false;
        // Call the scene's restartGame method (same as game over screen)
        this.scene.restartGame();
    }
}


class LanguagePanel extends BasePanel {
    constructor(scene) {
        super(scene, 450, 530, 'Language Select');
        
          // Adjust title styling to match shop panel
        this.titleText.setFontSize(30);
        this.titleText.x += 5;
        this.titleText.y += 3;

        // Create the new tileable background
        this.createTileableBackground();
        
        // Languages with their native names
        this.languages = [
            { code: 'en', name: 'English' },
            { code: 'de', name: 'Deutsch' },
            { code: 'fr', name: 'Français' },
            { code: 'da', name: 'Dansk' },
            { code: 'hi', name: 'हिन्दी' },
            { code: 'id', name: 'Bahasa Indonesia' },
            { code: 'pl', name: 'Polski' },
            { code: 'pt', name: 'Português' },
            { code: 'ru', name: 'Русский' },
            { code: 'es', name: 'Español' },
            { code: 'tr', name: 'Türkçe' },
            { code: 'vi', name: 'Tiếng Việt' }
        ];
        
        // Store button references
        this.languageButtons = [];
        
        this.createLanguageButtons();
    }
    
    createLanguageButtons() {
        const startY = -155;
        const buttonHeight = 60;
        const buttonWidth = 200;
        const columnGap = 20;
        const leftX = -100;
        const rightX = 100;
        
        this.languages.forEach((lang, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = column === 0 ? leftX : rightX;
            const y = startY + (row * buttonHeight);
            
            this.createLanguageButton(x, y, lang.name, lang.code);
        });
    }
    
    createLanguageButton(x, y, text, langCode) {
        // Use the sprite-based button like other panels
        const button = this.createSpriteButton(x, y, text, () => this.selectLanguage(langCode), '18px');
        button.buttonSprite.scaleX = 0.6;
        // Store the language code with the button
        button.langCode = langCode;
        
        // Add to our button array
        this.languageButtons.push(button);
        
        return button;
    }
    
    open() {
        // Update button colors based on current language
        this.languageButtons.forEach(button => {
            if (button.langCode === Game.language) {
                // Highlight current language with gold color
                button.buttonText.setStyle({ 
                    fontSize: '18px', 
                    fill: '#FFD700', // Gold color for selected language
                    fontStyle: 'bold' 
                });
            } else {
                // Reset to default style
                button.buttonText.setStyle({ 
                    fontSize: '18px', 
                    fill: '#af9371', // Default button text color
                    fontStyle: 'bold' 
                });
            }
        });
        
        // Call parent open method
        super.open();
    }
    
    selectLanguage(langCode) {
        // Change the game language
        Game.language = langCode;
        
        // Update all language UI elements
        this.scene.updateLanguageUI();
        
        // Update the language panel itself
        this.open(); // This will refresh the button highlights
        
        // Close the panel
        this.close();
    }
    
    relocalize() {
        // Language panel title is hardcoded as "Language Select"
        // Language names are in their native languages, so no need to update
    }
}

// Make classes available globally
window.ItemPanel = ItemPanel;
window.ShopPanel = ShopPanel;
window.GameOverPanel = GameOverPanel;
window.DebugPanel = DebugPanel;
window.UnlockItemSlotPanel = UnlockItemSlotPanel;
window.ChallengePanel = ChallengePanel;
window.SettingsPanel = SettingsPanel;
window.LanguagePanel = LanguagePanel;