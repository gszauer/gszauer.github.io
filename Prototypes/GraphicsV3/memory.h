#ifndef _H_MEMORY_
#define _H_MEMORY_

extern "C" void* MemAllocate(unsigned int bytes, unsigned int alignment);
extern "C" void  MemRelease(void* ptr);
extern "C" void* MemCopy(void* dst, const void* src, unsigned int bytes);
extern "C" void* MemClear(void* dst, unsigned int bytes);

extern "C" void  MemDbgPrint(const char* msg); // TODO: Make a debug util for things like printf

#define WASM_MEM_EXPOSE_HEAP extern unsigned char __heap_base; \
__attribute__ (( visibility( "default" ) )) extern "C" void* WasmHeapBase(void) { \
  return &__heap_base; \
} 

#endif