class Dock {
    constructor(target) {
        this.guid = generateGuid();
        this.parent = null;
        this.div = document.createElement('div');
        this.div.className = 'dock';
        this.div.id = this.guid;
        
        this.tabs = [];
        this.activeTab = null;
        this.splitter = null;
        
        // Tab container elements
        this.tabContainer = null;
        this.tabHeader = null;
        this.tabBody = null;
        
        // Handle different constructor arguments
        if (target) {
            if (typeof target === 'string') {
                document.getElementById(target).appendChild(this.div);
            } else if (target instanceof HTMLElement) {
                target.appendChild(this.div);
            } else if (target.div && target.div instanceof HTMLElement) {
                target.div.appendChild(this.div);
            }
        } else {
            // No target, user needs to append manually
        }
        
        // Mark as active for demo
        window.activeDock = this;
    }
    
    _initTabContainer() {
        if (this.tabContainer) return;
        
        this.tabContainer = document.createElement('div');
        this.tabContainer.className = 'dock-tab-container';
        
        this.tabHeader = document.createElement('div');
        this.tabHeader.className = 'dock-tab-header';
        
        this.tabHeaderScroll = document.createElement('div');
        this.tabHeaderScroll.className = 'dock-tab-header-scroll';
        this.tabHeader.appendChild(this.tabHeaderScroll);
        
        this.tabBody = document.createElement('div');
        this.tabBody.className = 'dock-tab-body';
        
        // Create overflow button and dropdown
        this.overflowButton = document.createElement('div');
        this.overflowButton.className = 'dock-tab-overflow-button';
        this.overflowButton.innerHTML = '⋮'; // Three dots icon
        
        this.overflowDropdown = document.createElement('div');
        this.overflowDropdown.className = 'dock-tab-overflow-dropdown';
        
        // Setup overflow button click
        this.overflowButton.onclick = (e) => {
            e.stopPropagation();
            
            // Close all menu bar submenus
            document.querySelectorAll('.menu-submenu.active').forEach(submenu => {
                submenu.classList.remove('active');
            });
            document.querySelectorAll('.menu-bar-item.active').forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Close all other dropdowns first
            document.querySelectorAll('.dock-tab-overflow-dropdown.active').forEach(dropdown => {
                if (dropdown !== this.overflowDropdown) {
                    dropdown.classList.remove('active');
                }
            });
            
            this.overflowDropdown.classList.toggle('active');
        };
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.overflowButton.contains(e.target) && !this.overflowDropdown.contains(e.target)) {
                this.overflowDropdown.classList.remove('active');
            }
        });
        
        this.tabContainer.appendChild(this.tabHeader);
        this.tabContainer.appendChild(this.overflowButton);
        this.tabContainer.appendChild(this.overflowDropdown);
        this.tabContainer.appendChild(this.tabBody);
        this.div.appendChild(this.tabContainer);
        
        // Add dragover/drop handlers to header for dropping on empty space
        this.tabHeaderScroll.ondragover = (e) => {
            // Auto-scroll functionality
            this._handleTabBarAutoScroll(e);
            
            if (e.target === this.tabHeaderScroll) {
                e.preventDefault();
                if (!dragState.sourceTab) return;
                
                // Show indicator at the end
                const lastTab = this.tabHeaderScroll.lastElementChild;
                if (lastTab) {
                    const rect = lastTab.getBoundingClientRect();
                    const headerRect = this.tabHeader.getBoundingClientRect();
                    
                    if (!this.tabInsertionIndicator) {
                        this.tabInsertionIndicator = document.createElement('div');
                        this.tabInsertionIndicator.className = 'tab-insertion-indicator';
                        this.tabHeader.appendChild(this.tabInsertionIndicator);
                    }
                    
                    this.tabInsertionIndicator.style.left = (rect.right - headerRect.left) + 'px';
                    this.tabInsertionIndicator.style.display = 'block';
                }
            }
        };
        
        this.tabHeaderScroll.ondragleave = (e) => {
            if (e.target === this.tabHeaderScroll && (!e.relatedTarget || !this.tabHeaderScroll.contains(e.relatedTarget))) {
                this._hideTabInsertionIndicator();
                this._clearAutoScroll();
            }
        };
        
        this.tabHeaderScroll.ondrop = (e) => {
            if (e.target === this.tabHeaderScroll) {
                e.preventDefault();
                e.stopPropagation();
                this._hideTabInsertionIndicator();
                
                if (!dragState.sourceTab || !dragState.sourceDock) {
                    return;
                }
                
                // Drop at the end
                this._handleTabDrop(dragState.sourceTab, dragState.sourceDock, this.tabs.length);
            }
        };
        
        // Create dock target
        this._createDockTarget();
    }
    
    _createDockTarget() {
        // Check if target already exists
        const existingTarget = this.div.querySelector('.dock-target');
        if (existingTarget) return;
        
        const target = document.createElement('div');
        target.className = 'dock-target';
        
        const overlay = document.createElement('div');
        overlay.className = 'dock-target-overlay';
        
        const directions = ['up', 'down', 'left', 'right', 'center'];
        const icons = ['↑', '↓', '←', '→', '⊕'];
        
        directions.forEach((dir, i) => {
            const dropZone = document.createElement('div');
            dropZone.className = `dock-target-${dir}`;
            dropZone.textContent = icons[i];
            
            dropZone.ondragover = (e) => {
                e.preventDefault();
                overlay.classList.add('active');
                overlay.classList.remove('preview-up', 'preview-down', 'preview-left', 'preview-right', 'preview-center');
                overlay.classList.add(`preview-${dir}`);
            };
            
            dropZone.ondragleave = (e) => {
                overlay.classList.remove('active');
                overlay.classList.remove('preview-up', 'preview-down', 'preview-left', 'preview-right', 'preview-center');
            };
            
            dropZone.ondrop = (e) => {
                e.preventDefault();
                overlay.classList.remove('active');
                this._handleDrop(dir);
            };
            
            target.appendChild(dropZone);
        });
        
        target.appendChild(overlay);
        this.div.appendChild(target);
    }
    
    _handleDrop(direction) {
        if (!dragState.sourceTab || !dragState.sourceDock) return;
        
        const sourceTab = dragState.sourceTab;
        const sourceDock = dragState.sourceDock;
        const sourceIndex = dragState.sourceIndex;
        
        if (direction === 'center') {
            // Move tab to this dock
            if (sourceDock !== this) {
                sourceDock._removeTab(sourceTab, true);
                this._addTab(sourceTab);
                
                // Activate the newly added tab
                sourceTab.activate();
                
                // Check if source dock is empty
                if (sourceDock.tabs.length === 0) {
                    sourceDock._checkEmpty();
                }
            }
        } else {
            // Handle directional drops (up, down, left, right)
            
            // Special case: if dropping the only tab from source dock onto itself, ignore
            if (sourceDock === this && sourceDock.tabs.length === 1) {
                return;
            }
            
            // Create a new split
            const vertical = direction === 'up' || direction === 'down';
            const splitter = new Splitter(this, { vertical });
            
            // When we create a splitter on a dock with tabs, the existing tabs go to splitA
            // So we need to put the new dock in splitB for up/left, or keep it in splitB for down/right
            const newDock = new Dock();
            
            if (direction === 'up' || direction === 'left') {
                // For up/left, we want the new tab above/left of existing content
                // Since existing content is in splitA, we need to swap them
                const existingDock = splitter.splitA.content;
                splitter.splitA.element.removeChild(existingDock.div);
                splitter.splitA.content = null;
                
                splitter.splitA._setDock(newDock);
                newDock.parent = splitter.splitA;
                
                splitter.splitB._setDock(existingDock);
                existingDock.parent = splitter.splitB;
            } else {
                // For down/right, new tab goes to splitB (which is empty)
                splitter.splitB._setDock(newDock);
                newDock.parent = splitter.splitB;
            }
            
            // Move the tab - but be careful with same-dock moves
            if (sourceDock === this) {
                // If we're splitting the same dock, the tab is already in existingDock
                // which was moved to one of the splits. We need to remove it from there
                // and add it to the newDock
                const existingDock = direction === 'up' || direction === 'left' 
                    ? splitter.splitB.content 
                    : splitter.splitA.content;
                existingDock._removeTab(sourceTab, true);
                newDock._addTab(sourceTab);
                
                // Activate the moved tab
                sourceTab.activate();
                
                // Ensure the existing dock has an active tab
                if (existingDock.tabs.length > 0 && !existingDock.activeTab) {
                    existingDock._activateTab(existingDock.tabs[0]);
                }
            } else {
                // Normal case: moving from different dock
                sourceDock._removeTab(sourceTab, true);
                newDock._addTab(sourceTab);
                
                // Activate the moved tab
                sourceTab.activate();
                
                // Check if source dock is empty
                if (sourceDock.tabs.length === 0) {
                    sourceDock._checkEmpty();
                }
            }
        }
    }
    
    _setSplitter(splitter) {
        // If we have tabs, we need to move them to split A
        if (this.tabs.length > 0) {
            // Create a new dock for the existing tabs
            const newDock = new Dock();
            newDock.parent = splitter.splitA;
            
            // Remember which tab was active
            const wasActiveTab = this.activeTab;
            
            // Move all tabs to the new dock
            const tabsToMove = [...this.tabs];
            tabsToMove.forEach(tab => {
                this._removeTab(tab, true); // Skip empty check during move
                newDock._addTab(tab);
            });
            
            // Re-activate the previously active tab
            if (wasActiveTab && newDock.tabs.includes(wasActiveTab)) {
                newDock._activateTab(wasActiveTab);
            }
            
            // Set the new dock in split A
            splitter.splitA._setDock(newDock);
        }
        
        // Remove tab container and dock target
        if (this.tabContainer) {
            this.div.removeChild(this.tabContainer);
            this.tabContainer = null;
            this.tabHeader = null;
            this.tabBody = null;
        }
        
        // Remove dock target if it exists
        const dockTarget = this.div.querySelector('.dock-target');
        if (dockTarget) {
            this.div.removeChild(dockTarget);
        }
        
        this.splitter = splitter;
        this.div.appendChild(splitter.div);
    }
    
    _addTab(tab) {
        if (this.splitter) {
            throw new Error('Cannot add tab to dock with splitter');
        }
        
        this._initTabContainer();
        
        // Ensure we don't add the same tab twice
        if (this.tabs.includes(tab)) {
            return;
        }
        
        this.tabs.push(tab);
        tab.parent = this;
        
        // Ensure tab content is hidden by default and remove any active classes
        tab.div.style.display = 'none';
        if (tab.div) {
            tab.div.classList.remove('dock-tab-active');
        }
        
        // Create header element only if it doesn't exist
        let headerTab = tab.headerElement;
        if (!headerTab) {
            headerTab = document.createElement('div');
            headerTab.className = 'dock-tab-header-tab';
            headerTab.draggable = true;
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = tab.name;
            headerTab.appendChild(titleSpan);
            
            // Only add close button if tab is closable
            if (tab.closable) {
                const closeButton = document.createElement('div');
                closeButton.className = 'dock-tab-header-tab-close-button';
                closeButton.textContent = '×';
                closeButton.onclick = (e) => {
                    e.stopPropagation();
                    tab.close();
                };
                headerTab.appendChild(closeButton);
            }
            
            tab.headerElement = headerTab;
        } else {
            // Remove any existing active class from reused header
            headerTab.classList.remove('dock-tab-active');
        }
        
        // Always re-attach onclick handler to ensure it references the correct dock
        headerTab.onclick = () => {
            tab.activate();
            // Ensure the tab is fully visible after activation
            if (tab.parent && tab.parent._ensureTabFullyVisible) {
                tab.parent._ensureTabFullyVisible(tab);
            }
        };
        
        // Always re-attach drag handlers to ensure they reference the correct dock
        headerTab.ondragover = (e) => {
            e.preventDefault();
            if (!dragState.sourceTab) return;
            
            const currentDock = tab.parent;
            if (currentDock) {
                // Auto-scroll functionality
                currentDock._handleTabBarAutoScroll(e);
                
                // Show insertion indicator
                if (currentDock._showTabInsertionIndicator) {
                    currentDock._showTabInsertionIndicator(e, headerTab);
                }
            }
        };
        
        headerTab.ondragleave = (e) => {
            // Only hide if we're truly leaving the header area
            const currentDock = tab.parent;
            if (currentDock && currentDock.tabHeaderScroll && 
                (!e.relatedTarget || !currentDock.tabHeaderScroll.contains(e.relatedTarget))) {
                currentDock._hideTabInsertionIndicator();
                currentDock._clearAutoScroll();
            }
        };
        
        headerTab.ondrop = (e) => {
            const currentDock = tab.parent;
            e.preventDefault();
            e.stopPropagation();
            if (currentDock) {
                currentDock._hideTabInsertionIndicator();
            }
            
            if (!dragState.sourceTab || !dragState.sourceDock) {
                return;
            }
            
            if (currentDock) {
                const dropIndex = currentDock._getDropIndex(e);
                currentDock._handleTabDrop(dragState.sourceTab, dragState.sourceDock, dropIndex);
            }
        };
        
        headerTab.ondragstart = (e) => {
            // Use tab.parent instead of 'this' to get the current dock
            const currentDock = tab.parent;
            const index = currentDock.tabs.indexOf(tab);
            dragState.sourceTab = tab;
            dragState.sourceDock = currentDock;
            dragState.sourceIndex = index;
            
            headerTab.classList.add('dragging');
            document.body.classList.add('tab-dragging');
            
            // Show dock targets only for leaf docks (those with tabs, not splitters)
            const allDocks = document.querySelectorAll('.dock');
            allDocks.forEach(dock => {
                const dockObj = currentDock._findDockByElement(dock);
                if (dockObj && dockObj.tabs && dockObj.tabs.length >= 0 && !dockObj.splitter) {
                    const target = dock.querySelector('.dock-target');
                    if (target && target.parentElement === dock) {
                        target.classList.add('active');
                    }
                }
            });
            
            // Enable tab header drop zones
            document.querySelectorAll('.dock-tab-header').forEach(header => {
                header.classList.add('drop-enabled');
            });
            
            e.dataTransfer.effectAllowed = 'move';
        };
        
        headerTab.ondragend = (e) => {
            headerTab.classList.remove('dragging');
            document.body.classList.remove('tab-dragging');
            
            // Hide all dock targets
            const allTargets = document.querySelectorAll('.dock-target');
            allTargets.forEach(target => {
                target.classList.remove('active');
            });
            
            // Disable tab header drop zones
            document.querySelectorAll('.dock-tab-header').forEach(header => {
                header.classList.remove('drop-enabled');
            });
            
            // Hide insertion indicator
            const currentDock = tab.parent;
            if (currentDock && currentDock._hideTabInsertionIndicator) {
                currentDock._hideTabInsertionIndicator();
            }
            
            // Clear auto-scroll for all docks
            if (window.rootDock) {
                const clearAllAutoScroll = (dock) => {
                    if (!dock) return;
                    
                    if (dock._clearAutoScroll) {
                        dock._clearAutoScroll();
                    }
                    
                    if (dock.splitter) {
                        if (dock.splitter.splitA.content) {
                            clearAllAutoScroll(dock.splitter.splitA.content);
                        }
                        if (dock.splitter.splitB.content) {
                            clearAllAutoScroll(dock.splitter.splitB.content);
                        }
                    }
                };
                clearAllAutoScroll(window.rootDock);
            }
            
            // Reset drag state
            dragState.sourceTab = null;
            dragState.sourceDock = null;
            dragState.sourceIndex = -1;
        };
        this.tabHeaderScroll.appendChild(headerTab);
        this.tabBody.appendChild(tab.div);
        
        // Activate if first tab
        if (this.tabs.length === 1) {
            this._activateTab(tab);
        }
        
        // Update overflow (with delay to ensure rendering)
        setTimeout(() => this._updateTabOverflow(), 0);
        
        // Mark dock as active for demo
        window.activeDock = this;
    }
    
    _removeTab(tab, skipEmptyCheck = false) {
        const index = this.tabs.indexOf(tab);
        if (index === -1) {
            return;
        }
        
        this.tabs.splice(index, 1);
        // Remove from the scroll container if it exists, otherwise from tabHeader
        if (this.tabHeaderScroll && tab.headerElement.parentNode === this.tabHeaderScroll) {
            this.tabHeaderScroll.removeChild(tab.headerElement);
        } else if (tab.headerElement.parentNode) {
            tab.headerElement.parentNode.removeChild(tab.headerElement);
        }
        
        if (tab.div.parentNode === this.tabBody) {
            this.tabBody.removeChild(tab.div);
        }
        
        // Activate another tab if this was active
        if (tab === this.activeTab && this.tabs.length > 0) {
            // Try to activate the next tab, or previous if it was the last
            const nextIndex = Math.min(index, this.tabs.length - 1);
            this._activateTab(this.tabs[nextIndex]);
            // Ensure the newly active tab is fully visible
            this._ensureTabFullyVisible(this.tabs[nextIndex]);
        } else if (this.tabs.length === 0) {
            this.activeTab = null;
            if (!skipEmptyCheck) {
                this._checkEmpty();
            }
        }
        
        // Update overflow (with delay to ensure rendering)
        if (this.tabs.length > 0) {
            setTimeout(() => this._updateTabOverflow(), 0);
        }
    }
    
    _activateTab(tab) {
        if (this.activeTab === tab) return;
        
        // First, deactivate ALL tabs in this dock to prevent multiple active tabs
        this.tabs.forEach(t => {
            if (t.headerElement) {
                t.headerElement.classList.remove('dock-tab-active');
            }
            if (t.div) {
                t.div.classList.remove('dock-tab-active');
                t.div.style.display = 'none';
            }
        });
        
        // Activate new tab
        this.activeTab = tab;
        if (tab.headerElement) {
            tab.headerElement.classList.add('dock-tab-active');
        }
        if (tab.div) {
            tab.div.classList.add('dock-tab-active');
            tab.div.style.display = 'block';
        }
        
        // Ensure active tab is visible
        this._ensureActiveTabVisible();
        
        // Mark this dock as active for demo
        window.activeDock = this;
    }
    
    _updateTabOverflow() {
        if (!this.tabHeader || !this.overflowButton || !this.overflowDropdown || !this.tabHeaderScroll) return;
        
        // Clear dropdown
        this.overflowDropdown.innerHTML = '';
        
        // All tabs should always be visible in the scroll container
        this.tabs.forEach(tab => {
            if (tab.headerElement) {
                tab.headerElement.style.display = 'flex';
                tab.headerElement.style.marginLeft = '0'; // Reset any margins
            }
        });
        
        // Calculate if we need overflow button
        const containerWidth = this.tabHeaderScroll.clientWidth;
        const scrollWidth = this.tabHeaderScroll.scrollWidth;
        const hasOverflow = scrollWidth > containerWidth;
        
        if (hasOverflow) {
            // Show overflow button
            this.overflowButton.classList.add('active');
            
            // Determine which tabs are visible in the current scroll view
            const scrollLeft = this.tabHeaderScroll.scrollLeft;
            const visibleRight = scrollLeft + containerWidth - 40; // Account for overflow button
            
            this.tabs.forEach(tab => {
                if (!tab.headerElement) return;
                
                const tabLeft = tab.headerElement.offsetLeft;
                const tabRight = tabLeft + tab.headerElement.offsetWidth;
                
                // Add to dropdown if tab is partially or fully outside visible area
                if (tabRight > visibleRight || tabLeft < scrollLeft) {
                    const dropdownItem = document.createElement('div');
                    dropdownItem.className = 'dock-tab-overflow-item';
                    if (tab === this.activeTab) {
                        dropdownItem.classList.add('active');
                    }
                    
                    const textSpan = document.createElement('span');
                    textSpan.className = 'dock-tab-overflow-item-text';
                    textSpan.textContent = tab.name;
                    textSpan.onclick = (e) => {
                        e.stopPropagation();
                        tab.activate();
                        this.overflowDropdown.classList.remove('active');
                        this._positionTabForCloseButton(tab);
                    };
                    
                    const closeButton = document.createElement('div');
                    closeButton.className = 'dock-tab-overflow-item-close';
                    closeButton.textContent = '×';
                    closeButton.onclick = (e) => {
                        e.stopPropagation();
                        tab.close();
                        this.overflowDropdown.classList.remove('active');
                    };
                    
                    dropdownItem.appendChild(textSpan);
                    dropdownItem.appendChild(closeButton);
                    this.overflowDropdown.appendChild(dropdownItem);
                }
            });
        } else {
            // No overflow - hide button and dropdown
            this.overflowButton.classList.remove('active');
            this.overflowDropdown.classList.remove('active');
        }
        
        // Listen for scroll events to update dropdown
        if (!this.tabHeaderScroll._scrollListenerAttached) {
            this.tabHeaderScroll._scrollListenerAttached = true;
            this.tabHeaderScroll.addEventListener('scroll', () => {
                if (this.overflowDropdown.classList.contains('active')) {
                    this._updateTabOverflow();
                }
            });
        }
    }
    
    _ensureActiveTabVisible() {
        if (!this.activeTab || !this.activeTab.headerElement) return;
        
        // Update overflow which will ensure active tab is visible
        this._updateTabOverflow();
    }
    
    _ensureTabFullyVisible(tab) {
        if (!tab || !tab.headerElement || !this.tabHeaderScroll) return;
        
        // Small delay to ensure any layout updates are complete
        setTimeout(() => {
            const tabLeft = tab.headerElement.offsetLeft;
            const tabWidth = tab.headerElement.offsetWidth;
            const tabRight = tabLeft + tabWidth;
            
            const scrollLeft = this.tabHeaderScroll.scrollLeft;
            const scrollWidth = this.tabHeaderScroll.clientWidth;
            const overflowButtonWidth = 40;
            const visibleWidth = scrollWidth - overflowButtonWidth;
            const visibleRight = scrollLeft + visibleWidth;
            
            // Check if tab is partially visible on the right
            if (tabRight > visibleRight && tabLeft < visibleRight) {
                // Scroll to show the full tab (with close button visible)
                const newScroll = tabRight - visibleWidth + 10;
                this.tabHeaderScroll.scrollLeft = newScroll;
            }
            // Check if tab is partially visible on the left
            else if (tabLeft < scrollLeft && tabRight > scrollLeft) {
                // Scroll to show the full tab from the left
                const newScroll = tabLeft - 10;
                this.tabHeaderScroll.scrollLeft = newScroll;
            }
            
        }, 10);
    }
    
    _positionTabForCloseButton(tab) {
        if (!tab || !tab.headerElement || !this.tabHeaderScroll) return;
        
        // Use scrolling to ensure the tab's close button is visible
        setTimeout(() => {
            const tabRect = tab.headerElement.getBoundingClientRect();
            const scrollRect = this.tabHeaderScroll.getBoundingClientRect();
            const overflowButtonWidth = 40;
            
            // Calculate the desired scroll position
            // We want the tab's right edge (where close button is) to be visible
            // and not hidden behind the overflow button
            const tabRightEdge = tab.headerElement.offsetLeft + tab.headerElement.offsetWidth;
            const visibleWidth = this.tabHeaderScroll.clientWidth - overflowButtonWidth;
            const currentScroll = this.tabHeaderScroll.scrollLeft;
            
            // If the tab's right edge is beyond the visible area, scroll to show it
            if (tabRightEdge > currentScroll + visibleWidth) {
                // Scroll so the tab's right edge is just before the overflow button
                const newScroll = tabRightEdge - visibleWidth + 10; // 10px buffer
                this.tabHeaderScroll.scrollLeft = newScroll;
            } else if (tab.headerElement.offsetLeft < currentScroll) {
                // If the tab is to the left of the visible area, scroll to show it
                this.tabHeaderScroll.scrollLeft = tab.headerElement.offsetLeft - 10; // 10px buffer
            } 
        }, 50); // Small delay to ensure activation completes first
    }
    
    _checkEmpty() {
        if (this.tabs.length === 0 && this.parent) {
            // Remove tab container
            if (this.tabContainer) {
                this.div.removeChild(this.tabContainer);
                this.tabContainer = null;
                this.tabHeader = null;
                this.tabBody = null;
            }
            
            // Notify parent to collapse
            if (this.parent instanceof SplitPlane) {
                this.parent.splitter._collapseSplitter(this.parent.side);
            } 
        }
    }
    
    _showTabInsertionIndicator(e, targetHeaderTab) {
        if (!this.tabInsertionIndicator) {
            this.tabInsertionIndicator = document.createElement('div');
            this.tabInsertionIndicator.className = 'tab-insertion-indicator';
            this.tabHeader.appendChild(this.tabInsertionIndicator);
        }
        
        const rect = targetHeaderTab.getBoundingClientRect();
        const headerRect = this.tabHeader.getBoundingClientRect();
        const mouseX = e.clientX;
        
        // Determine if we should insert before or after
        const insertBefore = mouseX < rect.left + rect.width / 2;
        const indicatorX = insertBefore ? rect.left - headerRect.left : rect.right - headerRect.left;
        
        this.tabInsertionIndicator.style.left = indicatorX + 'px';
        this.tabInsertionIndicator.style.display = 'block';
    }
    
    _hideTabInsertionIndicator() {
        if (this.tabInsertionIndicator) {
            this.tabInsertionIndicator.style.display = 'none';
        }
    }
    
    _getDropIndex(e) {
        const tabs = Array.from(this.tabHeaderScroll.children);
        let dropIndex = tabs.length;
        
        for (let i = 0; i < tabs.length; i++) {
            const rect = tabs[i].getBoundingClientRect();
            if (e.clientX < rect.left + rect.width / 2) {
                dropIndex = i;
                break;
            }
        }
        
        return dropIndex;
    }
    
    _handleTabBarAutoScroll(e) {
        if (!this.tabHeaderScroll) return;
        
        const scrollContainer = this.tabHeaderScroll;
        const rect = scrollContainer.getBoundingClientRect();
        const mouseX = e.clientX;
        const scrollSpeed = 10; // Doubled speed
        const edgeSize = 50; // Pixels from edge to start scrolling
        
        // Check if we need to scroll
        const leftEdge = rect.left;
        const rightEdge = rect.right;
        
        // Clear any existing scroll interval
        if (this._scrollInterval) {
            clearInterval(this._scrollInterval);
            this._scrollInterval = null;
        }
        
        // Scroll left
        if (mouseX < leftEdge + edgeSize && scrollContainer.scrollLeft > 0) {
            this._scrollInterval = setInterval(() => {
                scrollContainer.scrollLeft -= scrollSpeed;
                if (scrollContainer.scrollLeft <= 0) {
                    clearInterval(this._scrollInterval);
                    this._scrollInterval = null;
                }
            }, 16); // ~60fps
        }
        // Scroll right
        else if (mouseX > rightEdge - edgeSize && 
                 scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            this._scrollInterval = setInterval(() => {
                scrollContainer.scrollLeft += scrollSpeed;
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                    clearInterval(this._scrollInterval);
                    this._scrollInterval = null;
                }
            }, 16); // ~60fps
        }
    }
    
    _clearAutoScroll() {
        if (this._scrollInterval) {
            clearInterval(this._scrollInterval);
            this._scrollInterval = null;
        }
    }
    
    _handleTabDrop(sourceTab, sourceDock, dropIndex) {
        if (sourceDock === this) {
            // Reordering within the same dock
            const currentIndex = this.tabs.indexOf(sourceTab);
            if (currentIndex === -1) {
                return;
            }
            
            // Remove from current position
            this.tabs.splice(currentIndex, 1);
            
            // Adjust drop index if necessary
            if (currentIndex < dropIndex) {
                dropIndex--;
            }
            
            // Insert at new position
            this.tabs.splice(dropIndex, 0, sourceTab);
            
            // Reorder DOM elements
            const tabElement = sourceTab.headerElement;
            const targetElement = this.tabHeaderScroll.children[dropIndex];
            
            if (targetElement) {
                this.tabHeaderScroll.insertBefore(tabElement, targetElement);
            } else {
                this.tabHeaderScroll.appendChild(tabElement);
            }
        } else {
            // Moving from different dock
            sourceDock._removeTab(sourceTab, true);
            
            // Insert at specific position
            this.tabs.splice(dropIndex, 0, sourceTab);
            sourceTab.parent = this;
            
            // Insert header element at correct position
            const targetElement = this.tabHeaderScroll.children[dropIndex];
            if (targetElement) {
                this.tabHeaderScroll.insertBefore(sourceTab.headerElement, targetElement);
            } else {
                this.tabHeaderScroll.appendChild(sourceTab.headerElement);
            }
            
            // Add body element
            this.tabBody.appendChild(sourceTab.div);
            
            // Activate the moved tab
            sourceTab.activate();
            
            // Check if source dock is empty
            if (sourceDock.tabs.length === 0) {
                sourceDock._checkEmpty();
            }
        }
        
        // Update overflow
        setTimeout(() => this._updateTabOverflow(), 0);
    }
    
    
    AddTab(name = 'Untitled', options = {}) {
        return new Tab(this, name, options);
    }
    
    ContainsTab(title) {
        for (const tab of this.tabs) {
            if (tab.name === title) {
                return true;
            }
        }
        
        if (this.splitter) {
            if (this.splitter.splitA.content instanceof Dock) {
                if (this.splitter.splitA.content.ContainsTab(title)) {
                    return true;
                }
            }
            if (this.splitter.splitB.content instanceof Dock) {
                if (this.splitter.splitB.content.ContainsTab(title)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    FindTab(title) {
        for (const tab of this.tabs) {
            if (tab.name === title) {
                return tab;
            }
        }
        
        if (this.splitter) {
            if (this.splitter.splitA.content instanceof Dock) {
                const found = this.splitter.splitA.content.FindTab(title);
                if (found) return found;
            }
            if (this.splitter.splitB.content instanceof Dock) {
                const found = this.splitter.splitB.content.FindTab(title);
                if (found) return found;
            }
        }
        
        return null;
    }
    
    SplitHorizontal(options = {}) {
        const splitter = new Splitter(this, { ...options, vertical: false });
        return splitter;
    }
    
    SplitVertical(options = {}) {
        const splitter = new Splitter(this, { ...options, vertical: true });
        return splitter;
    }
    
    _findDockByElement(element) {
        // Helper to find dock instance by DOM element
        if (!window.rootDock) return null;
        
        function searchDock(dock) {
            if (dock.div === element) return dock;
            
            if (dock.splitter) {
                if (dock.splitter.splitA.content) {
                    const result = searchDock(dock.splitter.splitA.content);
                    if (result) return result;
                }
                if (dock.splitter.splitB.content) {
                    const result = searchDock(dock.splitter.splitB.content);
                    if (result) return result;
                }
            }
            return null;
        }
        
        return searchDock(window.rootDock);
    }
    
    PrintTree(indent = '') {
        console.warn(indent + `Dock [${this.guid}]`);
        if (this.tabs.length > 0) {
            this.tabs.forEach(tab => {
                console.warn(indent + `  Tab: ${tab.name} [${tab.guid}]${tab === this.activeTab ? ' (active)' : ''}`);
            });
        } else if (this.splitter) {
            this._printSplitter(this.splitter, indent + '  ');
        }
    }
    
    _printSplitter(splitter, indent) {
        if (splitter.splitA.content instanceof Dock) {
            splitter.splitA.content.PrintTree(indent + '    ');
        } else if (splitter.splitA.content instanceof Splitter) {
            this._printSplitter(splitter.splitA.content, indent + '    ');
        } 
        if (splitter.splitB.content instanceof Dock) {
            splitter.splitB.content.PrintTree(indent + '    ');
        } else if (splitter.splitB.content instanceof Splitter) {
            this._printSplitter(splitter.splitB.content, indent + '    ');
        } 
    }
} 
