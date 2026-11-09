@ int32_t dot_offset(const uint8_t* bytes, const int32_t* inputs, int n)
@
@ The sum of bytes[i] x inputs[i], 16 at a time (n is a multiple of 16), the
@ inner loop of every matrix product. ARM code in the fast internal RAM:
@   - the bytes (weights, int8 + 128) come from cartridge ROM four words per
@     LDM, a sequential burst, much cheaper than four separate loads
@   - each byte is unpacked with one AND (a shifted operand), which is why they
@     are stored offset to 0..255 rather than signed
@   - the byte is MLA's second operand: the ARM7 multiplies faster when that
@     operand is small
@ Registers: r0 bytes, r1 inputs, r2 end of bytes, r3 sum, r4-r7 sixteen
@ bytes, r8-r11 four inputs, r12 the mask 255, lr one unpacked byte.

    .section .iwram.text, "ax"
    .arm
    .align  2
    .global dot_offset
dot_offset:
    push    {r4-r11, lr}
    mov     r3, #0
    mov     r12, #255
    add     r2, r0, r2

1:  ldmia   r0!, {r4-r7}

    .irp    word, r4, r5, r6, r7
    ldmia   r1!, {r8-r11}
    and     lr, r12, \word
    mla     r3, r8, lr, r3
    and     lr, r12, \word, lsr #8
    mla     r3, r9, lr, r3
    and     lr, r12, \word, lsr #16
    mla     r3, r10, lr, r3
    mov     lr, \word, lsr #24
    mla     r3, r11, lr, r3
    .endr

    cmp     r0, r2
    blo     1b

    mov     r0, r3
    pop     {r4-r11, lr}
    bx      lr
