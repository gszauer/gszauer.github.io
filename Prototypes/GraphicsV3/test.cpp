// https://stackoverflow.com/questions/72568387/why-is-an-objects-constructor-being-called-in-every-exported-wasm-function
extern "C" void __wasm_call_ctors(void);
__attribute__((export_name("_initialize")))
extern "C" void _initialize(void) {
    __wasm_call_ctors();
}

#define export __attribute__ (( visibility( "default" ) )) extern "C"

#include "window.h"
#include "memory.h"
// Math
#include "loader.h"
#include "graphics.h"
#include "audio.h"

#include "debt/lodepng.h"
#include "debt/lodepng.c"
#if 0
#include "debt/cgltf.h"
#include "debt/cgltf.c"
#endif
#include "debt/calcTangents.cpp"

// TODO: Reduce so it's not 26MB
#define LOAD_BUFFER_SIZE (1024 * 1024 * 26)

WASM_MEM_EXPOSE_HEAP
WASM_LOADER_ENABLE_CALLBACKS
WASM_AUDIO_ENABLE_CALLBACKS

struct AppData {
    u32 vbo;
    u32 shader;
    u32 vao;

    u32 planeVBO;
    u32 planeVAO;
    u32 planeNumVerts;
    u32 planeShader;
    u32 planeUniformModel;
    u32 planeUniformView;
    u32 planeUniformProj;
    u32 planeUniformShadow;
    u32 PlaneUniformColorSpec;
    u32 PlaneUniformNormal;
    u32 PlaneUniformShadowMap; 
    u32 PlaneUniformLightDirection;
    u32 PlaneUniformLightColor;
    u32 PlaneUniformViewPos;
    u32 PlaneTextureColorSpec;
    u32 PlaneTextureNormal;

    u32 shadowMapShader;
    u32 shadowMapUniformMvp;
    u32 shadowMapTexture;
    u32 shadowMapVao;

    u32 skullShader;
    u32 skullVbo;
    u32 skullVao;
    u32 skullNumVerts;
    u32 skullUniformModel;
    u32 skullUniformView;
    u32 skullUniformProj;
    u32 skullUniformAlbedo;
    u32 skullUniformNormal;
    u32 skullUniformTop;
    u32 skullUniformBottom;
    u32 skullUniformLightDir;
    u32 skullUniformLightColor;
    u32 skullUniformViewPos;
    u32 skullAlbedoTexture;
    u32 skullNormalTexture;
    bool canDisplaySkull;

    float* model;
    float* view;
    float* proj;
    float cam[3];

    u32 oneShotBufffer;
    u32 oneShotBus;
    u32 loopingBus;
    u32 loopingBuffer;
    u32 loopingSound;
};

export void* Initialize() {
    float vertices[] = {
        -0.5f, -0.5f, 0.0f,
        0.5f, -0.5f, 0.0f,
        0.0f,  0.5f, 0.0f
    };  

    AppData* app = (AppData*)MemAllocate(sizeof(AppData), 0);
    app->canDisplaySkull = false;
    app->oneShotBus = AudioCreateBus();
    app->loopingBus = AudioCreateBus();

    app->model = (float*)MemAllocate(sizeof(float) * 16, 0);
    app->view = (float*)MemAllocate(sizeof(float) * 16, 0);
    app->proj = (float*)MemAllocate(sizeof(float) * 16, 0);

    for (int i = 0; i < 16; ++i) {
        app->model[i] = 0.0f;
        app->view[i] = 0.0f;
        app->proj[i] = 0.0f;
    }
    app->model[0] = app->model[5] = app->model[10] = 0.1f;
    app->model[12] = 1.5f;
    app->model[14] = -0.5;
    app->model[15] = 1.0f;

    app->proj[0] = 1.82434f;
    app->proj[5] = 2.43245f;
    app->proj[10] = -1.00020f;
    app->proj[11] = -1.00000f;
    app->proj[14] = -0.20002f;
    app->proj[15] =  0.00000f;
     
    app->view[0]  = 0.98773f;
    app->view[1]  = -0.05942f;
    app->view[2]  = 0.13843f;
    app->view[5]  = 0.91813f;
    app->view[6]  = 0.39411f;
    app->view[8]  = -0.15065f;
    app->view[9]  = -0.38962f;
    app->view[10] = 0.90761f;
    app->view[14] = -7.59863f;
    app->view[15] = 1.00000f;

    app->cam[0] = 1.05370f;
    app->cam[1] = 3.00000f;
    app->cam[2] = 6.90875f;

    app->shadowMapTexture = GfxCreateDepthTexture(4096, 4096);
    GfxSetTextureSampler(app->shadowMapTexture, GfxWrapClamp, GfxWrapClamp, GfxFilterNearest, GfxFilterNone, GfxFilterNearest);

    app->vbo = GfxCreateBuffer();
    GfxFillArrayBuffer(app->vbo, vertices, sizeof(float) * 9, true);

    const char* v_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;"
                            "layout (location = 0) in vec3 aPos;\n"
                            "void main() {\n"
                            "    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
                            "}";
    const char* f_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;"
                            "out vec4 FragColor;\n"
                            "void main() {\n"
                            "    FragColor = vec4(1.0f, 0.5f, 0.2f, 1.0f);\n"
                            "}";
    app->shader = GfxCreateShader(v_shader, f_shader);


    v_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;\n"
                "in vec3 position;\n"
                "uniform mat4 mvp;\n"
                "void main (void) {\n"
                "  gl_Position = mvp * vec4(position, 1.0);\n"
                "}\n";
    f_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;\n"
                "out vec4 FragColor;\n"
                "void main (void) {\n"
                "  FragColor = vec4(gl_FragCoord.z, gl_FragCoord.z, gl_FragCoord.z, 1.0);\n"
                "}\n";
    app->shadowMapShader = GfxCreateShader(v_shader, f_shader);
    app->shadowMapUniformMvp = GfxGetUniformSlot(app->shadowMapShader, "mvp");

    v_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;\n"
                "in vec3 aPos;\n"
                "in vec3 aNorm;\n"
                "in vec3 aTan;\n"
                "in vec2 aTexCoord;\n"
                "uniform mat4 model;\n"
                "uniform mat4 view;\n"
                "uniform mat4 projection;\n"
                "uniform mat4 shadow;\n"
                "out mat3 TBN;\n"
                "out vec2 TexCoord;\n"
                "out vec3 FragPos;\n"
                "out vec4 LightViewPos;\n"
                "void main() {\n"
                "	gl_Position = projection * view * model * vec4(aPos, 1.0);\n"
                "	FragPos = vec3(model * vec4(aPos, 1.0));\n"
                "	LightViewPos = shadow * vec4(aPos, 1.0);\n"
                "	vec3 biTangent = cross(aNorm, aTan);\n"
                "	vec3 T = normalize(vec3(model * vec4(aTan,   0.0)));\n"
                "	vec3 B = normalize(vec3(model * vec4(biTangent, 0.0)));\n"
                "	vec3 N = normalize(vec3(model * vec4(aNorm,    0.0)));\n"
                "	TBN = mat3(T, B, N);\n"
                "	TexCoord = vec2(aTexCoord.x, aTexCoord.y);\n"
                "}\n";
    f_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;\n"
                "in vec2 TexCoord;\n"
                "in vec3 FragPos;\n"
                "in mat3 TBN;\n"
                "in vec4 LightViewPos;\n"
                "out vec4 FragColor;\n"
                "uniform sampler2D uColorSpec;\n"
                "uniform sampler2D uNormal;\n"
                "uniform sampler2D uShadowMap; \n"
                "uniform mat4 model;\n"
                "uniform vec3 LightDirection;\n"
                "uniform vec3 LightColor;\n"
                "uniform vec3 ViewPos;\n"
                "void main() {\n"
                "	vec3 normal = texture(uNormal, TexCoord).rgb; \n"
                "	normal = normal * 2.0 - 1.0;\n"
                "	normal = normalize(TBN * normal); // World space normal\n"
                "	vec4 colorSpec = texture(uColorSpec, TexCoord);\n"
                "	vec3 objectColor = colorSpec.rgb;\n"
                "	vec3 lightDir = normalize(-LightDirection);\n"
                "	float diff = max(dot(normal, lightDir), 0.0);\n"
                "	vec3 diffuse = diff * LightColor;\n"
                "	vec3 ambient = 0.2 * LightColor;\n"
                "	vec3 viewDir = normalize(ViewPos - FragPos);\n"
                "	vec3 reflectDir = reflect(-lightDir, normal);\n"
                "	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);\n"
                "	vec3 specular = colorSpec.a * spec * LightColor;  \n"
                "	vec4 FinalColor = vec4((ambient+diffuse+specular) * objectColor, 1.0);\n"
                "	vec3 p = LightViewPos.xyz / LightViewPos.w;\n"
                "	FragColor = FinalColor * (texture(uShadowMap, p.xy).r < p.z? 0.0 : 1.0);\n"
                "}\n";
    app->planeShader = GfxCreateShader(v_shader, f_shader);

    v_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;\n"
                "in vec3 aPos;\n"
                "in vec3 aNorm;\n"
                "in vec3 aTan;\n"
                "in vec2 aTexCoord;\n"
                "uniform mat4 model;\n"
                "uniform mat4 view;\n"
                "uniform mat4 projection;\n"
                "out mat3 TBN;\n"
                "out vec2 TexCoord;\n"
                "out vec3 FragPos;\n"
                "void main() {\n"
                "	gl_Position = projection * view * model * vec4(aPos, 1.0);\n"
                "	FragPos = vec3(model * vec4(aPos, 1.0));\n"
                "	vec3 biTangent = cross(aNorm, aTan);\n"
                "	vec3 T = normalize(vec3(model * vec4(aTan,   0.0)));\n"
                "	vec3 B = normalize(vec3(model * vec4(biTangent, 0.0)));\n"
                "	vec3 N = normalize(vec3(model * vec4(aNorm,    0.0)));\n"
                "	TBN = mat3(T, B, N);\n"
                "	TexCoord = vec2(aTexCoord.x, aTexCoord.y);\n"
                "}\n";
    f_shader =  "#version 300 es\nprecision highp float;\nprecision highp int;"
                "in vec2 TexCoord;\n"
                "in vec3 FragPos;\n"
                "in mat3 TBN;\n"
                "out vec4 FragColor;\n"
                "uniform sampler2D uColorSpec;\n"
                "uniform sampler2D uNormal;\n"
                "uniform mat4 model;\n"
                "uniform vec3 HemiTop;\n"
                "uniform vec3 HemiBottom;\n"
                "uniform vec3 LightDirection;\n"
                "uniform vec3 LightColor;\n"
                "uniform vec3 ViewPos;\n"
                "void main() {\n"
                "	vec3 normal = texture(uNormal, TexCoord).rgb;\n" 
                "	normal = normal * 2.0 - 1.0;\n"
                "	normal = normalize(TBN * normal); // World space normal\n"
                "	vec4 colorSpec = texture(uColorSpec, TexCoord);\n"
                "	vec3 color = colorSpec.rgb;\n"
                "	vec3 lightDir = normalize(-LightDirection);\n"
                "	float diff = max(dot(normal, lightDir), 0.0);\n"
                "	vec3 diffuse = diff * LightColor;\n"
                "	diff = max(dot(normal, normalize(vec3(-0.25, -1, 1))), 0.0);\n"
                "	vec3 ambient = mix(HemiBottom, HemiTop, diff) * LightColor;\n"
                "	vec3 viewDir = normalize(ViewPos - FragPos);\n"
                "	vec3 reflectDir = reflect(-lightDir, normal);\n"
                "	float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);\n"
                "	vec3 specular = colorSpec.a * spec * LightColor;  \n"
                "	FragColor = vec4((ambient + diffuse + specular) * color, 1.0);\n"
                "}\n";
    app->skullShader = GfxCreateShader(v_shader, f_shader);
    app->skullUniformAlbedo = GfxGetUniformSlot(app->skullShader, "uColorSpec");

    app->skullUniformNormal= GfxGetUniformSlot(app->skullShader, "uNormal");
    app->skullUniformTop= GfxGetUniformSlot(app->skullShader, "HemiTop");
    app->skullUniformBottom= GfxGetUniformSlot(app->skullShader, "HemiBottom");
    app->skullUniformLightDir= GfxGetUniformSlot(app->skullShader, "LightDirection");
    app->skullUniformLightColor= GfxGetUniformSlot(app->skullShader, "LightColor");
    app->skullUniformViewPos= GfxGetUniformSlot(app->skullShader, "ViewPos");

    app->vao = GfxCreateShaderVertexLayout(app->shader);
    GfxAddBufferToLayout(app->vao, "aPos", app->vbo, 3, 0, GfxBufferTypeFloat32, 0);


    void* loadArena = MemAllocate(LOAD_BUFFER_SIZE, 0);
    LoadFileAsynch("assets/skull.mesh", false, loadArena, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
        AppData* app = (AppData*)userData;

        unsigned int* uint_data = (unsigned int*)data;
        unsigned int numVerts = uint_data[0];  // Ignore 1, and 2. Always the same anyway
        app->skullNumVerts = numVerts;
       
        float* srcPos = (float*)(uint_data + 3);
        float* srcNrm = srcPos + numVerts * 3;
        float* srcTex = srcNrm + numVerts * 3;

        unsigned int tanArray_size = sizeof(float) * 3 * numVerts;
        float* tanArray = (float*)MemAllocate(tanArray_size, 0);
        MemClear(tanArray, tanArray_size);
        CalculateMeshTangents::CalculateTangentArray(numVerts, srcPos, srcNrm, srcTex, tanArray);

        unsigned int interleaved_size = sizeof(float) * numVerts * (3 + 3 + 3 + 2);
        float* interleaved = (float*)MemAllocate(interleaved_size, 0);

        for (int i = 0, j = 0; i < numVerts; ++i, j += 11) {
            interleaved[j + 0] = srcPos[i * 3 + 0];
            interleaved[j + 1] = srcPos[i * 3 + 1];
            interleaved[j + 2] = srcPos[i * 3 + 2];

            interleaved[j + 3] = srcNrm[i * 3 + 0];
            interleaved[j + 4] = srcNrm[i * 3 + 1];
            interleaved[j + 5] = srcNrm[i * 3 + 2];

            interleaved[j + 6] = srcTex[i * 2 + 0];
            interleaved[j + 7] = srcTex[i * 2 + 1];

            interleaved[j + 8] = tanArray[i * 3 + 0];
            interleaved[j + 9] = tanArray[i * 3 + 1];
            interleaved[j + 10] = tanArray[i * 3 + 2];
        }

        app->skullVbo = GfxCreateBuffer();
        GfxFillArrayBuffer(app->skullVbo, interleaved, interleaved_size, true);

        app->skullVao = GfxCreateShaderVertexLayout(app->skullShader);
        GfxAddBufferToLayout(app->skullVao, "aPos", app->skullVbo , 3, sizeof(float) * 11, GfxBufferTypeFloat32, 0); 
        GfxAddBufferToLayout(app->skullVao, "aNorm", app->skullVbo , 3, sizeof(float) * 11, GfxBufferTypeFloat32, sizeof(float) * 3); 
        GfxAddBufferToLayout(app->skullVao, "aTexCoord", app->skullVbo, 2, sizeof(float) * 11, GfxBufferTypeFloat32, sizeof(float) * 6);
        GfxAddBufferToLayout(app->skullVao, "aTan", app->skullVbo , 3, sizeof(float) * 11, GfxBufferTypeFloat32, sizeof(float) * 8); 

        app->skullUniformModel = GfxGetUniformSlot(app->skullShader, "model");
        app->skullUniformView  = GfxGetUniformSlot(app->skullShader, "view");
        app->skullUniformProj  = GfxGetUniformSlot(app->skullShader, "projection");

        app->shadowMapVao = GfxCreateShaderVertexLayout(app->shadowMapShader);
        GfxAddBufferToLayout(app->shadowMapVao, "position", app->skullVbo , 3, sizeof(float) * 11, GfxBufferTypeFloat32, 0); 

        MemRelease(interleaved);
        MemRelease(tanArray);

        LoadFileAsynch("assets/Skull_AlbedoSpec.png", false, data, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
            AppData* app = (AppData*)userData;

            u32 width = 0;
            u32 height = 0;
            u32 channels = 3;
            LodePNGState state;
            lodepng_state_init(&state);
            lodepng_inspect(&width, &height, &state, (const unsigned char*)data, bytes); 
            unsigned int format = GfxTextureFormatRGB8;
            if (lodepng_get_channels(&state.info_raw) == 4) {
                format = GfxTextureFormatRGBA8;
                channels = 4;
            }   
            unsigned char* img_data = (unsigned char*) MemAllocate(sizeof(char) * width * height * channels, 0);
            lodepng_decode_memory(&img_data, &width, &height,
                               (const unsigned char*)data, bytes,
                               state.info_raw.colortype, state.info_raw.bitdepth);
            lodepng_state_cleanup(&state);
            app->skullAlbedoTexture = GfxCreateTexture(img_data, width, height, format, format, true);
            GfxSetTextureSampler(app->skullAlbedoTexture, GfxWrapClamp, GfxWrapClamp, GfxFilterLinear,GfxFilterLinear, GfxFilterLinear);
            MemRelease(img_data);

            LoadFileAsynch("assets/Skull_Normal.png", false, data, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
                AppData* app = (AppData*)userData;
               
                u32 width = 0;
                u32 height = 0;
                u32 channels = 3;
                LodePNGState state;
                lodepng_state_init(&state);
                lodepng_inspect(&width, &height, &state, (const unsigned char*)data, bytes); 
                unsigned int format = GfxTextureFormatRGB8;
                if (lodepng_get_channels(&state.info_raw) == 4) {
                    format = GfxTextureFormatRGBA8;
                    channels = 4;
                }   
                unsigned char* img_data = (unsigned char*) MemAllocate(sizeof(char) * width * height * channels, 0);
                lodepng_decode_memory(&img_data, &width, &height,
                                (const unsigned char*)data, bytes,
                                state.info_raw.colortype, state.info_raw.bitdepth);
                lodepng_state_cleanup(&state);
                app->skullNormalTexture = GfxCreateTexture(img_data, width, height, format, format, true);
                GfxSetTextureSampler(app->skullNormalTexture, GfxWrapClamp, GfxWrapClamp, GfxFilterLinear,GfxFilterLinear, GfxFilterLinear);
                MemRelease(img_data);          
                
                LoadFileAsynch("assets/plane.mesh", false, data, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
                    AppData* app = (AppData*)userData;
                    unsigned int* uint_data = (unsigned int*)data;
                    unsigned int numVerts = uint_data[0];  // Ignore 1, and 2. Always the same anyway
                    app->planeNumVerts = numVerts;
                
                    float* srcPos = (float*)(uint_data + 3);
                    float* srcNrm = srcPos + numVerts * 3;
                    float* srcTex = srcNrm + numVerts * 3;

                    unsigned int tanArray_size = sizeof(float) * 3 * numVerts;
                    float* tanArray = (float*)MemAllocate(tanArray_size, 0);
                    MemClear(tanArray, tanArray_size);
                    CalculateMeshTangents::CalculateTangentArray(numVerts, srcPos, srcNrm, srcTex, tanArray);
                    unsigned int interleaved_size = sizeof(float) * numVerts * (3 + 3 + 3 + 2);
                    float* interleaved = (float*)MemAllocate(interleaved_size, 0);
                    for (int i = 0, j = 0; i < numVerts; ++i, j += 11) {
                        interleaved[j + 0] = srcPos[i * 3 + 0];
                        interleaved[j + 1] = srcPos[i * 3 + 1];
                        interleaved[j + 2] = srcPos[i * 3 + 2];

                        interleaved[j + 3] = srcNrm[i * 3 + 0];
                        interleaved[j + 4] = srcNrm[i * 3 + 1];
                        interleaved[j + 5] = srcNrm[i * 3 + 2];

                        interleaved[j + 6] = srcTex[i * 2 + 0];
                        interleaved[j + 7] = srcTex[i * 2 + 1];

                        interleaved[j + 8] = tanArray[i * 3 + 0];
                        interleaved[j + 9] = tanArray[i * 3 + 1];
                        interleaved[j + 10] = tanArray[i * 3 + 2];
                    }

                    app->planeVBO = GfxCreateBuffer();
                    GfxFillArrayBuffer(app->planeVBO, interleaved, interleaved_size, true);

                    app->planeVAO = GfxCreateShaderVertexLayout(app->planeShader);
                    GfxAddBufferToLayout(app->planeVAO, "aPos", app->planeVBO , 3, sizeof(float) * 11, GfxBufferTypeFloat32, 0); 
                    GfxAddBufferToLayout(app->planeVAO, "aNorm", app->planeVBO , 3, sizeof(float) * 11, GfxBufferTypeFloat32, sizeof(float) * 3); 
                    GfxAddBufferToLayout(app->planeVAO, "aTexCoord", app->planeVBO, 2, sizeof(float) * 11, GfxBufferTypeFloat32, sizeof(float) * 6);
                    GfxAddBufferToLayout(app->planeVAO, "aTan", app->planeVBO , 3, sizeof(float) * 11, GfxBufferTypeFloat32, sizeof(float) * 8); 

                    app->planeUniformModel = GfxGetUniformSlot(app->planeShader, "model");
                    app->planeUniformView = GfxGetUniformSlot(app->planeShader, "view");
                    app->planeUniformProj = GfxGetUniformSlot(app->planeShader, "projection");
                    app->planeUniformShadow = GfxGetUniformSlot(app->planeShader, "shadow");

                    app->PlaneUniformColorSpec = GfxGetUniformSlot(app->planeShader, "uColorSpec");
                    app->PlaneUniformNormal = GfxGetUniformSlot(app->planeShader, "uNormal");
                    app->PlaneUniformShadowMap = GfxGetUniformSlot(app->planeShader, "uShadowMap");

                    app->PlaneUniformLightDirection = GfxGetUniformSlot(app->planeShader, "LightDirection");
                    app->PlaneUniformLightColor = GfxGetUniformSlot(app->planeShader, "LightColor");
                    app->PlaneUniformViewPos = GfxGetUniformSlot(app->planeShader, "ViewPos");

                    MemRelease(interleaved);
                    MemRelease(tanArray);

                    LoadFileAsynch("assets/Plane_AlbedoSpec.png", false, data, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
                        AppData* app = (AppData*)userData;

                        u32 width = 0;
                        u32 height = 0;
                        u32 channels = 3;
                        LodePNGState state;
                        lodepng_state_init(&state);
                        lodepng_inspect(&width, &height, &state, (const unsigned char*)data, bytes); 
                        unsigned int format = GfxTextureFormatRGB8;
                        if (lodepng_get_channels(&state.info_raw) == 4) {
                            format = GfxTextureFormatRGBA8;
                            channels = 4;
                        }   
                        unsigned char* img_data = (unsigned char*) MemAllocate(sizeof(char) * width * height * channels, 0);
                        lodepng_decode_memory(&img_data, &width, &height,
                                        (const unsigned char*)data, bytes,
                                        state.info_raw.colortype, state.info_raw.bitdepth);
                        lodepng_state_cleanup(&state);
                        app->PlaneTextureColorSpec =  GfxCreateTexture(img_data, width, height, format, format, true);
                        GfxSetTextureSampler(app->PlaneTextureColorSpec, GfxWrapClamp, GfxWrapClamp, GfxFilterLinear,GfxFilterLinear, GfxFilterLinear);
                        MemRelease(img_data);  
                
                        LoadFileAsynch("assets/Plane_Normal.png", false, data, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
                            AppData* app = (AppData*)userData;
                            u32 width = 0;
                            u32 height = 0;
                            u32 channels = 3;
                            LodePNGState state;
                            lodepng_state_init(&state);
                            lodepng_inspect(&width, &height, &state, (const unsigned char*)data, bytes); 
                            unsigned int format = GfxTextureFormatRGB8;
                            if (lodepng_get_channels(&state.info_raw) == 4) {
                                format = GfxTextureFormatRGBA8;
                                channels = 4;
                            }   
                            unsigned char* img_data = (unsigned char*) MemAllocate(sizeof(char) * width * height * channels, 0);
                            lodepng_decode_memory(&img_data, &width, &height,
                                            (const unsigned char*)data, bytes,
                                            state.info_raw.colortype, state.info_raw.bitdepth);
                            lodepng_state_cleanup(&state);
                            app->PlaneTextureNormal =  GfxCreateTexture(img_data, width, height, format, format, true);
                            GfxSetTextureSampler(app->PlaneTextureNormal, GfxWrapClamp, GfxWrapClamp, GfxFilterLinear,GfxFilterLinear, GfxFilterLinear);
                            MemRelease(img_data);        
                            
                            LoadFileAsynch("assets/oneshot.ogg", false, data, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
                                AppData* app = (AppData*)userData;
                                app->oneShotBufffer = AudioCreateBufferFromOgg(data, bytes, [](u32 bufferId, void* data, u32 bytes, void* userData) {
                                    AppData* app = (AppData*)userData;
                                    LoadFileAsynch("assets/piano.ogg", false, data, LOAD_BUFFER_SIZE, [](const char* path, void* data, unsigned int bytes, void* userData) {
                                        AppData* app = (AppData*)userData;
                                        app->loopingBuffer = AudioCreateBufferFromOgg(data, bytes, [](u32 bufferId, void* data, u32 bytes, void* userData) {
                                            AppData* app = (AppData*)userData;
                                            app->loopingSound = AudioPlay2D(app->loopingBuffer, app->loopingBus, true, 0.75f, 0.0f);

                                            MemRelease(data);
                                            app->canDisplaySkull = true;
                                        }, app);
                                    }, app);
                                }, app);
                            }, app);
                        }, app);
                    }, app);
                }, app);
            }, app);
        }, app);
    }, app);

    GfxEnableDepthTest();

    return app;
}

export void Render(unsigned int x, unsigned int y, unsigned int w, unsigned int h, void* userData) {
    AppData* app = (AppData*)userData;

    if (MousePressed(MouseButtonLeft)) {
        AudioPlay2D(app->oneShotBufffer, app->oneShotBus, false, 1.0f, 0.0f);
        MemDbgPrintStr("Left mouse pressed");
    }
    else if (MouseReleased(MouseButtonLeft)) {
        MemDbgPrintStr("Left mouse released");
    }

    if (KeyboardPressed(KeyboardCodeSpace)) {
        MemDbgPrintStr("space pressed");
        AudioSetVolume(app->oneShotBus, 0.5f);
    }
    else if (KeyboardReleased(KeyboardCodeSpace)) {
        MemDbgPrintStr("space released");
    }

    if (KeyboardDown(KeyboardCodeSpace)) {
        MemDbgPrintStr("space down");
    }
    
    if (TouchPressed(0)) {
        if (app->loopingSound != 0) {
            AudioStop(app->loopingSound);
            app->loopingSound = 0;
        }
        else {
            app->loopingSound = AudioPlay2D(app->loopingBuffer, app->loopingBus, true, 0.75f, 0.0f);
        }
        MemDbgPrintStr("touch 0 pressed");
    }
    if (TouchReleased(0)) {
        MemDbgPrintStr("touch 0 released");
    }

    if (TouchPressed(1)) {
        if (app->loopingSound != 0) {
            AudioSetPan(app->loopingSound, -1.0f);
        }
        MemDbgPrintStr("touch 1 pressed");
    }
    if (TouchReleased(1)) {
        MemDbgPrintStr("touch 1 released");
    }
}


export void Update(float dt, void* userData) {
    AppData* app = (AppData*)userData;
    /*GfxClearColor(0, 0, 0.5f, 0.6f, 0.7f);
    GfxClearDepth(0, 0, 1.0f);
    GfxDraw(0, 0, app->vao, GfxDrawModeTriangles, 0, 3, 1);*/

    const float plane_shadow[16] = {0.13074f, 0.01829f, 0.01400f, 0.00000f,0.00000f, 0.09512f, -0.06999f, 0.00000f,0.02615f, -0.09146f, -0.06999f, 0.00000f,0.50000f, 0.42866f, 0.54184f, 1.00000f };
    const float plane_model[16] = {2.00000f, 0.00000f, 0.00000f, 0.00000f,0.00000f, 2.00000f, 0.00000f, 0.00000f,0.00000f, 0.00000f, 2.00000f, 0.00000f,0.00000f, -1.50000f, 0.00000f, 1.00000f };
    const float skull_model[16] = {0.10000f, 0.00000f, 0.00000f, 0.00000f,0.00000f, 0.10000f, 0.00000f, 0.00000f,0.00000f, 0.00000f, 0.10000f, 0.00000f,1.50000f, 0.00000f, -0.50000f, 1.00000f };
    const float shadow_mvp[16] = {0.01307f, 0.00183f, 0.00140f, 0.00000f,0.00000f, 0.00951f, -0.00700f, 0.00000f,0.00261f, -0.00915f, -0.00700f, 0.00000f,0.18304f, 0.07317f, 0.05468f, 1.00000f };
    const float view[16] = {0.99916f, 0.00000f, 0.00000f, 0.00000f,0.00000f, 0.91836f, 0.39357f, 0.00000f,0.00000f, -0.39358f, 0.91833f, 0.00000f,0.00000f, 0.00000f, -7.60905f, 1.00000f };
    const float proj[16] = {1.82434f, 0.00000f, 0.00000f, 0.00000f,0.00000f, 2.43245f, 0.00000f, 0.00000f,0.00000f, 0.00000f, -1.00020f, -1.00000f,0.00000f, 0.00000f, -0.20002f, 0.00000f };

    if (app->canDisplaySkull) {
        { // Draw lightmap
            GfxSetViewport(0, 0, 4096, 4096);
            GfxClearDepth(0, 0, 1.0f);
            GfxSetCullState(GfxCullFaceFront, GfxFaceWindCounterClockwise);
            GfxSetUniform(app->shadowMapShader, app->shadowMapUniformMvp, (void*)shadow_mvp, GfxUniformTypeFloat16, 1); 
            GfxDraw(0, app->shadowMapTexture, app->shadowMapVao, GfxDrawModeTriangles, 0, app->skullNumVerts, 1);
            GfxSetCullState(GfxCullFaceBack, GfxFaceWindCounterClockwise);
            GfxSetViewport(0, 0, 800, 600);
        }

        GfxClearAll(0, 0, 0.5f, 0.6f, 0.7f, 1.0f);

        const float lightDir[3] = {0.2f, -1.0f, -1.0f};
        const float lightColor[3] = {1.0f, 1.0f, 1.0f};

        { // Draw Skull
            const float hemiTop[3] = {0.2f, 0.2f, 0.2f};
            const float hemiBottom[3] = {0.1f, 0.1f, 0.1f};

            GfxSetUniform(app->skullShader, app->skullUniformModel, (void*)skull_model, GfxUniformTypeFloat16, 1); 
            GfxSetUniform(app->skullShader, app->skullUniformView, (void*)view, GfxUniformTypeFloat16, 1); 
            GfxSetUniform(app->skullShader, app->skullUniformProj, (void*)proj, GfxUniformTypeFloat16, 1); 
            
            GfxSetUniformTexture(app->skullShader, app->skullUniformAlbedo, app->skullAlbedoTexture);
            GfxSetUniformTexture(app->skullShader, app->skullUniformNormal, app->skullNormalTexture);
            
            GfxSetUniform(app->skullShader, app->skullUniformTop, (void*)hemiTop, GfxUniformTypeFloat3, 1); 
            GfxSetUniform(app->skullShader, app->skullUniformBottom, (void*)hemiBottom, GfxUniformTypeFloat3, 1); 
            GfxSetUniform(app->skullShader, app->skullUniformLightDir, (void*)lightDir, GfxUniformTypeFloat3, 1); 
            GfxSetUniform(app->skullShader, app->skullUniformLightColor, (void*)lightColor, GfxUniformTypeFloat3, 1); 
            GfxSetUniform(app->skullShader, app->skullUniformViewPos, app->cam, GfxUniformTypeFloat3, 1); 

            GfxDraw(0, 0, app->skullVao, GfxDrawModeTriangles, 0, app->skullNumVerts, 1);
        }

        { // Draw plane
            GfxSetUniform(app->planeShader, app->planeUniformModel, (void*)plane_model, GfxUniformTypeFloat16, 1); 
            GfxSetUniform(app->planeShader, app->planeUniformView, (void*)view, GfxUniformTypeFloat16, 1); 
            GfxSetUniform(app->planeShader, app->planeUniformProj, (void*)proj, GfxUniformTypeFloat16, 1);
            GfxSetUniform(app->planeShader, app->planeUniformShadow,  (void*)plane_shadow, GfxUniformTypeFloat16, 1); 

            GfxSetUniform(app->planeShader, app->PlaneUniformLightDirection,(void*)lightDir, GfxUniformTypeFloat3, 1); 
            GfxSetUniform(app->planeShader, app->PlaneUniformLightColor, (void*)lightColor, GfxUniformTypeFloat3, 1); 
            GfxSetUniform(app->planeShader, app->PlaneUniformViewPos, app->cam, GfxUniformTypeFloat3, 1); 

            GfxSetUniformTexture(app->planeShader, app->PlaneUniformColorSpec, app->PlaneTextureColorSpec);
            GfxSetUniformTexture(app->planeShader, app->PlaneUniformNormal, app->PlaneTextureNormal);
            GfxSetUniformTexture(app->planeShader, app->PlaneUniformShadowMap, app->shadowMapTexture);

            GfxDraw(0, 0, app->planeVAO, GfxDrawModeTriangles, 0, app->planeNumVerts, 1);
        }
    }
}