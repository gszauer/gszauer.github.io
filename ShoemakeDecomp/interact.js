const numFixed = 5

function CopyMatrix() {
  // Create a dummy input to copy the string array inside it
  var dummy = document.createElement("textarea");
  // Add it to the document
  document.body.appendChild(dummy);
  // Set its ID
  dummy.setAttribute("id", "dummy_id");
  // Output the array into it
  document.getElementById("dummy_id").value=MatrixToString(GetInputMatrix());
  // Select it
  dummy.select();
  // Copy its contents
  document.execCommand("copy");
  // Remove it as its not needed anymore
  document.body.removeChild(dummy);
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

function FillSample7() {
	document.getElementById("row_1_col_1").value = "0.49999966339744817"
	document.getElementById("row_2_col_1").value = "0.49999999999988676"
	document.getElementById("row_3_col_1").value = "-0.7071070192004545"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "-0.7071070192004545"
	document.getElementById("row_2_col_2").value = "0.7071065431725605"
	document.getElementById("row_3_col_2").value = "0"
	document.getElementById("row_4_col_2").value = "0"

	document.getElementById("row_1_col_3").value = "0.49999999999988676"
	document.getElementById("row_2_col_3").value = "0.5000003366025519"
	document.getElementById("row_3_col_3").value = "0.7071065431725605"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "-0.585786913654879"
	document.getElementById("row_2_col_4").value = "1.414214038400909"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "1"
}

function FillSample8() {
	document.getElementById("row_1_col_1").value = "-0.14644730303013853"
	document.getElementById("row_2_col_1").value = "0.853553271586087"
	document.getElementById("row_3_col_1").value = "-0.49999999999988676"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "-0.853553271586087"
	document.getElementById("row_2_col_2").value = "0.14644615379730097"
	document.getElementById("row_3_col_2").value = "0.5000003366025519"
	document.getElementById("row_4_col_2").value = "0"

	document.getElementById("row_1_col_3").value = "0.49999999999988676"
	document.getElementById("row_2_col_3").value = "0.5000003366025519"
	document.getElementById("row_3_col_3").value = "0.7071065431725605"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "-2.000000952055788"
	document.getElementById("row_2_col_4").value = "2.82842712474603"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "1"
}

function FillSample6() {
	document.getElementById("row_1_col_1").value = "2.999999999999997"
	document.getElementById("row_2_col_1").value = "0.5000000000000007"
	document.getElementById("row_3_col_1").value = "0.5"
	document.getElementById("row_4_col_1").value = "0"

	document.getElementById("row_1_col_2").value = "0.9238794681051637"
	document.getElementById("row_2_col_2").value = "0"
	document.getElementById("row_3_col_2").value = "0"
	document.getElementById("row_4_col_2").value = "-0.3826835878551884"

	document.getElementById("row_1_col_3").value = "0"
	document.getElementById("row_2_col_3").value = "0"
	document.getElementById("row_3_col_3").value = "0"
	document.getElementById("row_4_col_3").value = "0"

	document.getElementById("row_1_col_4").value = "0"
	document.getElementById("row_2_col_4").value = "0"
	document.getElementById("row_3_col_4").value = "0"
	document.getElementById("row_4_col_4").value = "0"
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
		out += et + "\t\"U\": [\n";
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

function DoSnuggle() {
	const M = GetInputMatrix();

	var k = [
		M[0], M[1], M[2]
	]
	var q = [
		M[4], M[5], M[6], M[7]
	]

	const result = snuggle(k, q);

	var up = Mul_QQ(
		
		[result.q.w, result.q.x, result.q.y, result.q.z],
		q
	)

	var out = "{\"";
	out += "\t\"k\":{\n";
	out += "\t\t\"x\" : " + PadFixedNumber(result.k.x) + ",\n";
	out += "\t\t\"y\" : " + PadFixedNumber(result.k.y) + ",\n";
	out += "\t\t\"z\" : " + PadFixedNumber(result.k.z) + "\n";
	out += "\t},\n";
	out += "\t\"q\":{\n";
	out += "\t\t\"w\" : " + PadFixedNumber(result.q.w) + ",\n";
	out += "\t\t\"x\" : " + PadFixedNumber(result.q.x) + ",\n";
	out += "\t\t\"y\" : " + PadFixedNumber(result.q.y) + ",\n";
	out += "\t\t\"z\" : " + PadFixedNumber(result.q.z) + "\n";
	out += "\t},\n";
	out += "\t\"up\":{\n";
	out += "\t\t\"w\" : " + PadFixedNumber(up[0]) + ",\n";
	out += "\t\t\"x\" : " + PadFixedNumber(up[1]) + ",\n";
	out += "\t\t\"y\" : " + PadFixedNumber(up[2]) + ",\n";
	out += "\t\t\"z\" : " + PadFixedNumber(up[3]) + "\n";
	out += "\t},\n";
	out += "}"

	document.getElementById("output").value = out
}

function Mul_QQ(a, b) {
	var out = [];

	const ax = a[1];
	const ay = a[2];
	const az = a[3];
	const aw = a[0];
	const bx = b[1];
	const by = b[2];
	const bz = b[3];
	const bw = b[0];

	out[0] = aw * bw - ax * bx - ay * by - az * bz;
	out[1] = ax * bw + aw * bx + ay * bz - az * by;
	out[2] = ay * bw + aw * by + az * bx - ax * bz;
	out[3] = az * bw + aw * bz + ax * by - ay * bx;

	return out;
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