#ifndef _H_WINDOW_
#define _H_WINDOW_

typedef unsigned int u32;
typedef int i32;
static_assert (sizeof(u32) == 4, "u32 should be a 4 byte type");
static_assert (sizeof(i32) == 4, "i32 should be a 4 byte type");

#define KeyboardCodeLeftMouse         1  //  
#define KeyboardCodeRightMouse        2  //  
#define KeyboardCodeBackspace         3  //  Backspace
#define KeyboardCodeMiddleMouse       4  //  
#define KeyboardCodeReturn            5  //  Enter
#define KeyboardCodeShift             6  //  Shift 
#define KeyboardCodeControl           7  //  Control key
#define KeyboardCodeMenu              8  //  Alt key
#define KeyboardCodeCapslock          9  //  Capslock
#define KeyboardCodeEscape           10  //  Escape
#define KeyboardCodeSpace            11  //  Spacebar
#define KeyboardCodeLEft             12  //  Left arrow
#define KeyboardCodeUp               13  //  Up arrow
#define KeyboardCodeRight            14  //  Right arrow
#define KeyboardCodeDown             15  //  Down arrow
#define KeyboardCodeDelete           16  //  Delete key
#define KeyboardCode0                17  //  Key 0
#define KeyboardCode1                18  //  Key 1
#define KeyboardCode2                19  //  Key 2
#define KeyboardCode3                20  //  Key 3
#define KeyboardCode4                21  //  Key 4
#define KeyboardCode5                22  //  Key 5
#define KeyboardCode6                23  //  Key 6
#define KeyboardCode7                24  //  Key 7
#define KeyboardCode8                25  //  Key 8
#define KeyboardCode9                26  //  Key 9
#define KeyboardCodeA                27  //  Key A
#define KeyboardCodeB                28  //  Key B
#define KeyboardCodeC                29  //  Key C
#define KeyboardCodeD                30  //  Key D
#define KeyboardCodeE                31  //  Key E
#define KeyboardCodeF                32  //  Key F
#define KeyboardCodeG                33  //  Key G
#define KeyboardCodeH                34  //  Key H
#define KeyboardCodeI                35  //  Key I
#define KeyboardCodeJ                36  //  Key J
#define KeyboardCodeK                37  //  Key K
#define KeyboardCodeL                38  //  Key L
#define KeyboardCodeM                39  //  Key M
#define KeyboardCodeN                40  //  Key N
#define KeyboardCodeO                41  //  Key O
#define KeyboardCodeP                42  //  Key P
#define KeyboardCodeQ                43  //  Key Q
#define KeyboardCodeR                44  //  Key R
#define KeyboardCodeS                45  //  Key S
#define KeyboardCodeT                46  //  Key T
#define KeyboardCodeU                47  //  Key U
#define KeyboardCodeV                48  //  Key V
#define KeyboardCodeW                49  //  Key W
#define KeyboardCodeX                50  //  Key X
#define KeyboardCodeY                51  //  Key Y
#define KeyboardCodeZ                52  //  Key Z
#define KeyboardCodeSemicolon        53  //  ;:
#define KeyboardCodeColon            53  //  ;:
#define KeyboardCodePlus             54  //  +=
#define KeyboardCodeEquals           54  //  +=
#define KeyboardCodeComma            55  //  ,<
#define KeyboardCodeLess             55  //  ,<
#define KeyboardCodeMinus            56  //  -_
#define KeyboardCodeUnderscore       56  //  -_
#define KeyboardCodePeriod           57  //  .>
#define KeyboardCodeGreater          57  //  .>
#define KeyboardCodeSlash            58  //  /?
#define KeyboardCodeQuestionmark     58  //  /?
#define KeyboardCodeTilde            59  //  ~`
#define KeyboardCodeTick             59  //  ~`
#define KeyboardCodeLBracket         60  //  [{
#define KeyboardCodeLBrace           60  //  [{
#define KeyboardCodeBackslash        61  //  \|
#define KeyboardCodeCarray           61  //  \|
#define KeyboardCodeRbracket         62  //  ]}
#define KeyboardCodeRBrace           62  //  ]}
#define KeyboardCodeQoute            63  //  "'
#define KeyboardCodeTab              64  //  Tab

extern "C" u32 AsciiToScancode(char val);
extern "C" char ScanCodeToAscii(u32 scanCode);

extern "C" bool KeyboardDown(u32 scanCode);
extern "C" bool KeyboardPrevDown(u32 scanCode);

inline bool KeyboardUp(u32 scanCode) {
    return !KeyboardDown(scanCode);
}

inline bool KeyboardPrevUp(u32 scanCode) {
    return !KeyboardPrevDown(scanCode);
}

inline bool KeyboardPressed(u32 scanCode) {
    return KeyboardDown(scanCode) && !KeyboardPrevDown(scanCode);
}

inline bool KeyboardReleased(u32 scanCode) {
    return !KeyboardDown(scanCode) && KeyboardPrevDown(scanCode);
}

// Mouse API
#define MouseButtonLeft         KeyboardCodeLeftMouse
#define MouseButtonMiddle       KeyboardCodeRightMouse
#define MouseButtonRight        KeyboardCodeMiddleMouse

extern "C" u32 MouseGetX();
extern "C" u32 MouseGetY();
extern "C" i32 MouseGetScroll();
extern "C" bool MouseDown(u32 button);

extern "C" u32 MousePrevLastX();
extern "C" u32 MousePrevLastY();
extern "C" i32 MousePrevLastScroll();
extern "C" bool MousePrevDown(u32 button);

inline bool MouseUp(u32 button) {
    return !MouseDown(button);
}

inline bool MousePrevUp(u32 button) {
    return !MousePrevDown(button);
}

inline bool MousePressed(u32 button) {
    return MouseDown(button) && !MousePrevDown(button);
}

inline bool MouseReleased(u32 button) {
    return !MouseDown(button) && MousePrevDown(button);
}

// Touch API
extern "C" u32 TouchGetMaxContacts();

extern "C" u32 TouchGetX(u32 touchIndex);
extern "C" u32 TouchGetY(u32 touchIndex);
extern "C" bool TouchIsActive(u32 touchIndex);

extern "C" u32 TouchGetPrevX(u32 touchIndex);
extern "C" u32 TouchGetPrevY(u32 touchIndex);
extern "C" bool TouchWasActive(u32 touchIndex);

inline bool TouchPressed(u32 touchIndex) {
    return TouchIsActive(touchIndex) && !TouchWasActive(touchIndex);
}

inline bool TouchReleased(u32 touchIndex) {
    return !TouchIsActive(touchIndex) && TouchWasActive(touchIndex);
}

// Window API
// The following functions need to be declared. Initialize returns the userdata pointer that is passed to the other functions.
/*#define WasmExport __attribute__ (( visibility( "default" ) )) extern "C"
WasmExport void* Initialize();
WasmExport void Update(float dt, void* userData);
WasmExport void Render(unsigned int x, unsigned int y, unsigned int w, unsigned int h, void* userData);
WasmExport void Shutdown(void* userData);*/

#endif