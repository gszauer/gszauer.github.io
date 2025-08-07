class SceneView {
    constructor(container, sceneManager, pixiApp) {
        this.container = container;
        this.sceneManager = sceneManager;
        this.pixiApp = pixiApp;
        this.noSceneMessage = null;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        // Clear container
        this.container.innerHTML = '';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.overflow = 'hidden';
        this.container.style.background = '#1e1e1e';
        this.container.style.position = 'relative';
        
        // Create no scene message
        this.noSceneMessage = document.createElement('div');
        this.noSceneMessage.style.position = 'absolute';
        this.noSceneMessage.style.top = '50%';
        this.noSceneMessage.style.left = '50%';
        this.noSceneMessage.style.transform = 'translate(-50%, -50%)';
        this.noSceneMessage.style.color = 'var(--text-secondary)';
        this.noSceneMessage.style.fontSize = '16px';
        this.noSceneMessage.style.fontStyle = 'italic';
        this.noSceneMessage.style.textAlign = 'center';
        this.noSceneMessage.innerHTML = 'No scene is open<br><span style="font-size: 14px;">Create a new scene or open an existing one</span>';
        
        // Add PIXI canvas
        if (this.pixiApp && this.pixiApp.canvas) {
            this.container.appendChild(this.pixiApp.canvas);
            this.pixiApp.canvas.style.display = 'none';
        }
        
        // Add no scene message
        this.container.appendChild(this.noSceneMessage);
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Update display based on scene state
        this.updateDisplay();
    }
    
    bindEvents() {
        // Listen for scene changes
        this.sceneManager.on('sceneChanged', () => {
            this.updateDisplay();
        });
    }
    
    updateDisplay() {
        const sceneInfo = this.sceneManager.getSceneInfo();
        
        if (sceneInfo.hasScene) {
            // Show canvas, hide message
            if (this.pixiApp && this.pixiApp.canvas) {
                this.pixiApp.canvas.style.display = 'block';
            }
            this.noSceneMessage.style.display = 'none';
        } else {
            // Hide canvas, show message
            if (this.pixiApp && this.pixiApp.canvas) {
                this.pixiApp.canvas.style.display = 'none';
            }
            this.noSceneMessage.style.display = 'block';
        }
    }
    
    setupDragAndDrop() {
        this.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if a scene file is being dragged
            if (e.dataTransfer.types.includes('application/x-pixied-scene')) {
                e.dataTransfer.dropEffect = 'copy';
                this.container.style.outline = '2px dashed var(--border-hover)';
            }
        });
        
        this.container.addEventListener('dragleave', (e) => {
            if (e.target === this.container || e.target === this.noSceneMessage) {
                this.container.style.outline = '';
            }
        });
        
        this.container.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.container.style.outline = '';
            
            const dragData = e.dataTransfer.getData('text/plain');
            if (!dragData) return;
            
            let data;
            try {
                data = JSON.parse(dragData);
            } catch (err) {
                return;
            }
            
            // Check if this is a scene file
            if (data.isScene && data.path) {
                await this.handleSceneDrop(data.path);
            }
        });
    }
    
    async handleSceneDrop(scenePath) {
        const fileTree = window.fileTreeInstance;
        if (!fileTree) return;
        
        const sceneInfo = this.sceneManager.getSceneInfo();
        console.log('[SceneView] Scene dropped, current state:', sceneInfo);
        
        // Always show dialog if a scene is currently open
        if (sceneInfo.hasScene) {
            const sceneName = this.sceneManager.currentSceneName || 'Untitled Scene';
            console.log('[SceneView] Showing SaveChangesModal for:', sceneName);
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
            console.log('[SceneView] No scene open, loading scene directly');
            if (fileTree._loadScene) {
                await fileTree._loadScene(scenePath);
            }
        }
    }
    
    focusObject(pixiObject) {
        if (!pixiObject || !this.pixiApp) return;
        
        const bounds = pixiObject.getBounds();
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        
        // Center the view on the object
        const stage = this.pixiApp.stage;
        if (stage) {
            stage.position.x = this.pixiApp.screen.width / 2 - centerX;
            stage.position.y = this.pixiApp.screen.height / 2 - centerY;
        }
    }
}