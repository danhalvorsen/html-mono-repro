import { File } from '@my-graphics/core-filesystem';

export class TemplateFileDescriptor {
  constructor(
    public readonly templateName: string,
    public readonly outputFile: File
  ) {}
}