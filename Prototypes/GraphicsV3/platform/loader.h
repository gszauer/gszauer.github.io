#ifndef _H_LOADER_
#define _H_LOADER_

typedef void (*OnFileLoaded)(const char* path, void* data, unsigned int bytes, void* userData);

extern "C" void LoadFileAsynch(const char* path, bool cached, void* target, unsigned int bytes, OnFileLoaded callback, void* userData);

#define WASM_LOADER_ENABLE_CALLBACKS __attribute__ (( visibility( "default" ) )) extern "C" void TriggerFileLoaderCallback(OnFileLoaded callback, const char* path, void* data, unsigned int bytes, void* userdata) { callback(path, data, bytes, userdata); }

#endif