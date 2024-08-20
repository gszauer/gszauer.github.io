
class UITabView {
    _uuid = "";
    static dragSource = null;
    static dragTabIndex = -1;

    parentSplitView = null; // Parent split view.
    get IsEmpty() {
        return this.html.content.length === 0;
    }
    
    html = {
        root: null,
        tabContainer: null,
        tabs: [],
        contentContainer: null,
        content: []
    };

    constructor() {
        const root = this.html.root = document.createElement('div');
        const tabContainer = this.html.tabContainer = document.createElement('div');
        const contentContainer = this.html.contentContainer = document.createElement('div');
        const next = document.createElement('button');
        next.innerHTML = "<span class=\"ph ph-arrow-right\"></span>";
        const prev = document.createElement('button');
        prev.innerHTML = "<span class=\"ph ph-arrow-left\"></span>";
        const tabNav = document.createElement('div');
        const tabScroll = document.createElement('div');
        const uuid = this._uuid = V4UUID();

        root.id = uuid;
        root.classList.add("UITabView");
        root.classList.add("UIDockable");
        tabContainer.classList.add("UITabViewTabs");
        tabNav.classList.add("UITabViewNavigation");
        tabScroll.classList.add("UITabViewScroll");
        //tabScroll.classList.add("UITabNavHidden");
        contentContainer.classList.add("UITabViewContent");
        
        // https://codepen.io/dec04/pen/DpGQJE
        tabScroll.appendChild(prev);
        tabScroll.appendChild(next);
        tabNav.appendChild(tabContainer);
        tabNav.appendChild(tabScroll);
        root.appendChild(tabNav);
        root.appendChild(contentContainer);

        const self = this;
        const dockTarget = new UIDockTarget(this);
        dockTarget.onDropTab = (sourceView, destView, sourceIndex, from) => {
            // Remove tab from old container. If the tab being removed was active, remove at will de-activate it.
            const tabToMove = sourceView.RemoveAt(sourceIndex);
            if (tabToMove !== null) {
                if (from == UIDockTargetPanel.CENTER) {
                    destView.AppendChild(tabToMove.content, tabToMove.tab);
                }
                else if (from == UIDockTargetPanel.TOP || from == UIDockTargetPanel.BOTTOM ||
                         from == UIDockTargetPanel.LEFT || from == UIDockTargetPanel.RIGHT) {
                    const newSplitView = self._Split(from);
                    const newTabView = new UITabView();

                    if (newSplitView.html.a.firstChild === null) {
                        newSplitView.AppendChild(newTabView, 'a');
                    }
                    else if (newSplitView.html.b.firstChild === null) {
                        newSplitView.AppendChild(newTabView, 'b');
                    }
                    else {
                        throw new Error("NEw split view is already full, one should be empty");
                    }
                    newTabView.AppendChild(tabToMove.content, tabToMove.tab);
                }
                else {
                    throw new Error("Invalid drop target");
                }

                if (sourceView.IsEmpty) {
                    sourceView.Destroy();
                }
            }
            //console.log("Index: " + sourceIndex + ", From: " + sourceView._uuid + ", To: " + destView._uuid + ", At: " + from);
        };
        root.appendChild(dockTarget.html.root);
    }

    _AddTab(name) { // https://www.w3schools.com/html/html5_draganddrop.asp
        if (!IsString(name)) {
            throw new Error("Tab name must be a string");
        }
        const self = this;

        const tabIndex = this.html.tabs.length;
        const tab = document.createElement('button');
        tab.textContent = name;
        tab.classList.add("UITab");
        tab.draggable = "true";
        tab.dragSource = this;
        tab.dragIndex = tabIndex;

        const dragStart = (ev) => {
            if (ev.dataTransfer !== null && ev.dataTransfer !== undefined) {
                //const targetId = "not-used";//ev.target.id;
                //ev.dataTransfer.setData("text", targetId);
                ev.dataTransfer.effectAllowed = "move";
            }

            setTimeout(() => { // Don't touch DOM in drag start
                UpdateCSSRules('.UIDockTarget', 'display', 'initial');
                const allHighlighted = document.querySelectorAll(".UIDockTargetHighlight"); 
                for (let i = 0, len = allHighlighted.length; i < len; ++i) {
                    allHighlighted[i].classList.remove("UIDockTargetHighlight");
                }
            }, 1);

            UITabView.dragSource = tab.dragSource;
            UITabView.dragTabIndex = tab.dragIndex;

            ev.stopPropagation();
        }

        const dragEnd = (ev) => {
            UpdateCSSRules('.UIDockTarget', 'display', 'none');
            if (ev.dataTransfer !== null && ev.dataTransfer !== undefined) {
                ev.dataTransfer.effectAllowed = "move";
            }
            UITabView.dragSource = null;
            UITabView.dragTabIndex = -1;
            ev.stopPropagation();
        }

        tab.addEventListener("dragstart", dragStart);
        tab.addEventListener("dragend", dragEnd);

        this.html.tabs.push(tab);
        this.html.tabContainer.appendChild(tab);

        //const index = this.html.tabs.length - 1;
        const onClick = (ev) => {
            const tabs = tab.dragSource.html.tabs;
            const content = tab.dragSource.html.content;
            const len = tab.dragSource.html.tabs.length;
            for (let i = 0; i < len; ++i) {
                content[i].classList.remove("TabContentEnabled");
                content[i].classList.add("TabContentDisabled");
                tabs[i].classList.remove("ActiveTab");
            }
            tabs[tab.dragIndex].classList.add("ActiveTab");
            content[tab.dragIndex].classList.add("TabContentEnabled");
            
            if (ev !== null) {
                ev.preventDefault();
            }
        }

        tab.onclick = onClick;

        return tab;
    }

    AppendChild(content, tabNamOrTabObject = null) {
        if (tabNamOrTabObject === null || tabNamOrTabObject == undefined) {
            throw new Error("Tab must have a name (or tab object)");
        }
        if (content === null || content === undefined) {
            throw new Error("Content can't be null");
        }

        const isActive = this.html.tabs.length == 0;

        let tab = null;
        if (IsString(tabNamOrTabObject)) {
            tab = this._AddTab(tabNamOrTabObject);
        }
        else if (tabNamOrTabObject.hasOwnProperty("dragIndex") && tabNamOrTabObject.hasOwnProperty("dragSource")) {
            tab = tabNamOrTabObject;
            this.html.tabs.push(tab);
            this.html.tabContainer.appendChild(tab);
        }
        else {
            throw new Error("Tab must have a name");
        }
        
        if (isActive) {
            tab.classList.add("ActiveTab");
        }

        this.html.content.push(content);
        if (content.hasOwnProperty("html") && content.html.hasOwnProperty("root")) {
            content = content.html.root;
        }
        this.html.contentContainer.appendChild(content);

        if (isActive) {
            content.classList.remove("TabContentDisabled");
            content.classList.add("TabContentEnabled");
        }
        else {
            content.classList.add("TabContentDisabled");
            content.classList.remove("TabContentEnabled");
        }

        tab.dragSource = this;
        const _tabs = this.html.tabs;
        for (let i = 0, len = _tabs.length; i < len; ++i) {
            _tabs[i].dragIndex = i;
        }
        
        return this.html.tabs.length - 1;
    }

    RemoveAt(index) {
        if (index < 0 || index >= this.html.tabs.length) {
            return null;
        }

        // Remove from tracked objects
        const tab = this.html.tabs.splice(index, 1)[0];
        const content = this.html.content.splice(index, 1)[0];

        // Remove from dom. content can be a custom class or a dom object
        if (content.hasOwnProperty("html") && content.html.hasOwnProperty("root")) {
            this.html.contentContainer.removeChild(content.html.root);
        }
        else {
            this.html.contentContainer.removeChild(content);
        }
        this.html.tabContainer.removeChild(tab);

        // Re-index tabs
        const tabs = this.html.tabs;
        for (let i = 0, len = tabs.length; i < len; ++i) {
            tabs[i].dragIndex = i;
        }

        // If the removed tab was active, activate first tab
        if (tab.classList.contains("ActiveTab")) {
            if (this.html.tabs.length > 0) {
                this.html.tabs[0].onclick(null);
            }
        }

        // Deactivate the tab being removed
        content.classList.remove("TabContentEnabled");
        content.classList.add("TabContentDisabled");
        tab.classList.remove("ActiveTab");

        return {
            tab: tab,
            content: content
        }
    }

    // from is left, right, bottom, top
    // 1) remove this tab view from the parent split view (if one exists)
    // 2) create a new split view and add it to the parent split view (if one exists)
    // 3) Add this tab view into the newly created split view
    // 4) Return the newly created split view
    // Note: The new split view does have one side empty!
    _Split(from) {
        const parentSplitView = this.parentSplitView;
        const html = this.html;

        let where = '';
        if (from == UIDockTargetPanel.TOP) {
            where = 'b';
        }
        else if (from == UIDockTargetPanel.BOTTOM) {
            where = 'a';
        }
        else if (from == UIDockTargetPanel.LEFT) {
            where = 'b';
        }
        else if (from == UIDockTargetPanel.RIGHT) {
            where = 'a';
        }
        else {
            throw new Error("From is invalid to split");
        }

        const clientSize = (from == UIDockTargetPanel.TOP || from == UIDockTargetPanel.BOTTOM)? html.contentContainer.clientHeight : html.contentContainer.clientWidth;
        let wasInSplitSlotAOrB = (where == 'a')? 'b' : 'a';;
        if (parentSplitView !== null) { 
            wasInSplitSlotAOrB = parentSplitView.RemoveChild(html.root); // Returns a char
        }

        const newSplit = new UISplitView();
        newSplit.vertical = from == UIDockTargetPanel.TOP || from == UIDockTargetPanel.BOTTOM;

        if (parentSplitView === null) { // We're root!
            const parentNode = html.root.parentNode;
            parentNode.removeChild(this.html.root);
            parentNode.appendChild(newSplit.html.root);
        }
        else {
            parentSplitView.AppendChild(newSplit, wasInSplitSlotAOrB);
        }
        newSplit.AppendChild(this, where);

        newSplit.pin = where;
        newSplit.distance = Math.max(Math.floor(clientSize * 0.5), 10);
        this.parentSplitView = newSplit;

        return newSplit;
    }

    // Destroys this tab view, if it belonged to a split view, that split is collapsed
    Destroy() {
        if (!this.IsEmpty) {
            throw new Error("Can't destroy non empty tab view");
        }

        this._uuid = "[DESTROYED] " + this._uuid;

        if (this.parentSplitView !== null) {
            const _split = this.parentSplitView;
            this.parentSplitView.RemoveChild(this); // already sets splitView to null
            _split.Collapse();
        }
        this.parentSplitView = null;

        this.html.root.remove();
        this.html.root = null;
        this.html.tabContainer= null;
        this.html.tabs= [];
        this.html.contentContainer= null;
        this.html.content= [];

    }
}