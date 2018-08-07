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
var light_dir = [0.85, 1, 2]

var use_global = false;
var use_matrices = true;

var hierarchy_xform = null;
var global_xform = null;

var default_fixed_count = 15

function MakeXFormHierarchy() {
	var global_transforms = []
	var global_hierarchy = []

	hierarchy_xform = MakeTransform(null, null, null, null);
	hierarchy_xform.color = {r:0, g:0, b:1};
	global_transforms.push(hierarchy_xform);

	var child = MakeTransform([3, 3, 0], Q_AngleAxis(90, [1, 0, 0]), [1, 2, 1], hierarchy_xform);
	child.color = {r:0, g:1, b:0};
	global_transforms.push(child);

	var x = MakeTransform([0, 0, 3], null, null, child)
	x.color = {r:0, g:0, b:1};
	global_transforms.push(x);

	x = MakeTransform([0, 0, 1.5], null, [1, 0.5, 1], child)
	x.color = {r:0, g:0, b:1};
	global_transforms.push(x);

	child = MakeTransform([-2, 0, 0], Q_AngleAxis(45, [0, 0, 1]), null, hierarchy_xform);
	child.color = {r:1, g:0, b:0};
	global_transforms.push(child);

	child = MakeTransform([2, 0, 0], Q_AngleAxis(45, [0, 1, 0]), null, child);
	child.color = {r:0, g:1, b:1};
	global_transforms.push(child);

	child = MakeTransform([0, 2, 0], Q_AngleAxis(45, [0, 0, 1]), null, child);
	child.color = {r:1, g:0, b:1};
	global_transforms.push(child);

	// Edge case matrix
	child = MakeTransform([-8, 5, 0], null, [3, 0.5, 0.5], hierarchy_xform);
	child.color = {r:0.2, g:0.4, b:0.6};
	global_transforms.push(child);

	child = MakeTransform([0.5, -2, 0], Q_AngleAxis(45, [0, 0, 1]), [1, 1, 1], child);
	child.color = {r:0.2, g:0.4, b:0.6};
	global_transforms.push(child);
	child.debug = true

	// Edge case # 2
	child = MakeTransform([8, -2, 0], null, [3, 1, 1], hierarchy_xform);
	child.color = {r:1, g:0, b:0};
	global_transforms.push(child);

	child = MakeTransform([-3, 0, 0], Q_AngleAxis(90, [0, 0, 1]), [1,5,1], child);
	child.color = {r:0, g:1, b:0};
	global_transforms.push(child);

	child = MakeTransform([0,0.75,0], null, [2,1/2,2], child);
	child.color = {r:0, g:0, b:1};
	global_transforms.push(child);

	/* 0: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), null))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0, g:0, b:1};
	
	/* 1: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[0]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0, g:1, b:0};

	/* 2: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[1]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0, g:0, b:1};

	/* 3: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[1]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0, g:0, b:1};

	/* 4: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[0]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:1, g:0, b:0};

	/* 5: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[4]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0, g:1, b:1};

	/* 6: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[4]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:1, g:0, b:1};

	/* 7: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[0]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0.2, g:0.4, b:0.6};

	/* 8: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[7]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0.2, g:0.4, b:0.6};

	/* 9: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[0]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:1, g:0, b:0};

	/* 10: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[9]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0, g:1, b:0};

	/* 11: */global_hierarchy.push(MakeTransform(RandomPositon(), RandomRotation(), RandomScale(), global_hierarchy[9]))
	global_hierarchy[global_hierarchy.length - 1].color = {r:0, g:0, b:1};

	global_xform = global_hierarchy[0];
	for (var i = 0; i < global_hierarchy.length; ++i) {
		var world = GetWorldMatrix(global_transforms[i]);
		var decomp = AffineDecompose(world).Shoemake;

		SetGlobalTRS(global_hierarchy[i], decomp.t, decomp.q, decomp.k);
		global_hierarchy[i].debug = global_transforms[i].debug;

		if (global_hierarchy[i].debug) {
			var debug = "true"
		}
	}
}

function RandomPositon() {
	return [Math.random() * 3, Math.random() * 3, Math.random() * 3]
}

function RandomRotation() {
	var axis = [Math.random() * 10, Math.random() * 10, Math.random() * 10]
	var angle = Math.random() * 359

	return Q_AngleAxis(angle, axis);
}

function RandomScale() {
	return [Math.random() * 3 + 0.25, Math.random() * 3 + 0.25, Math.random() * 3 + 0.25]
}


function UseMatrices() {
	document.getElementById("u_mat").innerHTML = "(t)"
	document.getElementById("u_tran").innerHTML = "(f)"
	use_matrices = true;
	DrawWebGL();
}

function UseTransforms() {
	document.getElementById("u_mat").innerHTML = "(f)"
	document.getElementById("u_tran").innerHTML = "(t)"
	use_matrices = false;
	DrawWebGL();
}

function UseHierarchy() {
	document.getElementById("h_stat").innerHTML = "(t)"
	document.getElementById("g_stat").innerHTML = "(f)"
	use_global = false;
	DrawWebGL();
}

function UseGlobal() {
	document.getElementById("h_stat").innerHTML = "(f)"
	document.getElementById("g_stat").innerHTML = "(t)"
	use_global = true;
	DrawWebGL();
}

function V3_ToString(v, fixed) {
	if (typeof fixed == "undefined" || fixed == null) {
		fixed = default_fixed_count
	}

	return "[ " + v[0].toFixed(fixed) + ", " + v[1].toFixed(fixed) + ", " + v[2].toFixed(fixed) + " ]"
}

function Q_ToString(v, fixed) {
	if (typeof fixed == "undefined" || fixed == null) {
		fixed = default_fixed_count
	}

	return "[ " + v[0].toFixed(fixed) + ", " + v[1].toFixed(fixed) + ", " + v[2].toFixed(fixed) + ", " + v[3].toFixed(fixed) + " ]"
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


			document.getElementById("light_x").value = light_dir[0].toFixed(5)
			document.getElementById("light_y").value = light_dir[1].toFixed(5)
			document.getElementById("light_z").value = light_dir[2].toFixed(5)

			MakeXFormHierarchy();

			DrawWebGL();
		}
	}
}

function DrawWebGL() {
	if (!polar_gl) {
		return;
	}

	light_dir[0] = Number(document.getElementById("light_x").value)
	light_dir[1] = Number(document.getElementById("light_y").value)
	light_dir[2] = Number(document.getElementById("light_z").value)

	polar_cam_pos[0] = Number(document.getElementById("cam_x").value)
	polar_cam_pos[1] = Number(document.getElementById("cam_y").value)
	polar_cam_pos[2] = Number(document.getElementById("cam_z").value)

	polar_cam_target[0] = Number(document.getElementById("tar_x").value)
	polar_cam_target[1] = Number(document.getElementById("tar_y").value)
	polar_cam_target[2] = Number(document.getElementById("tar_z").value)
	polar_view = LookAt(polar_cam_pos, polar_cam_target, [0, 1, 0]);

	polar_gl.clear(polar_gl.COLOR_BUFFER_BIT | polar_gl.DEPTH_BUFFER_BIT);

	if (!use_global) {
		DrawTransformBuffer(hierarchy_xform);
	}
	else {
		DrawTransformBuffer(global_xform);
	}
}

function DrawTransformBuffer(transform) {
	if (transform.debug) {
		var stop_it = "true";
	}

	var model = null;
	if (use_matrices) {
		model = GetWorldMatrix(transform);
	}
	else {
		model = GetWorldTransform(transform);
		model = ToMatrix(model);
	}

	// TODO: Note to self, WTF is going on here?!?!?!
	if (true || transform.debug) {
		/*
		var dcmp = AffineDecompose(model);

		var xfrm = {}
		xfrm.position = dcmp.Shoemake.t;// [-1, -2, 0];
		xfrm.rotation = dcmp.Shoemake.q;// [0.70711, 0, 0, 0.70711];
		xfrm.scale = dcmp.Shoemake.k;// [1,15,1]

		model = ToMatrix(xfrm);
		*/
	}
	

	DrawBuffer(polar_cube, model, transform.color, transform.debug)

	if (transform.children != null) {
		for (var i = 0; i < transform.children.length; ++i) {
			DrawTransformBuffer(transform.children[i]);
		}
	}
}

function M4_ToString(m, fixed) {
	if (typeof fixed == "undefined" || fixed == null) {
		fixed = default_fixed_count
	}
	var out = "[ ";
	for (var i = 0; i < 15; ++i) {
		out += m[i].toFixed(fixed) + ", ";
	}
	out += m[15].toFixed(fixed) + " ]";
	return out;
}

function M3_ToString(m, fixed) {
	if (typeof fixed == "undefined" || fixed == null) {
		fixed = default_fixed_count
	}

	var out = "[ ";
	for (var i = 0; i < 8; ++i) {
		out += m[i].toFixed(fixed) + ", ";
	}
	out += m[8].toFixed(fixed) + " ]"
	return out;
}

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
    uniform vec3 lightDirection;

    varying vec3 color; 

    void main() {
      vec3 norm = normalMatrix * normal;

      vec3 ambientLight = vec3(0.1, 0.1, 0.1);

      float directional = max(dot(norm, normalize(lightDirection)), 0.0);
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
      color: gl.getUniformLocation(program, "renderColor"),
      light: gl.getUniformLocation(program, "lightDirection")
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

function DrawBuffer(buffer, modelMatrix, color, debug_normal) {
	if (typeof debug_normal == "undefined" || debug_normal == null) {
		debug_normal = false;
	}
  var modelViewMatrix = M4_Mul_M4(polar_view, modelMatrix);

  var normalMatrix = [
  	modelViewMatrix[0], modelViewMatrix[1], modelViewMatrix[2],
  	modelViewMatrix[4], modelViewMatrix[5], modelViewMatrix[6],
  	modelViewMatrix[8], modelViewMatrix[9], modelViewMatrix[10]
  ]

  if (debug_normal) {
  	console.log("debug: " + M3_ToString(normalMatrix));
  }
  else if (M3_Determinant(normalMatrix) == 0.0) {
  	console.log("error: " + M3_ToString(normalMatrix));
  }

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
  polar_gl.uniform3f(polar_shader.uniforms.light, light_dir[0], light_dir[1], light_dir[2]);

  const offset = 0;
  polar_gl.drawArrays(polar_gl.TRIANGLES, offset, buffer.count)
}

function Dbg_Vec3_Diff_Vec3(v1, v2) {
	var d1 = Math.abs(v1[0] - v2[0])
	var d2 = Math.abs(v1[1] - v2[1])
	var d3 = Math.abs(v1[2] - v2[2])
	var d4 = Math.abs(v1[3] - v2[3])

	return (d1 > 0.0001 || d2 > 0.0001 || d3 > 0.0001 || d4 > 0.000);
}

function Dbg_Q_Diff_Q(v1, v2) {
	var d1 = Math.abs(v1[0] - v2[0])
	var d2 = Math.abs(v1[1] - v2[1])
	var d3 = Math.abs(v1[2] - v2[2])

	return (d1 > 0.0001 || d2 > 0.0001 || d3 > 0.0001);
}

function Dbg_Vec3_Mag(v) {
	const dot = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	if (dot == 0) {
		alert("Zero vector")
		return 0;
	}
	return Math.sqrt(dot);
}

function Dbg_V3_Mul_V3(v1, v2) {
	return [
		v1[0] * v2[0],
		v1[1] * v2[1],
		v1[2] * v2[2]
	]
}

function Dbg_M4_Inverse(mat) {
	var m = _map_matrix(mat);

	var det 
		= m._11 * m._22 * m._33 * m._44 + m._11 * m._23 * m._34 * m._42 + m._11 * m._24 * m._32 * m._43
		+ m._12 * m._21 * m._34 * m._43 + m._12 * m._23 * m._31 * m._44 + m._12 * m._24 * m._33 * m._41
		+ m._13 * m._21 * m._32 * m._44 + m._13 * m._22 * m._34 * m._41 + m._13 * m._24 * m._31 * m._42
		+ m._14 * m._21 * m._33 * m._42 + m._14 * m._22 * m._31 * m._43 + m._14 * m._23 * m._32 * m._41
		- m._11 * m._22 * m._34 * m._43 - m._11 * m._23 * m._32 * m._44 - m._11 * m._24 * m._33 * m._42
		- m._12 * m._21 * m._33 * m._44 - m._12 * m._23 * m._34 * m._41 - m._12 * m._24 * m._31 * m._43
		- m._13 * m._21 * m._34 * m._42 - m._13 * m._22 * m._31 * m._44 - m._13 * m._24 * m._32 * m._41
		- m._14 * m._21 * m._32 * m._43 - m._14 * m._22 * m._33 * m._41 - m._14 * m._23 * m._31 * m._42;

	if (det == 0.0) {
		alert("Determinant is 0!");
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]
	}
	var i_det = 1.0 / det;

	var result = [];
	result._11 = (m._22 * m._33 * m._44 + m._23 * m._34 * m._42 + m._24 * m._32 * m._43 - m._22 * m._34 * m._43 - m._23 * m._32 * m._44 - m._24 * m._33 * m._42) * i_det;
	result._12 = (m._12 * m._34 * m._43 + m._13 * m._32 * m._44 + m._14 * m._33 * m._42 - m._12 * m._33 * m._44 - m._13 * m._34 * m._42 - m._14 * m._32 * m._43) * i_det;
	result._13 = (m._12 * m._23 * m._44 + m._13 * m._24 * m._42 + m._14 * m._22 * m._43 - m._12 * m._24 * m._43 - m._13 * m._22 * m._44 - m._14 * m._23 * m._42) * i_det;
	result._14 = (m._12 * m._24 * m._33 + m._13 * m._22 * m._34 + m._14 * m._23 * m._32 - m._12 * m._23 * m._34 - m._13 * m._24 * m._32 - m._14 * m._22 * m._33) * i_det;
	result._21 = (m._21 * m._34 * m._43 + m._23 * m._31 * m._44 + m._24 * m._33 * m._41 - m._21 * m._33 * m._44 - m._23 * m._34 * m._41 - m._24 * m._31 * m._43) * i_det;
	result._22 = (m._11 * m._33 * m._44 + m._13 * m._34 * m._41 + m._14 * m._31 * m._43 - m._11 * m._34 * m._43 - m._13 * m._31 * m._44 - m._14 * m._33 * m._41) * i_det;
	result._23 = (m._11 * m._24 * m._43 + m._13 * m._21 * m._44 + m._14 * m._23 * m._41 - m._11 * m._23 * m._44 - m._13 * m._24 * m._41 - m._14 * m._21 * m._43) * i_det;
	result._24 = (m._11 * m._23 * m._34 + m._13 * m._24 * m._31 + m._14 * m._21 * m._33 - m._11 * m._24 * m._33 - m._13 * m._21 * m._34 - m._14 * m._23 * m._31) * i_det;
	result._31 = (m._21 * m._32 * m._44 + m._22 * m._34 * m._41 + m._24 * m._31 * m._42 - m._21 * m._34 * m._42 - m._22 * m._31 * m._44 - m._24 * m._32 * m._41) * i_det;
	result._32 = (m._11 * m._34 * m._42 + m._12 * m._31 * m._44 + m._14 * m._32 * m._41 - m._11 * m._32 * m._44 - m._12 * m._34 * m._41 - m._14 * m._31 * m._42) * i_det;
	result._33 = (m._11 * m._22 * m._44 + m._12 * m._24 * m._41 + m._14 * m._21 * m._42 - m._11 * m._24 * m._42 - m._12 * m._21 * m._44 - m._14 * m._22 * m._41) * i_det;
	result._34 = (m._11 * m._24 * m._32 + m._12 * m._21 * m._34 + m._14 * m._22 * m._31 - m._11 * m._22 * m._34 - m._12 * m._24 * m._31 - m._14 * m._21 * m._32) * i_det;
	result._41 = (m._21 * m._33 * m._42 + m._22 * m._31 * m._43 + m._23 * m._32 * m._41 - m._21 * m._32 * m._43 - m._22 * m._33 * m._41 - m._23 * m._31 * m._42) * i_det;
	result._42 = (m._11 * m._32 * m._43 + m._12 * m._33 * m._41 + m._13 * m._31 * m._42 - m._11 * m._33 * m._42 - m._12 * m._31 * m._43 - m._13 * m._32 * m._41) * i_det;
	result._43 = (m._11 * m._23 * m._42 + m._12 * m._21 * m._43 + m._13 * m._22 * m._41 - m._11 * m._22 * m._43 - m._12 * m._23 * m._41 - m._13 * m._21 * m._42) * i_det;
	result._44 = (m._11 * m._22 * m._33 + m._12 * m._23 * m._31 + m._13 * m._21 * m._32 - m._11 * m._23 * m._32 - m._12 * m._21 * m._33 - m._13 * m._22 * m._31) * i_det;

	return _unmap_matrix(result);
}

function _map_matrix(m) {
	var result = { }

	result._11 = m[0]
	result._12 = m[1]
	result._13 = m[2]
	result._14 = m[3]

	result._21 = m[4]
	result._22 = m[5]
	result._23 = m[6]
	result._24 = m[7]

	result._31 = m[8]
	result._32 = m[9]
	result._33 = m[10]
	result._34 = m[11]

	result._41 = m[12]
	result._42 = m[13]
	result._43 = m[14]
	result._44 = m[15]

	return result;
}

function _unmap_matrix(mat) {
	const result = [
		mat._11, mat._12, mat._13, mat._14,
		mat._21, mat._22, mat._23, mat._24,
		mat._31, mat._32, mat._33, mat._34,
		mat._41, mat._42, mat._43, mat._44
	];

	return result;
}

function Dbg_M4_Mul_P(m, v) {
	var p = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		v[0], v[1], v[2], 1
	]

	var res = M4_Mul_M4(m, p);

	return [res[12], res[13], res[14]];
}

function Dbg_Q_Mul_Q(a, b) {
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

function Dbg_M4_To_Q(m) {
	return decompose.M4ToQ(m);
}