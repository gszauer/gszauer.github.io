var showLabels = true

var canvas = null;
var context = null;
var unit = 100
var scaleOffset = 1.0 / 8.0
var mousePos = [0, 0]

var mouseOnVector = 0
var selectedVector = 0

var vec1 = [3, 1.5]
var vec2 = [1, 0]

var text_orange = 'rgb(250, 150, 0)'
var text_green = 'rgb(0, 200, 0)'
var text_blue = 'rgb(0, 100, 255)'

function WriteText(toWrite, color, xPos, yPos) {
      context.fillStyle = 'rgb(0, 0, 0)';
      context.fillText(toWrite, xPos + 1, yPos + 1);
      context.fillText(toWrite, xPos + 1, yPos);
      context.fillText(toWrite, xPos, yPos + 1);
      context.fillStyle = color;
      context.fillText(toWrite, xPos, yPos);
}

function Init() {
	canvas = document.getElementById('game_canvas');
	if (canvas.getContext) {
		context = canvas.getContext('2d');

		canvas.addEventListener('mousemove', OnMouseMove, false);
		canvas.addEventListener('mousedown', OnMouseDown, false);
		canvas.addEventListener('mouseup', OnMouseUp, false);
	}
	vec2 = Normalized(vec1)
	Render();
}

function OnMouseDown(evt) {
	var rect = canvas.getBoundingClientRect();
  mousePos = [
    (evt.clientX - rect.left) / ((rect.right - rect.left) / canvas.width),
    (evt.clientY - rect.top)  / ((rect.bottom - rect.top) / canvas.height)
  ];

	var centerX = canvas.width / 2
	var centerY = canvas.height / 2

	var tri1 = GetTriangle(vec1, centerX, centerY)
	var tri2 = GetTriangle(vec2, centerX, centerY)

	if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
		selectedVector = 1
	}
}

function OnMouseUp(evt) {
	selectedVector = 0
}

function OnMouseMove(evt) {
	var rect = canvas.getBoundingClientRect();
  mousePos = [
    (evt.clientX - rect.left) / ((rect.right - rect.left) / canvas.width),
    (evt.clientY - rect.top)  / ((rect.bottom - rect.top) / canvas.height)
  ];
	var centerX = canvas.width / 2
	var centerY = canvas.height / 2

	var lastMouseOnVector = mouseOnVector
	var tri1 = GetTriangle(vec1, centerX, centerY)
	var tri2 = GetTriangle(vec2, centerX, centerY)

	if (evt.buttons & 1 == 1) {
		if (selectedVector == 1) {
			vec1[0] = (mousePos[0] - centerX) / unit
			vec1[1] = (centerY - mousePos[1]) / unit
		}
		vec2 = Normalized(vec1)
	}
	else {
		selectedVector = 0
	}

	mouseOnVector = 0
	if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
		mouseOnVector = 1
	}

	if (lastMouseOnVector != mouseOnVector || selectedVector != 0) {
		Render()
	}
}

var bgColor = 'rgb(34, 34, 34)';
var gridColor = 'rgb(65, 65, 65)';
var fontColor = 'rgb(170, 170, 170)';

function Render() {
	if (context) {
		var centerX = canvas.width / 2
		var centerY = canvas.height / 2

		// Clear BG Color
		 context.fillStyle = bgColor;//'rgb(255, 255, 255)';
		context.fillRect(0, 0, canvas.width, canvas.height);

		// Horizontal Grid
		context.strokeStyle = gridColor;//'rgb(156, 156, 156)';
		context.lineWidth = 1
		context.beginPath()
		for (var i = 0; i < canvas.height / 2; i += unit) {
			context.moveTo(0, centerY + i)
			context.lineTo(canvas.width, centerY + i)
			context.moveTo(0, centerY - i)
			context.lineTo(canvas.width, centerY - i)
		}
		context.stroke()
		context.closePath()

		// Vertical Grid
		 context.strokeStyle = gridColor;//'rgb(156, 156, 156)';
		context.lineWidth = 1
		context.beginPath()
		for (var i = 0; i < canvas.width / 2; i += unit) {
			context.moveTo(centerX + i, 0)
			context.lineTo(centerX + i, canvas.height)
			context.moveTo(centerX - i, 0)
			context.lineTo(centerX - i, canvas.height)
		}
		context.stroke()
		context.closePath()

		context.beginPath()
	    context.arc(centerX, centerY, unit, 0, Math.PI * 2, true); // Outer circle
		context.stroke()
		context.closePath()

		// Draw instructions
		context.font = '24px serif';
		var text = context.measureText('Click and drag the blue arrow');

    	context.fillStyle = bgColor;//'rgb(156, 156, 156)';
		context.fillRect(canvas.width - text.width - 20, canvas.height - 40, text.width + 10, 35);

		context.fillStyle = fontColor;//'rgb(255, 255, 255)';
		context.fillText('Click and drag the blue arrow', canvas.width - text.width - 15, canvas.height - 15);

		// Draw vector 1
		if (mouseOnVector == 1) {
			context.strokeStyle = 'rgb(0, 0, 255)';
			context.fillStyle = 'rgb(0, 0, 255)';
		}
		else {
			context.strokeStyle = 'rgb(80, 80, 255)';
			context.fillStyle = 'rgb(80, 80, 255)';
		}
		context.lineWidth = 3
		DrawVec2(vec1, centerX, centerY)
		
		// Draw vector 2
		context.setLineDash([4, 2]);
		context.strokeStyle = 'rgba(250, 150, 0, 0.7)';
		context.fillStyle = 'rgba(250, 150, 0, 0.7)';
		context.lineWidth = 3
		DrawVec2(vec2, centerX, centerY)
		context.setLineDash([]);

		if (showLabels) {
			var dotRes = vec1[0] * vec1[0] + vec1[1] * vec1[1]
			if (dotRes != 0) {
				dotRes = Math.sqrt(dotRes);
			}

			context.font = '16px serif';

			// Print value for vec 1
			var text = 'A: (' + vec1[0].toFixed(2) + ', ' + vec1[1].toFixed(2) + ')'
			var text_width = context.measureText(text).width;
			WriteText(text, text_blue, centerX + vec1[0] * unit - text_width * 0.5, centerY - vec1[1] * unit)

			// Print value for vec 2
			text = 'A: (' + vec2[0].toFixed(2) + ', ' + vec2[1].toFixed(2) + ')'
			var text_width = context.measureText(text).width;
			WriteText(text, text_orange, centerX + vec2[0] * unit - text_width * 0.5, centerY - vec2[1] * unit)
			

			text = '^'
			//var text_width = context.measureText(text).width;
			WriteText(text, text_orange, centerX + vec2[0] * unit - text_width * 0.5 + 1, centerY - vec2[1] * unit - 9)

			// Print dot product
			context.font = '22px serif';
			text = '||A||:  ' + (dotRes).toFixed(2)
			var text_width = context.measureText(text).width;
			WriteText(text, text_green, 20, 35)
		}
	}
}

function Normalized(vec) {
	var result = [ vec[0], vec[1] ]

	var dot = vec[0] * vec[0] + vec[1] * vec[1]
	if (dot != 0) {
		var mag = Math.sqrt(dot)
		if (mag != 0.0) {
			result[0] = result[0] / mag
			result[1] = result[1] / mag
		}
	}

	return result
}

function PointInTriangle(point, v1, v2, v3) {
	var Area = 0.5 *(-v2[1]*v3[0] + v1[1]*(-v2[0] + v3[0]) + v1[0]*(v2[1] - v3[1]) + v2[0]*v3[1]);
	var s = 1/(2*Area)*(v1[1]*v3[0] - v1[0]*v3[1] + (v3[1] - v1[1])*point[0] + (v1[0] - v3[0])*point[1]);
	var t = 1/(2*Area)*(v1[0]*v2[1] - v1[1]*v2[0] + (v1[1] - v2[1])*point[0] + (v2[0] - v1[0])*point[1]);
	var u = 1-s-t
	return s > 0 && t > 0 && u > 0
}

function GetTriangle(vec2, centerX, centerY) {
	// Normalize
	var norm = [vec2[0], vec2[1]]
	var len = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1])
	if (len != 0) {
		norm[0] /= len
		norm[1] /= len
	}

	// Get perpendicular vector
	var perp = [norm[1], -norm[0]]

	norm[0] *= scaleOffset
	norm[1] *= scaleOffset
	perp[0] *= scaleOffset
	perp[1] *= scaleOffset

	// Find points of the triangle
	return [
		[centerX + vec2[0] * unit, centerY - vec2[1] * unit],
		[centerX + (vec2[0] - norm[0] - perp[0]) * unit, centerY - (vec2[1] - norm[1] - perp[1]) * unit],
		[centerX + (vec2[0] - norm[0] + perp[0]) * unit, centerY - (vec2[1] - norm[1] + perp[1]) * unit]
	];
}

function DrawVec2(vec2, centerX, centerY) {
	// Normalize
	var norm = [vec2[0], vec2[1]]
	var len = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1])
	if (len != 0) {
		norm[0] /= len
		norm[1] /= len
	}

	// Get perpendicular vector
	var perp = [norm[1], -norm[0]]

	// Draw the line
	context.beginPath()
	context.moveTo(centerX, centerY)
	context.lineTo(centerX + (vec2[0] - norm[0] * scaleOffset) * unit, centerY - (vec2[1] - norm[1] * scaleOffset) * unit) // -normal to make arrow pretty!
	context.stroke()
	context.closePath()

	// Draw the triange
	context.beginPath()
	norm[0] *= scaleOffset
	norm[1] *= scaleOffset
	perp[0] *= scaleOffset
	perp[1] *= scaleOffset
	context.moveTo(centerX + vec2[0] * unit, centerY - vec2[1] * unit)
	context.lineTo(centerX + (vec2[0] - norm[0] - perp[0]) * unit, centerY - (vec2[1] - norm[1] - perp[1]) * unit)
	context.lineTo(centerX + (vec2[0] - norm[0] + perp[0]) * unit, centerY - (vec2[1] - norm[1] + perp[1]) * unit)
	context.closePath()
	context.fill()
}