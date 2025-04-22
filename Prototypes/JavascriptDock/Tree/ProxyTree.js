class FSProxy {
    path = null; // file path (string or null)
    name = null; // file name (string or null)
    type = null; // string, "dir" or "file"

    parent = null; // FSProxy node or null
    sibling = null; // FSProxy node or null
    child = null; // FSProxy node or null

    constructor(path, name, type, parent = null) {
        this.path = path;
        this.name = name;
        this.type = type;
        this.parent = null;
        this.sibling = null;
        this.child = null;

        if (parent !== null && parent !== undefined) {
            parent.AddChild(this);
        }
    }

    _RemoveChild(child) {
        let prev = null;
        for (let iter = this.child; iter !== null; iter = iter.sibling) {
            if (iter === child) {
                if (prev === null) { // Removing head
                    this.child = child.sibling;
                }
                else {
                    prev.sibling = child.sibling;
                }
                child.parent = null;
                child.sibling = null;
                return true;
            }
            prev = iter;
        }
        return false;
    }

    AddChild(node) {
        if (node.parent !== null) {
            node.parent._RemoveChild(node);
        }

        if (this.child === null) {
            this.child = node;
        }
        else {
            let last = this.child;
            for (; last.sibling !== null; last = last.sibling);
            last.sibling = node;
        }
        node.parent = this;
    }

    ForEachDepthFirst(callback) {
        const root = this;

        let itr = root;
        let traversing = true;

        while (traversing) {
            callback(itr);
    
            if (itr.child) {
                itr = itr.child;
            }
            else {
                while (itr.sibling === null) {
                    if (itr === root) {
                        traversing = false;
                        break;
                    }
                    itr = itr.parent;
                }
                if (itr === root) { // Prevent stepping to the roots sibling
                    traversing = false;
                    break;
                }
                itr = itr.sibling;
            }
        }
    }
}

async function FSCreateProxyTree(fs) {
    const allFiles = []; // Array of FSProxy objects
    const root = new FSProxy("/", "/", "dir");
    { // Populate the root
        const content = await fs.promises.readdir("/");
        for (let i = 0, len = content.length; i < len; ++i) {
            const file = new FSProxy("/" + content[i], content[i], null, root);
            allFiles.push(file);
        }
    }
    if (allFiles.length === 0) {
        return root;
    }

    let index = 0;
    do {
        const path = allFiles[index].path;
        const stat = await fs.promises.stat(path);
        allFiles[index].type = stat.type;

        try {
            if (stat.type === "dir") {
                const content = await fs.promises.readdir(path);
                for (let i = 0, len = content.length; i < len; ++i) {
                    const file = new FSProxy(path + "/" + content[i], content[i], null, allFiles[index]);
                    allFiles.push(file);
                }
                //console.log("Directory: " + path);
            }
            else if (stat.type === "file") {
                //console.log("File: " + path);
            }
        }
        catch(e) {
            console.log("Caught: " + e);
        }
    } while(++index < allFiles.length);

    const statObj = await fs.promises.readdir("/");
    //console.log("ReadDir: " + JSON.stringify(statObj));
    return root;
};

async function FSSynchTreeDisplay(fs, tree){
    const proxyTree = await FSCreateProxyTree(fs);

    if (tree.root.userData === null || tree.root.userData === undefined) {
        tree.root._userData = {};
    }
    tree.root.ForEachDepthFirst((treeNode) => {
        treeNode.userData.visited = false;
    });
    tree.root.userData.visited = true;

    proxyTree.ForEachDepthFirst((node) => { // TODO: This is a bit busted, getorcreate doesn't exist anymore. Fix it!
        let treeNode = tree.GetNodeByPath(node.path);
        if (treeNode === null) {
            const newNodes = tree.CreateNodeByPath(node.path, {proxy: node});
            if (newNodes.length !== 1) {
                throw new Error("Parent should already exist!");
            }
            treeNode = newNodes[0];
            treeNode.isOpen = true;
        }

        if (node.parent !== null) {
            const treeNodeParent = tree.GetNodeByPath(node.parent.path);
            if (treeNode.parent !== treeNodeParent) {
                treeNodeParent.AddChild(treeNode);
            }
        }

        if (node.type === "dir") {
            treeNode.MakeFolder();
        }
        else {
            treeNode.MakeFile();
        }
        treeNode.text = node.name;

        if (treeNode.userData === null || treeNode.userData.proxy === undefined || treeNode.userData.proxy === null) {
            treeNode._userData = {
                proxy: node
            };
        }

        treeNode.userData.visited = true;
    });

    const toDestroy = [];
    tree.root.ForEachDepthFirst((treeNode) => {
        if (!treeNode.userData.visited) {
            toDestroy.push(treeNode);
        }
    });

    for (let i = 0; i < toDestroy.length; ++i) {
        toDestroy[i].Destroy();
    }
}

async function FSSynchTreeLoop(delay=500) {
    await FSSynchTreeDisplay(fs, tree);
    setTimeout(() => {
        FSSynchTreeLoop(delay);
    }, delay);
}