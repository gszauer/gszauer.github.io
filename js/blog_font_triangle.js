function Init_Triangle(canvas, context) {

}

function Update_Triangle(dt, canvas, context) {
	context.fillStyle = "rgb(35, 35, 35)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	let oldWidth = context.lineWidth;
	context.lineWidth = 4;

	context.font = '28pt serif';
	context.strokeStyle = "rgb(80, 80, 80)";
	context.fillStyle = "rgb(80, 80, 80)";

	context.strokeStyle = "rgb(60, 60, 60)";
	context.fillStyle = "rgb(60, 60, 60)";

	context.beginPath();
	context.moveTo(20, (canvas.height / 2 + 100) - 20);
	context.lineTo(220, (canvas.height / 2 + 100) - 200);
	context.stroke();

	context.beginPath();
	context.moveTo(420, (canvas.height / 2 + 100) - 20);
	context.lineTo(220, (canvas.height / 2 + 100) - 200);
	context.stroke();

	context.beginPath();
	context.moveTo(420, (canvas.height / 2 + 100) - 20);
	context.lineTo(20, (canvas.height / 2 + 100) - 20);
	context.stroke();

	context.beginPath();
	context.moveTo(820, (canvas.height / 2 + 100) - 20);
	context.lineTo(1020, (canvas.height / 2 + 100) - 200);
	context.stroke();

	context.beginPath();
	context.moveTo(1220, (canvas.height / 2 + 100) - 20);
	context.lineTo(1020, (canvas.height / 2 + 100) - 200);
	context.stroke();

	context.beginPath();
	context.moveTo(820, (canvas.height / 2 + 100) - 20);
	context.lineTo(1220, (canvas.height / 2 + 100) - 20);
	context.stroke();

	context.strokeStyle = "rgb(80, 80, 80)";
	context.fillStyle = "rgb(80, 80, 80)";

    let s = [20, (canvas.height / 2 + 100) - 20];
    let e = [420, (canvas.height / 2 + 100) - 20];
    let c = [220, (canvas.height / 2 + 100) - 200];

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
	context.fill();
    
	s = [1220, (canvas.height / 2 + 100) - 20];
    e = [820, (canvas.height / 2 + 100) - 20];
    c = [1020, (canvas.height / 2 + 100) - 200];

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
	context.fill();

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(20, (canvas.height / 2 + 100) - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('B0', 20 - 10, (canvas.height / 2 + 100) - 20 + 50);

    context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

	context.beginPath();
	context.arc(220, (canvas.height / 2 + 100) - 200, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText("B1", 220- 10, (canvas.height / 2 + 100) - 200 - 30);

    context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(420, (canvas.height / 2 + 100) - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('B2', 420 - 10, (canvas.height / 2 + 100) - 20 + 50);

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(820, (canvas.height / 2 + 100) - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText("[1, 1]", 820 - 40, (canvas.height / 2 + 100) - 20 + 50);

    context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

	context.beginPath();
	context.arc(1020, (canvas.height / 2 + 100) - 200, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText("[0.5, 0]", 1020 - 50, (canvas.height / 2 + 100) - 200 - 30);

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(1220, (canvas.height / 2 + 100) - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText("[0, 0]", 1220 - 40, (canvas.height / 2 + 100) - 20 + 50);

	context.lineWidth = oldWidth;


	window.requestAnimationFrame(CallUpdate_Triangle);
}

var gTriangleCanvas = null;
var gTriangleContext = null;
var gTriangleLastUpdateTime = 0.0;

function CallUpdate_Triangle() {
	let thisTime = performance.now();
	let deltaTime = (thisTime - gTriangleLastUpdateTime) * 0.001;

	let bounds = gTriangleCanvas.getBoundingClientRect();
	let vVis = bounds.bottom >= 0  && bounds.top <= (window.innerHeight || document.documentElement.clientHeight);
	let hVis = bounds.right >= 0 && bounds.left <= (window.innerWidth || document.documentElement.clientWidth);
	let vis = hVis && vVis;
	
	if (vis) {
		Update_Triangle(deltaTime, gTriangleCanvas, gTriangleContext);
	}
	else {
		window.requestAnimationFrame(CallUpdate_Triangle);
	}

	gTriangleLastUpdateTime = thisTime;
}

function Main_Triangle(canvasName) {
	gTriangleCanvas = document.getElementById(canvasName);
	gTriangleContext = gTriangleCanvas.getContext("2d");

	gTriangleCanvas.width = 1500;
	gTriangleCanvas.height = 350;

	Init_Triangle(gTriangleCanvas, gTriangleContext);
	gTriangleLastUpdateTime = performance.now();
	window.requestAnimationFrame(CallUpdate_Triangle);
}