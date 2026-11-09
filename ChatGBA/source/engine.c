// aries_gba inference in integer arithmetic. See engine.h.
//
// One byte at a time: each step runs the new position through every block,
// reading the earlier positions' keys and values from the cache. The cache
// keeps keys and values as int8 with one Q16 scale per vector, in a ring per
// block: a block with a window keeps its last window positions, the others the
// last MODEL_CONTEXT. Positions never run out: the context slides, each byte
// seeing at most the MODEL_CONTEXT bytes up to and including itself.
#include "engine.h"

#include <string.h>

#ifdef __GBA__
// The cache lives in the 256 KB of external work RAM. (The Makefile compiles
// this file as ARM code and moves it into the fast internal RAM, where 64-bit
// multiplies are single instructions; the inner product is dot.s.)
#define BIG_STATE __attribute__((section(".bss.ewram")))
#else
#define BIG_STATE
#endif

#define D MODEL_D
#define H MODEL_HEADS
#define KV MODEL_KV_HEADS
#define HD MODEL_HEAD_DIM
#define L MODEL_BLOCKS
#define F MODEL_HIDDEN
#define K MODEL_KERNEL
#define CTX MODEL_CONTEXT
#define VOCAB MODEL_VOCAB
#define GROUP (H / KV)  // query heads per key/value head

#define EPS_Q32 42950          // RMSNorm's 1e-5, in units of 2^-32
#define INV_SQRT_HD 11585      // 1 / sqrt(32), Q16
#define LOG2E_Q16 94548        // log2(e), Q16
#define INPUT_LIMIT 4095       // matrix inputs are rounded to at most this
#define HISTORY_SHIFT 7        // canon histories are kept as int16 in Q9

uint32_t profile[PROFILE_PARTS];
uint32_t (*profile_clock)(void);
#ifdef PROFILE
#define TIME(part, statement)                          \
    do {                                               \
        uint32_t started_ = profile_clock();           \
        statement;                                     \
        profile[part] += profile_clock() - started_;   \
    } while (0)
#else
#define TIME(part, statement) statement
#endif

// --- The blob ------------------------------------------------------------------

typedef struct {
    const uint8_t* rows;    // [out][in], int8 + 128
    const int32_t* scales;  // [out], units of 2^-24
} Matrix;

typedef struct {
    const int32_t* attention_norm;  // [D]
    const int32_t* conv_a;          // [K][D]
    Matrix wq, wk, wv;
    const int32_t* q_norm;          // [H][HD]
    const int32_t* k_norm;          // [KV][HD]
    Matrix wo;
    const int32_t* mlp_norm;        // [D]
    const int32_t* conv_c;          // [K][D]
    Matrix gate, up, down;
} Block;

static Matrix embeddings;  // [VOCAB][D], also the output projection
static Block blocks[L];
static const int32_t* final_norm;
static const int32_t* rope_cos;  // [CTX][HD / 2]
static const int32_t* rope_sin;
static const int32_t* exp2_table;     // 2^(-i/256), i = 0..256
static const int32_t* sigmoid_table;  // -16 to 16 in steps of 1/16

static const int windows[L] = MODEL_WINDOWS;

static const uint8_t* cursor;

static const void* take(int bytes) {
    const void* at = cursor;
    cursor += (bytes + 3) & ~3;
    return at;
}

static Matrix take_matrix(int in, int out) {
    Matrix m;
    m.rows = take(in * out);
    m.scales = take(out * 4);
    return m;
}

// --- State ---------------------------------------------------------------------

static uint8_t cache_k[MODEL_KV_SLOTS][KV][HD] BIG_STATE;  // int8 + 128, like the weights
static int8_t cache_v[MODEL_KV_SLOTS][KV][HD] BIG_STATE;
static int32_t cache_k_scale[MODEL_KV_SLOTS][KV] BIG_STATE;  // Q16 scale x 1/sqrt(HD), units of 2^-24
static int32_t cache_v_scale[MODEL_KV_SLOTS][KV] BIG_STATE;
static int16_t history[L][2][K - 1][D] BIG_STATE;  // each canon layer's last inputs, newest first
static int first_slot[L];  // where each block's part of the cache starts
static int position;

// RoPE past the table's CTX positions. The angle at position p is p x theta_i,
// split as (p - p % CTX) x theta_i, the anchor, plus (p % CTX) x theta_i from
// the table. The anchor turns by CTX x theta_i every CTX positions. Attention
// depends only on differences between positions, so the anchor's own slow
// drift does not matter, only each turn's accuracy.
static int64_t anchor_cos[HD / 2], anchor_sin[HD / 2];  // Q30
static int32_t step_cos[HD / 2], step_sin[HD / 2];      // this position's rotation, Q16

// Working vectors for one position.
static int32_t x[D], a[D], q[H * HD], k[KV * HD], v[KV * HD], mixed[H * HD], delta[D];
static int32_t gate[F], up[F];
static int32_t scores[CTX];
static int32_t quantized[F > D ? F : D];
static int64_t sums[HD];

int engine_init(const uint8_t* blob) {
    const int32_t* header = (const int32_t*)blob;
    const int32_t expected[] = {0x31414247, 2, VOCAB, D, H, KV, HD, L, F, K, CTX};
    for (int i = 0; i < (int)(sizeof expected / sizeof expected[0]); ++i) {
        if (header[i] != expected[i]) return -1 - i;
    }
    for (int b = 0; b < L; ++b) {
        if (header[12 + b] != windows[b]) return -100 - b;
    }
    cursor = blob;
    take((12 + L) * 4);

    embeddings = take_matrix(D, VOCAB);
    for (int b = 0; b < L; ++b) {
        Block* blk = &blocks[b];
        blk->attention_norm = take(D * 4);
        blk->conv_a = take(K * D * 4);
        blk->wq = take_matrix(D, H * HD);
        blk->wk = take_matrix(D, KV * HD);
        blk->wv = take_matrix(D, KV * HD);
        blk->q_norm = take(H * HD * 4);
        blk->k_norm = take(KV * HD * 4);
        blk->wo = take_matrix(H * HD, D);
        blk->mlp_norm = take(D * 4);
        blk->conv_c = take(K * D * 4);
        blk->gate = take_matrix(D, F);
        blk->up = take_matrix(D, F);
        blk->down = take_matrix(F, D);
    }
    final_norm = take(D * 4);
    rope_cos = take(CTX * (HD / 2) * 4);
    rope_sin = take(CTX * (HD / 2) * 4);
    exp2_table = take(257 * 4);
    sigmoid_table = take(513 * 4);

    int slot = 0;
    for (int b = 0; b < L; ++b) {
        first_slot[b] = slot;
        slot += windows[b] ? windows[b] : CTX;
    }
    engine_reset();
    return 0;
}

void engine_reset(void) {
    position = 0;
    memset(history, 0, sizeof history);
    for (int i = 0; i < HD / 2; ++i) {
        anchor_cos[i] = (int64_t)1 << 30;
        anchor_sin[i] = 0;
    }
}

int engine_position(void) { return position; }

// --- Arithmetic ----------------------------------------------------------------

static int32_t saturate(int64_t value) {
    if (value > INT32_MAX) return INT32_MAX;
    if (value < INT32_MIN) return INT32_MIN;
    return (int32_t)value;
}

static int32_t mul_q16(int32_t a, int32_t b) {
    return saturate(((int64_t)a * b + 32768) >> 16);
}

static uint32_t sqrt64(uint64_t value) {
    uint64_t root = 0, bit = (uint64_t)1 << 62;
    while (bit > value) bit >>= 2;
    while (bit) {
        if (value >= root + bit) {
            value -= root + bit;
            root = (root >> 1) + bit;
        } else {
            root >>= 1;
        }
        bit >>= 2;
    }
    return (uint32_t)root;
}

// y = x / sqrt(mean(x^2) + 1e-5), times gamma when given, as MLX's rms_norm.
static void rms_norm(const int32_t* in, const int32_t* gamma, int n, int32_t* out) {
    int64_t squares = 0;
    for (int i = 0; i < n; ++i) squares += (int64_t)in[i] * in[i];
    uint32_t rms = sqrt64((uint64_t)squares / n + EPS_Q32);  // Q16
    if (rms == 0) rms = 1;
    int64_t inverse = ((int64_t)1 << 46) / rms;  // 1/rms, Q30
    for (int i = 0; i < n; ++i) {
        int64_t y = ((int64_t)in[i] * inverse + (1 << 29)) >> 30;
        if (gamma) y = (y * gamma[i] + 32768) >> 16;
        out[i] = saturate(y);
    }
}

// Round a Q16 vector to values of at most INPUT_LIMIT, sharing one
// power-of-two shift. Returns the shift; *sum gets the rounded values' sum.
static int quantize_input(const int32_t* in, int n, int32_t* out, int32_t* sum) {
    uint32_t peak = 0;
    for (int i = 0; i < n; ++i) {
        uint32_t magnitude = in[i] < 0 ? (uint32_t)(-(int64_t)in[i]) : (uint32_t)in[i];
        if (magnitude > peak) peak = magnitude;
    }
    int shift = 0;
    while ((peak >> shift) > INPUT_LIMIT) ++shift;
    int32_t half = shift ? 1 << (shift - 1) : 0, total = 0;
    for (int i = 0; i < n; ++i) total += out[i] = (in[i] + half) >> shift;
    *sum = total;
    return shift;
}

// The inner product of offset bytes (int8 + 128) and inputs, without the
// offset taken back out: sum of byte x input. n is a multiple of 16. On the GBA
// it is dot.s.
#ifdef __GBA__
int32_t dot_offset(const uint8_t* bytes, const int32_t* inputs, int n);
#else
static int32_t dot_offset(const uint8_t* bytes, const int32_t* inputs, int n) {
    int32_t sum = 0;
    for (int i = 0; i < n; ++i) sum += bytes[i] * inputs[i];
    return sum;
}
#endif

// The true inner product: each byte stands for byte - 128.
static int32_t dot(const uint8_t* bytes, const int32_t* inputs, int32_t input_sum, int n) {
    return dot_offset(bytes, inputs, n) - 128 * input_sum;
}

// A dot product's int32 sum back to Q16: times the output's scale (2^-24)
// and the input's shift.
static int32_t rescale(int32_t sum, int32_t scale, int shift) {
    int64_t r = (int64_t)sum * scale;
    int down = 24 - shift;
    if (down > 0) return saturate((r + ((int64_t)1 << (down - 1))) >> down);
    return saturate(r << -down);
}

// out = in @ W, for a matrix stored as int8 rows of W^T.
static void matrix_times(const Matrix* m, const int32_t* in, int n_in, int n_out, int32_t* out) {
    int32_t sum;
    int shift = quantize_input(in, n_in, quantized, &sum);
    for (int o = 0; o < n_out; ++o) {
        out[o] = rescale(dot(m->rows + o * n_in, quantized, sum, n_in), m->scales[o], shift);
    }
}

// e^d for d <= 0 (Q16), from the 2^(-i/256) table.
static int32_t exp_q16(int32_t d) {
    int64_t y = ((int64_t)(-d) * LOG2E_Q16) >> 16;  // -d log2(e), Q16
    int whole = (int)(y >> 16);
    if (whole >= 31) return 0;
    int fraction = (int)(y & 0xFFFF);
    int i = fraction >> 8, rest = fraction & 0xFF;
    int32_t t = exp2_table[i] + (((exp2_table[i + 1] - exp2_table[i]) * rest) >> 8);
    return t >> whole;
}

static int32_t sigmoid_q16(int32_t value) {
    if (value <= -16 * 65536) return sigmoid_table[0];
    if (value >= 16 * 65536) return sigmoid_table[512];
    int32_t offset = value + 16 * 65536;  // 0 to 32, Q16
    int i = offset >> 12, rest = offset & 0xFFF;
    return sigmoid_table[i] + (((sigmoid_table[i + 1] - sigmoid_table[i]) * rest) >> 12);
}

// Turn the anchor by CTX x theta_i: the table's last angle, (CTX - 1) x
// theta_i, then one more theta_i. Its length is put back to one, so rounding
// cannot grow or shrink it over a long conversation.
static void turn_anchor(void) {
    const int32_t* c_last = rope_cos + (CTX - 1) * (HD / 2);
    const int32_t* s_last = rope_sin + (CTX - 1) * (HD / 2);
    const int32_t* c_one = rope_cos + HD / 2;
    const int32_t* s_one = rope_sin + HD / 2;
    for (int i = 0; i < HD / 2; ++i) {
        int64_t tc = (int64_t)c_last[i] * c_one[i] - (int64_t)s_last[i] * s_one[i];  // Q32
        int64_t ts = (int64_t)s_last[i] * c_one[i] + (int64_t)c_last[i] * s_one[i];
        int64_t ac = anchor_cos[i], as = anchor_sin[i];  // Q30
        int64_t c = ((ac * (tc >> 16)) - (as * (ts >> 16)) + ((int64_t)1 << 15)) >> 16;  // Q30
        int64_t s = ((as * (tc >> 16)) + (ac * (ts >> 16)) + ((int64_t)1 << 15)) >> 16;
        uint32_t length = sqrt64((uint64_t)(c * c + s * s));  // Q30
        anchor_cos[i] = (c << 30) / length;
        anchor_sin[i] = (s << 30) / length;
    }
}

// This position's rotation: the anchor, then the table's angle.
static void set_rotation(void) {
    if (position > 0 && position % CTX == 0) turn_anchor();
    const int32_t* c = rope_cos + (position % CTX) * (HD / 2);
    const int32_t* s = rope_sin + (position % CTX) * (HD / 2);
    for (int i = 0; i < HD / 2; ++i) {
        step_cos[i] = (int32_t)((anchor_cos[i] * c[i] - anchor_sin[i] * s[i] + ((int64_t)1 << 29)) >> 30);
        step_sin[i] = (int32_t)((anchor_sin[i] * c[i] + anchor_cos[i] * s[i] + ((int64_t)1 << 29)) >> 30);
    }
}

// Rotate each adjacent pair (2i, 2i+1) of a head by its angle at this position.
static void rope(int32_t* head) {
    const int32_t* c = step_cos;
    const int32_t* s = step_sin;
    for (int i = 0; i < HD / 2; ++i) {
        int64_t x0 = head[2 * i], x1 = head[2 * i + 1];
        head[2 * i] = saturate((x0 * c[i] - x1 * s[i] + 32768) >> 16);
        head[2 * i + 1] = saturate((x0 * s[i] + x1 * c[i] + 32768) >> 16);
    }
}

// Store a head's vector as int8 with a Q16 scale, max |value| / 127. With
// offset, the bytes are int8 + 128.
static void store_int8(const int32_t* in, int8_t* out, int32_t* scale, int offset) {
    uint32_t peak = 0;
    for (int i = 0; i < HD; ++i) {
        uint32_t magnitude = in[i] < 0 ? (uint32_t)(-(int64_t)in[i]) : (uint32_t)in[i];
        if (magnitude > peak) peak = magnitude;
    }
    int32_t s = (int32_t)((peak + 126) / 127);
    if (s == 0) s = 1;
    for (int i = 0; i < HD; ++i) {
        int32_t value = in[i];
        int32_t r = value >= 0 ? (value + s / 2) / s : -((-value + s / 2) / s);
        out[i] = (int8_t)((r > 127 ? 127 : r < -127 ? -127 : r) + offset);
    }
    *scale = s;
}

// A canon layer: vec += sum over j of w[j] * (the input j positions back),
// then the input joins the history.
static void canon(int32_t* vec, const int32_t* w, int16_t (*hist)[D]) {
    for (int i = 0; i < D; ++i) {
        int64_t sum = (int64_t)w[i] * vec[i];
        for (int j = 1; j < K; ++j) sum += (int64_t)w[j * D + i] * ((int32_t)hist[j - 1][i] << HISTORY_SHIFT);
        int32_t input = vec[i];
        for (int j = K - 2; j > 0; --j) hist[j][i] = hist[j - 1][i];
        int32_t h = (input + (1 << (HISTORY_SHIFT - 1))) >> HISTORY_SHIFT;
        hist[0][i] = (int16_t)(h > 32767 ? 32767 : h < -32768 ? -32768 : h);
        vec[i] = saturate(input + ((sum + 32768) >> 16));
    }
}

// --- One position --------------------------------------------------------------

static void attention(int b, const Block* blk) {
    int window = windows[b];
    int slots = window ? window : CTX;
    int slot = first_slot[b] + position % slots;
    int first = position >= slots ? position - slots + 1 : 0;

    for (int g = 0; g < KV; ++g) {
        int32_t* kg = k + g * HD;
        rms_norm(kg, blk->k_norm + g * HD, HD, kg);
        rope(kg);
        int32_t scale;
        store_int8(kg, (int8_t*)cache_k[slot][g], &scale, 128);
        cache_k_scale[slot][g] = (int32_t)(((int64_t)scale * INV_SQRT_HD + 128) >> 8);
        store_int8(v + g * HD, cache_v[slot][g], &cache_v_scale[slot][g], 0);
    }

    for (int h = 0; h < H; ++h) {
        int g = h / GROUP;
        int32_t* qh = q + h * HD;
        rms_norm(qh, blk->q_norm + h * HD, HD, qh);
        rope(qh);
        int32_t sum;
        int shift = quantize_input(qh, HD, quantized, &sum);

        int32_t best = INT32_MIN;
        for (int j = first; j <= position; ++j) {
            int s = first_slot[b] + j % slots;
            int64_t r = (int64_t)dot(cache_k[s][g], quantized, sum, HD) * cache_k_scale[s][g];
            int32_t score = saturate(r >> (24 - shift));
            scores[j - first] = score;
            if (score > best) best = score;
        }

        int32_t total = 0;
        for (int d = 0; d < HD; ++d) sums[d] = 0;
        for (int j = first; j <= position; ++j) {
            int s = first_slot[b] + j % slots;
            int32_t weight = exp_q16(scores[j - first] - best);
            total += weight;
            int32_t u = (int32_t)(((int64_t)weight * cache_v_scale[s][g]) >> 8);
            const int8_t* vs = cache_v[s][g];
            for (int d = 0; d < HD; ++d) sums[d] += (int64_t)u * vs[d];
        }
        for (int d = 0; d < HD; ++d) mixed[h * HD + d] = saturate((sums[d] << 8) / total);
    }
}

void engine_step(int byte, int32_t* logits) {
    set_rotation();

    // The embedding row, from 2^-24 scales to Q16.
    const uint8_t* row = embeddings.rows + byte * D;
    int32_t scale = embeddings.scales[byte];
    for (int i = 0; i < D; ++i) x[i] = (int32_t)(((int64_t)(row[i] - 128) * scale + 128) >> 8);

    for (int b = 0; b < L; ++b) {
        const Block* blk = &blocks[b];

        TIME(PROFILE_NORMS, rms_norm(x, blk->attention_norm, D, a));
        TIME(PROFILE_CANON, canon(a, blk->conv_a, history[b][0]));
        TIME(PROFILE_MATRICES, matrix_times(&blk->wq, a, D, H * HD, q));
        TIME(PROFILE_MATRICES, matrix_times(&blk->wk, a, D, KV * HD, k));
        TIME(PROFILE_MATRICES, matrix_times(&blk->wv, a, D, KV * HD, v));
        TIME(PROFILE_ATTENTION, attention(b, blk));
        TIME(PROFILE_MATRICES, matrix_times(&blk->wo, mixed, H * HD, D, delta));
        for (int i = 0; i < D; ++i) x[i] = saturate((int64_t)x[i] + delta[i]);

        TIME(PROFILE_NORMS, rms_norm(x, blk->mlp_norm, D, a));
        TIME(PROFILE_CANON, canon(a, blk->conv_c, history[b][1]));
        TIME(PROFILE_MATRICES, matrix_times(&blk->gate, a, D, F, gate));
        TIME(PROFILE_MATRICES, matrix_times(&blk->up, a, D, F, up));
        TIME(PROFILE_MLP, for (int i = 0; i < F; ++i) gate[i] = mul_q16(mul_q16(gate[i], sigmoid_q16(gate[i])), up[i]));
        TIME(PROFILE_MATRICES, matrix_times(&blk->down, gate, F, D, delta));
        for (int i = 0; i < D; ++i) x[i] = saturate((int64_t)x[i] + delta[i]);
    }

    TIME(PROFILE_NORMS, rms_norm(x, final_norm, D, a));
    TIME(PROFILE_MATRICES, matrix_times(&embeddings, a, D, VOCAB, logits));
    ++position;
}

// --- Sampling ------------------------------------------------------------------

static uint32_t xorshift(uint32_t* state) {
    uint32_t s = *state;
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return *state = s;
}

int engine_sample(const int32_t* logits, int32_t temperature, int top_k, uint32_t* rng) {
    int best = 0;
    for (int i = 1; i < VOCAB; ++i) {
        if (logits[i] > logits[best]) best = i;
    }
    if (temperature <= 0) return best;

    // Weights e^((logit - best) / temperature), Q16.
    static int32_t weights[VOCAB];
    int64_t inverse = ((int64_t)1 << 32) / temperature;  // 1/temperature, Q16
    for (int i = 0; i < VOCAB; ++i) {
        int64_t z = ((int64_t)(logits[i] - logits[best]) * inverse) >> 16;
        weights[i] = exp_q16(z < INT32_MIN ? INT32_MIN : (int32_t)z);
    }
    // Keep the top_k largest: find the k-th largest weight.
    if (top_k > 0 && top_k < VOCAB) {
        int32_t floor = INT32_MAX;
        for (int n = 0; n < top_k; ++n) {
            int32_t next = -1;
            for (int i = 0; i < VOCAB; ++i) {
                if (weights[i] < floor && weights[i] > next) next = weights[i];
            }
            if (next < 0) break;
            floor = next;
        }
        for (int i = 0; i < VOCAB; ++i) {
            if (weights[i] < floor) weights[i] = 0;
        }
    }
    uint32_t total = 0;
    for (int i = 0; i < VOCAB; ++i) total += (uint32_t)weights[i];
    uint32_t target = (xorshift(rng) >> 8) % total;
    for (int i = 0; i < VOCAB; ++i) {
        if (target < (uint32_t)weights[i]) return i;
        target -= (uint32_t)weights[i];
    }
    return best;
}
