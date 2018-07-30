#https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html
source /home/gszauer/Downloads/emsdk-portable/emsdk_env.sh
rm *.html
rm *.js
rm *.wasm
rm *.tar.gz
rm *.html.mat
emcc decompose.c -o decompose.html -s EXPORTED_FUNCTIONS="['_decomp_affine_js', '_spect_decomp_js', '_polar_decomp_js']"  -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']"