// See chat.h.
#include "chat.h"

#include <string.h>

#include "engine.h"

// The chat markers the weights were fine-tuned with (export.py writes them
// into model_config.h): <|u|>, <|a|>, <|e|> for the production ChatGBA,
// <|user|>, <|assistant|>, <|end|> for the Mac runs. Below, <|end|> stands for
// whichever end marker it is.
static const char USER[] = CHAT_USER;
static const char ASSISTANT[] = CHAT_ASSISTANT;
static const char END[] = CHAT_END;
#define USER_LENGTH ((int)sizeof(USER) - 1)
#define ASSISTANT_LENGTH ((int)sizeof(ASSISTANT) - 1)
#define END_LENGTH ((int)sizeof(END) - 1)

static int end_seen = END_LENGTH;  // bytes of the last reply's closing <|end|> the engine has processed
static int32_t logits[MODEL_VOCAB];

void chat_reset(void) {
    end_seen = END_LENGTH;  // nothing to close
    engine_reset();
}

// The longest k such that the reply ends with the first k bytes of <|end|>.
static int partial_end(const uint8_t* reply, int length) {
    for (int k = END_LENGTH - 1; k > 0; --k) {
        if (k <= length && memcmp(reply + length - k, END, k) == 0) return k;
    }
    return 0;
}

int chat_reply(const uint8_t* message, int length, ChatSettings* settings, uint8_t* reply, int capacity) {
    // The rest of the last reply's <|end|>, then the new turn.
    int total = (END_LENGTH - end_seen) + USER_LENGTH + length + END_LENGTH + ASSISTANT_LENGTH;
    int done = 0;
#define FEED(bytes, n)                                                      \
    for (int i_ = 0; i_ < (n); ++i_) {                                      \
        engine_step(((const uint8_t*)(bytes))[i_], logits);                 \
        if (settings->on_prompt) settings->on_prompt(++done, total);        \
    }
    FEED(END + end_seen, END_LENGTH - end_seen);
    FEED(USER, USER_LENGTH);
    FEED(message, length);
    FEED(END, END_LENGTH);
    FEED(ASSISTANT, ASSISTANT_LENGTH);
#undef FEED

    int budget = settings->max_reply < capacity ? settings->max_reply : capacity;
    int n = 0, shown = 0, ended = 0;
    while (n < budget) {
        if (n > 0 && settings->stop && settings->stop()) break;
        int byte = engine_sample(logits, settings->temperature, settings->top_k, &settings->rng);
        reply[n++] = (uint8_t)byte;
        if (n >= END_LENGTH && memcmp(reply + n - END_LENGTH, END, END_LENGTH) == 0) {
            n -= END_LENGTH;
            ended = 1;
            break;  // its last byte waits for the next message
        }
        int hold = partial_end(reply, n);
        while (shown < n - hold) {
            if (settings->on_byte) settings->on_byte(reply[shown]);
            ++shown;
        }
        engine_step(byte, logits);
    }

    // The engine has seen every reply byte, and the part of <|end|> sampled so
    // far, except the very last byte of a complete one. A reply cut off in the
    // start of <|end|> keeps that start as the start of its closing <|end|>.
    if (ended) {
        end_seen = END_LENGTH - 1;
    } else {
        end_seen = partial_end(reply, n);
        n -= end_seen;
    }
    while (shown < n) {
        if (settings->on_byte) settings->on_byte(reply[shown]);
        ++shown;
    }
    return n;
}
