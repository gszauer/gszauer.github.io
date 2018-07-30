// Quaternions take <w, x, y, z> form, represented as arrays
// Matrices are column matrices laid out linearly in memory
// All vectors are 3d column vectors

var global_enable_early_out = false;
var global_num_iterations = 100

function AffineDecompose(M) {
  const FTResult = FactorTranslation(M); 
  const PolarDecompResult = PolarDecomposition(FTResult.X);
  const Q = Mul4(PolarDecompResult.F, PolarDecompResult.R);
  const SpecDecompResult = SpectoralDecomposition(PolarDecompResult.S);

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
      q : M4ToQ(PolarDecompResult.R), //  Essential rotation (quaternion: <w, x, y, z>)
      u : M4ToQ(SpecDecompResult.U), //  Stretch rotation (quaternion: <w, x, y, z>)
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
function FactorTranslation(M) {
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
function PolarDecomposition(X) {
  var Q = [ // X as a 3x3 matrix
    X[0], X[1], X[2],
    X[4], X[5], X[6],
    X[8], X[9], X[10]
  ]
  if (Det3(Q) < 0) {
    alert("Trying to do polar decompositon, but determinant is negative");
  }
  var Qit = Inverse3(Transpose3(Q));

  var numIterations = 0;

  for (var i = 0; i < global_num_iterations; ++i) {
    const QPrev = [
      Q[0], Q[1], Q[2],
      Q[3], Q[4], Q[5],
      Q[6], Q[7], Q[8]
    ]
    Q = Mul3f(Add3(Q, Qit), 0.5)
    Qit = Inverse3(Transpose3(Q))
    numIterations += 1;

    if (global_enable_early_out && PolarDecompositionEarlyOut(Q, QPrev)) {
      break;
    }
  }

  var f = 1
  var det = Det3(Q)
  if (det < 0.0) {
    f = -1
    Q = Mul3f(Q, -1); 
  }

  const s = Mul3(Inverse3(Q), [
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
function PolarDecompositionEarlyOut(Q, Qprev) {
  const res = Sub3(Q, Qprev);
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
function QRDecomposition(A) {
  var x = [A[0], A[1], A[2]]
  var y = [A[4], A[5], A[6]]
  var z = [A[8], A[9], A[10]]

  // gram schmidt - Orthogonalize A
  y = SubV3(y, Projection(x, y)) // Y equals Y minus the projection of Y onto X
  z = SubV3(SubV3(z, Projection(x, z)), Projection(y, z)) // Z = Projection of z onto x - projection of z onto y

  x = Normalize(x)
  y = Normalize(y)
  z = Normalize(z)

  const Qt = [ // Transpose of Q
    x[0], y[0], z[0],
    x[1], y[1], z[1],
    x[2], y[2], z[2]
  ]

  const r = Mul3(Qt, [
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
function SpectoralDecomposition(S) { 
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

  var numIterations = 0

  for (var i = 0; i < global_num_iterations; ++i) {
    QRFactorization = QRDecomposition([ // Need to pad Ai to be a 4x4 matrix
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

    Qa = Mul3(Qa, Q);
    Ai = Mul3(R, Q);
    numIterations += 1

    if (global_enable_early_out && EigenDecompositionEarlyOut(Ai)) {
      break;
    }
  }

  eigenvalues = [Ai[0], Ai[4], Ai[8]]
  eigenvectors = [
    [Qa[0], Qa[1], Qa[2]],
    [Qa[3], Qa[4], Qa[5]],
    [Qa[6], Qa[7], Qa[8]]
  ]

  //var adjusted = SpectralAxisAdjustment(eigenvectors, eigenvalues)
  //eigenvalues = adjusted.eigenvalues
  //eigenvectors = adjusted.eigenvectors

  // shorthand to save some typing
  var val = eigenvalues;
  var vec = eigenvectors;

  return {
    eigenvalues : eigenvalues,
    eigenvectors : eigenvectors,
    U : [
      vec[0][0], vec[0][1], vec[0][2], 0,
      vec[1][0], vec[1][1], vec[1][2], 0,
      vec[2][0], vec[2][1], vec[2][2], 0,
      0, 0, 0, 1
    ],
    K : [
      val[0], 0, 0, 0,
      0, val[1], 0, 0,
      0, 0, val[2], 0,
      0, 0, 0, 1
    ],
    Ut: [
      vec[0][0], vec[1][0], vec[2][0], 0,
      vec[0][1], vec[1][1], vec[2][1], 0,
      vec[0][2], vec[1][2], vec[2][2], 0,
      0, 0, 0, 1
    ],
    iterations: numIterations
  }
}

// The order of spectoral decomp is busted. Looking at shoemakes code,
// he calls the fix function "snuggle". That's bsiacally what this does
// Only needed when the matrix has a non uniform scale. This function builds
// all permutations of the input eigen vectors into matrices (+6, 6 total)
// Then takes all of the possible positive / negative axis combinations (*8, 48 total)
// but only uses the combinations that are valid to rotate to (/2, 24 total)
// Seeing which ones are rotatable is obvious is you draw out the basis vectors
// Convert all of these matrices into quaternions.
// Choose the one with the largest W component, as it has the smallest rotation
function SpectralAxisAdjustment(eigenvectors, eigenvalues) {
  const x = eigenvectors[0]
  const y = eigenvectors[1]
  const z = eigenvectors[2]

  const a = eigenvalues[0]
  const b = eigenvalues[1]
  const c = eigenvalues[2]

  var U1 = [ 
    x[0],  x[1],  x[2], 
    y[0],  y[1],  y[2], 
    z[0],  z[1],  z[2]
  ]

  var U1t = [
    U1[0], U1[3], U1[6], 
    U1[1], U1[4], U1[7], 
    U1[2], U1[5], U1[8]
  ]

  // ONE OF THESE is U2, gotta pick the right one
  var m_permutations = [
    // Permutation: z, y, z
    [ x[0],  x[1],  x[2],   // + x
      y[0],  y[1],  y[2],   // + y
      z[0],  z[1],  z[2] ], // + z
    [ x[0],  x[1],  x[2],   // + x
     -y[0], -y[1], -y[2],   // - y
     -z[0], -z[1], -z[2] ], // - z
    [-x[0], -x[1], -x[2],   // -x
     -y[0], -y[1], -y[2],   // - y
      z[0],  z[1],  z[2] ], // + z
    [-x[0], -x[1], -x[2],   // - x   
      y[0],  y[1],  y[2],   // + y
     -z[0], -z[1], -z[2] ], // - z
    // Permutation: x, z, y
    [ x[0],  x[1],  x[2], 
      z[0],  z[1],  z[2],  
      y[0],  y[1],  y[2] ],
    [ x[0],  x[1],  x[2],  
     -z[0], -z[1], -z[2],  
     -y[0], -y[1], -y[2] ],
    [-x[0], -x[1], -x[2],  
     -z[0], -z[1], -z[2],  
      y[0],  y[1],  y[2] ],
    [-x[0], -x[1], -x[2],  
      z[0],  z[1],  z[2],  
     -y[0], -y[1], -y[2] ],
    // Permutation: y, x, z
    [ y[0],  y[1],  y[2], 
      x[0],  x[1],  x[2], 
      z[0],  z[1],  z[2] ],
    [ y[0],  y[1],  y[2], 
     -x[0], -x[1], -x[2], 
     -z[0], -z[1], -z[2] ],
    [-y[0], -y[1], -y[2], 
     -x[0], -x[1], -x[2], 
      z[0],  z[1],  z[2] ],
    [-y[0], -y[1], -y[2], 
      x[0],  x[1],  x[2], 
     -z[0], -z[1], -z[2] ],
    // Permutation: y, z, x
    [ y[0],  y[1],  y[2], 
      z[0],  z[1],  z[2], 
      x[0],  x[1],  x[2] ],
    [ y[0],  y[1],  y[2], 
     -z[0], -z[1], -z[2], 
     -x[0], -x[1], -x[2] ],
    [-y[0], -y[1], -y[2], 
     -z[0], -z[1], -z[2], 
      x[0],  x[1],  x[2] ],
    [-y[0], -y[1], -y[2], 
      z[0],  z[1],  z[2], 
     -x[0], -x[1], -x[2] ],
    // Permutation: z, x, y
    [ z[0],  z[1],  z[2], 
      x[0],  x[1],  x[2], 
      y[0],  y[1],  y[2] ],
    [ z[0],  z[1],  z[2], 
     -x[0], -x[1], -x[2], 
     -y[0], -y[1], -y[2] ],
    [-z[0], -z[1], -z[2], 
     -x[0], -x[1], -x[2], 
      y[0],  y[1],  y[2] ],
    [-z[0], -z[1], -z[2], 
      x[0],  x[1],  x[2], 
     -y[0], -y[1], -y[2] ],
    // Permutation: z, y, x
    [ z[0],  z[1],  z[2], 
      y[0],  y[1],  y[2], 
      x[0],  x[1],  x[2] ],
    [ z[0],  z[1],  z[2], 
     -y[0], -y[1], -y[2], 
     -x[0], -x[1], -x[2] ],
    [-z[0], -z[1], -z[2], 
     -y[0], -y[1], -y[2], 
      x[0],  x[1],  x[2] ],
    [-z[0], -z[1], -z[2], 
      y[0],  y[1],  y[2], 
     -x[0], -x[1], -x[2] ],
  ]

  var e_permutations = [
    [ a,  b,  c],
    [ a, -b, -c],
    [-a, -b,  c],
    [-a,  b, -c],

    [ a,  c,  b],
    [ a, -c, -b],
    [-a, -c,  b],
    [-a,  c, -b],
    
    [ b,  a,  c],
    [ b, -a, -c],
    [-b, -a,  c],
    [-b,  a, -c],
    
    [ b,  c,  a],
    [ b, -c, -a],
    [-b, -c,  a],
    [-b,  c, -a],
    
    [ c,  a,  b],
    [ c, -a, -b],
    [-c, -a,  b],
    [-c,  a, -b],
    
    [ c,  b,  a],
    [ c, -b, -a],
    [-c, -b,  a],
    [-c,  b, -a]
  ]

  var saved_index = null
  var saved_value = null

  // The rotation taking U1 into U2 is U1t * U2
    var debug_q = []
  for (var i = 0; i < m_permutations.length; ++i) {
    var U2 = m_permutations[i]

    var QU1 = M4ToQ([
      U1t[0], U1t[1], U1t[2], 0,
      U1t[3], U1t[4], U1t[5], 0,
      U1t[6], U1t[7], U1t[8], 0,
      0, 0, 0, 1
    ]);

    var QU2 = M4ToQ([
      U2[0], U2[1], U2[2], 0,
      U2[3], U2[4], U2[5], 0,
      U2[6], U2[7], U2[8], 0,
      0, 0, 0, 1
    ]);

    var inv = [QU1[0], -QU1[1], -QU1[2], -QU1[3]]
    var q = Mul_QQ(QU2, inv);

    const dot = q[1]*q[1] + q[2]*q[2] + q[3]*q[3] + q[0]*q[0];
    if (dot == 0) {
      alert("Trying to normalize zero quaternion");
    }
    else {
      const n = Math.sqrt(dot);
      q = [
        q[0] / n,
        q[1] / n,
        q[2] / n,
        q[3] / n
      ]
    }

    debug_q.push(q)

    // Optimize for largest w, which is smallest angle of rotation
    if (saved_index == null || q[0] > saved_value) {
      saved_value = q[0]
      saved_index = i
    }
  }

  // We now know what the largest w component (smallest angle of rotation) is.
  // There might be multiples of these! (Especially if two)

  var m = m_permutations[saved_index]
  var q = M4ToQ([
    m[0], m[1], m[2], 0,
    m[3], m[4], m[5], 0,
    m[6], m[7], m[8], 0,
    0, 0, 0, 1
  ])
  var debug_perm = []
  for (var i = 0; i < m_permutations.length; ++i) {
    var l = m_permutations[i]
    debug_perm[i] = M4ToQ([
      l[0], l[1], l[2], 0,
      l[3], l[4], l[5], 0,
      l[6], l[7], l[8], 0,
      0, 0, 0, 1
    ])
  }

  return {
    eigenvectors: [
      [m[0], m[1], m[2]],
      [m[3], m[4], m[5]],
      [m[6], m[7], m[8]]
    ],
    eigenvalues: [
      e_permutations[saved_index][0],
      e_permutations[saved_index][1],
      e_permutations[saved_index][2]
    ]
  }
}

// The lower triangular matrix has zeroed out
function EigenDecompositionEarlyOut(A) {
  if (Math.abs(A[3]) < 0.00001 && Math.abs(A[6]) < 0.00001 && Math.abs(A[7]) < 0.00001) {
    return true;
  }
  return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// Math functions
//////////////////////////////////////////////////////////////////////////////////////////////////

function Q_Angle(a, b) {
  var inv = [a[0], -a[1], -a[2], -a[3]]
  var res = Mul_QQ(b, inv);
  
  return Math.acos(res[0]) * 2.0
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


function Transpose3(m) {
  if (m.length != 9) {
    alert("Trying to transpose non 3x3 matrix");
  }
  return [
    m[0], m[3], m[6],
    m[1], m[4], m[7],
    m[2], m[5], m[8]
  ]
}

function Transpose4(m) {
  if (m.length != 16) {
    alert("Trying to transpose non 4x4 matrix");
  }
  return [
    m[0], m[4], m[8], m[12],
    m[1], m[5], m[9], m[13],
    m[2], m[6], m[10],m[14],
    m[3], m[7], m[11],m[15]
  ]
}

function Inverse3(m) {
  const cofactor_00 =        m[4] * m[8] - m[7] * m[5];
  const cofactor_01 = -1.0 * m[1] * m[8] - m[7] * m[2];
  const cofactor_02 =        m[1] * m[5] - m[4] * m[2];

  const determinant = cofactor_00 * m[0] + cofactor_01 * m[3] + cofactor_02 * m[6];
  if (determinant == 0.0) {
    alert("Matrix does not have an inverse!");
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }

  const inv_determinant = 1.0 / determinant;
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

function Add3(m1, m2) {
  if (m1.length != 9 || m2.length != 9) {
    alert("Trying to add non 3x3 matrices");
  }
  return [
    m1[0] + m2[0], m1[1] + m2[1], m1[2] + m2[2],
    m1[3] + m2[3], m1[4] + m2[4], m1[5] + m2[5],
    m1[6] + m2[6], m1[7] + m2[7], m1[8] + m2[8] 
  ]
}

function Sub3(m1, m2) {
  if (m1.length != 9 || m2.length != 9) {
    alert("Trying to add non 3x3 matrices");
  }
  return [
    m1[0] - m2[0], m1[1] - m2[1], m1[2] - m2[2],
    m1[3] - m2[3], m1[4] - m2[4], m1[5] - m2[5],
    m1[6] - m2[6], m1[7] - m2[7], m1[8] - m2[8] 
  ]
}

function Mul3f(m, f) {
  if (m.length != 9) {
    alert("Trying to scale non 3x3 matrix");
  }
  return [
    m[0] * f, m[1] * f, m[2] * f,
    m[3] * f, m[4] * f, m[5] * f,
    m[6] * f, m[7] * f, m[8] * f
  ]
}

function Mul3(a, b) {
   if (a.length != 9 || b.length != 9) {
    alert("Trying to multiply two non 3x3 matrices");
  }
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
  ]
}

function Mul4(m1, m2) {
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

function Dot(v1, v2) {
  if (v1.length != 3 || v2.length != 3) {
    alert("trying to dot product non vector3's")
  }
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function SubV3(v1, v2) {
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
function Projection(u, v) {
  if (u.length != 3 || v.length != 3) {
    alert("trying to project non vector3's")
  }

  const d1 = Dot(u, v)
  const d2 = Dot(u, u)
  if (d2 == 0) {
    alert("Can't project onto zero vector");
  }
  const d = d1 / d2
  return [u[0] * d, u[1] * d, u[2] * d]
}

function Cross(v1, v2) {
  if (v1.length != 3 || v2.length != 3) {
    alert("trying to cross non vector3's")
  }
  const result = [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];
  return result;
}

function Det3(me) {
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

function Normalize(v) {
  if (v.length != 3) {
    alert("trying to normalize non vector3")
  }
  const dot = Dot(v, v);
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

function QToM4(q) {
  var Q = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  var sqx      = q[0]*q[0];
  var sqy      = q[1]*q[1];
  var sqz      = q[2]*q[2];
  var sqw      = q[3]*q[3];

  Q[0]  = ( sqx - sqy - sqz + sqw);
  Q[5]  = (-sqx + sqy - sqz + sqw);
  Q[10]  = (-sqx - sqy + sqz + sqw);
  var tmp1     = q[0]*q[1];
  var tmp2     = q[2]*q[3];
  Q[4]  = 2.0 * (tmp1 + tmp2);
  Q[1]  = 2.0 * (tmp1 - tmp2);
  tmp1     = q[0]*q[2];
  tmp2     = q[1]*q[3];
  Q[8]  = 2.0 * (tmp1 - tmp2);
  Q[2]  = 2.0 * (tmp1 + tmp2);
  tmp1     = q[1]*q[2];
  tmp2     = q[0]*q[3];
  Q[9]  = 2.0 * (tmp1 + tmp2);
  Q[6]  = 2.0 * (tmp1 - tmp2);

  return Q
}

function M4ToQ(m) {
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