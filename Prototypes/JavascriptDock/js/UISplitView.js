
/* const V4UUID = () => {
    const guid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
    return guid;
}; */

class UISplitView {
    _uuid = "";
    _mouseDown = false;

    // Boolean. Pinned size stays the same when a browser is resized
    _pinA = true;
    get pinA() { return this._pinA; }
    set pinA(v) { this._pinA = v; this._AdjustResize(); }
    get pinB() { return !this._pinA; }
    set pinB(v) { this._pinA = !v; this._AdjustResize(); }
    get pin() { if (this._pinA) { return 'A'; } return 'B'; }
    set pin(v) { 
        if (v === 'A' || v === 'a') { this._pinA = true; }
        else if (v === 'B' || v === 'b') { this._pinA = false; }
        else { throw new Error("UISplitView pin must be A or B") }
        this._AdjustResize();
    }

    // Horizontal: splits left right
    // Vertical: splits up down
    _vertical = false;
    get vertical() { return this._vertical; }
    set vertical(v) { this._vertical = v; this._AdjustOrientation(); }
    get horizontal() { return !this._vertical; }
    set horizontal(v) { this._vertical = !v; this._AdjustOrientation(); }

    html = {
        root: null,
        a: null,
        splitter: null,
        b: null
    };

    parentSplitView = null;
    childViewA = null;
    childViewB = null;
    
    get IsEmpty() {
        return this.html.a.firstChild === null && this.html.b.firstChild === null;
    }
    
    get distance() { // in pixels, size of the side that is pinned
        if (this._pinA) {
            if (this.horizontal) {
                return this.html.a.clientWidth;
            }
            else {
                return this.html.a.clientHeight;
            }
        }
        if (this.horizontal) {
            return this.html.b.clientWidth;
        }
        return this.html.b.clientHeight;
    }

    get size() { // in pixels, the size of both scrollable areas but not the 
        if (this.horizontal) {
            //return this.html.a.clientWidth + this.html.b.clientWidth;
            return this.html.root.clientWidth - this.html.splitter.clientWidth;
        }
        //return this.html.a.clientHeight + this.html.b.clientHeight;
        return this.html.root.clientHeight - this.html.splitter.clientHeight;
    }

    get normalized() { // normalize slider size
        const whole = this.size;
        if (whole < 0.00001) {
            return 0; // Avoid divide by 0
        }
        return this.distance / whole;
    }

    set distance(v) {
        v = ClampNumber(AsNumber(v), 0, this.size); 

        let a = v;
        let b = this.size - v;

        if (!this._mouseDown && !this._pinA) {
            b = v;
            a = this.size - v;
        }

        this.html.a.style.flexBasis = a + "px";
        this.html.b.style.flexBasis = b + "px";
    }

    constructor() {
        const root = this.html.root = document.createElement('div');
        const a = this.html.a = document.createElement('div');
        const splitter = this.html.splitter = document.createElement('div');
        const b = this.html.b = document.createElement('div');
        const uuid = this._uuid = V4UUID();

        root.id = uuid;
        root.classList.add("UISplitView");
        root.classList.add("UIDockable");
        root.classList.add("UISplitViewColumns");
        a.classList.add("UISplitViewGrow");
        a.classList.add("UISplitViewHorizontal");
        splitter.classList.add("UISplitViewSplitter")
        splitter.classList.add("UISplitViewSplitterColumn")
        b.classList.add("UISplitViewShrink");
        b.classList.add("UISplitViewHorizontal");

        //const dockTarget = new UIDockTarget();
        //root.appendChild(dockTarget.html.root);

        root.appendChild(a);
        root.appendChild(splitter);
        root.appendChild(b);

        const self = this;
        let mouseUp = null;
        const mouseMove = (event) => {
            if (self._mouseDown) {
                const rect = self.html.root.getBoundingClientRect();
                const x = event.clientX - rect.left; //x position within the element.
                const y = event.clientY - rect.top;  //y position within the element.

                let finalSize = 0;
                if (self._vertical) {
                    finalSize = y - Math.floor(this.html.splitter.clientHeight * 0.5);
                }
                else {
                    finalSize = x - Math.floor(this.html.splitter.clientWidth * 0.5);
                }
                finalSize = ClampNumber(finalSize, 0, self.size);
                self.distance = finalSize;
            } else {
                mouseUp(null);
            }

            if (event != null) {
                event.preventDefault();
            }
        }
        mouseUp = (event) => {
            self._mouseDown = false;
            document.body.removeEventListener('mouseup', mouseUp);
            document.body.removeEventListener('mousemove', mouseMove);

            self.html.a.style.cursor = "default";
            self.html.b.style.cursor = "default";

            if (event != null) {
                event.preventDefault();
            }
        }
        const mouseDown= (event) => {
            self._mouseDown = true;
            document.body.addEventListener('mousemove', mouseMove);
            document.body.addEventListener('mouseup', mouseUp);

            if (self._vertical) {
                self.html.a.style.cursor = "row-resize";
                self.html.b.style.cursor = "row-resize";
            }
            else {
                self.html.a.style.cursor = "col-resize";
                self.html.b.style.cursor = "col-resize";
            }
        }
        this.html.splitter.addEventListener('mousedown', mouseDown);
    }

    AppendChildA(component) {
        this.AppendChild(component, 'A');
    }

    AppendChildB(component) {
        this.AppendChild(component, 'B');
    }

    AppendChild(component, target = 'a') {
        if (component instanceof UITabView || component instanceof UISplitView) {
            component.parentSplitView = this;
        }
        if (target === 'a' || target === 'A') {
            this.childViewA = component;
            if (component.hasOwnProperty("html") && component.html.hasOwnProperty("root")) {
                this.html.a.appendChild(component.html.root);
            }
            else {
                this.html.a.appendChild(component);
            }
        }
        else if (target === 'b' || target === 'B') {
            this.childViewB = component;
            if (component.hasOwnProperty("html") && component.html.hasOwnProperty("root")) {
                this.html.b.appendChild(component.html.root);
            }
            else {
                this.html.b.appendChild(component);
            }
        }
        else {
            throw new Error("UISplitView, appendChild needs a target");
        }
    }

    RemoveChild(targetOrDomNode = 'a') {
        if (targetOrDomNode === 'a' || targetOrDomNode === 'A') {
            if (this.childViewA instanceof UISplitView || this.childViewA instanceof UITabView) {
                this.childViewA.parentSplitView = null;
            }
            this.childViewA = null;
            if (this.html.a.firstChild) {
                this.html.a.removeChild(this.html.a.firstChild);
            }
            return 'a';
        }
        else if (targetOrDomNode == 'b' || targetOrDomNode === 'B') {
            if (this.childViewB instanceof UISplitView || this.childViewB instanceof UITabView) {
                this.childViewB.parentSplitView = null;
            }
            this.childViewB = null;
            if (this.html.b.firstChild) {
                this.html.b.removeChild(this.html.b.firstChild);
            }
            return 'b';
        }
        else {
            if (targetOrDomNode.hasOwnProperty("html") && targetOrDomNode.html.hasOwnProperty("root")) {
                targetOrDomNode = targetOrDomNode.html.root;
            }
            
            if (this.html.a.firstChild === targetOrDomNode) {
                if (this.childViewA instanceof UISplitView || this.childViewA instanceof UITabView) {
                    this.childViewA.parentSplitView = null;
                }
                this.childViewA = null;
                this.html.a.removeChild(targetOrDomNode);
                return 'a';
            }
            else if (this.html.b.firstChild === targetOrDomNode) {
                if (this.childViewB instanceof UISplitView || this.childViewB instanceof UITabView) {
                    this.childViewB.parentSplitView = null;
                }
                this.childViewB = null;
                this.html.b.removeChild(targetOrDomNode);
                return 'b';
            }
            else {
                throw new Error("Remove Child has an invalid target");
            }
        }

        //throw new Error("Remove Child has an invalid target");
    }

    _AdjustOrientation() {
        if (this._vertical) {
            this.html.root.classList.remove("UISplitViewColumns");
            this.html.root.classList.add("UISplitViewRows");

            this.html.a.classList.remove("UISplitViewHorizontal");
            this.html.a.classList.add("UISplitViewVertical");

            this.html.b.classList.remove("UISplitViewHorizontal");
            this.html.b.classList.add("UISplitViewVertical");

            this.html.splitter.classList.remove("UISplitViewSplitterColumn")
            this.html.splitter.classList.add("UISplitViewSplitterRow")
        }
        else {
            this.html.root.classList.remove("UISplitViewRows");
            this.html.root.classList.add("UISplitViewColumns");
            
            this.html.a.classList.remove("UISplitViewVertical");
            this.html.a.classList.add("UISplitViewHorizontal");

            this.html.b.classList.remove("UISplitViewVertical");
            this.html.b.classList.add("UISplitViewHorizontal");

            this.html.splitter.classList.remove("UISplitViewSplitterRow")
            this.html.splitter.classList.add("UISplitViewSplitterColumn")
        }
    }

    _AdjustResize() {
        if (this._pinA) {
            this.html.a.classList.remove("UISplitViewShrink");
            this.html.b.classList.remove("UISplitViewGrow")
            this.html.a.classList.add("UISplitViewGrow");
            this.html.b.classList.add("UISplitViewShrink");
        }
        else {
            this.html.a.classList.remove("UISplitViewGrow");
            this.html.b.classList.remove("UISplitViewShrink");
            this.html.a.classList.add("UISplitViewShrink");
            this.html.b.classList.add("UISplitViewGrow")
        }
    }

    _Destroy() {
        this._uuid = "[DESTROYED] " + this._uuid;

        if (this.parentSplitView !== null) {
            if (parent.html.a.firstChild === html.root) {
                parent.RemoveChild('a');
            }
            else if (parent.html.b.firstChild === html.root) {
                parent.RemoveChild('b');
            }
            else {
                throw new Error("Could not find self in parent")
            }
        }

        if (this.html.a.firstChild !== null) {
            this.RemoveChild('a');
        }
        if (this.html.b.firstChild !== null) {
            this.RemoveChild('b');
        }

        this.html.root.remove();
        this.html.root = null;
        this.html.a = null;
        this.html.splitter = null;
        this.html.b = null;
    
        this.parentSplitView = null;
        this.childViewA = null;
        this.childViewB = null;
    }

    // Destroys this split view, and replaces it with a tab view
    Collapse() {
        const html = this.html;
        const aDiv = html.a.firstChild;
        const bDiv = html.b.firstChild;
        const parent = this.parentSplitView;

        if (aDiv !== null && bDiv !== null) {
            throw new Error("Can't collapse split view that has a and b");
        }
        else if (aDiv === null && bDiv === null) {
            throw new Error("Can't collapse split view that is empty, a or b must not be null")
        }

        let promoteObject = null;
        if (aDiv !== null) {
            promoteObject = this.childViewA;
            this.RemoveChild('a');
        }
        else if (bDiv !== null) {
            promoteObject = this.childViewB;
            this.RemoveChild('b');
        }

        if (!this.IsEmpty) {
            throw new Error("Expecting UI View to be empty at this point");
        }

        if (parent !== null) {
            if (parent.html.a.firstChild === html.root) {
                parent.RemoveChild('a');
                parent.AppendChild(promoteObject, 'a');
            }
            else if (parent.html.b.firstChild === html.root) {
                parent.RemoveChild('b');
                parent.AppendChild(promoteObject, 'b');
            }
            else {
                throw new Error("Could not find self in parent")
            }
        }
        else { // No parent splitter defined (probably root node). Let's just do some html manipulation
            const parentNode = html.root.parentNode;
            let childNode = promoteObject;
            if (childNode.hasOwnProperty("html") && childNode.html.hasOwnProperty("root")) {
                childNode = childNode.html.root;
            }
            parentNode.appendChild(childNode);
        }

        this._Destroy();
    }
}