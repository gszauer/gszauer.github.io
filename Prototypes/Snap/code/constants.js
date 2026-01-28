/**
 * constants.js - Game Constants, Enums, and Layout Values
 */

// ============================================================================
// GAME PHASES
// ============================================================================
const Phase = {
    LOCATION_REVEAL: 'location_reveal',
    PLANNING: 'planning',
    CARD_REVEAL: 'card_reveal',
    TURN_END: 'turn_end',
    GAME_OVER: 'game_over'
};

// ============================================================================
// ABILITY TYPES
// ============================================================================
const AbilityType = {
    NONE: 'none',
    ON_REVEAL: 'on_reveal',
    ONGOING: 'ongoing',
    ON_DESTROY: 'on_destroy',
    ON_DISCARD: 'on_discard',
    REACTIVE: 'reactive',
    GAME_END: 'game_end'
};

// ============================================================================
// COLOR PALETTE (from ui_design.md)
// ============================================================================
const COLORS = {
    // Background colors
    BACKGROUND: 0x0a1628,           // Deep Space Blue
    BACKGROUND_HEX: '#0a1628',

    // Primary accents
    PRIMARY: 0x00a8ff,              // Electric Blue
    PRIMARY_HEX: '#00a8ff',
    SECONDARY: 0x8b5cf6,            // Cosmic Purple
    SECONDARY_HEX: '#8b5cf6',

    // Energy
    ENERGY: 0x00d4ff,               // Bright Blue
    ENERGY_HEX: '#00d4ff',

    // UI States
    RETREAT: 0xdc2626,              // Deep Red
    RETREAT_HEX: '#dc2626',
    SUCCESS: 0x10b981,              // Emerald Green
    SUCCESS_HEX: '#10b981',
    WARNING: 0xf59e0b,              // Amber Gold
    WARNING_HEX: '#f59e0b',

    // Card rarity borders
    COMMON: 0x6b7280,               // Gray
    UNCOMMON: 0x22c55e,             // Green
    RARE: 0x3b82f6,                 // Blue
    EPIC: 0xa855f7,                 // Purple
    LEGENDARY: 0xf59e0b,            // Gold

    // Card elements
    CARD_COST: 0x3b82f6,            // Blue for cost badge
    CARD_POWER: 0xf97316,           // Orange for power badge
    CARD_POWER_BUFF: 0x22c55e,      // Green for buffed power
    CARD_POWER_DEBUFF: 0xef4444,    // Red for debuffed power

    // Text
    TEXT_PRIMARY: 0xffffff,
    TEXT_PRIMARY_HEX: '#ffffff',
    TEXT_SECONDARY: 0xcccccc,
    TEXT_SECONDARY_HEX: '#cccccc',
    TEXT_MUTED: 0x888888,
    TEXT_MUTED_HEX: '#888888',

    // Location winning states
    LOCATION_WINNING: 0x22c55e,     // Green
    LOCATION_LOSING: 0xef4444,      // Red
    LOCATION_TIED: 0xffffff         // White
};

// ============================================================================
// LAYOUT CONSTANTS (1200x1800 internal resolution)
// ============================================================================
const LAYOUT = {
    // Internal game resolution
    GAME_WIDTH: 1200,
    GAME_HEIGHT: 1800,

    // Header
    HEADER_Y: 40,
    HEADER_HEIGHT: 80,

    // Board positions (3 locations)
    BOARD_CENTER_Y: 750,
    LOCATION_SPACING: 390,
    LOCATION_WIDTH: 350,
    LOCATION_HEIGHT: 140,

    // Card slot areas (relative to location center)
    ENEMY_CARDS_Y_OFFSET: -300,     // Enemy cards above location
    PLAYER_CARDS_Y_OFFSET: 300,     // Player cards below location
    CARD_SLOT_SPACING_X: 160,       // Horizontal spacing in 2x2 grid
    CARD_SLOT_SPACING_Y: 220,       // Vertical spacing in 2x2 grid (should be >= card height)

    // Hand
    HAND_Y: 1500,
    HAND_WIDTH: 1100,
    HAND_CARD_OVERLAP: 0,           // No overlap - cards side by side
    HAND_MAX_ANGLE: 3,              // Very minor curve (degrees per card from center)

    // Bottom bar
    BOTTOM_BAR_Y: 1720,

    // Card dimensions - MUCH BIGGER
    CARD_WIDTH: 140,                // Base card width
    CARD_HEIGHT: 200,               // Base card height (2:3 ratio)
    CARD_WIDTH_HAND: 140,           // Same size in hand
    CARD_HEIGHT_HAND: 200,
    CARD_WIDTH_BOARD: 140,          // Nearly half of location width (350/2 = 175)
    CARD_HEIGHT_BOARD: 200,

    // Badge sizes
    BADGE_RADIUS: 24,
    BADGE_RADIUS_SMALL: 18,

    // Location power badge positions
    LOCATION_POWER_OFFSET_X: -160,
    ENEMY_POWER_OFFSET_Y: -50,
    PLAYER_POWER_OFFSET_Y: 50
};

// ============================================================================
// ANIMATION DURATIONS (in milliseconds)
// ============================================================================
const ANIM = {
    CARD_PLAY: 300,
    CARD_FLIP: 400,
    CARD_DESTROY: 500,
    POWER_CHANGE: 300,
    LOCATION_REVEAL: 600,
    TURN_START: 500,
    DRAW_CARD: 400,

    // Easing functions
    EASE_OUT: 'Power2',
    EASE_IN_OUT: 'Cubic.easeInOut',
    EASE_BOUNCE: 'Bounce.out'
};

// ============================================================================
// GAME RULES
// ============================================================================
const RULES = {
    MAX_TURNS: 6,
    DECK_SIZE: 12,
    STARTING_HAND: 3,
    MAX_HAND_SIZE: 7,
    CARDS_PER_LOCATION: 4,          // Per player
    NUM_LOCATIONS: 3
};

// ============================================================================
// TEXT STYLES - LARGER FONTS FOR READABILITY
// ============================================================================
const TEXT_STYLES = {
    TITLE: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '48px',
        color: COLORS.TEXT_PRIMARY_HEX,
        stroke: '#000000',
        strokeThickness: 6
    },
    HEADER: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '28px',
        color: COLORS.TEXT_PRIMARY_HEX
    },
    BUTTON: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: COLORS.TEXT_PRIMARY_HEX
    },
    CARD_NAME: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: COLORS.TEXT_PRIMARY_HEX,
        stroke: '#000000',
        strokeThickness: 3
    },
    CARD_STATS: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: COLORS.TEXT_PRIMARY_HEX,
        stroke: '#000000',
        strokeThickness: 4
    },
    LOCATION_NAME: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '22px',
        color: COLORS.TEXT_PRIMARY_HEX,
        stroke: '#000000',
        strokeThickness: 3
    },
    LOCATION_DESC: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: COLORS.TEXT_SECONDARY_HEX,
        wordWrap: { width: 300 },
        align: 'center'
    },
    POWER_BADGE: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: COLORS.TEXT_PRIMARY_HEX,
        stroke: '#000000',
        strokeThickness: 4
    },
    ENERGY: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '48px',
        color: COLORS.ENERGY_HEX,
        stroke: '#000000',
        strokeThickness: 5
    },
    TURN: {
        fontFamily: 'Arial Black, Arial',
        fontSize: '32px',
        color: COLORS.TEXT_PRIMARY_HEX
    }
};

// ============================================================================
// STARTER DECK CARD IDS (IDs match all_cards.txt)
// ============================================================================
const STARTER_DECK_IDS = [
    'C001',  // Abomination (5/9)
    'C017',  // Ant Man (1/1)
    'C055',  // Cyclops (3/5)
    'C100',  // Hawkeye (1/1)
    'C111',  // Hulk (6/14)
    'C118',  // Iron Man (5/0)
    'C120',  // Ironheart (3/0)
    'C156',  // Medusa (2/2)
    'C162',  // Misty Knight (1/3)
    'C213',  // Shocker (2/4)
    'C225',  // Star-Lord (2/2)
    'C237'   // The Thing (4/7)
];

// Alternative starter deck for variety
const STARTER_DECK_2_IDS = [
    'C015',  // Angela (2/3)
    'C050',  // Colossus (2/4)
    'C055',  // Cyclops (3/5)
    'C111',  // Hulk (6/14)
    'C124',  // Jessica Jones (4/5)
    'C156',  // Medusa (2/2)
    'C162',  // Misty Knight (1/3)
    'C190',  // Punisher (3/3)
    'C192',  // Quicksilver (1/2)
    'C208',  // Sentinel (2/3)
    'C213',  // Shocker (2/4)
    'C237'   // The Thing (4/7)
];

// ============================================================================
// BASIC LOCATION IDS (for random selection - IDs match all_locations.txt)
// ============================================================================
const BASIC_LOCATION_IDS = [
    'L077',  // Ruins - No effect
    'L006',  // Atlantis - +5 Power if only 1 card
    'L082',  // Xandar - Cards have +1 Power
    'L011',  // Bar With No Name - Lowest power wins
    'L044',  // Knowhere - On Reveal disabled
    'L043',  // Kamar-Taj - On Reveal twice
    'L080',  // Sanctum Sanctorum - Can't play cards
    'L021',  // Cloning Vats - Copy card to hand
    'L002'   // Asgard - Winner draws 2 after turn 4
];
