// Tab Manager
class TabManager {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
        this.tabs = [];
        this.activeTab = 'chat';
        this.tabBar = document.getElementById('tabBar');
        this.tabContent = document.getElementById('tabContent');
        this.editor = null;
        this.sessions = new Map();
        this.dirtyFiles = new Set();

        // Add event listener for chat tab
        document.querySelector('.chat-tab').addEventListener('click', () => {
            this.activateTab('chat');
        });

        // Initialize single editor instance
        this.initEditor();
    }

    initEditor() {
        // Create single editor container (initially hidden)
        const editorPane = document.createElement('div');
        editorPane.className = 'tab-pane editor-pane';
        editorPane.id = 'editor-pane';
        editorPane.innerHTML = `
            <div class="editor-toolbar">
                <div class="toolbar-left">
                    <button class="toolbar-btn save-btn" id="saveBtn" disabled>
                        <span>💾</span> Save
                    </button>
                    <button class="toolbar-btn" id="undoBtn" disabled>
                        <span>↶</span> Undo
                    </button>
                    <button class="toolbar-btn" id="redoBtn" disabled>
                        <span>↷</span> Redo
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="toolbar-btn" id="renameBtn">
                        <span>✏️</span> Rename
                    </button>
                    <button class="toolbar-btn" id="deleteBtn">
                        <span>🗑️</span> Delete
                    </button>
                    <button class="toolbar-btn" id="downloadBtn">
                        <span>⬇️</span> Download
                    </button>
                </div>
            </div>
            <div class="editor-container">
                <div id="ace-editor" class="ace-editor"></div>
            </div>
        `;
        this.tabContent.appendChild(editorPane);

        // Set up toolbar buttons
        document.getElementById('saveBtn').addEventListener('click', () => {
            if (this.activeTab !== 'chat') {
                this.saveFile(this.activeTab);
            }
        });

        document.getElementById('undoBtn').addEventListener('click', () => {
            if (this.editor && this.editor.session) {
                this.editor.undo();
                this.updateToolbarState();
            }
        });

        document.getElementById('redoBtn').addEventListener('click', () => {
            if (this.editor && this.editor.session) {
                this.editor.redo();
                this.updateToolbarState();
            }
        });

        // File operation buttons
        document.getElementById('renameBtn').addEventListener('click', async () => {
            if (this.activeTab !== 'chat') {
                const tab = this.tabs.find(t => t.id === this.activeTab);
                if (tab) {
                    await this.renameFile(tab);
                }
            }
        });

        document.getElementById('deleteBtn').addEventListener('click', async () => {
            if (this.activeTab !== 'chat') {
                const tab = this.tabs.find(t => t.id === this.activeTab);
                if (tab) {
                    await this.deleteFile(tab);
                }
            }
        });

        document.getElementById('downloadBtn').addEventListener('click', async () => {
            if (this.activeTab !== 'chat') {
                const tab = this.tabs.find(t => t.id === this.activeTab);
                if (tab) {
                    await this.downloadFile(tab);
                }
            }
        });

        // Initialize Ace editor once
        this.editor = ace.edit('ace-editor');
        // Use tomorrow_night theme - darker and matches our color scheme better
        this.editor.setTheme('ace/theme/tomorrow_night');
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14); // Increase font size from default 12px to 14px

        // Additional editor options for better readability
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false,
            showLineNumbers: true,
            showGutter: true,
            highlightActiveLine: true,
            highlightSelectedWord: true
        });

        // Listen for changes to track dirty state and update toolbar
        this.editor.on('change', () => {
            if (this.activeTab !== 'chat') {
                const tab = this.tabs.find(t => t.id === this.activeTab);
                if (tab && !this.dirtyFiles.has(tab.id)) {
                    this.markDirty(tab.id);
                }
                this.updateToolbarState();
            }
        });

        // Update toolbar state when selection changes
        this.editor.selection.on('changeSelection', () => {
            this.updateToolbarState();
        });

        // Add keyboard shortcuts
        this.editor.commands.addCommand({
            name: 'save',
            bindKey: {win: 'Ctrl-S', mac: 'Cmd-S'},
            exec: () => {
                if (this.activeTab !== 'chat' && this.dirtyFiles.has(this.activeTab)) {
                    this.saveFile(this.activeTab);
                }
            }
        });

        // Update toolbar state after undo/redo keyboard shortcuts
        this.editor.commands.on('afterExec', (e) => {
            if (e.command.name === 'undo' || e.command.name === 'redo') {
                this.updateToolbarState();
            }
        });
    }

    isTextFile(path) {
        const textExtensions = ['.js', '.html', '.css', '.txt', '.md', '.json', '.xml', '.sh'];
        const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
        return textExtensions.includes(ext);
    }

    async openFile(path) {
        // Check if tab already exists
        const existingTab = this.tabs.find(t => t.path === path);
        if (existingTab) {
            this.activateTab(existingTab.id);
            return;
        }

        // Get file content
        const file = await this.fileSystem.getFile(path);
        if (!file || file.type !== 'file') return;

        const tabId = 'tab-' + Date.now();
        const fileName = path.split('/').pop();

        // Create tab
        const tab = {
            id: tabId,
            path: path,
            name: fileName,
            content: file.content || ''
        };
        this.tabs.push(tab);

        // Show tab bar if first file tab
        if (this.tabs.length === 1) {
            this.tabBar.style.display = 'flex';
        }

        // Create tab element
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.dataset.tab = tabId;

        // Create label wrapper for text content
        const tabLabel = document.createElement('span');
        tabLabel.className = 'tab-label';

        const tabName = document.createElement('span');
        tabName.className = 'tab-name';
        tabName.textContent = fileName;

        const dirtyIndicator = document.createElement('span');
        dirtyIndicator.className = 'dirty-indicator';
        dirtyIndicator.textContent = '';

        // Add name and dirty indicator to label
        tabLabel.appendChild(tabName);
        tabLabel.appendChild(dirtyIndicator);

        const closeBtn = document.createElement('span');
        closeBtn.className = 'tab-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = async (e) => {
            e.stopPropagation();
            await this.closeTab(tabId);
        };

        tabElement.appendChild(tabLabel);
        tabElement.appendChild(closeBtn);

        tabElement.onclick = (e) => {
            if (!e.target.classList.contains('tab-close')) {
                this.activateTab(tabId);
            }
        };

        // Add middle-click to close tab
        tabElement.onmousedown = async (e) => {
            if (e.button === 1) { // Middle mouse button
                e.preventDefault(); // Prevent default middle-click behavior (like auto-scroll)
                await this.closeTab(tabId);
            }
        };

        this.tabBar.appendChild(tabElement);

        // Create ACE session for this file
        const session = ace.createEditSession(file.content || '');

        // Set mode based on file extension
        const ext = path.substring(path.lastIndexOf('.') + 1);
        const modeMap = {
            'js': 'javascript',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown',
            'sh': 'sh',
            'txt': 'text'
        };
        const mode = modeMap[ext] || 'text';
        session.setMode(`ace/mode/${mode}`);

        // Store session
        this.sessions.set(tabId, session);

        // Just mark dirty on change, no auto-save
        session.on('change', () => {
            if (!this.dirtyFiles.has(tabId)) {
                this.markDirty(tabId);
            }
        });

        this.activateTab(tabId);
    }

    activateTab(tabId) {
        // Update active states
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        if (tabId === 'chat') {
            document.querySelector('.chat-tab').classList.add('active');
            document.getElementById('chat-pane').classList.add('active');
            document.getElementById('editor-pane').classList.remove('active');
        } else {
            const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
            if (tabElement) tabElement.classList.add('active');

            // Show editor pane and swap session
            document.getElementById('chat-pane').classList.remove('active');
            document.getElementById('editor-pane').classList.add('active');

            // Set the session for this tab
            const session = this.sessions.get(tabId);
            if (session && this.editor) {
                this.editor.setSession(session);
                setTimeout(() => {
                    this.editor.resize();
                    this.updateToolbarState();
                }, 0);
            }
        }

        this.activeTab = tabId;
    }

    updateToolbarState() {
        const saveBtn = document.getElementById('saveBtn');
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (!this.editor || this.activeTab === 'chat') {
            saveBtn.disabled = true;
            undoBtn.disabled = true;
            redoBtn.disabled = true;
            return;
        }

        // Update save button
        saveBtn.disabled = !this.dirtyFiles.has(this.activeTab);

        // Update undo/redo buttons
        const undoManager = this.editor.session.getUndoManager();
        undoBtn.disabled = !undoManager.hasUndo();
        redoBtn.disabled = !undoManager.hasRedo();
    }

    async closeTab(tabId, skipPrompt = false) {
        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        const tab = this.tabs[index];

        // Check if the file has unsaved changes and we're not skipping the prompt
        if (!skipPrompt && this.dirtyFiles.has(tabId)) {
            // Show custom save dialog
            const result = await this.showSaveDialog(tab.name);

            if (result === 'save') {
                // User chose to save - wait for save to complete
                await this.saveFile(tabId);
            } else if (result === 'cancel') {
                // User cancelled - don't close the tab
                return;
            }
            // If result is 'discard', proceed with closing without saving
        }

        // Remove from arrays
        this.tabs.splice(index, 1);
        this.sessions.delete(tabId);
        this.dirtyFiles.delete(tabId);

        // Remove DOM elements
        const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
        if (tabElement) tabElement.remove();

        // Hide tab bar and editor if no file tabs
        if (this.tabs.length === 0) {
            this.tabBar.style.display = 'none';
            // Make sure to hide editor and show chat
            document.getElementById('editor-pane').classList.remove('active');
            document.getElementById('chat-pane').classList.add('active');
            this.activateTab('chat');
        } else if (this.activeTab === tabId) {
            // Activate another tab
            const lastTab = this.tabs[this.tabs.length - 1];
            this.activateTab(lastTab.id);
        }
    }

    markDirty(tabId) {
        this.dirtyFiles.add(tabId);
        const tabElement = document.querySelector(`[data-tab="${tabId}"] .dirty-indicator`);
        if (tabElement) {
            tabElement.textContent = ' •';
        }
        if (tabId === this.activeTab) {
            this.updateToolbarState();
        }
    }

    markClean(tabId) {
        this.dirtyFiles.delete(tabId);
        const tabElement = document.querySelector(`[data-tab="${tabId}"] .dirty-indicator`);
        if (tabElement) {
            tabElement.textContent = '';
        }
        if (tabId === this.activeTab) {
            this.updateToolbarState();
        }
    }

    async saveFile(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        const session = this.sessions.get(tabId);
        if (!session) return;

        const content = session.getValue();
        await this.fileSystem.saveFile(tab.path, content, 'file');
        this.markClean(tabId);
        console.log(`Saved ${tab.path}`);
    }

    // Update tab when file is renamed
    updateTabForRename(oldPath, newPath) {
        const tab = this.tabs.find(t => t.path === oldPath);
        if (tab) {
            // Update tab data
            tab.path = newPath;
            tab.name = newPath.split('/').pop();

            // Update tab label in DOM
            const tabElement = document.querySelector(`[data-tab="${tab.id}"] .tab-name`);
            if (tabElement) {
                tabElement.textContent = tab.name;
            }
        }
    }

    // Show save dialog for unsaved changes
    showSaveDialog(fileName) {
        return new Promise((resolve) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            // Create dialog
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 8px;
                padding: 20px;
                min-width: 400px;
                color: #e0e0e0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;

            dialog.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #fff;">Unsaved Changes</h3>
                <p style="margin: 0 0 20px 0;">"${fileName}" has unsaved changes. Do you want to save your changes?</p>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="saveBtn" style="padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
                    <button id="discardBtn" style="padding: 8px 16px; background: #4a4a4a; color: white; border: none; border-radius: 4px; cursor: pointer;">Don't Save</button>
                    <button id="cancelBtn" style="padding: 8px 16px; background: #4a4a4a; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // Handle button clicks
            const cleanup = () => document.body.removeChild(overlay);

            dialog.querySelector('#saveBtn').onclick = () => {
                cleanup();
                resolve('save');
            };

            dialog.querySelector('#discardBtn').onclick = () => {
                cleanup();
                resolve('discard');
            };

            dialog.querySelector('#cancelBtn').onclick = () => {
                cleanup();
                resolve('cancel');
            };

            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    resolve('cancel');
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Focus save button by default
            dialog.querySelector('#saveBtn').focus();
        });
    }

    // Close tabs for deleted files or folders
    async closeTabsForPath(path) {
        // Find all tabs that match the deleted path or are within a deleted folder
        const tabsToClose = this.tabs.filter(tab => {
            return tab.path === path || tab.path.startsWith(path + '/');
        });

        // Close each matching tab (force close without prompt since file is being deleted)
        for (const tab of tabsToClose) {
            await this.closeTab(tab.id, true); // Skip prompt for deleted files
        }
    }

    // Update tabs when files are moved
    updateTabsForMove(oldPath, newPath) {
        // Find all tabs that need to be updated (the moved file/folder and its children)
        const tabsToUpdate = this.tabs.filter(tab => {
            return tab.path === oldPath || tab.path.startsWith(oldPath + '/');
        });

        // Update each matching tab
        for (const tab of tabsToUpdate) {
            if (tab.path === oldPath) {
                // Direct match - update to new path
                tab.path = newPath;
                tab.name = newPath.split('/').pop();
            } else {
                // Child of moved folder - update path maintaining relative structure
                const relativePath = tab.path.substring(oldPath.length);
                tab.path = newPath + relativePath;
                // Name stays the same for children
            }

            // Update tab label in DOM
            const tabElement = document.querySelector(`[data-tab="${tab.id}"] .tab-name`);
            if (tabElement) {
                tabElement.textContent = tab.name;
            }
        }
    }

    // Rename file from editor
    async renameFile(tab) {
        const oldName = tab.name;
        const newName = prompt('Enter new file name:', oldName);

        if (newName && newName !== oldName) {
            const oldPath = tab.path;
            const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
            const newPath = parentPath + '/' + newName;

            // Get the current content from the editor
            const session = this.sessions.get(tab.id);
            const content = session ? session.getValue() : '';

            // Save with new path
            await this.fileSystem.saveFile(newPath, content, 'file');

            // Delete old file
            await this.fileSystem.deleteFile(oldPath);

            // Update tab data
            tab.path = newPath;
            tab.name = newName;

            // Update tab label in DOM
            const tabElement = document.querySelector(`[data-tab="${tab.id}"] .tab-name`);
            if (tabElement) {
                tabElement.textContent = newName;
            }

            // Refresh file tree
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }
        }
    }

    // Delete file from editor
    async deleteFile(tab) {
        const fileName = tab.name;

        if (confirm(`Delete "${fileName}"?`)) {
            // Delete the file
            await this.fileSystem.deleteFile(tab.path);

            // Close the tab
            this.closeTab(tab.id);

            // Refresh file tree
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }
        }
    }

    // Download file from editor
    async downloadFile(tab) {
        // Get the current content from the editor
        const session = this.sessions.get(tab.id);
        const content = session ? session.getValue() : '';

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tab.name;
        a.click();
        URL.revokeObjectURL(url);
    }
} 
