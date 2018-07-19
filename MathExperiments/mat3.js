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
function M3_ArrayIndex(m, row, col) {
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