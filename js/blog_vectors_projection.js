var showLabels = true

var canvas = null;
var context = null;
var unit = 100
var scaleOffset = 1.0 / 10
var mousePos = [0, 0]

var mouseOnVector = 0
var selectedVector = 0

var vec1 = [1, 1.5]
var vec2 = [2, 0]

var showTriangle = true
var forceNormal = false

var triangleRect = [20,540,20,20]
var normalizeRect = [20,570,20,20]

var mouseOverControl = 0 // 1 = triangle, 2 = normalize
var mouseDownControl = 0

var text_orange = 'rgb(250, 150, 0)'
var text_green = 'rgb(0, 200, 0)'
var text_blue = 'rgb(0, 100, 255)'
var text_red = 'rgb(200, 0, 0)'

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
	if (forceNormal) {
		vec1 = Normalized(vec1)
		vec2 = Normalized(vec2)
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
	var tri2 = GetTriangle(vec2, centerX, centerY)

	if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
		selectedVector = 1
	}
	else if (PointInTriangle(mousePos, tri2[0], tri2[1], tri2[2])) {
		selectedVector = 2
	}
	else {
		selectedVector = 0
	}
	triangleRect[1] = canvas.height - (600 - 540)
	normalizeRect[1] = canvas.height - (600 - 570)
	if (PointInRect(mousePos, triangleRect)) {
		mouseDownControl = 1
		Render()
	}
	else if (PointInRect(mousePos, normalizeRect)) {
		mouseDownControl = 2
		Render()
	}
	else {
		mouseDownControl = 0
		Render()
	}
}

function OnMouseUp(evt) {
	triangleRect[1] = canvas.height - (600 - 540)
	normalizeRect[1] = canvas.height - (600 - 570)

	if (PointInRect(mousePos, triangleRect)) {
		if (mouseDownControl == 1) {
			showTriangle = !showTriangle
			Render()
		}
	}
	else if (PointInRect(mousePos, normalizeRect)) {
		if (mouseDownControl == 2) {
			forceNormal = !forceNormal
			if (forceNormal) {
				vec1 = Normalized(vec1)
				vec2 = Normalized(vec2)
			}
			Render()
		}
	}

	selectedVector = 0
	mouseDownControl = 0
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
	var lastSelectedControl = mouseOverControl

	var tri1 = GetTriangle(vec1, centerX, centerY)
	var tri2 = GetTriangle(vec2, centerX, centerY)

	if (evt.buttons & 1 == 1) {
		if (selectedVector == 1) {
			vec1[0] = (mousePos[0] - centerX) / unit
			vec1[1] = (centerY - mousePos[1]) / unit
			if (forceNormal) {
				vec1 = Normalized(vec1)
			}
		}
		else if (selectedVector == 2) {
			vec2[0] = (mousePos[0] - centerX) / unit
			vec2[1] = (centerY - mousePos[1]) / unit
			if (forceNormal) {
				vec2 = Normalized(vec2)
			}
		}
	}
	else {
		selectedVector = 0
	}

	triangleRect[1] = canvas.height - (600 - 540)
	normalizeRect[1] = canvas.height - (600 - 570)
	mouseOverControl = 0
	if (PointInRect(mousePos, triangleRect)) {
		mouseOverControl = 1
	}
	else if (PointInRect(mousePos, normalizeRect)) {
		mouseOverControl = 2
	}

	mouseOnVector = 0
	if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
		mouseOnVector = 1
	}
	else if (PointInTriangle(mousePos, tri2[0], tri2[1], tri2[2])) {
		mouseOnVector = 2
	}

	if (lastMouseOnVector != mouseOnVector || selectedVector != 0) {
		Render()
	}
	else if (lastSelectedControl != mouseOverControl) {
		Render()
	}
}

var bgColor = 'rgb(34, 34, 34)';
var gridColor = 'rgb(65, 65, 65)';
var fontColor = 'rgb(170, 170, 170)';

function Render() {
	triangleRect[1] = canvas.height - (600 - 540)
	normalizeRect[1] = canvas.height - (600 - 570)
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
	    context.arc(centerX, centerY, 100, 0, Math.PI * 2, true); // Outer circle
		context.stroke()
		context.closePath()

		// Draw instructions
		context.font = '24px serif';
		var text = context.measureText('Click and drag the blue or green arrow');

		context.fillStyle = bgColor;//'rgb(156, 156, 156)';
		context.fillRect(canvas.width - text.width - 20, canvas.height - 40, text.width + 10, 35);

		context.fillStyle = fontColor;//'rgb(255, 255, 255)';
		context.fillText('Click and drag the blue or green arrow', canvas.width - text.width - 15, canvas.height - 15);

		// Draw vector 2
		context.strokeStyle = 'rgba(0, 150, 0, 0.7)';
		context.fillStyle = 'rgba(0, 150, 0, 0.7)';			
		if (mouseOnVector == 2) {
			context.strokeStyle = 'rgb(0, 150, 0)';
			context.fillStyle = 'rgb(0, 150, 0)';
		}
		context.lineWidth = 3
		DrawVec2(vec2, centerX, centerY)

		var vec3 = Projection(vec1, vec2)
		context.lineWidth = 3
		context.setLineDash([4, 2]);
		context.strokeStyle = 'rgb(250, 150, 0)';
		context.fillStyle = 'rgb(250, 150, 0)';
		DrawVec2(vec3, centerX, centerY)
		context.setLineDash([]);

		var vec4 = Rejection(vec1, vec2)
		if (showTriangle) {
			context.lineWidth = 3
			context.setLineDash([4, 2]);
			context.strokeStyle = 'rgb(200, 0, 0)';
			context.fillStyle = 'rgb(200, 0, 0)';
			DrawVec2(vec4, centerX + vec3[0] * unit, centerY - vec3[1] * unit)
			context.setLineDash([]);
		}

		// Draw vector 1
		context.strokeStyle = 'rgba(0, 0, 255, 0.7)';
		context.fillStyle = 'rgba(0, 0, 255, 0.7)';
		if (mouseOnVector == 1) {		
			context.strokeStyle = 'rgb(0, 0, 255)';
			context.fillStyle = 'rgb(0, 0, 255)';
		}
		context.lineWidth = 3
		DrawVec2(vec1, centerX, centerY)

		if (showLabels) {
			context.font = '22px serif';


			var dotRes = Magnitude(vec1)
			WriteText('||A||:  ' + (dotRes).toFixed(2), text_blue, 20, 35)
			dotRes = Magnitude(vec2)
			WriteText('||B||:  ' + (dotRes).toFixed(2), text_green, 20, 65)
			dotRes = Magnitude(vec3)
			WriteText('||proj||:  ' + (dotRes).toFixed(2), text_orange, 20, 95)

			if (showTriangle) {
				dotRes = Magnitude(vec4)
				WriteText('||rej||:  ' + (dotRes).toFixed(2), text_red, 20, 125)
			}

			context.font = '16px serif';
			// Print value for vec 1
			var text = 'A: (' + vec1[0].toFixed(2) + ', ' + vec1[1].toFixed(2) + ')'
			var text_width = context.measureText(text).width;
			WriteText(text, text_blue, centerX + vec1[0] * unit - text_width * 0.5, centerY - vec1[1] * unit);

			var yOfset = 20
			var xOffset = 20
			if (vec3[1] < 0) {
				yOfset = -15
			}

			text = 'Projection: (' + vec3[0].toFixed(2) + ', ' + vec3[1].toFixed(2) + ')'
			text_width = context.measureText(text).width;
			WriteText(text, text_orange, centerX + vec3[0] * unit - text_width, centerY - vec3[1] * unit + yOfset);

			if (showTriangle) {
				yOfset = 20
				if (vec4[1] - vec3[1] < 0) {
					yOfset = -15
				}
				xOffset = 20
				if (vec4[0] + vec3[0] > 0) {
					xOffset = -20
				}
				text = 'Rejection: (' + vec4[0].toFixed(2) + ', ' + vec4[1].toFixed(2) + ')'
				WriteText(text, text_red, centerX + (vec4[0] * unit) + (vec3[0] * unit) + xOffset, centerY - (vec4[1] * unit) - (vec3[1] * unit) + yOfset);
			}

			// Print value for vec 2
			text = 'B: (' + vec2[0].toFixed(2) + ', ' + vec2[1].toFixed(2) + ')'
			text_width = context.measureText(text).width;
			WriteText(text, text_green, centerX + vec2[0] * unit - text_width * 0.5, centerY - vec2[1] * unit);

			context.font = '18px serif';
			WriteText("Show Rejection", text_orange, 50, canvas.height - (600 - 557));
			WriteText("Normalize Vectors", text_orange, 50, canvas.height - (600 - 587));

			// Triangles
			context.lineWidth = 1
			var padding = 5
			if (showTriangle) {
				context.beginPath();
				context.strokeStyle = 'rgb(250, 150, 0)';
				context.fillStyle = 'rgba(250, 150, 0, 0.25)';
				if (mouseOverControl == 1) {
					context.fillStyle = 'rgba(250, 150, 0, 0.5)';
				}
				context.rect(triangleRect[0], triangleRect[1], triangleRect[2], triangleRect[3]);
				context.fill()
				context.stroke();

				context.lineWidth = 2

				context.beginPath();
				context.strokeStyle = 'rgb(0, 0, 0)';
				context.moveTo(padding + triangleRect[0], triangleRect[1] + triangleRect[3] * 0.5);
				context.lineTo(triangleRect[0] + triangleRect[2] * 0.5, triangleRect[1] + triangleRect[3] - padding)
				context.lineTo(triangleRect[0] + triangleRect[2] - padding, padding + triangleRect[1])
				context.stroke();
			}
			else {
				context.beginPath();
				context.strokeStyle = 'rgb(250, 150, 0)';
				context.fillStyle = 'rgba(250, 150, 0, 0.25)';

				context.rect(triangleRect[0], triangleRect[1], triangleRect[2], triangleRect[3]);

				if (mouseOverControl == 1) {
					context.fill()
				}

				context.stroke();
			}

			// Nornalize
			context.lineWidth = 1
			if (forceNormal) {
				context.beginPath();
				context.strokeStyle = 'rgb(250, 150, 0)';
				context.fillStyle = 'rgba(250, 150, 0, 0.25)';
				if (mouseOverControl == 2) {
					context.fillStyle = 'rgba(250, 150, 0, 0.5)';
				}
				context.rect(normalizeRect[0], normalizeRect[1], normalizeRect[2], normalizeRect[3]);
				context.fill()
				context.stroke();

				context.lineWidth = 2

				context.beginPath();
				context.strokeStyle = 'rgb(0, 0, 0)';
				context.moveTo(padding + normalizeRect[0], normalizeRect[1] + normalizeRect[3] * 0.5);
				context.lineTo(normalizeRect[0] + normalizeRect[2] * 0.5, normalizeRect[1] + normalizeRect[3] - padding)
				context.lineTo(normalizeRect[0] + normalizeRect[2] - padding, padding + normalizeRect[1])
				context.stroke();
			}
			else {
				context.beginPath();
				context.strokeStyle = 'rgb(250, 150, 0)';
				context.fillStyle = 'rgba(250, 150, 0, 0.25)';

				context.rect(normalizeRect[0], normalizeRect[1], normalizeRect[2], normalizeRect[3]);

				if (mouseOverControl == 2) {
					context.fill()
				}

				context.stroke();
			}
		}
	}
}

function Projection(a, b) {
	var magSq = b[0] * b[0] + b[1] * b[1]
	if (magSq == 0) {
		return b
	}
    var scale = Dot(a, b) / magSq;
    return [b[0] * scale, b[1] * scale]
}

function Rejection(a, b) {
	var proj = Projection(a, b)
	return [a[0] - proj[0], a[1] - proj[1]]
}

function Magnitude(vec) {
	var dot = vec[0] * vec[0] + vec[1] * vec[1]
	if (dot != 0) {
		return Math.sqrt(dot)
	}
	return 0;
}

function Dot(vec1, vec2) {
	return vec1[0] * vec2[0] + vec1[1] * vec2[1]	
}

function Angle(vec1, vec2) {
	var dot = vec1[0] * vec2[0] + vec1[1] * vec2[1]
	var lenSum = Length(vec1) * Length(vec2) // TODO: Can this be optimized!?!?
	return Math.acos(dot / lenSum)
}

function Length(vec) {
	var dot = vec[0] * vec[0] + vec[1] * vec[1]
	if (dot != 0) {
		var mag = Math.sqrt(dot)
		return mag
	}
	return 0
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

function PointInRect(point, rect) {
	var left = rect[0]
	var top = rect[1]
	var right = rect[0] + rect[2]
	var bottom = rect[1] + rect[3]

	var x = point[0]
	var y = point[1]

	return x > left && x < right && y > top && y < bottom;
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