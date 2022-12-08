#ifndef _H_AUDIO_
#define _H_AUDIO_

typedef unsigned int u32;
typedef float f32;
static_assert (sizeof(u32) == 4, "u32 should be a 4 byte type");
static_assert (sizeof(f32) == 4, "f32 should be a 4 byte type");

extern "C" u32 AudioCreateBuffer(u32 numChannels, u32 sampleRate, u32 numSamples, short* pcmData);
extern "C" void AudioDestroyBuffer(u32 buffer);

extern "C" u32 AudioCreateBus();
extern "C" void AudioDestroyBus(u32 bus);

extern "C" u32 AudioPlay2D(u32 buffer, u32 bus, bool looping, float volume, float pan);
extern "C" u32 AudioPlay3D(u32 buffer, u32 bus, bool looping, float volume, float px, float py, float pz, float minattenuation, float maxattenuation);
extern "C" void AudioStop(u32 soundId);

extern "C" void AudioSetListener(float px, float py, float pz, float upx, float upy, float upz, float fwdx, float fwdy, float fwdz);

extern "C" void AudioSetVolume(u32 soundOrBus, float volume);
extern "C" void AudioSetPan(u32 soundOrBus, float pan);
extern "C" void AudioSetPosition(u32 sound, float px, float py, float pz);
extern "C" void AudioSetAttenuation(u32 sound, float minatten, float maxatten);

#endif