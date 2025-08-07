class HierarchyTree {
    constructor(container, sceneManager) {
        this.container = container;
        this.sceneManager = sceneManager;
        this.treeElement = null;
        this.nodeMap = new Map();
        this.expandedNodes = new Set();
        this.searchQuery = '';
        this.draggedObject = null;
        this.dropTarget = null;
        this.dropPosition = null;
        this.currentMenu = null;
        this.currentMenuCloseHandler = null;
        this.currentContextMenu = null;
        this.currentContextMenuCloseHandler = null;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'hierarchy-wrapper';
        
        const header = document.createElement('div');
        header.className = 'hierarchy-header';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'hierarchy-search';
        
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'hierarchy-search-wrapper';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search...';
        searchInput.className = 'hierarchy-search-input';
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTree();
            this.updateSearchClearButton();
        });
        
        this.searchClearButton = document.createElement('button');
        this.searchClearButton.className = 'hierarchy-search-clear';
        this.searchClearButton.innerHTML = '×';
        this.searchClearButton.style.display = 'none';
        this.searchClearButton.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            this.renderTree();
            this.updateSearchClearButton();
            searchInput.focus();
        });
        
        searchWrapper.appendChild(searchInput);
        searchWrapper.appendChild(this.searchClearButton);
        searchContainer.appendChild(searchWrapper);
        
        const actionContainer = document.createElement('div');
        actionContainer.className = 'hierarchy-action';
        
        const addButton = document.createElement('button');
        addButton.className = 'hierarchy-action-button';
        addButton.innerHTML = '⋮';
        addButton.title = 'Add Object';
        addButton.addEventListener('click', (e) => {
            this.showAddMenu(e);
        });
        
        actionContainer.appendChild(addButton);
        header.appendChild(searchContainer);
        header.appendChild(actionContainer);
        
        // Store reference to search input for clear button updates
        this.searchInput = searchInput;
        
        this.treeElement = document.createElement('div');
        this.treeElement.className = 'hierarchy-tree';
        
        // Add left-click handler for blank area to deselect
        this.treeElement.addEventListener('click', (e) => {
            // Only handle if we clicked on the tree element itself or placeholder
            if (e.target === this.treeElement || e.target.classList.contains('hierarchy-placeholder')) {
                this.sceneManager.clearSelection();
            }
        });
        
        // Add right-click handler for blank area
        this.treeElement.addEventListener('contextmenu', (e) => {
            // Only handle if we clicked on the tree element itself or placeholder
            if (e.target === this.treeElement || e.target.classList.contains('hierarchy-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Only clear selection and show menu if a scene is open
                const sceneInfo = this.sceneManager.getSceneInfo();
                if (sceneInfo.hasScene) {
                    this.sceneManager.clearSelection();
                    this.showAddMenuBlank(e);
                }
            }
        });
        
        // Add drop handlers for the blank area (root level)
        this._addRootDropHandlers();
        
        wrapper.appendChild(header);
        wrapper.appendChild(this.treeElement);
        this.container.appendChild(wrapper);
        
        this.renderTree();
    }
    
    bindEvents() {
        this.sceneManager.on('hierarchyChanged', () => {
            console.log('[HierarchyTree] Received hierarchyChanged event');
            console.log('  - Scene info:', this.sceneManager.getSceneInfo());
            console.log('  - Root children:', this.sceneManager.root ? this.sceneManager.root.children.length : 'no root');
            this.renderTree();
        });
        
        this.sceneManager.on('selectionChanged', (selection) => {
            this.updateSelection(selection);
        });
        
        this.sceneManager.on('objectModified', (data) => {
            this.updateNode(data.object);
        });
        
        // Listen for other menus opening and close our menus
        window.addEventListener('menuOpened', (e) => {
            if (e.detail.source !== 'hierarchy' && e.detail.source !== 'hierarchy-context') {
                this.closeCurrentMenu();
                this.closeCurrentContextMenu();
            } else if (e.detail.source === 'hierarchy') {
                // Close context menu when add menu opens
                this.closeCurrentContextMenu();
            } else if (e.detail.source === 'hierarchy-context') {
                // Close add menu when context menu opens
                this.closeCurrentMenu();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.container.contains(document.activeElement)) {
                this.handleKeyPress(e);
            }
        });
    }
    
    updateSearchClearButton() {
        if (this.searchClearButton && this.searchInput) {
            this.searchClearButton.style.display = this.searchInput.value ? 'block' : 'none';
        }
    }
    
    renderTree() {
        console.log('[HierarchyTree] renderTree called');
        console.log('  - Scene manager exists?', !!this.sceneManager);
        console.log('  - Root exists?', !!this.sceneManager.root);
        
        this.nodeMap.clear();
        this.treeElement.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        // Check if a scene is open
        const sceneInfo = this.sceneManager.getSceneInfo();
        console.log('[HierarchyTree] Scene info:', sceneInfo);
        if (!sceneInfo.hasScene) {
            // No scene is open
            const placeholder = document.createElement('div');
            placeholder.className = 'hierarchy-placeholder';
            placeholder.innerHTML = 'No scene is open<br><span style="font-size: 12px;">Create a new scene or open an existing one</span>';
            placeholder.style.padding = '10px';
            placeholder.style.color = 'var(--text-secondary)';
            placeholder.style.fontStyle = 'italic';
            placeholder.style.textAlign = 'center';
            fragment.appendChild(placeholder);
        } else {
            // Scene is open, render objects
            const rootObjects = this.sceneManager.getRootObjects();
            if (rootObjects.length === 0) {
                // Show placeholder when no objects in scene
                const placeholder = document.createElement('div');
                placeholder.className = 'hierarchy-placeholder';
                placeholder.textContent = 'No objects in scene';
                placeholder.style.padding = '10px';
                placeholder.style.color = 'var(--text-secondary)';
                placeholder.style.fontStyle = 'italic';
                fragment.appendChild(placeholder);
            } else {
                rootObjects.forEach(root => {
                    this.renderNode(root, fragment, 0);
                });
            }
        }
        
        this.treeElement.appendChild(fragment);
        
        this.updateSelection(this.sceneManager.getSelection());
    }
    
    renderNode(pixiObject, container, depth) {
        const meta = this.sceneManager.getObjectMetadata(pixiObject);
        if (!meta) return;
        
        if (this.searchQuery && !this.matchesSearch(pixiObject, meta)) {
            return;
        }
        
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.dataset.id = meta.id;
        node.dataset.depth = depth;
        
        const indent = document.createElement('div');
        indent.className = 'tree-node-indent';
        indent.style.width = `${depth * 20}px`;
        
        const arrow = document.createElement('div');
        arrow.className = 'tree-node-arrow';
        const hasChildren = pixiObject.children && pixiObject.children.length > 0;
        
        if (hasChildren) {
            arrow.innerHTML = this.expandedNodes.has(pixiObject) ? '▼' : '▶';
            arrow.addEventListener('click', () => {
                this.toggleExpanded(pixiObject);
            });
        } else {
            arrow.style.visibility = 'hidden';
        }
        
        const icon = document.createElement('div');
        icon.className = 'tree-node-icon';
        icon.innerHTML = PixiObjectFactory.getIcon(meta.type);
        
        const name = document.createElement('span');
        name.className = 'tree-node-name';
        name.textContent = meta.name;
        
        const editButton = document.createElement('span');
        editButton.className = 'tree-node-edit';
        editButton.textContent = '✏️';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.rename(pixiObject);
        });
        
        const deleteButton = document.createElement('span');
        deleteButton.className = 'tree-node-delete';
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.delete(pixiObject);
        });
        
        node.appendChild(indent);
        node.appendChild(arrow);
        node.appendChild(icon);
        node.appendChild(name);
        
        // All objects can be edited and deleted now
        node.appendChild(editButton);
        node.appendChild(deleteButton);
        
        node.addEventListener('click', (e) => {
            // Handle selection for any click on the row except for action buttons
            if (!e.target.classList.contains('tree-node-edit') && 
                !e.target.classList.contains('tree-node-delete') &&
                !e.target.classList.contains('tree-node-arrow')) {
                this.handleSelection(pixiObject, e);
            }
        });
        
        node.addEventListener('dblclick', (e) => {
            // Double-click to rename (except on controls)
            if (!e.target.classList.contains('tree-node-edit') && 
                !e.target.classList.contains('tree-node-delete') &&
                !e.target.classList.contains('tree-node-arrow')) {
                e.stopPropagation();
                this.rename(pixiObject);
            }
        });
        
        node.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleSelection(pixiObject, e);
            this.showContextMenu(pixiObject, e);
        });
        
        // All objects are draggable
        node.draggable = true;
        
        node.addEventListener('dragstart', (e) => {
            this.handleDragStart(pixiObject, e);
        });
        
        node.addEventListener('dragend', (e) => {
            // Clean up dragging state when drag ends (whether dropped or cancelled)
            this.clearDrag();
        });
        
        node.addEventListener('dragover', (e) => {
            this.handleDragOver(pixiObject, e);
        });
        
        node.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e);
        });
        
        node.addEventListener('drop', (e) => {
            this.handleDrop(pixiObject, e);
        });
        
        container.appendChild(node);
        this.nodeMap.set(pixiObject, node);
        
        if (hasChildren && this.expandedNodes.has(pixiObject)) {
            pixiObject.children.forEach(child => {
                this.renderNode(child, container, depth + 1);
            });
        }
    }
    
    matchesSearch(pixiObject, meta) {
        if (!this.searchQuery) return true;
        
        if (meta.name.toLowerCase().includes(this.searchQuery)) return true;
        if (meta.type.toLowerCase().includes(this.searchQuery)) return true;
        
        if (pixiObject.children) {
            for (let child of pixiObject.children) {
                const childMeta = this.sceneManager.getObjectMetadata(child);
                if (childMeta && this.matchesSearch(child, childMeta)) {
                    this.expandedNodes.add(pixiObject);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    toggleExpanded(pixiObject) {
        if (this.expandedNodes.has(pixiObject)) {
            this.expandedNodes.delete(pixiObject);
        } else {
            this.expandedNodes.add(pixiObject);
        }
        this.renderTree();
    }
    
    handleSelection(pixiObject, event) {
        if (event.ctrlKey || event.metaKey) {
            this.sceneManager.selectObject(pixiObject, true);
        } else if (event.shiftKey) {
            const selection = this.sceneManager.getSelection();
            if (selection.length > 0) {
                const lastSelected = selection[selection.length - 1];
                this.selectRange(lastSelected, pixiObject);
            } else {
                this.sceneManager.selectObject(pixiObject);
            }
        } else {
            this.sceneManager.selectObject(pixiObject);
        }
    }
    
    selectRange(from, to) {
        const allNodes = [];
        this.sceneManager.traverseScene((node) => {
            allNodes.push(node);
        });
        
        const fromIndex = allNodes.indexOf(from);
        const toIndex = allNodes.indexOf(to);
        
        if (fromIndex === -1 || toIndex === -1) return;
        
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        
        this.sceneManager.clearSelection();
        for (let i = start; i <= end; i++) {
            this.sceneManager.selectObject(allNodes[i], true);
        }
    }
    
    updateSelection(selection) {
        document.querySelectorAll('.tree-node.selected').forEach(node => {
            node.classList.remove('selected');
        });
        
        selection.forEach(object => {
            const node = this.nodeMap.get(object);
            if (node) {
                node.classList.add('selected');
                this.ensureVisible(node);
            }
        });
    }
    
    updateNode(pixiObject) {
        const node = this.nodeMap.get(pixiObject);
        if (!node) return;
        
        const meta = this.sceneManager.getObjectMetadata(pixiObject);
        if (!meta) return;
        
        const nameSpan = node.querySelector('.tree-node-name');
        if (nameSpan && nameSpan.textContent !== meta.name) {
            nameSpan.textContent = meta.name;
        }
    }
    
    ensureVisible(node) {
        const treeRect = this.treeElement.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        
        if (nodeRect.top < treeRect.top) {
            this.treeElement.scrollTop -= treeRect.top - nodeRect.top;
        } else if (nodeRect.bottom > treeRect.bottom) {
            this.treeElement.scrollTop += nodeRect.bottom - treeRect.bottom;
        }
    }
    
    handleDragStart(pixiObject, event) {
        this.draggedObject = pixiObject;
        event.dataTransfer.effectAllowed = 'move';
        
        // Set drag data with object info for prefab creation
        const dragData = {
            type: 'sceneObject',
            objectId: this.sceneManager.getObjectMetadata(pixiObject).id,
            objectName: this.sceneManager.getObjectMetadata(pixiObject).name
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        event.dataTransfer.setData('application/x-pixied-sceneobject', JSON.stringify(dragData));
        
        const node = this.nodeMap.get(pixiObject);
        if (node) {
            node.classList.add('dragging');
        }
    }
    
    handleDragOver(targetObject, event) {
        event.preventDefault();
        
        if (!this.draggedObject || this.draggedObject === targetObject) return;
        
        if (this.sceneManager._isDescendantOf(targetObject, this.draggedObject)) {
            event.dataTransfer.dropEffect = 'none';
            return;
        }
        
        // Check if target can accept children
        const targetMeta = this.sceneManager.getObjectMetadata(targetObject);
        if (!targetMeta) {
            event.dataTransfer.dropEffect = 'none';
            return;
        }
        
        event.dataTransfer.dropEffect = 'move';
        
        const node = this.nodeMap.get(targetObject);
        if (node) {
            const rect = node.getBoundingClientRect();
            const y = event.clientY - rect.top;
            const height = rect.height;
            
            this.clearDropIndicator();
            
            if (y < height * 0.25) {
                this.dropPosition = 'before';
                node.classList.add('drop-before');
            } else if (y > height * 0.75) {
                this.dropPosition = 'after';
                node.classList.add('drop-after');
            } else {
                this.dropPosition = 'inside';
                node.classList.add('drop-inside');
            }
            
            this.dropTarget = targetObject;
        }
    }
    
    handleDragLeave(event) {
        this.clearDropIndicator();
    }
    
    async handleDrop(targetObject, event) {
        event.preventDefault();
        
        // Check if a scene is open
        const sceneInfo = this.sceneManager.getSceneInfo();
        if (!sceneInfo.hasScene) {
            // No scene open - only accept scene drops
            return;
        }
        
        // Check if this is a prefab drop from Asset Browser
        const dragData = event.dataTransfer.getData('text/plain');
        if (dragData) {
            try {
                const data = JSON.parse(dragData);
                if (data.isPrefab && data.path) {
                    // Load and instantiate the prefab
                    await this.instantiatePrefab(data.path, targetObject);
                    return;
                }
            } catch (err) {
                // Not JSON or invalid, continue with normal drop
            }
        }
        
        // Normal hierarchy rearrangement
        if (!this.draggedObject || this.draggedObject === targetObject) return;
        
        if (this.dropPosition === 'inside') {
            this.sceneManager.reparentObject(this.draggedObject, targetObject);
            this.expandedNodes.add(targetObject);
        } else if (this.dropPosition === 'before' || this.dropPosition === 'after') {
            const parent = targetObject.parent;
            if (parent) {
                const index = parent.children.indexOf(targetObject);
                const newIndex = this.dropPosition === 'before' ? index : index + 1;
                this.sceneManager.reparentObject(this.draggedObject, parent, newIndex);
            }
        }
        
        this.clearDrag();
        this.renderTree();
    }
    
    async instantiatePrefab(prefabPath, parent) {
        // Get the file tree instance to read the file
        const fileTree = window.fileTreeInstance;
        if (!fileTree || !fileTree.fs) {
            console.error('File system not available');
            return;
        }
        
        // Read the prefab file
        return new Promise((resolve, reject) => {
            fileTree.fs.readFile(prefabPath, 'utf8', async (err, data) => {
                if (err) {
                    console.error('Error reading prefab:', err);
                    reject(err);
                    return;
                }
                
                try {
                    const prefabData = JSON.parse(data);
                    // If parent is null, use pixiStage for root level
                    const targetParent = parent || this.sceneManager.pixiStage;
                    const object = await SceneSerialization.deserializePrefab(prefabData, targetParent, this.sceneManager);
                    
                    if (object) {
                        this.sceneManager.selectObject(object);
                        if (parent) {
                            this.expandedNodes.add(parent);
                        }
                        this.renderTree();
                        console.log(`Prefab instantiated: ${prefabPath}`);
                    }
                    
                    resolve(object);
                } catch (parseErr) {
                    console.error('Error parsing prefab:', parseErr);
                    reject(parseErr);
                }
            });
        });
    }
    
    clearDropIndicator() {
        document.querySelectorAll('.drop-before, .drop-after, .drop-inside').forEach(node => {
            node.classList.remove('drop-before', 'drop-after', 'drop-inside');
        });
        this.dropTarget = null;
        this.dropPosition = null;
    }
    
    clearDrag() {
        document.querySelectorAll('.dragging').forEach(node => {
            node.classList.remove('dragging');
        });
        this.clearDropIndicator();
        this.draggedObject = null;
    }
    
    showAddMenu(event) {
        // Check if a scene is open
        const sceneInfo = this.sceneManager.getSceneInfo();
        if (!sceneInfo.hasScene) {
            // No scene open - don't show the menu
            return;
        }
        
        // Close any existing menu
        if (this.currentMenu) {
            this.closeCurrentMenu();
        }
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        this.currentMenu = menu;
        
        const types = PixiObjectFactory.getAvailableTypes();
        
        // Filter out unsupported types
        const supportedTypes = types.filter(type => type !== 'Mesh' && type !== 'SimpleRope');
        
        supportedTypes.forEach(type => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.innerHTML = `${PixiObjectFactory.getIcon(type)} ${type}`;
            item.addEventListener('click', () => {
                const selection = this.sceneManager.getSelection();
                const parent = selection.length > 0 ? selection[0] : null;
                const object = this.sceneManager.addObject(type, parent);
                this.sceneManager.selectObject(object);
                if (parent) {
                    this.expandedNodes.add(parent);
                }
                this.renderTree();
                this.closeCurrentMenu();
            });
            menu.appendChild(item);
        });
        
        // Position menu - default to opening to the right
        menu.style.position = 'fixed';
        menu.style.visibility = 'hidden'; // Hide initially to get dimensions
        document.body.appendChild(menu);
        
        // Get menu dimensions
        const menuRect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate position - open to the left if too close to right edge
        let left = event.clientX;
        let top = event.clientY;
        
        // Check if menu would go off the right edge
        if (left + menuRect.width > windowWidth - 10) {
            // Position to the left of the cursor
            left = Math.max(10, event.clientX - menuRect.width);
            menu.classList.add('context-menu-right'); // Add class for submenu positioning
        }
        
        // Check if menu would go off the bottom edge
        if (top + menuRect.height > windowHeight - 10) {
            top = Math.max(10, windowHeight - menuRect.height - 10);
        }
        
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.visibility = 'visible'; // Show after positioning
        
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                this.closeCurrentMenu();
            }
        };
        
        // Listen for clicks to close menu
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            this.currentMenuCloseHandler = closeMenu;
        }, 0);
        
        // Dispatch custom event to notify other menus to close
        window.dispatchEvent(new CustomEvent('menuOpened', { detail: { source: 'hierarchy' } }));
    }
    
    closeCurrentMenu() {
        if (this.currentMenu && document.body.contains(this.currentMenu)) {
            document.body.removeChild(this.currentMenu);
            if (this.currentMenuCloseHandler) {
                document.removeEventListener('click', this.currentMenuCloseHandler);
                this.currentMenuCloseHandler = null;
            }
            this.currentMenu = null;
        }
    }
    
    showAddMenuBlank(event) {
        // Check if a scene is open
        const sceneInfo = this.sceneManager.getSceneInfo();
        if (!sceneInfo.hasScene) {
            // No scene open - don't show the menu
            return;
        }
        
        // Close any existing menu
        if (this.currentMenu) {
            this.closeCurrentMenu();
        }
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        this.currentMenu = menu;
        
        const types = PixiObjectFactory.getAvailableTypes();
        
        // Filter out unsupported types
        const supportedTypes = types.filter(type => type !== 'Mesh' && type !== 'SimpleRope');
        
        supportedTypes.forEach(type => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.innerHTML = `${PixiObjectFactory.getIcon(type)} ${type}`;
            item.addEventListener('click', () => {
                // Create at root level (no parent)
                const object = this.sceneManager.addObject(type, null);
                this.sceneManager.selectObject(object);
                this.renderTree();
                this.closeCurrentMenu();
            });
            menu.appendChild(item);
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
            menu.classList.add('context-menu-right');
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
                this.closeCurrentMenu();
            }
        };
        
        // Listen for clicks to close menu
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            this.currentMenuCloseHandler = closeMenu;
        }, 0);
        
        // Dispatch custom event to notify other menus to close
        window.dispatchEvent(new CustomEvent('menuOpened', { detail: { source: 'hierarchy' } }));
    }
    
    _addRootDropHandlers() {
        this.treeElement.addEventListener('dragover', (e) => {
            // Only handle if dragging over the blank area
            if (e.target === this.treeElement || e.target.classList.contains('hierarchy-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
                
                const sceneInfo = this.sceneManager.getSceneInfo();
                
                // If no scene is open, only accept scene drops
                if (!sceneInfo.hasScene) {
                    if (e.dataTransfer.types.includes('application/x-pixied-scene')) {
                        this.treeElement.classList.add('drop-target');
                    }
                } else {
                    // Scene is open, accept prefabs and scenes
                    if (e.dataTransfer.types.includes('application/x-pixied-prefab') ||
                        e.dataTransfer.types.includes('application/x-pixied-scene')) {
                        this.treeElement.classList.add('drop-target');
                    }
                }
            }
        });
        
        this.treeElement.addEventListener('dragleave', (e) => {
            if (e.target === this.treeElement) {
                this.treeElement.classList.remove('drop-target');
            }
        });
        
        this.treeElement.addEventListener('drop', async (e) => {
            // Only handle if dropped on the blank area
            if (e.target === this.treeElement || e.target.classList.contains('hierarchy-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
                
                this.treeElement.classList.remove('drop-target');
                
                const dragData = e.dataTransfer.getData('text/plain');
                if (!dragData) return;
                
                let data;
                try {
                    data = JSON.parse(dragData);
                } catch (err) {
                    return;
                }
                
                const sceneInfo = this.sceneManager.getSceneInfo();
                
                // Check if this is a scene drop
                if (data.isScene && data.path) {
                    await this.handleSceneDrop(data.path);
                }
                // Check if this is a prefab drop (only if scene is open)
                else if (data.isPrefab && data.path && sceneInfo.hasScene) {
                    // Load and instantiate the prefab at root level (no parent)
                    await this.instantiatePrefab(data.path, null);
                }
            }
        });
    }
    
    async handleSceneDrop(scenePath) {
        const fileTree = window.fileTreeInstance;
        if (!fileTree) return;
        
        const sceneInfo = this.sceneManager.getSceneInfo();
        console.log('[HierarchyTree] Scene dropped, current state:', sceneInfo);
        
        // Always show dialog if a scene is currently open
        if (sceneInfo.hasScene) {
            const sceneName = this.sceneManager.currentSceneName || 'Untitled Scene';
            console.log('[HierarchyTree] Showing SaveChangesModal for:', sceneName);
            const modal = new SaveChangesModal(
                sceneName,
                async () => {
                    // Save current scene
                    if (fileTree._saveCurrentScene) {
                        await fileTree._saveCurrentScene();
                    }
                    if (fileTree._loadScene) {
                        await fileTree._loadScene(scenePath);
                    }
                },
                async () => {
                    // Don't save, just load new scene
                    if (fileTree._loadScene) {
                        await fileTree._loadScene(scenePath);
                    }
                },
                () => {
                    // Cancel - do nothing
                }
            );
        } else {
            // No scene is open, load the scene directly
            console.log('[HierarchyTree] No scene open, loading scene directly');
            if (fileTree._loadScene) {
                await fileTree._loadScene(scenePath);
            }
        }
    }
    
    showContextMenu(pixiObject, event) {
        // Close any existing context menu
        if (this.currentContextMenu) {
            this.closeCurrentContextMenu();
        }
        
        // Dispatch event to close other menus (file tree, add menu, menubar, etc.)
        window.dispatchEvent(new CustomEvent('menuOpened', { detail: { source: 'hierarchy-context' } }));
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        this.currentContextMenu = menu;
        
        const meta = this.sceneManager.getObjectMetadata(pixiObject);
        
        const supportedTypes = PixiObjectFactory.getAvailableTypes().filter(type => type !== 'Mesh' && type !== 'SimpleRope');
        const menuItems = [
            { label: 'Add Child', icon: '➕', submenu: supportedTypes },
            { label: 'Rename', icon: '✏️', action: () => this.rename(pixiObject) },
            { label: 'Duplicate', icon: '📋', action: () => this.duplicate(pixiObject) },
            { label: 'Delete', icon: '🗑️', action: () => this.delete(pixiObject) }
        ];
        
        // Add Deselect option if something is selected
        const selection = this.sceneManager.getSelection();
        if (selection && selection.length > 0) {
            menuItems.push({ label: 'Deselect', icon: '⭕', action: () => this.sceneManager.clearSelection() });
        }
        
        menuItems.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                menu.appendChild(separator);
            } else if (item.submenu) {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.innerHTML = `${item.icon} ${item.label} ▶`;
                
                const submenu = document.createElement('div');
                submenu.className = 'context-submenu';
                
                item.submenu.forEach(type => {
                    const subItem = document.createElement('div');
                    subItem.className = 'context-menu-item';
                    subItem.innerHTML = `${PixiObjectFactory.getIcon(type)} ${type}`;
                    subItem.addEventListener('click', () => {
                        const object = this.sceneManager.addObject(type, pixiObject);
                        this.sceneManager.selectObject(object);
                        this.expandedNodes.add(pixiObject);
                        this.renderTree();
                        this.closeCurrentContextMenu();
                    });
                    submenu.appendChild(subItem);
                });
                
                // Add hover event to check submenu position
                menuItem.addEventListener('mouseenter', () => {
                    // Get the submenu's potential position
                    const menuRect = menu.getBoundingClientRect();
                    const submenuWidth = 200; // min-width from CSS
                    const windowWidth = window.innerWidth;
                    
                    // Check if submenu would go off the right edge
                    if (menuRect.right + submenuWidth > windowWidth - 10) {
                        // Position submenu to the left
                        submenu.style.left = 'auto';
                        submenu.style.right = '100%';
                    } else {
                        // Default position to the right
                        submenu.style.left = '100%';
                        submenu.style.right = 'auto';
                    }
                });
                
                menuItem.appendChild(submenu);
                menu.appendChild(menuItem);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                if (item.disabled) menuItem.classList.add('disabled');
                menuItem.innerHTML = `${item.icon} ${item.label}`;
                
                if (!item.disabled && item.action) {
                    menuItem.addEventListener('click', () => {
                        item.action();
                        this.closeCurrentContextMenu();
                    });
                }
                
                menu.appendChild(menuItem);
            }
        });
        
        // Position menu with smart positioning
        menu.style.position = 'fixed';
        menu.style.visibility = 'hidden';
        document.body.appendChild(menu);
        
        // Get menu dimensions
        const menuRect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate position - open to the left if too close to right edge
        let left = event.clientX;
        let top = event.clientY;
        
        // Check if menu would go off the right edge
        if (left + menuRect.width > windowWidth - 10) {
            left = Math.max(10, event.clientX - menuRect.width);
            menu.classList.add('context-menu-right'); // Add class for submenu positioning
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
                this.closeCurrentContextMenu();
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            this.currentContextMenuCloseHandler = closeMenu;
        }, 0);
    }
    
    closeCurrentContextMenu() {
        if (this.currentContextMenu && document.body.contains(this.currentContextMenu)) {
            document.body.removeChild(this.currentContextMenu);
            if (this.currentContextMenuCloseHandler) {
                document.removeEventListener('click', this.currentContextMenuCloseHandler);
                this.currentContextMenuCloseHandler = null;
            }
            this.currentContextMenu = null;
        }
    }
    
    duplicate(pixiObject) {
        const duplicate = this.sceneManager.duplicateObject(pixiObject);
        if (duplicate) {
            this.sceneManager.selectObject(duplicate);
            this.renderTree();
        }
    }
    
    delete(pixiObject) {
        const meta = this.sceneManager.getObjectMetadata(pixiObject);
        if (!meta) return;
        
        const modal = new DeleteConfirmModal(
            meta.name,
            () => {
                // onConfirm
                if (this.sceneManager.removeObject(pixiObject)) {
                    this.sceneManager.clearSelection();
                    this.renderTree();
                }
            },
            () => {} // onCancel - do nothing
        );
    }
    
    rename(pixiObject) {
        const meta = this.sceneManager.getObjectMetadata(pixiObject);
        if (!meta) return;
        
        const modal = new RenameModal(
            meta.name,
            (newName) => {
                if (newName && newName !== meta.name) {
                    this.sceneManager.setObjectMetadata(pixiObject, { name: newName });
                    this.updateNode(pixiObject);
                }
            },
            () => {} // onCancel - do nothing
        );
    }
    
    copy(pixiObject) {
        this.clipboard = pixiObject;
    }
    
    paste(targetObject) {
        if (this.clipboard) {
            const duplicate = this.sceneManager.duplicateObject(this.clipboard, targetObject);
            if (duplicate) {
                this.sceneManager.selectObject(duplicate);
                this.expandedNodes.add(targetObject);
                this.renderTree();
            }
        }
    }
    
    groupSelected() {
        const group = this.sceneManager.groupSelected();
        if (group) {
            this.renderTree();
        }
    }
    
    ungroup(pixiObject) {
        this.sceneManager.selectObject(pixiObject);
        if (this.sceneManager.ungroupSelected()) {
            this.renderTree();
        }
    }
    
    focusInScene(pixiObject) {
        if (window.sceneView) {
            window.sceneView.focusObject(pixiObject);
        }
    }
    
    handleKeyPress(event) {
        const selection = this.sceneManager.getSelection();
        
        if (event.key === 'Delete') {
            selection.forEach(obj => {
                this.sceneManager.removeObject(obj);
            });
            this.renderTree();
        } else if (event.key === 'd' && event.ctrlKey) {
            event.preventDefault();
            selection.forEach(obj => {
                this.sceneManager.duplicateObject(obj);
            });
            this.renderTree();
        } else if (event.key === 'g' && event.ctrlKey) {
            event.preventDefault();
            this.groupSelected();
        } else if (event.key === 'g' && event.ctrlKey && event.shiftKey) {
            event.preventDefault();
            if (selection.length === 1) {
                this.ungroup(selection[0]);
            }
        } else if (event.key === 'F2') {
            if (selection.length === 1) {
                this.rename(selection[0]);
            }
        } else if (event.key === 'f') {
            if (selection.length === 1) {
                this.focusInScene(selection[0]);
            }
        }
    }
}