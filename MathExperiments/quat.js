// Quaternion is stored as a 4D array, in <x ,y, z, w> order
// http://danceswithcode.net/engineeringnotes/quaternions/quaternions.html
// https://math.stackexchange.com/questions/302465/half-sine-and-half-cosine-quaternions

// Unreal:
//    https://github.com/EpicGames/UnrealEngine/blob/08ee319f80ef47dbf0988e14b546b65214838ec4/Engine/Source/Runtime/Core/Public/Math/Quat.h

// Create quaternions
function Q_Identity() {
	return [0, 0, 0, 1];
}

// https://math.stackexchange.com/questions/1637243/quaternions-why-is-the-angle-frac-theta2
// https://math.stackexchange.com/questions/1385028/concise-description-of-why-rotation-quaternions-use-half-the-angle
// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/notations/scalarAndVector/index.htm
// http://wiki.roblox.com/index.php?title=User:EgoMoose/Articles/Quaternions_and_slerping
// https://www.essentialmath.com/GDC2013/GDC13_quaternions_final.pdfhttps://www.essentialmath.com/GDC2013/GDC13_quaternions_final.pdf
// https://www.kisspng.com/png-line-point-angle-quaternion-5389831/
function Q_AngleAxis(angleInDegrees, vec3NormalAxis) {

}

function Q_ShortestArc(vec3StartPoint, vec3EndPoint) {

}

function Q_LookAt(vec3Forward, vec3Up) {

}

// TODO: From euler???

// Quaternion functions
function Q_Inverse(quat) {

}

function Q_Magnitude(quat) {

}

function Q_SqrMagnitude(quat) {

}

function Q_Normalize(quat) {

}

// Interpolate
function Slerp(quat1, quat2, t) {

}

// TODO: NLERP and others?

// Math additions
function Q_Mul_Q(quat1, quat2) {

}

function Q_Add_Q(quat1, quat2) {

}

// TODO: What's the proper multiplication order? qpq*
function Q_Mul_V3(quat, vec) {

}

// Conversion functions
function Q_To_Euler(quat) {

}

function Q_To_Angle(quat) {

}

function Q_To_Axis(quat) {

}

function Q_To_M3(quat) {

}

function Q_To_M4(quat) {

}

function Q_From_M3(mat) {

}

function Q_From_M4(mat) {

}

// Conveniance
function M3_To_Q(mat) {
	return Q_From_M3(mat);
}

function M4_To_Q(mat) {
	return Q_From_M4(mat);
}

function Q_IsNormalized(quat) {

}

function Q_To_Str(quat) {

}

function Q_Angle_Q(quat1, quat2) {

}