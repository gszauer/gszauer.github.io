var UIDockTargetPanel = {
    CENTER: 1,
    TOP: 2,
    BOTTOM: 3,
    LEFT: 4,
    RIGHT: 5
};

class UIDockTarget {
    _uuid = ""
    _tabView = null;

    html = {
        root: null,
        tint: null,
        top: null,
        bottom: null,
        left: null,
        right: null,
        center: null
    };
    

    onDropTab = null; // function(sourceView, destView, sourceTabIndex, UIDockTargetPanel)

    constructor(tabView) {
        if (tabView === null || tabView === undefined) {
            throw new Error("Tab View is not optional");
        }

        if (!(tabView instanceof UITabView)) {
            throw new Error("Tab View must be instance of UITabView");
        }
        this._tabView = tabView;
        const self = this;

        const root = this.html.root = document.createElement('div');
        const tint = this.html.tint = document.createElement('div');
        const top = this.html.top = document.createElement('div');
        const bottom = this.html.bottom = document.createElement('div');
        const left = this.html.left = document.createElement('div');
        const right = this.html.right = document.createElement('div');
        const center = this.html.center = document.createElement('div');

        const topIcon = document.createElement("span");
        topIcon.classList.add("ph");
        topIcon.classList.add("ph-caret-up");
        topIcon.classList.add("UIDockTargetIcon");
        top.appendChild(topIcon);

        const bottomIcon = document.createElement("span");
        bottomIcon.classList.add("ph");
        bottomIcon.classList.add("ph-caret-down");
        bottomIcon.classList.add("UIDockTargetIcon");
        bottom.appendChild(bottomIcon);

        const leftIcon = document.createElement("span");
        leftIcon.classList.add("ph");
        leftIcon.classList.add("ph-caret-left");
        leftIcon.classList.add("UIDockTargetIcon");
        left.appendChild(leftIcon);

        const rightIcon = document.createElement("span");
        rightIcon.classList.add("ph");
        rightIcon.classList.add("ph-caret-right");
        rightIcon.classList.add("UIDockTargetIcon");
        right.appendChild(rightIcon);

        const centerIcon = document.createElement("span");
        centerIcon.classList.add("ph");
        centerIcon.classList.add("ph-arrows-out");
        centerIcon.classList.add("UIDockTargetIcon");
        center.appendChild(centerIcon);

        const dragOver = (ev) => {
            ev.preventDefault();
        };
        const dragEnter = (ev) => {
            ev.preventDefault();
            ev.currentTarget.classList.add("UIDockTargetHighlight");
        };
        const dragLeave = (ev) => {
            ev.preventDefault();
            ev.currentTarget.classList.remove("UIDockTargetHighlight");
        };
        const onDrop = (ev, from) => {
            const tabViewDragSource = UITabView.dragSource;
            const tabViewDragDestination = tabView;
            const onDropTab = self.onDropTab;

            if (onDropTab !== null && onDropTab !== undefined) {
                onDropTab(tabViewDragSource, tabViewDragDestination, UITabView.dragTabIndex, from);
            }
            ev.preventDefault();
        }

        root.classList.add("UIDockTarget");
        tint.classList.add("UIDockTargetTint");
        top.classList.add("UIDockTargetTop");
        bottom.classList.add("UIDockTargetBottom");
        left.classList.add("UIDockTargetLeft");
        right.classList.add("UIDockTargetRight");
        center.classList.add("UIDockTargetCenter");

        root.appendChild(tint);
        root.appendChild(center);
        root.appendChild(top);
        root.appendChild(bottom);
        root.appendChild(left);
        root.appendChild(right);

        center.addEventListener("dragover", dragOver);
        center.addEventListener("dragenter", dragEnter);
        center.addEventListener("dragleave", dragLeave);
        center.addEventListener("drop", (ev) => {onDrop(ev, UIDockTargetPanel.CENTER);});

        top.addEventListener("dragover", dragOver);
        top.addEventListener("dragenter", dragEnter);
        top.addEventListener("dragleave", dragLeave);
        top.addEventListener("drop", (ev) => {onDrop(ev, UIDockTargetPanel.TOP);});

        bottom.addEventListener("dragover", dragOver);
        bottom.addEventListener("dragenter", dragEnter);
        bottom.addEventListener("dragleave", dragLeave);
        bottom.addEventListener("drop", (ev) => {onDrop(ev, UIDockTargetPanel.BOTTOM);});

        left.addEventListener("dragover", dragOver);
        left.addEventListener("dragenter", dragEnter);
        left.addEventListener("dragleave", dragLeave);
        left.addEventListener("drop", (ev) => {onDrop(ev, UIDockTargetPanel.LEFT);});

        right.addEventListener("dragover", dragOver);
        right.addEventListener("dragenter", dragEnter);
        right.addEventListener("dragleave", dragLeave);
        right.addEventListener("drop", (ev) => {onDrop(ev, UIDockTargetPanel.RIGHT);});
    }
}