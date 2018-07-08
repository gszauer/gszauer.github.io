const numFixed = 5

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

function FillInputMatrix(M) {
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
	document.getElementById("row_1_col_1").value = ""
	document.getElementById("row_2_col_1").value = ""
	document.getElementById("row_3_col_1").value = ""
	document.getElementById("row_4_col_1").value = ""

	document.getElementById("row_1_col_2").value = ""
	document.getElementById("row_2_col_2").value = ""
	document.getElementById("row_3_col_2").value = ""
	document.getElementById("row_4_col_2").value = ""

	document.getElementById("row_1_col_3").value = ""
	document.getElementById("row_2_col_3").value = ""
	document.getElementById("row_3_col_3").value = ""
	document.getElementById("row_4_col_3").value = ""

	document.getElementById("row_1_col_4").value = ""
	document.getElementById("row_2_col_4").value = ""
	document.getElementById("row_3_col_4").value = ""
	document.getElementById("row_4_col_4").value = ""
}


function FillDebugMatrix() {
	const B = [
		 1.597270686975348, 0.15045381104601616, 0, 0,
		-1.2036304883681292, 0.1996588358719185, 0, 0,
		0, 0, 0.25000000000000006, 0,
		5, -1.75, 1, 1
	]
	FillInputMatrix(B)
}

function PadFixedNumber(num) {
	var out = ""
	if (num >= 0) {
		out += " "
	}
	out += num.toFixed(numFixed)
	return out;
}

function ConvertResultsToString(polar, spect, affine) {
	var et = "\t"
	var out = ""

	if (polar == null || spect == null || affine == null) {
		et = ""
	}
	else {
		out = "{\n"
	}

	if (polar != null) {
		out += et + "\"float polar_decomp(HMatrix M, HMatrix Q, HMatrix S)\": {\n";
		out += et + "\t\"Q\": [\n";
		out += et + "\t\t" + PadFixedNumber(polar.Q[0])  + ", " + PadFixedNumber(polar.Q[1])  + "," + PadFixedNumber(polar.Q[2])  + "," + PadFixedNumber(polar.Q[3])  + ",\n"
		out += et + "\t\t" + PadFixedNumber(polar.Q[4])  + ", " + PadFixedNumber(polar.Q[5])  + "," + PadFixedNumber(polar.Q[6])  + "," + PadFixedNumber(polar.Q[7])  + ",\n"
		out += et + "\t\t" + PadFixedNumber(polar.Q[8])  + ", " + PadFixedNumber(polar.Q[9])  + "," + PadFixedNumber(polar.Q[10]) + "," + PadFixedNumber(polar.Q[11]) + ",\n"
		out += et + "\t\t" + PadFixedNumber(polar.Q[12]) + ", " + PadFixedNumber(polar.Q[13]) + "," + PadFixedNumber(polar.Q[14]) + "," + PadFixedNumber(polar.Q[15]) + "\n"
		out += et + "\t],\n";

		out += et + "\t\"S\": [\n";
		out += et + "\t\t" + PadFixedNumber(polar.S[0])  + ", " + PadFixedNumber(polar.S[1])  + "," + PadFixedNumber(polar.S[2])  + "," + PadFixedNumber(polar.S[3])  + ",\n"
		out += et + "\t\t" + PadFixedNumber(polar.S[4])  + ", " + PadFixedNumber(polar.S[5])  + "," + PadFixedNumber(polar.S[6])  + "," + PadFixedNumber(polar.S[7])  + ",\n"
		out += et + "\t\t" + PadFixedNumber(polar.S[8])  + ", " + PadFixedNumber(polar.S[9])  + "," + PadFixedNumber(polar.S[10]) + "," + PadFixedNumber(polar.S[11]) + ",\n"
		out += et + "\t\t" + PadFixedNumber(polar.S[12]) + ", " + PadFixedNumber(polar.S[13]) + "," + PadFixedNumber(polar.S[14]) + "," + PadFixedNumber(polar.S[15]) + "\n"
		out += et + "\t],\n";

		out += et + "\t\"det\":" + PadFixedNumber(polar.det) + "\n"
		if (spect != null) {
			out += et + "},\n"
		} 
		else {
			out += et + "}\n"
		}
	}

	if (spect != null) {
		out += et + "\"HVect spect_decomp(HMatrix S, HMatrix U)\": {\n";
		out += et + "\t\"S\": [\n";
		out += et + "\t\t" + PadFixedNumber(spect.U[0])  + ", " + PadFixedNumber(spect.U[1])  + "," + PadFixedNumber(spect.U[2])  + "," + PadFixedNumber(spect.U[3])  + ",\n"
		out += et + "\t\t" + PadFixedNumber(spect.U[4])  + ", " + PadFixedNumber(spect.U[5])  + "," + PadFixedNumber(spect.U[6])  + "," + PadFixedNumber(spect.U[7])  + ",\n"
		out += et + "\t\t" + PadFixedNumber(spect.U[8])  + ", " + PadFixedNumber(spect.U[9])  + "," + PadFixedNumber(spect.U[10]) + "," + PadFixedNumber(spect.U[11]) + ",\n"
		out += et + "\t\t" + PadFixedNumber(spect.U[12]) + ", " + PadFixedNumber(spect.U[13]) + "," + PadFixedNumber(spect.U[14]) + "," + PadFixedNumber(spect.U[15]) + "\n"
		out += et + "\t],\n";

		out += et + "\t\"scale\":{\n";
		out += et + "\t\t\"x\" : " + PadFixedNumber(spect.scale.x) + ",\n";
		out += et + "\t\t\"y\" : " + PadFixedNumber(spect.scale.y) + ",\n";
		out += et + "\t\t\"z\" : " + PadFixedNumber(spect.scale.z) + ",\n";
		out += et + "\t\t\"w\" : " + PadFixedNumber(spect.scale.w) + "\n";
		out += et + "\t}\n";
		if (affine != null) {
			out += et + "},\n"
		} 
		else {
			out += et + "}\n"
		}
	}

	if (affine != null) {
		out += et + "\"void decomp_affine(HMatrix A, AffineParts *parts)\": {\n";

		out += et + "\t\"t\":{\n";
		out += et + "\t\t\"x\" : " + PadFixedNumber(affine.t[0]) + ",\n";
		out += et + "\t\t\"y\" : " + PadFixedNumber(affine.t[1]) + ",\n";
		out += et + "\t\t\"z\" : " + PadFixedNumber(affine.t[2]) + ",\n";
		out += et + "\t\t\"w\" : " + PadFixedNumber(affine.t[3]) + "\n";
		out += et + "\t},\n";

		out += et + "\t\"q\":{\n";
		out += et + "\t\t\"x\" : " + PadFixedNumber(affine.q[0]) + ",\n";
		out += et + "\t\t\"y\" : " + PadFixedNumber(affine.q[1]) + ",\n";
		out += et + "\t\t\"z\" : " + PadFixedNumber(affine.q[2]) + ",\n";
		out += et + "\t\t\"w\" : " + PadFixedNumber(affine.q[3]) + "\n";
		out += et + "\t},\n";

		out += et + "\t\"u\":{\n";
		out += et + "\t\t\"x\" : " + PadFixedNumber(affine.u[0]) + ",\n";
		out += et + "\t\t\"y\" : " + PadFixedNumber(affine.u[1]) + ",\n";
		out += et + "\t\t\"z\" : " + PadFixedNumber(affine.u[2]) + ",\n";
		out += et + "\t\t\"w\" : " + PadFixedNumber(affine.u[3]) + "\n";
		out += et + "\t},\n";

		out += et + "\t\"k\":{\n";
		out += et + "\t\t\"x\" : " + PadFixedNumber(affine.k[0]) + ",\n";
		out += et + "\t\t\"y\" : " + PadFixedNumber(affine.k[1]) + ",\n";
		out += et + "\t\t\"z\" : " + PadFixedNumber(affine.k[2]) + ",\n";
		out += et + "\t\t\"w\" : " + PadFixedNumber(affine.k[3]) + "\n";
		out += et + "\t},\n";

		out += et + "\tf: " + PadFixedNumber(affine.f) + "\n"

		out += et + "}\n"
	}

	if (polar != null && spect != null && affine != null) {
		out += "}"
	}

	return out
}

function DoAllDecompositions() {
	const M = GetInputMatrix();

	const polar = polar_decomp(M);
	const spect = spect_decomp(M);
	const affine = decomp_affine(M);

	const output = ConvertResultsToString(polar, spect, affine);

	document.getElementById("output").value = output
}

function DoPolarDecomposition() {
	const M = GetInputMatrix();

	const polar = polar_decomp(M);
	const spect = null
	const affine = null

	const output = ConvertResultsToString(polar, spect, affine);

	document.getElementById("output").value = output
}

function DoSpectDecomposition() {
	const M = GetInputMatrix();

	const polar = null
	const spect = spect_decomp(M);
	const affine = null

	const output = ConvertResultsToString(polar, spect, affine);

	document.getElementById("output").value = output
}

function DoAffineDecomposition() {
	const M = GetInputMatrix();

	const polar = null
	const spect = null
	const affine = decomp_affine(M);

	const output = ConvertResultsToString(polar, spect, affine);

	document.getElementById("output").value = output
}