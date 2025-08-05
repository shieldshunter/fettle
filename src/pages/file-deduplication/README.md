# File Deduplication Page

This page provides a web interface for the file deduplication API backend. It allows users to manage projects, upload file scan results, resolve duplicate files, and export results.

## Features

### Project Management
- Create new projects with a name and base directory path
- View existing projects
- Select projects to work with

### File Upload
- Upload file scan results in JSON format
- The scan results should contain file metadata including:
  - `relative_path`: File path relative to the base directory
  - `hash`: SHA-256 hash of the file content
  - `size`: File size in bytes
  - `last_modified`: Last modification timestamp

### Duplicate Resolution
- View duplicate file groups
- Mark files as "primary" (keep) or "deleted"
- Navigate through duplicate groups
- Reset all resolutions if needed
- View resolution statistics

### Export Results
- Download list of files to keep
- Download list of files to delete
- View export summary with space savings

## API Integration

The page connects to the backend API at `http://localhost:3000/api` and uses the following endpoints:

### Project Management
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id/duplicates` - Get duplicate groups for a project

### File Upload
- `POST /api/scan/:id/scan-result` - Upload file scan results

### Resolution Management
- `POST /api/resolve/:id/mark-primary` - Mark file as primary
- `POST /api/resolve/:id/mark-deleted` - Mark file as deleted
- `GET /api/resolve/:id/stats` - Get resolution statistics
- `POST /api/resolve/:id/reset` - Reset all resolutions

### Export
- `GET /api/export/:id/keep/download` - Download keep list
- `GET /api/export/:id/delete/download` - Download delete list
- `GET /api/export/:id/summary` - Get export summary

## Usage

1. **Start the Backend API**: Ensure the file deduplication API is running on `http://localhost:3000`

2. **Create a Project**: 
   - Enter a project name and base directory path
   - Click "Create Project"

3. **Upload Scan Results**:
   - Select a project
   - Paste JSON scan results in the text area
   - Click "Upload Scan Results"

4. **Resolve Duplicates**:
   - Navigate through duplicate groups
   - Mark files as primary or deleted
   - Use the navigation buttons to move between groups

5. **Export Results**:
   - Download keep/delete lists
   - View summary statistics

## File Scan Results Format

The expected JSON format for scan results:

```json
[
  {
    "relative_path": "folder/file1.txt",
    "hash": "a1b2c3d4e5f6...",
    "size": 1024,
    "last_modified": "2024-01-01T00:00:00Z"
  },
  {
    "relative_path": "folder/file2.txt", 
    "hash": "a1b2c3d4e5f6...",
    "size": 1024,
    "last_modified": "2024-01-01T00:00:00Z"
  }
]
```

## Error Handling

The page includes comprehensive error handling:
- Network connection errors
- Invalid JSON format
- API response errors
- User input validation

Status messages are displayed to inform users of success or error states.

## Responsive Design

The page is designed to work on both desktop and mobile devices with responsive layouts and touch-friendly controls. 