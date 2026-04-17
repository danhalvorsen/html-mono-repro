
// ============================================================================
// Event Model
// ============================================================================

export enum FileSystemEventType {
  FileCreated = "file.created",
  FileModified = "file.modified",
  FileDeleted = "file.deleted",
  DirectoryCreated = "dir.created",
  DirectoryDeleted = "dir.deleted"
}