// Quaternions take <w, x, y, z> form, represented as arrays
// Matrices are column matrices laid out linearly in memory
// All vectors are 3d column vectors

var affine = { }

function AffineDecompose(M) {
  return affine.AffineDecompose(M);
}

affine.AffineDecompose = function(M) {
  const FTResult = affine.FactorTranslation(M); 
  const PolarDecompResult = affine.PolarDecomposition(FTResult.X);
  const Q = affine.Mul4(PolarDecompResult.F, PolarDecompResult.R);
  const SpecDecompResult = affine.SpectoralDecomposition(PolarDecompResult.S);

  return {
    // M = TX
    TX : {
      T : FTResult.T, // 4x4 column matrix, linear memory layout
      X : FTResult.X // 4x4 column matrix, linear memory layout
    },

    // M = TQS
    TQS : {
      T : FTResult.T, // 4x4 column matrix, linear memory layout
      Q : Q, // 4x4 column matrix, linear memory layout
      S : PolarDecompResult.S // 4x4 column matrix, linear memory layout
    },

    // M = TFRS
    TFRS : {
      T : FTResult.T, // 4x4 column matrix, linear memory layout
      F : PolarDecompResult.F, // 4x4 column matrix, linear memory layout
      R : PolarDecompResult.R, // 4x4 column matrix, linear memory layout
      S : PolarDecompResult.S // 4x4 column matrix, linear memory layout
    },

    // M = TFRUKU*
    TFRUKUt : {
      T : FTResult.T, // 4x4 column matrix, linear memory layout
      F : PolarDecompResult.F, // 4x4 column matrix, linear memory layout
      R : PolarDecompResult.R, // 4x4 column matrix, linear memory layout
      U : SpecDecompResult.U, // 4x4 column matrix, linear memory layout
      K : SpecDecompResult.K, // 4x4 column matrix, linear memory layout
      Ut : SpecDecompResult.Ut // 4x4 column matrix, linear memory layout
    },

    // Shoemake reference output (sample code from graphics gems 4)
    Shoemake : { 
      t : [FTResult.T[12], FTResult.T[13], FTResult.T[14]], // Translation components (vector: <x, y, z>)
      q : affine.M4ToQ(PolarDecompResult.R), //  Essential rotation (quaternion: <w, x, y, z>)
      u : affine.M4ToQ(SpecDecompResult.U), //  Stretch rotation (quaternion: <w, x, y, z>)
      k : [SpecDecompResult.K[0], SpecDecompResult.K[5], SpecDecompResult.K[10]], // Stretch factors (vector: <x, y, z>)
      f : PolarDecompResult.F[0] // Sign of determinant (float)
    },

    // Debug info on number of iterations takes
    Iterations : {
      polar: PolarDecompResult.iterations,
      spect: SpecDecompResult.iterations
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// Decompositon functions
//////////////////////////////////////////////////////////////////////////////////////////////////

// Factor M = TX where T contains translation information a
// and X contains some affinite transform (rotation & scale)
affine.FactorTranslation = function(M) {
  return {
    T : [ // Original matrix with translation only
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      M[12], M[13], M[14], 1
    ],
    X : [ // Original matrix with no translation
      M[0], M[1], M[2], 0,
      M[4], M[5], M[6], 0,
      M[8], M[9], M[10], 0,
      0, 0, 0, 1
    ]
  }
}

// https://csmbrannon.net/2013/02/14/illustration-of-polar-decomposition/
// Decompose X so that X = QS where Q a rotation matrix
// and S is a symetric matrix describing a deformation
// That is, S contains scale and skew data
// Q is factored into FR where R is a rotation and F is
// either positive or negative identiy. This makes sure that
// R contains no flip information.
affine.PolarDecomposition = function(X) {
  var Q = [ // X as a 3x3 matrix
    X[0], X[1], X[2],
    X[4], X[5], X[6],
    X[8], X[9], X[10]
  ]
  if (affine.Det3(Q) < 0) {
    alert("Trying to do polar decompositon, but determinant is negative");
  }
  var Qit = affine.Inverse3(affine.Transpose3(Q));

  var numIterations = 20;

  for (var i = 0; i < 20; ++i) {
    const QPrev = [
      Q[0], Q[1], Q[2],
      Q[3], Q[4], Q[5],
      Q[6], Q[7], Q[8]
    ]
    Q = affine.Mul3f(affine.Add3(Q, Qit), 0.5)
    Qit = affine.Inverse3(affine.Transpose3(Q))
    
    if (affine.PolarDecompositionEarlyOut(Q, QPrev)) {
      numIterations = i;
      break;
    }
  }

  var f = 1
  var det = affine.Det3(Q)
  if (det < 0.0) {
    f = -1
    Q = affine.Mul3f(Q, -1); 
  }

  const s = affine.Mul3(affine.Inverse3(Q), [
    X[0], X[1], X[2],
    X[4], X[5], X[6],
    X[8], X[9], X[10]
  ]);

  return {
    F : [ // Flip (either positive or negative identity)
      f, 0, 0, 0,
      0, f, 0, 0,
      0, 0, f, 0,
      0, 0, 0, 1
    ], 
    R : [ // Rotation
      Q[0], Q[1], Q[2], 0,
      Q[3], Q[4], Q[5], 0,
      Q[6], Q[7], Q[8], 0,
      0, 0, 0, 1
    ], 
    S : [ // Deformation (Scale & skew)
      s[0], s[1], s[2], 0,
      s[3], s[4], s[5], 0,
      s[6], s[7], s[8], 0,
      0, 0, 0, 1
    ],
    determinant : det,
    iterations: numIterations
  }
}

// http://research.cs.wisc.edu/graphics/Courses/838-s2002/Papers/polar-decomp.pdf
affine.PolarDecompositionEarlyOut = function(Q, Qprev) {
  const res = affine.Sub3(Q, Qprev);
  for (var i = 0; i < 9; ++i) {
    if (Math.abs(res[i]) > 0.00001) {
      return false;
    }
  }
  return true;
}

// https://www.youtube.com/watch?v=c_QCR20nTDY
// QR Decomposition / QR Factorization
// Decompose matrix A into a product A = QR where
// Q is an orthogonal matrix and R is an upper
// triangular matrix. This method is a support method
// for the QR Alrorithm / Spectoral Decomposition
affine.QRDecomposition = function(A) {
  var x = [A[0], A[1], A[2]]
  var y = [A[4], A[5], A[6]]
  var z = [A[8], A[9], A[10]]

  // gram schmidt - Orthogonalize A
  y = affine.SubV3(y, affine.Projection(x, y)) // Y equals Y minus the projection of Y onto X
  z = affine.SubV3(affine.SubV3(z, affine.Projection(x, z)), affine.Projection(y, z)) // Z = Projection of z onto x - projection of z onto y

  x = affine.Normalize(x)
  y = affine.Normalize(y)
  z = affine.Normalize(z)

  const Qt = [ // Transpose of Q
    x[0], y[0], z[0],
    x[1], y[1], z[1],
    x[2], y[2], z[2]
  ]

  const r = affine.Mul3(Qt, [
    A[0], A[1], A[2],
    A[4], A[5], A[6],
    A[8], A[9], A[10]
  ])

  return {
    Q : [ // Ortho normal rotation basis
      x[0], x[1], x[2], 0,
      y[0], y[1], y[2], 0,
      z[0], z[1], z[2], 0,
      0, 0, 0, 1
    ],
    R : [ // Upper triangular matrix
      r[0], r[1], r[2], 0,
      r[3], r[4], r[5], 0,
      r[6], r[7], r[8], 0,
      0, 0, 0, 1
    ]
  }
}

// QR Algorithm, Spectoral Decomposition, Eigen Decompositon
// Factorize matrix into canonical form, so that
// it is represented in terms of eigenvectors and eigenvalues
// S = UKUt where K is the eigenvalues on the main diagonal
// and U is the eigenvectors packed into a matrix
affine.SpectoralDecomposition = function(S) { 
  var QRFactorization = null
  var Q = null
  var R = null
  var Ai = [ // Only care about S as a 3x3 matrix
    S[0], S[1], S[2],
    S[4], S[5], S[6],
    S[8], S[9], S[10]
  ]

  // From wikipedia: https://en.wikipedia.org/wiki/QR_algorithm
  // The eigenvectors are an accumulation of all the orthogonal
  // transforms needed to get to the matrix conversion
  var Qa = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]

  var numIterations = 20

  for (var i = 0; i < 20; ++i) {
    QRFactorization = affine.QRDecomposition([ // Need to pad Ai to be a 4x4 matrix
      Ai[0], Ai[1], Ai[2], 0,
      Ai[3], Ai[4], Ai[5], 0,
      Ai[6], Ai[7], Ai[8], 0,
      0, 0, 0, 1
    ])

    Q = [ // QRFactorization.Q as a 3x3 matrix
      QRFactorization.Q[0], QRFactorization.Q[1], QRFactorization.Q[2],
      QRFactorization.Q[4], QRFactorization.Q[5], QRFactorization.Q[6],
      QRFactorization.Q[8], QRFactorization.Q[9], QRFactorization.Q[10]
    ];

    R = [ // QRFactorization.R as a 3x3 matrix
      QRFactorization.R[0], QRFactorization.R[1], QRFactorization.R[2],
      QRFactorization.R[4], QRFactorization.R[5], QRFactorization.R[6],
      QRFactorization.R[8], QRFactorization.R[9], QRFactorization.R[10]
    ]

    Qa = affine.Mul3(Qa, Q);
    Ai = affine.Mul3(R, Q);

    if (affine.EigenDecompositionEarlyOut(Ai)) {
      numIterations = i
      break;
    }
  }

  return {
    eigenvalues : [
      Ai[0], Ai[4], Ai[8]
    ],
    eigenvectors : [
      [Qa[0], Qa[1], Qa[2]],
      [Qa[3], Qa[4], Qa[5]],
      [Qa[6], Qa[7], Qa[8]]
    ],
    U : [
      Qa[0], Qa[1], Qa[2], 0,
      Qa[3], Qa[4], Qa[5], 0,
      Qa[6], Qa[7], Qa[8], 0,
      0, 0, 0, 1
    ],
    K : [
      Ai[0], 0, 0, 0,
      0, Ai[4], 0, 0,
      0, 0, Ai[8], 0,
      0, 0, 0, 1
    ],
    Ut: [
      Qa[0], Qa[3], Qa[6], 0,
      Qa[1], Qa[4], Qa[7], 0,
      Qa[2], Qa[5], Qa[8], 0,
      0, 0, 0, 1
    ],
    iterations: numIterations
  }
}

// The lower triangular matrix has zeroed out
affine.EigenDecompositionEarlyOut = function(A) {
  if (Math.abs(A[3]) < 0.00001 && Math.abs(A[6]) < 0.00001 && Math.abs(A[7]) < 0.00001) {
    return true;
  }
  return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// Math functions
//////////////////////////////////////////////////////////////////////////////////////////////////
affine.Transpose3 = function(m) {
  if (m.length != 9) {
    alert("Trying to transpose non 3x3 matrix");
  }
  return [
    m[0], m[3], m[6],
    m[1], m[4], m[7],
    m[2], m[5], m[8]
  ]
}

affine.Inverse3 = function(me) {
  if (me.length != 9) {
    alert("Trying to invert non 3x3 matrix");
  }
  var te = []

  var n11 = me[ 0 ]; var n21 = me[ 1 ]; var n31 = me[ 2 ];
  var n12 = me[ 3 ]; var n22 = me[ 4 ]; var n32 = me[ 5 ];
  var n13 = me[ 6 ]; var n23 = me[ 7 ]; var n33 = me[ 8 ];

  var t11 = n33 * n22 - n32 * n23;
  var t12 = n32 * n13 - n33 * n12;
  var t13 = n23 * n12 - n22 * n13;

  var det = n11 * t11 + n21 * t12 + n31 * t13;

  if ( det === 0 ) {
    alert("Can't invert matrix, determinant is 0")
    return me;
  }

  var detInv = 1 / det;

  te[ 0 ] = t11 * detInv;
  te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
  te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

  te[ 3 ] = t12 * detInv;
  te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
  te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

  te[ 6 ] = t13 * detInv;
  te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
  te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

  return te;
}

affine.Add3 = function(m1, m2) {
  if (m1.length != 9 || m2.length != 9) {
    alert("Trying to add non 3x3 matrices");
  }
  return [
    m1[0] + m2[0], m1[1] + m2[1], m1[2] + m2[2],
    m1[3] + m2[3], m1[4] + m2[4], m1[5] + m2[5],
    m1[6] + m2[6], m1[7] + m2[7], m1[8] + m2[8] 
  ]
}

affine.Sub3 = function(m1, m2) {
  if (m1.length != 9 || m2.length != 9) {
    alert("Trying to add non 3x3 matrices");
  }
  return [
    m1[0] - m2[0], m1[1] - m2[1], m1[2] - m2[2],
    m1[3] - m2[3], m1[4] - m2[4], m1[5] - m2[5],
    m1[6] - m2[6], m1[7] - m2[7], m1[8] - m2[8] 
  ]
}

affine.Mul3f = function(m, f) {
  if (m.length != 9) {
    alert("Trying to scale non 3x3 matrix");
  }
  return [
    m[0] * f, m[1] * f, m[2] * f,
    m[3] * f, m[4] * f, m[5] * f,
    m[6] * f, m[7] * f, m[8] * f
  ]
}

affine.Mul3 = function(m1, m2) {
  if (m2.length != 9 || m1.length != 9) {
    alert("Trying to multiply two non 3x3 matrices");
  }
  var result = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ]

  result[0] = m2[0] * m1[0] + m2[1] * m1[3] + m2[2] * m1[6]
  result[1] = m2[0] * m1[1] + m2[1] * m1[4] + m2[2] * m1[7]
  result[2] = m2[0] * m1[2] + m2[1] * m1[5] + m2[2] * m1[8]
  
  result[3] = m2[3] * m1[0] + m2[4] * m1[3] + m2[5] * m1[6]
  result[4] = m2[3] * m1[1] + m2[4] * m1[4] + m2[5] * m1[7]
  result[5] = m2[3] * m1[2] + m2[4] * m1[5] + m2[5] * m1[8]

  result[6] = m2[6] * m1[0] + m2[7] * m1[3] + m2[8] * m1[6]
  result[7] = m2[6] * m1[1] + m2[7] * m1[4] + m2[8] * m1[7]
  result[8] = m2[6] * m1[2] + m2[7] * m1[5] + m2[8] * m1[8]

  return result;
}

affine.Mul4 = function(m1, m2) {
  if (m2.length!= 16 || m1.length != 16) {
    alert("Trying to multiply two non 4x4 matrices");
  }
  var result = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  result[0] = m2[0] * m1[0] + m2[1] * m1[4] + m2[2] * m1[8] + m2[3] *m1[12]
  result[1] = m2[0] * m1[1] + m2[1] * m1[5] + m2[2] * m1[9] + m2[3] *m1[13]
  result[2] = m2[0] * m1[2] + m2[1] * m1[6] + m2[2] *m1[10] + m2[3] *m1[14]
  result[3] = m2[0] * m1[3] + m2[1] * m1[7] + m2[2] *m1[11] + m2[3] *m1[15]

  result[4] = m2[4] * m1[0] + m2[5] * m1[4] + m2[6] * m1[8] + m2[7] *m1[12]
  result[5] = m2[4] * m1[1] + m2[5] * m1[5] + m2[6] * m1[9] + m2[7] *m1[13]
  result[6] = m2[4] * m1[2] + m2[5] * m1[6] + m2[6] *m1[10] + m2[7] *m1[14]
  result[7] = m2[4] * m1[3] + m2[5] * m1[7] + m2[6] *m1[11] + m2[7] *m1[15]

  result[8] = m2[8] * m1[0] + m2[9] * m1[4] +m2[10] * m1[8] +m2[11] *m1[12]
  result[9] = m2[8] * m1[1] + m2[9] * m1[5] +m2[10] * m1[9] +m2[11] *m1[13]
  result[10]= m2[8] * m1[2] + m2[9] * m1[6] +m2[10] *m1[10] +m2[11] *m1[14]
  result[11]= m2[8] * m1[3] + m2[9] * m1[7] +m2[10] *m1[11] +m2[11] *m1[15]

  result[12]=m2[12] * m1[0] +m2[13] * m1[4] +m2[14] * m1[8] +m2[15] *m1[12]
  result[13]=m2[12] * m1[1] +m2[13] * m1[5] +m2[14] * m1[9] +m2[15] *m1[13]
  result[14]=m2[12] * m1[2] +m2[13] * m1[6] +m2[14] *m1[10] +m2[15] *m1[14]
  result[15]=m2[12] * m1[3] +m2[13] * m1[7] +m2[14] *m1[11] +m2[15] *m1[15]

  return result;
}

affine.Dot = function(v1, v2) {
  if (v1.length != 3 || v2.length != 3) {
    alert("trying to dot product non vector3's")
  }
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

affine.SubV3 = function(v1, v2) {
  if (v1.length != 3 || v2.length != 3) {
    alert("trying to subtract non vector3's")
  }
  return [
    v1[0] - v2[0],
    v1[1] - v2[1],
    v1[2] - v2[2]
  ]
}

// Project v onto u
affine.Projection = function(u, v) {
  if (u.length != 3 || v.length != 3) {
    alert("trying to project non vector3's")
  }

  const d1 = affine.Dot(u, v)
  const d2 = affine.Dot(u, u)
  if (d2 == 0) {
    alert("Can't project onto zero vector");
  }
  const d = d1 / d2
  return [u[0] * d, u[1] * d, u[2] * d]
}

affine.Det3 = function(me) {
  if (me.length != 9) {
    alert("Trying to get the determinant of a non 3x3 matrix");
  }
  var n11 = me[ 0 ]; var n21 = me[ 1 ]; var n31 = me[ 2 ];
  var n12 = me[ 3 ]; var n22 = me[ 4 ]; var n32 = me[ 5 ];
  var n13 = me[ 6 ]; var n23 = me[ 7 ]; var n33 = me[ 8 ];

  var t11 = n33 * n22 - n32 * n23;
  var t12 = n32 * n13 - n33 * n12;
  var t13 = n23 * n12 - n22 * n13;

  return n11 * t11 + n21 * t12 + n31 * t13;
}

affine.Normalize = function(v) {
  if (v.length != 3) {
    alert("trying to normalize non vector3")
  }
  const dot = affine.Dot(v, v);
  if (dot !== 0.0) {
    const length = Math.sqrt(dot);
    const result = [
      v[0] / length,
      v[1] / length,
      v[2] / length
    ];
    return result;
  }
  alert("Cant normalize zero vector");
  return v;
}

affine.M4ToQ = function(m) {
  var m00 = m[0]
  var m01 = m[4]
  var m02 = m[8]

  var m10 = m[1]
  var m11 = m[5]
  var m12 = m[9]

  var m20 = m[2]
  var m21 = m[6]
  var m22 = m[10]

  var tr = m00 + m11 + m22
  var w, x, y, z;

  if (tr > 0) { 
    var S = Math.sqrt(tr+1.0) * 2; // S=4*qw 
    w = 0.25 * S;
    x = (m21 - m12) / S;
    y = (m02 - m20) / S; 
    z = (m10 - m01) / S; 
  } else if ((m00 > m11)&&(m00 > m22)) { 
    var S = Math.sqrt(1.0 + m00 - m11 - m22) * 2; // S=4*qx 
    w = (m21 - m12) / S;
    x = 0.25 * S;
    y = (m01 + m10) / S; 
    z = (m02 + m20) / S; 
  } else if (m11 > m22) { 
    var S = Math.sqrt(1.0 + m11 - m00 - m22) * 2; // S=4*qy
    w = (m02 - m20) / S;
    x = (m01 + m10) / S; 
    y = 0.25 * S;
    z = (m12 + m21) / S; 
  } else { 
    var S = Math.sqrt(1.0 + m22 - m00 - m11) * 2; // S=4*qz
    w = (m10 - m01) / S;
    x = (m02 + m20) / S;
    y = (m12 + m21) / S;
    z = 0.25 * S;
  }

  var q = [w, x, y, z]

  // Normalize Q
  const dot = q[1]*q[1] + q[2]*q[2] + q[3]*q[3] + q[0]*q[0];
  if (dot == 0) {
    alert("Trying to normalize zero quaternion");
    return q;
  }
  const n = Math.sqrt(dot);
  const result = [
    q[0] / n,
    q[1] / n,
    q[2] / n,
    q[3] / n
  ]
  return result;
}