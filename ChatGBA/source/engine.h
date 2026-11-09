// aries_gba inference in integer arithmetic, for the Game Boy Advance (and the
// Mac, where the same code measures what quantization costs).
//
// Numbers are fixed-point: an int32 "Q16" value v stands for v / 65536.
// Weights are int8 with one scale per output; activations entering a matrix
// are rounded to at most 13 bits with a shared power-of-two shift, so a
// product of the two fits easily in an int32 sum.
#pragma once
#include <stdint.h>
#include "model_config.h"

// Reads the blob that export.py wrote (it stays where it is; on the GBA, in
// cartridge ROM). Returns 0, or a negative number if the blob does not match
// model_config.h.
int engine_init(const uint8_t* blob);

// Forget the context: the next byte is position 0.
void engine_reset(void);

// Bytes processed so far: the position of the next one.
int engine_position(void);

// Process one byte at the next position and write the scores for the byte that
// follows it into logits (Q16, MODEL_VOCAB of them). There is no last position:
// the context slides, so each byte sees at most the MODEL_CONTEXT bytes up to
// and including itself (fewer in a block with a shorter window).
void engine_step(int byte, int32_t* logits);

// Pick the next byte from logits. temperature is Q16; 0 picks the most likely
// byte. Sampling keeps the top_k most likely bytes. rng is an xorshift32 state.
int engine_sample(const int32_t* logits, int32_t temperature, int top_k, uint32_t* rng);

// With PROFILE defined, engine_step adds the time it spends in each part to
// profile[] (in whatever units profile_clock counts).
enum { PROFILE_MATRICES, PROFILE_ATTENTION, PROFILE_NORMS, PROFILE_CANON, PROFILE_MLP, PROFILE_PARTS };
extern uint32_t profile[PROFILE_PARTS];
extern uint32_t (*profile_clock)(void);
