/*jshint esversion: 6 */
// Sample 02 shows that we can display a static mesh. 
//CPU skinning might be added later....
function Sample04(gl, canvas) {
	Sample.call(this, gl, canvas);

	this.mWomanMesh = null;
	this.mWomanTexture = null;

	this.mWomanRestPose = null;
	this.mWomanBindPose = null;
	this.mWomanSkeleton = null;

	this.mWalkingClip = null;
	this.mWomanAnimatedPose = null;
	this.mWomanPlaybackTime = 0.0;

	this.mPosePalette = null;
	this.mInvBindPalette = null;

	this.mShader = null;
	
	this.mAttribPos = null;
	this.mAttribNorm = null;
	this.mAttribUV = null;
	this.mAttribWeights = null;
	this.mAttribIndices = null;

	this.mUniformModel = null;
	this.mUniformMVP = null;
	this.mUniformTex = null;
	this.mUniformPoseTex = null;
	this.mUniformNumBones = null;

	this.mBoneMatrixtexture = null;
	this.mBoneArray = null;

	this.mDebugName = "Sample04";
}

Sample04.prototype = Object.create(Sample.prototype);
Sample04.prototype.constructor = Sample04;

Sample04.prototype.Initialize = function (gl) {
	this.mShader = LoadShaderFromFile(gl, "tex_skinned.vert", "lit.frag");
	this.mDisplayTexture = LoadTextureFromFile(gl, "Woman.png");
	this.mWomanMesh = new Mesh(gl, "Woman.mesh");
	this.mWomanSkeleton = new Skeleton();
	this.mWomanSkeleton.LoadFromFile("Woman.skel");
	this.mWalkingClip = new Clip();
	this.mWalkingClip.LoadFromFile("Walk.anim");

};

Sample04.prototype.Load = function(gl) {
	if (ShaderIsDoneLoading(gl, this.mShader) && TextureIsDoneLoading(gl, this.mDisplayTexture) && this.mWomanMesh.IsLoaded() && this.mWomanSkeleton.IsLoaded() && this.mWalkingClip.IsLoaded()) {
		this.mWalkingClip.RecalculateDuration();
		this.mWomanMesh.UpdateOpenGLBuffers();

		this.mWomanRestPose = new Pose();
		this.mWomanRestPose.Copy(this.mWomanSkeleton.mRestPose);
		this.mWomanBindPose = new Pose();
		this.mWomanBindPose.Copy(this.mWomanSkeleton.mBindPose);
		this.mWomanAnimatedPose = new Pose();
		this.mWomanAnimatedPose.Copy(this.mWomanSkeleton.mRestPose);
		
		this.mWomanPlaybackTime = this.mWalkingClip.GetStartTime();
		this.mPosePalette = [];
		this.mInvBindPalette = [];
		this.mWomanAnimatedPose.GetMatrixPalette(this.mPosePalette);
		this.mInvBindPalette = this.mWomanSkeleton.GetInvBindPose();

		this.mBoneMatrixtexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.mBoneMatrixtexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		this.mAttribPos = ShaderGetAttribute(gl, this.mShader, "position");
		this.mAttribNorm= ShaderGetAttribute(gl, this.mShader, "normal");
		this.mAttribUV= ShaderGetAttribute(gl, this.mShader, "texCoord");
		this.mAttribWeights = ShaderGetAttribute(gl, this.mShader, "weights");
		this.mAttribIndices = ShaderGetAttribute(gl, this.mShader, "joints");
		this.mUniformModel = ShaderGetUniform(gl, this.mShader, "model");
		this.mUniformMVP = ShaderGetUniform(gl, this.mShader, "mvp");
		this.mUniformTex = ShaderGetUniform(gl, this.mShader, "tex0");
		this.mUniformPoseTex = ShaderGetUniform(gl, this.mShader, "boneMatrixTexture");
		this.mUniformNumBones = ShaderGetUniform(gl, this.mShader, "numBones");

		if (this.mPosePalette.length != this.mInvBindPalette.length) {
			console.error("bad pose lengths");
		}
		this.mBoneArray = new Float32Array(this.mPosePalette.length * 16);
		
		this.mVertexPositions = MakeAttribute(gl);
		this.mVertexNormals = MakeAttribute(gl);
		this.mVertexTexCoords = MakeAttribute(gl);
		this.mIndexBuffer = MakeIndexBuffer(gl);


		return true;
	}
	return false;
};

Sample04.prototype.Update = function(gl, deltaTime) {
	this.mWomanPlaybackTime = this.mWalkingClip.Sample(this.mWomanAnimatedPose, this.mWomanPlaybackTime + deltaTime);
	this.mWomanAnimatedPose.GetMatrixPalette(this.mPosePalette);
	//this.mWomanMesh.CPUSkin(this.mWomanSkeleton, this.mWomanAnimatedPose);
	
	let numBones = this.mPosePalette.length;
	let bai = 0; // bone array index
	for (let i = 0; i < numBones; ++i) {
		let combined = m4_mul(this.mPosePalette[i], this.mInvBindPalette[i]);

		let mai = 0; // matrix array index
		this.mBoneArray[bai++] = combined[mai++]; // 1
		this.mBoneArray[bai++] = combined[mai++]; // 2
		this.mBoneArray[bai++] = combined[mai++]; // 3
		this.mBoneArray[bai++] = combined[mai++]; // 4
		this.mBoneArray[bai++] = combined[mai++]; // 5
		this.mBoneArray[bai++] = combined[mai++]; // 6
		this.mBoneArray[bai++] = combined[mai++]; // 7
		this.mBoneArray[bai++] = combined[mai++]; // 8
		this.mBoneArray[bai++] = combined[mai++]; // 9
		this.mBoneArray[bai++] = combined[mai++]; // 10
		this.mBoneArray[bai++] = combined[mai++]; // 11
		this.mBoneArray[bai++] = combined[mai++]; // 12
		this.mBoneArray[bai++] = combined[mai++]; // 13
		this.mBoneArray[bai++] = combined[mai++]; // 14
		this.mBoneArray[bai++] = combined[mai++]; // 15
		this.mBoneArray[bai++] = combined[mai++]; // 16
	}

	gl.bindTexture(gl.TEXTURE_2D, this.mBoneMatrixtexture);
	gl.texImage2D(
	    gl.TEXTURE_2D,
	    0,         // level
	    gl.RGBA,   // internal format
	    4,         // width 4 pixels, each pixel has RGBA so 4 pixels is 16 values
	    numBones,  // one row per bone
	    0,         // border
	    gl.RGBA,   // format
	    gl.FLOAT,  // type
	    this.mBoneArray);
};

Sample04.prototype.Render = function(gl, aspectRatio) {
	let projection = m4_perspective(60.0, aspectRatio, 0.01, 1000.0);
	let view = m4_lookAt([0, 5, 7], [0, 3, 0], [0, 1, 0]);
	let model = m4_identity();
	let mvp = m4_mul(m4_mul(projection, view), model);

	ShaderBind(gl, this.mShader);

	UniformMat4(gl, this.mUniformModel, model);
	UniformMat4(gl, this.mUniformMVP, mvp);
	UniformInt(gl, this.mUniformNumBones, this.mPosePalette.length);
	
	TextureBind(gl, this.mDisplayTexture, this.mUniformTex, 0);
	gl.activeTexture(gl.TEXTURE0 + 1);
	gl.bindTexture(gl.TEXTURE_2D, this.mBoneMatrixtexture);
	gl.uniform1i(this.mUniformPoseTex, 1);

	this.mWomanMesh.Bind(this.mAttribPos, this.mAttribNorm, this.mAttribUV, this.mAttribWeights, this.mAttribIndices);
	this.mWomanMesh.Draw();
	this.mWomanMesh.UnBind(this.mAttribPos, this.mAttribNorm, this.mAttribUV, this.mAttribWeights, this.mAttribIndices);

	gl.activeTexture(gl.TEXTURE0 + 1);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.activeTexture(gl.TEXTURE0);
	TextureUnbind(gl, 0);

	ShaderUnbind(gl);
};