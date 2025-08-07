class MenuBar {
    constructor(target) {
        this.guid = generateGuid();
        this.items = [];
        this.activeItem = null;
        
        // Create menu bar element
        this.element = document.createElement('div');
        this.element.className = 'menu-bar';
        this.element.id = this.guid;
        
        // Handle different constructor arguments
        if (target) {
            if (typeof target === 'string') {
                const targetElement = document.getElementById(target);
                if (targetElement) {
                    targetElement.appendChild(this.element);
                }
            } else if (target instanceof HTMLElement) {
                target.appendChild(this.element);
            }
        }
        
        // Click outside to close menus
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.closeAllMenus();
            }
        });
    }
    
    addItem(itemOrText, callback) {
        let item;
        
        if (itemOrText instanceof MenuItem) {
            item = itemOrText;
        } else {
            item = new MenuItem(itemOrText, callback);
        }
        
        // Create top-level menu item wrapper
        const topLevelElement = document.createElement('div');
        topLevelElement.className = 'menu-bar-item';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = item.text;
        topLevelElement.appendChild(textSpan);
        
        // Store reference to menu bar in item
        item.menuBar = this;
        item.topLevelElement = topLevelElement;
        
        // Handle click on top-level item
        topLevelElement.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (item.callback) {
                // It's a direct action
                item.callback();
                this.closeAllMenus();
            } else if (item.submenu) {
                // Toggle submenu
                this.toggleSubmenu(item);
            }
        });
        
        // Handle hover when a menu is already open
        topLevelElement.addEventListener('mouseenter', () => {
            if (this.activeItem && this.activeItem !== item) {
                this.toggleSubmenu(item);
            }
        });
        
        // Append submenu element if it exists
        if (item.submenuElement) {
            topLevelElement.appendChild(item.submenuElement);
        }
        
        this.items.push(item);
        this.element.appendChild(topLevelElement);
        
        return item;
    }
    
    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            if (item.topLevelElement && item.topLevelElement.parentNode === this.element) {
                this.element.removeChild(item.topLevelElement);
            }
        }
    }
    
    toggleSubmenu(item) {
        // Close any open tab overflow dropdowns
        document.querySelectorAll('.dock-tab-overflow-dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        
        if (this.activeItem === item) {
            // Close if clicking the same item
            this.closeAllMenus();
        } else {
            // Close others and open this one
            this.closeAllMenus();
            if (item.submenuElement) {
                // Dispatch event to close other menus (file tree, hierarchy, etc.)
                window.dispatchEvent(new CustomEvent('menuOpened', { detail: { source: 'menubar' } }));
                
                item.submenuElement.classList.add('active');
                item.topLevelElement.classList.add('active');
                this.activeItem = item;
            }
        }
    }
    
    closeAllMenus() {
        this.items.forEach(item => {
            if (item.submenuElement) {
                item.submenuElement.classList.remove('active');
            }
            if (item.topLevelElement) {
                item.topLevelElement.classList.remove('active');
            }
            // Recursively close submenus
            this._closeSubmenus(item);
        });
        this.activeItem = null;
    }
    
    _closeSubmenus(item) {
        if (item.submenu) {
            item.submenu.forEach(subItem => {
                if (subItem.submenuElement) {
                    subItem.submenuElement.classList.remove('active');
                }
                this._closeSubmenus(subItem);
            });
        }
    }
    
    updateDisplay() {
        // Update all items recursively
        this.items.forEach(item => {
            // Update top-level text
            const textSpan = item.topLevelElement.querySelector('span');
            if (textSpan) {
                textSpan.textContent = item.text;
            }
            // Recursively update item
            item.updateDisplay();
        });
    }
}