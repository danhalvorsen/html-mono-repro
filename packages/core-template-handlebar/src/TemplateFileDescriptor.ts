import { File } from "@monorepo/core-filesystem";

export class TemplateFileDescriptor {
  constructor(
    public readonly templateName: string,
    public readonly outputFile: File
  ) {}
}