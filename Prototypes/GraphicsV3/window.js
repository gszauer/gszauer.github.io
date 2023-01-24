
class GameWindow {
    constructor(wasmImportObject, allocator, canvasName) {
        if (!wasmImportObject.hasOwnProperty("env")) {
            wasmImportObject.env = {};
        }
        
        this.dpi = window.devicePixelRatio || 1;
        this.mem = allocator;
        this.wasmInstance = null;
        this.userDataPtr = 0;
        this.canvas = document.getElementById(canvasName);
        this.gl = this.canvas.getContext('webgl2');
        this.running = false;

        let boundingRect = this.canvas.getBoundingClientRect();
        this.lastDisplayWidth = boundingRect.width;
        this.lastDisplayHeight = boundingRect.height;
        this.lastBufferWidth = this.canvas.width;
        this.lastBufferHeight = this.canvas.height;

        this.currentButtonState = new Uint32Array(2);
        this.previousButtonState = new Uint32Array(2);
        this.currentButtonState[0] = this.currentButtonState[1] = 0;
        this.previousButtonState[0] = this.previousButtonState[1] = 0;

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseScroll = 0;

        this.prevX = 0;
        this.prevY = 0;
        this.prevScroll = 0;

        this.maxNumTouches = 2;
        this.numTouches = 0;
        this.prevNumTouches = 0;
        this.touches = [ { x: 0, y: 0 }, { x: 0, y: 0 } ];
        this.prevTouches = [ { x: 0, y: 0 }, { x: 0, y: 0 } ];

        let self = this;

        const HandleTouchEvent = function(event) {
            let devicePixelRatio = window.devicePixelRatio || 1;
            if (event.defaultPrevented) {
                return false;
            }

            self.numTouches = event.touches.length;

            if (self.numTouches >= 1) {
                self.touches[0].x = (event.touches[0].clientX - self.canvas.offsetLeft) * devicePixelRatio;
                self.touches[0].y = (event.touches[0].clientY - self.canvas.offsetTop) * devicePixelRatio;
            }
            else {
                self.touches[0].x = 0;
                self.touches[0].y = 0;
            }
            if (self.numTouches >= 2) {
                self.touches[1].x = (event.touches[1].clientX - self.canvas.offsetLeft) * devicePixelRatio;
                self.touches[1].y = (event.touches[1].clientY - self.canvas.offsetTop) * devicePixelRatio;
            }
            else {
                self.touches[1].x = 0;
                self.touches[1].y = 0;
            }

            event.preventDefault();
            return false;
        }

        this.canvas.addEventListener('touchstart', HandleTouchEvent, false);
        this.canvas.addEventListener('touchmove', HandleTouchEvent, false);
        this.canvas.addEventListener('touchend', HandleTouchEvent, false);

          this.canvas.addEventListener('touchcancel', (e) => {
            self.numTouches = 0;
          }, true);


        const KeyMap = {
            'Backspace': 3, 'Enter': 5, 'Shift': 6, 'ShiftLeft': 6, 'ShiftRight': 6, 
            'Control': 7, 'ControlLeft': 7, 'ControlRight': 7, 'Alt': 8, 'AltRight': 8, 
            'AltLeft': 8, 'CapsLock': 9, 'Escape': 10, 'Space': 11, 'ArrowLeft': 12, 
            'ArrowUp': 13, 'ArrowRight': 14, 'ArrowDown': 15, 'Delete': 16, 'Digit0': 17, 
            'Digit1': 18, 'Digit2': 19, 'Digit3': 20, 'Digit4': 21, 'Digit5': 22, 
            'Digit6': 23, 'Digit7': 24, 'Digit8': 25, 'Digit9': 26, 'KeyA': 27, 
            'KeyB': 28, 'KeyC': 29, 'KeyD': 30, 'KeyE': 31, 'KeyF': 32, 'KeyG': 33, 
            'KeyH': 34, 'KeyI': 35, 'KeyJ': 36, 'KeyK': 37, 'KeyL': 38, 'KeyM': 39, 
            'KeyN': 40, 'KeyO': 41, 'KeyP': 42, 'KeyQ': 43, 'KeyR': 44, 'KeyS': 45, 
            'KeyT': 46, 'KeyU': 47, 'KeyV': 48, 'KeyW': 49, 'KeyX': 50, 'KeyY': 51, 
            'KeyZ': 52, 'Semicolon': 53, 'Equal': 54, 'Comma': 55, 'Minus': 56, 
            'Period': 57, 'Slash': 58, 'Backquote': 59, 'BracketLeft': 60, 
            'Backslash': 61, 'BracketRight': 62, 'Quote': 63, 'Tab': 64
        };

        const MouseMotionHandler = (event) => {
            let devicePixelRatio = window.devicePixelRatio || 1;
            self.mouseX = (event.pageX - self.canvas.offsetLeft) * devicePixelRatio;
            self.mouseY = (event.pageY - self.canvas.offsetTop) * devicePixelRatio;
        };

        this.canvas.addEventListener("mousemove",  MouseMotionHandler, true);
        this.canvas.addEventListener("mouseenter", MouseMotionHandler, true);
        this.canvas.addEventListener("mouseleave", MouseMotionHandler, true);
        this.canvas.addEventListener('wheel', (event) => {
            if (event.defaultPrevented) {
                return false;
            }

            if (event.deltaY < 0.0) {
                this.mouseScroll = -1;
            }
            else if (event.deltaY > 0.0) {
                this.mouseScroll = 1;
            }
            else {
                this.mouseScroll = 0;
            }

            event.preventDefault();
            return false;
        }, false);

        this.canvas.addEventListener('mousedown', (event) => {
            if (event.defaultPrevented) {
                return false;
            }

            if (event.button == 0) { // main / left
                self.currentButtonState[0] |= (1 << 1); // KeyboardCodeLeftMouse: 1
            }
            else if (event.button == 1) { // aux / middle
                self.currentButtonState[0] |= (1 << 4); // KeyboardCodeMiddleMouse: 4
            }
            else if (event.button == 2) { // secondary / right
                self.currentButtonState[0] |= (1 << 2); // KeyboardCodeRightMouse: 2
            }

            event.preventDefault();
            return false;
        }, false);

        this.canvas.addEventListener('mouseup', (event) => {
            if (event.defaultPrevented) {
                return false;
            }

            if (event.button == 0) { // main / left
                self.currentButtonState[0] &= ~(1 << 1); // KeyboardCodeLeftMouse: 1
            }
            else if (event.button == 1) { // aux / middle
                self.currentButtonState[0] &= ~(1 << 4); // KeyboardCodeMiddleMouse: 4
            }
            else if (event.button == 2) { // secondary / right
                self.currentButtonState[0] &= ~(1 << 2); // KeyboardCodeRightMouse: 2
            }

            event.preventDefault();
            return false;
        }, false);

        // Do we want window wide key focus? or just canvas wide?
        window.addEventListener("keydown", (event) => {
            if (event.defaultPrevented) {
                return false; // Do nothing if the event was already processed
            }

            if (KeyMap.hasOwnProperty(event.code)) {
                const code = KeyMap[event.code];
                const index = ~~(code / 32);
                const bit = ~~(code % 32);

                self.currentButtonState[index] |= (1 << bit);
            }

            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
            return false;
        }, false);

        window.addEventListener("keyup", (event) => {
            if (event.defaultPrevented) {
                return false; // Do nothing if the event was already processed
            }

            if (KeyMap.hasOwnProperty(event.code)) {
                const code = KeyMap[event.code];
                const index = ~~(code / 32);
                const bit = ~~(code % 32);

                self.currentButtonState[index] &= ~(1 << bit);
            }

            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
            return false;
        }, false);

        wasmImportObject.env["AsciiToScancode"] = function(char_code) { 
            const lowercase_a = 'a'.charCodeAt(0);
            if (char_code >= lowercase_a && char_code <= 'z'.charCodeAt(0)) {
                return char_code - lowercase_a + 27;
            }
            const capital_a = 'A'.charCodeAt(0);
            if (char_code >= capital_a && char_code <= 'Z'.charCodeAt(0)) {
                return char_code - capital_a + 27;
            }
                const zero = '0'.charCodeAt(0);
                if (char_code >= zero && char_code <= '9'.charCodeAt(0)) {
                return char_code - zero + 17;
            }

            const charMap = { '\t': 64, '\\': 61, '\'': 63,
                '`': 59, '~': 59, '!': 18, '@': 19, '#': 20, 
                '$': 21, '%': 22, '^': 23, '&': 24, '*': 25, 
                '(': 26, ')': 17, '_': 56, '+': 54, '-': 56, 
                '=': 54, '[': 60, '{': 60, ']': 62, '}': 62, 
                '|': 61, ';': 53, ':': 53, '"': 63, ',': 55, 
                '<': 55, '.': 57, '>': 57, '/': 58, '?': 58
            };
            
            const charVal = String.fromCharCode(char_code);
            if (charMap.hasOwnProperty(charVal)) {
                return charMap[charVal];
            }

            return 0; // error
        }

        wasmImportObject.env["WindowUpdateTitle"] = function(titlePtr) {
            window.document.title = self.mem.PointerToString(titlePtr);
        }

        wasmImportObject.env["ScanCodeToAscii"] = function(u32_scanCode) {
            if (u32_scanCode == 3) {
                return '\b';
            }
            if (u32_scanCode == 11) {
                return ' ';
            }

            if (u32_scanCode >= 27 && u32_scanCode <= 52) {
                return 'abcdefghijklmnopqrstuvwxyz'.charAt(u32_scanCode - 27);
            }
            if (u32_scanCode >= 17 && u32_scanCode <= 26) {
                return '0123456789'.charAt(u32_scanCode - 17);
            }
            if (u32_scanCode >= 53 && u32_scanCode <= 64) {
                ';=,-./~[|]\t'.charAt(u32_scanCode - 53);
            }

            return '\0';
        }

        wasmImportObject.env["KeyboardDown"] = function(u32_scanCode) {
            const index = ~~(u32_scanCode / 32);
            const bit = ~~(u32_scanCode % 32);

            const result = self.currentButtonState[index] & (1 << bit)
            return result != 0;
        }

        wasmImportObject.env["KeyboardPrevDown"] = function(u32_scanCode) {
            const index = ~~(u32_scanCode / 32);
            const bit = ~~(u32_scanCode % 32);

            const result = self.previousButtonState[index] & (1 << bit)
            return result != 0;
        }
        
        wasmImportObject.env["MouseDown"] = function(u32_scanCode) {
            const index = ~~(u32_scanCode / 32);
            const bit = ~~(u32_scanCode % 32);

            const result = self.currentButtonState[index] & (1 << bit)
            return result != 0;
        }

        wasmImportObject.env["MousePrevDown"] = function(u32_scanCode) {
            const index = ~~(u32_scanCode / 32);
            const bit = ~~(u32_scanCode % 32);

            const result = self.previousButtonState[index] & (1 << bit)
            return result != 0;
        }

        wasmImportObject.env["MouseGetX"] = function() {
            return self.mouseX;
        };

        wasmImportObject.env["MouseGetY"] = function() {
            return self.mouseY;
        };

        wasmImportObject.env["MouseGetScroll"] = function() {
            return self.mouseScroll;
        };

        wasmImportObject.env["MousePrevLastX"] = function() {
            return self.prevX;
        };

        wasmImportObject.env["MousePrevLastY"] = function() {
            return self.prevY;
        };

        wasmImportObject.env["MousePrevLastScroll"] = function() {
            return self.prevScroll;
        };

        wasmImportObject.env["TouchGetMaxContacts"] = function() {
            return self.maxNumTouches;
        };

        wasmImportObject.env["TouchGetX"] = function(u32_touchIndex) {
            if (u32_touchIndex == 0) {
                return self.touches[0].x;
            }
            else if (u32_touchIndex == 1) {
                return self.touches[1].x;
            }
            return 0;
        }
        wasmImportObject.env["TouchGetY"] = function(u32_touchIndex) {
            if (u32_touchIndex == 0) {
                return self.touches[0].y;
            }
            else if (u32_touchIndex == 1) {
                return self.touches[1].y;
            }
            return 0;
        }

        wasmImportObject.env["TouchIsActive"] = function(u32_touchIndex) {
            return u32_touchIndex < self.numTouches;
        }

        wasmImportObject.env["TouchGetPrevX"] = function(u32_touchIndex) {
            if (u32_touchIndex == 0) {
                return self.prevTouches[0].x;
            }
            else if (u32_touchIndex == 1) {
                return self.prevTouches[1].x;
            }
            return 0;
        }
        wasmImportObject.env["TouchGetPrevY"] = function(u32_touchIndex) {
            if (u32_touchIndex == 0) {
                return self.prevTouches[0].x;
            }
            else if (u32_touchIndex == 1) {
                return self.prevTouches[1].x;
            }
            return 0;
        }

        wasmImportObject.env["TouchWasActive"] = function(u32_touchIndex) {
            return u32_touchIndex < self.prevNumTouches;
        }
    }

    AttachToWasmInstance(wasmInstance) {
        const useRequestAnimFrames = false;

        this.wasmInstance = wasmInstance;
        const exports = wasmInstance.exports;
        this.userDataPtr = null;
        this.running = true;

        let lastTime = 0;
        let deltaTime = 0.0;
        let self = this;
       
        const GameWindowUpdate = function(timestamp) {
            if (!useRequestAnimFrames) {
                timestamp = performance.now();
            }
            deltaTime = (timestamp - lastTime) / 1000.0;
            lastTime = timestamp;
            //console.log("delta time: " + deltaTime);

            let boundingRect = self.canvas.getBoundingClientRect();
            const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
            const windowWidth = (window.innerWidth || document.documentElement.clientWidth)

            let vVis = boundingRect.bottom >= 0  && boundingRect.top <= windowHeight;
            let hVis = boundingRect.right >= 0 && boundingRect.left <= windowWidth;
            let visible = hVis && vVis;

            let expectedDisplayWidth = windowWidth;//boundingRect.width;
            let expectedDisplayHeight = windowHeight;//boundingRect.height;
            let expectedBufferWidth = Math.floor(expectedDisplayWidth * self.dpi);
            let expectedBufferHeight = Math.floor(expectedDisplayHeight * self.dpi);

            if (expectedDisplayWidth != self.lastDisplayWidth || expectedDisplayHeight != self.lastDisplayHeight || 
            expectedBufferWidth != self.lastBufferWidth || expectedBufferHeight != self.lastBufferHeight) {
                //console.log("Resizing canvas, Display(" + expectedDisplayWidth + ", " + expectedDisplayHeight + "), Buffer(" + expectedBufferWidth + ", " + expectedBufferHeight + ")");

                self.canvas.style.width = expectedDisplayWidth + "px";
                self.canvas.style.height = expectedDisplayHeight + "px";
                self.canvas.width = expectedBufferWidth;
                self.canvas.height = expectedBufferHeight;

                self.lastDisplayWidth = expectedDisplayWidth;
                self.lastDisplayHeight = expectedDisplayHeight;
                self.lastBufferWidth = expectedBufferWidth;
                self.lastBufferHeight = expectedBufferHeight;
            }

            if (self.running) {
                exports.Update(deltaTime, self.userDataPtr);
                if (visible) {
                    exports.Render(0, 0, expectedBufferWidth, expectedBufferHeight, self.dpi, self.userDataPtr);
                }

                self.previousButtonState[0] = self.currentButtonState[0];
                self.previousButtonState[1] = self.currentButtonState[1];
                self.prevX = self.mouseX;
                self.prevY = self.mouseY;
                self.prevScroll = self.mouseScroll;
                self.mouseScroll = 0;
                self.prevNumTouches = self.numTouches;
                self.prevTouches[0].x = self.touches[0].x;
                self.prevTouches[0].y = self.touches[0].y;
                self.prevTouches[1].x = self.touches[1].x;
                self.prevTouches[1].y = self.touches[1].y;
            }

            if (self.running) {
                if (useRequestAnimFrames) {
                    window.requestAnimationFrame(GameWindowUpdate);
                }
            }
        }

        if (useRequestAnimFrames) {
            console.log("Update driven by request animation farme");
            this.userDataPtr = exports.Initialize();

            lastTime = performance.now();
            window.requestAnimationFrame(GameWindowUpdate);
        }
        else {
            console.log("Update driven by set interval");
            this.userDataPtr = exports.Initialize();

            lastTime = performance.now();
            window.setInterval(GameWindowUpdate, 14, 0);
        }
    }

    DestroyWindow() {
        this.running = false;
        this.wasmInstance.exports.Shutdown(userPtr);
    }
}