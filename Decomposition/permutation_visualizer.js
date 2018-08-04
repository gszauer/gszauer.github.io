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
var polar_r = 0;

var basis_geometry = null;

var base_mat = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
]

var permutations = null;
var variants = null;
var base_mat = null;

var p_out = [
  "X, Y, Z",
  "X, Z, Y",
  "Y, X, Z",
  "Y, Z, X",
  "Z, Y, X",
  "Z, X, Y"
]

var v_out = [
  "+, +, +",
  "-, -, +",
  "+, -, -",
  "-, +, -",
  "-, +, +",
  "-, -, -",
  "+, +, -",
  "+, -, +"
]

function DoLookAt() {
  polar_cam_pos[0] = Number(document.getElementById("cam_x").value)
  polar_cam_pos[1] = Number(document.getElementById("cam_y").value)
  polar_cam_pos[2] = Number(document.getElementById("cam_z").value)

  polar_cam_target[0] = Number(document.getElementById("tar_x").value)
  polar_cam_target[1] = Number(document.getElementById("tar_y").value)
  polar_cam_target[2] = Number(document.getElementById("tar_z").value)

  polar_view = LookAt(polar_cam_pos, polar_cam_target, [0, 1, 0]);
  RenderPolar();
}

function SetLookAt(pos, tar) {
  polar_cam_pos[0] = pos[0]
  polar_cam_pos[1] = pos[1]
  polar_cam_pos[2] = pos[2]

  polar_cam_target[0] = tar[0]
  polar_cam_target[1] = tar[1]
  polar_cam_target[2] = tar[2]

  document.getElementById("cam_x").value = polar_cam_pos[0]
  document.getElementById("cam_y").value = polar_cam_pos[1]
  document.getElementById("cam_z").value = polar_cam_pos[2]

  document.getElementById("tar_x").value = polar_cam_target[0]
  document.getElementById("tar_y").value = polar_cam_target[1]
  document.getElementById("tar_z").value = polar_cam_target[2]

  polar_view = LookAt(polar_cam_pos, polar_cam_target, [0, 1, 0]);
  RenderPolar();
}

function FillOutMatrices(m) {
  if (m.length == 9) {
    base_mat = [
      m[0], m[1], m[2],
      m[3], m[4], m[5],
      m[6], m[7], m[8]
    ]
  }
  else if (m.length == 16) {
    base_mat = [
      m[0], m[1], m[2],
      m[4], m[5], m[6],
      m[8], m[9], m[10]
    ]
  }
  else {
    alert("ERROR!");
  }

  permutations = [
    [ // X Y Z
      base_mat[0], base_mat[1], base_mat[2],
      base_mat[3], base_mat[4], base_mat[5],
      base_mat[6], base_mat[7], base_mat[8],
    ],
    [ // X Z Y
      base_mat[0], base_mat[1], base_mat[2],
      base_mat[6], base_mat[7], base_mat[8],
      base_mat[3], base_mat[4], base_mat[5],
    ],
    [ // Y X Z
      base_mat[3], base_mat[4], base_mat[5],
      base_mat[0], base_mat[1], base_mat[2],
      base_mat[6], base_mat[7], base_mat[8],
    ],
    [ // Y Z X
      base_mat[3], base_mat[4], base_mat[5],
      base_mat[6], base_mat[7], base_mat[8],
      base_mat[0], base_mat[1], base_mat[2],
    ],
    [ // Z Y X
      base_mat[6], base_mat[7], base_mat[8],
      base_mat[3], base_mat[4], base_mat[5],
      base_mat[0], base_mat[1], base_mat[2],
    ],
    [ // Z X Y
      base_mat[6], base_mat[7], base_mat[8],
      base_mat[0], base_mat[1], base_mat[2],
      base_mat[3], base_mat[4], base_mat[5],
    ]
  ]

  var p0 = permutations[0]
  var p1 = permutations[1]
  var p2 = permutations[2]
  var p3 = permutations[3]
  var p4 = permutations[4]
  var p5 = permutations[5]

  variants = [
    // permutation 0
    [
      [  p0[0],  p0[1],  p0[2],
         p0[3],  p0[4],  p0[5],
         p0[6],  p0[7],  p0[8], ], // OK - Goes from permutation to variant
      [ -p0[0], -p0[1], -p0[2],
        -p0[3], -p0[4], -p0[5],
         p0[6],  p0[7],  p0[8], ], // OK - Goes from permutation to variant
      [  p0[0],  p0[1],  p0[2],
        -p0[3], -p0[4], -p0[5],
        -p0[6], -p0[7], -p0[8], ], // OK - Goes from permutation to variant
      [ -p0[0], -p0[1], -p0[2],
         p0[3],  p0[4],  p0[5],
        -p0[6], -p0[7], -p0[8], ], // OK - Goes from permutation to variant
      [ -p0[0], -p0[1], -p0[2],
         p0[3],  p0[4],  p0[5],
         p0[6],  p0[7],  p0[8], ], // NO - Goes from original to variant
      [ -p0[0], -p0[1], -p0[2],
        -p0[3], -p0[4], -p0[5],
        -p0[6], -p0[7], -p0[8], ], // NO - Goes from original to variant
      [  p0[0],  p0[1],  p0[2],
         p0[3],  p0[4],  p0[5],
        -p0[6], -p0[7], -p0[8], ], // NO - Goes from original to variant
      [  p0[0],  p0[1],  p0[2],
        -p0[3], -p0[4], -p0[5],
         p0[6],  p0[7],  p0[8], ], // NO - Goes from original to variant
    ],
    // permutation 1
    [
      [  p1[0],  p1[1],  p1[2],
         p1[3],  p1[4],  p1[5],
         p1[6],  p1[7],  p1[8], ], // OK - Goes from permutation to variant
      [ -p1[0], -p1[1], -p1[2],
        -p1[3], -p1[4], -p1[5],
         p1[6],  p1[7],  p1[8], ], // OK - Goes from permutation to variant
      [  p1[0],  p1[1],  p1[2],
        -p1[3], -p1[4], -p1[5],
        -p1[6], -p1[7], -p1[8], ], // OK - Goes from permutation to variant
      [ -p1[0], -p1[1], -p1[2],
         p1[3],  p1[4],  p1[5],
        -p1[6], -p1[7], -p1[8], ], // OK - Goes from permutation to variant
      [ -p1[0], -p1[1], -p1[2],
         p1[3],  p1[4],  p1[5],
         p1[6],  p1[7],  p1[8], ], // NO - Goes from original to variant
      [ -p1[0], -p1[1], -p1[2],
        -p1[3], -p1[4], -p1[5],
        -p1[6], -p1[7], -p1[8], ], // NO - Goes from original to variant
      [  p1[0],  p1[1],  p1[2],
         p1[3],  p1[4],  p1[5],
        -p1[6], -p1[7], -p1[8], ], // NO - Goes from original to variant
      [  p1[0],  p1[1],  p1[2],
        -p1[3], -p1[4], -p1[5],
         p1[6],  p1[7],  p1[8], ], // NO - Goes from original to variant
    ],
    // permutation 2
    [
      [  p2[0],  p2[1],  p2[2],
         p2[3],  p2[4],  p2[5],
         p2[6],  p2[7],  p2[8], ], // OK - Goes from permutation to variant
      [ -p2[0], -p2[1], -p2[2],
        -p2[3], -p2[4], -p2[5],
         p2[6],  p2[7],  p2[8], ], // OK - Goes from permutation to variant
      [  p2[0],  p2[1],  p2[2],
        -p2[3], -p2[4], -p2[5],
        -p2[6], -p2[7], -p2[8], ], // OK - Goes from permutation to variant
      [ -p2[0], -p2[1], -p2[2],
         p2[3],  p2[4],  p2[5],
        -p2[6], -p2[7], -p2[8], ], // OK - Goes from permutation to variant
      [ -p2[0], -p2[1], -p2[2],
         p2[3],  p2[4],  p2[5],
         p2[6],  p2[7],  p2[8], ], // NO - Goes from original to variant
      [ -p2[0], -p2[1], -p2[2],
        -p2[3], -p2[4], -p2[5],
        -p2[6], -p2[7], -p2[8], ], // NO - Goes from original to variant
      [  p2[0],  p2[1],  p2[2],
         p2[3],  p2[4],  p2[5],
        -p2[6], -p2[7], -p2[8], ], // NO - Goes from original to variant
      [  p2[0],  p2[1],  p2[2],
        -p2[3], -p2[4], -p2[5],
         p2[6],  p2[7],  p2[8], ], // NO - Goes from original to variant
    ],
    // permutation 3
    [
      [  p3[0],  p3[1],  p3[2],
         p3[3],  p3[4],  p3[5],
         p3[6],  p3[7],  p3[8], ], // OK - Goes from permutation to variant
      [ -p3[0], -p3[1], -p3[2],
        -p3[3], -p3[4], -p3[5],
         p3[6],  p3[7],  p3[8], ], // OK - Goes from permutation to variant
      [  p3[0],  p3[1],  p3[2],
        -p3[3], -p3[4], -p3[5],
        -p3[6], -p3[7], -p3[8], ], // OK - Goes from permutation to variant
      [ -p3[0], -p3[1], -p3[2],
         p3[3],  p3[4],  p3[5],
        -p3[6], -p3[7], -p3[8], ], // OK - Goes from permutation to variant
      [ -p3[0], -p3[1], -p3[2],
         p3[3],  p3[4],  p3[5],
         p3[6],  p3[7],  p3[8], ], // NO - Goes from original to variant
      [ -p3[0], -p3[1], -p3[2],
        -p3[3], -p3[4], -p3[5],
        -p3[6], -p3[7], -p3[8], ], // NO - Goes from original to variant
      [  p3[0],  p3[1],  p3[2],
         p3[3],  p3[4],  p3[5],
        -p3[6], -p3[7], -p3[8], ], // NO - Goes from original to variant
      [  p3[0],  p3[1],  p3[2],
        -p3[3], -p3[4], -p3[5],
         p3[6],  p3[7],  p3[8], ], // NO - Goes from original to variant
    ],
    // permutation 4
    [
      [  p4[0],  p4[1],  p4[2],
         p4[3],  p4[4],  p4[5],
         p4[6],  p4[7],  p4[8], ], // OK - Goes from permutation to variant
      [ -p4[0], -p4[1], -p4[2],
        -p4[3], -p4[4], -p4[5],
         p4[6],  p4[7],  p4[8], ], // OK - Goes from permutation to variant
      [  p4[0],  p4[1],  p4[2],
        -p4[3], -p4[4], -p4[5],
        -p4[6], -p4[7], -p4[8], ], // OK - Goes from permutation to variant
      [ -p4[0], -p4[1], -p4[2],
         p4[3],  p4[4],  p4[5],
        -p4[6], -p4[7], -p4[8], ], // OK - Goes from permutation to variant
      [ -p4[0], -p4[1], -p4[2],
         p4[3],  p4[4],  p4[5],
         p4[6],  p4[7],  p4[8], ], // NO - Goes from original to variant
      [ -p4[0], -p4[1], -p4[2],
        -p4[3], -p4[4], -p4[5],
        -p4[6], -p4[7], -p4[8], ], // NO - Goes from original to variant
      [  p4[0],  p4[1],  p4[2],
         p4[3],  p4[4],  p4[5],
        -p4[6], -p4[7], -p4[8], ], // NO - Goes from original to variant
      [  p4[0],  p4[1],  p4[2],
        -p4[3], -p4[4], -p4[5],
         p4[6],  p4[7],  p4[8], ], // NO - Goes from original to variant
    ],
    // permutation 5
    [
      [  p5[0],  p5[1],  p5[2],
         p5[3],  p5[4],  p5[5],
         p5[6],  p5[7],  p5[8], ], // OK - Goes from permutation to variant
      [ -p5[0], -p5[1], -p5[2],
        -p5[3], -p5[4], -p5[5],
         p5[6],  p5[7],  p5[8], ], // OK - Goes from permutation to variant
      [  p5[0],  p5[1],  p5[2],
        -p5[3], -p5[4], -p5[5],
        -p5[6], -p5[7], -p5[8], ], // OK - Goes from permutation to variant
      [ -p5[0], -p5[1], -p5[2],
         p5[3],  p5[4],  p5[5],
        -p5[6], -p5[7], -p5[8], ], // OK - Goes from permutation to variant
      [ -p5[0], -p5[1], -p5[2],
         p5[3],  p5[4],  p5[5],
         p5[6],  p5[7],  p5[8], ], // NO - Goes from original to variant
      [ -p5[0], -p5[1], -p5[2],
        -p5[3], -p5[4], -p5[5],
        -p5[6], -p5[7], -p5[8], ], // NO - Goes from original to variant
      [  p5[0],  p5[1],  p5[2],
         p5[3],  p5[4],  p5[5],
        -p5[6], -p5[7], -p5[8], ], // NO - Goes from original to variant
      [  p5[0],  p5[1],  p5[2],
        -p5[3], -p5[4], -p5[5],
         p5[6],  p5[7],  p5[8], ], // NO - Goes from original to variant
    ]
  ]
}

function LoadMatrix() {
  var M = GetInputMatrix()
  FillOutMatrices(M)
  RenderPolar();
}

function S1() {
  var m = [
    0.7986351932653266, -0.601815443535686, 0, 0,
    0.601815443535686, 0.7986351932653264, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
  FillDebugMatrix(m)
  FillOutMatrices(m)
  RenderPolar();
}

function S2() {
  var m = [
    1.2021519598762158e-7, 0.9999999999999926, 0, 0,
    -0.9999999999999926, 1.2021519693052948e-7, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
  FillDebugMatrix(m)
  FillOutMatrices(m)
  RenderPolar();
}
function S3() {
  var m = [
    0.7071065431725604, -0.707107019200454, 0, 0,
    0.7071070192004547, 0.7071065431725607, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
  FillDebugMatrix(m)
  FillOutMatrices(m)
  RenderPolar();
}

function Init() {
  FillDebugMatrix([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])
  var M = GetInputMatrix()
  FillOutMatrices(M)

  SetLookAt(polar_cam_pos, polar_cam_target)

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

  var cirX = 20 + GetIterationPolar() * 54
  var cirY = 20
  var cirX2 = 20 + GetIterationPolar2() * 38.571
  var cirY2 = 60
  var cirR = 10

  if (PointInCircle(polar_mouse, cirX, cirY, cirR)) {
    polar_selectedItem = 2
  }
  else if (PointInCircle(polar_mouse, cirX2, cirY2, cirR)) {
    polar_selectedItem = 1
  }

  RenderPolar()
}

function OnMouseUpPolar(evt) {
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
  var cirX = 20 + GetIterationPolar() * 54
  var cirX2 = 20 + GetIterationPolar2() * 38.571

  if (evt.buttons & 1 == 1) {
   cirX = GetHandleXPolar(polar_t);
   cirX2 = GetHandleXPolar(polar_r);

   if (polar_selectedItem == 1) {
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

      polar_r = current
    }
    else if (polar_selectedItem == 2) {
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
  var cirY2 = 60
  var cirR = 10

  if (PointInCircle(polar_mouse, cirX, cirY, cirR)) {
    polar_mouseOnItem = 2
  }
  else if (PointInCircle(polar_mouse, cirX2, cirY2, cirR)) {
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

  polar_gl.clear(polar_gl.COLOR_BUFFER_BIT | polar_gl.DEPTH_BUFFER_BIT);

  var move = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    8, 0, 0, 1
  ]

  DrawBuffer(basis_geometry, Mul4(move, M4(base_mat)))

  var perm_index = -1
  if (GetIterationPolar() < permutations.length && permutations[GetIterationPolar()] != null) {
    DrawBuffer(basis_geometry, M4(permutations[GetIterationPolar()]))
    perm_index = GetIterationPolar()
  }

  move = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -8, 0, 0, 1
  ]

  if (perm_index >= 0 && perm_index < variants.length && GetIterationPolar2() < variants[perm_index].length && variants[perm_index][GetIterationPolar2()] != null) {
    DrawBuffer(basis_geometry, Mul4(move, M4(variants[perm_index][GetIterationPolar2()])))
  }
}

function M4(m3) {
  return [
    m3[0], m3[1], m3[2], 0,
    m3[3], m3[4], m3[5], 0,
    m3[6], m3[7], m3[8], 0,
        0,     0,     0, 1
  ]
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
    for (var i = 0; i < 6; ++i) {
      var x = Math.floor(20 + i * 54);
      polar_2d_context.moveTo(x, 10)
      polar_2d_context.lineTo(x, 30) 
      polar_2d_context.stroke()
    }
    polar_2d_context.closePath()

    polar_2d_context.lineWidth = 1

    // Scale 1
    polar_2d_context.strokeStyle = 'rgb(32, 32, 32)';
    polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
    if (polar_mouseOnItem == 2 || polar_selectedItem == 2) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
    }
    var handleX = 20 + GetIterationPolar() * 54
    var handleY = 20
    polar_2d_context.beginPath()
    polar_2d_context.arc(handleX, handleY, 10, 0, Math.PI * 2, true); // Outer circle
    polar_2d_context.stroke()
    polar_2d_context.fill()
    polar_2d_context.closePath()

    polar_2d_context.font = '18px serif';
    debugString = 'Permutation: ' + GetIterationPolar()
    polar_2d_context.fillStyle = 'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, 320, 25);

    polar_2d_context.font = '18px serif';
    debugString = p_out[GetIterationPolar()]
    polar_2d_context.fillStyle = 'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, 475, 25);

    // SLIDER 2

    // Draw the scale slider
    polar_2d_context.setLineDash([]);
    polar_2d_context.strokeStyle = 'rgb(128, 128, 128)';
    polar_2d_context.fillStyle = 'rgb(32, 32, 32)';

    polar_2d_context.lineWidth = 2

    // Draw slider line
    polar_2d_context.beginPath()
    polar_2d_context.moveTo(20 - 10, 60)
    polar_2d_context.lineTo(20 + 270 + 10, 60) 
    polar_2d_context.stroke()
    polar_2d_context.closePath()

    // Draw notches
    polar_2d_context.beginPath()
    for (var i = 0; i < 8; ++i) {
      var x = Math.floor(20 + i * 38.571);
      polar_2d_context.moveTo(x, 50)
      polar_2d_context.lineTo(x, 70) 
      polar_2d_context.stroke()
    }
    polar_2d_context.closePath()

    polar_2d_context.lineWidth = 1

    // Scale 1
    polar_2d_context.strokeStyle = 'rgb(32, 32, 32)';
    polar_2d_context.fillStyle = 'rgb(128, 128, 128)';
    if (polar_mouseOnItem == 1 || polar_selectedItem == 1) {
        polar_2d_context.fillStyle = 'rgb(200, 200, 200)';
    }
    var handleX = 20 + GetIterationPolar2() * 38.571
    var handleY = 60
    polar_2d_context.beginPath()
    polar_2d_context.arc(handleX, handleY, 10, 0, Math.PI * 2, true); // Outer circle
    polar_2d_context.stroke()
    polar_2d_context.fill()
    polar_2d_context.closePath()

    polar_2d_context.font = '18px serif';
    debugString = 'Variant: ' + GetIterationPolar2()
    polar_2d_context.fillStyle = 'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, 320, 65);

    polar_2d_context.font = '18px serif';
    debugString = v_out[GetIterationPolar2()]
    polar_2d_context.fillStyle = 'rgb(64, 64, 64)';
    polar_2d_context.fillText(debugString, 475, 65);
  }
}

function PointInCircle(point, cirX, cirY, rad) {
  var x2 = (point[0] - cirX) * (point[0] - cirX)
  var y2 = (point[1] - cirY) * (point[1] - cirY)
  return x2 + y2 < rad * rad
}

function GetHandleXPolar(_t) {
  // Lerp
  return 20 + (290 - 20) * _t
}

function GetIterationPolar() {
  return Math.floor(polar_t * 270 / 54)
}

function GetIterationPolar2() {
  return Math.floor(polar_r * 270 / 38.571)
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