class ProjectSettingsView {
    constructor(container) {
        this.container = container;
        this.settings = this.getDefaultSettings();
        this.formElements = {};
        
        this.init();
        this.loadProjectSettings();
    }
    
    applySettingsToPixiApp() {
        if (!window.pixiApp) return;
        
        const app = window.pixiApp;
        
        try {
            // Apply settings that can be changed at runtime
            // Background color
            if (this.settings.background) {
                const color = this.settings.background.replace('#', '0x');
                app.renderer.background.color = parseInt(color, 16);
            }
            
            // Background alpha
            if (this.settings.backgroundAlpha !== undefined) {
                app.renderer.background.alpha = this.settings.backgroundAlpha;
            }
            
            // Resolution - this is typically set at initialization
            if (this.settings.autoDensity) {
                // autoDensity makes PIXI use devicePixelRatio automatically
                console.log('[ProjectSettingsView] Note: Auto Density is enabled, using devicePixelRatio');
            } else if (this.settings.resolution !== undefined && app.renderer.resolution !== this.settings.resolution) {
                console.log('[ProjectSettingsView] Note: Resolution changes may require app restart to fully take effect');
            }
            
            // Clear before render
            if (this.settings.clearBeforeRender !== undefined) {
                app.renderer.clearBeforeRender = this.settings.clearBeforeRender;
            }
            
            // Properties that require app restart to change
            const restartRequiredProps = ['antialias', 'roundPixels', 'autoDensity', 'premultipliedAlpha', 'preserveDrawingBuffer'];
            const changedRestartProps = restartRequiredProps.filter(prop => 
                this.settings[prop] !== undefined && 
                app.renderer[prop] !== undefined &&
                app.renderer[prop] !== this.settings[prop]
            );
            
            if (changedRestartProps.length > 0) {
                console.log('[ProjectSettingsView] Note: The following settings require app restart to take effect:', changedRestartProps.join(', '));
            }
            
            console.log('[ProjectSettingsView] Applied runtime-changeable settings to PIXI app');
        } catch (error) {
            console.error('[ProjectSettingsView] Error applying settings to PIXI app:', error);
        }
    }
    
    getDefaultSettings() {
        return {
            antialias: false,
            autoDensity: false,
            autoStart: true,
            background: '#000000',
            backgroundAlpha: 1,
            clearBeforeRender: true,
            eventMode: 'passive',
            failIfMajorPerformanceCaveat: false,
            forceFallbackAdapter: false,
            height: 600,
            powerPreference: 'default',
            preference: 'webgl',
            preferWebGLVersion: 2,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            renderableGCActive: true,
            renderableGCFrequency: 600,
            renderableGCMaxUnusedTime: 3600,
            resolution: 1,
            resizeTo: '',
            roundPixels: false,
            sharedTicker: false,
            textureGCActive: true,
            textureGCAMaxIdle: 3600,
            textureGCCheckCountMax: 600,
            textureGCMaxIdle: 3600,
            useBackBuffer: false,
            width: 800,
            // Engine-specific settings
            startupScene: '',
            editorScene: ''
        };
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.overflow = 'auto';
        this.container.style.padding = '20px';
        this.container.style.boxSizing = 'border-box';
        
        const wrapper = document.createElement('div');
        wrapper.style.maxWidth = '800px';
        wrapper.style.margin = '0 auto';
        
        const title = document.createElement('h2');
        title.textContent = 'Project Settings';
        title.style.marginBottom = '20px';
        title.style.color = 'var(--text-primary)';
        wrapper.appendChild(title);
        
        const form = document.createElement('div');
        form.className = 'project-settings-form';
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '15px';
        
        // Rendering Settings Section
        this.addSection(form, 'Rendering', [
            { name: 'antialias', label: 'Antialias', type: 'checkbox' },
            { name: 'autoDensity', label: 'Auto Density', type: 'checkbox' },
            { name: 'autoStart', label: 'Auto Start', type: 'checkbox' },
            { name: 'clearBeforeRender', label: 'Clear Before Render', type: 'checkbox' },
            { name: 'roundPixels', label: 'Round Pixels', type: 'checkbox' },
            { name: 'preserveDrawingBuffer', label: 'Preserve Drawing Buffer', type: 'checkbox' },
            { name: 'premultipliedAlpha', label: 'Premultiplied Alpha', type: 'checkbox' },
            { name: 'useBackBuffer', label: 'Use Back Buffer', type: 'checkbox' }
        ]);
        
        // Canvas Settings Section
        this.addSection(form, 'Canvas', [
            { name: 'width', label: 'Default Width', type: 'number', min: 100, max: 4096 },
            { name: 'height', label: 'Default Height', type: 'number', min: 100, max: 4096 },
            { name: 'resizeTo', label: 'Resize To', type: 'select', options: ['', 'window', 'parent'], placeholder: 'None' },
            { name: 'background', label: 'Background Color', type: 'color' },
            { name: 'backgroundAlpha', label: 'Background Alpha', type: 'range', min: 0, max: 1, step: 0.1 },
            { name: 'resolution', label: 'Resolution', type: 'number', min: 0.5, max: 3, step: 0.5 },
            { name: 'autoDensity', label: 'Auto Density (use devicePixelRatio)', type: 'checkbox' }
        ]);
        
        // Engine Settings Section
        this.addSection(form, 'Engine', [
            { name: 'startupScene', label: 'Startup Scene', type: 'scenepath', placeholder: 'Path to .scn.json file' },
            { name: 'editorScene', label: 'Editor Scene', type: 'scenepath', placeholder: 'Path to .scn.json file' },
            { name: 'eventMode', label: 'Event Mode', type: 'select', options: ['none', 'passive', 'auto', 'static', 'dynamic'] }
        ]);
        
        // WebGL/WebGPU Settings Section
        this.addSection(form, 'Graphics API', [
            { name: 'preference', label: 'Preference', type: 'select', options: ['webgl', 'webgpu'] },
            { name: 'preferWebGLVersion', label: 'Prefer WebGL Version', type: 'select', options: [1, 2] },
            { name: 'powerPreference', label: 'Power Preference', type: 'select', options: ['default', 'low-power', 'high-performance'] },
            { name: 'failIfMajorPerformanceCaveat', label: 'Fail If Major Performance Caveat', type: 'checkbox' },
            { name: 'forceFallbackAdapter', label: 'Force Fallback Adapter', type: 'checkbox' }
        ]);
        
        // Performance Settings Section
        this.addSection(form, 'Performance', [
            { name: 'sharedTicker', label: 'Shared Ticker', type: 'checkbox' },
            { name: 'renderableGCActive', label: 'Renderable GC Active', type: 'checkbox' },
            { name: 'renderableGCFrequency', label: 'Renderable GC Frequency (ms)', type: 'number', min: 1000, max: 120000 },
            { name: 'renderableGCMaxUnusedTime', label: 'Renderable GC Max Unused Time (ms)', type: 'number', min: 1000, max: 120000 },
            { name: 'textureGCActive', label: 'Texture GC Active', type: 'checkbox' },
            { name: 'textureGCAMaxIdle', label: 'Texture GC Max Idle', type: 'number', min: 60, max: 7200 },
            { name: 'textureGCCheckCountMax', label: 'Texture GC Check Count Max', type: 'number', min: 60, max: 1200 },
            { name: 'textureGCMaxIdle', label: 'Texture GC Max Idle', type: 'number', min: 60, max: 7200 }
        ]);
        
        wrapper.appendChild(form);
        
        // Save button
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '30px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.alignItems = 'center';
        
        // Success message (hidden by default)
        const successMessage = document.createElement('span');
        successMessage.textContent = 'Saved as project.json';
        successMessage.style.color = '#4caf50';
        successMessage.style.fontSize = '14px';
        successMessage.style.visibility = 'hidden';
        this.successMessage = successMessage;
        
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.gap = '10px';
        buttonsWrapper.style.marginLeft = 'auto';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'btn-primary';
        saveButton.style.padding = '8px 20px';
        saveButton.style.backgroundColor = 'var(--accent)';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '4px';
        saveButton.style.cursor = 'pointer';
        saveButton.style.fontSize = '14px';
        saveButton.addEventListener('click', () => this.saveProjectSettings());
        
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset to Defaults';
        resetButton.className = 'btn-secondary';
        resetButton.style.padding = '8px 20px';
        resetButton.style.backgroundColor = 'var(--bg-secondary)';
        resetButton.style.color = 'var(--text-primary)';
        resetButton.style.border = '1px solid var(--border)';
        resetButton.style.borderRadius = '4px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.fontSize = '14px';
        resetButton.addEventListener('click', async () => await this.resetToDefaults());
        
        buttonContainer.appendChild(successMessage);
        buttonsWrapper.appendChild(resetButton);
        buttonsWrapper.appendChild(saveButton);
        buttonContainer.appendChild(buttonsWrapper);
        wrapper.appendChild(buttonContainer);
        
        this.container.appendChild(wrapper);
    }
    
    addSection(parent, title, fields) {
        const section = document.createElement('div');
        section.className = 'settings-section';
        section.style.marginBottom = '25px';
        
        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        sectionTitle.style.marginBottom = '15px';
        sectionTitle.style.color = 'var(--text-primary)';
        sectionTitle.style.fontSize = '16px';
        sectionTitle.style.borderBottom = '1px solid var(--border)';
        sectionTitle.style.paddingBottom = '5px';
        section.appendChild(sectionTitle);
        
        const fieldsContainer = document.createElement('div');
        fieldsContainer.style.display = 'flex';
        fieldsContainer.style.flexDirection = 'column';
        fieldsContainer.style.gap = '10px';
        
        fields.forEach(field => {
            const fieldWrapper = this.createField(field);
            fieldsContainer.appendChild(fieldWrapper);
        });
        
        section.appendChild(fieldsContainer);
        parent.appendChild(section);
    }
    
    createField(field) {
        const wrapper = document.createElement('div');
        wrapper.className = 'field-wrapper';
        wrapper.style.display = 'grid';
        wrapper.style.gridTemplateColumns = '250px 1fr';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '15px';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        label.style.color = 'var(--text-secondary)';
        label.style.fontSize = '14px';
        label.setAttribute('for', `field-${field.name}`);
        
        let input;
        
        switch (field.type) {
            case 'checkbox':
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.style.display = 'flex';
                checkboxWrapper.style.alignItems = 'center';
                
                input = document.createElement('input');
                input.type = 'checkbox';
                input.id = `field-${field.name}`;
                input.checked = this.settings[field.name];
                input.style.margin = '0';
                input.addEventListener('change', (e) => {
                    this.settings[field.name] = e.target.checked;
                    
                    // Special handling for autoDensity checkbox
                    if (field.name === 'autoDensity') {
                        this.updateResolutionFieldState(e.target.checked);
                    }
                });
                
                checkboxWrapper.appendChild(input);
                input = checkboxWrapper;
                break;
                
            case 'color':
                input = document.createElement('input');
                input.type = 'color';
                input.id = `field-${field.name}`;
                input.value = this.settings[field.name];
                input.style.width = '50px';
                input.style.height = '30px';
                input.style.border = '1px solid var(--border)';
                input.style.borderRadius = '4px';
                input.style.cursor = 'pointer';
                input.addEventListener('change', (e) => {
                    this.settings[field.name] = e.target.value;
                });
                break;
                
            case 'range':
                const rangeWrapper = document.createElement('div');
                rangeWrapper.style.display = 'flex';
                rangeWrapper.style.alignItems = 'center';
                rangeWrapper.style.gap = '10px';
                
                input = document.createElement('input');
                input.type = 'range';
                input.id = `field-${field.name}`;
                input.min = field.min || 0;
                input.max = field.max || 1;
                input.step = field.step || 0.1;
                input.value = this.settings[field.name];
                input.style.flex = '1';
                
                const valueDisplay = document.createElement('span');
                valueDisplay.textContent = this.settings[field.name];
                valueDisplay.style.minWidth = '40px';
                valueDisplay.style.textAlign = 'right';
                valueDisplay.style.color = 'var(--text-secondary)';
                valueDisplay.style.fontSize = '14px';
                
                input.addEventListener('input', (e) => {
                    this.settings[field.name] = parseFloat(e.target.value);
                    valueDisplay.textContent = e.target.value;
                });
                
                rangeWrapper.appendChild(input);
                rangeWrapper.appendChild(valueDisplay);
                input = rangeWrapper;
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.id = `field-${field.name}`;
                input.min = field.min;
                input.max = field.max;
                input.step = field.step || 1;
                input.value = this.settings[field.name];
                input.style.width = '100px';
                input.style.padding = '4px 8px';
                input.style.border = '1px solid var(--border)';
                input.style.borderRadius = '4px';
                input.style.backgroundColor = 'var(--bg-secondary)';
                input.style.color = 'var(--text-primary)';
                input.addEventListener('change', (e) => {
                    // Don't update resolution if autoDensity is enabled
                    if (field.name === 'resolution' && this.settings.autoDensity) {
                        e.target.value = window.devicePixelRatio || 1;
                        return;
                    }
                    this.settings[field.name] = parseFloat(e.target.value);
                });
                break;
                
            case 'select':
                input = document.createElement('select');
                input.id = `field-${field.name}`;
                input.style.padding = '4px 8px';
                input.style.border = '1px solid var(--border)';
                input.style.borderRadius = '4px';
                input.style.backgroundColor = 'var(--bg-secondary)';
                input.style.color = 'var(--text-primary)';
                input.style.cursor = 'pointer';
                
                field.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    // Special handling for empty value (None option)
                    optionElement.textContent = option === '' ? 'None' : option;
                    if (this.settings[field.name] === option || 
                        this.settings[field.name] == option) {
                        optionElement.selected = true;
                    }
                    input.appendChild(optionElement);
                });
                
                input.addEventListener('change', (e) => {
                    const value = e.target.value;
                    // Try to parse as number if it looks like one
                    if (!isNaN(value) && value !== '') {
                        this.settings[field.name] = parseFloat(value);
                    } else {
                        this.settings[field.name] = value;
                    }
                });
                break;
                
            case 'scenepath':
                input = document.createElement('input');
                input.type = 'text';
                input.id = `field-${field.name}`;
                input.value = this.settings[field.name] || '';
                input.placeholder = field.placeholder || '';
                input.style.width = '100%';
                input.style.padding = '4px 8px';
                input.style.border = '1px solid var(--border)';
                input.style.borderRadius = '4px';
                input.style.backgroundColor = 'var(--bg-secondary)';
                input.style.color = 'var(--text-primary)';
                
                // Handle text input
                input.addEventListener('change', (e) => {
                    this.settings[field.name] = e.target.value;
                });
                
                // Simple drag and drop handling
                input.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    input.style.borderColor = 'var(--accent)';
                    input.style.borderWidth = '2px';
                });
                
                input.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    input.style.borderColor = 'var(--border)';
                    input.style.borderWidth = '1px';
                });
                
                input.addEventListener('drop', (e) => {
                    e.preventDefault();
                    console.log('[ProjectSettingsView] Drop event!');
                    
                    input.style.borderColor = 'var(--border)';
                    input.style.borderWidth = '1px';
                    
                    const dragData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
                    console.log('[ProjectSettingsView] Drag data:', dragData);
                    
                    if (dragData) {
                        try {
                            const data = JSON.parse(dragData);
                            if (data.path && data.path.endsWith('.scn.json')) {
                                input.value = data.path;
                                this.settings[field.name] = data.path;
                            }
                        } catch (err) {
                            console.log('[ProjectSettingsView] Parse error:', err);
                        }
                    }
                });
                break;
        }
        
        this.formElements[field.name] = input;
        
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        
        return wrapper;
    }
    
    async loadProjectSettings() {
        if (!window.fileTreeInstance || !window.fileTreeInstance.fs) {
            console.log('[ProjectSettingsView] FileTree not initialized yet');
            return;
        }
        
        try {
            const fs = window.fileTreeInstance.fs;
            const projectPath = '/project.json';
            
            try {
                const data = await fs.promises.readFile(projectPath, 'utf8');
                let loadedSettings;
                
                try {
                    loadedSettings = JSON.parse(data);
                } catch (parseErr) {
                    console.error('[ProjectSettingsView] Failed to parse project.json, using defaults:', parseErr);
                    this.settings = this.getDefaultSettings();
                    this.updateFormValues();
                    return;
                }
                
                // Validate that loadedSettings is an object
                if (typeof loadedSettings !== 'object' || loadedSettings === null) {
                    console.error('[ProjectSettingsView] Invalid project.json format, using defaults');
                    this.settings = this.getDefaultSettings();
                    this.updateFormValues();
                    return;
                }
                
                // Merge loaded settings with defaults
                this.settings = { ...this.getDefaultSettings(), ...loadedSettings };
                
                // Update UI
                this.updateFormValues();
                
                // Apply loaded settings to PIXI app
                this.applySettingsToPixiApp();
                
                console.log('[ProjectSettingsView] Loaded project settings from', projectPath);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log('[ProjectSettingsView] No project.json found, using defaults');
                } else {
                    console.error('[ProjectSettingsView] Error reading project.json:', err);
                    this.settings = this.getDefaultSettings();
                    this.updateFormValues();
                }
            }
        } catch (error) {
            console.error('[ProjectSettingsView] Error loading project settings:', error);
        }
    }
    
    updateFormValues() {
        Object.keys(this.formElements).forEach(key => {
            const element = this.formElements[key];
            const value = this.settings[key];
            
            if (!element) return;
            
            // Check if it's a checkbox (might be wrapped in a div)
            const checkboxInput = element.type === 'checkbox' ? element : element.querySelector ? element.querySelector('input[type="checkbox"]') : null;
            if (checkboxInput) {
                checkboxInput.checked = value;
            } else if (element.type === 'range') {
                // For range inputs wrapped in a div
                const rangeInput = element.querySelector ? element.querySelector('input') : element;
                rangeInput.value = value;
                const valueDisplay = element.querySelector ? element.querySelector('span') : null;
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
            } else if (element.type === 'text' || element.type === 'number' || element.tagName === 'SELECT') {
                element.value = value || '';
            } else {
                element.value = value;
            }
        });
        
        // Update resolution field state based on autoDensity setting
        if (this.settings.autoDensity !== undefined) {
            this.updateResolutionFieldState(this.settings.autoDensity);
        }
    }
    
    async saveProjectSettings() {
        if (!window.fileTreeInstance || !window.fileTreeInstance.fs) {
            console.error('[ProjectSettingsView] FileTree not initialized');
            return;
        }
        
        try {
            const fs = window.fileTreeInstance.fs;
            const projectPath = '/project.json';
            
            // Root directory should already exist
            
            // Validate scene paths before saving
            if (this.settings.startupScene) {
                try {
                    await fs.promises.stat(this.settings.startupScene);
                } catch (err) {
                    console.log('[ProjectSettingsView] Startup scene not found, clearing path');
                    this.settings.startupScene = '';
                }
            }
            
            if (this.settings.editorScene) {
                try {
                    await fs.promises.stat(this.settings.editorScene);
                } catch (err) {
                    console.log('[ProjectSettingsView] Editor scene not found, clearing path');
                    this.settings.editorScene = '';
                }
            }
            
            // Save settings to file
            const settingsJson = JSON.stringify(this.settings, null, 2);
            await fs.promises.writeFile(projectPath, settingsJson);
            
            console.log('[ProjectSettingsView] Saved project settings to', projectPath);
            
            // Apply settings to PIXI app after saving
            this.applySettingsToPixiApp();
            
            // Refresh file tree AFTER file is saved
            if (window.fileTreeInstance && window.fileTreeInstance._loadFileTree) {
                console.log('[ProjectSettingsView] Refreshing file tree...');
                await window.fileTreeInstance._loadFileTree();
                console.log('[ProjectSettingsView] File tree refreshed');
            }
            
            // Show success message inline after everything is done
            this.showSuccessMessage();
        } catch (error) {
            console.error('[ProjectSettingsView] Error saving project settings:', error);
            // Show error modal
            if (typeof Modal !== 'undefined') {
                new Modal(
                    'Error Saving Project Settings',
                    `Failed to save project settings: ${error.message}`,
                    [
                        {
                            text: 'OK',
                            className: 'btn-primary',
                            onClick: () => {}
                        }
                    ]
                );
            }
        }
    }
    
    async resetToDefaults() {
        this.settings = this.getDefaultSettings();
        this.updateFormValues();
        // Apply default settings to PIXI app
        this.applySettingsToPixiApp();
        // Save the reset settings
        await this.saveProjectSettings();
    }
    
    showSuccessMessage() {
        if (this.successMessage) {
            this.successMessage.style.visibility = 'visible';
            // Hide after 3 seconds
            setTimeout(() => {
                if (this.successMessage) {
                    this.successMessage.style.visibility = 'hidden';
                }
            }, 3000);
        }
    }
    
    updateResolutionFieldState(autoDensity) {
        const resolutionField = this.formElements['resolution'];
        if (!resolutionField) return;
        
        // Handle case where resolution field might be a number input
        const input = resolutionField.tagName === 'INPUT' ? resolutionField : resolutionField.querySelector('input');
        if (!input) return;
        
        if (autoDensity) {
            input.disabled = true;
            input.style.opacity = '0.5';
            input.style.cursor = 'not-allowed';
            // Show devicePixelRatio when autoDensity is enabled
            input.value = window.devicePixelRatio || 1;
        } else {
            input.disabled = false;
            input.style.opacity = '1';
            input.style.cursor = 'text';
            // Restore the saved resolution value
            input.value = this.settings.resolution || 1;
        }
    }
}