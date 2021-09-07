var gCurrentTime = 0.0;


function Init_Bezier(canvas, context) {

}

function Update_Bezier(dt, canvas, context) {
	let speed = 4.0;

	gCurrentTime += dt;
	while (gCurrentTime > speed) {
		gCurrentTime -= speed;
	}
    let t = gCurrentTime / speed;

	let oldWidth = context.lineWidth;
	context.lineWidth = 4;

	context.fillStyle = "rgb(35, 35, 35)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = '38pt serif';
	context.strokeStyle = "rgb(50, 50, 50)";
	context.fillStyle = "rgb(50, 50, 50)";

	context.beginPath();
	context.moveTo(20, canvas.height - 20);
	context.lineTo(canvas.width * 0.5, 20);
	context.stroke();

	context.beginPath();
	context.moveTo(canvas.width - 20, canvas.height - 20);
	context.lineTo(canvas.width * 0.5, 20);
	context.stroke();

	let l0 = [
    	20 + ((canvas.width * 0.5) - 20) * t, 
    	(canvas.height - 20) + (20 - (canvas.height - 20)) * t
    ];

    let l1 = [
    	(canvas.width * 0.5) + ((canvas.width - 20) - (canvas.width * 0.5)) * t, 
    	20 + ((canvas.height - 20) - 20) * t
    ];

    let l2 = [
    	l0[0] + (l1[0] - l0[0]) * t,
    	l0[1] + (l1[1] - l0[1]) * t
    ];

    context.setLineDash([16, 8]);
    context.beginPath();
	context.moveTo(l0[0], l0[1]);
	context.lineTo(l1[0], l1[1]);
	context.stroke();
    context.setLineDash([]);

    context.strokeStyle = "rgb(80, 80, 80)";
	context.fillStyle   = "rgb(80, 80, 80)";

	context.beginPath();
	context.moveTo(20, canvas.height - 20);
	let wasReached = false;
	let _l2 = [0.0, 0.0];
    for (let i = 0; i < 300; ++i) {
    	let _t = i / 299.0;
    	let isReached = _t >= t;

    	if (isReached && !wasReached) {
			context.stroke();

			context.strokeStyle = "rgb(50, 50, 50)";
			context.fillStyle   = "rgb(50, 50, 50)";

			context.beginPath();
			context.moveTo(_l2[0], _l2[1]);
    	}

    	let _l0 = [
	    	20 + ((canvas.width * 0.5) - 20) * _t, 
	    	(canvas.height - 20) + (20 - (canvas.height - 20)) * _t
	    ];

	    let _l1 = [
	    	(canvas.width * 0.5) + ((canvas.width - 20) - (canvas.width * 0.5)) * _t, 
	    	20 + ((canvas.height - 20) - 20) * _t
	    ];

	    _l2 = [
	    	_l0[0] + (_l1[0] - _l0[0]) * _t,
	    	_l0[1] + (_l1[1] - _l0[1]) * _t
	    ];

    	context.lineTo(_l2[0], _l2[1]);

    	wasReached = isReached;
	}
	context.stroke();

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(20, canvas.height - 20, 15, 0, 2 * Math.PI);
	context.fill();

    context.fillText('Point 0', 50, canvas.height - 20 + 10);

	context.beginPath();
	context.arc(canvas.width - 20, canvas.height - 20, 15, 0, 2 * Math.PI);
	context.fill();

    let textSize = context.measureText('Point 1');
    context.fillText('Point 1', canvas.width - 20 - textSize.width - 35, canvas.height - 20 + 10);

	context.strokeStyle = "rgb(70, 120, 70)";
	context.fillStyle =   "rgb(70, 120, 70)";
	context.font = '24pt serif';

	context.beginPath();
	context.arc(canvas.width * 0.5, 20, 15, 0, 2 * Math.PI);
	context.fill();

    context.fillText('Control Point', canvas.width * 0.5 + 30, 40);

    context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

    context.beginPath();
	context.arc(l0[0], l0[1], 15, 0, 2 * Math.PI);
	context.fill();

	textSize = context.measureText('L0 = lerp(C, P1, t)');
    context.fillText('L0 = lerp(P0, C, t)', l0[0]- textSize.width - 30, l0[1] + 10);

    context.beginPath();
	context.arc(l1[0], l1[1], 15, 0, 2 * Math.PI);
	context.fill();

	textSize = context.measureText('L1 = lerp(C, P1, t)');
    context.fillText('L1 = lerp(C, P1, t)', l1[0] + 30, l1[1] + 10);

	context.font = '32pt serif';
    context.strokeStyle = "rgb(120, 70, 120)";
	context.fillStyle =   "rgb(120, 70, 120)";

    context.beginPath();
	context.arc(l2[0], l2[1], 15, 0, 2 * Math.PI);
	context.fill();

	textSize = context.measureText('lerp(L0, L1, t)');
    context.fillText('lerp(L0, L1, t)', l2[0] - textSize.width * 0.5, l2[1] - 40);

	context.lineWidth = oldWidth;

	context.font = '48pt serif';
	context.strokeStyle = "rgb(120, 120, 70)";
	context.fillStyle =   "rgb(120, 120, 70)";
    context.fillText('t: ' + t.toFixed(2), 25, 90);

	window.requestAnimationFrame(CallUpdate_Bezier);
}


var gBezierCanvas = null;
var gBezierContext = null;
var gBezierLastUpdateTime = 0.0;

function CallUpdate_Bezier() {
	let thisTime = performance.now();
	let deltaTime = (thisTime - gBezierLastUpdateTime) * 0.001;

	let bounds = gBezierCanvas.getBoundingClientRect();
	let vVis = bounds.bottom >= 0  && bounds.top <= (window.innerHeight || document.documentElement.clientHeight);
	let hVis = bounds.right >= 0 && bounds.left <= (window.innerWidth || document.documentElement.clientWidth);
	let vis = hVis && vVis;
	
	if (vis) {
		Update_Bezier(deltaTime, gBezierCanvas, gBezierContext);
	}
	else {
		window.requestAnimationFrame(CallUpdate_Bezier);
	}

	gBezierLastUpdateTime = thisTime;
}

function Main_Bezier(canvasName) {
	gBezierCanvas = document.getElementById(canvasName);
	gBezierContext = gBezierCanvas.getContext("2d");

	gBezierCanvas.width = 1500;
	gBezierCanvas.height = 750;


	Init_Bezier(gBezierCanvas, gBezierContext);
	gBezierLastUpdateTime = performance.now();
	window.requestAnimationFrame(CallUpdate_Bezier);
}