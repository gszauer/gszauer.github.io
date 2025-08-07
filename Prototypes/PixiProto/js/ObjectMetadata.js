class ObjectMetadata {
    constructor() {
        this.metadata = new WeakMap();
        this.idToObject = new Map();
        this.nameIndex = new Map();
    }
    
    setMetadata(pixiObject, data) {
        const existingMeta = this.metadata.get(pixiObject);
        
        if (existingMeta) {
            if (existingMeta.id) {
                this.idToObject.delete(existingMeta.id);
            }
            if (existingMeta.name) {
                const nameSet = this.nameIndex.get(existingMeta.name);
                if (nameSet) {
                    nameSet.delete(pixiObject);
                    if (nameSet.size === 0) {
                        this.nameIndex.delete(existingMeta.name);
                    }
                }
            }
        }
        
        const metadata = {
            id: data.id || generateGuid(),
            name: data.name || this.generateName(pixiObject),
            type: data.type || PixiObjectFactory.getObjectType(pixiObject),
            locked: data.locked || false,
            expanded: data.expanded !== undefined ? data.expanded : true,
            visible: data.visible !== undefined ? data.visible : true,
            tags: data.tags || [],
            customProperties: data.customProperties || {},
            ...data
        };
        
        this.metadata.set(pixiObject, metadata);
        this.idToObject.set(metadata.id, pixiObject);
        
        if (!this.nameIndex.has(metadata.name)) {
            this.nameIndex.set(metadata.name, new Set());
        }
        this.nameIndex.get(metadata.name).add(pixiObject);
        
        return metadata;
    }
    
    getMetadata(pixiObject) {
        return this.metadata.get(pixiObject) || null;
    }
    
    updateMetadata(pixiObject, updates) {
        const meta = this.metadata.get(pixiObject);
        if (!meta) return null;
        
        if (updates.name && updates.name !== meta.name) {
            const oldNameSet = this.nameIndex.get(meta.name);
            if (oldNameSet) {
                oldNameSet.delete(pixiObject);
                if (oldNameSet.size === 0) {
                    this.nameIndex.delete(meta.name);
                }
            }
            
            if (!this.nameIndex.has(updates.name)) {
                this.nameIndex.set(updates.name, new Set());
            }
            this.nameIndex.get(updates.name).add(pixiObject);
        }
        
        Object.assign(meta, updates);
        return meta;
    }
    
    removeMetadata(pixiObject) {
        const meta = this.metadata.get(pixiObject);
        if (!meta) return false;
        
        if (meta.id) {
            this.idToObject.delete(meta.id);
        }
        
        if (meta.name) {
            const nameSet = this.nameIndex.get(meta.name);
            if (nameSet) {
                nameSet.delete(pixiObject);
                if (nameSet.size === 0) {
                    this.nameIndex.delete(meta.name);
                }
            }
        }
        
        this.metadata.delete(pixiObject);
        return true;
    }
    
    getObjectById(id) {
        return this.idToObject.get(id) || null;
    }
    
    getObjectsByName(name) {
        const nameSet = this.nameIndex.get(name);
        return nameSet ? Array.from(nameSet) : [];
    }
    
    getObjectsByTag(tag) {
        const results = [];
        for (const [object, meta] of this.metadata) {
            if (meta.tags && meta.tags.includes(tag)) {
                results.push(object);
            }
        }
        return results;
    }
    
    getObjectsByType(type) {
        const results = [];
        for (const [object, meta] of this.metadata) {
            if (meta.type === type) {
                results.push(object);
            }
        }
        return results;
    }
    
    generateName(pixiObject) {
        const type = PixiObjectFactory.getObjectType(pixiObject);
        let counter = 1;
        let name = `${type}_${counter}`;
        
        while (this.nameIndex.has(name)) {
            counter++;
            name = `${type}_${counter}`;
        }
        
        return name;
    }
    
    isNameUnique(name, excludeObject = null) {
        const objects = this.getObjectsByName(name);
        if (objects.length === 0) return true;
        if (objects.length === 1 && objects[0] === excludeObject) return true;
        return false;
    }
    
    ensureUniqueName(baseName, excludeObject = null) {
        if (this.isNameUnique(baseName, excludeObject)) {
            return baseName;
        }
        
        let counter = 1;
        let newName = `${baseName}_${counter}`;
        
        while (!this.isNameUnique(newName, excludeObject)) {
            counter++;
            newName = `${baseName}_${counter}`;
        }
        
        return newName;
    }
    
    addTag(pixiObject, tag) {
        const meta = this.metadata.get(pixiObject);
        if (!meta) return false;
        
        if (!meta.tags) {
            meta.tags = [];
        }
        
        if (!meta.tags.includes(tag)) {
            meta.tags.push(tag);
        }
        
        return true;
    }
    
    removeTag(pixiObject, tag) {
        const meta = this.metadata.get(pixiObject);
        if (!meta || !meta.tags) return false;
        
        const index = meta.tags.indexOf(tag);
        if (index > -1) {
            meta.tags.splice(index, 1);
            return true;
        }
        
        return false;
    }
    
    setCustomProperty(pixiObject, key, value) {
        const meta = this.metadata.get(pixiObject);
        if (!meta) return false;
        
        if (!meta.customProperties) {
            meta.customProperties = {};
        }
        
        meta.customProperties[key] = value;
        return true;
    }
    
    getCustomProperty(pixiObject, key) {
        const meta = this.metadata.get(pixiObject);
        if (!meta || !meta.customProperties) return undefined;
        
        return meta.customProperties[key];
    }
    
    removeCustomProperty(pixiObject, key) {
        const meta = this.metadata.get(pixiObject);
        if (!meta || !meta.customProperties) return false;
        
        delete meta.customProperties[key];
        return true;
    }
    
    getAllObjects() {
        const results = [];
        for (const [object, meta] of this.metadata) {
            results.push({ object, metadata: meta });
        }
        return results;
    }
    
    clear() {
        this.metadata = new WeakMap();
        this.idToObject.clear();
        this.nameIndex.clear();
    }
    
    exportMetadata() {
        const data = [];
        for (const [object, meta] of this.metadata) {
            data.push({
                ...meta,
                _objectReference: object
            });
        }
        return data;
    }
    
    importMetadata(data, objectMap) {
        data.forEach(item => {
            const object = objectMap.get(item.id);
            if (object) {
                const { _objectReference, ...metadata } = item;
                this.setMetadata(object, metadata);
            }
        });
    }
}