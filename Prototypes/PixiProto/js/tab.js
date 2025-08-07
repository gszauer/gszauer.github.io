class Tab {
    constructor(parent, name = 'Untitled', options = {}) {
        if (!parent) {
            throw new Error('Tab must have a parent');
        }
        
        this.guid = generateGuid();
        this.parent = parent;
        this.name = name;
        this.closable = options.closable !== undefined ? options.closable : true;
        this.div = document.createElement('div');
        this.div.className = 'dock-tab-body-tab';
        this.div.id = this.guid;
        
        // Demo content
        const content = document.createElement('div');
        content.className = 'demo-content';
        content.textContent = `Content for ${name}`;
        this.div.appendChild(content);
        
        this.headerElement = null;
        this.onTabClosed = null;
        
        // Add to parent
        if (parent instanceof Dock || parent instanceof Splitter) {
            parent._addTab(this);
        } else if (parent.splitA || parent.splitB) {
            // It's a split plane reference
            parent.splitA ? parent.splitA._addTab(this) : parent.splitB._addTab(this);
        }
    }
    
    close() {
        if (this.onTabClosed) {
            this.onTabClosed(this);
        }
        this.parent._removeTab(this, false);
    }
    
    activate() {
        this.parent._activateTab(this);
    }
} 
