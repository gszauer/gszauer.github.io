class Splitter {
    constructor(parent, options = {}) {
        if (!parent) {
            throw new Error('Splitter must have a parent');
        }
        
        this.guid = generateGuid();
        this.parent = parent;
        this.div = document.createElement('div');
        this.div.id = this.guid;
        
        this.vertical = options.vertical || false;
        this.minPx = options.minPx || 50;
        this.lockA = options.lockA || false;
        this.lockB = options.lockB || false;
        
        // Create split structure
        this.splitAElement = document.createElement('div');
        this.splitAElement.className = 'dock-split-a';
        
        this.separatorElement = document.createElement('div');
        this.separatorElement.className = 'dock-separator';
        
        this.splitBElement = document.createElement('div');
        this.splitBElement.className = 'dock-split-b';
        
        this.div.appendChild(this.splitAElement);
        this.div.appendChild(this.separatorElement);
        this.div.appendChild(this.splitBElement);
        
        this._updateOrientation();
        
        // Set initial split sizes
        this.splitAElement.style.flexBasis = '50%';
        this.splitAElement.style.flexGrow = '0';
        this.splitAElement.style.flexShrink = '0';
        this.splitBElement.style.flexBasis = '50%';
        this.splitBElement.style.flexGrow = '1';
        this.splitBElement.style.flexShrink = '1';
        
        // Split plane containers
        this.splitA = new SplitPlane(this, 'a');
        this.splitB = new SplitPlane(this, 'b');
        
        // Setup resize handling
        this._setupResize();
        
        // Add to parent
        if (parent instanceof Dock) {
            parent._setSplitter(this);
        } else if (parent instanceof SplitPlane) {
            parent._setSplitter(this);
        }
    }
    
    _updateOrientation() {
        if (this.vertical) {
            this.div.className = 'dock-split-vertical';
            this.separatorElement.className = 'dock-separator dock-separator-vertical';
        } else {
            this.div.className = 'dock-split-horizontal';
            this.separatorElement.className = 'dock-separator dock-separator-horizontal';
        }
    }
    
    _setupResize() {
        let isResizing = false;
        let startPos = 0;
        let startSize = 0;
        
        this.separatorElement.addEventListener('mousedown', (e) => {
            if (this.lockA || this.lockB) return;
            
            isResizing = true;
            startPos = this.vertical ? e.clientY : e.clientX;
            const rect = this.splitAElement.getBoundingClientRect();
            startSize = this.vertical ? rect.height : rect.width;
            
            document.body.classList.add('resizing');
            if (this.vertical) {
                document.body.classList.add('resizing-vertical');
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const currentPos = this.vertical ? e.clientY : e.clientX;
            const diff = currentPos - startPos;
            const newSize = startSize + diff;
            
            const containerRect = this.div.getBoundingClientRect();
            const maxSize = (this.vertical ? containerRect.height : containerRect.width) - this.minPx - 4;
            
            if (newSize >= this.minPx && newSize <= maxSize) {
                this.splitAElement.style.flexBasis = newSize + 'px';
                this.splitAElement.style.flexGrow = '0';
                this.splitBElement.style.flexGrow = '1';
                
                // Update tab overflow during drag
                function updateAllDocks(dock) {
                    if (!dock) return;
                    
                    if (dock.tabs && dock._updateTabOverflow) {
                        dock._updateTabOverflow();
                    }
                    
                    if (dock.splitter) {
                        if (dock.splitter.splitA.content) {
                            updateAllDocks(dock.splitter.splitA.content);
                        }
                        if (dock.splitter.splitB.content) {
                            updateAllDocks(dock.splitter.splitB.content);
                        }
                    }
                }
                
                if (window.rootDock) {
                    updateAllDocks(window.rootDock);
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.classList.remove('resizing', 'resizing-vertical');
                
                // Update tab overflow for all docks after resize
                setTimeout(() => {
                    function updateAllDocks(dock) {
                        if (!dock) return;
                        
                        if (dock.tabs && dock._updateTabOverflow) {
                            dock._updateTabOverflow();
                        }
                        
                        if (dock.splitter) {
                            if (dock.splitter.splitA.content) {
                                updateAllDocks(dock.splitter.splitA.content);
                            }
                            if (dock.splitter.splitB.content) {
                                updateAllDocks(dock.splitter.splitB.content);
                            }
                        }
                    }
                    
                    if (window.rootDock) {
                        updateAllDocks(window.rootDock);
                    }
                }, 0);
            }
        });
    }
    
    SplitHorizontal(options = {}) {
        return this.splitB.SplitHorizontal(options);
    }
    
    SplitVertical(options = {}) {
        return this.splitB.SplitVertical(options);
    }
    
    _collapseSplitter(emptySide) {
        // This is called on a splitter when one side becomes empty
        const remainingSide = emptySide === 'a' ? 'b' : 'a';
        const remainingContent = remainingSide === 'a' ? this.splitA.content : this.splitB.content;
        
        if (!remainingContent) {
            console.error('Cannot collapse splitter with both sides empty');
            return;
        }
        
        // We need to replace this splitter with the remaining content in the parent
        if (this.parent instanceof Dock) {
            // This splitter is directly in a dock
            // Remove the splitter and replace with remaining content
            this.parent.div.removeChild(this.div);
            this.parent.splitter = null;
            
            if (remainingContent instanceof Dock) {
                if (remainingContent.splitter) {
                    // The remaining dock contains a splitter, not tabs
                    const splitterToPromote = remainingContent.splitter;
                    remainingContent.div.removeChild(splitterToPromote.div);
                    remainingContent.splitter = null;
                    
                    this.parent.splitter = splitterToPromote;
                    splitterToPromote.parent = this.parent;
                    this.parent.div.appendChild(splitterToPromote.div);
                } else {
                    // The remaining dock contains tabs
                    // Move all tabs from remaining dock to parent
                    const tabsToMove = [...remainingContent.tabs];
                    const wasActiveTab = remainingContent.activeTab;
                    
                    tabsToMove.forEach(tab => {
                        remainingContent._removeTab(tab, true);
                        this.parent._addTab(tab);
                    });
                    
                    if (wasActiveTab && this.parent.tabs.includes(wasActiveTab)) {
                        this.parent._activateTab(wasActiveTab);
                    }
                }
            } else if (remainingContent instanceof Splitter) {
                // Set the remaining splitter as the dock's splitter
                this.parent.splitter = remainingContent;
                remainingContent.parent = this.parent;
                this.parent.div.appendChild(remainingContent.div);
            }
        } else if (this.parent instanceof SplitPlane) {
            // This splitter is in a split plane of another splitter
            const parentSplitter = this.parent.splitter;
            const whichSide = this.parent.side; // 'a' or 'b'
            
            // First, we need to get the other side's content from the parent splitter
            const otherSide = whichSide === 'a' ? 'b' : 'a';
            const otherContent = otherSide === 'a' ? parentSplitter.splitA.content : parentSplitter.splitB.content;
            
            // Now replace the parent splitter with the combined remaining content
            if (parentSplitter.parent instanceof Dock) {
                
                // Parent splitter is in a dock
                parentSplitter.parent.div.removeChild(parentSplitter.div);
                parentSplitter.parent.splitter = null;
                
                // Determine what content to promote
                const contentToPromote = otherContent || remainingContent;
                
                
                if (contentToPromote instanceof Dock) {
                    if (contentToPromote.splitter) {
                        // The dock contains a splitter
                        
                        const splitterToPromote = contentToPromote.splitter;
                        contentToPromote.div.removeChild(splitterToPromote.div);
                        contentToPromote.splitter = null;
                        
                        parentSplitter.parent.splitter = splitterToPromote;
                        splitterToPromote.parent = parentSplitter.parent;
                        parentSplitter.parent.div.appendChild(splitterToPromote.div);
                    } else {
                        // The dock contains tabs
                        // Move tabs to the grandparent dock
                        const tabsToMove = [...contentToPromote.tabs];
                        const wasActiveTab = contentToPromote.activeTab;
                        
                        tabsToMove.forEach(tab => {
                            contentToPromote._removeTab(tab, true);
                            parentSplitter.parent._addTab(tab);
                        });
                        
                        if (wasActiveTab && parentSplitter.parent.tabs.includes(wasActiveTab)) {
                            parentSplitter.parent._activateTab(wasActiveTab);
                        }
                    }
                } else if (contentToPromote instanceof Splitter) {
                    // Set the content as the dock's splitter
                    parentSplitter.parent.splitter = contentToPromote;
                    contentToPromote.parent = parentSplitter.parent;
                    parentSplitter.parent.div.appendChild(contentToPromote.div);
                }
            } else if (parentSplitter.parent instanceof SplitPlane) {
                // Parent splitter is in another split plane - continue collapsing up
                const grandParentSplitter = parentSplitter.parent.splitter;
                const parentWhichSide = parentSplitter.parent.side;
                
                // Remove parent splitter
                parentSplitter.parent.element.removeChild(parentSplitter.div);
                parentSplitter.parent.content = null;
                
                // Collapse the grandparent
                grandParentSplitter._collapseSplitter(parentWhichSide);
            }
        }
        
        if (window.rootDock) {
            window.rootDock.PrintTree();
        }
    }
} 
