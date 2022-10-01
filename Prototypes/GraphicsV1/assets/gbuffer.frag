#version 330 core
out vec3 gPosition;
out vec3 gNormal;
out vec4 gAlbedoSpec;
in vec2 TexCoords;
in vec3 FragPos;
in vec3 Normal;
uniform sampler2D texDiffuseSpec;
uniform sampler2D texNormal;
uniform mat4 model;
void main() {
	gPosition = FragPos;
   	mat3 normalMatrix = transpose(inverse(mat3(model)));
	gNormal = normalize(normalMatrix * (texture(texNormal, TexCoords).rgb * 2.0 - 1.0));
   	vec4 colSample = texture(texDiffuseSpec, TexCoords);
	gAlbedoSpec.rgb = colSample.rgb;
	gAlbedoSpec.a = colSample.a;
}