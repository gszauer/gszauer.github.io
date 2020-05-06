'use strict';

/***********************************************************************************
************************************ MIT License ***********************************
************************************************************************************
Copyright 2018 Gabor Szauer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***********************************************************************************/

// Javascript sample implementation for my vector tutorial at:
// http://gabormakesgames.com/blog_vectors_intro.html

/* Vecor 3:
	3 dimensional vectors are represented by a 3 element float array.
	3 dimensional vectors are stored in <x, y, z> order.

API Documentation conventions
	*  = optional paramater
	|  = overloaded paramater
	-> = function that calls the indented function

Public API functions:
	Vector3 V3_Zero()
	Vector3 V3_One()
	Vector3 V3_Forward()
	Vector3 V3_Up()
	Vector3 V3_Right()
	bool V3_Equals(Vector3 v1, Vector3 v2, float* epsilonFloatOptional)
	Vector3 V3_Add(Vector3 v1, Vector3 v2)
	Vector3 V3_Scale(Vector3 v, float f)
	Vector3 V3_Mul(Vector3 v1, Vector3 v2)
	Vector3 V3_Sub(Vector3 v1, Vector3 v2)
	float V3_Dot(Vector3 v1, Vector3 v2)
	float V3_MagnitudeSq(Vector3 v)
	float V3_Magnitude(Vector3 v)
	Vector3 V3_Normalized(Vector3 v)
	float V3_GetAngleDegrees(Vector3 v1, Vector3 v2)
	float V3_GetAngleRadians(Vector3 v1, Vector3 v2)
	Vector3 V3_Project(Vector3 v, Vector3 ontoVector)
	Vector3 V3_Reject(Vector3 v, Vector3 ontoVector)
	Vector3 V3_Reflect(Vector3 v, Vector3 aroundNormal)
	Vector3 V3_Cross(Vector3 v1, Vector3 v2)
	Vector3 V3_Lerp (Vector3 from, Vector3 to, float t)
	Vector3 V3_Slerp(Vector3 from, Vector3 to, float t)
	Vector3 V3_Nlerp(Vector3 from, Vector3 to, float t)
	Vector3 V3_RotateAround(Vector3 vec, Vector3 axis, float angleInDegrees)
	Vector2 V3_To_V2(Vector3 vec)
	Vector4 V3_To_V4(Vector3 vec)
	string V3_To_Str(Vector3 vec, float* numberOfDecimals)
*/

const V3_Epsilon = 0.0001;
const V3_DegToRad = Math.PI / 180.0;
const V3_RadToDeg = 180.0 / Math.PI;
var V3_EnableAsserts = true;

function V3_AssertHelper(condition, message) {
	if (!V3_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (!condition) {
		message = message || "Assertion failed";
		console.log("Assertion: " + message);

		if( typeof V3_AssertHelper.counter == 'undefined' ) {
			V3_AssertHelper.counter = 0;
		}
		if (V3_AssertHelper.counter < 5) {
			alert(message);
		}
		V3_AssertHelper.counter++;

		
		if (typeof Error !== "undefined") {
			throw new Error(message);
		}
		throw message;
	}
}

function V3_AssertIsFloat(variable, message) {
	if (!V3_EnableAsserts) {
		return;
	}
	message = message || "N/A";
	
	if (variable == null) {
		V3_AssertHelper(false, "V3_AssertIsFloat: argument is null \n" + message);
	}
	else if (typeof variable != "number") {
		V3_AssertHelper(false, "V3_AssertIsFloat: was not given a number \n" + message);
	}
}
function V3_AssertIsBool(variable, message) {
	if (!V3_EnableAsserts) {
		return;
	}
	message = message || "N/A";
	
	if (variable == null) {
		V3_AssertHelper(false, "V3_AssertIsBool: argument is null \n" + message);
	}
	else if (typeof variable != "boolean") {
		V3_AssertHelper(false, "V3_AssertIsBool: argument is not a boolean \n" + message);
	}
}

function V3_AssertIsVector3(variable, message) {
	if (!V3_EnableAsserts) {
		return;
	}
	message = message || "N/A";
	
	if (typeof variable == "undefined") {
		V3_AssertHelper(false, "V3_AssertIsVector3, argument is undefined\n" + message);
		return;
	}

	if (variable != null) {
		if (variable.constructor === Array) {
			if (variable.length == 3) {
				// All good!
			}
			else {
				V3_AssertHelper(false, "V3_AssertIsVector3, argument length is not 3\n" + message);
			}
		}
		else {
			V3_AssertHelper(false, "V3_AssertIsVector3, argument is not an array\n" + message);
		}
	}
	else {
		V3_AssertHelper(false, "V3_AssertIsVector3, argument is null\n" + message);
	}
}

function V3_AssertIsNormal3(variable, message)  {
	if (!V3_EnableAsserts) {
		return;
	}
	message = message || "N/A";

	if (typeof variable == "undefined") {
		V3_AssertHelper(false, "V3_AssertIsNormal3, argument is undefined\n" + message);
		return;
	}

	if (variable != null) {
		if (variable.constructor === Array) {
			if (variable.length == 3) {
				const magSq = variable[0] * variable[0] + variable[1] * variable[1] + variable[2] * variable[2];
				if (Math.abs(1.0 - magSq) > V3_Epsilon) {
					V3_AssertHelper(false, "V3_AssertIsNormal3, argument magnitude is not 1\n" + message);
				}
				else {
					// All good!
				}
			}
			else {
				V3_AssertHelper(false, "V3_AssertIsNormal3, argument length is not 3\n" + message);
			}
		}
		else {
			V3_AssertHelper(false, "V3_AssertIsNormal3, argument is not an array\n" + message);
		}
	}
	else {
		V3_AssertHelper(false, "V3_AssertIsNormal3, argument is null\n" + message);
	}
}

function V3_Zero() {
	return [0, 0, 0]
}

function V3_One() {
	return [1, 1, 1]
}

function V3_Forward() {
	return [0, 0, 1]
}

function V3_Up() {
	return [0, 1, 0]
}

function V3_Right() {
	return [1, 0, 0]
}

function V3_Equals(v1, v2, epsilonFloatOptional) {
	if (typeof epsilonFloatOptional == "undefined") {
		epsilonFloatOptional = V3_Epsilon;
	}

	V3_AssertIsVector3(v1, "V3_Equals, v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_Equals, v2 was not a vector 3");
	V3_AssertIsFloat(epsilonFloatOptional, "V3_Equals, epsilonFloatOptional was not a number");

	return (Math.abs(v1[0] - v2[0]) <= epsilonFloatOptional && 
			Math.abs(v1[1] - v2[1]) <= epsilonFloatOptional && 
			Math.abs(v1[2] - v2[2]) <= epsilonFloatOptional) ;
}

function V3_Add(v1, v2) {
	V3_AssertIsVector3(v1, "V3_Add, v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_Add, v2 was not a vector 3");

	return [
		v1[0] + v2[0],
		v1[1] + v2[1],
		v1[2] + v2[2]
	]
}

function V3_Scale(v, f){
	V3_AssertIsVector3(v, "V3_Scale, v was not a vector 3");
	V3_AssertIsFloat(f, "V3_Scale, f was not a number");

	return [
		v[0] * f,
		v[1] * f,
		v[2] * f
	]
}

function V3_Mul(v1, v2){
	V3_AssertIsVector3(v1, "V3_Mul, v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_Mul, v2 was not a vector 3");

	return [
		v1[0] * v2[0],
		v1[1] * v2[1],
		v1[2] * v2[2]
	]
}

function V3_Sub(v1, v2) {
	V3_AssertIsVector3(v1, "V3_Sub, v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_Sub, v2 was not a vector 3");

	return [
		v1[0] - v2[0],
		v1[1] - v2[1],
		v1[2] - v2[2]
	]
}
function V3_Dot(v1, v2)  {
	V3_AssertIsVector3(v1, "V3_Sub, v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_Sub, v2 was not a vector 3");

	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function V3_MagnitudeSq(v) {
	V3_AssertIsVector3(v, "V3_MagnitudeSq, v was not a vector 3");

	return v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
}

function V3_Magnitude(v) {
	V3_AssertIsVector3(v, "V3_MagnitudeSq, v was not a vector 3");

	const magSq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2]

	//V3_AssertHelper(Math.abs(magSq) != 0, "V3_Magnitude, Vector length was 0!")
	if (magSq == 0) {
		return 0;
	}


	return Math.sqrt(magSq);
}

function V3_Normalized(v) {
	V3_AssertIsVector3(v, "V3_Normalized, v was not a vector 3");

	const magSq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
	V3_AssertHelper(magSq != 0, "V3_Normalized, Vector length was 0!")
	const mag = Math.sqrt(magSq);
	V3_AssertHelper(mag != 0, "V3_Normalized, Vector length was 0!")

	return [
		v[0] / mag,
		v[1] / mag,
		v[2] / mag
	]
}

function V3_GetAngleDegrees(v1, v2) {
	V3_AssertIsVector3(v1, "V3_GetAngleDegrees, v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_GetAngleDegrees, v2 was not a vector 3");

	const sqMagV1 = v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2];
	const sqMagV2 = v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2];

	V3_AssertHelper(sqMagV1 != 0, "V3_GetAngleDegrees, v1 length was 0!")
	V3_AssertHelper(sqMagV2 != 0, "V3_GetAngleDegrees, v2 length was 0!")

	const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];

	if (Math.abs(1.0 - sqMagV1) < V3_Epsilon && Math.abs(1.0 - sqMagV2) < V3_Epsilon) {
		return Math.acos(dot)  * V3_RadToDeg;
	}

	const length = Math.sqrt(sqMagV1) * Math.sqrt(sqMagV2);
	return Math.acos(dot / length) * V3_RadToDeg;
}

function V3_GetAngleRadians(v1, v2) {
	V3_AssertIsVector3(v1, "V3_GetAngleDegrees, v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_GetAngleDegrees, v2 was not a vector 3");

	const sqMagV1 = v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2];
	const sqMagV2 = v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2];

	V3_AssertHelper(sqMagV1 != 0, "V3_GetAngleDegrees, v1 length was 0!")
	V3_AssertHelper(sqMagV2 != 0, "V3_GetAngleDegrees, v2 length was 0!")

	const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];

	if (Math.abs(1.0 - sqMagV1) < V3_Epsilon && Math.abs(1.0 - sqMagV2) < V3_Epsilon) {
		return Math.acos(dot);
	}

	const length = Math.sqrt(sqMagV1) * Math.sqrt(sqMagV2);
	return Math.acos(dot / length);
}

function V3_Project(v, ontoVector) {
	V3_AssertIsVector3(v, "V3_Project: v was not a vector 3");
	V3_AssertIsVector3(ontoVector, "V3_Project: ontoVector was not a vector 3");

	const magSq = V3_MagnitudeSq(ontoVector);
	V3_AssertHelper(magSq != 0, "V3_Project: projecting onto zero vector!")

    const scale = V3_Dot(v, ontoVector) / magSq;
    return V3_Scale(ontoVector, scale);
}

function V3_Reject(v, ontoVector) {
	V3_AssertIsVector3(v, "V3_Reject: v was not a vector 3");
	V3_AssertIsVector3(ontoVector, "V3_Reject: ontoVector was not a vector 3");

	const magSq = V3_MagnitudeSq(ontoVector);
	V3_AssertHelper(magSq != 0, "V3_Reject: projecting onto zero vector!")

    const scale = V3_Dot(v, ontoVector) / magSq;
    const projection = V3_Scale(ontoVector, scale);

    return V3_Sub(v, projection);
}

function V3_Reflect(v, aroundNormal) {
	V3_AssertIsVector3(v, "V3_Reflect: v was not a vector 3");
	V3_AssertIsVector3(aroundNormal, "V3_Reflect: aroundNormal was not a vector 3");

	const magSq = V3_MagnitudeSq(aroundNormal);
	V3_AssertHelper(magSq != 0, "V3_Reflect: reflecting around zero vector!")

    const scale = V3_Dot(v, aroundNormal) / magSq;
    const proj_2x = V3_Scale(aroundNormal, scale * 2.0);
    return V3_Sub(v, proj_2x);
}

function V3_Cross(v1, v2) {
	V3_AssertIsVector3(v1, "V3_Cross: v1 was not a vector 3");
	V3_AssertIsVector3(v2, "V3_Cross: v2 was not a vector 3");

	return [
		v1[1] * v2[2] - v1[2] * v2[1],
		v1[2] * v2[0] - v1[0] * v2[2],
		v1[0] * v2[1] - v1[1] * v2[0]
	]
}

function V3_Lerp (from, to, t) {
	V3_AssertIsVector3(from, "V3_Lerp: from was not a vector 3");
	V3_AssertIsVector3(to, "V3_Lerp: to was not a vector 3");
	V3_AssertIsFloat(t, "V3_Lerp: t provided is not a float");

	return V3_Add(from, V3_Scale(V3_Sub(to, from), t));
}

function V3_Slerp(from, to, t) {
	V3_AssertIsVector3(from, "V3_Slerp: from was not a vector 3");
	V3_AssertIsVector3(to, "V3_Slerp: to was not a vector 3");
	V3_AssertIsFloat(t, "V3_Slerp: t provided is not a float");

	from = V3_Normalized(from);
    to = V3_Normalized(to);

    const theta = Math.acos(from[0] * to[0] + from[1] * to[1] + from[2] * to[2])
    const sin_theta = Math.sin(theta);

    const a = Math.sin((1 - t) * theta) / sin_theta
    const b = Math.sin(t * theta) / sin_theta;

    // return from * a + to * b;
    return V3_Add(
        V3_Scale(from, a),
        V3_Scale(to, b)
    );
}

function V3_Nlerp(from, to, t) {
	V3_AssertIsVector3(from, "V3_Nlerp: from was not a vector 3");
	V3_AssertIsVector3(to, "V3_Nlerp: to was not a vector 3");
	V3_AssertIsFloat(t, "V3_Nlerp: t provided is not a float");

	const lerp = V3_Add(from, V3_Scale(V3_Sub(to, from), t));
    return V3_Normalized(lerp);
}

function V3_RotateAround(vec, axis, angleInDegrees) {
	V3_AssertIsVector3(vec, "V3_RotateAround: vec was not a vector 3");
	V3_AssertIsNormal3(axis, "V3_RotateAround: axis was not a normalized vector");
	V3_AssertIsFloat(angleInDegrees, "V3_RotateAround: angle provided is not a float");

	const p = V3_Scale(axis, V3_Dot(vec, axis))
	const e = V3_Sub(vec, V3_Scale(axis, V3_Dot(vec, axis)));
	const f = V3_Cross(axis, vec);

	const cos_t = Math.cos(angleInDegrees * V3_DegToRad);
	const sin_t = Math.sin(angleInDegrees * V3_DegToRad);

	// p + e * cos(theta) + f * sin(theta)
	// where p is the projection (v dot n) * n
	return V3_Add(V3_Add(p, V3_Scale(e, cos_t)), V3_Scale(f, sin_t));
}

function V3_To_V2(vec) {
	V3_AssertIsVector3(vec, "V3_To_V2, Q_To_Str was not a quaternion");
	return [
		vec[0],
		vec[1]
	]
}

function V3_To_V4(vec) {
	V3_AssertIsVector3(vec, "V3_To_V4, Q_To_Str was not a quaternion");
	return [
		vec[0],
		vec[1],
		vec[2],
		0.0
	]
}

function V3_To_Str(vec, optionalNumberOfDecimals) {
	if (typeof optionalNumberOfDecimals == "undefined" || optionalNumberOfDecimals == null) {
		optionalNumberOfDecimals = 5
	}

	V3_AssertIsVector3(vec, "V3_To_Str, Q_To_Str was not a quaternion");
	V3_AssertIsFloat(optionalNumberOfDecimals, "V3_To_Str, optionalNumberOfDecimals is not a float");

	if (typeof optionalNumberOfDecimals == "undefined" || optionalNumberOfDecimals == null) {
		optionalNumberOfDecimals = 5
	}

	return "(" +
		   vec[0].toFixed(optionalNumberOfDecimals) + ", " + 
		   vec[1].toFixed(optionalNumberOfDecimals) + ", " +
		   vec[2].toFixed(optionalNumberOfDecimals) 
		   + ")";
}