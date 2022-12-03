@echo off

C:/WASM/clang.exe -x c++ ^
    --target=wasm32 ^
    -nostdinc ^
    -nostdlib ^
    -O0 ^
    -gfull ^
    -fno-threadsafe-statics ^
    -Wl,--allow-undefined ^
    -Wl,--import-memory ^
    -Wl,--no-entry ^
    -Wl,--export-dynamic ^
    -Wl,-z,stack-size=4194304 ^
    -D WASM32=1 ^
    -D _WASM32=1 ^
    -D DEBUG=1 ^
    -D _DEBUG=1 ^
    -o test.wasm ^
    test.cpp

python C:/WASM/wasm-sourcemap.py ^
    test.wasm -s ^
    -o test.wasm.map ^
    -u "./test.wasm.map" ^
    -w test.debug.wasm ^
    --dwarfdump=C:/WASM/llvm-dwarfdump.exe