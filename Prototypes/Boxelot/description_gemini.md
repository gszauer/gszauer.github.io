## Boxelot - Phaser 3 Game Summary

This document summarizes the provided HTML file which contains a complete browser-based game called "Boxelot", built using the Phaser 3 JavaScript game framework.

**1. Overall Structure:**

* **Single HTML File:** The entire game (HTML structure, CSS styling, and JavaScript logic) is contained within one `.html` file.
* **Phaser 3:** It utilizes the Phaser 3 library (loaded via CDN) for game structure, rendering, input handling, and scene management.
* **Scene-Based:** The game logic is divided into distinct Phaser Scenes:
    * `BootScene`: Initializes Phaser.
    * `PreloaderScene`: Shows a simple "Loading..." message (could be expanded for asset loading).
    * `GameScene`: Contains the core gameplay logic (grid, tiles, player, monsters, interactions).
    * `UIScene`: Manages the user interface overlay (stats, inventory, messages, popups) and runs in parallel with `GameScene`.
    * `GameOverScene`: Displays the final score and restart option.

**2. HTML Structure:**

* **`#game-container`:** A `div` element that acts as the parent container where the Phaser game canvas will be created.
* **`#instructions-dom`:** A separate `div` (initially hidden) used to display game instructions as standard HTML content, styled with CSS. It includes a header, scrollable content area, and a close button.

**3. CSS Styling:**

* **Basic Layout:** Sets up the HTML and body for full-screen display, centers the `#game-container`, and uses a dark background.
* **Instructions Panel:** Styles the `#instructions-dom` element to appear as a modal popup (centered, dark background, border, scrollable content). It uses `flexbox` for layout within the panel.
* **Responsiveness:** Basic attempts at responsiveness are made using percentages (`%`) and `clamp()` for font sizes in the instructions panel.

**4. JavaScript Logic:**

* **Constants & Configuration:**
    * Defines core game parameters like `GRID_COLS`, `GRID_ROWS`, base tile dimensions (`TILE_WIDTH_BASE`, `TILE_HEIGHT_BASE`), UI area ratios (`UI_HEADER_RATIO`, `UI_FOOTER_RATIO`), and `MAX_INVENTORY_SLOTS`.
    * Uses enums (`TILE_TYPE`, `TILE_STATE`) to represent different kinds of tiles and their visibility states.
    * `COLORS`: An extensive object defining hex color codes for various UI elements and tile backgrounds (e.g., `COLORS.MONSTER_BG`, `COLORS.KEY`, `COLORS.HIDDEN`).
    * `PLAYER_DEFAULTS`: Initial player stats (HP, ATK, Gold).
    * `MONSTER_STATS`: Defines different monster types with their base stats and icons (e.g., `SPIDER: { icon: '🕷️', hp: 5, atk: 1 }`).
    * `ITEM_TYPES`: Defines various items, their properties (icon, description, color, effect), and whether they are consumable (e.g., `POTION`, `BLADE_SCROLL`, `KEY_ITEM`).
    * `RANDOM_TILE_OUTCOMES`: An array listing possible item IDs that can result from a random tile.

* **Helper Functions:**
    * `getRandomInt(min, max)`: Generates a random integer.
    * `getRandomElement(arr)`: Selects a random item from an array.

* **`GameScene` (Core Gameplay):**
    * **State:** Manages the game's state using variables like:
        * `gridData`: A 2D array holding the underlying data for each tile (type, state, HP for monsters, etc.). Example: `this.gridData[r][c] = { type: TILE_TYPE.MONSTER, hp: 5, ... }`.
        * `tileObjects`: A parallel 2D array holding the Phaser visual objects (Containers) for each tile.
        * `player`: An object storing current player stats (`hp`, `maxHp`, `atk`, `gold`, `hasKey`) and `inventory` (an array of item IDs).
        * `currentFloor`, `monsterCount`, `keyHolderCoords`, `keyDroppedOnFloor`, `isGameOver`.
    * **Layout:**
        * `calculateGridSize()`: Dynamically calculates the size and spacing of tiles based on available screen space between the header and footer UI areas. Aims for square tiles.
        * `positionGrid()`: Centers the main `tileContainer` based on calculated offsets.
        * `redrawTiles()`: Called on resize to update the position, size, and internal element layout (text, icons) of all existing tiles.
    * **Floor Generation (`generateFloor`):**
        * Clears previous floor data and visuals.
        * Initializes `gridData` with all tiles as `HIDDEN_UNACCESSIBLE`.
        * Randomly places the `DOOR` (starting point).
        * Randomly places `MONSTER` tiles (number increases with `currentFloor`).
        * `assignKey()`: Assigns one monster to hold the key (`hasKey: true`). If no monsters, tries to place a `KEY_ITEM` directly.
        * Randomly places other tiles: `ITEM` (Coins, Hearts, consumables), `TRAP`, `BARREL`, `RANDOM_ITEM`.
        * Fills remaining spots with `EMPTY` tiles.
        * Creates visual `tileObjects` for each `gridData` entry using `createTileObject`.
        * Reveals the starting `DOOR` tile and updates its neighbors' states.
    * **Tile Creation (`createTileObject`):**
        * Creates a Phaser `Container` for each tile.
        * Adds child elements: a background `Rectangle`, a main `Text` object (for icons like '?', 'X', '🕷️', '🗝️'), a stats `Text` object (for monster HP/ATK), and two status `Text` objects (for '🥦', '❄️').
        * Stores the tile's grid coordinates (`r`, `c`) in the container's data manager.
    * **Input Handling (`handlePointerDown`):**
        * Calculates which grid cell (`row`, `col`) was clicked based on pointer coordinates relative to the grid container.
        * Ignores clicks if a UI modal is active (`UIScene.isModalActive`) or `isGameOver`.
        * Calls different functions based on the clicked tile's `state` and `type`:
            * `REVEALED`: `attackMonster()`, `tryEnterDoor()`, `tryPickupItem()`, `breakBarrel()`, `stopRandomTile()`.
            * `HIDDEN_NORMAL` ('?'): Reveals the tile, updates visuals (`revealTileVisuals`), handles immediate effects (like `TRAP`), and updates neighbor states (`updateNeighborStates`). If a `MONSTER` is revealed, it blocks neighbors. If a `RANDOM_ITEM` is revealed, it starts cycling (`startRandomTileCycle`).
            * `HIDDEN_BLOCKED` ('X') / `HIDDEN_UNACCESSIBLE`: Click is ignored.
    * **Tile Visuals (`revealTileVisuals`):**
        * Updates the appearance (background color, icon text, stats text, status icons) of a specific `tileContainer` based on its corresponding `tileData` and `state`. Handles showing '?', 'X', monster icons, item icons, door state (🔒/🔓), HP/ATK, status effects, etc. Dynamically adjusts font sizes based on tile size.
    * **Interactions:**
        * `attackMonster()`: Handles player attacking a monster. Includes logic for first hit (revealing key icon), turn order (optional `monsterStrikeFirst` debug flag), status effects (poison damage, freeze skip), monster death (dropping Coin or Key Item, decrementing `monsterCount`, unblocking neighbors), and monster retaliation.
        * `tryPickupItem()`: Handles clicking revealed items. Adds gold/key/health directly or adds consumable items to `player.inventory` if space allows. Updates the tile to `EMPTY`.
        * `useItem()`: (Triggered by `UIScene`) Applies effects of items used from inventory (heal, damage all, poison all, freeze all, sheep all). Removes item if consumable.
        * `breakBarrel()`: Randomly determines barrel content (Monster, Key Monster, Key Item, Coin, Potion, Heart, or Empty). Replaces the barrel tile data/visuals with the outcome. Updates neighbors accordingly.
        * `startRandomTileCycle()`, `updateRandomTileVisual()`, `stopRandomTile()`: Manage the random item tile, cycling through icons (`update` loop) until clicked, then granting the item/effect shown. `EXPLOSIVE` damages the player.
    * **Neighbor Updates (`updateNeighborStates`):**
        * Crucial for game flow. Called when a tile is revealed or cleared.
        * Gets adjacent tiles (4-way or 8-way based on `allowDiagonal` debug flag).
        * Updates the `state` of hidden neighbors:
            * Revealing a non-monster/non-barrel makes adjacent `HIDDEN_UNACCESSIBLE` tiles `HIDDEN_NORMAL` (shows '?') unless blocked by another monster.
            * Revealing a monster makes adjacent hidden tiles `HIDDEN_BLOCKED` (shows 'X').
            * Killing a monster makes adjacent `HIDDEN_BLOCKED` tiles `HIDDEN_NORMAL` if they are now adjacent to *any* revealed non-monster tile.
        * Calls `revealTileVisuals` to update the appearance of neighbors whose state changed.
    * **Game Over (`checkGameOver`, `gameOver`):** Checks if player HP <= 0, sets `isGameOver` flag, cleans up listeners, stops `UIScene`, and starts `GameOverScene`.
    * **Debug Functions:** Provides cheats triggered via `UIScene` buttons (mark hidden tiles, change stats, kill monsters, toggle diagonal movement, fill inventory, toggle monster strike first).

* **`UIScene` (User Interface):**
    * **Purpose:** Runs alongside `GameScene` to display static and dynamic UI elements over the game grid.
    * **Elements:** Creates Phaser `Text` and `Rectangle` objects for:
        * Header: Background, HP, ATK, Gold, Floor number, Key icon (🗝️).
        * Footer: Background, Inventory slots.
        * Buttons: Help `[?]` (shows HTML instructions), Debug `[D]` (toggles debug panel).
        * Panels (Phaser Containers, initially hidden): Debug Panel, Item Use Confirmation, Floor Clear Bonus.
        * Message Text: Temporary pop-up text (e.g., "+10 Gold!", "Inventory Full!").
    * **Inventory:** Creates `MAX_INVENTORY_SLOTS` containers, each with a background rectangle and a text label. Updates icons/colors based on `player.inventory` data received from `GameScene`. Makes slots clickable (`handleInventoryClick`) if they contain an item.
    * **Panels & Modals:**
        * Manages the visibility of the HTML instructions panel and the Phaser-based panels (Debug, Item Use, Floor Clear).
        * Uses `isModalActive` flag to prevent clicks on the `GameScene` grid when any panel is open.
        * `showItemUsePanel()`: Displays item details and Use/Cancel buttons when an inventory item is clicked. Stores the `itemId` and `index` in `pendingItemUse`. Clicking 'Use' emits the `useItem` event back to `GameScene`.
        * `showFloorClearPanel()`: Shown when the player clears all monsters before using the key on the door. Clicking 'OK' emits `grantClearBonus` to `GameScene`.
    * **Communication:** Uses Phaser's event system:
        * *Listens* for events from `GameScene` (`updateStats`, `updateInventory`, `showMessage`, `showFloorClearPopup`, `resizeUI`).
        * *Emits* events to `GameScene` (`useItem`, `grantClearBonus`, debug commands).
        * Emits `uiReady` event on creation so `GameScene` knows when to send initial data.
    * **Messages (`showMessage`):** Displays text briefly in the center of the screen and fades it out using a Phaser Tween.

* **`GameOverScene`:**
    * Receives the final `floor` number from `GameScene` via `init(data)`.
    * Displays "GAME OVER", the floor reached, and a "RESTART" button.
    * Clicking "RESTART" starts the `GameScene` again.
    * Handles resize events to reposition its elements.

* **Game Initialization:**
    * Sets up the main Phaser `config` object, defining the renderer type (`Phaser.AUTO`), scaling mode (`Phaser.Scale.RESIZE` to fit the `#game-container`), parent element, and the list of scenes.
    * Creates the `Phaser.Game` instance, starting the game flow (`BootScene` -> `PreloaderScene` -> `GameScene` + `UIScene`).

**In essence, Boxelot is a tile-revealing dungeon crawler where the player explores a grid, fights monsters, collects items, finds a key, and progresses to the next floor by opening a door.** The UI provides necessary feedback and inventory management, running parallel to the core game logic.
