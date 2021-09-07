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

var polar_cam_pos = [15, 10, 10]
var polar_cam_target = [2, 0, 0]

var polar_mouseOnItem = 0
var polar_selectedItem = 0

var transform_checkbox = [10,50,20,20]
var matrix_checkbox = [250,50,20,20]
var use_transform_accumulation = true
var use_matrix_accumulation = false

var polar_t = 1.0 / 5.0;
var polar_cylinder = null;

function MakeTransform(parent, position, rotation, scale) {
  return {
    parent: parent,
    position: position,
    rotation: rotation,
    scale: scale
  }
}

function TransformToMatrix(transform) {
    var x = Mul_QV(transform.rotation, [transform.scale[0], 0, 0]);
    var y = Mul_QV(transform.rotation, [0, transform.scale[1], 0]);
    var z = Mul_QV(transform.rotation, [0, 0, transform.scale[2]]);

    var t = transform.position;

    return [
      x[0], x[1], x[2], 0,
      y[0], y[1], y[2], 0,
      z[0], z[1], z[2], 0,
      t[0], t[1], t[2], 1
    ];
}

function GetWorldMatrix_AccumulateMatrices(transform) {
    var localMatrix = TransformToMatrix(transform);
    var worldMatrix = localMatrix;

    if (transform.parent != null) {
        var parentMatrix = GetWorldMatrix_AccumulateMatrices(transform.parent);
        worldMatrix = Mul_MM(localMatrix, parentMatrix);
    }

    return worldMatrix;
}

function GetWorldTransform(transform) {
    var worldTransform = {
      parent: transform.parent,
      position: transform.position,
      rotation: transform.rotation,
      scale: transform.scale
    };

    if (transform.parent != null) {
        var worldParent = GetWorldTransform(transform.parent);

        worldTransform.scale = Mul_VV(worldParent.scale, worldTransform.scale);
        worldTransform.rotation = Mul_QQ(worldParent.rotation, worldTransform.rotation);

        worldTransform.position = Mul_VV(worldParent.scale, worldTransform.position);
        worldTransform.position = Mul_QV(worldParent.rotation, worldTransform.position);
        worldTransform.position = Add_VV(worldParent.position, worldTransform.position);
    }

    return worldTransform;
}

function GetWorldMatrix_AccumulateTransforms(transform) {
    var worldSpaceTransform = GetWorldTransform(transform);
    return TransformToMatrix(worldSpaceTransform);
}

function GetWorldMatrix(transform) {
  if (use_matrix_accumulation) {
    return GetWorldMatrix_AccumulateMatrices(transform);
  }
  else if (use_transform_accumulation) {
    return GetWorldMatrix_AccumulateTransforms(transform);
  }
  else {
    alert("Don't know how to concat matrices");
  }
  return [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ];
}

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

  var cirX = GetHandleXPolar(polar_t);
  var cirY = 20
  var cirR = 10

  if (PointInCircle(polar_mouse, cirX, cirY, cirR)) {
    polar_selectedItem = 2
  }
  else if (PointInRect(polar_mouse, transform_checkbox)) {
    polar_selectedItem = 1
  }
  else if (PointInRect(polar_mouse, matrix_checkbox)) {
    polar_selectedItem = 3
  }

  RenderPolar()
}

function OnMouseUpPolar(evt) {
  if (PointInRect(polar_mouse, transform_checkbox)) {
    if (polar_selectedItem == 1) {
      use_transform_accumulation = !use_transform_accumulation
      use_matrix_accumulation = !use_transform_accumulation;
      RenderPolar()
    }
  }
  else if (PointInRect(polar_mouse, matrix_checkbox)) {
    if (polar_selectedItem == 3) {
      use_matrix_accumulation = !use_matrix_accumulation;
      use_transform_accumulation = !use_matrix_accumulation;
      RenderPolar();
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
  var cirX = GetHandleXPolar(polar_t);

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
  else if (PointInRect(polar_mouse, transform_checkbox)) {
    polar_mouseOnItem = 1
  }
  else if (PointInRect(polar_mouse, matrix_checkbox)) {
    polar_mouseOnItem = 3;
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

  polar_gl.clear(polar_gl.COLOR_BUFFER_BIT | polar_gl.DEPTH_BUFFER_BIT);
  const angle = 90 * 0.0174533

  // Basis 

  var transform = MakeTransform(null, [0,1.5,0], AngleAxis(angle, [1, 0, 0]), [0.25,0.25,3]);
  transform.name = "Up axis"
  DrawBuffer(polar_cylinder, GetWorldMatrix(transform), {r:0, g:1, b:0})

  transform = MakeTransform(null, [0,0,1.5], [1, 0, 0, 0], [0.25,0.25,3]);
  transform.name = "forward axis"
  DrawBuffer(polar_cylinder, GetWorldMatrix(transform), {r:0, g:0, b:1})

  transform = MakeTransform(null, [1.5,0,0], AngleAxis(angle, [0, 1, 0]), [0.25,0.25,3]);
  transform.name ="right axis"
  DrawBuffer(polar_cylinder, GetWorldMatrix(transform), {r:1, g:0, b:0})
  // Geometry

  // TODO: Move back to X Scale
  transform = MakeTransform(null, [3,3,3], [1,0,0,0], [polar_t * 5.0,1,1]);
  transform.name = "root"

  var worldTrans = transform;
  document.getElementById("root_pos").innerHTML = "(" + worldTrans.position[0].toFixed(2) + ", " + worldTrans.position[1].toFixed(2) + ", " + worldTrans.position[2].toFixed(2) + ")"
  document.getElementById("root_rot").innerHTML = "(" + worldTrans.rotation[0].toFixed(2) + ", " + worldTrans.rotation[1].toFixed(2) + ", " + worldTrans.rotation[2].toFixed(2) + ", " + worldTrans.rotation[3].toFixed(2) + ")"
  document.getElementById("root_scl").innerHTML = "(<b>" + worldTrans.scale[0].toFixed(2) + "</b>, " + worldTrans.scale[1].toFixed(2) + ", " + worldTrans.scale[2].toFixed(2) + ")"

  transform = MakeTransform(transform, [0, 0, 1.5], AngleAxis(angle, [0, 1, 0]), [0.25, 0.25, 2]); 
  transform.name = "A"
  var model = GetWorldMatrix(transform);
  DrawBuffer(polar_cylinder, model, {r:1, g:0, b:1})

  worldTrans = transform;
  document.getElementById("parent_pos").innerHTML = "(" + worldTrans.position[0].toFixed(2) + ", " + worldTrans.position[1].toFixed(2) + ", " + worldTrans.position[2].toFixed(2) + ")"
  document.getElementById("parent_rot").innerHTML = "(" + worldTrans.rotation[0].toFixed(2) + ", " + worldTrans.rotation[1].toFixed(2) + ", " + worldTrans.rotation[2].toFixed(2) + ", " + worldTrans.rotation[3].toFixed(2) + ")"
  document.getElementById("parent_scl").innerHTML = "(" + worldTrans.scale[0].toFixed(2) + ", " + worldTrans.scale[1].toFixed(2) + ", " + worldTrans.scale[2].toFixed(2) + ")"

  transform = MakeTransform(transform, [0, 0, 0.5], [1, 0, 0, 0], [4, 4, 0.5]);
  transform.name = "B"
  model = GetWorldMatrix(transform);
  DrawBuffer(polar_cylinder, model, {r:0, g:1, b:1})

  worldTrans = transform;
  document.getElementById("child_pos").innerHTML = "(" + worldTrans.position[0].toFixed(2) + ", " + worldTrans.position[1].toFixed(2) + ", " + worldTrans.position[2].toFixed(2) + ")"
  document.getElementById("child_rot").innerHTML = "(" + worldTrans.rotation[0].toFixed(2) + ", " + worldTrans.rotation[1].toFixed(2) + ", " + worldTrans.rotation[2].toFixed(2) + ", " + worldTrans.rotation[3].toFixed(2) + ")"
  document.getElementById("child_scl").innerHTML = "(" + worldTrans.scale[0].toFixed(2) + ", " + worldTrans.scale[1].toFixed(2) + ", " + worldTrans.scale[2].toFixed(2) + ")"
}

// https://stackoverflow.com/questions/34980574/how-to-extract-color-values-from-rgb-string-in-javascript/34980657

function RenderPolar2D() {
  if (polar_2d_context) {

    let body_element = document.getElementsByTagName("BODY")[0]; 
    let bodyBgColor = window.getComputedStyle(body_element).backgroundColor;

    // Clear BG Color
    polar_2d_context.fillStyle = bodyBgColor;//'rgb(255, 255, 255)';
    polar_2d_context.fillRect(0, 0, polar_width, polar_2d_height);

    let content_element = document.getElementById("content"); 
    let contentBgColor = window.getComputedStyle(content_element).color;

    // Draw the scale slider
    polar_2d_context.setLineDash([]);
    polar_2d_context.strokeStyle = contentBgColor;
    polar_2d_context.fillStyle = contentBgColor;

    polar_2d_context.lineWidth = 2

    // Draw slider line
    polar_2d_context.beginPath()
    polar_2d_context.moveTo(20 - 10, 20)
    polar_2d_context.lineTo(20 + 270 + 10, 20) 
    polar_2d_context.stroke()
    polar_2d_context.closePath()

    // Draw notches
    polar_2d_context.beginPath()
      var x = 20 + 0 * 30;
      polar_2d_context.moveTo(x, 10)
      polar_2d_context.lineTo(x, 30) 
      polar_2d_context.stroke()

      var x = 20 + 9 * 30;
      polar_2d_context.moveTo(x, 10)
      polar_2d_context.lineTo(x, 30) 
      polar_2d_context.stroke()
    polar_2d_context.closePath()

    polar_2d_context.lineWidth = 1

    // Scale
    polar_2d_context.strokeStyle = contentBgColor;
    polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
    if (polar_mouseOnItem == 2 || polar_selectedItem == 2) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
    }
    var handleX = GetHandleXPolar(polar_t);
    var handleY = 20
    polar_2d_context.beginPath()
    polar_2d_context.arc(handleX, handleY, 10, 0, Math.PI * 2, true); // Outer circle
    polar_2d_context.stroke()
    polar_2d_context.fill()
    polar_2d_context.closePath()

    polar_2d_context.font = '18px serif';
    debugString = 'Scale on X axis: ' + (polar_t * 5.0).toFixed(2)
    polar_2d_context.fillStyle = contentBgColor;
    polar_2d_context.fillText(debugString, 320, 25);

    /*polar_2d_context.font = '18px serif';
    debugString = 'Debug: : ' + polar_mouse[0].toFixed(2) + ", " + polar_mouse[1].toFixed(2) + " / " +
      polar_scale[0].toFixed(2) + ", " + polar_scale[1].toFixed(2)
    polar_2d_context.fillStyle = 'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, 500, 25);*/

    // Checkbox
    var padding = 5
    if (use_transform_accumulation) {
      polar_2d_context.strokeStyle = contentBgColor;  
      polar_2d_context.fillStyle = 'rgb(128, 128, 128)';

      polar_2d_context.beginPath();
      if (polar_mouseOnItem == 1) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
      }
      polar_2d_context.rect(transform_checkbox[0], transform_checkbox[1], transform_checkbox[2], transform_checkbox[3]);
      polar_2d_context.fill()
      polar_2d_context.stroke();
      polar_2d_context.closePath();

      polar_2d_context.lineWidth = 2

      polar_2d_context.beginPath();
      polar_2d_context.strokeStyle = 'rgb(0, 0, 0)';
      polar_2d_context.moveTo(padding + transform_checkbox[0], transform_checkbox[1] + transform_checkbox[3] * 0.5);
      polar_2d_context.lineTo(transform_checkbox[0] + transform_checkbox[2] * 0.5, transform_checkbox[1] + transform_checkbox[3] - padding)
      polar_2d_context.lineTo(transform_checkbox[0] + transform_checkbox[2] - padding, padding + transform_checkbox[1])
      polar_2d_context.stroke();
      polar_2d_context.closePath();

      polar_2d_context.lineWidth = 1
    }
    else {
      polar_2d_context.strokeStyle = contentBgColor;  
      polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
      polar_2d_context.beginPath();
      polar_2d_context.rect(transform_checkbox[0], transform_checkbox[1], transform_checkbox[2], transform_checkbox[3]);

      if (polar_mouseOnItem == 1) {
        polar_2d_context.fill()
      }

      polar_2d_context.stroke();
      polar_2d_context.closePath();
    }

    polar_2d_context.font = '18px serif';
    debugString = 'Accumulate Transforms'
    polar_2d_context.fillStyle = contentBgColor;
    polar_2d_context.fillText(debugString, transform_checkbox[0] + transform_checkbox[2] + 10, transform_checkbox[1] + transform_checkbox[3] * 0.75);

    // Checkbox
    var padding = 5
    if (use_matrix_accumulation) {
      polar_2d_context.strokeStyle = contentBgColor;  
      polar_2d_context.fillStyle = 'rgb(128, 128, 128)';

      polar_2d_context.beginPath();
      if (polar_mouseOnItem == 3) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
      }
      polar_2d_context.rect(matrix_checkbox[0], matrix_checkbox[1], matrix_checkbox[2], matrix_checkbox[3]);
      polar_2d_context.fill()
      polar_2d_context.stroke();
      polar_2d_context.closePath();

      polar_2d_context.lineWidth = 2

      polar_2d_context.beginPath();
      polar_2d_context.strokeStyle = 'rgb(0, 0, 0)';
      polar_2d_context.moveTo(padding + matrix_checkbox[0], matrix_checkbox[1] + matrix_checkbox[3] * 0.5);
      polar_2d_context.lineTo(matrix_checkbox[0] + matrix_checkbox[2] * 0.5, matrix_checkbox[1] + matrix_checkbox[3] - padding)
      polar_2d_context.lineTo(matrix_checkbox[0] + matrix_checkbox[2] - padding, padding + matrix_checkbox[1])
      polar_2d_context.stroke();
      polar_2d_context.closePath();

      polar_2d_context.lineWidth = 1
    }
    else {
      polar_2d_context.strokeStyle = contentBgColor;  
      polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
      polar_2d_context.beginPath();
      polar_2d_context.rect(matrix_checkbox[0], matrix_checkbox[1], matrix_checkbox[2], matrix_checkbox[3]);

      if (polar_mouseOnItem == 3) {
        polar_2d_context.fill()
      }

      polar_2d_context.stroke();
      polar_2d_context.closePath();
    }

    polar_2d_context.font = '18px serif';
    debugString = 'Accumulate Matrices'
    polar_2d_context.fillStyle = contentBgColor;
    polar_2d_context.fillText(debugString, matrix_checkbox[0] + matrix_checkbox[2] + 10, matrix_checkbox[1] + matrix_checkbox[3] * 0.75);
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

function Inverse3(me) {
  var te = []

  var n11 = me[ 0 ]; var n21 = me[ 1 ]; var n31 = me[ 2 ];
  var n12 = me[ 3 ]; var n22 = me[ 4 ]; var n32 = me[ 5 ];
  var n13 = me[ 6 ]; var n23 = me[ 7 ]; var n33 = me[ 8 ];

  var t11 = n33 * n22 - n32 * n23;
  var t12 = n32 * n13 - n33 * n12;
  var t13 = n23 * n12 - n22 * n13;

  var det = n11 * t11 + n21 * t12 + n31 * t13;

  if ( det === 0 ) {
    return me;
  }

  var detInv = 1 / det;

  te[ 0 ] = t11 * detInv;
  te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
  te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

  te[ 3 ] = t12 * detInv;
  te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
  te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

  te[ 6 ] = t13 * detInv;
  te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
  te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

  return te;
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

function Mul_VF(v, f) {
  const result = [
    v[0] * f,
    v[1] * f,
    v[2] * f
  ];
  return result;
}

function Mul_QQ(a, b) {
  var out = [];

  const ax = a[1];
  const ay = a[2];
  const az = a[3];
  const aw = a[0];
  const bx = b[1];
  const by = b[2];
  const bz = b[3];
  const bw = b[0];

  out[0] = aw * bw - ax * bx - ay * by - az * bz;
  out[1] = ax * bw + aw * bx + ay * bz - az * by;
  out[2] = ay * bw + aw * by + az * bx - ax * bz;
  out[3] = az * bw + aw * bz + ax * by - ay * bx;

  return out;
}

function Mul_VV(v1, v2) {
  const result = [
    v1[0] * v2[0],
    v1[1] * v2[1],
    v1[2] * v2[2]
  ];
  return result;
}

function Add_VV(v1, v2) {
  const result = [
    v1[0] + v2[0],
    v1[1] + v2[1],
    v1[2] + v2[2]
  ];
  return result;
}

function Mul_QV(q, v) {
    const u = [
      q[1],
      q[2],
      q[3]
    ]
    const s = q[0];

    const one = Mul_VF(u, Dot(u, v) * 2.0)
    const two = Mul_VF(v, (s * s - Dot(u, u)))
    const three = Mul_VF(Cross(u, v), 2.0 * s)

    const vprime = Add_VV(Add_VV(one, two), three)
    return vprime;
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

function NormalizeQuat(q) {
  if (q[1]*q[1] + q[2]*q[2] + q[3]*q[3] + q[0]*q[0] == 0) {
    alert("trying to normalize 0 quat");
  }
  const n = Math.sqrt(q[1]*q[1] + q[2]*q[2] + q[3]*q[3] + q[0]*q[0]);
  const result = [
    q[0] / n,
    q[1] / n,
    q[2] / n,
    q[3] / n
  ]
  return result;
}

function AngleAxis(angle, axis) {
  var nAxis = Normalize(axis);
  
  const hCos = Math.cos(angle * 0.5);
  const hSin = Math.sin(angle * 0.5);

  const result = [
    hCos,
    hSin * nAxis[0],
    hSin * nAxis[1],
    hSin * nAxis[2]
  ];

  return NormalizeQuat(result);
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