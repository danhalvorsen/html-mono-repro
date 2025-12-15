import { ITemplateRenderer } from './ITemplateRenderer.js';
import { ITemplateEngine } from './ITemplateEngine.js';

export class TemplateRenderer implements ITemplateRenderer {
	constructor(private readonly engine: ITemplateEngine) {}

	render(templateName: string, context: object) {
		const compiled = this.engine.compile(templateName);
		return compiled(context);
	}
}