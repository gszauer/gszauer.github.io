var game_canvas = null;
var game_context = null;

var current_game = null;

var gamebounds = null;
var mousedown = { x: 0, y: 0 }

function DriverInit() {
	game_canvas = document.getElementById('game_canvas');
	if (game_canvas && game_canvas.getContext) {
		game_context = game_canvas.getContext('2d');
  		gamebounds = game_canvas.getBoundingClientRect();
		game_canvas.addEventListener('mousedown', OnMouseDown, false);
    	game_canvas.addEventListener('mouseup', OnMouseUp, false);
	}

	game_context.font = '18px serif';

	current_game = NewGameState();
	StartGame(current_game);

	DrawGame(current_game, game_context);

	var fps = 30;
	setInterval(GameLoop, 1000 / fps);
}

function GameLoop() {
  if (current_game.request_new) {
      current_game = NewGameState();
      StartGame(current_game);
  }
	ProcessGameQueue(current_game, 30/1000)
	DrawGame(current_game, game_context);
}

function OnMouseDown(evt) {
  mousedown.x = evt.clientX - gamebounds.left
  mousedown.y = evt.clientY - gamebounds.top

  if (current_game.active_state == current_game.states.DEAD) {
    mousedown.x = -2048;
    mousedown.y = -2048;
  }
}

function OnMouseUp(evt) {
  var mouseup = {
  	x: evt.clientX - gamebounds.left,
  	y: evt.clientY - gamebounds.top
  }

  var tile_down = {
  	row: Math.floor(mousedown.y / 750 * 3),
  	col: Math.floor(mousedown.x / 600 * 3)
  }
  var tile_up = {
  	row: Math.floor(mouseup.y / 750 * 3),
  	col: Math.floor(mouseup.x / 600 * 3)
  }

  if (tile_down.row == tile_up.row && tile_down.col == tile_up.col) {
  	OnClick(current_game, tile_up);
  }
}