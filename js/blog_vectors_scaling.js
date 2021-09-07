var showLabels = true

var canvas = null;
var context = null;
var unit = 15;
var mousePos = [0, 0]

var mouseOnVector = 0
var selectedVector = 0

var vec1 = [7, 4]
var scale = 1.5

function Init() {
	canvas = document.getElementById('game_canvas');
	if (canvas.getContext) {
		context = canvas.getContext('2d');

		canvas.addEventListener('mousemove', OnMouseMove, false);
		canvas.addEventListener('mousedown', OnMouseDown, false);
		canvas.addEventListener('mouseup', OnMouseUp, false);
	}
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
	var t = (scale + 3.0) / 6.0
	var cirX = 20 + (320 - 20) * t
	var cirY = 20
	var cirR = 10

	if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
		selectedVector = 1
	}
	else if (PointInCircle(mousePos, cirX, cirY, cirR)) {
		selectedVector = 2
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

	if (evt.buttons & 1 == 1) {
		if (selectedVector == 1) {
			vec1[0] = (mousePos[0] - centerX) / unit
			vec1[1] = (centerY - mousePos[1]) / unit
		}
		else if (selectedVector == 2) {
			// TODO: Calculate T!
			var current = mousePos[0]
			if (current < 20 + 5) {
				current = 20 + 5
			}
			else if (current > 320 - 5) {
				current = 320 - 5
			}

			current = (current - 25) / (290) // 0 to 1
			if (current < 0) {
				current = 0
			}
			else if (current > 1) {
				current = 1
			}
			scale = current * 6.0 - 3.0
		}
	}
	else {
		selectedVector = 0
	}

	mouseOnVector = 0

	var t = (scale + 3.0) / 6.0
	var cirX = 20 + (320 - 20) * t
	var cirY = 20
	var cirR = 10

	if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
		mouseOnVector = 1
	}
	else if (PointInCircle(mousePos, cirX, cirY, cirR)) {
		mouseOnVector = 2
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

		// Draw instructions
		context.font = '24px serif';
		var text = context.measureText('Click and drag blue arrow or the green slider');

		context.fillStyle = bgColor;//'rgb(156, 156, 156)';
		context.fillRect(canvas.width - text.width - 20, canvas.height - 40, text.width + 10, 35);

		context.fillStyle = fontColor;//'rgb(255, 255, 255)';
		context.fillText('Click and drag blue arrow or the green slider', canvas.width - text.width - 15, canvas.height - 15);

		// Draw vector 1
		if (mouseOnVector == 1) {
			context.strokeStyle = 'rgb(0, 0, 255)';
			context.fillStyle = 'rgb(0, 0, 255)';
		}
		else {
			context.strokeStyle = 'rgba(0, 0, 255, 0.7)';
			context.fillStyle = 'rgba(0, 0, 255, 0.7)';
		}
		context.lineWidth = 3
		DrawVec2(vec1, centerX, centerY)
		
		// Draw scale result
		context.setLineDash([4, 2]);
		var vec3 = [vec1[0] * scale, vec1[1] * scale]
		context.strokeStyle = 'rgba(250, 150, 0, 0.5)';
		context.fillStyle = 'rgba(250, 150, 0, 0.5)';
		context.lineWidth = 3
		DrawVec2(vec3, centerX, centerY)

		// Draw the scale slider
		context.setLineDash([]);
		context.strokeStyle = 'rgb(0, 150, 0)';
		context.fillStyle = 'rgb(0, 150, 0)';

		context.beginPath()
		context.moveTo(15, 20)
		context.lineTo(325, 20) // -normal to make arrow pretty!
		context.stroke()
		context.closePath()

		// Scale: -3 to +3
		var t = (scale + 3.0) / 6.0
		context.strokeStyle = 'rgb(0, 0, 0';
		if (mouseOnVector == 2 || selectedVector == 2) {
			context.fillStyle = 'rgb(0, 255, 0)';
		}
		var handleX = 20 + (320 - 20) * t
		var handleY = 20
		context.beginPath()
	    context.arc(handleX, handleY, 10, 0, Math.PI * 2, true); // Outer circle
		context.stroke()
		context.fill()
		context.closePath()


		if (showLabels) {
			context.font = '16px serif';

			// Print value for vec 1
			var text = 'A: (' + vec1[0].toFixed(2) + ', ' + vec1[1].toFixed(2) + ')';
			var tex_width = context.measureText(text).width;
			var x_pos = centerX + vec1[0] * unit - tex_width * 0.5;
			var y_pos = centerY - vec1[1] * unit;
      		WriteText(text, 'rgb(0, 100, 255)', x_pos, y_pos);

			// Print value for vec 2
			text = 'A * s: (' + vec3[0].toFixed(2) + ', ' + vec3[1].toFixed(2) + ')';
			tex_width = context.measureText(text).width;
			x_pos = centerX + vec3[0] * unit - tex_width * 0.5
			y_pos = centerY - vec3[1] * unit;
      		WriteText(text, 'rgb(255, 150, 0)', x_pos, y_pos);


			context.font = '22px serif';
			text = 'Scale: ' + scale.toFixed(2);
      		WriteText(text, 'rgb(0, 175, 0)', 340, 25);
		}
	}
}

function WriteText(toWrite, color, xPos, yPos) {
      context.fillStyle = 'rgb(0, 0, 0)';
      context.fillText(toWrite, xPos + 1, yPos + 1);
      context.fillText(toWrite, xPos + 1, yPos);
      context.fillText(toWrite, xPos, yPos + 1);
      context.fillStyle = color;
      context.fillText(toWrite, xPos, yPos);
}

function PointInTriangle(point, v1, v2, v3) {
	var Area = 0.5 *(-v2[1]*v3[0] + v1[1]*(-v2[0] + v3[0]) + v1[0]*(v2[1] - v3[1]) + v2[0]*v3[1]);
	var s = 1/(2*Area)*(v1[1]*v3[0] - v1[0]*v3[1] + (v3[1] - v1[1])*point[0] + (v1[0] - v3[0])*point[1]);
	var t = 1/(2*Area)*(v1[0]*v2[1] - v1[1]*v2[0] + (v1[1] - v2[1])*point[0] + (v2[0] - v1[0])*point[1]);
	var u = 1-s-t
	return s > 0 && t > 0 && u > 0
}

function PointInCircle(point, cirX, cirY, rad) {
	var x2 = (point[0] - cirX) * (point[0] - cirX)
	var y2 = (point[1] - cirY) * (point[1] - cirY)
	return x2 + y2 < rad * rad
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
	context.lineTo(centerX + (vec2[0] - norm[0]) * unit, centerY - (vec2[1] - norm[1]) * unit) // -normal to make arrow pretty!
	context.stroke()
	context.closePath()

	// Draw the triange
	context.beginPath()
	context.moveTo(centerX + vec2[0] * unit, centerY - vec2[1] * unit)
	context.lineTo(centerX + (vec2[0] - norm[0] - perp[0]) * unit, centerY - (vec2[1] - norm[1] - perp[1]) * unit)
	context.lineTo(centerX + (vec2[0] - norm[0] + perp[0]) * unit, centerY - (vec2[1] - norm[1] + perp[1]) * unit)
	context.closePath()
	context.fill()
}