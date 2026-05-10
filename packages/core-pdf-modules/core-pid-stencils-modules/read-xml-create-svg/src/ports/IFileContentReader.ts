export interface IFileContentReader {
  read(path: string): Promise<string>;
}