class PixiObjectFactory {
    static objectTypes = {
        Container: {
            name: 'Container',
            icon: '📦',
            canHaveChildren: true,
            create: (props) => new PIXI.Container()
        },
        Sprite: {
            name: 'Sprite',
            icon: '🖼️',
            canHaveChildren: true,
            create: (props) => {
                const texture = props.texture || PIXI.Texture.WHITE;
                const sprite = new PIXI.Sprite(texture);
                if (props.anchor) {
                    sprite.anchor.set(props.anchor.x || 0.5, props.anchor.y || 0.5);
                } else {
                    sprite.anchor.set(0.5, 0.5);
                }
                return sprite;
            }
        },
        Graphics: {
            name: 'Graphics',
            icon: '✏️',
            canHaveChildren: true,
            create: (props) => {
                const graphics = new PIXI.Graphics();
                if (props.shape) {
                    graphics.beginFill(props.fillColor || 0xFFFFFF, props.fillAlpha || 1);
                    if (props.lineWidth) {
                        graphics.lineStyle(props.lineWidth, props.lineColor || 0x000000, props.lineAlpha || 1);
                    }
                    
                    switch (props.shape) {
                        case 'rectangle':
                            graphics.drawRect(
                                props.x || 0,
                                props.y || 0,
                                props.width || 100,
                                props.height || 100
                            );
                            break;
                        case 'circle':
                            graphics.drawCircle(
                                props.x || 0,
                                props.y || 0,
                                props.radius || 50
                            );
                            break;
                        case 'ellipse':
                            graphics.drawEllipse(
                                props.x || 0,
                                props.y || 0,
                                props.width || 100,
                                props.height || 50
                            );
                            break;
                        case 'polygon':
                            if (props.points) {
                                graphics.drawPolygon(props.points);
                            }
                            break;
                        case 'roundedRect':
                            graphics.drawRoundedRect(
                                props.x || 0,
                                props.y || 0,
                                props.width || 100,
                                props.height || 100,
                                props.radius || 10
                            );
                            break;
                    }
                    graphics.endFill();
                }
                return graphics;
            }
        },
        Text: {
            name: 'Text',
            icon: '📝',
            canHaveChildren: false,
            create: (props) => {
                // Build style object, filtering out null/undefined values
                const styleOptions = {
                    fontFamily: props.fontFamily || 'Arial',
                    fontSize: props.fontSize || 24,
                    fill: props.fill !== undefined ? props.fill : 0xFFFFFF,
                    align: props.align || 'left'
                };
                
                // Only add optional properties if they have valid values
                if (props.stroke !== null && props.stroke !== undefined) {
                    styleOptions.stroke = props.stroke;
                }
                if (props.strokeThickness) {
                    styleOptions.strokeThickness = props.strokeThickness;
                }
                if (props.wordWrap) {
                    styleOptions.wordWrap = true;
                    styleOptions.wordWrapWidth = props.wordWrapWidth || 100;
                }
                
                // Merge any additional style properties
                if (props.style) {
                    Object.assign(styleOptions, props.style);
                }
                
                const style = new PIXI.TextStyle(styleOptions);
                const text = new PIXI.Text(props.text || 'Text', style);
                
                if (props.anchor) {
                    text.anchor.set(props.anchor.x || 0.5, props.anchor.y || 0.5);
                } else {
                    text.anchor.set(0.5, 0.5);
                }
                return text;
            }
        },
        BitmapText: {
            name: 'BitmapText',
            icon: '🔤',
            canHaveChildren: false,
            create: (props) => {
                if (!props.font) {
                    console.warn('BitmapText requires a font name');
                    return new PIXI.Container();
                }
                const text = new PIXI.BitmapText(props.text || 'Bitmap Text', {
                    fontName: props.font,
                    fontSize: props.fontSize || 24,
                    tint: props.tint || 0xFFFFFF
                });
                if (props.anchor) {
                    text.anchor.set(props.anchor.x || 0.5, props.anchor.y || 0.5);
                } else {
                    text.anchor.set(0.5, 0.5);
                }
                return text;
            }
        },
        AnimatedSprite: {
            name: 'AnimatedSprite',
            icon: '🎬',
            canHaveChildren: true,
            create: (props) => {
                const textures = props.textures || [PIXI.Texture.WHITE];
                const animSprite = new PIXI.AnimatedSprite(textures);
                
                animSprite.animationSpeed = props.animationSpeed || 0.1;
                animSprite.loop = props.loop !== undefined ? props.loop : true;
                
                if (props.anchor) {
                    animSprite.anchor.set(props.anchor.x || 0.5, props.anchor.y || 0.5);
                } else {
                    animSprite.anchor.set(0.5, 0.5);
                }
                
                if (props.autoPlay) {
                    animSprite.play();
                }
                
                return animSprite;
            }
        },
        TilingSprite: {
            name: 'TilingSprite',
            icon: '🔲',
            canHaveChildren: true,
            create: (props) => {
                const texture = props.texture || PIXI.Texture.WHITE;
                const width = props.width || 256;
                const height = props.height || 256;
                
                const tilingSprite = new PIXI.TilingSprite(texture, width, height);
                
                if (props.tileScale) {
                    tilingSprite.tileScale.set(
                        props.tileScale.x || 1,
                        props.tileScale.y || 1
                    );
                }
                
                if (props.tilePosition) {
                    tilingSprite.tilePosition.set(
                        props.tilePosition.x || 0,
                        props.tilePosition.y || 0
                    );
                }
                
                if (props.anchor) {
                    tilingSprite.anchor.set(props.anchor.x || 0.5, props.anchor.y || 0.5);
                } else {
                    tilingSprite.anchor.set(0.5, 0.5);
                }
                
                return tilingSprite;
            }
        },
        NineSliceSprite: {
            name: 'NineSliceSprite',
            icon: '🔳',
            canHaveChildren: true,
            create: (props) => {
                const texture = props.texture || PIXI.Texture.WHITE;
                
                const nineSlice = new PIXI.NineSliceSprite(
                    texture,
                    props.leftWidth || 10,
                    props.topHeight || 10,
                    props.rightWidth || 10,
                    props.bottomHeight || 10
                );
                
                nineSlice.width = props.width || 100;
                nineSlice.height = props.height || 100;
                
                return nineSlice;
            }
        },
        Mesh: {
            name: 'Mesh',
            icon: '🔺',
            canHaveChildren: true,
            create: (props) => {
                const geometry = props.geometry || new PIXI.Geometry()
                    .addAttribute('aVertexPosition', 
                        props.vertices || [-100, -100, 100, -100, 100, 100, -100, 100], 2)
                    .addAttribute('aTextureCoord',
                        props.uvs || [0, 0, 1, 0, 1, 1, 0, 1], 2)
                    .addIndex(props.indices || [0, 1, 2, 0, 2, 3]);
                
                const shader = props.shader || PIXI.Shader.from(
                    `
                    attribute vec2 aVertexPosition;
                    attribute vec2 aTextureCoord;
                    
                    uniform mat3 projectionMatrix;
                    
                    varying vec2 vTextureCoord;
                    
                    void main(void) {
                        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                        vTextureCoord = aTextureCoord;
                    }
                    `,
                    `
                    varying vec2 vTextureCoord;
                    uniform sampler2D uSampler;
                    
                    void main(void) {
                        gl_FragColor = texture2D(uSampler, vTextureCoord);
                    }
                    `
                );
                
                const mesh = new PIXI.Mesh(geometry, shader);
                mesh.texture = props.texture || PIXI.Texture.WHITE;
                
                return mesh;
            }
        },
        SimpleRope: {
            name: 'SimpleRope',
            icon: '🪢',
            canHaveChildren: false,
            create: (props) => {
                const texture = props.texture || PIXI.Texture.WHITE;
                const points = props.points || [
                    new PIXI.Point(0, 0),
                    new PIXI.Point(50, 50),
                    new PIXI.Point(100, 0)
                ];
                
                return new PIXI.SimpleRope(texture, points);
            }
        },
        ParticleContainer: {
            name: 'ParticleContainer',
            icon: '✨',
            canHaveChildren: true,
            create: (props) => {
                const maxSize = props.maxSize || 1500;
                const properties = {
                    scale: props.scale !== undefined ? props.scale : true,
                    position: props.position !== undefined ? props.position : true,
                    rotation: props.rotation !== undefined ? props.rotation : true,
                    uvs: props.uvs !== undefined ? props.uvs : true,
                    tint: props.tint !== undefined ? props.tint : true
                };
                
                return new PIXI.ParticleContainer(maxSize, properties);
            }
        }
    };
    
    static createObject(type, properties = {}) {
        const objectDef = this.objectTypes[type];
        
        if (!objectDef) {
            console.error(`Unknown object type: ${type}`);
            return null;
        }
        
        try {
            const object = objectDef.create(properties);
            
            if (properties.position) {
                object.position.set(
                    properties.position.x || 0,
                    properties.position.y || 0
                );
            }
            
            if (properties.scale) {
                object.scale.set(
                    properties.scale.x || 1,
                    properties.scale.y || 1
                );
            }
            
            if (properties.rotation !== undefined) {
                object.rotation = properties.rotation;
            }
            
            if (properties.alpha !== undefined) {
                object.alpha = properties.alpha;
            }
            
            if (properties.visible !== undefined) {
                object.visible = properties.visible;
            }
            
            if (properties.interactive !== undefined) {
                object.interactive = properties.interactive;
            }
            
            if (properties.buttonMode !== undefined) {
                object.buttonMode = properties.buttonMode;
            }
            
            if (properties.tint !== undefined && object.tint !== undefined) {
                object.tint = properties.tint;
            }
            
            if (properties.blendMode !== undefined) {
                object.blendMode = properties.blendMode;
            }
            
            return object;
            
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
            return null;
        }
    }
    
    static getObjectType(object) {
        if (!object) return 'Unknown';
        
        const className = object.constructor.name;
        console.log('[PixiObjectFactory] getObjectType - constructor.name:', className, 'object:', object);
        
        // Check for PIXI v8 specific class names and instanceof checks
        if (object instanceof PIXI.Text) {
            console.log('[PixiObjectFactory] Detected as PIXI.Text');
            return 'Text';
        }
        if (object instanceof PIXI.Sprite) {
            // Check for specialized sprites first
            if (object instanceof PIXI.AnimatedSprite) {
                console.log('[PixiObjectFactory] Detected as PIXI.AnimatedSprite');
                return 'AnimatedSprite';
            }
            if (object instanceof PIXI.TilingSprite) {
                console.log('[PixiObjectFactory] Detected as PIXI.TilingSprite');
                return 'TilingSprite';
            }
            console.log('[PixiObjectFactory] Detected as PIXI.Sprite');
            return 'Sprite';
        }
        if (object instanceof PIXI.Graphics) {
            console.log('[PixiObjectFactory] Detected as PIXI.Graphics');
            return 'Graphics';
        }
        if (object instanceof PIXI.BitmapText) {
            console.log('[PixiObjectFactory] Detected as PIXI.BitmapText');
            return 'BitmapText';
        }
        if (object instanceof PIXI.Container) {
            console.log('[PixiObjectFactory] Detected as PIXI.Container');
            return 'Container';
        }
        
        // Fallback to className mapping for any missed cases
        const typeMap = {
            'Container': 'Container',
            'Sprite': 'Sprite',
            'Graphics': 'Graphics',
            'Text': 'Text',
            'BitmapText': 'BitmapText',
            'AnimatedSprite': 'AnimatedSprite',
            'TilingSprite': 'TilingSprite',
            'NineSliceSprite': 'NineSliceSprite',
            'Mesh': 'Mesh',
            'SimpleRope': 'SimpleRope',
            'ParticleContainer': 'ParticleContainer'
        };
        
        console.log('[PixiObjectFactory] Falling back to className mapping, result:', typeMap[className] || 'Container');
        return typeMap[className] || 'Container';
    }
    
    static getAvailableTypes() {
        return Object.keys(this.objectTypes);
    }
    
    static getTypeInfo(type) {
        return this.objectTypes[type] || null;
    }
    
    static canHaveChildren(object) {
        const type = this.getObjectType(object);
        const typeInfo = this.getTypeInfo(type);
        return typeInfo ? typeInfo.canHaveChildren : true;
    }
    
    static getIcon(type) {
        const typeInfo = this.getTypeInfo(type);
        return typeInfo ? typeInfo.icon : '📄';
    }
    
    static createDefaultShapes() {
        return {
            rectangle: () => this.createObject('Graphics', {
                shape: 'rectangle',
                fillColor: 0x4A90E2,
                width: 100,
                height: 100
            }),
            circle: () => this.createObject('Graphics', {
                shape: 'circle',
                fillColor: 0xE24A4A,
                radius: 50
            }),
            triangle: () => {
                const graphics = this.createObject('Graphics', {
                    shape: 'polygon',
                    fillColor: 0x4AE24A,
                    points: [0, -50, 50, 50, -50, 50]
                });
                return graphics;
            },
            star: () => {
                const points = [];
                const outerRadius = 50;
                const innerRadius = 25;
                const numPoints = 5;
                
                for (let i = 0; i < numPoints * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / numPoints;
                    points.push(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius
                    );
                }
                
                return this.createObject('Graphics', {
                    shape: 'polygon',
                    fillColor: 0xFFD700,
                    points: points
                });
            }
        };
    }
}