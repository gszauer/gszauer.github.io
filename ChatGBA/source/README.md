# ChatGBA source

The Game Boy Advance inference engine and chat program behind `ChatGBA.gba`.

## Build

```
brew install arm-none-eabi-gcc     # or any arm-none-eabi toolchain
make
```

This writes `build/ChatGBA.gba`, byte for byte the same as `../ChatGBA.gba`. The weights come from `../chatgba-int8.bin`; `make WEIGHTS=other.bin` builds with another blob of the same shape.

## Files

| File | What it is |
|---|---|
| `engine.c`, `engine.h` | The integer inference engine: int8 weights read straight from cartridge ROM, an int8 KV cache in a ring per block, fixed-point everything. Compiled as ARM and run from the fast internal RAM. |
| `dot.s` | The hand-written ARM inner loop: int8 dot products, 16 weights per load burst. |
| `chat.c`, `chat.h` | The conversation: `<|u|>message<|e|><|a|>reply<|e|>` turns through the engine, sampling and stopping at `<|e|>`. |
| `main.c` | The program: the screen, the on-screen keyboard, the buttons, timing. |
| `font.h` | The 6 × 10 font (Monaco at 9 px, with hand-drawn descenders). `font.py` regenerates it (needs Pillow). |
| `model_config.h` | The model's shape and chat markers as compile-time constants, checked against the weights at start-up. |
| `blob.s` | Places the weights (`model.bin`) in ROM. |
| `crt0.s`, `gba.ld` | Start-up code and the memory map: ROM, the 256 KB of external work RAM (the KV cache), the 32 KB of internal RAM (the engine). |
| `libc.c`, `gba_include/string.h` | The four C library functions the program needs; there is no C library. |
| `fix_header.py` | Writes the Nintendo logo and header checksum into the ROM, so real hardware boots it. |

## The weights

`chatgba-int8.bin` is the float32 model (`../chatgba-float32.gab`) quantized for this engine: every matrix as int8 with one scale per output row, norm scales and canon filters in Q16, plus lookup tables for RoPE, softmax and SiLU. The quantizer, `export.py`, lives with the training code, since it reads the float model with it; it also writes `model_config.h`.
