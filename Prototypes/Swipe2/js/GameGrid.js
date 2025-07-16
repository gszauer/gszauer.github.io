class GameGrid extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.scene = scene;
        this.config = config;
        this.gridWidth = config.gridWidth || 5;
        this.gridHeight = config.gridHeight || 5;
        this.tiles = [];
        this.cards = [];
        this.playerCard = null;
        this.isAnimating = false;
        this.playerRow = -1;
        this.playerCol = -1;
        this.doorSpawned = false;
        this.winCondition = null;
        this.winProgress = 0;
        
        this.tileSize = 100;
        
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
        
        const containerWidth = this.gridWidth * this.tileSize;
        const containerHeight = this.gridHeight * this.tileSize;
        
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
                this.tiles[row][col] = {
                    x: col * this.tileSize + this.tileSize / 2,
                    y: row * this.tileSize + this.tileSize / 2,
                    card: null,
                    disabled: false,
                    type: 'normal',
                    portalInstance: null,
                    portalVisual: null
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
        
        this.fillEmptyTiles();
    }
    
    setWinCondition(type, target) {
        this.winCondition = { type, target };
        this.winProgress = 0;
    }
    
    spawnPlayer(row, col) {
        const tile = this.tiles[row][col];
        this.playerCard = new PlayerCard(this.scene, tile.x, tile.y);
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
        
        switch(type) {
            case 'monster':
                card = new MonsterCard(this.scene, tile.x, tile.y, 
                    Math.floor(Math.random() * 5) + 3,
                    Math.floor(Math.random() * 5) + 3);
                break;
            case 'potion':
                card = new PotionCard(this.scene, tile.x, tile.y, 
                    Math.floor(Math.random() * 3) + 3);
                break;
            case 'shield':
                card = new ShieldCard(this.scene, tile.x, tile.y, 
                    Math.floor(Math.random() * 2) + 2);
                break;
            case 'door':
                card = new DoorCard(this.scene, tile.x, tile.y);
                break;
            case 'projectile':
                card = new ProjectileCard(this.scene, tile.x, tile.y, 3, Math.floor(Math.random() * 4));
                break;
            case 'trap':
                card = new TrapToggleCard(this.scene, tile.x, tile.y);
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
        
        const types = ['monster', 'potion', 'shield', 'dirt', 'dirt', 'projectile', 'trap'];
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
        
        cards.forEach((card) => {
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
                if (completed === cards.length && onComplete) {
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
                if (!tile.disabled && !tile.card) {
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
                        tile.card.type !== 'door') {
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
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x3498db, 1);
        graphics.fillRoundedRect(
            tile.x - 40, 
            tile.y - 40, 
            80, 
            80, 
            8
        );
        
        const labelText = this.scene.add.text(tile.x, tile.y, `Portal\n${instance}`, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center' 
        });
        labelText.setOrigin(0.5, 0.5);
        
        // Store visual elements
        tile.portalVisual = {
            graphics: graphics,
            label: labelText
        };
        
        // Add to container at lower depth than cards
        this.add(graphics);
        this.add(labelText);
        graphics.setDepth(1);
        labelText.setDepth(1);
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
}