
class Node {
    _parent = null;
    _child = null;
    _sibling = null;

    _hierarchy = null;
    _isRoot = false;

    _title = "New Tree Node";
    userData = null;
    html = { // <li><span>TITLE</span><ul>...</ul></li>
        li: null,
        span: null,
        ul: null
    };

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._unlinkParent();
        // Add to tail of new parents child list
        if (value !== null && value !== undefined) {
            this._parent = value;
            
            if (value._child === null) {
                value._child = this;
            }
            else {
                let panick = 0;
                for (let iter = this._parent._child; iter !== null; iter = iter._sibling) {
                    if (iter._sibling === null) {
                        iter._sibling = this;
                        break;
                    }

                    if (++panick > 50000) {
                        console.error("Panick break");
                        break;
                    }
                }
            }
        }
        else {
            this._parent = null;
        }
    }

    get firstChild() {
        return this._child;
    }

    get nextSibling() {
        return this._sibling;
    }

    get name() {
        return this._title;
    }

    set name(value) {
        if (typeof value !== 'string' && !(value instanceof String)) {
            value = "" + value;
        }

        this.html.span.innerHTML = value;
        this._title = value;
    }

    _unlinkParent() {
        // Remove parent if it exists
        if (this._parent != null) {
            if (this._parent._child === this) {
                this._parent._child = this._sibling;
            }
            else {
                for (let iter = this._parent._child; iter !== null; iter = iter._sibling) {
                    if (iter._sibling === this) {
                        iter._sibling = this._sibling;
                        break;
                    }
                }
            }
            this._sibling = null;

            if (this._parent._child === null) {
                this._parent.html.span.classList.remove("tree-expand");
            }
        }


        this.html.li.classList.add("nested");

        this._parent = null;
    }

    makeRoot() {
        this._isRoot = true;
        this.html.ul.classList.remove("nested");
        this.html.span.classList.remove("tree-expand");
        this.html.span.classList.remove("tree-expand-down");
    }

    addChild(config, userData = null) {
        let newChild = null;

        if (config !== null && config instanceof Node) {
            if (userData !== null) {
                throw new Error("User data must be null when adding an existing child");
            }
            newChild = config;
        }
        else {
            newChild = new Node(config, this._hierarchy, userData);
        }

        newChild.parent = this;

        newChild.html.li.classList.remove("nested");
        if (!this._isRoot) {
            this.html.span.classList.add("tree-expand");
        }
        this.html.ul.appendChild(newChild.html.li);

        return newChild;
    }

    remove() {
        this._unlinkParent();
        this.html.li.classList.add("nested");
        throw new Error("REMOVED!");
    }

    constructor(titleOrConfigObjectOrUndefined, hierarchy, userData = null) {
        if (hierarchy === null || hierarchy === undefined) {
            throw new Error("hierarchy is not optional");
        }
        const GenUUIDv4 = () => {
            const guid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
                (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
            );
            return guid;
        };
        const ClearAllDragOver = () => {
            const elms = document.querySelectorAll(".tree-drag-over");
            const len = elms.length;
            for (let i = 0; i < len; ++i) {
                elms[i].classList.remove("tree-drag-over");
            }
        };

        const self = this;

        this._hierarchy = hierarchy;
        let title = "New Node";
        if (titleOrConfigObjectOrUndefined === undefined || titleOrConfigObjectOrUndefined === null) {
            // Not provided
        }
        else if (typeof titleOrConfigObjectOrUndefined === 'string' || titleOrConfigObjectOrUndefined instanceof String) {
            title = titleOrConfigObjectOrUndefined;
        }
        else if (typeof titleOrConfigObjectOrUndefined === 'object' && !Array.isArray(titleOrConfigObjectOrUndefined)) {
            if (titleOrConfigObjectOrUndefined.hasOwnProperty("name")) {
                title = "" + titleOrConfigObjectOrUndefined.name;
            }
            else if (titleOrConfigObjectOrUndefined.hasOwnProperty("title")) {
                title = "" + titleOrConfigObjectOrUndefined.title;
            }

            if (titleOrConfigObjectOrUndefined.hasOwnProperty("userData")) {
                userData =  titleOrConfigObjectOrUndefined.userData;
            }
        }
        else {
            throw new Error("Bad argument for tree node constructor");
        }
        //onsole.log("Make new node: " + title);

        const li = this.html.li = document.createElement('li');
        li.setAttribute('draggable', true);
        let guid = GenUUIDv4();
        let panick = 0;
        while (hierarchy.allNodes.has(guid)) {
            guid = GenUUIDv4();
            if (++panick >= 50000) {
                console.error("panick, break loop");
                break;
            }
        }
        li.id = guid;
        hierarchy.allNodes.set(guid, this);

        const span = this.html.span = document.createElement('span');
        span.innerHTML = this._title = title; 
        span.classList.add("tree-span");
        //span.setAttribute('class','tree-expand');
        span.addEventListener("click", () => {
            if (!this._isRoot) {
                self.html.ul.classList.toggle("tree-active");
                self.html.span.classList.toggle("tree-expand-down");
            }
        });
        li.appendChild(span);

        const ul = this.html.ul = document.createElement('ul');
        ul.classList.add("tree-ul");
        ul.classList.add("nested"); //ul.classList.add("tree-active");
        li.appendChild(ul);

       

        li.addEventListener("dragstart", (ev) => {
            const targetId = ev.target.id;
            ev.dataTransfer.setData("text", targetId);
            ev.dataTransfer.effectAllowed = "move";
            //ClearAllDragOver();
            ev.stopPropagation();
        });

        li.addEventListener("drop", (ev) => {
            if (ev.dataTransfer === null || ev.dataTransfer === undefined) {
                console.error("Drop event data was null");
            }
            else {
                const data = ev.dataTransfer.getData("text");
                //console.log("Drop event data was: " + data);
                //const draggedElementLI = document.getElementById(data);
                if (self._hierarchy.allNodes.has(data)) {
                    const childNode = self._hierarchy.allNodes.get(data);
                    const parentNode = self;
                    let abandon = false;
                    let panick = 0;
                    for (let iter = parentNode; iter !== null; iter = iter.parent) {
                        if (iter === childNode) {
                            abandon = true;
                            break;
                        }
                        if (++panick > 50000) {
                            console.error("panick break");
                            break;
                        }
                    }

                    if (!abandon) {
                        parentNode.addChild(childNode);
                    }
                    else {
                        console.log("Abandoned drop event");
                    }
                }
            }
            //self.html.span.classList.remove("tree-drag-over");
            ClearAllDragOver();
            ev.preventDefault();
            ev.stopPropagation();
        });

        li.addEventListener("dragover", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (ev.dataTransfer != null) {
                ev.dataTransfer.effectAllowed = "move";
            }
            self.html.span.classList.add("tree-drag-over");
        });

        li.addEventListener("dragleave", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (ev.dataTransfer != null) {
                ev.dataTransfer.effectAllowed = "move";
            }
            self.html.span.classList.remove("tree-drag-over");
        });
    }
}

class Hierarchy {
    _root = null;
    _allNodes = null;

    html = {
        ul: null
    };

    get root() {
        return this._root;
    }

    get allNodes() {
        return this._allNodes;
    }

    constructor(divName) {
        const list = this.html.ul = document.getElementById("assetfiles");
        this._allNodes = new Map();
        this._root = new Node("Root", this, this);
        this._root.makeRoot();
        this.html.ul.appendChild(this._root.html.li);
    }
}

window.addEventListener("load", (event) => {
    const GenUUIDv4NoDash = () => {
        const guid = "10000000 1000 4000 8000 100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
        return guid;
    };

    const fileList = new Hierarchy("assetfiles");
    const root = fileList.root;

    /*const rootInnerHTML =
        "<div class=\"tree-spacer\"></div>" +
        "<button id=\"add-folder\" class=\"tree-button\"><i class=\"ph ph-folder-simple-plus\"></i></button>" +
        "<button id=\"add-file\" class=\"tree-button\"><i class=\"ph ph-file-plus\"></i></button>" +
        "<button id=\"upload-file\" class=\"tree-button\"><i class=\"ph ph-upload-simple\"></i></button>"
    root.html.span.innerHTML = "<span>Files</span>" + rootInnerHTML;
    
    const addFolder = document.getElementById("add-folder");
    const addFile = document.getElementById("add-file");
    const uploadFile = document.getElementById("upload-file");*/
    root.html.span.innerHTML = "";

    const _span = document.createElement('span');
    _span.innerHTML = "Files";
    root.html.span.appendChild(_span);

    const _div = document.createElement('div');
    _div.classList.add("tree-spacer");
    root.html.span.appendChild(_div);

    const addFolder = document.createElement('button');
    addFolder.classList.add("tree-button");
    addFolder.innerHTML = "<i class=\"ph ph-folder-simple-plus\"></i>";
    root.html.span.appendChild(addFolder);

    const addFile = document.createElement('button');
    addFile.classList.add("tree-button");
    addFile.innerHTML = "<i class=\"ph ph-file-plus\"></i>";
    root.html.span.appendChild(addFile);

    const uploadFile = document.createElement('button');
    uploadFile.classList.add("tree-button");
    uploadFile.innerHTML = "<i class=\"ph ph-upload-simple\"></i>";
    root.html.span.appendChild(uploadFile);

    addFolder.addEventListener("click", (ev) => {
        let name = "New Folder " + GenUUIDv4NoDash()

        /*fs.mkdir("/" + name, (err) => {
            if (err) {
                console.error("Unable to create directory: /" + name);
            }
            else {
                // And the directory?
                const folder = root.addChild(name, null);
                folder.html.span.innerHTML = "<span style=\"overflow:hidden;height:100%;\">" + name + "</span>";// + rootInnerHTML;
            }
        });*/

        fs.mkdir(name, (err) => {
            if (err) throw err;
            
            const folder = root.addChild(name, null);
            folder.html.span.innerHTML = "<span style=\"overflow:hidden;height:100%;\">" + name + "</span>";// + rootInnerHTML;
        });

        ev.preventDefault();
    });

    // Stat the file system

    /*root.name = "Files";
    const imagesNode = root.addChild("Images");
    imagesNode.addChild("euation.png");
    imagesNode.addChild("proof.png");
    imagesNode.addChild("content.png");

    root.addChild("Videos");
    root.addChild("Files");
    root.addChild("Fruits");
    root.addChild("Vegetables");*/

    //document.getElementById("debug-add-root-remove-me");

    //InitArrows();
    //InitDragAndDrop();
});

