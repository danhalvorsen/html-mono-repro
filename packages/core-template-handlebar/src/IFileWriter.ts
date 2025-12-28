import { File } from '@my-graphics/core-filesystem';

export interface IFileWriter {
  write(file: File, content: string): void;
}
