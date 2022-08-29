#pragma once

typedef unsigned int u32;
typedef int i32;
typedef float f32;

namespace Graphics {
	// The only external dependancy is memory allocation
	typedef void* (*fpRequest)(u32 bytes);
	typedef void (*fpRelease)(void* mem);
	typedef void (*fpAssert)(bool cond);

	// TODO: Spector.js type of state management.
	// TODO: Add CaptureStart & CaptureEnd API's for Spector.js like tracking

	struct Dependencies {
		fpRequest Request;
		fpRelease Release;
		fpAssert Assert;

		inline Dependencies() {
			Request = 0;
			Release = 0;
			Assert = 0;
		}
	};

	class Buffer;
	class Shader;
	class Device;
	class Texture; 
	class FrameBuffer;

	enum class Filter {
		Nearest = 0,
		Linear = 1
	};

	enum class WrapMode {
		Repeat = 0,
		Clamp = 1
	};

	enum class DepthTestState {
		Off = 0,
		Always = 1,
		Never = 2,
		Less = 3,
		Equal = 4,
		LEqual = 5,
		Greater = 6,
		GEqual = 7,
		NotEqual = 8
	};

	enum class DrawMode {
		Points = 0,
		Lines = 1,
		LineStrip = 2,
		Triangles = 3,
		TriangleStrip = 4,
		TriangleFan = 5
	};

	enum class BufferType {
		Float32 = 0,
		Int8 = 1,
		UInt8 = 2,
		Int16 = 3,
		UInt16 = 4,
		Int32 = 5,
		UInt32 = 6
	};

	enum class UniformType {
		Int1 = 0,
		Int2 = 1,
		Int3 = 2,
		Int4 = 3,
		Float1 = 4,
		Float2 = 5,
		Float3 = 6,
		Float4 = 7,
		Float9 = 8,
		Float16 = 9
	};

	enum class BlendFunction {
		Off = 0,
		Zero = 1, 
		One = 2, 
		SrcColor = 3, 
		OneMinusSrcColor = 4, 
		DstColor = 5, 
		OneMinusDstColor = 6, 
		SrcAlpha = 7, 
		OneMinusSrcAlpha = 8, 
		DstAlpha = 9, 
		OneMinusDstAlpha = 10, 
		ConstColor = 11, 
		OneMinusConstColor = 12, 
		ConstAlpha = 13, 
		OneMinusconstAlpha = 14, 
		SrcAlphaSaturate = 15, 
	};

	enum class FaceCull {
		Off = 0,
		Back = 1, // Default
		Front = 2,
		FrontAndBack = 3
	};

	enum class FaceWind {
		CounterClockwise = 0, // Default
		Clockwise = 1
	};

	enum class TextureFormat {
		Uninitialized = 0,
		Depth32 = 1,
		// TODO: Needs Depth16 for WebGL
		R = 2,
		RG = 3,
		RGB = 4,
		RGBA = 5,
		SRGB = 6,
		SRGBA = 7,
		RGBA16F = 8,
		RGBA32F = 9,
		Float16 = 10,
		Float32 = 11
	};

	struct Index { // Uniform / Attribute Index
		u32 id;
		bool valid;

		inline Index(u32 _id = 0, bool _valid = false) {
			id = _id;
			valid = _valid;
		}
	};

	struct Sampler {
		WrapMode wrapS;
		WrapMode wrapT;
		WrapMode wrapR; // Only used for cubemaps
		Filter min; // Downscale
		Filter mip; // Mipmap transition
		Filter mag; // Upscale

		inline Sampler(WrapMode _wrapS = WrapMode::Repeat, WrapMode _wrapT = WrapMode::Repeat, WrapMode _wrapR = WrapMode::Repeat, Filter _min = Filter::Linear, Filter _mip = Filter::Linear, Filter _mag = Filter::Linear) {
			wrapS = _wrapS;
			wrapT = _wrapT;
			wrapR = _wrapR;
			min = _min;
			mip = _mip;
			mag = _mag;
		}

		inline Sampler(Filter _min, Filter _mip = Filter::Linear, Filter _mag = Filter::Linear) {
			wrapS = WrapMode::Repeat;
			wrapT = WrapMode::Repeat;
			wrapR = WrapMode::Repeat;
			min = _min;
			mip = _mip;
			mag = _mag;
		}

		inline Sampler(WrapMode _wrap) {
			wrapS = _wrap;
			wrapT = _wrap;
			wrapR = _wrap;
			min = Filter::Linear;
			mip = Filter::Linear;
			mag = Filter::Linear;
		}
	};

	struct BufferView {
		u32 NumberOfComponents; // (1) float, (2) vec2, (3) vec3, (4) vec4
		u32 StrideInBytes;
		BufferType Type; // float or int
		u32 DataOffsetInBytes; // pointer argument to glVertexAttribLPointer

		inline BufferView(u32 _numberOfComponents = 0, u32 _strideInBytes = 0, BufferType _type = BufferType::Float32, u32 _dataOffsetInBytes = 0) {
			NumberOfComponents = _numberOfComponents;
			StrideInBytes = _strideInBytes;
			Type = _type;
			DataOffsetInBytes = _dataOffsetInBytes;
		}
	};

	class Texture {
		friend class Device;
		friend class FrameBuffer;
	protected:
		u32 mId;
		u32 mWidth;
		u32 mHeight;
		u32 mUserData;
		bool mIsMipMapped;
		bool mIsCubeMap;
		bool mIsMultiSampled;
		TextureFormat mTextureFormat;

		Texture* mAllocPrev;
		Texture* mAllocNext;
		Device* mOwner;
	private:
		Texture() = delete;
		~Texture() = delete;
		Texture(const Texture& other) = delete;
		Texture& operator=(const Texture& other) = delete;
	public:
		// DATA can be null if you just want to allocate
		// TODO: Make two set functions. One that takes data, and one that doesn't.
		// The one that takes data should be able to specify a source format.
		void Set(void* data, u32 width, u32 height, TextureFormat format, bool genMipMaps);
		void SetMultisampled(u32 width, u32 height, TextureFormat format, u32 samples);
		void SetCubemap(void* rightData, void* leftData, void* topData, void* bottomData, void* backData, void* frontData, 
			u32 width, u32 height, TextureFormat format, bool genMipMaps);

		inline u32 GetWidth() {
			return mWidth;
		}
		
		inline u32 GetHeight() {
			return mHeight;
		}

		inline TextureFormat GetFormat() {
			return mTextureFormat;
		}

		inline void SetUserData(u32 data) {
			mUserData = data;
		}

		inline u32 GetUserData() {
			return mUserData;
		}
	};

	class Buffer {
		friend class Device;
	protected:
		u32 mId;
		bool mIndexBuffer;
		u32 mUserData;

		Buffer* mAllocPrev;
		Buffer* mAllocNext;
		Device* mOwner;
	private:
		Buffer() = delete;
		Buffer(const Buffer&) = delete;
		Buffer& operator=(const Buffer&) = delete;
		~Buffer() = delete;
	public:
		void Set(void* inputArray, u32 arraySizeInBytes, bool _static = true);
		void Reset();

		inline void SetUserData(u32 data) {
			mUserData = data;
		}

		inline u32 GetUserData() {
			return mUserData;
		}

		inline bool IsIndexBuffer() {
			return mIndexBuffer;
		}
	};

	class Shader {
		friend class Device;
	protected:
		u32 mProgram;
		u32 mUserData;

		Shader* mAllocPrev;
		Shader* mAllocNext;
		Device* mOwner;
	private:
		Shader() = delete;
		Shader(const Shader&) = delete;
		Shader& operator=(const Shader&) = delete;
		~Shader() = delete;
	public:
		Index GetAttribute(const char* name);
		Index GetUniform(const char* name);

		inline void SetUserData(u32 data) {
			mUserData = data;
		}

		inline u32 GetUserData() {
			return mUserData;
		}
	};

	class FrameBuffer {
		friend class Device;
	protected:
		u32 mId;
		u32 mWidth;
		u32 mHeight;

		u32 mColorRenderBufferObject;
		u32 mDepthRenderBufferObject;

		Texture* mAttachedColor;
		Texture* mAttachedDepth;

		u32 mHasColor; // 0 = false, 1 = texture, 2 = buffer
		u32 mHasDepth;

		u32 mNumRenderTargets;
		u32 mUserData;

		FrameBuffer* mAllocPrev;
		FrameBuffer* mAllocNext;
		Device* mOwner;
	private:
		FrameBuffer() = delete;
		FrameBuffer(const FrameBuffer&) = delete;
		FrameBuffer& operator=(const FrameBuffer&) = delete;
		~FrameBuffer() = delete;
	public:
		void AttachColor(Texture& color, u32 attachmentIndex = 0);
		void AttachDepth(Texture& depth);
		
		inline void Attach(Texture& color, Texture& depth) {
			AttachColor(color, 0);
			AttachDepth(depth);
		}

		inline void ResetColorAttachmentCounter() {
			mNumRenderTargets = 1;
		}

		void EnableColor();
		void DisableColor();

		void Resize(u32 width, u32 height);
		bool IsValid();

		void ResolveTo(FrameBuffer* target, Filter filter, bool color, bool depth, u32 x0, u32 y0, u32 x1, u32 y1, u32 x2, u32 y2, u32 x3, u32 y3);
		void ResolveTo(FrameBuffer* target, Filter filter = Filter::Nearest, bool color = true, bool depth = true);

		inline void SetUserData(u32 data) {
			mUserData = data;
		}

		inline u32 GetUserData() {
			return mUserData;
		}
	};

	class Device {
		friend Device* Initialize(Device& outDevice, Dependencies& platform);
		friend void Shutdown(Device& device);
	protected:
		Dependencies mPlatform;
		u32 mEnabledVertexAttribPointers; // Up to 32 vertex attribs are tracked
		u32 mEnabledTextureUnits; // Up to 32 active texture units at a time
		u32 mGlobalVertexArrayObject;
		bool mIndexBufferBound;
		bool mDepthMaskEnabled;
		BufferType mIndexBufferType;
		DepthTestState mDepthState;
		BlendFunction mSourceBlendFactor;
		BlendFunction mDestBlendFactor;
		FaceCull mFaceCulling;
		FaceWind mWindingOrder;
		u32 mUserData;

		// Memory tracking
		Texture* mAllocatedTextures;
		Buffer* mAllocatedBuffers;
		Shader* mAllocatedShaders;
		FrameBuffer* mAllocatedFrameBuffers;
	private:
		Device() = delete;
		Device(const Device&) = delete;
		Device& operator=(const Device&) = delete;
		~Device() = delete;
	public:
		Shader* CreateShader(const char* vertex, const char* fragment);
		void Destroy(Shader* shader);

		Buffer* CreateBuffer();
		Buffer* CreateIndexBuffer();
		inline Buffer* CreateBuffer(void* array, u32 sizeInBytes, bool _static = true) {
			Buffer* result = CreateBuffer();
			result->Set(array, sizeInBytes, _static);
			return result;
		}
		inline Buffer* CreateIndexBuffer(void* array, u32 sizeInBytes, bool _static = true) {
			Buffer* result = CreateIndexBuffer();
			result->Set(array, sizeInBytes, _static);
			return result;
		}
		void Destroy(Buffer* buff);

		FrameBuffer* CreateFrameBuffer();
		FrameBuffer* CreateFrameBuffer(u32 width, u32 height);
		void Destroy(FrameBuffer* buffer);

		Texture* CreateTexture();
		inline Texture* CreateTexture(void* data, u32 width, u32 height, TextureFormat texFormat, bool genMipMaps) {
			Texture* result = CreateTexture();
			result->Set(data, width, height, texFormat, genMipMaps);
			return result;
		}
		void Destroy(Texture* buff);

		void Bind(Shader* shader); // Binds shader & allows for Bind(0)
		inline void Bind(Shader& shader) {
			Bind(&shader);
		}

		// Frame buffers should persist between Bind calls, even if null is bound
		void SetRenderTarget(FrameBuffer* frameBuffer);
		inline void SetRenderTarget(FrameBuffer& frameBuffer) {
			SetRenderTarget(&frameBuffer);
		}

		// Binds attributes to the currently bound shader
		// when a shader is unbound, all it's attached attributes
		// are un-bound with it
		void Bind(Index& slot, Buffer& buffer, const BufferView& view, u32 instanceDivisor = 0); // Binds attribute
		void Bind(Buffer& indexBuffer, BufferType indexType); // Binds ibo

		// There is no Uniform object, since there is no uniform state
		// You can bind one or an array of a uniform type
		// TODO: Remove the optional count paramater. It doesn't make sense in WebGL :(
		void Bind(Index& slot, UniformType type, void* data, u32 count = 1); // Binds uniform
		void Bind(Index& uniformSlot, Texture& texture, Sampler& sampler);

		// drawMode: what to draw
		// startIndex: offset at which to start drawing
		// indexCount: how many indices (or verts) to draw
		// instanceCount: how many instances to draw
		void Draw(DrawMode drawMode, u32 startIndex, u32 indexCount, u32 instanceCount = 1);
	public: // State management
		void SetDepthTest(DepthTestState state);
		inline DepthTestState GetDepthTest() {
			return mDepthState;
		}
		inline void EnableDepthTest() {
			SetDepthTest(DepthTestState::Less);
		}
		inline void DisableDepthTest() {
			SetDepthTest(DepthTestState::Off);
		}

		void EnableDepthMask();
		void DisableDepthMask();
		inline bool GetDepthMask() {
			return mDepthMaskEnabled;
		}

		void SetBlendFunction(BlendFunction sourceFactor, BlendFunction destFactor);
		inline BlendFunction GetBlendFunctionSourceFactor() {
			return mSourceBlendFactor;
		}
		inline BlendFunction GetBlendFunctionDestFactor() {
			return mDestBlendFactor;
		}

		void SetFaceVisibility(FaceCull cull, FaceWind wind = FaceWind::CounterClockwise);
		inline FaceCull GetFaceCullMode() {
			return mFaceCulling;
		}
		inline FaceWind GetWindingOrder() {
			return mWindingOrder;
		}

		void Clear(f32 r, f32 g, f32 b, f32 depth);
		void Clear(f32 r, f32 g, f32 b);
		void Clear(f32 depth);

		void SetMultiSample(bool state);
		void SetViewport(u32 x, u32 y, u32 w, u32 h);

		void SetScissor(u32 x, u32 y, u32 w, u32 h);
		void ClearScissor();

		inline void SetUserData(u32 data) {
			mUserData = data;
		}

		inline u32 GetUserData() {
			return mUserData;
		}

		inline Dependencies* GetPlatform() {
			return &mPlatform;
		}
	};

	Device* Initialize(Device& outDevice, Dependencies& platform);
	void Shutdown(Device& device);
}