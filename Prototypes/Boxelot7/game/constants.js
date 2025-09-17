const TileState = {
    HIDDEN_UNACCESSIBLE: 0,
    HIDDEN_NORMAL: 1,
    HIDDEN_BLOCKED: 2,
    REVEALED: 3,
};

const TileType = {
    EMPTY: 'EMPTY',
    MONSTER: 'MONSTER',
    ITEM: 'ITEM',
    DOOR: 'DOOR',
    BARREL: 'BARREL',
    RANDOM_ITEM: 'RANDOM_ITEM',
    TRAP: 'TRAP',
    SHOP: 'SHOP',
    CHALLENGE: 'CHALLENGE',
};

const Colors = {
    BACKGROUND: 0x1a2040,
    TILE_HIDDEN: 0x5a5a5a,
    TILE_BLOCKED: 0x3a3a3a,
    TILE_EMPTY: 0x444444,
    DOOR: 0x964B00,
    BARREL: 0x8B4513,
    RANDOM_ITEM: 0x777777,
    SHOP: 0xB19CD9,
    CHALLENGE: 0xDAA520,
    MONSTER_NORMAL: 0xA02C2C,
    MONSTER_FROZEN: 0xADD8E6,
    ITEM_KEY: 0xFFD700,
    ITEM_COIN: 0xFFD700,
    ITEM_HEART: 0xFFC0CB,
    ITEM_EXPLOSIVE: 0xFF4500,
    ITEM_POTION: 0xFFC0CB,
    ITEM_SCROLL: 0xADD8E6,
    ITEM_VIAL: 0x90EE90,
    ITEM_SHEEP: 0xFFFFFF,
    ITEM_PICK: 0x808080,
    WHITE: 0xffffff,
    BLACK: 0x000000,
    RED: 0xff0000,
    GREEN: 0x00ff00,
    BLUE: 0x0000ff,
};

const Grid = {
    COLS: 5,
    ROWS: 5,
    // These will be calculated dynamically
    TILE_WIDTH: 100,
    TILE_HEIGHT: 130,
    X_OFFSET: 50,
    Y_OFFSET: 150,
    // Layout constants
    GAMEUI_HEIGHT: 170, // Combined height of UI area (previously header + footer)
    PADDING: 20,
    BOTTOM_PADDING: 20, // Configurable padding between bottom tiles and UI
};

const ChallengeType = {
    GREEDY: 'GREEDY',
    BRAVE: 'BRAVE', 
    MORTAL: 'MORTAL',
    MATERIAL: 'MATERIAL'
};

const GameSettings = {
    INVENTORY_SIZE: 8,
    LOCKED_INVENTORY_SLOTS: 2,
    GLOBAL_TILE_ICON_SCALE: 0.5,
    GLOBAL_TILE_KEY_ICON_SCALE: 0.9,
    GLOBAL_TILE_KEY_ICON_Y_OFFSET: 7,
    CLEAR_ENEMIES_ON_CONTINUE: false
};

// Monster sprite sheet configuration
const MONSTER_SPRITE_CONFIG = {
    FRAME_WIDTH: 256,
    FRAME_HEIGHT: 256,
    TOTAL_WIDTH: 512,   // 2x2 grid of frames
    TOTAL_HEIGHT: 512   // 2x2 grid of frames
};

// Domain protection configuration
const DomainProtection = {
    ALLOWED_DOMAINS: [
        'localhost',
        '127.0.0.1',
        'gabormakesgames.com',
        'www.gabormakesgames.com',
        'gszauer.github.io',
        'www.gszauer.github.io',
        'gaborszauer.com',
        'www.gaborszauer.com',
    ],

    DEVELOPMENT_DOMAINS: [
        'localhost',
        '127.0.0.1',
    ],

    SAFE_URL_KEYS: [
        'crazygames',
    ],
    
    getErrorMessage: function(currentDomain, currentUrl, referrer,
        isDomainAuthorized = 'not provided',
        isFrameAuthorized = 'not provided',
        hasValidReferrer = 'not provided',
        isPiracySite = 'not provided',
        isSecureProtocol = 'not provided'
    ) {
        return `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                z-index: 10000;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            ">
                <h1 style="color: #ff6b6b; margin-bottom: 20px; font-size: 2.5em;">🚫 Unauthorized Domain 🚫</h1>
                <h2 style="margin-bottom: 30px; font-size: 1.5em;">This game is not authorized to run on this domain.</h2>
                
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    max-width: 600px;
                ">
                    <p style="margin: 5px 0; font-size: 0.9em; color: #ff6b6b;">
                        <strong>Current Domain:</strong> ${currentDomain}
                    </p>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #ff6b6b;">
                        <strong>Current URL:</strong> ${currentUrl.substring(0, 50)}${currentUrl.length > 50 ? '...' : ''}
                    </p>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #ff6b6b;">
                        <strong>Referrer:</strong> ${referrer || 'Direct Access'}
                    </p>
                    <!--p style="margin: 5px 0; font-size: 0.9em; color: #ff6b6b;">
                        <strong>isDomainAuthorized:</strong> ${isDomainAuthorized}, 
                        <b>isFrameAuthorized:</b> ${isFrameAuthorized}, 
                        <b>hasValidReferrer:</b> ${hasValidReferrer}, 
                        <b>isPiracySite:</b> ${isPiracySite}, 
                        <b>isSecureProtocol:</b> ${isSecureProtocol}, 
                    </p-->
                </div>
                
                <p style="font-size: 1.2em; margin-bottom: 30px; line-height: 1.6;">
                    Play at:<br>
                    <a href="https://gabormakesgames.com/Prototypes/Boxelot3/" style="
                        color: #4ecdc4;
                        text-decoration: none;
                        font-weight: bold;
                        font-size: 1.3em;
                        border: 2px solid #4ecdc4;
                        padding: 12px 24px;
                        border-radius: 8px;
                        display: inline-block;
                        margin-top: 15px;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#4ecdc4'; this.style.color='#1a1a2e';"
                       onmouseout="this.style.background='transparent'; this.style.color='#4ecdc4';">
                        gabormakesgames.com/Prototypes/Boxelot3
                    </a>
                </p>
            </div>
        `;
    }
};

function IsDevEnv() {
    const currentDomain = window.location.hostname;
    const isDomainAuthorized = DomainProtection.DEVELOPMENT_DOMAINS.includes(currentDomain);
    return isDomainAuthorized;
}