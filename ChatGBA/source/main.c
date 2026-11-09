// aries_gba on the Game Boy Advance: chat with an on-screen keyboard.
//
// The screen: the conversation at the top, then the message being typed, then
// the keyboard. While the model reads and replies, the keyboard gives way to
// the conversation and a status line. Controls:
//   D-pad   move on the keyboard           A       type the key
//   B       delete (hold: stop a reply)    START   send
//   R       shift, then caps lock, then off
//   L       a sample question              SELECT  new conversation
//
// The headless runner (runner.c) can also ask questions: it writes them into
// the mailbox at the start of internal RAM, 0x03000000, and reads the reply
// back from it as the bytes appear.
#include <stdint.h>

#include "chat.h"
#include "engine.h"
#include "font.h"

#define REG_DISPCNT (*(volatile uint16_t*)0x04000000)
#define REG_VCOUNT (*(volatile uint16_t*)0x04000006)
#define REG_KEYINPUT (*(volatile uint16_t*)0x04000130)
#define REG_WAITCNT (*(volatile uint16_t*)0x04000204)
#define REG_TM2CNT_L (*(volatile uint16_t*)0x04000108)
#define REG_TM2CNT_H (*(volatile uint16_t*)0x0400010A)
#define REG_TM3CNT_L (*(volatile uint16_t*)0x0400010C)
#define REG_TM3CNT_H (*(volatile uint16_t*)0x0400010E)
#define VRAM ((volatile uint16_t*)0x06000000)
#define EWRAM __attribute__((section(".bss.ewram")))  // the 256 KB external RAM, past the KV cache

#define KEY_A 0x0001
#define KEY_B 0x0002
#define KEY_SELECT 0x0004
#define KEY_START 0x0008
#define KEY_RIGHT 0x0010
#define KEY_LEFT 0x0020
#define KEY_UP 0x0040
#define KEY_DOWN 0x0080
#define KEY_R 0x0100
#define KEY_L 0x0200
#define KEY_REPEATS (KEY_RIGHT | KEY_LEFT | KEY_UP | KEY_DOWN | KEY_B)  // held down, these repeat

#define SCREEN_W 240
#define SCREEN_H 160
#define COLUMNS (SCREEN_W / FONT_WIDTH)  // 40
#define RGB(r, g, b) ((r) | (g) << 5 | (b) << 10)
#define BACKGROUND RGB(2, 3, 6)
#define TITLE RGB(31, 24, 8)
#define USER RGB(14, 26, 31)
#define MODEL RGB(28, 28, 28)
#define DIM RGB(14, 14, 16)
#define RULE RGB(6, 7, 11)
#define KEY_FACE RGB(6, 7, 12)

extern const uint8_t model_blob[];

// The runner's mailbox. Its layout is part of the runner's protocol: runner.c
// reads and writes these offsets.
#define MAILBOX_MAGIC 0x42475241  // "ARGB": ready
typedef struct {
    uint32_t magic;                 // 0
    volatile uint32_t request;      // 4: the runner adds one per command
    volatile uint32_t done;         // 8: set to request when the command is finished
    uint32_t command;               // 12: 1 reply to message, 2 forget the conversation
    uint32_t length;                // 16: message bytes
    int32_t temperature;            // 20: Q16
    uint32_t seed;                  // 24
    uint32_t max_reply;             // 28
    uint8_t message[512];           // 32
    volatile uint32_t out_length;   // 544: reply bytes so far
    uint8_t out[1024];              // 548
    volatile uint32_t prompt_done;  // 1572: bytes processed before replying
    volatile uint32_t prompt_total; // 1576
    int32_t status;                 // 1580: engine_init's result
    uint32_t prompt_ticks;          // 1584: time to process them, in 1/16384 s
    uint32_t reply_ticks;           // 1588: time to generate the reply
    int32_t reply_length;           // 1592: chat_reply's result
    uint32_t profile[PROFILE_PARTS]; // 1596: cycles per part, with PROFILE
} Mailbox;
Mailbox mailbox __attribute__((section(".shared")));

static const char* const questions[] = {
    "What is a rainbow?",
    "Why do we need to sleep?",
    "Can you tell me a short story about a cat?",
    "What do plants need to grow?",
    "How does a bicycle stay up?",
};

// --- Drawing -------------------------------------------------------------------

static void fill(int x, int y, int w, int h, uint16_t color) {
    for (int j = y; j < y + h; ++j) {
        for (int i = x; i < x + w; ++i) VRAM[j * SCREEN_W + i] = color;
    }
}

static void draw_char(int x, int y, int c, uint16_t ink, uint16_t paper) {
    const uint8_t* glyph = font[(c < 32 || c > 126 ? '?' : c) - 32];
    volatile uint16_t* at = VRAM + y * SCREEN_W + x;
    for (int j = 0; j < FONT_HEIGHT; ++j) {
        for (int i = 0; i < FONT_WIDTH; ++i) at[j * SCREEN_W + i] = (glyph[j] >> i & 1) ? ink : paper;
    }
}

static void draw_text(int x, int y, const char* text, uint16_t ink, uint16_t paper) {
    for (; *text; ++text, x += FONT_WIDTH) draw_char(x, y, (uint8_t)*text, ink, paper);
}

// Building short strings: each returns the new end, always terminated.
static char* add(char* at, const char* text) {
    while (*text) *at++ = *text++;
    *at = 0;
    return at;
}

static char* add_number(char* at, uint32_t n) {
    char digits[12];
    int i = 0;
    do digits[i++] = (char)('0' + n % 10); while (n /= 10);
    while (i) *at++ = digits[--i];
    *at = 0;
    return at;
}

// A duration in 1/16384 s: "52.3s" or "4m24s".
static char* add_time(char* at, uint32_t ticks) {
    uint32_t tenths = (ticks * 10ull + 8192) / 16384;
    if (tenths < 600) {
        at = add_number(at, tenths / 10);
        *at++ = '.';
        at = add_number(at, tenths % 10);
    } else {
        uint32_t s = tenths / 10;
        at = add_number(at, s / 60);
        *at++ = 'm';
        if (s % 60 < 10) *at++ = '0';
        at = add_number(at, s % 60);
    }
    return add(at, "s");
}

// --- The conversation: wrapped lines, the last few on screen ------------------

#define LOG_LINES 128
typedef struct {
    char text[COLUMNS];
    uint8_t length;
    uint16_t color;
} Line;
static Line lines[LOG_LINES] EWRAM;  // a ring: line i is lines[i % LOG_LINES]
static int line_count;               // lines so far; the last is the one being written
static int dirty_from;               // the first line changed since it was drawn
static int log_rows;                 // rows of text the conversation has on screen
static int shown_top = -1;           // the line at the top of the screen when last drawn

static Line* line(int i) { return &lines[i % LOG_LINES]; }

static void mark(int i) {
    if (i < dirty_from) dirty_from = i;
}

static Line* new_line(uint16_t color) {
    Line* l = line(line_count);
    l->length = 0;
    l->color = color;
    mark(line_count++);
    return l;
}

// Start writing in color, on a fresh line unless the current one is empty.
static void start(uint16_t color) {
    Line* l = line(line_count - 1);
    if (l->length) l = new_line(color);
    l->color = color;
    mark(line_count - 1);
}

// One byte of UTF-8 text: ASCII as is, one '?' per other character. A word that
// would run past the edge moves to the next line.
static void log_byte(int byte) {
    if (byte == '\n') {
        new_line(line(line_count - 1)->color);
        return;
    }
    if (byte == '\t') byte = ' ';
    if ((byte >= 0x80 && byte < 0xC0) || byte < 32 || byte == 127) return;  // continuations, controls
    if (byte >= 0xC0) byte = '?';

    Line* l = line(line_count - 1);
    if (l->length == COLUMNS) {
        if (byte == ' ') {
            new_line(l->color);
            return;
        }
        int space = COLUMNS - 1;
        while (space > 0 && l->text[space] != ' ') --space;
        Line* next = new_line(l->color);
        if (space > 0) {
            for (int i = space + 1; i < COLUMNS; ++i) next->text[next->length++] = l->text[i];
            l->length = (uint8_t)space;
            mark(line_count - 2);
        }
        l = next;
    }
    l->text[l->length++] = (char)byte;
    mark(line_count - 1);
}

static void log_text(const char* text, uint16_t color) {
    start(color);
    while (*text) log_byte((uint8_t)*text++);
}

// Draw the lines that changed, or all of them if the conversation scrolled.
static void draw_log(void) {
    int top = line_count > log_rows ? line_count - log_rows : 0;
    int from = top != shown_top ? top : (dirty_from > top ? dirty_from : top);
    for (int i = from; i < top + log_rows; ++i) {
        int y = (i - top) * FONT_HEIGHT;
        if (i >= line_count) {
            fill(0, y, SCREEN_W, FONT_HEIGHT, BACKGROUND);
            continue;
        }
        Line* l = line(i);
        for (int c = 0; c < COLUMNS; ++c) draw_char(c * FONT_WIDTH, y, c < l->length ? l->text[c] : ' ', l->color, BACKGROUND);
    }
    shown_top = top;
    dirty_from = line_count;
}

// --- The keyboard --------------------------------------------------------------

// Below the conversation's 8 rows: a rule, 2 rows for the message being typed,
// then 4 rows of 12 keys and a row of wide keys.
#define TYPING_ROWS 8
#define INPUT_Y 82
#define KEYS_Y 104
#define KEY_W 20
#define KEY_H 11
#define INPUT_MAX 200

static const char keys_lower[4][13] = {"1234567890-'", "qwertyuiop?!", "asdfghjkl.,:", "zxcvbnm;()\"/"};
static const char keys_upper[4][13] = {"@#$%&*+=_<>~", "QWERTYUIOP?!", "ASDFGHJKL.,:", "ZXCVBNM;()\"/"};
// The bottom row: first column of each wide key, and one past the last.
static const int wide_starts[5] = {0, 2, 8, 10, 12};
enum { WIDE_SHIFT, WIDE_SPACE, WIDE_DELETE, WIDE_SEND };

static char input[INPUT_MAX + 1] EWRAM;
static int input_length;
static int shift;  // 0 off, 1 the next key, 2 caps lock
static int cursor_x, cursor_y;

static int wide_key(int x) {
    int k = 0;
    while (x >= wide_starts[k + 1]) ++k;
    return k;
}

static void draw_key(int x, int y, int w, const char* label, int selected, uint16_t ink) {
    int px = x * KEY_W, py = KEYS_Y + y * KEY_H;
    uint16_t face = selected ? TITLE : KEY_FACE;
    fill(px + 1, py, w * KEY_W - 2, KEY_H - 1, face);
    int length = 0;
    while (label[length]) ++length;
    draw_text(px + (w * KEY_W - length * FONT_WIDTH) / 2, py, label, selected ? BACKGROUND : ink, face);
}

static void draw_one_key(int x, int y) {
    if (y < 4) {
        char label[2] = {(shift ? keys_upper : keys_lower)[y][x], 0};
        draw_key(x, y, 1, label, cursor_y == y && cursor_x == x, MODEL);
        return;
    }
    static const char* const wide_labels[4] = {"shift", "space", "del", "send"};
    int k = wide_key(x);
    const char* label = k == WIDE_SHIFT && shift == 2 ? "CAPS" : wide_labels[k];
    uint16_t ink = k == WIDE_SHIFT && shift ? USER : k == WIDE_SEND ? TITLE : DIM;
    draw_key(wide_starts[k], 4, wide_starts[k + 1] - wide_starts[k], label, cursor_y == 4 && k == wide_key(cursor_x), ink);
}

// Drawing is slow enough to miss a quick key press, so after the first time
// only the keys that changed are drawn again: where the cursor was and is, or
// every key when shift changes.
static int drawn_x = -1, drawn_y, drawn_shift;

static void draw_keyboard(void) {
    if (drawn_x < 0 || shift != drawn_shift) {
        for (int y = 0; y < 4; ++y) {
            for (int x = 0; x < 12; ++x) draw_one_key(x, y);
        }
        for (int k = 0; k < 4; ++k) draw_one_key(wide_starts[k], 4);
    } else if (drawn_x != cursor_x || drawn_y != cursor_y) {
        draw_one_key(drawn_x, drawn_y);
        draw_one_key(cursor_x, cursor_y);
    }
    drawn_x = cursor_x;
    drawn_y = cursor_y;
    drawn_shift = shift;
}

// "> " and the message, its last 2 lines' worth if it is longer, and a cursor.
// Only the characters that changed are drawn again.
static uint16_t drawn_input[2 * COLUMNS];  // character | ink << 8; 0 when unknown

static void draw_input(void) {
    int total = 2 + input_length + 1;
    int skip = total > 2 * COLUMNS ? total - 2 * COLUMNS : 0;
    for (int i = 0; i < 2 * COLUMNS; ++i) {
        int at = skip + i;
        int c = at >= total ? ' ' : at < 2 ? "> "[at] : at - 2 < input_length ? input[at - 2] : '_';
        int ink = at == total - 1 ? 1 : at < 2 ? 2 : 3;
        uint16_t key = (uint16_t)(c | ink << 8);
        if (drawn_input[i] == key) continue;
        drawn_input[i] = key;
        draw_char(i % COLUMNS * FONT_WIDTH, INPUT_Y + i / COLUMNS * FONT_HEIGHT, c,
                  ink == 1 ? TITLE : ink == 2 ? DIM : USER, BACKGROUND);
    }
}

// Back to typing: the conversation's last 8 rows, the message, the keyboard.
static void typing_screen(void) {
    log_rows = TYPING_ROWS;
    shown_top = -1;
    draw_log();
    fill(0, TYPING_ROWS * FONT_HEIGHT, SCREEN_W, SCREEN_H - TYPING_ROWS * FONT_HEIGHT, BACKGROUND);
    fill(0, TYPING_ROWS * FONT_HEIGHT + 1, SCREEN_W, 1, RULE);
    for (int i = 0; i < 2 * COLUMNS; ++i) drawn_input[i] = 0;
    drawn_x = -1;
    draw_input();
    draw_keyboard();
}

// --- Time ----------------------------------------------------------------------

// Timers 2 and 3 chained: one tick per 1024 cycles, 16,384 per second.
static uint32_t ticks(void) {
    uint32_t high, low;
    do {
        high = REG_TM3CNT_L;
        low = REG_TM2CNT_L;
    } while (high != REG_TM3CNT_L);
    return high << 16 | low;
}

// Timers 0 and 1 chained: every cycle, for profiling.
static uint32_t cycles(void) {
    uint32_t high, low;
    do {
        high = *(volatile uint16_t*)0x04000104;
        low = *(volatile uint16_t*)0x04000100;
    } while (high != *(volatile uint16_t*)0x04000104);
    return high << 16 | low;
}

static void wait_for_vblank(void) {
    while (REG_VCOUNT >= SCREEN_H) {}
    while (REG_VCOUNT < SCREEN_H) {}
}

// --- Chat ----------------------------------------------------------------------

// While the model works, the bottom row says what it is doing.
#define STATUS_Y (SCREEN_H - FONT_HEIGHT)

static void status(const char* text) {
    char row[COLUMNS + 1];
    int i = 0;
    for (; text[i] && i < COLUMNS; ++i) row[i] = text[i];
    for (; i < COLUMNS; ++i) row[i] = ' ';
    row[COLUMNS] = 0;
    draw_text(0, STATUS_Y, row, DIM, BACKGROUND);
}

static uint32_t reply_start;
static int stopped;

static void on_prompt(int done, int total) {
    mailbox.prompt_done = done;
    mailbox.prompt_total = total;
    if (done == total) {
        reply_start = ticks();
        status("writing...  hold B to stop");
    } else {
        char text[COLUMNS + 1];
        char* at = add(text, "reading ");
        at = add_number(at, done);
        at = add(at, " of ");
        at = add_number(at, total);
        add(at, " bytes...");
        status(text);
    }
}

static void on_byte(int byte) {
    if (mailbox.out_length < sizeof mailbox.out) mailbox.out[mailbox.out_length] = (uint8_t)byte;
    mailbox.out_length = mailbox.out_length + 1;
    if (byte == ' ' && line(line_count - 1)->length == 0) return;  // replies start with a space
    log_byte(byte);
    draw_log();
}

static int stop(void) {
    if (!(~REG_KEYINPUT & KEY_B)) return 0;
    stopped = 1;
    return 1;
}

static void ask(const uint8_t* message, int length, int32_t temperature, uint32_t seed, int max_reply) {
    static uint8_t reply[1024] EWRAM;
    mailbox.out_length = 0;  // first: drawing takes frames, and the runner is watching
    mailbox.prompt_done = mailbox.prompt_total = 0;
    start(USER);
    log_text("you> ", USER);
    for (int i = 0; i < length; ++i) log_byte(message[i]);
    start(MODEL);

    // The whole screen for the conversation, the bottom row for the status.
    log_rows = SCREEN_H / FONT_HEIGHT - 1;
    shown_top = -1;
    draw_log();
    status("reading...");

    ChatSettings settings = {
        .temperature = temperature, .top_k = 40, .max_reply = max_reply,
        .rng = seed ? seed : 1, .on_byte = on_byte, .on_prompt = on_prompt, .stop = stop,
    };
    stopped = 0;
    uint32_t begin = ticks();
    reply_start = begin;
    for (int i = 0; i < PROFILE_PARTS; ++i) profile[i] = 0;
    int n = chat_reply(message, length, &settings, reply, sizeof reply);
    uint32_t end = ticks();
    for (int i = 0; i < PROFILE_PARTS; ++i) mailbox.profile[i] = profile[i];
    mailbox.reply_length = n;
    mailbox.prompt_ticks = reply_start - begin;
    mailbox.reply_ticks = end - reply_start;

    char text[64];
    char* at = add(text, "[read ");
    at = add_number(at, mailbox.prompt_total);
    at = add(at, "B in ");
    at = add_time(at, mailbox.prompt_ticks);
    at = add(at, ", wrote ");
    at = add_number(at, n);
    at = add(at, "B in ");
    at = add_time(at, mailbox.reply_ticks);
    add(at, stopped ? ", stopped]" : "]");
    log_text(text, DIM);
    start(MODEL);
}

static void new_conversation(void) {
    chat_reset();
    log_text("-- new conversation --", DIM);
    start(MODEL);
}

// --- Typing --------------------------------------------------------------------

static void type(int c) {
    if (input_length < INPUT_MAX) input[input_length++] = (char)c;
    if (shift == 1) shift = 0;
}

static void delete_one(void) {
    if (input_length) --input_length;
    if (!input_length && !shift) shift = 1;  // a new message starts with a capital
}

static void send(void) {
    if (!input_length) return;
    ask((const uint8_t*)input, input_length, (int32_t)(0.7 * 65536), ticks() | 1, 300);
    input_length = 0;
    shift = 1;
}

static void move(int keys) {
    if (cursor_y == 4) {  // the wide keys: one step per key
        int k = wide_key(cursor_x);
        if (keys & KEY_LEFT) cursor_x = wide_starts[(k + 3) % 4];
        if (keys & KEY_RIGHT) cursor_x = wide_starts[(k + 1) % 4];
    } else {
        if (keys & KEY_LEFT) cursor_x = (cursor_x + 11) % 12;
        if (keys & KEY_RIGHT) cursor_x = (cursor_x + 1) % 12;
    }
    if (keys & KEY_UP) cursor_y = (cursor_y + 4) % 5;
    if (keys & KEY_DOWN) cursor_y = (cursor_y + 1) % 5;
}

static void press(void) {
    if (cursor_y < 4) {
        type((shift ? keys_upper : keys_lower)[cursor_y][cursor_x]);
        return;
    }
    switch (wide_key(cursor_x)) {
        case WIDE_SHIFT: shift = (shift + 1) % 3; break;
        case WIDE_SPACE: type(' '); break;
        case WIDE_DELETE: delete_one(); break;
        case WIDE_SEND: send(); break;
    }
}

int main(void) {
    REG_WAITCNT = 0x4317;  // faster ROM wait states (3/1) and the prefetch buffer
    REG_DISPCNT = 0x0403;  // mode 3: a 240 x 160 bitmap, 15-bit color
    REG_TM2CNT_H = 0;
    REG_TM3CNT_H = 0;
    REG_TM2CNT_L = 0;
    REG_TM3CNT_L = 0;
    REG_TM3CNT_H = 0x0084;  // counts timer 2's overflows
    REG_TM2CNT_H = 0x0083;  // one tick per 1024 cycles
    *(volatile uint16_t*)0x04000106 = 0x0084;  // timer 1 counts timer 0's overflows
    *(volatile uint16_t*)0x04000102 = 0x0080;  // timer 0: every cycle
    profile_clock = cycles;

    line_count = 0;
    dirty_from = 0;
    new_line(TITLE);
    log_text("ChatGBA: 4M parameters 512 context", TITLE);
    int status_code = engine_init(model_blob);
    mailbox.status = status_code;
    if (status_code) {
        log_text("the weights do not match the engine", TITLE);
        typing_screen();
        for (;;) {}
    }
    log_text("A type   B delete   START send", DIM);
    log_text("R shift  L sample question", DIM);
    log_text("SELECT new conversation", DIM);
    start(MODEL);
    input_length = 0;
    shift = 1;
    cursor_x = cursor_y = 0;
    typing_screen();
    mailbox.magic = MAILBOX_MAGIC;

    unsigned next_question = 0;
    uint16_t last_keys = 0;
    int held = 0;
    for (;;) {
        wait_for_vblank();
        if (mailbox.request != mailbox.done) {
            if (mailbox.command == 2) new_conversation();
            else ask(mailbox.message, (int)mailbox.length, mailbox.temperature, mailbox.seed, (int)mailbox.max_reply);
            mailbox.done = mailbox.request;
            typing_screen();
            continue;
        }

        uint16_t keys = (uint16_t)~REG_KEYINPUT & 0x3FF;  // pressed keys read as 0
        uint16_t pressed = keys & ~last_keys;
        // Held keys repeat after 18 frames, then every 4.
        if ((keys & KEY_REPEATS) && (keys & KEY_REPEATS) == (last_keys & KEY_REPEATS)) {
            if (++held >= 18 && (held - 18) % 4 == 0) pressed |= keys & KEY_REPEATS;
        } else {
            held = 0;
        }
        last_keys = keys;
        if (!pressed) continue;

        if (pressed & (KEY_LEFT | KEY_RIGHT | KEY_UP | KEY_DOWN)) move(pressed);
        if (pressed & KEY_A) press();
        if (pressed & KEY_B) delete_one();
        if (pressed & KEY_R) shift = (shift + 1) % 3;
        if (pressed & KEY_L) {
            const char* q = questions[next_question++ % (sizeof questions / sizeof questions[0])];
            for (input_length = 0; q[input_length]; ++input_length) input[input_length] = q[input_length];
            shift = 0;
        }
        if (pressed & KEY_SELECT) new_conversation();
        if (pressed & KEY_START) send();
        if (log_rows != TYPING_ROWS) {  // a reply just finished
            typing_screen();
        } else {
            draw_log();
            draw_input();
            draw_keyboard();
        }
    }
}
