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

            const mergeKey = `${token1},${token2}`;
            tokenizer.merges.set(mergeKey, mergedToken);
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

class DenseLayer {
    weights = null;
    biases = null;

    constructor(numberOfInputs, numberOfOutputs) {
        this.weights = new Array(numberOfOutputs);
        this.biases = new Array(numberOfOutputs);
        for (let i = 0; i < numberOfOutputs; i++) {
            this.weights[i] = new Array(numberOfInputs);
        }
    }

    forward(inputs) {
        const outputs = new Array(this.weights.length);
        for (let i = 0; i < this.weights.length; i++) {
            let sum = this.biases[i];
            for (let j = 0; j < inputs.length; j++) {
                sum += this.weights[i][j] * inputs[j];
            }
            outputs[i] = sum;
        }
        return outputs;
    }
}

class ActivationLayer {
    kind = "gelu";

    constructor(layerType = "gelu") {
        this.kind = layerType;
    }

    forward(inputs) {
        const output = new Array(inputs.length);

        if (this.kind === "gelu") {
            const c = Math.sqrt(2 / Math.PI);
            for (let i = 0; i < inputs.length; i++) {
                const x = inputs[i];
                output[i] = 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
            }
        } else if (this.kind === "relu") {
            for (let i = 0; i < inputs.length; i++) {
                output[i] = Math.max(0, inputs[i]);
            }
        }

        return output;
    }
}

class MLPBlock {
    dense1 = null;
    activation = null;
    dense2 = null;

    constructor(embeddingDim, expansionFactor = 4) {
        const hiddenDim = embeddingDim * expansionFactor;
        this.dense1 = new DenseLayer(embeddingDim, hiddenDim);
        this.activation = new ActivationLayer("gelu");
        this.dense2 = new DenseLayer(hiddenDim, embeddingDim);
    }

    forward(inputs) {
        const batchSize = inputs.length;
        const seqLen = inputs[0].length;
        const outputs = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            outputs[b] = new Array(seqLen);
            for (let t = 0; t < seqLen; t++) {
                let hidden = this.dense1.forward(inputs[b][t]);
                hidden = this.activation.forward(hidden);
                outputs[b][t] = this.dense2.forward(hidden);
            }
        }

        return outputs;
    }
}

class EmbeddingLayer {
    weights = null;
    vocabSize = 0;
    embeddingDim = 0;

    constructor(vocabSize, embeddingDim) {
        this.vocabSize = vocabSize;
        this.embeddingDim = embeddingDim;
        this.weights = new Array(vocabSize);
        for (let i = 0; i < vocabSize; i++) {
            this.weights[i] = new Array(embeddingDim);
        }
    }

    forward(inputTokens) {
        const batchSize = inputTokens.length;
        const seqLength = inputTokens[0].length;

        const output = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            output[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                const tokenId = inputTokens[b][t];
                output[b][t] = new Array(this.embeddingDim);
                for (let d = 0; d < this.embeddingDim; d++) {
                    output[b][t][d] = this.weights[tokenId][d];
                }
            }
        }

        return output;
    }
}

class PositionalEmbeddingLayer {
    tokenEmbedding = null;
    positionWeights = null;
    maxSequenceLength = 0;
    embeddingDim = 0;

    constructor(vocabSize, embeddingDim, maxSequenceLength) {
        this.embeddingDim = embeddingDim;
        this.maxSequenceLength = maxSequenceLength;
        this.tokenEmbedding = new EmbeddingLayer(vocabSize, embeddingDim);
        this.positionWeights = new Array(maxSequenceLength);
        for (let pos = 0; pos < maxSequenceLength; pos++) {
            this.positionWeights[pos] = new Array(embeddingDim);
        }
    }

    forward(inputTokens) {
        const tokenEmbeddings = this.tokenEmbedding.forward(inputTokens);
        const batchSize = inputTokens.length;
        const seqLength = inputTokens[0].length;

        const output = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            output[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                output[b][t] = new Array(this.embeddingDim);
                for (let d = 0; d < this.embeddingDim; d++) {
                    output[b][t][d] = tokenEmbeddings[b][t][d] + this.positionWeights[t][d];
                }
            }
        }

        return output;
    }
}

class LayerNormalization {
    gamma = null;
    beta = null;
    featureSize = 0;
    epsilon = 1e-5;

    constructor(featureSize) {
        this.featureSize = featureSize;
        this.gamma = new Array(featureSize);
        this.beta = new Array(featureSize);
    }

    forward(inputs) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;
        const output = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            output[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                let mean = 0;
                for (let i = 0; i < this.featureSize; i++) {
                    mean += inputs[b][t][i];
                }
                mean /= this.featureSize;

                let variance = 0;
                for (let i = 0; i < this.featureSize; i++) {
                    const diff = inputs[b][t][i] - mean;
                    variance += diff * diff;
                }
                variance /= this.featureSize;

                const stdInv = 1.0 / Math.sqrt(variance + this.epsilon);
                output[b][t] = new Array(this.featureSize);

                for (let i = 0; i < this.featureSize; i++) {
                    const normalized = (inputs[b][t][i] - mean) * stdInv;
                    output[b][t][i] = this.gamma[i] * normalized + this.beta[i];
                }
            }
        }

        return output;
    }
}

class MultiHeadAttention {
    numHeads = 0;
    headDim = 0;
    embeddingDim = 0;

    queryWeights = null;
    keyWeights = null;
    valueWeights = null;
    outputWeights = null;

    constructor(embeddingDim, numHeads) {
        this.embeddingDim = embeddingDim;
        this.numHeads = numHeads;
        this.headDim = embeddingDim / numHeads;

        this.queryWeights = new Array(embeddingDim);
        this.keyWeights = new Array(embeddingDim);
        this.valueWeights = new Array(embeddingDim);
        this.outputWeights = new Array(embeddingDim);

        for (let i = 0; i < embeddingDim; i++) {
            this.queryWeights[i] = new Array(embeddingDim);
            this.keyWeights[i] = new Array(embeddingDim);
            this.valueWeights[i] = new Array(embeddingDim);
            this.outputWeights[i] = new Array(embeddingDim);
        }
    }

    forward(inputs) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;

        const queries = this.#batchMatmul(inputs, this.queryWeights);
        const keys = this.#batchMatmul(inputs, this.keyWeights);
        const values = this.#batchMatmul(inputs, this.valueWeights);

        const scale = 1.0 / Math.sqrt(this.headDim);
        const attentionOutputs = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            attentionOutputs[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                attentionOutputs[b][t] = new Array(this.embeddingDim).fill(0);
            }

            for (let h = 0; h < this.numHeads; h++) {
                const headStart = h * this.headDim;

                for (let t = 0; t < seqLength; t++) {
                    const scores = new Array(seqLength);

                    for (let s = 0; s <= t; s++) {
                        let score = 0;
                        for (let d = 0; d < this.headDim; d++) {
                            score += queries[b][t][headStart + d] * keys[b][s][headStart + d];
                        }
                        scores[s] = score * scale;
                    }

                    for (let s = t + 1; s < seqLength; s++) {
                        scores[s] = -Infinity;
                    }

                    let maxScore = -Infinity;
                    for (let s = 0; s <= t; s++) {
                        if (scores[s] > maxScore) maxScore = scores[s];
                    }

                    let sumExp = 0;
                    const expScores = new Array(seqLength);
                    for (let s = 0; s < seqLength; s++) {
                        expScores[s] = scores[s] === -Infinity ? 0 : Math.exp(scores[s] - maxScore);
                        sumExp += expScores[s];
                    }

                    for (let s = 0; s < seqLength; s++) {
                        const weight = sumExp > 0 ? expScores[s] / sumExp : 0;
                        for (let d = 0; d < this.headDim; d++) {
                            attentionOutputs[b][t][headStart + d] += weight * values[b][s][headStart + d];
                        }
                    }
                }
            }
        }

        return this.#batchMatmul(attentionOutputs, this.outputWeights);
    }

    #batchMatmul(inputs, weights) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;
        const inputDim = weights.length;
        const outputDim = weights[0].length;

        const output = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            output[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                output[b][t] = new Array(outputDim).fill(0);
                for (let i = 0; i < inputDim; i++) {
                    for (let j = 0; j < outputDim; j++) {
                        output[b][t][j] += inputs[b][t][i] * weights[i][j];
                    }
                }
            }
        }
        return output;
    }
}

class TransformerBlock {
    attention = null;
    mlp = null;
    layerNorm1 = null;
    layerNorm2 = null;
    embeddingDim = 0;

    constructor(embeddingDim, numHeads) {
        this.embeddingDim = embeddingDim;
        this.attention = new MultiHeadAttention(embeddingDim, numHeads);
        this.mlp = new MLPBlock(embeddingDim);
        this.layerNorm1 = new LayerNormalization(embeddingDim);
        this.layerNorm2 = new LayerNormalization(embeddingDim);
    }

    forward(inputs) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;

        const normed1 = this.layerNorm1.forward(inputs);
        const attended = this.attention.forward(normed1);

        const residual1 = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            residual1[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                residual1[b][t] = new Array(this.embeddingDim);
                for (let d = 0; d < this.embeddingDim; d++) {
                    residual1[b][t][d] = inputs[b][t][d] + attended[b][t][d];
                }
            }
        }

        const normed2 = this.layerNorm2.forward(residual1);
        const mlpOutput = this.mlp.forward(normed2);

        const output = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            output[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                output[b][t] = new Array(this.embeddingDim);
                for (let d = 0; d < this.embeddingDim; d++) {
                    output[b][t][d] = residual1[b][t][d] + mlpOutput[b][t][d];
                }
            }
        }

        return output;
    }
}

class OutputLayer {
    weights = null;
    bias = null;
    inputDim = 0;
    vocabSize = 0;

    constructor(embeddingDim, vocabSize) {
        this.inputDim = embeddingDim;
        this.vocabSize = vocabSize;

        this.weights = new Array(embeddingDim);
        for (let i = 0; i < embeddingDim; i++) {
            this.weights[i] = new Array(vocabSize);
        }
        this.bias = new Array(vocabSize);
    }

    forward(inputs) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;
        const output = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            output[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                const logits = new Array(this.vocabSize);
                for (let v = 0; v < this.vocabSize; v++) {
                    let sum = this.bias[v];
                    for (let i = 0; i < this.inputDim; i++) {
                        sum += inputs[b][t][i] * this.weights[i][v];
                    }
                    logits[v] = sum;
                }

                let maxLogit = logits[0];
                for (let v = 1; v < this.vocabSize; v++) {
                    if (logits[v] > maxLogit) maxLogit = logits[v];
                }

                let sumExp = 0;
                const probs = new Array(this.vocabSize);
                for (let v = 0; v < this.vocabSize; v++) {
                    probs[v] = Math.exp(logits[v] - maxLogit);
                    sumExp += probs[v];
                }
                for (let v = 0; v < this.vocabSize; v++) {
                    probs[v] /= sumExp;
                }

                output[b][t] = probs;
            }
        }

        return output;
    }
}

class GabGPT {
    embedding = null;
    blocks = null;
    output = null;
    finalNorm = null;
    vocabSize = 0;

    constructor(vocabSize, embeddingDim, numHeads, numBlocks, maxSeqLength) {
        this.vocabSize = vocabSize;
        this.embedding = new PositionalEmbeddingLayer(vocabSize, embeddingDim, maxSeqLength);

        this.blocks = new Array(numBlocks);
        for (let i = 0; i < numBlocks; i++) {
            this.blocks[i] = new TransformerBlock(embeddingDim, numHeads);
        }

        this.finalNorm = new LayerNormalization(embeddingDim);
        this.output = new OutputLayer(embeddingDim, vocabSize);
    }

    forward(inputTokens) {
        let hidden = this.embedding.forward(inputTokens);

        for (let i = 0; i < this.blocks.length; i++) {
            hidden = this.blocks[i].forward(hidden);
        }

        hidden = this.finalNorm.forward(hidden);
        return this.output.forward(hidden);
    }

    generate(promptTokens, maxLength, temperature = 1.0, stopTokenIds = null) {
        let tokens = promptTokens.slice();

        for (let i = 0; i < maxLength; i++) {
            const probs = this.forward([tokens]);
            const lastProbs = probs[0][tokens.length - 1];
            const nextToken = this.#sampleWithTemperature(lastProbs, temperature);
            tokens.push(nextToken);

            // Check for stop tokens after adding
            if (stopTokenIds !== null) {
                if (Array.isArray(stopTokenIds)) {
                    if (stopTokenIds.includes(nextToken)) {
                        break;
                    }
                } else if (nextToken === stopTokenIds) {
                    break;
                }
            }
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

        const readFloat = () => {
            const val = view.getFloat32(offset, true);
            offset += 4;
            return val;
        };

        const read1D = (length) => {
            const arr = new Array(length);
            for (let i = 0; i < length; i++) {
                arr[i] = readFloat();
            }
            return arr;
        };

        const read2D = (rows, cols) => {
            const arr = new Array(rows);
            for (let i = 0; i < rows; i++) {
                arr[i] = new Array(cols);
                for (let j = 0; j < cols; j++) {
                    arr[i][j] = readFloat();
                }
            }
            return arr;
        };

        const model = new GabGPT(vocabSize, embeddingDim, numHeads, numBlocks, maxSeqLength);

        model.embedding.tokenEmbedding.weights = read2D(vocabSize, embeddingDim);
        model.embedding.positionWeights = read2D(maxSeqLength, embeddingDim);

        for (let b = 0; b < numBlocks; b++) {
            const block = model.blocks[b];

            block.layerNorm1.gamma = read1D(embeddingDim);
            block.layerNorm1.beta = read1D(embeddingDim);

            block.attention.queryWeights = read2D(embeddingDim, embeddingDim);
            block.attention.keyWeights = read2D(embeddingDim, embeddingDim);
            block.attention.valueWeights = read2D(embeddingDim, embeddingDim);
            block.attention.outputWeights = read2D(embeddingDim, embeddingDim);

            block.layerNorm2.gamma = read1D(embeddingDim);
            block.layerNorm2.beta = read1D(embeddingDim);

            for (let n = 0; n < hiddenDim; n++) {
                block.mlp.dense1.weights[n] = read1D(embeddingDim);
                block.mlp.dense1.biases[n] = readFloat();
            }

            for (let n = 0; n < embeddingDim; n++) {
                block.mlp.dense2.weights[n] = read1D(hiddenDim);
                block.mlp.dense2.biases[n] = readFloat();
            }
        }

        model.finalNorm.gamma = read1D(embeddingDim);
        model.finalNorm.beta = read1D(embeddingDim);

        model.output.weights = read2D(embeddingDim, vocabSize);
        model.output.bias = read1D(vocabSize);

        return model;
    }
}

function chat(model, tokenizer, userMessage) {
    const prompt = `<|user|>${userMessage}<|end|><|assistant|>`;
    const promptTokens = tokenizer.encode(prompt);

    const endTokenId = tokenizer.encode("<|end|>")[0];
    const endOfTextTokenId = tokenizer.encode("<|endoftext|>")[0];
    const generated = [];

    let tokens = promptTokens.slice();

    for (let i = 0; i < 100; i++) {
        const probs = model.forward([tokens]);
        const lastProbs = probs[0][tokens.length - 1];

        let maxProb = lastProbs[0];
        let nextToken = 0;
        for (let j = 1; j < lastProbs.length; j++) {
            if (lastProbs[j] > maxProb) {
                maxProb = lastProbs[j];
                nextToken = j;
            }
        }

        tokens.push(nextToken);
        generated.push(nextToken);

        if (nextToken === endTokenId || nextToken === endOfTextTokenId) {
            break;
        }
    }

    return tokenizer.decode(generated);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Tokenizer,
        DenseLayer,
        ActivationLayer,
        MLPBlock,
        EmbeddingLayer,
        PositionalEmbeddingLayer,
        LayerNormalization,
        MultiHeadAttention,
        TransformerBlock,
        OutputLayer,
        GabGPT,
        chat
    };
}
