class FileTree {
    constructor(tab) {
        this.tab = tab;
        this.element = null;
        this.searchInput = null;
        this.searchClearButton = null;
        this.actionButton = null;
        this.treeBody = null;
        this.actionMenu = null;
        this.selectedElement = null;
        this.selectedPath = null;
        this.fs = null;
        this.shell = null;
        this.expandedFolders = new Set();
        this.draggingElement = null;
        this.searchTerm = '';
        this.currentContextMenu = null;
        this.currentContextMenuCloseHandler = null;
        
        this._createFileTree();
        this._attachToTab();
        this._initializeFileSystem();
    }
    
    _createFileTree() {
        this.element = document.createElement('div');
        this.element.className = 'file-tree';
        
        const header = document.createElement('div');
        header.className = 'file-tree-header';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'file-tree-search';
        
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'file-tree-search-wrapper';
        
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.className = 'file-tree-search-input';
        this.searchInput.placeholder = 'Search files...';
        this.searchInput.addEventListener('input', (e) => {
            this._handleSearch(e.target.value);
            this._updateSearchClearButton();
        });
        
        this.searchClearButton = document.createElement('button');
        this.searchClearButton.className = 'file-tree-search-clear';
        this.searchClearButton.innerHTML = '×';
        this.searchClearButton.style.display = 'none';
        this.searchClearButton.addEventListener('click', () => {
            this.searchInput.value = '';
            this._handleSearch('');
            this._updateSearchClearButton();
            this.searchInput.focus();
        });
        
        searchWrapper.appendChild(this.searchInput);
        searchWrapper.appendChild(this.searchClearButton);
        searchContainer.appendChild(searchWrapper);
        
        const actionContainer = document.createElement('div');
        actionContainer.className = 'file-tree-action';
        
        this.actionButton = document.createElement('button');
        this.actionButton.className = 'file-tree-action-button';
        this.actionButton.innerHTML = '⋮';
        this.actionButton.addEventListener('click', (e) => this._toggleActionMenu(e));
        actionContainer.appendChild(this.actionButton);
        
        this.actionMenu = document.createElement('div');
        this.actionMenu.className = 'file-tree-action-menu';
        actionContainer.appendChild(this.actionMenu);
        
        header.appendChild(searchContainer);
        header.appendChild(actionContainer);
        
        this.treeBody = document.createElement('div');
        this.treeBody.className = 'file-tree-body';
        this.treeBody.innerHTML = '<div class="file-tree-placeholder">Loading file system...</div>';
        
        // Add left-click handler for blank area to deselect
        this.treeBody.addEventListener('click', (e) => {
            // Only handle if we clicked on the tree body itself (blank area)
            if (e.target === this.treeBody || e.target.classList.contains('file-tree-placeholder')) {
                this._deselectItem();
            }
        });
        
        // Add right-click handler for blank area
        this.treeBody.addEventListener('contextmenu', (e) => {
            // Only handle if we clicked on the tree body itself (blank area)
            if (e.target === this.treeBody || e.target.classList.contains('file-tree-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
                this._deselectItem(); // Also deselect on right-click
                this._showContextMenuBlank(e);
            }
        });
        
        // Add drop handlers for the blank area (root folder)
        this._addRootDropHandlers();
        
        this.element.appendChild(header);
        this.element.appendChild(this.treeBody);
        
        // Close menu when clicking anywhere except the action button or inside the menu
        document.addEventListener('click', (e) => {
            // If the menu is active and we didn't click the button or menu content
            if (this.actionMenu.classList.contains('active')) {
                if (!this.actionButton.contains(e.target) && !this.actionMenu.contains(e.target)) {
                    this._closeActionMenu();
                }
            }
        });
        
        // Listen for other menus opening and close our menus
        window.addEventListener('menuOpened', (e) => {
            if (e.detail.source !== 'filetree' && e.detail.source !== 'filetree-context') {
                this._closeActionMenu();
                this._closeContextMenu();
            } else if (e.detail.source === 'filetree') {
                // Close context menu when action menu opens
                this._closeContextMenu();
            } else if (e.detail.source === 'filetree-context') {
                // Close action menu when context menu opens
                this._closeActionMenu();
            }
        });
    }
    
    _attachToTab() {
        if (this.tab && this.tab.div) {
            this.tab.div.innerHTML = '';
            this.tab.div.appendChild(this.element);
        }
    }
    
    _toggleActionMenu(e) {
        e.stopPropagation();
        const isActive = this.actionMenu.classList.contains('active');
        
        if (isActive) {
            this._closeActionMenu();
        } else {
            this._openActionMenu();
        }
    }
    
    _buildActionMenu() {
        // Clear existing menu items
        this.actionMenu.innerHTML = '';
        
        // Always add Create File
        const createFileItem = document.createElement('div');
        createFileItem.className = 'file-tree-action-menu-item';
        createFileItem.innerHTML = '📄 Create File';
        createFileItem.addEventListener('click', () => {
            this._closeActionMenu();
            this._openNewFileModal();
        });
        this.actionMenu.appendChild(createFileItem);
        
        // Always add Import File
        const importFileItem = document.createElement('div');
        importFileItem.className = 'file-tree-action-menu-item';
        importFileItem.innerHTML = '📥 Import File';
        importFileItem.addEventListener('click', () => {
            this._closeActionMenu();
            this._openUploadModal();
        });
        this.actionMenu.appendChild(importFileItem);
        
        // Add Deselect option if something is selected
        if (this.selectedElement && this.selectedPath) {
            const deselectItem = document.createElement('div');
            deselectItem.className = 'file-tree-action-menu-item';
            deselectItem.innerHTML = '⭕ Deselect';
            deselectItem.addEventListener('click', () => {
                this._closeActionMenu();
                this._deselectItem();
            });
            this.actionMenu.appendChild(deselectItem);
        }
    }
    
    _openActionMenu() {
        // Dispatch event to close other menus
        window.dispatchEvent(new CustomEvent('menuOpened', { detail: { source: 'filetree' } }));
        
        this._buildActionMenu();
        this.actionMenu.classList.add('active');
        this.actionButton.classList.add('active');
    }
    
    _closeActionMenu() {
        this.actionMenu.classList.remove('active');
        this.actionButton.classList.remove('active');
    }
    
    _deselectItem() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
            this.selectedPath = null;
        }
    }
    
    _handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase().trim();
        this._loadFileTree();
    }
    
    _updateSearchClearButton() {
        if (this.searchClearButton) {
            this.searchClearButton.style.display = this.searchInput.value ? 'block' : 'none';
        }
    }
    
    _itemMatchesSearch(item) {
        // Check if the item name matches the search term
        if (item.name.toLowerCase().includes(this.searchTerm)) {
            return true;
        }
        
        // If it's a folder, check if any children match
        if (item.type === 'folder' && item.children) {
            for (let child of item.children) {
                if (this._itemMatchesSearch(child)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    async _initializeFileSystem() {
        try {
            // Try to use IndexedDB first
            this.fs = new Filer.FileSystem({
                name: 'pixied-fs',
                provider: new Filer.FileSystem.providers.IndexedDB()
            });
            
            this.shell = new this.fs.Shell();
            
            // Test if filesystem works
            await new Promise((resolve, reject) => {
                this.fs.readdir('/', (err, files) => {
                    if (err) reject(err);
                    else resolve(files);
                });
            });
            
            console.log('IndexedDB filesystem initialized successfully');
            
            // Create initial structure if empty
            await this._createInitialStructure();
            
        } catch (error) {
            console.error('IndexedDB initialization failed:', error);
            
            // Show error modal
            const errorModal = new ErrorModalDialog('Could not load IndexedDB file system, falling back to MemoryFS.');
            
            // Fall back to memory filesystem
            try {
                this.fs = new Filer.FileSystem({
                    name: 'pixied-fs-memory',
                    provider: new Filer.FileSystem.providers.Memory()
                });
                
                this.shell = new this.fs.Shell();
                
                console.log('Memory filesystem initialized as fallback');
                
                // Create initial structure
                await this._createInitialStructure();
                
            } catch (memError) {
                console.error('Memory filesystem also failed:', memError);
                this.treeBody.innerHTML = '<div class="file-tree-placeholder">Failed to initialize file system</div>';
                return;
            }
        }
        
        // Load the file tree
        this._loadFileTree();
    }
    
    async _createInitialStructure() {
        return new Promise((resolve) => {
            const sh = this.shell;
            
            // Check if root is empty
            this.fs.readdir('/', (err, files) => {
                if (err || !files || files.length === 0) {
                    // Create initial folder structure
                    sh.mkdirp('/images/sprites', (err) => {
                        if (!err) sh.mkdirp('/images/ui');
                        sh.mkdirp('/audio/music');
                        sh.mkdirp('/audio/sfx');
                        sh.mkdirp('/scenes');
                        sh.mkdirp('/scripts');
                        
                        // Create some initial files
                        this.fs.writeFile('/README.md', '# PixiEd Project\n\nWelcome to your new project!', () => {});
                        this.fs.writeFile('/project.json', '{"name": "New Project", "version": "1.0.0"}', () => {});
                        
                        setTimeout(() => resolve(), 100);
                    });
                } else {
                    resolve();
                }
            });
        });
    }
    
    async _loadFileTree() {
        this.treeBody.innerHTML = '';
        
        try {
            const structure = await this._readDirectoryRecursive('/');
            if (structure.children && structure.children.length > 0) {
                this._renderFileTree(structure.children, this.treeBody, 0);
                
                // Restore selection if it exists
                if (this.selectedPath) {
                    const elementToSelect = this.treeBody.querySelector(`[data-path="${this.selectedPath}"]`);
                    if (elementToSelect) {
                        elementToSelect.classList.add('selected');
                        this.selectedElement = elementToSelect;
                    }
                }
            } else {
                this.treeBody.innerHTML = '<div class="file-tree-placeholder">No files in project</div>';
            }
        } catch (error) {
            console.error('Error loading file tree:', error);
            this.treeBody.innerHTML = '<div class="file-tree-placeholder">Error loading files</div>';
        }
    }
    
    async _readDirectoryRecursive(path) {
        return new Promise((resolve) => {
            this.fs.readdir(path, (err, files) => {
                if (err) {
                    resolve({ name: path.split('/').pop() || '/', type: 'folder', children: [] });
                    return;
                }
                
                const result = {
                    name: path.split('/').pop() || '/',
                    type: 'folder',
                    children: []
                };
                
                if (!files || files.length === 0) {
                    resolve(result);
                    return;
                }
                
                let processed = 0;
                
                files.forEach(file => {
                    const fullPath = path === '/' ? `/${file}` : `${path}/${file}`;
                    
                    this.fs.stat(fullPath, async (err, stats) => {
                        if (!err) {
                            if (stats.isDirectory()) {
                                const subdir = await this._readDirectoryRecursive(fullPath);
                                result.children.push(subdir);
                            } else {
                                result.children.push({
                                    name: file,
                                    type: 'file'
                                });
                            }
                        }
                        
                        processed++;
                        if (processed === files.length) {
                            // Sort: folders first, then files, alphabetically
                            result.children.sort((a, b) => {
                                if (a.type === b.type) {
                                    return a.name.localeCompare(b.name);
                                }
                                return a.type === 'folder' ? -1 : 1;
                            });
                            resolve(result);
                        }
                    });
                });
            });
        });
    }
    
    
    _renderFileTree(items, container, level, parentPath = '') {
        items.forEach(item => {
            // Filter based on search term
            if (this.searchTerm) {
                // Check if this item or any of its children match the search
                const matches = this._itemMatchesSearch(item);
                if (!matches) {
                    return; // Skip this item
                }
            }
            
            const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
            const fullPath = `/${itemPath}`;
            const itemElement = document.createElement('div');
            itemElement.className = 'file-tree-item';
            
            if (item.type === 'folder') {
                const folderHeader = document.createElement('div');
                folderHeader.className = 'file-tree-folder';
                folderHeader.style.paddingLeft = `${level * 20 + 8}px`;
                folderHeader.dataset.path = fullPath;
                folderHeader.dataset.type = 'folder';
                folderHeader.draggable = !this.searchTerm; // Disable drag when searching
                
                const arrow = document.createElement('span');
                arrow.className = 'file-tree-arrow';
                arrow.textContent = '▶';
                
                const folderIcon = document.createElement('span');
                folderIcon.className = 'file-tree-icon';
                folderIcon.textContent = '📁';
                
                const folderName = document.createElement('span');
                folderName.className = 'file-tree-name';
                folderName.textContent = item.name;
                
                const editButton = document.createElement('span');
                editButton.className = 'file-tree-edit';
                editButton.textContent = '✏️';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handleRename(fullPath, item.name);
                });
                
                const deleteButton = document.createElement('span');
                deleteButton.className = 'file-tree-delete';
                deleteButton.textContent = '🗑️';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handleDelete(fullPath, item.name, 'folder');
                });
                
                folderHeader.appendChild(arrow);
                folderHeader.appendChild(folderIcon);
                folderHeader.appendChild(folderName);
                folderHeader.appendChild(editButton);
                folderHeader.appendChild(deleteButton);
                itemElement.appendChild(folderHeader);
                
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'file-tree-children';
                childrenContainer.style.display = 'none';
                
                if (item.children) {
                    this._renderFileTree(item.children, childrenContainer, level + 1, itemPath);
                }
                
                itemElement.appendChild(childrenContainer);
                
                // Drag handlers for folder (only when not searching)
                if (!this.searchTerm) {
                    this._addDragHandlers(folderHeader, fullPath, item.name, 'folder');
                    
                    // Drop handlers for folder (can receive items)
                    this._addDropHandlers(folderHeader, fullPath, childrenContainer, arrow, folderIcon);
                }
                
                // Check if this folder should be expanded
                // Auto-expand when searching to show matches
                if (this.expandedFolders.has(fullPath) || this.searchTerm) {
                    childrenContainer.style.display = 'block';
                    arrow.textContent = '▼';
                    folderIcon.textContent = '📂';
                }
                
                folderHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Close menus if they're open
                    this._closeActionMenu();
                    this._closeContextMenu();
                    
                    // Handle selection
                    this._selectItem(folderHeader, fullPath);
                    
                    // Handle expansion
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    arrow.textContent = isExpanded ? '▶' : '▼';
                    folderIcon.textContent = isExpanded ? '📁' : '📂';
                    
                    // Track expanded state
                    if (!isExpanded) {
                        this.expandedFolders.add(fullPath);
                    } else {
                        this.expandedFolders.delete(fullPath);
                    }
                });
                
                folderHeader.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._selectItem(folderHeader, fullPath);
                    this._showContextMenu(e, fullPath, item.name, 'folder');
                });
                
                folderHeader.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    // Double-click to rename (except on buttons)
                    if (!e.target.classList.contains('file-tree-edit') && 
                        !e.target.classList.contains('file-tree-delete')) {
                        this._handleRename(fullPath, item.name);
                    }
                });
            } else {
                const fileHeader = document.createElement('div');
                fileHeader.className = 'file-tree-file';
                fileHeader.style.paddingLeft = `${level * 20 + 8}px`;
                fileHeader.dataset.path = fullPath;
                fileHeader.dataset.type = 'file';
                fileHeader.draggable = !this.searchTerm; // Disable drag when searching
                
                const fileIcon = document.createElement('span');
                fileIcon.className = 'file-tree-icon';
                fileIcon.textContent = this._getFileIcon(item.name);
                
                const fileName = document.createElement('span');
                fileName.className = 'file-tree-name';
                fileName.textContent = item.name;
                
                const editButton = document.createElement('span');
                editButton.className = 'file-tree-edit';
                editButton.textContent = '✏️';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handleRename(fullPath, item.name);
                });
                
                const deleteButton = document.createElement('span');
                deleteButton.className = 'file-tree-delete';
                deleteButton.textContent = '🗑️';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handleDelete(fullPath, item.name, 'file');
                });
                
                fileHeader.appendChild(fileIcon);
                fileHeader.appendChild(fileName);
                fileHeader.appendChild(editButton);
                fileHeader.appendChild(deleteButton);
                itemElement.appendChild(fileHeader);
                
                // Drag handlers for file (only when not searching)
                if (!this.searchTerm) {
                    this._addDragHandlers(fileHeader, fullPath, item.name, 'file');
                    // Add drop handlers for prefab creation
                    this._addFileDropHandlers(fileHeader, fullPath, item.name);
                }
                
                fileHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Close menus if they're open
                    this._closeActionMenu();
                    this._closeContextMenu();
                    
                    this._selectItem(fileHeader, fullPath);
                    console.log(`Selected file: ${fullPath}`);
                });
                
                fileHeader.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._selectItem(fileHeader, fullPath);
                    this._showContextMenu(e, fullPath, item.name, 'file');
                });
                
                fileHeader.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    // Check if it's a scene file
                    if (item.name.endsWith('.scn.json')) {
                        this._handleOpenScene(fullPath);
                    } else if (item.name === 'project.json') {
                        // Open Project Settings tab for project.json
                        this._openProjectSettings();
                    } else if (!e.target.classList.contains('file-tree-edit') && 
                        !e.target.classList.contains('file-tree-delete')) {
                        // Double-click to rename for other files
                        this._handleRename(fullPath, item.name);
                    }
                });
            }
            
            container.appendChild(itemElement);
        });
    }
    
    _addDragHandlers(element, path, name, type) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            
            // Check if this is a prefab or scene file
            const isPrefab = name.endsWith('.fab.json');
            const isScene = name.endsWith('.scn.json');
            
            const dragData = {
                path: path,
                name: name,
                type: type,
                isPrefab: isPrefab,
                isScene: isScene
            };
            
            e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
            if (isPrefab) {
                e.dataTransfer.setData('application/x-pixied-prefab', JSON.stringify(dragData));
            } else if (isScene) {
                e.dataTransfer.setData('application/x-pixied-scene', JSON.stringify(dragData));
            }
            
            element.classList.add('dragging');
            
            // Store dragging element for reference
            this.draggingElement = element;
        });
        
        element.addEventListener('dragend', (e) => {
            element.classList.remove('dragging');
            this.draggingElement = null;
            
            // Clean up any drop indicators
            document.querySelectorAll('.drop-target').forEach(el => {
                el.classList.remove('drop-target');
            });
        });
    }
    
    _addDropHandlers(folderElement, folderPath, childrenContainer, arrow, folderIcon) {
        folderElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            // Don't allow dropping on itself or its parent
            if (this.draggingElement === folderElement) {
                return;
            }
            
            // Check if dragging element is a parent of this folder
            const dragData = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
            if (dragData.path && folderPath.startsWith(dragData.path + '/')) {
                return;
            }
            
            folderElement.classList.add('drop-target');
        });
        
        folderElement.addEventListener('dragleave', (e) => {
            if (e.target === folderElement) {
                folderElement.classList.remove('drop-target');
            }
        });
        
        folderElement.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            folderElement.classList.remove('drop-target');
            
            // Get the drag data
            const dragData = e.dataTransfer.getData('text/plain');
            
            if (!dragData) return;
            
            let data;
            try {
                data = JSON.parse(dragData);
            } catch (err) {
                // Not valid JSON, ignore
                return;
            }
            
            // Check if this is a scene object (for prefab creation)
            if (data.type === 'sceneObject') {
                await this._createPrefabFromSceneObject(data.objectId, data.objectName, folderPath);
                return;
            }
            
            // Otherwise, handle normal file tree drag
            if (!data.path || !data.name) return;
            
            // Don't allow dropping on itself
            if (data.path === folderPath) return;
            
            // Don't allow dropping a parent into its child
            if (folderPath.startsWith(data.path + '/')) {
                console.error('Cannot move a folder into its own subfolder');
                return;
            }
            
            const newPath = `${folderPath}/${data.name}`;
            
            // Optimistic UI update - immediately move the DOM element
            if (this.draggingElement && this.draggingElement.parentElement) {
                const draggedItem = this.draggingElement.parentElement;
                
                // Ensure target folder is expanded first
                if (childrenContainer.style.display === 'none') {
                    childrenContainer.style.display = 'block';
                    arrow.textContent = '▼';
                    folderIcon.textContent = '📂';
                }
                this.expandedFolders.add(folderPath);
                
                // Move the DOM element immediately for instant feedback
                draggedItem.style.transition = 'opacity 0.2s';
                draggedItem.style.opacity = '0.3';
                
                // Perform the actual file system move
                try {
                    await this._moveItem(data.path, newPath);
                    
                    // Only reload after successful move
                    // Use requestAnimationFrame to ensure smooth update
                    requestAnimationFrame(() => {
                        this._loadFileTree();
                    });
                } catch (error) {
                    // Restore opacity on error
                    draggedItem.style.opacity = '1';
                    console.error('Error moving item:', error);
                    const errorModal = new ErrorModalDialog(`Failed to move ${data.name}: ${error.message}`);
                    
                    // Reload to restore correct state
                    this._loadFileTree();
                }
            } else {
                // Fallback if we don't have the dragging element reference
                try {
                    await this._moveItem(data.path, newPath);
                    this.expandedFolders.add(folderPath);
                    requestAnimationFrame(() => {
                        this._loadFileTree();
                    });
                } catch (error) {
                    console.error('Error moving item:', error);
                    const errorModal = new ErrorModalDialog(`Failed to move ${data.name}: ${error.message}`);
                }
            }
        });
    }
    
    async _moveItem(oldPath, newPath) {
        return new Promise((resolve, reject) => {
            // Filer uses rename for moving files/folders
            this.fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Moved ${oldPath} to ${newPath}`);
                    resolve();
                }
            });
        });
    }
    
    _selectItem(element, path) {
        // Remove previous selection
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
        }
        
        // Add new selection
        this.selectedElement = element;
        this.selectedPath = path;
        element.classList.add('selected');
    }
    
    _getFileIcon(filename) {
        // Check for prefab files first
        if (filename.endsWith('.fab.json')) {
            return '🎯'; // Special icon for prefabs
        }
        
        const extension = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'png': '🖼️',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'gif': '🖼️',
            'mp3': '🎵',
            'wav': '🎵',
            'ogg': '🎵',
            'js': '📜',
            'json': '📋',
            'md': '📝',
            'scene': '🎬',
            'txt': '📄'
        };
        return iconMap[extension] || '📄';
    }
    
    _handleRename(fullPath, currentName) {
        const modal = new RenameModal(
            currentName,
            async (newName) => {
                // Handle rename confirmation
                if (newName && newName !== currentName) {
                    try {
                        // Calculate new path
                        const pathParts = fullPath.split('/');
                        pathParts[pathParts.length - 1] = newName;
                        const newPath = pathParts.join('/');
                        
                        // Rename in filesystem
                        await this._renameItem(fullPath, newPath);
                        
                        // Reload the tree
                        this._loadFileTree();
                    } catch (error) {
                        console.error('Error renaming:', error);
                        const errorModal = new ErrorModalDialog(`Failed to rename ${currentName}: ${error.message}`);
                    }
                }
            },
            () => {
                // Handle cancel
                console.log('Rename cancelled');
            }
        );
    }
    
    async _renameItem(oldPath, newPath) {
        return new Promise((resolve, reject) => {
            this.fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Renamed ${oldPath} to ${newPath}`);
                    resolve();
                }
            });
        });
    }
    
    _openNewFileModal() {
        const modal = new NewFileModal(
            this,
            async (fullPath) => {
                // Handle file creation
                try {
                    // Determine initial content based on file type
                    let initialContent = '';
                    if (fullPath.endsWith('.fab.json')) {
                        // Create empty prefab template
                        initialContent = JSON.stringify({
                            version: "1.0.0",
                            type: "prefab",
                            metadata: {
                                created: new Date().toISOString(),
                                modified: new Date().toISOString()
                            },
                            assets: {
                                textures: [],
                                fonts: []
                            },
                            root: null
                        }, null, 2);
                    } else if (fullPath.endsWith('.json')) {
                        initialContent = '{}';
                    } else if (fullPath.endsWith('.js')) {
                        initialContent = '// New JavaScript file\n';
                    }
                    
                    // Create the file
                    await this._createFile(fullPath, initialContent);
                    
                    // Reload the tree
                    this._loadFileTree();
                    
                    console.log(`Created file: ${fullPath}`);
                } catch (error) {
                    console.error('Error creating file:', error);
                    const errorModal = new ErrorModalDialog(`Failed to create file: ${error.message}`);
                }
            },
            () => {
                // Handle cancel
                console.log('File creation cancelled');
            }
        );
    }
    
    async _createFile(path, content) {
        return new Promise((resolve, reject) => {
            this.fs.writeFile(path, content, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    
    _openUploadModal() {
        const modal = new UploadFileModal(
            this,
            async (files, targetDir, progressCallback) => {
                // Handle file uploads
                try {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const fullPath = targetDir + file.name;
                        
                        // Update progress to 0%
                        progressCallback(i, 0);
                        
                        // Read file content
                        const content = await this._readFileContent(file);
                        
                        // Update progress to 50%
                        progressCallback(i, 50);
                        
                        // Write file to filesystem
                        await this._createFile(fullPath, content);
                        
                        // Update progress to 100%
                        progressCallback(i, 100);
                        
                        console.log(`Uploaded file: ${fullPath}`);
                    }
                    
                    // Reload the tree after all uploads
                    this._loadFileTree();
                } catch (error) {
                    console.error('Error uploading files:', error);
                    const errorModal = new ErrorModalDialog(`Failed to upload files: ${error.message}`);
                }
            },
            () => {
                // Handle cancel
                console.log('File upload cancelled');
            }
        );
    }
    
    async _readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            // Determine if file is text or binary
            const textExtensions = ['.js', '.json', '.md', '.txt', '.html', '.css', '.xml', '.svg'];
            const isText = textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = (e) => {
                reject(new Error(`Failed to read file: ${file.name}`));
            };
            
            if (isText) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }
    
    _handleDelete(fullPath, name, type) {
        const modal = new DeleteConfirmModal(
            name,
            async () => {
                // Handle delete confirmation
                try {
                    if (type === 'folder') {
                        // Recursively delete folder and contents
                        await this._deleteRecursive(fullPath);
                    } else {
                        // Delete single file
                        await this._deleteFile(fullPath);
                    }
                    
                    // Reload the tree
                    this._loadFileTree();
                } catch (error) {
                    console.error('Error deleting:', error);
                    const errorModal = new ErrorModalDialog(`Failed to delete ${name}: ${error.message}`);
                }
            },
            () => {
                // Handle cancel
                console.log('Delete cancelled');
            }
        );
    }
    
    async _deleteFile(path) {
        return new Promise((resolve, reject) => {
            this.fs.unlink(path, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Deleted file: ${path}`);
                    resolve();
                }
            });
        });
    }
    
    async _deleteRecursive(path) {
        return new Promise((resolve, reject) => {
            // Use shell.rm with recursive flag
            this.shell.rm(path, { recursive: true }, (err) => {
                if (err) {
                    // Fallback to manual recursive deletion if shell.rm doesn't work
                    this._manualDeleteRecursive(path)
                        .then(resolve)
                        .catch(reject);
                } else {
                    console.log(`Deleted folder recursively: ${path}`);
                    resolve();
                }
            });
        });
    }
    
    async _manualDeleteRecursive(path) {
        // Manual recursive deletion
        const files = await new Promise((resolve, reject) => {
            this.fs.readdir(path, (err, files) => {
                if (err) reject(err);
                else resolve(files || []);
            });
        });
        
        // Delete all contents first
        for (const file of files) {
            const fullPath = `${path}/${file}`;
            const stats = await new Promise((resolve, reject) => {
                this.fs.stat(fullPath, (err, stats) => {
                    if (err) reject(err);
                    else resolve(stats);
                });
            });
            
            if (stats.isDirectory()) {
                await this._manualDeleteRecursive(fullPath);
            } else {
                await this._deleteFile(fullPath);
            }
        }
        
        // Delete the empty directory
        return new Promise((resolve, reject) => {
            this.fs.rmdir(path, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Deleted empty folder: ${path}`);
                    resolve();
                }
            });
        });
    }
    
    _showContextMenu(event, path, name, type) {
        // Close any existing context menu
        if (this.currentContextMenu) {
            this._closeContextMenu();
        }
        
        // Dispatch event to close other menus
        window.dispatchEvent(new CustomEvent('menuOpened', { detail: { source: 'filetree-context' } }));
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        this.currentContextMenu = menu;
        
        const menuItems = [
            { label: 'Rename', icon: '✏️', action: () => this._handleRename(path, name) },
            { label: 'Delete', icon: '🗑️', action: () => this._handleDelete(path, name, type) },
            { separator: true },
            { label: 'Create File', icon: '📄', action: () => this._openNewFileModal() },
            { label: 'Import File', icon: '📥', action: () => this._openUploadModal() }
        ];
        
        // Add Deselect option if something is selected
        if (this.selectedPath) {
            menuItems.push({ separator: true });
            menuItems.push({ label: 'Deselect', icon: '⭕', action: () => this._deselectItem() });
        }
        
        menuItems.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.innerHTML = `${item.icon} ${item.label}`;
                
                menuItem.addEventListener('click', () => {
                    item.action();
                    this._closeContextMenu();
                });
                
                menu.appendChild(menuItem);
            }
        });
        
        // Position menu
        menu.style.position = 'fixed';
        menu.style.visibility = 'hidden';
        document.body.appendChild(menu);
        
        // Get menu dimensions
        const menuRect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate position
        let left = event.clientX;
        let top = event.clientY;
        
        // Check if menu would go off the right edge
        if (left + menuRect.width > windowWidth - 10) {
            left = Math.max(10, event.clientX - menuRect.width);
        }
        
        // Check if menu would go off the bottom edge
        if (top + menuRect.height > windowHeight - 10) {
            top = Math.max(10, windowHeight - menuRect.height - 10);
        }
        
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.visibility = 'visible';
        
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                this._closeContextMenu();
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            this.currentContextMenuCloseHandler = closeMenu;
        }, 0);
    }
    
    _closeContextMenu() {
        if (this.currentContextMenu && document.body.contains(this.currentContextMenu)) {
            document.body.removeChild(this.currentContextMenu);
            if (this.currentContextMenuCloseHandler) {
                document.removeEventListener('click', this.currentContextMenuCloseHandler);
                this.currentContextMenuCloseHandler = null;
            }
            this.currentContextMenu = null;
        }
    }
    
    _showContextMenuBlank(event) {
        // Close any existing context menu
        if (this.currentContextMenu) {
            this._closeContextMenu();
        }
        
        // Dispatch event to close other menus
        window.dispatchEvent(new CustomEvent('menuOpened', { detail: { source: 'filetree-context' } }));
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        this.currentContextMenu = menu;
        
        const menuItems = [
            { label: 'Create File', icon: '📄', action: () => this._openNewFileModal() },
            { label: 'Import File', icon: '📥', action: () => this._openUploadModal() }
        ];
        
        // Add Deselect option if something is selected
        if (this.selectedPath) {
            menuItems.push({ separator: true });
            menuItems.push({ label: 'Deselect', icon: '⭕', action: () => this._deselectItem() });
        }
        
        menuItems.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.innerHTML = `${item.icon} ${item.label}`;
                
                menuItem.addEventListener('click', () => {
                    item.action();
                    this._closeContextMenu();
                });
                
                menu.appendChild(menuItem);
            }
        });
        
        // Position menu
        menu.style.position = 'fixed';
        menu.style.visibility = 'hidden';
        document.body.appendChild(menu);
        
        // Get menu dimensions
        const menuRect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate position
        let left = event.clientX;
        let top = event.clientY;
        
        // Check if menu would go off the right edge
        if (left + menuRect.width > windowWidth - 10) {
            left = Math.max(10, event.clientX - menuRect.width);
        }
        
        // Check if menu would go off the bottom edge
        if (top + menuRect.height > windowHeight - 10) {
            top = Math.max(10, windowHeight - menuRect.height - 10);
        }
        
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.visibility = 'visible';
        
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                this._closeContextMenu();
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            this.currentContextMenuCloseHandler = closeMenu;
        }, 0);
    }
    
    _addRootDropHandlers() {
        this.treeBody.addEventListener('dragover', (e) => {
            // Only handle if dragging over the blank area
            if (e.target === this.treeBody || e.target.classList.contains('file-tree-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if this is a scene object or file/folder being dragged
                if (e.dataTransfer.types.includes('application/x-pixied-sceneobject') ||
                    e.dataTransfer.types.includes('text/plain')) {
                    this.treeBody.classList.add('drop-target');
                }
            }
        });
        
        this.treeBody.addEventListener('dragleave', (e) => {
            if (e.target === this.treeBody) {
                this.treeBody.classList.remove('drop-target');
            }
        });
        
        this.treeBody.addEventListener('drop', async (e) => {
            // Only handle if dropped on the blank area
            if (e.target === this.treeBody || e.target.classList.contains('file-tree-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
                
                this.treeBody.classList.remove('drop-target');
                
                const dragData = e.dataTransfer.getData('text/plain');
                if (!dragData) return;
                
                let data;
                try {
                    data = JSON.parse(dragData);
                } catch (err) {
                    return;
                }
                
                // Check if this is a file/folder from the file tree being moved to root
                if ((data.type === 'file' || data.type === 'folder') && data.path && data.name) {
                    // Don't move if already in root
                    if (data.path === '/' + data.name) {
                        return;
                    }
                    
                    const newPath = '/' + data.name;
                    
                    // Optimistic UI update - immediately move the DOM element
                    if (this.draggingElement && this.draggingElement.parentElement) {
                        const draggedItem = this.draggingElement.parentElement;
                        draggedItem.style.transition = 'opacity 0.2s';
                        draggedItem.style.opacity = '0.3';
                        
                        // Perform the actual file system move
                        try {
                            await this._moveItem(data.path, newPath);
                            
                            // Only reload after successful move
                            requestAnimationFrame(() => {
                                this._loadFileTree();
                            });
                        } catch (error) {
                            // Restore opacity on error
                            draggedItem.style.opacity = '1';
                            console.error('Error moving item to root:', error);
                            const errorModal = new ErrorModalDialog(`Failed to move ${data.name} to root: ${error.message}`);
                            
                            // Reload to restore correct state
                            this._loadFileTree();
                        }
                    } else {
                        // Fallback if we don't have the dragging element reference
                        try {
                            await this._moveItem(data.path, newPath);
                            requestAnimationFrame(() => {
                                this._loadFileTree();
                            });
                        } catch (error) {
                            console.error('Error moving item to root:', error);
                            const errorModal = new ErrorModalDialog(`Failed to move ${data.name} to root: ${error.message}`);
                        }
                    }
                    return;
                }
                
                // Check if this is a scene object (for prefab creation)
                if (data.type === 'sceneObject') {
                    // Create prefab in root folder
                    await this._createPrefabFromSceneObject(data.objectId, data.objectName, '/');
                }
            }
        });
    }
    
    _addFileDropHandlers(fileElement, filePath, fileName) {
        fileElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const dragData = e.dataTransfer.getData('text/plain') || e.dataTransfer.types.includes('application/x-pixied-sceneobject');
            if (dragData || e.dataTransfer.types.includes('application/x-pixied-sceneobject')) {
                fileElement.classList.add('drop-target');
            }
        });
        
        fileElement.addEventListener('dragleave', (e) => {
            if (e.target === fileElement) {
                fileElement.classList.remove('drop-target');
            }
        });
        
        fileElement.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            fileElement.classList.remove('drop-target');
            
            const dragData = e.dataTransfer.getData('text/plain');
            if (!dragData) return;
            
            let data;
            try {
                data = JSON.parse(dragData);
            } catch (err) {
                return;
            }
            
            // Check if this is a scene object drop
            if (data.type === 'sceneObject') {
                // Check if this file is a prefab
                if (fileName.endsWith('.fab.json')) {
                    // Override the prefab
                    await this._createPrefabFromSceneObject(data.objectId, data.objectName, filePath, true);
                } else {
                    // Create new prefab in parent folder
                    const parentPath = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
                    await this._createPrefabFromSceneObject(data.objectId, data.objectName, parentPath);
                }
                return;
            }
            
            // Handle regular file drops (moving files)
            if (data.path && data.name) {
                // Can't drop a file on another file for moving
                console.log('Cannot move a file onto another file');
            }
        });
    }
    
    async _createPrefabFromSceneObject(objectId, objectName, targetPath, overwrite = false) {
        // Get the scene manager and object
        const sceneManager = window.sceneManager;
        if (!sceneManager) {
            console.error('Scene manager not available');
            return;
        }
        
        const pixiObject = sceneManager.objectMap.get(objectId);
        if (!pixiObject) {
            console.error('Object not found in scene');
            return;
        }
        
        // Serialize the object as a prefab
        const prefabData = SceneSerialization.serializePrefab(pixiObject, sceneManager);
        const json = JSON.stringify(prefabData, null, 2);
        
        // Determine the file path
        let fileName;
        if (overwrite && targetPath.endsWith('.fab.json')) {
            // Overwriting existing prefab
            fileName = targetPath;
        } else {
            // Create new prefab with sanitized name
            const safeName = objectName.replace(/[^a-zA-Z0-9_-]/g, '_');
            fileName = `${targetPath}/${safeName}.fab.json`;
            
            // Check if file exists and add number if needed
            let counter = 1;
            while (await this._fileExists(fileName)) {
                fileName = `${targetPath}/${safeName}_${counter}.fab.json`;
                counter++;
            }
        }
        
        // Write the file
        return new Promise((resolve, reject) => {
            this.fs.writeFile(fileName, json, (err) => {
                if (err) {
                    console.error('Error creating prefab:', err);
                    reject(err);
                } else {
                    console.log(`Prefab created: ${fileName}`);
                    this._loadFileTree(); // Refresh the tree
                    resolve(fileName);
                }
            });
        });
    }
    
    async _fileExists(path) {
        return new Promise((resolve) => {
            this.fs.stat(path, (err) => {
                resolve(!err);
            });
        });
    }
    
    _openProjectSettings() {
        if (window.rootDock) {
            const existingTab = window.rootDock.FindTab("Project Settings");
            if (existingTab) {
                existingTab.activate();
            } else {
                // Find the Scene View tab's dock (it can't be closed so it always exists)
                const sceneViewTab = window.rootDock.FindTab("Scene View");
                if (sceneViewTab && sceneViewTab.parent) {
                    const projectSettingsTab = sceneViewTab.parent.AddTab("Project Settings");
                    const projectSettingsView = new ProjectSettingsView(projectSettingsTab.div);
                    projectSettingsTab.activate();
                } else if (window.activeDock && window.activeDock.tabs) {
                    // Fallback if Scene View somehow doesn't exist
                    const projectSettingsTab = window.activeDock.AddTab("Project Settings");
                    const projectSettingsView = new ProjectSettingsView(projectSettingsTab.div);
                    projectSettingsTab.activate();
                }
            }
        }
    }
    
    async _handleOpenScene(scenePath) {
        const sceneManager = window.sceneManager;
        if (!sceneManager) return;
        
        const sceneInfo = sceneManager.getSceneInfo();
        console.log('[FileTree] Opening scene, current state:', sceneInfo);
        
        // Always show dialog if a scene is currently open
        if (sceneInfo.hasScene) {
            const sceneName = sceneManager.currentSceneName || 'Untitled Scene';
            console.log('[FileTree] Showing SaveChangesModal for:', sceneName);
            const modal = new SaveChangesModal(
                sceneName,
                async () => {
                    // Save current scene
                    await this._saveCurrentScene();
                    await this._loadScene(scenePath);
                },
                async () => {
                    // Don't save, just load new scene
                    await this._loadScene(scenePath);
                },
                () => {
                    // Cancel - do nothing
                }
            );
        } else {
            // No scene is open, load the scene directly
            console.log('[FileTree] No scene open, loading scene directly');
            await this._loadScene(scenePath);
        }
    }
    
    async _loadScene(scenePath) {
        const sceneManager = window.sceneManager;
        if (!sceneManager) return;
        
        // Read the scene file
        this.fs.readFile(scenePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading scene file:', err);
                new ErrorModalDialog('Failed to load scene file: ' + err.message);
                return;
            }
            
            try {
                const sceneData = JSON.parse(data);
                await SceneSerialization.deserialize(sceneData, sceneManager);
                sceneManager.openScene(scenePath, sceneData);
                
                // Update hierarchy tree
                if (window.hierarchyTree) {
                    window.hierarchyTree.renderTree();
                }
                
                console.log(`Scene loaded: ${scenePath}`);
            } catch (parseErr) {
                console.error('Error parsing scene file:', parseErr);
                new ErrorModalDialog('Invalid scene file format: ' + parseErr.message);
            }
        });
    }
    
    async _saveCurrentScene() {
        const sceneManager = window.sceneManager;
        if (!sceneManager || !sceneManager.currentScenePath) return;
        
        const sceneData = SceneSerialization.serialize(sceneManager);
        const json = JSON.stringify(sceneData, null, 2);
        
        return new Promise((resolve, reject) => {
            this.fs.writeFile(sceneManager.currentScenePath, json, 'utf8', (err) => {
                if (err) {
                    console.error('Error saving scene:', err);
                    new ErrorModalDialog('Failed to save scene: ' + err.message);
                    reject(err);
                } else {
                    sceneManager.markSaved();
                    console.log(`Scene saved: ${sceneManager.currentScenePath}`);
                    resolve();
                }
            });
        });
    }
}
