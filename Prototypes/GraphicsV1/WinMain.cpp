#pragma warning(disable : 28251)
#pragma warning(disable : 28159)

#include "gl.h"
#undef APIENTRY
#include <Windows.h>
#include "Graphics.h"
#include "math.h"
#include "FileLoaders.h"

 extern "C" int _fltused = 1;

char buf[1024];
Graphics::Device* gfx;

void Initialize();
void Update(float deltaTime);
void Render(int x, int y, int w, int h);
void Shutdown();

static void WinAssert(bool condition) {
#if _WASM32
	if (condition == false) {
		__builtin_trap();
	}
#else
	char* data = (char*)((void*)0);
	if (condition == false) {
		*data = '\0';
	}
#endif
}

#if 0
#pragma intrinsic(memcpy)
#pragma function(memcpy)
extern "C" void* memcpy(void* dst, const void* src, unsigned long long bytes) {
	unsigned char* d = (unsigned char*)dst;
	unsigned char* s = (unsigned char*)src;
	for (unsigned int i = 0; i < bytes; ++i) {
		d[i] = s[i];
	}
	return dst;
}

#pragma intrinsic(memset)
#pragma function(memset)
extern "C" void* memset(void* str, int c, unsigned long long n) {
	unsigned char* s = (unsigned char*)str;
	for (unsigned int i = 0; i < n; ++i) {
		s[i] = c;
	}

	return str;
}
#endif


void* RequestMem(u32 bytes) {
	return VirtualAlloc(0, bytes, MEM_COMMIT, PAGE_READWRITE);
}

void ReleaseMem(void* mem) {
	VirtualFree(mem, 0, MEM_RELEASE);
}

#pragma comment(lib, "opengl32.lib")

void printf(const char* pszFormat, ...) {
    va_list argList;
    va_start(argList, pszFormat);
    wvsprintfA(buf, pszFormat, argList);
    va_end(argList);
    DWORD done;
    unsigned int len = 0;
    for (char* c = buf; *c != '\0'; ++c, ++len) {
        if (len >= 1024) {
            len = 1024;
            break;
        }
    }
    WriteFile(GetStdHandle(STD_OUTPUT_HANDLE), buf, (DWORD)len, &done, NULL);
}

const char* FindStringInString(const char* string, const char*substring) {
	const char* a, * b;

	b = substring;
	if (*b == 0) {
		return string;
	}
	for (; *string != 0; string += 1) {
		if (*string != *b) {
			continue;
		}
		a = string;
		while (1) {
			if (*b == 0) {
				return string;
			}
			if (*a++ != *b++) {
				break;
			}
		}
		b = substring;
	}
	return NULL;
}

int WINAPI WinMain(HINSTANCE, HINSTANCE, PSTR, int);
LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);

int run() {
    printf("Hello, world\n");
	return WinMain(GetModuleHandle(NULL), NULL, GetCommandLineA(), SW_SHOWDEFAULT);
	return 0;
}

#define WGL_CONTEXT_MAJOR_VERSION_ARB     0x2091
#define WGL_CONTEXT_MINOR_VERSION_ARB     0x2092
#define WGL_CONTEXT_FLAGS_ARB             0x2094
#define WGL_CONTEXT_CORE_PROFILE_BIT_ARB  0x00000001
#define WGL_CONTEXT_PROFILE_MASK_ARB      0x9126
typedef HGLRC(WINAPI* PFNWGLCREATECONTEXTATTRIBSARBPROC) (HDC, HGLRC, const int*);

typedef const char* (WINAPI* PFNWGLGETEXTENSIONSSTRINGEXTPROC) (void);
typedef BOOL(WINAPI* PFNWGLSWAPINTERVALEXTPROC) (int);
typedef int (WINAPI* PFNWGLGETSWAPINTERVALEXTPROC) (void);

#define _CRT_SECURE_NO_WARNINGS
#define WIN32_LEAN_AND_MEAN
#define WIN32_EXTRA_LEAN

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PSTR szCmdLine, int iCmdShow) {
	WNDCLASSEX wndclass;
	wndclass.cbSize = sizeof(WNDCLASSEX);
	wndclass.style = CS_HREDRAW | CS_VREDRAW;
	wndclass.lpfnWndProc = WndProc;
	wndclass.cbClsExtra = 0;
	wndclass.cbWndExtra = 0;
	wndclass.hInstance = hInstance;
	wndclass.hIcon = LoadIcon(NULL, IDI_APPLICATION);
	wndclass.hIconSm = LoadIcon(NULL, IDI_APPLICATION);
	wndclass.hCursor = LoadCursor(NULL, IDC_ARROW);
	wndclass.hbrBackground = (HBRUSH)(COLOR_BTNFACE + 1);
	wndclass.lpszMenuName = 0;
	wndclass.lpszClassName = L"Win32 Game Window";
	RegisterClassEx(&wndclass);

	int screenWidth = GetSystemMetrics(SM_CXSCREEN);
	int screenHeight = GetSystemMetrics(SM_CYSCREEN);
	int clientWidth = 800;
	int clientHeight = 600;
	RECT windowRect;
	SetRect(&windowRect, (screenWidth / 2) - (clientWidth / 2), (screenHeight / 2) - (clientHeight / 2), (screenWidth / 2) + (clientWidth / 2), (screenHeight / 2) + (clientHeight / 2));

	DWORD style = (WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX | WS_MAXIMIZEBOX); // WS_THICKFRAME to resize
	AdjustWindowRectEx(&windowRect, style, FALSE, 0);
	HWND hwnd = CreateWindowEx(0, wndclass.lpszClassName, L"Game Window", style, windowRect.left, windowRect.top, windowRect.right - windowRect.left, windowRect.bottom - windowRect.top, NULL, NULL, hInstance, szCmdLine);
	HDC hdc = GetDC(hwnd);

	PIXELFORMATDESCRIPTOR pfd;
	{ // memset(&pfd, 0, sizeof(PIXELFORMATDESCRIPTOR));
		unsigned char* target = (unsigned char*)&pfd;
		for (unsigned int i = 0; i < sizeof(PIXELFORMATDESCRIPTOR); ++i) {
			target[i] = 0;
		}
	}
	
	pfd.nSize = sizeof(PIXELFORMATDESCRIPTOR);
	pfd.nVersion = 1;
	pfd.dwFlags = PFD_SUPPORT_OPENGL | PFD_DRAW_TO_WINDOW | PFD_DOUBLEBUFFER;
	pfd.iPixelType = PFD_TYPE_RGBA;
	pfd.cColorBits = 24;
	pfd.cDepthBits = 32;
	pfd.cStencilBits = 8;
	pfd.iLayerType = PFD_MAIN_PLANE;
	int pixelFormat = ChoosePixelFormat(hdc, &pfd);
	SetPixelFormat(hdc, pixelFormat, &pfd);

	HGLRC tempRC = wglCreateContext(hdc);
	wglMakeCurrent(hdc, tempRC);
	PFNWGLCREATECONTEXTATTRIBSARBPROC wglCreateContextAttribsARB = NULL;
	wglCreateContextAttribsARB = (PFNWGLCREATECONTEXTATTRIBSARBPROC)wglGetProcAddress("wglCreateContextAttribsARB");

	const int attribList[] = {
		WGL_CONTEXT_MAJOR_VERSION_ARB, 3,
		WGL_CONTEXT_MINOR_VERSION_ARB, 3,
		WGL_CONTEXT_FLAGS_ARB, 0,
		WGL_CONTEXT_PROFILE_MASK_ARB, WGL_CONTEXT_CORE_PROFILE_BIT_ARB,
		0,
	};

	HGLRC hglrc = wglCreateContextAttribsARB(hdc, 0, attribList);

	wglMakeCurrent(NULL, NULL);
	wglDeleteContext(tempRC);
	wglMakeCurrent(hdc, hglrc);

	/*if (!gladLoadGL()) {
		std::cout << "Could not initialize GLAD\n";
	}
	else {
		std::cout << "OpenGL Version " << GLVersion.major << "." << GLVersion.minor << " loaded\n";
	}*/

	PFNWGLGETEXTENSIONSSTRINGEXTPROC _wglGetExtensionsStringEXT = (PFNWGLGETEXTENSIONSSTRINGEXTPROC)wglGetProcAddress("wglGetExtensionsStringEXT");
	bool swapControlSupported = FindStringInString(_wglGetExtensionsStringEXT(), "WGL_EXT_swap_control") != 0;

	int vsynch = 0;
	if (swapControlSupported) {
		PFNWGLSWAPINTERVALEXTPROC wglSwapIntervalEXT = (PFNWGLSWAPINTERVALEXTPROC)wglGetProcAddress("wglSwapIntervalEXT");
		PFNWGLGETSWAPINTERVALEXTPROC wglGetSwapIntervalEXT = (PFNWGLGETSWAPINTERVALEXTPROC)wglGetProcAddress("wglGetSwapIntervalEXT");

		if (wglSwapIntervalEXT(1)) {
			printf("Enabled vsynch\n");
			vsynch = wglGetSwapIntervalEXT();
		}
		else {
			printf("Could not enable vsynch\n");
		}
	}
	else { // !swapControlSupported
		printf("WGL_EXT_swap_control not supported\n");
	}

	ShowWindow(hwnd, SW_SHOW);
	UpdateWindow(hwnd);
	Initialize();

	DWORD lastTick = GetTickCount();
	MSG msg;
	while (true) {
		if (PeekMessage(&msg, NULL, 0, 0, PM_REMOVE)) {
			if (msg.message == WM_QUIT) {
				break;
			}
			TranslateMessage(&msg);
			DispatchMessage(&msg);
		}
		DWORD thisTick = GetTickCount();
		float deltaTime = float(thisTick - lastTick) * 0.001f;
		lastTick = thisTick;

		RECT clientRect;
		GetClientRect(hwnd, &clientRect);
		clientWidth = clientRect.right - clientRect.left;
		clientHeight = clientRect.bottom - clientRect.top;

		Update(deltaTime);
		Render(0, 0, clientWidth, clientHeight);

		SwapBuffers(hdc);
		if (vsynch != 0) {
			glFinish();
		}
	} // End of game loop

	return (int)msg.wParam;
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT iMsg, WPARAM wParam, LPARAM lParam) {
	switch (iMsg) {
	case WM_CLOSE:
		DestroyWindow(hwnd);
		break;
	case WM_DESTROY:
		{
			Shutdown();
			
			HDC hdc = GetDC(hwnd);
			HGLRC hglrc = wglGetCurrentContext();

			wglMakeCurrent(NULL, NULL);
			wglDeleteContext(hglrc);
			ReleaseDC(hwnd, hdc);

			PostQuitMessage(0);
		}
		return 0;
	case WM_PAINT:
	case WM_ERASEBKGND:
		return 0;
	}

	return DefWindowProc(hwnd, iMsg, wParam, lParam);
}

const char* gBufferVertexShader = "#version 330 core\n"
	"layout(location = 0) in vec3 aPos;\n"
	"layout(location = 1) in vec3 aNormal;\n"
	"layout(location = 2) in vec2 aTexCoords;\n"
	"out vec3 FragPos;\n"
	"out vec2 TexCoords;\n"
	"out vec3 Normal;\n"
	"uniform mat4 model;\n"
	"uniform mat4 view;\n"
	"uniform mat4 projection;\n"
	"void main() {\n"
	"	vec4 worldPos = model * vec4(aPos, 1.0);\n"
	"	FragPos = worldPos.xyz;\n"
	"	TexCoords = aTexCoords;\n"
	"	mat3 normalMatrix = transpose(inverse(mat3(model)));\n"
	"	Normal = normalMatrix * aNormal;\n"
	"	gl_Position = projection * view * worldPos;\n"
	"}\n\0";

const char* gBufferFragmentShader = "#version 330 core\n"
	"layout(location = 0) out vec3 gPosition;\n"
	"layout(location = 1) out vec3 gNormal;\n"
	"layout(location = 2) out vec4 gAlbedoSpec;\n"
	"in vec2 TexCoords;\n"
	"in vec3 FragPos;\n"
	"in vec3 Normal;\n"
	"uniform sampler2D texDiffuseSpec;\n"
	"uniform sampler2D texNormal;\n"
	"uniform mat4 model;\n"
	"void main() {\n"
	"	gPosition = FragPos;\n"
	"   mat3 normalMatrix = transpose(inverse(mat3(model)));"
	"	gNormal = normalize(normalMatrix * (texture(texNormal, TexCoords).rgb * 2.0 - 1.0));\n"
	"   vec4 sample = texture(texDiffuseSpec, TexCoords);\n"
	"	gAlbedoSpec.rgb = sample.rgb;\n"
	"	gAlbedoSpec.a = sample.a;\n"
	"}\n\0";

const char* lightVertexShader = "#version 330 core\n"
	"layout(location = 0) in vec3 aPos;\n"
	"layout(location = 1) in vec2 aTexCoords;\n"
	"out vec2 TexCoords;\n"
	"void main() {\n"
	"	TexCoords = aTexCoords;\n"
	"	gl_Position = vec4(aPos, 1.0);\n"
	"}\n\0";

const char* blitFragmentShader = "#version 330 core\n"
	"out vec4 FragColor;\n"
	"in  vec2 TexCoords;\n"
	"uniform sampler2D fboAttachment;\n"
	"void main() {\n"
	"	FragColor = texture(fboAttachment, TexCoords);\n"
	"}\n\0";

const char* lightFragmentShader = "#version 330 core\n"
	"out vec4 FragColor;\n"
	"in vec2 TexCoords;\n"
	"uniform sampler2D gPosition;\n"
	"uniform sampler2D gNormal;\n"
	"uniform sampler2D gAlbedoSpec;\n"
	"const int NR_LIGHTS = 36;\n"
	"uniform vec3 lightPositions[NR_LIGHTS];\n"
	"uniform vec3 lightColors[NR_LIGHTS];\n"
	"uniform float lightLinears[NR_LIGHTS];\n"
	"uniform float lightQuadratics[NR_LIGHTS];\n"
	"uniform vec3 viewPos;\n"
	"void main() {\n"
	"	// retrieve data from gbuffer\n"
	"	vec3 FragPos = texture(gPosition, TexCoords).rgb;\n"
	"	vec3 Normal = texture(gNormal, TexCoords).rgb;\n"
	"	vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;\n"
	"	float Specular = texture(gAlbedoSpec, TexCoords).a;\n"
	"	// then calculate lighting as usual\n"
	"	vec3 lighting = Diffuse * 0.1; // hard-coded ambient component\n"
	"	vec3 viewDir = normalize(viewPos - FragPos);\n"
	"	for (int i = 0; i < NR_LIGHTS; ++i) {\n"
	"		// diffuse\n"
	"		vec3 lightDir = normalize(lightPositions[i] - FragPos);\n"
	"		vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * lightColors[i];\n"
	"		// specular\n"
	"		vec3 halfwayDir = normalize(lightDir + viewDir);\n"
	"		float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);\n"
	"		vec3 specular = lightColors[i] * spec * Specular;\n"
	"		// attenuation\n"
	"		float distance = length(lightPositions[i] - FragPos);\n"
	"		float attenuation = 1.0 / (1.0 + lightLinears[i] * distance + lightQuadratics[i] * distance * distance);\n"
	"		diffuse *= attenuation;\n"
	"		specular *= attenuation;\n"
	"		lighting += diffuse + specular;\n"
	"	}\n"
	"	FragColor = vec4(lighting, 1.0);\n"
	"}\n\0";

const char* visualizerVertexShader = "#version 330 core\n"
	"layout(location = 0) in vec3 aPos;\n"
	"layout(location = 1) in vec3 aNormal;\n"
	"layout(location = 2) in vec2 aTexCoords;\n"
	"uniform mat4 projection;\n"
	"uniform mat4 view;\n"
	"uniform mat4 model;\n"
	"void main() {\n"
	"	gl_Position = projection * view * model * vec4(aPos, 1.0);\n"
	"}\n\0";

const char* visualizerFragmentShader = "#version 330 core\n"
	"layout(location = 0) out vec4 FragColor;\n"
	"uniform vec3 lightColor;\n"
	"void main() {\n"
	"	FragColor = vec4(lightColor, 1.0);\n"
	"}\n\0";

/// GBuffer
Graphics::FrameBuffer* gBuffer;
Graphics::Shader* gBufferShader;
Graphics::Texture* gBufferPosition;
Graphics::Texture* gBufferNormal;
Graphics::Texture* gBufferColorSpec;
Graphics::Texture* gBufferDepth;

Graphics::Index gBufferUniformAlbedoSpec;
Graphics::Index gBufferUniformNormal;
Graphics::Index gBufferUniformModel;
Graphics::Index gBufferUniformView;
Graphics::Index gBufferUniformProjection;
Graphics::Index gBufferAttribPosition;
Graphics::Index gBufferAttribNormal;
Graphics::Index gBufferAttributeTexCoord;

/// Color pass
Graphics::Shader* lightShader;
Graphics::Index lightAttribPos;
Graphics::Index lightAttribUv;
Graphics::Index lightSampler2DTexPos;
Graphics::Index lightSampler2DTexNorm;
Graphics::Index lightSampler2DTexAlbedoSpec;
Graphics::Index lightUniformLightPositions;
Graphics::Index lightUniformLightColors;
Graphics::Index lightUniformLightLinears;
Graphics::Index lightUniformLightQuadratics;
Graphics::Index lightUniformViewPos;
Graphics::Buffer* lightQuad;

// Visualization pass
Graphics::Shader* visualizerShader;
Graphics::Index visualizerAttribPos;
Graphics::Index visualizerAttribNrm;
Graphics::Index visualizerAttribTex;
Graphics::Index visualizerUniformModel;
Graphics::Index visualizerUniformView;
Graphics::Index visualizerUniformProjection;
Graphics::Index visualizerUniformColor;
Graphics::Buffer* visualizerBuffer;

// Visualize buffers
Graphics::Shader* fboVisualizerShader;
Graphics::Index fboVisualizerAttribPos;
Graphics::Index fboVisualizerAttribNrm;
Graphics::Index fboVisualizerUniformTex;

//// Skull
Graphics::Buffer* skullData;
Graphics::Texture* skullAlbedo;
Graphics::Texture* skullNormal;


bool IsRunning = true;
float cameraRadius;
float cameraHeight;
vec3 cameraTarget;
float camTime;
float lightTime;
float lightDir;

const unsigned int NR_LIGHTS = 36;
vec3 lightPositions[NR_LIGHTS];
vec3 lightColors[NR_LIGHTS];

void Initialize() {
	Graphics::Dependencies alloc;
	alloc.Request = RequestMem;
	alloc.Release = ReleaseMem;
	IsRunning = true;

	cameraRadius = 6.0f;
	cameraHeight = 1.0f;
	camTime = lightTime =0.0f;
	lightDir = 1.0f;
	cameraTarget.y = 0.0f;

	gfx = Graphics::Initialize(*(Graphics::Device*)RequestMem(sizeof(Graphics::Device)), alloc);
	
	/// Initialize GBuffer
#if 1
	gBufferPosition = gfx->CreateTexture(0, 800, 600, Graphics::TextureFormat::RGBA16F, false);
	gBufferNormal = gfx->CreateTexture(0, 800, 600, Graphics::TextureFormat::RGBA16F, false);
	gBufferColorSpec = gfx->CreateTexture(0, 800, 600, Graphics::TextureFormat::RGBA, false);
	gBufferDepth = gfx->CreateTexture(0, 800, 600, Graphics::TextureFormat::Depth32, false);

	gBuffer = gfx->CreateFrameBuffer();
	gBuffer->AttachColor(*gBufferPosition, 0);
	gBuffer->AttachColor(*gBufferNormal, 1);
	gBuffer->AttachColor(*gBufferColorSpec, 2);
	gBuffer->AttachDepth(*gBufferDepth);

	if (!gBuffer->IsValid()) {
		const char* devNull = (const char*)0;
		devNull = "crash";
	}

	gBufferShader = gfx->CreateShader(gBufferVertexShader, gBufferFragmentShader);
	gBufferUniformAlbedoSpec =  gBufferShader->GetUniform("texDiffuseSpec");
	gBufferUniformNormal = gBufferShader->GetUniform("texNormal");
	gBufferUniformModel = gBufferShader->GetUniform("model");
	gBufferUniformView = gBufferShader->GetUniform("view");
	gBufferUniformProjection = gBufferShader->GetUniform("projection");
	gBufferAttribPosition = gBufferShader->GetAttribute("aPos");
	gBufferAttribNormal = gBufferShader->GetAttribute("aNormal");
	gBufferAttributeTexCoord = gBufferShader->GetAttribute("aTexCoords");
#endif

	lightQuad = gfx->CreateBuffer();
	float quadVertices[] = {
		// positions        // texture Coords
		-1.0f,  1.0f, 0.0f, 0.0f, 1.0f,
		-1.0f, -1.0f, 0.0f, 0.0f, 0.0f,
		 1.0f,  1.0f, 0.0f, 1.0f, 1.0f,
		 1.0f, -1.0f, 0.0f, 1.0f, 0.0f,
	};
	lightQuad->Set(quadVertices, sizeof(float) * 20);

	visualizerBuffer = gfx->CreateBuffer();
	float cubeVertices[] = {
		// back face
		-1.0f, -1.0f, -1.0f,  0.0f,  0.0f, -1.0f, 0.0f, 0.0f, // bottom-left
		 1.0f,  1.0f, -1.0f,  0.0f,  0.0f, -1.0f, 1.0f, 1.0f, // top-right
		 1.0f, -1.0f, -1.0f,  0.0f,  0.0f, -1.0f, 1.0f, 0.0f, // bottom-right         
		 1.0f,  1.0f, -1.0f,  0.0f,  0.0f, -1.0f, 1.0f, 1.0f, // top-right
		-1.0f, -1.0f, -1.0f,  0.0f,  0.0f, -1.0f, 0.0f, 0.0f, // bottom-left
		-1.0f,  1.0f, -1.0f,  0.0f,  0.0f, -1.0f, 0.0f, 1.0f, // top-left
		// front face
		-1.0f, -1.0f,  1.0f,  0.0f,  0.0f,  1.0f, 0.0f, 0.0f, // bottom-left
		 1.0f, -1.0f,  1.0f,  0.0f,  0.0f,  1.0f, 1.0f, 0.0f, // bottom-right
		 1.0f,  1.0f,  1.0f,  0.0f,  0.0f,  1.0f, 1.0f, 1.0f, // top-right
		 1.0f,  1.0f,  1.0f,  0.0f,  0.0f,  1.0f, 1.0f, 1.0f, // top-right
		-1.0f,  1.0f,  1.0f,  0.0f,  0.0f,  1.0f, 0.0f, 1.0f, // top-left
		-1.0f, -1.0f,  1.0f,  0.0f,  0.0f,  1.0f, 0.0f, 0.0f, // bottom-left
		// left face
		-1.0f,  1.0f,  1.0f, -1.0f,  0.0f,  0.0f, 1.0f, 0.0f, // top-right
		-1.0f,  1.0f, -1.0f, -1.0f,  0.0f,  0.0f, 1.0f, 1.0f, // top-left
		-1.0f, -1.0f, -1.0f, -1.0f,  0.0f,  0.0f, 0.0f, 1.0f, // bottom-left
		-1.0f, -1.0f, -1.0f, -1.0f,  0.0f,  0.0f, 0.0f, 1.0f, // bottom-left
		-1.0f, -1.0f,  1.0f, -1.0f,  0.0f,  0.0f, 0.0f, 0.0f, // bottom-right
		-1.0f,  1.0f,  1.0f, -1.0f,  0.0f,  0.0f, 1.0f, 0.0f, // top-right
		// right face
		 1.0f,  1.0f,  1.0f,  1.0f,  0.0f,  0.0f, 1.0f, 0.0f, // top-left
		 1.0f, -1.0f, -1.0f,  1.0f,  0.0f,  0.0f, 0.0f, 1.0f, // bottom-right
		 1.0f,  1.0f, -1.0f,  1.0f,  0.0f,  0.0f, 1.0f, 1.0f, // top-right         
		 1.0f, -1.0f, -1.0f,  1.0f,  0.0f,  0.0f, 0.0f, 1.0f, // bottom-right
		 1.0f,  1.0f,  1.0f,  1.0f,  0.0f,  0.0f, 1.0f, 0.0f, // top-left
		 1.0f, -1.0f,  1.0f,  1.0f,  0.0f,  0.0f, 0.0f, 0.0f, // bottom-left     
		 // bottom face
		 -1.0f, -1.0f, -1.0f,  0.0f, -1.0f,  0.0f, 0.0f, 1.0f, // top-right
		  1.0f, -1.0f, -1.0f,  0.0f, -1.0f,  0.0f, 1.0f, 1.0f, // top-left
		  1.0f, -1.0f,  1.0f,  0.0f, -1.0f,  0.0f, 1.0f, 0.0f, // bottom-left
		  1.0f, -1.0f,  1.0f,  0.0f, -1.0f,  0.0f, 1.0f, 0.0f, // bottom-left
		 -1.0f, -1.0f,  1.0f,  0.0f, -1.0f,  0.0f, 0.0f, 0.0f, // bottom-right
		 -1.0f, -1.0f, -1.0f,  0.0f, -1.0f,  0.0f, 0.0f, 1.0f, // top-right
		 // top face
		 -1.0f,  1.0f, -1.0f,  0.0f,  1.0f,  0.0f, 0.0f, 1.0f, // top-left
		  1.0f,  1.0f , 1.0f,  0.0f,  1.0f,  0.0f, 1.0f, 0.0f, // bottom-right
		  1.0f,  1.0f, -1.0f,  0.0f,  1.0f,  0.0f, 1.0f, 1.0f, // top-right     
		  1.0f,  1.0f,  1.0f,  0.0f,  1.0f,  0.0f, 1.0f, 0.0f, // bottom-right
		 -1.0f,  1.0f, -1.0f,  0.0f,  1.0f,  0.0f, 0.0f, 1.0f, // top-left
		 -1.0f,  1.0f,  1.0f,  0.0f,  1.0f,  0.0f, 0.0f, 0.0f  // bottom-left        
	};
	visualizerBuffer->Set(cubeVertices, sizeof(float) * 288);

	/// Initialize skull
	MeshFile* skullMesh = LoadMesh("assets/skull.mesh");

	u32 mem_needed = sizeof(float) * 3 * skullMesh->numPos;
	u32 iter_size = skullMesh->numPos;
	if (skullMesh->numNrm > 0) {
		mem_needed += sizeof(float) * 3 * skullMesh->numNrm;
	}
	if (skullMesh->numTex > 0) {
		mem_needed += sizeof(float) * 2 * skullMesh->numTex;
	}

	float* mem = (float*)VirtualAlloc(0, mem_needed + 1, MEM_COMMIT, PAGE_READWRITE);
	u32 iter = 0;
	for (u32 i = 0; i < iter_size; ++i) {
		mem[iter++] = skullMesh->pos[i * 3 + 0];
		mem[iter++] = skullMesh->pos[i * 3 + 1];
		mem[iter++] = skullMesh->pos[i * 3 + 2];
		mem[iter++] = skullMesh->nrm[i * 3 + 0];
		mem[iter++] = skullMesh->nrm[i * 3 + 1];
		mem[iter++] = skullMesh->nrm[i * 3 + 2];
		mem[iter++] = skullMesh->tex[i * 2 + 0];
		mem[iter++] = skullMesh->tex[i * 2 + 1];
	}

	skullData = gfx->CreateBuffer(mem, mem_needed);
	skullData->SetUserData(skullMesh->numPos);
	VirtualFree(mem, 0, MEM_RELEASE);
	ReleaseMesh(skullMesh);

	skullAlbedo = gfx->CreateTexture();
	TextureFile* albedo = LoadTexture("assets/Skull_AlbedoSpec.texture");
	skullAlbedo->Set(albedo->data, albedo->width, albedo->height, albedo->channels == 3 ? Graphics::TextureFormat::RGB : Graphics::TextureFormat::RGBA, true);
	ReleaseTexture(albedo);

	skullNormal = gfx->CreateTexture();
	TextureFile* normal = LoadTexture("assets/Skull_Normal.texture");
	skullNormal->Set(normal->data, normal->width, normal->height, normal->channels == 3 ? Graphics::TextureFormat::RGB : Graphics::TextureFormat::RGBA, true);
	ReleaseTexture(normal);

	lightShader = gfx->CreateShader(lightVertexShader, lightFragmentShader);

	lightAttribPos = lightShader->GetAttribute("aPos");
	lightAttribUv = lightShader->GetAttribute("aTexCoords");
	lightSampler2DTexPos = lightShader->GetUniform("gPosition");
	lightSampler2DTexNorm = lightShader->GetUniform("gNormal");
	lightSampler2DTexAlbedoSpec = lightShader->GetUniform("gAlbedoSpec");
	lightUniformViewPos = lightShader->GetUniform("viewPos");

	lightUniformLightPositions = lightShader->GetUniform("lightPositions[0]");
	lightUniformLightColors = lightShader->GetUniform("lightColors[0]");
	lightUniformLightLinears = lightShader->GetUniform("lightLinears[0]");
	lightUniformLightQuadratics = lightShader->GetUniform("lightQuadratics[0]");

	visualizerShader = gfx->CreateShader(visualizerVertexShader, visualizerFragmentShader);
	visualizerAttribPos = visualizerShader->GetAttribute("aPos");
	visualizerAttribNrm = visualizerShader->GetAttribute("aNormal");
	visualizerAttribTex = visualizerShader->GetAttribute("aTexCoords");
	visualizerUniformModel = visualizerShader->GetUniform("model");
	visualizerUniformView = visualizerShader->GetUniform("view");
	visualizerUniformProjection = visualizerShader->GetUniform("projection");
	visualizerUniformColor = visualizerShader->GetUniform("lightColor");

	fboVisualizerShader = gfx->CreateShader(lightVertexShader, blitFragmentShader);
	fboVisualizerAttribPos = fboVisualizerShader->GetAttribute("aPos");
	fboVisualizerAttribNrm = fboVisualizerShader->GetAttribute("aTexCoords");
	fboVisualizerUniformTex = fboVisualizerShader->GetUniform("fboAttachment");
		 
	gfx->EnableDepthTest();

	unsigned int r = 17; // Init lights
	const float random[256] = { 0.3656,0.5975,0.2565,0.3479,0.5476,0.3928,0.3415,0.0206,0.5463,0.5178,0.3933,0.5041,0.3936,0.6914,0.1432,0.9345,0.4658,0.3882,0.1937,0.8578,0.8132,0.4431,0.3995,0.3597,0.5603,0.4911,0.2347,0.2945,0.3984,0.2634,0.6267,0.7258,0.1814,0.4948,0.7753,0.9251,0.9465,0.6035,0.3846,0.1093,0.3142,0.3638,0.641,0.5442,0.4255,0.8379,0.9256,0.4742,0.582,0.0497,0.5018,0.3946,0.6035,0.3299,0.6916,0.0434,0.3801,0.1466,0.5641,0.4768,0.8104,0.3498,0.5298,0.6186,0.8115,0.5604,0.3641,0.563,0.6914,0.69,0.6966,0.7567,0.7046,0.7525,0.0391,0.5287,0.5703,0.7917,0.5608,0.2734,0.4075,0.1968,0.5193,0.4479,0.7639,0.3171,0.6007,0.3993,0.4817,0.085,0.7841,0.6112,0.9593,0.7706,0.7092,0.4832,0.5839,0.0586,0.8798,0.6776,0.1723,0.7488,0.1125,0.5674,0.9469,0.381,0.3251,0.8302,0.7036,0.3844,0.1897,0.1555,0.8685,0.4488,0.2031,0.2371,0.5348,0.2711,0.196,0.7856,0.028,0.4563,0.3901,0.2574,0.6517,0.0475,0.9826,0.6943,0.3909,0.0292,0.8991,0.9083,0.6209,0.7381,0.9288,0.1965,0.1603,0.1763,0.4042,0.7352,0.5881,0.2164,0.6734,0.0666,0.3236,0.3242,0.604,0.356,0.7874,0.1962,0.4063,0.8309,0.844,0.2406,0.3622,0.4559,0.6488,0.4288,0.4571,0.1326,0.2152,0.1106,0.7596,0.2242,0.4044,0.3271,0.2481,0.4833,0.3934,0.7591,0.9811,0.6693,0.5843,0.4716,0.3495,0.4749,0.3009,0.4572,0.88,0.7667,0.4829,0.4215,0.1258,0.5959,0.7244,0.5981,0.6163,0.3598,0.5784,0.5132,0.3999,0.4614,0.7948,0.7211,0.7975,0.4933,0.7678,0.9405,0.4102,0.6404,0.0975,0.2982,0.5555,0.527,0.1202,0.3418,0.6476,0.4751,0.1752,0.493,0.8084,0.4753,0.4899,0.5522,0.0961,0.1637,0.7502,0.3266,0.8412,0.6116,0.1583,0.9776,0.3522,0.8333,0.2751,0.296,0.3329,0.6459,0.6083,0.2274,0.55,0.2861,0.2143,0.5151,0.6609,0.5558,0.4814,0.7225,0.6892,0.8186,0.4698,0.7448,0.4534,0.5496,0.4,0.3845,0.3266,0.6809,0.447,0.8964,0.319,0.3663,0.3682,0.8342,0.4573,0.7355 };
	for (unsigned int i = 0; i < NR_LIGHTS; i++) {
		// calculate slightly random offsets
		r += 1; r %= 256;
		float xPos0 = random[r] * 6.0 - 3.0;// *12.0 - 6.0;
		r += 1; r %= 256;
		float xPos1 = random[r] * 6.0 - 3.0;// *12.0 - 6.0;
		r += 1; r %= 256;
		float yPos0 = random[r] * 6.0 - 4.0;// * 12.0 - 8.0;
		r += 1; r %= 256;
		float yPos1 = random[r] * 6.0 - 4.0;// * 12.0 - 8.0;
		r += 1; r %= 256;
		float zPos0 = random[r] * 6.0 - 3.0;//* 12.0 - 6.0;
		r += 1; r %= 256;
		float zPos1 = random[r] * 6.0 - 3.0;//* 12.0 - 6.0;
		lightPositions[i] = vec3(xPos0, yPos0, zPos0);
		// also calculate random color
		r += 1; r %= 256;
		float rColor =  random[r] * 0.5f + 0.5f;
		r += 1; r %= 256;
		float gColor =  random[r] * 0.5f + 0.5f;
		r += 1; r %= 256;
		float bColor =  random[r] * 0.5f + 0.5f;
		lightColors[i] = vec3(rColor, gColor, bColor);
	}
}

void Update(float deltaTime) {
	if (!IsRunning) {
		return;
	}

#if 1
	camTime += deltaTime * 0.25f;
	while (camTime >= 360.0f) {
		camTime -= 360.0f;
	}
	camTime = 0.0f;

	lightTime += deltaTime * lightDir;
	if (lightTime > 5.0f) {
		lightDir *= -1.0f;
		lightTime = 5.0f;
	}
	else if (lightTime < 0.0f) {
		lightDir *= -1.0f;
		lightTime = 0.0f;
	}
#else
	camTime = 25;
#endif


	float t = lightTime / 5.0f;

	unsigned int r = 17; // Init lights
	const float random[256] = { 0.3656,0.5975,0.2565,0.3479,0.5476,0.3928,0.3415,0.0206,0.5463,0.5178,0.3933,0.5041,0.3936,0.6914,0.1432,0.9345,0.4658,0.3882,0.1937,0.8578,0.8132,0.4431,0.3995,0.3597,0.5603,0.4911,0.2347,0.2945,0.3984,0.2634,0.6267,0.7258,0.1814,0.4948,0.7753,0.9251,0.9465,0.6035,0.3846,0.1093,0.3142,0.3638,0.641,0.5442,0.4255,0.8379,0.9256,0.4742,0.582,0.0497,0.5018,0.3946,0.6035,0.3299,0.6916,0.0434,0.3801,0.1466,0.5641,0.4768,0.8104,0.3498,0.5298,0.6186,0.8115,0.5604,0.3641,0.563,0.6914,0.69,0.6966,0.7567,0.7046,0.7525,0.0391,0.5287,0.5703,0.7917,0.5608,0.2734,0.4075,0.1968,0.5193,0.4479,0.7639,0.3171,0.6007,0.3993,0.4817,0.085,0.7841,0.6112,0.9593,0.7706,0.7092,0.4832,0.5839,0.0586,0.8798,0.6776,0.1723,0.7488,0.1125,0.5674,0.9469,0.381,0.3251,0.8302,0.7036,0.3844,0.1897,0.1555,0.8685,0.4488,0.2031,0.2371,0.5348,0.2711,0.196,0.7856,0.028,0.4563,0.3901,0.2574,0.6517,0.0475,0.9826,0.6943,0.3909,0.0292,0.8991,0.9083,0.6209,0.7381,0.9288,0.1965,0.1603,0.1763,0.4042,0.7352,0.5881,0.2164,0.6734,0.0666,0.3236,0.3242,0.604,0.356,0.7874,0.1962,0.4063,0.8309,0.844,0.2406,0.3622,0.4559,0.6488,0.4288,0.4571,0.1326,0.2152,0.1106,0.7596,0.2242,0.4044,0.3271,0.2481,0.4833,0.3934,0.7591,0.9811,0.6693,0.5843,0.4716,0.3495,0.4749,0.3009,0.4572,0.88,0.7667,0.4829,0.4215,0.1258,0.5959,0.7244,0.5981,0.6163,0.3598,0.5784,0.5132,0.3999,0.4614,0.7948,0.7211,0.7975,0.4933,0.7678,0.9405,0.4102,0.6404,0.0975,0.2982,0.5555,0.527,0.1202,0.3418,0.6476,0.4751,0.1752,0.493,0.8084,0.4753,0.4899,0.5522,0.0961,0.1637,0.7502,0.3266,0.8412,0.6116,0.1583,0.9776,0.3522,0.8333,0.2751,0.296,0.3329,0.6459,0.6083,0.2274,0.55,0.2861,0.2143,0.5151,0.6609,0.5558,0.4814,0.7225,0.6892,0.8186,0.4698,0.7448,0.4534,0.5496,0.4,0.3845,0.3266,0.6809,0.447,0.8964,0.319,0.3663,0.3682,0.8342,0.4573,0.7355 };
	for (unsigned int i = 0; i < NR_LIGHTS; i++) {
		// calculate slightly random offsets
		r += 1; r %= 256;
		float xPos0 = random[r] * 8.0 - 4.0;// *12.0 - 6.0;
		r += 1; r %= 256;
		float xPos1 = random[r] * 8.0 - 4.0;// *12.0 - 6.0;
		r += 1; r %= 256;
		float yPos0 = random[r] * 12.0 - 6.0;// * 12.0 - 8.0;
		r += 1; r %= 256;
		float yPos1 = random[r] * 12.0 - 6.0;// * 12.0 - 8.0;
		r += 1; r %= 256;
		float zPos0 = random[r] * 8.0 - 4.0;//* 12.0 - 6.0;
		r += 1; r %= 256;
		float zPos1 = random[r] * 8.0 - 4.0;//* 12.0 - 6.0;
		
		lightPositions[i] = vec3(
			xPos0,// + (xPos1 - xPos0) * t, 
			yPos0 + (yPos1 - yPos0) * t, 
			zPos0// + (zPos1 - zPos0) * t
		);
		
		// Skip colors
		r += 1; r %= 256;
		float rColor = random[r] * 0.5f + 0.5f;
		r += 1; r %= 256;
		float gColor = random[r] * 0.5f + 0.5f;
		r += 1; r %= 256;
		float bColor = random[r] * 0.5f + 0.5f;
	}
}

void DrawSkull(Graphics::Index pos, Graphics::Index nrm, Graphics::Index tex, Graphics::Index albedoSpec, Graphics::Index normal) {
	Graphics::Sampler sampler;
	Graphics::BufferView posView, nrmView, texView;
	posView.StrideInBytes = sizeof(float) * (3 + 3 + 2);
	nrmView.StrideInBytes = sizeof(float) * (3 + 3 + 2);
	texView.StrideInBytes = sizeof(float) * (3 + 3 + 2);
	posView.DataOffsetInBytes = 0;
	nrmView.DataOffsetInBytes = sizeof(float) * 3;
	texView.DataOffsetInBytes = sizeof(float) * 6;
	posView.NumberOfComponents = 3;
	nrmView.NumberOfComponents = 3;
	texView.NumberOfComponents = 2;

	if (pos.valid) {
		gfx->Bind(pos, *skullData, posView);
	}

	if (nrm.valid) {
		gfx->Bind(nrm, *skullData, nrmView);
	}
	
	if (tex.valid) {
		gfx->Bind(tex, *skullData, texView);
	}

	if (albedoSpec.valid) {
		gfx->Bind(albedoSpec, *skullAlbedo, sampler);
	}

	if (normal.valid) {
		gfx->Bind(normal, *skullNormal, sampler);
	}

	gfx->Draw(Graphics::DrawMode::Triangles, 0, skullData->GetUserData());
}

void Render(int x, int y, int w, int h) {
	if (!IsRunning) {
		return;
	}

	float camX = FastSin(camTime) * cameraRadius;
	float camZ = FastCos(camTime) * cameraRadius;
	vec3 cameraPos = vec3(camX, cameraHeight, camZ);
	mat4 view = lookAt(cameraPos, cameraTarget, vec3(0, 1, 0));
	mat4 projection = perspective(45.0f, 800.0f / 600.0f, 0.1f, 1000.0f);
	mat4 model;

#if 0
	// Old rendering code
	gfx->Clear(0.4f, 0.5f, 0.6f, 1.0f);
	//DrawSkull(model, view, projection);
#else
	// Pass0 -> Draw GBuffer
	gfx->SetRenderTarget(gBuffer);
	gfx->Clear(0, 0, 0, 1);
	gfx->Bind(gBufferShader);
	gfx->Bind(gBufferUniformProjection, Graphics::UniformType::Float16, projection.v, 1);
	gfx->Bind(gBufferUniformView, Graphics::UniformType::Float16, view.v, 1);

	{ // Scene geom pass
		model = mat4();
		model.xx = model.yy = model.zz = 0.1f;
		model.ty = -1.0f;
		gfx->Bind(gBufferUniformModel, Graphics::UniformType::Float16, model.v, 1);
		DrawSkull(gBufferAttribPosition, gBufferAttribNormal, gBufferAttributeTexCoord, gBufferUniformAlbedoSpec, gBufferUniformNormal);
		model = mat4();
	}

	// Pass1 -> Lighting pass
	gfx->SetRenderTarget(0);
	gfx->Clear(0, 0, 0, 1);
	
	gfx->Bind(lightShader);

	Graphics::Sampler sampler;
	gfx->Bind(lightSampler2DTexPos, *gBufferPosition, sampler);
	gfx->Bind(lightSampler2DTexNorm, *gBufferNormal, sampler);
	gfx->Bind(lightSampler2DTexAlbedoSpec, *gBufferColorSpec, sampler);

	gfx->Bind(lightUniformLightPositions, Graphics::UniformType::Float3, lightPositions[0].v, NR_LIGHTS);
	gfx->Bind(lightUniformLightColors, Graphics::UniformType::Float3, lightColors[0].v, NR_LIGHTS);
	float linear[NR_LIGHTS];
	float quadratic[NR_LIGHTS];
	for (unsigned int i = 0; i < NR_LIGHTS; i++) {
		linear[i] = 0.7f;
		quadratic[i] = 1.8f;
	}
	gfx->Bind(lightUniformLightLinears, Graphics::UniformType::Float1, linear, NR_LIGHTS);
	gfx->Bind(lightUniformLightQuadratics, Graphics::UniformType::Float1, quadratic, NR_LIGHTS);
	gfx->Bind(lightUniformViewPos, Graphics::UniformType::Float3, cameraPos.v, 1);

	Graphics::BufferView quadPosView(3, sizeof(float) * 5, Graphics::BufferType::Float32, 0);
	Graphics::BufferView quadTexView(2, sizeof(float) * 5, Graphics::BufferType::Float32, sizeof(float) * 3);
	gfx->Bind(lightAttribPos, *lightQuad, quadPosView);
	gfx->Bind(lightAttribUv,  *lightQuad, quadTexView);

	gfx->Draw(Graphics::DrawMode::TriangleStrip, 0, 4);

	// Copy the gBuffer depoth into frame buffer
	gBuffer->ResolveTo(0, Graphics::Filter::Nearest, false);
	gfx->SetRenderTarget(0);

	// Render lights on top of scene
	gfx->Bind(visualizerShader);
	Graphics::BufferView visualizerPosView(3, sizeof(float) * 8, Graphics::BufferType::Float32, 0);
	Graphics::BufferView visualizerNrmView(3, sizeof(float) * 8, Graphics::BufferType::Float32, sizeof(float) * 3);
	Graphics::BufferView visualizerTexView(2, sizeof(float) * 8, Graphics::BufferType::Float32, sizeof(float) * 6);
	gfx->Bind(visualizerAttribPos, *visualizerBuffer, visualizerPosView);
	if (visualizerAttribNrm.valid) {
		gfx->Bind(visualizerAttribNrm, *visualizerBuffer, visualizerNrmView);
	}
	if (visualizerAttribTex.valid) {
		gfx->Bind(visualizerAttribTex, *visualizerBuffer, visualizerTexView);
	}
	gfx->Bind(visualizerUniformProjection, Graphics::UniformType::Float16, projection.v, 1);
	gfx->Bind(visualizerUniformView, Graphics::UniformType::Float16, view.v, 1);

	model = mat4();
	for (unsigned int i = 0; i < NR_LIGHTS; i++) {
		model.tx = lightPositions[i].x;
		model.ty = lightPositions[i].y;
		model.tz = lightPositions[i].z;
		model.xx = model.yy = model.zz = 0.125f;
		gfx->Bind(visualizerUniformModel, Graphics::UniformType::Float16, model.v, 1);
		gfx->Bind(visualizerUniformColor, Graphics::UniformType::Float3, lightColors[i].v, 1);
		
		gfx->Draw(Graphics::DrawMode::Triangles, 0, 36);
	}
	model = mat4();

	gfx->DisableDepthTest();

	u32 gap = 10;

	x = 25;
	y = gap;
	w = 80 * 3;
	h = 80 * 2;

	gfx->Bind(fboVisualizerShader);
	gfx->Bind(fboVisualizerAttribPos, *lightQuad, quadPosView);
	gfx->Bind(fboVisualizerAttribNrm, *lightQuad, quadTexView);

	gfx->SetViewport(x, y, w, h);
	gfx->SetScissor(x, y, w, h);
	gfx->Clear(1, 1, 1, 1);

	x += 2; y += 2; w -= 4; h -= 4;
	gfx->SetViewport(x, y, w, h);
	gfx->SetScissor (x, y, w, h);
	gfx->Clear(0, 0, 0, 1);
	x -= 2; y -= 2; w += 4; h += 4;

	gfx->Bind(fboVisualizerUniformTex, *gBufferPosition, sampler);
	gfx->Draw(Graphics::DrawMode::TriangleStrip, 0, 4);

	x += 80 * 3 + gap;
	gfx->SetViewport(x, y, w, h);
	gfx->SetScissor(x, y, w, h);
	gfx->Clear(1, 1, 1, 1);

	x += 2; y += 2; w -= 4; h -= 4;
	gfx->SetViewport(x, y, w, h);
	gfx->SetScissor(x, y, w, h);
	gfx->Clear(0, 0, 0, 1);
	x -= 2; y -= 2; w += 4; h += 4;

	gfx->Bind(fboVisualizerUniformTex, *gBufferNormal, sampler);
	gfx->Draw(Graphics::DrawMode::TriangleStrip, 0, 4);

	x += 80 * 3 + gap;
	gfx->SetViewport(x, y, w, h);
	gfx->SetScissor(x, y, w, h);
	gfx->Clear(1, 1, 1, 1);

	x += 2; y += 2; w -= 4; h -= 4;
	gfx->SetViewport(x, y, w, h);
	gfx->SetScissor(x, y, w, h);
	gfx->Clear(0, 0, 0, 1);
	x -= 2; y -= 2; w += 4; h += 4;

	gfx->Bind(fboVisualizerUniformTex, *gBufferColorSpec, sampler);
	gfx->Draw(Graphics::DrawMode::TriangleStrip, 0, 4);

	gfx->SetViewport(0, 0, 800, 600);
	gfx->ClearScissor();
	gfx->EnableDepthTest();
#endif
}

void Shutdown() {
	IsRunning = false;

	gfx->SetRenderTarget(0);
	gfx->Bind(0);

	gfx->Destroy(gBufferShader);
	gfx->Destroy(gBuffer);
	gfx->Destroy(skullData);
	gfx->Destroy(lightShader);
	gfx->Destroy(skullAlbedo);
	gfx->Destroy(skullNormal);

	Graphics::Shutdown(*gfx);
	ReleaseMem(gfx);
	gfx = 0;
}
///

static void Assert(bool condition) {
#if _WASM32
	if (condition == false) {
		__builtin_trap();
	}
#else
	char* data = (char*)((void*)0);
	if (condition == false) {
		*data = '\0';
	}
#endif
}