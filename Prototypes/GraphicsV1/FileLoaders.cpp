#include "FileLoaders.h"
#include <windows.h>

MeshFile* LoadMesh(const char* path) {
	HANDLE hFile = CreateFileA(path, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	DWORD bytesRead = 0;

	unsigned int sizes[3];

	if (hFile == INVALID_HANDLE_VALUE) {
		return 0;
	}
	if (ReadFile(hFile, sizes, sizeof(unsigned int) * 3, &bytesRead, NULL) == 0) {
		CloseHandle(hFile);
		return 0;
	}

	unsigned int mem_needed = sizeof(MeshFile) + sizeof(float) * 3 * sizes[0] + sizeof(float) * 3 * sizes[1] + sizeof(float) * 2 * sizes[2];
	void* mem = VirtualAlloc(0, mem_needed + 1, MEM_COMMIT, PAGE_READWRITE);
	unsigned char* iter = (unsigned char* )mem;
	
	MeshFile* result = (MeshFile*)iter;
	iter += sizeof(MeshFile);

	float* pos = (float*)iter;
	if (sizes[0] != 0) {
		if (ReadFile(hFile, pos, sizeof(float) * 3 * sizes[0], &bytesRead, NULL) == 0) {
			CloseHandle(hFile);
			return 0;
		}
		iter += sizeof(float) * 3 * sizes[0];
	}

	float* nrm = (float*)iter;
	if (sizes[1] != 0) {
		if (ReadFile(hFile, nrm, sizeof(float) * 3 * sizes[1], &bytesRead, NULL) == 0) {
			CloseHandle(hFile);
			return 0;
		}
		iter += sizeof(float) * 3 * sizes[1];
	}

	float* tex = (float*)iter;
	if (sizes[2] != 0) {
		if (ReadFile(hFile, tex, sizeof(float) * 2 * sizes[2], &bytesRead, NULL) == 0) {
			CloseHandle(hFile);
			return 0;
		}
	}
	CloseHandle(hFile);

	result->numPos = sizes[0];
	result->numNrm = sizes[1];
	result->numTex = sizes[2];
	result->pos = pos;
	result->nrm = nrm;
	result->tex = tex;

	return result;
}

TextureFile* LoadTexture(const char* path) {
	HANDLE hFile = CreateFileA(path, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	DWORD bytesRead = 0;

	unsigned int sizes[3];

	if (hFile == INVALID_HANDLE_VALUE) {
		return 0;
	}
	if (ReadFile(hFile, sizes, sizeof(unsigned int) * 3, &bytesRead, NULL) == 0) {
		CloseHandle(hFile);
		return 0;
	}

	unsigned int mem_needed = sizeof(TextureFile) + sizeof(unsigned char) * sizes[0] * sizes[1] * sizes[2];
	void* mem = VirtualAlloc(0, mem_needed + 1, MEM_COMMIT, PAGE_READWRITE);
	unsigned char* iter = (unsigned char*)mem;

	TextureFile* result = (TextureFile*)iter;
	iter += sizeof(TextureFile);

	unsigned char* texData = (unsigned char*)iter;
	if (sizes[0] * sizes[1] * sizes[2] != 0) {
		if (ReadFile(hFile, texData, sizeof(unsigned char) * sizes[0] * sizes[1] * sizes[2], &bytesRead, NULL) == 0) {
			CloseHandle(hFile);
			return 0;
		}
	}
	
	CloseHandle(hFile);

	result->width = sizes[0];
	result->height = sizes[1];
	result->channels = sizes[2];
	result->data = texData;

	return result;
}

void ReleaseMesh(MeshFile* file) {
	VirtualFree(file, 0, MEM_RELEASE);
}

void ReleaseTexture(TextureFile* file) {
	VirtualFree(file, 0, MEM_RELEASE);
}