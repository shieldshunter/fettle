import { TreeNode, FILE_STATUS } from './tree-view-types';

export function renderTree(root: ShadowRoot, tree: TreeNode | null, opts?: {
  onToggleFolder?: (path: string) => void;
  onMarkPrimary?: (relativePath: string) => void;
  onMarkDeleted?: (relativePath: string) => void;
  isDeleteMode?: boolean;
  onToggleFileSelect?: (relativePath: string) => void;
}) {
  const container = root.getElementById('fileTree');
  if (!container) return;
  container.innerHTML = '';
  if (!tree) return;
  container.appendChild(createNode(tree, opts));
}

function createNode(node: TreeNode, opts?: Parameters<typeof renderTree>[2]): HTMLElement {
  const el = document.createElement('div');
  el.className = 'tree-node' + (node.isFolder ? ' folder-node' : '');

  if (node.isFolder) {
    const expandIcon = node.isExpanded ? '📂' : '📁';
    const name = node.name === '/' ? 'Root' : node.name;
    el.innerHTML = `
      <div class="node-content">
        <div class="node-info" data-folder-path="${node.path}">
          <span class="expand-icon">${expandIcon}</span>
          <span class="node-name">${name}</span>
        </div>
      </div>
      <div class="node-children" style="display: ${node.isExpanded ? 'block' : 'none'}"></div>
    `;
    const info = el.querySelector('.node-info') as HTMLElement;
    if (info && opts?.onToggleFolder) {
      info.addEventListener('click', () => opts.onToggleFolder!(node.path));
    }
    const children = el.querySelector('.node-children') as HTMLElement;
    for (const child of node.children || []) {
      children.appendChild(createNode(child, opts));
    }
  } else {
    const status = node.status || FILE_STATUS.NORMAL;
    const statusClass = status === FILE_STATUS.BULK_DELETED ? 'status-bulk-deleted' : `status-${status}`;
    el.className += ` file-node ${statusClass}`;
    const cleanName = (node.name || '').split(/[?&]/)[0];
    const actionButtons = `
      <div class="file-actions">
        <button class="bin-button small primary-btn" data-action="primary" ${status === FILE_STATUS.PRIMARY ? 'disabled' : ''}>
          ${status === FILE_STATUS.PRIMARY ? '✓ Primary' : 'Mark Primary'}
        </button>
        <button class="bin-button small delete-btn" data-action="deleted" ${status === FILE_STATUS.DELETED ? 'disabled' : ''}>
          ${status === FILE_STATUS.DELETED ? '🗑️ Deleted' : 'Mark Deleted'}
        </button>
      </div>
    `;
    el.innerHTML = `
      <div class="node-content">
        <div class="node-info">
          <span class="file-icon">📄</span>
          <span class="node-name">${cleanName}</span>
        </div>
        ${actionButtons}
      </div>
    `;
    const primaryBtn = el.querySelector('[data-action="primary"]') as HTMLButtonElement;
    const deleteBtn = el.querySelector('[data-action="deleted"]') as HTMLButtonElement;
    if (primaryBtn && opts?.onMarkPrimary && node.relativePath) {
      primaryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        opts.onMarkPrimary!(node.relativePath!);
      });
    }
    if (deleteBtn && opts?.onMarkDeleted && node.relativePath) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        opts.onMarkDeleted!(node.relativePath!);
      });
    }
  }
  return el;
}


