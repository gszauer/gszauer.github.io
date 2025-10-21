// File Browser UI Manager
class FileBrowserUI {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
        this.selectedItem = null;
        this.currentPath = '/';
        this.fileTree = document.getElementById('fileTree');
        this.fileBrowser = document.querySelector('.file-browser');
        this.contextMenu = document.getElementById('contextMenu');
        this.expandedFolders = new Set(['/']);
        this.contextTarget = null;
        this.draggedItem = null;
        this.draggedPath = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Drag and drop on entire file browser
        this.fileBrowser.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileBrowser.classList.add('dragover');
        });

        this.fileBrowser.addEventListener('dragleave', (e) => {
            // Only remove dragover if we're leaving the file browser entirely
            if (!e.relatedTarget || !this.fileBrowser.contains(e.relatedTarget)) {
                this.fileBrowser.classList.remove('dragover');
            }
        });

        this.fileBrowser.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileBrowser.classList.remove('dragover');

            // Check if this is an external file drop (not internal drag and drop)
            if (!this.draggedPath && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                await this.handleFileDrop(e.dataTransfer.items);
            }
        });

        // File upload via hidden input
        document.getElementById('fileInput').addEventListener('change', async (e) => {
            await this.handleFileUpload(e.target.files, this.currentPath);
            e.target.value = '';
        });

        // Context menu file upload
        document.getElementById('contextFileInput').addEventListener('change', async (e) => {
            const targetPath = this.contextTarget?.dataset.path || '/';
            if (e.target.webkitdirectory) {
                await this.handleFileUpload(e.target.files, targetPath);
            } else {
                await this.handleFileUpload(e.target.files, targetPath);
            }
            e.target.value = '';
        });

        // Zip import/export
        document.getElementById('importZipBtn').addEventListener('click', () => {
            document.getElementById('zipInput').click();
        });

        document.getElementById('zipInput').addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                await this.importZip(e.target.files[0]);
            }
        });

        document.getElementById('exportZipBtn').addEventListener('click', async () => {
            await this.exportZip();
        });


        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.file-tree') || e.target.closest('.file-browser')) {
                e.preventDefault();
                // Only show context menu if we're not clicking on an item that handles its own context menu
                if (!e.target.closest('.file-item') && !e.target.closest('.folder-item')) {
                    // Use the file tree container as root folder
                    this.contextTarget = this.fileTree;
                    this.showContextMenu(e);
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Context menu actions
        this.contextMenu.addEventListener('click', async (e) => {
            const action = e.target.dataset.action;
            if (action) {
                await this.handleContextMenuAction(action);
                this.hideContextMenu();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', async (e) => {
            if (this.selectedItem) {
                if (e.key === 'F2') {
                    e.preventDefault();
                    await this.renameItem(this.selectedItem);
                } else if (e.key === 'Delete') {
                    e.preventDefault();
                    await this.deleteItem(this.selectedItem);
                }
            }
        });
    }

    async handleFileDrop(items) {
        const entries = [];
        for (let item of items) {
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    entries.push(entry);
                }
            }
        }

        for (let entry of entries) {
            await this.processEntry(entry, '/');
        }

        await this.refreshFileTree();
        this.updateStatus(`Uploaded ${entries.length} item(s)`);
    }

    async processEntry(entry, parentPath) {
        const path = parentPath + entry.name;

        if (entry.isFile) {
            return new Promise((resolve) => {
                entry.file(async (file) => {
                    const content = await this.readFileContent(file);
                    await this.fileSystem.saveFile(path, content, 'file');
                    resolve();
                });
            });
        } else if (entry.isDirectory) {
            await this.fileSystem.saveFile(path, null, 'folder');
            const reader = entry.createReader();

            return new Promise((resolve) => {
                const readEntries = async () => {
                    reader.readEntries(async (entries) => {
                        if (entries.length > 0) {
                            for (let childEntry of entries) {
                                await this.processEntry(childEntry, path + '/');
                            }
                            readEntries();
                        } else {
                            resolve();
                        }
                    });
                };
                readEntries();
            });
        }
    }

    async handleFileUpload(files, targetPath = '/') {
        // Ensure target path ends with /
        if (!targetPath.endsWith('/')) {
            targetPath += '/';
        }

        console.log(`[DEBUG] Uploading ${files.length} files to ${targetPath}`);

        for (let file of files) {
            const content = await this.readFileContent(file);
            const filePath = targetPath + (file.webkitRelativePath || file.name);

            if (!content) {
                console.error(`[ERROR] Failed to read content for: ${file.name}`);
                continue;
            }

            console.log(`[DEBUG] Saving uploaded file: ${filePath} (content type: ${content.substring(0, 30)}...)`);

            // Create folders if uploading directory structure
            if (file.webkitRelativePath) {
                const parts = file.webkitRelativePath.split('/');
                let currentPath = targetPath;
                for (let i = 0; i < parts.length - 1; i++) {
                    currentPath += parts[i];
                    await this.fileSystem.saveFile(currentPath, null, 'folder');
                    currentPath += '/';
                }
            }

            await this.fileSystem.saveFile(filePath, content, 'file');
        }
        await this.refreshFileTree();
        this.updateStatus(`Uploaded ${files.length} file(s)`);
    }

    async readFileContent(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(`[DEBUG] Read file: ${file.name}, size: ${file.size} bytes`);
                resolve(e.target.result);
            };
            reader.onerror = (e) => {
                console.error(`[ERROR] Failed to read file: ${file.name}`, e);
                resolve(null);
            };

            // Always read as data URL for consistent binary handling
            reader.readAsDataURL(file);
        });
    }

    async importZip(file) {
        try {
            console.log('[DEBUG] Starting ZIP import...');
            const zip = new JSZip();
            const content = await zip.loadAsync(file);

            let importedCount = 0;
            let folderCount = 0;
            let chatHistoryImported = false;

            for (let [path, zipEntry] of Object.entries(content.files)) {
                console.log(`[DEBUG] Importing: ${path} (is directory: ${zipEntry.dir})`);

                if (!zipEntry.dir) {
                    try {
                        // Special handling for chat history file
                        if (path === '$chat_history.json') {
                            const chatContent = await zipEntry.async('string');
                            try {
                                const chatData = JSON.parse(chatContent);

                                // Import the chat history using ChatClient if available
                                if (window.chat) {
                                    // Clear existing chat
                                    window.chat.messages = [];
                                    window.chat.chatWindow.innerHTML = '';

                                    // Restore chat data
                                    window.chat.messages = chatData.messages || [];
                                    window.chat.totalTokens = chatData.totalTokens || 0;
                                    window.chat.currentContextTokens = chatData.currentContextTokens || 0;

                                    // Restore messages to AI Manager if it exists
                                    if (window.chat.aiManager && chatData.messages) {
                                        window.chat.aiManager.clearHistory();
                                        // Directly set the conversation history since we're now saving the full structure
                                        window.chat.aiManager.conversationHistory = [...chatData.messages];
                                        console.log('Restored full conversation history with tool calls to AI Manager');
                                    }

                                    // Replay messages in UI including tool results
                                    for (let msg of window.chat.messages) {
                                        if (msg.role === 'user') {
                                            // Check if this is a tool result message
                                            if (Array.isArray(msg.content) && msg.content[0]?.type === 'tool_result') {
                                                // Display tool results
                                                for (let result of msg.content) {
                                                    if (result.type === 'tool_result') {
                                                        window.chat.addToolResult(result.content);
                                                    }
                                                }
                                            } else if (typeof msg.content === 'string') {
                                                // Regular user message
                                                window.chat.addMessage(msg.content, 'user');
                                            }
                                        } else if (msg.role === 'assistant') {
                                            // Check if it's a tool use message
                                            if (Array.isArray(msg.content)) {
                                                for (let content of msg.content) {
                                                    if (content.type === 'text') {
                                                        const meta = content.metadata || msg.metadata || null;
                                                        window.chat.addMessage(content.text, 'assistant', meta);
                                                    } else if (content.type === 'tool_use') {
                                                        window.chat.addToolUse(content.name, content.input);
                                                    }
                                                }
                                            } else if (typeof msg.content === 'string') {
                                                window.chat.addMessage(msg.content, 'assistant', msg.metadata);
                                            }
                                        }
                                    }

                                    // Update displays
                                    window.chat.updateTokenDisplay();

                                    // Save to IndexedDB
                                    await window.chat.autoSaveChatHistory();

                                    chatHistoryImported = true;
                                    console.log('[DEBUG] Imported full chat history with tool calls');
                                }
                            } catch (err) {
                                console.error('[ERROR] Failed to parse chat history:', err);
                            }
                            continue; // Don't save chat history as a regular file
                        }

                        const fileName = path.toLowerCase();
                        const textExtensions = [
                            '.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.jsonc', '.md',
                            '.txt', '.xml', '.svg', '.yml', '.yaml', '.csv', '.ini', '.cfg', '.conf', '.env', '.py', '.rb',
                            '.java', '.cs', '.cpp', '.h', '.hpp', '.rs', '.go', '.sh', '.bat', '.sql', '.toml', '.lock'
                        ];

                        const isTextFile = textExtensions.some(ext => fileName.endsWith(ext));

                        if (isTextFile) {
                            const textContent = await zipEntry.async('string');
                            console.log(`[DEBUG] Saving text file: /${path} (length: ${textContent.length})`);
                            await this.fileSystem.saveFile('/' + path, textContent, 'file');
                        } else {
                            const base64 = await zipEntry.async('base64');

                            let mimeType = 'application/octet-stream';
                            if (fileName.endsWith('.png')) mimeType = 'image/png';
                            else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
                            else if (fileName.endsWith('.gif')) mimeType = 'image/gif';
                            else if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
                            else if (fileName.endsWith('.zip')) mimeType = 'application/zip';
                            else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
                            else if (fileName.endsWith('.ico')) mimeType = 'image/x-icon';

                            const fileContent = `data:${mimeType};base64,${base64}`;
                            console.log(`[DEBUG] Saving binary file: /${path} (mime: ${mimeType}, base64 length: ${base64.length})`);
                            await this.fileSystem.saveFile('/' + path, fileContent, 'file');
                        }
                        importedCount++;
                    } catch (err) {
                        console.error(`[ERROR] Failed to import file: ${path}`, err);
                    }
                } else {
                    const folderPath = '/' + path.slice(0, -1); // Remove trailing slash
                    console.log(`[DEBUG] Creating folder: ${folderPath}`);
                    await this.fileSystem.saveFile(folderPath, null, 'folder');
                    folderCount++;
                }
            }

            console.log(`[DEBUG] Import summary:`);
            console.log(`  - Files imported: ${importedCount}`);
            console.log(`  - Folders created: ${folderCount}`);
            console.log(`  - Chat history imported: ${chatHistoryImported}`);

            await this.refreshFileTree();
            let statusMessage = `Imported ${importedCount} files and ${folderCount} folders`;
            if (chatHistoryImported) {
                statusMessage += ' (including chat history)';
            }
            this.updateStatus(statusMessage);
            console.log('[DEBUG] Import completed successfully');
        } catch (error) {
            console.error('[ERROR] Import failed:', error);
            this.updateStatus('Error importing ZIP file');
        }
    }

    async exportZip() {
        try {
            console.log('[DEBUG] Starting export...');
            const zip = new JSZip();
            const files = await this.fileSystem.getAllFiles();

            console.log(`[DEBUG] Total files in database: ${files.length}`);

            let exportedCount = 0;
            let skippedCount = 0;
            let folderCount = 0;

            // First, add the robust chat history from ChatClient if available
            if (window.chat) {
                try {
                    // Get messages from AI Manager's conversation history (same as Export Chat)
                    const messages = window.chat.aiManager ? window.chat.aiManager.getHistory() : window.chat.messages;

                    const chatData = {
                        messages: messages,
                        totalTokens: window.chat.totalTokens,
                        currentContextTokens: window.chat.currentContextTokens,
                        timestamp: new Date().toISOString(),
                        provider: window.chat.currentProvider,
                        model: window.chat.modelSelect ? window.chat.modelSelect.value : ''
                    };

                    const chatHistoryJson = JSON.stringify(chatData, null, 2);
                    zip.file('$chat_history.json', chatHistoryJson);
                    console.log('[DEBUG] Added full chat history to ZIP (including tool calls)');
                    exportedCount++;
                } catch (error) {
                    console.error('[ERROR] Failed to add chat history to ZIP:', error);
                }
            }

            for (let file of files) {
                // Skip the old $chat_history file since we're adding the robust version
                if (file.path === '/$chat_history') {
                    console.log('[DEBUG] Skipping old $chat_history file (replaced with robust version)');
                    continue;
                }

                console.log(`[DEBUG] Processing: ${file.path} (type: ${file.type}, has content: ${!!file.content}, content length: ${file.content ? file.content.length : 0})`);

                if (file.type === 'folder') {
                    folderCount++;
                    console.log(`[DEBUG] Skipping folder: ${file.path}`);
                    continue;
                }

                if (file.type === 'file') {
                    // Remove leading slash for zip paths
                    const zipPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;

                    try {
                        if (!file.content || file.content === '') {
                            // Handle empty files - add them with empty content
                            console.warn(`[WARNING] File is empty: ${file.path}, adding as empty file`);
                            zip.file(zipPath, '');
                            exportedCount++;
                        } else if (file.content.startsWith('data:')) {
                            // Check if content is base64 encoded (data URL)
                            const commaIndex = file.content.indexOf(',');
                            if (commaIndex === -1) {
                                console.error(`[ERROR] Invalid data URL format for: ${file.path}`);
                                skippedCount++;
                                continue;
                            }
                            const base64Data = file.content.substring(commaIndex + 1);
                            console.log(`[DEBUG] Adding binary file to ZIP: ${zipPath} (base64 length: ${base64Data.length})`);
                            zip.file(zipPath, base64Data, { base64: true });
                            exportedCount++;
                        } else {
                            // Legacy text content (for files uploaded before the fix)
                            console.log(`[DEBUG] Adding text file to ZIP: ${zipPath} (content length: ${file.content.length})`);
                            zip.file(zipPath, file.content);
                            exportedCount++;
                        }
                    } catch (err) {
                        console.error(`[ERROR] Failed to add file to ZIP: ${file.path}`, err);
                        skippedCount++;
                    }
                } else {
                    console.warn(`[WARNING] Unknown file type: ${file.type} for ${file.path}`);
                    skippedCount++;
                }
            }

            console.log(`[DEBUG] Export summary:`);
            console.log(`  - Files exported: ${exportedCount}`);
            console.log(`  - Files skipped: ${skippedCount}`);
            console.log(`  - Folders: ${folderCount}`);
            console.log(`  - Total items: ${files.length}`);

            if (exportedCount === 0) {
                console.error('[ERROR] No files were exported!');
                this.updateStatus('No files to export');
                return;
            }

            console.log('[DEBUG] Generating ZIP blob...');
            const blob = await zip.generateAsync({ type: 'blob' });
            console.log(`[DEBUG] ZIP generated, size: ${blob.size} bytes`);

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workbench-files.zip';
            a.click();
            URL.revokeObjectURL(url);

            this.updateStatus(`Exported ${exportedCount} files to ZIP`);
            console.log(`[DEBUG] Export completed successfully`);
        } catch (error) {
            console.error('[ERROR] Export failed:', error);
            this.updateStatus('Error exporting ZIP file');
        }
    }

    async refreshFileTree() {
        const files = await this.fileSystem.getAllFiles();
        const tree = this.buildFileTree(files);
        this.renderFileTree(tree);
    }

    buildFileTree(files) {
        const tree = { name: 'root', children: {}, type: 'folder' };

        for (let file of files) {
            // Skip special system files
            if (file.path === '/$chat_history') {
                continue;
            }

            const parts = file.path.split('/').filter(p => p);
            let current = tree;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];

                if (i === parts.length - 1) {
                    current.children[part] = {
                        name: part,
                        path: file.path,
                        type: file.type,
                        content: file.content,
                        children: file.type === 'folder' ? {} : null
                    };
                } else {
                    if (!current.children[part]) {
                        current.children[part] = {
                            name: part,
                            type: 'folder',
                            children: {}
                        };
                    }
                    current = current.children[part];
                }
            }
        }

        return tree;
    }

    renderFileTree(tree, container = this.fileTree, level = 0) {
        if (container === this.fileTree) {
            container.innerHTML = '';
            // Set the file tree container itself as the root folder for context menu
            container.dataset.path = '/';
            container.dataset.type = 'folder';
        }

        const sortedChildren = Object.values(tree.children).sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        for (let child of sortedChildren) {
            const itemContainer = document.createElement('div');

            const item = document.createElement('div');
            item.className = child.type === 'folder' ? 'folder-item' : 'file-item';
            item.style.paddingLeft = `${level * 20 + 10}px`;
            item.draggable = true;

            // Add arrow for folders or spacer for files (to keep alignment)
            if (child.type === 'folder') {
                const arrow = document.createElement('span');
                arrow.className = 'folder-arrow';
                // Use right arrow when collapsed, down arrow when expanded
                arrow.textContent = this.expandedFolders.has(child.path) ? '▼' : '▶';
                item.appendChild(arrow);
            } else {
                // Add spacer for files to align with folders
                const spacer = document.createElement('span');
                spacer.className = 'folder-arrow';
                spacer.textContent = ' ';  // Empty space
                item.appendChild(spacer);
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = child.name;
            item.appendChild(nameSpan);

            if (child.path) {
                item.dataset.path = child.path;
                item.dataset.type = child.type;
                item.dataset.name = child.name;
            }

            // Drag events
            item.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                this.draggedItem = item;
                this.draggedPath = child.path;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', child.path);
            });

            item.addEventListener('dragend', (e) => {
                e.stopPropagation();
                item.classList.remove('dragging');
                this.clearDragStyles();
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.draggedPath && this.draggedPath !== child.path) {
                    e.dataTransfer.dropEffect = 'move';
                    if (child.type === 'folder') {
                        item.classList.add('drag-over');
                    }
                }
            });

            item.addEventListener('dragleave', (e) => {
                e.stopPropagation();
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                item.classList.remove('drag-over');

                if (this.draggedPath && this.draggedPath !== child.path) {
                    if (child.type === 'folder') {
                        // Move into folder
                        await this.moveItem(this.draggedPath, child.path);
                    } else {
                        // Move to same level as this file
                        const parentPath = this.getParentPath(child.path);
                        await this.moveItem(this.draggedPath, parentPath);
                    }
                }
                this.clearDragStyles();
            });

            item.addEventListener('click', (e) => {
                e.stopPropagation();

                if (this.selectedItem) {
                    this.selectedItem.classList.remove('selected');
                }
                item.classList.add('selected');
                this.selectedItem = item;

                if (child.type === 'folder') {
                    this.toggleFolder(child.path, item);
                } else {
                    window.selectedFilePath = child.path;

                    // Open text files in editor
                    if (window.tabManager && window.tabManager.isTextFile(child.path)) {
                        window.tabManager.openFile(child.path);
                    }
                }
            });

            // Add double-click handler for non-text files
            item.addEventListener('dblclick', (e) => {
                e.stopPropagation();

                if (child.type === 'file' && window.tabManager) {
                    if (window.tabManager.isTextFile(child.path)) {
                        // Already opened on single click
                    } else {
                        // Ask user if they want to open non-text file
                        if (confirm(`"${child.name}" may not be a text file. Try opening it with the text editor anyway?`)) {
                            window.tabManager.openFile(child.path);
                        }
                    }
                }
            });

            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.contextTarget = item;
                this.showContextMenu(e);
            });

            itemContainer.appendChild(item);

            if (child.type === 'folder' && Object.keys(child.children).length > 0) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'file-children';
                if (!this.expandedFolders.has(child.path)) {
                    childrenContainer.classList.add('collapsed');
                }
                this.renderFileTree(child, childrenContainer, level + 1);
                itemContainer.appendChild(childrenContainer);
            }

            container.appendChild(itemContainer);
        }
    }

    toggleFolder(path, item) {
        const arrow = item.querySelector('.folder-arrow');
        const childrenContainer = item.parentElement.querySelector('.file-children');

        if (this.expandedFolders.has(path)) {
            // Collapse the folder
            this.expandedFolders.delete(path);
            if (arrow) arrow.textContent = '▶';
            childrenContainer?.classList.add('collapsed');
        } else {
            // Expand the folder
            this.expandedFolders.add(path);
            if (arrow) arrow.textContent = '▼';
            childrenContainer?.classList.remove('collapsed');
        }
    }

    showContextMenu(e) {
        const menu = this.contextMenu;
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        menu.classList.add('show');

        // Check if we clicked on an actual file/folder item
        const hasTarget = this.contextTarget &&
                         this.contextTarget.classList &&
                         (this.contextTarget.classList.contains('file-item') ||
                          this.contextTarget.classList.contains('folder-item'));

        const isFile = this.contextTarget?.dataset.type === 'file';
        const isRoot = this.contextTarget?.dataset.path === '/';

        // Always show download, but disable if not a file
        const downloadItem = menu.querySelector('[data-action="download"]');
        if (downloadItem) {
            if (isFile) {
                downloadItem.classList.remove('disabled');
            } else {
                downloadItem.classList.add('disabled');
            }
        }

        // Enable/disable rename and delete based on whether we clicked on an item
        const renameItem = menu.querySelector('[data-action="rename"]');
        const deleteItem = menu.querySelector('[data-action="delete"]');

        if (renameItem) {
            if (hasTarget && !isRoot) {
                renameItem.classList.remove('disabled');
            } else {
                renameItem.classList.add('disabled');
            }
        }

        if (deleteItem) {
            if (hasTarget && !isRoot) {
                deleteItem.classList.remove('disabled');
            } else {
                deleteItem.classList.add('disabled');
            }
        }
    }

    hideContextMenu() {
        this.contextMenu.classList.remove('show');
    }

    async handleContextMenuAction(action) {
        const targetPath = this.contextTarget?.dataset.path || '/';
        const targetType = this.contextTarget?.dataset.type || 'folder';

        switch (action) {
            case 'new-file':
                await this.createNewFile(targetType === 'folder' ? targetPath : this.getParentPath(targetPath));
                break;
            case 'new-folder':
                await this.createNewFolder(targetType === 'folder' ? targetPath : this.getParentPath(targetPath));
                break;
            case 'upload-files':
                this.currentPath = targetType === 'folder' ? targetPath : this.getParentPath(targetPath);
                document.getElementById('fileInput').removeAttribute('webkitdirectory');
                document.getElementById('fileInput').click();
                break;
            case 'upload-folder':
                this.currentPath = targetType === 'folder' ? targetPath : this.getParentPath(targetPath);
                const input = document.getElementById('contextFileInput');
                input.setAttribute('webkitdirectory', '');
                input.click();
                break;
            case 'rename':
                if (this.contextTarget && targetPath !== '/') {
                    await this.renameItem(this.contextTarget);
                }
                break;
            case 'delete':
                if (this.contextTarget && targetPath !== '/') {
                    await this.deleteItem(this.contextTarget);
                }
                break;
            case 'download':
                if (targetType === 'file') {
                    await this.downloadFile(targetPath);
                }
                break;
        }
    }

    async createNewFile(parentPath) {
        const name = prompt('Enter file name:');
        if (name) {
            const path = parentPath + (parentPath.endsWith('/') ? '' : '/') + name;
            // Save with an empty string so it's not null/undefined
            await this.fileSystem.saveFile(path, '', 'file');
            console.log(`[DEBUG] Created empty file: ${path}`);
            await this.refreshFileTree();
            this.updateStatus(`Created file: ${name}`);
        }
    }

    async createNewFolder(parentPath) {
        const name = prompt('Enter folder name:');
        if (name) {
            const path = parentPath + (parentPath.endsWith('/') ? '' : '/') + name;
            await this.fileSystem.saveFile(path, null, 'folder');
            await this.refreshFileTree();
            this.updateStatus(`Created folder: ${name}`);
        }
    }

    async renameItem(item) {
        const oldPath = item.dataset.path;
        const oldName = oldPath.split('/').pop();
        const parentPath = this.getParentPath(oldPath);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldName;
        input.className = 'rename-input';

        const nameSpan = item.querySelector('span:last-child');
        const originalText = nameSpan.textContent;
        nameSpan.textContent = '';
        nameSpan.appendChild(input);

        input.focus();
        input.select();

        const finishRename = async () => {
            const newName = input.value.trim();
            if (newName && newName !== oldName) {
                const newPath = parentPath + (parentPath.endsWith('/') ? '' : '/') + newName;

                // Get the old file/folder
                const oldFile = await this.fileSystem.getFile(oldPath);
                if (oldFile) {
                    // Save with new path
                    await this.fileSystem.saveFile(newPath, oldFile.content, oldFile.type);

                    // Delete old path
                    await this.fileSystem.deleteFile(oldPath);

                    // If it's a folder, move all children
                    if (oldFile.type === 'folder') {
                        const allFiles = await this.fileSystem.getAllFiles();
                        for (let file of allFiles) {
                            if (file.path.startsWith(oldPath + '/')) {
                                const oldFilePath = file.path;
                                const newFilePath = file.path.replace(oldPath, newPath);
                                await this.fileSystem.saveFile(newFilePath, file.content, file.type);
                                await this.fileSystem.deleteFile(oldFilePath);

                                // Update any open tabs for files within the renamed folder
                                if (window.tabManager) {
                                    window.tabManager.updateTabForRename(oldFilePath, newFilePath);
                                }
                            }
                        }
                    }

                    await this.refreshFileTree();

                    // Update any open tabs with the new path
                    if (window.tabManager) {
                        window.tabManager.updateTabForRename(oldPath, newPath);
                    }

                    this.updateStatus(`Renamed to: ${newName}`);
                }
            } else {
                nameSpan.textContent = originalText;
            }
        };

        input.addEventListener('blur', finishRename);
        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                await finishRename();
            } else if (e.key === 'Escape') {
                nameSpan.textContent = originalText;
            }
        });
    }

    async deleteItem(item) {
        const path = item.dataset.path;
        const name = path.split('/').pop();

        if (confirm(`Delete "${name}"?`)) {
            // Close any open tabs for this file/folder before deleting
            if (window.tabManager) {
                await window.tabManager.closeTabsForPath(path);
            }

            await this.fileSystem.deleteFile(path);
            await this.refreshFileTree();
            this.updateStatus(`Deleted: ${name}`);
        }
    }

    async downloadFile(path) {
        const file = await this.fileSystem.getFile(path);
        if (file && file.type === 'file') {
            let blob;

            // Check if content is base64 encoded (data URL)
            if (file.content && file.content.startsWith('data:')) {
                // Extract base64 data and convert to blob
                const [header, base64] = file.content.split(',');
                const mimeMatch = header.match(/data:([^;]+)/);
                const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

                // Convert base64 to binary
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: mimeType });
            } else {
                // Regular text content
                blob = new Blob([file.content || ''], { type: 'text/plain' });
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(url);
            this.updateStatus(`Downloaded: ${file.name}`);
        }
    }

    getParentPath(path) {
        const parts = path.split('/').filter(p => p);
        parts.pop();
        return '/' + parts.join('/');
    }

    clearDragStyles() {
        const allItems = this.fileTree.querySelectorAll('.file-item, .folder-item');
        allItems.forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
        this.draggedItem = null;
        this.draggedPath = null;
    }

    async moveItem(sourcePath, targetFolderPath) {
        try {
            // Get the source item
            const sourceFile = await this.fileSystem.getFile(sourcePath);
            if (!sourceFile) {
                throw new Error(`Source not found: ${sourcePath}`);
            }

            // Prevent moving a folder into itself or its descendants
            if (sourceFile.type === 'folder' && targetFolderPath.startsWith(sourcePath + '/')) {
                this.updateStatus('Cannot move a folder into itself');
                return;
            }

            // Extract the name from the source path
            const sourceName = sourcePath.split('/').pop();

            // Construct new path
            let newPath = targetFolderPath;
            if (!newPath.endsWith('/')) {
                newPath += '/';
            }
            newPath += sourceName;

            // Check if target already exists
            const existing = await this.fileSystem.getFile(newPath);
            if (existing) {
                if (!confirm(`"${sourceName}" already exists in the target folder. Replace it?`)) {
                    return;
                }
                await this.fileSystem.deleteFile(newPath);
            }

            // Move the file/folder
            await this.fileSystem.saveFile(newPath, sourceFile.content, sourceFile.type);

            // If it's a folder, move all children
            if (sourceFile.type === 'folder') {
                const allFiles = await this.fileSystem.getAllFiles();
                for (let file of allFiles) {
                    if (file.path.startsWith(sourcePath + '/')) {
                        const relativePath = file.path.substring(sourcePath.length);
                        const newChildPath = newPath + relativePath;
                        await this.fileSystem.saveFile(newChildPath, file.content, file.type);
                    }
                }
            }

            // Delete the source (and its children if folder)
            await this.fileSystem.deleteFile(sourcePath);

            // Update any open tabs with the new path
            if (window.tabManager) {
                window.tabManager.updateTabsForMove(sourcePath, newPath);
            }

            // Refresh the tree
            await this.refreshFileTree();

            this.updateStatus(`Moved ${sourceName} to ${targetFolderPath}`);
        } catch (error) {
            console.error('Error moving item:', error);
            this.updateStatus(`Error moving item: ${error.message}`);
        }
    }

    async clearAllFiles() {
        await this.fileSystem.clearAll();
        await this.refreshFileTree();
        this.updateStatus('All files cleared');
    }

    updateStatus(message) {
        // Status messages can be shown in console or as temporary notifications
        console.log(message);
    }
}
 
