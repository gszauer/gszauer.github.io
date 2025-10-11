const TILE_SIZE = 234;
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 7;
const BOARD_TILE_SIZE = 233;//207;
const ICON_DIAMETER = 200;
const GRID_OFFSET = { x: 0, y: 0 };
const TAP_INDICATOR_OFFSET = { x: 80, y: -160 };
const DOT_RADIUS = 12;
const DOT_STEP = 35;
const CORNER_RADIUS = TILE_SIZE * 0.35;
const GUARD = ICON_DIAMETER * 0.45;

const COLORS = {
   // level selectors (use these keys as before)
  gold: 0xFFFFFF,      // unlocked → white checker
  silver: 0x000000,    // locked   → black checker
  grayEdge: 0x3E2A1F,  // dark rim/outline for pieces

  // board squares (warm wood tones)
  darkSquare: 0x7B5133, // dark wood
  lightSquare: 0xCDAB7E, // light wood (slightly richer/darker)


    highlight: 0xF6F669,
    attackHighlight: 0xFF6B6B,
    captureHighlight: 0xFF6666,
    enemyMoveHighlight: 0xFF6666
};

const LEVELS = [
    {
        pieces: [
            { unit: 'knight', color: 'white', x: 1, y: 0 },
            { unit: 'king', color: 'black', x: 2, y: 2 }
        ]
    },
    {
        pieces: [
           { unit: 'knight', color: 'white', x: 3, y: 3 },
            { unit: 'king', color: 'black', x: 4, y: 1 }
        ]
    },
    { // DONE, lvl 3
        pieces: [
            { unit: 'knight', color: 'white', x: 0, y: 6 },
            { unit: 'pawn', color: 'black', x: 1, y: 4 },
            { unit: 'pawn', color: 'black', x: 4, y: 3 },
            { unit: 'king', color: 'black', x: 5, y: 1 }
        ]
    },
    { // DONE, lvl 4
        pieces: [
            { unit: 'knight', color: 'white', x: 4, y: 6 },
            { unit: 'pawn', color: 'black', x: 2, y: 5 },
            { unit: 'pawn', color: 'black', x: 2, y: 1 },
            { unit: 'king', color: 'black', x: 4, y: 0 },
        ]
    },
    { // DONE, lvl 5
        pieces: [
            { unit: 'knight', color: 'white', x: 4, y: 6 },
            { unit: 'pawn', color: 'black', x: 2, y: 5 },
            { unit: 'pawn', color: 'black', x: 1, y: 3 },
            { unit: 'pawn', color: 'black', x: 3, y: 2 },
            { unit: 'king', color: 'black', x: 4, y: 0 },
        ]
    },
    { // DONE, lvl 6
        pieces: [
            { unit: 'knight', color: 'white', x: 3, y: 5 },
            { unit: 'pawn', color: 'black', x: 1, y: 4 },
            { unit: 'pawn', color: 'black', x: 2, y: 2 },
            { unit: 'king', color: 'black', x: 3, y: 3 },
        ]
    },
    { // DONE, lvl 7
        pieces: [
            { unit: 'knight', color: 'white', x: 0, y: 5 },
            { unit: 'rook', color: 'black', x: 3, y: 4 },
            { unit: 'rook', color: 'black', x: 4, y: 3 },
            { unit: 'king', color: 'black', x: 3, y: 1 },
        ]
    },
    { // DONE, lvl 8
        pieces: [
            { unit: 'knight', color: 'white', x: 3, y: 5 },
            { unit: 'rook', color: 'black', x: 4, y: 4 },
            { unit: 'rook', color: 'black', x: 1, y: 6 },
            { unit: 'king', color: 'black', x: 3, y: 2 },
        ]
    },
    { // DONE, lvl 9
        pieces: [
            { unit: 'knight', color: 'white', x: 0, y: 5 },
            {   unit: 'pawn', color: 'white', x: 3, y: 6 },
            {   unit: 'rook', color: 'black', x: 2, y: 4 },
            {   unit: 'rook', color: 'black', x: 1, y: 2 },
            {   unit: 'rook', color: 'black', x: 2, y: 0 },
            {   unit: 'king', color: 'black', x: 3, y: 1 },
        ]
    },
    { // DONE, lvl 10 
        pieces: [
            { unit: 'knight', color: 'white', x: 2, y: 5 },
            { unit: 'rook', color: 'white', x: 1, y: 6 },
            { unit: 'pawn', color: 'black', x: 1, y: 3 },
            { unit: 'rook', color: 'black', x: 4, y: 3 },
            { unit: 'rook', color: 'black', x: 3, y: 0 },
            { unit: 'rook', color: 'white', x: 5, y: 4 },
            { unit: 'king', color: 'black', x: 3, y: 4 },
        ]
    },
    { // DONE, lvl 11
        pieces: [
            { unit: 'knight', color: 'white', x: 1, y: 6 },
            { unit: 'bishop', color: 'black', x: 1, y: 2 },
            { unit: 'bishop', color: 'black', x: 4, y: 2 },
            { unit: 'king', color: 'black', x: 5, y: 5 },
        ]
    },
    { // Done, lvl 12
        pieces: [
            { unit: 'knight', color: 'white', x: 2, y: 4 },
            { unit: 'pawn', color: 'white', x: 2, y: 6 },
            { unit: 'pawn', color: 'white', x: 4, y: 4 },
            { unit: 'king', color: 'black', x: 2, y: 0 },
            { unit: 'rook', color: 'black', x: 2, y: 1 },
            { unit: 'bishop', color: 'black', x: 3, y: 2 },
            { unit: 'bishop', color: 'black', x: 4, y: 1 },
        ]
    },
    { // Done, lvl 13
        pieces: [
            { unit: 'knight', color: 'white', x: 3, y: 5 },
            { unit: 'bishop', color: 'white', x: 3, y: 6 },
            { unit: 'bishop', color: 'black', x: 2, y: 1 },
            { unit: 'bishop', color: 'black', x: 0, y: 3 },
            { unit: 'bishop', color: 'black', x: 4, y: 3 },
            { unit: 'king', color: 'black', x: 2, y: 4 },
        ]
    },
    { // Done, lvl 14
        pieces: [
            { unit: 'king', color: 'black', x: 3, y: 4 },
            { unit: 'knight', color: 'white', x: 3, y: 5 },
            { unit: 'rook', color: 'black', x: 0, y: 6 },
            { unit: 'pawn', color: 'black', x: 0, y: 3 },
        ]
    },
    { // Done, lvl 15
        pieces: [
            { unit: 'knight', color: 'white', x: 0, y: 6 },
            { unit: 'bishop', color: 'black', x: 0, y: 0 },
            { unit: 'bishop', color: 'black', x: 5, y: 6 },
            { unit: 'king', color: 'black', x: 5, y: 0 },
        ]
    },
    { // Done, lvl 16
        pieces: [
            { unit: 'knight', color: 'white', x: 3, y: 6 },
            { unit: 'pawn', color: 'white', x: 2, y: 6 },
            { unit: 'rook', color: 'black', x: 0, y: 4 },
            { unit: 'bishop', color: 'black', x: 1, y: 5 },
            { unit: 'bishop', color: 'black', x: 1, y: 0 },
            { unit: 'bishop', color: 'black', x: 4, y: 4 },
            { unit: 'king', color: 'black', x: 5, y: 0 },
        ]
    },
    { // Done, lvl 17
        pieces: [
            { unit: 'king', color: 'black', x: 3, y: 4 },
            { unit: 'rook', color: 'white', x: 5, y: 5 },
            { unit: 'knight', color: 'white', x: 3, y: 5 },
            { unit: 'rook', color: 'black', x: 0, y: 6 },
            { unit: 'pawn', color: 'black', x: 0, y: 3 },
            { unit: 'bishop', color: 'white', x: 2, y: 0 },
            { unit: 'bishop', color: 'black', x: 5, y: 1  },
        ]
    },
    { // Done, Lvl 18
        pieces: [
            { unit: 'knight', color: 'white', x: 2, y: 5 },
            { unit: 'bishop', color: 'black', x: 1, y: 2 },
            { unit: 'bishop', color: 'black', x: 2, y: 0 },
            { unit: 'bishop', color: 'black', x: 4, y: 1 },
            { unit: 'bishop', color: 'black', x: 4, y: 4 },
            { unit: 'king', color: 'black', x: 5, y: 4 },
        ]
    },
];

const LEVEL_POSITIONS = [
    { gx: 1, gy: 10 }, // 1
    { gx: 3, gy: 10 },
    { gx: 4, gy: 9 },
    { gx: 4, gy: 7 },
    { gx: 4, gy: 5 },  // 5
    { gx: 3, gy: 6 },
    { gx: 3, gy: 8 },
    { gx: 2, gy: 9 },
    { gx: 0, gy: 9 },
    { gx: 0, gy: 7 }, // 10
    { gx: 1, gy: 6 }, 
    { gx: 2, gy: 5 }, 
    { gx: 1, gy: 4 }, 
    { gx: 3, gy: 4 }, 
    { gx: 5, gy: 4 }, // 15
    { gx: 5, gy: 6 }, 
    { gx: 5, gy: 8 }, 
    { gx: 5, gy: 10 }, 
];