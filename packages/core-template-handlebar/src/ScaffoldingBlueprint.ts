import { TemplateFileDescriptor } from './TemplateFileDescriptor.js';

export class ScaffoldingBlueprint {
  constructor(
    public readonly context: any,
    public readonly files: TemplateFileDescriptor[]
  ) {}
}