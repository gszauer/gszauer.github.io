#version 330 core
out vec4 FragColor;
in vec2 TexCoords;
uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;
const int NR_LIGHTS = 36;
uniform vec3 lightPositions[NR_LIGHTS];
uniform vec3 lightColors[NR_LIGHTS];
uniform float lightLinears[NR_LIGHTS];
uniform float lightQuadratics[NR_LIGHTS];
uniform vec3 viewPos;
void main() {
	// retrieve data from gbuffer
	vec3 FragPos = texture(gPosition, TexCoords).rgb;
	vec3 Normal = texture(gNormal, TexCoords).rgb;
	vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;
	float Specular = texture(gAlbedoSpec, TexCoords).a;
	// then calculate lighting as usual
	vec3 lighting = Diffuse * 0.1; // hard-coded ambient component
	vec3 viewDir = normalize(viewPos - FragPos);
	for (int i = 0; i < NR_LIGHTS; ++i) {
		// diffuse
		vec3 lightDir = normalize(lightPositions[i] - FragPos);
		vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * lightColors[i];
		// specular
		vec3 halfwayDir = normalize(lightDir + viewDir);
		float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
		vec3 specular = lightColors[i] * spec * Specular;
		// attenuation
		float distance = length(lightPositions[i] - FragPos);
		float attenuation = 1.0 / (1.0 + lightLinears[i] * distance + lightQuadratics[i] * distance * distance);
		diffuse *= attenuation;
		specular *= attenuation;
		lighting += diffuse + specular;
	}
	FragColor = vec4(lighting, 1.0);
}