/* The GBA's memory: cartridge ROM (weights and code), 32 KB of fast internal
   work RAM (the runner's mailbox first, at 0x03000000, then the hot code and
   working vectors; the top 4 KB is left to the stacks), and 256 KB of external
   work RAM (the KV cache and canon histories). */
OUTPUT_FORMAT("elf32-littlearm")
OUTPUT_ARCH(arm)
ENTRY(_start)

MEMORY {
    rom   : ORIGIN = 0x08000000, LENGTH = 32M
    iwram : ORIGIN = 0x03000000, LENGTH = 0x7000
    ewram : ORIGIN = 0x02000000, LENGTH = 256K
}

SECTIONS {
    .text : {
        KEEP(*(.crt0))
        *(.text .text.*)
        *(.rodata .rodata.*)
        . = ALIGN(4);
    } > rom

    .shared (NOLOAD) : {
        __shared_start = .;
        KEEP(*(.shared))
        . = ALIGN(4);
        __shared_end = .;
    } > iwram

    .iwram : {
        __iwram_start = .;
        *(.iwram.text)
        *(.data .data.*)
        . = ALIGN(4);
        __iwram_end = .;
    } > iwram AT > rom
    __iwram_lma = LOADADDR(.iwram);

    /* Before .bss, so that it claims .bss.ewram first. */
    .ewram (NOLOAD) : {
        *(.bss.ewram)
        . = ALIGN(4);
    } > ewram

    .bss (NOLOAD) : {
        __bss_start = .;
        *(.bss .bss.* COMMON)
        . = ALIGN(4);
        __bss_end = .;
    } > iwram

    /DISCARD/ : { *(.ARM.exidx*) *(.ARM.attributes) *(.comment) }
}
