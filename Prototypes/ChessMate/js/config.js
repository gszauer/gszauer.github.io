const TILE_SIZE = 200;
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 7;
const BOARD_TILE_SIZE = 80;
const ICON_DIAMETER = 150;
const GRID_OFFSET = { x: 90, y: 150 };
const DOT_RADIUS = 7;
const DOT_STEP = 18;
const CORNER_RADIUS = TILE_SIZE * 0.35;
const GUARD = ICON_DIAMETER * 0.56;

const COLORS = {
    gold: 0xF2C94C,
    silver: 0xC0C0C0,
    grayEdge: 0x8E8E8E,
    darkSquare: 0x769656,
    lightSquare: 0xEEEED2,
    highlight: 0xF6F669,
    attackHighlight: 0xFF6B6B,
    captureHighlight: 0xFFA500,
    enemyMoveHighlight: 0xFF6666
};

const LEVELS = [
    {
        maxMoves: 3,
        pieces: [
            { unit: 'knight', color: 'white', x: 2, y: 3 },
            { unit: 'king', color: 'black', x: 4, y: 1 }
        ]
    },
    {
        maxMoves: 4,
        pieces: [
            { unit: 'knight', color: 'white', x: 1, y: 5 },
            { unit: 'king', color: 'black', x: 4, y: 1 },
            { unit: 'pawn', color: 'black', x: 3, y: 2 },
            { unit: 'pawn', color: 'black', x: 4, y: 2 }
        ]
    },
    {
        maxMoves: 5,
        pieces: [
            { unit: 'knight', color: 'white', x: 0, y: 6 },
            { unit: 'pawn', color: 'white', x: 2, y: 4 },
            { unit: 'king', color: 'black', x: 5, y: 0 },
            { unit: 'bishop', color: 'black', x: 3, y: 3 }
        ]
    }
];

const LEVEL_POSITIONS = [
    { gx: 0, gy: 2 },
    { gx: 1, gy: 2 },
    { gx: 2, gy: 3 },
    { gx: 3, gy: 3 },
    { gx: 4, gy: 2 },
    { gx: 4, gy: 4 },
    { gx: 3, gy: 5 }
];