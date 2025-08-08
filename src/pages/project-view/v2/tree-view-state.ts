import { TreeNode, FileInfo, DuplicateGroup, FILE_STATUS } from './tree-view-types';

export class TreeState {
  fileTree: TreeNode | null = null;
  duplicateGroups: { [hash: string]: DuplicateGroup } = {};
  expandedFolders: Set<string> = new Set(['/']);
  isDeleteMode = false;
  selectedFilesForDeletion: Set<string> = new Set();
  selectedFoldersForDeletion: Set<string> = new Set();

  buildDuplicateGroups(files: FileInfo[]) {
    this.duplicateGroups = {};
    const groups: Record<string, FileInfo[]> = {};
    for (const f of files) {
      const key = (f.hash || '').split(/[?&]/)[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(f);
    }
    for (const [hash, list] of Object.entries(groups)) {
      if (list.length > 1) {
        this.duplicateGroups[hash] = {
          hash,
          count: list.length,
          files: list.map(f => ({ relativePath: f.relative_path, status: f.status }))
        };
      }
    }
  }

  buildFileTree(files: FileInfo[]) {
    const root: TreeNode = { name: '/', path: '/', children: [], isFolder: true, isExpanded: true };
    for (const f of files) {
      const parts = f.relative_path.split(/[\/\\]/).filter(Boolean);
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        let child = current.children!.find(c => c.name === part);
        if (!child) {
          const path = current.path === '/' ? `/${part}` : `${current.path}/${part}`;
          child = { name: part, path, children: [], isFolder: i < parts.length - 1, isExpanded: this.expandedFolders.has(path) };
          current.children!.push(child);
        }
        if (i === parts.length - 1) {
          child.isFolder = false;
          child.relativePath = f.relative_path;
          // Minimal status derivation similar to current page
          const cleanedHash = (f.hash || '').split(/[?&]/)[0];
          if (this.duplicateGroups[cleanedHash]) {
            const group = this.duplicateGroups[cleanedHash];
            const hasPrimary = group.files.some(x => x.status === FILE_STATUS.PRIMARY);
            const allDeleted = group.files.every(x => x.status === FILE_STATUS.DELETED);
            if (f.status === FILE_STATUS.BULK_DELETED) child.status = FILE_STATUS.BULK_DELETED;
            else if (hasPrimary || allDeleted) child.status = f.status;
            else child.status = FILE_STATUS.UNRESOLVED;
          } else {
            child.status = f.status === FILE_STATUS.BULK_DELETED ? FILE_STATUS.BULK_DELETED : FILE_STATUS.NORMAL;
          }
        }
        current = child;
      }
    }
    this.fileTree = root;
  }

  toggleFolder(path: string) {
    if (!this.fileTree) return;
    const node = this.findNodeByPath(this.fileTree, path);
    if (node && node.isFolder) {
      node.isExpanded = !node.isExpanded;
      if (node.isExpanded) this.expandedFolders.add(path);
      else this.expandedFolders.delete(path);
    }
  }

  findNodeByPath(root: TreeNode, path: string): TreeNode | null {
    if (root.path === path) return root;
    for (const child of root.children || []) {
      const found = this.findNodeByPath(child, path);
      if (found) return found;
    }
    return null;
  }
}


