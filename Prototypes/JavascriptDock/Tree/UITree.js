
if (document.GenUUID === undefined) {
    document.GenUUID = () => {
        const guid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
        return guid;
    };
}

class UITreeNode {
    static IndentSizeInPixels = 20;

    onTextEdited = null; // function(self : UITreeNode, oldText: string, newText : string);
    onDestroy = null; // function(self : UITreeNode)
    onParentChanged = null; // function(self : UITreeNode)

    _uiTree = null;
    get tree() { return this._uiTree; }
    
    _uuid = null;
    get uuid() { return this._uuid; }

    _userData = null;
    get userData() { return this._userData; }

    _parent = null;
    get parent() { return this._parent; }

    _child = null;
    get firstChild() { return this._child; }

    _sibling = null;
    get nextSibling() { return this._sibling; }

    _canBeCollapsed = null; // true (for folder), false (for files), or null (for default behavior)
    get canBeCollapsed() {
        return this._canBeCollapsed;
    }

    set canBeCollapsed(v) {
        if (v === true) {
            this._canBeCollapsed = true;
        }
        else if (v === null) {
            this._canBeCollapsed = null;
        }
        else {
            this._canBeCollapsed = false;
        }
    }

    _text = "";
    get text() {
        return this._text;
    }

    set text(value) {
        if (this._html.editor === null) {
            this._text = String(value);
            if (this._html.content !== null) {
                this._html.content.innerHTML = this._text;
            }
        }
    }

    _forceOpen = false;
    _isOpen = false;
    get isOpen() { 
        if (this._forceOpen) {
            return true;
        }
        return this._isOpen; 
    }
    set isOpen(value) {
        if (value) {
            this._isOpen = true;
            this._ShowDownArrow();
        }
        else { // false on falsy
            this._isOpen = false;
            this._ShowRightArrow();
        }
    }

    get isVisible() {
        for (let iter = this._parent; iter != null; iter = iter._parent) {
            if (!iter.isOpen) {
                return false;
            }
        }
        return true;
    }

    _html = {
        root: null,
        spacer: null,
        content: null,
        expander: null,
        controlls: null,
        edit: null,
        delete: null,
        editor: null,
        icon: null
    };

    MakeFile() {
        this.canBeCollapsed = false;
        this.ShowIcon(UITree.FileIconHtml);
    }

    MakeFolder() {
        this.canBeCollapsed = true;
        this.ShowIcon(UITree.FolderIconHtml);
    }

    ShowIcon(innerHtml) {
        if (this._html.icon === null) {
            return;
        }

        if (innerHtml === null || innerHtml === undefined || innerHtml.length === 0) {
            this._html.icon.innerHTML = "";
            this._html.icon.classList.add("UITreeNode-Hide");

        }
        else {
            this._html.icon.classList.remove("UITreeNode-Hide");
            this._html.icon.innerHTML = String(innerHtml);
        }
    }

    _NullOutHtml() {
        this._html.root = null;
        this._html.spacer = null;
        this._html.content = null;
        this._html.expander = null;
        this._html.controlls = null;
        this._html.edit = null;
        this._html.delete = null;
        this._html.editor = null;
        this._html.icon = null;
    }

    _GetRootElement(e) {
        // Make sure something is passed in
        if (e === null || e === undefined) {
            return null;
        }

        // and that it has a class list
        if (e.classList === undefined) {
            return null;
        }


        { // Validate that one of the UITreeNode styles is present
            let isValid = false;
            const styles = UITree._GetTreeNodeStyles();
            const classList = e.classList;

            for (let i = 0, len = styles.length; i < len; ++i) {
                if (classList.contains(styles[i])) {
                    isValid = true;
                }
            }

            if (e.namespaceURI == 'http://www.w3.org/2000/svg') {
                    isValid = true;
            }

            if (!isValid) {
                return null;
            }
        }

        while(!e.classList.contains("UITreeNode")) {
            e = e.parentElement;
            if (e === null) {
                return null;
            }
        }

        return e;
    }

    constructor(owner, userdata = null) {
        this._uuid = document.GenUUID();

        if (owner instanceof UITree) {
            this._uiTree = owner;
        }
        else {
            throw new Error("UITreeNode::constructor: Invalid first argument")
        }
        

        this._userData = userdata;
        this._CreateHTMLElements()
        owner.div.appendChild(this._html.root);
        this.text = this._uuid;

        this._AddContentControls();
        this._AddDragDropSupport();

        this.isOpen = false; // setter also updates icon!
        if (owner.onNodeCreated != null) {
            owner.onNodeCreated(this);
        }
        owner.all.set(this._uuid, this);

        this._uiTree._UpdateNodesVisually();
    }

    GetChildByText(text) {
        for (let iter = this._child; iter != null; iter = iter._sibling) {
            if (iter.text === text) {
                return iter;
            }
        }
        return null;
    }

    IsDescendantOf(otherNode) {
        if (otherNode === null || otherNode === undefined || otherNode == this) {
            return false;
        }

        for (let iter = this; iter != null; iter = iter.parent) {
            if (iter === otherNode) {
                return true;
            }
        }

        return false;
    }

    ForEachDepthFirst(callback) {
        const root = this;

        let itr = root;
        let traversing = true;

        while (traversing) {
            callback(itr);
     
            if (itr._child) {
                itr = itr._child;
            }
            else {
                while (itr._sibling === null) {
                    if (itr === root) {
                        traversing = false;
                        break;
                    }
                    itr = itr._parent;
                }
                if (itr === root) { // Prevent stepping to the roots sibling
                    traversing = false;
                    break;
                }
                itr = itr._sibling;
            }
        }
    }

    CreateChild(userdata) {
        const childNode = new UITreeNode(this._uiTree, userdata);
        this.AddChild(childNode);
        return childNode;
    }

    AddChild(child) {
        if (child._parent === this) {
            return; // Early out
        }
        if (child._parent !== null) {
            if (!child._parent._RemoveChild(child)) {
                throw new Error("UITreeNode::AddChild: Failed to remove child from old parent");
            }
        }

        if (child._sibling !== null) {
            throw new Error("UITreeNode::AddChild: Expected child.nextSibling to be null");
        }

        if (this._child === null) {
            this._child = child;
        }
        else {
            for (let iter = this._child; iter !== null; iter = iter._sibling) {
                if (iter._sibling === null) {
                    iter._sibling = child;
                    break;
                }
            }
        }
        child._sibling = null;
        child._parent = this;

        if (this.onParentChanged !== null) {
            this.onParentChanged(this);
        }
        if (this._uiTree.onNodeParentChanged !== null) {
            this._uiTree.onNodeParentChanged(this);
        }

        this.isOpen = true;
        this._uiTree._UpdateNodesVisually();
    }

    _RemoveChild(child) {
        let result = false;

        let last = null;
        for (let iter = this._child; iter !== null; iter = iter._sibling) {
            if (iter === child) {
                if (last === null) { // Removing head
                    this._child = child._sibling;
                }
                else {
                    last._sibling = child._sibling;
                }

                child._sibling = null;
                child._parent = null;

                result = true;
                break;
            }

            last = iter;
        }

        //child._UpdateIndentationStyle();
        //this._UpdateIndentationStyle();
        return result;
    }

    Destroy() {
        if (this._parent !== null) {
            this._parent._RemoveChild(this);
        }

        if (this._sibling !== null) {
            throw new Error("Can't destroy a node with active siblings");
        }

       const cleanup = [];
       this.ForEachDepthFirst((node) => {
        cleanup.push(node);
       });
       for (let i = 0, len = cleanup.length; i < len; ++i) {
        cleanup[i]._DestroyInstance();
       }
    }

    _DestroyInstance() {
        if (this.onDestroy !== null) {
            this.onDestroy(this);
        }
        if (this._uiTree.onNodeDestroyed !== null) {
            this._uiTree.onNodeDestroyed(this);
        }
        this._uiTree.all.delete(this._uuid);
        if (this._uiTree.selected === this) {
            this._uiTree.selected = null;
        }
        if (this._html.root !== null) {
            this._html.root.remove();
        }
        this._NullOutHtml();
    }

    _ShowDownArrow() {
        // https://iconmonstr.com/caret-down-filled-svg/
        if (this._html.expander != null) {
            this._html.expander.innerHTML = `<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m16.843 10.211c.108-.141.157-.3.157-.456 0-.389-.306-.755-.749-.755h-8.501c-.445 0-.75.367-.75.755 0 .157.05.316.159.457 1.203 1.554 3.252 4.199 4.258 5.498.142.184.36.29.592.29.23 0 .449-.107.591-.291 1.002-1.299 3.044-3.945 4.243-5.498z"/></svg>`;
        }
    }

    _ShowRightArrow() {
        if (this._html.expander != null) {
            // https://iconmonstr.com/caret-right-lined-svg/
            this._html.expander.innerHTML = `<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m10.211 7.155c-.141-.108-.3-.157-.456-.157-.389 0-.755.306-.755.749v8.501c0 .445.367.75.755.75.157 0 .316-.05.457-.159 1.554-1.203 4.199-3.252 5.498-4.258.184-.142.29-.36.29-.592 0-.23-.107-.449-.291-.591zm.289 7.563v-5.446l3.522 2.719z" fill-rule="nonzero"/></svg>`;
        }
    }

    _ShowEditIcon() {
        if (this._html.edit !== null) {
            //https://iconmonstr.com/pencil-square-filled-svg/
            this._html.edit.innerHTML = `<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.25 6c.398 0 .75.352.75.75 0 .414-.336.75-.75.75-1.505 0-7.75 0-7.75 0v12h17v-8.75c0-.414.336-.75.75-.75s.75.336.75.75v9.25c0 .621-.522 1-1 1h-18c-.48 0-1-.379-1-1v-13c0-.481.38-1 1-1zm-2.011 6.526c-1.045 3.003-1.238 3.45-1.238 3.84 0 .441.385.626.627.626.272 0 1.108-.301 3.829-1.249zm.888-.889 3.22 3.22 8.408-8.4c.163-.163.245-.377.245-.592 0-.213-.082-.427-.245-.591-.58-.578-1.458-1.457-2.039-2.036-.163-.163-.377-.245-.591-.245-.213 0-.428.082-.592.245z" fill-rule="nonzero"/></svg>`;
        }
    }

    _ShowCommitIcon() {
        if (this._html.edit !== null) {
            this._html.edit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>`;
        }
    }

    _CommitEditIfAvailable() {
        if (this._html.editor !== null) {
            const dispalyString = String(this._html.editor.value);

            this._html.controlls.style.display = "";
            this._ShowEditIcon();

            this._html.editor.remove();
            this._html.editor = null;

            const oldText = this._text;
            this._html.content.innerHTML = this._text = dispalyString;

            if (this._html.content != null) {
                this._html.content.style.display = "";
            }

            if (this.onTextEdited !== null) {
                this.onTextEdited(this, oldText, dispalyString);
            }
            if (this._uiTree.onNodeTextEdited !== null) {
                this._uiTree.onNodeTextEdited(this, oldText, dispalyString);
            }
        }
    }

    _CreateHTMLElements() {
        this._html.root = document.createElement("div");
        this._html.root.classList.add("UITreeNode");
        this._html.root.id = this._uuid;
        this._html.root.onclick = () => {
            this._uiTree.selected = this;
        };

        this._html.spacer = document.createElement("div");
        this._html.spacer.classList.add("UITreeNode-Spacer");
        this._html.root.appendChild(this._html.spacer);

        this._html.expander = document.createElement("button");
        this._html.expander.classList.add("UITreeNode-Expander");
        this._html.root.appendChild(this._html.expander);

        this._html.icon = document.createElement("div");
        this._html.icon.classList.add("UITreeNode-Icon");
        //this._html.icon.classList.add("UITreeNode-Hide");
        this._html.root.appendChild(this._html.icon);

        this._html.expander.onclick = (e) => {
            this.isOpen = !this.isOpen; 
            this._uiTree._UpdateNodesVisually();
        };

        this._html.content = document.createElement("div");
        this._html.content.classList.add("UITreeNode-Content");
        this._html.root.appendChild(this._html.content);
    }

    _AddContentControls() {
        this._html.controlls = document.createElement("div");
        this._html.controlls.classList.add("UITreeNode-Controls");
        this._html.root.appendChild(this._html.controlls);

        this._html.edit = document.createElement("button");
        this._html.edit.classList.add("UITreeNode-Control");
        this._ShowEditIcon();
        this._html.controlls.appendChild(this._html.edit);

        this._html.delete = document.createElement("button");
        this._html.delete.classList.add("UITreeNode-Control");
        // https://iconmonstr.com/trash-can-filled-svg/
        this._html.delete.innerHTML = `<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m20.015 6.506h-16v14.423c0 .591.448 1.071 1 1.071h14c.552 0 1-.48 1-1.071 0-3.905 0-14.423 0-14.423zm-5.75 2.494c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-4.5 0c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-.75-5v-1c0-.535.474-1 1-1h4c.526 0 1 .465 1 1v1h5.254c.412 0 .746.335.746.747s-.334.747-.746.747h-16.507c-.413 0-.747-.335-.747-.747s.334-.747.747-.747zm4.5 0v-.5h-3v.5z" fill-rule="nonzero"/></svg>`;
        this._html.controlls.appendChild(this._html.delete);

        this._html.delete.onclick = () => {
            setTimeout(() => {
                this._CommitEditIfAvailable();
                this.Destroy();
            }, 1);
        };

        this._html.edit.onclick = () => {
            setTimeout(() => {
                const commit = () => {
                    this._CommitEditIfAvailable();
                }

                if (this._html.controlls.style.display != "flex") {
                    const dispalyString = this.text;

                    this._html.controlls.style.display = "flex"
                    this._ShowCommitIcon();

                    //this._html.content.innerHTML = this._text = "";
                    if (this._html.content != null) {
                        this._html.content.style.display = "none";
                    }
    
                    this._html.editor = document.createElement("input");
                    this._html.editor.type = "text";
                    this._html.editor.classList.add("UITreeNode-Content");
                    this._html.editor.classList.add("UITreeNode-Editor");
                    this._html.editor.value = dispalyString;
                    //this._html.root.appendChild(this._html.editor);
                    this._html.root.insertBefore(this._html.editor, this._html.content);

                    this._html.editor.onkeydown = (e) => {
                        if (e.key === "Enter" || e.key == "Tab") {
                            commit();
                        }
                    };
                }
                else {
                    commit();
                }
            }, 1);
        }
    }

    _AddDragDropSupport() {
        const isString = value => typeof value === 'string' || value instanceof String;
        const getTargetNodeFromDragEvent = (ev) =>{
            const targetElement = this._GetRootElement(ev.target);
            if (targetElement !== null) {
                const targetNode = this._uiTree.all.get(targetElement.id);
                if (targetNode !== null && targetNode !== undefined) {
                    return targetNode;
                }
            }
            return null;
        }
        const validateDragDrop = (srcNode, dstNode) => {
            if (srcNode == dstNode) {
                return false;
            }

            if (srcNode._uiTree !== dstNode._uiTree) {
                console.log("Dragging between disimilar trees");
                return false;
            }

            if (srcNode.parent == dstNode) {
                return false;
            }

            if (dstNode.canBeCollapsed === false) { // null and true are ok
                return false;
            }

            if (dstNode.IsDescendantOf(srcNode)) {
                return false;
            }

            return true;
        };

        this._html.root.draggable = true;

        this._html.root.addEventListener("dragstart", (ev) => {
            const srcNode = getTargetNodeFromDragEvent(ev);
            if (srcNode !== null) {
                const dragData = srcNode.uuid;
                ev.dataTransfer.clearData();
                ev.dataTransfer.setData("uitreenode", dragData);
                this._uiTree.selected = this;

                srcNode._html.root.classList.add("UITreeNode-Dragging");
            }
        });

        this._html.root.addEventListener("dragend", (ev) => {
            const srcNode = getTargetNodeFromDragEvent(ev);
            if (srcNode !== null) {
                srcNode._html.root.classList.remove("UITreeNode-Dragging");
            }
        });

        this._html.root.addEventListener("dragover", (ev) => {
            const types = ev.dataTransfer.types;
            if (!types.includes("uitreenode")) {
                return; // Only allow the drag over here
            }

            ev.preventDefault();

            const dstNode = getTargetNodeFromDragEvent(ev);
        });

        this._html.root.addEventListener("drop", (ev) => {
            const data = ev.dataTransfer.getData("uitreenode");
            let dropped = false;
            if (isString(data) && data.length > 0) {
                if (this._uiTree.all.has(data)) {
                    const srcNode = this._uiTree.all.get(data);
                    const dstNode = getTargetNodeFromDragEvent(ev);

                    let valid = true;
                    if (srcNode !== null && srcNode !== undefined) {
                        srcNode._html.root.classList.remove("UITreeNode-Dragging");

                        if (dstNode !== null && dstNode !== undefined) {
                            if (validateDragDrop(srcNode, dstNode)) {
                                srcNode._CommitEditIfAvailable();
                                dstNode._CommitEditIfAvailable();
                                dstNode.AddChild(srcNode); // Triggers OnParentChanged

                                //console.log("drop(uitreenode) - from: " + srcNode.uuid + ", to: " + dstNode.uuid);
                                dropped = true;
                            }
                        }
                    }
                }
            }

            /*if (!dropped) {
                console.log("drop(uitreenode): invalid drop")
            }*/

            if (this._html.root !== null) {
                this._html.root.classList.remove("UITreeNode-Highlighted");
            }

            ev.preventDefault();
        });

        this._html.root.addEventListener("dragenter", (ev) => {
            const data = ev.dataTransfer.getData("uitreenode");
            if (this._html.root !== null) {
                if (this.canBeCollapsed !== false) {
                    this._html.root.classList.add("UITreeNode-Highlighted");
                }
            }
        });
        this._html.root.addEventListener("dragleave", (ev) => {
            if (this._html.root !== null) {
                this._html.root.classList.remove("UITreeNode-Highlighted");
            }
        });
    }
}

class UITree {
    onNodeCreated = null; // fubction(newNode : UITreeNode)
    onNodeDestroyed = null; // function(node : UITreeNode)
    onNodeTextEdited = null; // function(node : UITreeNode, oldText : string, newText : string)
    onNodeParentChanged = null; // function(node : UITreeNode)
    onSelectionChanged = null; // function(node : UITreeNode)

    _uuid = null;
    get uuid() { return this._uuid; }

    _div = null;
    get div() { return this._div; }

    _all = null;
    get all() { return this._all; }

    _root = null;
    get root() { return this._root; }

    _selected = null;
    get selected() {
        return this._selected;
    }
    set selected(node) {
        const prev = this._selected;
        if (prev !== node) {
            if (prev !== null) {
                if (prev._html.root != null) {
                    prev._html.root.classList.remove("UITreeNode-Selected");
                }
                prev._CommitEditIfAvailable();
            }

            if (node !== null) {
                if (node._html.root != null) {
                    node._html.root.classList.add("UITreeNode-Selected");
                }
            }

            if (this.onSelectionChanged !== null) {
                this.onSelectionChanged(node);
            }
        }
        this._selected = node;
    }

    // arg1: name of a div on the page to use, or null
    constructor(divName = null) {
        UITree._CreateStyles();
        this._uuid = document.GenUUID();

        if (typeof divName === "string") {
            this._div = document.getElementById(divName);
        }
        else if (divName === null) {
            this._div = document.createElement("div");
        }
        else {
            throw new Error("UITree::constructor Invalid first argument");
        }

        this._all = new Map();

        this._div.classList.className = "";
        this._div.classList.add("UITree");
        this._div.id = this._uuid;

        this._root = new UITreeNode(this, null);
        this._root._html.root.remove();
        this._root._NullOutHtml();
        this._root._forceOpen = true;
    }

    GetNodeByPath(path) {
        if (!path.startsWith("/")) {
            throw new Error("Invlid path");
        }
        const split = path.split("/");
        
        let iter = this.root;
        for (let i = 1, size = split.length; i < size; ++i) {
            if (split[i].length === 0) {
                continue;
            }
            iter = iter.GetChildByText(split[i]);
            if (iter === null) {
                return null;
            }
        }

        return iter;
    }

    CreateNodeByPath(path) {
        if (!path.startsWith("/")) {
            throw new Error("Invlid path");
        }
        const split = path.split("/");
        const result = []; // Returns an array of new nodes
        
        let iter = this.root;
        for (let i = 1, size = split.length; i < size; ++i) {
            if (split[i].length === 0) {
                continue;
            }
            const next = iter.GetChildByText(split[i]);
            if (next === null) {
                iter = iter.CreateChild(null);
                result.push(iter);
            }
            else {
                iter = next;
            }
        }

        iter.text = split[split.length - 1];

        return result;
    }

    CreateNode(userdata) {
        return this._root.CreateChild(userdata);
    }

    _UpdateNodesVisually() {
        if (this._root === null) {
            return;
        }

        let index = 0;
        this._root.ForEachDepthFirst((node) => {
            // Sort 
            if (node._html.root !== null) {
                node._html.root.style.order = index++;
            }

            // Update visibility
            if (!node.isVisible) {
                if (node._html.root !== null) {
                    node._html.root.style.display = "none";
                }
            }
            else {
                if (node._html.root !== null) {
                    node._html.root.style.display = "flex";
                }
            } 

            // Update indentation
            let indent = 0;
            for (let iter = node.parent; iter != null; iter = iter.parent) {
                indent += 1;
            }
            if (node._html.spacer != null) {
                node._html.spacer.style.width = Math.floor(indent * UITreeNode.IndentSizeInPixels) + "px";
            }

            // Show / hide arrow
            if (node._html.expander != null) {
                if (node.canBeCollapsed === true) {
                    node._html.expander.style.display = "inline-block";
                }
                else if (node.canBeCollapsed === false) {
                    node._html.expander.style.display = "none";
                }
                // canBeCollapsed is null if we're here
                else if (node._child === null) {
                    node._html.expander.style.display = "none";
                }
                else {
                    node._html.expander.style.display = "inline-block";
                }
            }
         });
    }

    static _stylesCreated = false;
    static _CreateStyles() {
        if (UITree._stylesCreated) {
            return;
        }

        {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `
                .UITree { 
                    display: flex;
                    flex-direction: column;
                    flex-wrap: wrap;
                }
                    
                .UITreeNode {
                    display: flex;
                    flex-direction: row;
                    height: 24px;
                }
                    
                .UITreeNode-Spacer {
                    flex-grow: 0;
                    flex-shrink: 0;
                    height: 24px;
                }
                
                .UITreeNode-Content {
                    flex-grow: 1;
                    overflow: hidden;
                    cursor: default;

                    -webkit-user-select: none; /* Safari */        
                    -moz-user-select: none; /* Firefox */
                    -ms-user-select: none; /* IE10+/Edge */
                    user-select: none; /* Standard */

                }
                    
                .UITreeNode-Expander {
                    flex-grow: 0;
                    flex-shrink: 0;
                    width:  24px;
                    height: 24px;
                    padding: 0;
                    margin: 0;
                    border: 0;
                    align-self: center;
                }
                    
                .UITreeNode-Controls {
                    /*display:flex;*/
                    display:none;
                    flex-grow: 0;
                    flex-shrink: 0;
                }

                .UITreeNode:hover .UITreeNode-Controls {
                    display:flex;
                }
                    
                .UITreeNode-Control {
                    flex-grow: 0;
                    flex-shrink: 0;
                    width:  24px;
                    height: 24px;
                    padding: 0;
                    margin: 0;
                    border: 0;
                    align-self: center;
                    margin-left: 5px;
                }
                    
                .UITreeNode-Editor {
                    width: 100%;
                    margin-left: 5px;
                    align-self: center;
                    height: 24px;
                }

                .UITreeNode-Icon {
                    flex-grow: 0;
                    flex-shrink: 0;

                    height: 24px;
                    layout: flow;
                }

                .UITreeNode-Hide {
                    display: none;
                }

                .UITreeNode-Selected {
                    background-color: #ff0000;
                }

                .UITreeNode-Highlighted {
                    background-color: #00ff00;
                }

                .UITreeNode-Dragging {
                    background-color: #0000ff;
                }`;
            document.head.appendChild(style);
        }

        UITree._stylesCreated = true;
    }
    static _GetTreeNodeStyles() {
        return [
            "UITreeNode-Editor",                 
            "UITreeNode-Controls", 
            "UITreeNode-Control", 
            "UITreeNode-Expander", 
            "UITreeNode-Content", 
            "UITreeNode-Spacer", 
            "UITreeNode",
            "UITreeNode-Icon"
        ];
    }

    static get FileIconHtml() {
        return `<svg  width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path fill="#ffffff" d="M22 24h-20v-24h14l6 6v18zm-7-23h-12v22h18v-16h-6v-6zm3 15v1h-12v-1h12zm0-3v1h-12v-1h12zm0-3v1h-12v-1h12zm-2-4h4.586l-4.586-4.586v4.586z"/></svg>`;
    }

    static get FolderIconHtml() {
        return `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path fill="#ffffff" d="M0 2h8l3 3h10v4h3l-4 13h-20v-20zm22.646 8h-17.907l-3.385 11h17.907l3.385-11zm-2.646-1v-3h-9.414l-3-3h-6.586v15.75l3-9.75h16z"/></svg>`;
    }
}