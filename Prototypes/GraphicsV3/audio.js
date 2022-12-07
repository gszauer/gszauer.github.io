class AudioDevice {
    constructor(wasmImportObject, allocator, canvasName) {
        if (!wasmImportObject.hasOwnProperty("env")) {
            wasmImportObject.env = {};
        }
        
        this.mem = allocator;
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.wasmInstance = null;
        this.canvas = document.getElementById(canvasName);
        this.resources = [];
        this.resourceCounter = 1;
        this.u32_max = 4294967295;
        this.callbacksEnabled = false;

        let self = this;

        const ResumeAudioContext = function() {
            if (self.context.state === "suspended") {
                self.context.resume();
            }
        }

        this.canvas.addEventListener('touchstart', ResumeAudioContext, true);
        this.canvas.addEventListener('mousedown', ResumeAudioContext, true);

        const GetNextResourceId = function() {
            self.resourceCounter = self.resourceCounter % (self.u32_max - 1) + 1;
            let bufferId = self.resourceCounter;

            let startIndex = bufferId;
            while (self.resources.hasOwnProperty(bufferId)) {
                self.resourceCounter = (self.resourceCounter + 1) % (self.u32_max - 1) + 1;
                bufferId = self.resourceCounter;
                
                if (bufferId == startIndex) {
                    console.error("AudioDevice.GetNextResourceId: ran out of handles");
                    bufferId = 1; // Not 0
                    break;
                }
            }

            self.resources[bufferId] = {
                state: "unset",
                audioBuffer: null,
                source2D: null,
                panner: null,
                gain: null,
            }

            return bufferId;
        }

        const DestroyResource = function(u32_bufferId) {
            if (!self.resources.hasOwnProperty(u32_bufferId)) {
                console.error("AudioDevice.AudioDestroyBuffer: accessing invalid buffer id(" + u32_bufferId + ")");
            }
            let resource = self.resources[u32_bufferId];
            if (resource.state != "ready") {
                console.error("AudioDevice.AudioDestroyBuffer: destroying non-ready buffer id(" + u32_bufferId + ")");
            }

            if (resource.panner != null) {
                resource.panner.disconnect();
            }
            if (resource.gain != null) {
                resource.gain.disconnect();
            }
            if (resource.source2D != null) {
                resource.source2D.stop();
                resource.source2D.disconnect();
            }
            // TODO: stop 3d playback

            resource.state = "dead";

            delete self.resources[u32_bufferId];
        };

        wasmImportObject.env["AudioDestroyBuffer"] = DestroyResource;
        wasmImportObject.env["AudioDestroyBus"] = DestroyResource;
        wasmImportObject.env["AudioStop"] = DestroyResource;

        wasmImportObject.env["AudioCreateBufferFromOgg"] = function(ptr_data, u32_byteLen, ptr_optCallback, ptr_optuserdata) {
            let bufferId = GetNextResourceId();
            self.resources[bufferId].state = "loading";

            //let dataBuffer = new Uint8Array(self.mem.wasmMemory.buffer, ptr_data, u32_byteLen);
            
            let dataBuffer = new Uint8Array( u32_byteLen );
            let srcBuffer = new Uint8Array(self.mem.wasmMemory.buffer, ptr_data, u32_byteLen);
            dataBuffer.set( srcBuffer );
            
            self.context.decodeAudioData(dataBuffer.buffer, function (buffer) {
                self.resources[bufferId].audioBuffer = buffer;
                self.resources[bufferId].state = "ready";

                if (ptr_optCallback != 0) {
                    if (!self.callbacksEnabled) {
                        console.error("AudioDevice.AudioCreateBufferFromOgg: callbacks not enabled!");
                    }
                    if (self.wasmInstance == null) {
                        console.error("AudioDevice.AudioCreateBufferFromOgg: wasm instance is null!");
                    }

                    self.wasmInstance.exports.TriggerAudioDecodeCallback(ptr_optCallback, bufferId, ptr_data, u32_byteLen, ptr_optuserdata);
                }
            },
            (err) => console.error("AudioDevice.AudioCreateBufferFromOgg: Error with decoding audio data:" + err));;

            return bufferId;
        };

        wasmImportObject.env["AudioCreateBus"] = function() {
            let bufferId = GetNextResourceId();

            self.resources[bufferId].state = "ready";
            self.resources[bufferId].panner = self.context.createStereoPanner();
            self.resources[bufferId].gain = self.context.createGain();

            self.resources[bufferId].gain.connect(self.resources[bufferId].panner);
            self.resources[bufferId].panner.connect(self.context.destination);

            return bufferId;
        }

        wasmImportObject.env["AudioSetPan"] = function(u32_soundOrBus, float_pan) {
            if (float_pan < -1.0) {
                float_pan = -1.0;
            }
            if (float_pan > 1.0) {
                float_pan = 1.0;
            }

            if (!self.resources.hasOwnProperty(u32_soundOrBus)) {
                console.error("AudioDevice.AudioSetPan: accessing invalid buffer id(" + u32_soundOrBus + ")");
            }
            if (self.resources[u32_soundOrBus].state != "ready") {
                console.error("AudioDevice.AudioSetPan: accessing non-ready buffer id(" + u32_soundOrBus + ")");
            }

            if (self.resources[u32_soundOrBus].panner != null) {
                self.resources[u32_soundOrBus].panner.pan.value = float_pan;
            }
        };

        wasmImportObject.env["AudioSetVolume"] = function(u32_soundOrBus, float_volume) {
            if (float_volume < 0.0) {
                float_volume = 0.0;
            }
            if (float_volume > 1.0) {
                float_volume = 1.0;
            }

            if (!self.resources.hasOwnProperty(u32_soundOrBus)) {
                console.error("AudioDevice.AudioSetPan: accessing invalid buffer id(" + u32_soundOrBus + ")");
            }
            if (self.resources[u32_soundOrBus].state != "ready") {
                console.error("AudioDevice.AudioSetPan: accessing non-ready buffer id(" + u32_soundOrBus + ")");
            }

            if (self.resources[u32_soundOrBus].gain != null) {
                self.resources[u32_soundOrBus].gain.gain.value = float_volume;
            }
        }

        wasmImportObject.env["AudioPlay2D"] = function(u32_buffer, u32_bus, bool_looping, float_volume, float_pan) {
            if (float_volume < 0.0) {
                float_volume = 0.0;
            }
            if (float_volume > 1.0) {
                float_volume = 1.0;
            }
            if (float_pan < -1.0) {
                float_pan = -1.0;
            }
            if (float_pan > 1.0) {
                float_pan = 1.0;
            }

            if (!self.resources.hasOwnProperty(u32_bus)) {
                console.error("AudioDevice.AudioPlay2D: accessing invalid buffer id(" + u32_bus + ")");
            }
            let bus = self.resources[u32_bus];
            
            if (!self.resources.hasOwnProperty(u32_buffer)) {
                console.error("AudioDevice.AudioPlay2D: accessing invalid buffer id(" + u32_buffer + ")");
            }
            let buffer = self.resources[u32_buffer];

            if (buffer.state != "ready") {
                console.error("AudioDevice.AudioPlay2D: accessing non-ready buffer id(" + u32_buffer + ")");
            }
            if (buffer.audioBuffer == null) {
                console.error("AudioDevice.AudioPlay2D: null buffer source (" + u32_buffer + ")");
            }
            
            let resourceID = 0;

            if (bool_looping) {
                resourceID = GetNextResourceId();
                let resource = self.resources[resourceID];
                resource.state = "ready";

                resource.panner = self.context.createStereoPanner();
                resource.gain = self.context.createGain();

                resource.panner.pan.value = float_pan;
                resource.gain.gain.value = float_volume;

                resource.gain.connect(resource.panner);
                resource.panner.connect(bus.gain);

                resource.source2D = self.context.createBufferSource();
                resource.source2D.buffer = buffer.audioBuffer;
                resource.source2D.connect(resource.gain);
                resource.source2D.loop = true;
                resource.source2D.start(0);
            }
            else {
                let oneShot = {
                    source2D: self.context.createBufferSource(),
                    panner: self.context.createStereoPanner(),
                    gain: self.context.createGain()
                };
                oneShot.gain.connect(oneShot.panner);
                oneShot.panner.connect(bus.gain);
                oneShot.source2D.connect(oneShot.gain);
                oneShot.source2D.buffer = buffer.audioBuffer;
                oneShot.source2D.onended = function() {
                    oneShot.source2D.disconnect();
                    oneShot.gain.disconnect();
                    oneShot.panner.disconnect();
                };
                oneShot.source2D.start(0);
            }
            
            return resourceID;
        }
    }

    AttachToWasmInstance(wasmInstance) {
        this.wasmInstance = wasmInstance;
        this.callbacksEnabled = true;
    }
}