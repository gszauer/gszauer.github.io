/* 

This should be re-done, with buses in mind. 
The initial design is good, but it could be better.

typedef unsigned int u32;
typedef float f32;
static_assert (sizeof(u32) == 4, "u32 should be a 4 byte type");
static_assert (sizeof(f32) == 4, "f32 should be a 4 byte type");

extern "C" u32 AudioWavFromMemory(void* data, u32 bytes);
extern "C" u32 AudioFromMemory(void* data, u32 type, u32 samplingRate, u32 numChannels, u32 );

extern "C" void AudioSetListenerVectors(bool leftHanded, float pX, float pY, float pZ, float fX, float fY, float fZ, float uX, float uY, float uZ);
extern "C" void AudioSetListenerMatrix(float _00, float _01, float _02, float _10, float _11, float _12, float _20, float _21, float _22);

extern "C" void AudioPlay2D(u32 pcmHandle, f32 volume, f32 pan);
extern "C" void AudioPlay3D(u32 pcmHandle, f32 volume, f32 pX, f32 pY, f32 pZ, f32 minAttenuation, f32 maxAttenuation);

extern "C" u32 AudioLoop2d(u32 pcmHandle, f32 volume, f32 pan);
extern "C" u32 AudioLoop3D(u32 pcmHandle, f32 volume, f32 pX, f32 pY, f32 pZ, f32 minAttenuation, f32 maxAttenuation);
extern "C" void AudioStop(u32 soundHandle); // Destroys the handle

extern "C" void AudioPause(u32 soundHandle);
extern "C" void AudioResume(u32 soundHandle);

extern "C" void AudioSetVolume(u32 soundHandle, f32 volume);
extern "C" void AudioSetPan(u32 soundHandle, f32 pan);

extern "C" void AudioSetAttenuation(u32 soundHandle, float _min, float _max);
extern "C" void AudioSetPosition(u32 soundHandle, float x, float y, float z);
*/

class AudioDevice {


}