function CopyMatrix() {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.setAttribute("id", "dummy_id");
  document.getElementById("dummy_id").value=MatrixToString(GetInputMatrix());
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

function ToggleEarlyOuts() {
	global_enable_early_out = !global_enable_early_out;

	if (global_enable_early_out) {
		document.getElementById("stat_out").innerHTML = "(t)"
	}
	else {
		document.getElementById("stat_out").innerHTML = "(f)"
	}
}

function PasteMatrix() {
	var data = window.clipboardData.getData('Text');
	var array = JSON.parse(data); 
	if (array == null) {
		return
	}
	FillInputMatrix(array)
}

function MatrixToString(M) {
	var out = "[\n";
	out += "\t" + PadFixedNumber(M[0])  + ", " + PadFixedNumber(M[1])  + "," + PadFixedNumber(M[2])  + "," + PadFixedNumber(M[3])  + ",\n"
	out += "\t" + PadFixedNumber(M[4])  + ", " + PadFixedNumber(M[5])  + "," + PadFixedNumber(M[6])  + "," + PadFixedNumber(M[7])  + ",\n"
	out += "\t" + PadFixedNumber(M[8])  + ", " + PadFixedNumber(M[9])  + "," + PadFixedNumber(M[10]) + "," + PadFixedNumber(M[11]) + ",\n"
	out += "\t" + PadFixedNumber(M[12]) + ", " + PadFixedNumber(M[13]) + "," + PadFixedNumber(M[14]) + "," + PadFixedNumber(M[15]) + "\n"
	out += "]";
	return out;
}

function DoJSONFill() {
	var mat = document.getElementById("json_matrix").value
	var array =JSON.parse(mat)

	document.getElementById("row_1_col_1").value = array[0]
	document.getElementById("row_2_col_1").value = array[1]
	document.getElementById("row_3_col_1").value = array[2]
	document.getElementById("row_4_col_1").value = array[3]
	document.getElementById("row_1_col_2").value = array[4]
	document.getElementById("row_2_col_2").value = array[5]
	document.getElementById("row_3_col_2").value = array[6]
	document.getElementById("row_4_col_2").value = array[7]
	document.getElementById("row_1_col_3").value = array[8]
	document.getElementById("row_2_col_3").value = array[9]
	document.getElementById("row_3_col_3").value = array[10]
	document.getElementById("row_4_col_3").value = array[11]
	document.getElementById("row_1_col_4").value = array[12]
	document.getElementById("row_2_col_4").value = array[13]
	document.getElementById("row_3_col_4").value = array[14]
	document.getElementById("row_4_col_4").value = array[15]
}

function GetInputMatrix() {
	var M = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]

	M[0] = Number(document.getElementById("row_1_col_1").value)
	M[1] = Number(document.getElementById("row_2_col_1").value)
	M[2] = Number(document.getElementById("row_3_col_1").value)
	M[3] = Number(document.getElementById("row_4_col_1").value)

	M[4] = Number(document.getElementById("row_1_col_2").value)
	M[5] = Number(document.getElementById("row_2_col_2").value)
	M[6] = Number(document.getElementById("row_3_col_2").value)
	M[7] = Number(document.getElementById("row_4_col_2").value)

	M[8] = Number(document.getElementById("row_1_col_3").value)
	M[9] = Number(document.getElementById("row_2_col_3").value)
	M[10]= Number(document.getElementById("row_3_col_3").value)
	M[11]= Number(document.getElementById("row_4_col_3").value)

	M[12]= Number(document.getElementById("row_1_col_4").value)
	M[13]= Number(document.getElementById("row_2_col_4").value)
	M[14]= Number(document.getElementById("row_3_col_4").value)
	M[15]= Number(document.getElementById("row_4_col_4").value)

	return M
}

function GetWolframMatrix(M) {
	var m = "{";
	m += "{" + M[0] + "," + M[1] + "," + M[2] + "," + M[3] + "},"
	m += "{" + M[4] + "," + M[5] + "," + M[6] + "," + M[7] + "},"
	m += "{" + M[8] + "," + M[9] + "," + M[10] + "," + M[11] + "},"
	m += "{" + M[12] + "," + M[13] + "," + M[14] + "," + M[15] + "}"
	m += "}"
	return encodeURI(m)
}

function GetWolframMatrix3(M) {
	var m = "{";
	m += "{" + M[0] + "," + M[1] + "," + M[2]  + "},"
	m += "{" + M[4] + "," + M[5] + "," + M[6]  + "},"
	m += "{" + M[8] + "," + M[9] + "," + M[10] + "}"
	m += "}"
	return encodeURI(m)
}

function FillInputMatrix(M) {
	const numFixed = 5

	document.getElementById("row_1_col_1").value = M[0].toFixed(numFixed)
	document.getElementById("row_2_col_1").value = M[1].toFixed(numFixed)
	document.getElementById("row_3_col_1").value = M[2].toFixed(numFixed)
	document.getElementById("row_4_col_1").value = M[3].toFixed(numFixed)

	document.getElementById("row_1_col_2").value = M[4].toFixed(numFixed)
	document.getElementById("row_2_col_2").value = M[5].toFixed(numFixed)
	document.getElementById("row_3_col_2").value = M[6].toFixed(numFixed)
	document.getElementById("row_4_col_2").value = M[7].toFixed(numFixed)

	document.getElementById("row_1_col_3").value = M[8].toFixed(numFixed)
	document.getElementById("row_2_col_3").value = M[9].toFixed(numFixed)
	document.getElementById("row_3_col_3").value = M[10].toFixed(numFixed)
	document.getElementById("row_4_col_3").value = M[11].toFixed(numFixed)

	document.getElementById("row_1_col_4").value = M[12].toFixed(numFixed)
	document.getElementById("row_2_col_4").value = M[13].toFixed(numFixed)
	document.getElementById("row_3_col_4").value = M[14].toFixed(numFixed)
	document.getElementById("row_4_col_4").value = M[15].toFixed(numFixed)
}

function ClearInput() {
	document.getElementById("row_1_col_1").value = "1"
	document.getElementById("row_2_col_1").value = "0"
	document.getElementById("row_3_col_1").value = "0"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "0"
	document.getElementById("row_2_col_2").value = "1"
	document.getElementById("row_3_col_2").value = "0"
	document.getElementById("row_4_col_2").value = "0"

	document.getElementById("row_1_col_3").value = "0"
	document.getElementById("row_2_col_3").value = "0"
	document.getElementById("row_3_col_3").value = "1"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "0"
	document.getElementById("row_2_col_4").value = "0"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "1"
}

function FillSample2() {
	document.getElementById("row_1_col_1").value = "-0.000002019615310822065"
	document.getElementById("row_2_col_1").value = "0.9999999999997736"
	document.getElementById("row_3_col_1").value = "0"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "-14.999999999996605"
	document.getElementById("row_2_col_2").value = "-0.000003366025518036775"
	document.getElementById("row_3_col_2").value = "0"
	document.getElementById("row_4_col_2").value = "0"

	document.getElementById("row_1_col_3").value = "0"
	document.getElementById("row_2_col_3").value = "0"
	document.getElementById("row_3_col_3").value = "1.0000000000000002"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "-1"
	document.getElementById("row_2_col_4").value = "-2"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "1"
}

function FillSample3() {
	document.getElementById("row_1_col_1").value = "14.9999999999971"
	document.getElementById("row_2_col_1").value = "1.000000000000194"
	document.getElementById("row_3_col_1").value = "1.0000000000000002"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "0.7071068236890367"
	document.getElementById("row_2_col_2").value = "0"
	document.getElementById("row_3_col_2").value = "0"
	document.getElementById("row_4_col_2").value = "0.7071067386840559"

	document.getElementById("row_1_col_3").value = "0"
	document.getElementById("row_2_col_3").value = "0"
	document.getElementById("row_3_col_3").value = "0"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "0"
	document.getElementById("row_2_col_4").value = "0"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "0"
}

function FillSample4() {
	document.getElementById("row_1_col_1").value = "1.9999991574533886"
	document.getElementById("row_2_col_1").value = "0.24999863616775173"
	document.getElementById("row_3_col_1").value = "0.25"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "0.948323571695159"
	document.getElementById("row_2_col_2").value = "0"
	document.getElementById("row_3_col_2").value = "0"
	document.getElementById("row_4_col_2").value = "-0.3173049059931736"

	document.getElementById("row_1_col_3").value = "0"
	document.getElementById("row_2_col_3").value = "0"
	document.getElementById("row_3_col_3").value = "0"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "0"
	document.getElementById("row_2_col_4").value = "0"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "0"
}

function FillSample5() {
	document.getElementById("row_1_col_1").value = "2.1213196295176813"
	document.getElementById("row_2_col_1").value = "0.35355350960022724"
	document.getElementById("row_3_col_1").value = "0"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "-2.1213210576013637"
	document.getElementById("row_2_col_2").value = "0.35355327158628025"
	document.getElementById("row_3_col_2").value = "0"
	document.getElementById("row_4_col_2").value = "0"

	document.getElementById("row_1_col_3").value = "0"
	document.getElementById("row_2_col_3").value = "0"
	document.getElementById("row_3_col_3").value = "0.5"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "-6.5"
	document.getElementById("row_2_col_4").value = "4"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "1"
}

function FillDebugMatrix() {
	const B = [
		 1.597270686975348, 0.15045381104601616, 0, 0,
		-1.2036304883681292, 0.1996588358719185, 0, 0,
		0, 0, 0.25000000000000006, 0,
		5, -1.75, 1, 1
	]
	FillInputMatrix(B)

	if (global_enable_early_out) {
		document.getElementById("stat_out").innerHTML = "(t)"
	}
	else {
		document.getElementById("stat_out").innerHTML = "(f)"
	}
}

function PadFixedNumber(num) {
	const numFixed = 5

	var out = ""
	if (num >= 0) {
		out += " "
	}
	out += num.toFixed(numFixed)
	return out;
}

function FactorTranslationResultToString(o) {
	var out = "{\n"

	out += "\t\"T\": [\n";
	out += "\t\t" + PadFixedNumber(o.T[0])  + ", " + PadFixedNumber(o.T[1])  + "," + PadFixedNumber(o.T[2])  + "," + PadFixedNumber(o.T[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.T[4])  + ", " + PadFixedNumber(o.T[5])  + "," + PadFixedNumber(o.T[6])  + "," + PadFixedNumber(o.T[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.T[8])  + ", " + PadFixedNumber(o.T[9])  + "," + PadFixedNumber(o.T[10]) + "," + PadFixedNumber(o.T[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.T[12]) + ", " + PadFixedNumber(o.T[13]) + "," + PadFixedNumber(o.T[14]) + "," + PadFixedNumber(o.T[15]) + "\n"
	out += "\t],\n";

	out += "\t\"X\": [\n";
	out += "\t\t" + PadFixedNumber(o.X[0])  + ", " + PadFixedNumber(o.X[1])  + "," + PadFixedNumber(o.X[2])  + "," + PadFixedNumber(o.X[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.X[4])  + ", " + PadFixedNumber(o.X[5])  + "," + PadFixedNumber(o.X[6])  + "," + PadFixedNumber(o.X[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.X[8])  + ", " + PadFixedNumber(o.X[9])  + "," + PadFixedNumber(o.X[10]) + "," + PadFixedNumber(o.X[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.X[12]) + ", " + PadFixedNumber(o.X[13]) + "," + PadFixedNumber(o.X[14]) + "," + PadFixedNumber(o.X[15]) + "\n"
	out += "\t]\n";

	out += "}"

	return out
}

function DoFactorizeTranslation() {
	const M = GetInputMatrix();
	const result = FactorTranslation(M);
	const output = FactorTranslationResultToString(result);
	document.getElementById("output").value = output
	return result
}

function DoFactorizeTranslationFillT() {
	const result = DoFactorizeTranslation()
	FillInputMatrix(result.T);
}

function DoFactorizeTranslationFillX() {
	const result = DoFactorizeTranslation()
	FillInputMatrix(result.X);
}

function PolarDecompositionResultToString(o) {
	var out = "{\n"

	out += "\t\"F\": [\n";
	out += "\t\t" + PadFixedNumber(o.F[0])  + ", " + PadFixedNumber(o.F[1])  + "," + PadFixedNumber(o.F[2])  + "," + PadFixedNumber(o.F[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.F[4])  + ", " + PadFixedNumber(o.F[5])  + "," + PadFixedNumber(o.F[6])  + "," + PadFixedNumber(o.F[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.F[8])  + ", " + PadFixedNumber(o.F[9])  + "," + PadFixedNumber(o.F[10]) + "," + PadFixedNumber(o.F[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.F[12]) + ", " + PadFixedNumber(o.F[13]) + "," + PadFixedNumber(o.F[14]) + "," + PadFixedNumber(o.F[15]) + "\n"
	out += "\t],\n";

	out += "\t\"R\": [\n";
	out += "\t\t" + PadFixedNumber(o.R[0])  + ", " + PadFixedNumber(o.R[1])  + "," + PadFixedNumber(o.R[2])  + "," + PadFixedNumber(o.R[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.R[4])  + ", " + PadFixedNumber(o.R[5])  + "," + PadFixedNumber(o.R[6])  + "," + PadFixedNumber(o.R[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.R[8])  + ", " + PadFixedNumber(o.R[9])  + "," + PadFixedNumber(o.R[10]) + "," + PadFixedNumber(o.R[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.R[12]) + ", " + PadFixedNumber(o.R[13]) + "," + PadFixedNumber(o.R[14]) + "," + PadFixedNumber(o.R[15]) + "\n"
	out += "\t],\n";

	out += "\t\"S\": [\n";
	out += "\t\t" + PadFixedNumber(o.S[0])  + ", " + PadFixedNumber(o.S[1])  + "," + PadFixedNumber(o.S[2])  + "," + PadFixedNumber(o.S[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.S[4])  + ", " + PadFixedNumber(o.S[5])  + "," + PadFixedNumber(o.S[6])  + "," + PadFixedNumber(o.S[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.S[8])  + ", " + PadFixedNumber(o.S[9])  + "," + PadFixedNumber(o.S[10]) + "," + PadFixedNumber(o.S[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.S[12]) + ", " + PadFixedNumber(o.S[13]) + "," + PadFixedNumber(o.S[14]) + "," + PadFixedNumber(o.S[15]) + "\n"
	out += "\t],\n";

	out += "\t\"determinent\": " + PadFixedNumber(o.determinant) + ",\n";
	out += "\t\"iterations\": " + o.iterations + "\n";


	out += "}"

	return out;
}

function OpenPolarDecompWolframURL() {
	const M = GetInputMatrix()
	var url = "https://www.wolframalpha.com/input/?i=" 
	url += encodeURI("{u, w, v} = SingularValueDecomposition[")
	url += GetWolframMatrix(M)
	url += encodeURI("];{u.ConjugateTranspose[v], v.w.ConjugateTranspose[v]}")
	window.open(url, '_blank');
}

function DoPolarDecomposition() {
	const M = GetInputMatrix();
	const result = PolarDecomposition(M)
	const output = PolarDecompositionResultToString(result)
	document.getElementById("output").value = output
	return result
}

function DoPolarDecompositionFillF() {
	const result = DoPolarDecomposition()
	FillInputMatrix(result.F);
}

function DoPolarDecompositionFillR() {
	const result = DoPolarDecomposition()
	FillInputMatrix(result.R);
}

function DoPolarDecompositionFillS() {
	const result = DoPolarDecomposition()
	FillInputMatrix(result.S);
}

function QRDecompositionResultToString(o) {
	var out = "{\n"

	out += "\t\"Q\": [\n";
	out += "\t\t" + PadFixedNumber(o.Q[0])  + ", " + PadFixedNumber(o.Q[1])  + "," + PadFixedNumber(o.Q[2])  + "," + PadFixedNumber(o.Q[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.Q[4])  + ", " + PadFixedNumber(o.Q[5])  + "," + PadFixedNumber(o.Q[6])  + "," + PadFixedNumber(o.Q[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.Q[8])  + ", " + PadFixedNumber(o.Q[9])  + "," + PadFixedNumber(o.Q[10]) + "," + PadFixedNumber(o.Q[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.Q[12]) + ", " + PadFixedNumber(o.Q[13]) + "," + PadFixedNumber(o.Q[14]) + "," + PadFixedNumber(o.Q[15]) + "\n"
	out += "\t],\n";

	out += "\t\"R\": [\n";
	out += "\t\t" + PadFixedNumber(o.R[0])  + ", " + PadFixedNumber(o.R[1])  + "," + PadFixedNumber(o.R[2])  + "," + PadFixedNumber(o.R[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.R[4])  + ", " + PadFixedNumber(o.R[5])  + "," + PadFixedNumber(o.R[6])  + "," + PadFixedNumber(o.R[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.R[8])  + ", " + PadFixedNumber(o.R[9])  + "," + PadFixedNumber(o.R[10]) + "," + PadFixedNumber(o.R[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.R[12]) + ", " + PadFixedNumber(o.R[13]) + "," + PadFixedNumber(o.R[14]) + "," + PadFixedNumber(o.R[15]) + "\n"
	out += "\t]\n";

	out += "}"

	return out;
}

function OpenQRWolframURL() {
	const M = GetInputMatrix()
	/*var M = [
		M_[0], M_[4], M_[8], M_[12],
		M_[1], M_[5], M_[9], M_[13],
		M_[2], M_[6], M_[10],M_[14],
		M_[3], M_[7], M_[11],M_[15]
	]*/
	const url = "https://www.wolframalpha.com/input/?i=QR+decomposition+" + GetWolframMatrix(M)
	window.open(url, '_blank');
}

function OpenEigenvalueWolframURL() {
	const M = GetInputMatrix()
	const url = "https://www.wolframalpha.com/input/?i=eigenvalues+" + GetWolframMatrix(M)
	window.open(url, '_blank');
}

function OpenEigenvectorWolframURL() {
	const M = GetInputMatrix()
	const url = "https://www.wolframalpha.com/input/?i=eigenvectors+" + GetWolframMatrix(M)
	window.open(url, '_blank');
}

function OpenEigenvalue3WolframURL() {
	const M = GetInputMatrix()
	const url = "https://www.wolframalpha.com/input/?i=eigenvalues+" + GetWolframMatrix3(M)
	window.open(url, '_blank');
}

function OpenEigenvector3WolframURL() {
	const M = GetInputMatrix()
	const url = "https://www.wolframalpha.com/input/?i=eigenvectors+" + GetWolframMatrix3(M)
	window.open(url, '_blank');
}

function DoQRDecomposition() {
	const M = GetInputMatrix();
	const result = QRDecomposition(M)
	const output = QRDecompositionResultToString(result)
	document.getElementById("output").value = output
	return result
}

function DoQRDecompositionFillQ() {
	const result = DoQRDecomposition()
	FillInputMatrix(result.Q);
}

function DoQRDecompositionFillR() {
	const result = DoQRDecomposition()
	FillInputMatrix(result.R);
}

function SpectoralDecompositionResultToString(o) {
	var out = "{\n"

	out += "\t\"eigenvalues\": [\n";
	out += "\t\t" + PadFixedNumber(o.eigenvalues[0])  + ", " + PadFixedNumber(o.eigenvalues[1])  + "," + PadFixedNumber(o.eigenvalues[2]) + "\n"
	out += "\t],\n";

	out += "\t\"eigenvectors\": [\n";
	out += "\t\t[ " + PadFixedNumber(o.eigenvectors[0][0])  + ", " + PadFixedNumber(o.eigenvectors[0][1])  + "," + PadFixedNumber(o.eigenvectors[0][2]) + "],\n"
	out += "\t\t[ " + PadFixedNumber(o.eigenvectors[1][0])  + ", " + PadFixedNumber(o.eigenvectors[1][1])  + "," + PadFixedNumber(o.eigenvectors[1][2]) + "],\n"
	out += "\t\t[ " + PadFixedNumber(o.eigenvectors[2][0])  + ", " + PadFixedNumber(o.eigenvectors[2][1])  + "," + PadFixedNumber(o.eigenvectors[2][2]) + "]\n"
	out += "\t],\n";

	out += "\t\"U\": [\n";
	out += "\t\t" + PadFixedNumber(o.U[0])  + ", " + PadFixedNumber(o.U[1])  + "," + PadFixedNumber(o.U[2])  + "," + PadFixedNumber(o.U[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.U[4])  + ", " + PadFixedNumber(o.U[5])  + "," + PadFixedNumber(o.U[6])  + "," + PadFixedNumber(o.U[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.U[8])  + ", " + PadFixedNumber(o.U[9])  + "," + PadFixedNumber(o.U[10]) + "," + PadFixedNumber(o.U[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.U[12]) + ", " + PadFixedNumber(o.U[13]) + "," + PadFixedNumber(o.U[14]) + "," + PadFixedNumber(o.U[15]) + "\n"
	out += "\t],\n";

	out += "\t\"K\": [\n";
	out += "\t\t" + PadFixedNumber(o.K[0])  + ", " + PadFixedNumber(o.K[1])  + "," + PadFixedNumber(o.K[2])  + "," + PadFixedNumber(o.K[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.K[4])  + ", " + PadFixedNumber(o.K[5])  + "," + PadFixedNumber(o.K[6])  + "," + PadFixedNumber(o.K[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.K[8])  + ", " + PadFixedNumber(o.K[9])  + "," + PadFixedNumber(o.K[10]) + "," + PadFixedNumber(o.K[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.K[12]) + ", " + PadFixedNumber(o.K[13]) + "," + PadFixedNumber(o.K[14]) + "," + PadFixedNumber(o.K[15]) + "\n"
	out += "\t],\n";

	out += "\t\"Ut\": [\n";
	out += "\t\t" + PadFixedNumber(o.Ut[0])  + ", " + PadFixedNumber(o.Ut[1])  + "," + PadFixedNumber(o.Ut[2])  + "," + PadFixedNumber(o.Ut[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.Ut[4])  + ", " + PadFixedNumber(o.Ut[5])  + "," + PadFixedNumber(o.Ut[6])  + "," + PadFixedNumber(o.Ut[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(o.Ut[8])  + ", " + PadFixedNumber(o.Ut[9])  + "," + PadFixedNumber(o.Ut[10]) + "," + PadFixedNumber(o.Ut[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(o.Ut[12]) + ", " + PadFixedNumber(o.Ut[13]) + "," + PadFixedNumber(o.Ut[14]) + "," + PadFixedNumber(o.Ut[15]) + "\n"
	out += "\t],\n";

	out += "\t\"iterations\": " + o.iterations + "\n";

	out += "}"

	return out;
}

function DoSpectoralDecomposition() {
	const M = GetInputMatrix();
	const result = SpectoralDecomposition(M)
	const output = SpectoralDecompositionResultToString(result)
	document.getElementById("output").value = output
	return result
}

function DoSpectoralDecompositionFillU() {
	const result = DoQRDecomposition()
	FillInputMatrix(result.U);
}

function DoSpectoralDecompositionFillK() {
	const result = DoQRDecomposition()
	FillInputMatrix(result.K);
}

function DoSpectoralDecompositionFillUt() {
	const result = DoQRDecomposition()
	FillInputMatrix(result.Ut);
}

// 0 = TX
// 1 = TQS
// 2 = TFRS
// 3 = TFRUKUt
// 4 = shoemake
function DecomposeRecomposeTest(which) {
	var M = GetInputMatrix();

	var V = null;
	if (which == 0) {
		var R = AffineDecompose(M).TX
		V = Mul4(R.T, R.X);
	}
	else if (which == 1) {
		var R = AffineDecompose(M).TQS
		V = Mul4(Mul4(R.T, R.Q), R.S);
	}
	else if (which == 2) {
		var R = AffineDecompose(M).TFRS
		V = Mul4(Mul4(Mul4(R.T, R.F), R.R), R.S);
	}
	else if (which == 3) {
		var R = AffineDecompose(M).TFRUKUt
		V = Mul4(Mul4(Mul4(Mul4(Mul4(R.T, R.F), R.R), R.U), R.K), R.Ut);
	}
	else {
		var R = AffineDecompose(M).Shoemake

		var PosMtx = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			R.t[0], R.t[1], R.t[2], 1
		]

		var ScaleMtx = [
			R.k[0], 0, 0, 0,
			0, R.k[1], 0, 0,
			0, 0, R.k[2], 0,
			0, 0,     0 , 1
		]

		var RotMtx = QToM4(R.q);
		var StrMtx = QToM4(R.u);

		var InvStrMtx = [
			StrMtx[0], StrMtx[1], StrMtx[2],
			StrMtx[4], StrMtx[5], StrMtx[6],
			StrMtx[8], StrMtx[9], StrMtx[10]
		]
		InvStrMtx = Inverse3(InvStrMtx)
		InvStrMtx = [
			InvStrMtx[0], InvStrMtx[1], InvStrMtx[2], 0,
			InvStrMtx[3], InvStrMtx[4], InvStrMtx[5], 0,
			InvStrMtx[6], InvStrMtx[7], InvStrMtx[8], 0,
			0, 0, 0, 1
		]
		V = Mul4(Mul4(Mul4(Mul4(InvStrMtx, ScaleMtx), StrMtx), RotMtx), PosMtx);
	}

	var out = "{\n"

	out += "\t\"Orignial\": [\n";
	out += "\t\t" + PadFixedNumber(M[0])  + ", " + PadFixedNumber(M[1])  + "," + PadFixedNumber(M[2])  + "," + PadFixedNumber(M[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(M[4])  + ", " + PadFixedNumber(M[5])  + "," + PadFixedNumber(M[6])  + "," + PadFixedNumber(M[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(M[8])  + ", " + PadFixedNumber(M[9])  + "," + PadFixedNumber(M[10]) + "," + PadFixedNumber(M[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(M[12]) + ", " + PadFixedNumber(M[13]) + "," + PadFixedNumber(M[14]) + "," + PadFixedNumber(M[15]) + "\n"
	out += "\t],\n";

	out += "\t\"Recomposed\": [\n";
	out += "\t\t" + PadFixedNumber(V[0])  + ", " + PadFixedNumber(V[1])  + "," + PadFixedNumber(V[2])  + "," + PadFixedNumber(V[3])  + ",\n"
	out += "\t\t" + PadFixedNumber(V[4])  + ", " + PadFixedNumber(V[5])  + "," + PadFixedNumber(V[6])  + "," + PadFixedNumber(V[7])  + ",\n"
	out += "\t\t" + PadFixedNumber(V[8])  + ", " + PadFixedNumber(V[9])  + "," + PadFixedNumber(V[10]) + "," + PadFixedNumber(V[11]) + ",\n"
	out += "\t\t" + PadFixedNumber(V[12]) + ", " + PadFixedNumber(V[13]) + "," + PadFixedNumber(V[14]) + "," + PadFixedNumber(V[15]) + "\n"
	out += "\t]\n";

	out += "}"

	document.getElementById("output").value = out
}


function AffineDecompositionResultToString(o) {
	var out = "{\n"

	out += "\t\"TX\": {\n";
	out += "\t\t\"T\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TX.T[0])  + ", " + PadFixedNumber(o.TX.T[1])  + "," + PadFixedNumber(o.TX.T[2])  + "," + PadFixedNumber(o.TX.T[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TX.T[4])  + ", " + PadFixedNumber(o.TX.T[5])  + "," + PadFixedNumber(o.TX.T[6])  + "," + PadFixedNumber(o.TX.T[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TX.T[8])  + ", " + PadFixedNumber(o.TX.T[9])  + "," + PadFixedNumber(o.TX.T[10]) + "," + PadFixedNumber(o.TX.T[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TX.T[12]) + ", " + PadFixedNumber(o.TX.T[13]) + "," + PadFixedNumber(o.TX.T[14]) + "," + PadFixedNumber(o.TX.T[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"X\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TX.X[0])  + ", " + PadFixedNumber(o.TX.X[1])  + "," + PadFixedNumber(o.TX.X[2])  + "," + PadFixedNumber(o.TX.X[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TX.X[4])  + ", " + PadFixedNumber(o.TX.X[5])  + "," + PadFixedNumber(o.TX.X[6])  + "," + PadFixedNumber(o.TX.X[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TX.X[8])  + ", " + PadFixedNumber(o.TX.X[9])  + "," + PadFixedNumber(o.TX.X[10]) + "," + PadFixedNumber(o.TX.X[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TX.X[12]) + ", " + PadFixedNumber(o.TX.X[13]) + "," + PadFixedNumber(o.TX.X[14]) + "," + PadFixedNumber(o.TX.X[15]) + "\n"
	out += "\t\t]\n";
	out += "\t},\n";

	out += "\t\"TQS\": {\n";
	out += "\t\t\"T\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TQS.T[0])  + ", " + PadFixedNumber(o.TQS.T[1])  + "," + PadFixedNumber(o.TQS.T[2])  + "," + PadFixedNumber(o.TQS.T[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.T[4])  + ", " + PadFixedNumber(o.TQS.T[5])  + "," + PadFixedNumber(o.TQS.T[6])  + "," + PadFixedNumber(o.TQS.T[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.T[8])  + ", " + PadFixedNumber(o.TQS.T[9])  + "," + PadFixedNumber(o.TQS.T[10]) + "," + PadFixedNumber(o.TQS.T[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.T[12]) + ", " + PadFixedNumber(o.TQS.T[13]) + "," + PadFixedNumber(o.TQS.T[14]) + "," + PadFixedNumber(o.TQS.T[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"Q\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TQS.Q[0])  + ", " + PadFixedNumber(o.TQS.Q[1])  + "," + PadFixedNumber(o.TQS.Q[2])  + "," + PadFixedNumber(o.TQS.Q[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.Q[4])  + ", " + PadFixedNumber(o.TQS.Q[5])  + "," + PadFixedNumber(o.TQS.Q[6])  + "," + PadFixedNumber(o.TQS.Q[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.Q[8])  + ", " + PadFixedNumber(o.TQS.Q[9])  + "," + PadFixedNumber(o.TQS.Q[10]) + "," + PadFixedNumber(o.TQS.Q[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.Q[12]) + ", " + PadFixedNumber(o.TQS.Q[13]) + "," + PadFixedNumber(o.TQS.Q[14]) + "," + PadFixedNumber(o.TQS.Q[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"S\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TQS.S[0])  + ", " + PadFixedNumber(o.TQS.S[1])  + "," + PadFixedNumber(o.TQS.S[2])  + "," + PadFixedNumber(o.TQS.S[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.S[4])  + ", " + PadFixedNumber(o.TQS.S[5])  + "," + PadFixedNumber(o.TQS.S[6])  + "," + PadFixedNumber(o.TQS.S[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.S[8])  + ", " + PadFixedNumber(o.TQS.S[9])  + "," + PadFixedNumber(o.TQS.S[10]) + "," + PadFixedNumber(o.TQS.S[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TQS.S[12]) + ", " + PadFixedNumber(o.TQS.S[13]) + "," + PadFixedNumber(o.TQS.S[14]) + "," + PadFixedNumber(o.TQS.S[15]) + "\n"
	out += "\t\t]\n";
	out += "\t},\n";

	out += "\t\"TFRS\": {\n";
	out += "\t\t\"T\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRS.T[0])  + ", " + PadFixedNumber(o.TFRS.T[1])  + "," + PadFixedNumber(o.TFRS.T[2])  + "," + PadFixedNumber(o.TFRS.T[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.T[4])  + ", " + PadFixedNumber(o.TFRS.T[5])  + "," + PadFixedNumber(o.TFRS.T[6])  + "," + PadFixedNumber(o.TFRS.T[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.T[8])  + ", " + PadFixedNumber(o.TFRS.T[9])  + "," + PadFixedNumber(o.TFRS.T[10]) + "," + PadFixedNumber(o.TFRS.T[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.T[12]) + ", " + PadFixedNumber(o.TFRS.T[13]) + "," + PadFixedNumber(o.TFRS.T[14]) + "," + PadFixedNumber(o.TFRS.T[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"F\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRS.F[0])  + ", " + PadFixedNumber(o.TFRS.F[1])  + "," + PadFixedNumber(o.TFRS.F[2])  + "," + PadFixedNumber(o.TFRS.F[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.F[4])  + ", " + PadFixedNumber(o.TFRS.F[5])  + "," + PadFixedNumber(o.TFRS.F[6])  + "," + PadFixedNumber(o.TFRS.F[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.F[8])  + ", " + PadFixedNumber(o.TFRS.F[9])  + "," + PadFixedNumber(o.TFRS.F[10]) + "," + PadFixedNumber(o.TFRS.F[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.F[12]) + ", " + PadFixedNumber(o.TFRS.F[13]) + "," + PadFixedNumber(o.TFRS.F[14]) + "," + PadFixedNumber(o.TFRS.F[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"R\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRS.R[0])  + ", " + PadFixedNumber(o.TFRS.R[1])  + "," + PadFixedNumber(o.TFRS.R[2])  + "," + PadFixedNumber(o.TFRS.R[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.R[4])  + ", " + PadFixedNumber(o.TFRS.R[5])  + "," + PadFixedNumber(o.TFRS.R[6])  + "," + PadFixedNumber(o.TFRS.R[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.R[8])  + ", " + PadFixedNumber(o.TFRS.R[9])  + "," + PadFixedNumber(o.TFRS.R[10]) + "," + PadFixedNumber(o.TFRS.R[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.R[12]) + ", " + PadFixedNumber(o.TFRS.R[13]) + "," + PadFixedNumber(o.TFRS.R[14]) + "," + PadFixedNumber(o.TFRS.R[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"S\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRS.S[0])  + ", " + PadFixedNumber(o.TFRS.S[1])  + "," + PadFixedNumber(o.TFRS.S[2])  + "," + PadFixedNumber(o.TFRS.S[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.S[4])  + ", " + PadFixedNumber(o.TFRS.S[5])  + "," + PadFixedNumber(o.TFRS.S[6])  + "," + PadFixedNumber(o.TFRS.S[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.S[8])  + ", " + PadFixedNumber(o.TFRS.S[9])  + "," + PadFixedNumber(o.TFRS.S[10]) + "," + PadFixedNumber(o.TFRS.S[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRS.S[12]) + ", " + PadFixedNumber(o.TFRS.S[13]) + "," + PadFixedNumber(o.TFRS.S[14]) + "," + PadFixedNumber(o.TFRS.S[15]) + "\n"
	out += "\t\t]\n";
	out += "\t},\n";

	out += "\t\"TFRUKUt\": {\n";
	out += "\t\t\"T\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.T[0])  + ", " + PadFixedNumber(o.TFRUKUt.T[1])  + "," + PadFixedNumber(o.TFRUKUt.T[2])  + "," + PadFixedNumber(o.TFRUKUt.T[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.T[4])  + ", " + PadFixedNumber(o.TFRUKUt.T[5])  + "," + PadFixedNumber(o.TFRUKUt.T[6])  + "," + PadFixedNumber(o.TFRUKUt.T[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.T[8])  + ", " + PadFixedNumber(o.TFRUKUt.T[9])  + "," + PadFixedNumber(o.TFRUKUt.T[10]) + "," + PadFixedNumber(o.TFRUKUt.T[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.T[12]) + ", " + PadFixedNumber(o.TFRUKUt.T[13]) + "," + PadFixedNumber(o.TFRUKUt.T[14]) + "," + PadFixedNumber(o.TFRUKUt.T[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"F\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.F[0])  + ", " + PadFixedNumber(o.TFRUKUt.F[1])  + "," + PadFixedNumber(o.TFRUKUt.F[2])  + "," + PadFixedNumber(o.TFRUKUt.F[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.F[4])  + ", " + PadFixedNumber(o.TFRUKUt.F[5])  + "," + PadFixedNumber(o.TFRUKUt.F[6])  + "," + PadFixedNumber(o.TFRUKUt.F[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.F[8])  + ", " + PadFixedNumber(o.TFRUKUt.F[9])  + "," + PadFixedNumber(o.TFRUKUt.F[10]) + "," + PadFixedNumber(o.TFRUKUt.F[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.F[12]) + ", " + PadFixedNumber(o.TFRUKUt.F[13]) + "," + PadFixedNumber(o.TFRUKUt.F[14]) + "," + PadFixedNumber(o.TFRUKUt.F[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"R\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.R[0])  + ", " + PadFixedNumber(o.TFRUKUt.R[1])  + "," + PadFixedNumber(o.TFRUKUt.R[2])  + "," + PadFixedNumber(o.TFRUKUt.R[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.R[4])  + ", " + PadFixedNumber(o.TFRUKUt.R[5])  + "," + PadFixedNumber(o.TFRUKUt.R[6])  + "," + PadFixedNumber(o.TFRUKUt.R[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.R[8])  + ", " + PadFixedNumber(o.TFRUKUt.R[9])  + "," + PadFixedNumber(o.TFRUKUt.R[10]) + "," + PadFixedNumber(o.TFRUKUt.R[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.R[12]) + ", " + PadFixedNumber(o.TFRUKUt.R[13]) + "," + PadFixedNumber(o.TFRUKUt.R[14]) + "," + PadFixedNumber(o.TFRUKUt.R[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"U\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.U[0])  + ", " + PadFixedNumber(o.TFRUKUt.U[1])  + "," + PadFixedNumber(o.TFRUKUt.U[2])  + "," + PadFixedNumber(o.TFRUKUt.U[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.U[4])  + ", " + PadFixedNumber(o.TFRUKUt.U[5])  + "," + PadFixedNumber(o.TFRUKUt.U[6])  + "," + PadFixedNumber(o.TFRUKUt.U[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.U[8])  + ", " + PadFixedNumber(o.TFRUKUt.U[9])  + "," + PadFixedNumber(o.TFRUKUt.U[10]) + "," + PadFixedNumber(o.TFRUKUt.U[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.U[12]) + ", " + PadFixedNumber(o.TFRUKUt.U[13]) + "," + PadFixedNumber(o.TFRUKUt.U[14]) + "," + PadFixedNumber(o.TFRUKUt.U[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"K\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.K[0])  + ", " + PadFixedNumber(o.TFRUKUt.K[1])  + "," + PadFixedNumber(o.TFRUKUt.K[2])  + "," + PadFixedNumber(o.TFRUKUt.K[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.K[4])  + ", " + PadFixedNumber(o.TFRUKUt.K[5])  + "," + PadFixedNumber(o.TFRUKUt.K[6])  + "," + PadFixedNumber(o.TFRUKUt.K[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.K[8])  + ", " + PadFixedNumber(o.TFRUKUt.K[9])  + "," + PadFixedNumber(o.TFRUKUt.K[10]) + "," + PadFixedNumber(o.TFRUKUt.K[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.K[12]) + ", " + PadFixedNumber(o.TFRUKUt.K[13]) + "," + PadFixedNumber(o.TFRUKUt.K[14]) + "," + PadFixedNumber(o.TFRUKUt.K[15]) + "\n"
	out += "\t\t],\n";
	out += "\t\t\"Ut\": [\n";
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.Ut[0])  + ", " + PadFixedNumber(o.TFRUKUt.Ut[1])  + "," + PadFixedNumber(o.TFRUKUt.Ut[2])  + "," + PadFixedNumber(o.TFRUKUt.Ut[3])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.Ut[4])  + ", " + PadFixedNumber(o.TFRUKUt.Ut[5])  + "," + PadFixedNumber(o.TFRUKUt.Ut[6])  + "," + PadFixedNumber(o.TFRUKUt.Ut[7])  + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.Ut[8])  + ", " + PadFixedNumber(o.TFRUKUt.Ut[9])  + "," + PadFixedNumber(o.TFRUKUt.Ut[10]) + "," + PadFixedNumber(o.TFRUKUt.Ut[11]) + ",\n"
	out += "\t\t\t" + PadFixedNumber(o.TFRUKUt.Ut[12]) + ", " + PadFixedNumber(o.TFRUKUt.Ut[13]) + "," + PadFixedNumber(o.TFRUKUt.Ut[14]) + "," + PadFixedNumber(o.TFRUKUt.Ut[15]) + "\n"
	out += "\t\t]\n";
	out += "\t},\n";

	out += "\t\"Iterations\": {\n";
	out += "\t\t\"polar\": " + o.Iterations.polar + ",\n";
	out += "\t\t\"spect\": " + o.Iterations.spect + "\n";
	out += "\t}\n";

	out += "}"

	return out;
}

function DoAffineDecomposition() {
	const M = GetInputMatrix();
	const result = AffineDecompose(M)
	const output = AffineDecompositionResultToString(result)
	document.getElementById("output").value = output
	return result
}

function ShoemakeDecompToString(o) {
	var out = "{\n"

	out += "\t\"t\": {\n";
	out += "\t\t\"x\": " + PadFixedNumber(o.t[0]) + ",\n"
	out += "\t\t\"y\": " + PadFixedNumber(o.t[1]) + ",\n"
	out += "\t\t\"z\": " + PadFixedNumber(o.t[2]) + "\n"
	out += "\t},\n";

	out += "\t\"q\": {\n";
	out += "\t\t\"w\": " + PadFixedNumber(o.q[0]) + ",\n"
	out += "\t\t\"x\": " + PadFixedNumber(o.q[1]) + ",\n"
	out += "\t\t\"y\": " + PadFixedNumber(o.q[2]) + ",\n"
	out += "\t\t\"z\": " + PadFixedNumber(o.q[3]) + "\n"
	out += "\t},\n";

	out += "\t\"u\": {\n";
	out += "\t\t\"w\": " + PadFixedNumber(o.u[0]) + ",\n"
	out += "\t\t\"x\": " + PadFixedNumber(o.u[1]) + ",\n"
	out += "\t\t\"y\": " + PadFixedNumber(o.u[2]) + ",\n"
	out += "\t\t\"z\": " + PadFixedNumber(o.u[3]) + "\n"
	out += "\t},\n";

	out += "\t\"k\": {\n";
	out += "\t\t\"x\": " + PadFixedNumber(o.k[0]) + ",\n"
	out += "\t\t\"y\": " + PadFixedNumber(o.k[1]) + ",\n"
	out += "\t\t\"z\": " + PadFixedNumber(o.k[2]) + "\n"
	out += "\t},\n";

	out += "\t\"f\": " + PadFixedNumber(o.f) + "\n";

	out += "}"

	return out
}

function DoShoemakeDecomposition() {
	const M = GetInputMatrix();
	const result = AffineDecompose(M)
	const output = ShoemakeDecompToString(result.Shoemake)
	document.getElementById("output").value = output
	return result
}