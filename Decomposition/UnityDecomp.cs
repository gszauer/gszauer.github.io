using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Decomposition {
	public class AffineResult {
		public Vector3 t;
		public Quaternion q;
		public Quaternion u;
		public Vector3 k;
		public float f;

		public override string ToString() {
			string output = "";

			output += "t: (" + t.x + ", " + t.y + ", " + t.z + ")\n";
			output += "q: (" + q.w + "|" + q.x + ", " + q.y + ", " + q.z + ")\n";
			output += "u: (" + u.w + "|" + u.x + ", " + u.y + ", " + u.z + ")\n";
			output += "k: (" + k.x + ", " + k.y + ", " + k.z + ")\n";
			output += "f: " + f;

			return output;
		}
	}

	public class PolarResult {
		public Matrix4x4 F;
		public Matrix4x4 R;
		public Matrix4x4 S;

		public float determinant;
		public int numIteration;

		public override string ToString() {
			string output = "F:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += F[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}
			output += "R:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += R[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}
			output += "S:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += S[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}
			output += "Determinant: " + determinant + "\n";
			output += "Num Iterations: " + numIteration;

			return output;
		}
	}

	public class SpectoralResult {
		public Matrix4x4 U;
		public Matrix4x4 K;
		public Matrix4x4 Ut;
		public Vector3 eigenvalues;
		public Vector3[] eigenvectors;
		public int numIteration;

		public override string ToString() {
			string output = "U:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += U[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}
			output += "K:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += K[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}
			output += "Ut:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += Ut[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}
			output += "eigenvalues: (" + eigenvalues.x + ", " + eigenvalues.y + ", " + eigenvalues.z + ")\n";
			output += "eigenvectors[0]: (" + eigenvectors[0].x + ", " + eigenvectors[0].y + ", " + eigenvectors[0].z + ")\n";
			output += "eigenvectors[1]: (" + eigenvectors[1].x + ", " + eigenvectors[1].y + ", " + eigenvectors[1].z + ")\n";
			output += "eigenvectors[2]: (" + eigenvectors[2].x + ", " + eigenvectors[2].y + ", " + eigenvectors[2].z + ")\n";
			output += "Num Iterations: " + numIteration;

			return output;
		}
	}

	public class QRResult {
		public Matrix4x4 Q;
		public Matrix4x4 R;

		public override string ToString() {
			string output = "Q:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += Q[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}
			output += "R:\n";
			for (int row = 0; row < 4; ++row) {
				for (int col = 0; col < 4; ++ col) {
					output += R[row, col];
					if (col != 3) {
						output += ",";
					}
				}
				output += "\n";
			}

			return output;
		}
	}

	public static int NumIterations = 20;

	public static AffineResult Affine(Matrix4x4 m) {
		Matrix4x4 T = Matrix4x4.identity;
		T[0, 3] = m[0, 3];
		T[1, 3] = m[1, 3];
		T[2, 3] = m[2, 3];

		Matrix4x4 X = Matrix4x4.identity;
		X[0, 0] = m[0, 0]; X[0, 1] = m[0, 1]; X[0, 2] = m[0, 2];
		X[1, 0] = m[1, 0]; X[1, 1] = m[1, 1]; X[1, 2] = m[1, 2];
		X[2, 0] = m[2, 0]; X[2, 1] = m[2, 1]; X[2, 2] = m[2, 2];

		PolarResult polar = Polar(X);
		SpectoralResult spect = Spectoral(polar.S);

		AffineResult r = new AffineResult();
		r.t = new Vector3(T[0, 3], T[1, 3], T[2, 3]);
		r.q = Quaternion.LookRotation(polar.R.GetColumn(2), polar.R.GetColumn(1));
		r.u = Quaternion.LookRotation(spect.U.GetColumn(2), spect.U.GetColumn(1));
		r.k = new Vector3(spect.K[0, 0], spect.K[1, 1], spect.K[2, 2]);
		r.f = polar.F[0, 0];
		return r;
	}

	public static PolarResult Polar(Matrix4x4 x) {
		x[0, 3] = 0; x[1, 3] = 0; x[2, 3] = 0;

		Matrix4x4 Q = Matrix4x4.identity;
		Q[0, 0] = x[0, 0]; Q[0, 1] = x[0, 1]; Q[0, 2] = x[0, 2];
		Q[1, 0] = x[1, 0]; Q[1, 1] = x[1, 1]; Q[1, 2] = x[1, 2];
		Q[2, 0] = x[2, 0]; Q[2, 1] = x[2, 1]; Q[2, 2] = x[2, 2];

		if (Q.determinant < 0) {
			Debug.LogError("Trying to do polar decomposition on matrix with negative determinant");
		}

		Matrix4x4 Qit = Q.transpose.inverse;

		int numIteration = NumIterations;
		for (int i = 0; i < NumIterations; ++i) {
			Matrix4x4 QPrev = Q;

			Q = MulMatFlt(AddMatMat(Q, Qit), 0.5f);
			Qit = Q.transpose.inverse;

			if (PolarEarlyOut(Q, QPrev)) {
				numIteration = i;
				break;
			}
		}

		float f = 1.0f;
		float det = Q.determinant;

		if (det < 0.0f) {
			f = -1.0f;
			Q = MulMatFlt(Q, -1.0f);
		}

		PolarResult r = new PolarResult();
		r.F = Matrix4x4.identity;
		r.F[0, 0] = f; r.F[1, 1] = f; r.F[2, 2] = f;
		r.R = Q;
		r.S = Q.inverse * x;
		r.determinant = det;
		r.numIteration = numIteration;

		return r;
	}

	public static QRResult QR(Matrix4x4 a) {
		a[0, 3] = 0; a[1, 3] = 0; a[2, 3] = 0;

		Vector3 x = new Vector3(a[0, 0], a[1, 0], a[2, 0]);
		Vector3 y = new Vector3(a[0, 1], a[1, 1], a[2, 1]);
		Vector3 z = new Vector3(a[0, 2], a[1, 2], a[2, 2]);

		y = y - Vector3.Project(y, x);
		z = z - Vector3.Project(z, x) - Vector3.Project(z, y);

		x.Normalize();
		y.Normalize();
		z.Normalize();

		Matrix4x4 q = Matrix4x4.identity;
		q[0, 0] = x.x; q[1, 0] = x.y; q[2, 0] = x.z;
		q[0, 1] = y.x; q[1, 1] = y.y; q[2, 1] = y.z;
		q[0, 2] = z.x; q[1, 2] = z.y; q[2, 2] = z.z;

		QRResult r = new QRResult();
		r.Q = q;
		r.R = q.transpose * a;
		return r;
	}

	public static SpectoralResult Spectoral(Matrix4x4 s) {
		s[0, 3] = 0; s[1, 3] = 0; s[2, 3] = 0;
		
		Matrix4x4 a = s;
		Matrix4x4 e = Matrix4x4.identity;

		int numIteration = NumIterations;
		for (int i = 0; i < NumIterations; ++i) {
			QRResult qr = QR(a.transpose);

			e = e * qr.Q;
			a = qr.R * qr.Q;

			if (SpectoralEarlyOut(a)) {
				numIteration = i;
				break;
			}
		}

		SpectoralResult r = new SpectoralResult();

		r.U = e;
		r.K = Matrix4x4.identity;
		r.K[0, 0] = a[0, 0]; r.K[1, 1] = a[1, 1]; r.K[2, 2] = a[2, 2];
		r.Ut = e.transpose;

		r.eigenvectors = new Vector3[3];
		r.eigenvalues = new Vector3(a[0, 0], a[1, 1], a[2, 2]);
		r.eigenvectors[0] = new Vector3(e[0, 0], e[1, 0], e[2, 0]);
		r.eigenvectors[1] = new Vector3(e[0, 1], e[1, 1], e[2, 1]);
		r.eigenvectors[2] = new Vector3(e[0, 2], e[1, 2], e[2, 2]);

		r.numIteration = numIteration;
		return r;
	}

	private static bool SpectoralEarlyOut(Matrix4x4 a) {
		if (Mathf.Abs(a[1, 0]) > 0.00001f) {
			return false;
		}
		if (Mathf.Abs(a[2, 0]) > 0.00001f) {
			return false;
		}
		if (Mathf.Abs(a[2, 1]) > 0.00001f) {
			return false;
		}
		if (Mathf.Abs(a[3, 0]) > 0.00001f) {
			return false;
		}
		if (Mathf.Abs(a[3, 1]) > 0.00001f) {
			return false;
		}
		if (Mathf.Abs(a[3, 2]) > 0.00001f) {
			return false;
		}
		return true;
	}

	private static bool PolarEarlyOut(Matrix4x4 q, Matrix4x4 qPrev) {
		Matrix4x4 r = SubMatMat(q, qPrev);
		for (int row = 0; row < 3; ++row) {
			for (int col = 0; col < 3; ++col) {
				if (Mathf.Abs(r[row, col]) > 0.00001f) {
					return false;
				}
			}
		}
		return true;
	}

	private static Matrix4x4 MulMatFlt(Matrix4x4 m, float f) {
		for (int row = 0; row < 3; ++row) {
			for (int col = 0; col < 3; ++col) {
				m[row, col] *= f;
			}
		}
		return m;
	}

	private static Matrix4x4 AddMatMat(Matrix4x4 a, Matrix4x4 b) {
		for (int row = 0; row < 3; ++row) {
			for (int col = 0; col < 3; ++col) {
				a[row, col] += b[row, col];
			}
		}
		return a;
	}

	private static Matrix4x4 SubMatMat(Matrix4x4 a, Matrix4x4 b) {
		for (int row = 0; row < 3; ++row) {
			for (int col = 0; col < 3; ++col) {
				a[row, col] -= b[row, col];
			}
		}
		return a;
	}
}