var polar_2d_canvas = null;
var polar_2d_context = null;

var polar_3d_canvas = null;
var polar_gl = null;
var polar_shader = null;
var polar_projection = null;
var polar_view = null;

var polar_width = 800;
var polar_2d_height = 80;
var polar_3d_height = 400;
var polar_mouse = [0, 0]
var polar_scale = [1, 1]

var polar_cam_pos = [3 * 1.5, 4 * 1.5, 6 * 1.5]
var polar_cam_target = [0, 0, 0]

var polar_mouseOnItem = 0
var polar_selectedItem = 0

var polar_checkbox = [10,50,20,20]
var polar_show_reference = false

var polar_t = 0;

var polar_cylinder = null;
var polar_basis = [
  1.597270686975348, 0.15045381104601616, 0, 0,
  -1.2036304883681292, 0.1996588358719185, 0, 0,
  0, 0, 0.25000000000000006, 0,
  0, 0, 0, 1
]

function Init() {
  polar_2d_canvas = document.getElementById('polar_2d_canvas');
  if (polar_2d_canvas && polar_2d_canvas.getContext) {
    polar_2d_context = polar_2d_canvas.getContext('2d');

    polar_2d_canvas.addEventListener('mousemove', OnMouseMovePolar, false);
    polar_2d_canvas.addEventListener('mousedown', OnMouseDownPolar, false);
    polar_2d_canvas.addEventListener('mouseup', OnMouseUpPolar, false);
  }

  polar_3d_canvas = document.getElementById('polar_3d_canvas');
  if (polar_3d_canvas && polar_3d_canvas.getContext) {
    polar_gl = polar_3d_canvas.getContext("webgl");

    if (!polar_gl) {
      alert("Can't initialize Web GL!\nWon't be able to render examples.")
    }
    else {
      //polar_gl.clearColor(1, 1, 1, 1);
      polar_gl.clearColor(34.0/255.0,34.0/255.0,34.0/255.0, 1);


      polar_gl.clearDepth(1.0);
      polar_gl.enable(polar_gl.DEPTH_TEST);
      polar_gl.depthFunc(polar_gl.LEQUAL);

      polar_gl.enable(polar_gl.CULL_FACE);
      polar_gl.cullFace(polar_gl.BACK);

      polar_shader = MakeSolidColorShader(polar_gl);

      polar_projection = PerspectiveMatrix(60, 0.1, 500, polar_width / polar_3d_height);
      polar_view = LookAt(polar_cam_pos, polar_cam_target, [0, 1, 0]);

      polar_cylinder = MakeCylinder(polar_gl, {x:0,y:0,z:0}, 0.5, 1);
    }
  }

  RenderPolar();
}

function OnMouseDownPolar(evt) {
  var rect = polar_2d_canvas.getBoundingClientRect();
  polar_mouse = [
    evt.clientX - rect.left,
    evt.clientY - rect.top
  ];

  polar_scale = [
    (rect.right - rect.left) / polar_width,
    (rect.bottom - rect.top) / polar_2d_height
  ]

  polar_mouse[0] /= polar_scale[0];
  polar_mouse[1] /= polar_scale[1];

  var cirX = 20 + GetIterationPolar() * 30
  var cirY = 20
  var cirR = 10

  if (PointInCircle(polar_mouse, cirX, cirY, cirR)) {
    polar_selectedItem = 2
  }
  else if (PointInRect(polar_mouse, polar_checkbox)) {
    polar_selectedItem = 1
  }

  RenderPolar()
}

function OnMouseUpPolar(evt) {
  if (PointInRect(polar_mouse, polar_checkbox)) {
    if (polar_selectedItem == 1) {
      polar_show_reference = !polar_show_reference
      RenderPolar()
    }
  }

  polar_selectedItem = 0
}

function OnMouseMovePolar(evt) {
  var rect = polar_2d_canvas.getBoundingClientRect();
  polar_mouse = [
    evt.clientX - rect.left,
    evt.clientY - rect.top
  ];

  polar_scale = [
    (rect.right - rect.left) / polar_width,
    (rect.bottom - rect.top) / polar_2d_height
  ]

  polar_mouse[0] /= polar_scale[0];
  polar_mouse[1] /= polar_scale[1];

  var lastpolar_mouseOnItem = polar_mouseOnItem
  var cirX = 20 + GetIterationPolar() * 30

  if (evt.buttons & 1 == 1) {
   cirX = GetHandleXPolar(polar_t);

   if (polar_selectedItem == 2) {
      var current = polar_mouse[0]
      if (current < 20) {
        current = 20
      }
      else if (current > 20 + 270) {
        current = 20 + 270
      }

      current = (current - 20) / (270)
      if (current < 0) {
        current = 0
      }
      else if (current > 1) {
        current = 1
      }

      polar_t = current
    }
  }
  else {
    polar_selectedItem = 0
  }

  polar_mouseOnItem = 0

  var cirY = 20
  var cirR = 10

  if (PointInCircle(polar_mouse, cirX, cirY, cirR)) {
    polar_mouseOnItem = 2
  }
  else if (PointInRect(polar_mouse, polar_checkbox)) {
    polar_mouseOnItem = 1
  }

  if (lastpolar_mouseOnItem != polar_mouseOnItem || polar_selectedItem != 0) {
    RenderPolar()
  }
}

function RenderPolar() {
  RenderPolar2D();
  RenderPolar3D();
}

function RenderPolar3D() {
  if (!polar_gl) {
    return;
  }

  UpdatePolarBasis();

  polar_gl.clear(polar_gl.COLOR_BUFFER_BIT | polar_gl.DEPTH_BUFFER_BIT);

  var model = null;

  if (polar_show_reference) {
    model = [
      0.19965883587191846, 0.15045381104601613, 0, 0,
      -0.15045381104601613, 0.19965883587191846, 0, 0,
      0, 0, 3, 0, 
      0, 0, 1.5, 1
    ]
    DrawBuffer(polar_cylinder, model, {r:0.75, g:0.75, b:1})
    
    model = [
      0, 0, 0.24999999999994335, 0,
      -0.15045381104601613, 0.19965883587191846, 0, 0,
      -2.3959060304624784, -1.8054457325517843, -0.000002019615310804749, 0,
      1.1979530152315108, 0.9027228662760968, 0, 1
    ]
    DrawBuffer(polar_cylinder, model, {r:1, g:0.75, b:0.75})

    model = [
      0.19965883587191846, 0.15045381104601613, 0, 0,
      0, 0, -0.24999999999994335, 0,
      -1.8054457325517843, 2.3959060304624784, -0.000002019615310804749, 0,
      -0.9027228662760968, 1.1979530152315108, 0, 1
    ]
    DrawBuffer(polar_cylinder, model, {r:0.75, g:1, b:0.75})
  }

  var scale = [
    0.25, 0, 0, 0,
    0, 0.25, 0, 0,
    0, 0, 3, 0,
    0, 0, 0, 1
  ];
  var rotate = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
  var translate = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 1.5, 1
  ]
  // TRS: Translate first, rotate second, scale last!
  const angle = 90 * 0.0174533
  model = Mul_MM(Mul_MM(scale, rotate), translate)
  var debug = Mul_MM(model, polar_basis)
  DrawBuffer(polar_cylinder, Mul_MM(model, polar_basis), {r:0, g:0, b:1})
  
  rotate = [
    Math.cos(angle), 0, Math.sin(angle), 0,
    0, 1, 0, 0,
    -Math.sin(angle), 0, Math.cos(angle), 0,
    0, 0, 0, 1
  ]
  translate[12] = 1.5
  translate[14] = 0
  model = Mul_MM(Mul_MM(scale, rotate), translate)
  debug = Mul_MM(model, polar_basis)
  DrawBuffer(polar_cylinder, Mul_MM(model, polar_basis), {r:1, g:0, b:0})

  rotate = [
    1, 0, 0, 0,
    0, Math.cos(angle), -Math.sin(angle), 0,
    0, Math.sin(angle), Math.cos(angle), 0,
    0, 0, 0, 1
  ]
  translate[13] = 1.5
  translate[12] = 0
  model = Mul_MM(Mul_MM(scale, rotate), translate)
  debug = Mul_MM(model, polar_basis)
  DrawBuffer(polar_cylinder, Mul_MM(model, polar_basis), {r:0, g:1, b:0})
}

function RenderPolar2D() {
  if (polar_2d_context) {

    let body_element = document.getElementsByTagName("BODY")[0]; 
    let bodyBgColor = window.getComputedStyle(body_element).backgroundColor;
    
    let content_element = document.getElementById("content"); 
    let contentBgColor = window.getComputedStyle(content_element).color;


    // Clear BG Color
    polar_2d_context.fillStyle = bodyBgColor;//'rgb(255, 255, 255)';
    polar_2d_context.fillRect(0, 0, polar_width, polar_2d_height);

    // Draw the scale slider
    polar_2d_context.setLineDash([]);
    polar_2d_context.strokeStyle = contentBgColor;//'rgb(128, 128, 128)';
    polar_2d_context.fillStyle = contentBgColor;//'rgb(32, 32, 32)';

    polar_2d_context.lineWidth = 2

    // Draw slider line
    polar_2d_context.beginPath()
    polar_2d_context.moveTo(20 - 10, 20)
    polar_2d_context.lineTo(20 + 270 + 10, 20) 
    polar_2d_context.stroke()
    polar_2d_context.closePath()

    // Draw notches
    polar_2d_context.beginPath()
    for (var i = 0; i < 10; ++i) {
      var x = 20 + i * 30;
      polar_2d_context.moveTo(x, 10)
      polar_2d_context.lineTo(x, 30) 
      polar_2d_context.stroke()
    }
    polar_2d_context.closePath()

    polar_2d_context.lineWidth = 1

    // Scale
    polar_2d_context.strokeStyle = contentBgColor;//'rgb(32, 32, 32)';
    polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
    if (polar_mouseOnItem == 2 || polar_selectedItem == 2) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
    }
    var handleX = 20 + GetIterationPolar() * 30
    var handleY = 20
    polar_2d_context.beginPath()
    polar_2d_context.arc(handleX, handleY, 10, 0, Math.PI * 2, true); // Outer circle
    polar_2d_context.stroke()
    polar_2d_context.fill()
    polar_2d_context.closePath()

    polar_2d_context.font = '18px serif';
    debugString = 'Iteration: ' + GetIterationPolar()
    polar_2d_context.fillStyle = contentBgColor;//'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, 320, 25);

    // Checkbox
    var padding = 5
    if (polar_show_reference) {
      polar_2d_context.strokeStyle = contentBgColor;//'rgb(32, 32, 32)';  
      polar_2d_context.fillStyle = 'rgb(128, 128, 128)';

      polar_2d_context.beginPath();
      if (polar_mouseOnItem == 1) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
      }
      polar_2d_context.rect(polar_checkbox[0], polar_checkbox[1], polar_checkbox[2], polar_checkbox[3]);
      polar_2d_context.fill()
      polar_2d_context.stroke();
      polar_2d_context.closePath();

      polar_2d_context.lineWidth = 2

      polar_2d_context.beginPath();
      polar_2d_context.strokeStyle = 'rgb(0, 0, 0)';
      polar_2d_context.moveTo(padding + polar_checkbox[0], polar_checkbox[1] + polar_checkbox[3] * 0.5);
      polar_2d_context.lineTo(polar_checkbox[0] + polar_checkbox[2] * 0.5, polar_checkbox[1] + polar_checkbox[3] - padding)
      polar_2d_context.lineTo(polar_checkbox[0] + polar_checkbox[2] - padding, padding + polar_checkbox[1])
      polar_2d_context.stroke();
      polar_2d_context.closePath();

      polar_2d_context.lineWidth = 1
    }
    else {
      polar_2d_context.strokeStyle = contentBgColor;//'rgb(32, 32, 32)';  
      polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
      polar_2d_context.beginPath();
      polar_2d_context.rect(polar_checkbox[0], polar_checkbox[1], polar_checkbox[2], polar_checkbox[3]);

      if (polar_mouseOnItem == 1) {
        polar_2d_context.fill()
      }

      polar_2d_context.stroke();
      polar_2d_context.closePath();
    }

    polar_2d_context.font = '18px serif';
    debugString = 'Show correct vectors for reference'
    polar_2d_context.fillStyle = contentBgColor;//'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, polar_checkbox[0] + polar_checkbox[2] + 10, polar_checkbox[1] + polar_checkbox[3] * 0.75);
  }
}

function PointInCircle(point, cirX, cirY, rad) {
  var x2 = (point[0] - cirX) * (point[0] - cirX)
  var y2 = (point[1] - cirY) * (point[1] - cirY)
  return x2 + y2 < rad * rad
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

function GetHandleXPolar(_t) {
  // Lerp
  return 20 + (290 - 20) * _t
}

function GetIterationPolar() {
  return Math.floor(polar_t * 270 / 30)
}

function UpdatePolarBasis() {
  polar_basis = [
    1.597270686975348, 0.15045381104601616, 0, 0,
    -1.2036304883681292, 0.1996588358719185, 0, 0,
    0, 0, 0.25000000000000006, 0,
    0, 0, 0, 1
  ]
  var numIter = GetIterationPolar()

  var Q = Copy_M4_to_M3(polar_basis);
  var Qit = Transpose3(Inverse3(Q))

  for (var i = 0; i < numIter; ++i) {
    Q = Mul_M3(Add_M3(Q, Qit), 0.5)
    Qit = Transpose3(Inverse3(Q))
  }

  polar_basis = [
    Q[0], Q[1], Q[2], 0,
    Q[3], Q[4], Q[5], 0,
    Q[6], Q[7], Q[8], 0,
    0, 0, 0, 1
  ]
}

function Copy_M4_to_M3(m) {
  return [
    m[0], m[1], m[2],
    m[4], m[5], m[6],
    m[8], m[9], m[10]
  ]
}

function Transpose3(m) {
  return [
    m[0], m[3], m[6],
    m[1], m[4], m[7],
    m[2], m[5], m[8]
  ]
}

function Mul_M3(m, f) {
  return [
    m[0] * f, m[1] * f, m[2] * f,
    m[3] * f, m[4] * f, m[5] * f,
    m[6] * f, m[7] * f, m[8] * f
  ]
}

function Add_M3(m1, m2) {
  return [
    m1[0] + m2[0], m1[1] + m2[1], m1[2] + m2[2],
    m1[3] + m2[3], m1[4] + m2[4], m1[5] + m2[5],
    m1[6] + m2[6], m1[7] + m2[7], m1[8] + m2[8] 
  ]
}

function Det3(m) {
  if (m.length != 9) {
    alert("Trying to get the determinant of a non 3x3 matrix");
  }
  const cofactor_00 =         m[4] * m[8] - m[7] * m[5];
  const cofactor_01 = -1.0 * (m[1] * m[8] - m[7] * m[2]);
  const cofactor_02 =         m[1] * m[5] - m[4] * m[2];

  const determinant = cofactor_00 * m[0] + cofactor_01 * m[3] + cofactor_02 * m[6];

  return determinant
}

function Inverse3(m) {
  if (m.length != 9) {
    alert("Trying to get the determinant of a non 3x3 matrix");
  }

  const cofactor_00 =         m[4] * m[8] - m[7] * m[5];
  const cofactor_01 = -1.0 * (m[1] * m[8] - m[7] * m[2]);
  const cofactor_02 =         m[1] * m[5] - m[4] * m[2];

  const determinant = cofactor_00 * m[0] + cofactor_01 * m[3] + cofactor_02 * m[6];
  if (isNaN(determinant)) {
    alert("Determinant is nan");
  }
  if (determinant == 0.0) {
    alert("Matrix does not have an inverse!");
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }

  const inv_determinant = 1.0 / determinant;
  if (isNaN(inv_determinant)) {
    alert("Inv-determinant is nan");
  }
  if (inv_determinant == 0.0) {
    alert("Matrix does not have an inverse!");
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }

  const adjugate = [
    m[4] * m[8] - m[7] * m[5],
    -1.0 * (m[1] * m[8] - m[7] * m[2]),
    m[1] * m[5] - m[4] * m[2],

    -1.0 * (m[3] * m[8] - m[6] * m[5]),
    m[0] * m[8] - m[6] * m[2], 
    -1.0 * (m[0] * m[5] - m[3] * m[2]),

    m[3] * m[7] - m[6] * m[4],
    -1.0 * (m[0] * m[7] - m[6] * m[1]),
    m[0] * m[4] - m[3] * m[1]
  ]

  return [
    adjugate[0] * inv_determinant, adjugate[1] * inv_determinant, adjugate[2] * inv_determinant, 
    adjugate[3] * inv_determinant, adjugate[4] * inv_determinant, adjugate[5] * inv_determinant, 
    adjugate[6] * inv_determinant, adjugate[7] * inv_determinant, adjugate[8] * inv_determinant, 
  ]
} 

function MakeSolidColorShader(gl) {
  // Setup vertex Shader
  const vSource = `
    precision highp float;
    attribute vec3 position;

    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec4 renderColor;

    varying vec4 color; 

    void main() {
      color = renderColor;

      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
    }
  `;  

  const vertex = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex, vSource);
  gl.compileShader(vertex);

  if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
    alert("Can't compile vertex shader: " + gl.getShaderInfoLog(vertex));
    gl.deleteShader(vertex);
    return null;
  }

  // Setup fragment shader
  const fSource = `
    precision highp float;
    varying vec4 color; 

    void main() {
      gl_FragColor = color;
    }
  `;

  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment, fSource);
  gl.compileShader(fragment);

  if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
    alert("Can't compile fragment shader: " + gl.getShaderInfoLog(fragment));
    gl.deleteShader(fragment);
    return null;
  }

  // Setup actual program
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Can't link the shader: " + gl.getProgramInfoLog(program));
    return null;
  }

  const info = {
    id : program,
    attribs : {
      position: gl.getAttribLocation(program, "position")   
    },
    uniforms : {
      model: gl.getUniformLocation(program, "modelMatrix"),
      view: gl.getUniformLocation(program, "viewMatrix"),
      projection: gl.getUniformLocation(program, "projectionMatrix"),
      color: gl.getUniformLocation(program, "renderColor")
    }
  };
  return info;
}

function PerspectiveMatrix(fov, zNear, zFar, aspect) {
  const tanHalfFov = Math.tan((fov * 0.5) * 0.0174533);
  const fovY = 1.0 / tanHalfFov; 
  const fovX = fovY / aspect; 
  const _33 = -(zFar / (zFar - zNear))
  const _43 = -((zFar * zNear) / (zFar - zNear));

  const result = [
    fovX, 0,    0,   0,
    0,    fovY, 0,   0,
    0,    0,    _33, -1,
    0,    0,    _43,   0
  ];

  return result;
}

function LookAt(eye, at, up) {
  const zAxis = Normalize([
    eye[0] - at[0],
    eye[1] - at[1],
    eye[2] - at[2]
  ]);
  const xAxis = Normalize(Cross(zAxis, up));
  const yAxis = Cross(xAxis, zAxis);

  const result = [
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -Dot(xAxis, eye), 
    -Dot(yAxis, eye),
    -Dot(zAxis, eye),
    1
  ];

  return result;
}

function Normalize(v) {
  const dot = Dot(v, v);
  if (dot !== 0.0) {
    const length = Math.sqrt(dot);
    const result = [
      v[0] / length,
      v[1] / length,
      v[2] / length
    ];
    return result;
  }
  alert("Cant normalize zero vector");
  return v;
}

function Cross(v1, v2) {
  const result = [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];
  return result;
}

function Dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function MakeCylinder(gl, position, radius, length) {
  var numSegments = 16

  var arrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);

  var halfLen = length / 2;
  var verts = []
  var i, j, theta1, theta2;
  for (i = 0; i < numSegments; ++i) {
    theta1 = 2.0 * 3.1415926 * i / numSegments;
    j = i + 1
    if (j >= numSegments) {
      j = 0;
    }
    theta2 = 2.0 * 3.1415926 * j / numSegments;

    // Front face
    verts.push(position.x);
    verts.push(position.y);
    verts.push(position.z + halfLen);

    verts.push(radius * Math.cos(theta2) + position.x);
    verts.push(radius * Math.sin(theta2) + position.y);
    verts.push(position.z + halfLen);

    verts.push(radius * Math.cos(theta1) + position.x);
    verts.push(radius * Math.sin(theta1) + position.y);
    verts.push(position.z + halfLen);

    // Back face
    verts.push(position.x);
    verts.push(position.y);
    verts.push(position.z - halfLen);

    verts.push(radius * Math.cos(theta1) + position.x);
    verts.push(radius * Math.sin(theta1) + position.y);
    verts.push(position.z - halfLen);

    verts.push(radius * Math.cos(theta2) + position.x);
    verts.push(radius * Math.sin(theta2) + position.y);
    verts.push(position.z - halfLen);

    // connector1
    verts.push(radius * Math.cos(theta2) + position.x);
    verts.push(radius * Math.sin(theta2) + position.y);
    verts.push(position.z + halfLen);

    verts.push(radius * Math.cos(theta2) + position.x);
    verts.push(radius * Math.sin(theta2) + position.y);
    verts.push(position.z - halfLen);

    verts.push(radius * Math.cos(theta1) + position.x);
    verts.push(radius * Math.sin(theta1) + position.y);
    verts.push(position.z - halfLen);
    
    // connector2
    verts.push(radius * Math.cos(theta1) + position.x);
    verts.push(radius * Math.sin(theta1) + position.y);
    verts.push(position.z + halfLen);

    verts.push(radius * Math.cos(theta2) + position.x);
    verts.push(radius * Math.sin(theta2) + position.y);
    verts.push(position.z + halfLen);

    verts.push(radius * Math.cos(theta1) + position.x);
    verts.push(radius * Math.sin(theta1) + position.y);
    verts.push(position.z - halfLen);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  return {
    bufferId: arrayBuffer,
    count: verts.length / 3,
    numComponents: 3,
    type: gl.FLOAT,
    stride: 0,
    offset: 0
  }
}

function DrawBuffer(buffer, modelMatrix, color) {
  polar_gl.bindBuffer(polar_gl.ARRAY_BUFFER, buffer.bufferId);
  polar_gl.vertexAttribPointer(polar_shader.attribs.position, buffer.numComponents, buffer.type, false, buffer.stride, buffer.offset);
  polar_gl.enableVertexAttribArray(polar_shader.attribs.position);

  polar_gl.useProgram(polar_shader.id);

  polar_gl.uniformMatrix4fv(polar_shader.uniforms.projection, false, polar_projection);
  polar_gl.uniformMatrix4fv(polar_shader.uniforms.view, false, polar_view);
  polar_gl.uniformMatrix4fv(polar_shader.uniforms.model, false, modelMatrix);
  polar_gl.uniform4f(polar_shader.uniforms.color, color.r, color.g, color.b, 1.0);

  const offset = 0;
  polar_gl.drawArrays(polar_gl.TRIANGLES, offset, buffer.count)
}

function Mul_MM(m1, m2) {
  var result = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  result[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] *m2[12]
  result[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] *m2[13]
  result[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] *m2[10] + m1[3] *m2[14]
  result[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] *m2[11] + m1[3] *m2[15]

  result[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] *m2[12]
  result[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] *m2[13]
  result[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] *m2[10] + m1[7] *m2[14]
  result[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] *m2[11] + m1[7] *m2[15]

  result[8] = m1[8] * m2[0] + m1[9] * m2[4] +m1[10] * m2[8] +m1[11] *m2[12]
  result[9] = m1[8] * m2[1] + m1[9] * m2[5] +m1[10] * m2[9] +m1[11] *m2[13]
  result[10]= m1[8] * m2[2] + m1[9] * m2[6] +m1[10] *m2[10] +m1[11] *m2[14]
  result[11]= m1[8] * m2[3] + m1[9] * m2[7] +m1[10] *m2[11] +m1[11] *m2[15]

  result[12]=m1[12] * m2[0] +m1[13] * m2[4] +m1[14] * m2[8] +m1[15] *m2[12]
  result[13]=m1[12] * m2[1] +m1[13] * m2[5] +m1[14] * m2[9] +m1[15] *m2[13]
  result[14]=m1[12] * m2[2] +m1[13] * m2[6] +m1[14] *m2[10] +m1[15] *m2[14]
  result[15]=m1[12] * m2[3] +m1[13] * m2[7] +m1[14] *m2[11] +m1[15] *m2[15]

  return result;
}