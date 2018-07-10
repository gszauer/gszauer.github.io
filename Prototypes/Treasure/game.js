function GetRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function GetPlayer(game_state) {
	return game_state.field[game_state.player_position.row][game_state.player_position.col];
}

function NewGameState() {
	var game_state = {
		player_position: { row: 1, col: 1},
		field: [
			[null, null, null],
			[null, null, null],
			[null, null, null]
		],
		states: {
			PLAYING: 1,
			PAUSE_INPUT : 2,
			DEAD: 3
		},
		gold: 0,
		active_state: 1,
		num_moves: 0,
		action_queue: [],
		request_new: false
	}

	return JSON.parse(JSON.stringify(game_state));
}

function AddAction(game_state, name, data1, data2, data3, data4) {
	var action = null;

	if (name == "fade") {
		action = {
			row: data1,
			col: data2,
			t: 0.0
		}
	}
	else if (name == "spawn") {
		action = {
			row: data1,
			col: data2,
			t: 0.0
		}
	}
	else if (name == "move") {
		action = {
			start_row: data1,
			start_col: data2,
			end_row: data3,
			end_col: data4,
			t: 0.0
		}
	}
	else if (name == "callout") {
		action = {
			row: data1,
			col: data2,
			t: 0.0
		}
	}

	if (action == null) {
		alert("Assert trying to add a null action")
	}
	else {
		action.name = name
		game_state.action_queue.push(action);
	}
}

function ProcessGameQueue(game_state, dt) {
	var queue = game_state.action_queue;

	if (queue.length == 0) {
		return;
	}

	var action = queue[0];
	if (action.name == "fade" || action.name == "spawn" || action.name == "callout") {
		if (game_state.field[action.row][action.col] == null) {
			var debug="break";
		}
		game_state.field[action.row][action.col].draw = false;
	}
	else if (action.name == "move") {
		if (game_state.field[action.start_row][action.start_col] != null) {
			game_state.field[action.start_row][action.start_col].draw = false;
		}
		if (game_state.field[action.end_row][action.end_col] != null) {
			game_state.field[action.end_row][action.end_col].draw = false;
		}
	}

	action.t += dt * 2;
	if (action.name == "callout") {
		action.t += dt * 2;
	}


	if (action.t > 1) {
		action.t = 1
	}

	if (action.t >= 1.0) {
		if (action.name == "fade") {
			game_state.field[action.row][action.col] = null
		}
		else if (action.name == "spawn" || action.name == "callout") {
			game_state.field[action.row][action.col].draw = true
		}
		else if (action.name == "move") {
			var s = game_state.field[action.start_row][action.start_col];
			var e = game_state.field[action.end_row][action.end_col];
			game_state.field[action.end_row][action.end_col] = s;
			game_state.field[action.start_row][action.start_col] = e;

			game_state.field[action.end_row][action.end_col].draw = true
			if (game_state.field[action.end_row][action.end_col].is_player) {
				game_state.player_position.row = action.end_row;
				game_state.player_position.col = action.end_col;
			}
		}
		queue.shift();

		if (queue.length > 0) {
			action = queue[0];
			if (action.name == "spawn") {
				game_state.field[action.row][action.col] = GenerateRandomElement(game_state);
				game_state.field[action.row][action.col].draw = false
			}
		}
	}
}

function GenerateRandomElement(game_state) {
	if (GetRandomInt(100) < 60 + Math.floor(game_state.num_moves / 5)) {
		var enemy = {
			value: GetRandomInt(10) + 1,
			color: "RGB(0,0,0)",
			draw: true,
			is_item: false,
			is_enemy: true,
			is_player: false
		}
		enemy.value += Math.floor(game_state.num_moves / 15)
		var rb = GetRandomInt(198-153) + 153;
		var g = GetRandomInt(83-51) + 51;
		enemy.color = "RGB(" + rb + ", " + g + ", " + rb + ")";

		return enemy;
	}

	var item = {
		value: GetRandomInt(10),
		is_item: true,
		is_enemy: false,
		is_player: false,
		is_gold: false,
		is_shield: false,
		is_potion: false,
		draw: true,
		color: "RGB(0,0,0)"
	};

	item.value += Math.floor(game_state.num_moves / 10) + 1

	var rando = GetRandomInt(100);
	if (rando < 30) {
		item.is_gold = true;

		var r = GetRandomInt(255-230) + 230;
		var g = GetRandomInt(195-153) + 153;
		var b = GetRandomInt(77);
		item.color = "RGB(" + r + ", " + g + ", " + b + ")";
	}
	else if (rando < 70) {
		item.is_shield = true;
		var rg = GetRandomInt(173-138) + 138;
		var b = GetRandomInt(133-92) + 92;
		item.color = "RGB(" + rg + ", " + rg + ", " + b + ")";
	}
	else {
		item.is_potion = true;

		var r = GetRandomInt(83-45) + 45;
		var g = GetRandomInt(198-134) + 134;
		var b = GetRandomInt(140 - 89 + 89);
		item.color = "RGB(" + r + ", " + g + ", " + b + ")";
	}

	return item;
}

function StartGame(game_state) {
	var player = {
		value: 10,
		max_value: 10,
		shield : 0,

		color: "RGB(0, 102, 255)",
		draw: true,

		is_item: false,
		is_enemy: false,
		is_player: true
	};

	game_state.field[0][0] = GenerateRandomElement(game_state);
	game_state.field[0][1] = GenerateRandomElement(game_state);
	game_state.field[0][2] = GenerateRandomElement(game_state);

	game_state.field[1][0] = GenerateRandomElement(game_state);
	game_state.field[1][1] = player;
	game_state.field[1][2] = GenerateRandomElement(game_state);

	game_state.field[2][0] = GenerateRandomElement(game_state);
	game_state.field[2][1] = GenerateRandomElement(game_state);
	game_state.field[2][2] = GenerateRandomElement(game_state);

	game_state.active = true
}

function OnClick(game_state, card_clicked) {
	if (game_state.active_state == game_state.states.DIED) {
		game_state.request_new = true;
		return;
	}
	else if (game_state.active_state == game_state.states.PLAYING) {
		if (game_state.action_queue.length == 0) {
			game_state.active_state = game_state.states.PAUSE_INPUT
			OnClickPlaying(game_state, card_clicked);
		}
	}
}

function OnClickPlaying(game_state, card_clicked) {
	if (card_clicked.row == game_state.player_position.row && 
		card_clicked.col == game_state.player_position.col) {
		return;
	}

	if (card_clicked.row != game_state.player_position.row &&
		card_clicked.col != game_state.player_position.col) {
		return;
	}

	if (Math.abs(card_clicked.row - game_state.player_position.row) >= 2 ||
		Math.abs(card_clicked.col - game_state.player_position.col) >= 2) {
		return;
	}

	game_state.num_moves += 1

	var tile = game_state.field[card_clicked.row][card_clicked.col];

	if (tile.is_player) {
		alert("Assert, should not be able to click on player!");
	}
	else if (tile.is_item) {
		OnClickItem(game_state, card_clicked, tile);
	}
	else if (tile.is_enemy) {
		OnClickEnemy(game_state, card_clicked, tile);
	}
	else {
		alert("Assert, unknown tile");
	}

	if (game_state.active_state != game_state.states.DIED) {
		game_state.active_state = game_state.states.PLAYING
	}
}

function OnClickEnemy(game_state, card_clicked, tile) {
	var player = GetPlayer(game_state);

	var enemy_attack = tile.value
	var player_attack = player.value;

	if (player.shield > 0) {
		if (enemy_attack > player.shield) {
			enemy_attack -= player.shield;
			player.shield = 0;
		}
		else {
			player.shield -= enemy_attack;
			enemy_attack = 0;
		}
	}
	player_attack += player.shield;

	if (player_attack > enemy_attack) {
		player.value -= enemy_attack;
		AddAction(game_state, "callout", card_clicked.row, card_clicked.col);
		RemoveTileAndSpawnNew(game_state, card_clicked);
	}
	else {
		game_state.active_state = game_state.states.DIED
	}
}

function OnClickItem(game_state, card_clicked, tile) {
	var player = GetPlayer(game_state);

	if (tile.is_gold) {
		game_state.gold += tile.value
	}
	else if (tile.is_shield) {
		player.shield = tile.value;
	}
	else if (tile.is_potion) {
		player.value += tile.value;
		if (player.value > player.max_value) {
			player.value = player.max_value;
		}
	}
	else {
		alert("Assert, unknown item");
	}

	RemoveTileAndSpawnNew(game_state, card_clicked);
}

function RemoveTileAndSpawnNew(game_state, card_clicked) {
	AddAction(game_state, "fade", card_clicked.row, card_clicked.col);
	AddAction(game_state, "move", game_state.player_position.row, game_state.player_position.col, card_clicked.row, card_clicked.col);
	var spawn_row = game_state.player_position.row
	var spawn_col = game_state.player_position.col

	if (card_clicked.col < game_state.player_position.col) {
		if (game_state.player_position.col + 1 < 3) {
			AddAction(game_state, "move", game_state.player_position.row, game_state.player_position.col + 1, card_clicked.row, card_clicked.col + 1);
			spawn_col += 1
		}
	}
	else if (card_clicked.col > game_state.player_position.col) {
		if (game_state.player_position.col - 1 >= 0) {
			AddAction(game_state, "move", game_state.player_position.row, game_state.player_position.col - 1, card_clicked.row, card_clicked.col - 1);
			spawn_col -= 1
		}
	}
	else if (card_clicked.row < game_state.player_position.row) {
		if (game_state.player_position.row + 1 < 3) {
			AddAction(game_state, "move", game_state.player_position.row + 1, game_state.player_position.col, card_clicked.row + 1, card_clicked.col);
			spawn_row += 1
		}
	}
	else if (card_clicked.row > game_state.player_position.row) {
		if (game_state.player_position.row - 1 >= 0) {
			AddAction(game_state, "move", game_state.player_position.row - 1, game_state.player_position.col, card_clicked.row - 1, card_clicked.col);
			spawn_row -= 1
		}
	}
	AddAction(game_state, "spawn", spawn_row, spawn_col);
}

function DrawGame(game_state, context) {
	context.fillStyle = "RGB(255, 255, 255)"
	context.fillRect(0, 0, 600, 800);

	if (game_state.active_state == game_state.states.DIED) {
		context.fillStyle = 'rgb(0, 0, 0)';
		context.fillText("Game Over", 280, 385);
		context.fillText("Click to play again", 255, 415);
		return;
	}

	context.fillStyle = "RGB(125, 125, 125)"
	context.fillRect(0, 750, 600, 50);

	context.fillStyle = 'rgb(0, 0, 0)';
	context.fillText("Gold: " + game_state.gold + ", Moves: " + game_state.num_moves, 20, 780);

	for (var row = 0; row < 3; ++row) {
		for (var col = 0; col < 3; ++col) {
			if (game_state.field[row][col] == null) {
				continue;
			}
			if (game_state.field[row][col].draw == false) {
				continue;
			}
			
			DrawEntity(context, game_state.field[row][col], col * 200, row * 250, 1, null)

		}
	}

	for (var i = 0; i < game_state.action_queue.length; ++i) {
		var action = game_state.action_queue[i];
		if (action.name == "fade") {
			DrawEntity(context, game_state.field[action.row][action.col], action.col * 200, action.row * 250, 1.0 - action.t, null)
		}
		else if (action.name == "spawn") {
			DrawEntity(context, game_state.field[action.row][action.col], action.col * 200, action.row * 250, action.t, null)
		}
		else if (action.name == "move") {
			var startX = (action.start_col * 200);
			var startY = (action.start_row * 250);
			var endX = (action.end_col * 200);
			var endY = (action.end_row * 250);

			var currentX = startX + (endX - startX) * action.t;
			var currentY = startY + (endY - startY) * action.t;

			DrawEntity(context, game_state.field[action.start_row][action.start_col], currentX, currentY, 1, null)
		}
		else if (action.name == "callout") {
			var t = Math.floor(action.t * 20)
			var color = null;
			if (t % 2 == 0) {
				color = "RGB(255, 0, 0)";
			}
			DrawEntity(context, game_state.field[action.row][action.col], action.col * 200, action.row * 250, 1, color)
		}
		break;
	}
}

function DrawEntity(context, entity, x, y, scale, color_override) {
	if (scale != 1) {
		context.save()
		context.scale(scale, scale);
		x *= 1.0 / scale
		y *= 1.0 / scale
	}

	context.fillStyle = entity.color
	if (color_override != null) {
		context.fillStyle = color_override
	}
	context.fillRect(x, y, 200, 250);

	if (entity.is_player) {
	    context.fillStyle = 'rgb(0, 0, 0)';
	    context.fillText("Player", x + 20, y + 20);
	    context.fillText("Points: " + entity.value, x + 20, y + 20 + 30);
	    if (entity.shield > 0) {
		    context.fillText("Shield: " + entity.shield, x + 20, y + 20 + 60);
		}
	}
	else if (entity.is_gold) {
	    context.fillStyle = 'rgb(0, 0, 0)';
	    context.fillText("Gold: " + entity.value, x + 20, y + 20);
	}
	else if (entity.is_shield) {
	    context.fillStyle = 'rgb(0, 0, 0)';
	    context.fillText("Shield: " + entity.value, x + 20, y + 20);
	}
	else if (entity.is_potion) {
	    context.fillStyle = 'rgb(0, 0, 0)';
	    context.fillText("Potion: " + entity.value, x + 20, y + 20);
	}
	else if (entity.is_enemy) {
		context.fillStyle = 'rgb(0, 0, 0)';
	    context.fillText("Enemy", x + 20, y + 20);
	    context.fillText("Points: " + entity.value, x + 20, y + 20 + 30);
	}

	if (scale != 1) {
		context.restore()
	}
}