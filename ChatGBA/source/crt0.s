@ Start-up for the GBA: the cartridge header, stacks, then copying the
@ fast-RAM code and data out of ROM, clearing .bss, and calling main.

    .section .crt0, "ax"
    .arm
    .global _start
_start:
    b       reset
    .fill   156, 1, 0           @ Nintendo logo: left blank (mGBA boots without it)
    .ascii  "ChatGBA\0\0\0\0\0"  @ title, 12 bytes (shown in mGBA's title bar)
    .ascii  "AAGE"              @ game code
    .ascii  "GB"                @ maker code
    .byte   0x96                @ fixed value
    .byte   0                   @ main unit code
    .byte   0                   @ device type
    .fill   7, 1, 0             @ reserved
    .byte   0                   @ software version
    .byte   0                   @ header checksum, filled in by fix_header.py
    .fill   2, 1, 0             @ reserved

reset:
    mov     r0, #0x12           @ IRQ mode
    msr     cpsr_c, r0
    ldr     sp, =0x03007FA0
    mov     r0, #0x1F           @ system mode, where main runs
    msr     cpsr_c, r0
    ldr     sp, =0x03007F00

    ldr     r0, =__iwram_lma    @ fast-RAM code and data, from ROM
    ldr     r1, =__iwram_start
    ldr     r2, =__iwram_end
1:  cmp     r1, r2
    ldrlo   r3, [r0], #4
    strlo   r3, [r1], #4
    blo     1b

    mov     r3, #0
    ldr     r1, =__shared_start @ the runner's mailbox
    ldr     r2, =__shared_end
2:  cmp     r1, r2
    strlo   r3, [r1], #4
    blo     2b
    ldr     r1, =__bss_start
    ldr     r2, =__bss_end
4:  cmp     r1, r2
    strlo   r3, [r1], #4
    blo     4b

    ldr     r0, =main
    mov     lr, pc
    bx      r0
3:  b       3b
    .pool
