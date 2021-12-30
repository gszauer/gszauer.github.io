var game_context = null;
var gamebounds = null;

var game_map = null;
var game_state = null;
var player_Pos = 0;

var UNSEEN = 0
var EXPLORED = 1

var mouse_down_x = 0
var mouse_down_y = 0;

var nodeRadius = 20;
var nodePositions = [
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

function PointInCircle(point, circle_radius, circle_pos) {
    return (point[0] - circle_pos[0]) * (point[0] - circle_pos[0]) + (point[1] - circle_pos[1]) * (point[1] - circle_pos[1]) < circle_radius * circle_radius
}

function OnMouseDown(evt) {
    mouse_down_x = evt.clientX - gamebounds.left
    mouse_down_y = evt.clientY - gamebounds.top
}

function OnMouseUp(evt) {
    let mouse_up_x = evt.clientX - gamebounds.left
    let mouse_up_y = evt.clientY - gamebounds.top

    let i = 0;
    let requestDraw = false;
    for (i = 0; i < nodePositions.length; ++i) {
        if (PointInCircle([mouse_down_x, mouse_down_y], nodeRadius, nodePositions[i])) {
            if (PointInCircle([mouse_up_x, mouse_up_y], nodeRadius, nodePositions[i])) {
                game_state[i] = EXPLORED
                player_Pos = i;
                requestDraw = true
            }
        }
    }

    if (requestDraw) {
        DrawGame(game_context)
    }
}

function DrawGame(context) {
    context.fillStyle = "RGB(255, 255, 255)"
    context.lineWidth = 2;
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

    context.lineWidth = 3;

    for (i = 0; i < 20; ++i) {
        context.beginPath();
        context.arc(nodePositions[i][0], nodePositions[i][1], nodeRadius, 0, 2 * Math.PI, false);
        context.fillStyle = debugColors[game_map[i]];
        if (game_state[i] == UNSEEN) {
            context.fillStyle = 'RGB(100, 100, 100)'
        }
        else {
            context.fillStyle = debugColors[game_map[i]];
        }
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = 'RGB(30, 30, 30)';
        if (i == player_Pos) {
            context.strokeStyle = 'RGB(80, 200, 80)';
        }
        context.stroke();
    }


    context.fillStyle = "RGB(80, 80, 80)"
    context.fillRect(590, 0, 200, 800);

    context.font = '16px san-serif';

    context.beginPath();
    context.arc(620, 30, nodeRadius, 0, 2 * Math.PI, false);
    context.fillStyle = "RGB(255, 255, 255)"
    context.fill();
    context.strokeStyle = 'RGB(80, 200, 80)';
    context.stroke();
  
    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Green outline:", 650, 25 );
    context.fillText("Current room", 650, 45 );

    context.fillText("You can travel to adjacent", 600, 70 );
    context.fillText("rooms only (click to travel)", 600, 90 );

    context.beginPath();
    context.arc(620, 120, nodeRadius, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(100, 100, 100)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Gray fill:", 650, 115 );
    context.fillText("Unexplored room", 650, 135 );

    context.beginPath();
    context.arc(620, 170, nodeRadius, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(255, 0, 255)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Purple fill: Adjacent", 650, 165 );
    context.fillText("room has teleporter", 650, 185 );

    context.beginPath();
    context.arc(620, 220, nodeRadius, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(0, 0, 0)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Black fill: Adjacent", 650, 215 );
    context.fillText("room has hole", 650, 235 );

    context.beginPath();
    context.arc(620, 270, nodeRadius, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(255, 0, 0)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Red fill: Adjacent", 650, 265 );
    context.fillText("room has monster", 650, 285 );

    context.fillText("Right click to shoot monster", 600, 310 );
    context.fillText("kill monster to unlock door", 600, 330 );
}

function DriverInit() {
    game_state = [
        EXPLORED, UNSEEN, UNSEEN, UNSEEN, UNSEEN,
        UNSEEN, UNSEEN, UNSEEN, UNSEEN, UNSEEN,
        UNSEEN, UNSEEN, UNSEEN, UNSEEN, UNSEEN,
        UNSEEN, UNSEEN, UNSEEN, UNSEEN, UNSEEN
    ];
    game_state = [
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
    ];

    let game_canvas = document.getElementById('game_canvas');
    if (game_canvas && game_canvas.getContext) {
        game_context = game_canvas.getContext('2d');
        gamebounds = game_canvas.getBoundingClientRect();
        game_canvas.addEventListener('mousedown', OnMouseDown, false);
        game_canvas.addEventListener('mouseup', OnMouseUp, false);

        game_context.font = '18px serif';

        game_map = GenerateMaze();
        DebugPrintMaze(game_map);

        DrawGame(game_context);
    }
    else {
        console.log("Driver init error");
    }
}