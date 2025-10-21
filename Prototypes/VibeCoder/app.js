// Initialize the application
async function initApp() {
    // Check if already initialized
    if (window.appInitialized) {
        return;
    }

    try {
        const fileSystem = new FileSystemManager();
        await fileSystem.init();

        const fileBrowser = new FileBrowserUI(fileSystem);
        await fileBrowser.refreshFileTree();

        const tools = new WorkbenchTools(fileSystem);
        const chat = new ChatClient(tools);
        const github = new GitHubIntegration(fileSystem, fileBrowser);
        const tabManager = new TabManager(fileSystem);

        // Make tools globally available for debugging
        window.workbenchTools = tools;
        window.fileSystem = fileSystem;
        window.fileBrowser = fileBrowser;
        window.chat = chat;
        window.github = github;
        window.tabManager = tabManager;
        window.appInitialized = true;

        // Initialize chat client properly (loads model config, then saved provider)
        await chat.initialize();

        // Now that fileSystem is available, load chat history
        await chat.autoLoadChatHistory();

        console.log('AI Workbench initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Fix the sendMessage function to be globally accessible
window.sendMessage = function() {
    const messageInput = document.getElementById('messageInput');
    if (window.chat) {
        window.chat.sendMessage();
    }
}

// Toggle API section
window.toggleApiSection = function() {
    const section = document.getElementById('apiSection');
    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        section.classList.add('expanded');
    } else {
        section.classList.remove('expanded');
        section.classList.add('collapsed');
    }
}

// Toggle File Browser section
window.toggleFileSection = function() {
    const section = document.getElementById('fileSection');
    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        section.classList.add('expanded');
    } else {
        section.classList.remove('expanded');
        section.classList.add('collapsed');
    }
}

function setupSectionToggles() {
    const apiToggle = document.getElementById('apiToggle');
    if (apiToggle) {
        apiToggle.addEventListener('click', window.toggleApiSection);
    }

    const fileToggle = document.getElementById('fileToggle');
    if (fileToggle) {
        fileToggle.addEventListener('click', window.toggleFileSection);
    }
}

// Update API status display
function updateApiStatus() {
    const providerSelect = document.getElementById('providerSelect');
    const currentProvider = providerSelect ? providerSelect.value : 'claude';

    // Check API key for current provider
    let apiKey = '';
    switch (currentProvider) {
        case 'claude':
            apiKey = localStorage.getItem('anthropic_api_key');
            break;
        case 'openai':
            apiKey = localStorage.getItem('openai_api_key');
            break;
        case 'gemini':
            apiKey = localStorage.getItem('gemini_api_key');
            break;
    }

    const indicator = document.getElementById('apiIndicator');
    const statusText = document.getElementById('apiStatusText');
    const modelDisplay = document.getElementById('modelDisplay');
    const modelSelect = document.getElementById('modelSelect');

    // Provider display names
    const providerNames = {
        'claude': 'Claude',
        'openai': 'OpenAI',
        'gemini': 'Gemini',
        'ollama': 'Ollama'
    };

    // Special handling for Ollama provider
    if (currentProvider === 'ollama') {
        const endpoint = localStorage.getItem('ollama_endpoint');
        // Check if we have models loaded (means we're connected)
        const hasModels = modelSelect && modelSelect.options.length > 0 &&
                         modelSelect.options[0].value !== '' &&
                         modelSelect.options[0].text !== 'Loading models...' &&
                         modelSelect.options[0].text !== 'Failed to load models' &&
                         modelSelect.options[0].text !== 'No models found';


        if (endpoint && (hasModels || window.chat?.aiManager?.providers['ollama'])) {
            // We have an endpoint and either models or a registered provider - we're connected
            indicator.classList.remove('connected'); // Remove first to ensure re-add triggers CSS
            void indicator.offsetWidth; // Force reflow
            indicator.classList.add('connected');

            // Extract host from endpoint for cleaner display
            try {
                const url = new URL(endpoint);
                statusText.textContent = `Ollama @ ${url.host}`;
            } catch {
                statusText.textContent = `Ollama @ ${endpoint}`;
            }

            // Show model if one is selected
            const selectedOption = modelSelect.options[modelSelect.selectedIndex];
            if (selectedOption && selectedOption.value) {
                // Show just the model name without the size for cleaner display
                let modelName = selectedOption.text;
                // Remove size info if present (e.g., " (16.7GB)")
                modelName = modelName.replace(/\s*\([^)]*GB\)$/, '');
                // Shorten long model names
                if (modelName.length > 50) {
                    modelName = '...' + modelName.slice(-47);
                }
                modelDisplay.textContent = modelName;
            } else {
                modelDisplay.textContent = hasModels ? 'Select model' : 'Loading...';
            }

        } else {
            indicator.classList.remove('connected');
            statusText.textContent = endpoint ? 'Ollama Connecting...' : 'Ollama Not Connected';
            modelDisplay.textContent = '';

        }
    } else {
        // Cloud providers use API keys
        if (apiKey) {
            indicator.classList.add('connected');
            statusText.textContent = `${providerNames[currentProvider]} Connected`;
            const selectedOption = modelSelect.options[modelSelect.selectedIndex];
            modelDisplay.textContent = selectedOption ? selectedOption.text : '';
        } else {
            indicator.classList.remove('connected');
            statusText.textContent = `${providerNames[currentProvider]} Not Connected`;
            modelDisplay.textContent = '';
        }
    }

}

// Initialize when DOM is ready
function initializeWorkbench() {
    setupSectionToggles();
    initApp();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWorkbench);
} else {
    initializeWorkbench();
}

