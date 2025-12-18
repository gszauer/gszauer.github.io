// ============================================================================
// TOKENIZER (unchanged from CPU version)
// ============================================================================

class Tokenizer {
    merges = new Map();
    vocabulary = new Map();
    nextTokenId = 256;

    constructor() {
        for (let i = 0; i < 256; i++) {
            this.vocabulary.set(i, [i]);
        }
    }

    #stringToBytes(text) {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(text);
        const bytes = [];
        for (let i = 0; i < uint8Array.length; i++) {
            bytes.push(uint8Array[i]);
        }
        return bytes;
    }

    #bytesToString(bytes) {
        return new TextDecoder().decode(new Uint8Array(bytes));
    }

    #applyMerge(tokens, token1, token2, mergedTokenId) {
        const result = [];
        let i = 0;
        while (i < tokens.length) {
            if (i < tokens.length - 1 && tokens[i] === token1 && tokens[i + 1] === token2) {
                result.push(mergedTokenId);
                i += 2;
            } else {
                result.push(tokens[i]);
                i += 1;
            }
        }
        return result;
    }

    encode(text) {
        let tokens = this.#stringToBytes(text);
        for (const [mergeKey, mergedToken] of this.merges) {
            const [token1, token2] = mergeKey.split(',').map(Number);
            tokens = this.#applyMerge(tokens, token1, token2, mergedToken);
        }
        return tokens;
    }

    decode(tokens) {
        const bytes = [];
        for (let i = 0; i < tokens.length; i++) {
            const tokenBytes = this.vocabulary.get(tokens[i]);
            if (tokenBytes) {
                for (let j = 0; j < tokenBytes.length; j++) {
                    bytes.push(tokenBytes[j]);
                }
            }
        }
        return this.#bytesToString(bytes);
    }

    getVocabSize() {
        return this.vocabulary.size;
    }

    static deserialize(data) {
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        let offset = 0;

        const magic = view.getUint32(offset, true);
        offset += 4;
        if (magic !== 0x42504531) {
            throw new Error('Invalid tokenizer file format');
        }

        const version = view.getUint32(offset, true);
        offset += 4;
        if (version !== 1) {
            throw new Error(`Unsupported tokenizer version: ${version}`);
        }

        const tokenizer = new Tokenizer();
        tokenizer.nextTokenId = view.getUint32(offset, true);
        offset += 4;

        const numMerges = view.getUint32(offset, true);
        offset += 4;

        tokenizer.merges.clear();
        for (let i = 0; i < numMerges; i++) {
            const token1 = view.getUint32(offset, true);
            offset += 4;
            const token2 = view.getUint32(offset, true);
            offset += 4;
            const mergedToken = view.getUint32(offset, true);
            offset += 4;
            tokenizer.merges.set(`${token1},${token2}`, mergedToken);
        }

        const numVocab = view.getUint32(offset, true);
        offset += 4;

        tokenizer.vocabulary.clear();
        for (let i = 0; i < numVocab; i++) {
            const tokenId = view.getUint32(offset, true);
            offset += 4;
            const length = view.getUint32(offset, true);
            offset += 4;
            const bytes = [];
            for (let j = 0; j < length; j++) {
                bytes.push(data[offset++]);
            }
            tokenizer.vocabulary.set(tokenId, bytes);
        }

        return tokenizer;
    }
}

// ============================================================================
// WEBGL UTILITIES
// ============================================================================

function createGLContext() {
    let canvas;
    if (typeof OffscreenCanvas !== 'undefined') {
        canvas = new OffscreenCanvas(1, 1);
    } else if (typeof document !== 'undefined') {
        canvas = document.createElement('canvas');
    } else {
        throw new Error('No canvas support available');
    }

    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error('WebGL2 not supported');
    }

    const ext = gl.getExtension('EXT_color_buffer_float');
    if (!ext) {
        throw new Error('EXT_color_buffer_float not supported');
    }

    return gl;
}

function createTexture(gl, width, height, data = null) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R32F,
        width,
        height,
        0,
        gl.RED,
        gl.FLOAT,
        data
    );

    return texture;
}

function createFramebuffer(gl, texture) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return fb;
}

// Debug: read back texture data to verify upload
function readTextureData(gl, texture, width, height) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const data = new Float32Array(width * height);
    gl.readPixels(0, 0, width, height, gl.RED, gl.FLOAT, data);

    gl.deleteFramebuffer(fb);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return data;
}

// Debug: verify texture upload by comparing original data to read-back
function verifyTextureUpload(gl, texture, originalData, width, height, name) {
    const readBack = readTextureData(gl, texture, width, height);

    let maxDiff = 0;
    let numDiffs = 0;
    const tolerance = 1e-5;

    for (let i = 0; i < Math.min(originalData.length, readBack.length); i++) {
        const diff = Math.abs(originalData[i] - readBack[i]);
        if (diff > tolerance) {
            numDiffs++;
            maxDiff = Math.max(maxDiff, diff);
        }
    }

    if (numDiffs > 0) {
        console.error(`[${name}] MISMATCH: ${numDiffs} values differ, max diff: ${maxDiff}`);
        console.log(`  Original[0..4]: ${originalData.slice(0, 5)}`);
        console.log(`  ReadBack[0..4]: ${readBack.slice(0, 5)}`);
        return false;
    } else {
        console.log(`[${name}] OK: ${width}x${height} texture verified`);
        return true;
    }
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('Shader compile error: ' + info);
    }

    return shader;
}

function createProgram(gl, vsSource, fsSource) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw new Error('Program link error: ' + info);
    }

    return program;
}

// Full-screen quad vertex shader
const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_texCoord;
void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// ============================================================================
// GLSL SHADERS
// ============================================================================

const EMBEDDING_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_tokenEmb;
uniform sampler2D u_posEmb;
uniform sampler2D u_tokens;
uniform int u_seqLen;
uniform int u_embDim;
uniform int u_vocabSize;

void main() {
    int outX = int(gl_FragCoord.x);  // embedding dimension
    int outY = int(gl_FragCoord.y);  // sequence position

    if (outY >= u_seqLen || outX >= u_embDim) {
        outValue = 0.0;
        return;
    }

    // Get token ID from tokens texture
    float tokenIdFloat = texelFetch(u_tokens, ivec2(outY, 0), 0).r;
    int tokenId = int(tokenIdFloat);

    // Look up token embedding
    float tokEmb = texelFetch(u_tokenEmb, ivec2(outX, tokenId), 0).r;

    // Look up position embedding
    float posEmb = texelFetch(u_posEmb, ivec2(outX, outY), 0).r;

    outValue = tokEmb + posEmb;
}`;

const LAYERNORM_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform sampler2D u_gamma;
uniform sampler2D u_beta;
uniform int u_seqLen;
uniform int u_embDim;

void main() {
    int outX = int(gl_FragCoord.x);  // embedding dimension
    int outY = int(gl_FragCoord.y);  // sequence position

    if (outY >= u_seqLen || outX >= u_embDim) {
        outValue = 0.0;
        return;
    }

    // Compute mean
    float mean = 0.0;
    for (int i = 0; i < u_embDim; i++) {
        mean += texelFetch(u_input, ivec2(i, outY), 0).r;
    }
    mean /= float(u_embDim);

    // Compute variance
    float variance = 0.0;
    for (int i = 0; i < u_embDim; i++) {
        float diff = texelFetch(u_input, ivec2(i, outY), 0).r - mean;
        variance += diff * diff;
    }
    variance /= float(u_embDim);

    // Normalize
    float x = texelFetch(u_input, ivec2(outX, outY), 0).r;
    float normalized = (x - mean) / sqrt(variance + 1e-5);

    // Scale and shift
    float gamma = texelFetch(u_gamma, ivec2(outX, 0), 0).r;
    float beta = texelFetch(u_beta, ivec2(outX, 0), 0).r;

    outValue = gamma * normalized + beta;
}`;

const MATMUL_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform sampler2D u_weight;
uniform int u_seqLen;
uniform int u_inputDim;
uniform int u_outputDim;

void main() {
    int outX = int(gl_FragCoord.x);  // output dimension
    int outY = int(gl_FragCoord.y);  // sequence position

    if (outY >= u_seqLen || outX >= u_outputDim) {
        outValue = 0.0;
        return;
    }

    float sum = 0.0;
    for (int i = 0; i < u_inputDim; i++) {
        float inputVal = texelFetch(u_input, ivec2(i, outY), 0).r;
        float weightVal = texelFetch(u_weight, ivec2(i, outX), 0).r;
        sum += inputVal * weightVal;
    }

    outValue = sum;
}`;

const MATMUL_BIAS_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform sampler2D u_weight;
uniform sampler2D u_bias;
uniform int u_seqLen;
uniform int u_inputDim;
uniform int u_outputDim;

void main() {
    int outX = int(gl_FragCoord.x);
    int outY = int(gl_FragCoord.y);

    if (outY >= u_seqLen || outX >= u_outputDim) {
        outValue = 0.0;
        return;
    }

    float sum = texelFetch(u_bias, ivec2(outX, 0), 0).r;
    for (int i = 0; i < u_inputDim; i++) {
        float inputVal = texelFetch(u_input, ivec2(i, outY), 0).r;
        float weightVal = texelFetch(u_weight, ivec2(i, outX), 0).r;
        sum += inputVal * weightVal;
    }

    outValue = sum;
}`;

const MATMUL_BIAS_GELU_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform sampler2D u_weight;
uniform sampler2D u_bias;
uniform int u_seqLen;
uniform int u_inputDim;
uniform int u_outputDim;

void main() {
    int outX = int(gl_FragCoord.x);
    int outY = int(gl_FragCoord.y);

    if (outY >= u_seqLen || outX >= u_outputDim) {
        outValue = 0.0;
        return;
    }

    float sum = texelFetch(u_bias, ivec2(outX, 0), 0).r;
    for (int i = 0; i < u_inputDim; i++) {
        float inputVal = texelFetch(u_input, ivec2(i, outY), 0).r;
        float weightVal = texelFetch(u_weight, ivec2(i, outX), 0).r;
        sum += inputVal * weightVal;
    }

    // GELU activation
    float c = 0.7978845608;  // sqrt(2/pi)
    float x = sum;
    outValue = 0.5 * x * (1.0 + tanh(c * (x + 0.044715 * x * x * x)));
}`;

const MATMUL_BIAS_RESIDUAL_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform sampler2D u_weight;
uniform sampler2D u_bias;
uniform sampler2D u_residual;
uniform int u_seqLen;
uniform int u_inputDim;
uniform int u_outputDim;

void main() {
    int outX = int(gl_FragCoord.x);
    int outY = int(gl_FragCoord.y);

    if (outY >= u_seqLen || outX >= u_outputDim) {
        outValue = 0.0;
        return;
    }

    float sum = texelFetch(u_bias, ivec2(outX, 0), 0).r;
    for (int i = 0; i < u_inputDim; i++) {
        float inputVal = texelFetch(u_input, ivec2(i, outY), 0).r;
        float weightVal = texelFetch(u_weight, ivec2(i, outX), 0).r;
        sum += inputVal * weightVal;
    }

    float residual = texelFetch(u_residual, ivec2(outX, outY), 0).r;
    outValue = sum + residual;
}`;

const ATTENTION_SCORES_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_Q;
uniform sampler2D u_K;
uniform int u_seqLen;
uniform int u_headDim;
uniform int u_headIdx;
uniform float u_scale;

void main() {
    int s = int(gl_FragCoord.x);  // source position (key)
    int t = int(gl_FragCoord.y);  // target position (query)

    if (t >= u_seqLen || s >= u_seqLen) {
        outValue = 0.0;
        return;
    }

    // Causal mask: can only attend to positions <= t
    if (s > t) {
        outValue = -1e9;  // Large negative for softmax
        return;
    }

    int headStart = u_headIdx * u_headDim;
    float score = 0.0;

    for (int d = 0; d < u_headDim; d++) {
        float q = texelFetch(u_Q, ivec2(headStart + d, t), 0).r;
        float k = texelFetch(u_K, ivec2(headStart + d, s), 0).r;
        score += q * k;
    }

    outValue = score * u_scale;
}`;

const SOFTMAX_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform int u_seqLen;
uniform int u_width;

void main() {
    int x = int(gl_FragCoord.x);
    int y = int(gl_FragCoord.y);

    if (y >= u_seqLen) {
        outValue = 0.0;
        return;
    }

    // Find max for numerical stability
    float maxVal = -1e9;
    for (int i = 0; i <= y; i++) {  // Only up to y (causal)
        float val = texelFetch(u_input, ivec2(i, y), 0).r;
        maxVal = max(maxVal, val);
    }

    // Compute exp and sum
    float sumExp = 0.0;
    for (int i = 0; i <= y; i++) {
        float val = texelFetch(u_input, ivec2(i, y), 0).r;
        sumExp += exp(val - maxVal);
    }

    // Output normalized probability
    if (x > y) {
        outValue = 0.0;
    } else {
        float val = texelFetch(u_input, ivec2(x, y), 0).r;
        outValue = exp(val - maxVal) / sumExp;
    }
}`;

const ATTENTION_OUTPUT_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_attnWeights;
uniform sampler2D u_V;
uniform int u_seqLen;
uniform int u_headDim;
uniform int u_headIdx;

void main() {
    int d = int(gl_FragCoord.x);  // dimension within head
    int t = int(gl_FragCoord.y);  // target position

    if (t >= u_seqLen || d >= u_headDim) {
        outValue = 0.0;
        return;
    }

    int headStart = u_headIdx * u_headDim;
    float sum = 0.0;

    for (int s = 0; s <= t; s++) {
        float attnWeight = texelFetch(u_attnWeights, ivec2(s, t), 0).r;
        float v = texelFetch(u_V, ivec2(headStart + d, s), 0).r;
        sum += attnWeight * v;
    }

    outValue = sum;
}`;

const COPY_HEAD_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_headOutput;
uniform sampler2D u_accumulator;
uniform int u_seqLen;
uniform int u_headDim;
uniform int u_headIdx;
uniform int u_embDim;

void main() {
    int d = int(gl_FragCoord.x);  // full embedding dimension
    int t = int(gl_FragCoord.y);  // sequence position

    if (t >= u_seqLen || d >= u_embDim) {
        outValue = 0.0;
        return;
    }

    int headStart = u_headIdx * u_headDim;
    int headEnd = headStart + u_headDim;

    if (d >= headStart && d < headEnd) {
        // This dimension belongs to current head
        int localD = d - headStart;
        outValue = texelFetch(u_headOutput, ivec2(localD, t), 0).r;
    } else {
        // Keep existing value from accumulator
        outValue = texelFetch(u_accumulator, ivec2(d, t), 0).r;
    }
}`;

const MATMUL_RESIDUAL_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform sampler2D u_weight;
uniform sampler2D u_residual;
uniform int u_seqLen;
uniform int u_inputDim;
uniform int u_outputDim;

void main() {
    int outX = int(gl_FragCoord.x);
    int outY = int(gl_FragCoord.y);

    if (outY >= u_seqLen || outX >= u_outputDim) {
        outValue = 0.0;
        return;
    }

    float sum = 0.0;
    for (int i = 0; i < u_inputDim; i++) {
        float inputVal = texelFetch(u_input, ivec2(i, outY), 0).r;
        float weightVal = texelFetch(u_weight, ivec2(i, outX), 0).r;
        sum += inputVal * weightVal;
    }

    float residual = texelFetch(u_residual, ivec2(outX, outY), 0).r;
    outValue = sum + residual;
}`;

const OUTPUT_PROJECTION_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform sampler2D u_weight;
uniform sampler2D u_bias;
uniform int u_lastPos;
uniform int u_inputDim;
uniform int u_vocabSize;

void main() {
    int v = int(gl_FragCoord.x);  // vocab index
    int row = int(gl_FragCoord.y);  // should be 0

    if (row != 0 || v >= u_vocabSize) {
        outValue = 0.0;
        return;
    }

    float sum = texelFetch(u_bias, ivec2(v, 0), 0).r;
    for (int i = 0; i < u_inputDim; i++) {
        float inputVal = texelFetch(u_input, ivec2(i, u_lastPos), 0).r;
        float weightVal = texelFetch(u_weight, ivec2(v, i), 0).r;
        sum += inputVal * weightVal;
    }

    outValue = sum;
}`;

const SOFTMAX_ROW_SHADER = `#version 300 es
precision highp float;
in vec2 v_texCoord;
out float outValue;

uniform sampler2D u_input;
uniform int u_width;

void main() {
    int x = int(gl_FragCoord.x);
    int y = int(gl_FragCoord.y);

    if (y != 0 || x >= u_width) {
        outValue = 0.0;
        return;
    }

    // Find max
    float maxVal = -1e9;
    for (int i = 0; i < u_width; i++) {
        float val = texelFetch(u_input, ivec2(i, 0), 0).r;
        maxVal = max(maxVal, val);
    }

    // Compute exp and sum
    float sumExp = 0.0;
    for (int i = 0; i < u_width; i++) {
        float val = texelFetch(u_input, ivec2(i, 0), 0).r;
        sumExp += exp(val - maxVal);
    }

    float val = texelFetch(u_input, ivec2(x, 0), 0).r;
    outValue = exp(val - maxVal) / sumExp;
}`;

// ============================================================================
// GABGPT CLASS
// ============================================================================

class GabGPT {
    gl = null;
    programs = {};
    textures = {};
    framebuffers = {};
    quadBuffer = null;
    embedding = null;

    vocabSize = 0;
    embeddingDim = 0;
    numHeads = 0;
    numBlocks = 0;
    maxSeqLength = 0;
    headDim = 0;

    constructor(gl, config) {
        this.gl = gl;
        this.vocabSize = config.vocabSize;
        this.embeddingDim = config.embeddingDim;
        this.numHeads = config.numHeads;
        this.numBlocks = config.numBlocks;
        this.maxSeqLength = config.maxSeqLength;
        this.headDim = config.embeddingDim / config.numHeads;

        // Backwards compatibility shim for code accessing old structure
        this.embedding = {
            embeddingDim: config.embeddingDim,
            maxSequenceLength: config.maxSeqLength,
            tokenEmbedding: { vocabSize: config.vocabSize, embeddingDim: config.embeddingDim }
        };

        // Fake blocks array with correct length
        this.blocks = new Array(config.numBlocks);
        for (let i = 0; i < config.numBlocks; i++) {
            this.blocks[i] = {
                attention: { numHeads: config.numHeads, headDim: config.embeddingDim / config.numHeads },
                mlp: {},
                layerNorm1: {},
                layerNorm2: {}
            };
        }

        this.#initQuadBuffer();
        this.#initPrograms();
        this.#initWorkingTextures();
    }

    #initQuadBuffer() {
        const gl = this.gl;
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,  1, -1,  -1, 1,
            -1, 1,   1, -1,   1, 1
        ]), gl.STATIC_DRAW);
    }

    #initPrograms() {
        const gl = this.gl;

        this.programs.embedding = createProgram(gl, VERTEX_SHADER, EMBEDDING_SHADER);
        this.programs.layerNorm = createProgram(gl, VERTEX_SHADER, LAYERNORM_SHADER);
        this.programs.matmul = createProgram(gl, VERTEX_SHADER, MATMUL_SHADER);
        this.programs.matmulBias = createProgram(gl, VERTEX_SHADER, MATMUL_BIAS_SHADER);
        this.programs.matmulBiasGelu = createProgram(gl, VERTEX_SHADER, MATMUL_BIAS_GELU_SHADER);
        this.programs.matmulBiasResidual = createProgram(gl, VERTEX_SHADER, MATMUL_BIAS_RESIDUAL_SHADER);
        this.programs.matmulResidual = createProgram(gl, VERTEX_SHADER, MATMUL_RESIDUAL_SHADER);
        this.programs.attentionScores = createProgram(gl, VERTEX_SHADER, ATTENTION_SCORES_SHADER);
        this.programs.softmax = createProgram(gl, VERTEX_SHADER, SOFTMAX_SHADER);
        this.programs.attentionOutput = createProgram(gl, VERTEX_SHADER, ATTENTION_OUTPUT_SHADER);
        this.programs.copyHead = createProgram(gl, VERTEX_SHADER, COPY_HEAD_SHADER);
        this.programs.outputProjection = createProgram(gl, VERTEX_SHADER, OUTPUT_PROJECTION_SHADER);
        this.programs.softmaxRow = createProgram(gl, VERTEX_SHADER, SOFTMAX_ROW_SHADER);
    }

    #initWorkingTextures() {
        const gl = this.gl;
        const seq = 2048;  // Max sequence length
        const emb = this.embeddingDim;
        const hidden = emb * 4;
        const vocabPadded = 8192;

        // Hidden states (ping-pong)
        this.textures.hiddenA = createTexture(gl, emb, seq);
        this.textures.hiddenB = createTexture(gl, emb, seq);
        this.textures.norm = createTexture(gl, emb, seq);

        // QKV
        this.textures.Q = createTexture(gl, emb, seq);
        this.textures.K = createTexture(gl, emb, seq);
        this.textures.V = createTexture(gl, emb, seq);

        // Attention
        this.textures.attnScores = createTexture(gl, seq, seq);
        this.textures.attnWeights = createTexture(gl, seq, seq);
        this.textures.attnOutA = createTexture(gl, emb, seq);
        this.textures.attnOutB = createTexture(gl, emb, seq);
        this.textures.headOut = createTexture(gl, this.headDim, seq);

        // MLP
        this.textures.mlpHidden = createTexture(gl, hidden, seq);

        // Output
        this.textures.logits = createTexture(gl, vocabPadded, 1);
        this.textures.probs = createTexture(gl, vocabPadded, 1);

        // Tokens input
        this.textures.tokens = createTexture(gl, seq, 1);

        // Create framebuffers
        this.framebuffers.hiddenA = createFramebuffer(gl, this.textures.hiddenA);
        this.framebuffers.hiddenB = createFramebuffer(gl, this.textures.hiddenB);
        this.framebuffers.norm = createFramebuffer(gl, this.textures.norm);
        this.framebuffers.Q = createFramebuffer(gl, this.textures.Q);
        this.framebuffers.K = createFramebuffer(gl, this.textures.K);
        this.framebuffers.V = createFramebuffer(gl, this.textures.V);
        this.framebuffers.attnScores = createFramebuffer(gl, this.textures.attnScores);
        this.framebuffers.attnWeights = createFramebuffer(gl, this.textures.attnWeights);
        this.framebuffers.attnOutA = createFramebuffer(gl, this.textures.attnOutA);
        this.framebuffers.attnOutB = createFramebuffer(gl, this.textures.attnOutB);
        this.framebuffers.headOut = createFramebuffer(gl, this.textures.headOut);
        this.framebuffers.mlpHidden = createFramebuffer(gl, this.textures.mlpHidden);
        this.framebuffers.logits = createFramebuffer(gl, this.textures.logits);
        this.framebuffers.probs = createFramebuffer(gl, this.textures.probs);
    }

    #runProgram(program, outputFB, outputWidth, outputHeight, uniforms) {
        const gl = this.gl;

        gl.useProgram(program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFB);
        gl.viewport(0, 0, outputWidth, outputHeight);

        // Set up quad
        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms
        let textureUnit = 0;
        for (const [name, value] of Object.entries(uniforms)) {
            const loc = gl.getUniformLocation(program, name);
            if (loc === null) continue;

            if (value instanceof WebGLTexture) {
                gl.activeTexture(gl.TEXTURE0 + textureUnit);
                gl.bindTexture(gl.TEXTURE_2D, value);
                gl.uniform1i(loc, textureUnit);
                textureUnit++;
            } else if (typeof value === 'number') {
                if (Number.isInteger(value)) {
                    gl.uniform1i(loc, value);
                } else {
                    gl.uniform1f(loc, value);
                }
            }
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    forward(inputTokens) {
        const gl = this.gl;
        const tokens = inputTokens[0];  // Unbatch
        const seqLen = tokens.length;

        // Upload tokens
        const tokenData = new Float32Array(2048);
        for (let i = 0; i < seqLen; i++) {
            tokenData[i] = tokens[i];
        }
        gl.bindTexture(gl.TEXTURE_2D, this.textures.tokens);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2048, 1, gl.RED, gl.FLOAT, tokenData);

        // Embedding lookup
        this.#runProgram(
            this.programs.embedding,
            this.framebuffers.hiddenA,
            this.embeddingDim,
            2048,
            {
                u_tokenEmb: this.textures.tokenEmb,
                u_posEmb: this.textures.posEmb,
                u_tokens: this.textures.tokens,
                u_seqLen: seqLen,
                u_embDim: this.embeddingDim,
                u_vocabSize: this.vocabSize
            }
        );

        let currentHidden = 'hiddenA';
        let otherHidden = 'hiddenB';

        // Transformer blocks
        for (let b = 0; b < this.numBlocks; b++) {
            // LayerNorm1
            this.#runProgram(
                this.programs.layerNorm,
                this.framebuffers.norm,
                this.embeddingDim,
                2048,
                {
                    u_input: this.textures[currentHidden],
                    u_gamma: this.textures[`ln1Gamma${b}`],
                    u_beta: this.textures[`ln1Beta${b}`],
                    u_seqLen: seqLen,
                    u_embDim: this.embeddingDim
                }
            );

            // Q, K, V projections
            this.#runProgram(
                this.programs.matmul,
                this.framebuffers.Q,
                this.embeddingDim,
                2048,
                {
                    u_input: this.textures.norm,
                    u_weight: this.textures[`wq${b}`],
                    u_seqLen: seqLen,
                    u_inputDim: this.embeddingDim,
                    u_outputDim: this.embeddingDim
                }
            );

            this.#runProgram(
                this.programs.matmul,
                this.framebuffers.K,
                this.embeddingDim,
                2048,
                {
                    u_input: this.textures.norm,
                    u_weight: this.textures[`wk${b}`],
                    u_seqLen: seqLen,
                    u_inputDim: this.embeddingDim,
                    u_outputDim: this.embeddingDim
                }
            );

            this.#runProgram(
                this.programs.matmul,
                this.framebuffers.V,
                this.embeddingDim,
                2048,
                {
                    u_input: this.textures.norm,
                    u_weight: this.textures[`wv${b}`],
                    u_seqLen: seqLen,
                    u_inputDim: this.embeddingDim,
                    u_outputDim: this.embeddingDim
                }
            );

            // Clear attnOutA (will be used as first read source)
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers.attnOutA);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Multi-head attention with ping-pong buffers
            const scale = 1.0 / Math.sqrt(this.headDim);
            let attnRead = 'attnOutA';
            let attnWrite = 'attnOutB';

            for (let h = 0; h < this.numHeads; h++) {
                // Attention scores
                this.#runProgram(
                    this.programs.attentionScores,
                    this.framebuffers.attnScores,
                    2048,
                    2048,
                    {
                        u_Q: this.textures.Q,
                        u_K: this.textures.K,
                        u_seqLen: seqLen,
                        u_headDim: this.headDim,
                        u_headIdx: h,
                        u_scale: scale
                    }
                );

                // Softmax
                this.#runProgram(
                    this.programs.softmax,
                    this.framebuffers.attnWeights,
                    2048,
                    2048,
                    {
                        u_input: this.textures.attnScores,
                        u_seqLen: seqLen,
                        u_width: 2048
                    }
                );

                // Attention output (per head)
                this.#runProgram(
                    this.programs.attentionOutput,
                    this.framebuffers.headOut,
                    this.headDim,
                    2048,
                    {
                        u_attnWeights: this.textures.attnWeights,
                        u_V: this.textures.V,
                        u_seqLen: seqLen,
                        u_headDim: this.headDim,
                        u_headIdx: h
                    }
                );

                // Copy head output to full attention output (ping-pong)
                this.#runProgram(
                    this.programs.copyHead,
                    this.framebuffers[attnWrite],
                    this.embeddingDim,
                    2048,
                    {
                        u_headOutput: this.textures.headOut,
                        u_accumulator: this.textures[attnRead],
                        u_seqLen: seqLen,
                        u_headDim: this.headDim,
                        u_headIdx: h,
                        u_embDim: this.embeddingDim
                    }
                );

                // Swap ping-pong buffers
                [attnRead, attnWrite] = [attnWrite, attnRead];
            }

            // After loop, attnRead contains the final result

            // Output projection + residual
            this.#runProgram(
                this.programs.matmulResidual,
                this.framebuffers[otherHidden],
                this.embeddingDim,
                2048,
                {
                    u_input: this.textures[attnRead],
                    u_weight: this.textures[`wo${b}`],
                    u_residual: this.textures[currentHidden],
                    u_seqLen: seqLen,
                    u_inputDim: this.embeddingDim,
                    u_outputDim: this.embeddingDim
                }
            );

            // Swap hidden states
            [currentHidden, otherHidden] = [otherHidden, currentHidden];

            // LayerNorm2
            this.#runProgram(
                this.programs.layerNorm,
                this.framebuffers.norm,
                this.embeddingDim,
                2048,
                {
                    u_input: this.textures[currentHidden],
                    u_gamma: this.textures[`ln2Gamma${b}`],
                    u_beta: this.textures[`ln2Beta${b}`],
                    u_seqLen: seqLen,
                    u_embDim: this.embeddingDim
                }
            );

            // MLP Dense1 + GELU
            this.#runProgram(
                this.programs.matmulBiasGelu,
                this.framebuffers.mlpHidden,
                this.embeddingDim * 4,
                2048,
                {
                    u_input: this.textures.norm,
                    u_weight: this.textures[`mlp1W${b}`],
                    u_bias: this.textures[`mlp1B${b}`],
                    u_seqLen: seqLen,
                    u_inputDim: this.embeddingDim,
                    u_outputDim: this.embeddingDim * 4
                }
            );

            // MLP Dense2 + Residual
            this.#runProgram(
                this.programs.matmulBiasResidual,
                this.framebuffers[otherHidden],
                this.embeddingDim,
                2048,
                {
                    u_input: this.textures.mlpHidden,
                    u_weight: this.textures[`mlp2W${b}`],
                    u_bias: this.textures[`mlp2B${b}`],
                    u_residual: this.textures[currentHidden],
                    u_seqLen: seqLen,
                    u_inputDim: this.embeddingDim * 4,
                    u_outputDim: this.embeddingDim
                }
            );

            // Swap again
            [currentHidden, otherHidden] = [otherHidden, currentHidden];
        }

        // Final LayerNorm
        this.#runProgram(
            this.programs.layerNorm,
            this.framebuffers.norm,
            this.embeddingDim,
            2048,
            {
                u_input: this.textures[currentHidden],
                u_gamma: this.textures.lnFinalGamma,
                u_beta: this.textures.lnFinalBeta,
                u_seqLen: seqLen,
                u_embDim: this.embeddingDim
            }
        );

        // Output projection (last position only)
        this.#runProgram(
            this.programs.outputProjection,
            this.framebuffers.logits,
            8192,
            1,
            {
                u_input: this.textures.norm,
                u_weight: this.textures.outputW,
                u_bias: this.textures.outputB,
                u_lastPos: seqLen - 1,
                u_inputDim: this.embeddingDim,
                u_vocabSize: this.vocabSize
            }
        );

        // Softmax
        this.#runProgram(
            this.programs.softmaxRow,
            this.framebuffers.probs,
            8192,
            1,
            {
                u_input: this.textures.logits,
                u_width: this.vocabSize
            }
        );

        // Read back probabilities
        const probsData = new Float32Array(8192);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers.probs);
        gl.readPixels(0, 0, 8192, 1, gl.RED, gl.FLOAT, probsData);

        // Return in same format as CPU version: [batch][seq][vocab]
        // Only the last position has valid data, but we place it at the correct index
        const probs = new Array(this.vocabSize);
        for (let i = 0; i < this.vocabSize; i++) {
            probs[i] = probsData[i];
        }

        // Create output array with probs at the last position (seqLen - 1)
        const output = new Array(1);
        output[0] = new Array(seqLen);
        for (let t = 0; t < seqLen - 1; t++) {
            output[0][t] = null;  // Placeholder for unused positions
        }
        output[0][seqLen - 1] = probs;

        return output;
    }

    generate(promptTokens, maxLength, temperature = 1.0) {
        let tokens = promptTokens.slice();

        for (let i = 0; i < maxLength; i++) {
            const output = this.forward([tokens]);
            const lastProbs = output[0][tokens.length - 1];
            const nextToken = this.#sampleWithTemperature(lastProbs, temperature);
            tokens.push(nextToken);
        }

        return tokens;
    }

    #sampleWithTemperature(probs, temperature) {
        const logits = [];
        for (let i = 0; i < probs.length; i++) {
            logits.push(Math.log(probs[i] + 1e-10));
        }

        const scaledLogits = [];
        for (let i = 0; i < logits.length; i++) {
            scaledLogits.push(logits[i] / temperature);
        }

        let maxLogit = scaledLogits[0];
        for (let i = 1; i < scaledLogits.length; i++) {
            if (scaledLogits[i] > maxLogit) {
                maxLogit = scaledLogits[i];
            }
        }

        const scaledProbs = [];
        let sum = 0;
        for (let i = 0; i < scaledLogits.length; i++) {
            const exp = Math.exp(scaledLogits[i] - maxLogit);
            scaledProbs.push(exp);
            sum += exp;
        }

        for (let i = 0; i < scaledProbs.length; i++) {
            scaledProbs[i] /= sum;
        }

        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < scaledProbs.length; i++) {
            cumulative += scaledProbs[i];
            if (random < cumulative) {
                return i;
            }
        }

        return scaledProbs.length - 1;
    }

    static deserialize(data) {
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        let offset = 0;

        // Read header
        const magic = view.getUint32(offset, true);
        offset += 4;
        if (magic !== 0x47414231) {
            throw new Error('Invalid GabGPT file format');
        }

        const version = view.getUint32(offset, true);
        offset += 4;
        if (version !== 1) {
            throw new Error(`Unsupported GabGPT version: ${version}`);
        }

        const vocabSize = view.getUint32(offset, true);
        offset += 4;
        const embeddingDim = view.getUint32(offset, true);
        offset += 4;
        const numHeads = view.getUint32(offset, true);
        offset += 4;
        const numBlocks = view.getUint32(offset, true);
        offset += 4;
        const maxSeqLength = view.getUint32(offset, true);
        offset += 4;

        const hiddenDim = embeddingDim * 4;

        // Create GL context and model
        const gl = createGLContext();
        const model = new GabGPT(gl, {
            vocabSize,
            embeddingDim,
            numHeads,
            numBlocks,
            maxSeqLength
        });

        // Helper to read floats
        const readFloats = (count) => {
            const arr = new Float32Array(count);
            for (let i = 0; i < count; i++) {
                arr[i] = view.getFloat32(offset, true);
                offset += 4;
            }
            return arr;
        };

        // Helper to create and upload texture
        const uploadTexture = (width, height, data) => {
            const tex = createTexture(gl, width, height, data);
            return tex;
        };

        // Read and upload token embeddings [vocabSize x embeddingDim]
        const tokenEmbData = new Float32Array(8192 * embeddingDim);
        for (let v = 0; v < vocabSize; v++) {
            for (let d = 0; d < embeddingDim; d++) {
                tokenEmbData[v * embeddingDim + d] = view.getFloat32(offset, true);
                offset += 4;
            }
        }
        model.textures.tokenEmb = uploadTexture(embeddingDim, 8192, tokenEmbData);
        verifyTextureUpload(gl, model.textures.tokenEmb, tokenEmbData, embeddingDim, 8192, 'tokenEmb');

        // Read and upload position embeddings [maxSeqLength x embeddingDim]
        const posEmbData = new Float32Array(2048 * embeddingDim);
        for (let p = 0; p < maxSeqLength; p++) {
            for (let d = 0; d < embeddingDim; d++) {
                posEmbData[p * embeddingDim + d] = view.getFloat32(offset, true);
                offset += 4;
            }
        }
        model.textures.posEmb = uploadTexture(embeddingDim, 2048, posEmbData);
        verifyTextureUpload(gl, model.textures.posEmb, posEmbData, embeddingDim, 2048, 'posEmb');

        // Read transformer blocks
        for (let b = 0; b < numBlocks; b++) {
            // LayerNorm1 gamma and beta
            const ln1Gamma = readFloats(embeddingDim);
            const ln1Beta = readFloats(embeddingDim);
            model.textures[`ln1Gamma${b}`] = uploadTexture(embeddingDim, 1, ln1Gamma);
            model.textures[`ln1Beta${b}`] = uploadTexture(embeddingDim, 1, ln1Beta);

            // Attention weights Q, K, V, O [embeddingDim x embeddingDim]
            // Original format: weights[inputIdx][outputIdx], need to transpose to [outputIdx][inputIdx]
            const wqRaw = readFloats(embeddingDim * embeddingDim);
            const wkRaw = readFloats(embeddingDim * embeddingDim);
            const wvRaw = readFloats(embeddingDim * embeddingDim);
            const woRaw = readFloats(embeddingDim * embeddingDim);

            // Transpose function
            const transpose = (data, rows, cols) => {
                const result = new Float32Array(rows * cols);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        result[c * rows + r] = data[r * cols + c];
                    }
                }
                return result;
            };

            const wq = transpose(wqRaw, embeddingDim, embeddingDim);
            const wk = transpose(wkRaw, embeddingDim, embeddingDim);
            const wv = transpose(wvRaw, embeddingDim, embeddingDim);
            const wo = transpose(woRaw, embeddingDim, embeddingDim);

            model.textures[`wq${b}`] = uploadTexture(embeddingDim, embeddingDim, wq);
            model.textures[`wk${b}`] = uploadTexture(embeddingDim, embeddingDim, wk);
            model.textures[`wv${b}`] = uploadTexture(embeddingDim, embeddingDim, wv);
            model.textures[`wo${b}`] = uploadTexture(embeddingDim, embeddingDim, wo);

            // Verify first block only
            if (b === 0) {
                verifyTextureUpload(gl, model.textures[`wq${b}`], wq, embeddingDim, embeddingDim, `wq${b}`);
            }

            // LayerNorm2 gamma and beta
            const ln2Gamma = readFloats(embeddingDim);
            const ln2Beta = readFloats(embeddingDim);
            model.textures[`ln2Gamma${b}`] = uploadTexture(embeddingDim, 1, ln2Gamma);
            model.textures[`ln2Beta${b}`] = uploadTexture(embeddingDim, 1, ln2Beta);

            // MLP Dense1: [hiddenDim neurons, each with embeddingDim weights + bias]
            const mlp1W = new Float32Array(hiddenDim * embeddingDim);
            const mlp1B = new Float32Array(hiddenDim);
            for (let n = 0; n < hiddenDim; n++) {
                for (let i = 0; i < embeddingDim; i++) {
                    mlp1W[n * embeddingDim + i] = view.getFloat32(offset, true);
                    offset += 4;
                }
                mlp1B[n] = view.getFloat32(offset, true);
                offset += 4;
            }
            model.textures[`mlp1W${b}`] = uploadTexture(embeddingDim, hiddenDim, mlp1W);
            model.textures[`mlp1B${b}`] = uploadTexture(hiddenDim, 1, mlp1B);

            // MLP Dense2: [embeddingDim neurons, each with hiddenDim weights + bias]
            const mlp2W = new Float32Array(embeddingDim * hiddenDim);
            const mlp2B = new Float32Array(embeddingDim);
            for (let n = 0; n < embeddingDim; n++) {
                for (let i = 0; i < hiddenDim; i++) {
                    mlp2W[n * hiddenDim + i] = view.getFloat32(offset, true);
                    offset += 4;
                }
                mlp2B[n] = view.getFloat32(offset, true);
                offset += 4;
            }
            model.textures[`mlp2W${b}`] = uploadTexture(hiddenDim, embeddingDim, mlp2W);
            model.textures[`mlp2B${b}`] = uploadTexture(embeddingDim, 1, mlp2B);
        }

        // Final LayerNorm
        const lnFinalGamma = readFloats(embeddingDim);
        const lnFinalBeta = readFloats(embeddingDim);
        model.textures.lnFinalGamma = uploadTexture(embeddingDim, 1, lnFinalGamma);
        model.textures.lnFinalBeta = uploadTexture(embeddingDim, 1, lnFinalBeta);

        // Output layer [embeddingDim x vocabSize] + bias
        // Original format: weights[inputIdx][vocabIdx], stored row-major
        const outputW = new Float32Array(8192 * embeddingDim);
        for (let i = 0; i < embeddingDim; i++) {
            for (let v = 0; v < vocabSize; v++) {
                outputW[i * 8192 + v] = view.getFloat32(offset, true);
                offset += 4;
            }
        }
        // Texture: width=8192 (padded vocab), height=512 (embeddingDim)
        model.textures.outputW = uploadTexture(8192, embeddingDim, outputW);

        const outputB = new Float32Array(8192);
        for (let v = 0; v < vocabSize; v++) {
            outputB[v] = view.getFloat32(offset, true);
            offset += 4;
        }
        model.textures.outputB = uploadTexture(8192, 1, outputB);

        // Quick sanity check: verify embedding lookup works
        console.log('=== Running sanity checks ===');

        // Test embedding lookup for token 0
        const testTokens = new Float32Array(2048);
        testTokens[0] = 65;  // 'A' in ASCII
        gl.bindTexture(gl.TEXTURE_2D, model.textures.tokens);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2048, 1, gl.RED, gl.FLOAT, testTokens);

        // Read back token embedding for token 65
        const tokenEmbReadback = readTextureData(gl, model.textures.tokenEmb, embeddingDim, 8192);
        const token65Emb = tokenEmbReadback.slice(65 * embeddingDim, 66 * embeddingDim);
        console.log(`Token 65 embedding[0..4]: ${token65Emb.slice(0, 5)}`);
        console.log(`Token 65 embedding sum: ${token65Emb.reduce((a, b) => a + b, 0)}`);

        // Check position embedding
        const posEmbReadback = readTextureData(gl, model.textures.posEmb, embeddingDim, 2048);
        const pos0Emb = posEmbReadback.slice(0, embeddingDim);
        console.log(`Position 0 embedding[0..4]: ${pos0Emb.slice(0, 5)}`);
        console.log(`Position 0 embedding sum: ${pos0Emb.reduce((a, b) => a + b, 0)}`);

        console.log('=== Sanity checks complete ===');

        return model;
    }
}

// ============================================================================
// CHAT HELPER
// ============================================================================

function chat(model, tokenizer, userMessage) {
    const prompt = `<|user|>${userMessage}<|end|><|assistant|>`;
    const promptTokens = tokenizer.encode(prompt);

    const endTokenId = tokenizer.encode("<|end|>")[0];
    const generated = [];

    let tokens = promptTokens.slice();

    for (let i = 0; i < 100; i++) {
        const output = model.forward([tokens]);
        const lastProbs = output[0][tokens.length - 1];

        let maxProb = lastProbs[0];
        let nextToken = 0;
        for (let j = 1; j < lastProbs.length; j++) {
            if (lastProbs[j] > maxProb) {
                maxProb = lastProbs[j];
                nextToken = j;
            }
        }

        if (nextToken === endTokenId) {
            break;
        }

        tokens.push(nextToken);
        generated.push(nextToken);
    }

    return tokenizer.decode(generated);
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Tokenizer,
        GabGPT,
        chat
    };
}
