class MenuItem {
    constructor(text, callback = null) {
        this.guid = generateGuid();
        this.text = text;
        this.callback = callback;
        this.submenu = null;
        this.parent = null;
        this.element = null;
        
        // If no callback provided, this is a submenu container
        if (!callback) {
            this.submenu = [];
        }
        
        this._createElement();
    }
    
    _createElement() {
        this.element = document.createElement('div');
        this.element.className = 'menu-item';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'menu-item-text';
        textSpan.textContent = this.text;
        this.element.appendChild(textSpan);
        
        if (this.submenu) {
            // Add submenu indicator
            const arrow = document.createElement('span');
            arrow.className = 'menu-item-arrow';
            arrow.textContent = '▶';
            this.element.appendChild(arrow);
            
            // Create submenu container
            this.submenuElement = document.createElement('div');
            this.submenuElement.className = 'menu-submenu';
            this.element.appendChild(this.submenuElement);
            
            // Handle hover to show submenu
            this.element.addEventListener('mouseenter', () => {
                this.submenuElement.classList.add('active');
            });
            
            this.element.addEventListener('mouseleave', () => {
                this.submenuElement.classList.remove('active');
            });
        } else {
            // It's a clickable item
            this.element.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.callback) {
                    this.callback();
                }
                // Close all menus
                this._closeAllMenus();
            });
            
            this.element.addEventListener('mouseenter', () => {
                // Close sibling submenus
                if (this.parent && this.parent.submenu) {
                    this.parent.submenu.forEach(item => {
                        if (item !== this && item.submenuElement) {
                            item.submenuElement.classList.remove('active');
                        }
                    });
                }
            });
        }
    }
    
    addItem(itemOrText, callback) {
        if (!this.submenu) {
            throw new Error('Cannot add items to a non-submenu MenuItem');
        }
        
        let item;
        if (itemOrText instanceof MenuItem) {
            item = itemOrText;
        } else {
            item = new MenuItem(itemOrText, callback);
        }
        
        item.parent = this;
        this.submenu.push(item);
        this.submenuElement.appendChild(item.element);
        
        return item;
    }
    
    removeItem(item) {
        if (!this.submenu) return;
        
        const index = this.submenu.indexOf(item);
        if (index > -1) {
            this.submenu.splice(index, 1);
            if (item.element && item.element.parentNode === this.submenuElement) {
                this.submenuElement.removeChild(item.element);
            }
        }
    }
    
    updateDisplay() {
        // Update text
        const textSpan = this.element.querySelector('.menu-item-text');
        if (textSpan) {
            textSpan.textContent = this.text;
        }
        
        // Recursively update submenu items
        if (this.submenu) {
            this.submenu.forEach(item => item.updateDisplay());
        }
    }
    
    _closeAllMenus() {
        // Find root menu bar
        let root = this;
        while (root.parent) {
            root = root.parent;
        }
        
        // If root has a menuBar reference, close all menus
        if (root.menuBar) {
            root.menuBar.closeAllMenus();
        }
    }
}