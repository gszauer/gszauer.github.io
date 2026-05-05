var Module = Module || {};

(function() {
    let runtimeReady = false;
    const runtimeQueue = [];

    function runWhenRuntimeReady(callback) {
        // Check if runtime is actually ready - need _malloc to be available
        if (!runtimeReady && (Module.calledRun || (typeof Module._malloc === 'function' && typeof Module._free === 'function'))) {
            runtimeReady = true;
            // Also drain any queued items
            drainRuntimeQueue();
        }

        if (runtimeReady) {
            callback();
        } else {
            runtimeQueue.push(callback);
        }
    }

    function drainRuntimeQueue() {
        if (!runtimeReady) return;
        while (runtimeQueue.length) {
            const fn = runtimeQueue.shift();
            try {
                fn();
            } catch (err) {
                console.error('Runtime callback error:', err);
            }
        }
    }

    const previousOnRuntimeInitialized = Module.onRuntimeInitialized;
    Module.runWhenRuntimeReady = runWhenRuntimeReady;

    Module.onRuntimeInitialized = function() {
        runtimeReady = true;
        drainRuntimeQueue();
        if (typeof previousOnRuntimeInitialized === 'function') {
            previousOnRuntimeInitialized();
        }
        if (typeof Module._carrotMain === 'function') {
            Module._carrotMain();
            Module._carrotMain = undefined;
        }
    };

    if (Module.calledRun) {
        runtimeReady = true;
        drainRuntimeQueue();
        if (typeof Module._carrotMain === 'function') {
            Module._carrotMain();
            Module._carrotMain = undefined;
        }
    }

    function waitForHeapReady(resolve) {
        if (Module.HEAPU32 && Module.HEAPU32.byteLength) {
            resolve(true);
            return;
        }
        Module.runWhenRuntimeReady(() => {
            const check = () => {
                if (Module.HEAPU32 && Module.HEAPU32.byteLength) {
                    resolve(true);
                } else {
                    requestAnimationFrame(check);
                }
            };
            check();
        });
    }

    function notifyDevicePixelRatio() {
        const dpr = window.devicePixelRatio || 1;
        runWhenRuntimeReady(() => callExport('_CarrotPlatformSetDevicePixelRatio', [dpr]));
        return dpr;
    }

    const canvas = document.getElementById('carrot-canvas');
    const copyModal = document.getElementById('copy-modal');
    const copyText = document.getElementById('copy-modal-text');
    const copyButton = document.getElementById('copy-modal-copy');
    const copyClose = document.getElementById('copy-modal-close');

    const pasteModal = document.getElementById('paste-modal');
    const pasteText = document.getElementById('paste-modal-text');
    const pasteSubmit = document.getElementById('paste-modal-submit');
    const pasteCancel = document.getElementById('paste-modal-cancel');

    const yesNoModal = document.getElementById('yesno-modal');
    const yesNoMessage = document.getElementById('yesno-modal-message');
    const yesButton = document.getElementById('yesno-modal-yes');
    const noButton = document.getElementById('yesno-modal-no');

    const saveModal = document.getElementById('save-modal');
    const saveNameInput = document.getElementById('save-modal-name');
    const saveConfirm = document.getElementById('save-modal-save');
    const saveCancel = document.getElementById('save-modal-cancel');

    const fileInput = document.getElementById('file-input');

    const textDecoder = new TextDecoder('utf-8');
    const textEncoder = new TextEncoder();

    let imageData = null;
    let imageData32 = null;
    let lastBlitWidth = 0;
    let lastBlitHeight = 0;
    let currentScale = 1.0;
    let pendingSaveBytes = null;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

    function hideModal(element) {
        element.classList.add('hidden');
        // Return focus to canvas so keyboard shortcuts continue working
        queueMicrotask(() => canvas.focus());
    }

    function showModal(element) {
        element.classList.remove('hidden');
    }

    function ensureImageData(width, height) {
        if (!imageData || width !== lastBlitWidth || height !== lastBlitHeight) {
            imageData = ctx.createImageData(width, height);
            imageData32 = new Uint32Array(imageData.data.buffer);
            lastBlitWidth = width;
            lastBlitHeight = height;
        }
        return imageData;
    }

    function toJsString(ptr, len) {
        if (!ptr || !len) return '';
        const heapU8 = Module.HEAPU8 || (typeof HEAPU8 !== 'undefined' ? HEAPU8 : null);
        if (!heapU8) return '';
        const bytes = heapU8.subarray(ptr, ptr + len);
        return textDecoder.decode(bytes);
    }

    function fromJsString(str) {
        if (!str || str.length === 0) {
            return { ptr: 0, len: 0 };
        }
        const bytes = textEncoder.encode(str);
        const buffer = Module._malloc(bytes.length);
        const heapU8 = Module.HEAPU8 || (typeof HEAPU8 !== 'undefined' ? HEAPU8 : null);
        if (heapU8) {
            heapU8.set(bytes, buffer);
        } else {
            console.warn('HEAPU8 unavailable while copying string payload.');
        }
        return { ptr: buffer, len: bytes.length };
    }

    function applyCanvasSizing(width, height, scale) {
        currentScale = scale || 1.0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            imageData = null;
            imageData32 = null;
        }
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = (width * currentScale / dpr) + 'px';
        canvas.style.height = (height * currentScale / dpr) + 'px';
    }

    function triggerDownload(bytes, suggestedName) {
        if (!bytes) return;
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = suggestedName || 'carrotcode.txt';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    Module.preRun = Module.preRun || [];
    Module.postRun = Module.postRun || [];
    Module.print = Module.print || function() {
        console.log.apply(console, arguments);
    };
    Module.printErr = Module.printErr || function() {
        console.error.apply(console, arguments);
    };
    Module.canvas = canvas;

    function callExport(name, args) {
        const fn = Module[name];
        if (typeof fn === 'function') {
            return fn.apply(Module, args || []);
        }
        console.warn('Tried to invoke missing export', name);
        return undefined;
    }

    Module.platform = {
        applyCanvasSizing,
        showShutdownMessage: function() {
            // Hide canvas
            canvas.style.display = 'none';

            // Show shutdown message
            const shutdownDiv = document.getElementById('shutdown-message');
            if (shutdownDiv) {
                shutdownDiv.classList.remove('hidden');
            }
        },
        blitCanvas: function(ptr, width, height, scale, regionsPtr, regionCount) {
            applyCanvasSizing(width, height, scale);

            const pixelHeap = (Module.HEAPU32 && Module.HEAPU32.byteLength)
                ? Module.HEAPU32
                : (typeof HEAPU32 !== 'undefined' && HEAPU32 && HEAPU32.byteLength)
                    ? HEAPU32
                    : null;
            const regionHeap = (Module.HEAP32 && Module.HEAP32.byteLength)
                ? Module.HEAP32
                : (typeof HEAP32 !== 'undefined' && HEAP32 && HEAP32.byteLength)
                    ? HEAP32
                    : null;

            if (!ptr || !width || !height || !pixelHeap) {
                return;
            }

            const pixelCount = width * height;
            const start = ptr >>> 2;
            const src = pixelHeap.subarray(start, start + pixelCount);
            const image = ensureImageData(width, height);
            if (!image || src.length !== pixelCount) {
                return;
            }

            if (!imageData32 || imageData32.length !== pixelCount) {
                imageData32 = new Uint32Array(image.data.buffer);
            }
            const dst32 = imageData32;

            const shouldCopyAll = !regionsPtr || regionCount <= 0 || !regionHeap;

            if (shouldCopyAll) {
                dst32.set(src);
            } else {
                const base = regionsPtr >>> 2;
                for (let i = 0; i < regionCount; i++) {
                    const offset = base + (i * 4);
                    let x = regionHeap[offset];
                    let y = regionHeap[offset + 1];
                    let w = regionHeap[offset + 2];
                    let h = regionHeap[offset + 3];

                    if (w <= 0 || h <= 0) {
                        continue;
                    }

                    if (x < 0) {
                        w += x;
                        x = 0;
                    }
                    if (y < 0) {
                        h += y;
                        y = 0;
                    }
                    if (x >= width || y >= height) {
                        continue;
                    }
                    if (x + w > width) {
                        w = width - x;
                    }
                    if (y + h > height) {
                        h = height - y;
                    }
                    if (w <= 0 || h <= 0) {
                        continue;
                    }

                    let srcRow = (y * width) + x;
                    let dstRow = srcRow;
                    for (let row = 0; row < h; row++) {
                        const srcStart = srcRow;
                        const srcEnd = srcStart + w;
                        dst32.set(src.subarray(srcStart, srcEnd), dstRow);
                        srcRow += width;
                        dstRow += width;
                    }
                }
            }

            ctx.putImageData(image, 0, 0);
        },
        showCopyModal: function(textPtr, textLen) {
            const text = toJsString(textPtr, textLen);
            copyText.value = text;
            showModal(copyModal);
            copyText.focus();
            copyText.select();
        },
        showPasteModal: function() {
            pasteText.value = '';
            showModal(pasteModal);
            pasteText.focus();
            pasteText.select();
        },
        showYesNoModal: function(messagePtr, messageLen) {
            yesNoMessage.textContent = toJsString(messagePtr, messageLen);
            showModal(yesNoModal);
            yesButton.focus();
        },
        showSaveModal: function(defaultNamePtr, defaultNameLen, dataPtr, dataLen) {
            const defaultName = toJsString(defaultNamePtr, defaultNameLen) || 'document.txt';
            saveNameInput.value = defaultName;
            const heapU8Save = Module.HEAPU8 || (typeof HEAPU8 !== 'undefined' ? HEAPU8 : null);
            pendingSaveBytes = (dataLen && heapU8Save) ? heapU8Save.slice(dataPtr, dataPtr + dataLen) : new Uint8Array();
            showModal(saveModal);
            saveNameInput.focus();
            saveNameInput.select();
        },
        beginOpenFile: function() {
            fileInput.value = '';
            fileInput.click();
        },
        downloadFile: function(namePtr, nameLen, dataPtr, dataLen) {
            const name = toJsString(namePtr, nameLen) || 'document.txt';
            const heapU8 = Module.HEAPU8 || (typeof HEAPU8 !== 'undefined' ? HEAPU8 : null);
            const bytes = (dataLen && heapU8) ? heapU8.slice(dataPtr, dataPtr + dataLen) : new Uint8Array();
            triggerDownload(bytes, name);
        },
        launchUrl: function(urlPtr, urlLen) {
            const url = toJsString(urlPtr, urlLen);
            if (url) {
                window.open(url, '_blank', 'noopener');
            }
        },
        getWindowSize: function() {
            return [window.innerWidth || canvas.clientWidth || 1600,
                    window.innerHeight || canvas.clientHeight || 1200];
        }
    };

    notifyDevicePixelRatio();

    copyButton.addEventListener('click', function() {
        const text = copyText.value;
        navigator.clipboard.writeText(text).catch(function() {
            // Fallback: do nothing, user can still copy manually
        });
        hideModal(copyModal);
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnCopyFinished'));
    });

    copyClose.addEventListener('click', function() {
        hideModal(copyModal);
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnCopyFinished'));
    });

    pasteSubmit.addEventListener('click', function() {
        const text = pasteText.value || '';
        runWhenRuntimeReady(() => {
            const payload = fromJsString(text);
            callExport('_CarrotPlatformOnPasteResult', [payload.ptr, payload.len]);
            if (payload.ptr) {
                Module._free(payload.ptr);
            }
        });
        hideModal(pasteModal);
    });

    pasteCancel.addEventListener('click', function() {
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnPasteCanceled'));
        hideModal(pasteModal);
    });

    yesButton.addEventListener('click', function() {
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnYesNoResult', [1]));
        hideModal(yesNoModal);
    });

    noButton.addEventListener('click', function() {
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnYesNoResult', [0]));
        hideModal(yesNoModal);
    });

    saveConfirm.addEventListener('click', function() {
        const name = saveNameInput.value.trim() || 'document.txt';
        triggerDownload(pendingSaveBytes, name);
        runWhenRuntimeReady(() => {
            const payload = fromJsString(name);
            callExport('_CarrotPlatformOnSaveResult', [payload.ptr, payload.len]);
            if (payload.ptr) {
                Module._free(payload.ptr);
            }
        });
        pendingSaveBytes = null;
        hideModal(saveModal);
    });

    saveCancel.addEventListener('click', function() {
        pendingSaveBytes = null;
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnSaveCanceled'));
        hideModal(saveModal);
    });

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            runWhenRuntimeReady(() => callExport('_CarrotPlatformOnOpenFileCanceled'));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(loadEvent) {
            const arrayBuffer = loadEvent.target.result;
            const dataBytes = new Uint8Array(arrayBuffer);
            runWhenRuntimeReady(() => {
                const dataPtr = Module._malloc(dataBytes.length || 1);
                if (dataBytes.length > 0) {
                    const heapU8 = Module.HEAPU8 || (typeof HEAPU8 !== 'undefined' ? HEAPU8 : null);
                    if (heapU8) {
                        heapU8.set(dataBytes, dataPtr);
                    }
                }
                const namePayload = fromJsString(file.name || '');
                callExport('_CarrotPlatformOnOpenFileResult', [namePayload.ptr, namePayload.len, dataPtr, dataBytes.length]);
                if (namePayload.ptr) {
                    Module._free(namePayload.ptr);
                }
                if (dataPtr) {
                    Module._free(dataPtr);
                }
            });
        };
        reader.onerror = function() {
            runWhenRuntimeReady(() => callExport('_CarrotPlatformOnOpenFileCanceled'));
        };
        reader.readAsArrayBuffer(file);
    });

    if (fileInput) {
        fileInput.addEventListener('cancel', function() {
            runWhenRuntimeReady(() => callExport('_CarrotPlatformOnOpenFileCanceled'));
        });
    }

    window.addEventListener('resize', function() {
        notifyDevicePixelRatio();
        const [width, height] = Module.platform.getWindowSize();
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnWindowResized', [width, height]));
    });

    canvas.addEventListener('click', function() {
        canvas.focus();
    });

    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

    if (window.matchMedia) {
        const ratios = [0.75, 1, 1.25, 1.5, 2, 3, 4];
        ratios.forEach((ratio) => {
            const query = window.matchMedia(`(resolution: ${ratio}dppx)`);
            const handler = () => notifyDevicePixelRatio();
            if (query) {
                if (typeof query.addEventListener === 'function') {
                    query.addEventListener('change', handler);
                } else if (typeof query.addListener === 'function') {
                    query.addListener(handler);
                }
            }
        });
    }

    // Ensure initial focus so keyboard works out of the gate
    window.addEventListener('load', function() {
        canvas.focus();
        notifyDevicePixelRatio();
        const [width, height] = Module.platform.getWindowSize();
        runWhenRuntimeReady(() => callExport('_CarrotPlatformOnWindowResized', [width, height]));
    });

    // Drag and drop support
    let dragCounter = 0;

    function handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;
        if (dragCounter === 1) {
            document.body.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter--;
        if (dragCounter === 0) {
            document.body.classList.remove('drag-over');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        document.body.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0]; // Only handle first file

            const reader = new FileReader();
            reader.onload = function(loadEvent) {
                const arrayBuffer = loadEvent.target.result;
                const dataBytes = new Uint8Array(arrayBuffer);
                runWhenRuntimeReady(() => {
                    // Trigger file open through keyboard shortcut (Ctrl+O)
                    const keyEvent = {
                        key: 'o',
                        code: 'KeyO',
                        keyCode: 79,
                        ctrlKey: true,
                        altKey: false,
                        shiftKey: false,
                        metaKey: false
                    };
                    callExport('_CarrotPlatformTriggerFileOpen');

                    // Then deliver the file data
                    setTimeout(() => {
                        const dataPtr = Module._malloc(dataBytes.length || 1);
                        if (dataBytes.length > 0) {
                            const heapU8 = Module.HEAPU8 || (typeof HEAPU8 !== 'undefined' ? HEAPU8 : null);
                            if (heapU8) {
                                heapU8.set(dataBytes, dataPtr);
                            }
                        }
                        const namePayload = fromJsString(file.name || '');
                        callExport('_CarrotPlatformOnOpenFileResult', [namePayload.ptr, namePayload.len, dataPtr, dataBytes.length]);
                        if (namePayload.ptr) {
                            Module._free(namePayload.ptr);
                        }
                        if (dataPtr) {
                            Module._free(dataPtr);
                        }
                    }, 10);
                });
            };
            reader.onerror = function() {
                console.error('Failed to read dropped file');
            };
            reader.readAsArrayBuffer(file);
        }
    }

    // Add drag and drop event listeners
    document.addEventListener('dragenter', handleDragEnter, false);
    document.addEventListener('dragleave', handleDragLeave, false);
    document.addEventListener('dragover', handleDragOver, false);
    document.addEventListener('drop', handleDrop, false);
})();
