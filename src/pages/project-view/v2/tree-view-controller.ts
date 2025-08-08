import { TreeApi } from './tree-view-api';
import { TreeState } from './tree-view-state';
import { renderTree } from './tree-view-render';
import { FILE_STATUS } from './tree-view-types';

export class TreeControllerV2 {
  private readonly api: TreeApi;
  private readonly state: TreeState;
  private readonly shadow: ShadowRoot;
  private currentProjectId: number | null = null;

  constructor(shadow: ShadowRoot, api = new TreeApi(), state = new TreeState()) {
    this.shadow = shadow;
    this.api = api;
    this.state = state;
  }

  async load(projectId: number) {
    this.currentProjectId = projectId;
    const [_project, files] = await Promise.all([
      this.api.getProject(projectId),
      this.api.getProjectFiles(projectId)
    ]);
    this.state.buildDuplicateGroups(files);
    this.state.buildFileTree(files);
    this.render();
  }

  private render() {
    renderTree(this.shadow, this.state.fileTree, {
      onToggleFolder: (path) => {
        this.state.toggleFolder(path);
        this.render();
      },
      onMarkPrimary: async (relativePath) => {
        if (!this.currentProjectId) return;
        await this.api.markPrimary(this.currentProjectId, relativePath);
        // Update local status to primary immediately
        // Simple traversal to update status
        const update = (n: any) => {
          if (n.relativePath === relativePath) n.status = FILE_STATUS.PRIMARY;
          (n.children || []).forEach(update);
        };
        update(this.state.fileTree);
        this.render();
      },
      onMarkDeleted: async (relativePath) => {
        if (!this.currentProjectId) return;
        await this.api.markDeleted(this.currentProjectId, relativePath);
        const update = (n: any) => {
          if (n.relativePath === relativePath) n.status = FILE_STATUS.DELETED;
          (n.children || []).forEach(update);
        };
        update(this.state.fileTree);
        this.render();
      }
    });
  }
}


