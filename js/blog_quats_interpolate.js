var memory = {
  canvas_2d: null,
  context_2d: null,

  canvas_3d: null,
  gl: null,

  lineRenderer: null,
  imgui: null,

  origin: {
    r: null,
    g: null,
    b: null
  },

  lines: {
    yellow: null,
    cyan: null,
    magenta: null,
    gray: null
  },

  circles: {
    thin: null,
    thick: null,
  },

  q1: null,
  q2: null,
  t: 0.66
}

const cam_position = [4, 1, 2]
const cam_target = [0, 0, 0]

function Init() {
  memory.canvas_2d = document.getElementById('polar_2d_canvas');
  if (memory.canvas_2d && memory.canvas_2d.getContext) {
    memory.context_2d = memory.canvas_2d.getContext('2d');

    memory.imgui = IM_Init(memory.canvas_2d, memory.context_2d);
  }

  memory.canvas_3d = document.getElementById('polar_3d_canvas');
  if (memory.canvas_3d && memory.canvas_3d.getContext) {
    memory.gl = memory.canvas_3d.getContext("webgl");

    if (!memory.gl) {
      alert("Can't initialize Web GL!\nWon't be able to render examples.")
    }
    else {
      memory.gl.clearColor(34.0 / 255.0, 34.0 / 255.0, 34.0 / 255.0,1);

      memory.gl.clearDepth(1.0);
      memory.gl.disable(memory.gl.DEPTH_TEST);
      memory.gl.depthFunc(memory.gl.LEQUAL);

      memory.gl.enable(memory.gl.CULL_FACE);
      memory.gl.cullFace(memory.gl.BACK);

      memory.lineRenderer = LR_Init(memory.gl);

      memory.origin.r = LR_MakeLine(memory.lineRenderer, [0, 0, 0, 1, 0, 0], "segment", 2);
      memory.origin.g = LR_MakeLine(memory.lineRenderer, [0, 0, 0, 0, 1, 0], "segment", 2);
      memory.origin.b = LR_MakeLine(memory.lineRenderer, [0, 0, 0, 0, 0, 1], "segment", 2);

      memory.lines.yellow = LR_MakeLine(memory.lineRenderer, [0, 0, 0, 0, 0, 0], "segment", 3);
      memory.lines.cyan = LR_MakeLine(memory.lineRenderer, [0, 0, 0, 0, 0, 0], "segment", 3);
      memory.lines.magenta = LR_MakeLine(memory.lineRenderer, [0, 0, 0, 0, 0, 0], "segment", 3);
      memory.lines.gray = LR_MakeLine(memory.lineRenderer, [0, 0, 0, 0, 0, 0], "strip", 3);

      var diskArray = []
      diskArray = diskArray.concat(MakeDiskArray([1, 0, 0], 2.0, null, [330, 360], 2))
      diskArray = diskArray.concat(MakeDiskArray([1, 0, 0], 2.0, null, [0, 200], 2))

      memory.circles.thin = LR_MakeLine(memory.lineRenderer,  diskArray, "line", 1);
      memory.circles.thick = LR_MakeLine(memory.lineRenderer, MakeDiskArray([1, 0, 0], 2.0, null, [200, 330]), "strip", 4);
    }
  }

  // Disable depth?

  memory.q1 = Q_AngleAxis(-30, [1, 0, 0]);
  memory.q2 = Q_AngleAxis(-160, [1, 0, 0]);

  DrawEverything();
}

function Draw2D(im) {
    im.idGen = 1
    const w = im.canvas.width
    const h = im.canvas.height

    IM_Rect(im, [34.0/255.0, 34.0 / 255.0, 34.0 / 255.0], [0, 0, w, h])

    /*if (IM_Button(im, "Button", [5, 5])) {
        console.log("Button clicked!");
    }
    scroll = IM_Scrollbar(im, scroll, [100, 20])
    check = IM_Checkbox(im, check, [10, 50])*/
    var oldT = memory.t
    memory.t = IM_Scrollbar(im, memory.t, [10, 5])
    IM_Label(im, "t: " + memory.t.toFixed(4), [170.0 / 255.0, 170.0 / 255.0, 170.0 / 255.0], [370, 9])

    if (oldT != memory.t) {
    const gl = memory.gl;
    const viewMatrix = LookAt(cam_position, cam_target, [0, 1, 0]);
    const projectionMatrix = PerspectiveMatrix(60, 0.1, 500, memory.canvas_3d.width / memory.canvas_3d.height);

      Draw3D(gl, viewMatrix, projectionMatrix);
    }

}

function Draw3D(gl, view, proj) {
    const v = 0.7
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    LR_DrawLine(memory.origin.r, view, proj, [v, 0, 0]);
    LR_DrawLine(memory.origin.g, view, proj, [0, v, 0]);
    LR_DrawLine(memory.origin.b, view, proj, [0, 0, v]);

    LR_DrawLine(memory.circles.thin, view, proj, [0, v, v])
    LR_DrawLine(memory.circles.thick, view, proj, [0, v, v])

    var vec1 = V3_Scale(Q_Mul_V3(memory.q1, [0, 0, 1]), 2);
    var vec2 = V3_Scale(Q_Mul_V3(memory.q2, [0, 0, 1]), 2);

    var t = 1 - memory.t
    var nlerp_vec = V3_Scale(Q_Mul_V3(Nlerp(memory.q1, memory.q2, t), [0, 0, 1]), 2);
    var slerp_vec = V3_Scale(Q_Mul_V3(Slerp(memory.q1, memory.q2, t), [0, 0, 1]), 2);

    LR_UpdateLine(memory.lines.gray, [vec1[0], vec1[1], vec1[2], 0, 0, 0, vec2[0], vec2[1], vec2[2]]);
    LR_UpdateLine(memory.lines.yellow, [0, 0, 0, nlerp_vec[0], nlerp_vec[1], nlerp_vec[2]]);
    LR_UpdateLine(memory.lines.magenta, [0, 0, 0, slerp_vec[0], slerp_vec[1], slerp_vec[2]]);

    LR_DrawLine(memory.lines.gray, view, proj, [v, v, v])
    LR_DrawLine(memory.lines.yellow, view, proj, [v, v, 0])
    LR_DrawLine(memory.lines.magenta, view, proj, [v, 0, v])


}

function DrawEverything() {
  const gl = memory.gl;
  const viewMatrix = LookAt(cam_position, cam_target, [0, 1, 0]);
  //const projectionMatrix = PerspectiveMatrix(60, 0.1, 500, memory.canvas_3d.clientWidth / memory.canvas_3d.clientHeight);
  const projectionMatrix = PerspectiveMatrix(60, 0.1, 500, memory.canvas_3d.width / memory.canvas_3d.height);

  Draw2D(memory.imgui);
  Draw3D(gl, viewMatrix, projectionMatrix);
}

function PerspectiveMatrix(fov, zNear, zFar, aspect) {
    const tanHalfFov = Math.tan((fov * 0.5) * 0.0174533);
    const fovY = 1.0 / tanHalfFov; 
    const fovX = fovY / aspect; 
    const _33 = -(zFar / (zFar - zNear))
    const _43 = -((zFar * zNear) / (zFar - zNear));

    const result = [
        fovX, 0,    0,   0,
        0,    fovY, 0,   0,
        0,    0,    _33, -1,
        0,    0,    _43,   0
    ];

    return result;
}

function LookAt(eye, at, up) {
    const zAxis = V3_Normalize([
        eye[0] - at[0],
        eye[1] - at[1],
        eye[2] - at[2]
    ]);
    const xAxis = V3_Normalize(V3_Cross(zAxis, up));
    const yAxis = V3_Cross(xAxis, zAxis);

    const result = [
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]), 
        -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]),
        -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]),
        1
    ];

    return result;
}

function MakeDiskArray(normal, radius, centerPoint, ranges, stride) {
    var point = centerPoint
    if (typeof centerPoint == "undefined" || centerPoint == null) {
        point = [0, 0, 0]
    } 
    if (typeof ranges == "undefined" || ranges == null) {
        ranges = []
    } 
    if (typeof stride == "undefined" || stride == null) {
        stride = 0
    }

    for (var i = 0; i < ranges.length; i += 2) {
        if (i + 1 >= ranges.length) {
            break;
        }

        if (ranges[i] > ranges[i + 1]) {
          var temp = ranges[i + 1]
          ranges[i + 1] = ranges[i]
          ranges[i] = temp
        }

        if (ranges[i] < 0) { ranges[i] = 0; }
        if (ranges[i + 1] > 360) { ranges[i + 1] = 360; }
    }

    const verts = [];
    normal = V3_Normalize(normal);

    const zero = [0, 0, 0]
    var perp = V3_Cross(normal, [0, 1, 0])
    if (V3_Equals(perp, zero)) {
        perp = V3_Cross(normal, [0, 0, 1])
        if (V3_Equals(perp, zero)) {
            perp = V3_Cross(normal, [1, 0, 0])
        }
    }

    var forward = V3_Cross(V3_Normalize(perp), normal)
    var right = V3_Cross(normal, forward);

    var v = right;
    var k = V3_Normalize(normal)

    for (var i = 0; i < 361; ++i) {
    //for (var i = 361; i >= 0; --i) {
        if (ranges != null && ranges.length > 0) {
            var continueOuterLoop = true;
            for (var j = 0; j < ranges.length; j += 2) {
                const min = ranges[j];
                if (j + 1 >= ranges.length) {
                    break;
                }
                const max = ranges[j + 1]

                if (i >= min && i <= max) {
                    continueOuterLoop = false;
                }
            }
            if (continueOuterLoop) {
                continue;
            }
        }

        if (i % stride == 0) {
            continue;
        }

        var cos = Math.cos(i * 0.0174533)
        var sin = Math.sin(i * 0.0174533)

        // v' = (1 - cos)(v dot n)n + cos v + sin(n cross v)

        const p1 = V3_Scale(k, V3_Dot(k, v) * (1.0 - cos))
        const p2 = V3_Scale(v, cos)
        const p3 = V3_Scale(V3_Cross(k, v), sin)

        var vprime = 
        V3_Add(
            V3_Add(
                p1,
                p2
            ),
            p3
        );

        vprime = V3_Scale(V3_Normalize(vprime), radius)

        verts.push(point[0] + vprime[0])
        verts.push(point[1] + vprime[1])
        verts.push(point[2] + vprime[2]);
    }

    return verts;
}

/* 
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
        Math
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
*/

function V3_MagnitudeSq(quat) {
    return quat[0] * quat[0] + quat[1] * quat[1] + quat[2] * quat[2];
}

function V3_Normalize(quat) {
    const lengthSq = quat[0] * quat[0] + quat[1] * quat[1] + quat[2] * quat[2];
    
    const length = Math.sqrt(lengthSq);
    const invLength = 1.0 / length;

    return [
        quat[0] * invLength,
        quat[1] * invLength,
        quat[2] * invLength,
    ]
}

function Q_AngleAxis(degreesNum, axisVec3) {
    const radians = degreesNum * 0.0174533; 
    const axis = V3_Normalize(axisVec3);

    const halfCos = Math.cos(radians * 0.5);
    const halfSin = Math.sin(radians * 0.5);

    return [
        axis[0] * halfSin,
        axis[1] * halfSin,
        axis[2] * halfSin,
        halfCos
    ];
}

function Q_Add(leftQuat, rightQuat) {
    return [
        leftQuat[0] + rightQuat[0],
        leftQuat[1] + rightQuat[1],
        leftQuat[2] + rightQuat[2],
        leftQuat[3] + rightQuat[3]
    ]
}

function Q_Sub(leftQuat, rightQuat) {
    return [
        leftQuat[0] - rightQuat[0],
        leftQuat[1] - rightQuat[1],
        leftQuat[2] - rightQuat[2],
        leftQuat[3] - rightQuat[3]
    ]
}

function Q_Scale(quat, numFloat) {
    return [
        quat[0] * numFloat,
        quat[1] * numFloat,
        quat[2] * numFloat,
        quat[3] * numFloat
    ]
}

function Q_Normalize(quat) {
    const lengthSq = quat[0] * quat[0] + quat[1] * quat[1] + quat[2] * quat[2] + quat[3] * quat[3];
    
    const length = Math.sqrt(lengthSq);
    const invLength = 1.0 / length;

    return [
        quat[0] * invLength,
        quat[1] * invLength,
        quat[2] * invLength,
        quat[3] * invLength
    ]
}

function Q_Dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; 
}

function Q_Mul_Q(a, b) {
    const aw = a[3]
    const ax = a[0]
    const ay = a[1]
    const az = a[2]

    const bw = b[3]
    const bx = b[0]
    const by = b[1]
    const bz = b[2]

    return [
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by + ay * bw + az * bx - ax * bz,
        aw * bz + az * bw + ax * by - ay * bx,
        aw * bw - ax * bx - ay * by - az * bz
    ];
}

function Q_GetAngleDegrees(q) {
    return 2.0 * Math.acos(q[3]) * 57.2958;
}

function Q_GetAngleRadians(q) {
    return 2.0 * Math.acos(q[3]);
}

function Q_GetAxis(inQuaternion) {
    return V3_Normalize([
        inQuaternion[0],
        inQuaternion[1],
        inQuaternion[2]
    ])
}

function UE4_FloatSelect(Comparand, ValueGEZero, ValueLTZero ) {
    return Comparand >= 0 ? ValueGEZero : ValueLTZero;
}


function UE4_Slerp(Quat1, Quat2, Slerp) {
    // Get cosine of angle between quats.
    const RawCosom = 
            Quat1[0] * Quat2[0] +
            Quat1[1] * Quat2[1] +
            Quat1[2] * Quat2[2] +
            Quat1[3] * Quat2[3];

    // Unaligned quats - compensate, results in taking shorter route.
    const Cosom = UE4_FloatSelect( RawCosom, RawCosom, -RawCosom );
    
    var Scale0 = null;
    var Scale1 = null;

    if( Cosom < 0.9999 ) {  
        const Omega = Math.acos(Cosom);
        const InvSin = 1.0/Math.sin(Omega);

        Scale0 = Math.sin( (1.0 - Slerp) * Omega ) * InvSin;
        Scale1 = Math.sin( Slerp * Omega ) * InvSin;
    }
    else { // Use linear interpolation.
        Scale0 = 1.0 - Slerp;
        Scale1 = Slerp; 
        console.log("UE4 fallback to lerp: " + Cosom.toFixed(8));
    }

    // In keeping with our flipped Cosom:
    Scale1 = UE4_FloatSelect( RawCosom, Scale1, -Scale1 );

    return Q_Normalize([
        Scale0 * Quat1[0] + Scale1 * Quat2[0],
        Scale0 * Quat1[1] + Scale1 * Quat2[1],
        Scale0 * Quat1[2] + Scale1 * Quat2[2],
        Scale0 * Quat1[3] + Scale1 * Quat2[3],
    ])
}

function Q_Pow(inputQuaternion, powerNum) {
    var axis = V3_Normalize([
        inputQuaternion[0],
        inputQuaternion[1],
        inputQuaternion[2]
    ]);
    const radians = 2.0 * Math.acos(inputQuaternion[3]);

    const halfCos = Math.cos((powerNum * radians) * 0.5);
    const halfSin = Math.sin((powerNum * radians) * 0.5);

    return [
        axis[0] * halfSin,
        axis[1] * halfSin,
        axis[2] * halfSin,
        halfCos
    ];
}

function Q_Inv(q) {
    return [
        -q[0],
        -q[1],
        -q[2],
         q[3]
    ]
}

function V3_Negate(v3) {
    return [
        v3[0] * -1.0,
        v3[1] * -1.0,
        v3[2] * -1.0
    ]
}

function Q_FromTo(fromVec3, toVec3) {
    fromVec3 = V3_Normalize(fromVec3);
    toVec3 = V3_Normalize(toVec3);

    if (V3_Equals(fromVec3, V3_Negate(toVec3))) { // If from == -to
        var mostOrthogonal = [1, 0, 0];
        if (Math.abs(fromVec3[1]) < Math.abs(fromVec3[0])) {
            mostOrthogonal = [0, 1, 0];
        }
        if (Math.abs(fromVec3[2]) < Math.abs(fromVec3[1]) && Math.abs(fromVec3[2]) < Math.abs(fromVec3[0])) {
            mostOrthogonal = [0, 0, 1]
        }

        console.log("Most orthogonal: (" + mostOrthogonal[0].toFixed(2) + ", " + mostOrthogonal[1].toFixed(2) + ", " + mostOrthogonal[2].toFixed(2) + ")");

        const axis = V3_Normalize(V3_Cross(fromVec3, mostOrthogonal));
        return [
            axis[0], 
            axis[1], 
            axis[2],
            0
        ];
    }

    var half = V3_Add(fromVec3, toVec3);
    half = V3_Normalize(half);

    const axis = V3_Cross(fromVec3, half);
    if (Math.abs(V3_MagnitudeSq(axis)) < 0.0001) {
        console.log("Axis has no magnitude");
    }

    return [
        axis[0],
        axis[1],
        axis[2],
        V3_Dot(fromVec3, half)
    ]
}

function f(a) {
    return Number(a).toFixed(5)
}

function Q_Equals(leftQuat, rightQuat) {
    const epsilonFloatOptional = 0.0001;

    const l1 = Math.abs(leftQuat[0] - rightQuat[0]) <= epsilonFloatOptional
    const l2 = Math.abs(leftQuat[1] - rightQuat[1]) <= epsilonFloatOptional
    const l3 = Math.abs(leftQuat[2] - rightQuat[2]) <= epsilonFloatOptional
    const l4 = Math.abs(leftQuat[3] - rightQuat[3]) <= epsilonFloatOptional

    const r1 = Math.abs(leftQuat[0] + rightQuat[0]) <= epsilonFloatOptional
    const r2 = Math.abs(leftQuat[1] + rightQuat[1]) <= epsilonFloatOptional
    const r3 = Math.abs(leftQuat[2] + rightQuat[2]) <= epsilonFloatOptional
    const r4 = Math.abs(leftQuat[3] + rightQuat[3]) <= epsilonFloatOptional

    const left = l1 && l2 && l3 && l4
    const right = r1 && r2 && r3 && r4

    const result = left || right

    return result
}

function V3_Equals(leftQuat, rightQuat) {
    const epsilonFloatOptional = 0.0001;

    const l1 = Math.abs(leftQuat[0] - rightQuat[0]) <= epsilonFloatOptional
    const l2 = Math.abs(leftQuat[1] - rightQuat[1]) <= epsilonFloatOptional
    const l3 = Math.abs(leftQuat[2] - rightQuat[2]) <= epsilonFloatOptional

    const r1 = Math.abs(leftQuat[0] + rightQuat[0]) <= epsilonFloatOptional
    const r2 = Math.abs(leftQuat[1] + rightQuat[1]) <= epsilonFloatOptional
    const r3 = Math.abs(leftQuat[2] + rightQuat[2]) <= epsilonFloatOptional

    const left = l1 && l2 && l3 
    const right = r1 && r2 && r3 

    const result = left || right

    return result
}

function V3_Add(v1, v2) {
    return [
        v1[0] + v2[0],
        v1[1] + v2[1],
        v1[2] + v2[2]
    ]
}

function V3_Dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function V3_Scale(v, s) {
    return [
        v[0] * s,
        v[1] * s,
        v[2] * s
    ]
}

function V3_Cross(v1, v2) {
    const result = [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
    return result;
}

function Q_Mul_V3(quaternion, vector3) {
    const qVector = [quaternion[0], quaternion[1], quaternion[2]];
    const qScalar = quaternion[3];

    return V3_Add(
        V3_Add(
            V3_Scale(qVector, 2.0 * V3_Dot(qVector, vector3)),
            V3_Scale(vector3, (qScalar * qScalar) - V3_Dot(qVector, qVector))
        ),
        V3_Scale(V3_Cross(qVector, vector3), 2.0 * qScalar)
    );
}

function Q_ToStr(quat, precision) {
    if (typeof precision == undefined || precision == null) {
        precision = 5
    }

    return "(" +
        quat[3].toFixed(precision) + ", (" + 
        quat[0].toFixed(precision) + ", " +
        quat[1].toFixed(precision) + ", " +
        quat[2].toFixed(precision) + ")";
}

// ((b * a^-1)^t * a
function Slerp(q1, q2, t) {
    const reference = UE4_Slerp(q1, q2, t);

    var dot = Q_Dot(q1, q2);
    if (dot < 0) {
        q2 = Q_Scale(q2, -1)
    }
    const slerp = Q_Mul_Q(Q_Pow(Q_Mul_Q(q2, Q_Inv(q1)), t), q1)

    if (!Q_Equals(reference, slerp)) {
        console.log("slerp deviated from reference implementation");
    }
    return slerp;
}

// a + (b - a) * t
function Nlerp(a, b, t) {
    const dot = Q_Dot(a, b);

    if (dot < 0.0) {
        //console.log("Nlerp: dot < 0");
        b = Q_Scale(b, -1);
    }

    const r1 = Q_Add(a, Q_Scale(Q_Sub(b, a), t));
    const r2 = Q_Normalize(r1); 

    return r2;
}

// a * (1 - t) + b * t
function Nlerp_mix(a, b, t) {
    const dot = Q_Dot(a, b);

    const r3 = Q_Add(Q_Scale(a, 1.0 - t), Q_Scale(b, dot < 0.0? -t : t));
    const r4 = Q_Normalize(r3);

    return r4;
}

/* 
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
        Line Renderer
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
*/

function LR_Init(gl) {
    var lineRendererObject = {
        shader: null,
        gl: null
    }

    lineRendererObject.gl = gl;

    // Setup vertex Shader
    const vSource = `
        precision highp float;
        attribute vec3 position;

        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec4 renderColor;

        varying vec4 color; 

        void main() {
            color = renderColor;

            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
        }
    `;  

    const vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vSource);
    gl.compileShader(vertex);

    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        alert("Can't compile vertex shader: " + gl.getShaderInfoLog(vertex));
        gl.deleteShader(vertex);
        return null;
    }

    // Setup fragment shader
    const fSource = `
        precision highp float;
        varying vec4 color; 

        void main() {
            gl_FragColor = color;
        }
    `;

    const fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fSource);
    gl.compileShader(fragment);

    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        alert("Can't compile fragment shader: " + gl.getShaderInfoLog(fragment));
        gl.deleteShader(fragment);
        return null;
    }

    // Setup actual program
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Can't link the shader: " + gl.getProgramInfoLog(program));
        return null;
    }

    lineRendererObject.shader = {
        id : program,
        attribs : {
            position: gl.getAttribLocation(program, "position")     
        },
        uniforms : {
            model: gl.getUniformLocation(program, "modelMatrix"),
            view: gl.getUniformLocation(program, "viewMatrix"),
            projection: gl.getUniformLocation(program, "projectionMatrix"),
            color: gl.getUniformLocation(program, "renderColor")
        }
    };

    const error = gl.getError();
    if (error != gl.NO_ERROR) {
      console.log("gl error initializing line renderer: " + error);
    }

    return lineRendererObject;
}

function LR_MakeLine(lineRenderer, lineArray, mode, width) {
    if (typeof mode == "undefined" || mode == null) {
        mode = "strip"
    }
    
    const gl = lineRenderer.gl;

    var arrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);

    var lineObject = {
        bufferId: arrayBuffer,
        count: lineArray.length / 3,
        numComponents: 3,
        type: gl.FLOAT,
        stride: 0,
        offset: 0,
        renderer: lineRenderer,
        lineMode: mode,
        lineWidth: width
    }
    
    LR_UpdateLine(lineObject, lineArray, mode, width);

    const error = gl.getError();
    if (error != gl.NO_ERROR) {
      console.log("gl error making line: " + error);
    }

    return lineObject;
}

function LR_UpdateLine(lineObject, lineArray, mode, width) {
    if (typeof lineObject == "undefined" || lineObject == null) {
        console.log("Could not find line object");
    }
    else if (typeof lineObject.renderer == "undefined" || lineObject.renderer == null) {
        console.log("Could not find line renderer");
    }

    const gl = lineObject.renderer.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, lineObject.bufferId);
    lineObject.count =  lineArray.length / 3;

    if (typeof mode != "undefined" && mode != null) {
        lineObject.lineMode = mode;
    }

    if (typeof width != "undefined" && width == null) {
        lineObject.lineWidth = width
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineArray), gl.DYNAMIC_DRAW);

    const error = gl.getError();
    if (error != gl.NO_ERROR) {
      console.log("gl error updating line: " + error);
    }
}

function LR_DrawLine(lineObject, viewMatrix, projectionMatrix, color) {
    if (typeof color == "undefined" || color == null) {
        color = {r:0,g:0,b:0}
    }
    else if (Array.isArray(color)) {
        color = {r:color[0],g:color[1],b:color[2]}
    }

    if (typeof lineObject == "undefined" || lineObject == null) {
        console.log("Could not find line object");
    }
    else if (typeof lineObject.renderer == "undefined" || lineObject.renderer == null) {
        console.log("Could not find line renderer");
    }

    const gl = lineObject.renderer.gl;
    const shader = lineObject.renderer.shader;

    const modelMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
    gl.bindBuffer(gl.ARRAY_BUFFER, lineObject.bufferId);
    gl.vertexAttribPointer(shader.attribs.position, lineObject.numComponents, lineObject.type, false, lineObject.stride, lineObject.offset);
    gl.enableVertexAttribArray(shader.attribs.position);

    gl.useProgram(shader.id);

    gl.uniformMatrix4fv(shader.uniforms.projection, false, projectionMatrix);
    gl.uniformMatrix4fv(shader.uniforms.view, false, viewMatrix);
    gl.uniformMatrix4fv(shader.uniforms.model, false, modelMatrix);
    gl.uniform4f(shader.uniforms.color, color.r, color.g, color.b, 1.0);

    gl.lineWidth(lineObject.lineWidth);

    const offset = 0;

    var mode = gl.LINE_STRIP;
    if (lineObject.lineMode == "loop" || lineObject.lineMode == "looping") {
        mode = gl.LINE_LOOP;
    }
    else if (lineObject.lineMode == "line" || lineObject.lineMode == "lines" || lineObject.lineMode == "segment" || lineObject.lineMode == "single") {
        mode = gl.LINES;
    }

    gl.drawArrays(mode, offset, lineObject.count
    )

    const error = gl.getError();
    if (error != gl.NO_ERROR) {
      console.log("gl error drawing line: " + error);
    }
}


/* 
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
        IMGUI
-----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
*/

function IM_Init(canvas2D, context2D) {
    canvas2D.addEventListener('mousemove', IM_MouseMove, false);
    canvas2D.addEventListener('mousedown', IM_MouseDown, false);
    canvas2D.addEventListener('mouseup', IM_MouseUp, false);
    canvas2D.addEventListener('mouseleave', IM_MouseLeave, false);
    canvas2D.addEventListener('mouseenter', IM_MouseEnter, false);

    context2D.font = '24px serif';
    const height  = IM_FindTextHeight(context2D, 0, 0, 50, 50);
  //console.log("Line height: " + height);

    return {
        canvas: canvas2D,
        surface: context2D,

        mouseX: -1,
        mouseY: -1,
        mouseLeft: false,
        mouseWasDownWhenLeft: false,

        mouseDown: 0,

        hotItem: 0,
        activeItem: 0,
        idGen: 0,

        lineHeight: height
    }
}

function IM_FindTextHeight(ctx, left, top, width, height) {
  ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(left, top, left + width, top + height);
  ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillText('gM', left + 1, top + height / 2);
    //ctx.fillText('M', left + 1, top + height / 2);

    var data = ctx.getImageData(left, top, width, height).data;
    var first = 50;
    var last = 0;

    for (var r = 0; r < height; r++) {
        for(var c = 0; c < width; c++) {
          const index = r * width * 4 + c * 4 
          const test = data[index]
            if(test != 255) {
              if (r > last) {
                  last = r;
              }
              if (r < first) {
                  first = r;
              }
            }
        }
    }

    if (first > last) {
      console.log("Could not find line height");
      return 0;
    }

   return last - first;
}

function IM_MouseInRegion(im, x, y, w, h) {
    return (
        im.mouseX >= x &&
        im.mouseY >= y &&
        im.mouseX <= x + w &&
        im.mouseY <= y + h
    )
}

function IM_PreMouseEvent(evt) {
    var im = memory.imgui; // TODO: This needs to change!
    const w = im.canvas.width
    const h = im.canvas.height

    const rect = im.canvas.getBoundingClientRect();

    im.mouseX = (evt.clientX - rect.left) / ((rect.right - rect.left) / w)
    im.mouseY = (evt.clientY - rect.top) / ((rect.bottom - rect.top) / h)

    im.hotItem = 0;

    return im;
}

function IM_PostMouseEvent(im) {
    if (!im.mouseDown) {
        im.activeItem = 0
    }
    else {
        if (im.activeItem == 0) {
            im.activeItem = -1
        }
    }
}

function IM_MouseMove(evt) {
    var im = IM_PreMouseEvent(evt);

    Draw2D(im);

    IM_PostMouseEvent(im);
}

function IM_MouseDown(evt) {
    var im = IM_PreMouseEvent(evt);
    im.mouseDown = true

    Draw2D(im);

    IM_PostMouseEvent(im);
}

function IM_MouseUp(evt) {
    var im = IM_PreMouseEvent(evt);
    im.mouseDown = false
    Draw2D(im);
    IM_PostMouseEvent(im);
    Draw2D(im);
}

function IM_MouseLeave(evt) {
    var im = IM_PreMouseEvent(evt);

    im.mouseLeft = true;
    im.mouseWasDownWhenLeft = evt.buttons == 1
}

function IM_MouseEnter(evt) {
    var im = IM_PreMouseEvent(evt);

  var mouseIsDown = evt.buttons == 1

  if (mouseIsDown) {
    if (im.mouseLeft && im.mouseWasDownWhenLeft) {
      // Cool, we're int he right state, do nothing
    }
    else {
      im.hotItem = 0
      im.activeItem = -1
      IM_MouseUp(evt);
    }
  }
  else {
    im.hotItem = 0
    im.activeItem = -1
      im.mouseDown = false

    IM_MouseUp(evt);
  }

  im.mouseLeft = false;
    im.mouseWasDownWhenLeft = false;
}


function IM_Rect(context, color, rect) {
    if (typeof color == "undefined" || color == null) {
        color = {r:0,g:0,b:0}
    }
    else if (Array.isArray(color)) {
        color = {r:color[0],g:color[1],b:color[2]}
    }

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 50; h = 50;
    }
    else if (Array.isArray(rect)) {
        x = rect[0]; y = rect[1]; w = rect[2]; h = rect[3]
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    color.r = Math.round(color.r * 255);
    color.g = Math.round(color.g * 255);
    color.b = Math.round(color.b * 255);

    if (color.r > 255) { color.r = 255 }
    if (color.g > 255) { color.g = 255 }
    if (color.b > 255) { color.b = 255 }

    if (color.r < 0) { color.r = 0 }
    if (color.g < 0) { color.g = 0 }
    if (color.b < 0) { color.b = 0 }

    context.surface.fillStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    context.surface.fillRect(x, y, w, h);
}

function IM_Label(context, val, color, point) {
    var x = 0; var y = 0;
    if (typeof point == "undefined" || point == null) {
        x = 0; y = 0;
    }
    else if (Array.isArray(point)) {
        x = point[0]; y = point[1]; 
    }
    else {
        x = point.x; y = point.y;
    }

    if (typeof color == "undefined" || color == null) {
        color = {r:0,g:0,b:0}
    }
    else if (Array.isArray(color)) {
        color = {r:color[0],g:color[1],b:color[2]}
    }

    color.r = Math.round(color.r * 255);
    color.g = Math.round(color.g * 255);
    color.b = Math.round(color.b * 255);

    if (color.r > 255) { color.r = 255 }
    if (color.g > 255) { color.g = 255 }
    if (color.b > 255) { color.b = 255 }

    if (color.r < 0) { color.r = 0 }
    if (color.g < 0) { color.g = 0 }
    if (color.b < 0) { color.b = 0 }

    context.surface.fillStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    context.surface.fillText(val, x, y + context.lineHeight);
}

function IM_Button(context, text, rect) {
    const id = context.idGen++

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 50; h = 50;

        if (typeof text != "undefined" && text != null) {
          w = context.surface.measureText(text).width + 10;
      h = context.lineHeight + 10
    }
    }
    else if (Array.isArray(rect)) {
      x = rect[0]; y = rect[1];

      if (rect.length == 2) {
          if (typeof text != "undefined" && text != null) {
          w = context.surface.measureText(text).width + 10;
          h = context.lineHeight + 10
        }
        else {
          w = 50
          h = 50
        }
      }
      else {
        w = rect[2]; h = rect[3]
      }
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    if (IM_MouseInRegion(context, x, y, w, h)) {
        context.hotItem = id
        if (context.activeItem == 0 && context.mouseDown) {
            context.activeItem = id
        }
    }

    var rectColor = [0.5, 0.5, 0.5]
    var textColor = [0.3, 0.3, 0.3]

    if (context.hotItem == id) {
        if (context.activeItem == id) { // Button is both 'hot' and 'active'
            rectColor = [0.9, 0.9, 0.9];
        }
        else { // Button is merely 'hot'
            rectColor = [0.7, 0.7, 0.7];
        }
    }
    //else { // button is not hot, but it may be active    

    IM_Rect(context, [.2, .2, .2], [x, y, w, h]);

    x += 2; y += 2; w -= 4; h -= 4;
    IM_Rect(context, rectColor, [x, y, w, h]);

    if (typeof text != "undefined" && text != null) {
      x += 2; y += 1
    IM_Label(context, text, textColor, [x, y])
    }

    if (!context.mouseDown && context.hotItem == id && context.activeItem == id) {
        return true;
    }
    return false;
}

function IM_Scrollbar(context, val, rect) {
    const id = context.idGen++

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 350; h = 30;
    }
    else if (Array.isArray(rect)) {
      if (rect.length == 2) {
        h = 30
        w = 350
      }
      else {
        w = rect[2]; 
        h = rect[3]
      }
        x = rect[0]; y = rect[1]; 
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    if (IM_MouseInRegion(context, x, y, w, h)) {
        context.hotItem = id
        if (context.activeItem == 0 && context.mouseDown) {
            context.activeItem = id
        }
    }

  const centerY = (y + h / 2)

  var rectColor = [0.5, 0.5, 0.5]
  var bgColor = [0.5, 0.5, 0.5]
    if (context.hotItem == id) {
        if (context.activeItem == id) { // Button is both 'hot' and 'active'
            rectColor = [0.9, 0.9, 0.9];
      bgColor = [0.6, 0.6, 0.6]
        }
        else { // Button is merely 'hot'
            rectColor = [0.7, 0.7, 0.7];
      bgColor = [0.6, 0.6, 0.6]
        }
    }

  if (context.activeItem == id) {
    var mouseX = context.mouseX;
    if (mouseX < x) { mouseX = x; }
    if (mouseX > x + w) { mouseX = x + w; }

    val = (mouseX - x - 6) / (w - 10)
  }

  if (val < 0) { val = 0 }
  if (val > 1) { val = 1 }


    IM_Rect(context, bgColor, [x, centerY - 3, w, 6])

  
  const xOffset = val * (w - 10)
  IM_Rect(context, [0.2, 0.2, 0.2], [x + xOffset, y, 10, h]);
    IM_Rect(context, rectColor, [x + xOffset + 2, y + 2, 6, h - 4]);

  return val;
}

function IM_Checkbox(context, val, rect) {
    const id = context.idGen++

    var x = 0; var y = 0; var w = 0; var h = 0;
    if (typeof rect == "undefined" || rect == null) {
        x = 0; y = 0; w = 30; h = 30;

        if (typeof text != "undefined" && text != null) {
          w = context.surface.measureText(text).width + 10;
      h = context.lineHeight + 10
    }
    }
    else if (Array.isArray(rect)) {
      x = rect[0]; y = rect[1];

      if (rect.length == 2) {
        w = 30
        h = 30
      }
      else {
        w = rect[2]; h = rect[3]
      }
    }
    else {
        x = rect.x; y = rect.y; w = rect.w; h = rect.h;
    }

    if (IM_MouseInRegion(context, x, y, w, h)) {
        context.hotItem = id
        if (context.activeItem == 0 && context.mouseDown) {
            context.activeItem = id
        }
    }

    var rectColor = [0.5, 0.5, 0.5]
    var textColor = [0.3, 0.3, 0.3]
    var tickColor = [0,0,0]

    if (context.hotItem == id) {
        if (context.activeItem == id) { // Button is both 'hot' and 'active'
            rectColor = [0.9, 0.9, 0.9];
          tickColor = [0.2, 0.2, 0.2];
        }
        else { // Button is merely 'hot'
            rectColor = [0.7, 0.7, 0.7];
          tickColor = [0.2, 0.2, 0.2];
        }
    }
    //else { // button is not hot, but it may be active    

    IM_Rect(context, [.2, .2, .2], [x, y, w, h]);

    IM_Rect(context, rectColor, [x + 2, y + 2, w - 4, h - 4]);

    if (!context.mouseDown && context.hotItem == id && context.activeItem == id) {
        val = !val
    }

    if (val) {
      IM_Rect(context, tickColor, [x + 6, y + 6, w - 12, h - 12]);
    }

    return val;
}