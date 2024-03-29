class FileLoader {
    constructor(packageName, wasmImportObject, memoryAllocator) {
        if (!wasmImportObject.hasOwnProperty("env")) {
            wasmImportObject.env = {};
        }
        let self = this;

        this.callbacksEnabled = false;
        this.queuedCallbacks = null;
        this.wasmInstance = null;
        this.mem_u8 = memoryAllocator.mem_u8;
        this.mem_buffer = memoryAllocator.wasmMemory.buffer;
        this.decoder = new TextDecoder();

        wasmImportObject.env["LoadFileAsynch"] = function(_path, target, bytes, callback, userData) {
            let iter = _path;
            while(self.mem_u8[iter] != 0) {
                iter += 1;
                if (iter - _path > 5000) {
                    console.error("FileLoader.FileLoad string decode loop took too long");
                    break;
                }
            }
            let stringPath = self.decoder.decode(new Uint8Array(self.mem_buffer, _path, iter - _path));
            if (stringPath == null || stringPath.length == 0) {
                console.error("FileLoader.FileLoad file path was empty, pointer:" + _path);
            }

            self.LoadFile(_path, stringPath, target, bytes, callback, userData);
        }
    }

    AttachToWasmInstance(wasmInstance) {
        this.wasmInstance = wasmInstance;

        this.callbacksEnabled = true;
        if (this.queuedCallbacks != null) {
            while (this.queuedCallbacks.length != 0) {
                let callback = this.queuedCallbacks.pop();
                this.LoadFile(callback.path, callback.stringPath, callback.target, callback.bytes, callback.callback, callback.userData);
            }
            this.queuedCallbacks = null;
        }
    }

    LoadFile(_path, _stringPath, _target, _bytes, _callback, _userData) {
        console.log("Loading: " + _stringPath);

        let self = this;
        if (!this.callbacksEnabled) {
            if (this.queuedCallbacks == null) {
                this.queuedCallbacks = [];
            }
            let calback = {
                path: _path,
                stringPath: _stringPath,
                target: _target,
                bytes: _bytes,
                callback: _callback,
                userData: _userData
            };
            this.queuedCallbacks.push(_callback);
            console.error("file queued");
        }
        else {
            this.LoadFileAsArrayBuffer(_stringPath, function(path, arrayBuffer) {
                let writtenBytes = 0;
                if (arrayBuffer == null) {
                    _target = 0; // Set data to null
                }
                else {
                    let dst_array = new Uint8Array(self.mem_buffer, _target, _bytes);
                    let src_array = new Uint8Array(arrayBuffer);
                    
                    writtenBytes = _bytes < arrayBuffer.byteLength? _bytes : arrayBuffer.byteLength;
                    for (let i = 0; i < writtenBytes; dst_array[i] = src_array[i++]);
                }
                self.wasmInstance.exports.TriggerFileLoaderCallback(_callback, _path, _target, writtenBytes, _userData);
            });
        }
    }

    LoadFileAsArrayBuffer(path, onFileLoaded) { 
        const req = new XMLHttpRequest();
        req.customCallbackTriggered = false;
        req.open('GET', path, true);
        req.responseType = "arraybuffer";
        let self = this;

        req.onload = (event) => {
            const arrayBuffer = req.response; // Note: not req.responseText
            if (arrayBuffer) {
                if (!req.customCallbackTriggered ) {
                    req.customCallbackTriggered  = true;
                    onFileLoaded(path, arrayBuffer);
                }
            }
            else {
                if (!req.customCallbackTriggered ) {
                    console.error("FileLoader.LoadFileAsArrayBuffer Could not load: " + path);
                    req.customCallbackTriggered  = true;
                    onFileLoaded(path, null);
                }
            }
        };

        req.send(null);
    }
}