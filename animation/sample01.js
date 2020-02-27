var gSample01 = {
	mShader: null,
	mVertexPositions: null,
	mVertexNormals: null,
	mVertexTexCoords: null,
	mIndexBuffer: null,
	mDisplayTexture: null,
	mRotation: 0.0,
	
	mAttribPos: null,
	mAttribNorm: null,
	mAttribUV: null,
	mUniformModel: null,
	mUniformView: null,
	mUniformProj: null,
	mUniformLight: null,
	mUniformTex: null,

	mIsRunning: false,
	mIsLoading: false,

	Initialize: function (gl, sample) {
		sample.gl = gl;
		sample.mIsRunning = false;
		sample.mIsLoading = true;

		sample.mRotation = 0.0;
		sample.mShader = LoadShaderFromFile(gl, "static.vert", "lit.frag");
		sample.mDisplayTexture = LoadTextureFromFile(gl, "uv.png");
	},

	Load: function(gl, sample) {
		if (!sample.mIsRunning && sample.mIsLoading) {
			if (ShaderIsDoneLoading(gl, sample.mShader) && TextureIsDoneLoading(gl, sample.mDisplayTexture)) {
				sample.mIsRunning = true;
				sample.mIsLoading = false;

				sample.mAttribPos = ShaderGetAttribute(gl, sample.mShader, "position");
				sample.mAttribNorm= ShaderGetAttribute(gl, sample.mShader, "normal");
				sample.mAttribUV= ShaderGetAttribute(gl, sample.mShader, "texCoord");
				sample.mUniformModel = ShaderGetUniform(gl, sample.mShader, "model");
				sample.mUniformView = ShaderGetUniform(gl, sample.mShader, "view");
				sample.mUniformProj = ShaderGetUniform(gl, sample.mShader, "projection");
				sample.mUniformLight = ShaderGetUniform(gl, sample.mShader, "light");
				sample.mUniformTex = ShaderGetUniform(gl, sample.mShader, "tex0");

				sample.mVertexPositions = MakeAttribute(gl);
				sample.mVertexNormals = MakeAttribute(gl);
				sample.mVertexTexCoords = MakeAttribute(gl);
				sample.mIndexBuffer = MakeIndexBuffer(gl);

				let positionBuffer = new Float32Array(4 * 3); // 4 vertices * 3 components / vertex
				positionBuffer[0] = -1; positionBuffer[1] = -1; positionBuffer[2] =  0;
				positionBuffer[3] = -1; positionBuffer[4] =  1; positionBuffer[5] =  0;
				positionBuffer[6] =  1; positionBuffer[7] = -1; positionBuffer[8] =  0;
				positionBuffer[9] =  1; positionBuffer[10] = 1; positionBuffer[11] = 0;

				let normalBuffer = new Float32Array(4 * 3); // 4 vertices * 3 components / vertex
				normalBuffer[0] = 0; normalBuffer[1] = 0; normalBuffer[2] = 1;
				normalBuffer[3] = 0; normalBuffer[4] = 0; normalBuffer[5] = 1;
				normalBuffer[6] = 0; normalBuffer[7] = 0; normalBuffer[8] = 1;
				normalBuffer[9] = 0; normalBuffer[10] =0; normalBuffer[11] =1;

				let uvBuffer = new Float32Array(4 * 2); // 4 vertices * 2 components / vertex
				uvBuffer[0] = 0; uvBuffer[1] = 0;
				uvBuffer[2] = 0; uvBuffer[3] = 1;
				uvBuffer[4] = 1; uvBuffer[5] = 0;
				uvBuffer[6] = 1; uvBuffer[7] = 1;

				let indexBuffer = new Int32Array(6); // 6 indices
				indexBuffer[0] = 0; indexBuffer[1] = 1; indexBuffer[2] = 2;
				indexBuffer[3] = 2; indexBuffer[4] = 1; indexBuffer[5] = 3;

				AttributeVec3(gl, sample.mVertexPositions, positionBuffer);
				AttributeVec3(gl, sample.mVertexNormals, normalBuffer);
				AttributeVec2(gl, sample.mVertexTexCoords, uvBuffer);
				IndexBufferData(gl, sample.mIndexBuffer, indexBuffer);
			}
		}
	},

	Update: function(gl, sample, deltaTime) {
		if (!sample.mIsRunning) {
			// Loading
		}
		else {
			sample.mRotation += deltaTime * 45.0;
			while (sample.mRotation > 360.0) {
				sample.mRotation -= 360.0;
			}
		}
	},

	Render: function(gl, sample, aspectRatio) {
		gl.clearColor(0.5, 0.6, 0.7, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if (!sample.mIsRunning) {
			// Loading
		}
		else {
			let projection = m4_perspective(60.0, aspectRatio, 0.01, 1000.0);
			let view = m4_lookAt([0, 0, -5], [0, 0, 0], [0, 1, 0]);

			let model = q_toMat4(q_angleAxis(sample.mRotation * QUAT_DEG2RAD, [0, 0, 1]));

			ShaderBind(gl, sample.mShader);

			AttributeBind(gl, sample.mVertexPositions, sample.mAttribPos);
			AttributeBind(gl, sample.mVertexNormals, sample.mAttribNorm);
			AttributeBind(gl, sample.mVertexTexCoords, sample.mAttribUV);
			
			UniformMat4(gl, sample.mUniformModel, model);
			UniformMat4(gl, sample.mUniformView, view);
			UniformMat4(gl, sample.mUniformProj, projection);
			
			UniformVec3(gl, sample.mUniformLight, [0, 0, 1]);
			TextureBind(gl, sample.mDisplayTexture, sample.mUniformTex, 0);

			Draw(gl, DRAW_MODE.TRIANGLES, sample.mIndexBuffer);

			TextureUnbind(gl, 0);

			AttributeUnbind(gl, sample.mVertexPositions, sample.mAttribPos);
			AttributeUnbind(gl, sample.mVertexNormals, sample.mAttribNorm);
			AttributeUnbind(gl, sample.mVertexTexCoords, sample.mAttribUV);

			ShaderUnbind(gl);
		}
	},

	mLastDesiredWidth: 0,
	mLastDesiredHeight: 0 ,
	mLastCanvasStyleWidth: 0,
	mLastCanvasStyleHeight: 0,

	Loop: function(gl, sample, deltaTime) {		
		let resize = false;
		let desiredCSSWidth = gl.canvas.clientWidth;
		let desiredCSSHeight = gl.canvas.clientHeight;

		if (desiredCSSWidth != sample.mLastDesiredWidth || desiredCSSHeight != sample.mLastDesiredHeight) {
			resize = true;
		}
		if (sample.mLastCanvasStyleWidth != Math.floor(desiredCSSWidth  * devicePixelRatio)) {
			resize = true;
		}
		if (sample.mLastCanvasStyleHeight != Math.floor(desiredCSSHeight * devicePixelRatio)) {
			resize = true
		}

		if (resize) {
			let devicePixelRatio = window.devicePixelRatio || 1;

			gl.canvas.width  = Math.floor(desiredCSSWidth  * devicePixelRatio);
			gl.canvas.height = Math.floor(desiredCSSHeight * devicePixelRatio);

			gl.canvas.style.width  = desiredCSSWidth  + "px";
			gl.canvas.style.height = desiredCSSHeight + "px";

			sample.mLastCanvasStyleWidth = gl.canvas.width;
			sample.mLastCanvasStyleHeight = gl.canvas.height;

			gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		}
		sample.mLastDesiredWidth = desiredCSSWidth;
		sample.mLastDesiredHeight = desiredCSSHeight;
		
		let aspectRatio = desiredCSSWidth / desiredCSSHeight;

		sample.Load(gl, sample);
		sample.Update(gl, sample, deltaTime);
		sample.Render(gl, sample, aspectRatio);
	}
};