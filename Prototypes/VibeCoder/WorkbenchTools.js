// Tool Implementations
class WorkbenchTools {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;

        // Storage for remembered script inclusion choices (per invocation)
        this.rememberedScriptChoices = null;
        this.scriptChoiceRemembered = false;
    }

    // Reset remembered script choices - called when a new user message is sent
    resetScriptChoices() {
        this.rememberedScriptChoices = null;
        this.scriptChoiceRemembered = false;
    }

    async list_files() {
        const files = await this.fileSystem.getAllFiles();
        const tree = this.buildTree(files);
        return this.printTree(tree);
    }

    buildTree(files) {
        const tree = { '/': { type: 'folder', children: {} } };

        for (let file of files) {
            // Skip special system files
            if (file.path === '/$chat_history') {
                continue;
            }

            const parts = file.path.split('/').filter(p => p);
            let current = tree['/'];

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];

                if (i === parts.length - 1) {
                    current.children[part] = {
                        type: file.type,
                        path: file.path,
                        children: file.type === 'folder' ? {} : null
                    };
                } else {
                    if (!current.children[part]) {
                        current.children[part] = {
                            type: 'folder',
                            children: {}
                        };
                    }
                    current = current.children[part];
                }
            }
        }

        return tree['/'];
    }

    printTree(node, prefix = '', isRoot = true) {
        let result = isRoot ? '/\n' : '';
        const children = Object.entries(node.children || {});

        children.forEach(([name, child], index) => {
            const isLast = index === children.length - 1;
            const connector = isLast ? '\\-- ' : '|-- ';
            const icon = child.type === 'folder' ? '[D] ' : '[F] ';

            result += prefix + connector + icon + name + '\n';

            if (child.type === 'folder' && child.children) {
                const newPrefix = prefix + (isLast ? '    ' : '|   ');
                result += this.printTree(child, newPrefix, false);
            }
        });

        return result;
    }

    async read_file(path) {
        // Normalize path - add leading slash if missing
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file') {
            throw new Error(`Path is not a file: ${path}`);
        }
        return file.content || '';
    }

    async write_file(path, content) {
        // Normalize path - add leading slash if missing
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if file exists
        const file = await this.fileSystem.getFile(path);
        if (!file) {
            // File doesn't exist - ask user if they want to create it
            const shouldCreate = await this._showFileCreationDialog(path);
            if (!shouldCreate) {
                throw new Error(`File not found: ${path}. User declined to create the file.`);
            }
            // Create the file and continue with writing
            await this.fileSystem.saveFile(path, content, 'file');

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            return `Successfully created and wrote ${content.length} characters to ${path}`;
        }
        if (file.type !== 'file') {
            throw new Error(`Path is not a file: ${path}`);
        }

        // Check if file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === path);

            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                // If the file has unsaved changes, we need to handle this carefully
                if (isDirty) {
                    // Show dialog asking user what to do
                    const fileName = path.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Write cancelled by user - file has unsaved changes`);
                    } else if (result === 'save') {
                        // Save the current editor content first
                        await window.tabManager.saveFile(tabId);
                    }
                    // If 'discard' was chosen, we'll proceed to overwrite
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true); // Skip prompt since we already handled it
            }
        }

        // Write the new content to the file
        await this.fileSystem.saveFile(path, content, 'file');

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully wrote ${content.length} characters to ${path}`;
    }

    async create_file(path, content = '') {
        // Normalize path - add leading slash if missing
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if file already exists
        const existingFile = await this.fileSystem.getFile(path);
        if (existingFile) {
            throw new Error(`File already exists: ${path}`);
        }

        // Create the file
        await this.fileSystem.saveFile(path, content, 'file');

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully created file: ${path}`;
    }

    async delete_file(path) {
        // Normalize path - add leading slash if missing
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if file exists
        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file') {
            throw new Error(`Path is not a file: ${path}`);
        }

        // Close any open tabs for this file (force close without prompt)
        if (window.tabManager) {
            await window.tabManager.closeTabsForPath(path);
        }

        // Delete the file
        await this.fileSystem.deleteFile(path);

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully deleted file: ${path}`;
    }

    async rename_file(oldPath, newPath) {
        // Normalize paths - add leading slash if missing
        if (!oldPath.startsWith('/')) {
            oldPath = '/' + oldPath;
        }
        if (!newPath.startsWith('/')) {
            newPath = '/' + newPath;
        }

        // Check if old file exists
        const file = await this.fileSystem.getFile(oldPath);
        if (!file) {
            throw new Error(`File not found: ${oldPath}`);
        }
        if (file.type !== 'file') {
            throw new Error(`Path is not a file: ${oldPath}`);
        }

        // Check if new path already exists
        const existingFile = await this.fileSystem.getFile(newPath);
        if (existingFile) {
            throw new Error(`File already exists: ${newPath}`);
        }

        // Get the file content
        const content = file.content || '';

        // Close any open tabs for the old file (force close without prompt)
        if (window.tabManager) {
            await window.tabManager.closeTabsForPath(oldPath);
        }

        // Create file at new path
        await this.fileSystem.saveFile(newPath, content, 'file');

        // Delete old file
        await this.fileSystem.deleteFile(oldPath);

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully renamed file from ${oldPath} to ${newPath}`;
    }

    async create_folder(path) {
        // Normalize path - add leading slash if missing
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if folder already exists
        const existingFolder = await this.fileSystem.getFile(path);
        if (existingFolder) {
            throw new Error(`Folder already exists: ${path}`);
        }

        // Create the folder
        await this.fileSystem.saveFile(path, null, 'folder');

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully created folder: ${path}`;
    }

    async delete_folder(path) {
        // Normalize path - add leading slash if missing
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if folder exists
        const folder = await this.fileSystem.getFile(path);
        if (!folder) {
            throw new Error(`Folder not found: ${path}`);
        }
        if (folder.type !== 'folder') {
            throw new Error(`Path is not a folder: ${path}`);
        }

        // Get all files to check if any are in this folder
        const allFiles = await this.fileSystem.getAllFiles();
        const filesInFolder = allFiles.filter(f =>
            f.path.startsWith(path + '/') || f.path === path
        );

        // Close any open tabs for files in this folder (force close without prompt)
        if (window.tabManager) {
            for (const file of filesInFolder) {
                if (file.type === 'file') {
                    await window.tabManager.closeTabsForPath(file.path);
                }
            }
        }

        // Delete the folder and all its contents
        await this.fileSystem.deleteFile(path);

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully deleted folder: ${path} and ${filesInFolder.length - 1} items inside`;
    }

    async move_file(sourcePath, destinationPath) {
        // Normalize paths - add leading slash if missing
        if (!sourcePath.startsWith('/')) {
            sourcePath = '/' + sourcePath;
        }
        if (!destinationPath.startsWith('/')) {
            destinationPath = '/' + destinationPath;
        }

        // Check if source exists
        const sourceFile = await this.fileSystem.getFile(sourcePath);
        if (!sourceFile) {
            throw new Error(`Source not found: ${sourcePath}`);
        }

        // Check if destination already exists
        const existingDest = await this.fileSystem.getFile(destinationPath);
        if (existingDest) {
            throw new Error(`Destination already exists: ${destinationPath}`);
        }

        // If moving a folder, we need to move all its contents
        if (sourceFile.type === 'folder') {
            // Get all files in the folder
            const allFiles = await this.fileSystem.getAllFiles();
            const filesToMove = allFiles.filter(f =>
                f.path === sourcePath || f.path.startsWith(sourcePath + '/')
            );

            // Close tabs for all files being moved
            if (window.tabManager) {
                for (const file of filesToMove) {
                    if (file.type === 'file') {
                        await window.tabManager.closeTabsForPath(file.path);
                    }
                }
            }

            // Move each file/folder
            for (const file of filesToMove) {
                const relativePath = file.path.substring(sourcePath.length);
                const newPath = destinationPath + relativePath;
                await this.fileSystem.saveFile(newPath, file.content, file.type);
            }

            // Delete the source folder and contents
            await this.fileSystem.deleteFile(sourcePath);
        } else {
            // Moving a single file
            const content = sourceFile.content || '';

            // Close any open tabs for the source file
            if (window.tabManager) {
                await window.tabManager.closeTabsForPath(sourcePath);
            }

            // Create file at destination
            await this.fileSystem.saveFile(destinationPath, content, 'file');

            // Delete source file
            await this.fileSystem.deleteFile(sourcePath);
        }

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully moved ${sourcePath} to ${destinationPath}`;
    }

    async code_summary() {
        // Get all JavaScript files
        const files = await this.fileSystem.getAllFiles();
        const jsFiles = files.filter(file =>
            file.type === 'file' &&
            file.path.endsWith('.js') &&
            !file.path.includes('node_modules')
        );

        const minifiedFiles = jsFiles.filter(file => file.path.toLowerCase().endsWith('.min.js'));
        const analysableFiles = jsFiles.filter(file => !file.path.toLowerCase().endsWith('.min.js'));

        if (jsFiles.length === 0) {
            return 'No JavaScript files found in the workspace.';
        }

        let output = 'JavaScript Analysis\n';
        output += '==================\n\n';

        if (minifiedFiles.length > 0) {
            output += 'Libraries (minified .js files):\n';
            output += '------------------------------\n';
            minifiedFiles
                .map(file => file.path)
                .sort()
                .forEach(path => {
                    output += `  ${path}\n`;
                });
            output += '\n';
        }

        const allClasses = [];
        const allTopLevelDeclarations = new Set();

        // Process each JavaScript file
        for (const file of analysableFiles) {
            try {
                const content = await this.read_file(file.path);
                const analysis = this.analyzeJavaScript(content, file.path);

                // Collect all classes
                if (analysis.classes.length > 0) {
                    allClasses.push(...analysis.classes);
                }

                // Collect all top-level declarations
                analysis.topLevelDeclarations.forEach(decl => {
                    allTopLevelDeclarations.add(`${decl.kind} ${decl.name}`);
                });
            } catch (error) {
                console.warn(`Error analyzing ${file.path}:`, error.message);
            }
        }

        // Output top-level declarations
        if (allTopLevelDeclarations.size > 0) {
            output += 'Top-Level Declarations:\n';
            output += '-----------------------\n';
            Array.from(allTopLevelDeclarations).sort().forEach(decl => {
                output += `  ${decl}\n`;
            });
            output += '\n';
        }

        // Build and output class hierarchy
        if (allClasses.length > 0) {
            output += 'Class Hierarchy:\n';
            output += '----------------\n\n';

            // Find root classes (no superclass)
            const rootClasses = allClasses.filter(c => !c.superClass);
            const processedClasses = new Set();

            const printClass = (classInfo, indent = 0) => {
                if (processedClasses.has(classInfo.name)) return '';
                processedClasses.add(classInfo.name);

                const indentStr = '  '.repeat(indent);
                let result = '';

                result += `${indentStr}Class: ${classInfo.name}`;
                if (classInfo.superClass) {
                    result += ` (extends ${classInfo.superClass})`;
                }
                result += ` [${classInfo.file}]\n`;

                // Private properties
                classInfo.privateProperties.forEach(prop => {
                    const prefix = prop.isStatic ? 'static ' : '';
                    result += `${indentStr}  # ${prefix}${prop.name} [private]\n`;
                });

                // Static getters
                classInfo.staticGetters.forEach(getter => {
                    result += `${indentStr}  [static] get ${getter.name}\n`;
                });

                // Static setters
                classInfo.staticSetters.forEach(setter => {
                    const paramsStr = setter.params.join(', ');
                    result += `${indentStr}  [static] set ${setter.name}(${paramsStr})\n`;
                });

                // Static methods
                classInfo.staticMethods.forEach(method => {
                    const asyncMark = method.isAsync ? 'async ' : '';
                    const generatorMark = method.isGenerator ? '*' : '';
                    const paramsStr = method.params.join(', ');
                    result += `${indentStr}  [static] ${asyncMark}${generatorMark}${method.name}(${paramsStr})\n`;
                });

                // Instance getters
                classInfo.getters.forEach(getter => {
                    result += `${indentStr}  get ${getter.name}\n`;
                });

                // Instance setters
                classInfo.setters.forEach(setter => {
                    const paramsStr = setter.params.join(', ');
                    result += `${indentStr}  set ${setter.name}(${paramsStr})\n`;
                });

                // Instance methods
                classInfo.methods.forEach(method => {
                    const asyncMark = method.isAsync ? 'async ' : '';
                    const generatorMark = method.isGenerator ? '*' : '';
                    const paramsStr = method.params.join(', ');
                    if (method.kind === 'constructor') {
                        result += `${indentStr}  constructor(${paramsStr})\n`;
                    } else {
                        result += `${indentStr}  ${asyncMark}${generatorMark}${method.name}(${paramsStr})\n`;
                    }
                });

                // Find child classes
                const children = allClasses.filter(c => c.superClass === classInfo.name);
                if (children.length > 0) {
                    result += '\n';
                    children.forEach(child => {
                        result += printClass(child, indent + 1);
                    });
                }

                return result;
            };

            // Print all root classes and their hierarchies
            rootClasses.forEach(rootClass => {
                output += printClass(rootClass);
                output += '\n';
            });

            // Print any orphaned classes (with superclass that doesn't exist in our codebase)
            const orphanedClasses = allClasses.filter(c =>
                c.superClass &&
                !allClasses.find(parent => parent.name === c.superClass) &&
                !processedClasses.has(c.name)
            );

            if (orphanedClasses.length > 0) {
                orphanedClasses.forEach(orphan => {
                    output += printClass(orphan);
                    output += '\n';
                });
            }

            output += '----------------------------\n';
            output += `Total Classes: ${allClasses.length}\n`;
        } else {
            output += 'No classes found in JavaScript files.\n';
        }

        return output;
    }

    async js_create_class(className, baseClass = null) {
        // Validate class name
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }

        // Validate class name format (must be valid JavaScript identifier)
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(className)) {
            throw new Error(`Invalid class name: ${className}. Must be a valid JavaScript identifier.`);
        }

        // Create file path - use class name as filename in root
        const fileName = `${className}.js`;
        const filePath = `/${fileName}`;

        // Check if file already exists
        const existingFile = await this.fileSystem.getFile(filePath);
        if (existingFile) {
            throw new Error(`File already exists: ${filePath}`);
        }

        // Generate class content
        let classContent = '';

        if (baseClass) {
            // Class with inheritance
            classContent = `// ${className} class
class ${className} extends ${baseClass} {
    constructor() {
        super();
        // Initialize ${className} properties here
    }

    // Add ${className} methods here
}
`;
        } else {
            // Standalone class
            classContent = `// ${className} class
class ${className} {
    constructor() {
        // Initialize ${className} properties here
    }

    // Add ${className} methods here
}
`;
        }

        // Create the file
        await this.fileSystem.saveFile(filePath, classContent, 'file');

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        let message = `Successfully created class ${className} in ${filePath}`;
        if (baseClass) {
            message += ` (extends ${baseClass})`;
        }

        // Get all HTML files for the inclusion dialog
        const files = await this.fileSystem.getAllFiles();
        const htmlFiles = files.filter(file =>
            file.type === 'file' &&
            (file.path.endsWith('.html') || file.path.endsWith('.htm'))
        );

        // Show dialog to include script in HTML files
        if (htmlFiles.length > 0) {
            let selectedFiles;

            // Check if we have a remembered choice
            if (this.scriptChoiceRemembered && this.rememberedScriptChoices !== null) {
                // Use remembered choice - filter to only existing HTML files
                selectedFiles = this.rememberedScriptChoices.filter(path =>
                    htmlFiles.some(file => file.path === path)
                );
            } else {
                // Show dialog and get user's choice
                selectedFiles = await this._showScriptInclusionDialog(fileName, htmlFiles);
            }

            if (selectedFiles && selectedFiles.length > 0) {
                // Add the script to selected HTML files
                for (const htmlPath of selectedFiles) {
                    try {
                        // Close any open tabs for this HTML file (force close, no save prompt)
                        if (window.tabManager) {
                            const openTab = window.tabManager.tabs.find(tab => tab.path === htmlPath);
                            if (openTab) {
                                await window.tabManager.closeTab(openTab.id, true); // true = skip dirty check
                            }
                        }

                        // Read the HTML file
                        const file = await this.fileSystem.getFile(htmlPath);
                        if (!file) {
                            throw new Error(`HTML file not found: ${htmlPath}`);
                        }

                        const htmlContent = file.content || '';

                        // Parse HTML
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(htmlContent, 'text/html');

                        // Check if script already exists
                        const existingScript = doc.querySelector(`script[src="${fileName}"]`);
                        if (!existingScript) {
                            // Consolidate inline scripts first (ensures inline is at the end)
                            this._consolidateInlineScripts(doc);

                            // Create new script element
                            const newScript = doc.createElement('script');
                            newScript.src = fileName;

                            // Find the inline script (should be at the end after consolidation)
                            const inlineScript = doc.querySelector('body > script:not([src])');

                            if (inlineScript) {
                                // Insert the new linked script before the inline script
                                doc.body.insertBefore(newScript, inlineScript);
                            } else {
                                // No inline script, just append to body
                                doc.body.appendChild(newScript);
                            }

                            // Save the modified HTML with pretty formatting
                            const rawHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
                            const modifiedHtml = this._prettifyHTML(rawHtml);
                            await this.fileSystem.saveFile(htmlPath, modifiedHtml, 'file');

                            message += `\n  - Added to ${htmlPath}`;
                        } else {
                            message += `\n  - Already included in ${htmlPath}`;
                        }
                    } catch (err) {
                        console.error(`Failed to add script to ${htmlPath}:`, err);
                        message += `\n  - Failed to add to ${htmlPath}: ${err.message}`;
                    }
                }

                // Refresh the file tree if available
                if (window.fileBrowser) {
                    await window.fileBrowser.refreshFileTree();
                }
            }
        }

        return message;
    }

    // Helper method to show script inclusion dialog
    async _showScriptInclusionDialog(scriptFileName, htmlFiles) {
        return new Promise((resolve) => {
            // Store the resolve function globally so the buttons can access it
            window._scriptInclusionResolve = resolve;

            // Create modal controller functions globally
            window.scriptInclusionModal = {
                cancel: function() {
                    const modal = document.getElementById('scriptInclusionModal');
                    if (modal) modal.style.display = 'none';
                    if (window._scriptInclusionResolve) {
                        window._scriptInclusionResolve([]);
                        window._scriptInclusionResolve = null;
                    }
                },
                proceed: function() {
                    const modal = document.getElementById('scriptInclusionModal');
                    const checkboxes = modal.querySelectorAll('#htmlFilesList input[type="checkbox"]:checked');
                    const selectedPaths = Array.from(checkboxes).map(cb => cb.value);

                    // Check if "Remember my choice" is checked
                    const rememberCheckbox = document.getElementById('rememberScriptChoice');
                    if (rememberCheckbox && rememberCheckbox.checked) {
                        // Store the selection in the WorkbenchTools instance
                        if (window.workbenchTools) {
                            window.workbenchTools.scriptChoiceRemembered = true;
                            window.workbenchTools.rememberedScriptChoices = selectedPaths;
                            console.log('Script inclusion choice remembered:', selectedPaths);
                        }
                    }

                    modal.style.display = 'none';
                    if (window._scriptInclusionResolve) {
                        window._scriptInclusionResolve(selectedPaths);
                        window._scriptInclusionResolve = null;
                    }
                }
            };

            const modal = document.getElementById('scriptInclusionModal');
            const fileNameSpan = document.getElementById('scriptFileName');
            const filesList = document.getElementById('htmlFilesList');

            if (!modal || !fileNameSpan || !filesList) {
                resolve([]);
                return;
            }

            // Set the script file name
            fileNameSpan.textContent = scriptFileName;

            // Clear and populate the file list
            filesList.innerHTML = '';

            // Sort files by path for better organization
            htmlFiles.sort((a, b) => a.path.localeCompare(b.path));

            // Create themed checkboxes for each HTML file
            htmlFiles.forEach(file => {
                const label = document.createElement('label');
                label.className = 'theme-checkbox theme-checkbox--list';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = file.path;
                checkbox.className = 'theme-checkbox-input';

                const indicator = document.createElement('span');
                indicator.className = 'theme-checkbox-indicator';
                indicator.setAttribute('aria-hidden', 'true');

                const text = document.createElement('span');
                text.className = 'theme-checkbox-text';
                text.textContent = file.path;

                label.appendChild(checkbox);
                label.appendChild(indicator);
                label.appendChild(text);

                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        label.classList.add('theme-checkbox--checked');
                    } else {
                        label.classList.remove('theme-checkbox--checked');
                    }
                });

                filesList.appendChild(label);
            });

            // Add ESC key handler
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    window.scriptInclusionModal.cancel();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);

            // Reset the remember checkbox state (unchecked by default for each new dialog)
            const rememberCheckbox = document.getElementById('rememberScriptChoice');
            if (rememberCheckbox) {
                rememberCheckbox.checked = false;
                const rememberLabel = rememberCheckbox.closest('.theme-checkbox');
                if (rememberLabel) {
                    rememberLabel.classList.remove('theme-checkbox--checked');
                }

                if (!rememberCheckbox.dataset.styled) {
                    rememberCheckbox.addEventListener('change', () => {
                        const label = rememberCheckbox.closest('.theme-checkbox');
                        if (label) {
                            if (rememberCheckbox.checked) {
                                label.classList.add('theme-checkbox--checked');
                            } else {
                                label.classList.remove('theme-checkbox--checked');
                            }
                        }
                    });
                    rememberCheckbox.dataset.styled = 'true';
                }
            }

            // Show the modal
            modal.style.display = 'flex';
        });
    }

    async _showFileCreationDialog(filePath) {
        return new Promise((resolve) => {
            // Extract file name from path
            const fileName = filePath.split('/').pop() || filePath;

            // Create a simple confirmation dialog
            const message = `The file "${fileName}" does not exist.\n\nThe AI is trying to write to this file. Would you like to create it?\n\nPath: ${filePath}`;

            // Use a more prominent dialog with custom styling
            const modalHtml = `
                <div id="fileCreationModal" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                ">
                    <div style="
                        background: #2a2a2a;
                        border: 2px solid #ff9800;
                        border-radius: 8px;
                        padding: 20px;
                        max-width: 500px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    ">
                        <h3 style="
                            color: #ff9800;
                            margin: 0 0 15px 0;
                            font-size: 18px;
                        ">⚠️ File Not Found</h3>
                        <p style="
                            color: #e0e0e0;
                            margin: 0 0 10px 0;
                            white-space: pre-wrap;
                        ">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                        <div style="
                            display: flex;
                            gap: 10px;
                            justify-content: flex-end;
                            margin-top: 20px;
                        ">
                            <button onclick="window._fileCreationResolve(false); document.getElementById('fileCreationModal').remove();" style="
                                padding: 8px 16px;
                                background: #555;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">Cancel</button>
                            <button onclick="window._fileCreationResolve(true); document.getElementById('fileCreationModal').remove();" style="
                                padding: 8px 16px;
                                background: #ff9800;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: bold;
                            ">Create File</button>
                        </div>
                    </div>
                </div>
            `;

            // Store the resolve function
            window._fileCreationResolve = resolve;

            // Add the modal to the document
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalHtml;
            document.body.appendChild(modalDiv.firstElementChild);

            // Add ESC key handler
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    resolve(false);
                    const modal = document.getElementById('fileCreationModal');
                    if (modal) modal.remove();
                    document.removeEventListener('keydown', escHandler);
                    window._fileCreationResolve = null;
                }
            };
            document.addEventListener('keydown', escHandler);

            // Focus on the Create button
            const createButton = document.querySelector('#fileCreationModal button:last-child');
            if (createButton) createButton.focus();
        });
    }

    async list_html_files() {
        // Get all HTML files
        const files = await this.fileSystem.getAllFiles();
        const htmlFiles = files.filter(file =>
            file.type === 'file' &&
            (file.path.endsWith('.html') || file.path.endsWith('.htm'))
        );

        if (htmlFiles.length === 0) {
            return 'No HTML files found in the workspace.';
        }

        let output = 'HTML Files in Workspace\n';
        output += '=======================\n\n';

        // Sort files by path for consistent output
        htmlFiles.sort((a, b) => a.path.localeCompare(b.path));

        // List each HTML file with its path
        htmlFiles.forEach(file => {
            output += `  ${file.path}\n`;
        });

        output += '\n----------------------------\n';
        output += `Total HTML Files: ${htmlFiles.length}\n`;

        return output;
    }

    // HTML manipulation helper - prettify HTML output
    _prettifyHTML(html) {
        // Use js-beautify if available
        if (typeof html_beautify !== 'undefined') {
            return html_beautify(html, {
                indent_size: 4,
                indent_char: ' ',
                preserve_newlines: true,
                max_preserve_newlines: 2,
                wrap_line_length: 0,
                indent_inner_html: true,
                indent_scripts: 'normal',
                unformatted: [],  // Format all elements
                content_unformatted: ['pre', 'textarea']  // Don't format content of these
            });
        }

        // Fallback: return unformatted if js-beautify is not available
        console.warn('js-beautify not loaded, returning unformatted HTML');
        return html;
    }

    // HTML manipulation helper - consolidates inline scripts
    _consolidateInlineScripts(doc) {
        const inlineScripts = doc.querySelectorAll('script:not([src])');

        if (inlineScripts.length <= 1) {
            // Even with just one inline script, make sure it's after all linked scripts
            if (inlineScripts.length === 1) {
                const inlineScript = inlineScripts[0];
                const allScripts = doc.querySelectorAll('script');
                const lastLinkedScript = Array.from(allScripts).filter(s => s.hasAttribute('src')).pop();

                if (lastLinkedScript && lastLinkedScript.compareDocumentPosition(inlineScript) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    // The inline script is before a linked script, move it to the end
                    inlineScript.remove();
                    doc.body.appendChild(inlineScript);
                }
            }
            return;
        }

        // Collect all inline script content
        const scriptContents = [];
        for (let i = 0; i < inlineScripts.length; i++) {
            const content = inlineScripts[i].textContent.trim();
            if (content) {
                scriptContents.push(content);
            }
        }

        // Remove all inline scripts
        inlineScripts.forEach(script => script.remove());

        // Create a single inline script at the end of body (after all linked scripts)
        if (scriptContents.length > 0) {
            const combinedScript = doc.createElement('script');
            combinedScript.textContent = '\n' + scriptContents.join('\n\n') + '\n';
            doc.body.appendChild(combinedScript);
        }
    }

    async html_get_scripts(path) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Read the HTML file
        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file' || (!path.endsWith('.html') && !path.endsWith('.htm'))) {
            throw new Error(`Path is not an HTML file: ${path}`);
        }

        const htmlContent = file.content || '';

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Find all script tags with src attribute
        const scripts = doc.querySelectorAll('script[src]');

        if (scripts.length === 0) {
            return `No linked JavaScript files found in ${path}`;
        }

        let output = `Linked JavaScript files in ${path}:\n`;
        output += '=' .repeat(40) + '\n\n';

        scripts.forEach((script, index) => {
            const src = script.getAttribute('src');
            output += `  ${index + 1}. ${src}\n`;
        });

        output += '\n' + '-'.repeat(40) + '\n';
        output += `Total: ${scripts.length} linked script(s)\n`;

        return output;
    }

    async html_add_script(path, scriptPath) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if file is open in a tab and handle dirty state
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === path);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = path.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Read the HTML file
        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file' || (!path.endsWith('.html') && !path.endsWith('.htm'))) {
            throw new Error(`Path is not an HTML file: ${path}`);
        }

        const htmlContent = file.content || '';

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Check if script already exists
        const existingScript = doc.querySelector(`script[src="${scriptPath}"]`);
        if (existingScript) {
            return `Script "${scriptPath}" is already linked in ${path}`;
        }

        // Consolidate inline scripts first (ensures inline is at the end)
        this._consolidateInlineScripts(doc);

        // Create new script element
        const newScript = doc.createElement('script');
        newScript.src = scriptPath;

        // Find the inline script (should be at the end after consolidation)
        const inlineScript = doc.querySelector('body > script:not([src])');

        if (inlineScript) {
            // Insert the new linked script before the inline script
            doc.body.insertBefore(newScript, inlineScript);
        } else {
            // No inline script, just append to body
            doc.body.appendChild(newScript);
        }

        // Save the modified HTML with pretty formatting
        const rawHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
        const modifiedHtml = this._prettifyHTML(rawHtml);
        await this.fileSystem.saveFile(path, modifiedHtml, 'file');

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully added script "${scriptPath}" to ${path}`;
    }

    async html_remove_script(path, scriptPath) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if file is open in a tab and handle dirty state
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === path);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = path.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Read the HTML file
        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file' || (!path.endsWith('.html') && !path.endsWith('.htm'))) {
            throw new Error(`Path is not an HTML file: ${path}`);
        }

        const htmlContent = file.content || '';

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Find and remove the script
        const scripts = doc.querySelectorAll(`script[src="${scriptPath}"]`);

        if (scripts.length === 0) {
            return `Script "${scriptPath}" not found in ${path}`;
        }

        scripts.forEach(script => script.remove());

        // Consolidate inline scripts
        this._consolidateInlineScripts(doc);

        // Save the modified HTML with pretty formatting
        const rawHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
        const modifiedHtml = this._prettifyHTML(rawHtml);
        await this.fileSystem.saveFile(path, modifiedHtml, 'file');

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        return `Successfully removed ${scripts.length} instance(s) of script "${scriptPath}" from ${path}`;
    }

    async html_get_inline(path) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Read the HTML file
        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file' || (!path.endsWith('.html') && !path.endsWith('.htm'))) {
            throw new Error(`Path is not an HTML file: ${path}`);
        }

        const htmlContent = file.content || '';

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Consolidate inline scripts first
        this._consolidateInlineScripts(doc);

        // Get the consolidated inline script
        const inlineScript = doc.querySelector('script:not([src])');

        if (!inlineScript) {
            return '// No inline JavaScript found';
        }

        const content = inlineScript.textContent.trim();
        return content || '// Empty inline script';
    }

    async html_set_inline(path, scriptContent) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Check if file is open in a tab and handle dirty state
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === path);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = path.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Read the HTML file
        const file = await this.fileSystem.getFile(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        if (file.type !== 'file' || (!path.endsWith('.html') && !path.endsWith('.htm'))) {
            throw new Error(`Path is not an HTML file: ${path}`);
        }

        const htmlContent = file.content || '';

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Remove all existing inline scripts
        const inlineScripts = doc.querySelectorAll('script:not([src])');
        inlineScripts.forEach(script => script.remove());

        // Add new inline script if content is provided
        if (scriptContent && scriptContent.trim()) {
            const newScript = doc.createElement('script');
            newScript.textContent = '\n' + scriptContent.trim() + '\n';
            doc.body.appendChild(newScript);
        }

        // Save the modified HTML with pretty formatting
        const rawHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
        const modifiedHtml = this._prettifyHTML(rawHtml);
        await this.fileSystem.saveFile(path, modifiedHtml, 'file');

        // Refresh the file tree if available
        if (window.fileBrowser) {
            await window.fileBrowser.refreshFileTree();
        }

        if (!scriptContent || !scriptContent.trim()) {
            return `Cleared inline JavaScript from ${path}`;
        } else {
            return `Successfully set inline JavaScript in ${path} (${scriptContent.length} characters)`;
        }
    }

    analyzeJavaScript(code, fileName) {
        const result = {
            classes: [],
            topLevelDeclarations: []
        };

        try {
            // Parse with Babel
            const ast = window.Babel.transform(code, {
                ast: true,
                code: false
            }).ast;

            // Helper function to format default values
            const formatValue = (node) => {
                if (!node) return '';
                if (node.type === 'NumericLiteral') return node.value;
                if (node.type === 'StringLiteral') return `"${node.value}"`;
                if (node.type === 'BooleanLiteral') return node.value;
                if (node.type === 'NullLiteral') return 'null';
                if (node.type === 'Identifier') return node.name;
                return '...';
            };

            // Traverse AST to find classes and top-level declarations
            const traverse = (node, isTopLevel = false) => {
                if (!node) return;

                // Top-level variable declarations
                if (isTopLevel && node.type === 'VariableDeclaration') {
                    node.declarations.forEach(decl => {
                        if (decl.id && decl.id.name) {
                            result.topLevelDeclarations.push({
                                kind: node.kind,
                                name: decl.id.name,
                                type: 'variable'
                            });
                        }
                    });
                }

                // Class declarations
                if (node.type === 'ClassDeclaration') {
                    const className = node.id.name;
                    const superClass = node.superClass ? node.superClass.name : null;

                    const classInfo = {
                        name: className,
                        superClass: superClass,
                        file: fileName,
                        methods: [],
                        staticMethods: [],
                        properties: [],
                        privateProperties: [],
                        getters: [],
                        setters: [],
                        staticGetters: [],
                        staticSetters: []
                    };

                    // Analyze class body
                    if (node.body && node.body.body) {
                        node.body.body.forEach(member => {
                            if (member.type === 'ClassMethod') {
                                // Extract parameter names
                                const params = member.params.map(param => {
                                    if (param.type === 'Identifier') {
                                        return param.name;
                                    } else if (param.type === 'AssignmentPattern') {
                                        return `${param.left.name} = ${formatValue(param.right)}`;
                                    } else if (param.type === 'RestElement') {
                                        return `...${param.argument.name}`;
                                    }
                                    return 'param';
                                });

                                const methodInfo = {
                                    name: member.key.name || member.key.id?.name,
                                    isStatic: member.static,
                                    kind: member.kind,
                                    params: params,
                                    isAsync: member.async,
                                    isGenerator: member.generator
                                };

                                if (member.kind === 'get') {
                                    if (member.static) {
                                        classInfo.staticGetters.push(methodInfo);
                                    } else {
                                        classInfo.getters.push(methodInfo);
                                    }
                                } else if (member.kind === 'set') {
                                    if (member.static) {
                                        classInfo.staticSetters.push(methodInfo);
                                    } else {
                                        classInfo.setters.push(methodInfo);
                                    }
                                } else {
                                    if (member.static) {
                                        classInfo.staticMethods.push(methodInfo);
                                    } else {
                                        classInfo.methods.push(methodInfo);
                                    }
                                }
                            } else if (member.type === 'ClassProperty' || member.type === 'ClassPrivateProperty') {
                                const propName = member.key.name || member.key.id?.name;
                                const isPrivate = member.type === 'ClassPrivateProperty' ||
                                                 (propName && propName.startsWith('#'));

                                const propInfo = {
                                    name: propName,
                                    isStatic: member.static,
                                    isPrivate: isPrivate
                                };

                                if (isPrivate) {
                                    classInfo.privateProperties.push(propInfo);
                                } else {
                                    classInfo.properties.push(propInfo);
                                }
                            }
                        });
                    }

                    result.classes.push(classInfo);
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => traverse(child, false));
                        } else {
                            traverse(node[key], false);
                        }
                    }
                }
            };

            // Start traversal from program body
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => traverse(node, true));
            }
        } catch (error) {
            console.warn(`Error parsing JavaScript in ${fileName}:`, error.message);
        }

        return result;
    }

    async js_get_constructor(className) {
        // Validate class name
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to extract the constructor
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            // Find the class and its constructor
            let constructorCode = null;

            const findConstructor = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    // Found the class, look for constructor
                    if (node.body && node.body.body) {
                        const constructor = node.body.body.find(member =>
                            member.type === 'ClassMethod' &&
                            member.kind === 'constructor'
                        );

                        if (constructor) {
                            // Extract the constructor code
                            const start = constructor.start;
                            const end = constructor.end;
                            constructorCode = content.substring(start, end);
                        } else {
                            // No constructor found, return empty constructor
                            constructorCode = 'constructor() {\n        // No constructor found\n    }';
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findConstructor(child));
                        } else {
                            findConstructor(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findConstructor(node));
            }

            if (constructorCode !== null) {
                return constructorCode;
            } else {
                throw new Error(`Class "${className}" not found in ${targetFile}`);
            }
        } catch (error) {
            if (error.message.includes('not found')) {
                throw error;
            }
            throw new Error(`Error parsing JavaScript: ${error.message}`);
        }
    }

    async js_set_constructor(className, constructorContent) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (typeof constructorContent !== 'string') {
            throw new Error('Constructor content must be a string');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find and replace the constructor
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let classStart = -1;
            let classEnd = -1;
            let constructorStart = -1;
            let constructorEnd = -1;
            let classIndent = '';
            let hasConstructor = false;

            const findClass = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    classStart = node.body.start + 1; // After the opening brace
                    classEnd = node.body.end - 1; // Before the closing brace

                    // Determine indentation by looking at the first class member or the class itself
                    const lines = content.substring(0, node.start).split('\n');
                    const lastLine = lines[lines.length - 1];
                    classIndent = lastLine.match(/^(\s*)/)[1] || '';

                    // Look for existing constructor
                    if (node.body && node.body.body) {
                        const constructor = node.body.body.find(member =>
                            member.type === 'ClassMethod' &&
                            member.kind === 'constructor'
                        );

                        if (constructor) {
                            hasConstructor = true;
                            constructorStart = constructor.start;
                            constructorEnd = constructor.end;
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findClass(child));
                        } else {
                            findClass(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findClass(node));
            }

            if (classStart === -1) {
                throw new Error(`Class "${className}" not found in ${targetFile}`);
            }

            // Clean up the constructor content
            let cleanConstructor = constructorContent.trim();

            // If it doesn't start with 'constructor', add it
            if (!cleanConstructor.startsWith('constructor')) {
                cleanConstructor = `constructor() {\n${cleanConstructor}\n}`;
            }

            // Apply proper indentation
            const methodIndent = classIndent + '    ';
            const indentedConstructor = cleanConstructor
                .split('\n')
                .map((line, index) => index === 0 ? methodIndent + line : methodIndent + line)
                .join('\n');

            let newContent;
            if (hasConstructor) {
                // Replace existing constructor
                newContent = content.substring(0, constructorStart) +
                           indentedConstructor +
                           content.substring(constructorEnd);
            } else {
                // Add constructor at the beginning of the class
                // Find the position right after the class opening brace
                const beforeClass = content.substring(0, classStart);
                const afterClassStart = content.substring(classStart);

                // Add constructor with proper spacing
                newContent = beforeClass + '\n' + indentedConstructor + '\n' + afterClassStart;
            }

            // Save the modified file
            await this.fileSystem.saveFile(targetFile, newContent, 'file');

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            return `Successfully ${hasConstructor ? 'replaced' : 'added'} constructor for class "${className}" in ${targetFile}`;
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('cancelled')) {
                throw error;
            }
            throw new Error(`Error modifying JavaScript: ${error.message}`);
        }
    }

    async js_create_variable(className, variableName, isStatic = false, isPrivate = false, initializer = 'null') {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!variableName || typeof variableName !== 'string') {
            throw new Error('Variable name is required');
        }

        // Validate variable name format
        if (isPrivate && !variableName.startsWith('#')) {
            variableName = '#' + variableName;
        } else if (!isPrivate && variableName.startsWith('#')) {
            throw new Error('Public variables should not start with #');
        }

        // Validate variable name (must be valid JavaScript identifier)
        const nameToValidate = isPrivate ? variableName.substring(1) : variableName;
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nameToValidate)) {
            throw new Error(`Invalid variable name: ${variableName}. Must be a valid JavaScript identifier.`);
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find the class and add the variable
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let classBodyStart = -1;
            let classIndent = '';
            let firstMemberStart = -1;
            let hasMembers = false;

            const findClass = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    classBodyStart = node.body.start + 1; // After the opening brace

                    // Determine indentation
                    const lines = content.substring(0, node.start).split('\n');
                    const lastLine = lines[lines.length - 1];
                    classIndent = lastLine.match(/^(\s*)/)[1] || '';

                    // Check if variable already exists
                    if (node.body && node.body.body) {
                        hasMembers = node.body.body.length > 0;

                        // Find the first member position
                        if (hasMembers) {
                            firstMemberStart = node.body.body[0].start;
                        }

                        // Check for existing variable with same name
                        for (const member of node.body.body) {
                            if (member.type === 'ClassProperty' || member.type === 'ClassPrivateProperty') {
                                const memberName = member.key?.name || member.key?.id?.name;
                                if (memberName === variableName ||
                                    (isPrivate && memberName === variableName.substring(1))) {
                                    throw new Error(`Variable "${variableName}" already exists in class "${className}"`);
                                }
                            }
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findClass(child));
                        } else {
                            findClass(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findClass(node));
            }

            if (classBodyStart === -1) {
                throw new Error(`Class "${className}" not found in ${targetFile}`);
            }

            // Build the variable declaration
            const memberIndent = classIndent + '    ';
            let variableDeclaration = memberIndent;

            if (isStatic) {
                variableDeclaration += 'static ';
            }

            variableDeclaration += variableName;

            // Add initializer
            if (initializer && initializer.trim() !== '') {
                variableDeclaration += ' = ' + initializer;
            } else {
                variableDeclaration += ' = null';
            }

            variableDeclaration += ';';

            // Insert the variable at the top of the class
            let newContent;
            if (hasMembers && firstMemberStart !== -1) {
                // Add before the first member
                const beforeMember = content.substring(0, firstMemberStart);
                const afterMember = content.substring(firstMemberStart);

                // Check if we need extra newline
                const needsExtraNewline = !beforeMember.endsWith('\n\n');

                newContent = beforeMember +
                           variableDeclaration + '\n' +
                           (needsExtraNewline ? '\n' : '') +
                           afterMember;
            } else {
                // No members, add after the opening brace
                const beforeClass = content.substring(0, classBodyStart);
                const afterClassStart = content.substring(classBodyStart);

                newContent = beforeClass + '\n' + variableDeclaration + '\n' + afterClassStart;
            }

            // Save the modified file
            await this.fileSystem.saveFile(targetFile, newContent, 'file');

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            let description = isStatic ? 'static ' : '';
            description += isPrivate ? 'private ' : 'public ';
            description += `variable "${variableName}"`;

            return `Successfully added ${description} to class "${className}" in ${targetFile}`;
        } catch (error) {
            if (error.message.includes('not found') ||
                error.message.includes('cancelled') ||
                error.message.includes('already exists')) {
                throw error;
            }
            throw new Error(`Error modifying JavaScript: ${error.message}`);
        }
    }

    async js_remove_variable(className, variableName) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!variableName || typeof variableName !== 'string') {
            throw new Error('Variable name is required');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find and remove the variable
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let variableStart = -1;
            let variableEnd = -1;
            let foundVariable = false;
            let isPrivate = false;
            let isStatic = false;

            const findVariable = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    // Found the class, look for the variable
                    if (node.body && node.body.body) {
                        for (const member of node.body.body) {
                            if (member.type === 'ClassProperty' || member.type === 'ClassPrivateProperty') {
                                const memberName = member.key?.name || member.key?.id?.name;

                                // Check if this is our variable (handle private fields)
                                if (memberName === variableName ||
                                    memberName === '#' + variableName ||
                                    (variableName.startsWith('#') && memberName === variableName.substring(1))) {
                                    foundVariable = true;
                                    variableStart = member.start;
                                    variableEnd = member.end;
                                    isPrivate = member.type === 'ClassPrivateProperty' || memberName.startsWith('#');
                                    isStatic = member.static;
                                    break;
                                }
                            }
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findVariable(child));
                        } else {
                            findVariable(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findVariable(node));
            }

            if (!foundVariable) {
                throw new Error(`Variable "${variableName}" not found in class "${className}"`);
            }

            // Remove the variable and clean up whitespace
            const lines = content.split('\n');
            const startLine = content.substring(0, variableStart).split('\n').length - 1;
            const endLine = content.substring(0, variableEnd).split('\n').length - 1;

            // Remove the lines containing the variable
            let newLines = [...lines];

            // If the variable spans multiple lines, remove all of them
            newLines.splice(startLine, endLine - startLine + 1);

            // Clean up extra blank lines if we created any
            for (let i = startLine; i < newLines.length - 1; i++) {
                if (newLines[i] === '' && newLines[i + 1] === '') {
                    newLines.splice(i, 1);
                    i--;
                }
            }

            const newContent = newLines.join('\n');

            // Save the modified file
            await this.fileSystem.saveFile(targetFile, newContent, 'file');

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            let description = isStatic ? 'static ' : '';
            description += isPrivate ? 'private ' : 'public ';
            description += `variable "${variableName}"`;

            return `Successfully removed ${description} from class "${className}" in ${targetFile}`;
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('cancelled')) {
                throw error;
            }
            throw new Error(`Error modifying JavaScript: ${error.message}`);
        }
    }

    async js_get_variable(className, variableName) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            return '';
        }
        if (!variableName || typeof variableName !== 'string') {
            return '';
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            return '';  // Class not found
        }

        // Check if the JavaScript file is open in a tab (for get, we just need to handle dirty state)
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                        // Re-read the file after saving
                        file = await this.fileSystem.getFile(targetFile);
                    }
                    // If 'discard', continue with the file system version
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find the variable
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let variableCode = '';

            const findVariable = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    // Found the class, look for the variable
                    if (node.body && node.body.body) {
                        for (const member of node.body.body) {
                            if (member.type === 'ClassProperty' || member.type === 'ClassPrivateProperty') {
                                const memberName = member.key?.name || member.key?.id?.name;

                                // Check if this is our variable (handle private fields)
                                if (memberName === variableName ||
                                    memberName === '#' + variableName ||
                                    (variableName.startsWith('#') && memberName === variableName.substring(1))) {
                                    // Extract the exact variable definition
                                    variableCode = content.substring(member.start, member.end);

                                    // Ensure it ends with semicolon if it doesn't
                                    if (!variableCode.trimEnd().endsWith(';')) {
                                        variableCode = variableCode.trimEnd() + ';';
                                    }

                                    // Trim any leading whitespace but preserve the definition
                                    variableCode = variableCode.trim();
                                    break;
                                }
                            }
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findVariable(child));
                        } else {
                            findVariable(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findVariable(node));
            }

            return variableCode;  // Will be empty string if not found
        } catch (error) {
            // Return empty string on parse errors
            return '';
        }
    }

    async js_create_function(className, functionName, isAsync = false, isStatic = false, isPrivate = false, isGetter = false, isSetter = false, parameters = '', functionBody = '') {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!functionName || typeof functionName !== 'string') {
            throw new Error('Function name is required');
        }

        // Validate function name format
        if (isPrivate && !functionName.startsWith('#')) {
            functionName = '#' + functionName;
        } else if (!isPrivate && functionName.startsWith('#')) {
            throw new Error('Public functions should not start with #');
        }

        // Validate function name (must be valid JavaScript identifier)
        const nameToValidate = isPrivate ? functionName.substring(1) : functionName;
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nameToValidate)) {
            throw new Error(`Invalid function name: ${functionName}. Must be a valid JavaScript identifier.`);
        }

        // Getters and setters cannot be async
        if ((isGetter || isSetter) && isAsync) {
            throw new Error('Getters and setters cannot be async');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find the class and add the function
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let classBodyEnd = -1;
            let classIndent = '';
            let lastMethodEnd = -1;

            const findClass = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    classBodyEnd = node.body.end - 1; // Before the closing brace

                    // Determine indentation
                    const lines = content.substring(0, node.start).split('\n');
                    const lastLine = lines[lines.length - 1];
                    classIndent = lastLine.match(/^(\s*)/)[1] || '';

                    // Check if function already exists
                    if (node.body && node.body.body) {
                        for (const member of node.body.body) {
                            if (member.type === 'ClassMethod') {
                                const memberName = member.key?.name || member.key?.id?.name;
                                if (memberName === functionName || memberName === functionName.replace('#', '')) {
                                    throw new Error(`Function "${functionName}" already exists in class "${className}"`);
                                }
                                // Track the last method position
                                if (member.end > lastMethodEnd) {
                                    lastMethodEnd = member.end;
                                }
                            }
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findClass(child));
                        } else {
                            findClass(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findClass(node));
            }

            if (classBodyEnd === -1) {
                throw new Error(`Class "${className}" not found in ${targetFile}`);
            }

            // Build the function declaration
            const methodIndent = classIndent + '    ';
            let functionDeclaration = '\n' + methodIndent;

            // Add modifiers
            if (isStatic) {
                functionDeclaration += 'static ';
            }
            if (isAsync && !isGetter && !isSetter) {
                functionDeclaration += 'async ';
            }
            if (isGetter) {
                functionDeclaration += 'get ';
            } else if (isSetter) {
                functionDeclaration += 'set ';
            }

            // Add function name and parameters
            functionDeclaration += functionName;

            // Getters don't have parameters, setters have exactly one
            if (isGetter) {
                functionDeclaration += '() {\n';
            } else if (isSetter) {
                const setterParam = parameters || 'value';
                functionDeclaration += `(${setterParam}) {\n`;
            } else {
                functionDeclaration += `(${parameters || ''}) {\n`;
            }

            // Add function body
            if (functionBody) {
                const bodyLines = functionBody.split('\n');
                bodyLines.forEach(line => {
                    if (line.trim()) {
                        functionDeclaration += methodIndent + '    ' + line + '\n';
                    }
                });
            } else {
                // Default body
                if (isGetter) {
                    functionDeclaration += methodIndent + '    // TODO: Implement getter\n';
                    functionDeclaration += methodIndent + '    return undefined;\n';
                } else if (isSetter) {
                    functionDeclaration += methodIndent + '    // TODO: Implement setter\n';
                } else {
                    functionDeclaration += methodIndent + '    // TODO: Implement function\n';
                }
            }

            functionDeclaration += methodIndent + '}\n';

            // Insert the function before the class closing brace
            const beforeEnd = content.substring(0, classBodyEnd);
            const afterEnd = content.substring(classBodyEnd);

            const newContent = beforeEnd + functionDeclaration + afterEnd;

            // Save the modified file
            await this.fileSystem.saveFile(targetFile, newContent, 'file');

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            let description = '';
            if (isStatic) description += 'static ';
            if (isAsync) description += 'async ';
            if (isPrivate) description += 'private ';
            if (isGetter) description += 'getter ';
            else if (isSetter) description += 'setter ';
            else description += 'function ';
            description += `"${functionName}"`;

            return `Successfully added ${description} to class "${className}" in ${targetFile}`;
        } catch (error) {
            if (error.message.includes('not found') ||
                error.message.includes('cancelled') ||
                error.message.includes('already exists')) {
                throw error;
            }
            throw new Error(`Error modifying JavaScript: ${error.message}`);
        }
    }

    async js_remove_function(className, functionName) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!functionName || typeof functionName !== 'string') {
            throw new Error('Function name is required');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find and remove the function
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let functionStart = -1;
            let functionEnd = -1;
            let foundFunction = false;
            let functionType = '';

            const findFunction = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    // Found the class, look for the function
                    if (node.body && node.body.body) {
                        for (const member of node.body.body) {
                            if (member.type === 'ClassMethod') {
                                const memberName = member.key?.name || member.key?.id?.name;

                                // Check if this is our function
                                if (memberName === functionName ||
                                    memberName === '#' + functionName ||
                                    (functionName.startsWith('#') && memberName === functionName.substring(1))) {
                                    foundFunction = true;
                                    functionStart = member.start;
                                    functionEnd = member.end;

                                    // Determine function type for reporting
                                    if (member.kind === 'get') functionType = 'getter';
                                    else if (member.kind === 'set') functionType = 'setter';
                                    else if (member.kind === 'constructor') functionType = 'constructor';
                                    else functionType = member.static ? 'static function' : 'function';

                                    break;
                                }
                            }
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findFunction(child));
                        } else {
                            findFunction(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findFunction(node));
            }

            if (!foundFunction) {
                throw new Error(`Function "${functionName}" not found in class "${className}"`);
            }

            // Remove the function and clean up whitespace
            const lines = content.split('\n');
            const startLine = content.substring(0, functionStart).split('\n').length - 1;
            const endLine = content.substring(0, functionEnd).split('\n').length - 1;

            // Remove the lines containing the function
            let newLines = [...lines];
            newLines.splice(startLine, endLine - startLine + 1);

            // Clean up extra blank lines if we created any
            for (let i = Math.max(0, startLine - 1); i < newLines.length - 1; i++) {
                if (newLines[i] === '' && newLines[i + 1] === '') {
                    newLines.splice(i, 1);
                    i--;
                }
            }

            const newContent = newLines.join('\n');

            // Save the modified file
            await this.fileSystem.saveFile(targetFile, newContent, 'file');

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            return `Successfully removed ${functionType} "${functionName}" from class "${className}" in ${targetFile}`;
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('cancelled')) {
                throw error;
            }
            throw new Error(`Error modifying JavaScript: ${error.message}`);
        }
    }

    async js_get_function(className, functionName) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!functionName || typeof functionName !== 'string') {
            throw new Error('Function name is required');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                        // Re-read the file after saving
                        file = await this.fileSystem.getFile(targetFile);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find the function
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let functionCode = '';

            const findFunction = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    // Found the class, look for the function
                    if (node.body && node.body.body) {
                        for (const member of node.body.body) {
                            if (member.type === 'ClassMethod') {
                                const memberName = member.key?.name || member.key?.id?.name;

                                // Check if this is our function
                                if (memberName === functionName ||
                                    memberName === '#' + functionName ||
                                    (functionName.startsWith('#') && memberName === functionName.substring(1))) {
                                    // Extract the function code
                                    functionCode = content.substring(member.start, member.end);
                                    break;
                                }
                            }
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findFunction(child));
                        } else {
                            findFunction(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findFunction(node));
            }

            if (!functionCode) {
                throw new Error(`Function "${functionName}" not found in class "${className}"`);
            }

            return functionCode;
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('cancelled')) {
                throw error;
            }
            throw new Error(`Error parsing JavaScript: ${error.message}`);
        }
    }

    async js_update_function(className, functionName, newFunctionCode) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!functionName || typeof functionName !== 'string') {
            throw new Error('Function name is required');
        }
        if (typeof newFunctionCode !== 'string') {
            throw new Error('New function code must be a string');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Parse the file to find and replace the function
        const content = file.content || '';

        try {
            // Parse with Babel
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let functionStart = -1;
            let functionEnd = -1;
            let foundFunction = false;
            let classIndent = '';

            const findFunction = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id.name === className) {
                    // Determine indentation
                    const lines = content.substring(0, node.start).split('\n');
                    const lastLine = lines[lines.length - 1];
                    classIndent = lastLine.match(/^(\s*)/)[1] || '';

                    // Found the class, look for the function
                    if (node.body && node.body.body) {
                        for (const member of node.body.body) {
                            if (member.type === 'ClassMethod') {
                                const memberName = member.key?.name || member.key?.id?.name;

                                // Check if this is our function
                                if (memberName === functionName ||
                                    memberName === '#' + functionName ||
                                    (functionName.startsWith('#') && memberName === functionName.substring(1))) {
                                    foundFunction = true;
                                    functionStart = member.start;
                                    functionEnd = member.end;
                                    break;
                                }
                            }
                        }
                    }
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findFunction(child));
                        } else {
                            findFunction(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findFunction(node));
            }

            if (!foundFunction) {
                throw new Error(`Function "${functionName}" not found in class "${className}"`);
            }

            // Clean up the new function code
            let cleanFunction = newFunctionCode.trim();

            // Apply proper indentation
            const methodIndent = classIndent + '    ';
            const indentedFunction = cleanFunction
                .split('\n')
                .map((line, index) => {
                    // Don't indent empty lines
                    if (line.trim() === '') return '';
                    // Apply the class method indentation
                    return methodIndent + line.trimStart();
                })
                .join('\n');

            // Replace the function
            const newContent = content.substring(0, functionStart) +
                              indentedFunction +
                              content.substring(functionEnd);

            // Save the modified file
            await this.fileSystem.saveFile(targetFile, newContent, 'file');

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            return `Successfully updated function "${functionName}" in class "${className}" in ${targetFile}`;
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('cancelled')) {
                throw error;
            }
            throw new Error(`Error modifying JavaScript: ${error.message}`);
        }
    }

    async js_get_class_info(className) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Analyze the file to get complete class information
        const content = file.content || '';
        const analysis = this.analyzeJavaScript(content, targetFile);
        const classInfo = analysis.classes.find(c => c.name === className);

        if (!classInfo) {
            throw new Error(`Class "${className}" not found in ${targetFile}`);
        }

        // Build comprehensive output
        let output = `Class: ${className}\n`;
        output += `File: ${targetFile}\n`;

        if (classInfo.superClass) {
            output += `Extends: ${classInfo.superClass}\n`;
        }

        output += '\n';

        // Private properties
        if (classInfo.privateProperties && classInfo.privateProperties.length > 0) {
            output += 'Private Properties:\n';
            classInfo.privateProperties.forEach(prop => {
                const prefix = prop.isStatic ? 'static ' : '';
                output += `  #${prefix}${prop.name}\n`;
            });
            output += '\n';
        }

        // Public properties
        if (classInfo.properties && classInfo.properties.length > 0) {
            output += 'Public Properties:\n';
            classInfo.properties.forEach(prop => {
                const prefix = prop.isStatic ? 'static ' : '';
                output += `  ${prefix}${prop.name}\n`;
            });
            output += '\n';
        }

        // Constructor
        const constructor = classInfo.methods.find(m => m.kind === 'constructor');
        if (constructor) {
            output += 'Constructor:\n';
            output += `  constructor(${constructor.params.join(', ')})\n\n`;
        }

        // Static getters
        if (classInfo.staticGetters && classInfo.staticGetters.length > 0) {
            output += 'Static Getters:\n';
            classInfo.staticGetters.forEach(getter => {
                output += `  static get ${getter.name}\n`;
            });
            output += '\n';
        }

        // Static setters
        if (classInfo.staticSetters && classInfo.staticSetters.length > 0) {
            output += 'Static Setters:\n';
            classInfo.staticSetters.forEach(setter => {
                output += `  static set ${setter.name}(${setter.params.join(', ')})\n`;
            });
            output += '\n';
        }

        // Static methods
        if (classInfo.staticMethods && classInfo.staticMethods.length > 0) {
            output += 'Static Methods:\n';
            classInfo.staticMethods.forEach(method => {
                const asyncMark = method.isAsync ? 'async ' : '';
                const generatorMark = method.isGenerator ? '*' : '';
                output += `  static ${asyncMark}${generatorMark}${method.name}(${method.params.join(', ')})\n`;
            });
            output += '\n';
        }

        // Instance getters
        if (classInfo.getters && classInfo.getters.length > 0) {
            output += 'Getters:\n';
            classInfo.getters.forEach(getter => {
                output += `  get ${getter.name}\n`;
            });
            output += '\n';
        }

        // Instance setters
        if (classInfo.setters && classInfo.setters.length > 0) {
            output += 'Setters:\n';
            classInfo.setters.forEach(setter => {
                output += `  set ${setter.name}(${setter.params.join(', ')})\n`;
            });
            output += '\n';
        }

        // Instance methods (excluding constructor)
        const instanceMethods = classInfo.methods.filter(m => m.kind !== 'constructor');
        if (instanceMethods.length > 0) {
            output += 'Methods:\n';
            instanceMethods.forEach(method => {
                const asyncMark = method.isAsync ? 'async ' : '';
                const generatorMark = method.isGenerator ? '*' : '';
                output += `  ${asyncMark}${generatorMark}${method.name}(${method.params.join(', ')})\n`;
            });
            output += '\n';
        }

        // Summary
        const totalMembers = (classInfo.privateProperties?.length || 0) +
                           (classInfo.properties?.length || 0) +
                           (classInfo.methods?.length || 0) +
                           (classInfo.staticMethods?.length || 0) +
                           (classInfo.getters?.length || 0) +
                           (classInfo.setters?.length || 0) +
                           (classInfo.staticGetters?.length || 0) +
                           (classInfo.staticSetters?.length || 0);

        output += `Total Members: ${totalMembers}`;

        return output;
    }

    async js_get_class_list() {
        // Get all JavaScript files
        const files = await this.fileSystem.getAllFiles();
        const jsFiles = files.filter(file =>
            file.type === 'file' &&
            file.path.endsWith('.js') &&
            !file.path.includes('node_modules')
        );

        if (jsFiles.length === 0) {
            return 'No JavaScript files found in the workspace.';
        }

        const allClasses = [];

        // Process each JavaScript file
        for (const file of jsFiles) {
            try {
                const content = await this.read_file(file.path);
                const analysis = this.analyzeJavaScript(content, file.path);

                // Collect all classes with their file paths
                for (const classInfo of analysis.classes) {
                    allClasses.push({
                        name: classInfo.name,
                        file: file.path,
                        extends: classInfo.superClass || null
                    });
                }
            } catch (error) {
                // Skip files that can't be analyzed
                continue;
            }
        }

        if (allClasses.length === 0) {
            return 'No classes found in JavaScript files.';
        }

        // Sort classes by name
        allClasses.sort((a, b) => a.name.localeCompare(b.name));

        // Build output
        let output = 'JavaScript Classes in Workspace\n';
        output += '================================\n\n';

        for (const classInfo of allClasses) {
            output += `${classInfo.name}`;
            if (classInfo.extends) {
                output += ` (extends ${classInfo.extends})`;
            }
            output += `\n  File: ${classInfo.file}\n\n`;
        }

        output += '----------------------------\n';
        output += `Total Classes: ${allClasses.length}\n`;
        output += `Total Files: ${jsFiles.length}\n`;

        return output;
    }

    // Simpler, more concise class listing (alias for js_get_class_list with different formatting)
    async js_list_classes() {
        // Get all JavaScript files
        const files = await this.fileSystem.getAllFiles();
        const jsFiles = files.filter(file =>
            file.type === 'file' &&
            file.path.endsWith('.js') &&
            !file.path.includes('node_modules')
        );

        if (jsFiles.length === 0) {
            return 'No JavaScript files found in the workspace.';
        }

        const allClasses = [];

        // Process each JavaScript file
        for (const file of jsFiles) {
            try {
                const content = await this.read_file(file.path);
                const analysis = this.analyzeJavaScript(content, file.path);

                // Collect all classes with their file paths
                for (const classInfo of analysis.classes) {
                    allClasses.push({
                        name: classInfo.name,
                        file: file.path,
                        extends: classInfo.superClass || null
                    });
                }
            } catch (error) {
                // Skip files that can't be analyzed
                continue;
            }
        }

        if (allClasses.length === 0) {
            return 'No classes found in JavaScript files.';
        }

        // Sort classes by name
        allClasses.sort((a, b) => a.name.localeCompare(b.name));

        // Build concise bullet-point output
        let output = 'JavaScript Classes:\n\n';

        for (const classInfo of allClasses) {
            output += `• ${classInfo.name}`;
            if (classInfo.extends) {
                output += ` extends ${classInfo.extends}`;
            }
            output += '\n';
        }

        output += `\nTotal: ${allClasses.length} classes in ${jsFiles.length} files`;

        return output;
    }

    async js_rename_function(className, oldFunctionName, newFunctionName) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!oldFunctionName || typeof oldFunctionName !== 'string') {
            throw new Error('Old function name is required');
        }
        if (!newFunctionName || typeof newFunctionName !== 'string') {
            throw new Error('New function name is required');
        }

        // Validate new function name format
        const isPrivate = oldFunctionName.startsWith('#') || newFunctionName.startsWith('#');
        if (isPrivate) {
            // Ensure consistency - both should have # or neither
            if (!newFunctionName.startsWith('#')) {
                newFunctionName = '#' + newFunctionName;
            }
            if (!oldFunctionName.startsWith('#')) {
                oldFunctionName = '#' + oldFunctionName;
            }
        }

        // Validate function name (must be valid JavaScript identifier)
        const nameToValidate = newFunctionName.startsWith('#') ? newFunctionName.substring(1) : newFunctionName;
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nameToValidate)) {
            throw new Error(`Invalid function name: ${newFunctionName}. Must be a valid JavaScript identifier.`);
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Get the function code first
        let functionCode = '';
        try {
            functionCode = await this.js_get_function(className, oldFunctionName);
        } catch (error) {
            throw new Error(`Function "${oldFunctionName}" not found in class "${className}"`);
        }

        // Replace the old function name with the new one in the function code
        // We need to be careful to only replace the function name, not occurrences in the body
        const cleanOldName = oldFunctionName.replace('#', '');
        const cleanNewName = newFunctionName.replace('#', '');

        // Use regex to replace only the function declaration name
        let updatedFunctionCode = functionCode;

        // Handle different function types
        const patterns = [
            // Regular methods: functionName(
            new RegExp(`\\b${cleanOldName}\\s*\\(`, 'g'),
            // Getters: get functionName
            new RegExp(`\\bget\\s+${cleanOldName}\\b`, 'g'),
            // Setters: set functionName
            new RegExp(`\\bset\\s+${cleanOldName}\\b`, 'g'),
            // Private methods with #
            new RegExp(`#${cleanOldName}\\s*\\(`, 'g'),
            // Static methods
            new RegExp(`\\bstatic\\s+(async\\s+)?${cleanOldName}\\s*\\(`, 'g'),
        ];

        // Apply the first matching pattern
        for (const pattern of patterns) {
            if (pattern.test(functionCode)) {
                updatedFunctionCode = functionCode.replace(pattern, (match) => {
                    return match.replace(cleanOldName, cleanNewName);
                });
                break;
            }
        }

        // Update the function with the renamed version
        await this.js_update_function(className, oldFunctionName, updatedFunctionCode);

        return `Successfully renamed function "${oldFunctionName}" to "${newFunctionName}" in class "${className}"`;
    }

    async js_rename_variable(className, oldVariableName, newVariableName) {
        // Validate inputs
        if (!className || typeof className !== 'string') {
            throw new Error('Class name is required');
        }
        if (!oldVariableName || typeof oldVariableName !== 'string') {
            throw new Error('Old variable name is required');
        }
        if (!newVariableName || typeof newVariableName !== 'string') {
            throw new Error('New variable name is required');
        }

        // Handle private variable naming
        const isPrivate = oldVariableName.startsWith('#') || newVariableName.startsWith('#');
        if (isPrivate) {
            // Ensure consistency - both should have # or neither
            if (!newVariableName.startsWith('#')) {
                newVariableName = '#' + newVariableName;
            }
            if (!oldVariableName.startsWith('#')) {
                oldVariableName = '#' + oldVariableName;
            }
        }

        // Validate variable name (must be valid JavaScript identifier)
        const nameToValidate = newVariableName.startsWith('#') ? newVariableName.substring(1) : newVariableName;
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nameToValidate)) {
            throw new Error(`Invalid variable name: ${newVariableName}. Must be a valid JavaScript identifier.`);
        }

        // First try to find the class in a file named after it
        let targetFile = `/${className}.js`;
        let file = await this.fileSystem.getFile(targetFile);

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === className);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${className}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Get the variable definition first
        let variableCode = '';
        try {
            variableCode = await this.js_get_variable(className, oldVariableName);
        } catch (error) {
            // Try without the # if it's a private variable
            if (oldVariableName.startsWith('#')) {
                try {
                    variableCode = await this.js_get_variable(className, oldVariableName.substring(1));
                } catch (e) {
                    throw new Error(`Variable "${oldVariableName}" not found in class "${className}"`);
                }
            } else {
                throw new Error(`Variable "${oldVariableName}" not found in class "${className}"`);
            }
        }

        if (!variableCode) {
            throw new Error(`Variable "${oldVariableName}" not found in class "${className}"`);
        }

        // Replace the old variable name with the new one
        const cleanOldName = oldVariableName.replace('#', '');
        const cleanNewName = newVariableName.replace('#', '');

        // Build the new variable declaration
        let updatedVariableCode = variableCode;

        // Handle different variable declaration patterns
        if (isPrivate) {
            // Replace #oldName with #newName
            updatedVariableCode = variableCode.replace(
                new RegExp(`#${cleanOldName}\\b`, 'g'),
                `#${cleanNewName}`
            );
        } else {
            // Replace oldName with newName (being careful with word boundaries)
            updatedVariableCode = variableCode.replace(
                new RegExp(`\\b${cleanOldName}\\b`, 'g'),
                newVariableName
            );
        }

        // Remove the old variable and add the new one
        await this.js_remove_variable(className, oldVariableName);

        // Parse the updated variable code to extract modifiers and initializer
        let isStatic = false;
        let initializer = 'null';

        // Check if it's static
        if (updatedVariableCode.includes('static ')) {
            isStatic = true;
        }

        // Extract initializer
        const initMatch = updatedVariableCode.match(/=\s*(.+);?\s*$/);
        if (initMatch) {
            initializer = initMatch[1].trim().replace(/;$/, '');
        }

        // Add the renamed variable
        await this.js_create_variable(className, newVariableName, isStatic, isPrivate, initializer);

        return `Successfully renamed variable "${oldVariableName}" to "${newVariableName}" in class "${className}"`;
    }

    async js_rename_class(oldClassName, newClassName) {
        // Validate inputs
        if (!oldClassName || typeof oldClassName !== 'string') {
            throw new Error('Old class name is required');
        }
        if (!newClassName || typeof newClassName !== 'string') {
            throw new Error('New class name is required');
        }

        // Validate class name format (must be valid JavaScript identifier)
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(newClassName)) {
            throw new Error(`Invalid class name: ${newClassName}. Must be a valid JavaScript identifier.`);
        }

        // First try to find the class in a file named after it
        let targetFile = `/${oldClassName}.js`;
        let file = await this.fileSystem.getFile(targetFile);
        let shouldRenameFile = !!file; // Track if we found it in a file with matching name

        // If not found, search all JavaScript files
        if (!file) {
            const files = await this.fileSystem.getAllFiles();
            const jsFiles = files.filter(f =>
                f.type === 'file' &&
                f.path.endsWith('.js') &&
                !f.path.includes('node_modules')
            );

            // Search for the class in all JS files
            for (const jsFile of jsFiles) {
                try {
                    const content = await this.read_file(jsFile.path);
                    const analysis = this.analyzeJavaScript(content, jsFile.path);

                    const foundClass = analysis.classes.find(c => c.name === oldClassName);
                    if (foundClass) {
                        targetFile = jsFile.path;
                        file = jsFile;
                        shouldRenameFile = false; // Don't rename file if it doesn't match class name
                        break;
                    }
                } catch (error) {
                    // Skip files that can't be analyzed
                    continue;
                }
            }
        }

        if (!file) {
            throw new Error(`Class "${oldClassName}" not found in any JavaScript file`);
        }

        // Check if the JavaScript file is open in a tab
        if (window.tabManager) {
            const openTab = window.tabManager.tabs.find(tab => tab.path === targetFile);
            if (openTab) {
                const tabId = openTab.id;
                const isDirty = window.tabManager.dirtyFiles.has(tabId);

                if (isDirty) {
                    const fileName = targetFile.split('/').pop();
                    const result = await window.tabManager.showSaveDialog(fileName);

                    if (result === 'cancel') {
                        throw new Error(`Operation cancelled - file has unsaved changes`);
                    } else if (result === 'save') {
                        await window.tabManager.saveFile(tabId);
                    }
                }

                // Close the tab to avoid conflicts
                await window.tabManager.closeTab(tabId, true);
            }
        }

        // Read the file content
        const content = file.content || '';

        try {
            // Parse with Babel to accurately find and replace the class name
            const ast = window.Babel.transform(content, {
                ast: true,
                code: false
            }).ast;

            let classDeclarationStart = -1;
            let classNameStart = -1;
            let classNameEnd = -1;

            const findClass = (node) => {
                if (!node) return;

                if (node.type === 'ClassDeclaration' && node.id && node.id.name === oldClassName) {
                    classDeclarationStart = node.start;
                    classNameStart = node.id.start;
                    classNameEnd = node.id.end;
                    return;
                }

                // Recursively traverse
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(child => findClass(child));
                        } else {
                            findClass(node[key]);
                        }
                    }
                }
            };

            // Start traversal
            if (ast.program && ast.program.body) {
                ast.program.body.forEach(node => findClass(node));
            }

            if (classNameStart === -1) {
                throw new Error(`Class declaration for "${oldClassName}" not found in ${targetFile}`);
            }

            // Replace the class name in the declaration
            let newContent = content.substring(0, classNameStart) +
                           newClassName +
                           content.substring(classNameEnd);

            // Also replace any references to the class within the file
            // This is a simple replacement - a more sophisticated version would use AST
            const classNameRegex = new RegExp(`\\b${oldClassName}\\b`, 'g');

            // Count how many replacements we'll make (excluding the declaration we already did)
            const matches = newContent.match(classNameRegex);
            const additionalReplacements = matches ? matches.length : 0;

            // Replace all occurrences
            newContent = newContent.replace(classNameRegex, newClassName);

            // Save the modified content to the same file first
            await this.fileSystem.saveFile(targetFile, newContent, 'file');

            let resultMessage = `Successfully renamed class "${oldClassName}" to "${newClassName}" in ${targetFile}`;
            if (additionalReplacements > 0) {
                resultMessage += ` (${additionalReplacements} additional reference(s) updated)`;
            }

            // If the file was named after the class, rename the file too
            if (shouldRenameFile) {
                const newFilePath = `/${newClassName}.js`;

                // Check if target file already exists
                const existingNewFile = await this.fileSystem.getFile(newFilePath);
                if (existingNewFile) {
                    resultMessage += `\nWarning: Could not rename file to ${newFilePath} - file already exists`;
                } else {
                    // Use our existing rename_file method
                    await this.rename_file(targetFile, newFilePath);
                    resultMessage += `\nFile renamed from ${targetFile} to ${newFilePath}`;
                }
            }

            // Refresh the file tree if available
            if (window.fileBrowser) {
                await window.fileBrowser.refreshFileTree();
            }

            return resultMessage;
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('cancelled')) {
                throw error;
            }
            throw new Error(`Error renaming class: ${error.message}`);
        }
    }
} 
