function MakeTransform(position, rotation, scale, parent) {
	if (position == null || !Array.isArray(position) || position.length != 3) {
		position = [0, 0, 0]
	}
	if (rotation == null || !Array.isArray(rotation) || rotation.length != 4) {
		rotation = [1, 0, 0, 0]
	}
	if (scale == null || !Array.isArray(scale) || scale.length != 3) {
		scale = [1,1,1]
	}
	if (typeof parent == 'undefined') {
		parent = null;
	}

	var xform = {
		position: position,
		rotation: rotation,
		scale: scale,
		parent: parent,

		children: []
	}

	if (parent != null) {
		parent.children.push(xform);
	}

	return xform;
}

function ToMatrix(transform) {
	var x = Q_Mul_V3(transform.rotation, [1, 0, 0]);
	var y = Q_Mul_V3(transform.rotation, [0, 1, 0]);
	var z = Q_Mul_V3(transform.rotation, [0, 0, 1]);

	x = V3_Mul_F(x, transform.scale[0])
	y = V3_Mul_F(y, transform.scale[1])
	z = V3_Mul_F(z, transform.scale[2])

	var t = transform.position;

	return [
		x[0], x[1], x[2], 0,
		y[0], y[1], y[2], 0,
		z[0], z[1], z[2], 0,
		t[0], t[1], t[2], 1
	]
}

function GetWorldMatrix(transform) {
	var localMatrix = ToMatrix(transform);
	var worldMatrix = localMatrix;

	if (transform.parent != null) {
		var parentMatrix = GetWorldMatrix(transform.parent);
		// Vertex * child * parent
		worldMatrix = M4_Mul_M4(parentMatrix, localMatrix);
	}

	return worldMatrix;
}

// Debug help functions
function Q_AngleAxis(angle, axis) {
	angle = angle * 0.0174533;

	var nAxis = V3_Normalize(axis);
	
	const hCos = Math.cos(angle * 0.5);
	const hSin = Math.sin(angle * 0.5);

	const result = [
		hCos,
		hSin * nAxis[0],
		hSin * nAxis[1],
		hSin * nAxis[2]
	];

	return Q_Normalize(result);
}

function Q_Normalize(q) {
	const n = Math.sqrt(q[1]*q[1] + q[2]*q[2] + q[3]*q[3] + q[0]*q[0]);
	const result = [
		q[0] / n,
		q[1] / n,
		q[2] / n,
		q[3] / n
	]
	return result;
}

function V3_Normalize(v) {
	const dot = V3_Dot_V3(v, v);
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

function Q_Mul_V3(q, v) {
    const u = [
    	q[1],
    	q[2],
    	q[3]
    ]
    const s = q[0];

    const one = V3_Mul_F(u, V3_Dot_V3(u, v) * 2.0)
    const two = V3_Mul_F(v, (s * s - V3_Dot_V3(u, u)))
    const three = V3_Mul_F(V3_Cross_V3(u, v), 2.0 * s)

    const vprime = V3_Add_V3(V3_Add_V3(one, two), three)
    return vprime;
}

function V3_Add_V3(v1, v2) {
	return [
		v1[0] + v2[0],
		v1[1] + v2[1],
		v1[2] + v2[2]
	]
}

function V3_Dot_V3(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
}

function V3_Mul_F(v, f) {
	return [v[0] * f, v[1] * f, v[2] * f]
}

function V3_Cross_V3(v1, v2) {
	const result = [
		v1[1] * v2[2] - v1[2] * v2[1],
		v1[2] * v2[0] - v1[0] * v2[2],
		v1[0] * v2[1] - v1[1] * v2[0]
	];
	return result;
}

var polar_3d_canvas = null;
var polar_gl = null;
var polar_shader = null;
var polar_projection = null;
var polar_view = null;
var polar_cube = null;

var polar_width = 800;
var polar_3d_height = 400;
var polar_cam_pos = [0, 2, -10]
var polar_cam_target = [0, 2, 0]

var root_xform = null;

function MakeXFormHierarchy() {
	root_xform = MakeTransform(null, null, null, null);
	root_xform.color = {r:0, g:0, b:1};

	var child = MakeTransform([3, 3, 0], Q_AngleAxis(90, [1, 0, 0]), [1, 2, 1], root_xform);
	child.color = {r:0, g:1, b:0};

	MakeTransform([0, 0, 3], null, null, child).color = {r:0, g:0, b:1};
	MakeTransform([0, 0, 1.5], null, [1, 0.5, 1], child).color = {r:0, g:0, b:1};

	child = MakeTransform([-2, 0, 0], Q_AngleAxis(45, [0, 0, 1]), null, root_xform);
	child.color = {r:1, g:0, b:0};

	child = MakeTransform([2, 0, 0], Q_AngleAxis(45, [0, 1, 0]), null, child);
	child.color = {r:0, g:1, b:1};

	child = MakeTransform([0, 2, 0], Q_AngleAxis(45, [0, 0, 1]), null, child);
	child.color = {r:1, g:0, b:1};
}

function IntWebGL() {
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

			polar_cube = MakeCube(polar_gl, {x:0,y:0,z:0}, 0.5, 0.5, 0.5);

			document.getElementById("cam_x").value = polar_cam_pos[0].toFixed(5)
			document.getElementById("cam_y").value = polar_cam_pos[1].toFixed(5)
			document.getElementById("cam_z").value = polar_cam_pos[2].toFixed(5)

			document.getElementById("tar_x").value = polar_cam_target[0].toFixed(5)
			document.getElementById("tar_y").value = polar_cam_target[1].toFixed(5)
			document.getElementById("tar_z").value = polar_cam_target[2].toFixed(5)

			MakeXFormHierarchy();

			DrawWebGL();
		}
	}
}

function DrawWebGL() {
	if (!polar_gl) {
		return;
	}

	polar_cam_pos[0] = Number(document.getElementById("cam_x").value)
	polar_cam_pos[1] = Number(document.getElementById("cam_y").value)
	polar_cam_pos[2] = Number(document.getElementById("cam_z").value)

	polar_cam_target[0] = Number(document.getElementById("tar_x").value)
	polar_cam_target[1] = Number(document.getElementById("tar_y").value)
	polar_cam_target[2] = Number(document.getElementById("tar_z").value)
	polar_view = LookAt(polar_cam_pos, polar_cam_target, [0, 1, 0]);

	polar_gl.clear(polar_gl.COLOR_BUFFER_BIT | polar_gl.DEPTH_BUFFER_BIT);

	DrawTransformBuffer(root_xform);
}

function DrawTransformBuffer(transform) {
	var model = GetWorldMatrix(transform);

	DrawBuffer(polar_cube, model, /*{r:0, g:0, b:1}*/transform.color)

	if (transform.children != null) {
		for (var i = 0; i < transform.children.length; ++i) {
			DrawTransformBuffer(transform.children[i]);
		}
	}
}

////////
function MakeSolidColorShader(gl) {
  // Setup vertex Shader
  const vSource = `
    precision highp float;

    attribute vec3 position;
    attribute vec3 normal;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    uniform vec4 renderColor;

    varying vec3 color; 

    void main() {
      vec3 norm = normalMatrix * normal;

      vec3 ambientLight = vec3(0.1, 0.1, 0.1);
      //vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
      vec3 directionalVector = normalize(vec3(0, 1, 0));

      float directional = max(dot(norm, directionalVector), 0.0);
      color = ambientLight + (renderColor.xyz * directional);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
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
    varying vec3 color; 

    void main() {
		gl_FragColor = vec4(color, 1);
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
      normal: gl.getAttribLocation(program, "normal")   
    },
    uniforms : {
      modelView: gl.getUniformLocation(program, "modelViewMatrix"),
      normal: gl.getUniformLocation(program, "normalMatrix"),
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
  const zAxis = V3_Normalize([
    eye[0] - at[0],
    eye[1] - at[1],
    eye[2] - at[2]
  ]);
  const xAxis = V3_Normalize(V3_Cross_V3(zAxis, up));
  const yAxis = V3_Cross_V3(xAxis, zAxis);

  const result = [
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -V3_Dot_V3(xAxis, eye), 
    -V3_Dot_V3(yAxis, eye),
    -V3_Dot_V3(zAxis, eye),
    1
  ];

  return result;
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
	
	
	// top
	verts.push(0);verts.push(1);verts.push(0);
	verts.push(0);verts.push(1);verts.push(0);
	verts.push(0);verts.push(1);verts.push(0);
	verts.push(0);verts.push(1);verts.push(0);
	verts.push(0);verts.push(1);verts.push(0);
	verts.push(0);verts.push(1);verts.push(0);
	// bottom
	verts.push(0);verts.push(-1);verts.push(0);
	verts.push(0);verts.push(-1);verts.push(0);
	verts.push(0);verts.push(-1);verts.push(0);
	verts.push(0);verts.push(-1);verts.push(0);
	verts.push(0);verts.push(-1);verts.push(0);
	verts.push(0);verts.push(-1);verts.push(0);
	//right
	verts.push(1);verts.push(0);verts.push(0);
	verts.push(1);verts.push(0);verts.push(0);
	verts.push(1);verts.push(0);verts.push(0);
	verts.push(1);verts.push(0);verts.push(0);
	verts.push(1);verts.push(0);verts.push(0);
	verts.push(1);verts.push(0);verts.push(0);
	//left
	verts.push(-1);verts.push(0);verts.push(0);
	verts.push(-1);verts.push(0);verts.push(0);
	verts.push(-1);verts.push(0);verts.push(0);
	verts.push(-1);verts.push(0);verts.push(0);
	verts.push(-1);verts.push(0);verts.push(0);
	verts.push(-1);verts.push(0);verts.push(0);
	//front
	verts.push(0);verts.push(0);verts.push(1);
	verts.push(0);verts.push(0);verts.push(1);
	verts.push(0);verts.push(0);verts.push(1);
	verts.push(0);verts.push(0);verts.push(1);
	verts.push(0);verts.push(0);verts.push(1);
	verts.push(0);verts.push(0);verts.push(1);
	//back
	verts.push(0);verts.push(0);verts.push(-1);
	verts.push(0);verts.push(0);verts.push(-1);
	verts.push(0);verts.push(0);verts.push(-1);
	verts.push(0);verts.push(0);verts.push(-1);
	verts.push(0);verts.push(0);verts.push(-1);
	verts.push(0);verts.push(0);verts.push(-1);


	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	return {
		bufferId: arrayBuffer,
		count: (verts.length / 2) / 3,
		numComponents: 3,
		type: gl.FLOAT,
		stride: 0,
		offset_pos: 0,
		offset_norm: (verts.length / 2) 
	}
}

function DrawBuffer(buffer, modelMatrix, color) {
  var modelViewMatrix = M4_Mul_M4(polar_view, modelMatrix);

  var normalMatrix = [
  	modelViewMatrix[0], modelViewMatrix[1], modelViewMatrix[2],
  	modelViewMatrix[4], modelViewMatrix[5], modelViewMatrix[6],
  	modelViewMatrix[8], modelViewMatrix[9], modelViewMatrix[10]
  ]
  normalMatrix = M3_Transpose(M3_Inverse(normalMatrix));

  polar_gl.bindBuffer(polar_gl.ARRAY_BUFFER, buffer.bufferId);

  polar_gl.vertexAttribPointer(polar_shader.attribs.position, buffer.numComponents, buffer.type, false, buffer.stride, buffer.offset_pos * 4);
  polar_gl.enableVertexAttribArray(polar_shader.attribs.position);

   polar_gl.vertexAttribPointer(polar_shader.attribs.normal, buffer.numComponents, buffer.type, false, buffer.stride, buffer.offset_norm * 4);
  polar_gl.enableVertexAttribArray(polar_shader.attribs.normal);

  polar_gl.useProgram(polar_shader.id);

  polar_gl.uniformMatrix4fv(polar_shader.uniforms.projection, false, polar_projection);
  polar_gl.uniformMatrix4fv(polar_shader.uniforms.modelView, false, modelViewMatrix);

  polar_gl.uniformMatrix3fv(polar_shader.uniforms.normal, false, normalMatrix);

  polar_gl.uniform4f(polar_shader.uniforms.color, color.r, color.g, color.b, 1.0);

  const offset = 0;
  polar_gl.drawArrays(polar_gl.TRIANGLES, offset, buffer.count)
}