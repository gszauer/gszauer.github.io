const TILE_SIZE = 234;
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 7;
const BOARD_TILE_SIZE = 207;
const ICON_DIAMETER = 200;
const GRID_OFFSET = { x: 0, y: 0 };
const DOT_RADIUS = 12;
const DOT_STEP = 35;
const CORNER_RADIUS = TILE_SIZE * 0.35;
const GUARD = ICON_DIAMETER * 0.45;

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
    },
    {
        maxMoves: 5,
        pieces: [
            { unit: 'knight', color: 'white', x: 0, y: 6 },
            { unit: 'pawn', color: 'white', x: 2, y: 4 },
            { unit: 'king', color: 'black', x: 5, y: 0 },
            { unit: 'bishop', color: 'black', x: 3, y: 3 }
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
    { gx: 1, gy: 9 },
    { gx: 3, gy: 9 },
    { gx: 4, gy: 8 },
    { gx: 4, gy: 6 },
    { gx: 4, gy: 4 },
    { gx: 3, gy: 4 },
    { gx: 3, gy: 5 },
    { gx: 5, gy: 5 }
];