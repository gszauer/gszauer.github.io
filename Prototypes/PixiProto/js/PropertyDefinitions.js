const PROPERTY_DEFINITIONS = {
    Container: {
        transform: {
            label: 'Transform',
            properties: {
                position: {
                    type: 'vector2',
                    label: 'Position',
                    default: { x: 0, y: 0 },
                    step: 1,
                    get: (obj) => ({ x: obj.position.x, y: obj.position.y }),
                    set: (obj, value) => obj.position.set(value.x, value.y)
                },
                scale: {
                    type: 'vector2',
                    label: 'Scale',
                    default: { x: 1, y: 1 },
                    step: 0.01,
                    min: -10,
                    max: 10,
                    get: (obj) => ({ x: obj.scale.x, y: obj.scale.y }),
                    set: (obj, value) => obj.scale.set(value.x, value.y)
                },
                rotation: {
                    type: 'number',
                    label: 'Rotation',
                    default: 0,
                    step: 0.01,
                    min: -Math.PI * 2,
                    max: Math.PI * 2,
                    unit: 'rad',
                    get: (obj) => obj.rotation,
                    set: (obj, value) => obj.rotation = value
                },
                pivot: {
                    type: 'vector2',
                    label: 'Pivot',
                    default: { x: 0, y: 0 },
                    step: 1,
                    get: (obj) => ({ x: obj.pivot.x, y: obj.pivot.y }),
                    set: (obj, value) => obj.pivot.set(value.x, value.y)
                },
                skew: {
                    type: 'vector2',
                    label: 'Skew',
                    default: { x: 0, y: 0 },
                    step: 0.01,
                    get: (obj) => ({ x: obj.skew.x, y: obj.skew.y }),
                    set: (obj, value) => obj.skew.set(value.x, value.y)
                }
            }
        },
        display: {
            label: 'Display',
            properties: {
                alpha: {
                    type: 'slider',
                    label: 'Alpha',
                    min: 0,
                    max: 1,
                    default: 1,
                    step: 0.01,
                    get: (obj) => obj.alpha,
                    set: (obj, value) => obj.alpha = value
                },
                visible: {
                    type: 'boolean',
                    label: 'Visible',
                    default: true,
                    get: (obj) => obj.visible,
                    set: (obj, value) => obj.visible = value
                },
                renderable: {
                    type: 'boolean',
                    label: 'Renderable',
                    default: true,
                    get: (obj) => obj.renderable,
                    set: (obj, value) => obj.renderable = value
                },
                zIndex: {
                    type: 'number',
                    label: 'Z Index',
                    default: 0,
                    step: 1,
                    get: (obj) => obj.zIndex,
                    set: (obj, value) => obj.zIndex = value
                }
            }
        },
        interaction: {
            label: 'Interaction',
            properties: {
                eventMode: {
                    type: 'dropdown',
                    label: 'Event Mode',
                    options: [
                        { label: 'None (no interaction)', value: 'none' },
                        { label: 'Passive (children only)', value: 'passive' },
                        { label: 'Auto (auto hit-test)', value: 'auto' },
                        { label: 'Static (direct events)', value: 'static' },
                        { label: 'Dynamic (per-frame hit-test)', value: 'dynamic' }
                    ],
                    default: 'passive',
                    get: (obj) => {
                        // Store the value but don't actually read from eventMode to avoid interaction
                        return obj._editorEventMode || 'passive';
                    },
                    set: (obj, value) => {
                        // Store for serialization but don't set actual eventMode
                        obj._editorEventMode = value;
                    }
                },
                interactive: {
                    type: 'boolean',
                    label: 'Interactive (for export)',
                    default: false,
                    get: (obj) => {
                        // Store the value but don't actually make interactive
                        return obj._editorInteractive || false;
                    },
                    set: (obj, value) => {
                        // Store for serialization but don't set actual interactive
                        obj._editorInteractive = value;
                    }
                },
                interactiveChildren: {
                    type: 'boolean',
                    label: 'Interactive Children',
                    default: true,
                    get: (obj) => {
                        // Store the value
                        return obj._editorInteractiveChildren !== undefined ? obj._editorInteractiveChildren : true;
                    },
                    set: (obj, value) => {
                        // Store for serialization
                        obj._editorInteractiveChildren = value;
                    }
                },
                hitArea: {
                    type: 'rect',
                    label: 'Hit Area',
                    get: (obj) => {
                        // Return stored hit area or create default
                        if (obj._editorHitArea) {
                            return obj._editorHitArea;
                        }
                        return { x: 0, y: 0, width: 100, height: 100 };
                    },
                    set: (obj, value) => {
                        // Store for serialization but don't set actual hitArea
                        obj._editorHitArea = value;
                    }
                }
            }
        }
    },
    
    Sprite: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        interaction: 'inherit:Container',
        sprite: {
            label: 'Sprite',
            properties: {
                texture: {
                    type: 'asset',
                    label: 'Texture',
                    assetType: 'texture',
                    get: (obj) => obj.texture,
                    set: (obj, value) => obj.texture = value
                },
                anchor: {
                    type: 'vector2',
                    label: 'Anchor',
                    default: { x: 0.5, y: 0.5 },
                    min: 0,
                    max: 1,
                    step: 0.01,
                    get: (obj) => ({ x: obj.anchor.x, y: obj.anchor.y }),
                    set: (obj, value) => obj.anchor.set(value.x, value.y)
                },
                tint: {
                    type: 'color',
                    label: 'Tint',
                    default: 0xFFFFFF,
                    get: (obj) => obj.tint,
                    set: (obj, value) => obj.tint = value
                },
                blendMode: {
                    type: 'dropdown',
                    label: 'Blend Mode',
                    options: () => {
                        // Return options dynamically when PIXI is loaded
                        if (typeof PIXI !== 'undefined' && PIXI.BLEND_MODES) {
                            return [
                                { label: 'Normal', value: PIXI.BLEND_MODES.NORMAL },
                                { label: 'Add', value: PIXI.BLEND_MODES.ADD },
                                { label: 'Multiply', value: PIXI.BLEND_MODES.MULTIPLY },
                                { label: 'Screen', value: PIXI.BLEND_MODES.SCREEN },
                                { label: 'Overlay', value: PIXI.BLEND_MODES.OVERLAY },
                                { label: 'Darken', value: PIXI.BLEND_MODES.DARKEN },
                                { label: 'Lighten', value: PIXI.BLEND_MODES.LIGHTEN },
                                { label: 'Color Dodge', value: PIXI.BLEND_MODES.COLOR_DODGE },
                                { label: 'Color Burn', value: PIXI.BLEND_MODES.COLOR_BURN }
                            ];
                        }
                        return [
                            { label: 'Normal', value: 0 },
                            { label: 'Add', value: 1 },
                            { label: 'Multiply', value: 2 },
                            { label: 'Screen', value: 3 }
                        ];
                    },
                    get: (obj) => obj.blendMode,
                    set: (obj, value) => obj.blendMode = value
                },
                width: {
                    type: 'number',
                    label: 'Width',
                    min: 0,
                    step: 1,
                    get: (obj) => obj.width,
                    set: (obj, value) => obj.width = value
                },
                height: {
                    type: 'number',
                    label: 'Height',
                    min: 0,
                    step: 1,
                    get: (obj) => obj.height,
                    set: (obj, value) => obj.height = value
                }
            }
        }
    },
    
    Graphics: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        interaction: 'inherit:Container',
        graphics: {
            label: 'Graphics',
            properties: {
                fillColor: {
                    type: 'color',
                    label: 'Fill Color',
                    default: 0xFFFFFF,
                    get: (obj) => obj._fillColor || 0xFFFFFF,
                    set: (obj, value) => {
                        obj._fillColor = value;
                        obj.emit('graphicsChanged');
                    }
                },
                fillAlpha: {
                    type: 'slider',
                    label: 'Fill Alpha',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 1,
                    get: (obj) => obj._fillAlpha || 1,
                    set: (obj, value) => {
                        obj._fillAlpha = value;
                        obj.emit('graphicsChanged');
                    }
                },
                lineColor: {
                    type: 'color',
                    label: 'Line Color',
                    default: 0x000000,
                    get: (obj) => obj._lineColor || 0x000000,
                    set: (obj, value) => {
                        obj._lineColor = value;
                        obj.emit('graphicsChanged');
                    }
                },
                lineWidth: {
                    type: 'number',
                    label: 'Line Width',
                    min: 0,
                    max: 100,
                    step: 1,
                    default: 1,
                    get: (obj) => obj._lineWidth || 1,
                    set: (obj, value) => {
                        obj._lineWidth = value;
                        obj.emit('graphicsChanged');
                    }
                },
                lineAlpha: {
                    type: 'slider',
                    label: 'Line Alpha',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 1,
                    get: (obj) => obj._lineAlpha || 1,
                    set: (obj, value) => {
                        obj._lineAlpha = value;
                        obj.emit('graphicsChanged');
                    }
                }
            }
        }
    },
    
    Text: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        interaction: 'inherit:Container',
        text: {
            label: 'Text',
            properties: {
                text: {
                    type: 'text',
                    label: 'Text',
                    default: 'Text',
                    multiline: true,
                    get: (obj) => obj.text,
                    set: (obj, value) => obj.text = value
                },
                anchor: {
                    type: 'vector2',
                    label: 'Anchor',
                    default: { x: 0.5, y: 0.5 },
                    min: 0,
                    max: 1,
                    step: 0.01,
                    get: (obj) => ({ x: obj.anchor.x, y: obj.anchor.y }),
                    set: (obj, value) => obj.anchor.set(value.x, value.y)
                }
            }
        },
        style: {
            label: 'Text Style',
            properties: {
                fontFamily: {
                    type: 'dropdown',
                    label: 'Font Family',
                    options: [
                        { label: 'Arial', value: 'Arial' },
                        { label: 'Helvetica', value: 'Helvetica' },
                        { label: 'Times New Roman', value: 'Times New Roman' },
                        { label: 'Courier New', value: 'Courier New' },
                        { label: 'Georgia', value: 'Georgia' },
                        { label: 'Verdana', value: 'Verdana' },
                        { label: 'Comic Sans MS', value: 'Comic Sans MS' }
                    ],
                    get: (obj) => obj.style.fontFamily,
                    set: (obj, value) => obj.style.fontFamily = value
                },
                fontSize: {
                    type: 'number',
                    label: 'Font Size',
                    min: 1,
                    max: 200,
                    step: 1,
                    default: 24,
                    get: (obj) => obj.style.fontSize,
                    set: (obj, value) => obj.style.fontSize = value
                },
                fontWeight: {
                    type: 'dropdown',
                    label: 'Font Weight',
                    options: [
                        { label: 'Normal', value: 'normal' },
                        { label: 'Bold', value: 'bold' },
                        { label: 'Bolder', value: 'bolder' },
                        { label: 'Lighter', value: 'lighter' }
                    ],
                    get: (obj) => obj.style.fontWeight,
                    set: (obj, value) => obj.style.fontWeight = value
                },
                fontStyle: {
                    type: 'dropdown',
                    label: 'Font Style',
                    options: [
                        { label: 'Normal', value: 'normal' },
                        { label: 'Italic', value: 'italic' },
                        { label: 'Oblique', value: 'oblique' }
                    ],
                    get: (obj) => obj.style.fontStyle,
                    set: (obj, value) => obj.style.fontStyle = value
                },
                fill: {
                    type: 'color',
                    label: 'Fill Color',
                    default: 0xFFFFFF,
                    get: (obj) => obj.style.fill,
                    set: (obj, value) => obj.style.fill = value
                },
                align: {
                    type: 'dropdown',
                    label: 'Text Align (for multiline)',
                    options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                        { label: 'Justify', value: 'justify' }
                    ],
                    get: (obj) => obj.style.align,
                    set: (obj, value) => {
                        obj.style.align = value;
                        // Force text to update
                        obj.dirty = true;
                    }
                },
                strokeEnabled: {
                    type: 'boolean',
                    label: 'Enable Stroke',
                    default: false,
                    get: (obj) => {
                        const stroke = obj.style.stroke;
                        return stroke !== null && stroke !== undefined;
                    },
                    set: (obj, value) => {
                        if (value) {
                            // Enable stroke with previous or default settings
                            const currentStroke = obj.style.stroke;
                            if (!currentStroke) {
                                obj.style.stroke = { color: 0x000000, width: 2 };
                            }
                        } else {
                            // Disable stroke
                            obj.style.stroke = null;
                        }
                        obj.dirty = true;
                    }
                },
                stroke: {
                    type: 'color',
                    label: 'Stroke Color',
                    get: (obj) => {
                        // In PIXI v8, stroke can be null, an object, or a color value
                        const stroke = obj.style.stroke;
                        if (!stroke) {
                            return 0x000000;
                        }
                        if (typeof stroke === 'object' && stroke.color !== undefined) {
                            return stroke.color;
                        }
                        return stroke;
                    },
                    set: (obj, value) => {
                        // In PIXI v8, we need to set stroke as an object with color and width
                        const currentStroke = obj.style.stroke;
                        const thickness = (currentStroke && typeof currentStroke === 'object' && currentStroke.width !== undefined) 
                            ? currentStroke.width 
                            : (obj.style.strokeThickness || 0);
                        
                        if (thickness > 0) {
                            obj.style.stroke = { color: value, width: thickness };
                        } else {
                            obj.style.stroke = value;
                        }
                        obj.dirty = true;
                    }
                },
                strokeThickness: {
                    type: 'number',
                    label: 'Stroke Thickness',
                    min: 0,
                    max: 20,
                    step: 1,
                    default: 0,
                    get: (obj) => {
                        // In PIXI v8, stroke can be null, an object with width property, or undefined
                        const stroke = obj.style.stroke;
                        if (!stroke) {
                            return 0;
                        }
                        if (typeof stroke === 'object' && stroke.width !== undefined) {
                            return stroke.width;
                        }
                        return obj.style.strokeThickness || 0;
                    },
                    set: (obj, value) => {
                        // In PIXI v8, we need to set stroke as an object with color and width
                        const currentStroke = obj.style.stroke;
                        let color = 0x000000; // Default black color
                        
                        if (currentStroke) {
                            if (typeof currentStroke === 'object' && currentStroke.color !== undefined) {
                                color = currentStroke.color;
                            } else if (typeof currentStroke === 'number' || typeof currentStroke === 'string') {
                                color = currentStroke;
                            }
                        }
                        
                        if (value > 0) {
                            obj.style.stroke = { color: color, width: value };
                        } else {
                            obj.style.stroke = null;
                        }
                        obj.dirty = true;
                    }
                },
                wordWrap: {
                    type: 'boolean',
                    label: 'Word Wrap',
                    default: false,
                    get: (obj) => obj.style.wordWrap,
                    set: (obj, value) => obj.style.wordWrap = value
                },
                wordWrapWidth: {
                    type: 'number',
                    label: 'Wrap Width',
                    min: 0,
                    max: 2000,
                    step: 10,
                    default: 100,
                    get: (obj) => obj.style.wordWrapWidth,
                    set: (obj, value) => obj.style.wordWrapWidth = value
                }
            }
        }
    },
    
    AnimatedSprite: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        interaction: 'inherit:Container',
        sprite: {
            label: 'Sprite',
            properties: {
                anchor: {
                    type: 'vector2',
                    label: 'Anchor',
                    default: { x: 0.5, y: 0.5 },
                    min: 0,
                    max: 1,
                    step: 0.01,
                    get: (obj) => ({ x: obj.anchor.x, y: obj.anchor.y }),
                    set: (obj, value) => obj.anchor.set(value.x, value.y)
                },
                tint: {
                    type: 'color',
                    label: 'Tint',
                    default: 0xFFFFFF,
                    get: (obj) => obj.tint,
                    set: (obj, value) => obj.tint = value
                }
            }
        },
        animation: {
            label: 'Animation',
            properties: {
                animationSpeed: {
                    type: 'slider',
                    label: 'Animation Speed',
                    min: 0,
                    max: 2,
                    step: 0.01,
                    default: 0.1,
                    get: (obj) => obj.animationSpeed,
                    set: (obj, value) => obj.animationSpeed = value
                },
                loop: {
                    type: 'boolean',
                    label: 'Loop',
                    default: true,
                    get: (obj) => obj.loop,
                    set: (obj, value) => obj.loop = value
                },
                playing: {
                    type: 'boolean',
                    label: 'Playing',
                    default: false,
                    get: (obj) => obj.playing,
                    set: (obj, value) => {
                        if (value) obj.play();
                        else obj.stop();
                    }
                },
                currentFrame: {
                    type: 'number',
                    label: 'Current Frame',
                    min: 0,
                    step: 1,
                    get: (obj) => obj.currentFrame,
                    set: (obj, value) => obj.gotoAndStop(value)
                }
            }
        }
    },
    
    TilingSprite: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        interaction: 'inherit:Container',
        sprite: {
            label: 'Sprite',
            properties: {
                texture: {
                    type: 'asset',
                    label: 'Texture',
                    assetType: 'texture',
                    get: (obj) => obj.texture,
                    set: (obj, value) => obj.texture = value
                },
                anchor: {
                    type: 'vector2',
                    label: 'Anchor',
                    default: { x: 0.5, y: 0.5 },
                    min: 0,
                    max: 1,
                    step: 0.01,
                    get: (obj) => ({ x: obj.anchor.x, y: obj.anchor.y }),
                    set: (obj, value) => obj.anchor.set(value.x, value.y)
                },
                tint: {
                    type: 'color',
                    label: 'Tint',
                    default: 0xFFFFFF,
                    get: (obj) => obj.tint,
                    set: (obj, value) => obj.tint = value
                },
                width: {
                    type: 'number',
                    label: 'Width',
                    min: 0,
                    step: 1,
                    get: (obj) => obj.width,
                    set: (obj, value) => obj.width = value
                },
                height: {
                    type: 'number',
                    label: 'Height',
                    min: 0,
                    step: 1,
                    get: (obj) => obj.height,
                    set: (obj, value) => obj.height = value
                }
            }
        },
        tiling: {
            label: 'Tiling',
            properties: {
                tileScale: {
                    type: 'vector2',
                    label: 'Tile Scale',
                    default: { x: 1, y: 1 },
                    step: 0.01,
                    get: (obj) => ({ x: obj.tileScale.x, y: obj.tileScale.y }),
                    set: (obj, value) => obj.tileScale.set(value.x, value.y)
                },
                tilePosition: {
                    type: 'vector2',
                    label: 'Tile Position',
                    default: { x: 0, y: 0 },
                    step: 1,
                    get: (obj) => ({ x: obj.tilePosition.x, y: obj.tilePosition.y }),
                    set: (obj, value) => obj.tilePosition.set(value.x, value.y)
                }
            }
        }
    },
    
    NineSliceSprite: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        interaction: 'inherit:Container',
        sprite: {
            label: 'Sprite',
            properties: {
                texture: {
                    type: 'asset',
                    label: 'Texture',
                    assetType: 'texture',
                    get: (obj) => obj.texture,
                    set: (obj, value) => obj.texture = value
                },
                width: {
                    type: 'number',
                    label: 'Width',
                    min: 0,
                    step: 1,
                    get: (obj) => obj.width,
                    set: (obj, value) => obj.width = value
                },
                height: {
                    type: 'number',
                    label: 'Height',
                    min: 0,
                    step: 1,
                    get: (obj) => obj.height,
                    set: (obj, value) => obj.height = value
                }
            }
        },
        nineSlice: {
            label: 'Nine Slice',
            properties: {
                leftWidth: {
                    type: 'number',
                    label: 'Left Width',
                    min: 0,
                    step: 1,
                    default: 10,
                    get: (obj) => obj.leftWidth,
                    set: (obj, value) => obj.leftWidth = value
                },
                rightWidth: {
                    type: 'number',
                    label: 'Right Width',
                    min: 0,
                    step: 1,
                    default: 10,
                    get: (obj) => obj.rightWidth,
                    set: (obj, value) => obj.rightWidth = value
                },
                topHeight: {
                    type: 'number',
                    label: 'Top Height',
                    min: 0,
                    step: 1,
                    default: 10,
                    get: (obj) => obj.topHeight,
                    set: (obj, value) => obj.topHeight = value
                },
                bottomHeight: {
                    type: 'number',
                    label: 'Bottom Height',
                    min: 0,
                    step: 1,
                    default: 10,
                    get: (obj) => obj.bottomHeight,
                    set: (obj, value) => obj.bottomHeight = value
                }
            }
        }
    },
    
    BitmapText: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        interaction: 'inherit:Container',
        text: {
            label: 'Text',
            properties: {
                text: {
                    type: 'text',
                    label: 'Text',
                    default: 'Bitmap Text',
                    get: (obj) => obj.text,
                    set: (obj, value) => obj.text = value
                },
                anchor: {
                    type: 'vector2',
                    label: 'Anchor',
                    default: { x: 0.5, y: 0.5 },
                    min: 0,
                    max: 1,
                    step: 0.01,
                    get: (obj) => ({ x: obj.anchor.x, y: obj.anchor.y }),
                    set: (obj, value) => obj.anchor.set(value.x, value.y)
                },
                fontSize: {
                    type: 'number',
                    label: 'Font Size',
                    min: 1,
                    max: 200,
                    step: 1,
                    default: 24,
                    get: (obj) => obj.fontSize,
                    set: (obj, value) => obj.fontSize = value
                },
                tint: {
                    type: 'color',
                    label: 'Tint',
                    default: 0xFFFFFF,
                    get: (obj) => obj.tint,
                    set: (obj, value) => obj.tint = value
                },
                letterSpacing: {
                    type: 'number',
                    label: 'Letter Spacing',
                    step: 1,
                    default: 0,
                    get: (obj) => obj.letterSpacing,
                    set: (obj, value) => obj.letterSpacing = value
                }
            }
        }
    },
    
    ParticleContainer: {
        transform: 'inherit:Container',
        display: 'inherit:Container',
        particles: {
            label: 'Particle Settings',
            properties: {
                maxSize: {
                    type: 'number',
                    label: 'Max Size',
                    min: 1,
                    max: 10000,
                    step: 100,
                    default: 1500,
                    readonly: true,
                    get: (obj) => obj._maxSize
                },
                autoResize: {
                    type: 'boolean',
                    label: 'Auto Resize',
                    default: false,
                    get: (obj) => obj.autoResize,
                    set: (obj, value) => obj.autoResize = value
                }
            }
        }
    }
};

function getPropertiesForType(type) {
    const definition = PROPERTY_DEFINITIONS[type];
    if (!definition) return {};
    
    const result = {};
    
    for (const [groupKey, groupValue] of Object.entries(definition)) {
        if (typeof groupValue === 'string' && groupValue.startsWith('inherit:')) {
            const parentType = groupValue.split(':')[1];
            const parentDef = PROPERTY_DEFINITIONS[parentType];
            if (parentDef && parentDef[groupKey]) {
                result[groupKey] = { ...parentDef[groupKey] };
            }
        } else {
            result[groupKey] = { ...groupValue };
        }
    }
    
    return result;
}