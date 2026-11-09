@ The weights and tables from export.py, in cartridge ROM.
    .section .rodata.blob, "a"
    .balign 4
    .global model_blob
model_blob:
    .incbin "model.bin"
