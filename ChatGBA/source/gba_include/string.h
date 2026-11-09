// The GBA build has no C library: these are libc.c's.
#pragma once
#include <stddef.h>
void* memcpy(void* to, const void* from, size_t n);
void* memmove(void* to, const void* from, size_t n);
void* memset(void* to, int value, size_t n);
int memcmp(const void* a, const void* b, size_t n);
