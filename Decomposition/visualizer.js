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

var basis_geometry = null;

var debug_matrix = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]

var matrix_steps = [
  null, null, null, null, null, null, null, null, null, null, null, null, 
  null, null, null, null, null, null, null, null, null, null, null, null
]

var result_variations = [
  null, null, null, null, null, null, null, null, null, null, null, null, 
  null, null, null, null, null, null, null, null, null, null, null, null
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

  var cirX = 20 + GetIterationPolar() * 11.25
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
  var cirX = 20 + GetIterationPolar() * 11.25

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

  var debug_mat = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  DrawBuffer(basis_geometry, debug_mat, {r:1, g:0, b:0})
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
    for (var i = 0; i < 25; ++i) {
      var x = Math.floor(20 + i * 11.25);
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
    var handleX = 20 + GetIterationPolar() * 11.25
    var handleY = 20
    polar_2d_context.beginPath()
    polar_2d_context.arc(handleX, handleY, 10, 0, Math.PI * 2, true); // Outer circle
    polar_2d_context.stroke()
    polar_2d_context.fill()
    polar_2d_context.closePath()

    polar_2d_context.font = '18px serif';
    debugString = 'Iteration: ' + GetIterationPolar()
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
  return Math.floor(polar_t * 270 / 11.25)
}

function UpdatePolarBasis() {
  // TODO
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

  for (var i = 0; i < x.length; ++i) {
    verts.push(x[i]);
  }
  for (var i = 0; i < y.length; ++i) {
    verts.push(y[i]);
  }
  for (var i = 0; i < z.length; ++i) {
    verts.push(z[i]);
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