var showLabels = true

var canvas = null;
var context = null;
var unit = 15;
var mousePos = [0, 0]

var mouseOnVector = 0
var selectedVector = 0

var scale = 0.5
var offsetX = 200

var contour1 = [
  [ scale * 475.17 + offsetX, scale * 10.000 + 10.0 ],
  [ scale * 475.17 + offsetX, scale * 79.792 + 10.0 ],
  [ scale * 320.48 + offsetX, scale * -2.500 + 10.0 ],
  [ scale * 198.60 + offsetX, scale * 33.958 + 10.0 ],
  [ scale * 112.67 + offsetX, scale * 135.52 + 10.0 ],
  [ scale * 82.458 + offsetX, scale * 286.04 + 10.0 ],
  [ scale * 110.06 + offsetX, scale * 436.04 + 10.0 ],
  [ scale * 192.88 + offsetX, scale * 539.69 + 10.0 ],
  [ scale * 316.31 + offsetX, scale * 575.62 + 10.0 ],
  [ scale * 405.38 + offsetX, scale * 554.27 + 10.0 ],
  [ scale * 468.92 + offsetX, scale * 499.58 + 10.0 ],
  [ scale * 468.92 + offsetX, scale * 773.54 + 10.0 ],
  [ scale * 562.15 + offsetX, scale * 773.54 + 10.0 ],
  [ scale * 562.15 + offsetX, scale * 10.000 + 10.0 ]
];

var contour2 = [
  [ scale * 178.81 + offsetX, scale * 286.04 + 10.0 ],
  [ scale * 223.60 + offsetX, scale * 127.19 + 10.0 ],
  [ scale * 329.33 + offsetX, scale * 74.583 + 10.0 ],
  [ scale * 433.50 + offsetX, scale * 124.58 + 10.0 ],
  [ scale * 476.73 + offsetX, scale * 278.23 + 10.0 ],
  [ scale * 432.98 + offsetX, scale * 444.90 + 10.0 ],
  [ scale * 325.17 + offsetX, scale * 498.02 + 10.0 ],
  [ scale * 220.48 + offsetX, scale * 446.98 + 10.0 ]
];

function Init() {
  canvas = document.getElementById('game_canvas');
  if (canvas.getContext) {
    context = canvas.getContext('2d');

    canvas.addEventListener('mousemove', OnMouseMove, false);
  }
  Render();
}

function OnMouseMove(evt) {
  var rect = canvas.getBoundingClientRect();
  mousePos = [
    (evt.clientX - rect.left) / ((rect.right - rect.left) / canvas.width),
    (evt.clientY - rect.top)  / ((rect.bottom - rect.top) / canvas.height)
  ];

  var centerX = canvas.width / 2
  var centerY = canvas.height / 2

  /*var lastMouseOnVector = mouseOnVector
  var tri1 = GetTriangle(vec1, centerX, centerY)

  if (evt.buttons & 1 == 1) {
    if (selectedVector == 1) {
      vec1[0] = (mousePos[0] - centerX) / unit
      vec1[1] = (centerY - mousePos[1]) / unit
    }
  }
  else {
    selectedVector = 0
  }

  mouseOnVector = 0
  if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
    mouseOnVector = 1
  }*/

  //if (lastMouseOnVector != mouseOnVector || selectedVector != 0) {
    Render()
  //}
}


var bgColor = 'rgb(34, 34, 34)';
var gridColor = 'rgb(65, 65, 65)';
var fontColor = 'rgb(170, 170, 170)';

function Render() {
  if (context) {
    var centerX = canvas.width / 2
    var centerY = canvas.height / 2
    context.lineWidth = 1;

    // Clear BG Color
    context.fillStyle = bgColor;//'rgb(255, 255, 255)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'rgb(50, 50, 50)';
    context.fillStyle =   'rgb(50, 50, 50)';

    context.beginPath();

    //polygon1--- usually the outside polygon, must be clockwise
    var numPoints = contour1.length;
    context.moveTo(contour1[0][0], contour1[0][1]);
    for (var i = 1; i < numPoints; i++) {
      context.lineTo(contour1[i][0], contour1[i][1]);
    }
    context.closePath();

    //polygon2 --- usually hole,must be counter-clockwise 
    numPoints = contour2.length;
    context.moveTo(contour2[0][0], contour2[0][1]);
    for (var i = 1; i < numPoints; i++) {
      context.lineTo(contour2[i][0], contour2[i][1]);
    }
    context.closePath();
    context.fill();


    numPoints = contour1.length;
    for (var i = 0; i < numPoints; i++) {
        var thisPoint = contour1[i]
        var nextPoint = contour1[(i + 1) % numPoints];

        if (thisPoint[1] <= mousePos[1] && nextPoint[1] > mousePos[1]) { // Crossing scanline top to bottom
          context.strokeStyle = 'rgb(250, 55, 250)';
          context.fillStyle = 'rgb(250, 55, 250)';
        }
        else if (nextPoint[1] <= mousePos[1] && thisPoint[1] > mousePos[1]) { // Crossing scanline bottom up
            context.strokeStyle = 'rgb(250, 55, 250)';
          context.fillStyle = 'rgb(250, 55, 250)';
        }
        else {
          context.strokeStyle = 'rgb(55, 55, 250)';
          context.fillStyle = 'rgb(55, 55, 250)';
        }
        
        // Draw Line
        context.beginPath()
        context.moveTo(thisPoint[0], thisPoint[1])
        context.lineTo(nextPoint[0], nextPoint[1])
        context.stroke()
        context.closePath()

        DrawVector(thisPoint, nextPoint);
    }

    context.strokeStyle = 'rgb(55, 250, 55)';
    context.fillStyle = 'rgb(55, 250, 55)';

    numPoints = contour2.length;
    for (var i = 0; i < numPoints; i++) {
        var thisPoint = contour2[i]
        var nextPoint = contour2[(i + 1) % numPoints];
        
        if (thisPoint[1] <= mousePos[1] && nextPoint[1] > mousePos[1]) { // Crossing scanline top to bottom
          context.strokeStyle = 'rgb(250, 55, 250)';
          context.fillStyle = 'rgb(250, 55, 250)';
        }
        else if (nextPoint[1] <= mousePos[1] && thisPoint[1] > mousePos[1]) { // Crossing scanline bottom up
            context.strokeStyle = 'rgb(250, 55, 250)';
          context.fillStyle = 'rgb(250, 55, 250)';
        }
        else {
          context.strokeStyle = 'rgb(55, 250, 55)';
    context.fillStyle = 'rgb(55, 250, 55)';
        }

        // Draw Line
        context.beginPath()
        context.moveTo(thisPoint[0], thisPoint[1])
        context.lineTo(nextPoint[0], nextPoint[1])
        context.stroke()
        context.closePath()

        DrawVector(thisPoint, nextPoint);
    }

     context.strokeStyle = 'rgb(250, 55, 55)';
    context.fillStyle = 'rgb(250, 55, 55)';
   // Draw Line
    context.beginPath()
    context.moveTo(0, mousePos[1])
    context.lineTo(800, mousePos[1])
    context.stroke()
    context.closePath()
  }
}

function DrawVector(v1, v2) {
  var d = [v2[0] - v1[0], 
           v2[1] - v1[1]];

  var norm = [d[0], d[1]]
  var len = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1])
  if (len != 0) {
    norm[0] /= len
    norm[1] /= len
  }

  // Get perpendicular vector
  var perp = [norm[1], -norm[0]]

  // Draw the line
  context.beginPath()
  context.moveTo(v1[0], v1[1])
  context.lineTo(v2[0], v2[1]) // -normal to make arrow pretty!
  context.stroke()
  context.closePath()

  var arrowLen = 8.0
  var arrowWidth = 5.0

  var v3 = [
    v2[0] - norm[0] * arrowLen + perp[0] * arrowWidth,
    v2[1] - norm[1] * arrowLen + perp[1] * arrowWidth
  ]

  var v4 = [
    v2[0] - norm[0] * arrowLen - perp[0] * arrowWidth,
    v2[1] - norm[1] * arrowLen - perp[1] * arrowWidth
  ]

  // Draw the triange
  context.beginPath()
  context.moveTo(v2[0], v2[1])
  context.lineTo(v3[0], v3[1])
  context.lineTo(v4[0], v4[1])
  context.closePath()
  context.fill()
}