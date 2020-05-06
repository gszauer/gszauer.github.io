'use strict';

/***********************************************************************************
************************************ MIT License ***********************************
************************************************************************************
Copyright 2018 Gabor Szauer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***********************************************************************************/

// Javascript sample implementation for my quaternion tutorial at:
// http://gabormakesgames.com/blog_quats_intro.html

/* Quaternions:
	Quaternions are represented by a 4 element float array.
	Quaternions are stored in <x, y, z, w> order.

Quaternions left multiply, both quaternions and vectors. 
That is, if we have two quaternions:
A - rotate 90 degrees on X axis
B - rotate 90 degrees on Y axis
If we want to rotate on the X axis first and the Y axis second, the proper multiplication order would be:
R = B * A

Vectors and quaternions also left multiply (much like vectors and matrices)
So, if we have a vector V and wanted to rotate it by Quaternion R, the order would be:
V' = V * r

API Documentation conventions
	*  = optional paramater
	|  = overloaded paramater
	-> = function that calls the indented function

Public API functions:
	Quaternion Q_Identity()
	Quaternion Q_Pure(Vector3 input)
	Quaternion Q_Copy(Quaternion input)
	float Q_GetAngleDegrees(Quaternion input)
	float Q_GetAngleRadians(Quaternion input)
	Vector3 Q_GetAxis(Quaternion input)
	Quaternion Q_AngleAxis(float degrees, Vector3 axis)
	Quaternion Q_FromTo(Vector3 from, Vector3 to)
	Quaternion Q_LookAtPoint(Vector3 source, Vector3 target, Vector3* up)
	Quaternion Q_LookAtDirection(Vector3 forward, Vector3* up)
	Quaternion Q_Conjugate(Quaternion input)
	Quaternion Q_Inverse(Quaternion input)
	Quaternion Q_Add(Quaternion left, Quaternion right)
	Quaternion Q_Sub(Quaternion left, Quaternion right)
	Quaternion Q_Scale(Quaternion quat, float scalar)
	Quaternion Q_Negate(Quaternion quat)
	bool Q_Equals(Quaternion left, Quaternion right, float* epsilon)
	bool Q_Same(Quaternion left, Quaternion right, float* epsilon)
	float Q_Dot(Quaternion left, Quaternion right)
	float Q_MagnitudeSq(Quaternion quat)
	float Q_Magnitude(Quaternion quat)
	Quaternion Q_Normalized(Quaternion quat)
	Quaternion Q_Mul(Quaternion left, Quaternion right)
	Vector3 V3_Mul_Q(Vector3 vec, Quaternion quat)
	Vector3 Q_Rotate(Quaternion quat, Vector3 vec)
	Quaternion Q_Nlerp(Quaternion a, Quaternion b, float t, bool* shortestPath)
	Quaternion Q_Mix2(Quaternion a, float at, Quaternion b, float bt, bool* normalizeRange);
	Quaternion Q_Mix3(Quaternion a, float at, Quaternion b, float bt, Quaternion c, float ct, bool* normalizeRange);
	Quaternion Q_Mix4(Quaternion a, float at, Quaternion b, float bt, Quaternion c, float ct, Quaternion d, float dt, bool* normalizeRange);
	Quaternion Q_Slerp(Quaternion a, Quaternion b, float t, bool* shortestPath)
	Matrix3 Q_To_M3(Quaternion input)
	Matrix4 Q_To_M4(Quaternion input)
	string Q_To_Str(Quaternion input, float* numberOfDecimals)
*/

//////////////////////////////////////////////////////////////////////////////////
// Assertions, helpers and error checking
//////////////////////////////////////////////////////////////////////////////////

// 1.e-4f = 0.0001
const Q_Epsilon = 0.0001;
const Q_DegToRad = Math.PI / 180.0;
const Q_RadToDeg = 180.0 / Math.PI;
var Q_EnableAsserts = true;

function Q_AssertHelper(condition, message) {
	if (!Q_EnableAsserts) {
		return;
	}

	if (!condition) {
		message = message || "Assertion failed";
		console.log("Assertion: " + message);

		if( typeof Q_AssertHelper.counter == 'undefined' ) {
			Q_AssertHelper.counter = 0;
		}
		if (Q_AssertHelper.counter < 5) {
			alert(message);
		}
		Q_AssertHelper.counter++;

		
		if (typeof Error !== "undefined") {
			throw new Error(message);
		}
		throw message;
	}
}

function Q_AssertIsQuaternion(variable, message) {
	if (!Q_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (typeof variable == "undefined") {
		Q_AssertHelper(false, "Q_AssertIsQuaternion, argument is undefined\n" + message);
		return;
	}

	if (variable != null) {
		if (variable.constructor === Array) {
			if (variable.length == 4) {
				// All good!
			}
			else {
				Q_AssertHelper(false, "Q_AssertIsQuaternion, argument length is not 3\n" + message);
			}
		}
		else {
			Q_AssertHelper(false, "Q_AssertIsQuaternion, argument is not an array\n" + message);
		}
	}
	else {
		Q_AssertHelper(false, "Q_AssertIsQuaternion, argument is null\n" + message);
	}
}

function Q_AssertIsFloat(variable, message) {
	if (!Q_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (variable == null) {
		Q_AssertHelper(false, "Q_AssertIsFloat: argument is null \n" + message);
	}
	else if (typeof variable != "number") {
		Q_AssertHelper(false, "Q_AssertIsFloat: was not given a number \n" + message);
	}
}

function Q_AssertIsVec3(variable, message) {
	if (!Q_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (typeof variable == "undefined") {
		Q_AssertHelper(false, "Q_AssertIsVec3, argument is undefined\n" + message);
		return;
	}

	if (variable != null) {
		if (variable.constructor === Array) {
			if (variable.length == 3) {
				// All good!
			}
			else {
				Q_AssertHelper(false, "Q_AssertIsVec3, argument length is not 3\n" + message);
			}
		}
		else {
			Q_AssertHelper(false, "Q_AssertIsVec3, argument is not an array\n" + message);
		}
	}
	else {
		Q_AssertHelper(false, "Q_AssertIsVec3, argument is null\n" + message);
	}
}

function Q_AssertIsBool(variable, message) {
	if (!Q_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (variable == null) {
		Q_AssertHelper(false, "Q_AssertIsBool: argument is null \n" + message);
	}
	else if (typeof variable != "boolean") {
		Q_AssertHelper(false, "Q_AssertIsBool: argument is not a boolean \n" + message);
	}
}

function Q_AssertIsNormalized(variable, message) {
	if (!Q_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (typeof variable == "undefined") {
		Q_AssertHelper(false, "Q_AssertIsNormalized, argument is undefined\n" + message);
		return;
	}

	if (variable != null) {
		if (variable.constructor === Array) {
			if (variable.length == 4) {
				// We have a quat, but is it normalized?!?!
				const magSq = variable[0] * variable[0] + variable[1] * variable[1] + variable[2] * variable[2] + variable[3] * variable[3];
				if (Math.abs(1.0 - magSq) > V3_Epsilon) {
					Q_AssertHelper(false, "Q_AssertIsNormalized, argument magnitude is not 1\n" + message);
				}
				else {
					// All good!
				}
			}
			else {
				Q_AssertHelper(false, "Q_AssertIsNormalized, argument length is not 3\n" + message);
			}
		}
		else {
			Q_AssertHelper(false, "Q_AssertIsNormalized, argument is not an array\n" + message);
		}
	}
	else {
		Q_AssertHelper(false, "Q_AssertIsNormalized, argument is null\n" + message);
	}
}

function Q_IsAbout1(someNumber) {
	return someNumber > (1.0 - Q_Epsilon) && someNumber < (1.0 + Q_Epsilon);
}

//////////////////////////////////////////////////////////////////////////////////
// Creating quaternions
//////////////////////////////////////////////////////////////////////////////////

function Q_Identity() {
	return [0, 0, 0, 1];
}

function Q_Pure(inVector3) {
	Q_AssertIsVec3(inVector3, "Q_Pure, expected vector 3");

	return [inVector3[0], inVector3[1], inVector3[2], 0]
}

function Q_Copy(inQuat) {
	Q_AssertIsQuaternion(inQuat, "Q_Copy, expected quaternion");

	return [
		inQuat[0],
		inQuat[1],
		inQuat[2],
		inQuat[3]
	];
}


function Q_GetAngleDegrees(q) {
	Q_AssertIsQuaternion(q, "Q_GetAngleDegrees, expected quaternion");
	return 2.0 * Math.acos(q[3]) * Q_RadToDeg;
}

function Q_GetAngleRadians(q) {
	Q_AssertIsQuaternion(q, "Q_GetAngleRadians, expected quaternion");
	return 2.0 * Math.acos(q[3]);
}

function Q_GetAxis(q) {
	Q_AssertIsQuaternion(q, "Q_GetAxis, expected quaternion");
		
	// Return Normalized vector3 component of input quaternion

	const magSq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2];
	Q_AssertHelper(magSq != 0, "Q_GetAxis: Trying to normalize zero quaternion");
	const mag = Math.sqrt(magSq);
	Q_AssertHelper(mag != 0, "Q_GetAxis: Trying to normalize zero quaternion");

	return [ // Normalize
		q[0] / mag,
		q[1] / mag,
		q[2] / mag
	]
}


function Q_AngleAxis(degreesNum, axisVec3) {
	Q_AssertIsFloat(degreesNum, "Q_AngleAxis, degreesNum was not float");
	Q_AssertIsVec3(axisVec3, "Q_AngleAxis, axisVec3 was not a vector 3");

	const radians = degreesNum * Q_DegToRad;
	
	// Normalize input axis
	const axisMagSq = axisVec3[0] * axisVec3[0] + axisVec3[1] * axisVec3[1] + axisVec3[2] * axisVec3[2];
	Q_AssertHelper(axisMagSq != 0, "Q_AngleAxis: trying to normalize zero axis")
	const axisMag = Math.sqrt(axisMagSq);
	Q_AssertHelper(axisMag != 0, "Q_AngleAxis: trying to normalize zero axis")
	const axis = [ // Normalize
		axisVec3[0] / axisMag,
		axisVec3[1] / axisMag,
		axisVec3[2] / axisMag
	]

	const halfCos = Math.cos(radians * 0.5);
	const halfSin = Math.sin(radians * 0.5);

	return [
		axis[0] * halfSin,
		axis[1] * halfSin,
		axis[2] * halfSin,
		halfCos
	];
}

function Q_FromTo(fromVec3, toVec3) {
	Q_AssertIsVec3(fromVec3, "Q_FromTo, fromVec3 was not a vector 3");
	Q_AssertIsVec3(toVec3, "Q_FromTo, toVec3 was not a vector 3");
	
	// Check square magnitude of fromVec3 (normalize only if needed)
	const fromVec3MagSq = fromVec3[0] * fromVec3[0] + fromVec3[1] * fromVec3[1] + fromVec3[2] * fromVec3[2];
	if (fromVec3MagSq != 1) { 
		Q_AssertHelper(fromVec3MagSq != 0, "Q_FromTo: fromVec3MagSq, trying to normalize zero axis")
		const fromVec3Mag = Math.sqrt(fromVec3MagSq);
		Q_AssertHelper(fromVec3Mag != 0, "Q_FromTo: fromVec3MagSq, trying to normalize zero axis")
		fromVec3 = [ // Normalize
			fromVec3[0] / fromVec3Mag,
			fromVec3[1] / fromVec3Mag,
			fromVec3[2] / fromVec3Mag
		]
	}

	// Check square magnitude of toVec3 (normalize only if needed)
	const toVec3MagSq = toVec3[0] * toVec3[0] + toVec3[1] * toVec3[1] + toVec3[2] * toVec3[2];
	if (toVec3MagSq != 1) { 
		Q_AssertHelper(toVec3MagSq != 0, "Q_FromTo: toVec3MagSq, trying to normalize zero axis")
		const toVec3Mag = Math.sqrt(toVec3MagSq);
		Q_AssertHelper(toVec3Mag != 0, "Q_FromTo: toVec3MagSq, trying to normalize zero axis")
		toVec3 = [ // Normalize
			toVec3[0] / toVec3Mag,
			toVec3[1] / toVec3Mag,
			toVec3[2] / toVec3Mag
		]
	}

	const negToVec3 = [toVec3[0] * (-1.0), toVec3[1] * (-1.0), toVec3[2] * (-1.0)]
	const fromVecEqNegVec =
		   (Math.abs(fromVec3[0] - negToVec3[0]) <= Q_Epsilon && 
			Math.abs(fromVec3[1] - negToVec3[1]) <= Q_Epsilon && 
			Math.abs(fromVec3[2] - negToVec3[2]) <= Q_Epsilon) ;


	if (fromVecEqNegVec) { // If from == -to
		var mostOrthogonal = [1, 0, 0];

		if (Math.abs(p0.y) < Math.abs(p0.x)) {
			mostOrthogonal = [0, 1, 0];
		}

		if (Math.abs(p0.z) < Math.abs(p0.y) && Math.abs(p0.z) < Math.abs(p0.x)) {
			mostOrthogonal = [0, 0, 1];
		}

		//var axis = Vec3_Normalize(Vec3_Cross(fromVec3, mostOrthogonal));
		const crossFromMost = [
			fromVec3[1] * mostOrthogonal[2] - fromVec3[2] * mostOrthogonal[1],
			fromVec3[2] * mostOrthogonal[0] - fromVec3[0] * mostOrthogonal[2],
			fromVec3[0] * mostOrthogonal[1] - fromVec3[1] * mostOrthogonal[0]
		]
		const crossFromMostMagSq = crossFromMost[0] * crossFromMost[0] + crossFromMost[1] * crossFromMost[1] + crossFromMost[2] * crossFromMost[2]
		Q_AssertHelper(crossFromMostMagSq != 0, "Q_FromTo: toVec3MagSq, trying to normalize zero cross")
		const crossFromMostMag = Math.sqrt(crossFromMostMagSq);
		Q_AssertHelper(crossFromMostMag != 0, "Q_FromTo: toVec3MagSq, trying to normalize zero cross")
		const axis = [
			crossFromMost[0] / crossFromMostMag,
			crossFromMost[1] / crossFromMostMag,
			crossFromMost[2] / crossFromMostMag
		]
		return [axis[0], axis[1], axis[2], 0]
	}

	var half = [
		fromVec3[0] + toVec3[0],
		fromVec3[1] + toVec3[1],
		fromVec3[2] + toVec3[2]
	]
	const halfMagSq = half[0] * half[0] + half[1] * half[1] + half[2] * half[2]
	Q_AssertHelper(halfMagSq != 0, "Q_FromTo: toVec3MagSq, trying to normalize zero half")
	const halfMag = Math.sqrt(halfMagSq)
	Q_AssertHelper(halfMag != 0, "Q_FromTo: toVec3MagSq, trying to normalize zero half")
	half = [
		half[0] / halfMag,
		half[1] / halfMag,
		half[2] / halfMag
	]

	const axis = [ // Axis = cross(from, half)
		fromVec3[1] * half[2] - fromVec3[2] * half[1],
		fromVec3[2] * half[0] - fromVec3[0] * half[2],
		fromVec3[0] * half[1] - fromVec3[1] * half[0]
	]
	const axisMagSq = axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]
	Q_AssertHelper(axisMagSq != 0.0, "Q_FromTo: Cross product magnitude was zero, can't create from-to rotation")

	return [
		axis[0],
		axis[1],
		axis[2],
		fromVec3[0] * half[0] + fromVec3[1] * half[1] + fromVec3[2] * half[2]
	]
}

function Q_LookAtDirection(directionVec3, upVec3Optional) {
	if (typeof upVec3Optional == "undefined" || upVec3Optional == null) {
		upVec3Optional = [0, 1, 0];
	}

	Q_AssertIsVec3(directionVec3, "Q_LookAtDirection, directionVec3 was not a vector 3");
	Q_AssertIsVec3(upVec3Optional, "Q_LookAtDirection, upVec3Optional was not a vector 3");

	const forwardVec3 = [0, 0, 1];

	// Normalize only if needed
	const directionMagSq = directionVec3[0] * directionVec3[0] + directionVec3[1] * directionVec3[1] + directionVec3[2] * directionVec3[2]
	if (directionMagSq != 1) {
		Q_AssertHelper(directionMagSq != 0.0, "Q_LookAtDirection: Trying to normalize zero vector, directionMagSq")
		directionVec3 = [ // Normalize
			directionVec3[0] / directionMagSq,
			directionVec3[1] / directionMagSq,
			directionVec3[2] / directionMagSq
		]
	}

	// Normalize only if needed
	const upMagSq = upVec3Optional[0] * upVec3Optional[0] + upVec3Optional[1] * upVec3Optional[1] + upVec3Optional[2] * upVec3Optional[2]
	if (upMagSq != 1) {
		Q_AssertHelper(directionMagSq != 0.0, "Q_LookAtDirection: Trying to normalize zero vector, upMagSq")
		upVec3Optional = [ // Normalize
			upVec3Optional[0] / upMagSq,
			upVec3Optional[1] / upMagSq,
			upVec3Optional[2] / upMagSq
		]
	}

	// Find quaternion that rotates from forward to direction
	const forwardDirectionCross = [
		forwardVec3[1] * directionVec3[2] - forwardVec3[2] * directionVec3[1],
		forwardVec3[2] * directionVec3[0] - forwardVec3[0] * directionVec3[2],
		forwardVec3[0] * directionVec3[1] - forwardVec3[1] * directionVec3[0]
	]
	const forwardDiretionMagSq = forwardDirectionCross[0] * forwardDirectionCross[0] + forwardDirectionCross[1] * forwardDirectionCross[1] + forwardDirectionCross[2] * forwardDirectionCross[2]
	const fromForwardToDirection = (forwardDiretionMagSq == 0)? Q_Identity() : Q_FromTo(forwardVec3, directionVec3);

	// Make sure up is perpendicular to desired direction
	const rightVec3 = [ // Cross(directionVec3, upVec3Optional)
		directionVec3[1] * upVec3Optional[2] - directionVec3[2] * upVec3Optional[1],
		directionVec3[2] * upVec3Optional[0] - directionVec3[0] * upVec3Optional[2],
		directionVec3[0] * upVec3Optional[1] - directionVec3[1] * upVec3Optional[0]
	]
	const upVec3 = [ // Cross(rightVec3, directionVec3)
		rightVec3[1] * directionVec3[2] - rightVec3[2] * directionVec3[1],
		rightVec3[2] * directionVec3[0] - rightVec3[0] * directionVec3[2],
		rightVec3[0] * directionVec3[1] - rightVec3[1] * directionVec3[0]
	]

	// Find rotation betwen "up" of rotated object and desired up
	const objectUpVec3 = V3_Mul_Q([0, 1, 0], fromForwardToDirection);
	const objectUpCrossUp = [
		objectUpVec3[1] * upVec3[2] - upVec3[2] * upVec3[1],
		objectUpVec3[2] * upVec3[0] - upVec3[0] * upVec3[2],
		objectUpVec3[0] * upVec3[1] - upVec3[1] * upVec3[0]
	]
	const objectUpCrossUpMagSq = objectUpCrossUp[0] * objectUpCrossUp[0] + objectUpCrossUp[1] * objectUpCrossUp[1] + objectUpCrossUp[2] * objectUpCrossUp[2] 
	const fromObjectUpToDesiredUp = (objectUpCrossUpMagSq == 0)? Q_Identity() : Q_FromTo(objectUpVec3, upVec3);

	// Combine rotations (in reverse!)
	return Q_Mul(fromObjectUpToDesiredUp, fromForwardToDirection);
}

function Q_LookAtPoint(sourcePointVec3, targetPointVec3, upVec3Optional) {
	if (typeof upVec3Optional == "undefined" || upVec3Optional == null) {
		upVec3Optional = [0, 1, 0];
	}

	Q_AssertIsVec3(sourcePointVec3, "Q_LookAtPoint, sourcePointVec3 was not a vector 3");
	Q_AssertIsVec3(targetPointVec3, "Q_LookAtPoint, targetPointVec3 was not a vector 3");
	Q_AssertIsVec3(upVec3Optional, "Q_LookAtPoint, upVec3Optional was not a vector 3");

	const direction = [ // Vector3_Sub
		targetPointVec3[0] - sourcePointVec3[0],
		targetPointVec3[1] - sourcePointVec3[1],
		targetPointVec3[2] - sourcePointVec3[2]
	]
	const dirMagSq = direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2];
	Q_AssertHelper(dirMagSq != 0, "Calling Q_LookAtPoint with identical source and target vectors");

	return Q_LookAtDirection(direction, upVec3Optional)
}

//////////////////////////////////////////////////////////////////////////////////
// Invert quaternion
//////////////////////////////////////////////////////////////////////////////////

function Q_Conjugate(quat) {
	Q_AssertIsQuaternion(quat, "Q_Conjugate, expected quaternion argument");
	return [
		-quat[0],
		-quat[1],
		-quat[2],
		 quat[3]
	]
}

function Q_Inverse(quat) {
	Q_AssertIsQuaternion(quat, "Q_Inverse, expected quaternion argument");

	// Was using Q_IsAbout1 before, decided to not use epsilon
	if (Q_MagnitudeSq(quat) == 1) { 
		// If the quaternion is a unit quaternion, the inverse is
		// the same as the conjugate
		return [
			-quat[0],
			-quat[1],
			-quat[2],
			 quat[3]
		]
	}

	const norm = quat[0] * quat[0] +
				 quat[1] * quat[1] +
				 quat[2] * quat[2] +
				 quat[3] * quat[3];

	Q_AssertHelper(norm != 0, "Q_Inverse, the norm of the input can not be 0!")

	return [
			-quat[0] / norm,
			-quat[1] / norm,
			-quat[2] / norm,
			 quat[3] / norm
		]
}

//////////////////////////////////////////////////////////////////////////////////
// Component Wise Operations
//////////////////////////////////////////////////////////////////////////////////

function Q_Add(leftQuat, rightQuat) {
	Q_AssertIsQuaternion(leftQuat, "Q_Add, leftQuat was not a quaternion");
	Q_AssertIsQuaternion(rightQuat, "Q_Add, rightQuat was not a quaternion");

	return [
		leftQuat[0] + rightQuat[0],
		leftQuat[1] + rightQuat[1],
		leftQuat[2] + rightQuat[2],
		leftQuat[3] + rightQuat[3]
	]
}

function Q_Sub(leftQuat, rightQuat) {
	Q_AssertIsQuaternion(leftQuat, "Q_Sub, leftQuat was not a quaternion");
	Q_AssertIsQuaternion(rightQuat, "Q_Sub, rightQuat was not a quaternion");

	return [
		leftQuat[0] - rightQuat[0],
		leftQuat[1] - rightQuat[1],
		leftQuat[2] - rightQuat[2],
		leftQuat[3] - rightQuat[3]
	]
}

function Q_Scale(quat, numFloat) {
	Q_AssertIsQuaternion(quat, "Q_Scale, quat was not a quaternion");
	Q_AssertIsFloat(numFloat, "Q_Scale, numFloat was not a number");

	return [
		quat[0] * numFloat,
		quat[1] * numFloat,
		quat[2] * numFloat,
		quat[3] * numFloat
	]
}

function Q_Negate(quat) {
	Q_AssertIsQuaternion(quat, "Q_Negate, quat was not a quaternion");
	return [
		quat[0] * -1.0,
		quat[1] * -1.0,
		quat[2] * -1.0,
		quat[3] * -1.0
	]
}

// Component wise equals. Two quaternions can represent the same rotation,
// this function will return false given those two quaternions
function Q_Equals(leftQuat, rightQuat, epsilonFloatOptional) {
	if (typeof epsilonFloatOptional == "undefined") {
		epsilonFloatOptional = Q_Epsilon;
	}

	Q_AssertIsQuaternion(leftQuat, "Q_Equals, leftQuat was not a quaternion");
	Q_AssertIsQuaternion(rightQuat, "Q_Equals, rightQuaternion was not a quaternion");
	Q_AssertIsFloat(epsilonFloatOptional, "Q_Equals, epsilonFloatOptional was not a number");

	const debug = [
		leftQuat[0] - rightQuat[0],
		leftQuat[1] - rightQuat[1],
		leftQuat[2] - rightQuat[2],
		leftQuat[3] - rightQuat[3]
	]
	return (Math.abs(leftQuat[0] - rightQuat[0]) <= epsilonFloatOptional && 
			Math.abs(leftQuat[1] - rightQuat[1]) <= epsilonFloatOptional && 
			Math.abs(leftQuat[2] - rightQuat[2]) <= epsilonFloatOptional && 
			Math.abs(leftQuat[3] - rightQuat[3]) <= epsilonFloatOptional) ;
}

// Context wise equals. Two quaternions can represent the same rotation,
// this function will return true given those two quaternions, even tough
// the components of the two quaternions are not identical
function Q_Same(leftQuat, rightQuat, epsilonFloatOptional) {
	if (typeof epsilonFloatOptional == "undefined") {
		epsilonFloatOptional = Q_Epsilon;
	}

	Q_AssertIsQuaternion(leftQuat, "Q_Same, leftQuat was not a quaternion");
	Q_AssertIsQuaternion(rightQuat, "Q_Same, rightQuaternion was not a quaternion");
	Q_AssertIsFloat(epsilonFloatOptional, "Q_Same, epsilonFloatOptional was not a number");

	return (Q_Equals(leftQuat, rightQuat) || Q_Equals(leftQuat, Q_Negate(rightQuat)));
}

//////////////////////////////////////////////////////////////////////////////////
// Length Related Stuff
//////////////////////////////////////////////////////////////////////////////////

function Q_Dot(leftQuaternion, rightQuaternion) {
	Q_AssertIsQuaternion(leftQuaternion, "Q_Dot, leftQuaternion was not a quaternion");
	Q_AssertIsQuaternion(rightQuaternion, "Q_Dot, rightQuaternion was not a quaternion");

	return leftQuaternion[0] * rightQuaternion[0] +
		   leftQuaternion[1] * rightQuaternion[1] +
		   leftQuaternion[2] * rightQuaternion[2] +
		   leftQuaternion[3] * rightQuaternion[3];
}

function Q_MagnitudeSq(quat) {
	Q_AssertIsQuaternion(quat, "Q_MagnitudeSq, quat was not a quaternion");

	return quat[0] * quat[0] + 
		   quat[1] * quat[1] + 
		   quat[2] * quat[2] + 
		   quat[3] * quat[3];
}

function Q_Magnitude(quat) {
	Q_AssertIsQuaternion(quat, "Q_Magnitude, quat was not a quaternion");

	const lengthSq = quat[0] * quat[0] + quat[1] * quat[1] + quat[2] * quat[2] + quat[3] * quat[3];
	
	if (lengthSq == 0) {
		return 0;
	}
	
	return Math.sqrt(lengthSq);
}

function Q_Normalized(quat) {
	Q_AssertIsQuaternion(quat, "Q_Normalize, quat was not a quaternion");

	const lengthSq = quat[0] * quat[0] + quat[1] * quat[1] + quat[2] * quat[2] + quat[3] * quat[3];
	
	Q_AssertHelper(lengthSq != 0, "Q_Normalize, length squared is zero!")
	const length = Math.sqrt(lengthSq);
	Q_AssertHelper(length != 0, "Q_Normalize, length is zero!")

	return [
		quat[0] / length,
		quat[1] / length,
		quat[2] / length,
		quat[3] / length
	]
}

//////////////////////////////////////////////////////////////////////////////////
// The big one, multiplication
//////////////////////////////////////////////////////////////////////////////////

function Q_Mul(q, p) {
	Q_AssertIsQuaternion(q, "Q_Mul, q / leftQuaternion was not a quaternion");
	Q_AssertIsQuaternion(p, "Q_Mul, p / rightQuaternion was not a quaternion");

	/*return [
		  p[0] * q[3]  + p[1] * q[2] - p[2] * q[1] + p[3] * q[0],
		-(p[0] * q[2]) + p[1] * q[3] + p[2] * q[0] + p[3] * q[1],
		  p[0] * q[1]  - p[1] * q[0] + p[2] * q[3] + p[3] * q[2],
		-(p[0] * q[0]) - p[1] * q[1] - p[2] * q[2] + p[3] * q[3]
	]*/

	// Re-arranged the above just so it lines up prettier
	return [
		(p[3] * q[0]) + (p[0] * q[3]) + (p[1] * q[2]) - (p[2] * q[1]),
		(p[3] * q[1]) - (p[0] * q[2]) + (p[1] * q[3]) + (p[2] * q[0]),
		(p[3] * q[2]) + (p[0] * q[1]) - (p[1] * q[0]) + (p[2] * q[3]),
		(p[3] * q[3]) - (p[0] * q[0]) - (p[1] * q[1]) - (p[2] * q[2])
	]

	/*const q_v = [q[0], q[1], q[2]];
	const p_v = [p[0], p[1], p[2]];
	const q_r = q[3];
	const p_r = p[3];

	const scalar = q_r * p_r - V3_Dot(q_v, p_v)
	const vector = V3_Add(V3_Add(V3_Scale(p_v, q_r), V3_Scale(q_v, p_r)), V3_Cross(p_v, q_v));

	return [
		vector[0],
		vector[1],
		vector[2],
		scalar
	]*/
}

//////////////////////////////////////////////////////////////////////////////////
// Rotate vectors
//////////////////////////////////////////////////////////////////////////////////
function V3_Mul_Q(vector3, quaternion) {
	Q_AssertIsQuaternion(quaternion, "V3_Mul_Q, quaternion was not a quaternion");
	Q_AssertIsVec3(vector3, "V3_Mul_Q, vector3 was not a vector 3");
	
	// Naive method:
	//return Q_Mul(Q_Mul(quaternion, [vector3[0], vector3[1], vector3[2], 0]), Q_Conjugate(quaternion))

	const qVector = [quaternion[0], quaternion[1], quaternion[2]];
	const qScalar = quaternion[3];

	// v = input vector
	// u = quaternion.vector
	// s = quaternion.scalr
	// vprime = 2.0f * dot(u, v) * u + (s*s - dot(u, u)) * v + 2.0f * s * cross(u, v);

	/*return Vec3_Add(
		Vec3_Add(
			Vec3_Scale(qVector, 2.0 * Vec3_Dot(qVector, vector3)),
			Vec3_Scale(vector3, qScalar * qScalar - Vec3_Dot(qVector, qVector))
		),
		Vec3_Scale(cross(qVector, vector3), 2.0 * qScalar)
	);*/

	const dotQV = qVector[0] * vector3[0] + qVector[1] * vector3[1] + qVector[2] * vector3[2]
	const dotQQ = qVector[0] * qVector[0] + qVector[1] * qVector[1] + qVector[2] * qVector[2]
	const scalarSq = qScalar * qScalar

	const cross = [
		qVector[1] * vector3[2] - qVector[2] * vector3[1],
		qVector[2] * vector3[0] - qVector[0] * vector3[2],
		qVector[0] * vector3[1] - qVector[1] * vector3[0]
	]

	const a = [
		qVector[0] * (2.0 * dotQV),
		qVector[1] * (2.0 * dotQV),
		qVector[2] * (2.0 * dotQV)
	]
	const b = [
		vector3[0] * (scalarSq - dotQQ),
		vector3[1] * (scalarSq - dotQQ),
		vector3[2] * (scalarSq - dotQQ)
	]
	const c = [
		cross[0] * (2.0 * qScalar),
		cross[1] * (2.0 * qScalar),
		cross[2] * (2.0 * qScalar)
	]

	return [
		a[0] + b[0] + c[0],
		a[1] + b[1] + c[1],
		a[2] + b[2] + c[2]
	]
}

function Q_Rotate(quaternion, vector3) {
	Q_AssertIsQuaternion(quaternion, "Q_Rotate, quaternion was not a quaternion");
	Q_AssertIsVec3(vector3, "Q_Rotate, vector3 was not a vector 3");

	return V3_Mul_Q(vector3, quaternion);
}

//////////////////////////////////////////////////////////////////////////////////
// Interpolating
//////////////////////////////////////////////////////////////////////////////////

function Q_Nlerp(aQuaternion, bQuaternion, tNumber, shortestPathOptionalBool) {
	Q_AssertIsQuaternion(aQuaternion, "Q_Nlerp, aQuaternion was not a quaternion");
	Q_AssertIsQuaternion(bQuaternion, "Q_Nlerp, bQuaternion was not a quaternion");
	Q_AssertIsFloat(tNumber, "Q_Nlerp, tNumber was not a float");

	if (typeof shortestPathOptionalBool == "undefined") {
		shortestPathOptionalBool = true;
	}

	Q_AssertIsBool(shortestPathOptionalBool, "Q_Nlerp, shortestPathOptionalBool was not a bool");

	if (Q_Dot(aQuaternion, bQuaternion) < 0.0 && shortestPathOptionalBool) {
		bQuaternion = Q_Negate(bQuaternion);
	}

	// start + (end - start) * t
	const result = Q_Add(aQuaternion, Q_Scale(Q_Sub(bQuaternion, aQuaternion), tNumber));

	return Q_Normalized(result);
}

function Q_Mix2(aQuaternion, atNumber, bQuaternion, btNumber, normalizeRangeOptionalBool) {
	Q_AssertIsQuaternion(aQuaternion, "Q_Mix2, aQuaternion was not a quaternion");
	Q_AssertIsQuaternion(bQuaternion, "Q_Mix2, bQuaternion was not a quaternion");
	Q_AssertIsFloat(atNumber, "Q_Mix2, atNumber was not a float");
	Q_AssertIsFloat(btNumber, "Q_Mix2, btNumber was not a float");

	if (typeof normalizeRangeOptionalBool == "undefined") {
		normalizeRangeOptionalBool = false;
	}
	Q_AssertIsBool(normalizeRangeOptionalBool, "Q_Mix2, shortestPathOptionalBool was not a bool");

	if (normalizeRangeOptionalBool) {
		const range = atNumber + btNumber;
		if (Math.abs(range) > Q_Epsilon) {
			atNumber = atNumber / range;
			btNumber = btNumber / range;
		}
	}

	return Q_Add(
				Q_Scale(aQuaternion, atNumber), 
				Q_Scale(bQuaternion, btNumber)
			);
}

function Q_Mix3(aQuaternion, atNumber, bQuaternion, btNumber, cQuaternion, ctNumber, normalizeRangeOptionalBool) {
	Q_AssertIsQuaternion(aQuaternion, "Q_Mix3, aQuaternion was not a quaternion");
	Q_AssertIsQuaternion(bQuaternion, "Q_Mix3, bQuaternion was not a quaternion");
	Q_AssertIsQuaternion(cQuaternion, "Q_Mix3, cQuaternion was not a quaternion");
	Q_AssertIsFloat(atNumber, "Q_Mix3, atNumber was not a float");
	Q_AssertIsFloat(btNumber, "Q_Mix3, btNumber was not a float");
	Q_AssertIsFloat(ctNumber, "Q_Mix3, ctNumber was not a float");

	if (typeof normalizeRangeOptionalBool == "undefined") {
		normalizeRangeOptionalBool = false;
	}
	Q_AssertIsBool(normalizeRangeOptionalBool, "Q_Mix3, shortestPathOptionalBool was not a bool");

	if (normalizeRangeOptionalBool) {
		const range = atNumber + btNumber + ctNumber;
		if (Math.abs(range) > Q_Epsilon) {
			atNumber = atNumber / range;
			btNumber = btNumber / range;
			ctNumber = ctNumber / range;
		}
	}

	return Q_Add(
				Q_Add(
					Q_Scale(aQuaternion, atNumber), 
					Q_Scale(bQuaternion, btNumber)
				),
				Q_Scale(cQuaternion, ctNumber)
			);
}

function Q_Mix4(aQuaternion, atNumber, bQuaternion, btNumber, cQuaternion, ctNumber, dQuaternion, dtNumber, normalizeRangeOptionalBool) {
	Q_AssertIsQuaternion(aQuaternion, "Q_Mix4, aQuaternion was not a quaternion");
	Q_AssertIsQuaternion(bQuaternion, "Q_Mix4, bQuaternion was not a quaternion");
	Q_AssertIsQuaternion(cQuaternion, "Q_Mix4, cQuaternion was not a quaternion");
	Q_AssertIsQuaternion(dQuaternion, "Q_Mix4, dQuaternion was not a quaternion");
	Q_AssertIsFloat(atNumber, "Q_Mix4, atNumber was not a float");
	Q_AssertIsFloat(btNumber, "Q_Mix4, btNumber was not a float");
	Q_AssertIsFloat(ctNumber, "Q_Mix4, ctNumber was not a float");
	Q_AssertIsFloat(dtNumber, "Q_Mix4, dtNumber was not a float");

	if (typeof normalizeRangeOptionalBool == "undefined") {
		normalizeRangeOptionalBool = false;
	}
	Q_AssertIsBool(normalizeRangeOptionalBool, "Q_Mix4, shortestPathOptionalBool was not a bool");

	if (normalizeRangeOptionalBool) {
		const range = atNumber + btNumber + ctNumber + dtNumber;
		if (Math.abs(range) > Q_Epsilon) {
			atNumber = atNumber / range;
			btNumber = btNumber / range;
			ctNumber = ctNumber / range;
			dtNumber = dtNumber / range;
		}
	}

	return Q_Add(
				Q_Add(
					Q_Add(
						Q_Scale(aQuaternion, atNumber), 
						Q_Scale(bQuaternion, btNumber)
					),
					Q_Scale(cQuaternion, ctNumber)
				),
				Q_Scale(dQuaternion, dtNumber)
			);
}

function Q_Pow(inputQuaternion, powerNum) {
	Q_AssertIsQuaternion(inputQuaternion, "Q_Pow, inputQuaternion was not a quaternion");
	Q_AssertIsFloat(powerNum, "Q_Pow, powerNum was not a float");

	const axisMagSq = inputQuaternion[0] * inputQuaternion[0] + inputQuaternion[1] * inputQuaternion[1] + inputQuaternion[2] * inputQuaternion[2];
	Q_AssertHelper(axisMagSq != 0, "Q_Pow, trying to normalize zero vector")
	const axisMag = Math.sqrt(axisMagSq);
	Q_AssertHelper(axisMag != 0, "Q_Pow, trying to normalize zero vector")
	var axis = [
		inputQuaternion[0] / axisMag,
		inputQuaternion[1] / axisMag,
		inputQuaternion[2] / axisMag
	];

	const radians = 2.0 * Math.acos(inputQuaternion[3]);

	const halfCos = Math.cos((powerNum * radians) * 0.5);
	const halfSin = Math.sin((powerNum * radians) * 0.5);

	return [
		axis[0] * halfSin,
		axis[1] * halfSin,
		axis[2] * halfSin,
		halfCos
	];
}

function Q_Slerp(aQuaternion, bQuaternion, tNumber, shortestPathOptionalBool) {
	Q_AssertIsQuaternion(aQuaternion, "Q_Slerp, aQuaternion was not a quaternion");
	Q_AssertIsQuaternion(bQuaternion, "Q_Slerp, bQuaternion was not a quaternion");
	Q_AssertIsFloat(tNumber, "Q_Slerp, tNumber was not a float");

	if (typeof shortestPathOptionalBool == "undefined") {
		shortestPathOptionalBool = true;
	}
	Q_AssertIsBool(shortestPathOptionalBool, "Q_Slerp, shortestPathOptionalBool was not a bool");

	// Normalize inputs a and b if they are not.
	if (Q_MagnitudeSq(aQuaternion) != 1) {
		// Was using Q_IsAbout1 before, decided to not use epsilon
		aQuaternion = Q_Normalized(aQuaternion);
	}

	if (Q_MagnitudeSq(bQuaternion) != 1) {
		// Was using Q_IsAbout1 before, decided to not use epsilon
		bQuaternion = Q_Normalized(bQuaternion);
	}

	// (end * Inverse(start)) ^ t * start
	// return Q_Mul(Q_Pow(Q_Mul(q2, Q_Inverse(q1)), t), q1)

	if (Q_Dot(aQuaternion, bQuaternion) < 0 && shortestPathOptionalBool) {
		bQuaternion = Q_Scale(bQuaternion, -1)
	}

	return Q_Mul(Q_Pow(Q_Mul(bQuaternion, Q_Inverse(aQuaternion)), tNumber), aQuaternion)
}

//////////////////////////////////////////////////////////////////////////////////
// Matrix Conversion
//////////////////////////////////////////////////////////////////////////////////

function Q_To_M4(quat) {
	Q_AssertIsQuaternion(quat, "Q_To_M4, quat was not a quaternion");

	// Was using Q_IsAbout1 before, decided to not use epsilon
	if (Q_MagnitudeSq(quat) != 1) {
		quat = Q_Normalized(quat);
	}

	const ww = quat[3] * quat[3];
	const xx = quat[0] * quat[0];
	const yy = quat[1] * quat[1];
	const zz = quat[2] * quat[2];

	const wx = 2.0 * quat[3] * quat[0];
	const wy = 2.0 * quat[3] * quat[1];
	const wz = 2.0 * quat[3] * quat[2];

	const xy = 2.0 * quat[0] * quat[1];
	const xz = 2.0 * quat[0] * quat[2];

	const yz = 2.0 * quat[2] * quat[2];

	return [
		ww + xx - yy - zz, xy + wz, xz - wy, 0,
		xy - wz, ww - xx + yy - zz, yz + wx, 0,
		xz + wy, yz - wx, ww - xx - yy + zz, 0,
		0,  0,  0, ww + xx + yy + zz
	]
}

function Q_To_M3(quat) {
	Q_AssertIsQuaternion(quat, "Q_To_M3, quat was not a quaternion");

	if (Q_MagnitudeSq(quat) != 1) {
		quat = Q_Normalized(quat);
	}

	const ww = quat[3] * quat[3];
	const xx = quat[0] * quat[0];
	const yy = quat[1] * quat[1];
	const zz = quat[2] * quat[2];

	const wx = 2.0 * quat[3] * quat[0];
	const wy = 2.0 * quat[3] * quat[1];
	const wz = 2.0 * quat[3] * quat[2];

	const xy = 2.0 * quat[0] * quat[1];
	const xz = 2.0 * quat[0] * quat[2];

	const yz = 2.0 * quat[2] * quat[2];

	return [
		ww + xx - yy - zz, xy + wz, xz - wy,
		xy - wz, ww - xx + yy - zz, yz + wx,
		xz + wy, yz - wx, ww - xx - yy + zz
	]
}

function Q_To_Str(quat, optionalNumberOfDecimals) {
	if (typeof optionalNumberOfDecimals == "undefined" || optionalNumberOfDecimals == null) {
		optionalNumberOfDecimals = 5
	}

	Q_AssertIsQuaternion(quat, "Q_To_Str, Q_To_Str was not a quaternion");
	Q_AssertIsFloat(optionalNumberOfDecimals, "Q_To_Str, optionalNumberOfDecimals is not a float");

	if (typeof optionalNumberOfDecimals == "undefined" || optionalNumberOfDecimals == null) {
		optionalNumberOfDecimals = 5
	}

	return "(" +
		   quat[0].toFixed(optionalNumberOfDecimals) + ", " + 
		   quat[1].toFixed(optionalNumberOfDecimals) + ", " +
		   quat[2].toFixed(optionalNumberOfDecimals) + "), " +
		   quat[3].toFixed(optionalNumberOfDecimals);
}