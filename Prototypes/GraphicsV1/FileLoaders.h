#pragma once

struct TextureFile {
	unsigned int width;
	unsigned int height;
	unsigned int channels;
	void* data;
};

struct MeshFile {
	unsigned int numPos;
	unsigned int numNrm;
	unsigned int numTex;
	float* pos;
	float* nrm;
	float* tex;
};

MeshFile* LoadMesh(const char* path); 
TextureFile* LoadTexture(const char* path);

void ReleaseMesh(MeshFile* file);
void ReleaseTexture(TextureFile* file);