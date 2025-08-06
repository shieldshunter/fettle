import cssText from './tree-view-page-styles.css?inline';

const sheet = new CSSStyleSheet(); 
sheet.replaceSync(cssText);

interface Project {
  id: number;
  name: string;
  base_path: string;
  created_at: string;
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
  relativePath?: string;
}

interface DuplicateGroup {
  hash: string;
  count: number;
  files: {
    relativePath: string;
    status: string;
  }[];
}

class TreeViewPage extends HTMLElement {
  public shadow: ShadowRoot;
  private apiBaseUrl: string = 'https://trebro-api.onrender.com/api';
  private currentProject: Project | null = null;
  private fileTree: TreeNode | null = null;
  private duplicateGroups: { [hash: string]: DuplicateGroup } = {};
  private expandedFolders: Set<string> = new Set();
  private showUnresolvedOnly: boolean = false;
  private currentPopupFile: string | null = null;
  private currentDuplicateGroupIndex: number = 0;
  private availableDuplicateGroups: string[] = [];

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [sheet];
    this.shadow.innerHTML = /*html*/`
      <div class="tree-view-container">
        <div class="header">
          <div class="header-content">
            <h2>File Tree View</h2>
            <div class="project-info" id="projectInfo"></div>
          </div>
          <button class="back-btn" onclick="this.getRootNode().host.goBack()">← Back to Project View</button>
        </div>

        <div class="tree-controls">
          <div class="controls-left">
            <button id="expandAllBtn" class="bin-button">📂 Expand All</button>
            <button id="collapseAllBtn" class="bin-button">📁 Collapse All</button>
            <button id="showUnresolvedBtn" class="bin-button">🔍 Show Unresolved Only</button>
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
          <div class="popup-navigation" id="popupNavigation" style="display: none;">
            <button class="nav-btn prev-btn" onclick="this.getRootNode().host.navigateToPreviousGroup()">← Previous</button>
            <span class="nav-counter" id="navCounter"></span>
            <button class="nav-btn next-btn" onclick="this.getRootNode().host.navigateToNextGroup()">Next →</button>
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
    this.loadProjectData();
  }

  private setupEventListeners() {
    this.shadow.getElementById('expandAllBtn')?.addEventListener('click', () => this.expandAll());
    this.shadow.getElementById('collapseAllBtn')?.addEventListener('click', () => this.collapseAll());
    this.shadow.getElementById('showUnresolvedBtn')?.addEventListener('click', () => this.toggleUnresolvedOnly());
  }

  private loadProjectData() {
    // Get project data from URL parameters, sessionStorage, or navigation state
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    
    // Check sessionStorage for project ID (set by main app navigation)
    const sessionProjectId = sessionStorage.getItem('currentProjectId');
    
    // Check if we're in the main app context and have a current project
    if (!projectId && !sessionProjectId) {
      // Try to get project ID from the main app's state
      const mainContainer = document.getElementById('mainContainer');
      if (mainContainer) {
        const projectViewPage = mainContainer.querySelector('project-view-page');
        if (projectViewPage && (projectViewPage as any).currentProject) {
          const currentProject = (projectViewPage as any).currentProject;
          this.loadProjectTree(currentProject.id);
          return;
        }
      }
      
      this.showStatus('No project ID provided', 'error');
      return;
    }
    
    const finalProjectId = projectId || sessionProjectId;
    if (finalProjectId) {
      this.loadProjectTree(parseInt(finalProjectId));
      // Clear the session storage after use
      sessionStorage.removeItem('currentProjectId');
    }
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
    
    const hashGroups: { [hash: string]: FileInfo[] } = {};
    files.forEach(file => {
      const cleanedHash = this.cleanHash(file.hash);
      
      if (!hashGroups[cleanedHash]) {
        hashGroups[cleanedHash] = [];
      }
      hashGroups[cleanedHash].push(file);
    });
    
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
    return hash.split(/[?&]/)[0];
  }

  private cleanFileName(fileName: string): string {
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
          child.isFolder = false;
          child.relativePath = file.relative_path;
          
          const cleanedHash = this.cleanHash(file.hash);
          
          if (this.duplicateGroups[cleanedHash]) {
            const group = this.duplicateGroups[cleanedHash];
            child.duplicateCount = group.count;
            
            const hasPrimary = group.files.some(f => f.status === 'primary');
            const allDeleted = group.files.every(f => f.status === 'deleted');
            
            if (hasPrimary || allDeleted) {
              child.status = file.status;
            } else {
              child.status = 'unresolved';
            }
          } else {
            child.status = 'normal';
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
      const status = node.status || 'normal';
      nodeElement.className += ` file-node status-${status}`;
      
      const duplicateBadge = node.duplicateCount && node.duplicateCount > 1 
        ? `<span class="duplicate-badge">${node.duplicateCount}</span>` 
        : '';
      
      const cleanFileName = this.cleanFileName(node.name);
      
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
      return child.status !== 'unresolved';
    });
  }

  private hasUnresolvedDuplicates(node: TreeNode): boolean {
    if (!node.children) return false;
    
    return node.children.some(child => {
      if (child.isFolder) {
        return this.hasUnresolvedDuplicates(child);
      }
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
      this.showDuplicateLocations(path);
    } else {
      const file = this.findFileByPath(path);
      if (file && this.duplicateGroups[file.hash]) {
        this.showDuplicateLocations(path);
      } else {
        this.hideDuplicateLocations();
      }
    }
  }

  private findFileByPath(_path: string): FileInfo | null {
    return null;
  }

  private showDuplicateLocations(filePath: string) {
    const fileNode = this.findNodeByPath(this.fileTree!, filePath);
    if (!fileNode || !fileNode.duplicateCount || fileNode.duplicateCount <= 1) {
      this.showStatus('No duplicates found for this file', 'info');
      return;
    }

    // Build list of all duplicate groups ordered by file structure
    this.buildAvailableDuplicateGroups();
    
    if (this.availableDuplicateGroups.length === 0) {
      this.showStatus('No duplicate groups found', 'error');
      return;
    }

    // Find the current group index based on the file path
    let currentGroupIndex = 0;
    const fileName = filePath.split(/[\/\\]/).pop() || filePath;
    
    for (let i = 0; i < this.availableDuplicateGroups.length; i++) {
      const hash = this.availableDuplicateGroups[i];
      const group = this.duplicateGroups[hash];
      const hasFile = group.files.some(file => {
        const groupFileName = file.relativePath.split(/[\/\\]/).pop() || file.relativePath;
        return groupFileName === fileName;
      });
      
      if (hasFile) {
        currentGroupIndex = i;
        break;
      }
    }

    this.currentDuplicateGroupIndex = currentGroupIndex;
    this.currentPopupFile = filePath;
    
    const popup = this.shadow.getElementById('duplicatePopup') as HTMLElement;
    if (popup) {
      popup.style.display = 'block';
    }
    
    this.showDuplicateGroupByIndex(currentGroupIndex);
  }

  private buildAvailableDuplicateGroups() {
    // Get all duplicate groups and sort them by the first file's path for consistent ordering
    this.availableDuplicateGroups = Object.keys(this.duplicateGroups).sort((a, b) => {
      const groupA = this.duplicateGroups[a];
      const groupB = this.duplicateGroups[b];
      
      if (groupA.files.length === 0 || groupB.files.length === 0) return 0;
      
      const firstFileA = groupA.files[0].relativePath;
      const firstFileB = groupB.files[0].relativePath;
      
      return firstFileA.localeCompare(firstFileB);
    });
  }

  hideDuplicateLocations() {
    const popup = this.shadow.getElementById('duplicatePopup') as HTMLElement;
    if (popup) {
      popup.style.display = 'none';
      this.currentPopupFile = null;
      this.currentDuplicateGroupIndex = 0;
      this.availableDuplicateGroups = [];
    }
  }

  navigateToPreviousGroup() {
    if (this.availableDuplicateGroups.length > 1) {
      this.currentDuplicateGroupIndex = (this.currentDuplicateGroupIndex - 1 + this.availableDuplicateGroups.length) % this.availableDuplicateGroups.length;
      this.showDuplicateGroupByIndex(this.currentDuplicateGroupIndex);
    }
  }

  navigateToNextGroup() {
    if (this.availableDuplicateGroups.length > 1) {
      this.currentDuplicateGroupIndex = (this.currentDuplicateGroupIndex + 1) % this.availableDuplicateGroups.length;
      this.showDuplicateGroupByIndex(this.currentDuplicateGroupIndex);
    }
  }

  private showDuplicateGroupByIndex(index: number) {
    if (index < 0 || index >= this.availableDuplicateGroups.length) return;
    
    const hash = this.availableDuplicateGroups[index];
    const duplicateGroup = this.duplicateGroups[hash];
    if (!duplicateGroup) return;

    this.updatePopupContent(duplicateGroup, hash, index);
  }

  private updatePopupContent(duplicateGroup: DuplicateGroup, hash: string, groupIndex: number) {
    const popup = this.shadow.getElementById('duplicatePopup') as HTMLElement;
    const popupContent = this.shadow.getElementById('popupContent') as HTMLElement;
    const navigation = this.shadow.getElementById('popupNavigation') as HTMLElement;
    const navCounter = this.shadow.getElementById('navCounter') as HTMLElement;
    
    if (!popup || !popupContent || !navigation || !navCounter) {
      console.error('Popup elements not found');
      return;
    }

    // Get the first file from the group for display
    const firstFile = duplicateGroup.files[0];
    const selectedFile = firstFile.relativePath;
    
    const cleanSelectedPath = this.cleanFileName(selectedFile);
    const selectedPathParts = cleanSelectedPath.split(/[\/\\]/);
    const selectedFileName = selectedPathParts.pop() || cleanSelectedPath;
    const selectedFolderPath = selectedPathParts.length > 0 ? selectedPathParts.join('/') : '';

    const hasPrimary = duplicateGroup.files.some(f => f.status === 'primary');
    const allDeleted = duplicateGroup.files.every(f => f.status === 'deleted');
    const isResolved = hasPrimary || allDeleted;
    const resolutionStatus = hasPrimary ? 'primary' : allDeleted ? 'deleted' : 'unresolved';

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

    const headerHash = this.shadow.getElementById('headerHash') as HTMLElement;
    if (headerHash) {
      headerHash.textContent = `File: ${hash}`;
    }

    // Update navigation
    if (this.availableDuplicateGroups.length > 1) {
      navigation.style.display = 'flex';
      navCounter.textContent = `${groupIndex + 1} of ${this.availableDuplicateGroups.length}`;
    } else {
      navigation.style.display = 'none';
    }
  }

  private buildDuplicateTreeView(files: { relativePath: string; status: string }[], selectedFile: string): string {
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
            isExpanded: true
          };
          current.children!.push(child);
        }

        if (i === pathParts.length - 1) {
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

  async markAsPrimary(relativePath: string) {
    try {
      if (!this.currentProject) {
        this.showStatus('No project selected', 'error');
        return;
      }

      // Show loading state for the specific button
      this.showButtonLoadingState('primary', relativePath);

      const response = await fetch(`${this.apiBaseUrl}/resolve/${this.currentProject.id}/mark-primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relativePath })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark file as primary');
      }

      const result = await response.json();
      
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

      const response = await fetch(`${this.apiBaseUrl}/resolve/${this.currentProject.id}/mark-deleted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relativePath })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark file as deleted');
      }

      const result = await response.json();
      
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
      this.showStatus('Error marking file as deleted: ' + error, 'error');
    } finally {
      this.hideButtonLoadingState('deleted', relativePath);
    }
  }

  private refreshPopupIfOpen() {
    if (this.currentPopupFile && this.availableDuplicateGroups.length > 0) {
      const popup = this.shadow.getElementById('duplicatePopup') as HTMLElement;
      if (popup && popup.style.display !== 'none') {
        this.showDuplicateGroupByIndex(this.currentDuplicateGroupIndex);
      }
    }
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
      return this.hasUnresolvedDuplicates(node);
    } else {
      return node.status === 'unresolved' && (node.duplicateCount || 0) > 1;
    }
  }

  private updateProjectInfo() {
    if (!this.currentProject) return;
    
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
      </div>
    `;
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

  goBack() {
    // Navigate back to project view page using the main app's navigation
    const event = new CustomEvent('navigate', { detail: 'projectview' });
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

customElements.define('tree-view-page', TreeViewPage);

export { TreeViewPage }; 