/*jshint esversion: 6 */
// Sample 02 shows that we can display a static mesh. 
//CPU skinning might be added later....
function Sample03(gl, canvas) {
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
	this.mUniformView = null;
	this.mUniformProj =null;
	this.mUniformLight = null;
	this.mUniformTex = null;

	this.mPoseUniforms = null;
	this.mInvUniforms = null;

	this.mDebugName = "Sample03";
}

Sample03.prototype = Object.create(Sample.prototype);
Sample03.prototype.constructor = Sample03;

Sample03.prototype.Initialize = function (gl) {
	this.mShader = LoadShaderFromFile(gl, "skinned.vert", "lit.frag");
	this.mDisplayTexture = LoadTextureFromFile(gl, "Woman.png");
	this.mWomanMesh = new Mesh(gl, "Woman.mesh");
	this.mWomanSkeleton = new Skeleton();
	this.mWomanSkeleton.LoadFromFile("Woman.skel");
	this.mWalkingClip = new Clip();
	this.mWalkingClip.LoadFromFile("Walk.anim");

};

Sample03.prototype.Load = function(gl) {
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

		this.mAttribPos = ShaderGetAttribute(gl, this.mShader, "position");
		this.mAttribNorm= ShaderGetAttribute(gl, this.mShader, "normal");
		this.mAttribUV= ShaderGetAttribute(gl, this.mShader, "texCoord");
		this.mAttribWeights = ShaderGetAttribute(gl, this.mShader, "weights");
		this.mAttribIndices = ShaderGetAttribute(gl, this.mShader, "joints");
		this.mUniformModel = ShaderGetUniform(gl, this.mShader, "model");
		this.mUniformView = ShaderGetUniform(gl, this.mShader, "view");
		this.mUniformProj = ShaderGetUniform(gl, this.mShader, "projection");
		this.mUniformLight = ShaderGetUniform(gl, this.mShader, "light");
		this.mUniformTex = ShaderGetUniform(gl, this.mShader, "tex0");

		if (this.mPosePalette.length != this.mInvBindPalette.length) {
			console.error("bad pose lengths");
		}

		let len = this.mPosePalette.length;
		this.mPoseUniforms = [];
		this.mInvUniforms = [];
		for (let i = 0; i < len; ++i) {
			this.mPoseUniforms.push(ShaderGetUniform(gl, this.mShader, "pose[" + i + "]"));
			this.mInvUniforms.push(ShaderGetUniform(gl, this.mShader, "invBindPose[" + i + "]"));
		}

		this.mVertexPositions = MakeAttribute(gl);
		this.mVertexNormals = MakeAttribute(gl);
		this.mVertexTexCoords = MakeAttribute(gl);
		this.mIndexBuffer = MakeIndexBuffer(gl);

		return true;
	}
	return false;
};

Sample03.prototype.Update = function(gl, deltaTime) {
	this.mWomanPlaybackTime = this.mWalkingClip.Sample(this.mWomanAnimatedPose, this.mWomanPlaybackTime + deltaTime);
	this.mWomanAnimatedPose.GetMatrixPalette(this.mPosePalette);
};

Sample03.prototype.Render = function(gl, aspectRatio) {
	let projection = m4_perspective(60.0, aspectRatio, 0.01, 1000.0);
	let view = m4_lookAt([0, 5, 7], [0, 3, 0], [0, 1, 0]);
	let model = m4_identity();

	ShaderBind(gl, this.mShader);

	UniformMat4(gl, this.mUniformModel, model);
	UniformMat4(gl, this.mUniformView, view);
	UniformMat4(gl, this.mUniformProj, projection);

	let size = this.mPosePalette.length;
	for (let i = 0; i < size; ++i) {
		UniformMat4(gl, this.mPoseUniforms[i], this.mPosePalette[i]);
		UniformMat4(gl, this.mInvUniforms[i], this.mInvBindPalette[i]);
	}
	
	UniformVec3(gl, this.mUniformLight, [0, 0, 1]);
	TextureBind(gl, this.mDisplayTexture, this.mUniformTex, 0);

	this.mWomanMesh.Bind(this.mAttribPos, this.mAttribNorm, this.mAttribUV, this.mAttribWeights, this.mAttribIndices);
	this.mWomanMesh.Draw();
	this.mWomanMesh.UnBind(this.mAttribPos, this.mAttribNorm, this.mAttribUV, this.mAttribWeights, this.mAttribIndices);

	TextureUnbind(gl, 0);

	ShaderUnbind(gl);
};