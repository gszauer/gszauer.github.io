class ErrorModalDialog extends Modal {
    constructor(errorMessage) {
        super('Runtime Error');
        
        this.div.innerHTML = `
            <div style="padding: 10px;">
                <p style="margin: 0; color: #ff6b6b; font-weight: 500; margin-bottom: 10px;">
                    ⚠️ Error
                </p>
                <p style="margin: 0; color: var(--text-primary); line-height: 1.5;">
                    ${errorMessage}
                </p>
            </div>
        `;
    }
}

class DeleteConfirmModal extends Modal {
    constructor(assetName, onConfirm, onCancel) {
        super('Confirm Delete', 350, 220);
        
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        
        // Remove the close button
        const closeButton = this.element.querySelector('.modal-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
        
        this.div.innerHTML = `
            <div class="delete-confirm-modal">
                <p class="delete-confirm-message">
                    Are you sure you want to delete<br>
                    <strong>${assetName}</strong>?
                </p>
                <div class="modal-buttons">
                    <button class="modal-button modal-button-danger" id="delete-confirm-yes">Yes</button>
                    <button class="modal-button modal-button-secondary" id="delete-confirm-no">No</button>
                </div>
            </div>
        `;
        
        // Add event listeners after DOM is created
        setTimeout(() => {
            const yesBtn = document.getElementById('delete-confirm-yes');
            const noBtn = document.getElementById('delete-confirm-no');
            
            if (yesBtn) {
                yesBtn.addEventListener('click', () => {
                    if (this.onConfirm) this.onConfirm();
                    this.close();
                });
            }
            
            if (noBtn) {
                noBtn.addEventListener('click', () => {
                    if (this.onCancel) this.onCancel();
                    this.close();
                });
            }
        }, 50);
    }
}

class SaveChangesModal extends Modal {
    constructor(sceneName, onSave, onDontSave, onCancel) {
        super('Save Changes?', 400, 240);
        
        this.onSave = onSave;
        this.onDontSave = onDontSave;
        this.onCancel = onCancel;
        
        // Remove the close button
        const closeButton = this.element.querySelector('.modal-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
        
        this.div.innerHTML = `
            <div class="save-changes-modal">
                <p class="save-changes-message">
                    Do you want to save changes to<br>
                    <strong>${sceneName || 'the current scene'}</strong>?
                </p>
                <p class="save-changes-note">
                    Your changes will be lost if you don't save them.
                </p>
                <div class="modal-buttons">
                    <button class="modal-button modal-button-primary" id="save-changes-save">Save</button>
                    <button class="modal-button modal-button-secondary" id="save-changes-dont">Don't Save</button>
                    <button class="modal-button modal-button-secondary" id="save-changes-cancel">Cancel</button>
                </div>
            </div>
        `;
        
        // Add event listeners after DOM is created
        setTimeout(() => {
            const saveBtn = document.getElementById('save-changes-save');
            const dontBtn = document.getElementById('save-changes-dont');
            const cancelBtn = document.getElementById('save-changes-cancel');
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    if (this.onSave) this.onSave();
                    this.close();
                });
            }
            
            if (dontBtn) {
                dontBtn.addEventListener('click', () => {
                    if (this.onDontSave) this.onDontSave();
                    this.close();
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (this.onCancel) this.onCancel();
                    this.close();
                });
            }
        }, 50);
    }
}

class RenameModal extends Modal {
    constructor(currentName, onRename, onCancel) {
        super('Rename', 400, 210);
        
        this.onRename = onRename;
        this.onCancel = onCancel;
        this.currentName = currentName;
        
        // Remove the close button
        const closeButton = this.element.querySelector('.modal-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
        
        this.div.innerHTML = `
            <div class="rename-modal">
                <div class="modal-input-group">
                    <label class="modal-label">Name:</label>
                    <input type="text" class="modal-input" id="rename-input" value="${currentName}" />
                </div>
                <div class="modal-buttons">
                    <button class="modal-button modal-button-primary" id="rename-ok">OK</button>
                    <button class="modal-button modal-button-secondary" id="rename-cancel">Cancel</button>
                </div>
            </div>
        `;
        
        // Add event listeners and focus after DOM is created
        setTimeout(() => {
            const input = document.getElementById('rename-input');
            const okBtn = document.getElementById('rename-ok');
            const cancelBtn = document.getElementById('rename-cancel');
            
            if (input) {
                // Select all text and focus
                input.select();
                input.focus();
                
                // Handle Enter key
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this._handleRename();
                    } else if (e.key === 'Escape') {
                        this._handleCancel();
                    }
                });
            }
            
            if (okBtn) {
                okBtn.addEventListener('click', () => this._handleRename());
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this._handleCancel());
            }
        }, 50);
    }
    
    _handleRename() {
        const input = document.getElementById('rename-input');
        if (input && input.value && input.value !== this.currentName) {
            if (this.onRename) this.onRename(input.value);
        }
        this.close();
    }
    
    _handleCancel() {
        if (this.onCancel) this.onCancel();
        this.close();
    }
}

class NewFileModal extends Modal {
    constructor(fileTree, onCreate, onCancel) {
        super('New File', 400, 240);
        
        this.fileTree = fileTree;
        this.onCreate = onCreate;
        this.onCancel = onCancel;
        
        // Remove the close button
        const closeButton = this.element.querySelector('.modal-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
        
        this.div.innerHTML = `
            <div class="new-file-modal">
                <div class="modal-input-group">
                    <label class="modal-label">File name:</label>
                    <input type="text" class="modal-input" id="new-file-name" placeholder="filename.js" />
                </div>
                <div class="modal-row">
                    <div class="modal-dropdown-group">
                        <label class="modal-label">File type:</label>
                        <select class="modal-dropdown" id="new-file-type">
                            <option value=".js">.js</option>
                            <option value=".json">.json</option>
                            <option value=".scn.json">.scn (Scene)</option>
                            <option value=".fab.json">.fab (Prefab)</option>
                        </select>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-button modal-button-primary" id="new-file-ok">OK</button>
                        <button class="modal-button modal-button-secondary" id="new-file-cancel">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners after DOM is created
        setTimeout(() => {
            const nameInput = document.getElementById('new-file-name');
            const typeSelect = document.getElementById('new-file-type');
            const okBtn = document.getElementById('new-file-ok');
            const cancelBtn = document.getElementById('new-file-cancel');
            
            if (nameInput) {
                nameInput.focus();
                
                // Handle Enter key
                nameInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this._handleCreate();
                    } else if (e.key === 'Escape') {
                        this._handleCancel();
                    }
                });
            }
            
            if (okBtn) {
                okBtn.addEventListener('click', () => this._handleCreate());
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this._handleCancel());
            }
        }, 50);
    }
    
    _handleCreate() {
        const nameInput = document.getElementById('new-file-name');
        const typeSelect = document.getElementById('new-file-type');
        
        if (nameInput && nameInput.value) {
            let fileName = nameInput.value.trim();
            const fileType = typeSelect ? typeSelect.value : '.js';
            
            // Add extension if not present
            if (!fileName.includes('.')) {
                fileName += fileType;
            }
            
            // Determine target directory
            let targetDir = '/';
            if (this.fileTree && this.fileTree.selectedPath) {
                const selectedPath = this.fileTree.selectedPath;
                const selectedElement = this.fileTree.selectedElement;
                
                // Check if selected item is a directory or file
                if (selectedElement && selectedElement.classList.contains('file-tree-folder')) {
                    targetDir = selectedPath;
                } else {
                    // If it's a file, get its parent directory
                    const lastSlash = selectedPath.lastIndexOf('/');
                    targetDir = lastSlash > 0 ? selectedPath.substring(0, lastSlash) : '/';
                }
            }
            
            // Ensure targetDir ends with /
            if (!targetDir.endsWith('/')) {
                targetDir += '/';
            }
            
            const fullPath = targetDir + fileName;
            
            if (this.onCreate) {
                this.onCreate(fullPath);
            }
            
            // If it's a scene file, create initial scene data
            if (fileName.endsWith('.scn.json') && this.fileTree && this.fileTree.fs) {
                const initialSceneData = {
                    version: "2.0.0",
                    metadata: {
                        created: new Date().toISOString(),
                        modified: new Date().toISOString()
                    },
                    settings: {
                        backgroundColor: 0x1e1e1e
                    },
                    assets: {
                        textures: [],
                        fonts: []
                    },
                    roots: []
                };
                
                // Write initial scene data
                this.fileTree.fs.writeFile(fullPath, JSON.stringify(initialSceneData, null, 2), 'utf8', (err) => {
                    if (!err) {
                        console.log(`Created new scene file: ${fullPath}`);
                    }
                });
            }
        }
        this.close();
    }
    
    _handleCancel() {
        if (this.onCancel) this.onCancel();
        this.close();
    }
}

class UploadFileModal extends Modal {
    constructor(fileTree, onUpload, onCancel) {
        super('Import Files', 450, 220);
        
        this.fileTree = fileTree;
        this.onUpload = onUpload;
        this.onCancel = onCancel;
        this.selectedFiles = [];
        this.baseHeight = 220;
        
        // Remove the close button
        const closeButton = this.element.querySelector('.modal-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
        
        this.div.innerHTML = `
            <div class="upload-file-modal">
                <div class="upload-content">
                    <div class="file-input-group">
                        <label class="file-input-label">
                            <input type="file" id="file-input" multiple class="file-input-hidden" />
                            <span class="file-input-button">Browse Files...</span>
                            <span class="file-input-text" id="file-input-text">No files selected</span>
                        </label>
                    </div>
                    <div class="selected-files" id="selected-files"></div>
                </div>
                <div class="modal-buttons-right">
                    <button class="modal-button modal-button-primary" id="upload-files" disabled>Import</button>
                    <button class="modal-button modal-button-secondary" id="cancel-upload">Cancel</button>
                </div>
            </div>
        `;
        
        // Add event listeners after DOM is created
        setTimeout(() => {
            const fileInput = document.getElementById('file-input');
            const fileInputText = document.getElementById('file-input-text');
            const selectedFilesDiv = document.getElementById('selected-files');
            const uploadBtn = document.getElementById('upload-files');
            const cancelBtn = document.getElementById('cancel-upload');
            
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                        this.selectedFiles = this.selectedFiles.concat(files);
                        this._updateFileList();
                        uploadBtn.disabled = false;
                    }
                });
            }
            
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => this._handleUpload());
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this._handleCancel());
            }
        }, 50);
    }
    
    _updateFileList() {
        const fileInputText = document.getElementById('file-input-text');
        const selectedFilesDiv = document.getElementById('selected-files');
        
        if (this.selectedFiles.length === 0) {
            fileInputText.textContent = 'No files selected';
            selectedFilesDiv.innerHTML = '';
            this._adjustModalHeight(0);
        } else {
            fileInputText.textContent = `${this.selectedFiles.length} file(s) selected`;
            
            selectedFilesDiv.innerHTML = this.selectedFiles.map((file, index) => `
                <div class="selected-file-item">
                    <span class="selected-file-name">${file.name}</span>
                    <span class="selected-file-size">(${this._formatFileSize(file.size)})</span>
                    <button class="remove-file-btn" data-index="${index}">×</button>
                </div>
            `).join('');
            
            // Adjust modal height based on number of files (max 3 visible)
            const visibleCount = Math.min(this.selectedFiles.length, 3);
            this._adjustModalHeight(visibleCount);
            
            // Add remove handlers
            selectedFilesDiv.querySelectorAll('.remove-file-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.selectedFiles.splice(index, 1);
                    this._updateFileList();
                    
                    const uploadBtn = document.getElementById('upload-files');
                    if (this.selectedFiles.length === 0) {
                        uploadBtn.disabled = true;
                    }
                });
            });
        }
    }
    
    _adjustModalHeight(fileCount) {
        // Base height is 220px, add 50px per visible file item
        const newHeight = this.baseHeight + (fileCount * 50);
        this.element.style.height = `${newHeight}px`;
    }
    
    _formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    async _handleUpload() {
        if (this.selectedFiles.length === 0) return;
        
        // Determine target directory
        let targetDir = '/';
        if (this.fileTree && this.fileTree.selectedPath) {
            const selectedPath = this.fileTree.selectedPath;
            const selectedElement = this.fileTree.selectedElement;
            
            // Check if selected item is a directory or file
            if (selectedElement && selectedElement.classList.contains('file-tree-folder')) {
                targetDir = selectedPath;
            } else {
                // If it's a file, get its parent directory
                const lastSlash = selectedPath.lastIndexOf('/');
                targetDir = lastSlash > 0 ? selectedPath.substring(0, lastSlash) : '/';
            }
        }
        
        // Ensure targetDir ends with /
        if (!targetDir.endsWith('/')) {
            targetDir += '/';
        }
        
        // Replace buttons with progress bars
        const modalContent = document.querySelector('.upload-content');
        const buttonRow = document.querySelector('.modal-buttons-right');
        
        buttonRow.style.display = 'none';
        
        modalContent.innerHTML = `
            <div class="upload-progress-container">
                <div class="upload-progress-title">Uploading files...</div>
                <div class="upload-progress-list" id="upload-progress-list"></div>
            </div>
        `;
        
        const progressList = document.getElementById('upload-progress-list');
        
        // Create progress bars for each file
        this.selectedFiles.forEach((file, index) => {
            const progressItem = document.createElement('div');
            progressItem.className = 'upload-progress-item';
            progressItem.innerHTML = `
                <div class="upload-progress-name">${file.name}</div>
                <div class="upload-progress-bar">
                    <div class="upload-progress-fill" id="progress-${index}" style="width: 0%"></div>
                </div>
            `;
            progressList.appendChild(progressItem);
        });
        
        // Upload files
        if (this.onUpload) {
            await this.onUpload(this.selectedFiles, targetDir, (fileIndex, progress) => {
                // Update progress callback
                const progressBar = document.getElementById(`progress-${fileIndex}`);
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            });
        }
        
        // Close modal after all uploads complete
        setTimeout(() => {
            this.close();
        }, 500);
    }
    
    _handleCancel() {
        if (this.onCancel) this.onCancel();
        this.close();
    }
}
