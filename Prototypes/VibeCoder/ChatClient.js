// Chat Client Interface (Multi-provider AI chat interface)
class ChatClient {
    constructor(tools) {
        this.tools = tools;
        this.aiManager = new AIManager();
        this.currentProvider = localStorage.getItem('ai_provider') || 'claude';
        this.messages = [];
        this.chatWindow = document.getElementById('chatWindow');
        this.messageInput = document.getElementById('messageInput');
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('modelSelect');
        this.providerSelect = document.getElementById('providerSelect');
        this.totalTokens = 0;

        // Model configuration will be loaded from models.json
        this.modelConfig = null;
        this.modelNames = {};

        // Track current context usage (resets per conversation)
        this.currentContextTokens = 0;

        // Auto-save chat after each response
        this.autoSave = true;

        // System prompt handling (default + local storage override)
        this.systemPromptStorageKey = 'system_prompt';
        const storedPrompt = typeof localStorage !== 'undefined'
            ? (localStorage.getItem(this.systemPromptStorageKey) || '')
            : '';
        this.systemPrompt = storedPrompt.trim() || this.getDefaultSystemPrompt();
        if (this.systemPrompt) {
            this.aiManager.setSystemPrompt(this.systemPrompt);
        }

        // Environment info - load from localStorage or use empty default
        this.environmentInfo = localStorage.getItem('environment_info') || '';

        // Max iterations for tool calls (configurable)
        this.maxIterations = parseInt(localStorage.getItem('max_tool_iterations') || '10', 10);

        // Tool category filters - load from localStorage or use defaults
        this.toolFilters = {
            code: localStorage.getItem('tool_filter_code') !== null ?
                  localStorage.getItem('tool_filter_code') === 'true' : true,
            filesystem: localStorage.getItem('tool_filter_filesystem') !== null ?
                        localStorage.getItem('tool_filter_filesystem') === 'true' : false
        };

        this.minimizeTokens = localStorage.getItem('minimize_tokens') !== 'false';
        this.minimizeTokensToggle = document.getElementById('minimizeTokensToggle');
        if (this.minimizeTokensToggle) {
            this.minimizeTokensToggle.checked = this.minimizeTokens;
        }

        const storedLimitMessages = localStorage.getItem('limit_messages');
        let parsedLimit = storedLimitMessages !== null ? parseInt(storedLimitMessages, 10) : NaN;
        if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
            parsedLimit = 5;
        }
        this.limitMessages = parsedLimit;
        if (storedLimitMessages === null) {
            localStorage.setItem('limit_messages', String(this.limitMessages));
        }

        this.limitMessagesContainer = document.getElementById('limitMessagesContainer');
        this.limitMessagesInput = document.getElementById('limitMessagesInput');
        if (this.limitMessagesInput) {
            this.limitMessagesInput.value = String(this.limitMessages);
        }

        const storedTokensPerMinute = parseInt(localStorage.getItem('tokens_per_minute') || '30000', 10);
        this.tokensPerMinuteLimit = Number.isFinite(storedTokensPerMinute) && storedTokensPerMinute >= 0
            ? storedTokensPerMinute
            : 30000;
        this.tokensPerMinuteInput = document.getElementById('tokensPerMinuteInput');
        if (this.tokensPerMinuteInput) {
            this.tokensPerMinuteInput.value = String(this.tokensPerMinuteLimit);
        }

        this.debugPromptEnabled = localStorage.getItem('debug_prompt_enabled') === 'true';
        this.debugPromptToggle = document.getElementById('debugPromptToggle');
        if (this.debugPromptToggle) {
            this.debugPromptToggle.checked = this.debugPromptEnabled;
        }

        this.loadingIndicator = null;
        this.pendingContinueButton = null;
        this.currentContinueButton = null;

        this.recentTokenUsage = [];
        this.rateLimitNoticeElement = null;
        this.rateLimitNoticeInterval = null;
        this.pendingProviderUsageEntries = [];

        this.messageContextData = new WeakMap();
        this.activeContextMessage = null;
        this.chatContextMenu = document.getElementById('chatContextMenu');
        this.chatContextMenuItems = this.chatContextMenu ? {
            copy: this.chatContextMenu.querySelector('[data-action="copy"]'),
            edit: this.chatContextMenu.querySelector('[data-action="edit"]'),
            remove: this.chatContextMenu.querySelector('[data-action="remove"]')
        } : null;

        this.chatBackgroundMenu = document.getElementById('chatBackgroundContextMenu');
        this.chatBackgroundMenuItems = this.chatBackgroundMenu ? {
            export: this.chatBackgroundMenu.querySelector('[data-action="export"]'),
            import: this.chatBackgroundMenu.querySelector('[data-action="import"]'),
            clear: this.chatBackgroundMenu.querySelector('[data-action="clear"]')
        } : null;

        this.debugPromptModal = document.getElementById('debugPromptModal');
        this.debugPromptEditor = null;
        this.debugPromptEscHandler = null;

        this.initializeDebugPromptEditor();

        this.handleGlobalClickForChatMenu = (event) => {
            if (!this.chatContextMenu && !this.chatBackgroundMenu) return;
            if (event.target.closest('#chatContextMenu') || event.target.closest('#chatBackgroundContextMenu')) {
                return;
            }
            this.hideChatContextMenu();
        };

        // Setup will complete after model config loads
        this.setupEventListeners();
        this.setupChatContextMenu();

        this.updateLimitMessagesVisibility();

        // Mark that initialization is needed
        this.initializationPending = true;

        // Auto-load will be called after fileSystem is initialized
    }

    // Initialize everything in proper sequence
    async initialize() {
        if (!this.initializationPending) {
            return; // Already initialized
        }
        this.initializationPending = false;

        // First load model config
        await this.loadModelConfig();

        // Then load saved provider and API keys (which needs model config)
        await this.loadSavedProvider();

        // Set the max iterations value in the UI
        const maxIterInput = document.getElementById('maxIterations');
        if (maxIterInput) {
            maxIterInput.value = this.maxIterations;
        }
    }

    getDefaultSystemPrompt() {
        return [
            'You are VibeCoder, an AI coding teammate dedicated to building and refining Phaser.js games inside the VibeCoder web workbench.',
            '',
            'Capabilities & tools:',
            '- Interact with the project exclusively through the provided tools. Key ones include `list_files`, `read_file`, `write_file`, `create_file`, `delete_file`, `rename_file`, `create_folder`, `delete_folder`, `move_file`, `code_summary`, `list_html_files`, `html_get_scripts`, `html_add_script`, `html_remove_script`, `html_get_inline`, `html_set_inline`, `js_create_class`, `js_get_constructor`, `js_set_constructor`, `js_create_variable`, `js_remove_variable`, `js_get_variable`, `js_create_function`, `js_remove_function`, `js_get_function`, `js_update_function`, `js_get_class_info`, `js_get_class_list`, `js_list_classes`, `js_rename_function`, `js_rename_variable`, and `js_rename_class`.',
            '- Prefer the JavaScript-specific tools for manipulating classes, constructors, members, and methods. Only fall back to `write_file` for non-class files or when no specialized tool fits.',
            '- Remember all paths are rooted (prefix with `/`). Only access or modify files via tool calls; never assume direct filesystem access.',
            '',
            'Workflow expectations:',
            '1. Clarify goals when needed; ask the user before guessing.',
            '2. Inspect the current code before editing (e.g., `code_summary`, `js_get_class_info`, `read_file`).',
            '3. Plan multi-step changes, narrate that plan briefly, execute it with the right tools, and update or explain after each step.',
            '4. Keep tool arguments concise and valid; avoid embedding large code bodies unless the tool expects them.',
            '5. When creating new scripts, offer to link them into the relevant HTML via `html_add_script` or update inline logic with `html_set_inline`.',
            '6. Maintain Phaser best practices: scene lifecycle (`preload`, `create`, `update`), asset key consistency, physics configs, input handling, and modular scene structure. If assets or configuration files must change, do so explicitly with the appropriate tools.',
            '7. Guard against regressions—when updating methods, check for related code (e.g., other scenes, globals, asset loads) and adjust if necessary.',
            '',
            'Response style:',
            '- Keep replies concise, friendly, and focused on Phaser development.',
            '- When changes are made, reference the affected files with clickable `path:line` notation and describe the impact.',
            '- Offer logical next steps (tests to run, game preview instructions) when relevant.',
            '- If you can\'t complete an action, explain why and suggest alternatives.',
            '',
            'Default to Phaser 3 idioms, provide practical game-development advice, and ensure every modification flows through the abstract editor tools.'
        ].join('\n');
    }

    // Update max iterations setting
    updateMaxIterations(value) {
        this.maxIterations = parseInt(value, 10);
        localStorage.setItem('max_tool_iterations', value);
        console.log(`Max tool iterations set to: ${this.maxIterations}`);
    }

    // Load model configuration from models.json
    async loadModelConfig() {
        try {
            const response = await fetch('models.json');
            this.modelConfig = await response.json();

            // Build display name and context window maps from loaded config
            this.modelNames = {};
            this.modelContextWindows = {};
            for (const provider of Object.values(this.modelConfig.providers)) {
                for (const model of provider.models) {
                    this.modelNames[model.id] = model.name;
                    if (typeof model.contextWindow === 'number') {
                        this.modelContextWindows[model.id] = model.contextWindow;
                    }
                }
            }

            // Initialize providers after config is loaded
            this.initializeProviders();

            // Update placeholder based on current provider
            this.updateApiKeyPlaceholder();

            console.log('Model configuration loaded successfully');
        } catch (error) {
            console.error('Failed to load models.json:', error);
            // Fallback to hardcoded defaults if needed
            this.useDefaultModels();
        }
    }

    // Fetch and update Ollama models dynamically
    async updateOllamaModels() {
        const modelSelect = document.getElementById('modelSelect');

        // Show loading state
        modelSelect.innerHTML = '<option value="">Loading models...</option>';
        modelSelect.disabled = true;

        try {
            // Get the Ollama provider instance
            const ollamaProvider = this.aiManager.providers['ollama'];
            if (!ollamaProvider) {
                // Create Ollama provider if it doesn't exist
                const endpoint = localStorage.getItem('ollama_endpoint') || 'http://localhost:11434';
                const config = this.modelConfig?.providers['ollama'] || {};
                this.aiManager.providers['ollama'] = new OllamaProvider(endpoint, config);
            } else {
            }

            // Fetch available models
            const models = await this.aiManager.providers['ollama'].fetchAvailableModels();

            if (models && models.length > 0) {
                // Clear and populate with fetched models
                modelSelect.innerHTML = '';

                for (const model of models) {
                    const option = document.createElement('option');
                    option.value = model.name;
                    // Format display name - show size if available
                    let displayName = model.name;
                    if (model.size) {
                        const sizeInGB = (model.size / 1e9).toFixed(1);
                        displayName += ` (${sizeInGB}GB)`;
                    }
                    option.textContent = displayName;
                    modelSelect.appendChild(option);
                }

                // Restore previous selection if available
                const savedModel = localStorage.getItem('ollama_model');
                if (savedModel && Array.from(modelSelect.options).some(opt => opt.value === savedModel)) {
                    modelSelect.value = savedModel;
                } else if (models.length > 0) {
                    modelSelect.value = models[0].name;
                    localStorage.setItem('ollama_model', models[0].name);
                }

                this.currentModel = modelSelect.value;
            } else {
                modelSelect.innerHTML = '<option value="">No models found</option>';
            }
        } catch (error) {
            console.error('Failed to fetch Ollama models:', error);
            modelSelect.innerHTML = '<option value="">Failed to load models</option>';
        } finally {
            modelSelect.disabled = false;
            // Update status display after models are loaded
            updateApiStatus();
        }
    }

    // Update input field based on provider type
    updateProviderInput() {
        const isOllamaProvider = this.currentProvider === 'ollama';

        if (this.modelConfig && this.modelConfig.providers[this.currentProvider]) {
            const providerConfig = this.modelConfig.providers[this.currentProvider];

            if (isOllamaProvider) {
                // Change input type and placeholder for endpoint
                this.apiKeyInput.type = 'text';
                this.apiKeyInput.placeholder = providerConfig.endpointPlaceholder || 'Enter endpoint (e.g., http://localhost:11434)';
            } else {
                // Standard API key input
                this.apiKeyInput.type = 'password';
                this.apiKeyInput.placeholder = providerConfig.apiKeyPlaceholder || 'Enter API Key (auto-saves)';
            }
        } else {
            // Fallback
            this.apiKeyInput.type = isOllamaProvider ? 'text' : 'password';
            this.apiKeyInput.placeholder = isOllamaProvider ?
                'Enter endpoint (e.g., http://localhost:11434)' :
                'Enter API Key (auto-saves)';
        }
    }

    // Update API key placeholder based on current provider (kept for backward compatibility)
    updateApiKeyPlaceholder() {
        this.updateProviderInput();
    }

    // Fallback to default models if models.json fails to load
    useDefaultModels() {
        console.warn('Using default model configuration');
        // Keep minimal defaults as fallback
        this.modelContextWindows = {
            'claude-haiku-4-5': 200000,
            'gpt-3.5-turbo': 16385,
            'gemini-2.5-flash': 1048576
        };
        this.modelNames = {
            'claude-haiku-4-5': 'Haiku (Latest)',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'gemini-2.5-flash': 'Gemini 2.5 Flash'
        };
        this.initializeProviders();
    }

    // Initialize AI providers and register tools
    initializeProviders() {
        // Register the universal tools with the AI Manager
        this.registerUniversalTools();

        // Set initial system prompt if any
        if (this.systemPrompt) {
            this.aiManager.setSystemPrompt(this.systemPrompt);
        }
    }

    // Tools and Environment Viewer Methods
    openToolsViewer() {
        const modal = document.getElementById('infoViewerModal');
        const title = document.getElementById('infoViewerTitle');
        const content = document.getElementById('infoViewerContent');

        if (modal && title && content) {
            title.textContent = 'Tools';

            // Get the exact formatted tools sent to the current provider
            const provider = this.aiManager.getProvider();
            const allTools = this.aiManager.tools;

            // Filter tools based on category checkboxes
            const filteredTools = allTools.filter(tool => {
                if (tool.category === 'code' && this.toolFilters.code) return true;
                if (tool.category === 'filesystem' && this.toolFilters.filesystem) return true;
                if (!tool.category || tool.category === 'general') return true; // Show uncategorized tools
                return false;
            });

            if (provider && filteredTools.length > 0) {
                const formatted = provider.formatTools(filteredTools);
                content.value = JSON.stringify(formatted, null, 2);
            } else {
                content.value = '// No tools matching the selected filters';
            }

            // Add or update checkboxes in the footer
            this.updateToolFilterUI();

            modal.style.display = 'flex';
            this.setupInfoViewerEscHandler();
        }
    }

    // Add method to update the filter UI
    updateToolFilterUI() {
        const footer = document.querySelector('#infoViewerModal .modal-footer');
        if (!footer) return;

        // Check if checkboxes already exist
        let filterContainer = footer.querySelector('.tool-filters');
        if (!filterContainer) {
            // Create the filter container
            filterContainer = document.createElement('div');
            filterContainer.className = 'tool-filters';
            filterContainer.style.cssText = 'display: flex; gap: 20px; margin-right: auto; align-items: center;';

            // Helper function to create styled checkbox
            const createStyledCheckbox = (id, labelText, checked, onChange) => {
                const label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; color: #e0e0e0;';

                // Create custom checkbox container
                const checkboxContainer = document.createElement('div');
                checkboxContainer.style.cssText = `
                    position: relative;
                    width: 18px;
                    height: 18px;
                    background-color: #2d2d2d;
                    border: 2px solid #555;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                `;

                // Hidden native checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = id;
                checkbox.checked = checked;
                checkbox.style.cssText = 'position: absolute; opacity: 0; width: 0; height: 0;';

                // Checkmark
                const checkmark = document.createElement('div');
                checkmark.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(${checked ? '1' : '0'});
                    width: 10px;
                    height: 10px;
                    background-color: #888;
                    border-radius: 2px;
                    transition: transform 0.2s ease;
                `;

                checkbox.onchange = () => {
                    const isChecked = checkbox.checked;
                    checkmark.style.transform = `translate(-50%, -50%) scale(${isChecked ? '1' : '0'})`;
                    checkboxContainer.style.borderColor = isChecked ? '#888' : '#555';
                    checkboxContainer.style.backgroundColor = isChecked ? '#1a1a1a' : '#2d2d2d';

                    // Save to localStorage based on the ID
                    if (id === 'filter-code') {
                        localStorage.setItem('tool_filter_code', isChecked.toString());
                    } else if (id === 'filter-filesystem') {
                        localStorage.setItem('tool_filter_filesystem', isChecked.toString());
                    }

                    onChange(isChecked);
                };

                // Set initial state
                if (checked) {
                    checkboxContainer.style.borderColor = '#888';
                    checkboxContainer.style.backgroundColor = '#1a1a1a';
                }

                // Hover effect
                label.onmouseenter = () => {
                    if (!checkbox.checked) {
                        checkboxContainer.style.borderColor = '#777';
                    }
                };
                label.onmouseleave = () => {
                    if (!checkbox.checked) {
                        checkboxContainer.style.borderColor = '#555';
                    }
                };

                checkboxContainer.appendChild(checkbox);
                checkboxContainer.appendChild(checkmark);
                label.appendChild(checkboxContainer);
                label.appendChild(document.createTextNode(labelText));

                return label;
            };

            // Create filesystem checkbox
            const fsLabel = createStyledCheckbox(
                'filter-filesystem',
                'File System',
                this.toolFilters.filesystem,
                (checked) => {
                    this.toolFilters.filesystem = checked;
                    // Re-register tools with the new filter state
                    this.registerUniversalTools();
                    // Update the display
                    this.refreshToolsDisplay();
                }
            );

            // Create code checkbox
            const codeLabel = createStyledCheckbox(
                'filter-code',
                'Code',
                this.toolFilters.code,
                (checked) => {
                    this.toolFilters.code = checked;
                    // Re-register tools with the new filter state
                    this.registerUniversalTools();
                    // Update the display
                    this.refreshToolsDisplay();
                }
            );

            filterContainer.appendChild(fsLabel);
            filterContainer.appendChild(codeLabel);

            // Add tool count display
            const toolCountDisplay = document.createElement('span');
            toolCountDisplay.id = 'toolCountDisplay';
            toolCountDisplay.style.cssText = 'color: #888; font-size: 13px; margin-left: 10px;';

            // Calculate and display initial tool count
            const activeToolCount = this.aiManager.tools.length;
            toolCountDisplay.textContent = `${activeToolCount} tools active`;

            filterContainer.appendChild(toolCountDisplay);

            // Insert at the beginning of footer
            footer.insertBefore(filterContainer, footer.firstChild);
        } else {
            // Update existing checkboxes
            const fsCheckbox = filterContainer.querySelector('#filter-filesystem');
            const codeCheckbox = filterContainer.querySelector('#filter-code');
            if (fsCheckbox) {
                fsCheckbox.checked = this.toolFilters.filesystem;
                fsCheckbox.dispatchEvent(new Event('change'));
            }
            if (codeCheckbox) {
                codeCheckbox.checked = this.toolFilters.code;
                codeCheckbox.dispatchEvent(new Event('change'));
            }

            // Update tool count display
            const toolCountDisplay = document.getElementById('toolCountDisplay');
            if (toolCountDisplay) {
                const activeToolCount = this.aiManager.tools.length;
                toolCountDisplay.textContent = `${activeToolCount} tools active`;
            }
        }
    }

    // Add method to refresh tools display when filters change
    refreshToolsDisplay() {
        const content = document.getElementById('infoViewerContent');
        const provider = this.aiManager.getProvider();
        const allTools = this.aiManager.tools;

        // Filter tools based on category checkboxes
        const filteredTools = allTools.filter(tool => {
            if (tool.category === 'code' && this.toolFilters.code) return true;
            if (tool.category === 'filesystem' && this.toolFilters.filesystem) return true;
            if (!tool.category || tool.category === 'general') return true; // Show uncategorized tools
            return false;
        });

        if (provider && filteredTools.length > 0) {
            const formatted = provider.formatTools(filteredTools);
            content.value = JSON.stringify(formatted, null, 2);
        } else {
            content.value = '// No tools matching the selected filters';
        }

        // Update tool count display
        const toolCountDisplay = document.getElementById('toolCountDisplay');
        if (toolCountDisplay) {
            const activeToolCount = this.aiManager.tools.length;
            toolCountDisplay.textContent = `${activeToolCount} tools active`;
        }
    }

    // Environment Editor Methods
    openEnvironmentEditor() {
        const modal = document.getElementById('environmentModal');
        const editor = document.getElementById('environmentEditor');

        if (modal && editor) {
            editor.value = this.environmentInfo || '';
            modal.style.display = 'flex';
            editor.focus();

            // Store initial value to check if changed
            this.initialEnvironmentValue = editor.value;

            // Add ESC key handler
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeEnvironmentEditor();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
    }

    closeEnvironmentEditor() {
        const modal = document.getElementById('environmentModal');
        const editor = document.getElementById('environmentEditor');

        if (modal && editor) {
            // Save if content changed
            const currentValue = editor.value.trim();
            if (currentValue !== this.initialEnvironmentValue) {
                this.environmentInfo = currentValue;

                // Save to localStorage
                if (currentValue) {
                    localStorage.setItem('environment_info', currentValue);
                } else {
                    // Remove from localStorage if empty
                    localStorage.removeItem('environment_info');
                }

                // TODO: Hook this up to AIManager to actually send with messages
                console.log('Environment info saved to localStorage');
            }

            modal.style.display = 'none';
        }
    }

    closeInfoViewer() {
        const modal = document.getElementById('infoViewerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    copyInfoContent(event) {
        const content = document.getElementById('infoViewerContent');
        if (content) {
            content.select();
            navigator.clipboard.writeText(content.value).then(() => {
                // Optional: Show feedback
                const copyBtn = event ? event.target : document.querySelector('#infoViewerModal .modal-footer button');
                if (copyBtn) {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 1500);
                }
            });
        }
    }

    setupInfoViewerEscHandler() {
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeInfoViewer();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    initializeDebugPromptEditor() {
        if (this.debugPromptEditor || typeof ace === 'undefined') {
            return;
        }

        const editorElement = document.getElementById('debugPromptEditor');
        if (!editorElement) {
            return;
        }

        this.debugPromptEditor = ace.edit('debugPromptEditor');
        this.debugPromptEditor.setTheme('ace/theme/tomorrow_night');
        this.debugPromptEditor.session.setMode('ace/mode/json');
        this.debugPromptEditor.setReadOnly(true);
        this.debugPromptEditor.setShowPrintMargin(false);
        this.debugPromptEditor.setOption('highlightActiveLine', false);
        this.debugPromptEditor.setOption('highlightGutterLine', false);
        this.debugPromptEditor.session.setUseWrapMode(true);
        this.debugPromptEditor.session.setUseWorker(false);
        this.debugPromptEditor.setFontSize(14);
        this.debugPromptEditor.setBehavioursEnabled(false);

        const cursorLayer = this.debugPromptEditor.renderer?.$cursorLayer;
        if (cursorLayer && cursorLayer.element) {
            cursorLayer.element.style.display = 'none';
        }
    }

    showDebugPromptModal(payload) {
        if (!this.debugPromptModal) {
            return;
        }

        this.initializeDebugPromptEditor();

        let debugText = '';
        try {
            debugText = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
        } catch (error) {
            console.warn('Failed to stringify debug payload:', error);
            debugText = String(payload);
        }

        if (this.debugPromptEditor) {
            this.debugPromptEditor.setValue(debugText, -1);
            this.debugPromptEditor.session.getUndoManager().reset();
            this.debugPromptEditor.renderer.updateFull();
            setTimeout(() => {
                if (this.debugPromptEditor) {
                    this.debugPromptEditor.resize();
                }
            }, 0);
        } else {
            const editorElement = document.getElementById('debugPromptEditor');
            if (editorElement) {
                editorElement.textContent = debugText;
            }
        }

        this.debugPromptModal.style.display = 'flex';
        this.setupDebugPromptEscHandler();
    }

    closeDebugPromptModal() {
        if (this.debugPromptModal) {
            this.debugPromptModal.style.display = 'none';
        }

        if (this.debugPromptEscHandler) {
            document.removeEventListener('keydown', this.debugPromptEscHandler);
            this.debugPromptEscHandler = null;
        }
    }

    setupDebugPromptEscHandler() {
        if (this.debugPromptEscHandler) {
            document.removeEventListener('keydown', this.debugPromptEscHandler);
        }

        this.debugPromptEscHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeDebugPromptModal();
            }
        };

        document.addEventListener('keydown', this.debugPromptEscHandler);
    }

    copyDebugPromptContent(event) {
        const text = this.debugPromptEditor
            ? this.debugPromptEditor.getValue()
            : (document.getElementById('debugPromptEditor')?.textContent || '');

        if (!text) {
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            if (event && event.target) {
                const button = event.target;
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 1500);
            }
        }).catch((error) => {
            console.error('Failed to copy debug prompt:', error);
        });
    }

    // System Prompt Editor Methods
    openSystemPromptEditor() {
        const modal = document.getElementById('systemPromptModal');
        const editor = document.getElementById('systemPromptEditor');

        if (modal && editor) {
            editor.value = this.systemPrompt || '';
            modal.style.display = 'flex';
            editor.focus();

            // Add ESC key handler
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeSystemPromptEditor();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
    }

    closeSystemPromptEditor() {
        const modal = document.getElementById('systemPromptModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateLimitMessagesVisibility() {
        if (!this.limitMessagesContainer) {
            return;
        }

        this.limitMessagesContainer.style.display = 'flex';
    }

    getLimitedHistoryFallback(limit) {
        if (!Array.isArray(this.messages)) {
            return [];
        }

        if (limit <= 0) {
            return [...this.messages];
        }

        const baseSlice = this.sliceMessagesByUserLimit(limit);
        const lastToolIdx = this.findLastToolInteractionIndex(this.messages);

        if (lastToolIdx === -1) {
            return baseSlice;
        }

        const baseStartIdx = this.messages.length - baseSlice.length;
        if (lastToolIdx < baseStartIdx) {
            return this.messages.slice(lastToolIdx);
        }

        return baseSlice;
    }

    sliceMessagesByUserLimit(limit) {
        let userMessagesSeen = 0;
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const entry = this.messages[i];
            if (entry && entry.role === 'user' && typeof entry.content === 'string') {
                userMessagesSeen++;
                if (userMessagesSeen === limit) {
                    return this.messages.slice(i);
                }
            }
        }
        return [...this.messages];
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

    saveSystemPrompt() {
        const editor = document.getElementById('systemPromptEditor');
        if (editor) {
            const trimmedValue = editor.value.trim();
            const hasCustomPrompt = !!trimmedValue;

            // Update in-memory prompt
            this.systemPrompt = hasCustomPrompt
                ? trimmedValue
                : this.getDefaultSystemPrompt();

            if (typeof localStorage !== 'undefined') {
                if (hasCustomPrompt) {
                    localStorage.setItem(this.systemPromptStorageKey, this.systemPrompt);
                } else {
                    localStorage.removeItem(this.systemPromptStorageKey);
                }
            }

            // Update the AI Manager's system prompt
            if (this.aiManager) {
                this.aiManager.setSystemPrompt(this.systemPrompt);
            }

            // Close the modal
            this.closeSystemPromptEditor();

            // Optional: Show a subtle confirmation
            console.log('System prompt updated and saved to localStorage');
        }
    }

    // Define all tools (but don't register them yet)
    defineAllTools() {
        this.allToolDefinitions = [];

        // List files tool
        this.allToolDefinitions.push({
            name: 'list_files',
            description: 'List all files in the virtual file system as a tree structure',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            },
            handler: async () => {
                return await this.tools.list_files();
            },
            category: 'filesystem'
        });

        // Read file tool
        this.allToolDefinitions.push({
            name: 'read_file',
            description: 'Read the contents of a file from the virtual file system',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the file to read (e.g., "/folder/file.txt")'
                    }
                },
                required: ['path']
            },
            handler: async (args) => {
                return await this.tools.read_file(args.path);
            },
            category: 'filesystem'
        });

        // Code summary tool
        this.allToolDefinitions.push({
            name: 'code_summary',
            description: 'Analyze all JavaScript files in the workspace and generate a hierarchical summary of classes, methods, and global variables',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            },
            handler: async () => {
                return await this.tools.code_summary();
            },
            category: 'code'
        });

        // JavaScript create class tool
        this.allToolDefinitions.push({
            name: 'js_create_class',
            description: 'Create a new JavaScript file with a class definition. The file will be named ClassName.js and placed in the root directory.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to create (must be a valid JavaScript identifier)'
                    },
                    baseClass: {
                        type: 'string',
                        description: 'Optional: The name of the base class to extend'
                    }
                },
                required: ['className']
            },
            handler: async (args) => {
                return await this.tools.js_create_class(args.className, args.baseClass);
            },
            category: 'code'
        });

        // List HTML files tool
        this.allToolDefinitions.push({
            name: 'list_html_files',
            description: 'List all HTML files in the workspace',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            },
            handler: async () => {
                return await this.tools.list_html_files();
            },
            category: 'code'
        });

        // HTML get scripts tool
        this.allToolDefinitions.push({
            name: 'html_get_scripts',
            description: 'List all linked JavaScript files in an HTML file',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the HTML file (e.g., "/index.html")'
                    }
                },
                required: ['path']
            },
            handler: async (args) => {
                return await this.tools.html_get_scripts(args.path);
            },
            category: 'code'
        });

        // HTML add script tool
        this.allToolDefinitions.push({
            name: 'html_add_script',
            description: 'Add a JavaScript file link to an HTML file. The script will be added at the end of the body.',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the HTML file (e.g., "/index.html")'
                    },
                    scriptPath: {
                        type: 'string',
                        description: 'The path to the JavaScript file to link (e.g., "script.js" or "./js/app.js")'
                    }
                },
                required: ['path', 'scriptPath']
            },
            handler: async (args) => {
                return await this.tools.html_add_script(args.path, args.scriptPath);
            },
            category: 'code'
        });

        // HTML remove script tool
        this.allToolDefinitions.push({
            name: 'html_remove_script',
            description: 'Remove a JavaScript file link from an HTML file',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the HTML file (e.g., "/index.html")'
                    },
                    scriptPath: {
                        type: 'string',
                        description: 'The path to the JavaScript file to remove (must match exactly as it appears in the src attribute)'
                    }
                },
                required: ['path', 'scriptPath']
            },
            handler: async (args) => {
                return await this.tools.html_remove_script(args.path, args.scriptPath);
            },
            category: 'code'
        });

        // HTML get inline script tool
        this.allToolDefinitions.push({
            name: 'html_get_inline',
            description: 'Get the inline JavaScript code from an HTML file. If there are multiple inline scripts, they will be consolidated into one.',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the HTML file (e.g., "/index.html")'
                    }
                },
                required: ['path']
            },
            handler: async (args) => {
                return await this.tools.html_get_inline(args.path);
            },
            category: 'code'
        });

        // HTML set inline script tool
        this.allToolDefinitions.push({
            name: 'html_set_inline',
            description: 'Set or replace the inline JavaScript code in an HTML file. All existing inline scripts will be replaced with a single script containing the provided code.',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the HTML file (e.g., "/index.html")'
                    },
                    scriptContent: {
                        type: 'string',
                        description: 'The JavaScript code to set as inline script (leave empty to remove all inline scripts)'
                    }
                },
                required: ['path', 'scriptContent']
            },
            handler: async (args) => {
                return await this.tools.html_set_inline(args.path, args.scriptContent);
            },
            category: 'code'
        });

        // JavaScript get constructor tool
        this.allToolDefinitions.push({
            name: 'js_get_constructor',
            description: 'Get the constructor code from a JavaScript class. Returns the constructor if it exists, or an empty constructor with a comment if not found. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to get the constructor from'
                    }
                },
                required: ['className']
            },
            handler: async (args) => {
                return await this.tools.js_get_constructor(args.className);
            },
            category: 'code'
        });

        // JavaScript set constructor tool
        this.allToolDefinitions.push({
            name: 'js_set_constructor',
            description: 'Set or replace the constructor of a JavaScript class. Adds a constructor if none exists, or replaces the existing one. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to set the constructor for'
                    },
                    constructorContent: {
                        type: 'string',
                        description: 'The constructor code to set (can be just the body or full constructor declaration)'
                    }
                },
                required: ['className', 'constructorContent']
            },
            handler: async (args) => {
                return await this.tools.js_set_constructor(args.className, args.constructorContent);
            },
            category: 'code'
        });

        // JavaScript create variable tool
        this.allToolDefinitions.push({
            name: 'js_create_variable',
            description: 'Add a member variable to a JavaScript class. Variables are always added at the top of the class. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to add the variable to'
                    },
                    variableName: {
                        type: 'string',
                        description: 'The name of the variable (# prefix will be added automatically for private variables)'
                    },
                    isStatic: {
                        type: 'boolean',
                        description: 'Whether the variable is static (default: false)',
                        default: false
                    },
                    isPrivate: {
                        type: 'boolean',
                        description: 'Whether the variable is private (default: false, meaning public)',
                        default: false
                    },
                    initializer: {
                        type: 'string',
                        description: 'The initialization value (what comes after the = sign, default: null)',
                        default: 'null'
                    }
                },
                required: ['className', 'variableName']
            },
            handler: async (args) => {
                return await this.tools.js_create_variable(
                    args.className,
                    args.variableName,
                    args.isStatic || false,
                    args.isPrivate || false,
                    args.initializer || 'null'
                );
            },
            category: 'code'
        });

        // JavaScript remove variable tool
        this.allToolDefinitions.push({
            name: 'js_remove_variable',
            description: 'Remove a member variable from a JavaScript class. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to remove the variable from'
                    },
                    variableName: {
                        type: 'string',
                        description: 'The name of the variable to remove (without # for private variables)'
                    }
                },
                required: ['className', 'variableName']
            },
            handler: async (args) => {
                return await this.tools.js_remove_variable(args.className, args.variableName);
            },
            category: 'code'
        });

        // JavaScript get variable tool
        this.allToolDefinitions.push({
            name: 'js_get_variable',
            description: 'Get a variable definition from a JavaScript class. Returns the entire variable declaration line including semicolon, or empty string if not found. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to get the variable from'
                    },
                    variableName: {
                        type: 'string',
                        description: 'The name of the variable to get (without # for private variables)'
                    }
                },
                required: ['className', 'variableName']
            },
            handler: async (args) => {
                return await this.tools.js_get_variable(args.className, args.variableName);
            },
            category: 'code'
        });

        // JavaScript create function tool
        this.allToolDefinitions.push({
            name: 'js_create_function',
            description: 'Create a new function/method in a JavaScript class. Supports async, static, private, getter, and setter modifiers. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to add the function to'
                    },
                    functionName: {
                        type: 'string',
                        description: 'The name of the function (# prefix will be added automatically for private functions)'
                    },
                    isAsync: {
                        type: 'boolean',
                        description: 'Whether the function is async (default: false)',
                        default: false
                    },
                    isStatic: {
                        type: 'boolean',
                        description: 'Whether the function is static (default: false)',
                        default: false
                    },
                    isPrivate: {
                        type: 'boolean',
                        description: 'Whether the function is private (default: false)',
                        default: false
                    },
                    isGetter: {
                        type: 'boolean',
                        description: 'Whether the function is a getter (default: false)',
                        default: false
                    },
                    isSetter: {
                        type: 'boolean',
                        description: 'Whether the function is a setter (default: false)',
                        default: false
                    },
                    parameters: {
                        type: 'string',
                        description: 'The function parameters (e.g., "x, y, z"). Getters have no params, setters have exactly one.',
                        default: ''
                    },
                    functionBody: {
                        type: 'string',
                        description: 'The function body code (without curly braces)',
                        default: ''
                    }
                },
                required: ['className', 'functionName']
            },
            handler: async (args) => {
                return await this.tools.js_create_function(
                    args.className,
                    args.functionName,
                    args.isAsync || false,
                    args.isStatic || false,
                    args.isPrivate || false,
                    args.isGetter || false,
                    args.isSetter || false,
                    args.parameters || '',
                    args.functionBody || ''
                );
            },
            category: 'code'
        });

        // JavaScript remove function tool
        this.allToolDefinitions.push({
            name: 'js_remove_function',
            description: 'Remove a function/method from a JavaScript class. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to remove the function from'
                    },
                    functionName: {
                        type: 'string',
                        description: 'The name of the function to remove (without # for private functions)'
                    }
                },
                required: ['className', 'functionName']
            },
            handler: async (args) => {
                return await this.tools.js_remove_function(args.className, args.functionName);
            },
            category: 'code'
        });

        // JavaScript get function tool
        this.allToolDefinitions.push({
            name: 'js_get_function',
            description: 'Get a function/method definition from a JavaScript class. Returns the complete function code. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to get the function from'
                    },
                    functionName: {
                        type: 'string',
                        description: 'The name of the function to get (without # for private functions)'
                    }
                },
                required: ['className', 'functionName']
            },
            handler: async (args) => {
                return await this.tools.js_get_function(args.className, args.functionName);
            },
            category: 'code'
        });

        // JavaScript update function tool
        this.allToolDefinitions.push({
            name: 'js_update_function',
            description: 'Update/replace an existing function in a JavaScript class with new code. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class containing the function'
                    },
                    functionName: {
                        type: 'string',
                        description: 'The name of the function to update (without # for private functions)'
                    },
                    newFunctionCode: {
                        type: 'string',
                        description: 'The complete new function code to replace the existing function'
                    }
                },
                required: ['className', 'functionName', 'newFunctionCode']
            },
            handler: async (args) => {
                return await this.tools.js_update_function(args.className, args.functionName, args.newFunctionCode);
            },
            category: 'code'
        });

        // JavaScript get class info tool
        this.allToolDefinitions.push({
            name: 'js_get_class_info',
            description: 'Get comprehensive information about a JavaScript class including all properties, methods, getters, setters, and inheritance.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class to get information about'
                    }
                },
                required: ['className']
            },
            handler: async (args) => {
                return await this.tools.js_get_class_info(args.className);
            },
            category: 'code'
        });

        // JavaScript get class list tool (detailed version)
        this.allToolDefinitions.push({
            name: 'js_get_class_list',
            description: 'Get a detailed list of all JavaScript classes in the workspace, showing their file locations and inheritance relationships.',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            },
            handler: async () => {
                return await this.tools.js_get_class_list();
            },
            category: 'code'
        });

        // JavaScript list classes tool (concise version)
        this.allToolDefinitions.push({
            name: 'js_list_classes',
            description: 'Get a concise bullet-point list of all JavaScript classes in the workspace with their inheritance (e.g., "Game extends Phaser.Scene").',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            },
            handler: async () => {
                return await this.tools.js_list_classes();
            },
            category: 'code'
        });

        // JavaScript rename function tool
        this.allToolDefinitions.push({
            name: 'js_rename_function',
            description: 'Rename a function/method in a JavaScript class. Preserves all modifiers and function body. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class containing the function'
                    },
                    oldFunctionName: {
                        type: 'string',
                        description: 'The current name of the function (without # for private functions)'
                    },
                    newFunctionName: {
                        type: 'string',
                        description: 'The new name for the function (without # for private functions)'
                    }
                },
                required: ['className', 'oldFunctionName', 'newFunctionName']
            },
            handler: async (args) => {
                return await this.tools.js_rename_function(args.className, args.oldFunctionName, args.newFunctionName);
            },
            category: 'code'
        });

        // JavaScript rename variable tool
        this.allToolDefinitions.push({
            name: 'js_rename_variable',
            description: 'Rename a variable/property in a JavaScript class. Preserves all modifiers and initializer. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    className: {
                        type: 'string',
                        description: 'The name of the class containing the variable'
                    },
                    oldVariableName: {
                        type: 'string',
                        description: 'The current name of the variable (without # for private variables)'
                    },
                    newVariableName: {
                        type: 'string',
                        description: 'The new name for the variable (without # for private variables)'
                    }
                },
                required: ['className', 'oldVariableName', 'newVariableName']
            },
            handler: async (args) => {
                return await this.tools.js_rename_variable(args.className, args.oldVariableName, args.newVariableName);
            },
            category: 'code'
        });

        // JavaScript rename class tool
        this.allToolDefinitions.push({
            name: 'js_rename_class',
            description: 'Rename a JavaScript class and optionally rename its file if the filename matches the class name. Updates all references within the file. Closes the file if open in a tab.',
            parameters: {
                type: 'object',
                properties: {
                    oldClassName: {
                        type: 'string',
                        description: 'The current name of the class'
                    },
                    newClassName: {
                        type: 'string',
                        description: 'The new name for the class'
                    }
                },
                required: ['oldClassName', 'newClassName']
            },
            handler: async (args) => {
                return await this.tools.js_rename_class(args.oldClassName, args.newClassName);
            },
            category: 'code'
        });

        // Write file tool
        this.allToolDefinitions.push({
            name: 'write_file',
            description: 'Write content to an existing file in the virtual file system. If the file is open with unsaved changes, the user will be prompted.',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the file to write to (e.g., "/folder/file.txt"). File must already exist.'
                    },
                    content: {
                        type: 'string',
                        description: 'The content to write to the file'
                    }
                },
                required: ['path', 'content']
            },
            handler: async (args) => {
                return await this.tools.write_file(args.path, args.content);
            },
            category: 'filesystem'
        });

        // Create file tool
        this.allToolDefinitions.push({
            name: 'create_file',
            description: 'Create a new file in the virtual file system',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path where the file should be created (e.g., "/folder/newfile.txt")'
                    },
                    content: {
                        type: 'string',
                        description: 'The initial content for the file (optional, defaults to empty)',
                        default: ''
                    }
                },
                required: ['path']
            },
            handler: async (args) => {
                return await this.tools.create_file(args.path, args.content || '');
            },
            category: 'filesystem'
        });

        // Delete file tool
        this.allToolDefinitions.push({
            name: 'delete_file',
            description: 'Delete a file from the virtual file system. Any open tabs for this file will be closed.',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the file to delete (e.g., "/folder/file.txt")'
                    }
                },
                required: ['path']
            },
            handler: async (args) => {
                return await this.tools.delete_file(args.path);
            },
            category: 'filesystem'
        });

        // Rename file tool
        this.allToolDefinitions.push({
            name: 'rename_file',
            description: 'Rename or move a file to a new path. Any open tabs for the old file will be closed.',
            parameters: {
                type: 'object',
                properties: {
                    old_path: {
                        type: 'string',
                        description: 'The current path of the file (e.g., "/folder/oldname.txt")'
                    },
                    new_path: {
                        type: 'string',
                        description: 'The new path for the file (e.g., "/folder/newname.txt")'
                    }
                },
                required: ['old_path', 'new_path']
            },
            handler: async (args) => {
                return await this.tools.rename_file(args.old_path, args.new_path);
            },
            category: 'filesystem'
        });

        // Create folder tool
        this.allToolDefinitions.push({
            name: 'create_folder',
            description: 'Create a new folder in the virtual file system',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path where the folder should be created (e.g., "/newfolder")'
                    }
                },
                required: ['path']
            },
            handler: async (args) => {
                return await this.tools.create_folder(args.path);
            },
            category: 'filesystem'
        });

        // Delete folder tool
        this.allToolDefinitions.push({
            name: 'delete_folder',
            description: 'Delete a folder and all its contents from the virtual file system. Any open tabs for files in this folder will be closed.',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the folder to delete (e.g., "/folder")'
                    }
                },
                required: ['path']
            },
            handler: async (args) => {
                return await this.tools.delete_folder(args.path);
            },
            category: 'filesystem'
        });

        // Move file tool
        this.allToolDefinitions.push({
            name: 'move_file',
            description: 'Move a file or folder to a new location. Any open tabs for moved files will be closed.',
            parameters: {
                type: 'object',
                properties: {
                    source_path: {
                        type: 'string',
                        description: 'The current path of the file or folder to move (e.g., "/folder/file.txt")'
                    },
                    destination_path: {
                        type: 'string',
                        description: 'The destination path where the file or folder should be moved (e.g., "/otherfolder/file.txt")'
                    }
                },
                required: ['source_path', 'destination_path']
            },
            handler: async (args) => {
                return await this.tools.move_file(args.source_path, args.destination_path);
            },
            category: 'filesystem'
        });
    }

    // Register only the tools that match current filters
    registerUniversalTools() {
        // First define all tools if not already done
        if (!this.allToolDefinitions) {
            this.defineAllTools();
        }

        // Clear existing registered tools
        this.aiManager.tools = [];

        // Register only tools that match the current filters
        for (const toolDef of this.allToolDefinitions) {
            // Skip tools from disabled categories
            if (toolDef.category === 'code' && !this.toolFilters.code) continue;
            if (toolDef.category === 'filesystem' && !this.toolFilters.filesystem) continue;

            this.aiManager.registerTool(
                toolDef.name,
                toolDef.description,
                toolDef.parameters,
                toolDef.handler,
                toolDef.category
            );
        }

        console.log(`Registered ${this.aiManager.tools.length} tools based on filters (code: ${this.toolFilters.code}, filesystem: ${this.toolFilters.filesystem})`);
    }

    // Load saved provider and API keys
    async loadSavedProvider() {

        // Set provider dropdown
        if (this.providerSelect) {
            this.providerSelect.value = this.currentProvider;
        }

        // Load API keys for all providers
        this.loadAllApiKeys();

        // Update model dropdown - this will also update status for Ollama
        await this.updateModelDropdown();

        // Ensure AIManager is set to the correct provider
        if (this.aiManager.providers[this.currentProvider]) {
            this.aiManager.setProvider(this.currentProvider);
            console.log('Initial provider set to:', this.currentProvider);
        }

        // For non-Ollama providers, we need to update status
        // (Ollama already updates status in updateOllamaModels)
        if (this.currentProvider !== 'ollama') {
            updateApiStatus();
        }

    }

    // Load API keys for all providers
    loadAllApiKeys() {
        const providers = {};

        // Build provider to storage key map from config
        if (this.modelConfig && this.modelConfig.providers) {
            for (const [providerId, provider] of Object.entries(this.modelConfig.providers)) {
                providers[providerId] = localStorage.getItem(provider.apiKeyStorage);
            }
        } else {
            // Fallback to defaults
            providers['claude'] = localStorage.getItem('anthropic_api_key');
            providers['openai'] = localStorage.getItem('openai_api_key');
            providers['gemini'] = localStorage.getItem('gemini_api_key');
        }

        // Register providers with saved API keys
        for (const [provider, apiKey] of Object.entries(providers)) {
            if (apiKey) {
                this.registerProvider(provider, apiKey);
            }
        }

        // Also register Ollama provider if endpoint is saved
        const ollamaEndpoint = localStorage.getItem('ollama_endpoint');
        if (ollamaEndpoint) {
            this.registerProvider('ollama', null);
        }

        // Load current provider's API key into the input
        this.loadCurrentApiKey();
    }

    // Register a provider with the AI Manager
    registerProvider(providerName, apiKey) {
        let provider;
        let config = {};

        // Build config from models.json if available
        if (this.modelConfig && this.modelConfig.providers[providerName]) {
            const providerConfig = this.modelConfig.providers[providerName];
            config = {
                apiUrl: providerConfig.apiUrl,
                modelList: providerConfig.models.map(m => m.id),
                // Build simple models map (for backward compatibility)
                models: {}
            };

            // Add model mappings
            providerConfig.models.forEach((model, index) => {
                // Use first model as 'default' or the one marked as default
                if (model.default || index === 0) {
                    config.models.default = model.id;
                }
                // Also add by simple name (e.g., 'haiku' -> 'claude-haiku-4-5')
                const simpleName = model.name.toLowerCase().split(' ')[0].replace('(', '').replace(')', '');
                config.models[simpleName] = model.id;
            });
        }

        switch (providerName) {
            case 'claude':
                provider = new ClaudeProvider(apiKey, config);
                break;
            case 'openai':
                provider = new OpenAIProvider(apiKey, config);
                break;
            case 'gemini':
                provider = new GeminiProvider(apiKey, config);
                break;
            case 'ollama':
                // Ollama provider uses endpoint instead of API key
                const endpoint = localStorage.getItem('ollama_endpoint') || 'http://localhost:11434';
                provider = new OllamaProvider(endpoint, config);
                break;
        }

        if (provider) {
            this.aiManager.registerProvider(providerName, provider);
            if (providerName === this.currentProvider) {
                this.aiManager.setProvider(providerName);
            }
        }
    }

    // Load current provider's API key or endpoint into the input
    loadCurrentApiKey() {
        let inputValue = '';

        if (this.currentProvider === 'ollama') {
            // Load endpoint for Ollama provider
            inputValue = localStorage.getItem('ollama_endpoint') || 'http://localhost:11434';
            // Save default endpoint if not already saved
            if (!localStorage.getItem('ollama_endpoint')) {
                localStorage.setItem('ollama_endpoint', 'http://localhost:11434');
            }
        } else {
            // Load API key using config
            if (this.modelConfig && this.modelConfig.providers[this.currentProvider]) {
                const storageKey = this.modelConfig.providers[this.currentProvider].apiKeyStorage;
                inputValue = localStorage.getItem(storageKey) || '';
            } else {
                // Fallback to defaults
                switch (this.currentProvider) {
                    case 'claude':
                        inputValue = localStorage.getItem('anthropic_api_key') || '';
                        break;
                    case 'openai':
                        inputValue = localStorage.getItem('openai_api_key') || '';
                        break;
                    case 'gemini':
                        inputValue = localStorage.getItem('gemini_api_key') || '';
                        break;
                }
            }
        }
        this.apiKeyInput.value = inputValue;
        this.apiKey = inputValue; // Keep for backward compatibility
    }

    // Update model dropdown based on current provider
    async updateModelDropdown() {

        // Special handling for Ollama provider - fetch models dynamically
        if (this.currentProvider === 'ollama') {
            await this.updateOllamaModels();
            return;
        }

        // Clear and rebuild dropdown
        this.modelSelect.innerHTML = '';

        // Get models from config for current provider
        if (this.modelConfig && this.modelConfig.providers[this.currentProvider]) {
            const providerConfig = this.modelConfig.providers[this.currentProvider];

            for (const model of providerConfig.models) {
                const option = document.createElement('option');
                option.value = model.id;
                // Use displayName from config
                option.textContent = model.displayName || model.name || model.id;
                this.modelSelect.appendChild(option);
            }

            // Set default selection
            const savedModel = localStorage.getItem(`${this.currentProvider}_model`);
            const modelIds = providerConfig.models.map(m => m.id);

            if (savedModel && modelIds.includes(savedModel)) {
                this.modelSelect.value = savedModel;
            } else {
                // Find default model or use first one
                const defaultModel = providerConfig.models.find(m => m.default);
                if (defaultModel) {
                    this.modelSelect.value = defaultModel.id;
                } else if (providerConfig.models.length > 0) {
                    this.modelSelect.value = providerConfig.models[0].id;
                }
            }
        } else {
            // Fallback defaults
            const fallbackModels = {
                'claude': [{ id: 'claude-haiku-4-5', name: 'Haiku 4.5' }],
                'openai': [{ id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }],
                'gemini': [{ id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }]
            };

            const models = fallbackModels[this.currentProvider] || [];
            for (const model of models) {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                this.modelSelect.appendChild(option);
            }

            if (models.length > 0) {
                this.modelSelect.value = models[0].id;
            }
        }

        // Update status display
        updateApiStatus();
    }

    // Auto-load chat from IndexedDB
    async autoLoadChatHistory() {
        try {
            console.log('Attempting to load chat history...');
            const savedChat = await window.fileSystem.getFile('/$chat_history');

            if (savedChat && savedChat.content) {
                console.log('Found saved chat history, restoring...');
                const chatData = JSON.parse(savedChat.content);

                // Restore chat data
                const restoredMessages = chatData.messages
                    ? (typeof structuredClone === 'function'
                        ? structuredClone(chatData.messages)
                        : JSON.parse(JSON.stringify(chatData.messages)))
                    : [];

                this.messages = restoredMessages;
                this.totalTokens = chatData.totalTokens || 0;
                this.currentContextTokens = chatData.currentContextTokens || 0;

                // Restore messages to AI Manager if it exists
                if (this.aiManager) {
                    this.aiManager.clearHistory();
                    this.aiManager.conversationHistory = restoredMessages.map((msg) =>
                        this.aiManager.cloneMessage ? this.aiManager.cloneMessage(msg) : JSON.parse(JSON.stringify(msg))
                    );
                    if (typeof this.aiManager.ensureHistoryMessageIds === 'function') {
                        this.aiManager.ensureHistoryMessageIds();
                    }
                    console.log('Restored full conversation history with tool calls to AI Manager');
                }

                this.pendingContinueButton = null;
                this.currentContinueButton = null;
                this.loadingIndicator = null;

                this.syncLocalMessagesFromHistory();
                this.renderChatHistory();

                // Update displays
                this.updateTokenDisplay();
                console.log(`Chat history restored: ${this.messages.length} messages, ${this.totalTokens} tokens`);
            } else {
                console.log('No saved chat content found');
            }
        } catch (error) {
            console.log('No previous chat history found:', error.message);
        }
    }

    // Auto-save chat to IndexedDB
    async autoSaveChatHistory() {
        // Get messages from AI Manager's conversation history for full tool history
        // If AI Manager not available, fall back to local messages
        const messages = this.aiManager ? this.aiManager.getHistory() : this.messages;

        const chatData = {
            messages: messages,
            totalTokens: this.totalTokens,
            currentContextTokens: this.currentContextTokens,
            timestamp: new Date().toISOString(),
            provider: this.currentProvider,
            model: this.modelSelect.value
        };

        // Save to IndexedDB with a special filename
        const chatContent = JSON.stringify(chatData, null, 2);
        await window.fileSystem.saveFile('/$chat_history', chatContent, 'file');
        console.log('Chat history auto-saved (with full tool history)');
    }

    // Export chat to file
    exportChatHistory() {
        // Get messages from AI Manager's conversation history
        const messages = this.aiManager ? this.aiManager.getHistory() : this.messages;

        const chatData = {
            messages: messages,
            totalTokens: this.totalTokens,
            currentContextTokens: this.currentContextTokens,
            timestamp: new Date().toISOString(),
            provider: this.currentProvider,
            model: this.modelSelect.value
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${new Date().toISOString().replace(/:/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    loadChatHistory(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const chatData = JSON.parse(e.target.result);

                // Restore chat data
                const restoredMessages = chatData.messages
                    ? (typeof structuredClone === 'function'
                        ? structuredClone(chatData.messages)
                        : JSON.parse(JSON.stringify(chatData.messages)))
                    : [];

                this.messages = restoredMessages;
                this.totalTokens = chatData.totalTokens || 0;
                this.currentContextTokens = chatData.currentContextTokens || 0;

                // Restore messages to AI Manager if it exists
                if (this.aiManager) {
                    this.aiManager.clearHistory();
                    this.aiManager.conversationHistory = restoredMessages.map((msg) =>
                        this.aiManager.cloneMessage ? this.aiManager.cloneMessage(msg) : JSON.parse(JSON.stringify(msg))
                    );
                    if (typeof this.aiManager.ensureHistoryMessageIds === 'function') {
                        this.aiManager.ensureHistoryMessageIds();
                    }
                    console.log('Restored full conversation history with tool calls to AI Manager');
                }

                this.pendingContinueButton = null;
                this.currentContinueButton = null;
                this.loadingIndicator = null;

                this.renderChatHistory();

                // Update displays
                this.updateTokenDisplay();
                this.addSystemMessage(`Loaded chat history from ${chatData.timestamp}`);

                // Save the imported chat to IndexedDB
                this.autoSaveChatHistory().then(() => {
                    console.log('Imported chat history saved to storage');
                }).catch((error) => {
                    console.error('Error saving imported chat:', error);
                });
            } catch (error) {
                console.error('Error loading chat history:', error);
                this.addSystemMessage('Error loading chat history file');
            }
        };
        reader.readAsText(file);
    }

    async clearChat() {
        this.messages = [];
        this.totalTokens = 0;
        this.currentContextTokens = 0;
        this.chatWindow.innerHTML = '';

        this.pendingContinueButton = null;
        this.currentContinueButton = null;
        this.loadingIndicator = null;

        // Clear AI Manager history if it exists
        if (this.aiManager) {
            this.aiManager.clearHistory();
        }

        // Update display AFTER clearing values
        this.updateTokenDisplay();

        // Clear from IndexedDB by saving empty state
        try {
            const emptyChat = {
                messages: [],
                totalTokens: 0,
                currentContextTokens: 0,
                timestamp: new Date().toISOString(),
                provider: this.providerSelect.value,
                model: this.modelSelect.value
            };

            await window.fileSystem.saveFile('/$chat_history', JSON.stringify(emptyChat, null, 2), 'file');
            console.log('Chat cleared and saved empty state');
        } catch (error) {
            console.error('Error saving cleared chat state:', error);
        }
    }

    setupEventListeners() {
        // Auto-save API key on input
        this.apiKeyInput.addEventListener('input', () => {
            // Debounce the save to avoid saving on every keystroke
            clearTimeout(this.apiKeySaveTimeout);
            this.apiKeySaveTimeout = setTimeout(async () => {
                this.saveApiKey();

                // If Ollama provider and endpoint changed, refresh models
                if (this.currentProvider === 'ollama') {
                    const newEndpoint = this.apiKeyInput.value || 'http://localhost:11434';
                    const currentEndpoint = this.aiManager.providers['ollama']?.endpoint;

                    if (newEndpoint !== currentEndpoint) {
                        // Update the provider with new endpoint
                        const config = this.modelConfig?.providers['ollama'] || {};
                        this.aiManager.providers['ollama'] = new OllamaProvider(newEndpoint, config);

                        // Refresh the model list
                        await this.updateOllamaModels();
                        // updateApiStatus is already called inside updateOllamaModels
                    }
                }
            }, 500); // Save after 500ms of no typing
        });

        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Provider switching
        this.providerSelect.addEventListener('change', async () => {
            this.currentProvider = this.providerSelect.value;
            localStorage.setItem('ai_provider', this.currentProvider);

            // Update input field based on provider type
            this.updateProviderInput();

            // Load the appropriate API key or endpoint
            this.loadCurrentApiKey();

            // Update model dropdown
            await this.updateModelDropdown();

            // For Ollama, ensure provider is registered with current endpoint
            if (this.currentProvider === 'ollama') {
                const endpoint = localStorage.getItem('ollama_endpoint') || 'http://localhost:11434';
                this.registerProvider('ollama', null);
            }

            // Switch the active provider in AI Manager
            if (this.aiManager.providers[this.currentProvider]) {
                this.aiManager.setProvider(this.currentProvider);
                console.log('Provider switched to:', this.currentProvider);
            } else {
                console.log('Warning: Provider not found:', this.currentProvider);
            }

            // Status will be updated by updateModelDropdown when it completes
        });

        // Update status when model changes
        this.modelSelect.addEventListener('change', () => {
            // Save selected model for current provider
            this.currentModel = this.modelSelect.value;

            // Special handling for Ollama models
            if (this.currentProvider === 'ollama') {
                localStorage.setItem('ollama_model', this.currentModel);
            } else {
                localStorage.setItem(`${this.currentProvider}_model`, this.currentModel);
            }

            updateApiStatus();
        });

        // Chat history file input
        document.getElementById('chatHistoryInput').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadChatHistory(e.target.files[0]);
                e.target.value = '';
            }
        });

        if (this.minimizeTokensToggle) {
            this.minimizeTokensToggle.addEventListener('change', (e) => {
                this.minimizeTokens = e.target.checked;
                localStorage.setItem('minimize_tokens', this.minimizeTokens ? 'true' : 'false');
                this.updateLimitMessagesVisibility();
                this.renderChatHistory();
            });
        }

        if (this.limitMessagesInput) {
            this.limitMessagesInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value, 10);
                if (Number.isNaN(value) || value < 0) {
                    value = 0;
                }
                this.limitMessages = value;
                e.target.value = String(value);
                localStorage.setItem('limit_messages', String(value));
                this.renderChatHistory();
            });
        }

        if (this.tokensPerMinuteInput) {
            this.tokensPerMinuteInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value, 10);
                if (Number.isNaN(value) || value < 0) {
                    value = 0;
                }
                this.tokensPerMinuteLimit = value;
                this.tokensPerMinuteInput.value = String(value);
                localStorage.setItem('tokens_per_minute', String(value));
            });
        }

        if (this.debugPromptToggle) {
            this.debugPromptToggle.addEventListener('change', (e) => {
                this.debugPromptEnabled = e.target.checked;
                localStorage.setItem('debug_prompt_enabled', this.debugPromptEnabled ? 'true' : 'false');
            });
        }
    }

    setupChatContextMenu() {
        const hasMessageMenu = !!this.chatContextMenu;
        const hasBackgroundMenu = !!this.chatBackgroundMenu;

        if (!hasMessageMenu && !hasBackgroundMenu) {
            return;
        }

        if (hasMessageMenu) {
            this.chatContextMenu.addEventListener('click', (event) => {
                const target = event.target.closest('.context-menu-item');
                if (!target) {
                    return;
                }
                if (target.classList.contains('disabled')) {
                    event.preventDefault();
                    return;
                }

                const action = target.dataset.action;
                if (!action || !this.activeContextMessage) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                this.hideChatContextMenu();
                this.handleChatContextAction(action, this.activeContextMessage.data);
            });
        }

        if (hasBackgroundMenu) {
            this.chatBackgroundMenu.addEventListener('click', (event) => {
                const target = event.target.closest('.context-menu-item');
                if (!target) {
                    return;
                }
                if (target.classList.contains('disabled')) {
                    event.preventDefault();
                    return;
                }

                const action = target.dataset.action;
                event.preventDefault();
                event.stopPropagation();
                this.hideChatContextMenu();
                this.handleChatBackgroundAction(action);
            });
        }

        document.addEventListener('click', this.handleGlobalClickForChatMenu);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideChatContextMenu();
            }
        });
        window.addEventListener('blur', () => this.hideChatContextMenu());
        if (this.chatWindow) {
            this.chatWindow.addEventListener('scroll', () => this.hideChatContextMenu(), { passive: true });

            this.chatWindow.addEventListener('contextmenu', (event) => {
                if (event.target.closest('.message-container')) {
                    return;
                }
                if (!this.chatBackgroundMenu) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                this.showChatBackgroundMenu(event);
            });
        }
    }

    estimateTokensForText(text) {
        if (typeof text !== 'string' || text.length === 0) {
            return 0;
        }
        return Math.max(1, Math.ceil(text.length / 4));
    }

    pruneTokenUsage() {
        const now = Date.now();
        const cutoff = now - 60000;
        this.recentTokenUsage = this.recentTokenUsage.filter(entry => entry.timestamp > cutoff);
    }

    getTokensUsedLastMinute() {
        this.pruneTokenUsage();
        return this.recentTokenUsage.reduce((sum, entry) => sum + entry.tokens, 0);
    }

    addTokenUsage(tokens, provisional = false, meta = {}) {
        const entry = {
            timestamp: Date.now(),
            tokens,
            provisional,
            meta: Object.assign({}, meta)
        };
        this.recentTokenUsage.push(entry);
        if (console && typeof console.debug === 'function') {
            console.debug('[RateLimit] addTokenUsage', {
                tokens,
                provisional,
                meta: entry.meta,
                totalUsedLastMinute: this.getTokensUsedLastMinute()
            });
        }
        return entry;
    }

    finalizeTokenUsage(entry, actualTokens) {
        if (!entry) {
            return;
        }
        const previousTokens = entry.tokens;
        entry.tokens = actualTokens;
        entry.provisional = false;
        entry.timestamp = Date.now();
        entry.meta = Object.assign({}, entry.meta, { actualTokens });
        if (console && typeof console.debug === 'function') {
            console.debug('[RateLimit] finalizeTokenUsage', {
                estimatedTokens: entry.meta?.estimated,
                previousTokens,
                actualTokens,
                difference: actualTokens - (entry.meta?.estimated ?? previousTokens),
                meta: entry.meta
            });
        }
        this.pruneTokenUsage();
    }

    removeTokenUsage(entry) {
        if (!entry) {
            return;
        }
        const idx = this.recentTokenUsage.indexOf(entry);
        if (idx !== -1) {
            this.recentTokenUsage.splice(idx, 1);
            if (console && typeof console.debug === 'function') {
                console.debug('[RateLimit] removeTokenUsage', entry);
            }
        }
    }

    getTimeUntilRateLimitClear(tokensNeeded) {
        if (this.tokensPerMinuteLimit <= 0) {
            return 0;
        }
        this.pruneTokenUsage();
        const used = this.getTokensUsedLastMinute();
        if (used + tokensNeeded <= this.tokensPerMinuteLimit) {
            return 0;
        }
        if (this.recentTokenUsage.length === 0) {
            return 0;
        }
        const now = Date.now();
        const oldest = this.recentTokenUsage[0].timestamp;
        const wait = (oldest + 60000) - now;
        return wait > 0 ? wait : 0;
    }

    showRateLimitNotice(waitMs) {
        const seconds = Math.ceil(waitMs / 1000);
        if (!this.rateLimitNoticeElement) {
            const containerDiv = document.createElement('div');
            containerDiv.className = 'message-container assistant';
            containerDiv.style.justifyContent = 'center';

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';
            messageDiv.style.backgroundColor = '#0d3f6b';
            messageDiv.style.color = '#e6f2ff';
            messageDiv.style.textAlign = 'center';
            messageDiv.style.maxWidth = '60%';
            messageDiv.style.border = '1px solid #1e5fa8';
            containerDiv.appendChild(messageDiv);

            this.rateLimitNoticeElement = { container: containerDiv, message: messageDiv };
            this.chatWindow.appendChild(containerDiv);
        }

        this.rateLimitNoticeElement.message.textContent = `Waiting for rate limit cooldown (${seconds}s)...`;
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;

        if (this.rateLimitNoticeInterval) {
            clearInterval(this.rateLimitNoticeInterval);
        }

        this.rateLimitNoticeInterval = setInterval(() => {
            const remaining = this.getTimeUntilRateLimitClear(0);
            if (remaining <= 0) {
                this.hideRateLimitNotice();
            } else if (this.rateLimitNoticeElement) {
                this.rateLimitNoticeElement.message.textContent = `Waiting for rate limit cooldown (${Math.ceil(remaining / 1000)}s)...`;
            }
        }, 1000);
    }

    hideRateLimitNotice() {
        if (this.rateLimitNoticeInterval) {
            clearInterval(this.rateLimitNoticeInterval);
            this.rateLimitNoticeInterval = null;
        }
        if (this.rateLimitNoticeElement) {
            const { container } = this.rateLimitNoticeElement;
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
            this.rateLimitNoticeElement = null;
        }
    }

    async waitForRateLimit(tokensNeeded) {
        if (this.tokensPerMinuteLimit <= 0) {
            return;
        }

        this.hideRateLimitNotice();
        if (console && typeof console.debug === 'function') {
            console.debug('[RateLimit] waitForRateLimit start', {
                tokensNeeded,
                tokensUsedLastMinute: this.getTokensUsedLastMinute(),
                limit: this.tokensPerMinuteLimit
            });
        }

        const attemptSend = (resolve) => {
            this.pruneTokenUsage();
            const used = this.getTokensUsedLastMinute();
            if (used + tokensNeeded <= this.tokensPerMinuteLimit) {
                this.hideRateLimitNotice();
                if (console && typeof console.debug === 'function') {
                    console.debug('[RateLimit] waitForRateLimit satisfied', {
                        tokensNeeded,
                        tokensUsedLastMinute: used,
                        limit: this.tokensPerMinuteLimit
                    });
                }
                resolve();
                return;
            }

            const waitMs = this.getTimeUntilRateLimitClear(tokensNeeded) || 1000;
            this.showRateLimitNotice(waitMs);
            if (console && typeof console.debug === 'function') {
                console.debug('[RateLimit] waitForRateLimit waiting', {
                    tokensNeeded,
                    tokensUsedLastMinute: used,
                    limit: this.tokensPerMinuteLimit,
                    waitMs
                });
            }

            setTimeout(() => attemptSend(resolve), Math.max(500, waitMs));
        };

        return new Promise((resolve) => {
            attemptSend(resolve);
        });
    }

    registerMessageContext(element, contextData) {
        if (!this.chatContextMenu || !element) {
            return;
        }

        const mergedData = Object.assign({
            messageId: null,
            type: 'assistant',
            copyText: null,
            toolCallId: null,
            summaryToolIds: [],
            role: contextData.role || null
        }, contextData);

        if (typeof contextData.copyText === 'function') {
            mergedData.copyText = contextData.copyText;
        } else {
            mergedData.copyText = () => {
                const messageEl = element.querySelector('.message');
                return messageEl ? messageEl.innerText || messageEl.textContent || '' : '';
            };
        }

        this.messageContextData.set(element, mergedData);

        element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const data = this.messageContextData.get(element);
            if (!data) {
                return;
            }
            this.showChatContextMenu(event, element, data);
        });
    }

    showChatContextMenu(event, element, data) {
        if (!this.chatContextMenu) {
            return;
        }

        if (this.chatBackgroundMenu) {
            this.chatBackgroundMenu.classList.remove('show');
        }

        this.activeContextMessage = { element, data };

        if (this.chatContextMenuItems?.edit) {
            const shouldDisableEdit = this.isEditDisabledForContext(data);
            this.toggleContextMenuItemDisabled(this.chatContextMenuItems.edit, shouldDisableEdit);
        }

        this.chatContextMenu.style.left = `${event.pageX}px`;
        this.chatContextMenu.style.top = `${event.pageY}px`;
        this.chatContextMenu.classList.add('show');
    }

    showChatBackgroundMenu(event) {
        if (!this.chatBackgroundMenu) {
            return;
        }

        if (this.chatContextMenu) {
            this.chatContextMenu.classList.remove('show');
        }

        this.activeContextMessage = null;
        this.chatBackgroundMenu.style.left = `${event.pageX}px`;
        this.chatBackgroundMenu.style.top = `${event.pageY}px`;
        this.chatBackgroundMenu.classList.add('show');
    }

    hideChatContextMenu() {
        if (this.chatContextMenu) {
            this.chatContextMenu.classList.remove('show');
        }
        if (this.chatBackgroundMenu) {
            this.chatBackgroundMenu.classList.remove('show');
        }
        this.activeContextMessage = null;
    }

    handleChatBackgroundAction(action) {
        switch (action) {
            case 'export':
                this.exportChatHistory();
                break;
            case 'import': {
                const input = document.getElementById('chatHistoryInput');
                if (input) {
                    input.click();
                }
                break;
            }
            case 'clear':
                if (window.confirm('Clear all messages?')) {
                    this.clearChat();
                }
                break;
            default:
                break;
        }
    }

    toggleContextMenuItemDisabled(item, disabled) {
        if (!item) {
            return;
        }
        if (disabled) {
            item.classList.add('disabled');
        } else {
            item.classList.remove('disabled');
        }
    }

    isEditDisabledForContext(data) {
        if (!data) {
            return true;
        }
        const type = data.type;
        if (data.messageId === undefined || data.messageId === null) {
            return true;
        }
        return type === 'tool_use' || type === 'tool_result' || type === 'tool_summary' || type === 'system';
    }

    handleChatContextAction(action, data) {
        switch (action) {
            case 'copy':
                this.copyContextMessage(data);
                break;
            case 'edit':
                this.editContextMessage(data);
                break;
            case 'remove':
                this.removeContextMessage(data);
                break;
            default:
                break;
        }
    }

    copyContextMessage(data) {
        if (!data) {
            return;
        }
        const text = data.copyText ? data.copyText() : '';
        if (!text) {
            return;
        }

        navigator.clipboard.writeText(text).catch((error) => {
            console.error('Failed to copy chat message:', error);
        });
    }

    editContextMessage(data) {
        if (!data || this.isEditDisabledForContext(data)) {
            return;
        }

        const message = this.getConversationMessageById(data.messageId);
        if (!message) {
            console.warn('Unable to find message for editing:', data.messageId);
            return;
        }

        let originalText = '';
        if (typeof message.content === 'string') {
            originalText = message.content;
        } else {
            const textPart = Array.isArray(message.content)
                ? message.content.find(part => part && part.type === 'text')
                : null;
            originalText = textPart && textPart.text ? textPart.text : '';
        }

        const updated = window.prompt('Edit message content:', originalText);
        if (updated === null) {
            return;
        }

        const newText = updated.trim();
        if (!newText) {
            this.removeContextMessage(data);
            return;
        }

        if (typeof message.content === 'string') {
            message.content = newText;
        } else if (Array.isArray(message.content)) {
            const textPart = message.content.find(part => part && part.type === 'text');
            if (textPart) {
                textPart.text = newText;
            } else {
                message.content.unshift({ type: 'text', text: newText });
            }
        }

        this.syncLocalMessagesFromHistory();
        this.renderChatHistory();
        if (this.autoSave) {
            this.autoSaveChatHistory();
        }
    }

    removeContextMessage(data) {
        if (!data) {
            return;
        }

        const idsToRemove = new Set();
        const toolIdsToRemove = new Set();

        if (data.messageId !== null && data.messageId !== undefined) {
            idsToRemove.add(data.messageId);
        }

        if (Array.isArray(data.summaryToolIds)) {
            for (const id of data.summaryToolIds) {
                toolIdsToRemove.add(id);
            }
        }

        if (data.toolCallId) {
            toolIdsToRemove.add(data.toolCallId);
        }

        if (data.type === 'tool_result' && data.toolCallId) {
            toolIdsToRemove.add(data.toolCallId);
        }

        if (toolIdsToRemove.size > 0 && this.aiManager) {
            const history = this.aiManager.getHistory();
            let changed = true;
            while (changed) {
                changed = false;
                for (const entry of history) {
                    if (!entry) continue;

                    if (entry.role === 'assistant' && Array.isArray(entry.content)) {
                        const hasTool = entry.content.some(part => part.type === 'tool_use' && toolIdsToRemove.has(part.id));
                        if (hasTool && entry._id !== undefined && !idsToRemove.has(entry._id)) {
                            idsToRemove.add(entry._id);
                            changed = true;
                        }
                    } else if (entry.role === 'user' && Array.isArray(entry.content)) {
                        const hasResult = entry.content.some(part => part.type === 'tool_result' && toolIdsToRemove.has(part.tool_use_id));
                        if (hasResult && entry._id !== undefined && !idsToRemove.has(entry._id)) {
                            idsToRemove.add(entry._id);
                            changed = true;
                        }
                    }

                    if (entry.metadata?.summaryToolIds && entry.metadata.summaryToolIds.length > 0) {
                        const shared = entry.metadata.summaryToolIds.some(id => toolIdsToRemove.has(id));
                        if (shared && entry._id !== undefined && !idsToRemove.has(entry._id)) {
                            idsToRemove.add(entry._id);
                            changed = true;
                        }
                        const beforeSize = toolIdsToRemove.size;
                        for (const toolId of entry.metadata.summaryToolIds) {
                            if (!toolIdsToRemove.has(toolId)) {
                                toolIdsToRemove.add(toolId);
                            }
                        }
                        if (toolIdsToRemove.size > beforeSize) {
                            changed = true;
                        }
                    }
                }
            }
        }

        if (idsToRemove.size === 0) {
            return;
        }

        if (this.aiManager) {
            this.aiManager.conversationHistory = this.aiManager.conversationHistory.filter(entry => !idsToRemove.has(entry._id));
        }

        this.syncLocalMessagesFromHistory();
        this.renderChatHistory();
        if (this.autoSave) {
            this.autoSaveChatHistory();
        }
    }

    getConversationMessageById(messageId) {
        if (messageId === undefined || messageId === null) {
            return null;
        }
        if (!this.aiManager) {
            return null;
        }
        return this.aiManager.conversationHistory.find(entry => entry && entry._id === messageId) || null;
    }

    syncLocalMessagesFromHistory() {
        if (!this.aiManager) {
            return;
        }
        const history = this.aiManager.getHistory();
        if (Array.isArray(history)) {
            this.messages = history.map(entry => this.aiManager.cloneMessage ? this.aiManager.cloneMessage(entry) : JSON.parse(JSON.stringify(entry)));
        }
    }

    loadApiKey() {
        // This method is now handled by loadCurrentApiKey and loadAllApiKeys
        // Kept for backward compatibility
        updateApiStatus();
    }

    saveApiKey() {
        const inputValue = this.apiKeyInput.value;

        if (this.currentProvider === 'ollama') {
            // Save endpoint for Ollama provider
            localStorage.setItem('ollama_endpoint', inputValue);
            // Register Ollama provider with endpoint
            this.registerProvider('ollama', null);
        } else {
            // Save API key for cloud providers
            if (this.modelConfig && this.modelConfig.providers[this.currentProvider]) {
                const storageKey = this.modelConfig.providers[this.currentProvider].apiKeyStorage;
                localStorage.setItem(storageKey, inputValue);
            } else {
                // Fallback to defaults
                switch (this.currentProvider) {
                    case 'claude':
                        localStorage.setItem('anthropic_api_key', inputValue);
                        break;
                    case 'openai':
                        localStorage.setItem('openai_api_key', inputValue);
                        break;
                    case 'gemini':
                        localStorage.setItem('gemini_api_key', inputValue);
                        break;
                }
            }
            // Register/update the provider with the new API key
            this.registerProvider(this.currentProvider, inputValue);
        }

        this.aiManager.setProvider(this.currentProvider);

        // Keep for backward compatibility
        this.apiKey = inputValue;

        // Don't print to chat, just update status
        updateApiStatus();
    }

    updateTokenDisplay() {
        const tokenDisplay = document.getElementById('tokenDisplay');
        if (!tokenDisplay) {
            return;
        }

        const formatCount = (value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toString();
        };

        const model = this.modelSelect ? this.modelSelect.value : null;
        const contextWindow = this.modelContextWindows[model] || 200000;
        const usedTokens = Math.max(this.currentContextTokens, 0);

        if (usedTokens === 0) {
            tokenDisplay.textContent = '';
            return;
        }

        const contextPercentUsed = contextWindow > 0 ? (usedTokens / contextWindow) * 100 : 0;
        let contextColor = '#b8960f';
        if (contextPercentUsed > 90) {
            contextColor = '#cc4444';
        } else if (contextPercentUsed > 75) {
            contextColor = '#cc6600';
        }

        tokenDisplay.innerHTML = `<span style="color: ${contextColor}">Last call: ${formatCount(usedTokens)} used | ${formatCount(contextWindow)} max</span>`;
    }

    addMessage(content, role, metadata = null) {
        const isToolSummary = !!(metadata && metadata.toolSummary);
        const messageId = metadata && Object.prototype.hasOwnProperty.call(metadata, 'messageId')
            ? metadata.messageId
            : null;
        const summaryToolIds = Array.isArray(metadata?.summaryToolIds)
            ? [...metadata.summaryToolIds]
            : [];

        const containerDiv = document.createElement('div');
        containerDiv.className = `message-container ${role}`;
        if (isToolSummary) {
            containerDiv.classList.add('tool-summary');
        }

        const messageWrapper = document.createElement('div');
        messageWrapper.style.display = 'flex';
        messageWrapper.style.flexDirection = 'column';
        messageWrapper.style.flex = '1';

        const addHeader = (text, align = 'flex-start') => {
            if (!text) return;
            const headerDiv = document.createElement('div');
            headerDiv.className = 'message-header';
            headerDiv.style.fontSize = '11px';
            headerDiv.style.color = '#888';
            headerDiv.style.marginBottom = '4px';
            headerDiv.style.opacity = '0.8';
            headerDiv.style.alignSelf = align;
            headerDiv.style.textAlign = align === 'flex-end' ? 'right' : 'left';
            headerDiv.textContent = text;
            messageWrapper.appendChild(headerDiv);
        };

        if (role === 'assistant') {
            if (isToolSummary) {
                addHeader('Tool');
            } else if (metadata && (metadata.provider || metadata.model)) {
                const provider = metadata.provider || this.currentProvider;
                const model = metadata.model || this.modelSelect.value;
                addHeader(this.getModelDisplayName(provider, model));
            } else {
                addHeader('Assistant');
            }
        } else if (role === 'user') {
            addHeader('User', 'flex-end');
        }

        if (metadata && metadata.provider === 'tool-use') {
            addHeader('Tool');
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        if (isToolSummary) {
            messageDiv.classList.add('tool-summary');
        }

        const shouldRenderMarkdown = !isToolSummary && (role === 'assistant' || role === 'error');

        if (shouldRenderMarkdown) {
            if (typeof marked !== 'undefined') {
                marked.setOptions({
                    highlight: function(code, lang) {
                        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(code, { language: lang }).value;
                            } catch (err) {}
                        }
                        return code;
                    },
                    breaks: true,
                    gfm: true,
                });

                const htmlContent = marked.parse(content);
                messageDiv.innerHTML = htmlContent;

                if (typeof hljs !== 'undefined') {
                    messageDiv.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
                        hljs.highlightElement(block);
                    });
                }
            } else {
                messageDiv.textContent = content;
            }
        } else {
            messageDiv.textContent = content;
        }

        messageWrapper.appendChild(messageDiv);

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => {
            const textToCopy = messageDiv.innerText || messageDiv.textContent || content;
            this.copyToClipboard(textToCopy, copyButton);
        };

        if (role === 'user') {
            containerDiv.appendChild(copyButton);
            containerDiv.appendChild(messageWrapper);
        } else {
            containerDiv.appendChild(messageWrapper);
            containerDiv.appendChild(copyButton);
        }

        this.chatWindow.appendChild(containerDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;

        const contextData = {
            messageId,
            type: isToolSummary ? 'tool_summary' : role,
            copyText: typeof content === 'string' ? content : messageDiv.textContent,
            summaryToolIds,
            role
        };
        this.registerMessageContext(containerDiv, contextData);
    }

    getModelDisplayName(provider, model) {
        // Use display names from config if available
        if (this.modelConfig && this.modelConfig.providers[provider]) {
            const modelDef = this.modelConfig.providers[provider].models.find(m => m.id === model);
            if (modelDef) {
                return modelDef.displayName;
            }
        }

        // Fallback to generic format
        return `${provider}/${model}`;
    }

    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    addSystemMessage(content) {
        // Check if it's an error message
        if (content.startsWith('Error:') || content.startsWith('Error ')) {
            this.addMessage(content, 'error');
        } else {
            this.addMessage(content, 'assistant');
        }
    }

    addToolUse(toolName, input, options = {}) {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'message-container tool-use';

        const messageWrapper = document.createElement('div');
        messageWrapper.style.display = 'flex';
        messageWrapper.style.flexDirection = 'column';
        messageWrapper.style.flex = '1';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.style.fontSize = '11px';
        headerDiv.style.color = '#888';
        headerDiv.style.marginBottom = '4px';
        headerDiv.style.opacity = '0.8';
        headerDiv.textContent = 'Tool';
        messageWrapper.appendChild(headerDiv);

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message tool-use';
        const content = `Using tool: ${toolName}\nInput: ${JSON.stringify(input, null, 2)}`;
        messageDiv.textContent = content;
        messageWrapper.appendChild(messageDiv);

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => {
            const textToCopy = messageDiv.innerText || messageDiv.textContent || content;
            this.copyToClipboard(textToCopy, copyButton);
        };

        containerDiv.appendChild(messageWrapper);
        containerDiv.appendChild(copyButton);

        this.chatWindow.appendChild(containerDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;

        const contextData = {
            type: 'tool_use',
            messageId: options.messageId ?? null,
            toolCallId: options.toolCallId ?? null,
            copyText: content,
            role: 'assistant'
        };
        this.registerMessageContext(containerDiv, contextData);
    }

    addToolResult(result, isError = false, options = {}) {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'message-container tool-result';

        const messageWrapper = document.createElement('div');
        messageWrapper.style.display = 'flex';
        messageWrapper.style.flexDirection = 'column';
        messageWrapper.style.flex = '1';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.style.fontSize = '11px';
        headerDiv.style.color = '#888';
        headerDiv.style.marginBottom = '4px';
        headerDiv.style.opacity = '0.8';
        headerDiv.textContent = 'Tool';
        messageWrapper.appendChild(headerDiv);

        const messageDiv = document.createElement('div');
        messageDiv.className = `message tool-result${isError ? ' tool-error' : ''}`;
        const heading = isError ? 'Tool error' : 'Tool result';
        const content = `${heading}:\n${result}`;
        messageDiv.textContent = content;
        messageWrapper.appendChild(messageDiv);

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => {
            const textToCopy = messageDiv.innerText || messageDiv.textContent || result;
            this.copyToClipboard(textToCopy, copyButton);
        };

        containerDiv.appendChild(messageWrapper);
        containerDiv.appendChild(copyButton);

        this.chatWindow.appendChild(containerDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;

        const contextData = {
            type: 'tool_result',
            messageId: options.messageId ?? null,
            toolCallId: options.toolCallId ?? null,
            copyText: content,
            role: 'user'
        };
        this.registerMessageContext(containerDiv, contextData);
    }

    renderChatHistory() {
        if (!this.chatWindow) {
            return;
        }

        this.hideChatContextMenu();

        const limitMessages = this.limitMessages > 0 ? this.limitMessages : 0;
        const history = this.aiManager
            ? this.aiManager.getHistoryView(this.minimizeTokens, limitMessages)
            : this.getLimitedHistoryFallback(limitMessages);

        this.chatWindow.innerHTML = '';
        this.currentContinueButton = null;

        const skipIndices = new Set();

        for (let idx = 0; idx < history.length; idx++) {
            if (skipIndices.has(idx)) {
                continue;
            }

            const msg = history[idx];
            if (!msg) {
                continue;
            }

            if (msg.role === 'system') {
                continue;
            }

            if (msg.role === 'user') {
                if (typeof msg.content === 'string') {
                    const meta = Object.assign({}, msg.metadata || {}, { messageId: msg._id });
                    this.addMessage(msg.content, 'user', meta);
                } else if (Array.isArray(msg.content)) {
                    if (msg.content[0]?.type === 'tool_result') {
                        for (const result of msg.content) {
                            if (result.type === 'tool_result') {
                                this.addToolResult(result.content, !!result.is_error, {
                                    messageId: msg._id,
                                    toolCallId: result.tool_use_id
                                });
                            }
                        }
                    }
                }
                continue;
            }

            if (msg.role === 'assistant') {
                if (typeof msg.content === 'string') {
                    const meta = Object.assign({}, msg.metadata || {}, { messageId: msg._id });
                    this.addMessage(msg.content, 'assistant', meta);
                } else if (Array.isArray(msg.content)) {
                    let metadataUsed = false;
                    let pendingToolResults = new Map();

                    const nextMsg = history[idx + 1];
                    const nextIsToolResult = nextMsg && nextMsg.role === 'user' && Array.isArray(nextMsg.content) && nextMsg.content.every(part => part.type === 'tool_result');
                    if (nextIsToolResult) {
                        for (const result of nextMsg.content) {
                            pendingToolResults.set(result.tool_use_id, result);
                        }
                        skipIndices.add(idx + 1);
                    }

                    for (const part of msg.content) {
                        if (part.type === 'text') {
                            const baseMeta = !metadataUsed ? (msg.metadata || null) : null;
                            const meta = baseMeta
                                ? Object.assign({}, baseMeta, { messageId: msg._id })
                                : { messageId: msg._id };
                            metadataUsed = true;
                            this.addMessage(part.text, 'assistant', meta);
                        } else if (part.type === 'tool_use') {
                            this.addToolUse(part.name, part.input, {
                                messageId: msg._id,
                                toolCallId: part.id
                            });
                            const matchingResult = pendingToolResults.get(part.id);
                            if (matchingResult) {
                                this.addToolResult(matchingResult.content, !!matchingResult.is_error, {
                                    messageId: nextMsg?._id ?? null,
                                    toolCallId: matchingResult.tool_use_id
                                });
                                pendingToolResults.delete(part.id);
                            }
                        }
                    }

                    for (const leftoverResult of pendingToolResults.values()) {
                        this.addToolResult(leftoverResult.content, !!leftoverResult.is_error, {
                            messageId: nextMsg?._id ?? null,
                            toolCallId: leftoverResult.tool_use_id
                        });
                    }
                }
            }
        }

        if (this.loadingIndicator) {
            this.chatWindow.appendChild(this.loadingIndicator);
        }

        if (this.pendingContinueButton) {
            this.renderPendingContinueButton();
        }

        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content) {
            if (this.debugPromptEnabled) {
                this.closeDebugPromptModal();

                const model = this.modelSelect.value;
                const limitMessages = this.limitMessages > 0 ? this.limitMessages : 0;
                let messages = this.aiManager.getHistoryView(this.minimizeTokens, limitMessages);

                if (this.aiManager.systemPrompt) {
                    const hasSystemPrompt = messages.length > 0 && messages[0]?.role === 'system';
                    if (!hasSystemPrompt) {
                        messages = [{ role: 'system', content: this.aiManager.systemPrompt }, ...messages];
                    }
                }

                const providerOptions = {
                    model: model,
                    maxTokens: 4096,
                    temperature: 0.7,
                    maxIterations: this.maxIterations,
                    minimizeTokens: this.minimizeTokens,
                    limitMessages,
                    preAddedUserMessage: false
                };

                try {
                    const payload = this.aiManager.buildDebugPayload(messages, providerOptions);
                    this.showDebugPromptModal(payload);
                } catch (error) {
                    console.warn('Failed to build debug payload for empty message:', error);
                }
            }
            return;
        }

        // Reset script inclusion choices for new user message (per-invocation memory)
        if (this.tools && this.tools.resetScriptChoices) {
            this.tools.resetScriptChoices();
        }

        // Check if current provider exists, create Ollama provider if needed
        if (!this.aiManager.providers[this.currentProvider]) {
            if (this.currentProvider === 'ollama') {
                // Create Ollama provider on demand
                const endpoint = localStorage.getItem('ollama_endpoint') || 'http://localhost:11434';
                this.registerProvider('ollama', null);
            } else {
                this.addSystemMessage(`Please set your ${this.currentProvider.charAt(0).toUpperCase() + this.currentProvider.slice(1)} API key first`);
                return;
            }
        }

        // Ensure the AI Manager is using the correct provider
        if (this.aiManager.currentProvider !== this.currentProvider) {
            this.aiManager.setProvider(this.currentProvider);
            console.log('Switched AI Manager to provider:', this.currentProvider);
        }

        this.messageInput.value = '';
        this.pendingProviderUsageEntries = [];
        let preAddedMessage = null;
        const sendButton = document.getElementById('sendBtn');
        if (sendButton) {
            sendButton.disabled = true;
        }

        if (this.aiManager) {
            preAddedMessage = this.aiManager.addMessage('user', content);
            this.syncLocalMessagesFromHistory();
            this.renderChatHistory();
        } else {
            this.addMessage(content, 'user');
            this.messages.push({ role: 'user', content: content });
        }

        // Prepare loading indicator but append after potential re-render
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant';
        loadingDiv.innerHTML = '<div class="loading"></div>';

        try {
            const model = this.modelSelect.value;

            console.log('Sending message with:', {
                provider: this.currentProvider,
                model: model,
                hasProvider: !!this.aiManager.providers[this.currentProvider],
                currentProviderName: this.aiManager.currentProvider
            });

            const handleProgress = (info) => {
                if (console && typeof console.debug === 'function') {
                    console.debug('[RateLimit] progress update', info);
                }
                if (this.chatWindow && this.loadingIndicator === loadingDiv && this.chatWindow.contains(loadingDiv)) {
                    this.chatWindow.removeChild(loadingDiv);
                    this.loadingIndicator = null;
                }
                if (this.aiManager) {
                    this.syncLocalMessagesFromHistory();
                    this.renderChatHistory();
                }
                if (info && info.usage && this.pendingProviderUsageEntries.length > 0) {
                    const entry = this.pendingProviderUsageEntries.shift();
                    const inputTokens = info.usage.input_tokens || info.usage.prompt_tokens || entry.tokens;
                    this.finalizeTokenUsage(entry, inputTokens);
                }
            };

            const prepareRateLimit = async (historyMessages) => {
                try {
                    const serialized = JSON.stringify(historyMessages);
                    const estimated = this.estimateTokensForText(serialized);
                    if (console && typeof console.debug === 'function') {
                        console.debug('[RateLimit] provider payload estimate', {
                            providerside: true,
                            estimatedTokens: estimated,
                            messageCount: historyMessages.length,
                            tokensUsedLastMinute: this.getTokensUsedLastMinute(),
                            limit: this.tokensPerMinuteLimit
                        });
                    }

                    await this.waitForRateLimit(estimated);

                    if (this.tokensPerMinuteLimit > 0) {
                        const entry = this.addTokenUsage(estimated, true, {
                            type: 'provider_payload',
                            estimated,
                            messageCount: historyMessages.length
                        });
                        this.pendingProviderUsageEntries.push(entry);
                    }
                } catch (error) {
                    console.warn('Failed to prepare rate limit for payload:', error);
                }
            };

            const debugCallback = this.debugPromptEnabled
                ? (payload) => this.showDebugPromptModal(payload)
                : null;

            if (debugCallback) {
                this.closeDebugPromptModal();
            }

            const sendPromise = this.aiManager.sendMessage(content, {
                model: model,
                maxTokens: 4096,
                temperature: 0.7,
                maxIterations: this.maxIterations,
                minimizeTokens: this.minimizeTokens,
                limitMessages: this.limitMessages > 0 ? this.limitMessages : 0,
                preAddedUserMessage: !!preAddedMessage,
                onProgress: handleProgress,
                prepareRateLimit,
                ...(debugCallback ? { onDebugPayload: debugCallback } : {})
            });

            if (this.minimizeTokens) {
                this.renderChatHistory();
            }

            this.loadingIndicator = loadingDiv;
            this.chatWindow.appendChild(loadingDiv);

            const response = await sendPromise;

            if (this.chatWindow.contains(loadingDiv)) {
                this.chatWindow.removeChild(loadingDiv);
            }
            this.loadingIndicator = null;

            await this.processUnifiedResponse(response);

            this.hideRateLimitNotice();

            if (this.minimizeTokens) {
                this.renderChatHistory();
            }
            if (sendButton) {
                sendButton.disabled = false;
            }
        } catch (error) {
            if (this.chatWindow.contains(loadingDiv)) {
                this.chatWindow.removeChild(loadingDiv);
            }
            this.loadingIndicator = null;
            const errorText = `Error: ${error.message}`;
            if (this.aiManager) {
                this.aiManager.addMessage('assistant', errorText);
                this.syncLocalMessagesFromHistory();
                this.renderChatHistory();
            } else {
                this.addSystemMessage(errorText);
            }
            console.error(`Error calling ${this.currentProvider}:`, error);
            if (sendButton) {
                sendButton.disabled = false;
            }
            while (this.pendingProviderUsageEntries.length > 0) {
                const entry = this.pendingProviderUsageEntries.shift();
                this.removeTokenUsage(entry);
            }
            this.pendingProviderUsageEntries = [];
            this.hideRateLimitNotice();
            if (this.autoSave) {
                try {
                    await this.autoSaveChatHistory();
                } catch (saveError) {
                    console.error('Failed to save chat history after error:', saveError);
                }
            }
        }
    }

    // New unified response processor
    async processUnifiedResponse(response) {
        // Update token usage if available
        const providerEntry = this.pendingProviderUsageEntries.length > 0
            ? this.pendingProviderUsageEntries.shift()
            : null;

        if (response.usage) {
            // Handle different token field names (Claude uses input_tokens, OpenAI uses prompt_tokens)
            const inputTokens = response.usage.input_tokens || response.usage.prompt_tokens || 0;
            const outputTokens = response.usage.output_tokens || response.usage.completion_tokens || 0;
            this.totalTokens += inputTokens + outputTokens;

            // Update current context usage
            this.currentContextTokens = inputTokens + outputTokens;

            this.updateTokenDisplay();

            if (this.tokensPerMinuteLimit > 0 && providerEntry) {
                this.finalizeTokenUsage(providerEntry, inputTokens > 0 ? inputTokens : providerEntry.tokens);
            }
            if (console && typeof console.debug === 'function') {
                console.debug('[RateLimit] response usage', {
                    inputTokens,
                    outputTokens,
                    tokensUsedLastMinute: this.getTokensUsedLastMinute(),
                    limit: this.tokensPerMinuteLimit
                });
            }
        } else if (providerEntry && this.tokensPerMinuteLimit > 0) {
            if (console && typeof console.debug === 'function') {
                console.debug('[RateLimit] response missing usage data, using estimate', {
                    estimatedTokens: providerEntry.tokens,
                    meta: providerEntry.meta
                });
            }
            this.finalizeTokenUsage(providerEntry, providerEntry.tokens);
        }

        // Display tool calls if any were made
        if (response.allToolCalls && response.allToolCalls.length > 0) {
            for (let i = 0; i < response.allToolCalls.length; i++) {
                const toolCall = response.allToolCalls[i];
                const toolResult = response.allToolResults ? response.allToolResults[i] : null;

                this.addToolUse(toolCall.name, toolCall.arguments, {
                    messageId: toolCall.messageId ?? null,
                    toolCallId: toolCall.id
                });

                if (toolResult) {
                    this.addToolResult(toolResult.result, !!toolResult.isError, {
                        messageId: toolResult.messageId ?? null,
                        toolCallId: toolResult.id ?? toolResult.tool_use_id ?? toolCall.id
                    });
                }
            }
        }

        while (this.pendingProviderUsageEntries.length > 0) {
            const leftover = this.pendingProviderUsageEntries.shift();
            if (leftover && leftover.provisional) {
                this.finalizeTokenUsage(leftover, leftover.tokens);
            }
        }

        // Display the response content with model metadata
        if (response.content) {
            const metadata = {
                provider: this.currentProvider,
                model: this.modelSelect.value,
                messageId: response.assistantMessageId ?? null
            };
            this.addMessage(response.content, 'assistant', metadata);

            const history = this.aiManager ? this.aiManager.getHistory() : null;
            if (history && history.length > 0) {
                for (let i = history.length - 1; i >= 0; i--) {
                    const entry = history[i];
                    if (entry.role === 'assistant') {
                        if (typeof entry.content === 'string') {
                            entry.metadata = metadata;
                            break;
                        }
                        if (Array.isArray(entry.content) && !entry.metadata) {
                            entry.metadata = metadata;
                            break;
                        }
                    }
                }
            }
        }

        // Check if we need to show a continuation button
        if (response.needsContinuation) {
            this.showContinueToolsButton(response.iterationsUsed, response.maxIterations);
        }

        this.syncLocalMessagesFromHistory();
        this.renderChatHistory();

        // Auto-save after processing response
        if (this.autoSave) {
            await this.autoSaveChatHistory();
        }
    }

    buildContinueToolsButton(iterationsUsed, maxIterations) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'continue-tools-container';
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: center;
            padding: 15px;
            background: #2a2a2a;
            border-radius: 8px;
            margin: 10px 0;
        `;

        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary';
        continueBtn.style.cssText = `
            padding: 10px 20px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        continueBtn.innerHTML = `🔄 Continue Tool Processing (${iterationsUsed}/${maxIterations} iterations used)`;

        continueBtn.onclick = async () => {
            // Remove the button
            buttonContainer.remove();
            this.pendingContinueButton = null;
            this.currentContinueButton = null;

            // Show loading
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message assistant';
            loadingDiv.innerHTML = '<div class="loading"></div> Continuing tool processing...';
            const sendPromise = this.aiManager.sendMessage('__continue_tools__', {
                model: this.modelSelect.value,
                maxTokens: 4096,
                temperature: 0.7,
                maxIterations: 20,
                minimizeTokens: this.minimizeTokens,
                limitMessages: this.limitMessages > 0 ? this.limitMessages : 0
            });

            if (this.minimizeTokens) {
                this.renderChatHistory();
            }

            this.loadingIndicator = loadingDiv;
            this.chatWindow.appendChild(loadingDiv);

            try {
                const response = await sendPromise;

                if (this.chatWindow.contains(loadingDiv)) {
                    this.chatWindow.removeChild(loadingDiv);
                }
                this.loadingIndicator = null;

                await this.processUnifiedResponse(response, null);

                if (this.minimizeTokens) {
                    this.renderChatHistory();
                }
            } catch (error) {
                if (this.chatWindow.contains(loadingDiv)) {
                    this.chatWindow.removeChild(loadingDiv);
                }
                this.loadingIndicator = null;
                this.addSystemMessage(`Error continuing tools: ${error.message}`);
                console.error('Error continuing tool processing:', error);
            }
        };

        buttonContainer.appendChild(continueBtn);
        return buttonContainer;
    }

    renderPendingContinueButton() {
        if (!this.pendingContinueButton) {
            return;
        }

        const { iterationsUsed, maxIterations } = this.pendingContinueButton;
        const buttonContainer = this.buildContinueToolsButton(iterationsUsed, maxIterations);
        this.currentContinueButton = buttonContainer;
        this.chatWindow.appendChild(buttonContainer);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    // Show a button to continue tool processing
    showContinueToolsButton(iterationsUsed, maxIterations) {
        this.pendingContinueButton = { iterationsUsed, maxIterations };
        const buttonContainer = this.buildContinueToolsButton(iterationsUsed, maxIterations);
        this.currentContinueButton = buttonContainer;
        this.chatWindow.appendChild(buttonContainer);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    // Legacy method - kept for compatibility but now uses unified system
    async callLegacyProvider(messages) {
        const model = this.modelSelect.value;

        const tools = [
            {
                name: "list_files",
                description: "List all files in the virtual file system as a tree structure",
                input_schema: {
                    type: "object",
                    properties: {},
                    required: []
                }
            },
            {
                name: "read_file",
                description: "Read the contents of a file from the virtual file system",
                input_schema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "The path to the file to read (e.g., '/folder/file.txt')"
                        }
                    },
                    required: ["path"]
                }
            }
        ];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 4096,
                messages: messages,
                tools: tools
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${error}`);
        }

        return await response.json();
    }

    async processLegacyResponse(response) {
        // Update token usage if available
        if (response.usage) {
            const inputTokens = response.usage.input_tokens || 0;
            const outputTokens = response.usage.output_tokens || 0;
            this.totalTokens += inputTokens + outputTokens;

            // Update current context usage (this represents the current conversation size)
            this.currentContextTokens = inputTokens + outputTokens;

            this.updateTokenDisplay();
        }

        let assistantMessage = '';
        let toolCalls = [];

        for (let content of response.content) {
            if (content.type === 'text') {
                assistantMessage += content.text;
            } else if (content.type === 'tool_use') {
                toolCalls.push(content);
            }
        }

        // Display assistant's text response
        if (assistantMessage) {
            this.addMessage(assistantMessage, 'assistant');
            this.messages.push({ role: 'assistant', content: assistantMessage });
        }

        // Process tool calls
        if (toolCalls.length > 0) {
            const toolResults = [];

            for (let toolCall of toolCalls) {
                this.addToolUse(toolCall.name, toolCall.input);

                try {
                    let result;
                    if (toolCall.name === 'list_files') {
                        result = await this.tools.list_files();
                    } else if (toolCall.name === 'read_file') {
                        result = await this.tools.read_file(toolCall.input.path);
                    } else {
                        result = `Unknown tool: ${toolCall.name}`;
                    }

                    this.addToolResult(result);
                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: toolCall.id,
                        content: result
                    });
                } catch (error) {
                    const errorMessage = `Tool error: ${error.message}`;
                    this.addToolResult(errorMessage);
                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: toolCall.id,
                        content: errorMessage,
                        is_error: true
                    });
                }
            }

            // Add tool use and results to message history
            this.messages.push({
                role: 'assistant',
                content: response.content
            });

            this.messages.push({
                role: 'user',
                content: toolResults
            });

            // Get provider's response after tool use
            try {
                const followUpResponse = await this.callLegacyProvider(this.messages);
                await this.processLegacyResponse(followUpResponse);
            } catch (error) {
                this.addSystemMessage(`Error in follow-up: ${error.message}`);
            }
        }

        // Auto-save after processing response
        if (this.autoSave) {
            await this.autoSaveChatHistory();
        }
    }
} 
