# 🌲 Project File Tree View

A comprehensive file tree interface with duplicate highlighting and resolution states, designed for the Trebro file deduplication system.

## ✨ Features

### 🎨 Color-Coded File Status System
- **🟡 Unresolved**: Files with duplicates that haven't been resolved yet
- **🔵 Primary**: Files marked as the canonical version to keep
- **🟥 Deleted**: Files marked for deletion
- **✅ Resolved**: Folders where all duplicates have been resolved

### 📂 Interactive Tree View
- Expand/collapse folders with smooth animations
- Visual hierarchy with indentation and connecting lines
- Hover effects and visual feedback
- Keyboard navigation support

### 🎯 Duplicate Detection
- Red badges show duplicate count on files with duplicates
- Click-click resolution interface
- Real-time status updates
- Progress tracking at folder level

### 🔍 Smart Resolution
- Click any file to see all duplicates in a side panel
- Mark files as primary or deleted with one click
- Batch operations for efficiency
- Undo/redo capabilities (planned)

### 📊 Progress Tracking
- Folders automatically turn green when all duplicates are resolved
旅客: 0 0 10px 0;
  color: #666;
  font-size: 12px;
  word-break: break-all;
}

.project-date {
  margin: 5px 0;
  color: #666;
  font-size: 12px;
}

.project-actions {
  margin-top: 15px;
}

/* Tree Controls */
.tree-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.controls-left {
  display: flex;
  gap: 10px;
}

.controls-right {
  display: flex;
  align-items: center;
}

.legend {
  display: flex;
  gap: 15px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: centerleg: 0 0: 0 0 10px 0;
  color: #666;
  font-size: 12px;
  word-break: break-all;
}

.project-date {
  margin: 5px 0;
  color: #666 Pac: 0 0 10px 0;
  color: #666;
  font-size: 12px;
  word-break: break-all;
}

.project-date {
  margin: 5px 0;
  color: #666;
  font-size: 12px;
}

.project-actions {
一站: 0 0 10px 0;
  color: #666;
  font-size: 12px;
  word-break: break-all;
}

.project-date {
  margin: 5px 0;
  color: #666;
  font-size: 12px;
}

.project-actions {
 Bois: 0 0 10px 0;
  color: #666;
  font-size: 12px;
  word-break: break-all;
}

.project-date {
  margin: 5px 0;
  color: #666;
  font-size: 12px;
}

.project-actions {
  margin-top: 15px;
}

/* Tree Controls */
.tree-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.controls-left {
  display: flex;
  gap: 10px;
}

.controls-right {
  display: flex;
  align-items: center;
}

.legend {
  display: flex;
  gap: 15px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  background: white;
  border: 1px solid #ddd;
}

/* File Tree */
.tree-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
}

.file-tree {
  padding: 10px;
}

.tree-node {
  margin: 2px 0;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

.node-content:hover {
  background-color: #f0f0f0;
}

.expand-icon, .file-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.node-name {
  flex: 1;
  font-size: 14px;
}

.node-children {
  margin-left: 20px;
  border-left: 1px solid #e0e0e0;
  padding-left: 10px;
}

/* File Status Colors */
.file-node.status-unresolved .node-name {
  color: #f39c12;
  font-weight: 500;
}

.file-node.status-primary .node-name {
  color: #3498db;
  font-weight: bold;
}

.file-node.status-deleted .node-name {
  color: #e74c3c;
  opacity: 0.6;
  text-decoration: line-through;
}

.folder-node.resolved .node-name {
  color: #27ae60;
  font-weight: 500;
}

/* Duplicate Badge */
.duplicate-badge {
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  margin-left: 8px;
}

/* Duplicate Resolution Panel */
.duplicate-group {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.duplicate-group h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.duplicate-files {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.duplicate-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  background: white;
  border: 1px solid #e0e0e0;
}

.duplicate-file.status-primary {
  border-color: #3498db;
  background: #ebf3fd;
}

.duplicate-file.status-deleted {
  border-color: #e74c3c;
  background: #fdf2f2;
  opacity: 0.6;
}

.file-path {
  font-size: 12px;
  color: #333;
  word-break: break-all;
}

.file-actions {
  display: flex;
  gap: 8px;
}

/* Buttons */
.bin-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.bin-button:hover {
  background: #2980b9;
}

.bin-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.bin-button.small {
  padding: 4px 8px;
  font-size: 12px;
}

/* Status Messages */
.status-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
}

.status-message.success {
  background: #27ae60;
  opacity: 1;
  transform: translateX(0);
}

.status-message.error {
  background: #e74c3c;
  opacity: 1;
  transform: translateX(0);
}

.status-message.info {
  background: #3498db;
  opacity: 1;
  transform: translateX(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-view-container {
    padding: 10px;
  }
  
  .tree-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .controls-left, .controls-right {
    justify-content: center;
  }
  
  .legend {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .duplicate-file {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

## 🧠 How It Works

### 1. Project Selection
- Choose from your existing deduplication projects
- Loads project metadata and file information
- Validates API connectivity

### 2. Tree Building
- Converts flat file list to hierarchical tree structure
- Groups files by their directory paths
- Maintains folder expansion state

### 3. Duplicate Detection
- Groups files by their hash values
- Shows duplicate count badges on files
- Tracks resolution status for each file

### 4. Interactive Resolution
- Click any file to see all duplicates
- Mark files as primary or deleted
- Real-time status updates
- Progress tracking at folder level

### 5. Visual Feedback
- Color-coded file statuses
- Folder resolution indicators
- Hover effects and animations
- Status messages and notifications

## 🔧 Technical Architecture

### Frontend Components
- **ProjectViewPage**: Main web component
- **TreeNode**: Tree structure interface
- **FileInfo**: File metadata interface
- **DuplicateGroup**: Duplicate group interface

### Backend Integration
- **API Endpoints**: RESTful API for project and file data
- **Database**: PostgreSQL for persistent storage
- **Real-time Updates**: Optimistic UI with server sync

### State Management
- **Tree State**: Expanded/collapsed folders
- **Selection State**: Currently selected file
- **Resolution State**: File status tracking
- **UI State**: Loading, error, success states

## 📱 Responsive Design

The interface is fully responsive and works on:
- **Desktop**: Full feature set with side-by-side panels
- **Tablet**: Optimized layout with stacked sections
- **Mobile**: Touch-friendly interface with simplified controls

## 🚀 Usage

### Basic Usage
```html
<project-view-page></project-view-page>
```

### With Custom Configuration
```javascript
// The component automatically handles:
// - Project loading
// - Tree building
// - Duplicate detection
// - Status updates
```

## 🎯 Key Benefits

1. **Visual Clarity**: Color-coded system makes it easy to understand file states
2. **Efficient Workflow**: Click-to-resolve interface speeds up duplicate resolution
3. **Progress Tracking**: See at a glance which folders are complete
4. **Bulk Operations**: Expand/collapse all and filter options
5. **Real-time Updates**: Immediate feedback on all actions
6. **Responsive Design**: Works on any device size

## 🔮 Future Enhancements

- [ ] Undo/redo functionality
- [ ] Batch resolution operations
- [ ] Search and filter capabilities
- [ ] Export resolved file lists
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop file organization
- [ ] File preview capabilities
- [ ] Advanced filtering options

## 📄 License

This component is part of the Trebro file deduplication system and follows the same licensing terms. 