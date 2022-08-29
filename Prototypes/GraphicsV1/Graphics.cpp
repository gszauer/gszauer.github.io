#include "Graphics.h"
#include "gl.h"

#if _DEBUG
#define GraphicsCompAssert(cond) if (mOwner != 0 && mOwner->GetPlatform()->Assert != 0) { mOwner->GetPlatform()->Assert(cond); }
#define GraphicsDevAssert(cond) if (mPlatform.Assert != 0) { mPlatform.Assert(cond); }
#else
	#define GraphicsCompAssert(cond) 
	#define GraphicsDevAssert(cond) 
#endif

// Helpers
namespace Graphics {
	namespace Internal {
		inline u32 StrLen(const char* str) {
			const char* s;
			for (s = str; *s; ++s);
			return (u32)(s - str);
		}

		inline u32 FindFirstEnabled(u32 mask) {
			for (u32 i = 0; i < 32; ++i) {
				if (!(mask & (1 << i))) {
					return (i32)i;
				}
			}
			return 33;
		}

		inline GLenum GetTextureUnit(u32 index) {
			if (index == 16) {
				return (GL_TEXTURE16);
			}
			else if (index == 15) {
				return (GL_TEXTURE15);
			}
			else if (index == 14) {
				return (GL_TEXTURE14);
			}
			else if (index == 13) {
				return (GL_TEXTURE13);
			}
			else if (index == 12) {
				return (GL_TEXTURE12);
			}
			else if (index == 11) {
				return (GL_TEXTURE11);
			}
			else if (index == 10) {
				return (GL_TEXTURE10);
			}
			else if (index == 9) {
				return (GL_TEXTURE9);
			}
			else if (index == 8) {
				return (GL_TEXTURE8);
			}
			else if (index == 7) {
				return (GL_TEXTURE7);
			}
			else if (index == 6) {
				return (GL_TEXTURE6);
			}
			else if (index == 5) {
				return (GL_TEXTURE5);
			}
			else if (index == 4) {
				return (GL_TEXTURE4);
			}
			else if (index == 3) {
				return (GL_TEXTURE3);
			}
			else if (index == 2) {
				return (GL_TEXTURE2);
			}
			else if (index == 1) {
				return (GL_TEXTURE1);
			}
			else if (index == 0) {
				return (GL_TEXTURE0);
			}

			return GL_TEXTURE0;
		}

		inline GLenum BlendfuncToEnum(BlendFunction b) {
			GLenum result = GL_ZERO;
			if (b == BlendFunction::One) {
				result = GL_ONE;
			}
			else if (b == BlendFunction::SrcColor) {
				result = GL_SRC_COLOR;
			}
			else if (b == BlendFunction::OneMinusSrcColor) {
				result = GL_ONE_MINUS_SRC_COLOR;
			}
			else if (b == BlendFunction::DstColor) {
				result = GL_DST_COLOR;
			}
			else if (b == BlendFunction::OneMinusDstColor) {
				result = GL_ONE_MINUS_DST_COLOR;
			}
			else if (b == BlendFunction::SrcAlpha) {
				result = GL_SRC_ALPHA;
			}
			else if (b == BlendFunction::OneMinusSrcAlpha) {
				result = GL_ONE_MINUS_SRC_ALPHA;
			}
			else if (b == BlendFunction::DstAlpha) {
				result = GL_DST_ALPHA;
			}
			else if (b == BlendFunction::OneMinusDstAlpha) {
				result = GL_ONE_MINUS_DST_ALPHA;
			}
			else if (b == BlendFunction::ConstColor) {
				result = GL_CONSTANT_COLOR;
			}
			else if (b == BlendFunction::OneMinusConstColor) {
				result = GL_ONE_MINUS_CONSTANT_COLOR;
			}
			else if (b == BlendFunction::ConstAlpha) {
				result = GL_CONSTANT_ALPHA;
			}
			else if (b == BlendFunction::OneMinusconstAlpha) {
				result = GL_ONE_MINUS_CONSTANT_ALPHA;
			}
			else if (b == BlendFunction::SrcAlphaSaturate) {
				result = GL_SRC_ALPHA_SATURATE;
			}
			return result;
		}

		inline GLenum DrawModeToEnum(DrawMode drawMode) {
			GLenum mode = GL_TRIANGLES;
			if (drawMode == DrawMode::Points) {
				mode = GL_POINTS;
			}
			else if (drawMode == DrawMode::Lines) {
				mode = GL_LINES;
			}
			else if (drawMode == DrawMode::LineStrip) {
				mode = GL_LINE_STRIP;
			}
			else if (drawMode == DrawMode::TriangleStrip) {
				mode = GL_TRIANGLE_STRIP;
			}
			else if (drawMode == DrawMode::TriangleFan) {
				mode = GL_TRIANGLE_FAN;
			}
			return mode;
		}

		struct TextureFormatResult {
			GLenum internalFormat;
			GLenum dataFormat;
			GLenum dataFormatType;
		};

		inline TextureFormatResult TextureFormatToEnum(TextureFormat texFormat) {
			GLenum internalFormat = GL_DEPTH_COMPONENT;
			GLenum dataFormat = GL_DEPTH_COMPONENT;
			GLenum dataFormatType = GL_UNSIGNED_BYTE;

			if (texFormat == TextureFormat::R) {
				internalFormat = GL_RED;
				dataFormat = GL_RED;
				dataFormatType = GL_UNSIGNED_BYTE;
			}
			else if (texFormat == TextureFormat::RG) {
				internalFormat = GL_RG;
				dataFormat = GL_RG;
				dataFormatType = GL_UNSIGNED_BYTE;
			}
			else if (texFormat == TextureFormat::RGB) {
				internalFormat = GL_SRGB;
				dataFormat = GL_RGB;
				dataFormatType = GL_UNSIGNED_BYTE;
			}
			else if (texFormat == TextureFormat::SRGB) {
				internalFormat = GL_SRGB;
				dataFormat = GL_RGB;
				dataFormatType = GL_UNSIGNED_BYTE;
			}
			else if (texFormat == TextureFormat::RGBA) {
				internalFormat = GL_RGBA;
				dataFormat = GL_RGBA;
				dataFormatType = GL_UNSIGNED_BYTE;
			}
			else if (texFormat == TextureFormat::SRGBA) {
				internalFormat = GL_SRGB_ALPHA;
				dataFormat = GL_RGBA;
				dataFormatType = GL_UNSIGNED_BYTE;
			}
			else if (texFormat == TextureFormat::Float16) {
				internalFormat = GL_R16F;
				dataFormat = GL_RED;
				dataFormatType = GL_FLOAT;
			}
			else if (texFormat == TextureFormat::Float32) {
				internalFormat = GL_R32F;
				dataFormat = GL_RED;
				dataFormatType = GL_FLOAT;
			}
			else if (texFormat == TextureFormat::RGBA16F) {
				internalFormat = GL_RGBA16F;
				dataFormat = GL_RGBA;
				dataFormatType = GL_FLOAT;
			}
			else if (texFormat == TextureFormat::RGBA32F) {
				internalFormat = GL_RGBA32F;
				dataFormat = GL_RGBA;
				dataFormatType = GL_FLOAT;
			}
			
			TextureFormatResult result;
			result.internalFormat = internalFormat;
			result.dataFormat = dataFormat;
			result.dataFormatType = dataFormatType;
			
			return result;
		}

		inline GLenum BufferTypeToEnum(BufferType bufferType) {
			GLenum type = GL_FLOAT;

			if (bufferType == BufferType::Int8) {
				type = GL_BYTE;
			}
			else if (bufferType == BufferType::UInt8) {
				type = GL_UNSIGNED_BYTE;
			}
			else if (bufferType == BufferType::Int16) {
				type = GL_SHORT;
			}
			else if (bufferType == BufferType::UInt16) {
				type = GL_UNSIGNED_SHORT;
			}
			else if (bufferType == BufferType::Int32) {
				type = GL_INT;
			}
			else if (bufferType == BufferType::UInt32) {
				type = GL_UNSIGNED_INT;
			}

			return type;
		}

		struct ShaderCompileResult {
			bool success;
			u32 program;

			ShaderCompileResult() {
				success = false;
				program = 0;
			}
		};

		void DebugEnumerateShaderAttributes(unsigned int handle) {
			int count = -1;
			int length;
			char name[128];
			int size;
			GLenum type;

			glUseProgram(handle);
			glGetProgramiv(handle, GL_ACTIVE_ATTRIBUTES, &count);

			for (int i = 0; i < count; ++i) {
				memset(name, 0, sizeof(char) * 128);
				glGetActiveAttrib(handle, (GLuint)i, 128, &length, &size, &type, name);
				int attrib = glGetAttribLocation(handle, name);
				int debug = 0;
			}

			glUseProgram(0);
		}

		void DebugEnumerateShaderUniforms(unsigned int handle) {
			int count = -1;
			int length;
			char name[128];
			int size;
			GLenum type;
			char testName[256];

			glUseProgram(handle);
			glGetProgramiv(handle, GL_ACTIVE_UNIFORMS, &count);

			for (int i = 0; i < count; ++i) {
				memset(name, 0, sizeof(char) * 128);
				glGetActiveUniform(handle, (GLuint)i, 128, &length, &size, &type, name);
				int uniform = glGetUniformLocation(handle, name);
				int debug = 0;
			}

			glUseProgram(0);
		}

		ShaderCompileResult CompileOpenGLShader(const char* vertexSource, const char* fragmentSource, Dependencies* platform) {
			ShaderCompileResult result;
			result.success = true;
			result.program = 0;
			int success = 1;

			// compile vertex shader
			u32 vertexShader = glCreateShader(GL_VERTEX_SHADER);
			glShaderSource(vertexShader, 1, &vertexSource, NULL);
			glCompileShader(vertexShader);
			glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
			if (!success) {
				result.success = false;
#if _DEBUG
				char infoLog[512];
				glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
				glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
				if (platform != 0 && platform->Assert != 0) {
					platform->Assert(false);
				}
#endif
			}

			// compile fragment shader
			u32 fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
			glShaderSource(fragmentShader, 1, &fragmentSource, NULL);
			glCompileShader(fragmentShader);
			glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
			if (!success) {
				result.success = false;
#if _DEBUG
				char infoLog[512];
				glGetShaderInfoLog(fragmentShader, 512, NULL, infoLog);
				glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
				if (platform != 0 && platform->Assert != 0) {
					platform->Assert(false);
				}
#endif
			}

			// Link shaders into program
			u32 shaderProgram = glCreateProgram();
			glAttachShader(shaderProgram, vertexShader);
			glAttachShader(shaderProgram, fragmentShader);
			glLinkProgram(shaderProgram);
			glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
			if (!success) {
				result.success = false;
#if _DEBUG
				char infoLog[512];
				glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
				glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
				if (platform != 0 && platform->Assert != 0) {
					platform->Assert(false);
				}
#endif
			}
			else {
				result.program = shaderProgram;
			}

			// Delete shaders
			glDeleteShader(vertexShader);
			glDeleteShader(fragmentShader);

#if 0
			if (result.success) {
				DebugEnumerateShaderAttributes(shaderProgram);
				DebugEnumerateShaderUniforms(shaderProgram);
			}
#endif

			return result;
		}
	}
}

/// Texture

void Graphics::Texture::SetMultisampled(u32 width, u32 height, TextureFormat texFormat, u32 samples) {
	glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, mId);

	Internal::TextureFormatResult format = Internal::TextureFormatToEnum(texFormat);

	if (samples > GL_MAX_SAMPLES) {
		samples = GL_MAX_SAMPLES;
	}
	glTexImage2DMultisample(GL_TEXTURE_2D_MULTISAMPLE, samples, format.internalFormat, width, height, GL_TRUE);

	mWidth = width;
	mHeight = height;
	mTextureFormat = texFormat;
	mIsCubeMap = false;
	mIsMipMapped = false;
	mIsMultiSampled = true;

	glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, 0);
}

void Graphics::Texture::Set(void* data, u32 width, u32 height, TextureFormat texFormat, bool genMipMaps) {
	glBindTexture(GL_TEXTURE_2D, mId);
	mIsMultiSampled = false;

	Internal::TextureFormatResult format = Internal::TextureFormatToEnum(texFormat);

	if (texFormat == TextureFormat::Depth32) {
		genMipMaps = false;
	}


	glTexImage2D(GL_TEXTURE_2D, 0, format.internalFormat, width, height, 0, format.dataFormat, format.dataFormatType, data);
	if (genMipMaps) {
		glGenerateMipmap(GL_TEXTURE_2D);
	}
	
	mWidth = width;
	mHeight = height;
	mTextureFormat = texFormat;
	mIsCubeMap = false;
	mIsMipMapped = genMipMaps;

	glBindTexture(GL_TEXTURE_2D, 0);
}

void Graphics::Texture::SetCubemap(void* rightData, void* leftData, void* topData, void* bottomData, void* backData, void* frontData, u32 width, u32 height, TextureFormat texFormat, bool genMipMaps) {
	glBindTexture(GL_TEXTURE_CUBE_MAP, mId);
	mIsMultiSampled = false;

	Internal::TextureFormatResult format = Internal::TextureFormatToEnum(texFormat);
	if (texFormat == Graphics::TextureFormat::Depth32) {
		genMipMaps = false;
	}

	glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format.internalFormat, width, height, 0, format.dataFormat, format.dataFormatType, rightData);
	glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format.internalFormat, width, height, 0, format.dataFormat, format.dataFormatType, leftData);
	glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format.internalFormat, width, height, 0, format.dataFormat, format.dataFormatType, topData);
	glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format.internalFormat, width, height, 0, format.dataFormat, format.dataFormatType, bottomData);
	glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format.internalFormat, width, height, 0, format.dataFormat, format.dataFormatType, backData);
	glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format.internalFormat, width, height, 0, format.dataFormat, format.dataFormatType, frontData);

	if (genMipMaps) {
		glGenerateMipmap(GL_TEXTURE_CUBE_MAP);
	}

	mWidth = width;
	mHeight = height;
	mTextureFormat = texFormat;
	mIsCubeMap = true;
	mIsMipMapped = genMipMaps;

	glBindTexture(GL_TEXTURE_CUBE_MAP, 0);
}

/// Device

void Graphics::Device::SetFaceVisibility(FaceCull cull, FaceWind wind) {
	if (cull == FaceCull::Back) {
		glEnable(GL_CULL_FACE);
		glCullFace(GL_BACK);
	}
	else if (cull == FaceCull::Front) {
		glEnable(GL_CULL_FACE);
		glCullFace(GL_FRONT);
	}
	else if (cull == FaceCull::FrontAndBack) {
		glEnable(GL_CULL_FACE);
		glCullFace(GL_FRONT_AND_BACK);
	}
	else { // Off
		glDisable(GL_CULL_FACE);
	}

	if (wind == FaceWind::CounterClockwise) {
		glFrontFace(GL_CCW); 
	}
	else {
		glFrontFace(GL_CW);
	}

	mFaceCulling = cull;
	mWindingOrder = wind;
}

void  Graphics::Device::SetBlendFunction(BlendFunction sourceFactor, BlendFunction destFactor) {
	bool disabled = sourceFactor == BlendFunction::Off || destFactor == BlendFunction::Off;

	if (disabled) {
		sourceFactor = BlendFunction::Off;
		destFactor = BlendFunction::Off;
		glDisable(GL_BLEND);
	}
	else {
		glEnable(GL_BLEND);
		glBlendFunc(Internal::BlendfuncToEnum(sourceFactor), Internal::BlendfuncToEnum(destFactor));
	}

	mSourceBlendFactor = sourceFactor;
	mDestBlendFactor = destFactor;
}

void Graphics::Device::SetDepthTest(DepthTestState state) {
	if (state == DepthTestState::Off) {
		glDepthFunc(GL_LESS);
		glDisable(GL_DEPTH_TEST);
	}
	else {
		glEnable(GL_DEPTH_TEST);

		if (state == DepthTestState::Always) {
			glDepthFunc(GL_ALWAYS);
		}
		else if (state == DepthTestState::Never) {
			glDepthFunc(GL_NEVER);
		}
		else if (state == DepthTestState::Less) {
			glDepthFunc(GL_LESS);
		}
		else if (state == DepthTestState::Equal) {
			glDepthFunc(GL_EQUAL);
		}
		else if (state == DepthTestState::LEqual) {
			glDepthFunc(GL_LEQUAL);
		}
		else if (state == DepthTestState::Greater) {
			glDepthFunc(GL_GREATER);
		}
		else if (state == DepthTestState::GEqual) {
			glDepthFunc(GL_GEQUAL);
		}
		else if (state == DepthTestState::NotEqual) {
			glDepthFunc(GL_NOTEQUAL);
		}
	}
	mDepthState = state;
}

void Graphics::Device::Clear(f32 r, f32 g, f32 b, f32 depth) {
	glClearColor(r, g, b, 1.0f);
	glClearDepth(depth);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void Graphics::Device::Clear(f32 r, f32 g, f32 b) {
	glClearColor(r, g, b, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT);
}

void Graphics::Device::Clear(f32 depth) {
	glClearDepth(depth);
	glClear(GL_DEPTH_BUFFER_BIT);
}

void Graphics::Device::SetMultiSample(bool state) {
	if (state) {
		glEnable(GL_MULTISAMPLE);
	}
	else {
		glDisable(GL_MULTISAMPLE);
	}
}

void Graphics::Device::SetViewport(u32 x, u32 y, u32 w, u32 h) {
	glViewport(x, y, w, h);
}

void Graphics::Device::SetScissor(u32 x, u32 y, u32 w, u32 h) {
	glEnable(GL_SCISSOR_TEST);
	glScissor(x, y, w, h);
}

void Graphics::Device::ClearScissor() {
	glDisable(GL_SCISSOR_TEST);
}

Graphics::FrameBuffer* Graphics::Device::CreateFrameBuffer() {
	Graphics::FrameBuffer* result = (Graphics::FrameBuffer*)mPlatform.Request(sizeof(Graphics::FrameBuffer));
	glGenFramebuffers(1, &result->mId);
	result->mWidth = 0;
	result->mHeight = 0;
	result->mColorRenderBufferObject = 0;
	result->mDepthRenderBufferObject = 0;
	result->mAttachedColor = 0;
	result->mAttachedDepth = 0;
	result->mHasColor = 0;
	result->mHasDepth = 0;
	result->mNumRenderTargets = 0;
	result->mUserData = 0;
	result->mOwner = this;
	result->mAllocPrev = 0;
	result->mAllocNext = mAllocatedFrameBuffers;
	if (mAllocatedFrameBuffers != 0) {
		mAllocatedFrameBuffers->mAllocPrev = result;
	}
	mAllocatedFrameBuffers = result;

	return result;
}

Graphics::FrameBuffer* Graphics::Device::CreateFrameBuffer(u32 width, u32 height) {
	Graphics::FrameBuffer* result = CreateFrameBuffer();

	result->mWidth = width;
	result->mHeight = height;
	result->mHasColor = 2;
	result->mHasDepth = 2;
	result->mNumRenderTargets = 1;

	glBindFramebuffer(GL_FRAMEBUFFER, result->mId);
	glGenRenderbuffers(1, &result->mColorRenderBufferObject);
	glGenRenderbuffers(1, &result->mDepthRenderBufferObject);

	glBindRenderbuffer(GL_RENDERBUFFER, result->mColorRenderBufferObject);
	glRenderbufferStorage(GL_RENDERBUFFER, GL_RGBA, width, height);
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, result->mColorRenderBufferObject);

	glBindRenderbuffer(GL_RENDERBUFFER, result->mDepthRenderBufferObject);
	glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, width, height);
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, result->mDepthRenderBufferObject);

	glBindRenderbuffer(GL_RENDERBUFFER, 0);
	glBindFramebuffer(GL_FRAMEBUFFER, 0);


	return result;
}

void Graphics::Device::Destroy(FrameBuffer* buffer) {
	glBindFramebuffer(GL_FRAMEBUFFER, buffer->mId);
	if (buffer->mHasColor == 2) {
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, 0);
		glDeleteRenderbuffers(1, &buffer->mColorRenderBufferObject);
	}

	if (buffer->mHasDepth == 2) {
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, 0);
		glDeleteRenderbuffers(1, &buffer->mDepthRenderBufferObject);
	}
	glBindFramebuffer(GL_FRAMEBUFFER, 0);

	glDeleteFramebuffers(1, &buffer->mId);


	if (buffer->mAllocPrev != 0) { // Not head
		buffer->mAllocPrev->mAllocNext = buffer->mAllocNext;
		if (buffer->mAllocNext != 0) {
			buffer->mAllocNext->mAllocPrev = buffer->mAllocPrev;
		}
	}
	else { // Head
		GraphicsDevAssert(buffer == mAllocatedFrameBuffers);
		mAllocatedFrameBuffers = mAllocatedFrameBuffers->mAllocNext;
		if (mAllocatedFrameBuffers != 0) {
			mAllocatedFrameBuffers->mAllocPrev = 0;
		}
	}

	mPlatform.Release(buffer);
}

Graphics::Buffer* Graphics::Device::CreateBuffer() {
	Graphics::Buffer* result = (Graphics::Buffer*)mPlatform.Request(sizeof(Graphics::Buffer));
	glGenBuffers(1, &result->mId);
	result->mIndexBuffer = false;
	result->mUserData = 0;
	result->mOwner = this;
	result->mAllocPrev = 0;
	result->mAllocNext = mAllocatedBuffers;
	if (mAllocatedBuffers != 0) {
		mAllocatedBuffers->mAllocPrev = result;
	}
	mAllocatedBuffers = result;

	return result;
}

Graphics::Buffer* Graphics::Device::CreateIndexBuffer() {
	Graphics::Buffer* result = (Graphics::Buffer*)mPlatform.Request(sizeof(Graphics::Buffer));
	glGenBuffers(1, &result->mId);
	result->mIndexBuffer = true;
	result->mUserData = 0;
	result->mOwner = this;
	result->mAllocPrev = 0;
	result->mAllocNext = mAllocatedBuffers;
	if (mAllocatedBuffers != 0) {
		mAllocatedBuffers->mAllocPrev = result;
	}
	mAllocatedBuffers = result;

	return result;
}

void Graphics::Device::Destroy(Buffer* buff) {
	glDeleteBuffers(1, &buff->mId);

	if (buff->mAllocPrev != 0) { // Not head
		buff->mAllocPrev->mAllocNext = buff->mAllocNext;
		if (buff->mAllocNext != 0) {
			buff->mAllocNext->mAllocPrev = buff->mAllocPrev;
		}
	}
	else { // Head
		GraphicsDevAssert(buff == mAllocatedBuffers);
		mAllocatedBuffers = mAllocatedBuffers->mAllocNext;
		if (mAllocatedBuffers != 0) {
			mAllocatedBuffers->mAllocPrev = 0;
		}
	}

	mPlatform.Release(buff);
}

Graphics::Texture* Graphics::Device::CreateTexture() {
	Graphics::Texture* result = (Graphics::Texture*)mPlatform.Request(sizeof(Graphics::Texture));

	glGenTextures(1, &result->mId);
	result->mIsMultiSampled = false;
	result->mWidth = 0;
	result->mHeight = 0;
	result->mTextureFormat = TextureFormat::Uninitialized;
	result->mIsMipMapped = false;
	result->mIsCubeMap = false;
	result->mUserData = 0;

	result->mOwner = this;
	result->mAllocPrev = 0;
	result->mAllocNext = mAllocatedTextures;
	if (mAllocatedTextures != 0) {
		mAllocatedTextures->mAllocPrev = result;
	}
	mAllocatedTextures = result;

	return result;
}

void Graphics::Device::Destroy(Texture* buff) {
	glDeleteTextures(1, &buff->mId);

	if (buff->mAllocPrev != 0) { // Not head
		buff->mAllocPrev->mAllocNext = buff->mAllocNext;
		if (buff->mAllocNext != 0) {
			buff->mAllocNext->mAllocPrev = buff->mAllocPrev;
		}
	}
	else { // Head
		GraphicsDevAssert(buff == mAllocatedTextures);
		mAllocatedTextures = mAllocatedTextures->mAllocNext;
		if (mAllocatedTextures != 0) {
			mAllocatedTextures->mAllocPrev = 0;
		}
	}

	mPlatform.Release(buff);
}


Graphics::Shader* Graphics::Device::CreateShader(const char* vertex, const char* fragment) {
	Graphics::Shader* result = 0;

	Graphics::Internal::ShaderCompileResult compileStatus =
	Graphics::Internal::CompileOpenGLShader(vertex, fragment, &mPlatform);

	if (compileStatus.success) {
		result = (Graphics::Shader*)mPlatform.Request(sizeof(Graphics::Shader));
		result->mProgram = compileStatus.program;
	}
	GraphicsDevAssert(compileStatus.success);

	result->mUserData = 0;
	result->mOwner = this;
	result->mAllocPrev = 0;
	result->mAllocNext = mAllocatedShaders;
	if (mAllocatedShaders != 0) {
		mAllocatedShaders->mAllocPrev = result;
	}
	mAllocatedShaders = result;


	return result;
}

void Graphics::Device::Destroy(Shader* shader) {
	glUseProgram(0);
	glDeleteProgram(shader->mProgram);
	shader->mProgram = 0;

	if (shader->mAllocPrev != 0) { // Not head
		shader->mAllocPrev->mAllocNext = shader->mAllocNext;
		if (shader->mAllocNext != 0) {
			shader->mAllocNext->mAllocPrev = shader->mAllocPrev;
		}
	}
	else { // Head
		GraphicsDevAssert(shader == mAllocatedShaders);
		mAllocatedShaders = mAllocatedShaders->mAllocNext;
		if (mAllocatedShaders != 0) {
			mAllocatedShaders->mAllocPrev = 0;
		}
	}

	mPlatform.Release(shader);
}

void Graphics::Device::SetRenderTarget(FrameBuffer* frameBuffer) {
	const unsigned int attachments[8] = { 
		GL_COLOR_ATTACHMENT0, 
		GL_COLOR_ATTACHMENT1,
		GL_COLOR_ATTACHMENT2,
		GL_COLOR_ATTACHMENT3,
		GL_COLOR_ATTACHMENT4,
		GL_COLOR_ATTACHMENT5,
		GL_COLOR_ATTACHMENT6,
		GL_COLOR_ATTACHMENT7,
	};
	const unsigned int back_attach[1] = { 
		GL_BACK,
	};
	if (frameBuffer != 0) {
		glBindFramebuffer(GL_FRAMEBUFFER, frameBuffer->mId);
		unsigned int numAttachments = frameBuffer->mNumRenderTargets;
		GraphicsDevAssert(numAttachments >= 1);
		glDrawBuffers(numAttachments, attachments);
	}
	else { // TODO: Made because of JS change, needs testing
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
		glDrawBuffers(1, back_attach);
	}
}


void Graphics::Device::Bind(Shader* shader) {
	{ // RESET
		for (u32 i = 0; i < 32; ++i) {
			// Unbind any previously bound attributes
			if (mEnabledVertexAttribPointers & (1U << i)) {
				glDisableVertexAttribArray(i);
				mEnabledVertexAttribPointers &= ~(1U << i);
			}

			// Unbind any previously bound textures
			if (mEnabledTextureUnits & (1U << i)) {
				glActiveTexture(Internal::GetTextureUnit(i));
				glBindTexture(GL_TEXTURE_2D, 0);
				glBindTexture(GL_TEXTURE_CUBE_MAP, 0);
				glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, 0);

				mEnabledTextureUnits &= ~(1U << i);
			}
		}
		glActiveTexture(GL_TEXTURE0);
		
		// Unbind any previously bound index buffer
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
		mIndexBufferBound = false;
	}

	u32 program = 0;
	if (shader != 0) {
		program = shader->mProgram;
	}
	
	glUseProgram(program);
}

void Graphics::Device::Bind(Buffer& indexBuffer, BufferType indexBufferType) {
	GraphicsDevAssert(indexBuffer.mIndexBuffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexBuffer.mId);
	mIndexBufferBound = true;
	mIndexBufferType = indexBufferType;
	GraphicsDevAssert(indexBufferType == BufferType::UInt32 ||
		indexBufferType == BufferType::UInt16 ||
		indexBufferType == BufferType::UInt8);
				   
}

void Graphics::Device::Bind(Index& slot, Buffer& buffer, const BufferView& view, u32 instanceDivisor) {
	GraphicsDevAssert(slot.valid);
	GraphicsDevAssert(!buffer.mIndexBuffer);
	GLenum type = Internal::BufferTypeToEnum(view.Type);

	glBindBuffer(GL_ARRAY_BUFFER, buffer.mId);
	glVertexAttribPointer(slot.id, view.NumberOfComponents, type, GL_FALSE, view.StrideInBytes, (void*)view.DataOffsetInBytes);
	glEnableVertexAttribArray(slot.id);
	// glVertexAttribPointer: The bound buffer is now the source of the current attribute
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glVertexAttribDivisor(slot.id, instanceDivisor);

	// Track vertex attribs (slot.id) in mEnabledVertexAttribPointers
	GraphicsDevAssert(slot.id < 32);
	u32 bit = slot.id % 32;
	mEnabledVertexAttribPointers |= (1U << bit);
}

void Graphics::Device::Bind(Index& slot, UniformType type, void* data, u32 count) {
	GraphicsDevAssert(slot.valid);

	if (type == UniformType::Int1) {
		glUniform1iv(slot.id, count, (const GLint*)data);
	}
	else if (type == UniformType::Int2) {
		glUniform2iv(slot.id, count, (const GLint*)data);
	}
	else if (type == UniformType::Int3) {
		glUniform3iv(slot.id, count, (const GLint*)data);
	}
	else if (type == UniformType::Int4) {
		glUniform4iv(slot.id, count, (const GLint*)data);
	}
	else if (type == UniformType::Float1) {
		glUniform1fv(slot.id, count, (GLfloat*)data);
	}
	else if (type == UniformType::Float2) {
		glUniform2fv(slot.id, count, (GLfloat*)data);
	}
	else if (type == UniformType::Float3) {
		glUniform3fv(slot.id, count, (GLfloat*)data);
	}
	else if (type == UniformType::Float4) {
		glUniform4fv(slot.id, count, (GLfloat*)data);
	}
	else if (type == UniformType::Float9) {
		glUniformMatrix3fv(slot.id, count, GL_FALSE, (GLfloat*)data);
	}
	else if (type == UniformType::Float16) {
		glUniformMatrix4fv(slot.id, count, GL_FALSE, (GLfloat*)data);
	}
}

void Graphics::Device::Bind(Index& uniformSlot, Texture& texture, Sampler& sampler) {
	GraphicsDevAssert(uniformSlot.valid);

	GLenum min = GL_NEAREST;
	GLenum mag = GL_LINEAR;

	if (texture.mIsMipMapped) {
		if (sampler.min == Filter::Nearest) {
			if (sampler.mip == Filter::Nearest) {
				min = GL_NEAREST_MIPMAP_NEAREST;
			}
			else {
				min = GL_NEAREST_MIPMAP_LINEAR;
			}
		}
		else {
			if (sampler.mip == Filter::Nearest) {
				min = GL_LINEAR_MIPMAP_NEAREST;
			}
			else {
				min = GL_LINEAR_MIPMAP_LINEAR;
			}
		}
	}
	else {
		if (sampler.min == Filter::Linear) {
			min = GL_LINEAR;
		}
	}

	if (sampler.mag == Filter::Nearest) {
		mag = GL_NEAREST;
	}

	GLenum wrapS = GL_REPEAT;
	GLenum wrapT = GL_REPEAT;
	GLenum wrapR = GL_REPEAT;

	if (sampler.wrapS == WrapMode::Clamp) {
		wrapS = GL_CLAMP_TO_EDGE;
	}

	if (sampler.wrapT == WrapMode::Clamp) {
		wrapT = GL_CLAMP_TO_EDGE;
	}

	if (sampler.wrapR == WrapMode::Clamp) {
		wrapR = GL_CLAMP_TO_EDGE;
	}

	GLenum target = GL_TEXTURE_2D;
	if (texture.mIsCubeMap) {
		target = GL_TEXTURE_CUBE_MAP;
	}
	if (texture.mIsMultiSampled) {
		target = GL_TEXTURE_2D_MULTISAMPLE;
	}

	// Find texture unit
	u32 textureUnit = Internal::FindFirstEnabled(mEnabledTextureUnits);
	mEnabledTextureUnits |= (1U << textureUnit);
	GraphicsDevAssert(textureUnit <= 16);
	glActiveTexture(Internal::GetTextureUnit(textureUnit));
	glBindTexture(target, texture.mId);

	// Set min and mag filter
	glTexParameteri(target, GL_TEXTURE_MIN_FILTER, min);
	glTexParameteri(target, GL_TEXTURE_MAG_FILTER, mag);

	// Set Wrap Mode
	glTexParameteri(target, GL_TEXTURE_WRAP_S, wrapS);
	glTexParameteri(target, GL_TEXTURE_WRAP_T, wrapT);
	if (texture.mIsCubeMap) {
		glTexParameteri(target, GL_TEXTURE_WRAP_R, wrapR);
	}

	glUniform1i(uniformSlot.id, textureUnit);
}

void Graphics::Device::Draw(DrawMode drawMode, u32 startIndex, u32 indexCount, u32 instanceCount) {
	if (mIndexBufferBound) {
		GLenum type = Internal::BufferTypeToEnum(mIndexBufferType);
		if (instanceCount <= 1) {
			glDrawElements(Internal::DrawModeToEnum(drawMode), indexCount, type, (void*)startIndex);
		}
		else {
			glDrawElementsInstanced(Internal::DrawModeToEnum(drawMode), indexCount, type, (void*)startIndex, instanceCount);
		}
	}
	else {
		if (instanceCount <= 1) {
			glDrawArrays(Internal::DrawModeToEnum(drawMode), startIndex, indexCount);
		}
		else {
			glDrawArraysInstanced(Internal::DrawModeToEnum(drawMode), startIndex, indexCount, instanceCount);
		}
	}
}

void Graphics::Device::EnableDepthMask() {
	glDepthMask(GL_TRUE);
	mDepthMaskEnabled = true;
}

void Graphics::Device::DisableDepthMask() {
	glDepthMask(GL_FALSE);
	mDepthMaskEnabled = false;
}

Graphics::Device* Graphics::Initialize(Device& outDevice, Dependencies& alloc) {
	outDevice.mPlatform = alloc;
	outDevice.mEnabledVertexAttribPointers = 0;
	outDevice.mEnabledTextureUnits = 0;
	outDevice.mIndexBufferBound = false;
	outDevice.mDepthMaskEnabled = true;
	outDevice.mIndexBufferType = BufferType::Float32; // Something invalid
	outDevice.mDepthState = Graphics::DepthTestState::Off;
	outDevice.mSourceBlendFactor = BlendFunction::Off;
	outDevice.mDestBlendFactor = BlendFunction::Off;
	outDevice.mFaceCulling = FaceCull::Back;
	outDevice.mWindingOrder = FaceWind::CounterClockwise;
	outDevice.mUserData = 0;
	outDevice.mAllocatedTextures = 0;
	outDevice.mAllocatedBuffers = 0;
	outDevice.mAllocatedShaders = 0;
	outDevice.mAllocatedFrameBuffers = 0;

	glGenVertexArrays(1, &outDevice.mGlobalVertexArrayObject);
	glBindVertexArray(outDevice.mGlobalVertexArrayObject);
	glDisable(GL_DEPTH_TEST);
	glDepthMask(GL_TRUE);
	glDisable(GL_BLEND);
	glEnable(GL_MULTISAMPLE);

	return &outDevice;
}

void Graphics::Shutdown(Device& device) {
	device.Bind(0);
	glBindVertexArray(0);
	glDeleteVertexArrays(1, &device.mGlobalVertexArrayObject);

	device.mPlatform.Request = 0;
	device.mPlatform.Release = 0;
	device.mEnabledVertexAttribPointers = 0;
}
// Shader

Graphics::Index Graphics::Shader::GetAttribute(const char* name) {
	GLint location = glGetAttribLocation(mProgram, name);
	Index result;
	result.id = 0;
	result.valid = false;

	if (location >= 0) {
		result.id = location;
		result.valid = true;
	}

	return result;
}

Graphics::Index Graphics::Shader::GetUniform(const char* name) {
	GLint location = glGetUniformLocation(mProgram, name);
	Index result;
	result.id = 0;
	result.valid = false;

	if (location >= 0) {
		result.id = location;
		result.valid = true;
	}

	GraphicsCompAssert(result.valid);

	return result;
}


/// Buffer

void Graphics::Buffer::Set(void* inputArray, u32 arraySizeInBytes, bool _static) {
	if (mIndexBuffer) {
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mId);
		glBufferData(GL_ELEMENT_ARRAY_BUFFER, arraySizeInBytes, inputArray, GL_STATIC_DRAW);
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
	}
	else {
		glBindBuffer(GL_ARRAY_BUFFER, mId);
		glBufferData(GL_ARRAY_BUFFER, arraySizeInBytes, inputArray, _static? GL_STATIC_DRAW : GL_DYNAMIC_DRAW);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
	}
}

void Graphics::Buffer::Reset() {
	glDeleteBuffers(1, &mId);
	glGenBuffers(1, &mId);
}

void Graphics::FrameBuffer::EnableColor() {
	glBindFramebuffer(GL_FRAMEBUFFER, mId);
	glDrawBuffer(GL_COLOR_ATTACHMENT0);
	glReadBuffer(GL_FRONT);
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
}


void Graphics::FrameBuffer::DisableColor() {
	glBindFramebuffer(GL_FRAMEBUFFER, mId);
	glDrawBuffer(GL_COLOR_ATTACHMENT0);
	glReadBuffer(GL_NONE);
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

/// Frame Buffer
void Graphics::FrameBuffer::AttachColor(Texture& color, u32 attachmentIndex) {
	bool isValid = !(color.mTextureFormat == TextureFormat::Depth32 || color.mTextureFormat == TextureFormat::Uninitialized);
	GraphicsCompAssert(isValid);
	GraphicsCompAssert(!color.mIsMipMapped);

	if (attachmentIndex > 7) { // Limit to 8 color attachments
		attachmentIndex = 7;
	}

	GLenum attachTarget = GL_TEXTURE_2D;
	if (color.mIsCubeMap) {
		attachTarget = GL_TEXTURE_CUBE_MAP;
	}
	if (color.mIsMultiSampled) {
		attachTarget = GL_TEXTURE_2D_MULTISAMPLE;
	}

	glBindFramebuffer(GL_FRAMEBUFFER, mId);
	if (mHasColor == 2) {
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, 0);
		glDeleteRenderbuffers(1, &mColorRenderBufferObject);
		mColorRenderBufferObject = 0;
	}
	glBindTexture(attachTarget, color.mId);
	glTexParameteri(attachTarget, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(attachTarget, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glBindTexture(attachTarget, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + attachmentIndex, attachTarget, color.mId, 0);
	
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	mAttachedColor = &color;
	mHasColor = 1;
	mWidth = color.GetWidth();
	mHeight = color.GetHeight();

	if (attachmentIndex + 1 > mNumRenderTargets) {
		mNumRenderTargets = attachmentIndex + 1;
	}
}

void Graphics::FrameBuffer::AttachDepth(Texture& depth) {
	bool isValid = depth.mTextureFormat == TextureFormat::Depth32;
	GraphicsCompAssert(isValid);
	GraphicsCompAssert(!depth.mIsMipMapped);

	GLenum attachTarget = GL_TEXTURE_2D;
	if (depth.mIsCubeMap) {
		attachTarget = GL_TEXTURE_CUBE_MAP;
	}
	if (depth.mIsMultiSampled) {
		attachTarget = GL_TEXTURE_2D_MULTISAMPLE;
	}

	glBindFramebuffer(GL_FRAMEBUFFER, mId);
	if (mHasDepth == 2) {
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, 0);
		glDeleteRenderbuffers(1, &mDepthRenderBufferObject);
		mDepthRenderBufferObject = 0;
	}
	glBindTexture(attachTarget, depth.mId);
	glTexParameteri(attachTarget, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(attachTarget, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glBindTexture(attachTarget, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, attachTarget, depth.mId, 0);
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	mAttachedDepth = &depth;
	mHasDepth = 1;
	mWidth = depth.GetWidth();
	mHeight = depth.GetHeight();
}

bool Graphics::FrameBuffer::IsValid() {
	glBindFramebuffer(GL_FRAMEBUFFER, mId);
	bool result = glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE;
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	return result;
}

void Graphics::FrameBuffer::ResolveTo(FrameBuffer* target, Filter filter, bool color, bool depth, u32 x0, u32 y0, u32 x1, u32 y1, u32 x2, u32 y2, u32 x3, u32 y3) {
	u32 targetId = 0;
	u32 targetHasColor = true;
	u32 targetHasDepth = true;
	if (target != 0) {
		targetId = target->mId;
		targetHasColor = target->mHasColor != 0;
		targetHasDepth = target->mHasDepth != 0;
	}

	GLbitfield mask = 0;
	if (mHasColor != 0 && targetHasColor && color) {
		mask |= GL_COLOR_BUFFER_BIT;
	}
	if (mHasDepth != 0 && targetHasDepth && depth) {
		mask |= GL_DEPTH_BUFFER_BIT;
	}

	GLenum gl_filter = GL_NEAREST;
	if (filter == Filter::Linear) {
		gl_filter = GL_LINEAR;
	}

	glBindFramebuffer(GL_READ_FRAMEBUFFER, mId);
	glBindFramebuffer(GL_DRAW_FRAMEBUFFER, targetId);
	glBlitFramebuffer(x0, y0, x1, y1, x2, y2, x3, y3, mask, gl_filter);
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void Graphics::FrameBuffer::ResolveTo(FrameBuffer* target, Filter filter, bool color, bool depth) {
	u32 width = mWidth;
	u32 height = mHeight;

	if (target != 0) {
		if (target->mWidth < mWidth) {
			width = target->mWidth;
		}
		if (target->mHeight < mHeight) {
			height = target->mHeight;
		}
	}

	ResolveTo(target, filter, color, depth, 0, 0, width, height, 0, 0, width, height);
}

void Graphics::FrameBuffer::Resize(u32 width, u32 height) {
	if (mHasColor == 1) {
		mAttachedColor->Set(0, width, height, TextureFormat::RGBA, false);
	}
	else if (mHasColor == 2) {
		glBindFramebuffer(GL_FRAMEBUFFER, mId);
		glBindRenderbuffer(GL_RENDERBUFFER, mColorRenderBufferObject);
		glRenderbufferStorage(GL_RENDERBUFFER, GL_RGBA, width, height);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, mColorRenderBufferObject);
		glBindRenderbuffer(GL_RENDERBUFFER, 0);
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}

	if (mHasDepth == 1) {
		mAttachedDepth->Set(0, width, height, TextureFormat::Depth32, false);
	}
	else if (mHasDepth == 2) {
		glBindFramebuffer(GL_FRAMEBUFFER, mId);
		glBindRenderbuffer(GL_RENDERBUFFER, mDepthRenderBufferObject);
		glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, width, height);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, mDepthRenderBufferObject);
		glBindRenderbuffer(GL_RENDERBUFFER, 0);
		glBindFramebuffer(GL_FRAMEBUFFER, 0);
	}
}