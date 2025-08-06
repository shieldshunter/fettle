import cssText from './project-view-page-styles.css?inline';

const sheet = new CSSStyleSheet(); 
sheet.replaceSync(cssText);

interface Project {
  id: number;
  name: string;
  base_path: string; // Backend returns base_path, not basePath
  created_at: string; // Backend returns created_at, not createdAt
}

interface FileInfo {
  id: number;
  relative_path: string;
  hash: string;
  size: number;
  last_modified: string;
  status: 'unresolved' | 'primary' | 'deleted' | 'normal';
}

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  status?: FileInfo['status'];
  isFolder: boolean;
  isExpanded?: boolean;
  duplicateCount?: number;
  relativePath?: string; // Store the original relative_path for API calls
}

interface DuplicateGroup {
  hash: string;
  count: number;
  files: {
    relativePath: string;
    status: string;
  }[];
}

class ProjectViewPage extends HTMLElement {
  public shadow: ShadowRoot;
  private apiBaseUrl: string = 'https://trebro-api.onrender.com/api';
  private currentProject: Project | null = null;
  private fileTree: TreeNode | null = null;
  private duplicateGroups: { [hash: string]: DuplicateGroup } = {};
  private expandedFolders: Set<string> = new Set();

  private showUnresolvedOnly: boolean = false;
  private currentPopupFile: string | null = null; // Track which file the popup is showing

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [sheet];
    this.shadow.innerHTML = /*html*/`
      <div class="project-view-container">
        <div class="header">
          <h2>Project File Tree</h2>
          <div class="project-info" id="projectInfo"></div>
        </div>

        <!-- Project Selection -->
        <div class="section" id="projectSelection">
          <h3>Select Project</h3>
          <div class="project-controls">
            <div id="projectsList" class="projects-grid"></div>
          </div>
        </div>

        <!-- File Tree View -->
        <div class="section" id="treeSection" style="display: none;">
                  <div class="report-section">
          <div class="report-header">
            <h4>📊 Resolution Reports</h4>
            <p>Download reports for scripting and automation</p>
          </div>
          <div class="report-buttons">
            <button id="downloadReportBtn" class="bin-button download-btn">📥 Detailed Report</button>
            <button id="downloadScriptableBtn" class="bin-button scriptable-btn">📜 Scriptable Report</button>
          </div>
        </div>

        <div class="tree-controls">
          <div class="controls-left">
            <button id="expandAllBtn" class="bin-button">📂 Expand All</button>
            <button id="collapseAllBtn" class="bin-button">📁 Collapse All</button>
            <button id="showUnresolvedBtn" class="bin-button">🔍 Show Unresolved Only</button>
            <button id="openTreeViewBtn" class="bin-button tree-view-btn">🌳 Full Tree View (WAY BETTER VIEW)</button>
          </div>
          <div class="controls-right">
            <div class="legend">
              <span class="legend-item unresolved">🟡 Unresolved</span>
              <span class="legend-item primary">🔵 Primary</span>
              <span class="legend-item deleted">🟥 Deleted</span>
              <span class="legend-item normal">⚪ Normal</span>
              <span class="legend-item resolved">✅ Resolved</span>
            </div>
          </div>
        </div>
          
          <div class="tree-container">
            <div id="fileTree" class="file-tree"></div>
          </div>
        </div>

        <!-- Duplicate Resolution Panel -->
        <div class="section" id="resolutionPanel" style="display: none;">
          <h3>Duplicate Resolution</h3>
          <div id="duplicateDetails"></div>
        </div>

        <!-- Duplicate Locations Popup -->
        <div class="duplicate-popup" id="duplicatePopup" style="display: none;">
          <div class="popup-header">
            <div class="header-content">
              <div class="header-title">
                <h5>Duplicate File Locations</h5>
                <span class="header-hash" id="headerHash"></span>
              </div>
              <span class="header-resolution-badge" id="headerResolutionBadge"></span>
            </div>
            <button class="close-btn" onclick="this.getRootNode().host.hideDuplicateLocations()">×</button>
          </div>
          <div class="popup-content" id="popupContent">
            <!-- Popup content will be populated dynamically -->
          </div>
        </div>

        <!-- Loading Container -->
        <div id="loadingContainer" class="loading-container" style="display: none;"></div>

        <!-- Status Messages -->
        <div id="statusMessage" class="status-message"></div>
      </div>
    `;
  }

  connectedCallback() {
    this.setupEventListeners();
    this.loadProjects();
  }

  private setupEventListeners() {
    // Tree controls
    this.shadow.getElementById('expandAllBtn')?.addEventListener('click', () => this.expandAll());
    this.shadow.getElementById('collapseAllBtn')?.addEventListener('click', () => this.collapseAll());
    this.shadow.getElementById('showUnresolvedBtn')?.addEventListener('click', () => this.toggleUnresolvedOnly());
    this.shadow.getElementById('openTreeViewBtn')?.addEventListener('click', () => this.openTreeView());
    this.shadow.getElementById('downloadReportBtn')?.addEventListener('click', () => this.downloadResolutionReport());
    this.shadow.getElementById('downloadScriptableBtn')?.addEventListener('click', () => this.downloadScriptableReport());

  }

  private async loadProjects() {
    try {
      // Show loading state
      this.showLoadingState('Loading projects...');
      
      const response = await fetch(`${this.apiBaseUrl}/projects`);
      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          this.showStatus('Backend API not available. Please ensure the file deduplication API is running on https://trebro-api.onrender.com', 'error');
          return;
        }
        throw new Error(`Failed to load projects: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        this.renderProjectsList(result.data);
      } else {
        throw new Error(result.error || 'Failed to load projects');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.showStatus('Cannot connect to backend API. Please ensure the file deduplication API is running on https://trebro-api.onrender.com', 'error');
      } else {
        this.showStatus('Error loading projects: ' + error, 'error');
      }
    } finally {
      this.hideLoadingState();
    }
  }

  private renderProjectsList(projects: Project[]) {
    const projectsList = this.shadow.getElementById('projectsList')!;
    projectsList.innerHTML = '';

    projects.forEach(project => {
      const projectDiv = document.createElement('div');
      projectDiv.className = 'project-card';
      projectDiv.innerHTML = `
        <div class="project-info">
          <h4>${project.name}</h4>
          <p class="project-path">${project.base_path}</p>
          <p class="project-date">Created: ${new Date(project.created_at).toLocaleDateString()}</p>
        </div>
        <div class="project-actions">
          <button class="bin-button" onclick="this.getRootNode().host.loadProjectTree(${project.id})">View Files</button>
        </div>
      `;
      projectsList.appendChild(projectDiv);
    });
  }

  private async loadProjectTree(projectId: number) {
    try {
      // Show loading state
      this.showLoadingState('Loading project files...');
      
      // Load project details
      const projectResponse = await fetch(`${this.apiBaseUrl}/projects/${projectId}`);
      if (!projectResponse.ok) throw new Error('Failed to load project details');
      
      const projectResult = await projectResponse.json();
      if (!projectResult.success) throw new Error(projectResult.error || 'Failed to load project');
      
      this.currentProject = projectResult.data;

      // Load project files
      const filesResponse = await fetch(`${this.apiBaseUrl}/projects/${projectId}/files`);
      if (!filesResponse.ok) throw new Error('Failed to load project files');
      
      const filesResult = await filesResponse.json();
      if (!filesResult.success) throw new Error(filesResult.error || 'Failed to load files');

      const files: FileInfo[] = filesResult.data;
      

      
      // Build duplicate groups
      this.buildDuplicateGroups(files);
      
      // Build file tree
      this.fileTree = this.buildFileTree(files);
      
      // Show the tree view
      this.shadow.getElementById('projectSelection')!.style.display = 'none';
      this.shadow.getElementById('treeSection')!.style.display = 'block';
      
      // Update project info
      this.updateProjectInfo();
      
      // Render the tree
      this.renderFileTree();
      
      this.showStatus(`Loaded project: ${this.currentProject?.name || 'Unknown'}`, 'success');
    } catch (error) {
      this.showStatus('Error loading project tree: ' + error, 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  private buildDuplicateGroups(files: FileInfo[]) {
    this.duplicateGroups = {};
    
    // Group files by hash - but clean the hash to match filename cleaning logic
    const hashGroups: { [hash: string]: FileInfo[] } = {};
    files.forEach(file => {
      // Clean the hash to match the filename cleaning logic
      const cleanedHash = this.cleanHash(file.hash);
      
      if (!hashGroups[cleanedHash]) {
        hashGroups[cleanedHash] = [];
      }
      hashGroups[cleanedHash].push(file);
      

    });
    
    // Create duplicate groups for hashes with multiple files
    Object.keys(hashGroups).forEach(hash => {
      const groupFiles = hashGroups[hash];
      if (groupFiles.length > 1) {
        this.duplicateGroups[hash] = {
          hash: hash,
          count: groupFiles.length,
          files: groupFiles.map(file => ({
            relativePath: file.relative_path,
            status: file.status
          }))
        };
      }
    });
    

  }

  private cleanHash(hash: string): string {
    // Clean the hash to match the filename cleaning logic
    // Remove query parameters and timestamps (anything after ? or &)
    return hash.split(/[?&]/)[0];
  }

  private cleanFileName(fileName: string): string {
    // Clean the filename for display (remove query parameters and timestamps)
    // Remove anything after ? or & (timestamps and other parameters)
    return fileName.split(/[?&]/)[0];
  }

  private buildFileTree(files: FileInfo[]): TreeNode {
    const root: TreeNode = {
      name: '/',
      path: '/',
      children: [],
      isFolder: true,
      isExpanded: true
    };

    files.forEach(file => {
      const pathParts = file.relative_path.split(/[\/\\]/);
      let current = root;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!part) continue;

        let child = current.children?.find(c => c.name === part);
        
        if (!child) {
          child = {
            name: part,
            path: current.path === '/' ? `/${part}` : `${current.path}/${part}`,
            children: [],
            isFolder: i < pathParts.length - 1,
            isExpanded: this.expandedFolders.has(current.path === '/' ? `/${part}` : `${current.path}/${part}`)
          };
          current.children!.push(child);
        }

        if (i === pathParts.length - 1) {
          // This is a file
          child.isFolder = false;
          child.relativePath = file.relative_path; // Store the original relative_path for API calls
          
          // Determine status based on duplicate groups - IGNORE BACKEND STATUS
          const cleanedHash = this.cleanHash(file.hash);
          console.log(`🔍 File ${file.relative_path}: original hash="${file.hash}", cleaned hash="${cleanedHash}"`);
          console.log(`🔍 Available duplicate groups:`, Object.keys(this.duplicateGroups));
          
          if (this.duplicateGroups[cleanedHash]) {
            // This file is part of a duplicate group
            const group = this.duplicateGroups[cleanedHash];
            child.duplicateCount = group.count;
            
            // Check if this duplicate group is resolved (has a primary or all deleted)
            const hasPrimary = group.files.some(f => f.status === 'primary');
            const allDeleted = group.files.every(f => f.status === 'deleted');
            
            if (hasPrimary || allDeleted) {
              // Group is resolved, use the file's actual status
              child.status = file.status;
              console.log(`✅ File ${file.relative_path}: resolved group (${group.count} duplicates), status: ${file.status}`);
            } else {
              // Group is unresolved, mark as unresolved
              child.status = 'unresolved';
              console.log(`🟡 File ${file.relative_path}: unresolved group (${group.count} duplicates), status: unresolved`);
            }
            
          } else {
            // This file has no duplicates, mark as normal - REGARDLESS OF BACKEND STATUS
            child.status = 'normal';
            console.log(`⚪ File ${file.relative_path}: no duplicates, status: normal`);
          }
        }

        current = child;
      }
    });

    return root;
  }

  private renderFileTree() {
    const treeContainer = this.shadow.getElementById('fileTree')!;
    treeContainer.innerHTML = '';
    
    if (!this.fileTree) return;
    
    const treeElement = this.createTreeNodeElement(this.fileTree);
    treeContainer.appendChild(treeElement);
  }

  private createTreeNodeElement(node: TreeNode): HTMLElement {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'tree-node';
    
    if (node.isFolder) {
      nodeElement.className += ' folder-node';
      
      // Check if folder contains unresolved duplicates
      const hasUnresolved = this.hasUnresolvedDuplicates(node);
      
      if (hasUnresolved) {
        nodeElement.className += ' status-unresolved';
      } else if (this.isFolderResolved(node)) {
        nodeElement.className += ' resolved';
      }
      
      const expandIcon = node.isExpanded ? '📂' : '📁';
      const folderName = node.name === '/' ? 'Root' : node.name;
      
      nodeElement.innerHTML = `
        <div class="node-content" onclick="this.getRootNode().host.toggleFolder('${node.path}')">
          <div class="node-info">
            <span class="expand-icon">${expandIcon}</span>
            <span class="node-name">${folderName}</span>
          </div>
        </div>
        <div class="node-children" style="display: ${node.isExpanded ? 'block' : 'none'}">
          ${node.children?.filter(child => this.shouldShowNode(child)).map(child => this.createTreeNodeElement(child).outerHTML).join('') || ''}
        </div>
      `;
    } else {
      // File node
      const status = node.status || 'normal'; // Default to normal instead of unresolved
      nodeElement.className += ` file-node status-${status}`;
      
      // Debug: Log the status being applied
      console.log(`🎨 File ${node.name}: status=${status}, className=${nodeElement.className}`);
      
      // Additional debugging for normal files
      if (status === 'normal') {
        console.log(`✅ File ${node.name}: Should be grey (normal status applied)`);
        console.log(`🔍 CSS classes: tree-node file-node status-normal`);
      } else if (status === 'unresolved') {
        console.log(`🟡 File ${node.name}: Should be yellow (unresolved status applied)`);
        console.log(`🔍 CSS classes: tree-node file-node status-unresolved`);
      }
      
      const duplicateBadge = node.duplicateCount && node.duplicateCount > 1 
        ? `<span class="duplicate-badge">${node.duplicateCount}</span>` 
        : '';
      
      // Clean the filename for display (remove query parameters and timestamps)
      const cleanFileName = this.cleanFileName(node.name);
      
      // Add action buttons for files with duplicates
      const actionButtons = node.duplicateCount && node.duplicateCount > 1 ? `
        <div class="file-actions">
          <button class="bin-button small primary-btn" onclick="this.getRootNode().host.markAsPrimary('${node.relativePath || node.path}')" ${status === 'primary' ? 'disabled' : ''}>
            ${status === 'primary' ? '✓ Primary' : 'Mark Primary'}
          </button>
          <button class="bin-button small delete-btn" onclick="this.getRootNode().host.markAsDeleted('${node.relativePath || node.path}')" ${status === 'deleted' ? 'disabled' : ''}>
            ${status === 'deleted' ? '🗑️ Deleted' : 'Mark Deleted'}
          </button>
          <button class="bin-button small view-btn" onclick="this.getRootNode().host.showDuplicateLocations('${node.path}')">
            👁️ View All
          </button>
        </div>
      ` : '';

      nodeElement.innerHTML = `
        <div class="node-content">
          <div class="node-info" onclick="this.getRootNode().host.handleFileNodeClick('${node.path}', '${status}', ${node.duplicateCount && node.duplicateCount > 1})">
            <span class="file-icon">📄</span>
            <span class="node-name">${cleanFileName}</span>
            ${duplicateBadge}
          </div>
          ${actionButtons}
        </div>
      `;
    }
    
    return nodeElement;
  }

  private isFolderResolved(folder: TreeNode): boolean {
    if (!folder.children) return true;
    
    return folder.children.every(child => {
      if (child.isFolder) {
        return this.isFolderResolved(child);
      }
      // A folder is resolved if all its files are not unresolved
      return child.status !== 'unresolved';
    });
  }

  private hasUnresolvedDuplicates(node: TreeNode): boolean {
    if (!node.children) return false;
    
    return node.children.some(child => {
      if (child.isFolder) {
        return this.hasUnresolvedDuplicates(child);
      }
      // Only mark as unresolved if the file has duplicates AND is actually unresolved
      const hasUnresolvedDuplicates = child.status === 'unresolved' && child.duplicateCount && child.duplicateCount > 1;
      return hasUnresolvedDuplicates;
    });
  }

  toggleFolder(path: string) {
    const node = this.findNodeByPath(this.fileTree!, path);
    if (node && node.isFolder) {
      node.isExpanded = !node.isExpanded;
      
      if (node.isExpanded) {
        this.expandedFolders.add(path);
      } else {
        this.expandedFolders.delete(path);
      }
      
      this.renderFileTree();
    }
  }

  private findNodeByPath(root: TreeNode, path: string): TreeNode | null {
    if (root.path === path) return root;
    
    if (root.children) {
      for (const child of root.children) {
        const found = this.findNodeByPath(child, path);
        if (found) return found;
      }
    }
    
    return null;
  }

  handleFileNodeClick(path: string, _status: string, hasDuplicates: boolean) {
    
    if (hasDuplicates) {
      // For files with duplicates, show the popup directly
      this.showDuplicateLocations(path);
    } else {
      // For normal files, just select them (existing behavior)
      const file = this.findFileByPath(path);
      if (file && this.duplicateGroups[file.hash]) {
        this.showDuplicateDetails(file.hash);
      } else {
        this.hideDuplicateDetails();
      }
    }
  }

  selectFile(path: string, _status: string) {
    
    // Find the file's hash to get duplicate group
    const file = this.findFileByPath(path);
    if (file && this.duplicateGroups[file.hash]) {
      this.showDuplicateDetails(file.hash);
    } else {
      this.hideDuplicateDetails();
    }
  }

  private findFileByPath(_path: string): FileInfo | null {
    // This would need to be implemented based on how files are stored
    // For now, we'll use a simplified approach
    return null;
  }

  private showDuplicateDetails(hash: string) {
    const group = this.duplicateGroups[hash];
    if (!group) return;
    
    const detailsContainer = this.shadow.getElementById('duplicateDetails')!;
    const resolutionPanel = this.shadow.getElementById('resolutionPanel')!;
    
    detailsContainer.innerHTML = `
      <div class="duplicate-group">
        <h4>Duplicate Group (${group.count} files)</h4>
        <div class="duplicate-files">
          ${group.files.map(file => `
            <div class="duplicate-file status-${file.status}">
              <span class="file-path">${file.relativePath}</span>
              <div class="file-actions">
                <button class="bin-button small" onclick="this.getRootNode().host.markAsPrimary('${file.relativePath}')" ${file.status === 'primary' ? 'disabled' : ''}>
                  ${file.status === 'primary' ? '✓ Primary' : 'Mark Primary'}
                </button>
                <button class="bin-button small" onclick="this.getRootNode().host.markAsDeleted('${file.relativePath}')" ${file.status === 'deleted' ? 'disabled' : ''}>
                  ${file.status === 'deleted' ? '🗑️ Deleted' : 'Mark Deleted'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    resolutionPanel.style.display = 'block';
  }

  private hideDuplicateDetails() {
    this.shadow.getElementById('resolutionPanel')!.style.display = 'none';
  }

  async markAsPrimary(relativePath: string) {
    try {
      if (!this.currentProject) {
        this.showStatus('No project selected', 'error');
        return;
      }

      // Show loading state for the specific button
      this.showButtonLoadingState('primary', relativePath);

      console.log(`🔧 Attempting to mark file as primary:`, {
        projectId: this.currentProject.id,
        filePath: relativePath,
        apiUrl: `${this.apiBaseUrl}/resolve/${this.currentProject.id}/mark-primary`
      });

      const response = await fetch(`${this.apiBaseUrl}/resolve/${this.currentProject.id}/mark-primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relativePath })
      });

      console.log(`🔧 Response status:`, response.status);
      console.log(`🔧 Response URL:`, response.url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`🔧 API Error:`, errorData);
        throw new Error(errorData.error || 'Failed to mark file as primary');
      }

      const result = await response.json();
      console.log(`🔧 API Success:`, result);
      
      if (result.success) {
        this.showStatus('File marked as primary', 'success');
        // Reload the project tree to get updated statuses
        await this.loadProjectTree(this.currentProject.id);
        // Refresh the popup if it's currently open
        this.refreshPopupIfOpen();
      } else {
        throw new Error(result.error || 'Failed to mark file as primary');
      }
    } catch (error) {
      console.error(`🔧 Error in markAsPrimary:`, error);
      this.showStatus('Error marking file as primary: ' + error, 'error');
    } finally {
      this.hideButtonLoadingState('primary', relativePath);
    }
  }

  async markAsDeleted(relativePath: string) {
    try {
      if (!this.currentProject) {
        this.showStatus('No project selected', 'error');
        return;
      }

      // Show loading state for the specific button
      this.showButtonLoadingState('deleted', relativePath);

      console.log(`🔧 Attempting to mark file as deleted:`, {
        projectId: this.currentProject.id,
        filePath: relativePath,
        apiUrl: `${this.apiBaseUrl}/resolve/${this.currentProject.id}/mark-deleted`
      });

      const response = await fetch(`${this.apiBaseUrl}/resolve/${this.currentProject.id}/mark-deleted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relativePath })
      });

      console.log(`🔧 Response status:`, response.status);
      console.log(`🔧 Response URL:`, response.url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`🔧 API Error:`, errorData);
        throw new Error(errorData.error || 'Failed to mark file as deleted');
      }

      const result = await response.json();
      console.log(`🔧 API Success:`, result);
      
      if (result.success) {
        this.showStatus('File marked as deleted', 'success');
        // Reload the project tree to get updated statuses
        await this.loadProjectTree(this.currentProject.id);
        // Refresh the popup if it's currently open
        this.refreshPopupIfOpen();
      } else {
        throw new Error(result.error || 'Failed to mark file as deleted');
      }
    } catch (error) {
      console.error(`🔧 Error in markAsDeleted:`, error);
      this.showStatus('Error marking file as deleted: ' + error, 'error');
    } finally {
      this.hideButtonLoadingState('deleted', relativePath);
    }
  }

  private showDuplicateLocations(filePath: string) {
    // Find the file in the tree to get its hash
    const fileNode = this.findNodeByPath(this.fileTree!, filePath);
    if (!fileNode || !fileNode.duplicateCount || fileNode.duplicateCount <= 1) {
      this.showStatus('No duplicates found for this file', 'info');
      return;
    }

    // Find the hash for this file by looking through duplicate groups
    let fileHash: string | null = null;
    const fileName = filePath.split(/[\/\\]/).pop() || filePath;
    
    // Look through all duplicate groups to find the one containing this file
    for (const [hash, group] of Object.entries(this.duplicateGroups)) {
      const hasFile = group.files.some(file => {
        const groupFileName = file.relativePath.split(/[\/\\]/).pop() || file.relativePath;
        return groupFileName === fileName;
      });
      
      if (hasFile) {
        fileHash = hash;
        break;
      }
    }

    if (!fileHash) {
      this.showStatus('Could not find file hash', 'error');
      return;
    }

    const duplicateGroup = this.duplicateGroups[fileHash];
    if (!duplicateGroup) {
      this.showStatus('No duplicate group found for this file', 'error');
      return;
    }

    const popup = this.shadow.getElementById('duplicatePopup') as HTMLElement;
    const popupContent = this.shadow.getElementById('popupContent') as HTMLElement;
    
    if (!popup || !popupContent) {
      console.error('Popup elements not found');
      return;
    }

    const selectedFile = filePath;
    


    // Clean the selected file path for display
    const cleanSelectedPath = this.cleanFileName(selectedFile);
    const selectedPathParts = cleanSelectedPath.split(/[\/\\]/);
    const selectedFileName = selectedPathParts.pop() || cleanSelectedPath;
    const selectedFolderPath = selectedPathParts.length > 0 ? selectedPathParts.join('/') : '';

    // Check if this duplicate group is resolved
    const hasPrimary = duplicateGroup.files.some(f => f.status === 'primary');
    const allDeleted = duplicateGroup.files.every(f => f.status === 'deleted');
    const isResolved = hasPrimary || allDeleted;
    const resolutionStatus = hasPrimary ? 'primary' : allDeleted ? 'deleted' : 'unresolved';

    // Build simple tree view for duplicate locations
    const treeViewHtml = this.buildDuplicateTreeView(duplicateGroup.files, selectedFile);
    
    popupContent.innerHTML = `
      <div class="popup-info">
        <div class="selected-file-showcase">
          <div class="showcase-header">
            <span class="showcase-label">Selected File</span>
            ${isResolved ? `<span class="resolution-badge resolved">✓ Resolved</span>` : `<span class="resolution-badge unresolved">⏳ Unresolved</span>`}
          </div>
          <div class="showcase-content">
            <div class="file-icon">📄</div>
            <div class="file-details">
              <div class="file-path-display">
                ${selectedFolderPath ? `<span class="folder-path">${selectedFolderPath}/</span>` : ''}
                <span class="file-name">${selectedFileName}</span>
              </div>
              <div class="file-meta">
                <span class="file-status status-${resolutionStatus}">${resolutionStatus}</span>
                <span class="duplicate-count">${duplicateGroup.count} duplicates</span>
              </div>
            </div>
          </div>
        </div>
        <div class="duplicate-tree-view">
          <h6>Duplicate Locations Tree:</h6>
          ${treeViewHtml}
        </div>
      </div>
    `;

    // Update header resolution badge
    const headerBadge = this.shadow.getElementById('headerResolutionBadge') as HTMLElement;
    if (headerBadge) {
      if (isResolved) {
        headerBadge.innerHTML = '<span class="header-badge resolved">✓ Resolved</span>';
        headerBadge.className = 'header-resolution-badge resolved';
      } else {
        headerBadge.innerHTML = '<span class="header-badge unresolved">⏳ Unresolved</span>';
        headerBadge.className = 'header-resolution-badge unresolved';
      }
    }

    // Update header file info
    const headerHash = this.shadow.getElementById('headerHash') as HTMLElement;
    if (headerHash) {
      headerHash.textContent = `File: ${fileHash}`;
    }

    // Store the current file being shown in the popup
    this.currentPopupFile = filePath;
    popup.style.display = 'block';
  }

  hideDuplicateLocations() {
    const popup = this.shadow.getElementById('duplicatePopup') as HTMLElement;
    if (popup) {
      popup.style.display = 'none';
      this.currentPopupFile = null; // Clear the tracked file
    }
  }

  private refreshPopupIfOpen() {
    // If popup is open and we have a tracked file, refresh the popup content
    if (this.currentPopupFile) {
      const popup = this.shadow.getElementById('duplicatePopup') as HTMLElement;
      if (popup && popup.style.display !== 'none') {
        // Re-show the popup with updated data
        this.showDuplicateLocations(this.currentPopupFile);
      }
    }
  }

  private buildDuplicateTreeView(files: { relativePath: string; status: string }[], selectedFile: string): string {
    // Build a tree structure similar to the main file tree, but only for duplicates
    const duplicateTree = this.buildDuplicateFileTree(files);
    return this.renderDuplicateTree(duplicateTree, selectedFile);
  }

  private buildDuplicateFileTree(files: { relativePath: string; status: string }[]): TreeNode {
    const root: TreeNode = {
      name: '/',
      path: '/',
      children: [],
      isFolder: true,
      isExpanded: true
    };

    files.forEach(file => {
      const pathParts = file.relativePath.split(/[\/\\]/);
      let current = root;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!part) continue;

        let child = current.children?.find(c => c.name === part);
        
        if (!child) {
          child = {
            name: part,
            path: current.path === '/' ? `/${part}` : `${current.path}/${part}`,
            children: [],
            isFolder: i < pathParts.length - 1,
            isExpanded: true // Always expanded in popup
          };
          current.children!.push(child);
        }

        if (i === pathParts.length - 1) {
          // This is a file
          child.isFolder = false;
          child.relativePath = file.relativePath;
          child.status = file.status as FileInfo['status'];
        }

        current = child;
      }
    });

    return root;
  }

  private renderDuplicateTree(node: TreeNode, selectedFile: string): string {
    if (node.isFolder) {
      const folderIcon = '📁';
      const folderName = node.name === '/' ? 'Root' : node.name;
      
      return `
        <div class="duplicate-tree-node folder-node">
          <div class="node-content">
            <div class="node-info">
              <span class="expand-icon">${folderIcon}</span>
              <span class="node-name">${folderName}</span>
            </div>
          </div>
          <div class="node-children">
            ${node.children?.map(child => this.renderDuplicateTree(child, selectedFile)).join('') || ''}
          </div>
        </div>
      `;
    } else {
      // File node
      const status = node.status || 'normal';
      const isSelected = node.relativePath === selectedFile;
      const cleanFileName = this.cleanFileName(node.name);
      
      return `
        <div class="duplicate-tree-node file-node status-${status} ${isSelected ? 'selected' : ''}">
          <div class="node-content">
            <div class="node-info">
              <span class="file-icon">📄</span>
              <span class="node-name">${cleanFileName}</span>
              ${isSelected ? '<span class="selected-indicator">← Selected</span>' : ''}
              <span class="file-status-badge status-${status}">${status}</span>
            </div>
            <div class="file-actions">
              <button class="bin-button small primary-btn" onclick="this.getRootNode().host.markAsPrimary('${node.relativePath}')" ${status === 'primary' ? 'disabled' : ''}>
                ${status === 'primary' ? '✓ Primary' : 'Mark Primary'}
              </button>
              <button class="bin-button small delete-btn" onclick="this.getRootNode().host.markAsDeleted('${node.relativePath}')" ${status === 'deleted' ? 'disabled' : ''}>
                ${status === 'deleted' ? '🗑️ Deleted' : 'Mark Deleted'}
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  private downloadResolutionReport() {
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }

    try {
      // Get all files from the current project
      const allFiles = this.getAllProjectFiles();
      
      // Filter files by status
      const primaryFiles = allFiles.filter(file => file.status === 'primary');
      const deletedFiles = allFiles.filter(file => file.status === 'deleted');
      
      // Create report content
      const report = this.createResolutionReport(primaryFiles, deletedFiles);
      
      // Download the report
      this.downloadFile(report, `duplicate-resolution-report-${this.currentProject.name}-${new Date().toISOString().split('T')[0]}.txt`);
      
      this.showStatus(`Downloaded resolution report with ${primaryFiles.length} primary and ${deletedFiles.length} deleted files`, 'success');
    } catch (error) {
      this.showStatus('Error generating report: ' + error, 'error');
    }
  }

  private getAllProjectFiles(): { relativePath: string; status: string }[] {
    const allFiles: { relativePath: string; status: string }[] = [];
    
    // Collect all files from duplicate groups
    Object.values(this.duplicateGroups).forEach(group => {
      group.files.forEach(file => {
        allFiles.push({
          relativePath: file.relativePath,
          status: file.status
        });
      });
    });
    
    return allFiles;
  }

  private createResolutionReport(primaryFiles: { relativePath: string; status: string }[], deletedFiles: { relativePath: string; status: string }[]): string {
    const projectName = this.currentProject?.name || 'Unknown Project';
    const projectPath = this.currentProject?.base_path || 'Unknown Path';
    const timestamp = new Date().toLocaleString();
    
    let report = `DUPLICATE RESOLUTION REPORT
Generated: ${timestamp}
Project: ${projectName}
Base Path: ${projectPath}

`;

    if (primaryFiles.length > 0) {
      report += `PRIMARY FILES (${primaryFiles.length}):
${primaryFiles.map(file => `✓ ${file.relativePath}`).join('\n')}

`;
    } else {
      report += `PRIMARY FILES: None

`;
    }

    if (deletedFiles.length > 0) {
      report += `DELETED FILES (${deletedFiles.length}):
${deletedFiles.map(file => `🗑️ ${file.relativePath}`).join('\n')}

`;
    } else {
      report += `DELETED FILES: None

`;
    }

    const totalResolved = primaryFiles.length + deletedFiles.length;
    const totalDuplicates = Object.values(this.duplicateGroups).reduce((sum, group) => sum + group.count, 0);
    const unresolvedCount = totalDuplicates - totalResolved;

    report += `SUMMARY:
- Total Duplicate Files: ${totalDuplicates}
- Primary Files: ${primaryFiles.length}
- Deleted Files: ${deletedFiles.length}
- Unresolved Files: ${unresolvedCount}
- Resolution Progress: ${totalResolved}/${totalDuplicates} (${Math.round((totalResolved / totalDuplicates) * 100)}%)

`;
    
    if (unresolvedCount > 0) {
      report += `UNRESOLVED DUPLICATE GROUPS:
`;
      Object.entries(this.duplicateGroups).forEach(([hash, group]) => {
        const unresolvedFiles = group.files.filter(file => file.status === 'unresolved');
        if (unresolvedFiles.length > 0) {
          report += `\nHash: ${hash} (${group.count} files)
${unresolvedFiles.map(file => `  ⏳ ${file.relativePath}`).join('\n')}
`;
        }
      });
    }

    return report;
  }

  private downloadScriptableReport() {
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }

    try {
      const allFiles = this.getAllProjectFiles();
      const primaryFiles = allFiles.filter(file => file.status === 'primary');
      const deletedFiles = allFiles.filter(file => file.status === 'deleted');
      
      // Create scriptable content with just file paths
      const scriptableContent = this.createScriptableReport(primaryFiles, deletedFiles);
      
      // Download the scriptable report
      this.downloadFile(scriptableContent, `scriptable-report-${this.currentProject.name}-${new Date().toISOString().split('T')[0]}.txt`);
      
      this.showStatus(`Downloaded scriptable report with ${primaryFiles.length} primary and ${deletedFiles.length} deleted files`, 'success');
    } catch (error) {
      this.showStatus('Error generating scriptable report: ' + error, 'error');
    }
  }

  private createScriptableReport(primaryFiles: { relativePath: string; status: string }[], deletedFiles: { relativePath: string; status: string }[]): string {
    const projectName = this.currentProject?.name || 'Unknown Project';
    const projectPath = this.currentProject?.base_path || 'Unknown Path';
    const timestamp = new Date().toISOString();
    
    let report = `# Scriptable Duplicate Resolution Report
# Generated: ${timestamp}
# Project: ${projectName}
# Base Path: ${projectPath}
# Format: One file path per line, prefixed with action

`;

    // Primary files - format for keeping
    if (primaryFiles.length > 0) {
      report += `# PRIMARY FILES (${primaryFiles.length}) - KEEP THESE FILES\n`;
      primaryFiles.forEach(file => {
        report += `KEEP:${file.relativePath}\n`;
      });
      report += '\n';
    } else {
      report += `# PRIMARY FILES: None\n\n`;
    }

    // Deleted files - format for deletion
    if (deletedFiles.length > 0) {
      report += `# DELETED FILES (${deletedFiles.length}) - DELETE THESE FILES\n`;
      deletedFiles.forEach(file => {
        report += `DELETE:${file.relativePath}\n`;
      });
      report += '\n';
    } else {
      report += `# DELETED FILES: None\n\n`;
    }

    // Summary for scripting
    const totalResolved = primaryFiles.length + deletedFiles.length;
    const totalDuplicates = Object.values(this.duplicateGroups).reduce((sum, group) => sum + group.count, 0);
    const unresolvedCount = totalDuplicates - totalResolved;

    report += `# SUMMARY FOR SCRIPTING
# Total Duplicate Files: ${totalDuplicates}
# Primary Files: ${primaryFiles.length}
# Deleted Files: ${deletedFiles.length}
# Unresolved Files: ${unresolvedCount}
# Resolution Progress: ${totalResolved}/${totalDuplicates} (${Math.round((totalResolved / totalDuplicates) * 100)}%)

`;

    // Example script usage
    report += `# EXAMPLE SCRIPT USAGE (PowerShell):
# $content = Get-Content "scriptable-report-${projectName}-${new Date().toISOString().split('T')[0]}.txt"
# $keepFiles = $content | Where-Object { $_ -match '^KEEP:' } | ForEach-Object { $_.Replace('KEEP:', '') }
# $deleteFiles = $content | Where-Object { $_ -match '^DELETE:' } | ForEach-Object { $_.Replace('DELETE:', '') }
# 
# foreach ($file in $deleteFiles) {
#     if (Test-Path $file) { Remove-Item $file -Force }
# }
# 
# foreach ($file in $keepFiles) {
#     Write-Host "Keeping: $file"
# }

`;

    // Example script usage for bash
    report += `# EXAMPLE SCRIPT USAGE (Bash):
# #!/bin/bash
# while IFS= read -r line; do
#     if [[ $line == KEEP:* ]]; then
#         filepath="\${line#KEEP:}"
#         echo "Keeping: $filepath"
#     elif [[ $line == DELETE:* ]]; then
#         filepath="\${line#DELETE:}"
#         if [ -f "$filepath" ]; then
#             rm "$filepath"
#             echo "Deleted: $filepath"
#         fi
#     fi
# done < "scriptable-report-${projectName}-${new Date().toISOString().split('T')[0]}.txt"

`;

    return report;
  }

  private downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }



  private expandAll() {
    this.expandAllNodes(this.fileTree!);
    this.renderFileTree();
  }

  private collapseAll() {
    this.collapseAllNodes(this.fileTree!);
    this.renderFileTree();
  }

  private expandAllNodes(node: TreeNode) {
    if (node.isFolder) {
      node.isExpanded = true;
      this.expandedFolders.add(node.path);
      node.children?.forEach(child => this.expandAllNodes(child));
    }
  }

  private collapseAllNodes(node: TreeNode) {
    if (node.isFolder) {
      node.isExpanded = false;
      this.expandedFolders.delete(node.path);
      node.children?.forEach(child => this.collapseAllNodes(child));
    }
  }

  private toggleUnresolvedOnly() {
    this.showUnresolvedOnly = !this.showUnresolvedOnly;
    const button = this.shadow.getElementById('showUnresolvedBtn') as HTMLButtonElement;
    
    if (this.showUnresolvedOnly) {
      button.textContent = '🔍 Show All Files';
      this.showStatus('Showing unresolved files only', 'info');
    } else {
      button.textContent = '🔍 Show Unresolved Only';
      this.showStatus('Showing all files', 'info');
    }
    
    this.renderFileTree();
  }

  private shouldShowNode(node: TreeNode): boolean {
    if (!this.showUnresolvedOnly) return true;
    
    if (node.isFolder) {
      // Show folder if it contains unresolved duplicates
      return this.hasUnresolvedDuplicates(node);
    } else {
      // Show file if it's unresolved and has duplicates
      return node.status === 'unresolved' && (node.duplicateCount || 0) > 1;
    }
  }

  private updateProjectInfo() {
    if (!this.currentProject) return;
    
    // Calculate progress statistics
    const stats = this.calculateProjectStats();
    
    const projectInfo = this.shadow.getElementById('projectInfo')!;
    projectInfo.innerHTML = `
      <div class="project-details">
        <div class="project-header">
          <h3>${this.currentProject.name}</h3>
          <div class="project-meta">
            <span class="meta-item">📁 Base: ${this.currentProject.base_path}</span>
            <span class="meta-item">📅 Created: ${new Date(this.currentProject.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-header">
            <h4>Duplicate Resolution Progress</h4>
            <div class="progress-percentage">${stats.percentage}%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.percentage}%"></div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">${stats.totalFiles}</div>
              <div class="stat-label">Total Files</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${stats.duplicateFiles}</div>
              <div class="stat-label">Duplicates</div>
            </div>
            <div class="stat-item resolved">
              <div class="stat-number">${stats.resolvedFiles}</div>
              <div class="stat-label">Resolved</div>
            </div>
            <div class="stat-item unresolved">
              <div class="stat-number">${stats.unresolvedFiles}</div>
              <div class="stat-label">Unresolved</div>
            </div>
            <div class="stat-item primary">
              <div class="stat-number">${stats.primaryFiles}</div>
              <div class="stat-label">Primary</div>
            </div>
            <div class="stat-item deleted">
              <div class="stat-number">${stats.deletedFiles}</div>
              <div class="stat-label">Deleted</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private calculateProjectStats() {
    const allFiles = this.getAllProjectFiles();
    const totalFiles = allFiles.length;
    const duplicateFiles = Object.values(this.duplicateGroups).reduce((sum, group) => sum + group.count, 0);
    const primaryFiles = allFiles.filter(file => file.status === 'primary').length;
    const deletedFiles = allFiles.filter(file => file.status === 'deleted').length;
    const resolvedFiles = primaryFiles + deletedFiles;
    const unresolvedFiles = duplicateFiles - resolvedFiles;
    const percentage = duplicateFiles > 0 ? Math.round((resolvedFiles / duplicateFiles) * 100) : 0;

    return {
      totalFiles,
      duplicateFiles,
      resolvedFiles,
      unresolvedFiles,
      primaryFiles,
      deletedFiles,
      percentage
    };
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const statusElement = this.shadow.getElementById('statusMessage')!;
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'status-message';
    }, 5000);
  }

  private openTreeView() {
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }
    
    // Store the current project ID in sessionStorage for the tree view page
    sessionStorage.setItem('currentProjectId', this.currentProject.id.toString());
    
    // Navigate to the tree view page using the main app's navigation
    const event = new CustomEvent('navigate', { detail: 'treeview' });
    document.dispatchEvent(event);
  }

  // Add loading state methods
  private showLoadingState(message: string = 'Loading...') {
    const loadingContainer = this.shadow.getElementById('loadingContainer');
    if (loadingContainer) {
      loadingContainer.innerHTML = `
        <div class="loading-overlay">
          <div class="loading-content">
            <wave-spinner></wave-spinner>
            <p>${message}</p>
          </div>
        </div>
      `;
      loadingContainer.style.display = 'block';
    }
  }

  private hideLoadingState() {
    const loadingContainer = this.shadow.getElementById('loadingContainer');
    if (loadingContainer) {
      loadingContainer.style.display = 'none';
    }
  }

  private showButtonLoadingState(action: 'primary' | 'deleted', _relativePath: string) {
    // Find the button in the popup or tree and show loading state
    const buttons = this.shadow.querySelectorAll(`.${action}-btn`) as NodeListOf<HTMLButtonElement>;
    buttons.forEach(button => {
      const originalText = button.textContent;
      button.innerHTML = '<wave-spinner></wave-spinner>';
      button.disabled = true;
      (button as any).originalText = originalText;
    });
  }

  private hideButtonLoadingState(action: 'primary' | 'deleted', _relativePath: string) {
    // Restore button state
    const buttons = this.shadow.querySelectorAll(`.${action}-btn`) as NodeListOf<HTMLButtonElement>;
    buttons.forEach(button => {
      if ((button as any).originalText) {
        button.innerHTML = (button as any).originalText;
        button.disabled = false;
      }
    });
  }
}

customElements.define('project-view-page', ProjectViewPage);

export { ProjectViewPage }; 