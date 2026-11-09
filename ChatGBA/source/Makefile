# ChatGBA, the Game Boy Advance ROM.
#
#   make
#
# builds BUILD/ChatGBA.gba from these sources and the quantized weights,
# ../chatgba-int8.bin (model_config.h describes them). The result matches the
# ChatGBA.gba next to this folder byte for byte.
# Tools: arm-none-eabi-gcc (brew install arm-none-eabi-gcc) and python3.

WEIGHTS ?= ../chatgba-int8.bin
BUILD ?= build
GBA_CC = arm-none-eabi-gcc
GBA_FLAGS = -mcpu=arm7tdmi -mthumb -mthumb-interwork -O2 -ffreestanding -fno-strict-aliasing \
            -fno-builtin -fno-tree-loop-distribute-patterns -D__GBA__ -Wall -Wextra -I. -Igba_include

all: $(BUILD)/ChatGBA.gba

# blob.s includes the weights as model.bin.
$(BUILD)/model.bin: $(WEIGHTS)
	mkdir -p $(BUILD)
	cp $< $@

# The engine runs as ARM code from the fast internal RAM: compiled as ARM, its
# .text renamed so the linker places it there (crt0.s copies it in from ROM).
# Everything calls across the gap between ROM and internal RAM with long calls.
$(BUILD)/engine.o: engine.c engine.h model_config.h
	mkdir -p $(BUILD)
	$(GBA_CC) $(GBA_FLAGS) -marm -mlong-calls -c engine.c -o $@
	arm-none-eabi-objcopy --rename-section .text=.iwram.text $@

$(BUILD)/aries_gba.elf: crt0.s blob.s dot.s main.c chat.c libc.c chat.h font.h gba.ld model_config.h $(BUILD)/engine.o $(BUILD)/model.bin
	$(GBA_CC) $(GBA_FLAGS) -mlong-calls -nostdlib -nostartfiles -T gba.ld -Wl,--no-warn-rwx-segments -o $@ \
	    crt0.s -Wa,-I$(BUILD) blob.s dot.s main.c chat.c libc.c $(BUILD)/engine.o -lgcc

# The Nintendo logo and header checksum, so real hardware boots it.
$(BUILD)/ChatGBA.gba: $(BUILD)/aries_gba.elf fix_header.py
	arm-none-eabi-objcopy -O binary $< $@
	python3 fix_header.py $@

.PHONY: all
