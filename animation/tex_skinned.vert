#version 100
precision mediump float;

uniform mat4 model;
uniform mat4 mvp;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
attribute vec4 weights;
attribute vec4 joints;

uniform mat4 pose[43];
uniform mat4 invBindPose[43];

varying vec3 norm;
varying vec3 fragPos;
varying vec2 uv;

void main() {
	ivec4 j = ivec4(
		int(joints.x + 0.3),
		int(joints.y + 0.3),
		int(joints.z + 0.3),
		int(joints.w + 0.3)
	);
	mat4 skin = (pose[j.x] * invBindPose[j.x]) * weights.x;
		 skin += (pose[j.y] * invBindPose[j.y]) * weights.y;
		 skin += (pose[j.z] * invBindPose[j.z]) * weights.z;
		 skin += (pose[j.w] * invBindPose[j.w]) * weights.w;

	gl_Position = mvp * skin * vec4(position, 1.0);

	fragPos = vec3(model * skin * vec4(position, 1.0));
	norm = vec3(model * skin * vec4(normal, 0.0));
	uv = texCoord;
}
