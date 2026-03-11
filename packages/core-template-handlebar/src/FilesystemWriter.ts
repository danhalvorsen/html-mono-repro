import { IFileWriter } from './IFileWriter.js';
import { File } from '@monorepo/core-filesystem'; 

export class FilesystemWriter implements IFileWriter {
  write(f: File, c: string) {
    f.write(c);
  }
}