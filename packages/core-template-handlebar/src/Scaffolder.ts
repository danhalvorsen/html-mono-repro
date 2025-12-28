import { IScaffolder } from './IScaffolder.js';
import { ITemplateRenderer } from './ITemplateRenderer.js';
import { IFileWriter } from './IFileWriter.js';
import { ScaffoldingBlueprint } from './ScaffoldingBlueprint.js';

export class Scaffolder implements IScaffolder {
  constructor(
    private readonly renderer: ITemplateRenderer,
    private readonly writer: IFileWriter
  ) {}

  scaffold(blueprint: ScaffoldingBlueprint): void {
    for (const file of blueprint.files) {
      const rendered = this.renderer.render(file.templateName, blueprint.context);
      this.writer.write(file.outputFile, rendered);
    }
  }
}
