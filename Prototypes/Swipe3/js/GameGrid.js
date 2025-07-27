class GameGrid extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.scene = scene;
        this.config = config;
        this.levelNumber = config.levelNumber || 0;
        this.gridWidth = config.gridWidth || 4;
        this.gridHeight = config.gridHeight || 5;
        this.tiles = [];
        this.cards = [];
        this.playerCard = null;
        this.isAnimating = false;
        this.playerRow = 0;
        this.playerCol = 0;
        this.doorSpawned = false;
        this.firstEnemySpawned = false;
        this.projectileTutorialShown = false;
        this.shownGoalsTutorial = false;
        this.numberOfShieldsPickedUp = 0;
        this.winCondition = {
            "type": "kill",
            "target": 10
        };
        this.winProgress = 0;
        
        this.tileSizeX = 100;
        this.tileSizeY = 130;
        
        this.initializeGrid();
        this.setupFromConfig();
        this.calculateContainerScale();
        scene.add.existing(this);
    }
    
    calculateContainerScale() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const headerHeight = 40;
        const padding = 40;
        
        const availableWidth = width - padding * 2;
        const availableHeight = height - headerHeight - padding * 2;
        
        const containerWidth = this.gridWidth * this.tileSizeX;
        const containerHeight = this.gridHeight * this.tileSizeY;
        
        const scaleX = availableWidth / containerWidth;
        const scaleY = availableHeight / containerHeight;
        const scale = Math.min(scaleX, scaleY);
        
        this.setScale(scale);
        
        const scaledWidth = containerWidth * scale;
        const scaledHeight = containerHeight * scale;
        
        this.x = (width - scaledWidth) / 2;
        this.y = headerHeight + (height - headerHeight - scaledHeight) / 2;
    }
    
    initializeGrid() {
        for (let row = 0; row < this.gridHeight; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
                const x = col * this.tileSizeX + this.tileSizeX / 2;
                const y = row * this.tileSizeY + this.tileSizeY / 2;
                
                // Create a semi-transparent black background for each tile
                const tileBackground = this.scene.add.graphics();
                tileBackground.fillStyle(0x000000, 0.5);
                tileBackground.fillRect(
                    x - this.tileSizeX / 2,
                    y - this.tileSizeY / 2,
                    this.tileSizeX,
                    this.tileSizeY
                );
                this.add(tileBackground);
                tileBackground.setDepth(0);
                
                this.tiles[row][col] = {
                    x: x,
                    y: y,
                    card: null,
                    disabled: false,
                    type: 'normal',
                    portalInstance: null,
                    portalVisual: null,
                    background: tileBackground
                };
            }
        }
    }
    
    setupFromConfig() {
        // Disable tiles if specified
        if (this.config.disable && Array.isArray(this.config.disable)) {
            this.config.disable.forEach(index => {
                const row = Math.floor(index / this.gridWidth);
                const col = index % this.gridWidth;
                if (row < this.gridHeight && col < this.gridWidth) {
                    this.tiles[row][col].disabled = true;
                    // Remove background for disabled tiles
                    if (this.tiles[row][col].background) {
                        this.tiles[row][col].background.destroy();
                        this.tiles[row][col].background = null;
                    }
                }
            });
        }
        
        // Spawn player
        this.spawnPlayer(this.config.playerSpawnRow, this.config.playerSpawnCol);
        
        // Set win condition
        this.setWinCondition(this.config.winCondition, this.config.winValue);
        
        // Create portals if specified
        if (this.config.portals && Array.isArray(this.config.portals) && this.config.portals.length === 2) {
            const portal1Index = this.config.portals[0];
            const portal2Index = this.config.portals[1];
            
            const row1 = Math.floor(portal1Index / this.gridWidth);
            const col1 = portal1Index % this.gridWidth;
            const row2 = Math.floor(portal2Index / this.gridWidth);
            const col2 = portal2Index % this.gridWidth;
            
            if (row1 < this.gridHeight && col1 < this.gridWidth) {
                this.createPortalTile(row1, col1, 'A');
            }
            
            if (row2 < this.gridHeight && col2 < this.gridWidth) {
                this.createPortalTile(row2, col2, 'B');
            }
        }
        
        if (this.levelNumber === 1) {
            this.fillEmptyTilesWith("dirt");
        }
        else if (this.levelNumber === 2) {
            this.fillEmptyTilesWith("shield");
        }
        else {
            this.fillEmptyTiles();
        }
        this.adjustTileBackgrounds();
    }
    
    adjustTileBackgrounds() {
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.tiles[row][col];
                
                // Skip if tile is disabled or has no background
                if (tile.disabled || !tile.background) continue;
                
                // Check if tile above exists and is active
                const hasActiveTileAbove = row > 0 && 
                    !this.tiles[row - 1][col].disabled;
                
                // Check if tile below exists and is active
                const hasActiveTileBelow = row < this.gridHeight - 1 && 
                    !this.tiles[row + 1][col].disabled;
                
                // Calculate adjustments
                let yOffset = 0;
                let heightAdjustment = 0;
                
                if (!hasActiveTileAbove) {
                    yOffset = -8;
                    heightAdjustment += 8;
                }
                
                if (!hasActiveTileBelow) {
                    heightAdjustment += 10;
                }
                
                // Redraw the background with adjustments
                if (yOffset !== 0 || heightAdjustment !== 0) {
                    tile.background.clear();
                    tile.background.fillStyle(0x000000, 0.5);
                    tile.background.fillRect(
                        tile.x - this.tileSizeX / 2,
                        tile.y - this.tileSizeY / 2 + yOffset,
                        this.tileSizeX,
                        this.tileSizeY + heightAdjustment
                    );
                }
            }
        }
    }
    
    setWinCondition(type, target) {
        this.winCondition = { type, target };
        this.winCondition.type = 'kill'; // Force kill
        if (!this.winCondition.target) {
            this.winCondition.target = 10; // Default to 10
        }
        this.winProgress = 0;
    }
    
    spawnPlayer(row, col) {
        let tile = null;
        if (this.tiles[row]) {
            tile = this.tiles[row][col];
        }
        if (!tile) {
            console.error("Invalid player start tile");
            tile = this.tiles[0][0];
            row = col = 0;
        }
        const playerHp = this.config.playerHp || 10;
        const playerShield = this.config.playerShield || 0;
        this.playerCard = new PlayerCard(this.scene, tile.x, tile.y, playerHp, playerShield);
        this.playerCard.setGridPosition(col, row);
        this.add(this.playerCard);
        this.cards.push(this.playerCard);
        tile.card = this.playerCard;
        this.playerRow = row;
        this.playerCol = col;
        this.bringToTop(this.playerCard);
        if (this.playerCard) {
            this.playerCard.setDepth(2); // Player above portals
        }
    }
    
    createCard(row, col, type) {
        const tile = this.tiles[row][col];
        let card = null;

        const dellayTutorial = 450;
        
        switch(type) {
            case 'monster':
                {
                    let cardPower = Math.floor(Math.random() * 2) + 2;
                    if (this.levelNumber === 1 || this.levelNumber === 2) {
                        cardPower = 1;
                    }
                    card = new MonsterCard(this.scene, tile.x, tile.y, cardPower);
                    if (!this.firstEnemySpawned) {
                        this.firstEnemySpawned = true;
                        if (this.levelNumber === 1) {
                            this.scene.time.delayedCall(dellayTutorial, () => {
                                const newTut = this.showTutorial("Move onto enemies to fight them", 2, card.monsterSprite.frame.name);
                                if (newTut) {
                                    newTut.AddMonsterKillAnimation();
                                }
                            });
                        }
                    }
                    if (this.levelNumber === 1 && this.winProgress === 4 && !this.shownGoalsTutorial) {
                        const newTut = this.showTutorial("Your level goals are shown on top. Meet the goal to spawn a door", 1, "char_door.png");
                        if (newTut) {
                            newTut.AddPointGesture(); 
                        }
                        this.shownGoalsTutorial = true;
                    }
                }
                break;
            case 'potion':
                {
                    let cardVal = Math.floor(Math.random() * 3) + 3;
                    let showTutorial = false;
                    if (this.levelNumber === 1 && this.winProgress === 2) {
                        if (this.playerCard && this.playerCard.power < this.playerCard.maxPower) {
                            cardVal = this.playerCard.maxPower;
                            showTutorial = true;
                        }
                    }
                    else if (this.levelNumber === 2) {
                        cardVal = 10;
                    }
                    card = new PotionCard(this.scene, tile.x, tile.y, cardVal);
                    if (showTutorial) {
                        this.scene.time.delayedCall(dellayTutorial, () => {
                            this.showTutorial("Keep an eye on your HP, use potions to heal", 3, card.potionSprite.frame.name);
                        });
                    }
                }
                break;
            case 'shield':
                {
                    let cardPower = Math.floor(Math.random() * 2) + 2;
                    if (this.levelNumber === 2) {
                        cardPower = 5;
                    }

                    card = new ShieldCard(this.scene, tile.x, tile.y, cardPower);
                }
                break;
            case 'door':
                card = new DoorCard(this.scene, tile.x, tile.y);
                break;
            case 'projectile':
                {
                    let cardPower = Math.floor(Math.random() * 4) + 1;
                    if (this.levelNumber === 2) {
                        cardPower = 5;
                    }

                    const direction = Math.floor(Math.random() * 3);
                    card = new ProjectileCard(this.scene, tile.x, tile.y, cardPower, direction);

                    if (this.levelNumber === 2 && this.winProgress === 3) {
                        if (!this.projectileTutorialShown) {
                            const newTut = this.showTutorial("Projectile cards shoot enemy cards when activated.", 1, "crossbow_right_loaded.png");
                            if (newTut) {
                            newTut.ShowArrowShooting(); 
                            }
                        }
                        this.projectileTutorialShown = true;
                    }
                }
                break;
            case 'cannon':
                {
                    const direction = Math.floor(Math.random() * 3);
                    card = new CannonCard(this.scene, tile.x, tile.y, Math.floor(Math.random() * 4) + 1, direction);
                }
                break;
            case 'magic':
                {
                    const direction = Math.floor(Math.random() * 3);
                    card = new MagicProjectileCard(this.scene, tile.x, tile.y, Math.floor(Math.random() * 4) + 1);
                }
                break;
            case 'trap':
                {
                    let cardPower = Math.floor(Math.random() * 4) + 1;
                    if (this.levelNumber === 2) {
                        cardPower = 1;
                    }

                    card = new TrapToggleCard(this.scene, tile.x, tile.y, cardPower);
                    if (this.levelNumber === 2 && this.numberOfShieldsPickedUp === 3) {
                        const newTut = this.showTutorial("Watch out! Traps hurt if you step on them with the spikes out!", 4, "char_trap_b.png");
                        if (newTut) {
                            newTut.ShowSpikeAnimation();
                        }
                    }
                }
                break;
            default:
                card = new DirtCard(this.scene, tile.x, tile.y);
        }
        
        card.setGridPosition(col, row);
        this.add(card);
        this.cards.push(card);
        tile.card = card;
        
        return card;
    }
    
    getRandomCardType() {
        if (this.doorSpawned) {
            return 'dirt';
        }

        // Special level 2 logic
        if (this.levelNumber === 2) {
            if (this.numberOfShieldsPickedUp <= 2) {
                return 'dirt';
            } else if (this.numberOfShieldsPickedUp === 3) {
                return 'trap';
            }

            if (this.winProgress === 3) {
                if (!this.projectileTutorialShown) {
                    return "projectile";
                }
            }
        }

        if (this.levelNumber === 1 && this.winProgress === 2) {
            if (this.playerCard && this.playerCard.power < this.playerCard.maxPower) {
                return 'potion';
            }
        }

        // Use level-specific pool if available
        if (this.config.pool) {
            return this.config.pool[Math.floor(Math.random() * this.config.pool.length)];
        }
        
        // Default types without special cards
        const types = ['monster', 'potion', 'monster', 'shield', 'monster', 'trap', 'monster'];
        
        // Add level-specific special card based on level number (1-indexed)
        const pushProjectileToTypes = () => {
            const levelIndex = (this.config.levelNumber - 1) % 3;
            if (levelIndex === 1) {
                if (this.levelNumber === 2 && this.winProgress <= 3) {
                    // SKIP UNTIL IT'S TIME
                }
                else if (this.levelNumber === 2) {
                    types.push('projectile');
                    types.push('projectile');
                    types.push('monster');
                    types.push('monster');
                }
                else {
                    types.push('projectile');
                    types.push('monster');
                }
            } else if (levelIndex === 0) {
                types.push('cannon');
                types.push('monster');
            } else if (levelIndex === 2) {
                types.push('magic');
                types.push('monster');
            }
        }
        pushProjectileToTypes();

        if (this.config.levelNumber > 10) {
            types.push('monster');
            pushProjectileToTypes();
        }
        if (this.config.levelNumber > 20) {
            types.push('monster');
            types.push('trap');
            pushProjectileToTypes();
        }
        
        // Shuffle the types array using Fisher-Yates algorithm
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        
        return types[Math.floor(Math.random() * types.length)];
    }
    
    fillEmptyTiles() {
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.tiles[row][col];
                if (!tile.disabled && !tile.card && tile.type !== 'portal') {
                    const cardType = this.getRandomCardType();
                    const card = this.createCard(row, col, cardType);
                    card.fadeIn();
                }
            }
        }
        this.bringToTop(this.playerCard);
    }

    fillEmptyTilesWith(cardType) {
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.tiles[row][col];
                if (!tile.disabled && !tile.card && tile.type !== 'portal') {
                    const card = this.createCard(row, col, cardType);
                    card.fadeIn();
                }
            }
        }
        this.bringToTop(this.playerCard);
    }
    
    canMove(fromRow, fromCol, dRow, dCol) {
        const newRow = fromRow + dRow;
        const newCol = fromCol + dCol;
        
        if (newRow < 0 || newRow >= this.gridHeight || 
            newCol < 0 || newCol >= this.gridWidth) {
            return false;
        }
        
        return !this.tiles[newRow][newCol].disabled;
    }
    
    getCardsInLine(startRow, startCol, dRow, dCol) {
        const cards = [];
        let row = startRow;
        let col = startCol;
        
        // Always include the player if they're at the start position
        if (this.tiles[row][col].card === this.playerCard) {
            cards.push(this.playerCard);
            
            // If player is on a portal, don't pull cards through it
            if (this.tiles[row][col].type === 'portal') {
                return cards;
            }
        } else if (this.tiles[row][col].card && this.tiles[row][col].card.type !== 'portal') {
            cards.push(this.tiles[row][col].card);
        }
        
        row -= dRow;
        col -= dCol;
        
        while (row >= 0 && row < this.gridHeight && 
               col >= 0 && col < this.gridWidth) {
            if (this.tiles[row][col].disabled) {
                break;
            }
            
            if (this.tiles[row][col].card && 
                this.tiles[row][col].card.type !== 'portal') {
                cards.push(this.tiles[row][col].card);
            }
            
            row -= dRow;
            col -= dCol;
        }
        
        return cards;
    }
    
    shiftPlayer(direction) {
        if (this.isAnimating) return false;
        
        const moves = {
            'up': { dRow: -1, dCol: 0 },
            'down': { dRow: 1, dCol: 0 },
            'left': { dRow: 0, dCol: -1 },
            'right': { dRow: 0, dCol: 1 }
        };
        
        const move = moves[direction];
        if (!this.canMove(this.playerRow, this.playerCol, move.dRow, move.dCol)) {
            return false;
        }
        
        this.isAnimating = true;
        
        const cardsToMove = this.getCardsInLine(
            this.playerRow, 
            this.playerCol, 
            move.dRow, 
            move.dCol
        );
        
        this.moveCards(cardsToMove, move.dRow, move.dCol, () => {
            this.handlePlayerInteractions();
            
            // Check if player died after interactions
            if (this.playerCard && this.playerCard.isDead()) {
                this.scene.events.emit('playerDied');
            }
            
            this.callPostTurn();
            this.destroyMarkedCards();
            this.spawnCardsOnEmptyTiles();
            this.checkWinCondition();
            this.isAnimating = false;
        });
        
        return true;
    }
    
    moveCards(cards, dRow, dCol, onComplete) {
        let completed = 0;
        
        // Filter out cards that would land on portals (except the player)
        const movableCards = cards.filter(card => {
            if (card === this.playerCard) return true;
            
            const newRow = card.gridY + dRow;
            const newCol = card.gridX + dCol;
            
            // Don't move non-player cards onto portals
            return this.tiles[newRow][newCol].type !== 'portal';
        });
        
        // If no cards can move (not even the player), block the movement
        if (movableCards.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        movableCards.forEach((card) => {
            const newRow = card.gridY + dRow;
            const newCol = card.gridX + dCol;
            const newTile = this.tiles[newRow][newCol];
            
            // Clear the old position
            this.tiles[card.gridY][card.gridX].card = null;
            
            // Set the new position
            this.tiles[newRow][newCol].card = card;
            card.setGridPosition(newCol, newRow);
            
            if (card === this.playerCard) {
                this.playerRow = newRow;
                this.playerCol = newCol;
            }
            
            card.animateMoveTo(newTile.x, newTile.y, 500, () => {
                completed++;
                if (completed === movableCards.length && onComplete) {
                    onComplete();
                }
            });
        });
    }
    
    handlePlayerInteractions() {
        const playerTile = this.tiles[this.playerRow][this.playerCol];
        
        // Check if player is on a portal tile
        if (playerTile.type === 'portal') {
            const otherPortal = this.getOtherPortalTile(this.playerRow, this.playerCol);
            if (otherPortal) {
                this.teleportPlayer(otherPortal.row, otherPortal.col);
                return; // Skip other interactions after teleporting
            }
        }
        
        const cardsAtPosition = this.cards.filter(card => 
            card.gridX === this.playerCol && 
            card.gridY === this.playerRow &&
            card !== this.playerCard &&
            !card.requestDestroy
        );
        
        cardsAtPosition.forEach(card => {
            card.onPlayerInteraction(this.playerCard);
            
            if (card.type === 'monster' && card.requestDestroy) {
                this.winProgress++;
                // Emit event to update UI immediately
                this.scene.events.emit('updateWinCondition');
                // Check if we should spawn door
                this.checkWinCondition();
            } else if ((card.type === 'potion' || card.type === 'shield') && card.requestDestroy) {
                if (this.winCondition && this.winCondition.type === 'collect') {
                    this.winProgress++;
                    // Emit event to update UI immediately
                    this.scene.events.emit('updateWinCondition');
                    // Check if we should spawn door
                    this.checkWinCondition();
                }
            }

            if (card.type === 'shield' && card.requestDestroy) {
                this.numberOfShieldsPickedUp++;
            }
            else if ((card.type === 'trap' || card.type == 'dirt') && card.requestDestroy && this.levelNumber === 2) {
                // Only in level 2, we track trap / dirt as shield to avoid over spawning.
                this.numberOfShieldsPickedUp++;
            }
        });
    }
    
    callPostTurn() {
        this.cards.forEach(card => {
            if (!card.requestDestroy) {
                card.postTurn();
            }
        });
    }
    
    destroyMarkedCards() {
        const cardsToDestroy = this.cards.filter(card => card.requestDestroy);
        
        cardsToDestroy.forEach(card => {
            const tile = this.tiles[card.gridY][card.gridX];
            if (tile.card === card) {
                tile.card = null;
            }
            
            const index = this.cards.indexOf(card);
            if (index > -1) {
                this.cards.splice(index, 1);
            }
            
            card.destroy();
        });
    }
    
    spawnCardsOnEmptyTiles() {
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.tiles[row][col];
                if (!tile.disabled && !tile.card && tile.type !== 'portal') {
                    const cardType = this.getRandomCardType();
                    const card = this.createCard(row, col, cardType);
                    card.fadeIn();
                }
            }
        }
        this.bringToTop(this.playerCard);
        if (this.playerCard) {
            this.playerCard.setDepth(2); // Player above portals
        }
    }
    
    checkWinCondition() {
        if (this.winCondition && !this.doorSpawned) {
            if (this.winProgress >= this.winCondition.target) {
                this.spawnDoor();
            }
        }
    }
    
    spawnDoor() {
        const hasDoor = this.cards.some(card => card.type === 'door');
        if (hasDoor) return;
        
        const emptyTiles = [];
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.tiles[row][col];
                if (!tile.disabled && !tile.card && tile.type !== 'portal') {
                    emptyTiles.push({ row, col });
                }
            }
        }
        
        if (emptyTiles.length > 0) {
            const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            const door = this.createCard(randomTile.row, randomTile.col, 'door');
            door.fadeIn();
            this.doorSpawned = true;
        } else {
            // If no empty tiles, replace a random non-player, non-portal card
            const replaceableTiles = [];
            for (let row = 0; row < this.gridHeight; row++) {
                for (let col = 0; col < this.gridWidth; col++) {
                    const tile = this.tiles[row][col];
                    if (!tile.disabled && tile.card && 
                        tile.card.type !== 'player' && 
                        tile.card.type !== 'portal' &&
                        tile.card.type !== 'door' &&
                        tile.type !== 'portal') {
                        replaceableTiles.push({ row, col, card: tile.card });
                    }
                }
            }
            
            if (replaceableTiles.length > 0) {
                const randomTile = replaceableTiles[Math.floor(Math.random() * replaceableTiles.length)];
                randomTile.card.markForDestruction();
                this.destroyMarkedCards();
                const door = this.createCard(randomTile.row, randomTile.col, 'door');
                door.fadeIn();
                this.doorSpawned = true;
            }
        }
    }
    
    hasPortalAt(row, col) {
        return this.tiles[row][col].type === 'portal';
    }
    
    teleportPlayer(toRow, toCol) {
        const fromTile = this.tiles[this.playerRow][this.playerCol];
        const toTile = this.tiles[toRow][toCol];
        
        // Clear the player from current position
        fromTile.card = null;
        
        // Play portal sound effect
        if (soundEffectsEnabled) {
            this.scene.sound.playAudioSprite('soundbank', 'portal');
        }
        
        // Move player to portal position (portal doesn't occupy tile)
        this.playerRow = toRow;
        this.playerCol = toCol;
        this.playerCard.setGridPosition(toCol, toRow);
        this.playerCard.setPosition(toTile.x, toTile.y);
        
        // Set player as the tile's card
        toTile.card = this.playerCard;
        
        this.bringToTop(this.playerCard);
        if (this.playerCard) {
            this.playerCard.setDepth(2); // Player above portals
        }
    }
    
    createPortalTile(row, col, instance) {
        const tile = this.tiles[row][col];
        tile.type = 'portal';
        tile.portalInstance = instance;
        
        // Create visual representation for the portal
        const spriteName = instance === 'A' ? 'char_portal_a.png' : 'char_portal_b.png';
        const portalSprite = this.scene.add.image(tile.x, tile.y, 'atlas_02', spriteName);
        portalSprite.setScale(0.5);
        portalSprite.setOrigin(0.5, 0.5);
        
        // Store visual elements
        tile.portalVisual = {
            sprite: portalSprite
        };
        
        // Add to container at lower depth than cards
        this.add(portalSprite);
        portalSprite.setDepth(1);
    }
    
    getPortalTiles() {
        const portals = [];
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const tile = this.tiles[row][col];
                if (tile.type === 'portal') {
                    portals.push({tile: tile, row: row, col: col});
                }
            }
        }
        return portals;
    }
    
    getOtherPortalTile(fromRow, fromCol) {
        const fromTile = this.tiles[fromRow][fromCol];
        if (fromTile.type !== 'portal') return null;
        
        const portals = this.getPortalTiles();
        const other = portals.find(p => 
            (p.row !== fromRow || p.col !== fromCol) && 
            p.tile.portalInstance !== fromTile.portalInstance
        );
        
        return other ? other : null;
    }
    
    showTutorial(whatToText = "", whatToShow = 1, card = null) {
        if (this.scene.tutorialWindow) {
            this.scene.tutorialWindow.destroy();
            this.scene.tutorialWindow = null;
        }
        
        if (typeof whatToShow == "string") {
            console.error("Calling old function");
        }

        this.scene.tutorialWindow = new Tutorial(this.scene, whatToShow, whatToText, card);
        return this.scene.tutorialWindow;
    }
}