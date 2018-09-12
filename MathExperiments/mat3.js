/* 3x3 Matrix

Matrices are assumed to be column major matrices, stored in memory column by column.

This means, the memory layout (physical topology) of the matrix is as follows:
X.x, X.y, X.z
Y.x, Y.y, Y.z
Z.x, Z.y, Z.z

But conceptually (logical topology), you should think of the matrix as:
X.x, Y.x, Z.x
X.y, Y.y, Z.y
X.z, Y.z, Z.z

So, the basis vectors are column vectors, but they are stored linearly in memory.
This is how OpenGL's matrix documentation works, and frankly it's a pain.
It feels like the matrix is arbitrareley transposed. You have to keep in mind
that the matrix has a different logical and physical topology.

The matrix is stored in memory as a liniar array. The physical topology
of the matrix is laid out in memory like so:
0, 1, 2,
3, 4, 5
6, 7, 8

When you say you want to access row 1, column 2 (zero based) you should think 
in terms of logical topology (Column major basis vectors). So row 1, column 2
would be the element Z.y, or index 5. 

A good way to remember this layout delima is that the matrix is a column
matrix. So whatever column is being accessed is the basis vector being 
accessed. And the row is just the element of the basis vector. 
0: X, 1: Y, 2: Z
This means column 2 is the basis vector Z. Row 1 is element Y.

The two dimensional indices are as expected. Row index is first, column
index is second. When thinking about a row and column indices, they map
in a transposed fashion. Below shows the physical index of each element
mapped to its logical row / column touple 

0 = [0, 0], 1 = [1, 0], 2 = [2, 0] 
3 = [0, 1], 4 = [1, 1], 5 = [2, 1] 
6 = [0, 2], 7 = [1, 2], 8 = [2, 2] 

So, for example, row 1, column 2 would be [1, 2], which is index number 7
If you look at the physical layout, index 7 is Z.y. If we think about it,
column 2 is the Z basis vector and row 1 is the y element. That means the 
above mapping should be correct.*/

// Translate row, column into a linear index. row / col here is assumed to 
// index the logical topology. IE, row 1, col 2 is index 7. This is what
// we are indexing:
/* X.x, Y.x, Z.x
   X.y, Y.y, Z.y
   X.z, Y.z, Z.z */
function M3_ArrayIndex(row, col) {
	return col * 3 + row;
}

// Get a column from the matrix. Works on logical topology
// function is 0 based, valid indices are: 0, 1 and 2
// Matrix is column major, this will return one of the basis vectors
// of the matrix.
// Example, using col 1, the following elements are returned:
// m[3], m[4], m[5]
// Looking at the physical topology of the matrix these indices
// map to the Y basis vector. Remember, the columns are stored
// one after another, so this is what we'd expect to get back
function M3_GetCol(m, col) {
	return [
		m[col * 3 + 0],
		m[col * 3 + 1],
		m[col * 3 + 2]
	]
}

// Get a row from the matrix. Works on logical topology
// function is 0 based, valid indices are: 0, 1, and 2
// Works similar to M3_GetCol
function M3_GetRow(m, row) {
	return [
		m[0 * 3 + row],
		m[1 * 3 + row],
		m[2 * 3 + row]
	]
}

// Multiply two 3x3 matrices together. The result is a 3x3 matrix.
function M3_Mul_M3(a, b) {
	return [
		/* result[0, 0] = a.row[0] DOT b.col[0] */
		a[0] * b[0] + a[3] * b[1] + a[6] * b[2],
		/* result[1, 0] = a.row[1] DOT b.col[0] */
		a[1] * b[0] + a[4] * b[1] + a[7] * b[2],
		/* result[2, 0] = a.row[2] DOT b.col[0] */
		a[2] * b[0] + a[5] * b[1] + a[8] * b[2],

		/* result[0, 1] = a.row[0] DOT b.col[1] */
		a[0] * b[3] + a[3] * b[4] + a[6] * b[5],
		/* result[1, 1] = a.row[1] DOT b.col[1]*/
		a[1] * b[3] + a[4] * b[4] + a[7] * b[5],
		/* result[2, 1] = a.row[2] DOT b.col[1]*/
		a[2] * b[3] + a[5] * b[4] + a[8] * b[5],

		/* result[0, 2] = a.row[0] DOT b.col[2]*/
		a[0] * b[6] + a[3] * b[7] + a[6] * b[8],
		/* result[1, 2] = a.row[1] DOT b.col[2]*/
		a[1] * b[6] + a[4] * b[7] + a[7] * b[8],
		/* result[2, 2] = a.row[2] DOT b.col[2]*/
		a[2] * b[6] + a[5] * b[7] + a[8] * b[8]
	];
}

function M3_Mul_F(m, f) {
	return [
		m[0] * f, m[1] * f, m[2] * f,
		m[3] * f, m[4] * f, m[5] * f,
		m[6] * f, m[7] * f, m[8] * f
	]
}

function M3_Transpose(mat) {
	return [
		mat[0], mat[3], mat[6], 
		mat[1], mat[4], mat[7],
		mat[2], mat[5], mat[8]
	]
}

// https://www.mathsisfun.com/algebra/matrix-inverse-minors-cofactors-adjugate.html
// To find the matrix of minor of a 3x3 matrix, take each element,
// cut the row & column of that element. Take the determinant of
// the resulting 2x2 matrix. To find the determinant of a 2x2 matrix
// subtract the product of its diagonals. IE:
// det |A B| = (A * D) - (B * C) 
//     |C D|
// Remember, we're dealing with column matrices! A column matrix is laid
// out in memory like so: A, C, B, D. Which visually looks like:
// det |[0]: A [1]: C| = (A * D) - (B * C)
//     |[2]: B [3]: D|
// So, working with indices: ([0] * [3]) - ([2] * [1])
function M3_Minor(m) {
	return [
		m[4] * m[8] - m[7] * m[5], /* result[0, 0] = [1, 1] * [2, 2] - [1, 2] * [2, 1] */
		m[3] * m[8] - m[6] * m[5], /* result[1, 0] = [0, 1] * [2, 2] - [0, 2] * [2, 1] */
		m[3] * m[7] - m[6] * m[4], /* result[2, 0] = [0, 1] * [1, 2] - [0, 2] * [1, 1] */

		m[1] * m[8] - m[7] * m[2], /* result[0, 1] = [1, 0] * [2, 2] - [1, 2] * [2, 0] */
		m[0] * m[8] - m[6] * m[2], /* result[1, 1] = [0, 0] * [2, 2] - [0, 2] * [2, 0] */
		m[0] * m[7] - m[6] * m[1], /* result[2, 1] = [0, 0] * [1, 2] - [0, 2] * [1, 0] */

		m[1] * m[5] - m[4] * m[2], /* result[0, 2] = [1, 0] * [2, 1] - [1, 1] * [2, 0] */
		m[0] * m[5] - m[3] * m[2], /* result[1, 2] = [0, 0] * [2, 1] - [0, 1] * [2, 0] */
		m[0] * m[4] - m[3] * m[1]  /* result[2, 2] = [0, 0] * [1, 1] - [0, 1] * [1, 0] */
	]
}

// To find the cofactor, take the minor of the matrix, and raise
// every element (i, j) to the (-1)^(i + j) th power. 
// For example, the first column (basis vector, so logical layout)
// would be: (Indices are 1 based here, sorry for the confusion)
// [0, 0] = -1 ^ (0 + 0) = -1 ^ 0 =  1
// [1, 0] = -1 ^ (1 + 0) = -1 ^ 1 = -1
// [2, 0] = -1 ^ (2 + 0) = -1 ^ 2 =  1
// We can overlay the following pattern onto the matrix:
// + - +
// - + -
// + - +
function M3_Cofactor(m) {
	return [
		        m[4] * m[8] - m[7] * m[5], /* result[0, 0] = [1, 1] * [2, 2] - [1, 2] * [2, 1] */
		-1.0 * (m[3] * m[8] - m[6] * m[5]), /* result[1, 0] = [0, 1] * [2, 2] - [0, 2] * [2, 1] */
		        m[3] * m[7] - m[6] * m[4], /* result[2, 0] = [0, 1] * [1, 2] - [0, 2] * [1, 1] */

		-1.0 * (m[1] * m[8] - m[7] * m[2]), /* result[0, 1] = [1, 0] * [2, 2] - [1, 2] * [2, 0] */
		        m[0] * m[8] - m[6] * m[2], /* result[1, 1] = [0, 0] * [2, 2] - [0, 2] * [2, 0] */
		-1.0 * (m[0] * m[7] - m[6] * m[1]), /* result[2, 1] = [0, 0] * [1, 2] - [0, 2] * [1, 0] */

		        m[1] * m[5] - m[4] * m[2], /* result[0, 2] = [1, 0] * [2, 1] - [1, 1] * [2, 0] */
		-1.0 * (m[0] * m[5] - m[3] * m[2]), /* result[1, 2] = [0, 0] * [2, 1] - [0, 1] * [2, 0] */
		        m[0] * m[4] - m[3] * m[1]  /* result[2, 2] = [0, 0] * [1, 1] - [0, 1] * [1, 0] */
	]
}

// Transpose of the cofactor matrix!
function M3_Adjugate(m) {
	return [
		m[4] *  m[8] - m[7] * m[5],
		-1.0 * (m[1] * m[8] - m[7] * m[2]),
		m[1] *  m[5] - m[4] * m[2],

		-1.0 * (m[3] * m[8] - m[6] * m[5]),
		m[0] *  m[8] - m[6] * m[2], 
		-1.0 * (m[0] * m[5] - m[3] * m[2]),

		m[3] *  m[7] - m[6] * m[4],
		-1.0 * (m[0] * m[7] - m[6] * m[1]),
		m[0] *  m[4] - m[3] * m[1]
	]
}

// https://www.chilimath.com/lessons/advanced-algebra/determinant-3x3-matrix/
// To find the determinant of a 3x3 matrix: sum the product of
// every element in the first row with it's cofactor. This operates on the 
// logical topology of the matrix, so it's the cofactor of the x element
// of each basis vector!
function M3_Determinant(m) {
	const cofactor_00 =         m[4] * m[8] - m[7] * m[5];
	const cofactor_01 = -1.0 * (m[1] * m[8] - m[7] * m[2]);
	const cofactor_02 =         m[1] * m[5] - m[4] * m[2];

	return cofactor_00 * m[0] + cofactor_01 * m[3] + cofactor_02 * m[6];
}

// Inverse of a matrix = adjugate / determinant
function M3_Inverse(m) {
	const cofactor_00 =         m[4] * m[8] - m[7] * m[5];
	const cofactor_01 = -1.0 * (m[1] * m[8] - m[7] * m[2]);
	const cofactor_02 =         m[1] * m[5] - m[4] * m[2];

	const determinant = cofactor_00 * m[0] + cofactor_01 * m[3] + cofactor_02 * m[6];
	if (isNaN(determinant)) {
		alert("Determinant is nan");
	}
	if (determinant == 0.0) {
		alert("Matrix does not have an inverse!");
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
	}

	const inv_determinant = 1.0 / determinant;
	if (isNaN(inv_determinant)) {
		alert("Inv-determinant is nan");
	}
	if (inv_determinant == 0.0) {
		alert("Matrix does not have an inverse!");
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
	}

	const adjugate = [
		m[4] * m[8] - m[7] * m[5],
		-1.0 * (m[1] * m[8] - m[7] * m[2]),
		m[1] * m[5] - m[4] * m[2],

		-1.0 * (m[3] * m[8] - m[6] * m[5]),
		m[0] * m[8] - m[6] * m[2], 
		-1.0 * (m[0] * m[5] - m[3] * m[2]),

		m[3] * m[7] - m[6] * m[4],
		-1.0 * (m[0] * m[7] - m[6] * m[1]),
		m[0] * m[4] - m[3] * m[1]
	]

	return [
		adjugate[0] * inv_determinant, adjugate[1] * inv_determinant, adjugate[2] * inv_determinant, 
		adjugate[3] * inv_determinant, adjugate[4] * inv_determinant, adjugate[5] * inv_determinant, 
		adjugate[6] * inv_determinant, adjugate[7] * inv_determinant, adjugate[8] * inv_determinant, 
	]
} 