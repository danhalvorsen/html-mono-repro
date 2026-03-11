import { File } from  '@monorepo/core-filesystem';  
export interface IFileWriter {
  write(file: File, content: string): void;
}
