class Inspector {
    constructor(container, sceneManager) {
        this.container = container;
        this.sceneManager = sceneManager;
        this.currentSelection = [];
        this.propertyGroups = new Map();
        this.updateHandlers = new Map();
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'inspector-wrapper';
        
        const header = document.createElement('div');
        header.className = 'inspector-header';
        
        this.titleElement = document.createElement('div');
        this.titleElement.className = 'inspector-title';
        this.titleElement.textContent = 'Inspector';
        header.appendChild(this.titleElement);
        
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'inspector-content';
        
        this.noSelectionMessage = document.createElement('div');
        this.noSelectionMessage.className = 'inspector-no-selection';
        this.noSelectionMessage.textContent = 'No object selected';
        this.contentElement.appendChild(this.noSelectionMessage);
        
        wrapper.appendChild(header);
        wrapper.appendChild(this.contentElement);
        this.container.appendChild(wrapper);
    }
    
    bindEvents() {
        this.sceneManager.on('selectionChanged', (selection) => {
            this.updateSelection(selection);
        });
        
        this.sceneManager.on('objectModified', (data) => {
            // Skip updating if the modification came from the inspector itself
            if (data.source === 'inspector') return;
            
            if (this.currentSelection.includes(data.object)) {
                this.updateProperties();
            }
        });
    }
    
    updateSelection(selection) {
        this.currentSelection = selection;
        
        if (selection.length === 0) {
            this.showNoSelection();
        } else if (selection.length === 1) {
            this.showSingleSelection(selection[0]);
        } else {
            this.showMultiSelection(selection);
        }
    }
    
    showNoSelection() {
        this.titleElement.textContent = 'Inspector';
        this.contentElement.innerHTML = '';
        this.contentElement.appendChild(this.noSelectionMessage);
        this.propertyGroups.clear();
        this.updateHandlers.clear();
    }
    
    showSingleSelection(object) {
        const metadata = this.sceneManager.getObjectMetadata(object);
        if (!metadata) return;
        
        this.titleElement.textContent = `${metadata.name} (${metadata.type})`;
        this.contentElement.innerHTML = '';
        this.propertyGroups.clear();
        this.updateHandlers.clear();
        
        // Get property definitions for this object type
        const propertyDefs = getPropertiesForType(metadata.type);
        
        // Create property groups
        for (const [groupKey, groupDef] of Object.entries(propertyDefs)) {
            const groupElement = this.createPropertyGroup(groupKey, groupDef, object);
            if (groupElement) {
                this.contentElement.appendChild(groupElement);
            }
        }
    }
    
    showMultiSelection(objects) {
        this.titleElement.textContent = `${objects.length} Objects Selected`;
        this.contentElement.innerHTML = '';
        this.propertyGroups.clear();
        this.updateHandlers.clear();
        
        // Find common properties among all selected objects
        const commonType = this.findCommonType(objects);
        if (!commonType) {
            const message = document.createElement('div');
            message.className = 'inspector-message';
            message.textContent = 'Selected objects have different types';
            this.contentElement.appendChild(message);
            return;
        }
        
        // Show common properties
        const propertyDefs = getPropertiesForType(commonType);
        
        for (const [groupKey, groupDef] of Object.entries(propertyDefs)) {
            const groupElement = this.createPropertyGroup(groupKey, groupDef, objects);
            if (groupElement) {
                this.contentElement.appendChild(groupElement);
            }
        }
    }
    
    findCommonType(objects) {
        if (objects.length === 0) return null;
        
        const firstMeta = this.sceneManager.getObjectMetadata(objects[0]);
        if (!firstMeta) return null;
        
        const firstType = firstMeta.type;
        
        for (let i = 1; i < objects.length; i++) {
            const meta = this.sceneManager.getObjectMetadata(objects[i]);
            if (!meta || meta.type !== firstType) {
                return 'Container'; // Fallback to base type
            }
        }
        
        return firstType;
    }
    
    createPropertyGroup(groupKey, groupDef, objectOrObjects) {
        const group = document.createElement('div');
        group.className = 'inspector-group';
        
        const header = document.createElement('div');
        header.className = 'inspector-group-header';
        
        const arrow = document.createElement('span');
        arrow.className = 'inspector-group-arrow';
        arrow.textContent = '▼';
        
        const title = document.createElement('span');
        title.className = 'inspector-group-title';
        title.textContent = groupDef.label || groupKey;
        
        header.appendChild(arrow);
        header.appendChild(title);
        
        const content = document.createElement('div');
        content.className = 'inspector-group-content';
        
        // Create property fields
        const objects = Array.isArray(objectOrObjects) ? objectOrObjects : [objectOrObjects];
        
        for (const [propKey, propDef] of Object.entries(groupDef.properties)) {
            const field = this.createPropertyField(propKey, propDef, objects);
            if (field) {
                content.appendChild(field);
            }
        }
        
        // Toggle group expansion
        let expanded = true;
        header.addEventListener('click', () => {
            expanded = !expanded;
            arrow.textContent = expanded ? '▼' : '▶';
            content.style.display = expanded ? 'block' : 'none';
        });
        
        group.appendChild(header);
        group.appendChild(content);
        
        this.propertyGroups.set(groupKey, { element: group, expanded });
        
        return group;
    }
    
    createPropertyField(propKey, propDef, objects) {
        const field = document.createElement('div');
        field.className = 'inspector-field';
        
        const label = document.createElement('label');
        label.className = 'inspector-field-label';
        label.textContent = propDef.label || propKey;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'inspector-field-input';
        
        // Get current value(s)
        const values = objects.map(obj => propDef.get ? propDef.get(obj) : null);
        const value = values[0];
        const mixed = values.some(v => !this.valuesEqual(v, value));
        
        // Create appropriate input based on type
        let input;
        
        switch (propDef.type) {
            case 'number':
                input = this.createNumberInput(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            case 'vector2':
                input = this.createVector2Input(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            case 'boolean':
                input = this.createBooleanInput(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            case 'color':
                input = this.createColorInput(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            case 'text':
                input = this.createTextInput(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            case 'slider':
                input = this.createSliderInput(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            case 'dropdown':
                input = this.createDropdownInput(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            case 'rect':
                input = this.createRectInput(propDef, value, mixed, (newValue) => {
                    objects.forEach(obj => {
                        if (propDef.set) propDef.set(obj, newValue);
                    });
                    this.sceneManager._emit('objectModified', { object: objects[0], source: 'inspector' });
                });
                break;
                
            default:
                // Unsupported type
                input = document.createElement('span');
                input.textContent = 'Unsupported';
        }
        
        if (input) {
            inputContainer.appendChild(input);
        }
        
        field.appendChild(label);
        field.appendChild(inputContainer);
        
        return field;
    }
    
    createNumberInput(propDef, value, mixed, onChange) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'inspector-input-number';
        
        if (propDef.min !== undefined) input.min = propDef.min;
        if (propDef.max !== undefined) input.max = propDef.max;
        if (propDef.step !== undefined) input.step = propDef.step;
        
        if (mixed) {
            input.placeholder = 'Mixed';
        } else {
            input.value = value !== null && value !== undefined ? value : 0;
        }
        
        input.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue)) {
                onChange(newValue);
            }
        });
        
        return input;
    }
    
    createVector2Input(propDef, value, mixed, onChange) {
        const container = document.createElement('div');
        container.className = 'inspector-vector2';
        
        const xLabel = document.createElement('span');
        xLabel.className = 'inspector-vector-label';
        xLabel.textContent = 'X';
        
        const xInput = document.createElement('input');
        xInput.type = 'number';
        xInput.className = 'inspector-input-number inspector-vector-input';
        
        const yLabel = document.createElement('span');
        yLabel.className = 'inspector-vector-label';
        yLabel.textContent = 'Y';
        
        const yInput = document.createElement('input');
        yInput.type = 'number';
        yInput.className = 'inspector-input-number inspector-vector-input';
        
        if (propDef.min !== undefined) {
            xInput.min = propDef.min;
            yInput.min = propDef.min;
        }
        if (propDef.max !== undefined) {
            xInput.max = propDef.max;
            yInput.max = propDef.max;
        }
        if (propDef.step !== undefined) {
            xInput.step = propDef.step;
            yInput.step = propDef.step;
        }
        
        if (mixed) {
            xInput.placeholder = 'Mixed';
            yInput.placeholder = 'Mixed';
        } else if (value) {
            xInput.value = value.x || 0;
            yInput.value = value.y || 0;
        }
        
        const updateValue = () => {
            const x = parseFloat(xInput.value);
            const y = parseFloat(yInput.value);
            if (!isNaN(x) && !isNaN(y)) {
                onChange({ x, y });
            }
        };
        
        xInput.addEventListener('input', updateValue);
        yInput.addEventListener('input', updateValue);
        
        container.appendChild(xLabel);
        container.appendChild(xInput);
        container.appendChild(yLabel);
        container.appendChild(yInput);
        
        return container;
    }
    
    createBooleanInput(propDef, value, mixed, onChange) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'inspector-checkbox';
        
        if (mixed) {
            checkbox.indeterminate = true;
        } else {
            checkbox.checked = !!value;
        }
        
        checkbox.addEventListener('change', (e) => {
            checkbox.indeterminate = false;
            onChange(e.target.checked);
        });
        
        return checkbox;
    }
    
    createColorInput(propDef, value, mixed, onChange) {
        const container = document.createElement('div');
        container.className = 'inspector-color';
        
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.className = 'inspector-color-picker';
        
        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.className = 'inspector-color-hex';
        hexInput.maxLength = 7;
        
        if (mixed) {
            hexInput.placeholder = 'Mixed';
            colorPicker.value = '#808080';
        } else {
            const hexColor = this.numberToHex(value || 0);
            colorPicker.value = hexColor;
            hexInput.value = hexColor;
        }
        
        colorPicker.addEventListener('input', (e) => {
            hexInput.value = e.target.value;
            onChange(this.hexToNumber(e.target.value));
        });
        
        hexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                colorPicker.value = hex;
                onChange(this.hexToNumber(hex));
            }
        });
        
        container.appendChild(colorPicker);
        container.appendChild(hexInput);
        
        return container;
    }
    
    createTextInput(propDef, value, mixed, onChange) {
        const input = propDef.multiline ? 
            document.createElement('textarea') : 
            document.createElement('input');
            
        input.className = propDef.multiline ? 
            'inspector-textarea' : 
            'inspector-input-text';
        
        if (mixed) {
            input.placeholder = 'Mixed';
        } else {
            input.value = value || '';
        }
        
        input.addEventListener('input', (e) => {
            onChange(e.target.value);
        });
        
        return input;
    }
    
    createSliderInput(propDef, value, mixed, onChange) {
        const container = document.createElement('div');
        container.className = 'inspector-slider';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'inspector-slider-input';
        slider.min = propDef.min || 0;
        slider.max = propDef.max || 1;
        slider.step = propDef.step || 0.01;
        
        const number = document.createElement('input');
        number.type = 'number';
        number.className = 'inspector-slider-number';
        number.min = propDef.min || 0;
        number.max = propDef.max || 1;
        number.step = propDef.step || 0.01;
        
        if (mixed) {
            number.placeholder = 'Mixed';
            slider.value = (propDef.min + propDef.max) / 2;
        } else {
            slider.value = value !== null && value !== undefined ? value : propDef.default || 0;
            number.value = slider.value;
        }
        
        slider.addEventListener('input', (e) => {
            number.value = e.target.value;
            onChange(parseFloat(e.target.value));
        });
        
        number.addEventListener('input', (e) => {
            slider.value = e.target.value;
            onChange(parseFloat(e.target.value));
        });
        
        container.appendChild(slider);
        container.appendChild(number);
        
        return container;
    }
    
    createDropdownInput(propDef, value, mixed, onChange) {
        const select = document.createElement('select');
        select.className = 'inspector-dropdown';
        
        // Get options - handle both array and function
        const options = typeof propDef.options === 'function' ? 
            propDef.options() : propDef.options;
        
        if (mixed) {
            const mixedOption = document.createElement('option');
            mixedOption.textContent = 'Mixed';
            mixedOption.value = '';
            mixedOption.selected = true;
            select.appendChild(mixedOption);
        }
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            
            if (!mixed && value === option.value) {
                optionElement.selected = true;
            }
            
            select.appendChild(optionElement);
        });
        
        select.addEventListener('change', (e) => {
            const selectedOption = options.find(opt => opt.value == e.target.value);
            if (selectedOption) {
                onChange(selectedOption.value);
            }
        });
        
        return select;
    }
    
    createRectInput(propDef, value, mixed, onChange) {
        const container = document.createElement('div');
        container.className = 'inspector-rect';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '20px 60px 20px 60px';
        container.style.gap = '5px';
        container.style.alignItems = 'center';
        
        // Create labels and inputs for x, y, width, height
        const fields = ['x', 'y', 'width', 'height'];
        const labels = ['X', 'Y', 'W', 'H'];
        const inputs = {};
        
        fields.forEach((field, index) => {
            const label = document.createElement('span');
            label.className = 'inspector-rect-label';
            label.textContent = labels[index];
            label.style.fontSize = '12px';
            label.style.color = 'var(--text-secondary)';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'inspector-input-number inspector-rect-input';
            input.style.width = '100%';
            input.style.padding = '2px 4px';
            input.style.fontSize = '12px';
            
            if (mixed) {
                input.placeholder = 'Mixed';
            } else if (value && typeof value === 'object') {
                input.value = value[field] || 0;
            } else {
                input.value = 0;
            }
            
            inputs[field] = input;
            
            container.appendChild(label);
            container.appendChild(input);
        });
        
        // Update value when any input changes
        const updateValue = () => {
            const newValue = {
                x: parseFloat(inputs.x.value) || 0,
                y: parseFloat(inputs.y.value) || 0,
                width: parseFloat(inputs.width.value) || 0,
                height: parseFloat(inputs.height.value) || 0
            };
            onChange(newValue);
        };
        
        Object.values(inputs).forEach(input => {
            input.addEventListener('input', updateValue);
        });
        
        return container;
    }
    
    valuesEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        
        // Check if both are objects
        if (typeof a === 'object' && typeof b === 'object') {
            // Simple vector2 comparison
            if ('x' in a && 'y' in a && 'x' in b && 'y' in b) {
                return a.x === b.x && a.y === b.y;
            }
        }
        
        return false;
    }
    
    numberToHex(num) {
        const hex = Math.floor(num).toString(16).padStart(6, '0');
        return '#' + hex;
    }
    
    hexToNumber(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }
    
    updateProperties() {
        // Re-render with current selection
        if (this.currentSelection.length > 0) {
            this.updateSelection(this.currentSelection);
        }
    }
}