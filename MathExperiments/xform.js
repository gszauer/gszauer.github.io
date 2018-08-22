function MakeTransform(position, rotation, scale, parent) {
	if (typeof position == 'undefined' || position == null || !Array.isArray(position) || position.length != 3) {
		position = [0, 0, 0]
	}
	if (typeof rotation == 'undefined' || rotation == null || !Array.isArray(rotation) || rotation.length != 4) {
		rotation = [1, 0, 0, 0]
	}
	if (typeof scale == 'undefined' || scale == null || !Array.isArray(scale) || scale.length != 3) {
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

/*function DetachXFormCopy(t) {
	var n_t = {
		position: [t.position[0], t.position[1], t.position[2]],
		rotation: [t.rotation[0], t.rotation[1], t.rotation[2], t.rotation[3]],
		scale: [t.scale[0], t.scale[1], t.scale[2]],
		parent: null,

		children: [],
		debug: t.debug
	}

	var position = GetGlobalPosition(t);
	var rotation = GetGlobalRotation(t);
	var matrixRotationAndScale = GetGlobalRotationAndScale(t);

	SetGlobalRotation (n_t, rotation);
	SetGlobalPosition (n_t, position);
	SetGlobalRotationAndScale (n_t, matrixRotationAndScale);

	return n_t;
}*/

function ToMatrix(transform) {
	return PartsToMatrix(transform.position, transform.rotation, transform.scale)
}

function PartsToMatrix(position, rotation, scale) {
	if (typeof position == 'undefined' || position == null || !Array.isArray(position) || position.length != 3) {
		position = [0, 0, 0]
	}
	if (typeof rotation == 'undefined' || rotation == null || !Array.isArray(rotation) || rotation.length != 4) {
		rotation = [1, 0, 0, 0]
	}
	if (typeof scale == 'undefined' || scale == null || !Array.isArray(scale) || scale.length != 3) {
		scale = [1,1,1]
	}
	
	var x = Q_Mul_V3(rotation, [1, 0, 0]);
	var y = Q_Mul_V3(rotation, [0, 1, 0]);
	var z = Q_Mul_V3(rotation, [0, 0, 1]);

	x = V3_Mul_F(x, scale[0])
	y = V3_Mul_F(y, scale[1])
	z = V3_Mul_F(z, scale[2])

	var t = position;

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

function GetWorldTransform(transform) {
	var worldTransform = {}
	worldTransform.position = [transform.position[0], transform.position[1], transform.position[2]]
	worldTransform.rotation = [transform.rotation[0], transform.rotation[1], transform.rotation[2], transform.rotation[3]]
	worldTransform.scale = [transform.scale[0], transform.scale[1], transform.scale[2]];
	worldTransform.parent = null;

    if (transform.parent != null) {
        var worldParent = GetWorldTransform(transform.parent);

        worldTransform.scale = [
        	worldParent.scale[0] * worldTransform.scale[0],
        	worldParent.scale[1] * worldTransform.scale[1],
        	worldParent.scale[2] * worldTransform.scale[2]
        ];
        worldTransform.rotation = Dbg_Q_Mul_Q(worldParent.rotation, worldTransform.rotation);

        worldTransform.position = [
        	worldParent.scale[0] * worldTransform.position[0],
        	worldParent.scale[1] * worldTransform.position[1],
        	worldParent.scale[2] * worldTransform.position[2],
        ]
        worldTransform.position = Q_Mul_V3(worldParent.rotation, worldTransform.position)
        worldTransform.position = [
        	worldParent.position[0] + worldTransform.position[0],
        	worldParent.position[1] + worldTransform.position[1],
        	worldParent.position[2] + worldTransform.position[2],
        ]
    }

    return worldTransform;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Matrix variant global getters / setters
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function Matrix_GetGlobalPosition(t) {
	var worldPos = [t.position[0], t.position[1], t.position[2]];

	var iter = t.parent
	while (iter != null) {
		worldPos[0] *= iter.scale[0]
		worldPos[1] *= iter.scale[1]
		worldPos[2] *= iter.scale[2]

		worldPos = Q_Mul_V3(iter.rotation, worldPos);

		worldPos[0] += iter.position[0]
		worldPos[1] += iter.position[1]
		worldPos[2] += iter.position[2]
		
		iter = iter.parent
	}

	return worldPos;
}

function Matrix_GetGlobalRotation(t) {
	var rotation = [t.rotation[0], t.rotation[1], t.rotation[2], t.rotation[3]]

	var iterator = t.parent
	while (iterator != null) {
		rotation = Dbg_Q_Mul_Q(iterator.rotation, rotation);
		iterator = iterator.parent
	}

	return rotation;
}

function Matrix_GetGlobalRotationAndScale(t) {
	var scale = [ // Scale matrix
		t.scale[0], 0, 0,
		0, t.scale[1], 0,
		0, 0, t.scale[2]
	]

	var x = Q_Mul_V3(t.rotation, [1, 0, 0]);
	var y = Q_Mul_V3(t.rotation, [0, 1, 0]);
	var z = Q_Mul_V3(t.rotation, [0, 0, 1]);

	var rotation = [ // Rotation matrix
		x[0], x[1], x[2],
		y[0], y[1], y[2],
		z[0], z[1], z[2]
	]

	var localMat =  M3_Mul_M3(rotation, scale);
	if (t.parent == null) {
		return localMat
	}

	var parentRotAndScale = Matrix_GetGlobalRotationAndScale(t.parent)
	return M3_Mul_M3(parentRotAndScale, localMat)
}

function Matrix_SetGlobalRotationAndScale(t, scaleMat) {
	t.scale = [1, 1, 1]

	var inverseRS = Matrix_GetGlobalRotationAndScale(t);
	inverseRS = M3_Inverse(inverseRS);
	inverseRS = M3_Mul_M3(inverseRS, scaleMat);
	
	t.scale[0] = inverseRS[0];
	t.scale[1] = inverseRS[4];
	t.scale[2] = inverseRS[8];
}

function Matrix_InverseTransformPoint(t, point) {
	var localPosition = [point[0], point[1], point[2]]
	if (t.parent != null) {
		localPosition = IMatrix_nverseTransformPoint(t.parent, localPosition)
	}

	localPosition[0] -= t.position[0]
	localPosition[1] -= t.position[1]
	localPosition[2] -= t.position[2]

	var invRot = [
		t.rotation[0],
		-t.rotation[1],
		-t.rotation[2],
		-t.rotation[3]
	]

	localPosition = Q_Mul_V3(invRot, localPosition);

	var invScale = [
		1.0 / t.scale[0],
		1.0 / t.scale[1],
		1.0 / t.scale[2],
	]

	localPosition[0] *= invScale[0]
	localPosition[1] *= invScale[1]
	localPosition[2] *= invScale[2]

	return localPosition
}

function Matrix_SetGlobalPosition(t, vec) {
	var pos = [vec[0], vec[1], vec[2]];

	var iter = t.parent;
	while (iter != null) {
		pos = Matrix_InverseTransformPoint(iter, pos);
		iter = iter.parent;
	}

	t.position = [pos[0], pos[1], pos[2]]
}

function Matrix_SetGlobalRotation(t, quat)  {
	if (t.parent == null) {
		t.rotation[0] = quat[0]
		t.rotation[1] = quat[1]
		t.rotation[2] = quat[2]
		t.rotation[3] = quat[3]
		return
	}

	var parentGlobal = Matrix_GetGlobalRotation(t.parent)
	var parentGlobalInv = [
		parentGlobal[0],
		-parentGlobal[1],
		-parentGlobal[2],
		-parentGlobal[3]
	]

	t.rotation = Dbg_Q_Mul_Q(parentGlobalInv, quat);
}

function Matrix_SetGlobalScale(t, vec) {
	var rotation = Matrix_GetGlobalRotation(t)

	var x = V3_Mul_F(Q_Mul_V3(rotation, [1, 0, 0]), vec[0]);
	var y = V3_Mul_F(Q_Mul_V3(rotation, [0, 1, 0]), vec[1]);
	var z = V3_Mul_F(Q_Mul_V3(rotation, [0, 0, 1]), vec[2]);
	var matrixRotationAndScale = [
		x[0], x[1], x[2],
		y[0], y[1], y[2],
		z[0], z[1], z[2]
	]
	Matrix_SetGlobalRotationAndScale (t, matrixRotationAndScale);
}

function Matrix_SetGlobalTRS(t, position, rotation, scale) {
	if (t.parent == null) {
		t.position = position;
		t.rotation = rotation;
		t.scale = scale;
		return;
	}


	Matrix_SetGlobalRotation (t, rotation);
	Matrix_SetGlobalPosition (t, position);
	Matrix_SetGlobalScale(t, scale);

	var debug = "break";
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Transform variant global getters / setters
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function Transform_GetGlobalRotation (t) {
	const worldT = GetWorldTransform(t);
	return worldT.rotation;
}

function Transform_GetGlobalPosition (t) {
	const worldT = GetWorldTransform(t);
	return worldT.position;

}

function Transform_GetGlobalScale(t) {
	const worldT = GetWorldTransform(t);
	return worldT.scale;
}

function Transform_Local_Inverse(t) { // Returns a new copy of the transform with no parent
    var invRotation = [
    	 t.rotation[0],
    	-t.rotation[1],
    	-t.rotation[2],
    	-t.rotation[3]
    ]

    var invScale = [0, 0, 0]
    if (t.scale[0] != 0) { // Do epsilon comparison here
        invScale[0] = 1.0 / t.scale[0]
    }
    if (t.scale[1] != 0) { // Do epsilon comparison here
        invScale[1] = 1.0 / t.scale[1]
    }
    if (t.scale[2] != 0) { // Do epsilon comparison here
        invScale[2] = 1.0 / t.scale[2]
    }

    // First: Invert position
    var invTranslation = [-t.position[0], -t.position[1], -t.position[2]]
    // Second: Apply scale
    invTranslation[0] = invTranslation[0] * invScale[0]
    invTranslation[1] = invTranslation[1] * invScale[1]
    invTranslation[2] = invTranslation[2] * invScale[2]
    // Last: Apply inv rotation
    invTranslation = Q_Mul_V3(invRotation, invTranslation);

    return MakeTransform(invTranslation, invRotation, invScale, null);
}

function Transform_Combine(a, b) {
    var scale = [
    	a.scale[0] * b.scale[0],
    	a.scale[1] * b.scale[1],
    	a.scale[2] * b.scale[2]
    ]    

    var rotation = Dbg_Q_Mul_Q(a.rotation, b.rotation);

    var position = [
		a.scale[0] * b.position[0],
    	a.scale[1] * b.position[1],
    	a.scale[2] * b.position[2]
    ]
    position = Q_Mul_V3(a.rotation, position);
    position =  [
    	a.position[0] + position[0],
    	a.position[1] + position[1],
    	a.position[2] + position[2]
    ]

    return MakeTransform(position, rotation, scale, null);
}

function Transform_SetGlobalRotation (t, rotation) {
	var worldXForm = GetWorldTransform(t);
	Transform_SetGlobalTRS(t, worldXForm.position, rotation, worldXForm.scale);
}

function Transform_SetGlobalPosition (t, position) {
	var worldXForm = GetWorldTransform(t);
	Transform_SetGlobalTRS(t, position, worldXForm.rotation, worldXForm.scale);
}

function Transform_SetGlobalScale(t, scale) {
	var worldXForm = GetWorldTransform(t);
	Transform_SetGlobalTRS(t, worldXForm.position, worldXForm.rotation, scale);
}

function Transform_SetGlobalTRS(t, position, rotation, scale) {
	if (t.parent == null) {
		t.rotation = [ rotation[0], rotation[1], rotation[2], rotation[3] ]
		t.position = [ position[0], position[1], position[2] ]
		t.scale = [ scale[0], scale[1], scale[2] ]
		return;
	}

	var invParent = Transform_Local_Inverse(GetWorldTransform(t.parent));
	var worldXForm = {
		position: position,
		rotation: rotation,
		scale: scale,
		parent: null
	}

	worldXForm = Transform_Combine(invParent, worldXForm);

	t.position = worldXForm.position;
	t.rotation = worldXForm.rotation;
	t.scale = worldXForm.scale;
}