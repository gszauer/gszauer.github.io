var game_context = null;
var gamebounds = null;

var game_map = null;

function OnMouseDown(evt) {
    let mouseX = evt.clientX - gamebounds.left
    let mouseY = evt.clientY - gamebounds.top
}

function OnMouseUp(evt) {
    let mouseX = evt.clientX - gamebounds.left
    let mouseY = evt.clientY - gamebounds.top
}

function DrawGame(game_map, context) {
    let nodeRadius = 20;
    let nodePositions = [
        [300, 40],
        [559, 228],
        [460, 532],
        [139, 532],
        [41, 228],
        [126, 256],
        [193, 164],
        [300, 130],
        [407, 164],
        [474, 256],
        [473, 367],
        [407, 459],
        [300, 493],
        [193, 459],
        [127, 368],
        [213, 339],
        [246, 238],
        [353, 238],
        [387, 339],
        [300, 403]
    ]

    context.fillStyle = "RGB(255, 255, 255)"
    context.fillRect(0, 0, 600, 800);

    let debugColors = [
        "RGB(0, 255, 0)",
        "RGB(255, 255, 255)",
        "RGB(255, 0, 255)",
        "RGB(0, 0, 0)",
        "RGB(255, 0, 0)",
        "RGB(0, 0, 255)"
    ];

    let i = 0;

    let halls = GetHallwayConnections();
    for (i = 0; i < 20; ++i) {
        let j = 0;
        for (j = 0; j < 3; ++j) {
            let h = halls[i][j];
            context.beginPath();
            context.moveTo(nodePositions[i][0], nodePositions[i][1]);
            context.lineTo(nodePositions[h][0], nodePositions[h][1]);
            context.stroke();
        }
    }

    for (i = 0; i < 20; ++i) {
        context.beginPath();
        context.arc(nodePositions[i][0], nodePositions[i][1], nodeRadius, 0, 2 * Math.PI, false);
        context.fillStyle = debugColors[game_map[i]];
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = '#003300';
        context.stroke();
    }
}

function DriverInit() {
    let game_canvas = document.getElementById('game_canvas');
    if (game_canvas && game_canvas.getContext) {
        game_context = game_canvas.getContext('2d');
        gamebounds = game_canvas.getBoundingClientRect();
        game_canvas.addEventListener('mousedown', OnMouseDown, false);
        game_canvas.addEventListener('mouseup', OnMouseUp, false);

        game_context.font = '18px serif';

        game_map = GenerateMaze();
        DebugPrintMaze(game_map);

        DebugDrawMaze(game_map, game_context);
    }
    else {
        console.log("Driver init error");
    }
}