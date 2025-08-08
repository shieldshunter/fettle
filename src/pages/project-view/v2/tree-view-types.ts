// Types used by the modular Tree View v2 implementation

export interface Project {
  id: number;
  name: string;
  base_path: string;
  created_at: string;
}

export interface FileInfo {
  id: number;
  relative_path: string;
  hash: string;
  size: number;
  last_modified: string;
  status: string;
}

export interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  status?: string;
  isFolder: boolean;
  isExpanded?: boolean;
  duplicateCount?: number;
  relativePath?: string;
}

export interface DuplicateGroup {
  hash: string;
  count: number;
  files: {
    relativePath: string;
    status: string;
  }[];
}

export interface BulkDeleteStats {
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

export const FILE_STATUS = {
  UNRESOLVED: 'unresolved',
  PRIMARY: 'primary',
  DELETED: 'deleted',
  NORMAL: 'normal',
  BULK_DELETED: 'bulk_deleted'
} as const;

export type FileStatus = typeof FILE_STATUS[keyof typeof FILE_STATUS];


