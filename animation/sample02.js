/*jshint esversion: 6 */
// Sample 02 shows that we can display a static mesh. 
//CPU skinning might be added later....
function Sample02(gl, canvas) {
	Sample.call(this, gl, canvas);

	this.mWomanMesh = null;
	this.mWomanTexture = null;

	this.mWomanRestPose = null;
	this.mWomanBindPose = null;
	this.mWomanSkeleton = null;
	this.mWalkingClip = null;
	this.mWomanAnimatedPose = null;
	this.mWomanPlaybackTime = 0.0;

	this.mShader = null;
	this.mAttribPos = null;
	this.mAttribNorm = null;
	this.mAttribUV = null;
	this.mUniformModel = null;
	this.mUniformMVP = null;
	//this.mUniformLight = null;
	this.mUniformTex = null;

	this.mDebugName = "Sample02";
}

Sample02.prototype = Object.create(Sample.prototype);
Sample02.prototype.constructor = Sample02;

Sample02.prototype.Initialize = function (gl) {
	this.mShader = LoadShaderFromFile(gl, "static.vert", "lit.frag");
	this.mDisplayTexture = LoadTextureFromFile(gl, "Woman.png");
	this.mWomanMesh = new Mesh(gl, "Woman.mesh");
	this.mWomanSkeleton = new Skeleton();
	this.mWomanSkeleton.LoadFromFile("Woman.skel");
	this.mWalkingClip = new Clip();
	this.mWalkingClip.LoadFromFile("Walk.anim");

};

Sample02.prototype.Load = function(gl) {
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

		return true;
	}
	return false;
};

Sample02.prototype.Update = function(gl, deltaTime) {
	//deltaTime = 0.027;
	//this.mWomanPlaybackTime = 0.8460000000000106;
	this.mWomanPlaybackTime = this.mWalkingClip.Sample(this.mWomanAnimatedPose, this.mWomanPlaybackTime + deltaTime);
	this.mWomanMesh.CPUSkin(this.mWomanSkeleton, this.mWomanAnimatedPose);
};

Sample02.prototype.Render = function(gl, aspectRatio) {
	let projection = m4_perspective(60.0, aspectRatio, 0.01, 1000.0);
	let view = m4_lookAt([0, 5, 7], [0, 3, 0], [0, 1, 0]);
	let model = m4_identity();
	let mvp = m4_mul(m4_mul(projection, view), model);

	ShaderBind(gl, this.mShader);

	UniformMat4(gl, this.mUniformModel, model);
	UniformMat4(gl, this.mUniformMVP, mvp);
	
	//UniformVec3(gl, this.mUniformLight, [0, 0, 1]);
	TextureBind(gl, this.mDisplayTexture, this.mUniformTex, 0);

	this.mWomanMesh.Bind(this.mAttribPos, this.mAttribNorm, this.mAttribUV, -1, -1);
	this.mWomanMesh.Draw();
	this.mWomanMesh.UnBind(this.mAttribPos, this.mAttribNorm, this.mAttribUV, -1, -1);

	TextureUnbind(gl, 0);

	ShaderUnbind(gl);
};