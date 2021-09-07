function Init_Compress(canvas, context) {

}

function Update_Compress(dt, canvas, context) {
	context.fillStyle = "rgb(35, 35, 35)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	let oldWidth = context.lineWidth;
	context.lineWidth = 4;

	context.font = '28pt serif';
	context.strokeStyle = "rgb(80, 80, 80)";
	context.fillStyle = "rgb(80, 80, 80)";

	context.beginPath();
	context.moveTo(1220, canvas.height / 2 - 20);
	context.lineTo(1420, canvas.height / 2 - 20);
	context.stroke();

	context.strokeStyle = "rgb(60, 60, 60)";
	context.fillStyle = "rgb(60, 60, 60)";
	context.setLineDash([16, 8]);

	context.beginPath();
	context.moveTo(20, canvas.height / 2 - 20);
	context.lineTo(220, canvas.height / 2 + 200);
	context.stroke();

	context.beginPath();
	context.moveTo(420, canvas.height / 2 - 20);
	context.lineTo(220, canvas.height / 2 + 200);
	context.stroke();

    context.beginPath();
	context.moveTo(420, canvas.height / 2 - 20);
	context.lineTo(620, canvas.height / 2 - 220);
	context.stroke();

	context.beginPath();
	context.moveTo(820, canvas.height / 2 - 20);
	context.lineTo(620, canvas.height / 2 - 220);
	context.stroke();

	context.beginPath();
	context.moveTo(820, canvas.height / 2 - 20);
	context.lineTo(1020, canvas.height / 2 - 20 + 120);
	context.stroke();

	context.beginPath();
	context.moveTo(1220, canvas.height / 2 - 20);
	context.lineTo(1020, canvas.height / 2 - 20 + 120);
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

	s = [1220, canvas.height / 2 - 20];
    e = [820, canvas.height / 2 - 20];
    c = [1020, canvas.height / 2 - 20 + 120];

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

	s = [20, canvas.height / 2 - 20];
    e = [420, canvas.height / 2 - 20];
    c = [220, canvas.height / 2 + 200];

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

    context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

	context.beginPath();
	context.arc(220, canvas.height / 2 + 200, 15, 0, 2 * Math.PI);
	context.fill();

    context.strokeStyle = "rgb(70, 120, 70)";
	context.fillStyle =   "rgb(70, 120, 70)";

	context.beginPath();
	context.arc(420, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('Redundant on curve point', 420 - 10, canvas.height / 2 - 20 + 50);

    context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

	context.beginPath();
	context.arc(620, canvas.height / 2 - 220, 15, 0, 2 * Math.PI);
	context.fill();

	context.strokeStyle = "rgb(70, 120, 70)";
	context.fillStyle =   "rgb(70, 120, 70)";

	context.beginPath();
	context.arc(820, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();
    context.fillText('Redundant on curve point', 820 - 10, canvas.height / 2 - 45);

    context.strokeStyle = "rgb(120, 70, 70)";
	context.fillStyle =   "rgb(120, 70, 70)";

	context.beginPath();
	context.arc(1020, canvas.height / 2 - 20 + 120, 15, 0, 2 * Math.PI);
	context.fill();

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(1220, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();

	context.strokeStyle = "rgb(70, 70, 120)";
	context.fillStyle =   "rgb(70, 70, 120)";

	context.beginPath();
	context.arc(1420, canvas.height / 2 - 20, 15, 0, 2 * Math.PI);
	context.fill();

	context.lineWidth = oldWidth;


	window.requestAnimationFrame(CallUpdate_Compress);
}

var gCompressCanvas = null;
var gCompressContext = null;
var gCompressLastUpdateTime = 0.0;

function CallUpdate_Compress() {
	let thisTime = performance.now();
	let deltaTime = (thisTime - gCompressLastUpdateTime) * 0.001;

	let bounds = gCompressCanvas.getBoundingClientRect();
	let vVis = bounds.bottom >= 0  && bounds.top <= (window.innerHeight || document.documentElement.clientHeight);
	let hVis = bounds.right >= 0 && bounds.left <= (window.innerWidth || document.documentElement.clientWidth);
	let vis = hVis && vVis;
	
	if (vis) {
		Update_Compress(deltaTime, gCompressCanvas, gCompressContext);
	}
	else {
		window.requestAnimationFrame(CallUpdate_Compress);
	}

	gCompressLastUpdateTime = thisTime;
}

function Main_Compress(canvasName) {
	gCompressCanvas = document.getElementById(canvasName);
	gCompressContext = gCompressCanvas.getContext("2d");

	gCompressCanvas.width = 1500;
	gCompressCanvas.height = 600;

	Init_Compress(gCompressCanvas, gCompressContext);
	gCompressLastUpdateTime = performance.now();
	window.requestAnimationFrame(CallUpdate_Compress);
}