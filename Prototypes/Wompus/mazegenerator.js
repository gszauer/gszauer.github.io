var START = 0;
var EMPTY = 1;
var TELEPORT = 2;
var HOLE = 3;
var MONSTER = 4;
var STAIRS = 5;

function GetHallwayConnections() {
	let halls = [ // Layout: https://en.wikipedia.org/wiki/Hunt_the_Wumpus#/media/File:Hunt_the_Wumpus_map.svg
		/*01*/ [2  - 1, 8  - 1, 5  - 1],
		/*02*/ [1  - 1, 3  - 1, 10 - 1],
		/*03*/ [2  - 1, 4  - 1, 12 - 1],
		/*04*/ [3  - 1, 5  - 1, 14 - 1],
		/*05*/ [1  - 1, 4  - 1, 6  - 1],
		/*06*/ [7  - 1, 15 - 1, 5  - 1],
		/*07*/ [8  - 1, 6  - 1, 17 - 1],
		/*08*/ [7  - 1, 9  - 1, 1  - 1],
		/*09*/ [8  - 1, 10 - 1, 18 - 1],
		/*10*/ [9  - 1, 11 - 1, 2  - 1],
		/*11*/ [10 - 1, 12 - 1, 19 - 1],
		/*12*/ [11 - 1, 13 - 1, 3  - 1],
		/*13*/ [12 - 1, 14 - 1, 20 - 1],
		/*14*/ [15 - 1, 13 - 1, 4  - 1],
		/*15*/ [6  - 1, 14 - 1, 16 - 1],
		/*16*/ [17 - 1, 20 - 1, 15 - 1],
		/*17*/ [7  - 1, 16 - 1, 18 - 1],
		/*18*/ [17 - 1, 19 - 1, 9  - 1],
		/*19*/ [18 - 1, 20 - 1, 11 - 1],
		/*20*/ [13 - 1, 16 - 1, 19 - 1],
	];
	return halls;
}

function GenerateMaze() {
	let rooms = [
		START, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, 
		EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
		EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
		EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY
	];

	let halls = GetHallwayConnections();

	let ConnectsTo = function (index, type) {
		return (rooms[halls[index][0]] == type || 
				rooms[halls[index][1]] == type ||
				rooms[halls[index][2]] == type);
	}

	let IsEmpty = function (index) {
		return rooms[index] == EMPTY;
	}

	let NumEscapeRoutes = function () {
		let escape = 3;
		let i = 0;
		for (i = 0; i < 20; ++i) {
			if (rooms[i] == STAIRS) {
				if (!IsEmpty(halls[i][0])) {
					escape -= 1;
				}
				if (!IsEmpty(halls[i][1])) {
					escape -= 1;
				}

				if (!IsEmpty(halls[i][2])) {
					escape -= 1;
				}
				break;
			}
		}
		return escape;
	}

	let ConnectsToObstacle = function (index) {
		let i = 0;
		for (i = 0; i < 3; ++i) {
			if (rooms[halls[index][i]] == TELEPORT) {
				return true;
			}
			if (rooms[halls[index][i]] == HOLE) {
				return true;
			}
			if (rooms[halls[index][i]] == MONSTER) {
				return true;
			}
		}

		return false;
	}

	// Removing 0, 1, 4 and 7 makes it so we can't place obstacles in the starting point, or one of the connected rooms
	let available = [2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

	// Place stairs
	{
		let downstairsRandom = Math.floor(Math.random() * available.length);
		let downstairsIndex = available[downstairsRandom];

		rooms[downstairsIndex] = STAIRS;
		available.splice(downstairsRandom, 1);

		// We need at least one escape route, generate a random and delete it
		let escapeRandom = Math.floor(Math.random() * 3);
		let escapeIndex = halls[downstairsIndex][escapeRandom];
		if (available.indexOf(escapeIndex) >= 0) {
			available.splice(available.indexOf(escapeIndex), 1);
		}
	}


	// Place monster
	{
		let monsterRandom = Math.floor(Math.random() * available.length);
		let monsterIndex = available[monsterRandom];
		
		rooms[monsterIndex] = MONSTER;
		available.splice(monsterRandom, 1);

		// We need at least one route to kill the monster
		let killRandom = Math.floor(Math.random() * 3);
		let killIndex = halls[monsterIndex][killRandom];
		if (available.indexOf(killIndex) >= 0) {
			available.splice(available.indexOf(killIndex), 1);
		}
	}

	// Place teleporters
	let i = 0;
	for (i = 0; i < 2; ++i) { 
		while (true) {
			let teleportRandom = Math.floor(Math.random() * available.length);
			let teleportIndex = available[teleportRandom];

			if (ConnectsTo(teleportIndex, STAIRS)) { // First teleporter doesn't actually need this
				if (NumEscapeRoutes() <= 1) {
					continue;
				}
			}

			if (ConnectsToObstacle(teleportIndex)) {
				continue;
			}
			
			rooms[teleportIndex] = TELEPORT;
			available.splice(teleportRandom, 1);
			
			break;
		}
	}

	// Place holes
	for (i = 0; i < 2; ++i) { 
		while (true) {
			let holeRandom = Math.floor(Math.random() * available.length);
			let holeIndex = available[holeRandom];

			if (ConnectsTo(holeIndex, STAIRS)) { // First teleporter doesn't actually need this
				if (NumEscapeRoutes() <= 1) {
					continue;
				}
			}

			if (ConnectsToObstacle(holeIndex)) {
				continue;
			}
			
			rooms[holeIndex] = HOLE;
			available.splice(holeRandom, 1);

			break;
		}
	}

	return rooms;
}

function DebugPrintMaze(rooms) {
	let i = 0;
	for (i = 0; i < 20; ++i) {
		let type = "EMPTY";
		if (rooms[i] == START) {
			type = "START";
		}
		else if (rooms[i] == TELEPORT) {
			type = "TELEPORT";
		}
		else if (rooms[i] == HOLE) {
			type = "HOLE";
		}
		else if (rooms[i] == MONSTER) {
			type = "MONSTER";
		}
		else if (rooms[i] == STAIRS) {
			type = "STAIRS";
		}
		console.log(i + ": " + type);
	}
}

function DebugDrawMaze(game_map, context) {
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

    let debugStrings = [
         "START",
	     "EMPTY",
	     "TELEPORT",
	     "HOLE",
	     "MONSTER",
	     "STAIRS",
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


    context.fillStyle = "RGB(100, 100, 100)"
    context.fillRect(590, 0, 200, 800);

    context.font = '30px san-serif';
    for (i = 0; i < debugStrings.length; ++i) {
	    context.fillStyle = debugColors[i];
		context.fillText(debugStrings[i], 600, 150 + i * 50);
	}
}

function DebugShowMaze(contextName) {
	let game_canvas = document.getElementById(contextName);
    if (game_canvas && game_canvas.getContext) {
        let game_context = game_canvas.getContext('2d');
        gamebounds = game_canvas.getBoundingClientRect();
        game_context.font = '18px serif';
        game_map = GenerateMaze();
        DebugDrawMaze(game_map, game_context);
    }
    else {
        console.log("Can't show maze");
    }
}

function DebugVerifyMaze() {
	let halls = GetHallwayConnections();
	let numAttempts = 1000000;
	for (let i = 0; i < numAttempts; ++i) {
		let maze = GenerateMaze();
		let exitIndex = -1;
		let monsterIndex = -1;

		for (let j = 0; j < 20; ++j) {
			if (maze[j] == STAIRS) {
				exitIndex = j;
			}
			if (maze[j] == MONSTER) {
				monsterIndex = j;
			}
			if (exitIndex >= 0 && monsterIndex >= 0) {
				break;
			}
		}

		let monsterHasEmpty = false;
		let exitHasEmpty = false;
		for (let j = 0; j < 3; ++j) {
			let monsterHallIndex = halls[monsterIndex][j];
			let exitHallIndex = halls[exitIndex][j];
			if (maze[monsterHallIndex] == EMPTY) {
				monsterHasEmpty = true;
			}
			if (maze[exitHallIndex] == EMPTY) {
				exitHasEmpty = true;
			}
		}
		if (!monsterHasEmpty) {
			console.log("Incorrect, monster does not have empty");
			return;
		}
		if (!exitHasEmpty) {
			console.log("Incorrect, exit does not have empty");
			return;
		}
	}

	console.log("Correct across " + numAttempts + " attempts");
}