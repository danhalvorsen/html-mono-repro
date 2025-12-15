import { IFileWriter } from './IFileWriter.js';
import { File } from '@my-graphics/core-filesystem';

export class FilesystemWriter implements IFileWriter {
  write(f: File, c: string) {
    f.write(c);
  }
}