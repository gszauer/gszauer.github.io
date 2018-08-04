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

//var polar_cam_pos = [3 * 1.5, 4 * 1.5, 6 * 1.5]
var polar_cam_pos = [0, 4 * 1.5, 6 * 1.5]
var polar_cam_target = [0, 0, 0]

var polar_mouseOnItem = 0
var polar_selectedItem = 0

var polar_checkbox = [10,50,20,20]
var polar_show_reference = false

var polar_t = 0;

var basis_geometry = null;

var u1 = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]

var u2 = [
  null, null, null, null, null, null, null, null, null, null, null, null, 
  null, null, null, null, null, null, null, null, null, null, null, null
]

var u12 = [
  null, null, null, null, null, null, null, null, null, null, null, null, 
  null, null, null, null, null, null, null, null, null, null, null, null
]

function Init() {
  FillDebugMatrix([
     2.1213196295176813, 0.35355350960022724,   0, 0, 
    -2.1213210576013637, 0.35355327158628025,   0, 0, 
                      0,                   0, 0.5, 0, 
                   -6.5,                   4,   0, 1
  ])

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
      polar_gl.clearColor(1, 1, 1, 1);

      polar_gl.clearDepth(1.0);
      polar_gl.enable(polar_gl.DEPTH_TEST);
      polar_gl.depthFunc(polar_gl.LEQUAL);

      polar_gl.enable(polar_gl.CULL_FACE);
      polar_gl.cullFace(polar_gl.BACK);

      polar_shader = MakeSolidColorShader(polar_gl);

      polar_projection = PerspectiveMatrix(60, 0.1, 500, polar_width / polar_3d_height);
      polar_view = LookAt(polar_cam_pos, polar_cam_target, [0, 1, 0]);

      basis_geometry = MakeBasis(polar_gl, {x:0,y:0,z:0}, 2, 2, 2, 0.25);
    }
  }

  RenderPolar();
  LoadAndDecompose();
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

  var cirX = 20 + GetIterationPolar() * 11.739
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
  var cirX = 20 + GetIterationPolar() * 11.739

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

  /*var scale = [
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
  model = Mul_MM(Mul_MM(scale, rotate), translate)
  var debug = Mul_MM(model, polar_basis) */

  var move = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    8, 0, 0, 1
  ]

  DrawBuffer(basis_geometry, Mul4(move, u1))

  if (GetIterationPolar() < u12.length && u12[GetIterationPolar()] != null) {
    DrawBuffer(basis_geometry, u12[GetIterationPolar()])
  }

  move = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -8, 0, 0, 1
  ]

  if (GetIterationPolar() < u2.length && u2[GetIterationPolar()] != null) {
    DrawBuffer(basis_geometry, Mul4(move, u2[GetIterationPolar()]))
  }
}

function RenderPolar2D() {
  if (polar_2d_context) {
    // Clear BG Color
    polar_2d_context.fillStyle = 'rgb(255, 255, 255)';
    polar_2d_context.fillRect(0, 0, polar_width, polar_2d_height);

    // Draw the scale slider
    polar_2d_context.setLineDash([]);
    polar_2d_context.strokeStyle = 'rgb(128, 128, 128)';
    polar_2d_context.fillStyle = 'rgb(32, 32, 32)';

    polar_2d_context.lineWidth = 2

    // Draw slider line
    polar_2d_context.beginPath()
    polar_2d_context.moveTo(20 - 10, 20)
    polar_2d_context.lineTo(20 + 270 + 10, 20) 
    polar_2d_context.stroke()
    polar_2d_context.closePath()

    // Draw notches
    polar_2d_context.beginPath()
    for (var i = 0; i < 24; ++i) {
      var x = Math.floor(20 + i * 11.739);
      polar_2d_context.moveTo(x, 10)
      polar_2d_context.lineTo(x, 30) 
      polar_2d_context.stroke()
    }
    polar_2d_context.closePath()

    polar_2d_context.lineWidth = 1

    // Scale
    polar_2d_context.strokeStyle = 'rgb(32, 32, 32)';
    polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
    if (polar_mouseOnItem == 2 || polar_selectedItem == 2) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
    }
    var handleX = 20 + GetIterationPolar() * 11.739
    var handleY = 20
    polar_2d_context.beginPath()
    polar_2d_context.arc(handleX, handleY, 10, 0, Math.PI * 2, true); // Outer circle
    polar_2d_context.stroke()
    polar_2d_context.fill()
    polar_2d_context.closePath()

    polar_2d_context.font = '18px serif';
    debugString = 'U2: ' + GetIterationPolar()
    polar_2d_context.fillStyle = 'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, 320, 25);

    // Checkbox
    var padding = 5
    if (polar_show_reference) {
      polar_2d_context.strokeStyle = 'rgb(32, 32, 32)';  
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
      polar_2d_context.strokeStyle = 'rgb(32, 32, 32)';  
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
    polar_2d_context.fillStyle = 'rgb(64, 64, 64)';
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
  return Math.floor(polar_t * 270 / 11.739)
}

function UpdatePolarBasis() {
  // TODO
}

function MakeSolidColorShader(gl) {
  // Setup vertex Shader
  const vSource = `
    precision highp float;
    attribute vec3 position;
    attribute vec3 color;

    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;

    varying vec4 vert_color; 

    void main() {
      vert_color = vec4(color, 1.0);

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
    varying vec4 vert_color; 

    void main() {
      gl_FragColor = vert_color;
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
      position: gl.getAttribLocation(program, "position"),
      color: gl.getAttribLocation(program, "color")   
    },
    uniforms : {
      model: gl.getUniformLocation(program, "modelMatrix"),
      view: gl.getUniformLocation(program, "viewMatrix"),
      projection: gl.getUniformLocation(program, "projectionMatrix"),
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
  const zAxis = [
    eye[0] - at[0],
    eye[1] - at[1],
    eye[2] - at[2]
  ];
  var lenSq = (zAxis[0] * zAxis[0] + zAxis[1] * zAxis[1] + zAxis[2] * zAxis[2]);
  if (lenSq != 0) {
    var len = Math.sqrt(lenSq);
    zAxis[0] /= len;
    zAxis[1] /= len;
    zAxis[2] /= len;
  }

  const xAxis = [ // Cross
    zAxis[1] * up[2] - zAxis[2] * up[1],
    zAxis[2] * up[0] - zAxis[0] * up[2],
    zAxis[0] * up[1] - zAxis[1] * up[0]
  ]
  lenSq = (xAxis[0] * xAxis[0] + xAxis[1] * xAxis[1] + xAxis[2] * xAxis[2]);
  if (lenSq != 0) {
    var len = Math.sqrt(lenSq);
    xAxis[0] /= len;
    xAxis[1] /= len;
    xAxis[2] /= len;
  }

  const yAxis = [ // Cross
    xAxis[1] * zAxis[2] - xAxis[2] * zAxis[1],
    xAxis[2] * zAxis[0] - xAxis[0] * zAxis[2],
    xAxis[0] * zAxis[1] - xAxis[1] * zAxis[0]
  ]
  lenSq = (yAxis[0] * yAxis[0] + yAxis[1] * yAxis[1] + yAxis[2] * yAxis[2]);
  if (lenSq != 0) {
    var len = Math.sqrt(lenSq);
    yAxis[0] /= len;
    yAxis[1] /= len;
    yAxis[2] /= len;
  }

  const result = [
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]), 
    -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]), 
    -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]), 
    1
  ];

  return result;
}

function DrawBuffer(buffer, modelMatrix) {
  polar_gl.bindBuffer(polar_gl.ARRAY_BUFFER, buffer.bufferId);

  polar_gl.vertexAttribPointer(polar_shader.attribs.position, buffer.numComponents, buffer.type, false, buffer.stride, buffer.offset);
  polar_gl.enableVertexAttribArray(polar_shader.attribs.position);

  polar_gl.vertexAttribPointer(polar_shader.attribs.color, buffer.numComponents, buffer.type, false, buffer.stride, buffer.count * 3 * 4);
  polar_gl.enableVertexAttribArray(polar_shader.attribs.color);

  polar_gl.useProgram(polar_shader.id);

  polar_gl.uniformMatrix4fv(polar_shader.uniforms.projection, false, polar_projection);
  polar_gl.uniformMatrix4fv(polar_shader.uniforms.view, false, polar_view);
  polar_gl.uniformMatrix4fv(polar_shader.uniforms.model, false, modelMatrix);

  const offset = 0;
  polar_gl.drawArrays(polar_gl.TRIANGLES, offset, buffer.count)
}

function GetCubeVertx(position, halfX, halfY, halfZ) {
  var verts = []

  // Top face
  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  // Bottom face
  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)


  // Right face
  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)

  // Left face
  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  // Front face
  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)  

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z + halfZ)  

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z + halfZ)

  // Back face
  verts.push(position.x - halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)  

  verts.push(position.x + halfX)
  verts.push(position.y - halfY)
  verts.push(position.z - halfZ)  

  verts.push(position.x + halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)

  verts.push(position.x - halfX)
  verts.push(position.y + halfY)
  verts.push(position.z - halfZ)
  
  return verts
}

function MakeBasis(gl, position, lenX, lenY, lenZ, radius) {
  radius = radius * 0.5

  var arrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
  var verts = []

  var p = {
    x: position.x + lenX * 0.5,
    y: position.y,
    z: position.z
  }
  var x = GetCubeVertx(p, lenX * 0.5, radius, radius)

  p = {
    x: position.x,
    y: position.y + lenY * 0.5,
    z: position.z
  }
  var y = GetCubeVertx(p, radius, lenY * 0.5, radius)

  p = {
    x: position.x,
    y: position.y,
    z: position.z + lenZ * 0.5
  }
  var z = GetCubeVertx(p, radius, radius, lenZ * 0.5)

  var verts = []

  for (var i = 0; i < x.length; i += 3) {
    verts.push(x[i + 0]); // X
    verts.push(x[i + 1]); // Y
    verts.push(x[i + 2]); // Z
  }
  for (var i = 0; i < y.length; i += 3) {
    verts.push(y[i + 0]); // X
    verts.push(y[i + 1]); // Y
    verts.push(y[i + 2]); // Z
  }
  for (var i = 0; i < z.length; i += 3) {
    verts.push(z[i + 0]); // X
    verts.push(z[i + 1]); // Y 
    verts.push(z[i + 2]); // Z
  }

  for (var i = 0; i < x.length; i += 3) {
    verts.push(1) // R
    verts.push(0) // G
    verts.push(0) // B
  }
  for (var i = 0; i < y.length; i += 3) {
    verts.push(0) // R
    verts.push(1) // G
    verts.push(0) // B
  }
  for (var i = 0; i < z.length; i += 3) {
    verts.push(0) // R
    verts.push(0) // G
    verts.push(1) // B
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  return {
    bufferId: arrayBuffer,
    count: ((verts.length) / 2) / 3,
    numComponents: 3,
    type: gl.FLOAT,
    stride: 0,
    offset: 0
  }
}

function FillDebugMatrix(M) {
  document.getElementById("row_1_col_1").value = M[0]
  document.getElementById("row_2_col_1").value = M[1]
  document.getElementById("row_3_col_1").value = M[2]
  document.getElementById("row_4_col_1").value = M[3]

  document.getElementById("row_1_col_2").value = M[4]
  document.getElementById("row_2_col_2").value = M[5]
  document.getElementById("row_3_col_2").value = M[6]
  document.getElementById("row_4_col_2").value = M[7]

  document.getElementById("row_1_col_3").value = M[8]
  document.getElementById("row_2_col_3").value = M[9]
  document.getElementById("row_3_col_3").value = M[10]
  document.getElementById("row_4_col_3").value = M[11]

  document.getElementById("row_1_col_4").value = M[12]
  document.getElementById("row_2_col_4").value = M[13]
  document.getElementById("row_3_col_4").value = M[14]
  document.getElementById("row_4_col_4").value = M[15]
}

function GetInputMatrix() {
  var M = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  M[0] = Number(document.getElementById("row_1_col_1").value)
  M[1] = Number(document.getElementById("row_2_col_1").value)
  M[2] = Number(document.getElementById("row_3_col_1").value)
  M[3] = Number(document.getElementById("row_4_col_1").value)

  M[4] = Number(document.getElementById("row_1_col_2").value)
  M[5] = Number(document.getElementById("row_2_col_2").value)
  M[6] = Number(document.getElementById("row_3_col_2").value)
  M[7] = Number(document.getElementById("row_4_col_2").value)

  M[8] = Number(document.getElementById("row_1_col_3").value)
  M[9] = Number(document.getElementById("row_2_col_3").value)
  M[10]= Number(document.getElementById("row_3_col_3").value)
  M[11]= Number(document.getElementById("row_4_col_3").value)

  M[12]= Number(document.getElementById("row_1_col_4").value)
  M[13]= Number(document.getElementById("row_2_col_4").value)
  M[14]= Number(document.getElementById("row_3_col_4").value)
  M[15]= Number(document.getElementById("row_4_col_4").value)

  return M
}

function SpectDecomp(S) {
  var QRFactorization = null
  var Q = null
  var R = null
  var Ai = [ // Only care about S as a 3x3 matrix
    S[0], S[1], S[2],
    S[4], S[5], S[6],
    S[8], S[9], S[10]
  ]

  // From wikipedia: https://en.wikipedia.org/wiki/QR_algorithm
  // The eigenvectors are an accumulation of all the orthogonal
  // transforms needed to get to the matrix conversion
  var Qa = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]

  var numIterations = 0

  for (var i = 0; i < global_num_iterations; ++i) {
    QRFactorization = QRDecomposition([ // Need to pad Ai to be a 4x4 matrix
      Ai[0], Ai[1], Ai[2], 0,
      Ai[3], Ai[4], Ai[5], 0,
      Ai[6], Ai[7], Ai[8], 0,
      0, 0, 0, 1
    ])

    Q = [ // QRFactorization.Q as a 3x3 matrix
      QRFactorization.Q[0], QRFactorization.Q[1], QRFactorization.Q[2],
      QRFactorization.Q[4], QRFactorization.Q[5], QRFactorization.Q[6],
      QRFactorization.Q[8], QRFactorization.Q[9], QRFactorization.Q[10]
    ];

    R = [ // QRFactorization.R as a 3x3 matrix
      QRFactorization.R[0], QRFactorization.R[1], QRFactorization.R[2],
      QRFactorization.R[4], QRFactorization.R[5], QRFactorization.R[6],
      QRFactorization.R[8], QRFactorization.R[9], QRFactorization.R[10]
    ]

    Qa = Mul3(Qa, Q);
    Ai = Mul3(R, Q);
    numIterations += 1

    if (global_enable_early_out && EigenDecompositionEarlyOut(Ai)) {
      break;
    }
  }

  eigenvalues = [Ai[0], Ai[4], Ai[8]]
  eigenvectors = [
    [Qa[0], Qa[1], Qa[2]],
    [Qa[3], Qa[4], Qa[5]],
    [Qa[6], Qa[7], Qa[8]]
  ]

  return {
    u : [
      Qa[0], Qa[1], Qa[2], 0 ,
      Qa[3], Qa[4], Qa[5],0 ,
      Qa[6], Qa[7], Qa[8], 0 ,
      0, 0, 0, 1
    ]
  }
}

function LoadAndDecompose() {
  var M = GetInputMatrix();
  var decomp_result = AffineDecompose(M);
  // SpectoralDecomposition is done on S!
  u1 = SpectDecomp(decomp_result.TFRS.S).u;


  var x = [u1[0], u1[1], u1[2]]
  var y = [u1[4], u1[5], u1[6]]
  var z = [u1[8], u1[9], u1[10]]

  //
  u2 = [
    // Permutation: z, y, z
    [ x[0],  x[1],  x[2], 0,  
      y[0],  y[1],  y[2], 0,  
      z[0],  z[1],  z[2], 0,
      0, 0, 0, 1 ],
    [ x[0],  x[1],  x[2],  0, 
     -y[0], -y[1], -y[2],  0, 
     -z[0], -z[1], -z[2],0, 
      0, 0, 0, 1 ],
    [-x[0], -x[1], -x[2],  0, 
     -y[0], -y[1], -y[2],  0, 
      z[0],  z[1],  z[2],0, 
      0, 0, 0, 1 ],
    [-x[0], -x[1], -x[2],     0, 
      y[0],  y[1],  y[2],  0, 
     -z[0], -z[1], -z[2],0, 
      0, 0, 0, 1 ],
    // Permutation: x, z, y
    [ x[0],  x[1],  x[2], 0, 
      z[0],  z[1],  z[2],  0, 
      y[0],  y[1],  y[2],0, 
      0, 0, 0, 1 ],
    [ x[0],  x[1],  x[2],  0, 
     -z[0], -z[1], -z[2],  0, 
     -y[0], -y[1], -y[2],0, 
      0, 0, 0, 1 ],
    [-x[0], -x[1], -x[2],  0, 
     -z[0], -z[1], -z[2],  0, 
      y[0],  y[1],  y[2],0, 
      0, 0, 0, 1 ],
    [-x[0], -x[1], -x[2],  0, 
      z[0],  z[1],  z[2],  0, 
     -y[0], -y[1], -y[2],0, 
      0, 0, 0, 1 ],
    // Permutation: y, x, z
    [ y[0],  y[1],  y[2], 0, 
      x[0],  x[1],  x[2], 0, 
      z[0],  z[1],  z[2],0, 
      0, 0, 0, 1 ],
    [ y[0],  y[1],  y[2], 0,
     -x[0], -x[1], -x[2], 0,
     -z[0], -z[1], -z[2],0,
      0, 0, 0, 1 ],
    [-y[0], -y[1], -y[2], 0,
     -x[0], -x[1], -x[2], 0,
      z[0],  z[1],  z[2],0,
      0, 0, 0, 1 ],
    [-y[0], -y[1], -y[2], 0,
      x[0],  x[1],  x[2], 0,
     -z[0], -z[1], -z[2],0,
      0, 0, 0, 1 ],
    // Permutation: y, z, x
    [ y[0],  y[1],  y[2], 0,
      z[0],  z[1],  z[2], 0,
      x[0],  x[1],  x[2],0,
      0, 0, 0, 1 ],
    [ y[0],  y[1],  y[2], 0,
     -z[0], -z[1], -z[2], 0,
     -x[0], -x[1], -x[2],0,
      0, 0, 0, 1 ],
    [-y[0], -y[1], -y[2], 0,
     -z[0], -z[1], -z[2], 0,
      x[0],  x[1],  x[2],0,
      0, 0, 0, 1 ],
    [-y[0], -y[1], -y[2], 0,
      z[0],  z[1],  z[2], 0,
     -x[0], -x[1], -x[2],0,
      0, 0, 0, 1 ],
    // Permutation: z, x, y
    [ z[0],  z[1],  z[2], 0,
      x[0],  x[1],  x[2], 0,
      y[0],  y[1],  y[2],0,
      0, 0, 0, 1 ],
    [ z[0],  z[1],  z[2], 0,
     -x[0], -x[1], -x[2], 0,
     -y[0], -y[1], -y[2],0,
      0, 0, 0, 1 ],
    [-z[0], -z[1], -z[2], 0,
     -x[0], -x[1], -x[2], 0,
      y[0],  y[1],  y[2],0,
      0, 0, 0, 1 ],
    [-z[0], -z[1], -z[2], 0,
      x[0],  x[1],  x[2], 0,
     -y[0], -y[1], -y[2],0,
      0, 0, 0, 1 ],
    // Permutation: z, y, x
    [ z[0],  z[1],  z[2], 0,
      y[0],  y[1],  y[2], 0,
      x[0],  x[1],  x[2],0,
      0, 0, 0, 1 ],
    [ z[0],  z[1],  z[2], 0,
     -y[0], -y[1], -y[2], 0,
     -x[0], -x[1], -x[2],0,
      0, 0, 0, 1 ],
    [-z[0], -z[1], -z[2], 0,
     -y[0], -y[1], -y[2], 0,
      x[0],  x[1],  x[2],0,
      0, 0, 0, 1 ],
    [-z[0], -z[1], -z[2], 0,
      y[0],  y[1],  y[2], 0,
     -x[0], -x[1], -x[2],0,
      0, 0, 0, 1 ],
  ]
  
  for (var i = 0; i < u2.length; ++i) {
    var _12 = Mul3(
      [
        u1[0], u1[4], u1[8],
        u1[1], u1[5], u1[9],
        u1[2], u1[6], u1[10]
      ],
      [
        u2[i][0], u2[i][1], u2[i][2],
        u2[i][4], u2[i][5], u2[i][6],
        u2[i][8], u2[i][9], u2[i][10]
      ]
    )

    u12[i] = [
      _12[0], _12[1], _12[2], 0,
      _12[3], _12[4], _12[5], 0,
      _12[6], _12[7], _12[8], 0,
           0,      0,      0, 1
    ]
  }

  RenderPolar();
}