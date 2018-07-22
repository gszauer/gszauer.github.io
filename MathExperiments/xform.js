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

		children: [],
		debug: false
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
		worldMatrix = M4_Mul_M4(parentMatrix, localMatrix); // * vertex
		// Vertex first, child next, parent last
	}

	return worldMatrix;
}

function SetGlobalScale(t, scale) {
	t.scale[0] = scale[0];
	t.scale[1] = scale[1];
	t.scale[2] = scale[2];

	if (t.parent == null) {
		return t;
	}

	var parentWorldScale = [1, 1, 1]
	var iter = t.parent;

	while (iter != null) {
		parentWorldScale[0] *= iter.scale[0]
		parentWorldScale[1] *= iter.scale[1]
		parentWorldScale[2] *= iter.scale[2]

		iter = iter.parent;
	}

	var invParentWorldScale = [
		1.0 / parentWorldScale[0],
		1.0 / parentWorldScale[1],
		1.0 / parentWorldScale[2]
	]

	// Multiply world scale by the reciprocal of the parents scale
	t.scale[0] = scale[0] * invParentWorldScale[0]
	t.scale[1] = scale[1] * invParentWorldScale[1]
	t.scale[2] = scale[2] * invParentWorldScale[2]
}

function SetGlobalRotation(t, rotation) {
	t.rotation[0] = rotation[0]
	t.rotation[1] = rotation[1]
	t.rotation[2] = rotation[2]
	t.rotation[3] = rotation[3]

	if (t.parent == null) {
		return t;
	}

	var parentRotation = [1, 0, 0, 0]
	var iter = t.parent

	while (iter != null) {
		parentRotation = Dbg_Q_Mul_Q(parentRotation, iter.rotation)
		iter = iter.parent
	}

	var invParentRotation = [
		parentRotation[0],
		parentRotation[1] * -1.0,
		parentRotation[2] * -1.0,
		parentRotation[3] * -1.0
	]
	
	t.rotation = Dbg_Q_Mul_Q(invParentRotation, rotation)
}

function SetGlobalPosition(t, position) {
	t.position[0] = position[0]
	t.position[1] = position[1]
	t.position[2] = position[2]

	if (t.parent == null) {
		return t;
	}

	var parentWorld = GetWorldMatrix(t.parent);
	var invParent = Dbg_M4_Inverse(parentWorld);

	t.position = Dbg_M4_Mul_P(invParent, position) 
}

function SetGlobalTRS(t, position, rotation, scale) {
	SetGlobalPosition(t, position);
	SetGlobalRotation(t, rotation);
	SetGlobalScale(t, scale);
}

function _SetGlobalTRS(t, position, rotation, scale) {
	t.position = position;
	t.rotation = rotation;
	t.scale = scale;

	if (t.parent == null) {
		return t;
	}

	var parentWorld = GetWorldMatrix(t.parent);
	var invParent = Dbg_M4_Inverse(parentWorld);

	var local = M4_Mul_M4(invParent, ToMatrix(t));
	var decomp = AffineDecompose(local).Shoemake;

	///////////////////////////////////////////////////////////////////
	// Scale
	///////////////////////////////////////////////////////////////////
	// Use this for global scale!
	/* var parentWorldScale = [
		Dbg_Vec3_Mag([parentWorld[0], parentWorld[1], parentWorld[2]]),
		Dbg_Vec3_Mag([parentWorld[4], parentWorld[5], parentWorld[6]]),
		Dbg_Vec3_Mag([parentWorld[8], parentWorld[9], parentWorld[10]])
	]*/
	// this works for scale 
	var parentWorldScale = [1, 1, 1]
	var iter = t.parent;
	while (iter != null) {
		parentWorldScale[0] *= iter.scale[0]
		parentWorldScale[1] *= iter.scale[1]
		parentWorldScale[2] *= iter.scale[2]

		iter = iter.parent;
	}
	// Multiply world scale by the reciprocal of the parents scale
	scale[0] = t.scale[0] / parentWorldScale[0]
	scale[1] = t.scale[1] / parentWorldScale[1]
	scale[2] = t.scale[2] / parentWorldScale[2]

	///////////////////////////////////////////////////////////////////
	// Rotation
	///////////////////////////////////////////////////////////////////
	var parentRotation = [1, 0, 0, 0]
	iter = t.parent
	while (iter != null) {
		parentRotation = Dbg_Q_Mul_Q(parentRotation, iter.rotation)
		iter = iter.parent
	}
	// Inverse parent rotation: conjugate
	parentRotation[1] *= -1
	parentRotation[2] *= -1
	parentRotation[3] *= -1
	rotation = Dbg_Q_Mul_Q(parentRotation, t.rotation)

	///////////////////////////////////////////////////////////////////
	// Position
	///////////////////////////////////////////////////////////////////
	// This works
	position = Dbg_M4_Mul_P(invParent, t.position) 

	///////////////////////////////////////////////////////////////////
	// Debug
	///////////////////////////////////////////////////////////////////
	if (Dbg_Vec3_Diff_Vec3(position, decomp.t)) {
		console.log("position error");
	}
	if (Dbg_Vec3_Diff_Vec3(scale, decomp.k)) {
		console.log("scale error");
	}
	if (Dbg_Q_Diff_Q(rotation, decomp.q)) {
		console.log("rotation error");
	}
	if (Dbg_Vec3_Diff_Vec3(position, decomp.t) || Dbg_Vec3_Diff_Vec3(scale, decomp.k) || Dbg_Q_Diff_Q(rotation, decomp.q)) {
		console.log("pos: " + V3_ToString(position) + " / " + V3_ToString(decomp.t))
		console.log("rot: " + Q_ToString(rotation) + " / " + Q_ToString(decomp.q))
		console.log("scl: " + V3_ToString(scale) + " / " + V3_ToString(decomp.k))
	}

	t.position = position;//decomp.t;//Dbg_M4_Mul_P(invParent, position)
	t.rotation = rotation;//decomp.q;//Dbg_Q_Mul_Q(invParentRot, rotation)
	t.scale = scale;//decomp.k;//Dbg_V3_Mul_V3(invParentScl, scale);

	return t;
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
	return affine.M4ToQ(m);
}