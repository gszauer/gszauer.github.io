// The few C library functions the compiler and engine call; the GBA build has
// no C library.
#include <stddef.h>
#include <stdint.h>

void* memcpy(void* to, const void* from, size_t n) {
    uint8_t* d = to;
    const uint8_t* s = from;
    while (n--) *d++ = *s++;
    return to;
}

void* memmove(void* to, const void* from, size_t n) {
    uint8_t* d = to;
    const uint8_t* s = from;
    if (d < s) {
        while (n--) *d++ = *s++;
    } else {
        while (n--) d[n] = s[n];
    }
    return to;
}

void* memset(void* to, int value, size_t n) {
    uint8_t* d = to;
    while (n--) *d++ = (uint8_t)value;
    return to;
}

int memcmp(const void* a, const void* b, size_t n) {
    const uint8_t *x = a, *y = b;
    for (; n--; ++x, ++y) {
        if (*x != *y) return *x - *y;
    }
    return 0;
}
