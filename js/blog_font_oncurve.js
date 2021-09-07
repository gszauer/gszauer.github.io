function Init_OnCurve(canvas, context) {

}

function Update_OnCurve(dt, canvas, context) {
	context.fillStyle = "rgb(35, 35, 35)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	let oldWidth = context.lineWidth;
	context.lineWidth = 4;

	context.font = '28pt serif';
	context.strokeStyle = "rgb(80, 80, 80)";
	context.fillStyle = "rgb(80, 80, 80)";

	context.beginPath();
	context.moveTo(20, canvas.height / 2 - 20);
	context.lineTo(420, canvas.height / 2 - 20);
	context.stroke();

	context.beginPath();
	context.moveTo(820, canvas.height / 2 - 20);
	context.lineTo(1020, canvas.height / 2 - 20);
	context.stroke();

	context.strokeStyle = "rgb(60, 60, 60)";
	context.fillStyle = "rgb(60, 60, 60)";
	context.setLineDash([16, 8]);

    context.beginPath();
	context.moveTo(420, canvas.height / 2 - 20);
	context.lineTo(620, canvas.height / 2 - 220);
	context.stroke();

	context.beginPath();
	context.moveTo(820, canvas.height / 2 - 20);
	context.lineTo(620, canvas.height / 2 - 220);
	context.stroke();

	context.beginPath();
	context.moveTo(1020, canvas.height / 2 - 20);
	context.lineTo(1220, canvas.height / 2 - 20 + 120);
	context.stroke();

	context.beginPath();
	context.moveTo(1420, canvas.height / 2 - 20);
	context.lineTo(1220, canvas.height / 2 - 20 + 120);
	context.stroke();

	context.strokeStyle = "rgb(80, 80, 80)";
	context.fillStyle = "rgb(80, 80, 80)";
    context.setLineDash([]);

    let s = [420, canvas.height / 2 - 20];
    let e = [820, canvas.height / 2 - 20];
    let c = [620, canvas.height / 2 - 220];

    context.beginPath();
	context.moveTo(s[0], s[1]);
    let lastPlot = [s[0], s[1]];
    for (let i = 1; i < 300; ++i) {
    	let t = i / 299.0;

    	let l = [
	    	s[0] + (c[0] - s[0]) * t, 
	    	s[1] + (c[1] - s[1]) * t
	    ];

	    let r = [
	    	c[0] + (e[0] - c[0]) * t, 
	    	c[1] + (e[1] - c[1]) * t
	    ];

	    let plot = [
	    	l[0] + (r[0] - l[0]) * t,
	    	l[1] + (r[1] - l[1]) * t
	    ];

    	context.lineTo(plot[0], plot[1]);
    	lastPlot = plot;
	}
	context.stroke();

	s = [1420, canvas.height / 2 - 20];
    e = [1020, canvas.height / 2 - 20];
    c = [1220, canvas.height / 2 - 20 + 120];

    context.beginPath();
	context.moveTo(s[0], s[1]);
    lastPlot = [s[0], s[1]];
    for (let i = 1; i < 300; ++i) {
    	let t = i / 299.0;

    	let l = [
	    	s[0] + (c[0] - s[0]) * t, 
	    	s[1] + (c[1] - s[1]) * t
	    ];

	    let r = [
	    	c[0] + (e[0] - c[0]) * t, 
	    	c[1] + (e[1] - c[1]) * t
	    ];

	    let plot = [
	    	l[0] + (r[0] - l[0]) * t,
	    	l[1] + (r[1] - l[1]) * t
	    ];

    	context.lineTo(plot[0], plot[1]);
    	lastPlot = plot;
	}
	context.stroke();


	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(20, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('On Curve', 20 - 10, canvas.height / 2 - 20 + 50);

	context.beginPath();
	context.arc(220, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('On Curve', 220- 10, canvas.height / 2 - 20 - 25);

	context.beginPath();
	context.arc(420, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('On Curve', 420 - 10, canvas.height / 2 - 20 + 50);

	context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

	context.beginPath();
	context.arc(620, canvas.height / 2 - 220, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('Off Curve', 540, canvas.height / 2 - 30 - 220);

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(820, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('On Curve', 820 - 10, canvas.height / 2 - 20 + 50);

	context.beginPath();
	context.arc(1020, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('On Curve', 1020- 10, canvas.height / 2 - 20 - 25);

	context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

	context.beginPath();
	context.arc(1220, canvas.height / 2 - 20 + 120, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('Off Curve', 1150, canvas.height / 2 + 155);

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(1420, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('On Curve', 1300, canvas.height / 2 - 20 - 25);

	context.lineWidth = oldWidth;

	window.requestAnimationFrame(CallUpdate_OnCurve);
}


var gCurveCanvas = null;
var gCurveContext = null;
var gCurveLastUpdateTime = 0.0;

function CallUpdate_OnCurve() {
	let thisTime = performance.now();
	let deltaTime = (thisTime - gCurveLastUpdateTime) * 0.001;

	let bounds = gCurveCanvas.getBoundingClientRect();
	let vVis = bounds.bottom >= 0  && bounds.top <= (window.innerHeight || document.documentElement.clientHeight);
	let hVis = bounds.right >= 0 && bounds.left <= (window.innerWidth || document.documentElement.clientWidth);
	let vis = hVis && vVis;
	
	if (vis) {
		Update_OnCurve(deltaTime, gCurveCanvas, gCurveContext);
	}
	else {
		window.requestAnimationFrame(CallUpdate_OnCurve);
	}

	gCurveLastUpdateTime = thisTime;
}

function Main_OnCurve(canvasName) {
	gCurveCanvas = document.getElementById(canvasName);
	gCurveContext = gCurveCanvas.getContext("2d");

	gCurveCanvas.width = 1500;
	gCurveCanvas.height = 600;


	Init_OnCurve(gCurveCanvas, gCurveContext);
	gCurveLastUpdateTime = performance.now();
	window.requestAnimationFrame(CallUpdate_OnCurve);
}