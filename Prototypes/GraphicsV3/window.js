/*
Exposes the following functions:

TODO: Key keyboard state
TODO: Get mouse state (and touch)

Expects to call the following functions:
__attribute__ (( visibility( "default" ) )) extern "C" void* Initialize();
__attribute__ (( visibility( "default" ) )) extern "C" void Update(float dt, void* userData);
__attribute__ (( visibility( "default" ) )) extern "C" void Render(unsigned int x, unsigned int y, unsigned int w, unsigned int h, void* userData);
__attribute__ (( visibility( "default" ) )) extern "C" void Shutdown(void* userData);
*/

class Window {

}