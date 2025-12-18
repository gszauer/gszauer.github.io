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

    #makeMerge(token1, token2) {
        const mergeKey = `${token1},${token2}`;
        const existingMerge = this.merges.get(mergeKey);
        if (existingMerge !== undefined) {
            return existingMerge;
        }

        const newTokenId = this.nextTokenId++;
        this.merges.set(mergeKey, newTokenId);

        const token1Bytes = this.vocabulary.get(token1);
        const token2Bytes = this.vocabulary.get(token2);
        const newTokenBytes = [...token1Bytes, ...token2Bytes];
        this.vocabulary.set(newTokenId, newTokenBytes);

        return newTokenId;
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

    #findMostFrequentPair(tokensList) {
        const pairCounts = new Map();

        for (let i = 0; i < tokensList.length - 1; i++) {
            const pair = `${tokensList[i]},${tokensList[i + 1]}`;
            const currentCount = pairCounts.get(pair) || 0;
            pairCounts.set(pair, currentCount + 1);
        }

        let maxCount = 0;
        let mostFrequentPair = null;

        for (const [pair, count] of pairCounts) {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentPair = pair;
            }
        }

        if (mostFrequentPair && maxCount > 1) {
            const tokens = mostFrequentPair.split(',');
            return [parseInt(tokens[0]), parseInt(tokens[1])];
        }

        return null;
    }

    train(trainingText, numMerges) {
        let tokens = this.#stringToBytes(trainingText);

        console.log(`Starting training with ${tokens.length} bytes`);

        for (let mergeNum = 0; mergeNum < numMerges; mergeNum++) {
            const pair = this.#findMostFrequentPair(tokens);

            if (!pair) {
                console.log(`Training stopped early at merge ${mergeNum} - no more frequent pairs`);
                break;
            }

            const newTokenId = this.#makeMerge(pair[0], pair[1]);
            tokens = this.#applyMerge(tokens, pair[0], pair[1], newTokenId);
        }

        console.log(`Training complete. Vocabulary size: ${this.vocabulary.size}`);
    }

    reserveToken(tokenString) {
        let tokens = this.#stringToBytes(tokenString);

        if (tokens.length < 2) {
            return tokens[0];
        }

        // Apply existing merges first
        for (const [mergeKey, mergedToken] of this.merges) {
            const [token1, token2] = mergeKey.split(',').map(Number);
            tokens = this.#applyMerge(tokens, token1, token2, mergedToken);
        }

        // Now merge remaining tokens together (left to right)
        while (tokens.length > 1) {
            const newToken = this.#makeMerge(tokens[0], tokens[1]);
            tokens = [newToken, ...tokens.slice(2)];
        }

        return tokens[0];
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

    serialize() {
        let bufferSize = 16;
        bufferSize += this.merges.size * 12;
        bufferSize += 4;

        for (const [tokenId, bytes] of this.vocabulary) {
            bufferSize += 8 + bytes.length;
        }

        const buffer = new ArrayBuffer(bufferSize);
        const view = new DataView(buffer);
        const bytes = new Uint8Array(buffer);
        let offset = 0;

        view.setUint32(offset, 0x42504531, true);
        offset += 4;
        view.setUint32(offset, 1, true);
        offset += 4;
        view.setUint32(offset, this.nextTokenId, true);
        offset += 4;

        view.setUint32(offset, this.merges.size, true);
        offset += 4;

        for (const [mergeKey, mergedToken] of this.merges) {
            const [token1, token2] = mergeKey.split(',').map(Number);
            view.setUint32(offset, token1, true);
            offset += 4;
            view.setUint32(offset, token2, true);
            offset += 4;
            view.setUint32(offset, mergedToken, true);
            offset += 4;
        }

        view.setUint32(offset, this.vocabulary.size, true);
        offset += 4;

        for (const [tokenId, tokenBytes] of this.vocabulary) {
            view.setUint32(offset, tokenId, true);
            offset += 4;
            view.setUint32(offset, tokenBytes.length, true);
            offset += 4;
            for (let i = 0; i < tokenBytes.length; i++) {
                bytes[offset++] = tokenBytes[i];
            }
        }

        return bytes;
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

class Neuron {
    weights = null;
    bias = null;
    weightsState = null;
    biasState = null;

    constructor(numberOfInputs) {
        this.weights = new Array(numberOfInputs);
        for (let i = 0; i < numberOfInputs; i++) {
            this.weights[i] = Math.random() * 2 - 1;
        }
        this.bias = Math.random() * 2 - 1;
    }

    initializeOptimizer(optimizer) {
        this.weightsState = optimizer.createState(this.weights.length);
        this.biasState = optimizer.createState(1);
    }

    forward(inputs) {
        let sum = 0;
        for (let i = 0; i < inputs.length; i++) {
            sum += this.weights[i] * inputs[i];
        }
        return sum + this.bias;
    }

    backward(inputs, neuronGradient, learningRateOrOptimizer) {
        const parameterGradients = this.#calculateParameterGradients(inputs, neuronGradient);
        const inputGradients = this.#calculateInputGradients(neuronGradient);
        this.#updateWeights(parameterGradients, learningRateOrOptimizer);
        return inputGradients;
    }

    #calculateParameterGradients(inputs, neuronGradient) {
        const biasGradient = neuronGradient;
        const weightGradients = new Array(inputs.length);
        for (let i = 0; i < inputs.length; i++) {
            weightGradients[i] = neuronGradient * inputs[i];
        }
        return {
            bias: biasGradient,
            weights: weightGradients
        };
    }

    #calculateInputGradients(neuronGradient) {
        const inputGradients = new Array(this.weights.length);
        for (let i = 0; i < this.weights.length; i++) {
            inputGradients[i] = neuronGradient * this.weights[i];
        }
        return inputGradients;
    }

    #updateWeights(gradients, learningRateOrOptimizer) {
        if (typeof learningRateOrOptimizer === 'number') {
            // SGD fallback
            const learningRate = learningRateOrOptimizer;
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i] -= learningRate * gradients.weights[i];
            }
            this.bias -= learningRate * gradients.bias;
        } else {
            // Adam optimizer
            const optimizer = learningRateOrOptimizer;
            optimizer.update1D(this.weights, gradients.weights, this.weightsState);
            const biasArr = [this.bias];
            optimizer.update1D(biasArr, [gradients.bias], this.biasState);
            this.bias = biasArr[0];
        }
    }
}

class DenseLayer {
    neurons = null;
    cachedInputs = null;

    constructor(numberOfInputs, numberOfOutputs) {
        this.neurons = new Array(numberOfOutputs);
        for (let i = 0; i < numberOfOutputs; i++) {
            this.neurons[i] = new Neuron(numberOfInputs);
        }
        this.cachedInputs = new Array(numberOfInputs);
    }

    initializeOptimizer(optimizer) {
        for (let i = 0; i < this.neurons.length; i++) {
            this.neurons[i].initializeOptimizer(optimizer);
        }
    }

    forward(inputs) {
        for (let i = 0; i < inputs.length; i++) {
            this.cachedInputs[i] = inputs[i];
        }

        const outputs = new Array(this.neurons.length);
        for (let i = 0; i < this.neurons.length; i++) {
            outputs[i] = this.neurons[i].forward(inputs);
        }
        return outputs;
    }

    backward(outputGradients, learningRateOrOptimizer) {
        const inputGradients = new Array(this.cachedInputs.length);
        for (let i = 0; i < inputGradients.length; i++) {
            inputGradients[i] = 0;
        }

        for (let neuronIdx = 0; neuronIdx < this.neurons.length; neuronIdx++) {
            const neuron = this.neurons[neuronIdx];
            const neuronsInputGradients = neuron.backward(
                this.cachedInputs,
                outputGradients[neuronIdx],
                learningRateOrOptimizer
            );

            for (let i = 0; i < neuronsInputGradients.length; i++) {
                inputGradients[i] += neuronsInputGradients[i];
            }
        }

        return inputGradients;
    }
}

class ActivationLayer {
    kind = "relu";
    cachedInputs = null;

    constructor(layerType = "relu") {
        this.kind = layerType;
    }

    #reluActivation(x) {
        return Math.max(0, x);
    }

    #sigmoidActivation(x) {
        return 1 / (1 + Math.exp(-x));
    }

    #tanhActivation(x) {
        return Math.tanh(x);
    }

    #geluActivation(x) {
        const c = Math.sqrt(2 / Math.PI);
        return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
    }

    #reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }

    #sigmoidDerivative(x) {
        const sig = this.#sigmoidActivation(x);
        return sig * (1 - sig);
    }

    #tanhDerivative(x) {
        const t = Math.tanh(x);
        return 1 - t * t;
    }

    #geluDerivative(x) {
        const c = Math.sqrt(2 / Math.PI);
        const x3 = x * x * x;
        const inner = c * (x + 0.044715 * x3);
        const tanhInner = Math.tanh(inner);
        const sech2 = 1 - tanhInner * tanhInner;
        const innerDeriv = c * (1 + 3 * 0.044715 * x * x);
        return 0.5 * (1 + tanhInner) + 0.5 * x * sech2 * innerDeriv;
    }

    forward(inputs) {
        if (this.cachedInputs === null || this.cachedInputs.length !== inputs.length) {
            this.cachedInputs = new Array(inputs.length);
        }
        for (let i = 0; i < inputs.length; i++) {
            this.cachedInputs[i] = inputs[i];
        }

        const output = new Array(inputs.length);

        if (this.kind === "relu") {
            for (let i = 0; i < inputs.length; i++) {
                output[i] = this.#reluActivation(inputs[i]);
            }
        } else if (this.kind === "sigmoid") {
            for (let i = 0; i < inputs.length; i++) {
                output[i] = this.#sigmoidActivation(inputs[i]);
            }
        } else if (this.kind === "tanh") {
            for (let i = 0; i < inputs.length; i++) {
                output[i] = this.#tanhActivation(inputs[i]);
            }
        } else if (this.kind === "gelu") {
            for (let i = 0; i < inputs.length; i++) {
                output[i] = this.#geluActivation(inputs[i]);
            }
        }

        return output;
    }

    backward(outputGradients) {
        const inputGradients = new Array(outputGradients.length);

        if (this.kind === "relu") {
            for (let i = 0; i < outputGradients.length; i++) {
                inputGradients[i] = outputGradients[i] * this.#reluDerivative(this.cachedInputs[i]);
            }
        } else if (this.kind === "sigmoid") {
            for (let i = 0; i < outputGradients.length; i++) {
                inputGradients[i] = outputGradients[i] * this.#sigmoidDerivative(this.cachedInputs[i]);
            }
        } else if (this.kind === "tanh") {
            for (let i = 0; i < outputGradients.length; i++) {
                inputGradients[i] = outputGradients[i] * this.#tanhDerivative(this.cachedInputs[i]);
            }
        } else if (this.kind === "gelu") {
            for (let i = 0; i < outputGradients.length; i++) {
                inputGradients[i] = outputGradients[i] * this.#geluDerivative(this.cachedInputs[i]);
            }
        }

        return inputGradients;
    }
}

class MLPBlock {
    dense1 = null;
    activation = null;
    dense2 = null;

    cachedInputs = null;
    cachedHidden1 = null;
    cachedHidden2 = null;

    constructor(embeddingDim, expansionFactor = 4) {
        const hiddenDim = embeddingDim * expansionFactor;

        this.dense1 = new DenseLayer(embeddingDim, hiddenDim);
        this.activation = new ActivationLayer("gelu");
        this.dense2 = new DenseLayer(hiddenDim, embeddingDim);
    }

    initializeOptimizer(optimizer) {
        this.dense1.initializeOptimizer(optimizer);
        this.dense2.initializeOptimizer(optimizer);
    }

    forward(inputs) {
        // inputs: [batchSize][seqLen][embeddingDim]
        const batchSize = inputs.length;
        const seqLen = inputs[0].length;

        this.cachedInputs = inputs;
        this.cachedHidden1 = new Array(batchSize);
        this.cachedHidden2 = new Array(batchSize);

        const outputs = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            this.cachedHidden1[b] = new Array(seqLen);
            this.cachedHidden2[b] = new Array(seqLen);
            outputs[b] = new Array(seqLen);

            for (let t = 0; t < seqLen; t++) {
                // Each position goes through: Dense1 → GELU → Dense2
                this.cachedHidden1[b][t] = this.dense1.forward(inputs[b][t]);
                this.cachedHidden2[b][t] = this.activation.forward(this.cachedHidden1[b][t]);
                outputs[b][t] = this.dense2.forward(this.cachedHidden2[b][t]);
            }
        }

        return outputs;
    }

    backward(outputGradients, learningRateOrOptimizer) {
        // outputGradients: [batchSize][seqLen][embeddingDim]
        const batchSize = outputGradients.length;
        const seqLen = outputGradients[0].length;

        const inputGradients = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            inputGradients[b] = new Array(seqLen);

            for (let t = 0; t < seqLen; t++) {
                // Restore layer caches for this position
                this.dense1.cachedInputs = this.cachedInputs[b][t];
                this.activation.cachedInputs = this.cachedHidden1[b][t];
                this.dense2.cachedInputs = this.cachedHidden2[b][t];

                // Backward through the layers
                let grad = this.dense2.backward(outputGradients[b][t], learningRateOrOptimizer);
                grad = this.activation.backward(grad);
                inputGradients[b][t] = this.dense1.backward(grad, learningRateOrOptimizer);
            }
        }

        return inputGradients;
    }
}

class AdamOptimizer {
    learningRate = 0.001;
    beta1 = 0.9;
    beta2 = 0.999;
    epsilon = 1e-8;
    step = 0;

    constructor(learningRate = 0.001) {
        this.learningRate = learningRate;
    }

    createState(shape) {
        if (typeof shape === 'number') {
            return {
                m: new Array(shape).fill(0),
                v: new Array(shape).fill(0)
            };
        } else if (shape.length === 2) {
            const m = new Array(shape[0]);
            const v = new Array(shape[0]);
            for (let i = 0; i < shape[0]; i++) {
                m[i] = new Array(shape[1]).fill(0);
                v[i] = new Array(shape[1]).fill(0);
            }
            return { m, v };
        }
    }

    update1D(params, grads, state) {
        this.step++;

        for (let i = 0; i < params.length; i++) {
            state.m[i] = this.beta1 * state.m[i] + (1 - this.beta1) * grads[i];
            state.v[i] = this.beta2 * state.v[i] + (1 - this.beta2) * grads[i] * grads[i];

            const mHat = state.m[i] / (1 - Math.pow(this.beta1, this.step));
            const vHat = state.v[i] / (1 - Math.pow(this.beta2, this.step));

            params[i] -= this.learningRate * mHat / (Math.sqrt(vHat) + this.epsilon);
        }
    }

    update2D(params, grads, state) {
        this.step++;

        for (let i = 0; i < params.length; i++) {
            for (let j = 0; j < params[i].length; j++) {
                state.m[i][j] = this.beta1 * state.m[i][j] + (1 - this.beta1) * grads[i][j];
                state.v[i][j] = this.beta2 * state.v[i][j] + (1 - this.beta2) * grads[i][j] * grads[i][j];

                const mHat = state.m[i][j] / (1 - Math.pow(this.beta1, this.step));
                const vHat = state.v[i][j] / (1 - Math.pow(this.beta2, this.step));

                params[i][j] -= this.learningRate * mHat / (Math.sqrt(vHat) + this.epsilon);
            }
        }
    }
}

class EmbeddingLayer {
    weights = null;
    vocabSize = 0;
    embeddingDim = 0;
    cachedInputTokens = null;
    weightsState = null;

    constructor(vocabSize, embeddingDim) {
        this.vocabSize = vocabSize;
        this.embeddingDim = embeddingDim;

        const scale = Math.sqrt(1.0 / embeddingDim);
        this.weights = new Array(vocabSize);
        for (let i = 0; i < vocabSize; i++) {
            this.weights[i] = new Array(embeddingDim);
            for (let j = 0; j < embeddingDim; j++) {
                this.weights[i][j] = (Math.random() * 2 - 1) * scale;
            }
        }
    }

    initializeOptimizer(optimizer) {
        this.weightsState = optimizer.createState([this.vocabSize, this.embeddingDim]);
    }

    forward(inputTokens) {
        const batchSize = inputTokens.length;
        const seqLength = inputTokens[0].length;

        this.cachedInputTokens = inputTokens;

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

    backward(outputGradients, learningRateOrOptimizer) {
        const batchSize = this.cachedInputTokens.length;
        const seqLength = this.cachedInputTokens[0].length;

        if (typeof learningRateOrOptimizer === 'number') {
            // SGD fallback
            const learningRate = learningRateOrOptimizer;
            for (let b = 0; b < batchSize; b++) {
                for (let t = 0; t < seqLength; t++) {
                    const tokenId = this.cachedInputTokens[b][t];
                    for (let d = 0; d < this.embeddingDim; d++) {
                        this.weights[tokenId][d] -= learningRate * outputGradients[b][t][d];
                    }
                }
            }
        } else {
            // Adam optimizer - accumulate gradients first, then update
            const optimizer = learningRateOrOptimizer;
            const grads = new Array(this.vocabSize);
            for (let i = 0; i < this.vocabSize; i++) {
                grads[i] = new Array(this.embeddingDim).fill(0);
            }

            for (let b = 0; b < batchSize; b++) {
                for (let t = 0; t < seqLength; t++) {
                    const tokenId = this.cachedInputTokens[b][t];
                    for (let d = 0; d < this.embeddingDim; d++) {
                        grads[tokenId][d] += outputGradients[b][t][d];
                    }
                }
            }

            optimizer.update2D(this.weights, grads, this.weightsState);
        }

        return null;
    }
}

class PositionalEmbeddingLayer {
    tokenEmbedding = null;
    positionWeights = null;
    maxSequenceLength = 0;
    embeddingDim = 0;
    cachedBatchSize = 0;
    cachedSeqLength = 0;
    positionWeightsState = null;

    constructor(vocabSize, embeddingDim, maxSequenceLength) {
        this.embeddingDim = embeddingDim;
        this.maxSequenceLength = maxSequenceLength;

        this.tokenEmbedding = new EmbeddingLayer(vocabSize, embeddingDim);

        const scale = Math.sqrt(1.0 / embeddingDim);
        this.positionWeights = new Array(maxSequenceLength);
        for (let pos = 0; pos < maxSequenceLength; pos++) {
            this.positionWeights[pos] = new Array(embeddingDim);
            for (let d = 0; d < embeddingDim; d++) {
                this.positionWeights[pos][d] = (Math.random() * 2 - 1) * scale;
            }
        }
    }

    initializeOptimizer(optimizer) {
        this.tokenEmbedding.initializeOptimizer(optimizer);
        this.positionWeightsState = optimizer.createState([this.maxSequenceLength, this.embeddingDim]);
    }

    forward(inputTokens) {
        const tokenEmbeddings = this.tokenEmbedding.forward(inputTokens);

        const batchSize = inputTokens.length;
        const seqLength = inputTokens[0].length;
        this.cachedBatchSize = batchSize;
        this.cachedSeqLength = seqLength;

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

    backward(outputGradients, learningRateOrOptimizer) {
        if (typeof learningRateOrOptimizer === 'number') {
            // SGD fallback
            const learningRate = learningRateOrOptimizer;
            for (let t = 0; t < this.cachedSeqLength; t++) {
                for (let d = 0; d < this.embeddingDim; d++) {
                    let grad = 0;
                    for (let b = 0; b < this.cachedBatchSize; b++) {
                        grad += outputGradients[b][t][d];
                    }
                    this.positionWeights[t][d] -= learningRate * grad;
                }
            }
        } else {
            // Adam optimizer
            const optimizer = learningRateOrOptimizer;
            const grads = new Array(this.maxSequenceLength);
            for (let t = 0; t < this.maxSequenceLength; t++) {
                grads[t] = new Array(this.embeddingDim).fill(0);
            }

            for (let t = 0; t < this.cachedSeqLength; t++) {
                for (let d = 0; d < this.embeddingDim; d++) {
                    for (let b = 0; b < this.cachedBatchSize; b++) {
                        grads[t][d] += outputGradients[b][t][d];
                    }
                }
            }

            optimizer.update2D(this.positionWeights, grads, this.positionWeightsState);
        }

        this.tokenEmbedding.backward(outputGradients, learningRateOrOptimizer);
        return null;
    }
}

class LayerNormalization {
    gamma = null;
    beta = null;
    featureSize = 0;
    epsilon = 1e-5;

    cachedInputs = null;
    cachedMean = null;
    cachedVariance = null;
    cachedNormalized = null;
    gammaState = null;
    betaState = null;

    constructor(featureSize) {
        this.featureSize = featureSize;

        this.gamma = new Array(featureSize);
        this.beta = new Array(featureSize);
        for (let i = 0; i < featureSize; i++) {
            this.gamma[i] = 1.0;
            this.beta[i] = 0.0;
        }
    }

    initializeOptimizer(optimizer) {
        this.gammaState = optimizer.createState(this.featureSize);
        this.betaState = optimizer.createState(this.featureSize);
    }

    forward(inputs) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;

        this.cachedInputs = inputs;
        this.cachedMean = new Array(batchSize);
        this.cachedVariance = new Array(batchSize);
        this.cachedNormalized = new Array(batchSize);

        const output = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            this.cachedMean[b] = new Array(seqLength);
            this.cachedVariance[b] = new Array(seqLength);
            this.cachedNormalized[b] = new Array(seqLength);
            output[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                let mean = 0;
                for (let i = 0; i < this.featureSize; i++) {
                    mean += inputs[b][t][i];
                }
                mean /= this.featureSize;
                this.cachedMean[b][t] = mean;

                let variance = 0;
                for (let i = 0; i < this.featureSize; i++) {
                    const diff = inputs[b][t][i] - mean;
                    variance += diff * diff;
                }
                variance /= this.featureSize;
                this.cachedVariance[b][t] = variance;

                const stdInv = 1.0 / Math.sqrt(variance + this.epsilon);
                this.cachedNormalized[b][t] = new Array(this.featureSize);
                output[b][t] = new Array(this.featureSize);

                for (let i = 0; i < this.featureSize; i++) {
                    const normalized = (inputs[b][t][i] - mean) * stdInv;
                    this.cachedNormalized[b][t][i] = normalized;
                    output[b][t][i] = this.gamma[i] * normalized + this.beta[i];
                }
            }
        }

        return output;
    }

    backward(outputGradients, learningRateOrOptimizer) {
        const batchSize = outputGradients.length;
        const seqLength = outputGradients[0].length;

        const inputGradients = new Array(batchSize);

        const gammaGrad = new Array(this.featureSize).fill(0);
        const betaGrad = new Array(this.featureSize).fill(0);

        for (let b = 0; b < batchSize; b++) {
            inputGradients[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                const mean = this.cachedMean[b][t];
                const variance = this.cachedVariance[b][t];
                const stdInv = 1.0 / Math.sqrt(variance + this.epsilon);

                for (let i = 0; i < this.featureSize; i++) {
                    gammaGrad[i] += outputGradients[b][t][i] * this.cachedNormalized[b][t][i];
                    betaGrad[i] += outputGradients[b][t][i];
                }

                inputGradients[b][t] = new Array(this.featureSize);

                let dNormSum = 0;
                let dVarSum = 0;

                for (let i = 0; i < this.featureSize; i++) {
                    const dNorm = outputGradients[b][t][i] * this.gamma[i];
                    dNormSum += dNorm;
                    dVarSum += dNorm * (this.cachedInputs[b][t][i] - mean);
                }

                const dVar = dVarSum * -0.5 * Math.pow(variance + this.epsilon, -1.5);

                let sumDiff = 0;
                for (let i = 0; i < this.featureSize; i++) {
                    sumDiff += this.cachedInputs[b][t][i] - mean;
                }
                const dMean = -stdInv * dNormSum + dVar * -2.0 / this.featureSize * sumDiff;

                for (let i = 0; i < this.featureSize; i++) {
                    const dNorm = outputGradients[b][t][i] * this.gamma[i];
                    inputGradients[b][t][i] = dNorm * stdInv +
                        dVar * 2.0 * (this.cachedInputs[b][t][i] - mean) / this.featureSize +
                        dMean / this.featureSize;
                }
            }
        }

        if (typeof learningRateOrOptimizer === 'number') {
            // SGD fallback
            const learningRate = learningRateOrOptimizer;
            for (let i = 0; i < this.featureSize; i++) {
                this.gamma[i] -= learningRate * gammaGrad[i];
                this.beta[i] -= learningRate * betaGrad[i];
            }
        } else {
            // Adam optimizer
            const optimizer = learningRateOrOptimizer;
            optimizer.update1D(this.gamma, gammaGrad, this.gammaState);
            optimizer.update1D(this.beta, betaGrad, this.betaState);
        }

        return inputGradients;
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

    cachedInputs = null;
    cachedQueries = null;
    cachedKeys = null;
    cachedValues = null;
    cachedAttentionWeights = null;

    queryWeightsState = null;
    keyWeightsState = null;
    valueWeightsState = null;
    outputWeightsState = null;

    constructor(embeddingDim, numHeads) {
        this.embeddingDim = embeddingDim;
        this.numHeads = numHeads;
        this.headDim = embeddingDim / numHeads;

        const scale = Math.sqrt(2.0 / embeddingDim);

        this.queryWeights = this.#initializeWeights(embeddingDim, embeddingDim, scale);
        this.keyWeights = this.#initializeWeights(embeddingDim, embeddingDim, scale);
        this.valueWeights = this.#initializeWeights(embeddingDim, embeddingDim, scale);
        this.outputWeights = this.#initializeWeights(embeddingDim, embeddingDim, scale);
    }

    initializeOptimizer(optimizer) {
        this.queryWeightsState = optimizer.createState([this.embeddingDim, this.embeddingDim]);
        this.keyWeightsState = optimizer.createState([this.embeddingDim, this.embeddingDim]);
        this.valueWeightsState = optimizer.createState([this.embeddingDim, this.embeddingDim]);
        this.outputWeightsState = optimizer.createState([this.embeddingDim, this.embeddingDim]);
    }

    #initializeWeights(inputSize, outputSize, scale) {
        const weights = new Array(inputSize);
        for (let i = 0; i < inputSize; i++) {
            weights[i] = new Array(outputSize);
            for (let j = 0; j < outputSize; j++) {
                weights[i][j] = (Math.random() * 2 - 1) * scale;
            }
        }
        return weights;
    }

    forward(inputs, paddingMask = null) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;

        this.cachedInputs = inputs;

        const queries = this.#batchMatmul(inputs, this.queryWeights);
        const keys = this.#batchMatmul(inputs, this.keyWeights);
        const values = this.#batchMatmul(inputs, this.valueWeights);

        this.cachedQueries = queries;
        this.cachedKeys = keys;
        this.cachedValues = values;

        const scale = 1.0 / Math.sqrt(this.headDim);
        this.cachedAttentionWeights = new Array(batchSize);
        const attentionOutputs = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            this.cachedAttentionWeights[b] = new Array(this.numHeads);
            attentionOutputs[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                attentionOutputs[b][t] = new Array(this.embeddingDim).fill(0);
            }

            for (let h = 0; h < this.numHeads; h++) {
                const headStart = h * this.headDim;
                this.cachedAttentionWeights[b][h] = new Array(seqLength);

                for (let t = 0; t < seqLength; t++) {
                    if (paddingMask && paddingMask[b][t] === 0) {
                        this.cachedAttentionWeights[b][h][t] = new Array(seqLength).fill(0);
                        continue;
                    }

                    const scores = new Array(seqLength);

                    for (let s = 0; s <= t; s++) {
                        if (paddingMask && paddingMask[b][s] === 0) {
                            scores[s] = -Infinity;
                        } else {
                            let score = 0;
                            for (let d = 0; d < this.headDim; d++) {
                                score += queries[b][t][headStart + d] * keys[b][s][headStart + d];
                            }
                            scores[s] = score * scale;
                        }
                    }

                    for (let s = t + 1; s < seqLength; s++) {
                        scores[s] = -Infinity;
                    }

                    let maxScore = -Infinity;
                    for (let s = 0; s < seqLength; s++) {
                        if (scores[s] > maxScore) maxScore = scores[s];
                    }
                    if (maxScore === -Infinity) maxScore = 0;

                    let sumExp = 0;
                    const expScores = new Array(seqLength);
                    for (let s = 0; s < seqLength; s++) {
                        expScores[s] = scores[s] === -Infinity ? 0 : Math.exp(scores[s] - maxScore);
                        sumExp += expScores[s];
                    }

                    const attentionWeights = new Array(seqLength);
                    for (let s = 0; s < seqLength; s++) {
                        attentionWeights[s] = sumExp > 0 ? expScores[s] / sumExp : 0;
                    }
                    this.cachedAttentionWeights[b][h][t] = attentionWeights;

                    for (let s = 0; s < seqLength; s++) {
                        for (let d = 0; d < this.headDim; d++) {
                            attentionOutputs[b][t][headStart + d] +=
                                attentionWeights[s] * values[b][s][headStart + d];
                        }
                    }
                }
            }
        }

        const output = this.#batchMatmul(attentionOutputs, this.outputWeights);
        return output;
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

    backward(outputGradients, learningRateOrOptimizer) {
        const batchSize = outputGradients.length;
        const seqLength = outputGradients[0].length;

        const attentionGradients = this.#batchMatmulBackward(
            outputGradients, this.outputWeights, learningRateOrOptimizer, this.outputWeightsState
        );

        const queryGrads = new Array(batchSize);
        const keyGrads = new Array(batchSize);
        const valueGrads = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            queryGrads[b] = new Array(seqLength);
            keyGrads[b] = new Array(seqLength);
            valueGrads[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                queryGrads[b][t] = new Array(this.embeddingDim).fill(0);
                keyGrads[b][t] = new Array(this.embeddingDim).fill(0);
                valueGrads[b][t] = new Array(this.embeddingDim).fill(0);
            }

            const scale = 1.0 / Math.sqrt(this.headDim);

            for (let h = 0; h < this.numHeads; h++) {
                const headStart = h * this.headDim;

                for (let t = 0; t < seqLength; t++) {
                    const attnWeights = this.cachedAttentionWeights[b][h][t];

                    for (let s = 0; s <= t; s++) {
                        for (let d = 0; d < this.headDim; d++) {
                            valueGrads[b][s][headStart + d] +=
                                attnWeights[s] * attentionGradients[b][t][headStart + d];
                        }
                    }

                    const dAttnWeights = new Array(seqLength).fill(0);
                    for (let s = 0; s <= t; s++) {
                        for (let d = 0; d < this.headDim; d++) {
                            dAttnWeights[s] += attentionGradients[b][t][headStart + d] *
                                this.cachedValues[b][s][headStart + d];
                        }
                    }

                    let dotProduct = 0;
                    for (let s = 0; s <= t; s++) {
                        dotProduct += dAttnWeights[s] * attnWeights[s];
                    }

                    const dScores = new Array(seqLength).fill(0);
                    for (let s = 0; s <= t; s++) {
                        dScores[s] = attnWeights[s] * (dAttnWeights[s] - dotProduct) * scale;
                    }

                    for (let s = 0; s <= t; s++) {
                        for (let d = 0; d < this.headDim; d++) {
                            queryGrads[b][t][headStart + d] +=
                                dScores[s] * this.cachedKeys[b][s][headStart + d];
                            keyGrads[b][s][headStart + d] +=
                                dScores[s] * this.cachedQueries[b][t][headStart + d];
                        }
                    }
                }
            }
        }

        const inputGrads1 = this.#batchMatmulBackwardInput(queryGrads, this.queryWeights);
        const inputGrads2 = this.#batchMatmulBackwardInput(keyGrads, this.keyWeights);
        const inputGrads3 = this.#batchMatmulBackwardInput(valueGrads, this.valueWeights);

        this.#updateWeights(this.queryWeights, this.cachedInputs, queryGrads, learningRateOrOptimizer, this.queryWeightsState);
        this.#updateWeights(this.keyWeights, this.cachedInputs, keyGrads, learningRateOrOptimizer, this.keyWeightsState);
        this.#updateWeights(this.valueWeights, this.cachedInputs, valueGrads, learningRateOrOptimizer, this.valueWeightsState);

        const inputGradients = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            inputGradients[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                inputGradients[b][t] = new Array(this.embeddingDim);
                for (let d = 0; d < this.embeddingDim; d++) {
                    inputGradients[b][t][d] = inputGrads1[b][t][d] +
                        inputGrads2[b][t][d] + inputGrads3[b][t][d];
                }
            }
        }

        return inputGradients;
    }

    #batchMatmulBackward(outputGrads, weights, learningRateOrOptimizer, weightsState) {
        const batchSize = outputGrads.length;
        const seqLength = outputGrads[0].length;
        const inputDim = weights.length;
        const outputDim = weights[0].length;

        const inputGrads = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            inputGrads[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                inputGrads[b][t] = new Array(inputDim).fill(0);
                for (let i = 0; i < inputDim; i++) {
                    for (let j = 0; j < outputDim; j++) {
                        inputGrads[b][t][i] += outputGrads[b][t][j] * weights[i][j];
                    }
                }
            }
        }

        // Compute weight gradients
        const weightGrads = new Array(inputDim);
        for (let i = 0; i < inputDim; i++) {
            weightGrads[i] = new Array(outputDim).fill(0);
            for (let j = 0; j < outputDim; j++) {
                for (let b = 0; b < batchSize; b++) {
                    for (let t = 0; t < seqLength; t++) {
                        weightGrads[i][j] += this.cachedInputs[b][t][i] * outputGrads[b][t][j];
                    }
                }
            }
        }

        if (typeof learningRateOrOptimizer === 'number') {
            // SGD fallback
            const learningRate = learningRateOrOptimizer;
            for (let i = 0; i < inputDim; i++) {
                for (let j = 0; j < outputDim; j++) {
                    weights[i][j] -= learningRate * weightGrads[i][j];
                }
            }
        } else {
            // Adam optimizer
            learningRateOrOptimizer.update2D(weights, weightGrads, weightsState);
        }

        return inputGrads;
    }

    #batchMatmulBackwardInput(outputGrads, weights) {
        const batchSize = outputGrads.length;
        const seqLength = outputGrads[0].length;
        const inputDim = weights.length;
        const outputDim = weights[0].length;

        const inputGrads = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            inputGrads[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                inputGrads[b][t] = new Array(inputDim).fill(0);
                for (let i = 0; i < inputDim; i++) {
                    for (let j = 0; j < outputDim; j++) {
                        inputGrads[b][t][i] += outputGrads[b][t][j] * weights[i][j];
                    }
                }
            }
        }
        return inputGrads;
    }

    #updateWeights(weights, inputs, grads, learningRateOrOptimizer, weightsState) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;
        const inputDim = weights.length;
        const outputDim = weights[0].length;

        const weightGrads = new Array(inputDim);
        for (let i = 0; i < inputDim; i++) {
            weightGrads[i] = new Array(outputDim).fill(0);
            for (let j = 0; j < outputDim; j++) {
                for (let b = 0; b < batchSize; b++) {
                    for (let t = 0; t < seqLength; t++) {
                        weightGrads[i][j] += inputs[b][t][i] * grads[b][t][j];
                    }
                }
            }
        }

        if (typeof learningRateOrOptimizer === 'number') {
            // SGD fallback
            const learningRate = learningRateOrOptimizer;
            for (let i = 0; i < inputDim; i++) {
                for (let j = 0; j < outputDim; j++) {
                    weights[i][j] -= learningRate * weightGrads[i][j];
                }
            }
        } else {
            // Adam optimizer
            learningRateOrOptimizer.update2D(weights, weightGrads, weightsState);
        }
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

    initializeOptimizer(optimizer) {
        this.attention.initializeOptimizer(optimizer);
        this.mlp.initializeOptimizer(optimizer);
        this.layerNorm1.initializeOptimizer(optimizer);
        this.layerNorm2.initializeOptimizer(optimizer);
    }

    forward(inputs, paddingMask = null) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;

        const normed1 = this.layerNorm1.forward(inputs);
        const attended = this.attention.forward(normed1, paddingMask);

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

    backward(outputGradients, learningRateOrOptimizer) {
        const batchSize = outputGradients.length;
        const seqLength = outputGradients[0].length;

        const mlpGrad = this.mlp.backward(outputGradients, learningRateOrOptimizer);
        const norm2Grad = this.layerNorm2.backward(mlpGrad, learningRateOrOptimizer);

        const residual1Grad = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            residual1Grad[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                residual1Grad[b][t] = new Array(this.embeddingDim);
                for (let d = 0; d < this.embeddingDim; d++) {
                    residual1Grad[b][t][d] = outputGradients[b][t][d] + norm2Grad[b][t][d];
                }
            }
        }

        const attentionGrad = this.attention.backward(residual1Grad, learningRateOrOptimizer);
        const norm1Grad = this.layerNorm1.backward(attentionGrad, learningRateOrOptimizer);

        const inputGradients = new Array(batchSize);
        for (let b = 0; b < batchSize; b++) {
            inputGradients[b] = new Array(seqLength);
            for (let t = 0; t < seqLength; t++) {
                inputGradients[b][t] = new Array(this.embeddingDim);
                for (let d = 0; d < this.embeddingDim; d++) {
                    inputGradients[b][t][d] = residual1Grad[b][t][d] + norm1Grad[b][t][d];
                }
            }
        }

        return inputGradients;
    }
}

class OutputLayer {
    weights = null;
    bias = null;
    inputDim = 0;
    vocabSize = 0;

    cachedInputs = null;
    cachedProbs = null;
    weightsState = null;
    biasState = null;

    constructor(embeddingDim, vocabSize) {
        this.inputDim = embeddingDim;
        this.vocabSize = vocabSize;

        const scale = Math.sqrt(2.0 / embeddingDim);

        this.weights = new Array(embeddingDim);
        for (let i = 0; i < embeddingDim; i++) {
            this.weights[i] = new Array(vocabSize);
            for (let j = 0; j < vocabSize; j++) {
                this.weights[i][j] = (Math.random() * 2 - 1) * scale;
            }
        }

        this.bias = new Array(vocabSize).fill(0);
    }

    initializeOptimizer(optimizer) {
        this.weightsState = optimizer.createState([this.inputDim, this.vocabSize]);
        this.biasState = optimizer.createState(this.vocabSize);
    }

    forward(inputs) {
        const batchSize = inputs.length;
        const seqLength = inputs[0].length;

        this.cachedInputs = inputs;
        this.cachedProbs = new Array(batchSize);

        const output = new Array(batchSize);

        for (let b = 0; b < batchSize; b++) {
            output[b] = new Array(seqLength);
            this.cachedProbs[b] = new Array(seqLength);

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
                this.cachedProbs[b][t] = probs;
            }
        }

        return output;
    }

    backward(targetTokens, learningRateOrOptimizer) {
        const batchSize = targetTokens.length;
        const seqLength = targetTokens[0].length;

        const inputGradients = new Array(batchSize);

        const weightsGrad = new Array(this.inputDim);
        for (let i = 0; i < this.inputDim; i++) {
            weightsGrad[i] = new Array(this.vocabSize).fill(0);
        }
        const biasGrad = new Array(this.vocabSize).fill(0);

        for (let b = 0; b < batchSize; b++) {
            inputGradients[b] = new Array(seqLength);

            for (let t = 0; t < seqLength; t++) {
                const grad = new Array(this.vocabSize);
                for (let v = 0; v < this.vocabSize; v++) {
                    grad[v] = this.cachedProbs[b][t][v];
                }
                grad[targetTokens[b][t]] -= 1;

                inputGradients[b][t] = new Array(this.inputDim).fill(0);
                for (let i = 0; i < this.inputDim; i++) {
                    for (let v = 0; v < this.vocabSize; v++) {
                        inputGradients[b][t][i] += grad[v] * this.weights[i][v];
                        weightsGrad[i][v] += this.cachedInputs[b][t][i] * grad[v];
                    }
                }

                for (let v = 0; v < this.vocabSize; v++) {
                    biasGrad[v] += grad[v];
                }
            }
        }

        if (typeof learningRateOrOptimizer === 'number') {
            // SGD fallback
            const learningRate = learningRateOrOptimizer;
            for (let i = 0; i < this.inputDim; i++) {
                for (let v = 0; v < this.vocabSize; v++) {
                    this.weights[i][v] -= learningRate * weightsGrad[i][v];
                }
            }
            for (let v = 0; v < this.vocabSize; v++) {
                this.bias[v] -= learningRate * biasGrad[v];
            }
        } else {
            // Adam optimizer
            const optimizer = learningRateOrOptimizer;
            optimizer.update2D(this.weights, weightsGrad, this.weightsState);
            optimizer.update1D(this.bias, biasGrad, this.biasState);
        }

        return inputGradients;
    }

    computeLoss(probs, targetTokens) {
        const batchSize = probs.length;
        const seqLength = probs[0].length;

        let totalLoss = 0;
        for (let b = 0; b < batchSize; b++) {
            for (let t = 0; t < seqLength; t++) {
                const targetProb = probs[b][t][targetTokens[b][t]];
                totalLoss += -Math.log(targetProb + 1e-10);
            }
        }

        return totalLoss / (batchSize * seqLength);
    }
}

class GabGPT {
    embedding = null;
    blocks = null;
    output = null;
    finalNorm = null;
    vocabSize = 0;
    optimizer = null;

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

    useOptimizer(optimizer) {
        this.optimizer = optimizer;

        this.embedding.initializeOptimizer(optimizer);
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].initializeOptimizer(optimizer);
        }
        this.finalNorm.initializeOptimizer(optimizer);
        this.output.initializeOptimizer(optimizer);
    }

    forward(inputTokens, paddingMask = null) {
        let hidden = this.embedding.forward(inputTokens);

        for (let i = 0; i < this.blocks.length; i++) {
            hidden = this.blocks[i].forward(hidden, paddingMask);
        }

        hidden = this.finalNorm.forward(hidden);
        return this.output.forward(hidden);
    }

    backward(targetTokens, learningRate) {
        const learningRateOrOptimizer = this.optimizer || learningRate;
        let gradients = this.output.backward(targetTokens, learningRateOrOptimizer);
        gradients = this.finalNorm.backward(gradients, learningRateOrOptimizer);

        for (let i = this.blocks.length - 1; i >= 0; i--) {
            gradients = this.blocks[i].backward(gradients, learningRateOrOptimizer);
        }

        this.embedding.backward(gradients, learningRateOrOptimizer);
    }

    train(inputTokens, targetTokens, learningRate) {
        const probs = this.forward(inputTokens);
        const loss = this.output.computeLoss(probs, targetTokens);
        this.backward(targetTokens, learningRate);
        return loss;
    }

    generate(promptTokens, maxLength, temperature = 1.0) {
        let tokens = promptTokens.slice();

        for (let i = 0; i < maxLength; i++) {
            const batchedInput = [tokens];
            const probs = this.forward(batchedInput);
            const lastProbs = probs[0][tokens.length - 1];

            const nextToken = this.#sampleWithTemperature(lastProbs, temperature);
            tokens.push(nextToken);
        }

        return tokens;
    }

    #sampleWithTemperature(probs, temperature) {
        // Convert probabilities back to logits
        const logits = [];
        for (let i = 0; i < probs.length; i++) {
            logits.push(Math.log(probs[i] + 1e-10));
        }

        // Apply temperature scaling
        const scaledLogits = [];
        for (let i = 0; i < logits.length; i++) {
            scaledLogits.push(logits[i] / temperature);
        }

        // Softmax with numerical stability
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

        // Sample from the temperature-adjusted distribution
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

    serialize() {
        // Calculate buffer size
        const vocabSize = this.embedding.tokenEmbedding.vocabSize;
        const embeddingDim = this.embedding.embeddingDim;
        const maxSeqLength = this.embedding.maxSequenceLength;
        const numHeads = this.blocks[0].attention.numHeads;
        const numBlocks = this.blocks.length;
        const hiddenDim = embeddingDim * 4;

        // Header: magic(4) + version(4) + 5 config params (5*4=20) = 28 bytes
        let bufferSize = 28;

        // Token embeddings: vocabSize * embeddingDim
        bufferSize += vocabSize * embeddingDim * 4;

        // Position embeddings: maxSeqLength * embeddingDim
        bufferSize += maxSeqLength * embeddingDim * 4;

        // Per transformer block:
        for (let i = 0; i < numBlocks; i++) {
            // layerNorm1: gamma + beta = 2 * embeddingDim
            bufferSize += 2 * embeddingDim * 4;

            // attention: 4 weight matrices (embeddingDim x embeddingDim each)
            bufferSize += 4 * embeddingDim * embeddingDim * 4;

            // layerNorm2: gamma + beta = 2 * embeddingDim
            bufferSize += 2 * embeddingDim * 4;

            // mlp.dense1: hiddenDim neurons, each with embeddingDim weights + 1 bias
            bufferSize += hiddenDim * (embeddingDim + 1) * 4;

            // mlp.dense2: embeddingDim neurons, each with hiddenDim weights + 1 bias
            bufferSize += embeddingDim * (hiddenDim + 1) * 4;
        }

        // finalNorm: gamma + beta = 2 * embeddingDim
        bufferSize += 2 * embeddingDim * 4;

        // output: weights (embeddingDim x vocabSize) + bias (vocabSize)
        bufferSize += embeddingDim * vocabSize * 4;
        bufferSize += vocabSize * 4;

        // Create buffer
        const buffer = new ArrayBuffer(bufferSize);
        const view = new DataView(buffer);
        let offset = 0;

        // Write header
        view.setUint32(offset, 0x47414231, true); // 'GAB1' magic
        offset += 4;
        view.setUint32(offset, 1, true); // version
        offset += 4;
        view.setUint32(offset, vocabSize, true);
        offset += 4;
        view.setUint32(offset, embeddingDim, true);
        offset += 4;
        view.setUint32(offset, numHeads, true);
        offset += 4;
        view.setUint32(offset, numBlocks, true);
        offset += 4;
        view.setUint32(offset, maxSeqLength, true);
        offset += 4;

        // Helper to write a float
        const writeFloat = (val) => {
            view.setFloat32(offset, val, true);
            offset += 4;
        };

        // Helper to write 1D array
        const write1D = (arr) => {
            for (let i = 0; i < arr.length; i++) {
                writeFloat(arr[i]);
            }
        };

        // Helper to write 2D array
        const write2D = (arr) => {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    writeFloat(arr[i][j]);
                }
            }
        };

        // Write token embeddings
        write2D(this.embedding.tokenEmbedding.weights);

        // Write position embeddings
        write2D(this.embedding.positionWeights);

        // Write transformer blocks
        for (let b = 0; b < numBlocks; b++) {
            const block = this.blocks[b];

            // layerNorm1
            write1D(block.layerNorm1.gamma);
            write1D(block.layerNorm1.beta);

            // attention weights
            write2D(block.attention.queryWeights);
            write2D(block.attention.keyWeights);
            write2D(block.attention.valueWeights);
            write2D(block.attention.outputWeights);

            // layerNorm2
            write1D(block.layerNorm2.gamma);
            write1D(block.layerNorm2.beta);

            // mlp.dense1 (hiddenDim neurons)
            for (let n = 0; n < block.mlp.dense1.neurons.length; n++) {
                write1D(block.mlp.dense1.neurons[n].weights);
                writeFloat(block.mlp.dense1.neurons[n].bias);
            }

            // mlp.dense2 (embeddingDim neurons)
            for (let n = 0; n < block.mlp.dense2.neurons.length; n++) {
                write1D(block.mlp.dense2.neurons[n].weights);
                writeFloat(block.mlp.dense2.neurons[n].bias);
            }
        }

        // Write finalNorm
        write1D(this.finalNorm.gamma);
        write1D(this.finalNorm.beta);

        // Write output layer
        write2D(this.output.weights);
        write1D(this.output.bias);

        return new Uint8Array(buffer);
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

        // Helper to read a float
        const readFloat = () => {
            const val = view.getFloat32(offset, true);
            offset += 4;
            return val;
        };

        // Helper to read 1D array
        const read1D = (length) => {
            const arr = new Array(length);
            for (let i = 0; i < length; i++) {
                arr[i] = readFloat();
            }
            return arr;
        };

        // Helper to read 2D array
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

        // Create model (this initializes with random weights)
        const model = new GabGPT(vocabSize, embeddingDim, numHeads, numBlocks, maxSeqLength);

        // Read token embeddings
        model.embedding.tokenEmbedding.weights = read2D(vocabSize, embeddingDim);

        // Read position embeddings
        model.embedding.positionWeights = read2D(maxSeqLength, embeddingDim);

        // Read transformer blocks
        for (let b = 0; b < numBlocks; b++) {
            const block = model.blocks[b];

            // layerNorm1
            block.layerNorm1.gamma = read1D(embeddingDim);
            block.layerNorm1.beta = read1D(embeddingDim);

            // attention weights
            block.attention.queryWeights = read2D(embeddingDim, embeddingDim);
            block.attention.keyWeights = read2D(embeddingDim, embeddingDim);
            block.attention.valueWeights = read2D(embeddingDim, embeddingDim);
            block.attention.outputWeights = read2D(embeddingDim, embeddingDim);

            // layerNorm2
            block.layerNorm2.gamma = read1D(embeddingDim);
            block.layerNorm2.beta = read1D(embeddingDim);

            // mlp.dense1 (hiddenDim neurons)
            for (let n = 0; n < hiddenDim; n++) {
                block.mlp.dense1.neurons[n].weights = read1D(embeddingDim);
                block.mlp.dense1.neurons[n].bias = readFloat();
            }

            // mlp.dense2 (embeddingDim neurons)
            for (let n = 0; n < embeddingDim; n++) {
                block.mlp.dense2.neurons[n].weights = read1D(hiddenDim);
                block.mlp.dense2.neurons[n].bias = readFloat();
            }
        }

        // Read finalNorm
        model.finalNorm.gamma = read1D(embeddingDim);
        model.finalNorm.beta = read1D(embeddingDim);

        // Read output layer
        model.output.weights = read2D(embeddingDim, vocabSize);
        model.output.bias = read1D(vocabSize);

        return model;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createBatches(tokens, batchSize, seqLength) {
    const batches = [];
    const numSequences = Math.floor((tokens.length - 1) / seqLength);

    for (let batchStart = 0; batchStart < numSequences; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, numSequences);
        const inputBatch = [];
        const targetBatch = [];

        for (let i = batchStart; i < batchEnd; i++) {
            const start = i * seqLength;
            inputBatch.push(tokens.slice(start, start + seqLength));
            targetBatch.push(tokens.slice(start + 1, start + seqLength + 1));
        }

        batches.push({ inputs: inputBatch, targets: targetBatch });
    }

    return batches;
}

function padBatch(sequences, padTokenId) {
    let maxLen = 0;
    for (let i = 0; i < sequences.length; i++) {
        if (sequences[i].length > maxLen) {
            maxLen = sequences[i].length;
        }
    }

    const paddedSequences = new Array(sequences.length);
    const paddingMask = new Array(sequences.length);

    for (let i = 0; i < sequences.length; i++) {
        const seq = sequences[i];
        paddedSequences[i] = new Array(maxLen);
        paddingMask[i] = new Array(maxLen);

        for (let j = 0; j < seq.length; j++) {
            paddedSequences[i][j] = seq[j];
            paddingMask[i][j] = 1;
        }

        for (let j = seq.length; j < maxLen; j++) {
            paddedSequences[i][j] = padTokenId;
            paddingMask[i][j] = 0;
        }
    }

    return { sequences: paddedSequences, mask: paddingMask };
}

function getLearningRate(step, warmupSteps, totalSteps, maxLR) {
    if (step < warmupSteps) {
        return maxLR * (step / warmupSteps);
    }

    const progress = (step - warmupSteps) / (totalSteps - warmupSteps);
    return maxLR * 0.5 * (1 + Math.cos(Math.PI * progress));
}

function chat(model, tokenizer, userMessage) {
    const prompt = `<|user|>${userMessage}<|end|><|assistant|>`;
    const promptTokens = tokenizer.encode(prompt);

    const endTokenId = tokenizer.encode("<|end|>")[0];
    const generated = [];

    let tokens = promptTokens.slice();

    for (let i = 0; i < 100; i++) {
        const batchedInput = [tokens];
        const probs = model.forward(batchedInput);
        const lastProbs = probs[0][tokens.length - 1];

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
// EXAMPLE: TRAINING A MODEL
// ============================================================================
//
// const fs = require('fs');
// const { Tokenizer, GabGPT, createBatches, getLearningRate } = require('./gab.js');
//
// // 1. Prepare training data
// const trainingText = fs.readFileSync('training_data.txt', 'utf8');
//
// // 2. Create and train tokenizer
// const tokenizer = new Tokenizer();
// tokenizer.reserveToken('<|user|>');
// tokenizer.reserveToken('<|assistant|>');
// tokenizer.reserveToken('<|end|>');
// tokenizer.reserveToken('<|pad|>');
// tokenizer.train(trainingText, 500);  // 500 merges
//
// // 3. Tokenize the training data
// const tokens = tokenizer.encode(trainingText);
// console.log(`Training on ${tokens.length} tokens`);
//
// // 4. Create the model
// const vocabSize = tokenizer.getVocabSize();
// const embeddingDim = 64;
// const numHeads = 4;
// const numBlocks = 4;
// const maxSeqLength = 128;
//
// const model = new GabGPT(vocabSize, embeddingDim, numHeads, numBlocks, maxSeqLength);
//
// // 5. Create training batches
// const batchSize = 4;
// const seqLength = 64;
// const batches = createBatches(tokens, batchSize, seqLength);
// console.log(`Created ${batches.length} batches`);
//
// // 6. Training loop
// const numEpochs = 10;
// const totalSteps = numEpochs * batches.length;
// const warmupSteps = Math.floor(totalSteps * 0.1);
// const baseLearningRate = 0.001;
// let step = 0;
//
// for (let epoch = 0; epoch < numEpochs; epoch++) {
//     let epochLoss = 0;
//
//     for (let i = 0; i < batches.length; i++) {
//         const batch = batches[i];
//         const lr = getLearningRate(step, warmupSteps, totalSteps, baseLearningRate);
//         const loss = model.train(batch.inputs, batch.targets, lr);
//         epochLoss += loss;
//         step++;
//     }
//
//     console.log(`Epoch ${epoch + 1}: avg loss = ${(epochLoss / batches.length).toFixed(4)}`);
// }
//
// // 7. Save the trained model and tokenizer
// const modelBytes = model.serialize();
// const tokenizerBytes = tokenizer.serialize();
//
// fs.writeFileSync('model.gab', modelBytes);
// fs.writeFileSync('tokenizer.bpe', tokenizerBytes);
// console.log('Model and tokenizer saved!');
//

// ============================================================================
// EXAMPLE: CHATTING WITH A TRAINED MODEL
// ============================================================================
//
// const fs = require('fs');
// const { Tokenizer, GabGPT } = require('./gab.js');
//
// // 1. Load the tokenizer
// const tokenizerBytes = new Uint8Array(fs.readFileSync('tokenizer.bpe'));
// const tokenizer = Tokenizer.deserialize(tokenizerBytes);
//
// // 2. Load the model
// const modelBytes = new Uint8Array(fs.readFileSync('model.gab'));
// const model = GabGPT.deserialize(modelBytes);
//
// console.log('Model loaded!');
//
// // 3. Simple generation example
// const prompt = 'Hello, how are you?';
// const promptTokens = tokenizer.encode(prompt);
// const generated = model.generate(promptTokens, 50, 0.8);  // temperature = 0.8
// const response = tokenizer.decode(generated);
// console.log('Generated:', response);
//
// // 4. Interactive chat loop (using special tokens)
// const readline = require('readline');
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// const userToken = tokenizer.encode('<|user|>');
// const assistantToken = tokenizer.encode('<|assistant|>');
// const endToken = tokenizer.encode('<|end|>');
//
// let conversationTokens = [];
//
// function askQuestion() {
//     rl.question('You: ', (userInput) => {
//         if (userInput.toLowerCase() === 'quit') {
//             rl.close();
//             return;
//         }
//
//         // Build conversation: <|user|>message<|end|><|assistant|>
//         conversationTokens = conversationTokens.concat(userToken);
//         conversationTokens = conversationTokens.concat(tokenizer.encode(userInput));
//         conversationTokens = conversationTokens.concat(endToken);
//         conversationTokens = conversationTokens.concat(assistantToken);
//
//         // Generate response
//         const maxNewTokens = 100;
//         let generated = conversationTokens.slice();
//
//         for (let i = 0; i < maxNewTokens; i++) {
//             const probs = model.forward([generated]);
//             const lastProbs = probs[0][generated.length - 1];
//
//             // Sample with temperature
//             const temperature = 0.7;
//             const logits = lastProbs.map(p => Math.log(p + 1e-10) / temperature);
//             const maxLogit = Math.max(...logits);
//             const expLogits = logits.map(l => Math.exp(l - maxLogit));
//             const sumExp = expLogits.reduce((a, b) => a + b, 0);
//             const scaledProbs = expLogits.map(e => e / sumExp);
//
//             let cumulative = 0;
//             const rand = Math.random();
//             let nextToken = scaledProbs.length - 1;
//             for (let j = 0; j < scaledProbs.length; j++) {
//                 cumulative += scaledProbs[j];
//                 if (rand < cumulative) {
//                     nextToken = j;
//                     break;
//                 }
//             }
//
//             generated.push(nextToken);
//
//             // Stop if we hit the end token
//             if (nextToken === endToken[0]) {
//                 break;
//             }
//         }
//
//         // Extract just the assistant's response
//         const responseTokens = generated.slice(conversationTokens.length);
//         const responseText = tokenizer.decode(responseTokens).replace('<|end|>', '').trim();
//         console.log('Assistant:', responseText);
//
//         // Update conversation history
//         conversationTokens = generated;
//
//         askQuestion();
//     });
// }
//
// console.log('Chat started. Type "quit" to exit.');
// askQuestion();
//

// ============================================================================
// EXPORTS (for Node.js / module use)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Tokenizer,
        Neuron,
        DenseLayer,
        ActivationLayer,
        MLPBlock,
        AdamOptimizer,
        EmbeddingLayer,
        PositionalEmbeddingLayer,
        LayerNormalization,
        MultiHeadAttention,
        TransformerBlock,
        OutputLayer,
        GabGPT,
        createBatches,
        padBatch,
        getLearningRate,
        chat
    };
}