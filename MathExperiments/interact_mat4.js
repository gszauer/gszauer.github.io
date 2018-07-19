var polar_3d_canvas = null;
var polar_gl = null;
var polar_shader = null;
var polar_projection = null;
var polar_view = null;

var polar_width = 800;
var polar_3d_height = 400;
var polar_cam_pos = [15, 15, 15]
var polar_cam_target = [2, 7, 18]

var c_angle = 0;
var c_scale = 0;

function InitMatrices() {
	var M = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]

	SetHtmlFromMatrix(0, M);
	SetHtmlFromMatrix(1, M);
	SetHtmlFromMatrix(2, M);

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

			polar_cylinder = MakeCube(polar_gl, {x:0,y:0,z:0}, 1, 1, 1);

			document.getElementById("cam_x").value = polar_cam_pos[0].toFixed(5)
			document.getElementById("cam_y").value = polar_cam_pos[1].toFixed(5)
			document.getElementById("cam_z").value = polar_cam_pos[2].toFixed(5)

			document.getElementById("tar_x").value = polar_cam_target[0].toFixed(5)
			document.getElementById("tar_y").value = polar_cam_target[1].toFixed(5)
			document.getElementById("tar_z").value = polar_cam_target[2].toFixed(5)

			DrawDebugMat();
		}
	}
}

function DrawDebugMat() {
  if (!polar_gl) {
    return;
  }

	document.getElementById("out_step").innerHTML = c_angle
	document.getElementById("out_scale").innerHTML = c_scale


	polar_cam_pos[0] = Number(document.getElementById("cam_x").value)
	polar_cam_pos[1] = Number(document.getElementById("cam_y").value)
	polar_cam_pos[2] = Number(document.getElementById("cam_z").value)

	polar_cam_target[0] = Number(document.getElementById("tar_x").value)
	polar_cam_target[1] = Number(document.getElementById("tar_y").value)
	polar_cam_target[2] = Number(document.getElementById("tar_z").value)
	polar_view = LookAt(polar_cam_pos, polar_cam_target, [0, 1, 0]);

  polar_gl.clear(polar_gl.COLOR_BUFFER_BIT | polar_gl.DEPTH_BUFFER_BIT);
  var model = GetMatrixFromHtml(2);
  DrawBuffer(polar_cylinder, model, {r:0, g:0, b:1})
}

function GetMatrixFromHtml(idx) {
	var M = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];

	M[0] = Number(document.getElementById("m" + idx + "_row_0_col_0").value)
	M[1] = Number(document.getElementById("m" + idx + "_row_1_col_0").value)
	M[2] = Number(document.getElementById("m" + idx + "_row_2_col_0").value)
	M[3] = Number(document.getElementById("m" + idx + "_row_3_col_0").value)

	M[4] = Number(document.getElementById("m" + idx + "_row_0_col_1").value)
	M[5] = Number(document.getElementById("m" + idx + "_row_1_col_1").value)
	M[6] = Number(document.getElementById("m" + idx + "_row_2_col_1").value)
	M[7] = Number(document.getElementById("m" + idx + "_row_3_col_1").value)

	M[8] = Number(document.getElementById("m" + idx + "_row_0_col_2").value)
	M[9] = Number(document.getElementById("m" + idx + "_row_1_col_2").value)
	M[10]= Number(document.getElementById("m" + idx + "_row_2_col_2").value)
	M[11]= Number(document.getElementById("m" + idx + "_row_3_col_2").value)

	M[12]= Number(document.getElementById("m" + idx + "_row_0_col_3").value)
	M[13]= Number(document.getElementById("m" + idx + "_row_1_col_3").value)
	M[14]= Number(document.getElementById("m" + idx + "_row_2_col_3").value)
	M[15]= Number(document.getElementById("m" + idx + "_row_3_col_3").value)

	return M;
}

function SetHtmlFromMatrix(idx, M) {
	document.getElementById("m" + idx + "_row_0_col_0").value = M[0].toFixed(5)
	document.getElementById("m" + idx + "_row_1_col_0").value = M[1].toFixed(5)
	document.getElementById("m" + idx + "_row_2_col_0").value = M[2].toFixed(5)
	document.getElementById("m" + idx + "_row_3_col_0").value = M[3].toFixed(5)

	document.getElementById("m" + idx + "_row_0_col_1").value = M[4].toFixed(5)
	document.getElementById("m" + idx + "_row_1_col_1").value = M[5].toFixed(5)
	document.getElementById("m" + idx + "_row_2_col_1").value = M[6].toFixed(5)
	document.getElementById("m" + idx + "_row_3_col_1").value = M[7].toFixed(5)

	document.getElementById("m" + idx + "_row_0_col_2").value = M[8].toFixed(5)
	document.getElementById("m" + idx + "_row_1_col_2").value = M[9].toFixed(5)
	document.getElementById("m" + idx + "_row_2_col_2").value = M[10].toFixed(5)
	document.getElementById("m" + idx + "_row_3_col_2").value = M[11].toFixed(5)

	document.getElementById("m" + idx + "_row_0_col_3").value = M[12].toFixed(5)
	document.getElementById("m" + idx + "_row_1_col_3").value = M[13].toFixed(5)
	document.getElementById("m" + idx + "_row_2_col_3").value = M[14].toFixed(5)
	document.getElementById("m" + idx + "_row_3_col_3").value = M[15].toFixed(5)
}

function MultiplyMatrices() {
	var A = GetMatrixFromHtml(0);
	var B = GetMatrixFromHtml(1)

	var R = M4_Mul_M4(A, B)

	SetHtmlFromMatrix(2, R)
}

function SwapAB() {
	var A = GetMatrixFromHtml(0);
	var B = GetMatrixFromHtml(1);

	SetHtmlFromMatrix(0, B)
	SetHtmlFromMatrix(1, A)
}

function RToA() {
	var R = GetMatrixFromHtml(2);
	SetHtmlFromMatrix(0, R)
}

function RToB() {
	var R = GetMatrixFromHtml(2);
	SetHtmlFromMatrix(1, R)
}

function IdentityA() {
	var M = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]

	SetHtmlFromMatrix(0, M);
}

function IdentityB() {
	var M = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]

	SetHtmlFromMatrix(1, M);
}

function IdentityR() {
	var M = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]

	SetHtmlFromMatrix(2, M);
}

function DebugTRS() {
	// Translate: 2, 7, 18
	var T = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		2, 7, 18, 1
	] 

	// Rotate: 45 degrees on X axis
	var angle = 45.0 * 0.0174533
	var R = [
		1,  0,                     0,               0,
		0,  Math.cos(angle),       Math.sin(angle), 0,
		0, -1.0 * Math.sin(angle), Math.cos(angle), 0,
		0,  0,                     0,               1
	] 

	// Scale: 2, 1, .5
	var S = [
		2, 0, 0,   0,
		0, 1, 0,   0,
		0, 0, 0.5, 0,
		0, 0, 0,   1
	] 

	// Translate, Rotate, Scale
	// Scale first
	// Rotate second
	// Translate last!
	var TRS = M4_Mul_M4(T, M4_Mul_M4(R, S))

	/* Expected output:
	2, 0,         0, 2, 
	0, 0.7071067, -0.3535534, 7, 
	0, 0.7071068, 0.3535534, 18, 
	0, 0,         0, 1, 
	*/

	// Place camera at 15, 15, 15 to debug!

	SetHtmlFromMatrix(0, R);
	SetHtmlFromMatrix(1, S);
	SetHtmlFromMatrix(2, TRS);
}


function StepTranslateRotate() {
	c_angle += 10;
	if (c_angle >= 360) {
		c_angle -= 360;
	}
	document.getElementById("out_step").innerHTML = c_angle

	var angle = c_angle * 0.0174533
	var R = [
		1,  0,                     0,               0,
		0,  Math.cos(angle),       Math.sin(angle), 0,
		0, -1.0 * Math.sin(angle), Math.cos(angle), 0,
		2,  7,                     18,               1
	]

	SetHtmlFromMatrix(0, R);
}

function StepScale() {
	c_scale += 0.25;
	if (c_scale >= 5) {
		c_scale -= 5;
	}
	document.getElementById("out_scale").innerHTML = c_scale

	var S = [
		2, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, c_scale, 0,
		0, 0, 0, 1
	]

	SetHtmlFromMatrix(1, S);
}

////////
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

function MakeCube(gl, position, halfX, halfY, halfZ) {
	var arrayBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
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