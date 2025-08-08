import { Project, FileInfo, BulkDeleteStats } from './tree-view-types';
import { API_CONFIG } from '../../../config/api-config';

export class TreeApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getProject(projectId: number): Promise<Project> {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load project');
    return json.data;
  }

  async getProjectFiles(projectId: number): Promise<FileInfo[]> {
    const res = await fetch(`${this.baseUrl}/projects/${projectId}/files`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load files');
    return json.data as FileInfo[];
  }

  async getBulkDeleteStats(projectId: number): Promise<BulkDeleteStats | null> {
    const res = await fetch(`${this.baseUrl}/delete-mode/${projectId}/stats`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as BulkDeleteStats) : null;
  }

  async markPrimary(projectId: number, relativePath: string) {
    const res = await fetch(`${this.baseUrl}/resolve/${projectId}/mark-primary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: relativePath })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error(json.error || 'Failed to mark primary');
    return json;
  }

  async markDeleted(projectId: number, relativePath: string) {
    const res = await fetch(`${this.baseUrl}/resolve/${projectId}/mark-deleted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: relativePath })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error(json.error || 'Failed to mark deleted');
    return json;
  }

  async bulkDeleteFiles(projectId: number, filePaths: string[]) {
    if (filePaths.length === 0) return { success: true } as any;
    const res = await fetch(`${this.baseUrl}/delete-mode/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePaths })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Failed to bulk delete files');
    return json;
  }
}


