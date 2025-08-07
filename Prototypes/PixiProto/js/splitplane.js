class SplitPlane {
    constructor(splitter, side) {
        this.splitter = splitter;
        this.side = side;
        this.element = side === 'a' ? splitter.splitAElement : splitter.splitBElement;
        this.content = null; // Can be a Dock, Splitter, or null
    }
    
    _setSplitter(splitter) {
        if (this.content) {
            throw new Error('Split plane already has content');
        }
        this.content = splitter;
        this.element.appendChild(splitter.div);
    }
    
    _setDock(dock) {
        if (this.content) {
            throw new Error('Split plane already has content');
        }
        this.content = dock;
        this.element.appendChild(dock.div);
    }
    
    SplitHorizontal(options = {}) {
        const newDock = new Dock();
        newDock.parent = this;
        
        if (this.content) {
            // Move existing content to new dock
            this.element.removeChild(this.content.div);
            newDock.div.appendChild(this.content.div);
        }
        
        const newSplitter = new Splitter(this, { ...options, vertical: false });
        if (this.content) {
            newSplitter.splitA._setDock(newDock);
        }
        
        return newSplitter;
    }
    
    SplitVertical(options = {}) {
        const newDock = new Dock();
        newDock.parent = this;
        
        if (this.content) {
            // Move existing content to new dock
            this.element.removeChild(this.content.div);
            newDock.div.appendChild(this.content.div);
        }
        
        const newSplitter = new Splitter(this, { ...options, vertical: true });
        if (this.content) {
            newSplitter.splitA._setDock(newDock);
        }
        
        return newSplitter;
    }
} 
