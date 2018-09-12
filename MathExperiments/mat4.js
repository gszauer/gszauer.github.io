/* 4x4 Matrix

Matrices are assumed to be column major matrices, stored in memory column by column.

This means, the memory layout (physical topology) of the matrix is as follows:
X.x, X.y, X.z 0
Y.x, Y.y, Y.z 0
Z.x, Z.y, Z.z 0
T.x, T.y, T.z 1

But conceptually (logical topology), you should think of the matrix as:
X.x, Y.x, Z.x, T.x
X.y, Y.y, Z.y, T.y
X.z, Y.z, Z.z, T.z
  0,   0,   0,   1

So, the basis vectors are column vectors, but they are stored linearly in memory.
This is how OpenGL's matrix documentation works, and frankly it's a pain.
It feels like the matrix is arbitrareley transposed. You have to keep in mind
that the matrix has a different logical and physical topology.

The matrix is stored in memory as a liniar array. The physical topology
of the matrix is laid out in memory like so:
 0,  1,  2,  3,
 4,  5,  6,  7,
 8,  9, 10, 11,
12, 13, 14, 15

When you say you want to access row 1, column 2 (zero based) you should think 
in terms of logical topology (Column major basis vectors). So row 1, column 2
would be the element Z.y, or index 9. 

A good way to remember this layout delima is that the matrix is a column
matrix. So whatever column is being accessed is the basis vector being 
accessed. And the row is just the element of the basis vector. 
0: X, 1: Y, 2: Z, 3: W
This means column 2 is the basis vector Z. Row 1 is element Y.

The two dimensional indices are as expected. Row index is first, column
index is second. When thinking about a row and column indices, they map
in a transposed fashion. Below shows the physical index of each element
mapped to its logical row / column touple 

 0 = [0, 0],  1 = [1, 0],  2 = [2, 0],  3 = [3, 0]
 4 = [0, 1],  5 = [1, 1],  6 = [2, 1],  7 = [3, 1]
 8 = [0, 2],  9 = [1, 2], 10 = [2, 2], 11 = [3, 2]
12 = [0, 3], 13 = [1, 3], 14 = [2, 3], 15 = [3, 3]

So, for example, row 1, column 2 would be [1, 2], which is index number 9
If you look at the physical layout, index 7 is Z.y. If we think about it,
column 2 is the Z basis vector and row 1 is the y element. That means the 
above mapping should be correct.*/

// Translate row, column into a linear index. row / col here is assumed to 
// index the logical topology. IE, row 1, col 2 is index 9. This is what
// we are indexing:
/* X.x, Y.x, Z.x, T.x
   X.y, Y.y, Z.y, T.y
   X.z, Y.z, Z.z, T.z
     0,   0,   0,   1 */
function M4_ArrayIndex(row, col) {
	return col * 4 + row; 
}

// Get a column from the matrix. Works on logical topology
// function is 0 based, valid indices are: 0, 1, 2 and 3
// Matrix is column major, this will return one of the basis vectors
// of the matrix.
// Example, using col 1, the following elements are returned:
// m[4], m[5], m[6], m[7]
// Looking at the physical topology of the matrix these indices
// map to the Y basis vector. Remember, the columns are stored
// one after another, so this is what we'd expect to get back
function M4_GetCol(m, col) {
	return [
		m[col * 4 + 0],
		m[col * 4 + 1],
		m[col * 4 + 2],
		m[col * 4 + 3]
	]
}

// Get a row from the matrix. Works on logical topology
// function is 0 based, valid indices are: 0, 1, 2 and 3
// Works similar to M4_GetCol
function M4_GetRow(m, row) {
	return [
		m[0 * 4 + row],
		m[1 * 4 + row],
		m[2 * 4 + row],
		m[3 * 4 + row]
	]
}

// Multiply two 4x4 matrices together. The result is a 4x4 matrix.
// Should be equivalent to: http://www.wolframalpha.com/widgets/view.jsp?id=cc71c2e95a80c217564d530fd8297b0e
function M4_Mul_M4(a, b) {
	return [
		/* result[0, 0] = a.row[0] DOT b.col[0] */
		a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
		/* result[1, 0] = a.row[1] DOT b.col[0] */
		a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
		/* result[2, 0] = a.row[2] DOT b.col[0] */
		a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
		/* result[3, 0] = a.row[3] DOT b.col[0] */
		a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],

		/* result[0, 1] = a.row[0] DOT b.col[1] */
		a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
		/* result[1, 1] = a.row[1] DOT b.col[1] */
		a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
		/* result[2, 1] = a.row[2] DOT b.col[1] */
		a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
		/* result[3, 1] = a.row[3] DOT b.col[1] */
		a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],

		/* result[0, 2] = a.row[0] DOT b.col[2] */
		a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
		/* result[1, 2] = a.row[1] DOT b.col[2] */
		a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
		/* result[2, 2] = a.row[2] DOT b.col[2] */
		a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
		/* result[3, 2] = a.row[3] DOT b.col[2] */
		a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],

		/* result[0, 3] = a.row[0] DOT b.col[3] */
		a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
		/* result[1, 3] = a.row[1] DOT b.col[3] */
		a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
		/* result[2, 3] = a.row[2] DOT b.col[3] */
		a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
		/* result[3, 3] = a.row[3] DOT b.col[3] */
		a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
	];
}

function M4_Mul_F(m, f) {
	return [
		m[0] * f, m[1] * f, m[2] * f, m[3] * f,
		m[4] * f, m[5] * f, m[6] * f, m[7] * f,
		m[8] * f, m[9] * f, m[10]* f, m[11]* f,
		m[12]* f, m[13]* f, m[14]* f, m[15]* f
	]
}

function M4_Transpose(m) {
	return [
		m[0], m[4], m[8],  m[12],
		m[1], m[5], m[9],  m[13],
		m[2], m[6], m[10], m[14],
		m[3], m[7], m[11], m[15]
	]
}

function M4_Minor(m) {
	return [

	]
}