'use strict';

/***********************************************************************************
************************************ MIT License ***********************************
************************************************************************************
Copyright 2018 Gabor Szauer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***********************************************************************************/

// Javascript sample implementation for my transform tutorial at:
// http://gabormakesgames.com/blog_transforms_intro.html

/* Depends on:
	quaternion.js
	vector3.js
*/

// TODO: Finish documentation
//		 https://github.com/EpicGames/UnrealEngine/blob/b70f31f6645d764bcb55829228918a6e3b571e0b/Engine/Source/Runtime/Core/Public/Math/TransformNonVectorized.h

var TS_EnableAsserts = true;
function TS_AssertHelper(condition, message) {
	if (!TS_EnableAsserts) {
		return;
	}

	if (!condition) {
		message = message || "Assertion failed";
		console.log("Assertion: " + message);

		if( typeof TS_AssertHelper.counter == 'undefined' ) {
			TS_AssertHelper.counter = 0;
		}
		if (TS_AssertHelper.counter < 5) {
			alert(message);
		}
		TS_AssertHelper.counter++;

		
		if (typeof Error !== "undefined") {
			throw new Error(message);
		}
		throw message;
	}
}

function TS_AssertIsVector3(variable, message) {
	if (!TS_EnableAsserts) {
		return;
	}
	V3_AssertIsVector3(variable, message);
}

function TS_AssertIsQuaternion(variable, message)  {
	if (!TS_EnableAsserts) {
		return;
	}
	Q_AssertIsQuaternion(variable, message);
}

function TS_AssertIsTransform(variable, message) {
	if (!TS_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (typeof variable == "undefined") {
		TS_AssertHelper(false, "TS_AssertIsTransform, argument is undefined\n" + message);
		return;
	}

	if (variable != null) {
		if (typeof variable.position == "undefined") {
			TS_AssertHelper(false, "TS_AssertIsTransform, variable.position was undefined\n" + message);
		}
		else {
			TS_AssertIsVector3(variable.position, "TS_AssertIsTransform, Expecting local pos to be vec3\n" + message);
		}

		if (typeof variable.rotation == "undefined") {
			TS_AssertHelper(false, "TS_AssertIsTransform, variable.rotation was undefined\n" + message);
		}
		else {
			TS_AssertIsQuaternion(variable.rotation, "TS_AssertIsTransform, Expecting local rot to be quat\n" + message);
		}

		if (typeof variable.scale == "undefined") {
			TS_AssertHelper(false, "TS_AssertIsTransform, variable.scale was undefined\n" + message);
		}
		else {
			TS_AssertIsVector3(variable.scale, "TS_AssertIsTransform, Expecting local scale to be vec3\n" + message);
		}
	}
	else {
		TS_AssertHelper(false, "TS_AssertIsTransform, argument is null\n" + message);
	}
}

function TS_New(in_position, in_rotation, in_scale) {
	if (typeof in_position == "undefined" || in_position == null) {
		in_position = [0,0,0]
	}
	if (typeof in_rotation == "undefined" || in_rotation == null) {
		in_rotation = [0,0,0,1];
	}
	if (typeof in_scale == "undefined" || in_scale == null) {
		in_scale = [1,1,1]
	}

	TS_AssertIsVector3(in_position, "TS_New: expecting position to be a vec3")
	TS_AssertIsQuaternion(in_rotation, "TS_New: expecting rotation to be a quat")
	TS_AssertIsVector3(in_scale, "TS_New: expecting scale to be a vec3")

	const result = { 
		position: [
			in_position[0],
			in_position[1],
			in_position[2]
		],
		rotation: [
			in_rotation[0],
			in_rotation[1],
			in_rotation[2],
			in_rotation[3]
		],
		scale: [
			in_scale[0],
			in_scale[1],
			in_scale[2]
		]
	}

	return result;
}

function TS_Copy(transform) {
	TS_AssertIsTransform(transform, "TS_Copy: expecting input to be a transform");

	const result = {
		position: [
			transform.position[0],
			transform.position[1],
			transform.position[2]
		],
		rotation: [
			transform.rotation[0],
			transform.rotation[1],
			transform.rotation[2],
			transform.rotation[3]
		],
		scale: [
			transform.scale[0],
			transform.scale[1],
			transform.scale[2]
		]
	}

	return result;
}

function TS_Equals(t1, t2, optionalEpsilonValue) {
	TS_AssertIsTransform(t1, "TS_Equals: expecting t1 to be transform");
	TS_AssertIsTransform(t2, "TS_Equals: expecting t2 to be transform");

	const p = V3_Equals(t1.position, t2.position, optionalEpsilonValue);
	const s = V3_Equals(t1.scale, t2.scale, optionalEpsilonValue);
	const r = Q_Equals(t1.rotation, t2.rotation, optionalEpsilonValue);

	const result = p && s && r;

	/*if (!result) {
		if (!p) {
			const diff = V3_Sub(t1.position, t2.position);
			console.log("left position: " + V3_To_Str(t1.position));
			console.log("right position: " + V3_To_Str(t2.position));
			console.log("position diff: " + V3_To_Str(diff));
		}
		if (!s) {
			const diff = V3_Sub(t1.scale, t2.scale);
			console.log("left scale: " + V3_To_Str(t1.scale));
			console.log("right scale: " + V3_To_Str(t2.scale));
			console.log("scale diff: " + V3_To_Str(diff));
		}
		if (!r) {
			console.log("left quat: " + Q_To_Str(t1.rotation));
			console.log("right quat: " + Q_To_Str(t2.rotation));
			console.log("left angle / axis: " + Q_GetAngleDegrees(t1.rotation) + ", " + V3_To_Str(Q_GetAxis(t1.rotation)));
			console.log("right angle / axis: " + Q_GetAngleDegrees(t2.rotation) + ", " + V3_To_Str(Q_GetAxis(t2.rotation)));
		}
	}*/

	return result;
}

function TS_Same(t1, t2, optionalEpsilonValue) {
	TS_AssertIsTransform(t1, "TS_Same: expecting t1 to be transform");
	TS_AssertIsTransform(t2, "TS_Same: expecting t2 to be transform");

	const p = V3_Equals(t1.position, t2.position, optionalEpsilonValue);
	const s = V3_Equals(t1.scale, t2.scale, optionalEpsilonValue);
	const r = Q_Same(t1.rotation, t2.rotation, optionalEpsilonValue);

	const result = p && s && r;

	return result;
}

function TS_GetPosition(transform) { // Returns a copy
	TS_AssertIsTransform(transform, "TS_GetPosition: expecting argument to be transform");
	return [
		transform.position[0],
		transform.position[1],
		transform.position[2]
	]
}

function TS_GetRotation(transform) {  // Returns a copy
	TS_AssertIsTransform(transform, "TS_GetRotation: expecting argument to be transform");
	return [
		transform.rotation[0],
		transform.rotation[1],
		transform.rotation[2],
		transform.rotation[3]
	]
}

function TS_GetScale(transform) { // Returns a copy
	TS_AssertIsTransform(transform, "TS_GetScale: expecting argument to be transform");
	return [
		transform.scale[0],
		transform.scale[1],
		transform.scale[2]
	]
}

function TS_SetPosition(transform, in_position) { 
	TS_AssertIsTransform(transform, "TS_SetPosition: expecting argument to be transform");
	TS_AssertIsVector3(in_position, "TS_SetPosition: expecting argument to be vector3");

	transform.position = [
		in_position[0],
		in_position[1],
		in_position[2]
	]
}

function TS_SetRotation(transform, in_rotation) { 
	TS_AssertIsTransform(transform, "TS_SetRotation: expecting argument to be transform");
	TS_AssertIsQuaternion(in_rotation, "TS_SetRotation: expecting argument to be quaternion");

	transform.rotation = [
		in_rotation[0],
		in_rotation[1],
		in_rotation[2],
		in_rotation[3]
	]
}

function TS_SetScale(transform, in_scale) { 
	TS_AssertIsTransform(transform, "TS_SetScale: expecting argument to be transform");
	TS_AssertIsVector3(in_scale, "TS_SetScale: expecting argument to be vector3");

	transform.scale = [
		in_scale[0],
		in_scale[1],
		in_scale[2]
	]
}

// Order matters when composing transforms : Child * Parent will yield a transform that logically first applies Child then Parent to any subsequent transformation.
// child transform is done first, then parent
// multiplication order is: point * child * parent -> TransformPoint(Cobine(child, parent), point)
// Since we don't have proper overloading...
function TS_Combine(child, parent) { // Reverse order to keep consistent with matrix / quat multiply 
	TS_AssertIsTransform(parent, "TS_Combine: expecting argument to be transform");
	TS_AssertIsTransform(child, "TS_Combine: expecting argument to be transform");

	const scale = V3_Mul(parent.scale, child.scale);
	//parent * child.... Remember quaternions multiply in reverse order!
	const rotation = Q_Mul(child.rotation, parent.rotation); 
	const position = V3_Add(parent.position, 
		Q_Rotate(parent.rotation, V3_Mul(parent.scale, child.position))
	)

	return TS_New(position, rotation, scale);
}

// TS_GetInverse(TS_Combine(ts1, ts2)) == TS_Combine(TS_GetInverse(ts2), TS_GetInverse(ts1))
// TS_TransformPoint(TS_GetInverse(ts3), TS_TransformPoint(ts3, [0,0,1])) == [0,0,1]
function TS_GetInverse(transform) {
	TS_AssertIsTransform(transform, "TS_GetInverse: expecting argument to be transform");

	const invRotation = Q_Inverse(transform.rotation);

	const invScale = [
		(transform.scale[0] != 0.0)? 1.0 / transform.scale[0] : 0,
		(transform.scale[1] != 0.0)? 1.0 / transform.scale[1] : 0,
		(transform.scale[2] != 0.0)? 1.0 / transform.scale[2] : 0,
	];

	const invPosition = V3_Scale(transform.position, -1.0)

	const invTranslation = Q_Rotate(invRotation, V3_Mul(invScale, invPosition));

	return TS_New(
		invTranslation,
		invRotation,
		invScale,
		transform.parent
	);
}

function TS_TransformPoint(transform, point) {
	TS_AssertIsTransform(transform, "TS_TransformPoint: expecting argument to be transform");
	TS_AssertIsVector3(point, "TS_TransformPoint: expecting point to be a vec3")

	return V3_Add(Q_Rotate(transform.rotation, V3_Mul(point, transform.scale)), transform.position);
}

function TS_UnTransformPoint(transform, point) {
	TS_AssertIsTransform(transform, "TS_TransformPoint: expecting argument to be transform");
	TS_AssertIsVector3(point, "TS_TransformPoint: expecting point to be a vec3")

	const invTransform = TS_GetInverse(transform);

	return V3_Add(Q_Rotate(invTransform.rotation, V3_Mul(point, invTransform.scale)), invTransform.position);
}

function TS_TransformOrientation(transform, orientation) {
	TS_AssertIsTransform(transform, "TS_TransformOrientation: expecting argument to be transform");
	TS_AssertIsVector3(orientation, "TS_TransformOrientation: expecting orientation to be a vec3")

	return Q_Rotate(transform.rotation, V3_Mul(orientation, transform.scale));
}

function TS_UnTransformOrientation(transform, orientation) {
	TS_AssertIsTransform(transform, "TS_UnTransformOrientation: expecting argument to be transform");
	TS_AssertIsVector3(orientation, "TS_UnTransformOrientation: expecting orientation to be a vec3")

	const invTransform = TS_GetInverse(transform);

	return Q_Rotate(invTransform.rotation, V3_Mul(orientation, invTransform.scale));
}

function TS_TransformRotation(transform, rotation) {
	TS_AssertIsTransform(transform, "TS_TransformRotation: expecting argument to be transform");
	TS_AssertIsQuaternion(rotation, "TS_TransformRotation: expecting rotation to be a quat")

	return Q_Mul(rotation, transform.rotation);
}

function TS_UnTransformRotation(transform, rotation) {
	TS_AssertIsTransform(transform, "TS_UnTransformRotation: expecting argument to be transform");
	TS_AssertIsQuaternion(rotation, "TS_UnTransformRotation: expecting rotation to be a quat")

	return Q_Mul(rotation, Q_Inverse(transform.rotation));
}

function TS_ToMatrix4(transform) {
	TS_AssertIsTransform(transform, "TS_ToMatrix, expected argument to be a transform");

	const x = V3_Scale(Q_Rotate(transform.rotation, [1, 0, 0]), transform.scale[0])
	const y = V3_Scale(Q_Rotate(transform.rotation, [0, 1, 0]), transform.scale[1])
	const z = V3_Scale(Q_Rotate(transform.rotation, [0, 0, 1]), transform.scale[2])
	const t = transform.position;

	return [
		x[0], x[1], x[2], 0,
		y[0], y[1], y[2], 0,
		z[0], z[1], z[2], 0,
		t[0], t[1], t[2], 1
	]
}

function TS_ToMatrix3(transform) {
	TS_AssertIsTransform(transform, "TS_ToMatrix, expected argument to be a transform");

	const x = V3_Scale(Q_Rotate(transform.rotation, [1, 0, 0]), transform.scale[0])
	const y = V3_Scale(Q_Rotate(transform.rotation, [0, 1, 0]), transform.scale[1])
	const z = V3_Scale(Q_Rotate(transform.rotation, [0, 0, 1]), transform.scale[2])

	return [
		x[0], x[1], x[2], 
		y[0], y[1], y[2], 
		z[0], z[1], z[2]
	]
}

function TS_To_String(transform) {
	TS_AssertIsTransform(transform, "TS_ToMatrix, expected argument to be a transform");
	const result = "position: " + V3_To_Str(transform.position) + "\n"
				 + "rotation: " + Q_To_Str(transform.rotation) + "\n"
				 + "scale: " + V3_To_Str(transform.scale); 
	return result;
}