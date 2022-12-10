@echo off

del build\\wasm\\*.* /F /Q
del build\\wasm\\assets\\*.* /F /Q

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
    -o "build/wasm/test.wasm" ^
    test.cpp

python C:/WASM/wasm-sourcemap.py ^
    "build/wasm/test.wasm" -s ^
    -o "build/wasm/test.wasm.map" ^
    -u "./test.wasm.map" ^
    -w "build/wasm/test.debug.wasm" ^
    --dwarfdump="C:/WASM/llvm-dwarfdump.exe"

xcopy "assets" "build/wasm/assets" /E /Y
xcopy "platform/wasm" "build/wasm" /E /V /Y

set /a port=%random% %%8000 +1000

pushd build\wasm
python -m http.server %port%
popd