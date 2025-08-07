import cssText from './tree-view-page-styles.css?inline';
import { API_CONFIG } from '../../config/api-config';

const sheet = new CSSStyleSheet(); 
sheet.replaceSync(cssText);

// File status constants
const FILE_STATUS = {
  UNRESOLVED: 'unresolved',
  PRIMARY: 'primary',
  DELETED: 'deleted',
  NORMAL: 'normal',
  BULK_DELETED: 'bulk_deleted'
} as const;

// Status display configuration
const STATUS_CONFIG = {
  [FILE_STATUS.UNRESOLVED]: {
    label: 'Unresolved',
    color: '#6c757d',
    icon: '❓',
    description: 'File not yet processed',
    cssClass: 'status-unresolved'
  },
  [FILE_STATUS.PRIMARY]: {
    label: 'Keep',
    color: '#28a745',
    icon: '✅',
    description: 'Marked to keep (from duplicate resolution)',
    cssClass: 'status-primary'
  },
  [FILE_STATUS.DELETED]: {
    label: 'Delete',
    color: '#dc3545',
    icon: '🗑️',
    description: 'Marked to delete (from duplicate resolution)',
    cssClass: 'status-deleted'
  },
  [FILE_STATUS.NORMAL]: {
    label: 'Normal',
    color: '#007bff',
    icon: '📄',
    description: 'Normal file (no duplicates)',
    cssClass: 'status-normal'
  },
  [FILE_STATUS.BULK_DELETED]: {
    label: 'Bulk Delete',
    color: '#8e44ad',
    icon: '⚠️',
    description: 'Marked to delete (from delete mode)',
    cssClass: 'status-bulk-deleted'
  }
} as const;

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
  status: string; // Changed from keyof typeof FILE_STATUS to string to match backend
}

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  status?: string;
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

interface BulkDeleteStats {
  totalFiles: number;
  bulkDeletedFiles: number;
  bulkDeletedFolders: number;
  bulkDeletedPatterns: number;
  recentOperations: Array<{
    id: number;
    operation_type: string;
    target: string;
    files_affected: number;
    created_at: string;
  }>;
}

class TreeViewPage extends HTMLElement {
  public shadow: ShadowRoot;
  private apiBaseUrl: string = API_CONFIG.BASE_URL;
  private currentProject: Project | null = null;
  private fileTree: TreeNode | null = null;
  private duplicateGroups: { [hash: string]: DuplicateGroup } = {};
  private expandedFolders: Set<string> = new Set();
  private showUnresolvedOnly: boolean = false;
  private currentPopupFile: string | null = null;
  private currentDuplicateGroupIndex: number = 0;
  private availableDuplicateGroups: string[] = [];
  
  // Delete mode properties
  private isDeleteMode: boolean = false;
  private bulkDeleteStats: BulkDeleteStats | null = null;
  private selectedFilesForDeletion: Set<string> = new Set();
  private selectedFoldersForDeletion: Set<string> = new Set();

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
            <button id="deleteModeBtn" class="bin-button delete-mode-btn">🗑️ Delete Mode</button>
          </div>
          <div class="controls-right">
            <div class="legend">
              <span class="legend-item unresolved">🟡 Unresolved</span>
              <span class="legend-item primary">🟢 Primary</span>
              <span class="legend-item deleted">🔴 Deleted</span>
              <span class="legend-item normal">⚪ Normal</span>
              <span class="legend-item resolved">✅ Resolved</span>
              <span class="legend-item bulk-deleted">🟣 Bulk Deleted</span>
            </div>
          </div>
        </div>

        <!-- Delete Mode Controls -->
        <div class="delete-mode-controls" id="deleteModeControls" style="display: none;">
          <div class="delete-mode-header">
            <h4>🗑️ Delete Mode Active</h4>
            <div class="delete-mode-stats" id="deleteModeStats"></div>
          </div>
          <div class="delete-mode-actions">
            <button class="bin-button danger-btn" onclick="this.getRootNode().host.showBulkDeleteFolderDialog()">
              🗂️ Delete by Folder
            </button>
            <button class="bin-button danger-btn" onclick="this.getRootNode().host.showBulkDeletePatternDialog()">
              🎯 Delete by Pattern
            </button>
            <button class="bin-button danger-btn" onclick="this.getRootNode().host.executeBulkDeleteSelectedFiles()">
              🗑️ Delete Selected Files
            </button>
            <button class="bin-button warning-btn" onclick="this.getRootNode().host.resetBulkDeleteOperations()">
              🔄 Reset All
            </button>
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

        <!-- Delete Mode Popup -->
        <div class="delete-mode-popup" id="deleteModePopup" style="display: none;">
          <div class="popup-header">
            <div class="header-content">
              <div class="header-title">
                <h5 id="deleteModePopupTitle">Bulk Delete Operation</h5>
              </div>
            </div>
            <button class="close-btn" onclick="this.getRootNode().host.hideDeleteModePopup()">×</button>
          </div>
          <div class="popup-content" id="deleteModePopupContent">
            <!-- Delete mode popup content will be populated dynamically -->
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
    
    // Delete mode event listeners
    this.shadow.getElementById('deleteModeBtn')?.addEventListener('click', () => this.toggleDeleteMode());
    this.shadow.getElementById('bulkDeleteFolderBtn')?.addEventListener('click', () => this.showBulkDeleteFolderDialog());
    this.shadow.getElementById('bulkDeletePatternBtn')?.addEventListener('click', () => this.showBulkDeletePatternDialog());
    this.shadow.getElementById('bulkDeleteFilesBtn')?.addEventListener('click', () => this.executeBulkDeleteSelectedFiles());
    this.shadow.getElementById('resetBulkDeleteBtn')?.addEventListener('click', () => this.resetBulkDeleteOperations());
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
      
      // Load bulk delete stats if in delete mode
      if (this.isDeleteMode) {
        await this.loadBulkDeleteStats(projectId);
      }
      
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

  private async loadBulkDeleteStats(projectId: number) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/delete-mode/${projectId}/stats`);
      if (!response.ok) throw new Error('Failed to load bulk delete stats');
      
      const result = await response.json();
      if (result.success) {
        this.bulkDeleteStats = result.data;
        this.updateDeleteModeStats();
      }
    } catch (error) {
      console.warn('Failed to load bulk delete stats:', error);
    }
  }

  private updateDeleteModeStats() {
    const statsElement = this.shadow.getElementById('deleteModeStats');
    if (!statsElement || !this.bulkDeleteStats) return;

    const selectedFilesCount = this.selectedFilesForDeletion.size;
    const selectedFoldersCount = this.selectedFoldersForDeletion.size;
    
    // Calculate total files that would be affected (including files in selected folders)
    let totalFilesAffected = selectedFilesCount;
    this.selectedFoldersForDeletion.forEach(folderPath => {
      const folder = this.findNodeByPath(this.fileTree!, folderPath);
      if (folder) {
        totalFilesAffected += this.countFilesInFolder(folder);
      }
    });

    statsElement.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${this.bulkDeleteStats.bulkDeletedFiles}</span>
          <span class="stat-label">Files Deleted</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${this.bulkDeleteStats.bulkDeletedFolders}</span>
          <span class="stat-label">Folders Deleted</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${this.bulkDeleteStats.bulkDeletedPatterns}</span>
          <span class="stat-label">Patterns Applied</span>
        </div>
        <div class="stat-item current-selections">
          <span class="stat-number">${totalFilesAffected + selectedFoldersCount}</span>
          <span class="stat-label">Currently Selected</span>
          <small>(${totalFilesAffected} files, ${selectedFoldersCount} folders)</small>
        </div>
      </div>
    `;
  }

  private countFilesInFolder(folder: TreeNode): number {
    let count = 0;
    if (folder.children) {
      folder.children.forEach(child => {
        if (child.isFolder) {
          count += this.countFilesInFolder(child);
        } else {
          count++;
        }
      });
    }
    return count;
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
            
            const hasPrimary = group.files.some(f => f.status === FILE_STATUS.PRIMARY);
            const allDeleted = group.files.every(f => f.status === FILE_STATUS.DELETED);
            
            // Preserve bulk_deleted status, but handle other statuses properly
            if (file.status === FILE_STATUS.BULK_DELETED) {
              child.status = FILE_STATUS.BULK_DELETED;
            } else if (hasPrimary || allDeleted) {
              child.status = file.status;
            } else {
              child.status = FILE_STATUS.UNRESOLVED;
            }
          } else {
            // For non-duplicate files, preserve bulk_deleted but set normal files to normal status
            if (file.status === FILE_STATUS.BULK_DELETED) {
              child.status = FILE_STATUS.BULK_DELETED;
            } else {
              child.status = FILE_STATUS.NORMAL;
            }
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
      const hasBulkDeleted = this.hasAnyBulkDeletedChildren(node);
      
      if (hasUnresolved) {
        nodeElement.className += ' status-unresolved';
      } else if (hasBulkDeleted) {
        nodeElement.className += ' status-bulk-deleted-folder';
      } else if (this.isFolderResolved(node)) {
        nodeElement.className += ' resolved';
      } else {
        // No special status class
      }
      
      const expandIcon = node.isExpanded ? '📂' : '📁';
      const folderName = node.name === '/' ? 'Root' : node.name;
      
      // Add selected class if folder is selected for deletion in delete mode
      if (this.isDeleteMode && this.selectedFoldersForDeletion.has(node.path)) {
        nodeElement.className += ' selected-for-deletion';
      }
      
      // Add delete mode selection button if in delete mode
      const deleteModeButton = this.isDeleteMode ? `
        <button class="bin-button small danger-btn folder-select-btn" onclick="this.getRootNode().host.toggleFolderSelection('${node.path}')">
          ${this.selectedFoldersForDeletion.has(node.path) ? '✓ Selected' : 'Select for Deletion'}
        </button>
      ` : '';
      
      nodeElement.innerHTML = `
        <div class="node-content">
          <div class="node-info" onclick="this.getRootNode().host.toggleFolder('${node.path}')">
            <span class="expand-icon">${expandIcon}</span>
            <span class="node-name">${folderName}</span>
            ${deleteModeButton}
          </div>
        </div>
        <div class="node-children" style="display: ${node.isExpanded ? 'block' : 'none'}">
          ${node.children?.filter(child => this.shouldShowNode(child)).map(child => this.createTreeNodeElement(child).outerHTML).join('') || ''}
        </div>
      `;
    } else {
      const status = node.status || FILE_STATUS.NORMAL;
      // Map status values to correct CSS class names
      const statusClass = status === FILE_STATUS.BULK_DELETED ? 'status-bulk-deleted' : `status-${status}`;
      nodeElement.className += ` file-node ${statusClass}`;
      
      // Check if file is selected for deletion (either directly or via parent folder)
      const isDirectlySelected = this.selectedFilesForDeletion.has(node.relativePath || node.path);
      const isSelectedViaParent = this.isFileSelectedViaParentFolder(node.path);
      const isSelected = isDirectlySelected || isSelectedViaParent;
      
      if (this.isDeleteMode && isSelected) {
        nodeElement.className += ' selected-for-deletion';
      }
      
      const duplicateBadge = node.duplicateCount && node.duplicateCount > 1 
        ? `<span class="duplicate-badge">${node.duplicateCount}</span>` 
        : '';
      
      const cleanFileName = this.cleanFileName(node.name);
      
      const actionButtons = node.duplicateCount && node.duplicateCount > 1 ? `
        <div class="file-actions">
          <button class="bin-button small primary-btn" onclick="this.getRootNode().host.markAsPrimary('${node.relativePath || node.path}')" ${status === FILE_STATUS.PRIMARY ? 'disabled' : ''}>
            ${status === FILE_STATUS.PRIMARY ? '✓ Primary' : 'Mark Primary'}
          </button>
          <button class="bin-button small delete-btn" onclick="this.getRootNode().host.markAsDeleted('${node.relativePath || node.path}')" ${status === FILE_STATUS.DELETED ? 'disabled' : ''}>
            ${status === FILE_STATUS.DELETED ? '🗑️ Deleted' : 'Mark Deleted'}
          </button>
          <button class="bin-button small view-btn" onclick="this.getRootNode().host.showDuplicateLocations('${node.path}')">
            👁️ View All
          </button>
        </div>
      ` : '';

      // Add delete mode selection button if in delete mode and file is not already bulk deleted
      // Don't show individual selection button if file is selected via parent folder
      const deleteModeButton = this.isDeleteMode && status !== FILE_STATUS.BULK_DELETED && !isSelectedViaParent ? `
        <button class="bin-button small danger-btn file-select-btn" onclick="this.getRootNode().host.toggleFileSelection('${node.relativePath || node.path}')">
          ${isDirectlySelected ? '✓ Selected' : 'Select for Deletion'}
        </button>
      ` : isSelectedViaParent ? `
        <span class="selected-via-parent">✓ Selected via folder</span>
      ` : '';

      // Add unselect button for bulk deleted files in delete mode
      const unselectButton = this.isDeleteMode && status === FILE_STATUS.BULK_DELETED ? `
        <button class="bin-button small warning-btn file-unselect-btn" onclick="this.getRootNode().host.unselectBulkDeletedFile('${node.relativePath || node.path}')">
          🔄 Unselect from Bulk Delete
        </button>
      ` : '';

      nodeElement.innerHTML = `
        <div class="node-content">
          <div class="node-info" data-file-path="${node.path}" data-status="${status}" data-has-duplicates="${node.duplicateCount && node.duplicateCount > 1}">
            <span class="file-icon">📄</span>
            <span class="node-name">${cleanFileName}</span>
            ${duplicateBadge}
            ${deleteModeButton}
            ${unselectButton}
          </div>
          ${actionButtons}
        </div>
      `;
      
      // Add event listener for file node click
      const nodeInfo = nodeElement.querySelector('.node-info');
      if (nodeInfo) {
        nodeInfo.addEventListener('click', (_event) => {
          const filePath = nodeInfo.getAttribute('data-file-path');
          const status = nodeInfo.getAttribute('data-status');
          const hasDuplicates = nodeInfo.getAttribute('data-has-duplicates') === 'true';
          if (filePath && status) {
            this.handleFileNodeClick(filePath, status, hasDuplicates);
          }
        });
      }
    }
    
    return nodeElement;
  }

  private isFolderResolved(folder: TreeNode): boolean {
    if (!folder.children) return true;
    
    return folder.children.every(child => {
      if (child.isFolder) {
        return this.isFolderResolved(child);
      }
      return child.status !== FILE_STATUS.UNRESOLVED;
    });
  }

  private hasUnresolvedDuplicates(node: TreeNode): boolean {
    if (!node.children) return false;
    
    return node.children.some(child => {
      if (child.isFolder) {
        return this.hasUnresolvedDuplicates(child);
      }
      // Only mark as unresolved if the file has duplicates AND is actually unresolved
      const hasUnresolvedDuplicates = child.status === FILE_STATUS.UNRESOLVED && child.duplicateCount && child.duplicateCount > 1;
      return hasUnresolvedDuplicates;
    });
  }

  private hasAnyBulkDeletedChildren(node: TreeNode): boolean {
    if (!node.children) return false;
    
    return node.children.some(child => {
      if (child.isFolder) {
        return this.hasAnyBulkDeletedChildren(child);
      }
      return child.status === FILE_STATUS.BULK_DELETED;
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

    const hasPrimary = duplicateGroup.files.some(f => f.status === FILE_STATUS.PRIMARY);
    const allDeleted = duplicateGroup.files.every(f => f.status === FILE_STATUS.DELETED);
    const isResolved = hasPrimary || allDeleted;
    const resolutionStatus = hasPrimary ? FILE_STATUS.PRIMARY : allDeleted ? FILE_STATUS.DELETED : FILE_STATUS.UNRESOLVED;

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
                <span class="file-status status-${resolutionStatus}">${STATUS_CONFIG[resolutionStatus as keyof typeof STATUS_CONFIG].label}</span>
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
          child.status = file.status;
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
      const status = node.status || FILE_STATUS.NORMAL;
      const isSelected = node.relativePath === selectedFile;
      const cleanFileName = this.cleanFileName(node.name);
      
      return `
        <div class="duplicate-tree-node file-node status-${status} ${isSelected ? 'selected' : ''}">
          <div class="node-content">
            <div class="node-info">
              <span class="file-icon">📄</span>
              <span class="node-name">${cleanFileName}</span>
              ${isSelected ? '<span class="selected-indicator">← Selected</span>' : ''}
              <span class="file-status-badge status-${status}">${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}</span>
            </div>
            <div class="file-actions">
              <button class="bin-button small primary-btn" onclick="this.getRootNode().host.markAsPrimary('${node.relativePath}')" ${status === FILE_STATUS.PRIMARY ? 'disabled' : ''}>
                ${status === FILE_STATUS.PRIMARY ? '✓ Primary' : 'Mark Primary'}
              </button>
              <button class="bin-button small delete-btn" onclick="this.getRootNode().host.markAsDeleted('${node.relativePath}')" ${status === FILE_STATUS.DELETED ? 'disabled' : ''}>
                ${status === FILE_STATUS.DELETED ? '🗑️ Deleted' : 'Mark Deleted'}
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
      return node.status === FILE_STATUS.UNRESOLVED && (node.duplicateCount || 0) > 1;
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

  private async toggleDeleteMode() {
    this.isDeleteMode = !this.isDeleteMode;
    const deleteModeBtn = this.shadow.getElementById('deleteModeBtn') as HTMLButtonElement;
    const deleteModeControls = this.shadow.getElementById('deleteModeControls') as HTMLElement;

    if (this.isDeleteMode) {
      deleteModeBtn.textContent = '🔙 Exit Delete Mode';
      deleteModeBtn.className = 'bin-button delete-mode-btn active';
      deleteModeControls.style.display = 'block';
      this.showStatus('Delete mode activated. Refreshing data...', 'info');
      
      // Refresh data when entering delete mode to show current bulk deleted status
      if (this.currentProject) {
        await this.loadProjectTree(this.currentProject.id);
        await this.loadBulkDeleteStats(this.currentProject.id);
        this.renderFileTree();
        this.showStatus('Delete mode activated. Select files to delete.', 'success');
      }
    } else {
      deleteModeBtn.textContent = '🗑️ Delete Mode';
      deleteModeBtn.className = 'bin-button delete-mode-btn';
      deleteModeControls.style.display = 'none';
      this.showStatus('Delete mode deactivated. Refreshing data...', 'info');
      this.selectedFilesForDeletion.clear();
      this.selectedFoldersForDeletion.clear();
      
      // Refresh data when exiting delete mode to show current file statuses
      if (this.currentProject) {
        await this.loadProjectTree(this.currentProject.id);
        this.renderFileTree();
        this.showStatus('Delete mode deactivated.', 'success');
      }
    }
  }

  private showBulkDeleteFolderDialog() {
    const popup = this.shadow.getElementById('deleteModePopup') as HTMLElement;
    const title = this.shadow.getElementById('deleteModePopupTitle') as HTMLElement;
    const content = this.shadow.getElementById('deleteModePopupContent') as HTMLElement;
    
    if (popup && title && content) {
      title.textContent = 'Bulk Delete Folder';
      content.innerHTML = `
        <div class="delete-dialog">
          <p>Enter the folder path to delete all files within that folder:</p>
          <input type="text" id="folderPathInput" placeholder="e.g., temp, logs, cache" class="input-field">
          <div class="dialog-actions">
            <button class="bin-button danger-btn" onclick="this.getRootNode().host.executeBulkDeleteFolder()">🗑️ Delete Folder</button>
            <button class="bin-button" onclick="this.getRootNode().host.hideDeleteModePopup()">Cancel</button>
          </div>
        </div>
      `;
      popup.style.display = 'block';
    }
  }

  private showBulkDeletePatternDialog() {
    const popup = this.shadow.getElementById('deleteModePopup') as HTMLElement;
    const title = this.shadow.getElementById('deleteModePopupTitle') as HTMLElement;
    const content = this.shadow.getElementById('deleteModePopupContent') as HTMLElement;
    
    if (popup && title && content) {
      title.textContent = 'Bulk Delete by Pattern';
      content.innerHTML = `
        <div class="delete-dialog">
          <p>Enter a file pattern to delete matching files:</p>
          <input type="text" id="patternInput" placeholder="e.g., *.log, temp*, cache/*" class="input-field">
          <div class="pattern-examples">
            <small>Examples: *.log, temp*, cache/*, *.tmp</small>
          </div>
          <div class="dialog-actions">
            <button class="bin-button danger-btn" onclick="this.getRootNode().host.executeBulkDeletePattern()">🗑️ Delete by Pattern</button>
            <button class="bin-button" onclick="this.getRootNode().host.hideDeleteModePopup()">Cancel</button>
          </div>
        </div>
      `;
      popup.style.display = 'block';
    }
  }

  async executeBulkDeleteFolder() {
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }

    const folderPathInput = this.shadow.getElementById('folderPathInput') as HTMLInputElement;
    if (!folderPathInput) return;

    const folderPath = folderPathInput.value.trim();
    if (!folderPath) {
      this.showStatus('Please enter a folder path', 'error');
      return;
    }

    const confirm = window.confirm(`Are you sure you want to delete all files in the folder "${folderPath}"? This action cannot be undone.`);
    if (!confirm) {
      return;
    }

    this.showLoadingState('Deleting folder contents...');
    this.hideDeleteModePopup();

    try {
      const requestBody = { folderPath: folderPath };
      
      const response = await fetch(`${this.apiBaseUrl}/delete-mode/${this.currentProject.id}/folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete folder');
      }

      const result = await response.json();
      
      if (result.success) {
        this.showStatus(`Successfully deleted folder: ${folderPath}`, 'success');
        
        // Update local file tree immediately for files in the deleted folder
        this.updateFilesInFolderStatus(folderPath, FILE_STATUS.BULK_DELETED);
        
        // Re-render the tree with updated statuses with a small delay to ensure proper sync
        setTimeout(() => {
          this.renderFileTree();
        }, 10);
        
        // Also reload bulk delete stats
        await this.loadBulkDeleteStats(this.currentProject.id);
      } else {
        throw new Error(result.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('🔧 Folder deletion error:', error);
      this.showStatus('Error deleting folder: ' + error, 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  async executeBulkDeletePattern() {
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }

    const patternInput = this.shadow.getElementById('patternInput') as HTMLInputElement;
    if (!patternInput) return;

    const pattern = patternInput.value.trim();
    if (!pattern) {
      this.showStatus('Please enter a pattern', 'error');
      return;
    }

    const confirm = window.confirm(`Are you sure you want to delete all files matching the pattern "${pattern}"? This action cannot be undone.`);
    if (!confirm) {
      return;
    }

    this.showLoadingState('Deleting files by pattern...');
    this.hideDeleteModePopup();

    try {
      const response = await fetch(`${this.apiBaseUrl}/delete-mode/${this.currentProject.id}/pattern`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete by pattern');
      }

      const result = await response.json();
      if (result.success) {
        this.showStatus(`Successfully deleted files matching pattern: ${pattern}`, 'success');
        
        // For pattern deletion, we need to reload the tree since we don't know exactly which files were affected
        // But we can still update the UI immediately by reloading the tree
        await this.loadProjectTree(this.currentProject.id);
        
        // Re-render the tree with updated statuses with a small delay to ensure proper sync
        setTimeout(() => {
          this.renderFileTree();
        }, 10);
        
        // Also reload bulk delete stats
        await this.loadBulkDeleteStats(this.currentProject.id);
      } else {
        throw new Error(result.error || 'Failed to delete by pattern');
      }
    } catch (error) {
      this.showStatus('Error deleting by pattern: ' + error, 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  private executeBulkDeleteSelectedFiles() {
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }

    // Debug logging
    const totalSelected = this.selectedFilesForDeletion.size + this.selectedFoldersForDeletion.size;
    if (totalSelected === 0) {
      this.showStatus('No files or folders selected for deletion.', 'info');
      return;
    }

    const confirm = window.confirm(`Are you sure you want to delete ${this.selectedFilesForDeletion.size} files and ${this.selectedFoldersForDeletion.size} folders? This action cannot be undone.`);
    if (!confirm) {
      return;
    }

    this.showLoadingState('Performing bulk deletion...');

    // Handle selected files - use the correct API format
    const filePromises = this.selectedFilesForDeletion.size > 0 ? 
      fetch(`${this.apiBaseUrl}/delete-mode/${this.currentProject.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filePaths: Array.from(this.selectedFilesForDeletion) 
        })
      }).then(async res => {
        console.log('🔧 File deletion response:', res.status, res.statusText);
        if (!res.ok) {
          const errorData = await res.json();
          console.error('🔧 File deletion error:', errorData);
          throw new Error(errorData.error || 'Failed to perform file deletion');
        }
        const result = await res.json();
        console.log('🔧 File deletion result:', result);
        return result;
      }) : Promise.resolve({ success: true });

    // Handle selected folders - use the correct API format
    const folderPromises = Array.from(this.selectedFoldersForDeletion).map(folderPath => {
      console.log('🔧 Deleting folder:', folderPath);
      return fetch(`${this.apiBaseUrl}/delete-mode/${this.currentProject!.id}/folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          folderPath: folderPath 
        })
      }).then(async res => {
        console.log('🔧 Folder deletion response for', folderPath, ':', res.status, res.statusText);
        if (!res.ok) {
          const errorData = await res.json();
          console.error('🔧 Folder deletion error for', folderPath, ':', errorData);
          throw new Error(errorData.error || `Failed to delete folder: ${folderPath}`);
        }
        const result = await res.json();
        console.log('🔧 Folder deletion result for', folderPath, ':', result);
        return result;
      });
    });

    // Validate that we have actual data to send
    if (this.selectedFilesForDeletion.size === 0 && this.selectedFoldersForDeletion.size === 0) {
      console.error('🔧 No files or folders selected for deletion!');
      this.showStatus('No files or folders selected for deletion.', 'error');
      this.hideLoadingState();
      return;
    }

    // Execute all deletions
    Promise.all([filePromises, ...folderPromises])
      .then(async results => {
        console.log('🔧 Bulk delete results:', results);
        // Check if all results are successful (either have success: true or are valid response objects)
        const allSuccessful = results.every(result => {
          // If result has a success property, check it
          if (result.hasOwnProperty('success')) {
            return result.success;
          }
          // If result has operationType, it's a successful API response
          if (result.hasOwnProperty('operationType')) {
            return true;
          }
          // Default to false for unknown response types
          return false;
        });
        if (allSuccessful) {
          this.showStatus('Bulk deletion successful!', 'success');
          
          // Store the selected items before clearing them
          const selectedFiles = Array.from(this.selectedFilesForDeletion);
          const selectedFolders = Array.from(this.selectedFoldersForDeletion);
          
          console.log('🔧 Updating file statuses:', { selectedFiles, selectedFolders });
          
          // Clear selections first
          this.selectedFilesForDeletion.clear();
          this.selectedFoldersForDeletion.clear();
          
          // Update local file tree immediately for selected files
          selectedFiles.forEach(filePath => {
            console.log('🔧 Updating file status:', filePath, 'to', FILE_STATUS.BULK_DELETED);
            this.updateFileStatusInTree(filePath, FILE_STATUS.BULK_DELETED);
          });
          
          // Update local file tree immediately for files in selected folders
          selectedFolders.forEach(folderPath => {
            console.log('🔧 Updating folder status:', folderPath, 'to', FILE_STATUS.BULK_DELETED);
            this.updateFilesInFolderStatus(folderPath, FILE_STATUS.BULK_DELETED);
          });
          
          // Force a complete rerender of the tree with a small delay to ensure proper sync
          console.log('🔧 Rerendering tree...');
          setTimeout(() => {
            this.renderFileTree();
            console.log('🔧 Tree rerendered');
          }, 10);
          
          // Also reload bulk delete stats
          if (this.currentProject) {
            await this.loadBulkDeleteStats(this.currentProject.id);
          }
        } else {
          throw new Error('Some deletions failed');
        }
      })
      .catch(error => {
        console.error('🔧 Bulk deletion error:', error);
        this.showStatus('Error performing bulk deletion: ' + error, 'error');
      })
      .finally(() => {
        this.hideLoadingState();
      });
  }

  private resetBulkDeleteOperations() {
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }

    const confirm = window.confirm('Are you sure you want to reset all bulk deletion operations for this project? This action cannot be undone.');
    if (!confirm) {
      return;
    }

    this.showLoadingState('Resetting bulk deletion operations...');

    fetch(`${this.apiBaseUrl}/delete-mode/${this.currentProject.id}/reset`, {
      method: 'POST'
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to reset bulk deletions');
      }
      const result = await res.json();
      if (result.success) {
        this.showStatus('Bulk deletion operations reset successfully!', 'success');
        this.loadProjectTree(this.currentProject!.id);
        this.bulkDeleteStats = null; // Clear stats
        this.renderFileTree();
      } else {
        throw new Error(result.error || 'Failed to reset bulk deletions');
      }
    }).catch(error => {
      this.showStatus('Error resetting bulk deletion operations: ' + error, 'error');
    }).finally(() => {
      this.hideLoadingState();
    });
  }

  private hideDeleteModePopup() {
    const popup = this.shadow.getElementById('deleteModePopup') as HTMLElement;
    if (popup) {
      popup.style.display = 'none';
    }
  }

  toggleFileSelection(relativePath: string) {
    if (this.selectedFilesForDeletion.has(relativePath)) {
      this.selectedFilesForDeletion.delete(relativePath);
    } else {
      this.selectedFilesForDeletion.add(relativePath);
    }
    this.renderFileTree(); // Re-render to update selection indicators
    this.updateDeleteModeStats(); // Update stats to show current selections
  }

  toggleFolderSelection(folderPath: string) {
    if (this.selectedFoldersForDeletion.has(folderPath)) {
      // Remove folder and all its child files from selection
      this.selectedFoldersForDeletion.delete(folderPath);
      this.removeChildFilesFromSelection(folderPath);
    } else {
      // Add folder and all its child files to selection
      this.selectedFoldersForDeletion.add(folderPath);
      this.addChildFilesToSelection(folderPath);
    }
    this.renderFileTree(); // Re-render to update selection indicators
    this.updateDeleteModeStats(); // Update stats to show current selections
  }

  private addChildFilesToSelection(folderPath: string) {
    const folder = this.findNodeByPath(this.fileTree!, folderPath);
    if (folder && folder.children) {
      folder.children.forEach(child => {
        if (child.isFolder) {
          // Recursively add child folders and their files
          this.addChildFilesToSelection(child.path);
        } else {
          // Add individual file to selection
          const filePath = child.relativePath || child.path;
          this.selectedFilesForDeletion.add(filePath);
        }
      });
    }
  }

  private removeChildFilesFromSelection(folderPath: string) {
    const folder = this.findNodeByPath(this.fileTree!, folderPath);
    if (folder && folder.children) {
      folder.children.forEach(child => {
        if (child.isFolder) {
          // Recursively remove child folders and their files
          this.removeChildFilesFromSelection(child.path);
        } else {
          // Remove individual file from selection
          const filePath = child.relativePath || child.path;
          this.selectedFilesForDeletion.delete(filePath);
        }
      });
    }
  }

  private isFileSelectedViaParentFolder(filePath: string): boolean {
    const pathParts = filePath.split(/[\/\\]/);
    let currentPath = '';
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!part) continue;
      currentPath = `${currentPath}/${part}`;
      if (this.selectedFoldersForDeletion.has(currentPath)) {
        return true;
      }
    }
    return false;
  }

  private updateFileStatusInTree(relativePath: string, newStatus: string) {
    if (!this.fileTree) return;
    
    console.log('🔧 updateFileStatusInTree called for:', relativePath, 'new status:', newStatus);
    
    // Find the file node in the tree and update its status
    const updateNodeStatus = (node: TreeNode): boolean => {
      if (node.relativePath === relativePath) {
        console.log('🔧 Found file node:', node.name, 'old status:', node.status, 'new status:', newStatus);
        node.status = newStatus;
        return true; // Found and updated
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (updateNodeStatus(child)) {
            return true; // Found and updated in child
          }
        }
      }
      
      return false; // Not found
    };
    
    const updated = updateNodeStatus(this.fileTree);
    console.log('🔧 updateFileStatusInTree result:', updated);
  }

  private updateFilesInFolderStatus(folderPath: string, newStatus: string) {
    if (!this.fileTree) return;
    
    // Find the folder node and update all files within it
    const updateFolderFiles = (node: TreeNode): boolean => {
      if (node.path === folderPath) {
        // Update all files in this folder
        this.updateAllFilesInNode(node, newStatus);
        return true; // Found and updated
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (updateFolderFiles(child)) {
            return true; // Found and updated in child
          }
        }
      }
      
      return false; // Not found
    };
    
    updateFolderFiles(this.fileTree);
  }

  private updateAllFilesInNode(node: TreeNode, newStatus: string) {
    if (!node.children) return;
    
    node.children.forEach(child => {
      if (child.isFolder) {
        // Recursively update files in subfolders
        this.updateAllFilesInNode(child, newStatus);
      } else {
        // Update file status
        child.status = newStatus;
      }
    });
  }

  async unselectBulkDeletedFile(relativePath: string) {
    console.log('🔧 unselectBulkDeletedFile called with:', relativePath);
    
    if (!this.currentProject) {
      this.showStatus('No project selected', 'error');
      return;
    }

    try {
      // URL encode the file path for the API endpoint
      const encodedFilePath = encodeURIComponent(relativePath);
      console.log('🔧 Making unselect API call to:', `${this.apiBaseUrl}/delete-mode/${this.currentProject.id}/files/${encodedFilePath}`);
      
      const response = await fetch(`${this.apiBaseUrl}/delete-mode/${this.currentProject.id}/files/${encodedFilePath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('🔧 Unselect response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔧 Unselect API error:', errorData);
        throw new Error(errorData.error || 'Failed to unselect file from bulk deletion');
      }

      const result = await response.json();
      console.log('🔧 Unselect API result:', result);
      
      // Check if the API call was successful (either has success property or has message indicating success)
      const isSuccessful = result.success || (result.message && result.message.includes('removed from bulk delete status'));
      
      if (isSuccessful) {
        this.showStatus('File unselected from bulk deletion', 'success');
        
        console.log('🔧 Updating file status to NORMAL for:', relativePath);
        // Update the local file tree immediately
        this.updateFileStatusInTree(relativePath, FILE_STATUS.NORMAL);
        
        // Re-render the tree with updated statuses with a small delay to ensure proper sync
        console.log('🔧 Scheduling tree rerender...');
        setTimeout(() => {
          console.log('🔧 Executing tree rerender for unselect...');
          this.renderFileTree();
          console.log('🔧 Tree rerender completed for unselect');
        }, 10);
        
        // Also reload bulk delete stats
        await this.loadBulkDeleteStats(this.currentProject.id);
      } else {
        throw new Error(result.error || 'Failed to unselect file from bulk deletion');
      }
    } catch (error) {
      console.error('🔧 Unselect error:', error);
      this.showStatus('Error unselecting file from bulk deletion: ' + error, 'error');
    }
  }
}

customElements.define('tree-view-page', TreeViewPage);

export { TreeViewPage };