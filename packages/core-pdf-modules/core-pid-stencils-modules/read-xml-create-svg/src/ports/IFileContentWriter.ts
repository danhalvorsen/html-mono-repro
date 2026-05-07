export interface IFileContentWriter {
  write(path: string, content: string): Promise<void>;
}