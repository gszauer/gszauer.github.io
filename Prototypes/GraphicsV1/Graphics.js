'use strict';
/*jshint esversion: 6 */
/*jshint bitwise: false*/

var /* namespace */ Graphics = {
    /* enum */ Filter: {
		Nearest : 0,
		Linear : 1
	},

	/* enum */ WrapMode: {
		Repeat : 0,
		Clamp : 1
	},

	/* enum */ DepthTestState: {
		Off : 0,
		Always : 1,
		Never : 2,
		Less : 3,
		Equal : 4,
		LEqual : 5,
		Greater : 6,
		GEqual : 7,
		NotEqual : 8
	},

	/* enum */ DrawMode: {
		Points : 0,
		Lines : 1,
		LineStrip : 2,
		Triangles : 3,
		TriangleStrip : 4,
		TriangleFan : 5
	},

	/* enum */ BufferType: {
		Float32 : 0,
		Int8 : 1,
		UInt8 : 2,
		Int16 : 3,
		UInt16 : 4,
		Int32 : 5,
		UInt32 : 6
	},

	/* enum */ UniformType: {
		Int1 : 0,
		Int2 : 1,
		Int3 : 2,
		Int4 : 3,
		Float1 : 4,
		Float2 : 5,
		Float3 : 6,
		Float4 : 7,
		Float9 : 8,
		Float16 : 9
	},

	/* enum */ BlendFunction: {
		Off : 0,
		Zero : 1, 
		One : 2, 
		SrcColor : 3, 
		OneMinusSrcColor : 4, 
		DstColor : 5, 
		OneMinusDstColor : 6, 
		SrcAlpha : 7, 
		OneMinusSrcAlpha : 8, 
		DstAlpha : 9, 
		OneMinusDstAlpha : 10, 
		ConstColor : 11, 
		OneMinusConstColor : 12, 
		ConstAlpha : 13, 
		OneMinusconstAlpha : 14, 
		SrcAlphaSaturate : 15, 
	},

	/* enum */ FaceCull: {
		Off : 0,
		Back : 1, // Default
		Front : 2,
		FrontAndBack : 3
	},

    /* enum */ FaceWind: {
		CounterClockwise: 0, // Default
		Clockwise: 1
	},

    /* enum */ TextureFormat : {
        Uninitialized: 0,
        Depth32: 1,
        R: 2,
        RG: 3,
        RGB: 4,
        RGBA: 5,
        SRGB: 6,
        SRGBA: 7,
        RGBA16F: 8,
        RGBA32F: 9,
        Float16: 10,
        Float32: 11
    },

    /* struct */ Index : class {
        constructor(optId, optValid) {
            if (optId === undefined) {
                optId = 0;
            }
            if (optValid === undefined) {
                optValid = false;
            }

            this.id = optId;
            this.valid = optValid;
        }
    },
    
    /* struct */ Sampler : class {
        constructor(optWrapS, optWrapT, optWrapR, optFilterMin, optFilterMip, optFilterMag) {
            if (undefined === optWrapS) {
                optWrapS = Graphics.WrapMode.Repeat;
            }
            if (undefined === optWrapT) {
                optWrapT = Graphics.WrapMode.Repeat;
            }
            if (undefined === optWrapR) {
                optWrapR = Graphics.WrapMode.Repeat;
            }
            if (undefined === optFilterMin) {
                optFilterMin = Graphics.Filter.Linear;
            }
            if (undefined === optFilterMip) {
                optFilterMip = Graphics.Filter.Linear;
            }
            if (undefined === optFilterMag) {
                optFilterMag = Graphics.Filter.Linear;
            }

            this.wrapS = optWrapS;
            this.wrapT = optWrapT;
            this.wrapR = optWrapR;
            this.min = optFilterMin;
            this.mip = optFilterMip;
            this.mag = optFilterMag;
        }
    },

    /* struct */ BufferView : class {
        constructor(optNumComponents, optStrideInBytes, optType, optDataOffsetBytes) {
            if (undefined === optNumComponents) {
                optNumComponents = 0;
            }
            if (undefined === optStrideInBytes) {
                optStrideInBytes = 0;
            }
            if (undefined === optType) {
                optType = Graphics.BufferType.Float32;
            }
            if (undefined === optDataOffsetBytes) {
                optDataOffsetBytes = 0;
            }

            this.NumberOfComponents = optNumComponents;
            this.StrideInBytes = optStrideInBytes;
            this.Type = optType;
            this.DataOffsetInBytes = optDataOffsetBytes;
        }
    },

    /* class */ Texture : class {
        constructor(gl, optData, optWidth, optHeight, optFormat, optGenMips) {
            this.mGl = gl;
            this.mId = gl.createTexture();
            this.mWidth = 0;
            this.mHeight = 0;
            this.mIsMipMapped = false;
            this.mIsCubeMap = false;
            this.mIsMultiSampled = false;
            this.mTextureFormat = Graphics.TextureFormat.Uninitialized;
            this.mUserData = null;

            if (undefined === optData) {
                optData = null;
            }
            if (undefined === optWidth) {
                optWidth = 0;
            }
            if (undefined === optHeight) {
                optHeight = 0;
            }
            if (undefined === optFormat) {
                optFormat = Graphics.TextureFormat.Uninitialized;
            }
            if (undefined === optGenMips) {
                optGenMips = false;
            }
            if (optWidth * optHeight != 0) {
                this.Set(optData, optWidth, optHeight, optFormat, optGenMips);
            }
        }

        SetUserData(data) {
            this.mUserData = data;
        }

        GetUserData() {
            return this.mUserData;
        }

        Destroy() {
            let gl = this.mGl;
            gl.deleteTexture(this.mId);
            this.mId = 0;
            this.mWidth = 0;
            this.mHeight = 0;
            this.mIsMipMapped = false;
            this.mIsCubeMap = false;
            this.mIsMultiSampled = false;
            this.mTextureFormat = Graphics.TextureFormat.Uninitialized;
        }

        GetWidth() {
            return this.mWidth;
        }

        GetHeight() {
            return this.mHeight;
        }

        GetFormat() {
            return this.mTextureFormat;
        }

        Set(data, width, height, format, genMips) {
            if (undefined === data) {
                data = null;
            }
            if (undefined === width) {
                width = 0;
            }
            if (undefined === height) {
                height = 0;
            }
            if (undefined === format) {
                format = Graphics.TextureFormat.RGBA;
            }
            if (undefined === genMips) {
                genMips = false;
            }

            let gl = this.mGl;

            gl.bindTexture(gl.TEXTURE_2D, this.mId);
            this.mIsMultiSampled = false;

            let glFormat = this.Internal_DecodeTextureFormat(format);
            if (format == Graphics.TextureFormat.Depth32) {
                genMips = false;
            }

            gl.texImage2D(gl.TEXTURE_2D, 0, glFormat.internalFormat, width, height, 0, glFormat.dataFormat, glFormat.dataFormatType, data);
            if (genMips) {
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            
            this.mWidth = width;
            this.mHeight = height;
            this.mTextureFormat = format;
            this.mIsCubeMap = false;
            this.mIsMipMapped = genMips;
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        SetCubemap(right, left, top, bottom, back, front, width, height, format, genMips) {
            if (undefined === right) {
                right = null;
            }
            if (undefined === left) {
                left = null;
            }
            if (undefined === top) {
                top = null;
            }
            if (undefined === bottom) {
                bottom = null;
            }
            if (undefined === back) {
                back = null;
            }
            if (undefined === front) {
                front = null;
            }
            if (undefined === width) {
                width = 0;
            }
            if (undefined === height) {
                height = 0;
            }
            if (undefined === format) {
                format = Graphics.TextureFormat.RGBA;
            }
            if (undefined === genMips) {
                genMips = false;
            }

            let gl = this.mGl;
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.mId);
            this.mIsMultiSampled = false;

            let glFormat = this.Internal_DecodeTextureFormat(format);
            if (format == Graphics.TextureFormat.Depth32) {
                genMips = false;
            }

            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFormat.internalFormat, width, height, 0, glFormat.dataFormat, glFormat.dataFormatType, right);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFormat.internalFormat, width, height, 0, glFormat.dataFormat, glFormat.dataFormatType, left);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFormat.internalFormat, width, height, 0, glFormat.dataFormat, glFormat.dataFormatType, top);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFormat.internalFormat, width, height, 0, glFormat.dataFormat, glFormat.dataFormatType, bottom);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFormat.internalFormat, width, height, 0, glFormat.dataFormat, glFormat.dataFormatType, back);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFormat.internalFormat, width, height, 0, glFormat.dataFormat, glFormat.dataFormatType, front);

            if (genMips) {
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }

            this.mWidth = width;
            this.mHeight = height;
            this.mTextureFormat = format;
            this.mIsCubeMap = true;
            this.mIsMipMapped = genMips;

            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }

        Internal_DecodeTextureFormat(texFormat) { 
            let gl = this.mGl;

            let internalFormat = gl.DEPTH_COMPONENT16;
			let dataFormat = gl.DEPTH_COMPONENT;
			let dataFormatType = gl.UNSIGNED_BYTE;

			if (texFormat == Graphics.TextureFormat.R) {
				internalFormat = gl.RED;
				dataFormat = gl.RED;
				dataFormatType = gl.UNSIGNED_BYTE;
			}
			else if (texFormat == Graphics.TextureFormat.RG) {
				internalFormat = gl.RG;
				dataFormat = gl.RG;
				dataFormatType = gl.UNSIGNED_BYTE;
			}
			else if (texFormat == Graphics.TextureFormat.RGB) {
				internalFormat = gl.SRGB;
				dataFormat = gl.RGB;
				dataFormatType = gl.UNSIGNED_BYTE;
			}
			else if (texFormat == Graphics.TextureFormat.SRGB) {
				internalFormat = gl.SRGB;
				dataFormat = gl.RGB;
				dataFormatType = gl.UNSIGNED_BYTE;
			}
			else if (texFormat == Graphics.TextureFormat.RGBA) {
				internalFormat = gl.RGBA;
				dataFormat = gl.RGBA;
				dataFormatType = gl.UNSIGNED_BYTE;
			}
			else if (texFormat == Graphics.TextureFormat.SRGBA) {
				internalFormat = gl.SRGB_ALPHA;
				dataFormat = gl.RGBA;
				dataFormatType = gl.UNSIGNED_BYTE;
			}
			else if (texFormat == Graphics.TextureFormat.Float16) {
				internalFormat = gl.R16F;
				dataFormat = gl.RED;
				dataFormatType = gl.FLOAT;
			}
			else if (texFormat == Graphics.TextureFormat.Float32) {
				internalFormat = gl.R32F;
				dataFormat = gl.RED;
				dataFormatType = gl.FLOAT;
			}
			else if (texFormat == Graphics.TextureFormat.RGBA16F) {
				internalFormat = gl.RGBA16F;
				dataFormat = gl.RGBA;
				dataFormatType = gl.FLOAT;
			}
			else if (texFormat == Graphics.TextureFormat.RGBA32F) {
				internalFormat = gl.RGBA32F;
				dataFormat = gl.RGBA;
				dataFormatType = gl.FLOAT;
			}
			
            let result = {};
            result.internalFormat = internalFormat;
			result.dataFormat = dataFormat;
			result.dataFormatType = dataFormatType;

            return result;
        }
    },

    /* class */ Buffer : class {
        constructor(gl, optIsIndex) {
            this.mGl = gl;
            if (undefined === optIsIndex) {
                optIsIndex = false;
            }
            this.mId = gl.createBuffer();
            this.mIndexBuffer = optIsIndex;
            this.mUserData = null;
        }

        SetUserData(data) {
            this.mUserData = data;
        }

        GetUserData() {
            return this.mUserData;
        }

        Destroy() {
            this.mGl.deleteBuffer(this.mId);
            this.mId = 0;
            this.mIndexBuffer = false;
        }

        Set(inputArray, arraySizeInBytes, optStatic) {
            let gl = this.mGl;

            if (undefined === inputArray) {
                inputArray = null;
                arraySizeInBytes = 0;
            }
            if (undefined === arraySizeInBytes) {
                arraySizeInBytes = 0;
            }
            if (undefined === optStatic) {
                optStatic = true;
            }
            
            if (this.mIndexBuffer) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mId);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, inputArray, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            }
            else {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.mId);
                gl.bufferData(gl.ARRAY_BUFFER, inputArray, optStatic? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
        }

        Reset() {
            let gl = this.mGl;
            
            gl.deleteBuffer(this.mId);
	        this.mId = gl.createBuffer();
        }

        IsIndexBuffer() {
			return this.mIndexBuffer;
		}
    },

    /* class */ Shader : class {
        constructor(gl, vertexSource, fragmentSource) {
            this.mGl = gl;
            this.mProgram = 0;
            this.mValid = true;
            this.mUserData = null;

            if (undefined === vertexSource) {
                vertexSource = "";
            }
            if (undefined === fragmentSource) {
                fragmentSource = "";
            }

            // compile vertex shader
			let vertexShader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vertexShader, vertexSource);
			gl.compileShader(vertexShader);
			let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
			if (!success) {
                const message = gl.getShaderInfoLog(vertexShader);
                this.mValid = false;
			}

            // compile fragment shader
			let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fragmentShader, fragmentSource);
			gl.compileShader(fragmentShader);
			success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
			if (!success) {
                const message = gl.getShaderInfoLog(fragmentShader);
                this.mValid = false;
			}

            // Link shaders into program
			let shaderProgram = gl.createProgram();
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);
			success = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
			if (!success) {
                this.mValid = false;
			}
			else {
				this.mProgram = shaderProgram;
			}

            gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
        }

        SetUserData(data) {
            this.mUserData = data;
        }

        GetUserData() {
            return this.mUserData;
        }

        Destroy() {
            this.mGl.useProgram(null);
            this.mGl.deleteProgram(this.mProgram);
            this.mProgram = 0;
            this.mValid = false;
        }

        GetAttribute(name) {
            let result = new Graphics.Index();
            let loc = this.mGl.getAttribLocation(this.mProgram, name);
            if (loc != null && loc != -1) {
                result.id = loc;
                result.valid = true;
            }
            return result;
        }

        GetUniform(name) {
            let result = new Graphics.Index();
            let loc = this.mGl.getUniformLocation(this.mProgram, name);
            if (loc != null && loc != -1) {
                result.id = loc;
                result.valid = true;
            }
            return result;
        }
    },

    /* class */ FrameBuffer : class {
        constructor(gl, optWidth, optHeight) {
            if (undefined === optWidth) {
                optWidth = 0;
            }
            if (undefined === optHeight) {
                optHeight = 0;
            }
            this.mGl = gl;
            this.mId = gl.createFramebuffer();
            this.mWidth = optWidth;
            this.mHeight = optHeight;
            this.mAttachedColor = null;
            this.mAttachedDepth = null;
            this.mHasColor = 0; // 0 = false, 1 = texture, 2 = buffer
            this.mHasDepth = 0;
            this.mNumRenderTargets = 0;
            this.mUserData = null;

            if (optWidth * optHeight == 0) {
                this.mDepthRenderBuffer = null;
            }
            else {
                this.mGl.bindFramebuffer(this.mGl.FRAMEBUFFER, this.mId);
                this.mDepthRenderBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

                // make a depth buffer and the same size as the targetTexture
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, optWidth, optHeight);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

                this.mGl.bindFramebuffer(this.mGl.FRAMEBUFFER, null);
        }
        }

        SetUserData(data) {
            this.mUserData = data;
        }

        GetUserData() {
            return this.mUserData;
        }

        Destroy() {
            if (this.mDepthRenderBuffer != null) {
                this.mGl.delteRenderBuffer(this.mDepthRenderBuffer);
            }
            this.mGl.bindFramebuffer(this.mGl.FRAMEBUFFER, null);
            this.mGl.deleteFramebuffer(this.mId);
            

            this.mId = 0;
            this.mWidth = 0;
            this.mHeight = 0;
            this.mAttachedColor = null;
            this.mAttachedDepth = null;
            this.mHasColor = 0; // 0 = false, 1 = texture, 2 = buffer
            this.mHasDepth = 0;
            this.mNumRenderTargets = 0;
        }

        AttachColor(color, optAttachIndex) {
            let gl = this.mGl;

            let attachmentIndex = optAttachIndex;
            if (undefined === optAttachIndex) {
                attachmentIndex = 0;
            }

            if (attachmentIndex > 7) { // Limit to 8 color attachments
                attachmentIndex = 7;
            }

            let attachTarget = gl.TEXTURE_2D;
            if (color.mIsCubeMap) {
                attachTarget = gl.TEXTURE_CUBE_MAP;
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.mId);
            gl.bindTexture(attachTarget, color.mId);
            gl.texParameteri(attachTarget, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(attachTarget,  gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, this.Internal_IndexToAttachmentEnum(attachmentIndex), attachTarget, color.mId, 0);
            gl.bindTexture(attachTarget, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            
            this.mAttachedColor = color;
            this.mHasColor = 1;
            this.mWidth = color.mWidth;
            this.mHeight = color.mHeight;

            if (attachmentIndex + 1 > this.mNumRenderTargets) {
                this.mNumRenderTargets = attachmentIndex + 1;
            }
        }

        AttachDepth(depth) {
            let gl = this.mGl;
            
            let attachTarget = gl.TEXTURE_2D;
            if (depth.mIsCubeMap) {
                attachTarget = gl.TEXTURE_CUBE_MAP;
            }
        
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.mId);
            gl.bindTexture(attachTarget, depth.mId);
            gl.texParameteri(attachTarget, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(attachTarget, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, attachTarget, depth.mId, 0);
            gl.bindTexture(attachTarget, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.mAttachedDepth = depth;
            this.mHasDepth = 1;
            this.mWidth = depth.mWidth;
            this.mHeight = depth.mHeight;
        }

        Attach(color, depth) {
            this.AttachColor(color, 0);
            this.AttachDepth(depth);
        }

        ResetAttachmentCounter() {
            this.mNumRenderTargets = 1;
        }

        EnableColor() {
            let gl = this.mGl;
            gl.BindFramebuffer(gl.FRAMEBUFFER, this.mId);
            gl.DrawBuffer(gl.COLOR_ATTACHMENT0);
            gl.ReadBuffer(gl.FRONT);
            gl.BindFramebuffer(gl.FRAMEBUFFER, null);
        }

        DisableColor() {
            let gl = this.mGl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.mId);
            gl.drawBuffer(gl.COLOR_ATTACHMENT0);
            gl.readBuffer(gl.NONE);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        Resize(width, height) {
            if (this.mHasColor == 1 && this.mAttachedColor != null) {
                this.mAttachedColor.Set(null, width, height, this.mAttachedColor.mTextureFormat, false);
            }
        
            if (this.mHasDepth == 1 && this.mAttachedDepth != null) {
                this.mAttachedDepth.Set(null, width, height, Graphics.TextureFormat.Depth32, false);
            }
        }

        ResolveTo(target, optFilter, color, depth, x0, y0, x1, y1, x2, y2, x3, y3) {
            let filter = optFilter;
            if (undefined === optFilter) {
                filter = Graphics.Filter.Nearest;
            }
            if (x0 === undefined) {
                x0 = 0;
            }
            if (y0 === undefined) {
                y0 = 0;
            }
            if (x1 === undefined) {
                x1 = this.mWidth;
            }
            if (y1 === undefined) {
                y1 = this.mHeight;
            }
            if (x2 === undefined) {
                x2 = 0;
            }
            if (y2 === undefined) {
                y2 = 0;
            }
            if (x3 === undefined) {
                x3 = this.mWidth;
            }
            if (y3 === undefined) {
                y3 = this.mHeight;
            }
            if (color === undefined) {
                color = true;
            }
            if (depth === undefined) {
                depth = true;
            }
            let gl = this.mGl;

            let targetId = 0;
            let targetHasColor = true;
            let targetHasDepth = true;
            if (target != null) {
                targetId = target.mId;
                targetHasColor = target.mHasColor != 0;
                targetHasDepth = target.mHasDepth != 0;
            }

            let mask = 0;
            if (this.mHasColor != 0 && targetHasColor && color) {
                mask = mask | gl.COLOR_BUFFER_BIT;
            }
            if (this.mHasDepth != 0 && targetHasDepth && depth) {
                mask = mask | gl.DEPTH_BUFFER_BIT;
            }

            let glfilter = gl.NEAREST;
            if (filter == Graphics.Filter.Linear) {
                glfilter = gl.LINEAR;
            }

            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.mId);
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.targetId);
            gl.blitFramebuffer(x0, y0, x1, y1, x2, y2, x3, y3, mask, glfilter);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        IsValid() {
            let gl = this.mGl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.mId);
            let result = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return result;
        }

        Internal_IndexToAttachmentEnum(index) {
            if (index == 1) {
                return this.mGl.COLOR_ATTACHMENT1;
            }
            else if (index == 2) {
                return this.mGl.COLOR_ATTACHMENT2;
            }
            else if (index == 3) {
                return this.mGl.COLOR_ATTACHMENT3;
            }
            else if (index == 4) {
                return this.mGl.COLOR_ATTACHMENT4;
            }
            else if (index == 5) {
                return this.mGl.COLOR_ATTACHMENT5;
            }
            else if (index == 6) {
                return this.mGl.COLOR_ATTACHMENT6;
            }
            else if (index == 7) {
                return this.mGl.COLOR_ATTACHMENT7;
            }
            return this.mGl.COLOR_ATTACHMENT0;
        }
    },

    /* class */ Device : class {
        constructor(gl) {
            this.mGl = gl;

            this.mEnabledTextureUnits = 0;
            this.mIndexBufferBound = false;
            this.mEnabledVertexAttribPointers = 0;
            this.mIndexBufferType = Graphics.BufferType.Int32;
            this.mDepthMaskEnabled = true;
            this.mDepthState = Graphics.DepthTestState.Off;
            this.mWindingOrder = Graphics.FaceWind.CounterClockwise;
            this.mFaceCulling = Graphics.FaceCull.back;
            this.mSourceBlendFactor = Graphics.BlendFunction.Off;
            this.mDestBlendFactor = Graphics.BlendFunction.Off;
		    this.mGlobalVertexArrayObject = gl.createVertexArray();
            this.mUserData = null;

            gl.bindVertexArray(this.mGlobalVertexArrayObject);
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(true);
            gl.disable(gl.BLEND);
        }

        SetUserData(data) {
            this.mUserData = data;
        }

        GetUserData() {
            return this.mUserData;
        }

        Destroy() {
            this.mGl.bindVertexArray(null);
            this.mGl.deleteVertexArray(this.mGlobalVertexArrayObject);
            this.BindShader(null);
            this.SetRenderTarget(null);
            this.mGlobalVertexArrayObject = 0;
        }

        CreateShader(vShader, fShader) {
            let shader = new Graphics.Shader(this.mGl, vShader, fShader);
            if (shader.mValid) {
                return shader;
            }
            return null;
        }

        DestroyShader(shader) {
            shader.Destroy();
        }

        CreateBuffer(optArray, optSizeInBytes, optStatic) {
            let buffer = new Graphics.Buffer(this.mGl, false);
            if (optArray === undefined) {
                optArray = null;
            }
            if (optSizeInBytes === undefined) {
                optSizeInBytes = 0;
            }
            if (optStatic === undefined) {
                optStatic = true;
            }

            if (optArray != null && optSizeInBytes != 0) {
                buffer.Set(optArray, optSizeInBytes, optStatic);
            }
            return buffer;
        }

        CreateIndexBuffer(optArray, optSizeInBytes, optStatic) {
            let buffer = new Graphics.Buffer(this.mGl, true);
            if (optArray === undefined) {
                optArray = null;
            }
            if (optSizeInBytes === undefined) {
                optSizeInBytes = 0;
            }
            if (optStatic === undefined) {
                optStatic = false;
            }

            if (optArray != null && optSizeInBytes != 0) {
                buffer.Set(optArray, optSizeInBytes, optStatic);
            }
            return buffer;
        }

        DestroyBuffer(buff) {
            buff.Destroy();
        }

        CreateFrameBuffer(optWidth, optHeight) {
            let frm = new Graphics.FrameBuffer(this.mGl);
            frm.generatedColor = null;
            frm.generatedDepth = null;

            if (optWidth === undefined) {
                optWidth = 0;
            }
            if (optHeight === undefined) {
                optHeight = 0;
            }

            if (optWidth * optHeight != 0) {
                frm.generatedColor = this.CreateTexture(null, optWidth, optHeight, Graphics.TextureFormat.RGBA, false);
                frm.AttachColor(frm.generatedColor);
            }

            return frm;
        }

        DestroyFrameBuffer(buffer) {
            if (buffer.generatedColor != null) {
                this.DestroyTexture(buffer.generatedColor);
            }
            if (buffer.generatedDepth != null) {
                this.DestroyTexture(buffer.generatedDepth);
            }
            buffer.Destroy();
        }

        CreateTexture(optData, optWidth, optHeight, optFormat, optGenMips) {
            let tex = new Graphics.Texture(this.mGl);

            if (optData === undefined) {
                optData = null;
            }
            if (optWidth === undefined) {
                optWidth = 0;
            }
            if (optHeight === undefined) {
                optHeight = 0;
            }
            if (optFormat === undefined) {
                optFormat = Graphics.TextureFormat.Uninitialized;
            }
            if (optGenMips === undefined) {
                optGenMips = false;
            }

            if (optWidth * optHeight != 0) {
                tex.Set(optData, optWidth, optHeight, optFormat, optGenMips);
            }

            return tex;
        }

        DestroyTexture(tex) {
            tex.Destroy();
        }

        BindShader(shader) {
            let gl = this.mGl;
            { // RESET
                for (let i = 0; i < 32; ++i) {
                    // Unbind any previously bound attributes
                    if (this.mEnabledVertexAttribPointers & (1 << i)) {
                        gl.disableVertexAttribArray(i);
                        this.mEnabledVertexAttribPointers &= ~(1 << i);
                    }
        
                    // Unbind any previously bound textures
                    if (this.mEnabledTextureUnits & (1 << i)) {
                        gl.activeTexture(this.Internal_GetTextureUnit(i));
                        gl.bindTexture(gl.TEXTURE_2D, null);
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        
                        this.mEnabledTextureUnits &= ~(1 << i);
                    }
                }
                gl.activeTexture(gl.TEXTURE0);
                // Unbind any previously bound index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
                this.mIndexBufferBound = false;
            }

            if (shader === undefined || shader === null || shader === 0) {
                shader = null;
            }
            this.mGl.useProgram(shader.mProgram);
        }

        SetRenderTarget(frameBuffer) {
            let gl = this.mGl;
            let numAttachments = 0;
            let attachments = [];
            if (frameBuffer != null && frameBuffer != 0) {
                numAttachments = frameBuffer.mNumRenderTargets;
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.mId);
            }
            else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                attachments.push(gl.BACK);
            }

            if (numAttachments >= 1) {
                attachments.push(gl.COLOR_ATTACHMENT0);
            }
            if (numAttachments >= 2) {
                attachments.push(gl.COLOR_ATTACHMENT1);
            }
            if (numAttachments >= 3) {
                attachments.push(gl.COLOR_ATTACHMENT2);
            }
            if (numAttachments >= 4) {
                attachments.push(gl.COLOR_ATTACHMENT3);
            }
            if (numAttachments >= 5) {
                attachments.push(gl.COLOR_ATTACHMENT4);
            }
            if (numAttachments >= 6) {
                attachments.push(gl.COLOR_ATTACHMENT5);
            }
            if (numAttachments >= 7) {
                attachments.push(gl.COLOR_ATTACHMENT6);
            }
            if (numAttachments >= 8) {
                attachments.push(gl.COLOR_ATTACHMENT8);
            }
            
            gl.drawBuffers(attachments);
        }

        BindBuffer(indexSlot, buffer, view, optInstanceDivisor) {
            let gl = this.mGl;
            if (optInstanceDivisor === undefined) {
                optInstanceDivisor = 0;
            }

            let type = this.Internal_BufferTypeToEnum(view.Type);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.mId);
            gl.vertexAttribPointer(indexSlot.id, view.NumberOfComponents, type, false, view.StrideInBytes, view.DataOffsetInBytes);
            gl.enableVertexAttribArray(indexSlot.id);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.vertexAttribDivisor(indexSlot.id, optInstanceDivisor);

            // Track vertex attribs (indexSlot.id) in mEnabledVertexAttribPointers
            let bit = indexSlot.id % 32;
            this.mEnabledVertexAttribPointers |= (1 << bit);
        }

        BindIndexBuffer(buffer, bufferType) {
            let gl = this.mGl;

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.mId);
            this.mIndexBufferBound = true;
            this.mIndexBufferType = buffer;
        }

        BindUniform(uniformSlot, uniformType, data /* uniform count not supported in WebGL :( */) {
            let gl = this.mGl;

            if (uniformType == Graphics.UniformType.Int1) {
                gl.uniform1iv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Int2) {
                gl.uniform2iv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Int3) {
                gl.uniform3iv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Int4) {
                gl.uniform4iv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Float1) {
                gl.uniform1fv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Float2) {
                gl.uniform2fv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Float3) {
                gl.uniform3fv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Float4) {
                gl.uniform4fv(uniformSlot.id, data);
            }
            else if (uniformType == Graphics.UniformType.Float9) {
                gl.uniformMatrix3fv(uniformSlot.id, false, data);
            }
            else if (uniformType == Graphics.UniformType.Float16) {
                gl.uniformMatrix4fv(uniformSlot.id, false, data);
            }
        }

        BindTexture(textureSlot, texture, sampler) {
            let gl = this.mGl;

            let min = gl.NEAREST;
            let mag = gl.LINEAR;

            if (texture.mIsMipMapped) {
                if (sampler.min == Graphics.Filter.Nearest) {
                    if (sampler.mip == Graphics.Filter.Nearest) {
                        min = gl.NEAREST_MIPMAP_NEAREST;
                    }
                    else {
                        min = gl.NEAREST_MIPMAP_LINEAR;
                    }
                }
                else {
                    if (sampler.mip == Graphics.Filter.Nearest) {
                        min = gl.LINEAR_MIPMAP_NEAREST;
                    }
                    else {
                        min = gl.LINEAR_MIPMAP_LINEAR;
                    }
                }
            }
            else {
                if (sampler.min == Graphics.Filter.Linear) {
                    min = gl.LINEAR;
                }
            }

            if (sampler.mag == Graphics.Filter.Nearest) {
                mag = gl.NEAREST;
            }

            let wrapS = gl.REPEAT;
            let wrapT = gl.REPEAT;
            let wrapR = gl.REPEAT;

            if (sampler.wrapS == Graphics.WrapMode.Clamp) {
                wrapS = gl.CLAMP_TO_EDGE;
            }

            if (sampler.wrapT == Graphics.WrapMode.Clamp) {
                wrapT = gl.CLAMP_TO_EDGE;
            }

            if (sampler.wrapR == Graphics.WrapMode.Clamp) {
                wrapR = gl.CLAMP_TO_EDGE;
            }

            let target = gl.TEXTURE_2D;
            if (texture.mIsCubeMap) {
                target = gl.TEXTURE_CUBE_MAP;
            }

            // Find texture unit
            let textureUnit = this.Internal_FindFirstEnabled(this.mEnabledTextureUnits);
            this.mEnabledTextureUnits |= (1 << textureUnit);
            gl.activeTexture(this.Internal_GetTextureUnit(textureUnit));
            gl.bindTexture(target, texture.mId);

            // Set min and mag filter
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, min);
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, mag);

            // Set Wrap Mode
            gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrapS);
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapT);
            if (texture.mIsCubeMap) {
                gl.texParameteri(target, gl.TEXTURE_WRAP_R, wrapR);
            }

            gl.uniform1i(textureSlot.id, textureUnit);
        }

        Draw(drawMode, startIndex, indexCount, optInstanceCount) {
            let gl = this.mGl;

            if (optInstanceCount === undefined) {
                optInstanceCount = 1;
            }

            if (this.mIndexBufferBound) {
                let type = this.Internal_BufferTypeToEnum(this.mIndexBufferType);
                if (optInstanceCount <= 1) {
                    gl.drawElements(this.Internal_DrawModeToEnum(drawMode), indexCount, type, startIndex);
                }
                else {
                    gl.drawElementsInstanced(this.Internal_DrawModeToEnum(drawMode), indexCount, type, startIndex, optInstanceCount);
                }
            }
            else {
                if (optInstanceCount <= 1) {
                    gl.drawArrays(this.Internal_DrawModeToEnum(drawMode), startIndex, indexCount);
                }
                else {
                    gl.drawArraysInstanced(this.Internal_DrawModeToEnum(drawMode), startIndex, indexCount, optInstanceCount);
                }
            }
        }

        SetDepthTest(state) {
            let gl = this.mGl;

            if (state == Graphics.DepthTestState.Off) {
                gl.depthFunc(gl.LESS);
                gl.disable(gl.DEPTH_TEST);
            }
            else {
                gl.enable(gl.DEPTH_TEST);
        
                if (state == Graphics.DepthTestState.Always) {
                    gl.depthFunc(gl.ALWAYS);
                }
                else if (state == Graphics.DepthTestState.Never) {
                    gl.depthFunc(gl.NEVER);
                }
                else if (state == Graphics.DepthTestState.Less) {
                    gl.depthFunc(gl.LESS);
                }
                else if (state == Graphics.DepthTestState.Equal) {
                    gl.depthFunc(gl.EQUAL);
                }
                else if (state == Graphics.DepthTestState.LEqual) {
                    gl.depthFunc(gl.LEQUAL);
                }
                else if (state == Graphics.DepthTestState.Greater) {
                    gl.depthFunc(gl.GREATER);
                }
                else if (state == Graphics.DepthTestState.GEqual) {
                    gl.depthFunc(gl.GEQUAL);
                }
                else if (state == Graphics.DepthTestState.NotEqual) {
                    gl.depthFunc(gl.NOTEQUAL);
                }
            }
            this.mDepthState = state;
        }

        GetDepthTest() {
            return this.mDepthState;
        }

        EnableDepthTest() {
            this.SetDepthTest(Graphics.DepthTestState.Less);
        }

        DisableDepthTest() {
            this.SetDepthTest(Graphics.DepthTestState.Off);
        }

        EnableDepthMask() {
            this.mGl.septhMask(true);
	        this.mDepthMaskEnabled = true;
        }

        DisableDepthMask() {
            this.mGl.depthMask(false);
	        this.mDepthMaskEnabled = false;
        }

        GetDepthMask() {
            return this.mDepthMaskEnabled;
        }

        SetBlendFunction(sourceFactor, destFactor) {
            let gl = this.mGl;

            let disabled = sourceFactor == Graphics.BlendFunction.Off || destFactor == Graphics.BlendFunction.Off;

            if (disabled) {
                sourceFactor = Graphics.BlendFunction.Off;
                destFactor = Graphics.BlendFunction.Off;
                gl.disable(gl.BLEND);
            }
            else {
                gl.enable(gl.BLEND);
                gl.blendFunc(this.Internal_BlendfuncToEnum(sourceFactor), this.Internal_BlendfuncToEnum(destFactor));
            }

            this.mSourceBlendFactor = sourceFactor;
            this.mDestBlendFactor = destFactor;
        }

        GetBlendFunctionSourceFactor() {
            return  this.mSourceBlendFactor;
        }

        GetBlendFunctionDestFactor() {
            return  this.mDestBlendFactor;
        }

        SetFaceVisibility(cull, optWind) {
            let gl = this.mGl;
            if (optWind === undefined) {
                optWind = Graphics.FaceWind.CounterClockwise;
            }
            
            if (cull == Graphics.FaceCull.Back) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
            }
            else if (cull == Graphics.FaceCull.Front) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.FRONT);
            }
            else if (cull == Graphics.FaceCull.FrontAndBack) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.FRONT_AND_BACK);
            }
            else { // Off
                gl.disable(gl.CULL_FACE);
            }
        
            if (optWind == Graphics.FaceWind.CounterClockwise) {
                gl.frontFace(gl.CCW); 
            }
            else {
                gl.frontFace(gl.CW);
            }
        
            this.mFaceCulling = cull;
            this.mWindingOrder = optWind;
        }

        GetFaceCullMode() {
            return this.mFaceCulling;
        }

        GetWindingOrder() {
            return this.mWindingOrder;
        }

        Clear(r, g, b, depth) {
            let gl = this.mGl;

            gl.clearColor(r, g, b, 1.0);
            gl.clearDepth(depth);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        ClearColor(r, g, b) {
            let gl = this.mGl;

            gl.clearColor(r, g, b, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        ClearDepth(depth) {
            let gl = this.mGl;

            gl.clearDepth(depth);
            gl.clear(gl.DEPTH_BUFFER_BIT);
        }

        SetViewport(x, y, w, h) {
            this.mGl.viewport(x, y, w, h);
        }

        SetScissor(x, y, w, h) {
            let gl = this.mGl;
            gl.enable(gl.SCISSOR_TEST);
	        gl.scissor(x, y, w, h);
        }

        ClearScissor() {
            this.mGl.disable(this.mGl.SCISSOR_TEST);
        }


        Internal_BufferTypeToEnum(bufferType) {
            let gl = this.mGl;

            let type = gl.FLOAT;

			if (bufferType == Graphics.BufferType.Int8) {
				type = gl.BYTE;
			}
			else if (bufferType == Graphics.BufferType.UInt8) {
				type = gl.UNSIGNED_BYTE;
			}
			else if (bufferType == Graphics.BufferType.Int16) {
				type = gl.SHORT;
			}
			else if (bufferType == Graphics.BufferType.UInt16) {
				type = gl.UNSIGNED_SHORT;
			}
			else if (bufferType == Graphics.BufferType.Int32) {
				type = gl.INT;
			}
			else if (bufferType == Graphics.BufferType.UInt32) {
				type = gl.UNSIGNED_INT;
			}

			return type;
        }
        
        Internal_FindFirstEnabled(mask) {
			for (let i = 0; i < 32; ++i) {
				if (!(mask & (1 << i))) {
					return i;
				}
			}
			return 33;
		}

        Internal_GetTextureUnit(index) {
            if (index == 16) {
				return (this.mGl.TEXTURE16);
			}
			else if (index == 15) {
				return (this.mGl.TEXTURE15);
			}
			else if (index == 14) {
				return (this.mGl.TEXTURE14);
			}
			else if (index == 13) {
				return (this.mGl.TEXTURE13);
			}
			else if (index == 12) {
				return (this.mGl.TEXTURE12);
			}
			else if (index == 11) {
				return (this.mGl.TEXTURE11);
			}
			else if (index == 10) {
				return (this.mGl.TEXTURE10);
			}
			else if (index == 9) {
				return (this.mGl.TEXTURE9);
			}
			else if (index == 8) {
				return (this.mGl.TEXTURE8);
			}
			else if (index == 7) {
				return (this.mGl.TEXTURE7);
			}
			else if (index == 6) {
				return (this.mGl.TEXTURE6);
			}
			else if (index == 5) {
				return (this.mGl.TEXTURE5);
			}
			else if (index == 4) {
				return (this.mGl.TEXTURE4);
			}
			else if (index == 3) {
				return (this.mGl.TEXTURE3);
			}
			else if (index == 2) {
				return (this.mGl.TEXTURE2);
			}
			else if (index == 1) {
				return (this.mGl.TEXTURE1);
			}
			else if (index == 0) {
				return (this.mGl.TEXTURE0);
			}

			return this.mGl.TEXTURE0;
        }

        Internal_DrawModeToEnum(drawMode) {
            let gl = this.mGl;

            let mode = gl.TRIANGLES;
            if (drawMode == Graphics.DrawMode.Points) {
                mode = gl.POINTS;
            }
            else if (drawMode == Graphics.DrawMode.Lines) {
                mode = gl.LINES;
            }
            else if (drawMode == Graphics.DrawMode.LineStrip) {
                mode = gl.LINE_STRIP;
            }
            else if (drawMode == Graphics.DrawMode.TriangleStrip) {
                mode = gl.TRIANGLE_STRIP;
            }
            else if (drawMode == Graphics.DrawMode.TriangleFan) {
                mode = gl.TRIANGLE_FAN;
            }
            return mode;
        }

        Internal_BlendfuncToEnum(b) {
            let gl = this.mGl;

            let result = gl.ZERO;
			if (b == Graphics.BlendFunction.One) {
				result = gl.ONE;
			}
			else if (b == Graphics.BlendFunction.SrcColor) {
				result = gl.SRC_COLOR;
			}
			else if (b == Graphics.BlendFunction.OneMinusSrcColor) {
				result = gl.ONE_MINUS_SRC_COLOR;
			}
			else if (b == Graphics.BlendFunction.DstColor) {
				result = gl.DST_COLOR;
			}
			else if (b == Graphics.BlendFunction.OneMinusDstColor) {
				result = gl.ONE_MINUS_DST_COLOR;
			}
			else if (b == Graphics.BlendFunction.SrcAlpha) {
				result = gl.SRC_ALPHA;
			}
			else if (b == Graphics.BlendFunction.OneMinusSrcAlpha) {
				result = gl.ONE_MINUS_SRC_ALPHA;
			}
			else if (b == Graphics.BlendFunction.DstAlpha) {
				result = gl.DST_ALPHA;
			}
			else if (b == Graphics.BlendFunction.OneMinusDstAlpha) {
				result = gl.ONE_MINUS_DST_ALPHA;
			}
			else if (b == Graphics.BlendFunction.ConstColor) {
				result = gl.CONSTANT_COLOR;
			}
			else if (b == Graphics.lendFunction.OneMinusConstColor) {
				result = gl.ONE_MINUS_CONSTANT_COLOR;
			}
			else if (b == Graphics.BlendFunction.ConstAlpha) {
				result = gl.CONSTANT_ALPHA;
			}
			else if (b == Graphics.BlendFunction.OneMinusconstAlpha) {
				result = gl.ONE_MINUS_CONSTANT_ALPHA;
			}
			else if (b == Graphics.BlendFunction.SrcAlphaSaturate) {
				result = gl.SRC_ALPHA_SATURATE;
			}
			return result;
        }
    }
};