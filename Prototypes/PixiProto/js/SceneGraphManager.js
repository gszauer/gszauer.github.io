class SceneGraphManager {
    constructor(app) {
        this.app = app;
        // The actual PIXI stage for rendering
        this.pixiStage = app ? app.stage : new PIXI.Container();
        
        // Our scene roots are children of the PIXI stage
        // This allows multiple root objects in our scene
        this.sceneRoots = [];
        
        // Scene file management
        this.currentScenePath = null;
        this.currentSceneName = null;
        this.isModified = false;
        this.hasScene = false;
        
        this.selectedObjects = new Set();
        this.objectMap = new Map();
        this.metadata = new WeakMap();
        
        this.listeners = {
            selectionChanged: [],
            objectAdded: [],
            objectRemoved: [],
            objectModified: [],
            hierarchyChanged: [],
            sceneChanged: [],
            sceneModified: []
        };
    }
    
    getRootObjects() {
        // Return the actual root objects in the scene
        return this.pixiStage.children;
    }
    
    addObject(type, parent = null, properties = {}) {
        const object = PixiObjectFactory.createObject(type, properties);
        
        if (!object) {
            console.error(`Failed to create object of type: ${type}`);
            return null;
        }
        
        const objectId = generateGuid();
        const objectName = properties.name || this._generateObjectName(type);
        
        this.objectMap.set(objectId, object);
        this.metadata.set(object, {
            id: objectId,
            name: objectName,
            type: type,
            locked: false,
            expanded: true,
            ...properties.metadata
        });
        
        // If no parent specified, add to the PIXI stage (making it a root object)
        const parentObj = parent || this.pixiStage;
        parentObj.addChild(object);
        
        this._emit('objectAdded', { object, parent: parentObj });
        this._emit('hierarchyChanged');
        this.markModified();
        
        return object;
    }
    
    removeObject(object) {
        if (!object) return false;
        
        const meta = this.metadata.get(object);
        if (!meta) return false;
        
        if (meta.locked) {
            console.warn(`Cannot remove locked object: ${meta.name}`);
            return false;
        }
        
        const children = [...(object.children || [])];
        children.forEach(child => this.removeObject(child));
        
        if (object.parent) {
            object.parent.removeChild(object);
        }
        
        this.objectMap.delete(meta.id);
        this.metadata.delete(object);
        this.selectedObjects.delete(object);
        
        if (object.destroy && typeof object.destroy === 'function') {
            object.destroy({ children: true });
        }
        
        this._emit('objectRemoved', { object, id: meta.id });
        this._emit('hierarchyChanged');
        this.markModified();
        
        return true;
    }
    
    reparentObject(object, newParent, index = -1) {
        if (!object || !newParent) return false;
        if (object === this.pixiStage) return false;
        
        if (this._isDescendantOf(newParent, object)) {
            console.warn('Cannot reparent object to its own descendant');
            return false;
        }
        
        const meta = this.metadata.get(object);
        if (meta && meta.locked) {
            console.warn(`Cannot move locked object: ${meta.name}`);
            return false;
        }
        
        const oldParent = object.parent;
        if (oldParent === newParent && index === -1) return false;
        
        const worldTransform = object.worldTransform.clone();
        
        if (oldParent) {
            oldParent.removeChild(object);
        }
        
        if (index >= 0 && index < newParent.children.length) {
            newParent.addChildAt(object, index);
        } else {
            newParent.addChild(object);
        }
        
        const newWorldTransform = object.worldTransform;
        const parentInverse = newParent.worldTransform.clone().invert();
        const localTransform = parentInverse.append(worldTransform);
        
        object.position.x = localTransform.tx;
        object.position.y = localTransform.ty;
        
        const scaleX = Math.sqrt(localTransform.a * localTransform.a + localTransform.b * localTransform.b);
        const scaleY = Math.sqrt(localTransform.c * localTransform.c + localTransform.d * localTransform.d);
        object.scale.set(scaleX, scaleY);
        
        object.rotation = Math.atan2(localTransform.b, localTransform.a);
        
        this._emit('hierarchyChanged');
        this.markModified();
        
        return true;
    }
    
    duplicateObject(object, parent = null) {
        if (!object || object === this.pixiStage) return null;
        
        const meta = this.metadata.get(object);
        if (!meta) return null;
        
        const parentObj = parent || object.parent || this.pixiStage;
        const properties = this._extractProperties(object);
        const newObject = this.addObject(meta.type, parentObj, properties);
        
        if (!newObject) return null;
        
        const newMeta = this.metadata.get(newObject);
        if (newMeta) {
            newMeta.name = meta.name + '_copy';
            
            object.position && newObject.position.copyFrom(object.position);
            object.scale && newObject.scale.copyFrom(object.scale);
            if (object.rotation !== undefined) newObject.rotation = object.rotation;
            if (object.alpha !== undefined) newObject.alpha = object.alpha;
            if (object.visible !== undefined) newObject.visible = object.visible;
            
            newObject.position.x += 20;
            newObject.position.y += 20;
        }
        
        if (object.children && object.children.length > 0) {
            object.children.forEach(child => {
                this.duplicateObject(child, newObject);
            });
        }
        
        return newObject;
    }
    
    findObjectById(id) {
        return this.objectMap.get(id) || null;
    }
    
    findObjectByName(name) {
        for (const [id, object] of this.objectMap.entries()) {
            const meta = this.metadata.get(object);
            if (meta && meta.name === name) {
                return object;
            }
        }
        return null;
    }
    
    getObjectMetadata(object) {
        return this.metadata.get(object) || null;
    }
    
    setObjectMetadata(object, updates) {
        const meta = this.metadata.get(object);
        if (!meta) return false;
        
        Object.assign(meta, updates);
        this._emit('objectModified', { object, metadata: meta });
        this.markModified();
        
        return true;
    }
    
    traverseScene(callback, root = null) {
        const startNode = root || this.pixiStage;
        
        const traverse = (node, depth = 0) => {
            const shouldContinue = callback(node, depth);
            
            if (shouldContinue !== false && node.children) {
                node.children.forEach(child => traverse(child, depth + 1));
            }
        };
        
        traverse(startNode);
    }
    
    getObjectPath(object) {
        const path = [];
        let current = object;
        
        while (current && current !== this.pixiStage) {
            path.unshift(current);
            current = current.parent;
        }
        
        return path;
    }
    
    selectObject(object, addToSelection = false) {
        if (!addToSelection) {
            this.selectedObjects.clear();
        }
        
        if (object) {
            this.selectedObjects.add(object);
        }
        
        this._emit('selectionChanged', Array.from(this.selectedObjects));
    }
    
    deselectObject(object) {
        this.selectedObjects.delete(object);
        this._emit('selectionChanged', Array.from(this.selectedObjects));
    }
    
    clearSelection() {
        this.selectedObjects.clear();
        this._emit('selectionChanged', []);
    }
    
    getSelection() {
        return Array.from(this.selectedObjects);
    }
    
    isSelected(object) {
        return this.selectedObjects.has(object);
    }
    
    _isDescendantOf(possibleDescendant, possibleAncestor) {
        let current = possibleDescendant;
        while (current) {
            if (current === possibleAncestor) return true;
            current = current.parent;
        }
        return false;
    }
    
    _generateObjectName(type) {
        let counter = 1;
        let name = `${type}_${counter}`;
        
        while (this.findObjectByName(name)) {
            counter++;
            name = `${type}_${counter}`;
        }
        
        return name;
    }
    
    _extractProperties(object) {
        const properties = {
            metadata: {}
        };
        
        const meta = this.metadata.get(object);
        if (meta) {
            properties.metadata = { ...meta };
            delete properties.metadata.id;
        }
        
        if (object.texture) {
            properties.texture = object.texture;
        }
        
        if (object.text) {
            properties.text = object.text;
        }
        
        if (object.style) {
            properties.style = object.style.clone ? object.style.clone() : { ...object.style };
        }
        
        return properties;
    }
    
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }
    
    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    // Scene management methods
    newScene() {
        console.log('[SceneManager] Creating new scene');
        this.clearScene();
        this.currentScenePath = null;
        this.currentSceneName = 'Untitled Scene';
        this.isModified = false;
        this.hasScene = true;
        console.log('[SceneManager] New scene created:', { 
            name: this.currentSceneName, 
            hasScene: this.hasScene, 
            isModified: this.isModified 
        });
        this._emit('sceneChanged', { name: this.currentSceneName, path: this.currentScenePath });
    }
    
    openScene(scenePath, sceneData) {
        console.log('[SceneManager] Opening scene:', scenePath);
        this.currentScenePath = scenePath;
        // Extract scene name from path if available
        if (scenePath) {
            const lastSlash = scenePath.lastIndexOf('/');
            this.currentSceneName = scenePath.substring(lastSlash + 1);
        } else {
            this.currentSceneName = 'Untitled Scene';
        }
        this.isModified = false;
        this.hasScene = true;
        console.log('[SceneManager] Scene opened:', { 
            name: this.currentSceneName, 
            path: this.currentScenePath,
            hasScene: this.hasScene, 
            isModified: this.isModified 
        });
        this._emit('sceneChanged', { name: this.currentSceneName, path: this.currentScenePath });
    }
    
    closeScene() {
        console.log('[SceneManager] Closing scene');
        this.clearScene();
        this.currentScenePath = null;
        this.currentSceneName = null;
        this.isModified = false;
        this.hasScene = false;
        console.log('[SceneManager] Scene closed');
        this._emit('sceneChanged', { name: null, path: null });
    }
    
    clearScene() {
        this.clearSelection();
        SceneSerialization.clearStage(this.pixiStage);
        this.objectMap.clear();
        this._emit('hierarchyChanged');
    }
    
    markModified() {
        // Only mark as modified if a scene is actually open
        if (this.hasScene && !this.isModified) {
            this.isModified = true;
            console.log('[SceneManager] Scene marked as MODIFIED');
            this._emit('sceneModified', true);
        } else if (!this.hasScene) {
            console.log('[SceneManager] Cannot mark as modified - no scene is open');
        }
    }
    
    markSaved() {
        this.isModified = false;
        console.log('[SceneManager] Scene marked as SAVED');
        this._emit('sceneModified', false);
    }
    
    getSceneInfo() {
        return {
            path: this.currentScenePath,
            name: this.currentSceneName,
            isModified: this.isModified,
            hasScene: this.hasScene
        };
    }
    
    groupSelected() {
        const selected = this.getSelection();
        if (selected.length < 2) return null;
        
        const commonParent = selected[0].parent || this.pixiStage;
        
        for (let obj of selected) {
            if (obj.parent !== commonParent) {
                console.warn('All selected objects must have the same parent to group');
                return null;
            }
        }
        
        const group = this.addObject('Container', commonParent, {
            name: 'Group'
        });
        
        const bounds = new PIXI.Rectangle();
        let first = true;
        
        selected.forEach(obj => {
            const objBounds = obj.getBounds();
            if (first) {
                bounds.copyFrom(objBounds);
                first = false;
            } else {
                bounds.enlarge(objBounds);
            }
        });
        
        group.position.set(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        
        selected.forEach(obj => {
            const worldPos = obj.toGlobal(new PIXI.Point(0, 0));
            this.reparentObject(obj, group);
            const localPos = group.toLocal(worldPos);
            obj.position.copyFrom(localPos);
        });
        
        this.clearSelection();
        this.selectObject(group);
        
        return group;
    }
    
    ungroupSelected() {
        const selected = this.getSelection();
        if (selected.length !== 1) return false;
        
        const group = selected[0];
        if (!group.children || group.children.length === 0) return false;
        
        const parent = group.parent || this.pixiStage;
        const children = [...group.children];
        
        children.forEach(child => {
            const worldPos = child.toGlobal(new PIXI.Point(0, 0));
            this.reparentObject(child, parent);
            const localPos = parent.toLocal(worldPos);
            child.position.copyFrom(localPos);
        });
        
        this.removeObject(group);
        this.clearSelection();
        
        children.forEach(child => this.selectObject(child, true));
        
        return true;
    }
}