"""Make a GBA ROM's header bootable on real hardware: write the Nintendo logo
(0x04-0x9F) and the fixed byte 0x96 (0xB2), fill in the header checksum (byte
0xBD) and pad the ROM to a multiple of 4 bytes. The console's BIOS refuses to
start a cartridge whose logo or checksum is wrong; emulators skip the check.
The logo bytes are the ones devkitPro's gbafix writes.

    python3 fix_header.py ROM.gba"""
import hashlib
import sys
from pathlib import Path

LOGO = bytes.fromhex(
    "24ffae51699aa2213d84820a84e409ad11248b98c0817f21a352be199309ce20"
    "10464a4af82731ec58c7e83382e3cebf85f4df94ce4b09c194568ac01372a7fc"
    "9f844d73a3ca9a615897a327fc039876231dc7610304ae56bf38840040a70efd"
    "ff52fe036f9530f197fbc08560d68025a963be03014e38e2f9a234ffbb3e0344"
    "780090cb88113a9465c07c6387f03cafd625e48b380aac7221d4f807")
assert hashlib.sha1(LOGO).hexdigest() == "17daa0fec02fc33c0f6abb549a8b80b6613b48ee"

rom = bytearray(Path(sys.argv[1]).read_bytes())
rom[0x04:0xA0] = LOGO
rom[0xB2] = 0x96
rom[0xBD] = -(sum(rom[0xA0:0xBD]) + 0x19) & 0xFF
rom += b"\0" * (-len(rom) % 4)
Path(sys.argv[1]).write_bytes(rom)
