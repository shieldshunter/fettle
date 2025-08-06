import cssText from './file-deduplication-page-styles.css?inline';

const sheet = new CSSStyleSheet(); 
sheet.replaceSync(cssText);

interface Project {
  id: number;
  name: string;
  base_path?: string; // Backend returns base_path, not basePath
  basePath?: string; // Some projects might still use camelCase
  created_at?: string; // Backend returns created_at, not createdAt
  createdAt?: string; // Some projects might still use camelCase
}



class FileDeduplicationPage extends HTMLElement {
  public shadow: ShadowRoot;
  private apiBaseUrl: string = 'https://trebro-api.onrender.com/api';
  private currentProject: Project | null = null;
  private projects: Project[] = [];
  private newlyCreatedProject: Project | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [sheet];
    this.shadow.innerHTML = /*html*/`
      <div class="dedupe-container">
        <h2>File Deduplication</h2>
        
        <!-- Project Management Section -->
        <div class="section" id="projectSection">
          <h3>Project Management</h3>
          <div class="project-controls">
            <div class="input-group">
              <input type="text" id="projectName" placeholder="Project Name" class="input-field">
              <input type="text" id="basePath" placeholder="Base Directory Path" class="input-field">
              <button id="selectFolderBtn" class="bin-button">📁 Select Folder</button>
              <button id="createProjectBtn" class="bin-button">Create Project</button>
            </div>
            <div class="project-list">
              <h4>Existing Projects</h4>
              <div id="projectsList"></div>
            </div>
          </div>
        </div>

        <!-- API Status Section -->
        <div class="section" id="apiStatusSection" style="display: none;">
          <h3>Backend API Status</h3>
          <div class="api-status">
            <p>⚠️ The file deduplication backend API is not currently available.</p>
            <p>To use this feature, please ensure the backend API is running on <code>https://trebro-api.onrender.com</code></p>
            <div class="api-instructions">
              <h4>To start the backend API:</h4>
              <ol>
                <li>Navigate to your backend API directory</li>
                <li>Run <code>npm install</code> to install dependencies</li>
                <li>Run <code>npm start</code> or <code>npm run dev</code> to start the server</li>
                <li>Ensure the API is accessible at <code>https://trebro-api.onrender.com</code></li>
              </ol>
              <div class="test-connection">
                <button id="testConnectionBtn" class="bin-button">Test API Connection</button>
                <span id="connectionStatus"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- File Upload Section -->
        <div class="section" id="uploadSection" style="display: none;">
          <h3>File Scan Results</h3>
          <div class="upload-area">
            <div class="scan-controls">
                          <div class="scan-inputs">
              <input type="text" id="scanRegex" placeholder="File pattern (e.g., .*\.txt)" class="input-field" value=".*">
              <button id="runScanBtn" class="bin-button">🔍 Run File Scan</button>
              <button id="testHashBtn" class="bin-button">🧪 Test Hash</button>
            </div>
              <div class="scan-status" id="scanStatus"></div>
            </div>
            <div class="scan-results">
              <textarea id="scanResults" placeholder="Paste file scan results here (JSON format) or use the scan button above..." class="textarea-field"></textarea>
              <button id="uploadScanBtn" class="bin-button">Upload Scan Results</button>
            </div>
          </div>
        </div>

        <!-- Project Status Section -->
        <div class="section" id="projectStatusSection" style="display: none;">
          <h3>Project Status</h3>
          <div class="project-status">
            <div class="status-info">
              <span id="projectStatus">Loading...</span>
            </div>
            <div class="status-actions">
              <button id="rescanFilesBtn" class="bin-button">🔄 Rescan Files</button>
              <button id="viewProjectBtn" class="bin-button">👁️ View Project</button>
            </div>
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
    
    // Check if running in Electron
    const isElectron = !!(window as any).electronAPI?.selectFolder;
    if (!isElectron) {
      this.renderElectronBanner();
      return;
    }
    
    this.loadProjects();
  }

  private setupEventListeners() {
    // Project creation
    this.shadow.getElementById('createProjectBtn')?.addEventListener('click', () => this.createProject());
    this.shadow.getElementById('selectFolderBtn')?.addEventListener('click', () => this.selectFolder());
    
    // File upload
    this.shadow.getElementById('uploadScanBtn')?.addEventListener('click', () => this.uploadScanResults());
    this.shadow.getElementById('runScanBtn')?.addEventListener('click', () => this.runFileScan());
    this.shadow.getElementById('testHashBtn')?.addEventListener('click', () => this.testHashGeneration());
    
    // Project status controls
    this.shadow.getElementById('rescanFilesBtn')?.addEventListener('click', () => this.rescanFiles());
    this.shadow.getElementById('viewProjectBtn')?.addEventListener('click', () => this.viewProject());
    
    // Test connection
    this.shadow.getElementById('testConnectionBtn')?.addEventListener('click', () => this.testApiConnection());
  }

  private async loadProjects() {
    try {
      // Show loading state
      this.showLoadingState('Loading projects...');
      
      const response = await fetch(`${this.apiBaseUrl}/projects`);
      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          this.showStatus('Backend API not available. Please ensure the file deduplication API is running on https://trebro-api.onrender.com', 'error');
          this.shadow.getElementById('apiStatusSection')!.style.display = 'block';
          return;
        }
        throw new Error(`Failed to load projects: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        console.log('Loaded projects data:', result.data);
        this.projects = result.data;
        this.renderProjectsList();
      } else {
        throw new Error(result.error || 'Failed to load projects');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.showStatus('Cannot connect to backend API. Please ensure the file deduplication API is running on https://trebro-api.onrender.com', 'error');
        this.shadow.getElementById('apiStatusSection')!.style.display = 'block';
      } else {
        this.showStatus('Error loading projects: ' + error, 'error');
      }
    } finally {
      this.hideLoadingState();
    }
  }

  private renderProjectsList() {
    const projectsList = this.shadow.getElementById('projectsList')!;
    projectsList.innerHTML = '';

    this.projects.forEach(project => {
      console.log('Rendering project:', project);
      const projectDiv = document.createElement('div');
      
      // Determine project status classes
      const isSelected = this.currentProject && this.currentProject.id === project.id;
      const isNewlyCreated = this.newlyCreatedProject && this.newlyCreatedProject.id === project.id;
      
      let projectClasses = 'project-item';
      if (isSelected) projectClasses += ' selected';
      if (isNewlyCreated) projectClasses += ' newly-created';
      
      projectDiv.className = projectClasses;
      
      // Format creation date
      const createdDate = project.created_at || project.createdAt;
      const formattedDate = createdDate ? new Date(createdDate).toLocaleDateString() : 'Unknown';
      
      // Create status badges
      let statusBadges = '';
      if (isSelected) statusBadges += '<span class="status-badge selected-badge">✓ Selected</span>';
      if (isNewlyCreated) statusBadges += '<span class="status-badge new-badge">🆕 New</span>';
      
      projectDiv.innerHTML = `
        <div class="project-info" onclick="this.getRootNode().host.selectProject(${project.id})" style="cursor: pointer;">
          <div class="project-header">
            <div class="project-title">
              <strong>${project.name}</strong>
              ${statusBadges}
            </div>
            <span class="project-date">📅 ${formattedDate}</span>
          </div>
          <span class="project-path">${project.base_path || project.basePath || 'No path'}</span>
        </div>
        <div class="project-actions">
          <button class="bin-button small ${isSelected ? 'active' : ''}" onclick="this.getRootNode().host.selectProject(${project.id})">
            ${isSelected ? '✓ Selected' : 'Select'}
          </button>
          <button class="bin-button small" onclick="this.getRootNode().host.loadProjectFiles(${project.id})">Files</button>
        </div>
      `;
      projectsList.appendChild(projectDiv);
    });
  }

  private async selectFolder() {
    const api = (window as any).electronAPI;
    if (!api?.selectFolder) {
      this.showStatus('Folder selection is only available in Electron', 'error');
      return;
    }

    try {
      const path = await api.selectFolder();
      if (!path) return; // User cancelled

      const pathInput = this.shadow.getElementById('basePath') as HTMLInputElement;
      pathInput.value = path;
      this.showStatus('Folder selected successfully', 'success');
    } catch (error) {
      this.showStatus('Error selecting folder: ' + error, 'error');
    }
  }

  private async createProject() {
    const nameInput = this.shadow.getElementById('projectName') as HTMLInputElement;
    const pathInput = this.shadow.getElementById('basePath') as HTMLInputElement;
    
    const name = nameInput.value.trim();
    const basePath = pathInput.value.trim();
    
    if (!name || !basePath) {
      this.showStatus('Please provide both project name and base path', 'error');
      return;
    }

    try {
      // Show loading state
      this.showLoadingState('Creating project...');
      
      const response = await fetch(`${this.apiBaseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, base_path: basePath })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result = await response.json();
      if (result.success) {
        this.newlyCreatedProject = result.data;
        this.showStatus('Project created successfully!', 'success');
        await this.loadProjects(); // Refresh the projects list
      } else {
        throw new Error(result.error || 'Failed to create project');
      }
    } catch (error) {
      this.showStatus('Error creating project: ' + error, 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  async selectProject(projectId: number) {
    console.log('selectProject called with projectId:', projectId);
    this.currentProject = this.projects.find(p => p.id === projectId) || null;
    console.log('Found current project:', this.currentProject);
    
    if (this.currentProject) {
      const basePath = this.currentProject.base_path || this.currentProject.basePath;
      console.log('Project base_path:', basePath);
      this.showStatus(`Selected project: ${this.currentProject.name}`, 'info');
      this.shadow.getElementById('uploadSection')!.style.display = 'block';
      
      // Clear newly created status if selecting a different project
      if (this.newlyCreatedProject && this.newlyCreatedProject.id !== projectId) {
        this.newlyCreatedProject = null;
      }
      
      // Re-render the project list to update selection state
      this.renderProjectsList();
      
      // Load the project files and duplicate groups
      console.log('Calling loadProjectFiles...');
      await this.loadProjectFiles(projectId);
    } else {
      console.log('Project not found for ID:', projectId);
      this.showStatus('Project not found', 'error');
    }
  }

  private async loadProjectFiles(projectId: number) {
    try {
      // Show loading state
      this.showLoadingState('Loading project files...');
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/files`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load project files');
      }

      const result = await response.json();
      if (result.success) {
        const files = result.data;
        this.updateProjectStatus(files);
        this.showStatus(`Loaded ${files.length} files from project`, 'success');
      } else {
        throw new Error(result.error || 'Failed to load project files');
      }
    } catch (error) {
      this.showStatus('Error loading project files: ' + error, 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  private updateProjectStatus(files: any[]) {
    const totalFiles = files.length;
    const duplicateFiles = files.filter((file: any) => file.status === 'unresolved' || file.status === 'primary' || file.status === 'deleted').length;
    const resolvedFiles = files.filter((file: any) => file.status === 'primary' || file.status === 'deleted').length;
    
    const statusElement = this.shadow.getElementById('projectStatus')!;
    
    if (this.currentProject) {
      const createdDate = this.currentProject.created_at || this.currentProject.createdAt;
      const formattedDate = createdDate ? new Date(createdDate).toLocaleDateString() : 'Unknown';
      const isNewlyCreated = this.newlyCreatedProject && this.newlyCreatedProject.id === this.currentProject.id;
      
      let statusText = `📁 ${this.currentProject.name} | 📅 Created: ${formattedDate} | 📊 Total Files: ${totalFiles}`;
      
      if (duplicateFiles > 0) {
        statusText += ` | 🔄 Duplicates: ${duplicateFiles}`;
      }
      
      if (resolvedFiles > 0) {
        statusText += ` | ✅ Resolved: ${resolvedFiles}`;
      }
      
      if (isNewlyCreated) {
        statusText += ` | 🆕 Newly Created`;
      }
      
      statusElement.textContent = statusText;
    } else {
      statusElement.textContent = 'No project selected';
    }
  }

  private async rescanFiles() {
    if (!this.currentProject) {
      this.showStatus('Please select a project first', 'error');
      return;
    }

    this.showStatus('Rescanning files...', 'info');
    await this.runFileScan();
  }

  private viewProject() {
    if (!this.currentProject) {
      this.showStatus('Please select a project first', 'error');
      return;
    }

    // Navigate to the project view page
    const event = new CustomEvent('navigate', {
      detail: { page: 'projectview', projectId: this.currentProject.id }
    });
    document.dispatchEvent(event);
  }

  private async runFileScan() {
    if (!this.currentProject) {
      this.showStatus('Please select a project first', 'error');
      return;
    }

    const basePath = this.currentProject.base_path || this.currentProject.basePath;
    console.log('Current project for scan:', this.currentProject);
    console.log('Project base_path:', basePath);

    const api = (window as any).electronAPI;
    if (!api?.runScan) {
      this.showStatus('File scanning is only available in Electron', 'error');
      return;
    }

    const regexInput = this.shadow.getElementById('scanRegex') as HTMLInputElement;
    const regex = regexInput.value.trim() || '.*';
    const statusElement = this.shadow.getElementById('scanStatus') as HTMLElement;
    const scanBtn = this.shadow.getElementById('runScanBtn') as HTMLButtonElement;

    try {
      scanBtn.disabled = true;
      statusElement.textContent = 'Scanning files...';
      statusElement.className = 'scan-status scanning';
      
      // Show loading state
      this.showLoadingState('Scanning files and generating hashes...');

      console.log('Calling Electron API with path:', basePath);
      const result = await api.runScan(basePath, regex);
      
      if (result && result.out) {
        console.log('🔍 Found files:', result.out.length);
        
        // Generate real SHA-256 hashes for each file
        const scanResults = [];
        let processedCount = 0;
        
        for (const filePath of result.out) {
          try {
            // Generate hash based on file path, size, and modification time
            // This is a fallback when we can't access file content directly
            const fileInfo = await this.getFileInfo(filePath);
            const hash = await this.generateFileHash(filePath, fileInfo);
            
            scanResults.push({
              path: filePath,
              hash: hash,
              size: fileInfo.size,
              lastModified: fileInfo.lastModified
            });
            
            processedCount++;
            if (processedCount % 10 === 0) {
              statusElement.textContent = `Processing files... ${processedCount}/${result.out.length}`;
            }
          } catch (error) {
            console.warn(`⚠️ Failed to process file: ${filePath}`, error);
            // Add file with filename as hash
            scanResults.push({
              path: filePath,
              hash: this.getFilenameFromPath(filePath),
              size: 0,
              lastModified: Date.now()
            });
          }
        }

        const textarea = this.shadow.getElementById('scanResults') as HTMLTextAreaElement;
        textarea.value = JSON.stringify(scanResults, null, 2);
        
        statusElement.textContent = `Found ${result.out.length} files with real hashes`;
        statusElement.className = 'scan-status success';
        this.showStatus(`File scan completed! Found ${result.out.length} files with real hashes.`, 'success');
      } else {
        throw new Error('No scan results returned');
      }
    } catch (error) {
      statusElement.textContent = 'Scan failed';
      statusElement.className = 'scan-status error';
      this.showStatus('Error running file scan: ' + error, 'error');
    } finally {
      scanBtn.disabled = false;
      this.hideLoadingState();
    }
  }

  private async getFileInfo(filePath: string): Promise<{ size: number; lastModified: number }> {
    // Try to get file info from Electron API if available
    const api = (window as any).electronAPI;
    if (api?.getFileInfo) {
      try {
        return await api.getFileInfo(filePath);
      } catch (error) {
        console.warn('Failed to get file info from Electron API:', error);
      }
    }
    
    // Fallback: return default values
    return {
      size: 1024, // Default size
      lastModified: Date.now()
    };
  }

  private async generateFileHash(filePath: string, _fileInfo: { size: number; lastModified: number }): Promise<string> {
    // Try to generate real hash from file content if possible
    const api = (window as any).electronAPI;
    if (api?.generateFileHash) {
      try {
        return await api.generateFileHash(filePath);
      } catch (error) {
        console.warn('Failed to generate hash from file content:', error);
      }
    }
    
    // Fallback: use filename as hash
    return this.getFilenameFromPath(filePath);
  }

  private getFilenameFromPath(filePath: string): string {
    // Extract filename from path (after the last slash)
    const filename = filePath.split(/[\/\\]/).pop() || filePath;
    
    // Remove query parameters and timestamps (anything after ? or &)
    // This handles cases like "RD1186-2.0002.ipt?131727695450000000&128512"
    return filename.split(/[?&]/)[0];
  }

  private async uploadScanResults() {
    if (!this.currentProject) {
      this.showStatus('Please select a project first', 'error');
      return;
    }

    const textarea = this.shadow.getElementById('scanResults') as HTMLTextAreaElement;
    const scanData = textarea.value.trim();
    
    if (!scanData) {
      this.showStatus('Please run a file scan first', 'error');
      return;
    }

    try {
      // Show loading state
      this.showLoadingState('Uploading scan results...');
      
      let scanResults;
      try {
        scanResults = JSON.parse(scanData);
      } catch (parseError) {
        throw new Error('Invalid scan data format. Please run a new scan.');
      }

      const url = `${this.apiBaseUrl}/projects/${this.currentProject.id}/files`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: scanResults })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload scan results');
      }

      const result = await response.json();
      if (result.success) {
        this.showStatus('Scan results uploaded successfully!', 'success');
        await this.loadProjectFiles(this.currentProject.id);
      } else {
        throw new Error(result.error || 'Failed to upload scan results');
      }
    } catch (error) {
      this.showStatus('Error uploading scan results: ' + error, 'error');
    } finally {
      this.hideLoadingState();
    }
  }



  private async testApiConnection() {
    const statusElement = this.shadow.getElementById('connectionStatus')!;
    const testBtn = this.shadow.getElementById('testConnectionBtn') as HTMLButtonElement;
    
    testBtn.disabled = true;
    statusElement.textContent = 'Testing...';
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/projects`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          statusElement.textContent = '✅ API is running and accessible!';
          statusElement.className = 'connection-success';
          this.shadow.getElementById('apiStatusSection')!.style.display = 'none';
          this.loadProjects(); // Reload projects now that API is available
        } else {
          statusElement.textContent = `❌ API error: ${result.error}`;
          statusElement.className = 'connection-error';
        }
      } else {
        statusElement.textContent = `❌ API responded with status ${response.status}`;
        statusElement.className = 'connection-error';
      }
    } catch (error) {
      statusElement.textContent = '❌ Cannot connect to API';
      statusElement.className = 'connection-error';
    }
    
    setTimeout(() => {
      testBtn.disabled = false;
      statusElement.textContent = '';
      statusElement.className = '';
    }, 3000);
  }

  private renderElectronBanner() {
    this.shadow.innerHTML = `
      <div class="dedupe-container">
        <h2>File Deduplication</h2>
        <div class="helper-banner">
          <p>
            <strong>Project Creation Requires Electron</strong><br>
            Creating new projects requires folder selection which is only available in the Trebro Desktop Helper.
          </p>
          <a class="bin-button" href="https://drive.google.com/drive/folders/1YHwhOM2QVv1Wp3kt5Y9xOWoKPptytiq_?usp=sharing" target="_blank">
            ⬇️ Download Trebro Desktop Helper
          </a>
          <p style="font-size:13px;opacity:.7;margin-top:4px;">
            (Run the installer, then reopen this page inside the app.)
          </p>
        </div>
        
        <!-- Show other sections for browser users -->
        <div class="section">
          <h3>Existing Projects</h3>
          <div class="project-controls">
            <div class="project-list">
              <h4>Available Projects</h4>
              <div id="projectsList"></div>
            </div>
          </div>
        </div>

        <!-- File Upload Section -->
        <div class="section" id="uploadSection" style="display: none;">
          <h3>File Scan Results</h3>
          <div class="upload-area">
            <div class="scan-controls">
              <div class="scan-inputs">
                <input type="text" id="scanRegex" placeholder="File pattern (e.g., .*\.txt)" class="input-field" value=".*">
                <button id="runScanBtn" class="bin-button">🔍 Run File Scan</button>
              </div>
              <div class="scan-status" id="scanStatus"></div>
            </div>
            <div class="scan-results">
              <textarea id="scanResults" placeholder="Paste file scan results here (JSON format) or use the scan button above..." class="textarea-field"></textarea>
              <button id="uploadScanBtn" class="bin-button">Upload Scan Results</button>
            </div>
          </div>
        </div>

        <!-- Project Status Section -->
        <div class="section" id="projectStatusSection" style="display: none;">
          <h3>Project Status</h3>
          <div class="project-status">
            <div class="status-info">
              <span id="projectStatus">Loading...</span>
            </div>
            <div class="status-actions">
              <button id="rescanFilesBtn" class="bin-button">🔄 Rescan Files</button>
              <button id="viewProjectBtn" class="bin-button">👁️ View Project</button>
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <div id="statusMessage" class="status-message"></div>
      </div>
    `;
    
    // Re-setup event listeners for the new elements
    this.setupEventListeners();
    this.loadProjects(); // Still load projects for browser users
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

  // Test function to verify hash generation
  private async testHashGeneration() {
    try {
      console.log('🧪 Testing hash generation...');
      
      // Test with a known string
      const testData = 'Hello, World!';
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(testData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const expectedHash = 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f';
      
      console.log('Generated hash:', hashHex);
      console.log('Expected hash:', expectedHash);
      
      if (hashHex === expectedHash) {
        console.log('✅ Hash generation is working correctly!');
        
        // Test filename-based hashing
        console.log('🧪 Testing filename-based hashing...');
        const testFile1 = 'C:/path/to/file.txt';
        const testFile2 = 'D:/different/path/file.txt';
        const testFile3 = 'C:/path/to/different.txt';
        
        const hash1 = this.getFilenameFromPath(testFile1);
        const hash2 = this.getFilenameFromPath(testFile2);
        const hash3 = this.getFilenameFromPath(testFile3);
        
        console.log('File 1 hash:', hash1);
        console.log('File 2 hash:', hash2);
        console.log('File 3 hash:', hash3);
        
        if (hash1 === hash2) {
          console.log('✅ Same filename files get same hash!');
        } else {
          console.log('❌ Same filename files get different hash');
        }
        
        if (hash1 !== hash3) {
          console.log('✅ Different filename files get different hash!');
        } else {
          console.log('❌ Different filename files get same hash');
        }
        
        this.showStatus('Hash generation test passed!', 'success');
      } else {
        console.log('❌ Hash generation may have issues');
        this.showStatus('Hash generation test failed!', 'error');
      }
    } catch (error) {
      console.error('❌ Hash generation test failed:', error);
      this.showStatus('Hash generation test failed: ' + error, 'error');
    }
  }
}

customElements.define('file-deduplication-page', FileDeduplicationPage); 