// Utility functions
function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Static drag state
const dragState = {
    sourceTab: null,
    sourceDock: null,
    sourceIndex: -1
}; 


// Demo initialization
let tabCounter = 1;
let sceneManager = null;
let hierarchyTree = null;
let inspector = null;

function initializeDemo() {
    // Create main dock with Scene View
    const mainDock = new Dock('content-demo');
    const sceneViewTab = mainDock.AddTab('Scene View', { closable: false });
    
    // Split horizontally - Scene View on left, panels on right
    const mainHSplit = mainDock.SplitHorizontal();
    
    // Right side - create dock for Inspector
    const rightDock = new Dock();
    mainHSplit.splitB._setDock(rightDock);
    rightDock.parent = mainHSplit.splitB;
    const inspectorTab = rightDock.AddTab('Inspector');
    
    // Split right side horizontally again - Inspector on left, more panels on right
    const rightHSplit = rightDock.SplitHorizontal();
    
    // Far right side - create dock for vertical split
    const farRightDock = new Dock();
    rightHSplit.splitB._setDock(farRightDock);
    farRightDock.parent = rightHSplit.splitB;
    const sceneGraphTab = farRightDock.AddTab('Scene Graph');
    
    // Split far right vertically - SceneGraph on top, Assets on bottom
    const farRightVSplit = farRightDock.SplitVertical();
    
    // Bottom of far right - Assets and other tabs
    const bottomRightDock = new Dock();
    farRightVSplit.splitB._setDock(bottomRightDock);
    bottomRightDock.parent = farRightVSplit.splitB;
    
    const assetsTab = bottomRightDock.AddTab('Asset Browser');
    const fileTree = new FileTree(assetsTab);
    window.fileTreeInstance = fileTree; // Make it globally accessible for prefab system
    
    // Initialize PIXI and hierarchy after tabs are created
    initializePixiApp(sceneViewTab, sceneGraphTab, inspectorTab);
    
    tabCounter = 4;
    
    // Set initial split positions
    mainHSplit.splitAElement.style.flexBasis = '50%';  // Scene View takes 50%
    rightHSplit.splitAElement.style.flexBasis = '40%';  // Inspector takes 40% of right side
    farRightVSplit.splitAElement.style.flexBasis = '50%';  // SceneGraph takes top 50%
    
    return mainDock;
}

// Initialize PIXI app and all views
async function initializePixiApp(sceneViewTab, sceneGraphTab, inspectorTab) {
    // Check if PIXI is loaded
    if (typeof PIXI === 'undefined') {
        setTimeout(() => initializePixiApp(sceneViewTab, sceneGraphTab, inspectorTab), 100);
        return;
    }
    
    // Create container for scene view
    const sceneContainer = document.createElement('div');
    sceneContainer.style.width = '100%';
    sceneContainer.style.height = '100%';
    
    sceneViewTab.div.innerHTML = '';
    sceneViewTab.div.appendChild(sceneContainer);
    
    // Load project settings if available
    let projectSettings = {};
    if (window.fileTreeInstance && window.fileTreeInstance.fs) {
        try {
            const data = await window.fileTreeInstance.fs.promises.readFile('/project.json', 'utf8');
            try {
                projectSettings = JSON.parse(data);
                // Validate that it's an object
                if (typeof projectSettings !== 'object' || projectSettings === null) {
                    console.error('[Global] Invalid project.json format, using defaults');
                    projectSettings = {};
                } else {
                    console.log('[Global] Loaded project settings for PIXI initialization');
                }
            } catch (parseErr) {
                console.error('[Global] Failed to parse project.json, using defaults:', parseErr);
                projectSettings = {};
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('[Global] Error reading project.json:', err);
            }
            console.log('[Global] No project.json found, using defaults');
        }
    }
    
    // Create PIXI app with project settings
    const app = new PIXI.Application();
    
    // Merge project settings with defaults
    const initSettings = {
        width: 800,
        height: 600,
        background: 0x1e1e1e,
        antialias: true,
        resizeTo: sceneContainer,
        ...projectSettings
    };
    
    // Handle resizeTo setting - convert string to actual target
    if (typeof initSettings.resizeTo === 'string') {
        if (initSettings.resizeTo === 'window') {
            initSettings.resizeTo = window;
        } else if (initSettings.resizeTo === 'parent') {
            initSettings.resizeTo = sceneContainer.parentElement || sceneContainer;
        } else if (initSettings.resizeTo === '') {
            // Empty string means no resizing
            delete initSettings.resizeTo;
        } else {
            // Default to scene container if invalid value
            initSettings.resizeTo = sceneContainer;
        }
    }
    
    // Handle autoDensity - when true, PIXI will use devicePixelRatio for resolution
    if (initSettings.autoDensity === true) {
        // Remove manual resolution setting when autoDensity is enabled
        delete initSettings.resolution;
    }
    
    // Convert hex color string to number if needed
    if (typeof initSettings.background === 'string' && initSettings.background.startsWith('#')) {
        initSettings.background = parseInt(initSettings.background.replace('#', '0x'), 16);
    }
    if (typeof initSettings.backgroundColor === 'string' && initSettings.backgroundColor.startsWith('#')) {
        initSettings.backgroundColor = parseInt(initSettings.backgroundColor.replace('#', '0x'), 16);
    }
    
    app.init(initSettings).then(async () => {
        window.pixiApp = app;
        
        // Initialize scene manager
        sceneManager = new SceneGraphManager(window.pixiApp);
        
        // Initialize scene view
        window.sceneView = new SceneView(sceneContainer, sceneManager, app);
        
        // Initialize hierarchy tree
        initializeSceneGraph(sceneGraphTab);
        
        // Initialize inspector
        initializeInspector(inspectorTab);
        
        // Store references globally
        window.sceneManager = sceneManager;
        
        // Load editor scene if specified in project settings
        if (projectSettings.editorScene && window.fileTreeInstance && window.fileTreeInstance.fs) {
            // Load the scene directly after components are initialized
            (async () => {
                try {
                    const fs = window.fileTreeInstance.fs;
                    // Check if the editor scene file exists
                    const stats = await fs.promises.stat(projectSettings.editorScene);
                    if (stats.isFile()) {
                        console.log('[Global] Loading editor scene:', projectSettings.editorScene);
                        
                        // Read the scene file
                        const sceneData = await fs.promises.readFile(projectSettings.editorScene, 'utf8');
                        try {
                            const sceneJson = JSON.parse(sceneData);
                            console.log('[Global] Parsed scene JSON:', sceneJson);
                            console.log('[Global] Scene structure:');
                            console.log('  - version:', sceneJson.version);
                            console.log('  - objects:', sceneJson.objects);
                            console.log('  - roots:', sceneJson.roots);
                            console.log('  - root:', sceneJson.root);
                            
                            // Deserialize the scene data first (this clears the stage and creates the actual PIXI objects)
                            if (typeof SceneSerialization !== 'undefined' && SceneSerialization.deserialize) {
                                console.log('[Global] Deserializing scene data...');
                                console.log('[Global] Stage children before deserialize:', sceneManager.pixiStage.children.length);
                                
                                try {
                                    await SceneSerialization.deserialize(sceneJson, sceneManager);
                                    console.log('[Global] Scene deserialized successfully');
                                } catch (deserializeError) {
                                    console.error('[Global] Error during deserialization:', deserializeError);
                                    return;
                                }
                                
                                console.log('[Global] Stage children after deserialize:', sceneManager.pixiStage.children.length);
                                console.log('[Global] Root (sceneManager.root):', sceneManager.root);
                                console.log('[Global] Stage (sceneManager.pixiStage):', sceneManager.pixiStage);
                                
                                // Log what types of objects were created
                                if (sceneManager.pixiStage.children.length > 0) {
                                    console.log('[Global] Created PIXI objects:');
                                    sceneManager.pixiStage.children.forEach((child, index) => {
                                        const meta = sceneManager.getObjectMetadata(child);
                                        console.log(`  [${index}] Type: ${meta?.type || child.constructor.name}, Name: ${meta?.name || 'unnamed'}`);
                                        if (child instanceof PIXI.Text) {
                                            console.log(`    Text content: "${child.text}"`);
                                        }
                                    });
                                } else {
                                    console.log('[Global] No PIXI objects were created!');
                                }
                            } else {
                                console.error('[Global] SceneSerialization not available');
                                return;
                            }
                            
                            // Then set up the scene state
                            sceneManager.openScene(projectSettings.editorScene, sceneJson);
                            console.log('[Global] Called openScene, hasScene:', sceneManager.hasScene);
                            
                            // Update hierarchy tree
                            if (window.hierarchyTree) {
                                console.log('[Global] Updating hierarchy tree');
                                window.hierarchyTree.renderTree();
                            }
                            
                            console.log('[Global] Editor scene loaded successfully');
                        } catch (parseErr) {
                            console.error('[Global] Failed to parse editor scene file:', parseErr);
                        }
                    }
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        console.log('[Global] Editor scene file not found:', projectSettings.editorScene);
                    } else {
                        console.error('[Global] Error loading editor scene:', err);
                    }
                }
            })();
        }
        
        // Make scene view tab active to show the canvas
        sceneViewTab.activate();
    }).catch(error => {
        console.error('Failed to initialize PIXI Application:', error);
        sceneContainer.innerHTML = '<div style="padding: 20px; color: #f44;">Failed to initialize PixiJS v8. Please check console for errors.</div>';
    });
}

// Initialize SceneGraph hierarchy tree
function initializeSceneGraph(tab) {
    // Create a container for the hierarchy
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    
    // Clear existing content
    tab.div.innerHTML = '';
    tab.div.appendChild(container);
    
    if (!sceneManager) {
        container.innerHTML = '<div style="padding: 20px; color: #ccc;">Waiting for scene initialization...</div>';
        return;
    }
    
    // Initialize hierarchy tree
    hierarchyTree = new HierarchyTree(container, sceneManager);
    window.hierarchyTree = hierarchyTree;
}

// Initialize Inspector panel
function initializeInspector(tab) {
    // Create a container for the inspector
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    
    // Clear existing content
    tab.div.innerHTML = '';
    tab.div.appendChild(container);
    
    if (!sceneManager) {
        container.innerHTML = '<div style="padding: 20px; color: #ccc;">Waiting for scene initialization...</div>';
        return;
    }
    
    // Initialize inspector
    inspector = new Inspector(container, sceneManager);
    window.inspector = inspector;
}

// Control functions
function resetLayout() {
    // Clear the content-demo element
    const contentDemo = document.getElementById('content-demo');
    contentDemo.innerHTML = '';
    
    // Reset tab counter
    tabCounter = 1;
    
    // Reinitialize the demo
    window.rootDock = initializeDemo();
    
    // Update overflow after initial layout
    setTimeout(() => {
        function updateAllDocks(dock) {
            if (!dock) return;
            
            if (dock.tabs && dock._updateTabOverflow) {
                dock._updateTabOverflow();
            }
            
            if (dock.splitter) {
                if (dock.splitter.splitA.content) {
                    updateAllDocks(dock.splitter.splitA.content);
                }
                if (dock.splitter.splitB.content) {
                    updateAllDocks(dock.splitter.splitB.content);
                }
            }
        }
        
        updateAllDocks(window.rootDock);
    }, 100);
}

function findActiveDock(dock) {
    if (dock.activeTab) {
        return dock;
    }
    if (dock.splitter) {
        const fromA = dock.splitter.splitA.content ? findActiveDock(dock.splitter.splitA.content) : null;
        const fromB = dock.splitter.splitB.content ? findActiveDock(dock.splitter.splitB.content) : null;
        return fromA || fromB;
    }
    return null;
}

function addTabToActive() {
    if (window.activeDock && window.activeDock.tabs) {
        window.activeDock.AddTab(`Document ${++tabCounter}`);
    }
}

function splitActiveHorizontal() {
    if (window.activeDock && window.activeDock.tabs) {
        const split = window.activeDock.SplitHorizontal();
        const newDock = new Dock();
        split.splitB._setDock(newDock);
        newDock.parent = split.splitB;
        newDock.AddTab(`Document ${++tabCounter}`);
    }
}

function splitActiveVertical() {
    if (window.activeDock && window.activeDock.tabs) {
        const split = window.activeDock.SplitVertical();
        const newDock = new Dock();
        split.splitB._setDock(newDock);
        newDock.parent = split.splitB;
        newDock.AddTab(`Document ${++tabCounter}`);
    }
}

function closeActiveTab() {
    if (window.activeDock && window.activeDock.activeTab) {
        window.activeDock.activeTab.close();
    }
}

function printTree() {
    window.rootDock.PrintTree();
}

function addManyTabs() {
    if (window.activeDock && window.activeDock.tabs) {
        for (let i = 0; i < 10; i++) {
            window.activeDock.AddTab(`Long Tab Name ${++tabCounter}`);
        }
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    // Initialize menu bar
    const menuBar = new MenuBar('main-menu');
    
    // Add File menu
    const fileMenu = menuBar.addItem("FILE");
    fileMenu.addItem("New", () => console.log("New file"));
    fileMenu.addItem("Open", () => console.log("Open file"));
    
    // Add nested submenu for Open Recent
    const openRecentMenu = fileMenu.addItem("Open Recent");
    openRecentMenu.addItem("~/Documents/project1.txt", () => console.log("Opening project1.txt"));
    openRecentMenu.addItem("~/Documents/project2.txt", () => console.log("Opening project2.txt"));
    openRecentMenu.addItem("~/Pictures/image.png", () => console.log("Opening image.png"));
    
    // Add another level of nesting for more files
    const moreFilesMenu = openRecentMenu.addItem("More Files");
    moreFilesMenu.addItem("~/Downloads/document.pdf", () => console.log("Opening document.pdf"));
    moreFilesMenu.addItem("~/Desktop/notes.md", () => console.log("Opening notes.md"));
    moreFilesMenu.addItem("~/Code/script.js", () => console.log("Opening script.js"));
    
    openRecentMenu.addItem("Clear Recent Files", () => console.log("Clearing recent files list"));
    
    fileMenu.addItem("Save", () => console.log("Save file"));
    fileMenu.addItem("Save As...", () => console.log("Save as"));
    
    // Add Export submenu
    const exportMenu = fileMenu.addItem("Export");
    exportMenu.addItem("Export as PNG", () => console.log("Exporting as PNG"));
    exportMenu.addItem("Export as JPEG", () => console.log("Exporting as JPEG"));
    exportMenu.addItem("Export as PDF", () => console.log("Exporting as PDF"));
    
    // Add Edit menu
    const editMenu = menuBar.addItem("EDIT");
    editMenu.addItem("Undo", () => console.log("Undo"));
    editMenu.addItem("Redo", () => console.log("Redo"));
    editMenu.addItem("Cut", () => console.log("Cut"));
    editMenu.addItem("Copy", () => console.log("Copy"));
    editMenu.addItem("Paste", () => console.log("Paste"));
    
    // Add View menu
    const viewMenu = menuBar.addItem("VIEW");
    viewMenu.addItem("Project Settings", () => {
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
    });
    viewMenu.addItem("Asset Browser", () => {
        if (window.rootDock) {
            const existingTab = window.rootDock.FindTab("Asset Browser");
            if (existingTab) {
                existingTab.activate();
            } else if (window.activeDock && window.activeDock.tabs) {
                const assetsTab = window.activeDock.AddTab("Asset Browser");
                const fileTree = new FileTree(assetsTab);
                assetsTab.activate();
            }
        }
    });
    viewMenu.addItem("Scene Graph", () => {
        if (window.rootDock) {
            const existingTab = window.rootDock.FindTab("Scene Graph");
            if (existingTab) {
                existingTab.activate();
            }
        }
    });
    viewMenu.addItem("Inspector", () => {
        if (window.rootDock) {
            const existingTab = window.rootDock.FindTab("Inspector");
            if (existingTab) {
                existingTab.activate();
            }
        }
    });
    viewMenu.addItem("Scene View", () => {
        if (window.rootDock) {
            const existingTab = window.rootDock.FindTab("Scene View");
            if (existingTab) {
                existingTab.activate();
            }
        }
    });
    viewMenu.addItem("Reset Layout", () => resetLayout());
    
    // Add Dock menu with the control functions
    const dockMenu = menuBar.addItem("DOCK");
    dockMenu.addItem("Add Tab to Active", () => addTabToActive());
    dockMenu.addItem("Split Active Horizontal", () => splitActiveHorizontal());
    dockMenu.addItem("Split Active Vertical", () => splitActiveVertical());
    dockMenu.addItem("Close Active Tab", () => closeActiveTab());
    dockMenu.addItem("Print Tree (Console)", () => printTree());
    dockMenu.addItem("Add 10 Tabs (Test Overflow)", () => addManyTabs());
    
    // Add Scene menu for scene operations
    const sceneMenu = menuBar.addItem("SCENE");
    sceneMenu.addItem("New Scene", () => {
        if (sceneManager) {
            const sceneInfo = sceneManager.getSceneInfo();
            console.log('[Menu] New Scene clicked, current state:', sceneInfo);
            
            // Always show dialog if a scene is open
            if (sceneInfo.hasScene) {
                const sceneName = sceneManager.currentSceneName || 'Untitled Scene';
                console.log('[Menu] Showing SaveChangesModal for New Scene');
                const modal = new SaveChangesModal(
                    sceneName,
                    async () => {
                        // Save current scene
                        if (window.fileTreeInstance && window.fileTreeInstance._saveCurrentScene) {
                            await window.fileTreeInstance._saveCurrentScene();
                        }
                        sceneManager.newScene();
                        if (hierarchyTree) hierarchyTree.renderTree();
                    },
                    () => {
                        // Don't save, just create new scene
                        sceneManager.newScene();
                        if (hierarchyTree) hierarchyTree.renderTree();
                    },
                    () => {
                        // Cancel - do nothing
                    }
                );
            } else {
                sceneManager.newScene();
                if (hierarchyTree) hierarchyTree.renderTree();
            }
        }
    });
    sceneMenu.addItem("Save Scene", async () => {
        if (sceneManager && sceneManager.hasScene) {
            // If scene has a path, save to that path
            if (sceneManager.currentScenePath && window.fileTreeInstance) {
                await window.fileTreeInstance._saveCurrentScene();
            } else {
                // Otherwise download as a file (for scenes without a path)
                SceneSerialization.saveToFile(sceneManager, 'scene.json');
                // Note: Downloaded scenes don't mark as saved since they're not in the file system
            }
        }
    });
    sceneMenu.addItem("Load Scene", async () => {
        if (sceneManager) {
            const sceneInfo = sceneManager.getSceneInfo();
            console.log('[Menu] Load Scene clicked, current state:', sceneInfo);
            
            // Always show dialog if a scene is open
            if (sceneManager.hasScene) {
                const sceneName = sceneManager.currentSceneName || 'Untitled Scene';
                console.log('[Menu] Showing SaveChangesModal for Load Scene');
                const modal = new SaveChangesModal(
                    sceneName,
                    async () => {
                        // Save current scene
                        if (sceneManager.currentScenePath && window.fileTreeInstance) {
                            await window.fileTreeInstance._saveCurrentScene();
                        }
                        // Then load new scene
                        try {
                            await SceneSerialization.loadFromFile(sceneManager);
                            // Mark as a new scene without a path (loaded from external file)
                            sceneManager.openScene(null, null);
                            hierarchyTree.renderTree();
                        } catch (error) {
                            console.error("Failed to load scene:", error);
                        }
                    },
                    async () => {
                        // Don't save, just load new scene
                        try {
                            await SceneSerialization.loadFromFile(sceneManager);
                            // Mark as a new scene without a path (loaded from external file)
                            sceneManager.openScene(null, null);
                            hierarchyTree.renderTree();
                        } catch (error) {
                            console.error("Failed to load scene:", error);
                        }
                    },
                    () => {
                        // Cancel - do nothing
                    }
                );
            } else {
                try {
                    await SceneSerialization.loadFromFile(sceneManager);
                    // Mark as a new scene without a path (loaded from external file)
                    sceneManager.openScene(null, null);
                    hierarchyTree.renderTree();
                } catch (error) {
                    console.error("Failed to load scene:", error);
                }
            }
        }
    });
    
    // Add GameObject submenu
    const addObjectMenu = sceneMenu.addItem("Add Object");
    const objectTypes = ['Container', 'Sprite', 'Graphics', 'Text', 'AnimatedSprite', 'TilingSprite'];
    objectTypes.forEach(type => {
        addObjectMenu.addItem(type, () => {
            if (sceneManager) {
                const selection = sceneManager.getSelection();
                const parent = selection.length > 0 ? selection[0] : null;
                const obj = sceneManager.addObject(type, parent);
                sceneManager.selectObject(obj);
                if (hierarchyTree) {
                    if (parent) {
                        hierarchyTree.expandedNodes.add(parent);
                    }
                    hierarchyTree.renderTree();
                }
            }
        });
    });
    
    // Add Modal menu
    const modalMenu = menuBar.addItem("MODAL");
    modalMenu.addItem("Push 1", () => {
        const modal = new Modal("Test Modal 1", 400, 300);
        modal.div.innerHTML = "<p>This is the first test modal.</p><p>It demonstrates the modal functionality.</p>";
    });
    modalMenu.addItem("Push 2", () => {
        const modal1 = new Modal("First Modal", 350, 250);
        modal1.div.innerHTML = "<p>First modal in the queue.</p>";
        
        const modal2 = new Modal("Second Modal", 450, 350);
        modal2.div.innerHTML = "<p>Second modal in the queue.</p><p>This one will appear after you close the first.</p>";
    });
    
    // Initialize dock
    window.rootDock = initializeDemo();
    
    // Update overflow after initial layout
    setTimeout(() => {
        function updateAllDocks(dock) {
            if (!dock) return;
            
            if (dock.tabs && dock._updateTabOverflow) {
                dock._updateTabOverflow();
            }
            
            if (dock.splitter) {
                if (dock.splitter.splitA.content) {
                    updateAllDocks(dock.splitter.splitA.content);
                }
                if (dock.splitter.splitB.content) {
                    updateAllDocks(dock.splitter.splitB.content);
                }
            }
        }
        
        updateAllDocks(window.rootDock);
    }, 100);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Update tab overflow for all docks
        function updateAllDocks(dock) {
            if (!dock) return;
            
            if (dock.tabs && dock._updateTabOverflow) {
                dock._updateTabOverflow();
            }
            
            if (dock.splitter) {
                if (dock.splitter.splitA.content) {
                    updateAllDocks(dock.splitter.splitA.content);
                }
                if (dock.splitter.splitB.content) {
                    updateAllDocks(dock.splitter.splitB.content);
                }
            }
        }
        
        updateAllDocks(window.rootDock);
    });
});