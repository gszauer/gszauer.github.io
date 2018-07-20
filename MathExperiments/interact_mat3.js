var c_angle = 0;

function InitMatrices() {
	var M = [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]

	SetHtmlFromMatrix(0, M);
	SetHtmlFromMatrix(1, M);
	SetHtmlFromMatrix(2, M);
}

function GetMatrixFromHtml(idx) {
	var M = [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	];

	M[0] = Number(document.getElementById("m" + idx + "_row_0_col_0").value)
	M[1] = Number(document.getElementById("m" + idx + "_row_1_col_0").value)
	M[2] = Number(document.getElementById("m" + idx + "_row_2_col_0").value)

	M[3] = Number(document.getElementById("m" + idx + "_row_0_col_1").value)
	M[4] = Number(document.getElementById("m" + idx + "_row_1_col_1").value)
	M[5] = Number(document.getElementById("m" + idx + "_row_2_col_1").value)

	M[6] = Number(document.getElementById("m" + idx + "_row_0_col_2").value)
	M[7] = Number(document.getElementById("m" + idx + "_row_1_col_2").value)
	M[8]= Number(document.getElementById("m" + idx + "_row_2_col_2").value)

	return M;
}

function SetHtmlFromMatrix(idx, M) {
	document.getElementById("m" + idx + "_row_0_col_0").value = M[0].toFixed(5)
	document.getElementById("m" + idx + "_row_1_col_0").value = M[1].toFixed(5)
	document.getElementById("m" + idx + "_row_2_col_0").value = M[2].toFixed(5)

	document.getElementById("m" + idx + "_row_0_col_1").value = M[3].toFixed(5)
	document.getElementById("m" + idx + "_row_1_col_1").value = M[4].toFixed(5)
	document.getElementById("m" + idx + "_row_2_col_1").value = M[5].toFixed(5)

	document.getElementById("m" + idx + "_row_0_col_2").value = M[6].toFixed(5)
	document.getElementById("m" + idx + "_row_1_col_2").value = M[7].toFixed(5)
	document.getElementById("m" + idx + "_row_2_col_2").value = M[8].toFixed(5)
}

function MultiplyMatrices() {
	var A = GetMatrixFromHtml(0);
	var B = GetMatrixFromHtml(1)

	var R = M3_Mul_M3(A, B)

	SetHtmlFromMatrix(2, R)
}

function SwapAB() {
	var A = GetMatrixFromHtml(0);
	var B = GetMatrixFromHtml(1);

	SetHtmlFromMatrix(0, B)
	SetHtmlFromMatrix(1, A)
}

function RToA() {
	var R = GetMatrixFromHtml(2);
	SetHtmlFromMatrix(0, R)
}

function RToB() {
	var R = GetMatrixFromHtml(2);
	SetHtmlFromMatrix(1, R)
}

function IdentityA() {
	var M = [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]

	SetHtmlFromMatrix(0, M);
}

function IdentityB() {
	var M = [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]

	SetHtmlFromMatrix(1, M);
}

function IdentityR() {
	var M = [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]

	SetHtmlFromMatrix(2, M);
}

function TransposeMatrices() {
	var A = GetMatrixFromHtml(0);
	var B = M3_Transpose(A);
	SetHtmlFromMatrix(2, B)
}

function MatrixMinor() {
	var A = GetMatrixFromHtml(0);
	var B = M3_Minor(A);
	SetHtmlFromMatrix(2, B)
} 

function MatrixCofactor() {
	var A = GetMatrixFromHtml(0);
	var B = M3_Cofactor(A);
	SetHtmlFromMatrix(2, B)
}

function MatrixAdjugate() {
	var A = GetMatrixFromHtml(0);
	var B = M3_Adjugate(A);
	SetHtmlFromMatrix(2, B)
}

function MatrixDeterminant() {
	var A = GetMatrixFromHtml(0);
	var D = M3_Determinant(A);
	var B = [
		D, D, D,
		D, D, D,
		D, D, D
	]
	SetHtmlFromMatrix(2, B)
}

function MatrixInverse() {
	var A = GetMatrixFromHtml(0);
	var B = M3_Inverse(A);
	SetHtmlFromMatrix(2, B)
}

function StepA() {
	c_angle += 10;
	if (c_angle >= 360) {
		c_angle -= 360;
	}
	document.getElementById("a_step").innerHTML = c_angle

	var angle = c_angle * 0.0174533
	var R = [
		1,  0,                     0,               
		0,  Math.cos(angle),       Math.sin(angle), 
		0, -1.0 * Math.sin(angle), Math.cos(angle), 
	]

	SetHtmlFromMatrix(0, R);
}
