var game_context = null;
var gamebounds = null;

var game_map = null;
var game_state = null;
var player_pos = 0;
var game_over = false;
var hunted = false
var monster_killed = false;

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
    evt.preventDefault();
    mouse_down_x = evt.clientX - gamebounds.left
    mouse_down_y = evt.clientY - gamebounds.top
    return false;
}

function OnMouseUp(evt) {
    if (evt.button == 2) {
        return false;
    }
    if (game_over) {
        DriverInit();

        return false;
    }
    evt.preventDefault();
    let mouse_up_x = evt.clientX - gamebounds.left
    let mouse_up_y = evt.clientY - gamebounds.top
    let halls = GetHallwayConnections();

    let i = 0;
    let requestDraw = false;
    for (i = 0; i < nodePositions.length; ++i) {
        if (PointInCircle([mouse_down_x, mouse_down_y], nodeRadius, nodePositions[i])) {
            if (PointInCircle([mouse_up_x, mouse_up_y], nodeRadius, nodePositions[i])) {
                if (player_pos == halls[i][0] || player_pos == halls[i][1] || player_pos == halls[i][2]) {
                    game_state[i] = EXPLORED
                    player_pos = i;
                    requestDraw = true
                    if (game_map[i] == STAIRS && monster_killed) {
                        game_over = true;
                        console.log("FINISHED LEVEL");
                    }
                    else if (game_map[i] == MONSTER) {
                        game_over = true;
                        console.log("KILLED BY MONSTER");
                    }
                    else if (game_map[i] == HOLE) {
                        game_over = true;
                        console.log("KILLED BY HOLE");
                    }
                    else if (game_map[i] == TELEPORT) {
                        while (true) {
                            let randomRoom = Math.floor(Math.random() * game_map.length);
                            if (game_map[randomRoom] == EMPTY) {
                                game_state[randomRoom] = EXPLORED;
                                player_pos = randomRoom;
                                console.log("teleported to: " + randomRoom);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    if (requestDraw) {
        DrawGame(game_context)
    }

    return false;
}

function OnRightClick(evt) {
    if (game_over) {
        return false;
    }
    evt.preventDefault();
    let mouse_up_x = evt.clientX - gamebounds.left
    let mouse_up_y = evt.clientY - gamebounds.top
    let halls = GetHallwayConnections();

    let i = 0;
    let requestDraw = false;
    for (i = 0; i < nodePositions.length; ++i) {
        if (PointInCircle([mouse_down_x, mouse_down_y], nodeRadius, nodePositions[i])) {
            if (PointInCircle([mouse_up_x, mouse_up_y], nodeRadius, nodePositions[i])) {
                if (player_pos == halls[i][0] || player_pos == halls[i][1] || player_pos == halls[i][2]) {
                    if (game_map[i] == MONSTER) {
                        game_state[i] = EXPLORED
                        game_map[i] = EMPTY;
                        player_pos = i;
                        requestDraw = true
                        monster_killed = true;
                        console.log("killed monster");
                    }
                }
            }
        }
    }

    if (!monster_killed) {
        game_over = true
        hunted = true
        requestDraw = true
    }

    if (requestDraw) {
        DrawGame(game_context)
    }

    return false;
}

function IsEmpty(index) {
    return game_map[index] == EMPTY || game_map[index] == START || game_map[index] == STAIRS
}

function DrawNode(index, context) {
    let halls = GetHallwayConnections();

    let empty0 = IsEmpty(halls[index][0]);
    let empty1 = IsEmpty(halls[index][1]);
    let empty2 = IsEmpty(halls[index][2]);

    let debugColors = [
        "RGB(0, 255, 0)",
        "RGB(255, 255, 255)",
        "RGB(255, 0, 255)",
        "RGB(0, 0, 0)",
        "RGB(255, 0, 0)",
        "RGB(0, 0, 255)"
    ];

    if (empty0 && empty1 && empty2) { // Pure white
        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, 2 * Math.PI, false);
        context.fillStyle = 'RGB(255, 255, 255)'
        context.fill();
    }
    else if (!empty0 && empty1 && empty2) { // Color of 0
        let notEmpty = game_map[halls[index][0]]
        
        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, 2 * Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();
    }
    else if (empty0 && !empty1 && empty2) {  // Color of 1
        let notEmpty = game_map[halls[index][1]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, 2 * Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();
       
    }
    else if (empty0 && empty1 && !empty2) { // Color of 2
        let notEmpty = game_map[halls[index][2]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, 2 * Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();
        
    }
    else if (!empty0 && !empty1 && empty2) {
        let notEmpty = game_map[halls[index][0]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();

        notEmpty = game_map[halls[index][1]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, Math.PI, 2 * Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();
    }
    else if (!empty0 && empty1 && !empty2) {
        let notEmpty = game_map[halls[index][0]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();

        notEmpty = game_map[halls[index][2]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, Math.PI, 2 * Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();
    }
    else if (empty0 && !empty1 && !empty2) {
        let notEmpty = game_map[halls[index][1]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();

        notEmpty = game_map[halls[index][2]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, Math.PI, 2 * Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.fill();
    }
    else { // Three colors
        let third = (2.0 * Math.PI) / 3.0

        let notEmpty = game_map[halls[index][0]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 0, third, false);
        context.fillStyle = debugColors[notEmpty];
        context.lineTo(nodePositions[index][0], nodePositions[index][1]);
        context.fill();

        notEmpty = game_map[halls[index][1]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, third, 2 * third, false);
        context.fillStyle = debugColors[notEmpty];
        context.lineTo(nodePositions[index][0], nodePositions[index][1]);
        context.fill();

        notEmpty = game_map[halls[index][2]]

        context.beginPath();
        context.arc(nodePositions[index][0], nodePositions[index][1], nodeRadius, 2 * third, 2 * Math.PI, false);
        context.fillStyle = debugColors[notEmpty];
        context.lineTo(nodePositions[index][0], nodePositions[index][1]);
        context.fill();
    }
}

function DrawGame(context) {
    context.fillStyle = "RGB(255, 255, 255)"
    context.lineWidth = 2;
    context.fillRect(0, 0, 800, 600);

    if (game_over) {
        if (monster_killed) {
            context.fillStyle = 'RGB(0, 0, 0)'
            context.fillText("Floor cleared", 400, 290 );
            context.fillText("Click to go next level", 400, 310 );
        }
        else if (hunted) {
            context.fillStyle = 'RGB(0, 0, 0)'
            context.fillText("Hunted by monster", 400, 290 );
            context.fillText("Click to restert", 400, 310 );
        }
        else if (game_map[player_pos] == MONSTER) {
            context.fillStyle = 'RGB(0, 0, 0)'
            context.fillText("Killed by monster", 400, 290 );
            context.fillText("Click to restert", 400, 310 );
        }
        else if (game_map[player_pos] == HOLE) {
            context.fillStyle = 'RGB(0, 0, 0)'
            context.fillText("Fell in hole", 400, 290 );
            context.fillText("Click to restert", 400, 310 );
        }
        return;
    }

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
       if (game_state[i] == UNSEEN) {
            context.beginPath();
            context.arc(nodePositions[i][0], nodePositions[i][1], nodeRadius, 0, 2 * Math.PI, false);
            context.fillStyle = debugColors[game_map[i]];
            context.fillStyle = 'RGB(100, 100, 100)'
            context.fill();
        }
        else {
            DrawNode(i, context);
        }

        
        context.beginPath();
        context.arc(nodePositions[i][0], nodePositions[i][1], nodeRadius, 0, 2 * Math.PI, false);
        context.lineWidth = 3;
        context.strokeStyle = 'RGB(30, 30, 30)';
        if (i == player_pos) {
            context.strokeStyle = 'RGB(80, 200, 80)';
        }
        context.stroke();
    }

    for (i = 0; i < 20; ++i) {
        if (game_map[i] == EMPTY || game_map[i] == START) {
            continue;
        }
        if (game_state[i] == UNSEEN) {
            if (!monster_killed) {
                continue;
            }
            else {
                if (game_map[i] != STAIRS) {
                    continue;
                }
            }
        }
        context.beginPath();
        context.arc(nodePositions[i][0], nodePositions[i][1], nodeRadius * 0.5, 0, 2 * Math.PI, false);
        context.fillStyle = debugColors[game_map[i]];
        context.fill();
        
        context.beginPath();
        context.arc(nodePositions[i][0], nodePositions[i][1], nodeRadius * 0.5, 0, 2 * Math.PI, false);
        context.lineWidth = 1;
        context.strokeStyle = 'RGB(100, 100, 100)';
        context.stroke();
    }

    context.fillStyle = "RGB(80, 80, 80)"
    context.fillRect(590, 0, 200, 800);

    context.font = '16px san-serif';

    context.beginPath();
    context.arc(620, 30, nodeRadius, 0, 2 * Math.PI, false);
    context.fillStyle = "RGB(170, 170, 170)"
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

    context.beginPath();
    context.arc(620, 350, nodeRadius * 0.5, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(255, 0, 0)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Small red: monster", 640, 355 );

    context.beginPath();
    context.arc(620, 380, nodeRadius * 0.5, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(255, 0, 255)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Small purple: teleport", 640, 385 );

    context.beginPath();
    context.arc(620, 410, nodeRadius * 0.5, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(0, 0, 0)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Small black: hole", 640, 415 );

    context.beginPath();
    context.arc(620, 440, nodeRadius * 0.5, 0, 2 * Math.PI, false);
    context.fillStyle = 'RGB(0, 0, 255)'
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'RGB(30, 30, 30)';
    context.stroke();

    context.fillStyle = 'RGB(255, 255, 255)'
    context.fillText("Small blue: stairs", 640, 445 );

    context.fillText("Kill monster, then go to", 600, 475 );
    context.fillText("stairs to exit level", 600, 495 );

    if (monster_killed) {
        context.fillText("Exit unlocked", 600, 550 );
    }
    else {
        context.fillText("Exit locked", 600, 550 );
    }

}

function DriverInit() {
    game_context = null;
    gamebounds = null;
    game_map = null;
    game_state = null;
    player_pos = 0;
    game_over = false;
    monster_killed = false;
    hunted = false
    mouse_down_x = 0
    mouse_down_y = 0;

    game_state = [
        EXPLORED, UNSEEN, UNSEEN, UNSEEN, UNSEEN,
        UNSEEN, UNSEEN, UNSEEN, UNSEEN, UNSEEN,
        UNSEEN, UNSEEN, UNSEEN, UNSEEN, UNSEEN,
        UNSEEN, UNSEEN, UNSEEN, UNSEEN, UNSEEN
    ];
    /*game_state = [
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
        EXPLORED, EXPLORED, EXPLORED, EXPLORED, EXPLORED,
    ];*/

    let game_canvas = document.getElementById('game_canvas');
    if (game_canvas && game_canvas.getContext) {
        game_context = game_canvas.getContext('2d');
        gamebounds = game_canvas.getBoundingClientRect();
        game_canvas.addEventListener('mousedown', OnMouseDown, false);
        game_canvas.addEventListener('mouseup', OnMouseUp, false);
        game_canvas.addEventListener('contextmenu', OnRightClick, false);

        game_context.font = '18px serif';

        game_map = GenerateMaze();
        //DebugPrintMaze(game_map);

        DrawGame(game_context);
    }
    else {
        console.log("Driver init error");
    }
}