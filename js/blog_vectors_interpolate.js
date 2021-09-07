var showLabels = true

var canvas = null;
var context = null;
var unit = 160
var scaleOffset = 1.0 / 8.0
var mousePos = [0, 0]

var mouseOnVector = 0
var selectedVector = 0

var start_vec = [-0.78, 0.63]
var end_vec = [0.78, 0.63]
var v1 = [1, 0]
var v2 = [1, 0]
var v3 = [1, 0]
var t_val = 0.67

var imgui = null

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

        canvas.addEventListener('mousemove', OnMouseMove);
        canvas.addEventListener('mousedown', OnMouseDown);
        canvas.addEventListener('mouseup', OnMouseUp);

        imgui = IM_Init(canvas, context, Render);
    }
    start_vec = Normalized(start_vec);
    end_vec = Normalized(end_vec);
    v1 = Lerp(start_vec, end_vec, t_val)
    v2 = Slerp(start_vec, end_vec, t_val)
    v3 = Nlerp(start_vec, end_vec, t_val)
    Render();
}

function Add(v1, v2) {
    return [
    v1[0] + v2[0],
    v1[1] + v2[1]
    ]
}

function Scale(v1, f) {
    return [
    v1[0] * f,
    v1[1] * f
    ]
}

function Sub(v1, v2) {
    return [
    v1[0] - v2[0],
    v1[1] - v2[1]
    ]
}

function Lerp(from, to ,t) {
    return Add(from, Scale(Sub(to, from), t));
}

function Mul(v1, v2) {
    return [
    v1[0] * v2[0],
    v1[1] * v2[1]
    ]
}

function Slerp(from, to, t) {
    from = Normalized(from);
    to = Normalized(to);

    const theta = Math.acos(from[0] * to[0] + from[1] * to[1]);
    const sin_theta = Math.sin(theta);

    const a = Math.sin((1.0 - t) * theta) / sin_theta
    const b = Math.sin(t * theta) / sin_theta;

    const result = Add(
        Scale(from, a),
        Scale(to, b)
    );

    return result;
}

function Nlerp( from,  to,  t) {
    const lerp = Lerp(from, to, t);
    return Normalized(lerp);
}

function OnMouseDown(evt) {
    var rect = canvas.getBoundingClientRect();
      mousePos = [
        (evt.clientX - rect.left) / ((rect.right - rect.left) / canvas.width),
        (evt.clientY - rect.top)  / ((rect.bottom - rect.top) / canvas.height)
      ];

    var centerX = canvas.width / 2
    var centerY = canvas.height / 2

    var tri1 = GetTriangle(start_vec, centerX, centerY)
    var tri2 = GetTriangle(end_vec, centerX, centerY)

    if (PointInTriangle(mousePos, tri1[0], tri1[1], tri1[2])) {
        selectedVector = 1
    }
    else if (PointInTriangle(mousePos, tri2[0], tri2[1], tri2[2])) {
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
    var tri1 = GetTriangle(start_vec, centerX, centerY)
    var tri2 = GetTriangle(end_vec, centerX, centerY)

    if (evt.buttons & 1 == 1) {
        if (selectedVector == 1) {
            start_vec[0] = (mousePos[0] - centerX) / unit
            start_vec[1] = (centerY - mousePos[1]) / unit
        }
        else if (selectedVector == 2) {
            end_vec[0] = (mousePos[0] - centerX) / unit
            end_vec[1] = (centerY - mousePos[1]) / unit
        }
        start_vec = Normalized(start_vec)
        end_vec = Normalized(end_vec)


        v1 = Lerp(start_vec, end_vec, t_val)
        v2 = Slerp(start_vec, end_vec, t_val)
        v3 = Nlerp(start_vec, end_vec, t_val)
    }
    else {
        selectedVector = 0
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
}


var bgColor = 'rgb(34, 34, 34)';
var gridColor = 'rgb(65, 65, 65)';
var fontColor = 'rgb(170, 170, 170)';

function Render() {
    IM_BeginFrame(imgui);

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

        // Draw circle
        context.beginPath()
        context.arc(centerX, centerY, unit, 0, Math.PI * 2, true); // Outer circle
        context.stroke()
        context.closePath()

        // Draw instructions
        context.font = '24px serif';
        var text = context.measureText('Use slider to change interpolation time');

        context.fillStyle = bgColor;//'rgb(156, 156, 156)';
        context.fillRect(canvas.width - text.width - 20, canvas.height - 40, text.width + 10, 35);

        context.fillStyle = fontColor;//'rgb(255, 255, 255)';
        context.fillText('Use slider to change interpolation time', canvas.width - text.width - 15, canvas.height - 15);

        context.lineWidth = 3
        context.strokeStyle = 'rgb(200, 0, 0)';
        context.fillStyle =   'rgb(200, 0, 0)';
        context.setLineDash([4, 2]);
        context.beginPath()
        context.moveTo(centerX + start_vec[0] * unit, centerY - start_vec[1]  * unit)
        context.lineTo(centerX + end_vec[0] * unit, centerY - end_vec[1]  * unit)
        context.stroke()
        context.closePath()
        context.setLineDash([]);

        // Draw vector 1
        if (mouseOnVector == 1 || selectedVector == 1) {
            context.strokeStyle = 'rgb(100, 100, 100)';
            context.fillStyle = 'rgb(100, 100, 100)';
        }
        else {
            context.strokeStyle = 'rgb(150, 150, 150)';
            context.fillStyle = 'rgb(150, 150, 150)';
        }
        context.lineWidth = 3
        DrawVec2(start_vec, centerX, centerY)
        
         // Draw vector 2
        if (mouseOnVector == 2 || selectedVector == 2) {
            context.strokeStyle = 'rgb(100, 100, 100)';
            context.fillStyle = 'rgb(100, 100, 100)';
        }
        else {
            context.strokeStyle = 'rgb(150, 150, 150)';
            context.fillStyle = 'rgb(150, 150, 150)';
        }
        context.lineWidth = 3
        DrawVec2(end_vec, centerX, centerY)

        //IM_Rect(imgui, [1,1,1], [20, 5, 400, 30])
        t_val = IM_Scrollbar(imgui, t_val, [20, 5])
        IM_Label(imgui, "t: " + t_val.toFixed(4), [0.4, 0.4, 0.4], [380, 5])

        v1 = Lerp(start_vec, end_vec, t_val)
        v2 = Slerp(start_vec, end_vec, t_val)
        v3 = Nlerp(start_vec, end_vec, t_val)

        context.lineWidth = 3
        context.strokeStyle = 'rgb(0, 0, 250)';
        context.fillStyle =   'rgb(0, 0, 250)';
        DrawVec2(v3, centerX, centerY)
        context.strokeStyle = 'rgb(200, 0, 0)';
        context.fillStyle =   'rgb(200, 0, 0)';
        DrawVec2(v1, centerX, centerY)
        context.strokeStyle = 'rgb(0, 150, 0)';
        context.fillStyle =   'rgb(0, 150, 0)';
        DrawVec2(v2, centerX, centerY)
        

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