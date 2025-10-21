/**
 * Unified AI Provider Abstraction Layer
 * Supports Claude (Anthropic), GPT (OpenAI), and Gemini (Google)
 */

// Universal tool definition format (provider-agnostic)
class UniversalTool {
    constructor(name, description, parameters, handler, category = 'general') {
        this.name = name;
        this.description = description;
        this.parameters = parameters; // JSON Schema format
        this.handler = handler; // Async function to execute the tool
        this.category = category; // Tool category for filtering
    }
}

// Base AI Provider Class
class AIProvider {
    constructor(apiKey, config = {}) {
        this.apiKey = apiKey;
        this.config = config;
        this.name = this.constructor.name;
    }

    // Abstract methods that each provider must implement
    async callAPI(messages, tools = [], options = {}) {
        throw new Error(`${this.name} must implement callAPI method`);
    }

    formatTools(universalTools) {
        throw new Error(`${this.name} must implement formatTools method`);
    }

    formatMessages(messages) {
        throw new Error(`${this.name} must implement formatMessages method`);
    }

    parseResponse(response) {
        throw new Error(`${this.name} must implement parseResponse method`);
    }

    formatToolResult(toolCallId, result, isError = false) {
        throw new Error(`${this.name} must implement formatToolResult method`);
    }

    // Common helper methods
    estimateTokens(text) {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    async executeToolCalls(toolCalls, availableTools) {
        const results = [];
        for (const call of toolCalls) {
            const tool = availableTools.find(t => t.name === call.name);
            if (tool) {
                try {
                    const result = await tool.handler(call.arguments);
                    results.push({
                        id: call.id,
                        result: result,
                        isError: false
                    });
                } catch (error) {
                    results.push({
                        id: call.id,
                        result: `Error: ${error.message}`,
                        isError: true
                    });
                }
            } else {
                results.push({
                    id: call.id,
                    result: `Unknown tool: ${call.name}`,
                    isError: true
                });
            }
        }
        return results;
    }
}

// Claude/Anthropic Provider
class ClaudeProvider extends AIProvider {
    constructor(apiKey, config = {}) {
        super(apiKey, config);
        this.apiUrl = config.apiUrl || 'https://api.anthropic.com/v1/messages';
        // Allow models to be passed in config, otherwise use defaults
        this.models = config.models || {
            'haiku': 'claude-haiku-4-5',
            'sonnet': 'claude-sonnet-4-5-20250929',
            'opus': 'claude-opus-4-1-20250805'
        };
        // Store the raw model list if provided
        this.modelList = config.modelList || null;
    }

    formatTools(universalTools) {
        return universalTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.parameters
        }));
    }

    formatMessages(messages) {
        // Claude expects messages in its specific format, filter out system messages
        return messages.filter(msg => msg.role !== 'system').map(msg => {
            // Always return a clean object with only role and content
            if (typeof msg.content === 'string') {
                return {
                    role: msg.role,
                    content: msg.content
                };
            }
            // Handle tool results
            if (Array.isArray(msg.content)) {
                return {
                    role: msg.role,
                    content: msg.content
                };
            }
            return {
                role: msg.role,
                content: msg.content
            };
        });
    }

    async callAPI(messages, tools = [], options = {}) {
        const formattedTools = tools.length > 0 ? this.formatTools(tools) : undefined;

        // Extract system message if present
        const systemMessage = messages.find(msg => msg.role === 'system');
        const formattedMessages = this.formatMessages(messages);

        const body = {
            model: options.model || this.models.haiku,  // Default to Haiku (value option)
            messages: formattedMessages,
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.7,
            ...(systemMessage && { system: systemMessage.content }),  // Add system as top-level parameter
            ...(formattedTools && { tools: formattedTools })
        };

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            if (console && typeof console.debug === 'function') {
                console.debug('[RateLimit] Claude error headers', {
                    limit: response.headers.get('anthropic-ratelimit-inputs-limit'),
                    remaining: response.headers.get('anthropic-ratelimit-inputs-remaining'),
                    reset: response.headers.get('anthropic-ratelimit-inputs-reset'),
                    requestId: response.headers.get('x-request-id')
                });
            }
            throw new Error(`Claude API Error: ${error}`);
        }

        if (console && typeof console.debug === 'function') {
            console.debug('[RateLimit] Claude success headers', {
                limit: response.headers.get('anthropic-ratelimit-inputs-limit'),
                remaining: response.headers.get('anthropic-ratelimit-inputs-remaining'),
                reset: response.headers.get('anthropic-ratelimit-inputs-reset'),
                requestId: response.headers.get('x-request-id')
            });
        }

        const data = await response.json();
        return this.parseResponse(data);
    }

    parseResponse(response) {
        const result = {
            content: '',
            toolCalls: [],
            usage: response.usage || {},
            raw: response
        };

        for (const content of response.content) {
            if (content.type === 'text') {
                result.content += content.text;
            } else if (content.type === 'tool_use') {
                result.toolCalls.push({
                    id: content.id,
                    name: content.name,
                    arguments: content.input
                });
            }
        }

        return result;
    }

    formatToolResult(toolCallId, result, isError = false) {
        return {
            type: 'tool_result',
            tool_use_id: toolCallId,
            content: typeof result === 'object' ? JSON.stringify(result) : String(result),
            ...(isError && { is_error: true })
        };
    }
}

// OpenAI/GPT Provider
class OpenAIProvider extends AIProvider {
    constructor(apiKey, config = {}) {
        super(apiKey, config);
        this.apiUrl = config.apiUrl || 'https://api.openai.com/v1/chat/completions';
        // Allow models to be passed in config, otherwise use defaults
        this.models = config.models || {
            'gpt3.5': 'gpt-3.5-turbo',
            'gpt4o': 'gpt-4o'
        };
        // Store the raw model list if provided
        this.modelList = config.modelList || null;
    }

    formatTools(universalTools) {
        return universalTools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));
    }

    formatMessages(messages, model) {
        // Convert messages to OpenAI format
        const formatted = [];
        const isO1Model = model && model.startsWith('o1');

        for (const msg of messages) {
            if (msg.role === 'user' && Array.isArray(msg.content)) {
                // This is a tool result message
                for (const content of msg.content) {
                    if (content.type === 'tool_result') {
                        formatted.push({
                            role: 'tool',
                            content: content.content,
                            tool_call_id: content.tool_use_id
                        });
                    }
                }
            } else if (msg.role === 'assistant' && Array.isArray(msg.content)) {
                // Assistant message with tool calls
                let textContent = '';
                const toolCalls = [];

                for (const content of msg.content) {
                    if (content.type === 'text') {
                        textContent = content.text;
                    } else if (content.type === 'tool_use') {
                        toolCalls.push({
                            id: content.id,
                            type: 'function',
                            function: {
                                name: content.name,
                                arguments: JSON.stringify(content.input)
                            }
                        });
                    }
                }

                formatted.push({
                    role: 'assistant',
                    content: textContent || null,
                    ...(toolCalls.length > 0 && { tool_calls: toolCalls })
                });
            } else if (msg.role === 'system') {
                // o1 models don't support system messages, convert to user message
                if (isO1Model) {
                    formatted.push({
                        role: 'user',
                        content: `System instructions: ${msg.content}`
                    });
                } else {
                    formatted.push({
                        role: 'system',
                        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
                    });
                }
            } else {
                // Regular text message
                formatted.push({
                    role: msg.role,
                    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
                });
            }
        }

        return formatted;
    }

    async callAPI(messages, tools = [], options = {}) {
        const model = options.model || this.models['gpt3.5'];  // Default to GPT-3.5 Turbo
        const isO1Model = model.startsWith('o1');

        // o1 models don't support tools
        const formattedTools = (!isO1Model && tools.length > 0) ? this.formatTools(tools) : undefined;
        const formattedMessages = this.formatMessages(messages, model);

        // o1 models don't support temperature or max_tokens
        const body = {
            model: model,
            messages: formattedMessages,
            ...(!isO1Model && { max_tokens: options.maxTokens || 4096 }),
            ...(!isO1Model && { temperature: options.temperature || 0.7 }),
            ...(formattedTools && { tools: formattedTools })
        };

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API Error: ${error}`);
        }

        const data = await response.json();
        return this.parseResponse(data);
    }

    parseResponse(response) {
        const message = response.choices[0].message;
        const result = {
            content: message.content || '',
            toolCalls: [],
            usage: {},
            raw: response
        };

        // Normalize OpenAI's token field names to match Claude's format
        if (response.usage) {
            result.usage = {
                input_tokens: response.usage.prompt_tokens,
                output_tokens: response.usage.completion_tokens,
                total_tokens: response.usage.total_tokens
            };
        }

        if (message.tool_calls) {
            result.toolCalls = message.tool_calls.map(tc => ({
                id: tc.id,
                name: tc.function.name,
                arguments: JSON.parse(tc.function.arguments)
            }));
        }

        return result;
    }

    formatToolResult(toolCallId, result, isError = false) {
        // OpenAI expects tool results as a separate message
        return {
            role: 'tool',
            content: typeof result === 'object' ? JSON.stringify(result) : String(result),
            tool_call_id: toolCallId
        };
    }
}

// Google Gemini Provider
class GeminiProvider extends AIProvider {
    constructor(apiKey, config = {}) {
        super(apiKey, config);
        this.apiUrl = config.apiUrl || 'https://generativelanguage.googleapis.com/v1beta/models';
        // Allow models to be passed in config, otherwise use defaults
        this.models = config.models || {
            'gemini-2.5-flash': 'gemini-2.5-flash',
            'gemini-2.5-pro': 'gemini-2.5-pro'
        };
        // Store the raw model list if provided
        this.modelList = config.modelList || null;
    }

    formatTools(universalTools) {
        return {
            function_declarations: universalTools.map(tool => ({
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }))
        };
    }

    formatMessages(messages) {
        // Gemini has a different message format
        const contents = [];

        for (const msg of messages) {
            if (msg.role === 'user') {
                if (Array.isArray(msg.content)) {
                    // Tool results
                    const parts = msg.content.map(c => {
                        if (c.type === 'tool_result') {
                            return {
                                functionResponse: {
                                    name: c.tool_name || 'unknown',
                                    response: {
                                        content: c.content
                                    }
                                }
                            };
                        }
                        return { text: c.content };
                    });
                    contents.push({ role: 'user', parts });
                } else {
                    contents.push({
                        role: 'user',
                        parts: [{ text: msg.content }]
                    });
                }
            } else if (msg.role === 'assistant') {
                if (Array.isArray(msg.content)) {
                    const parts = [];
                    for (const c of msg.content) {
                        if (c.type === 'text') {
                            parts.push({ text: c.text });
                        } else if (c.type === 'tool_use') {
                            parts.push({
                                functionCall: {
                                    name: c.name,
                                    args: c.input
                                }
                            });
                        }
                    }
                    contents.push({ role: 'model', parts });
                } else {
                    contents.push({
                        role: 'model',
                        parts: [{ text: msg.content }]
                    });
                }
            } else if (msg.role === 'system') {
                // Gemini doesn't have system role, prepend to first user message
                contents.push({
                    role: 'user',
                    parts: [{ text: `System: ${msg.content}` }]
                });
            }
        }

        return contents;
    }

    async callAPI(messages, tools = [], options = {}) {
        const model = options.model || this.models['gemini-2.5-flash'];  // Default to Gemini 2.5 Flash
        const formattedTools = tools.length > 0 ? [this.formatTools(tools)] : undefined;
        const formattedMessages = this.formatMessages(messages);

        const body = {
            contents: formattedMessages,
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 4096,
            },
            ...(formattedTools && { tools: formattedTools })
        };

        const url = `${this.apiUrl}/${model}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API Error: ${error}`);
        }

        const data = await response.json();
        return this.parseResponse(data);
    }

    parseResponse(response) {
        const result = {
            content: '',
            toolCalls: [],
            usage: {},
            raw: response
        };

        if (response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.text) {
                        result.content += part.text;
                    } else if (part.functionCall) {
                        result.toolCalls.push({
                            id: crypto.randomUUID(), // Gemini doesn't provide IDs
                            name: part.functionCall.name,
                            arguments: part.functionCall.args
                        });
                    }
                }
            }
        }

        // Parse usage if available
        if (response.usageMetadata) {
            result.usage = {
                input_tokens: response.usageMetadata.promptTokenCount,
                output_tokens: response.usageMetadata.candidatesTokenCount,
                total_tokens: response.usageMetadata.totalTokenCount
            };
        }

        return result;
    }

    formatToolResult(toolCallId, result, isError = false) {
        // Gemini expects function responses in a specific format
        return {
            functionResponse: {
                name: 'function_name', // This needs to be tracked
                response: {
                    content: typeof result === 'object' ? JSON.stringify(result) : String(result)
                }
            }
        };
    }
}

// Unified AI Manager
class AIManager {
    constructor() {
        this.providers = {};
        this.currentProvider = null;
        this.tools = [];
        this.conversationHistory = [];
        this.systemPrompt = null;
        this.messageIdCounter = 0;
    }

    // Register a provider
    registerProvider(name, provider) {
        this.providers[name] = provider;
        if (!this.currentProvider) {
            this.currentProvider = name;
        }
    }

    // Switch active provider
    setProvider(name) {
        if (!this.providers[name]) {
            throw new Error(`Provider ${name} not registered`);
        }
        this.currentProvider = name;
    }

    // Get current provider
    getProvider() {
        return this.providers[this.currentProvider];
    }

    // Register tools (universal format)
    registerTool(name, description, parameters, handler, category = 'general') {
        const tool = new UniversalTool(name, description, parameters, handler, category);
        this.tools.push(tool);
        return tool;
    }

    // Register multiple tools at once
    registerTools(tools) {
        for (const tool of tools) {
            this.registerTool(tool.name, tool.description, tool.parameters, tool.handler);
        }
    }

    // Set system prompt
    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        this.messageIdCounter = 0;
    }

    cloneMessage(message) {
        if (typeof structuredClone === 'function') {
            return structuredClone(message);
        }
        return JSON.parse(JSON.stringify(message));
    }

    ensureMessageId(message) {
        if (!message || typeof message !== 'object') {
            return;
        }

        const existingId = message._id;
        if (typeof existingId === 'number' && Number.isFinite(existingId)) {
            if (existingId > this.messageIdCounter) {
                this.messageIdCounter = existingId;
            }
            return;
        }

        if (typeof existingId === 'string') {
            const parsed = parseInt(existingId, 10);
            if (!Number.isNaN(parsed)) {
                if (parsed > this.messageIdCounter) {
                    this.messageIdCounter = parsed;
                }
                message._id = parsed;
                return;
            }
        }

        this.messageIdCounter += 1;
        message._id = this.messageIdCounter;
    }

    ensureHistoryMessageIds() {
        for (const entry of this.conversationHistory) {
            this.ensureMessageId(entry);
        }
    }

    buildDebugPayload(messages, providerOptions = {}) {
        let optionsClone;
        try {
            if (typeof structuredClone === 'function') {
                optionsClone = structuredClone(providerOptions);
            } else {
                optionsClone = JSON.parse(JSON.stringify(providerOptions));
            }
        } catch (error) {
            console.warn('Failed to clone provider options for debug payload:', error);
            optionsClone = { ...providerOptions };
        }

        const debugMessages = Array.isArray(messages)
            ? messages.map((msg) => this.cloneMessage(msg))
            : [];

        const toolSummaries = this.tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
            category: tool.category
        }));

        return {
            provider: this.currentProvider,
            model: providerOptions.model || null,
            messages: debugMessages,
            options: optionsClone,
            tools: toolSummaries
        };
    }

    findLatestUserTextMessageIndex(messages) {
        if (!Array.isArray(messages)) {
            return -1;
        }
        for (let i = messages.length - 1; i >= 0; i--) {
            const entry = messages[i];
            if (entry && entry.role === 'user' && typeof entry.content === 'string') {
                return i;
            }
        }
        return -1;
    }

    async buildAugmentedPrompt(originalMessage) {
        if (typeof originalMessage !== 'string') {
            return originalMessage;
        }

        const summaryTool = this.tools.find(tool => tool.name === 'code_summary');
        let summaryText = '';

        if (summaryTool && typeof summaryTool.handler === 'function') {
            try {
                const summary = await summaryTool.handler();
                if (typeof summary === 'string') {
                    summaryText = summary;
                } else if (summary !== undefined && summary !== null) {
                    summaryText = JSON.stringify(summary, null, 2);
                } else {
                    summaryText = '[code_summary returned no data]';
                }
            } catch (error) {
                console.error('Error generating code summary for prompt augmentation:', error);
                summaryText = `[Error generating summary: ${error.message}]`;
            }
        } else {
            summaryText = '[code_summary tool unavailable]';
        }

        const cleanedSummary = typeof summaryText === 'string' ? summaryText.trimEnd() : '';
        const finalSummary = cleanedSummary || '[No summary generated]';
        return `Code summary:\n${finalSummary}\n\n${originalMessage}`;
    }

    // Add a message to history
    addMessage(role, content) {
        const message = { role, content };
        this.ensureMessageId(message);
        this.conversationHistory.push(message);
        return message;
    }

    buildToolBatchSummary(toolMetas) {
        const summary = {
            successCount: 0,
            failureCount: 0,
            successNames: [],
            failureNames: []
        };

        if (!Array.isArray(toolMetas)) {
            return summary;
        }

        for (const meta of toolMetas) {
            if (!meta) {
                continue;
            }
            const isError = !!meta.isError;
            if (isError) {
                summary.failureCount += 1;
                if (meta.name) {
                    summary.failureNames.push(meta.name);
                }
            } else {
                summary.successCount += 1;
                if (meta.name) {
                    summary.successNames.push(meta.name);
                }
            }
        }

        return summary;
    }

    buildToolSummaryText(summaryInfo) {
        const texts = [];

        if (summaryInfo.successCount > 0) {
            if (summaryInfo.successCount === 1) {
                const name = summaryInfo.successNames.find(Boolean) || 'tool';
                texts.push(`Successfully called tool ${name}`);
            } else {
                texts.push(`Successfully called ${summaryInfo.successCount} tools`);
            }
        }

        if (summaryInfo.failureCount > 0) {
            if (summaryInfo.failureCount === 1) {
                const name = summaryInfo.failureNames.find(Boolean) || 'tool';
                texts.push(`Tool ${name} failed`);
            } else {
                let text = `Failed ${summaryInfo.failureCount} tools`;
                if (summaryInfo.failureNames.length > 0) {
                    text += ` (${summaryInfo.failureNames.join(', ')})`;
                }
                texts.push(text);
            }
        }

        return texts;
    }

    cloneSummaryInfo(info) {
        return {
            successCount: info.successCount || 0,
            failureCount: info.failureCount || 0,
            successNames: Array.isArray(info.successNames) ? [...info.successNames] : [],
            failureNames: Array.isArray(info.failureNames) ? [...info.failureNames] : []
        };
    }

    sliceHistoryByUserMessages(limit) {
        if (limit <= 0) {
            return this.conversationHistory;
        }

        let userMessagesSeen = 0;
        for (let i = this.conversationHistory.length - 1; i >= 0; i--) {
            const entry = this.conversationHistory[i];
            if (entry.role === 'user' && typeof entry.content === 'string') {
                userMessagesSeen++;
                if (userMessagesSeen === limit) {
                    return this.conversationHistory.slice(i);
                }
            }
        }

        return this.conversationHistory;
    }

    findLastToolInteractionIndex(history) {
        for (let i = history.length - 1; i >= 0; i--) {
            const entry = history[i];
            if (!entry) continue;
            if (entry.role === 'assistant' && Array.isArray(entry.content)) {
                if (entry.content.some(part => part.type === 'tool_use')) {
                    return i;
                }
            }
        }
        return -1;
    }

    getHistoryView(minimizeTokens = false, limitMessages = 0) {
        let history = limitMessages > 0
            ? this.sliceHistoryByUserMessages(limitMessages)
            : this.conversationHistory;

        if (limitMessages > 0) {
            const lastToolIdx = this.findLastToolInteractionIndex(this.conversationHistory);
            if (lastToolIdx !== -1) {
                const baseStartIdx = this.conversationHistory.length - history.length;
                if (lastToolIdx < baseStartIdx) {
                    history = this.conversationHistory.slice(lastToolIdx);
                }
            }
        }

        if (!minimizeTokens) {
            return history.map((msg) => this.cloneMessage(msg));
        }
        const abridged = [];

        const toolInfo = new Map();
        for (const msg of history) {
            if (msg.role === 'assistant' && Array.isArray(msg.content)) {
                for (const part of msg.content) {
                    if (part.type === 'tool_use') {
                        toolInfo.set(part.id, { name: part.name, id: part.id });
                    }
                }
            } else if (msg.role === 'user' && Array.isArray(msg.content)) {
                for (const part of msg.content) {
                    if (part.type === 'tool_result' && part.tool_use_id) {
                        const entry = toolInfo.get(part.tool_use_id) || {};
                        entry.isError = part.is_error || false;
                        if (!entry.name && part.name) {
                            entry.name = part.name;
                        }
                        if (!entry.id) {
                            entry.id = part.tool_use_id;
                        }
                        toolInfo.set(part.tool_use_id, entry);
                    }
                }
            }
        }

        const lastToolMessageIndex = minimizeTokens ? this.findLastToolInteractionIndex(history) : -1;
        let lastToolUseIds = null;
        if (lastToolMessageIndex !== -1) {
            const entry = history[lastToolMessageIndex];
            if (entry && entry.role === 'assistant' && Array.isArray(entry.content)) {
                lastToolUseIds = new Set(
                    entry.content
                        .filter(part => part.type === 'tool_use')
                        .map(part => part.id)
                );
            }
        }

        for (let i = 0; i < history.length; i++) {
            const msg = history[i];
            if (i === lastToolMessageIndex) {
                abridged.push(this.cloneMessage(msg));
                continue;
            }
            if (msg.role === 'assistant' && Array.isArray(msg.content)) {
                const transformed = this.cloneMessage(msg);
                transformed.content = [];
                transformed.hasNonSummaryText = false;
                transformed.summaryInfo = null;
                transformed.summaryToolIds = Array.isArray(msg.summaryToolIds)
                    ? [...msg.summaryToolIds]
                    : [];

                let pendingToolBatch = [];

                const appendBatch = () => {
                    if (pendingToolBatch.length === 0) {
                        return;
                    }
                    const batchInfo = this.buildToolBatchSummary(pendingToolBatch);
                    if (!transformed.summaryInfo) {
                        transformed.summaryInfo = {
                            successCount: 0,
                            failureCount: 0,
                            successNames: [],
                            failureNames: []
                        };
                    }
                    transformed.summaryInfo.successCount += batchInfo.successCount;
                    transformed.summaryInfo.failureCount += batchInfo.failureCount;
                    transformed.summaryInfo.successNames.push(...batchInfo.successNames);
                    transformed.summaryInfo.failureNames.push(...batchInfo.failureNames);
                    const batchIds = pendingToolBatch
                        .map(item => item && item.id)
                        .filter(Boolean);
                    if (batchIds.length > 0) {
                        if (!Array.isArray(transformed.summaryToolIds)) {
                            transformed.summaryToolIds = [];
                        }
                        transformed.summaryToolIds.push(...batchIds);
                    }
                    pendingToolBatch = [];
                };

                for (const part of msg.content) {
                    if (part.type === 'text') {
                        appendBatch();
                        transformed.content.push({ type: 'text', text: part.text });
                        transformed.hasNonSummaryText = true;
                    } else if (part.type === 'tool_use') {
                        const meta = toolInfo.get(part.id) || { name: part.name, isError: false, id: part.id };
                        if (!meta.id) {
                            meta.id = part.id;
                        }
                        pendingToolBatch.push(meta);
                    }
                }

                appendBatch();

                if (transformed.summaryInfo) {
                    const summaryTexts = this.buildToolSummaryText(transformed.summaryInfo);
                    for (const text of summaryTexts) {
                        transformed.content.push({ type: 'text', text: text, metadata: { toolSummary: true } });
                    }

                    if (!transformed.hasNonSummaryText && summaryTexts.length > 0) {
                        const summaryMeta = this.cloneSummaryInfo(transformed.summaryInfo);
                        transformed.metadata = Object.assign({}, transformed.metadata, {
                            toolSummary: true,
                            summaryInfo: summaryMeta
                        });
                        if (Array.isArray(transformed.summaryToolIds) && transformed.summaryToolIds.length > 0) {
                            transformed.metadata.summaryToolIds = [...new Set(transformed.summaryToolIds)];
                        }
                        const prev = abridged[abridged.length - 1];
                        if (prev && prev.metadata?.toolSummary && prev.hasNonSummaryText === false) {
                            const prevInfo = prev.metadata.summaryInfo;
                            prevInfo.successCount += summaryMeta.successCount;
                            prevInfo.failureCount += summaryMeta.failureCount;
                            prevInfo.successNames.push(...summaryMeta.successNames);
                            prevInfo.failureNames.push(...summaryMeta.failureNames);
                            const combinedTexts = this.buildToolSummaryText(prevInfo).map(text => ({ type: 'text', text: text, metadata: { toolSummary: true } }));
                            prev.content = combinedTexts;
                            prev.metadata.summaryInfo = prevInfo;
                            prev.hasNonSummaryText = false;
                            continue;
                        }
                    }
                }

                if (transformed.content.length > 0) {
                    transformed.hasNonSummaryText = !!transformed.hasNonSummaryText;
                    if (transformed.metadata?.toolSummary) {
                        transformed.hasNonSummaryText = false;
                        if (Array.isArray(transformed.summaryToolIds) && transformed.summaryToolIds.length > 0 && !Array.isArray(transformed.metadata.summaryToolIds)) {
                            transformed.metadata.summaryToolIds = [...new Set(transformed.summaryToolIds)];
                        }
                    }
                    abridged.push(transformed);
                }
                continue;
            }

            if (msg.role === 'user' && Array.isArray(msg.content) && msg.content[0]?.type === 'tool_result') {
                const isLastToolResult = lastToolUseIds && msg.content.some(part => part.type === 'tool_result' && lastToolUseIds.has(part.tool_use_id));
                if (isLastToolResult) {
                    abridged.push(this.cloneMessage(msg));
                }
                continue;
            }

            abridged.push(this.cloneMessage(msg));
        }

        return abridged;
    }

    // Main method to send a message and handle tool calling
    async sendMessage(userMessage, options = {}) {
        const provider = this.getProvider();
        if (!provider) {
            throw new Error('No AI provider configured');
        }

        this.ensureHistoryMessageIds();

        // Check if this is a continuation request
        const isContinuation = userMessage === '__continue_tools__';

        const skipAddingUserMessage = options.preAddedUserMessage === true;
        const progressCallback = typeof options.onProgress === 'function' ? options.onProgress : null;
        const prepareRateLimit = typeof options.prepareRateLimit === 'function' ? options.prepareRateLimit : null;
        const debugCallback = typeof options.onDebugPayload === 'function' ? options.onDebugPayload : null;
        const providerOptions = { ...options };
        delete providerOptions.preAddedUserMessage;
        delete providerOptions.onProgress;
        delete providerOptions.prepareRateLimit;
        delete providerOptions.onDebugPayload;

        // Only add user message if not a continuation
        if (!isContinuation && !skipAddingUserMessage) {
            this.addMessage('user', userMessage);
        }

        // Prepare messages with system prompt if set
        let messages = this.getHistoryView(options.minimizeTokens, options.limitMessages || 0);
        if (this.systemPrompt && messages[0]?.role !== 'system') {
            messages.unshift({ role: 'system', content: this.systemPrompt });
        }

        if (!isContinuation) {
            const targetIndex = this.findLatestUserTextMessageIndex(messages);
            if (targetIndex !== -1) {
                const originalContent = messages[targetIndex].content;
                const augmentedPrompt = await this.buildAugmentedPrompt(originalContent);
                if (typeof augmentedPrompt === 'string' && augmentedPrompt !== originalContent) {
                    messages[targetIndex].content = augmentedPrompt;
                    if (AIManager.logAugmentedPrompts) {
                        console.log('[AIManager] Augmented prompt sent to provider:\n' + augmentedPrompt);
                    }
                }
            }
        }

        if (debugCallback) {
            try {
                debugCallback(this.buildDebugPayload(messages, providerOptions));
            } catch (error) {
                console.warn('Failed to generate debug payload:', error);
            }
        }

        // Allow customizable max iterations, with higher limit for continuations
        const MAX_ITERATIONS = options.maxIterations || (isContinuation ? 20 : 10);

        // Keep sending to AI until no more tool calls
        let continueProcessing = true;
        let finalResponse = null;
        let allToolCalls = [];  // Track all tool calls made
        let allToolResults = [];  // Track all tool results
        let iterations = 0;

        while (continueProcessing && iterations < MAX_ITERATIONS) {
            iterations++;

            if (prepareRateLimit) {
                try {
                    await prepareRateLimit(messages);
                } catch (rateError) {
                    console.warn('Rate limit preparation failed:', rateError);
                }
            }

            // Call the AI
            const response = await provider.callAPI(messages, this.tools, providerOptions);

            // Check if there are tool calls to process
            if (response.toolCalls && response.toolCalls.length > 0) {
                // Add assistant message with tool calls to history
                const assistantMessage = {
                    role: 'assistant',
                    content: []
                };

                if (response.content) {
                    assistantMessage.content.push({
                        type: 'text',
                        text: response.content
                    });
                }

                for (const toolCall of response.toolCalls) {
                    assistantMessage.content.push({
                        type: 'tool_use',
                        id: toolCall.id,
                        name: toolCall.name,
                        input: toolCall.arguments
                    });
                }

                this.ensureMessageId(assistantMessage);
                if (!assistantMessage.metadata) {
                    assistantMessage.metadata = {};
                }
                assistantMessage.metadata.toolCallIds = response.toolCalls.map(call => call.id);
                messages.push(assistantMessage);
                this.conversationHistory.push(assistantMessage);

                // Execute the tool calls
                const toolResults = await provider.executeToolCalls(response.toolCalls, this.tools);
                const toolResultsWithMeta = toolResults.map(result => ({
                    ...result,
                    messageId: null
                }));

                // Format tool results for the specific provider
                const toolResultMessage = {
                    role: 'user',
                    content: toolResults.map(result => ({
                        type: 'tool_result',
                        tool_use_id: result.id,
                        content: String(result.result),
                        ...(result.isError && { is_error: true })
                    }))
                };

                this.ensureMessageId(toolResultMessage);
                if (!toolResultMessage.metadata) {
                    toolResultMessage.metadata = {};
                }
                toolResultMessage.metadata.toolCallIds = toolResults.map(result => result.id);
                messages.push(toolResultMessage);
                this.conversationHistory.push(toolResultMessage);

                // Track tool calls/results with message metadata for UI
                const toolCallsWithMeta = response.toolCalls.map(call => ({
                    ...call,
                    messageId: assistantMessage._id
                }));
                allToolCalls.push(...toolCallsWithMeta);

                for (let i = 0; i < toolResultsWithMeta.length; i++) {
                    toolResultsWithMeta[i].messageId = toolResultMessage._id;
                }
                allToolResults.push(...toolResultsWithMeta);

                response.assistantMessageId = assistantMessage._id;
                response.toolResultMessageId = toolResultMessage._id;

                if (progressCallback) {
                    progressCallback({
                        type: 'tool_iteration',
                        assistantMessage,
                        toolResultMessage,
                        allToolCalls: toolCallsWithMeta,
                        allToolResults: toolResultsWithMeta,
                        usage: response.usage || null
                    });
                }

                // Continue to get the next response
                finalResponse = response;
            } else {
                // No more tool calls, we're done
                continueProcessing = false;
                finalResponse = response;

                // Add final assistant message to history
                if (response.content) {
                    const assistantMessage = {
                        role: 'assistant',
                        content: response.content
                    };
                    this.ensureMessageId(assistantMessage);
                    this.conversationHistory.push(assistantMessage);
                    response.assistantMessageId = assistantMessage._id;
                    if (progressCallback) {
                        progressCallback({
                            type: 'final_assistant_message',
                            assistantMessage,
                            usage: response.usage || null
                        });
                    }
                }
            }
        }

        // Check if we hit the iteration limit
        if (iterations >= MAX_ITERATIONS && continueProcessing) {
            console.warn(`Tool calling reached ${MAX_ITERATIONS} iterations, pausing...`);

            // Create a special response indicating we need to continue
            if (!finalResponse) {
                finalResponse = { content: '' };
            }

            // Add a flag to indicate continuation is needed
            finalResponse.needsContinuation = true;
            finalResponse.iterationsUsed = iterations;
            finalResponse.maxIterations = MAX_ITERATIONS;

            // Add informative message if there's no other content
            if (!finalResponse.content) {
                finalResponse.content = `⚠️ Reached tool iteration limit (${MAX_ITERATIONS} iterations). The task may not be complete. Click "Continue Tools" to resume processing.`;
            }
        }

        // Include tool calls and results in the final response for UI display
        finalResponse.allToolCalls = allToolCalls;
        finalResponse.allToolResults = allToolResults;

        return finalResponse;
    }

    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    }

    // Estimate tokens for current conversation
    estimateTokens() {
        const provider = this.getProvider();
        let total = 0;
        for (const msg of this.conversationHistory) {
            const content = typeof msg.content === 'string'
                ? msg.content
                : JSON.stringify(msg.content);
            total += provider.estimateTokens(content);
        }
        return total;
    }
}

AIManager.logAugmentedPrompts = false;

// Ollama Provider (Dynamic local models)
class OllamaProvider extends AIProvider {
    constructor(endpoint, config = {}) {
        super(null, config); // No API key needed
        this.endpoint = endpoint || config.apiUrl || 'http://localhost:11434';
        this.availableModels = [];
        this.modelDetails = {};
    }

    // Fetch available models from Ollama
    async fetchAvailableModels() {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            if (!response.ok) {
                throw new Error('Failed to fetch models from Ollama');
            }
            const data = await response.json();

            // Store model list with details
            this.availableModels = data.models || [];

            // Create a simple mapping for model details
            for (const model of this.availableModels) {
                this.modelDetails[model.name] = {
                    name: model.name,
                    size: model.size,
                    modified: model.modified_at,
                    digest: model.digest
                };
            }

            return this.availableModels;
        } catch (error) {
            console.error('Error fetching Ollama models:', error);
            return [];
        }
    }

    // Get model info including context length
    async getModelInfo(modelName) {
        try {
            const response = await fetch(`${this.endpoint}/api/show`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: modelName })
            });

            if (!response.ok) {
                throw new Error(`Failed to get info for model ${modelName}`);
            }

            const data = await response.json();

            // Extract context length from parameters
            let contextLength = 2048; // Default fallback
            if (data.parameters) {
                // Parse parameters string to find context length
                const params = data.parameters.split('\n');
                for (const param of params) {
                    if (param.includes('num_ctx')) {
                        const match = param.match(/\d+/);
                        if (match) {
                            contextLength = parseInt(match[0]);
                        }
                    }
                }
            }

            // Store in our cache
            if (this.modelDetails[modelName]) {
                this.modelDetails[modelName].contextLength = contextLength;
            }

            return { ...data, contextLength };
        } catch (error) {
            console.error(`Error getting info for model ${modelName}:`, error);
            return null;
        }
    }

    formatTools(universalTools) {
        // Qwen/Ollama uses OpenAI-compatible tool format
        return universalTools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));
    }

    formatMessages(messages) {
        // Convert to OpenAI-compatible format
        const formatted = [];

        for (const msg of messages) {
            if (msg.role === 'user' && Array.isArray(msg.content)) {
                // This is a tool result message
                for (const content of msg.content) {
                    if (content.type === 'tool_result') {
                        // Ollama expects tool results as 'tool' role messages (OpenAI style)
                        formatted.push({
                            role: 'tool',
                            content: content.content,
                            tool_call_id: content.tool_use_id
                        });
                    }
                }
            } else if (msg.role === 'assistant' && Array.isArray(msg.content)) {
                // Assistant message with tool calls
                let textContent = '';
                const toolCalls = [];

                for (const content of msg.content) {
                    if (content.type === 'text') {
                        textContent = content.text;
                    } else if (content.type === 'tool_use') {
                        // Format as OpenAI-style tool call
                        // IMPORTANT: Ollama API expects arguments as an object, NOT a string (unlike OpenAI)
                        const args = typeof content.input === 'string' ?
                            JSON.parse(content.input) :  // Parse string to object if needed
                            content.input;  // Keep as object

                        toolCalls.push({
                            id: content.id,
                            type: 'function',
                            function: {
                                name: content.name,
                                arguments: args  // Send as object for Ollama
                            }
                        });
                    }
                }

                formatted.push({
                    role: 'assistant',
                    content: textContent || null,
                    ...(toolCalls.length > 0 && { tool_calls: toolCalls })
                });
            } else {
                // Regular text message
                formatted.push({
                    role: msg.role,
                    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
                });
            }
        }

        return formatted;
    }

    async callAPI(messages, tools = [], options = {}) {
        // Use the model directly as passed from options
        const model = options.model;
        if (!model) {
            throw new Error('No model selected for Ollama');
        }

        // Format messages
        const formattedMessages = this.formatMessages(messages);

        // Build request body
        const body = {
            model: model,
            messages: formattedMessages,
            stream: false,
            temperature: options.temperature || 0.7,
            // Ollama uses 'num_predict' instead of 'max_tokens'
            num_predict: options.maxTokens || 4096
        };

        // Many Ollama models support OpenAI-style tools
        // Try to use native tool support if available
        if (tools.length > 0) {
            // Use OpenAI-compatible tool format
            body.tools = this.formatTools(tools);
        }

        try {
            const response = await fetch(`${this.endpoint}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Local AI Error: ${error}`);
            }

            const data = await response.json();
            return this.parseResponse(data);
        } catch (error) {
            // If connection fails, provide helpful error message
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error(`Cannot connect to local AI at ${this.endpoint}. Please ensure Ollama is running with: ollama serve`);
            }
            throw error;
        }
    }

    parseResponse(response) {
        const result = {
            content: '',
            toolCalls: [],
            usage: {},
            raw: response
        };

        // Extract content from Ollama response
        if (response.message) {
            result.content = response.message.content || '';

            // Check for OpenAI-style tool calls first
            if (response.message.tool_calls && Array.isArray(response.message.tool_calls)) {
                result.toolCalls = response.message.tool_calls.map(tc => ({
                    id: tc.id || crypto.randomUUID(),
                    name: tc.function?.name || tc.name,
                    arguments: tc.function?.arguments ?
                        (typeof tc.function.arguments === 'string' ?
                            JSON.parse(tc.function.arguments) :
                            tc.function.arguments) :
                        tc.arguments || {}
                }));
            } else if (result.content) {
                // Check for <tools> format in the content - handle various closing tags
                // Some models use </tools>, others use </tool_call> without opening tag
                let toolsMatch = result.content.match(/<tools>(.*?)<\/tool_call>/s);
                if (!toolsMatch) {
                    toolsMatch = result.content.match(/<tools>(.*?)<\/tools>/s);
                }
                if (toolsMatch) {
                    try {
                        // Clean up the JSON string - remove extra whitespace
                        const jsonStr = toolsMatch[1].trim();
                        const toolsJson = JSON.parse(jsonStr);
                        // Handle both single tool and array of tools
                        const tools = Array.isArray(toolsJson) ? toolsJson : [toolsJson];

                        result.toolCalls = tools.map(tool => ({
                            id: tool.id || crypto.randomUUID(),
                            name: tool.name || tool.function || 'unknown',
                            arguments: tool.arguments || tool.parameters || tool.input || {}
                        }));

                        // Remove the entire tool call from content
                        result.content = result.content.replace(toolsMatch[0], '').trim();
                    } catch (e) {
                        console.error('Failed to parse tool call JSON:', e);
                    }
                }
            }
        }

        // Ollama provides token counts in eval_count and prompt_eval_count
        if (response.prompt_eval_count || response.eval_count) {
            result.usage = {
                input_tokens: response.prompt_eval_count || 0,
                output_tokens: response.eval_count || 0,
                total_tokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
            };
        }

        return result;
    }

    formatToolResult(toolCallId, result, isError = false) {
        // Format tool results as user messages for local models
        return {
            role: 'user',
            content: `Tool result for ${toolCallId}: ${typeof result === 'object' ? JSON.stringify(result) : String(result)}`
        };
    }
}

// Export for use in the workbench
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AIManager,
        ClaudeProvider,
        OpenAIProvider,
        GeminiProvider,
        OllamaProvider,
        UniversalTool
    };
}
