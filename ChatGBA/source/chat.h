// Chat on top of engine.c: the conversation as turn pairs,
//   <|user|>...<|end|><|assistant|>...<|end|>
// fed to the engine as it happens, once. The engine's context slides, so a
// long conversation simply forgets its oldest bytes, the way the model was
// fine-tuned (on windows that start anywhere in a conversation).
#pragma once
#include <stdint.h>

typedef struct {
    int32_t temperature;  // Q16; 0 picks the most likely byte
    int top_k;
    int max_reply;        // bytes
    uint32_t rng;         // xorshift32 state, nonzero
    void (*on_byte)(int byte);                // each reply byte, once it cannot be part of <|end|>
    void (*on_prompt)(int done, int total);   // progress through the bytes processed before replying
    int (*stop)(void);                        // asked before each reply byte after the first; nonzero ends the reply
} ChatSettings;

void chat_reset(void);

// Reply to message. Returns the reply's length (written to reply, without
// <|end|>). A message longer than the context is fine; its start slides out.
int chat_reply(const uint8_t* message, int length, ChatSettings* settings, uint8_t* reply, int capacity);
