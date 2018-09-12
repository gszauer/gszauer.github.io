// Quaternion is stored as a 4D array, in <x ,y, z, w> order



// Create quaternions
function Q_Identity() {

}

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