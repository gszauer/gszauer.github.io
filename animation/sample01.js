function Sample01(gl, canvas) {
	Sample.call(this, gl, canvas);
	
	this.mShader = null;
	this.mVertexPositions = null;
	this.mVertexNormals = null;
	this.mVertexTexCoords = null;
	this.mIndexBuffer = null;
	this.mDisplayTexture = null;
	this.mRotation = 0.0;

	this.mAttribPos = null;
	this.mAttribNorm = null;
	this.mAttribUV = null;
	this.mUniformModel = null;
	this.mUniformMVP = null;
	//this.mUniformLight = null;
	this.mUniformTex = null;

	this.mDebugName = "Sample01";
}
Sample01.prototype = Object.create(Sample.prototype);
Sample01.prototype.constructor = Sample01;

Sample01.prototype.Initialize = function (gl) {
	this.mRotation = 0.0;
	this.mShader = LoadShaderFromFile(gl, "static.vert", "lit.frag");
	this.mDisplayTexture = LoadTextureFromFile(gl, "uv.png");
}

Sample01.prototype.Load = function(gl) {
	if (ShaderIsDoneLoading(gl, this.mShader) && TextureIsDoneLoading(gl, this.mDisplayTexture)) {
		this.mAttribPos = ShaderGetAttribute(gl, this.mShader, "position");
		this.mAttribNorm= ShaderGetAttribute(gl, this.mShader, "normal");
		this.mAttribUV= ShaderGetAttribute(gl, this.mShader, "texCoord");
		this.mUniformModel = ShaderGetUniform(gl, this.mShader, "model");
		this.mUniformMVP = ShaderGetUniform(gl, this.mShader, "mvp");
		//this.mUniformLight = ShaderGetUniform(gl, this.mShader, "light");
		this.mUniformTex = ShaderGetUniform(gl, this.mShader, "tex0");

		this.mVertexPositions = MakeAttribute(gl);
		this.mVertexNormals = MakeAttribute(gl);
		this.mVertexTexCoords = MakeAttribute(gl);
		this.mIndexBuffer = MakeIndexBuffer(gl);

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

		let indexBuffer = new Uint32Array(6); // 6 indices
		indexBuffer[0] = 0; indexBuffer[1] = 1; indexBuffer[2] = 2;
		indexBuffer[3] = 2; indexBuffer[4] = 1; indexBuffer[5] = 3;

		AttributeVec3(gl, this.mVertexPositions, positionBuffer);
		AttributeVec3(gl, this.mVertexNormals, normalBuffer);
		AttributeVec2(gl, this.mVertexTexCoords, uvBuffer);
		IndexBufferData(gl, this.mIndexBuffer, indexBuffer);

		return true;
	}
	return false;
}

Sample01.prototype.Update = function(gl, deltaTime) {
	this.mRotation += deltaTime * 45.0;
	while (this.mRotation > 360.0) {
		this.mRotation -= 360.0;
	}
}

Sample01.prototype.Render = function(gl, aspectRatio) {
	let projection = m4_perspective(60.0, aspectRatio, 0.01, 1000.0);
	let view = m4_lookAt([0, 0, -5], [0, 0, 0], [0, 1, 0]);
	let model = q_toMat4(q_angleAxis(this.mRotation * QUAT_DEG2RAD, [0, 0, 1]));
	let mvp = m4_mul(m4_mul(projection, view), model);

	ShaderBind(gl, this.mShader);

	AttributeBind(gl, this.mVertexPositions, this.mAttribPos);
	AttributeBind(gl, this.mVertexNormals, this.mAttribNorm);
	AttributeBind(gl, this.mVertexTexCoords, this.mAttribUV);
	
	UniformMat4(gl, this.mUniformModel, model);
	UniformMat4(gl, this.mUniformMVP, mvp);
	
	//UniformVec3(gl, this.mUniformLight, [0, 0, 1]);
	TextureBind(gl, this.mDisplayTexture, this.mUniformTex, 0);

	Draw(gl, DRAW_MODE.TRIANGLES, this.mIndexBuffer);

	TextureUnbind(gl, 0);

	AttributeUnbind(gl, this.mVertexPositions, this.mAttribPos);
	AttributeUnbind(gl, this.mVertexNormals, this.mAttribNorm);
	AttributeUnbind(gl, this.mVertexTexCoords, this.mAttribUV);

	ShaderUnbind(gl);
}
