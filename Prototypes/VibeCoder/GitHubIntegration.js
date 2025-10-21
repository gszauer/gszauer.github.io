// GitHub Integration
class GitHubIntegration {
    constructor(fileSystem, fileBrowser) {
        this.fileSystem = fileSystem;
        this.fileBrowser = fileBrowser;
        this.token = localStorage.getItem('github_token') || '';
        this.selectedOwner = localStorage.getItem('github_owner') || '';
        this.selectedRepo = localStorage.getItem('github_repo') || '';
        this.selectedBranch = localStorage.getItem('github_branch') || '';
        this.isConnected = false;

        this.tokenInput = document.getElementById('githubToken');
        this.ownerSelect = document.getElementById('ownerSelect');
        this.repoSelect = document.getElementById('repoSelect');
        this.branchSelect = document.getElementById('branchSelect');
        this.pullBtn = document.getElementById('pullBtn');
        this.pushBtn = document.getElementById('pushBtn');

        this.allRepos = [];

        this.setupEventListeners();
        this.loadToken();
    }

    setupEventListeners() {
        document.getElementById('saveGithubToken').addEventListener('click', () => {
            this.saveToken();
        });

        this.ownerSelect.addEventListener('change', () => {
            this.onOwnerSelect();
        });

        this.repoSelect.addEventListener('change', () => {
            this.onRepoSelect();
        });

        this.branchSelect.addEventListener('change', () => {
            this.onBranchSelect();
        });

        this.pullBtn.addEventListener('click', () => {
            this.pullFromGitHub();
        });

        this.pushBtn.addEventListener('click', () => {
            this.pushToGitHub();
        });
    }

    loadToken() {
        if (this.token) {
            this.tokenInput.value = this.token;
            this.connectToGitHub();
        }
    }

    async saveToken() {
        this.token = this.tokenInput.value;
        localStorage.setItem('github_token', this.token);

        if (this.token) {
            await this.connectToGitHub();
        } else {
            this.disconnectGitHub();
        }
    }

    async connectToGitHub() {
        const connectBtn = document.getElementById('saveGithubToken');

        try {
            // Disable button while connecting
            connectBtn.disabled = true;
            connectBtn.textContent = 'Connecting...';

            await this.fetchRepos();
            this.isConnected = true;
            this.updateStatusIndicator();

            // Try to restore previous selections
            if (this.selectedOwner) {
                this.ownerSelect.value = this.selectedOwner;
                await this.onOwnerSelect();

                if (this.selectedRepo) {
                    // Find the full repo name
                    const fullRepoName = this.allRepos.find(r =>
                        r.full_name === this.selectedRepo ||
                        r.name === this.selectedRepo
                    )?.full_name;

                    if (fullRepoName) {
                        this.repoSelect.value = fullRepoName;
                        await this.onRepoSelect();

                        if (this.selectedBranch) {
                            this.branchSelect.value = this.selectedBranch;
                            this.onBranchSelect();
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to connect to GitHub:', error);
            this.isConnected = false;
            this.updateStatusIndicator();
        } finally {
            // Re-enable button
            connectBtn.disabled = false;
            connectBtn.textContent = 'Connect';
        }
    }

    disconnectGitHub() {
        this.isConnected = false;
        this.ownerSelect.innerHTML = '<option value="">Select User/Org</option>';
        this.ownerSelect.disabled = true;
        this.repoSelect.innerHTML = '<option value="">Select Repository</option>';
        this.repoSelect.disabled = true;
        this.branchSelect.innerHTML = '<option value="">Select Branch</option>';
        this.branchSelect.disabled = true;
        this.pullBtn.disabled = true;
        this.pushBtn.disabled = true;
        this.updateStatusIndicator();
    }

    updateStatusIndicator() {
        const indicator = document.getElementById('fileIndicator');
        const statusText = indicator.nextElementSibling;

        if (this.isConnected) {
            indicator.style.backgroundColor = '#4caf50';
            statusText.textContent = 'GitHub Connected';
        } else {
            indicator.style.backgroundColor = '#007acc';
            statusText.textContent = 'File Browser Settings';
        }
    }

    async fetchRepos() {
        try {
            const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }

            this.allRepos = await response.json();

            // Get unique owners (user and orgs)
            const owners = new Set();
            this.allRepos.forEach(repo => {
                owners.add(repo.owner.login);
            });

            // Populate owner dropdown
            this.ownerSelect.innerHTML = '<option value="">Select User/Org</option>';
            const sortedOwners = Array.from(owners).sort();

            for (let owner of sortedOwners) {
                const option = document.createElement('option');
                option.value = owner;
                option.textContent = owner;
                this.ownerSelect.appendChild(option);
            }

            this.ownerSelect.disabled = false;
            console.log(`Loaded ${this.allRepos.length} repositories from ${owners.size} owner(s)`);
        } catch (error) {
            console.error('Error fetching repositories:', error);
            alert('Failed to fetch repositories. Please check your token.');
        }
    }

    async onOwnerSelect() {
        this.selectedOwner = this.ownerSelect.value;
        localStorage.setItem('github_owner', this.selectedOwner);

        if (!this.selectedOwner) {
            this.repoSelect.innerHTML = '<option value="">Select Repository</option>';
            this.repoSelect.disabled = true;
            this.branchSelect.innerHTML = '<option value="">Select Branch</option>';
            this.branchSelect.disabled = true;
            this.pullBtn.disabled = true;
            this.pushBtn.disabled = true;
            return;
        }

        // Filter repos by selected owner
        const ownerRepos = this.allRepos.filter(repo => repo.owner.login === this.selectedOwner);

        // Populate repo dropdown
        this.repoSelect.innerHTML = '<option value="">Select Repository</option>';
        ownerRepos.sort((a, b) => a.name.localeCompare(b.name));

        for (let repo of ownerRepos) {
            const option = document.createElement('option');
            option.value = repo.full_name;
            option.textContent = repo.name;
            this.repoSelect.appendChild(option);
        }

        this.repoSelect.disabled = false;
    }

    async onRepoSelect() {
        this.selectedRepo = this.repoSelect.value;
        localStorage.setItem('github_repo', this.selectedRepo);

        if (!this.selectedRepo) {
            this.branchSelect.innerHTML = '<option value="">Select Branch</option>';
            this.branchSelect.disabled = true;
            this.pullBtn.disabled = true;
            this.pushBtn.disabled = true;
            return;
        }

        await this.fetchBranches();
    }

    async fetchBranches() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.selectedRepo}/branches`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch branches');
            }

            const branches = await response.json();

            this.branchSelect.innerHTML = '<option value="">Select Branch</option>';

            for (let branch of branches) {
                const option = document.createElement('option');
                option.value = branch.name;
                option.textContent = branch.name;
                if (branch.name === 'main' || branch.name === 'master') {
                    option.selected = true;
                }
                this.branchSelect.appendChild(option);
            }

            this.branchSelect.disabled = false;

            // If main or master was auto-selected, enable buttons
            if (this.branchSelect.value) {
                this.onBranchSelect();
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            alert('Failed to fetch branches.');
        }
    }

    onBranchSelect() {
        this.selectedBranch = this.branchSelect.value;
        localStorage.setItem('github_branch', this.selectedBranch);

        if (this.selectedBranch) {
            this.pullBtn.disabled = false;
            this.pushBtn.disabled = false;
        } else {
            this.pullBtn.disabled = true;
            this.pushBtn.disabled = true;
        }
    }

    async pullFromGitHub() {
        if (!this.selectedRepo || !this.selectedBranch) {
            alert('Please select a repository and branch first.');
            return;
        }

        if (!confirm(`This will clear all current files and replace them with files from ${this.selectedRepo}/${this.selectedBranch}. Continue?`)) {
            return;
        }

        try {
            this.pullBtn.disabled = true;
            this.pullBtn.textContent = 'Pulling...';

            // Clear all current files
            await this.fileSystem.clearAll();

            // Fetch the repository tree
            const treeResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/trees/${this.selectedBranch}?recursive=1`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!treeResponse.ok) {
                throw new Error('Failed to fetch repository tree');
            }

            const tree = await treeResponse.json();

            // Process each file
            for (let item of tree.tree) {
                if (item.type === 'blob') {
                    // Fetch file content
                    const contentResponse = await fetch(item.url, {
                        headers: {
                            'Authorization': `token ${this.token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });

                    if (contentResponse.ok) {
                        const contentData = await contentResponse.json();
                        const content = atob(contentData.content);
                        await this.fileSystem.saveFile('/' + item.path, content, 'file');
                    }
                } else if (item.type === 'tree') {
                    // Create folder
                    await this.fileSystem.saveFile('/' + item.path, null, 'folder');
                }
            }

            await this.fileBrowser.refreshFileTree();

            alert(`Successfully pulled from ${this.selectedRepo}/${this.selectedBranch}`);
        } catch (error) {
            console.error('Error pulling from GitHub:', error);
            alert('Failed to pull from GitHub: ' + error.message);
        } finally {
            this.pullBtn.disabled = false;
            this.pullBtn.textContent = 'Pull';
        }
    }

    async pushToGitHub() {
        if (!this.selectedRepo || !this.selectedBranch) {
            alert('Please select a repository and branch first.');
            return;
        }

        if (!confirm(`This will force push all files to ${this.selectedRepo}/${this.selectedBranch}, replacing any existing content. Continue?`)) {
            return;
        }

        try {
            this.pushBtn.disabled = true;
            this.pushBtn.textContent = 'Pushing...';

            // Get all files from IndexedDB
            const files = await this.fileSystem.getAllFiles();

            // Filter out system files and folders
            const fileBlobs = files.filter(f =>
                f.type === 'file' &&
                f.content &&
                !f.path.startsWith('/$')
            );

            // Get the current commit SHA
            const refResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/refs/heads/${this.selectedBranch}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!refResponse.ok) {
                throw new Error('Failed to get branch reference');
            }

            const refData = await refResponse.json();
            const baseSha = refData.object.sha;

            // Create blobs for each file
            const blobs = [];
            for (let file of fileBlobs) {
                const blobResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/blobs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: btoa(file.content),
                        encoding: 'base64'
                    })
                });

                if (blobResponse.ok) {
                    const blobData = await blobResponse.json();
                    blobs.push({
                        path: file.path.substring(1), // Remove leading slash
                        mode: '100644',
                        type: 'blob',
                        sha: blobData.sha
                    });
                }
            }

            // Create a new tree
            const treeResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/trees`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tree: blobs,
                    base_tree: null // Force replace all content
                })
            });

            if (!treeResponse.ok) {
                throw new Error('Failed to create tree');
            }

            const treeData = await treeResponse.json();

            // Create a new commit
            const commitResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/commits`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update from AI Workbench',
                    tree: treeData.sha,
                    parents: [baseSha]
                })
            });

            if (!commitResponse.ok) {
                throw new Error('Failed to create commit');
            }

            const commitData = await commitResponse.json();

            // Update the reference (force push)
            const updateRefResponse = await fetch(`https://api.github.com/repos/${this.selectedRepo}/git/refs/heads/${this.selectedBranch}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sha: commitData.sha,
                    force: true
                })
            });

            if (!updateRefResponse.ok) {
                throw new Error('Failed to update branch');
            }

            alert(`Successfully pushed to ${this.selectedRepo}/${this.selectedBranch}`);
        } catch (error) {
            console.error('Error pushing to GitHub:', error);
            alert('Failed to push to GitHub: ' + error.message);
        } finally {
            this.pushBtn.disabled = false;
            this.pushBtn.textContent = 'Push';
        }
    }
} 
