class SceneSerialization {
    static serialize(sceneManager) {
        const rootObjects = sceneManager.getRootObjects();
        
        // Extract assets from all root objects
        const assets = {
            textures: new Set(),
            fonts: new Set()
        };
        rootObjects.forEach(root => {
            this.traverseForAssets(root, assets);
        });
        
        return {
            version: "2.0.0", // Version 2 with multiple roots
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            },
            // Store project settings separately if needed
            settings: {
                backgroundColor: sceneManager.app ? sceneManager.app.renderer.backgroundColor : 0x000000
            },
            assets: {
                textures: Array.from(assets.textures),
                fonts: Array.from(assets.fonts)
            },
            // Now roots is an array
            roots: rootObjects.map(obj => this.serializeObject(obj, sceneManager)).filter(obj => obj !== null)
        };
    }
    
    static serializeObject(pixiObject, sceneManager) {
        const meta = sceneManager.getObjectMetadata(pixiObject);
        if (!meta) return null;
        
        const type = PixiObjectFactory.getObjectType(pixiObject);
        const properties = this.extractProperties(pixiObject, type);
        
        const serialized = {
            id: meta.id,
            name: meta.name,
            type: type,
            metadata: {
                locked: meta.locked || false,
                expanded: meta.expanded !== undefined ? meta.expanded : true,
                tags: meta.tags || [],
                customProperties: meta.customProperties || {}
            },
            properties: properties,
            children: []
        };
        
        if (pixiObject.children && pixiObject.children.length > 0) {
            serialized.children = pixiObject.children
                .map(child => this.serializeObject(child, sceneManager))
                .filter(child => child !== null);
        }
        
        return serialized;
    }
    
    static extractProperties(pixiObject, type) {
        const props = {};
        
        props.position = { x: pixiObject.position.x, y: pixiObject.position.y };
        props.scale = { x: pixiObject.scale.x, y: pixiObject.scale.y };
        props.rotation = pixiObject.rotation;
        props.pivot = { x: pixiObject.pivot.x, y: pixiObject.pivot.y };
        props.skew = { x: pixiObject.skew.x, y: pixiObject.skew.y };
        props.alpha = pixiObject.alpha;
        props.visible = pixiObject.visible;
        props.renderable = pixiObject.renderable;
        props.zIndex = pixiObject.zIndex;
        
        // Handle interaction properties stored for editor
        // These use the actual values for export, editor values as fallback
        props.eventMode = pixiObject._editorEventMode || pixiObject.eventMode || 'passive';
        props.interactive = pixiObject._editorInteractive !== undefined ? pixiObject._editorInteractive : pixiObject.interactive;
        props.interactiveChildren = pixiObject._editorInteractiveChildren !== undefined ? pixiObject._editorInteractiveChildren : true;
        
        // Serialize hit area if present
        if (pixiObject._editorHitArea) {
            props.hitArea = pixiObject._editorHitArea;
        } else if (pixiObject.hitArea) {
            // Handle actual PIXI hit area (Rectangle)
            const hitArea = pixiObject.hitArea;
            if (hitArea.x !== undefined && hitArea.y !== undefined && 
                hitArea.width !== undefined && hitArea.height !== undefined) {
                props.hitArea = {
                    x: hitArea.x,
                    y: hitArea.y,
                    width: hitArea.width,
                    height: hitArea.height
                };
            }
        }
        
        switch (type) {
            case 'Sprite':
            case 'TilingSprite':
                if (pixiObject.texture) {
                    props.texture = this.serializeTexture(pixiObject.texture);
                }
                if (pixiObject.anchor) {
                    props.anchor = { x: pixiObject.anchor.x, y: pixiObject.anchor.y };
                }
                props.tint = pixiObject.tint;
                props.blendMode = pixiObject.blendMode;
                props.width = pixiObject.width;
                props.height = pixiObject.height;
                
                if (type === 'TilingSprite') {
                    props.tileScale = { x: pixiObject.tileScale.x, y: pixiObject.tileScale.y };
                    props.tilePosition = { x: pixiObject.tilePosition.x, y: pixiObject.tilePosition.y };
                }
                break;
                
            case 'Graphics':
                props.fillColor = pixiObject._fillColor || 0xFFFFFF;
                props.fillAlpha = pixiObject._fillAlpha || 1;
                props.lineColor = pixiObject._lineColor || 0x000000;
                props.lineWidth = pixiObject._lineWidth || 1;
                props.lineAlpha = pixiObject._lineAlpha || 1;
                
                const graphicsData = this.extractGraphicsData(pixiObject);
                if (graphicsData) {
                    props.graphicsData = graphicsData;
                }
                break;
                
            case 'Text':
                props.text = pixiObject.text;
                if (pixiObject.anchor) {
                    props.anchor = { x: pixiObject.anchor.x, y: pixiObject.anchor.y };
                }
                props.style = this.serializeTextStyle(pixiObject.style);
                break;
                
            case 'BitmapText':
                props.text = pixiObject.text;
                if (pixiObject.anchor) {
                    props.anchor = { x: pixiObject.anchor.x, y: pixiObject.anchor.y };
                }
                props.fontSize = pixiObject.fontSize;
                props.tint = pixiObject.tint;
                props.letterSpacing = pixiObject.letterSpacing;
                props.fontName = pixiObject.fontName;
                break;
                
            case 'AnimatedSprite':
                if (pixiObject.textures) {
                    props.textures = pixiObject.textures.map(t => this.serializeTexture(t));
                }
                if (pixiObject.anchor) {
                    props.anchor = { x: pixiObject.anchor.x, y: pixiObject.anchor.y };
                }
                props.animationSpeed = pixiObject.animationSpeed;
                props.loop = pixiObject.loop;
                props.playing = pixiObject.playing;
                props.currentFrame = pixiObject.currentFrame;
                props.tint = pixiObject.tint;
                break;
                
            case 'NineSliceSprite':
                if (pixiObject.texture) {
                    props.texture = this.serializeTexture(pixiObject.texture);
                }
                props.leftWidth = pixiObject.leftWidth;
                props.rightWidth = pixiObject.rightWidth;
                props.topHeight = pixiObject.topHeight;
                props.bottomHeight = pixiObject.bottomHeight;
                props.width = pixiObject.width;
                props.height = pixiObject.height;
                break;
                
            case 'ParticleContainer':
                props.maxSize = pixiObject._maxSize;
                props.autoResize = pixiObject.autoResize;
                break;
        }
        
        return props;
    }
    
    static serializeTexture(texture) {
        if (!texture || texture === PIXI.Texture.EMPTY || texture === PIXI.Texture.WHITE) {
            return { type: 'builtin', name: texture === PIXI.Texture.WHITE ? 'WHITE' : 'EMPTY' };
        }
        
        if (texture.baseTexture && texture.baseTexture.resource && texture.baseTexture.resource.url) {
            return {
                type: 'url',
                url: texture.baseTexture.resource.url,
                frame: texture.frame ? {
                    x: texture.frame.x,
                    y: texture.frame.y,
                    width: texture.frame.width,
                    height: texture.frame.height
                } : null
            };
        }
        
        return { type: 'unknown' };
    }
    
    static serializeTextStyle(style) {
        if (!style) return {};
        
        return {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontStyle: style.fontStyle,
            fontWeight: style.fontWeight,
            fill: style.fill,
            align: style.align,
            stroke: style.stroke,
            strokeThickness: style.strokeThickness,
            wordWrap: style.wordWrap,
            wordWrapWidth: style.wordWrapWidth,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            padding: style.padding
        };
    }
    
    static extractGraphicsData(graphics) {
        return null;
    }
    
    static extractAssets(stage) {
        const assets = {
            textures: new Set(),
            fonts: new Set()
        };
        
        this.traverseForAssets(stage, assets);
        
        return {
            textures: Array.from(assets.textures),
            fonts: Array.from(assets.fonts)
        };
    }
    
    static traverseForAssets(node, assets) {
        if (node.texture && node.texture.baseTexture && node.texture.baseTexture.resource && node.texture.baseTexture.resource.url) {
            assets.textures.add(node.texture.baseTexture.resource.url);
        }
        
        if (node.fontName) {
            assets.fonts.add(node.fontName);
        }
        
        if (node.children) {
            node.children.forEach(child => this.traverseForAssets(child, assets));
        }
    }
    
    static async deserialize(data, sceneManager) {
        console.log('[SceneSerialization] Starting deserialization');
        console.log('[SceneSerialization] Input data:', data);
        
        if (!data) {
            throw new Error('Invalid scene data');
        }
        
        sceneManager.clearSelection();
        this.clearStage(sceneManager.pixiStage);
        console.log('[SceneSerialization] Stage cleared');
        
        if (data.settings && sceneManager.app) {
            if (data.settings.backgroundColor !== undefined) {
                sceneManager.app.renderer.backgroundColor = data.settings.backgroundColor;
            }
        }
        
        await this.preloadAssets(data.assets);
        
        // Handle version 2.0.0 with multiple roots
        if (data.version === "2.0.0" && data.roots) {
            console.log('[SceneSerialization] Deserializing version 2.0.0 with', data.roots.length, 'roots');
            for (const rootData of data.roots) {
                console.log('[SceneSerialization] Deserializing root:', rootData);
                const obj = await this.deserializeObject(rootData, sceneManager.pixiStage, sceneManager);
                console.log('[SceneSerialization] Created object:', obj);
            }
        }
        // Handle legacy version 1.0.0 with single root
        else if (data.version === "1.0.0" && data.root && data.root.children) {
            console.log('[SceneSerialization] Deserializing version 1.0.0 with', data.root.children.length, 'children');
            for (const childData of data.root.children) {
                console.log('[SceneSerialization] Deserializing child:', childData);
                const obj = await this.deserializeObject(childData, sceneManager.pixiStage, sceneManager);
                console.log('[SceneSerialization] Created object:', obj);
            }
        }
        else {
            console.log('[SceneSerialization] Incompatible version or missing data');
            console.log('  - version:', data.version);
            console.log('  - has roots:', !!data.roots);
            console.log('  - has root:', !!data.root);
            console.log('  - has root.children:', !!(data.root && data.root.children));
            throw new Error('Incompatible scene data version');
        }
        
        console.log('[SceneSerialization] Deserialization complete, stage has', sceneManager.pixiStage.children.length, 'children');
        return true;
    }
    
    static async deserializeObject(data, parent, sceneManager) {
        console.log('[SceneSerialization] deserializeObject called with:', data);
        if (!data || !data.type) {
            console.log('[SceneSerialization] Missing data or type');
            return null;
        }
        
        console.log('[SceneSerialization] Creating object of type:', data.type);
        const properties = await this.prepareProperties(data.properties, data.type);
        console.log('[SceneSerialization] Prepared properties:', properties);
        const object = PixiObjectFactory.createObject(data.type, properties);
        console.log('[SceneSerialization] Created object:', object, 'constructor:', object?.constructor.name);
        
        if (!object) {
            console.error(`Failed to create object of type: ${data.type}`);
            return null;
        }
        
        sceneManager.objectMap.set(data.id, object);
        sceneManager.metadata.set(object, {
            id: data.id,
            name: data.name,
            type: data.type,
            ...data.metadata
        });
        
        this.applyProperties(object, data.properties, data.type);
        
        parent.addChild(object);
        
        if (data.children && data.children.length > 0) {
            for (const childData of data.children) {
                await this.deserializeObject(childData, object, sceneManager);
            }
        }
        
        return object;
    }
    
    static async prepareProperties(props, type) {
        const prepared = { ...props };
        
        if (props.texture) {
            prepared.texture = await this.deserializeTexture(props.texture);
        }
        
        if (props.textures) {
            prepared.textures = await Promise.all(
                props.textures.map(t => this.deserializeTexture(t))
            );
        }
        
        if (props.style) {
            prepared.style = new PIXI.TextStyle(props.style);
        }
        
        return prepared;
    }
    
    static applyProperties(object, props, type) {
        if (props.position) object.position.set(props.position.x, props.position.y);
        if (props.scale) object.scale.set(props.scale.x, props.scale.y);
        if (props.rotation !== undefined) object.rotation = props.rotation;
        if (props.pivot) object.pivot.set(props.pivot.x, props.pivot.y);
        if (props.skew) object.skew.set(props.skew.x, props.skew.y);
        if (props.alpha !== undefined) object.alpha = props.alpha;
        if (props.visible !== undefined) object.visible = props.visible;
        if (props.renderable !== undefined) object.renderable = props.renderable;
        if (props.zIndex !== undefined) object.zIndex = props.zIndex;
        
        // Restore interaction properties to editor storage (not actual interaction)
        if (props.eventMode !== undefined) {
            object._editorEventMode = props.eventMode;
            // Don't set actual eventMode to keep objects non-interactive in editor
        }
        if (props.interactive !== undefined) {
            object._editorInteractive = props.interactive;
            // Don't set actual interactive to keep objects non-interactive in editor
        }
        if (props.interactiveChildren !== undefined) {
            object._editorInteractiveChildren = props.interactiveChildren;
        }
        if (props.hitArea !== undefined) {
            object._editorHitArea = props.hitArea;
            // Don't set actual hitArea to keep objects non-interactive in editor
        }
        
        switch (type) {
            case 'Graphics':
                if (props.graphicsData) {
                    object._fillColor = props.fillColor;
                    object._fillAlpha = props.fillAlpha;
                    object._lineColor = props.lineColor;
                    object._lineWidth = props.lineWidth;
                    object._lineAlpha = props.lineAlpha;
                }
                break;
        }
    }
    
    static async deserializeTexture(textureData) {
        if (!textureData) return PIXI.Texture.WHITE;
        
        if (textureData.type === 'builtin') {
            return textureData.name === 'WHITE' ? PIXI.Texture.WHITE : PIXI.Texture.EMPTY;
        }
        
        if (textureData.type === 'url' && textureData.url) {
            try {
                const texture = await PIXI.Assets.load(textureData.url);
                
                if (textureData.frame) {
                    return new PIXI.Texture(
                        texture.baseTexture,
                        new PIXI.Rectangle(
                            textureData.frame.x,
                            textureData.frame.y,
                            textureData.frame.width,
                            textureData.frame.height
                        )
                    );
                }
                
                return texture;
            } catch (error) {
                console.error(`Failed to load texture: ${textureData.url}`, error);
                return PIXI.Texture.WHITE;
            }
        }
        
        return PIXI.Texture.WHITE;
    }
    
    static async preloadAssets(assets) {
        if (!assets) return;
        
        const loadPromises = [];
        
        if (assets.textures && assets.textures.length > 0) {
            assets.textures.forEach(url => {
                loadPromises.push(
                    PIXI.Assets.load(url).catch(err => {
                        console.error(`Failed to preload texture: ${url}`, err);
                    })
                );
            });
        }
        
        await Promise.all(loadPromises);
    }
    
    static clearStage(stage) {
        while (stage.children.length > 0) {
            const child = stage.children[0];
            stage.removeChild(child);
            if (child.destroy) {
                child.destroy({ children: true });
            }
        }
    }
    
    static serializePrefab(pixiObject, sceneManager) {
        return {
            version: "1.0.0",
            type: "prefab",
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            },
            assets: this.extractAssets(pixiObject),
            root: this.serializeObject(pixiObject, sceneManager)
        };
    }
    
    static async deserializePrefab(data, parent, sceneManager) {
        if (!data || data.type !== "prefab" || data.version !== "1.0.0") {
            throw new Error('Invalid or incompatible prefab data');
        }
        
        await this.preloadAssets(data.assets);
        
        if (data.root) {
            const object = await this.deserializeObject(data.root, parent, sceneManager);
            return object;
        }
        
        return null;
    }
    
    static saveToFile(sceneManager, filename = 'scene.json') {
        const data = this.serialize(sceneManager);
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    static loadFromFile(sceneManager) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }
                
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    await this.deserialize(data, sceneManager);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            input.click();
        });
    }
}