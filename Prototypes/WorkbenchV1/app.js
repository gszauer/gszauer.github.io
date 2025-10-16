// IndexedDB File System Manager
class FileSystemManager {
    constructor() {
        this.db = null;
        this.dbName = 'AIWorkbenchFS';
        this.storeName = 'files';
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'path' });
                    store.createIndex('parent', 'parent', { unique: false });
                }
            };
        });
    }

    async saveFile(path, content, type = 'file') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const parent = this.getParentPath(path);
            const name = this.getFileName(path);

            const request = store.put({
                path: path,
                name: name,
                parent: parent,
                content: content,
                type: type,
                lastModified: new Date().toISOString()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getFile(path) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(path);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFiles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(path) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Delete the file/folder and all children
            const getAllRequest = store.getAll();
            getAllRequest.onsuccess = () => {
                const files = getAllRequest.result;
                const toDelete = files.filter(f => f.path === path || f.path.startsWith(path + '/'));

                toDelete.forEach(file => {
                    store.delete(file.path);
                });

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
        });
    }

    async clearAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    getParentPath(path) {
        const parts = path.split('/');
        parts.pop();
        return parts.join('/') || '/';
    }

    getFileName(path) {
        const parts = path.split('/');
        return parts[parts.length - 1];
    }
}

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

        for (let file of files) {
            const content = await this.readFileContent(file);
            const filePath = targetPath + (file.webkitRelativePath || file.name);

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
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });
    }

    async importZip(file) {
        try {
            const zip = new JSZip();
            const content = await zip.loadAsync(file);

            for (let [path, zipEntry] of Object.entries(content.files)) {
                if (!zipEntry.dir) {
                    const fileContent = await zipEntry.async('string');
                    await this.fileSystem.saveFile('/' + path, fileContent, 'file');
                } else {
                    const folderPath = '/' + path.slice(0, -1); // Remove trailing slash
                    await this.fileSystem.saveFile(folderPath, null, 'folder');
                }
            }

            await this.refreshFileTree();
            this.updateStatus('ZIP file imported successfully');
        } catch (error) {
            console.error('Error importing ZIP:', error);
            this.updateStatus('Error importing ZIP file');
        }
    }

    async exportZip() {
        try {
            const zip = new JSZip();
            const files = await this.fileSystem.getAllFiles();

            for (let file of files) {
                if (file.type === 'file' && file.content) {
                    // Remove leading slash for zip paths
                    const zipPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
                    zip.file(zipPath, file.content);
                }
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workbench-files.zip';
            a.click();
            URL.revokeObjectURL(url);

            this.updateStatus('Files exported to ZIP');
        } catch (error) {
            console.error('Error exporting ZIP:', error);
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
            await this.fileSystem.saveFile(path, '', 'file');
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
            const blob = new Blob([file.content], { type: 'text/plain' });
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

// GitHub Integration
class GitHubIntegration {
    constructor(fileSystem, fileBrowser) {
        this.fileSystem = fileSystem;
        this.fileBrowser = fileBrowser;
        this.token = localStorage.getItem('github_token') || '';
        this.selectedOwner = localStorage.getItem('github_owner') || '';
        this.selectedRepo = localStorage.getItem('github_repo') || '';
        this.selectedBranch = localStorage.getItem('github_branch') || '';
        this.isConnected = false;

        this.tokenInput = document.getElementById('githubToken');
        this.ownerSelect = document.getElementById('ownerSelect');
        this.repoSelect = document.getElementById('repoSelect');
        this.branchSelect = document.getElementById('branchSelect');
        this.pullBtn = document.getElementById('pullBtn');
        this.pushBtn = document.getElementById('pushBtn');

        this.allRepos = [];

        this.setupEventListeners();
        this.loadToken();
    }

    setupEventListeners() {
        document.getElementById('saveGithubToken').addEventListener('click', () => {
            this.saveToken();
        });

        this.ownerSelect.addEventListener('change', () => {
            this.onOwnerSelect();
        });

        this.repoSelect.addEventListener('change', () => {
            this.onRepoSelect();
        });

        this.branchSelect.addEventListener('change', () => {
            this.onBranchSelect();
        });

        this.pullBtn.addEventListener('click', () => {
            this.pullFromGitHub();
        });

        this.pushBtn.addEventListener('click', () => {
            this.pushToGitHub();
        });
    }

    loadToken() {
        if (this.token) {
            this.tokenInput.value = this.token;
            this.connectToGitHub();
        }
    }

    async saveToken() {
        this.token = this.tokenInput.value;
        localStorage.setItem('github_token', this.token);

        if (this.token) {
            await this.connectToGitHub();
        } else {
            this.disconnectGitHub();
        }
    }

    async connectToGitHub() {
        const connectBtn = document.getElementById('saveGithubToken');

        try {
            // Disable button while connecting
            connectBtn.disabled = true;
            connectBtn.textContent = 'Connecting...';

            await this.fetchRepos();
            this.isConnected = true;
            this.updateStatusIndicator();

            // Try to restore previous selections
            if (this.selectedOwner) {
                this.ownerSelect.value = this.selectedOwner;
                await this.onOwnerSelect();

                if (this.selectedRepo) {
                    // Find the full repo name
                    const fullRepoName = this.allRepos.find(r =>
                        r.full_name === this.selectedRepo ||
                        r.name === this.selectedRepo
                    )?.full_name;

                    if (fullRepoName) {
                        this.repoSelect.value = fullRepoName;
                        await this.onRepoSelect();

                        if (this.selectedBranch) {
                            this.branchSelect.value = this.selectedBranch;
                            this.onBranchSelect();
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to connect to GitHub:', error);
            this.isConnected = false;
            this.updateStatusIndicator();
        } finally {
            // Re-enable button
            connectBtn.disabled = false;
            connectBtn.textContent = 'Connect';
        }
    }

    disconnectGitHub() {
        this.isConnected = false;
        this.ownerSelect.innerHTML = '<option value="">Select User/Org</option>';
        this.ownerSelect.disabled = true;
        this.repoSelect.innerHTML = '<option value="">Select Repository</option>';
        this.repoSelect.disabled = true;
        this.branchSelect.innerHTML = '<option value="">Select Branch</option>';
        this.branchSelect.disabled = true;
        this.pullBtn.disabled = true;
        this.pushBtn.disabled = true;
        this.updateStatusIndicator();
    }

    updateStatusIndicator() {
        const indicator = document.getElementById('fileIndicator');
        const statusText = indicator.nextElementSibling;

        if (this.isConnected) {
            indicator.style.backgroundColor = '#4caf50';
            statusText.textContent = 'GitHub Connected';
        } else {
            indicator.style.backgroundColor = '#007acc';
            statusText.textContent = 'File Browser Settings';
        }
    }

    async fetchRepos() {
        try {
            const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }

            this.allRepos = await response.json();

            // Get unique owners (user and orgs)
            const owners = new Set();
            this.allRepos.forEach(repo => {
                owners.add(repo.owner.login);
            });

            // Populate owner dropdown
            this.ownerSelect.innerHTML = '<option value="">Select User/Org</option>';
            const sortedOwners = Array.from(owners).sort();

            for (let owner of sortedOwners) {
                const option = document.createElement('option');
                option.value = owner;
                option.textContent = owner;
                this.ownerSelect.appendChild(option);
            }

            this.ownerSelect.disabled = false;
            console.log(`Loaded ${this.allRepos.length} repositories from ${owners.size} owner(s)`);
        } catch (error) {
            console.error('Error fetching repositories:', error);
            alert('Failed to fetch repositories. Please check your token.');
        }
    }

    async onOwnerSelect() {
        this.selectedOwner = this.ownerSelect.value;
        localStorage.setItem('github_owner', this.selectedOwner);

        if (!this.selectedOwner) {
            this.repoSelect.innerHTML = '<option value="">Select Repository</option>';
            this.repoSelect.disabled = true;
            this.branchSelect.innerHTML = '<option value="">Select Branch</option>';
            this.branchSelect.disabled = true;
            this.pullBtn.disabled = true;
            this.pushBtn.disabled = true;
            return;
        }

        // Filter repos by selected owner
        const ownerRepos = this.allRepos.filter(repo => repo.owner.login === this.selectedOwner);

        // Populate repo dropdown
        this.repoSelect.innerHTML = '<option value="">Select Repository</option>';
        ownerRepos.sort((a, b) => a.name.localeCompare(b.name));

        for (let repo of ownerRepos) {
            const option = document.createElement('option');
            option.value = repo.full_name;
            option.textContent = repo.name;
            this.repoSelect.appendChild(option);
        }

        this.repoSelect.disabled = false;
    }

    async onRepoSelect() {
        this.selectedRepo = this.repoSelect.value;
        localStorage.setItem('github_repo', this.selectedRepo);

        if (!this.selectedRepo) {
            this.branchSelect.innerHTML = '<option value="">Select Branch</option>';
            this.branchSelect.disabled = true;
            this.pullBtn.disabled = true;
            this.pushBtn.disabled = true;
            return;
        }

        await this.fetchBranches();
    }

    async fetchBranches() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.selectedRepo}/branches`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch branches');
            }

            const branches = await response.json();

            this.branchSelect.innerHTML = '<option value="">Select Branch</option>';

            for (let branch of branches) {
                const option = document.createElement('option');
                option.value = branch.name;
                option.textContent = branch.name;
                if (branch.name === 'main' || branch.name === 'master') {
                    option.selected = true;
                }
                this.branchSelect.appendChild(option);
            }

            this.branchSelect.disabled = false;

            // If main or master was auto-selected, enable buttons
            if (this.branchSelect.value) {
                this.onBranchSelect();
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            alert('Failed to fetch branches.');
        }
    }

    onBranchSelect() {
        this.selectedBranch = this.branchSelect.value;
        localStorage.setItem('github_branch', this.selectedBranch);

        if (this.selectedBranch) {
            this.pullBtn.disabled = false;
            this.pushBtn.disabled = false;
        } else {
            this.pullBtn.disabled = true;
            this.pushBtn.disabled = true;
        }
    }

    async pullFromGitHub() {
        if (!this.selectedRepo || !this.selectedBranch) {
            alert('Please select a repository and branch first.');
            return;
        }

        if (!confirm(`This will clear all current files and replace them with files from ${this.selectedRepo}/${this.selectedBranch}. Continue?`)) {
            return;
        }

        try {
            this.pullBtn.disabled = true;
            this.pullBtn.textContent = 'Pulling...';

            // Clear all current files
            await this.fileSystem.clearAll();

            // Fetch the repository tree
            const treeResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/trees/${this.selectedBranch}?recursive=1`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!treeResponse.ok) {
                throw new Error('Failed to fetch repository tree');
            }

            const tree = await treeResponse.json();

            // Process each file
            for (let item of tree.tree) {
                if (item.type === 'blob') {
                    // Fetch file content
                    const contentResponse = await fetch(item.url, {
                        headers: {
                            'Authorization': `token ${this.token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });

                    if (contentResponse.ok) {
                        const contentData = await contentResponse.json();
                        const content = atob(contentData.content);
                        await this.fileSystem.saveFile('/' + item.path, content, 'file');
                    }
                } else if (item.type === 'tree') {
                    // Create folder
                    await this.fileSystem.saveFile('/' + item.path, null, 'folder');
                }
            }

            await this.fileBrowser.refreshFileTree();

            alert(`Successfully pulled from ${this.selectedRepo}/${this.selectedBranch}`);
        } catch (error) {
            console.error('Error pulling from GitHub:', error);
            alert('Failed to pull from GitHub: ' + error.message);
        } finally {
            this.pullBtn.disabled = false;
            this.pullBtn.textContent = 'Pull';
        }
    }

    async pushToGitHub() {
        if (!this.selectedRepo || !this.selectedBranch) {
            alert('Please select a repository and branch first.');
            return;
        }

        if (!confirm(`This will force push all files to ${this.selectedRepo}/${this.selectedBranch}, replacing any existing content. Continue?`)) {
            return;
        }

        try {
            this.pushBtn.disabled = true;
            this.pushBtn.textContent = 'Pushing...';

            // Get all files from IndexedDB
            const files = await this.fileSystem.getAllFiles();

            // Filter out system files and folders
            const fileBlobs = files.filter(f =>
                f.type === 'file' &&
                f.content &&
                !f.path.startsWith('/$')
            );

            // Get the current commit SHA
            const refResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/refs/heads/${this.selectedBranch}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!refResponse.ok) {
                throw new Error('Failed to get branch reference');
            }

            const refData = await refResponse.json();
            const baseSha = refData.object.sha;

            // Create blobs for each file
            const blobs = [];
            for (let file of fileBlobs) {
                const blobResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/blobs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: btoa(file.content),
                        encoding: 'base64'
                    })
                });

                if (blobResponse.ok) {
                    const blobData = await blobResponse.json();
                    blobs.push({
                        path: file.path.substring(1), // Remove leading slash
                        mode: '100644',
                        type: 'blob',
                        sha: blobData.sha
                    });
                }
            }

            // Create a new tree
            const treeResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/trees`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tree: blobs,
                    base_tree: null // Force replace all content
                })
            });

            if (!treeResponse.ok) {
                throw new Error('Failed to create tree');
            }

            const treeData = await treeResponse.json();

            // Create a new commit
            const commitResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/commits`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update from AI Workbench',
                    tree: treeData.sha,
                    parents: [baseSha]
                })
            });

            if (!commitResponse.ok) {
                throw new Error('Failed to create commit');
            }

            const commitData = await commitResponse.json();

            // Update the reference (force push)
            const updateRefResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/refs/heads/${this.selectedBranch}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sha: commitData.sha,
                    force: true
                })
            });

            if (!updateRefResponse.ok) {
                throw new Error('Failed to update branch');
            }

            alert(`Successfully pushed to ${this.selectedRepo}/${this.selectedBranch}`);
        } catch (error) {
            console.error('Error pushing to GitHub:', error);
            alert('Failed to push to GitHub: ' + error.message);
        } finally {
            this.pushBtn.disabled = false;
            this.pushBtn.textContent = 'Push';
        }
    }
}

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

// Tool Implementations
class WorkbenchTools {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
    }

    async list_files() {
        const files = await this.fileSystem.getAllFiles();
        const tree = this.buildTree(files);
        return this.printTree(tree);
    }

    buildTree(files) {
        const tree = { '/': { type: 'folder', children: {} } };

        for (let file of files) {
            // Skip special system files
            if (file.path === '/$chat_history') {
                continue;
            }

            const parts = file.path.split('/').filter(p => p);
            let current = tree['/'];

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];

                if (i === parts.length - 1) {
                    current.children[part] = {
                        type: file.type,
                        path: file.path,
                        children: file.type === 'folder' ? {} : null
                    };
                } else {
                    if (!current.children[part]) {
                        current.children[part] = {
                            type: 'folder',
                            children: {}
                        };
                    }
                    current = current.children[part];
                }
            }
        }

        return tree['/'];
    }

    printTree(node, prefix = '', isRoot = true) {
        let result = isRoot ? '/\n' : '';
        const children = Object.entries(node.children || {});

        children.forEach(([name, child], index) => {
            const isLast = index === children.length - 1;
            const connector = isLast ? '\\-- ' : '|-- ';
            const icon = child.type === 'folder' ? '[D] ' : '[F] ';

            result += prefix + connector + icon + name + '\n';

            if (child.type === 'folder' && child.children) {
                const newPrefix = prefix + (isLast ? '    ' : '|   ');
                result += this.printTree(child, newPrefix, false);
            }
        });

        return result;
    }

    async read_file(path) {
        // Normalize path - add leading slash if missing
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file') {
            throw new Error(`Path is not a file: ${path}`);
        }
        return file.content || '';
    }
}

// Claude Chat Interface (Updated to use AI Provider Abstraction)
class ClaudeChat {
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
        this.totalCost = 0;

        // Model configuration will be loaded from models.json
        this.modelConfig = null;
        this.modelPricing = {};
        this.modelNames = {};
        this.loadModelConfig();

        // Track current context usage (resets per conversation)
        this.currentContextTokens = 0;

        // Auto-save chat after each response
        this.autoSave = true;

        // System prompt (stored in memory only) - with default
        this.systemPrompt = `You are an AI assistant helping with a coding workbench.
You have access to file system tools and can help with programming tasks.
Be concise, accurate, and helpful.`;

        // Environment info (stored in memory only)
        this.environmentInfo = '';

        // Setup will complete after model config loads
        this.setupEventListeners();

        this.loadSavedProvider();

        // Auto-load will be called after fileSystem is initialized
    }

    // Load model configuration from models.json
    async loadModelConfig() {
        try {
            const response = await fetch('models.json');
            this.modelConfig = await response.json();

            // Build pricing and display name maps from loaded config
            for (const [providerId, provider] of Object.entries(this.modelConfig.providers)) {
                for (const model of provider.models) {
                    this.modelPricing[model.id] = {
                        input: model.pricing.input,
                        output: model.pricing.output,
                        contextWindow: model.contextWindow
                    };
                    this.modelNames[model.id] = model.name;
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
        this.modelPricing = {
            'claude-haiku-4-5': { input: 1.00, output: 5.00, contextWindow: 200000 },
            'gpt-3.5-turbo': { input: 0.50, output: 1.50, contextWindow: 16385 },
            'gemini-2.5-flash': { input: 0.075, output: 0.30, contextWindow: 1048576 }
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
            title.textContent = 'Tools (Sent to Model)';

            // Get the exact formatted tools sent to the current provider
            const provider = this.aiManager.getProvider();
            const tools = this.aiManager.tools;

            if (provider && tools.length > 0) {
                const formatted = provider.formatTools(tools);
                content.value = JSON.stringify(formatted, null, 2);
            } else {
                content.value = '// No tools registered or no provider selected';
            }

            modal.style.display = 'flex';
            this.setupInfoViewerEscHandler();
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
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveEnvironment() {
        const editor = document.getElementById('environmentEditor');
        if (editor) {
            // Save in memory only
            this.environmentInfo = editor.value.trim();

            // TODO: Hook this up to AIManager to actually send with messages
            // For now it's just stored in memory

            // Close the modal
            this.closeEnvironmentEditor();

            console.log('Environment info updated (in memory only)');
        }
    }

    closeInfoViewer() {
        const modal = document.getElementById('infoViewerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    copyInfoContent() {
        const content = document.getElementById('infoViewerContent');
        if (content) {
            content.select();
            navigator.clipboard.writeText(content.value).then(() => {
                // Optional: Show feedback
                const copyBtn = event.target;
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 1500);
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

    saveSystemPrompt() {
        const editor = document.getElementById('systemPromptEditor');
        if (editor) {
            // Save in memory only
            this.systemPrompt = editor.value.trim();

            // Update the AI Manager's system prompt
            if (this.aiManager) {
                this.aiManager.setSystemPrompt(this.systemPrompt);
            }

            // Close the modal
            this.closeSystemPromptEditor();

            // Optional: Show a subtle confirmation
            console.log('System prompt updated (in memory only)');
        }
    }

    // Register tools that work with all providers
    registerUniversalTools() {
        // List files tool
        this.aiManager.registerTool(
            'list_files',
            'List all files in the virtual file system as a tree structure',
            {
                type: 'object',
                properties: {},
                required: []
            },
            async () => {
                return await this.tools.list_files();
            }
        );

        // Read file tool
        this.aiManager.registerTool(
            'read_file',
            'Read the contents of a file from the virtual file system',
            {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the file to read (e.g., "/folder/file.txt")'
                    }
                },
                required: ['path']
            },
            async (args) => {
                return await this.tools.read_file(args.path);
            }
        );
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

        // Use models from config if available, otherwise use defaults
        let models = {};

        if (this.modelConfig && this.modelConfig.providers) {
            for (const [providerId, provider] of Object.entries(this.modelConfig.providers)) {
                models[providerId] = provider.models.map(m => m.id);
            }
        } else {
            // Fallback defaults
            models = {
                'claude': ['claude-haiku-4-5'],
                'openai': ['gpt-3.5-turbo'],
                'gemini': ['gemini-2.5-flash']
            };
        }

        const providerModels = models[this.currentProvider] || [];
        this.modelSelect.innerHTML = '';

        for (const model of providerModels) {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = this.modelNames[model] || model;
            this.modelSelect.appendChild(option);
        }

        // Set default selection
        const savedModel = localStorage.getItem(`${this.currentProvider}_model`);
        if (savedModel && providerModels.includes(savedModel)) {
            this.modelSelect.value = savedModel;
        } else if (providerModels.length > 0) {
            // Default to first model (Haiku for Claude, which is the value option)
            this.modelSelect.value = providerModels[0];
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
                this.messages = chatData.messages || [];
                this.totalTokens = chatData.totalTokens || 0;
                this.totalCost = chatData.totalCost || 0;
                this.currentContextTokens = chatData.currentContextTokens || 0;

                // Restore messages to AI Manager if it exists
                if (this.aiManager && chatData.messages) {
                    this.aiManager.clearHistory();
                    for (let msg of chatData.messages) {
                        // Clean message before adding to AI Manager (remove metadata)
                        const cleanMsg = {
                            role: msg.role,
                            content: msg.content
                        };
                        this.aiManager.conversationHistory.push(cleanMsg);
                    }
                }

                // Clear and rebuild chat UI
                this.chatWindow.innerHTML = '';

                // Replay messages in UI including tool results
                for (let msg of this.messages) {
                    if (msg.role === 'user') {
                        // Check if this is a tool result message
                        if (Array.isArray(msg.content) && msg.content[0]?.type === 'tool_result') {
                            // Display tool results
                            for (let result of msg.content) {
                                if (result.type === 'tool_result') {
                                    this.addToolResult(result.content);
                                }
                            }
                        } else if (typeof msg.content === 'string') {
                            // Regular user message
                            this.addMessage(msg.content, 'user');
                        }
                    } else if (msg.role === 'assistant') {
                        // Check if it's a tool use message
                        if (Array.isArray(msg.content)) {
                            for (let content of msg.content) {
                                if (content.type === 'text') {
                                    this.addMessage(content.text, 'assistant', msg.metadata);
                                } else if (content.type === 'tool_use') {
                                    this.addToolUse(content.name, content.input);
                                }
                            }
                        } else if (typeof msg.content === 'string') {
                            this.addMessage(msg.content, 'assistant', msg.metadata);
                        }
                    }
                }

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
        // Use local messages which include metadata for display purposes
        // The metadata won't be sent to AI (handled in loadChatHistory)
        const messages = this.messages;

        const chatData = {
            messages: messages,
            totalTokens: this.totalTokens,
            totalCost: this.totalCost,
            currentContextTokens: this.currentContextTokens,
            timestamp: new Date().toISOString(),
            provider: this.currentProvider,
            model: this.modelSelect.value
        };

        // Save to IndexedDB with a special filename
        const chatContent = JSON.stringify(chatData, null, 2);
        await window.fileSystem.saveFile('/$chat_history', chatContent, 'file');
        console.log('Chat history auto-saved');
    }

    // Export chat to file
    exportChatHistory() {
        // Get messages from AI Manager's conversation history
        const messages = this.aiManager ? this.aiManager.getHistory() : this.messages;

        const chatData = {
            messages: messages,
            totalTokens: this.totalTokens,
            totalCost: this.totalCost,
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
                this.messages = chatData.messages || [];
                this.totalTokens = chatData.totalTokens || 0;
                this.totalCost = chatData.totalCost || 0;
                this.currentContextTokens = chatData.currentContextTokens || 0;

                // Restore messages to AI Manager if it exists
                if (this.aiManager && chatData.messages) {
                    this.aiManager.clearHistory();
                    for (let msg of chatData.messages) {
                        // Clean message before adding to AI Manager (remove metadata)
                        const cleanMsg = {
                            role: msg.role,
                            content: msg.content
                        };
                        this.aiManager.conversationHistory.push(cleanMsg);
                    }
                }

                // Clear and rebuild chat UI
                this.chatWindow.innerHTML = '';

                // Replay messages in UI including tool results
                for (let msg of this.messages) {
                    if (msg.role === 'user') {
                        // Check if this is a tool result message
                        if (Array.isArray(msg.content) && msg.content[0]?.type === 'tool_result') {
                            // Display tool results
                            for (let result of msg.content) {
                                if (result.type === 'tool_result') {
                                    this.addToolResult(result.content);
                                }
                            }
                        } else if (typeof msg.content === 'string') {
                            // Regular user message
                            this.addMessage(msg.content, 'user');
                        }
                    } else if (msg.role === 'assistant') {
                        // Check if it's a tool use message
                        if (Array.isArray(msg.content)) {
                            for (let content of msg.content) {
                                if (content.type === 'text') {
                                    this.addMessage(content.text, 'assistant', msg.metadata);
                                } else if (content.type === 'tool_use') {
                                    this.addToolUse(content.name, content.input);
                                }
                            }
                        } else if (typeof msg.content === 'string') {
                            this.addMessage(msg.content, 'assistant', msg.metadata);
                        }
                    }
                }

                // Update displays
                this.updateTokenDisplay();
                this.addSystemMessage(`Loaded chat history from ${chatData.timestamp}`);

                // Save the imported chat to IndexedDB
                this.autosaveChatHistory().then(() => {
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
        this.totalCost = 0;
        this.currentContextTokens = 0;
        this.chatWindow.innerHTML = '';

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
                totalCost: 0,
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
        const costDisplay = document.getElementById('costDisplay');

        // Always update the display, even when tokens are 0
        if (this.totalTokens >= 0 || this.currentContextTokens >= 0) {
            // Format total tokens used
            let totalText = '';
            if (this.totalTokens >= 1000000) {
                totalText = `${(this.totalTokens / 1000000).toFixed(2)}M`;
            } else if (this.totalTokens >= 1000) {
                totalText = `${(this.totalTokens / 1000).toFixed(1)}K`;
            } else {
                totalText = this.totalTokens.toString();
            }

            // Only show context remaining if we've actually sent messages
            if (this.currentContextTokens > 0) {
                // Get current model's context window
                const model = this.modelSelect.value;
                const pricing = this.modelPricing[model];
                const contextWindow = pricing ? pricing.contextWindow : 200000;

                // Calculate remaining context
                const remainingContext = contextWindow - this.currentContextTokens;
                const contextPercentUsed = (this.currentContextTokens / contextWindow) * 100;

                // Format context display with color coding
                let contextColor = '#b8960f'; // Duller yellow default
                if (contextPercentUsed > 90) {
                    contextColor = '#cc4444'; // Red when > 90% used
                } else if (contextPercentUsed > 75) {
                    contextColor = '#cc6600'; // Orange when > 75% used
                }

                // Format remaining tokens
                let remainingText = '';
                if (remainingContext >= 1000000) {
                    remainingText = `${(remainingContext / 1000000).toFixed(2)}M`;
                } else if (remainingContext >= 1000) {
                    remainingText = `${(remainingContext / 1000).toFixed(1)}K`;
                } else {
                    remainingText = remainingContext.toString();
                }

                // Display format: "1.5K total | 185K left"
                tokenDisplay.innerHTML = `<span style="color: ${contextColor}">${totalText} used | ${remainingText} left</span>`;
            } else {
                // Just show total used when no context established yet
                tokenDisplay.innerHTML = `<span style="color: #b8960f">${totalText} used</span>`;
            }

            // Format cost - always display, even if 0
            costDisplay.textContent = `$${this.totalCost.toFixed(4)}`;
        }
    }

    addMessage(content, role, metadata = null) {
        // Create container
        const containerDiv = document.createElement('div');
        containerDiv.className = `message-container ${role}`;

        // Create wrapper for message and header
        const messageWrapper = document.createElement('div');
        messageWrapper.style.display = 'flex';
        messageWrapper.style.flexDirection = 'column';
        messageWrapper.style.flex = '1';

        // Add model info header for assistant messages
        if (role === 'assistant' && metadata) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'message-header';
            headerDiv.style.fontSize = '11px';
            headerDiv.style.color = '#888';
            headerDiv.style.marginBottom = '4px';
            headerDiv.style.opacity = '0.8';

            // Format provider/model info
            const provider = metadata.provider || this.currentProvider;
            const model = metadata.model || this.modelSelect.value;
            const displayName = this.getModelDisplayName(provider, model);
            headerDiv.textContent = displayName;

            messageWrapper.appendChild(headerDiv);
        }

        // Create message bubble
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.textContent = content;
        messageWrapper.appendChild(messageDiv);

        // Add copy button (outside the message)
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => this.copyToClipboard(content, copyButton);

        // Add elements to container
        // For user messages: copy button on left, then message
        // For other messages: message, then copy button on right
        if (role === 'user') {
            containerDiv.appendChild(copyButton);
            containerDiv.appendChild(messageWrapper);
        } else {
            containerDiv.appendChild(messageWrapper);
            containerDiv.appendChild(copyButton);
        }

        this.chatWindow.appendChild(containerDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
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

    addToolUse(toolName, input) {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'message-container tool-use';

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message tool-use';
        const content = `Using tool: ${toolName}\nInput: ${JSON.stringify(input, null, 2)}`;
        messageDiv.textContent = content;

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => this.copyToClipboard(content, copyButton);

        containerDiv.appendChild(messageDiv);
        containerDiv.appendChild(copyButton);

        this.chatWindow.appendChild(containerDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    addToolResult(result) {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'message-container tool-result';

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message tool-result';
        const content = `Tool result:\n${result}`;
        messageDiv.textContent = content;

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => this.copyToClipboard(result, copyButton);

        containerDiv.appendChild(messageDiv);
        containerDiv.appendChild(copyButton);

        this.chatWindow.appendChild(containerDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content) return;

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
        this.addMessage(content, 'user');

        // Add to local messages array for persistence
        this.messages.push({ role: 'user', content: content });

        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant';
        loadingDiv.innerHTML = '<div class="loading"></div>';
        this.chatWindow.appendChild(loadingDiv);

        try {
            // Get selected model
            const model = this.modelSelect.value;

            console.log('Sending message with:', {
                provider: this.currentProvider,
                model: model,
                hasProvider: !!this.aiManager.providers[this.currentProvider],
                currentProviderName: this.aiManager.currentProvider
            });

            // Send message through AI Manager
            const response = await this.aiManager.sendMessage(content, {
                model: model,
                maxTokens: 4096,
                temperature: 0.7
            });

            this.chatWindow.removeChild(loadingDiv);

            // Process the response
            await this.processUnifiedResponse(response);
        } catch (error) {
            this.chatWindow.removeChild(loadingDiv);
            this.addSystemMessage(`Error: ${error.message}`);
            console.error(`Error calling ${this.currentProvider}:`, error);
        }
    }

    // New unified response processor
    async processUnifiedResponse(response) {
        // Update token usage if available
        if (response.usage) {
            // Handle different token field names (Claude uses input_tokens, OpenAI uses prompt_tokens)
            const inputTokens = response.usage.input_tokens || response.usage.prompt_tokens || 0;
            const outputTokens = response.usage.output_tokens || response.usage.completion_tokens || 0;
            this.totalTokens += inputTokens + outputTokens;

            // Update current context usage
            this.currentContextTokens = inputTokens + outputTokens;

            // Calculate cost for this request
            const model = this.modelSelect.value;
            const pricing = this.modelPricing[model];
            if (pricing) {
                const inputCost = (inputTokens / 1000000) * pricing.input;
                const outputCost = (outputTokens / 1000000) * pricing.output;
                this.totalCost += inputCost + outputCost;
            }

            this.updateTokenDisplay();
        }

        // Display tool calls if any were made
        if (response.allToolCalls && response.allToolCalls.length > 0) {
            for (let i = 0; i < response.allToolCalls.length; i++) {
                const toolCall = response.allToolCalls[i];
                const toolResult = response.allToolResults[i];

                // Display the tool call
                this.addToolUse(toolCall.name, toolCall.arguments);

                // Display the tool result
                if (toolResult) {
                    this.addToolResult(toolResult.result);
                }
            }
        }

        // Display the response content with model metadata
        if (response.content) {
            const metadata = {
                provider: this.currentProvider,
                model: this.modelSelect.value
            };
            this.addMessage(response.content, 'assistant', metadata);

            // Add to local messages array with metadata for persistence
            this.messages.push({
                role: 'assistant',
                content: response.content,
                metadata: metadata
            });
        }

        // Auto-save after processing response
        if (this.autoSave) {
            await this.autoSaveChatHistory();
        }
    }

    // Legacy method - kept for compatibility but now uses unified system
    async callClaude(messages) {
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

    async processClaudeResponse(response) {
        // Update token usage if available
        if (response.usage) {
            const inputTokens = response.usage.input_tokens || 0;
            const outputTokens = response.usage.output_tokens || 0;
            this.totalTokens += inputTokens + outputTokens;

            // Update current context usage (this represents the current conversation size)
            this.currentContextTokens = inputTokens + outputTokens;

            // Calculate cost for this request
            const model = this.modelSelect.value;
            const pricing = this.modelPricing[model];
            if (pricing) {
                const inputCost = (inputTokens / 1000000) * pricing.input;
                const outputCost = (outputTokens / 1000000) * pricing.output;
                this.totalCost += inputCost + outputCost;
            }

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

            // Get Claude's response after tool use
            try {
                const followUpResponse = await this.callClaude(this.messages);
                await this.processClaudeResponse(followUpResponse);
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
        const chat = new ClaudeChat(tools);
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}