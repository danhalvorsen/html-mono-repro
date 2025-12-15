import Handlebars from 'handlebars';
import { ITemplateEngine } from './ITemplateEngine.js';
import { ITemplateResolver } from './ITemplateResolver.js';

export class HandlebarsTemplateEngine implements ITemplateEngine {
  constructor(private readonly resolver: ITemplateResolver) {}

  compile(name: string) {
    const raw = this.resolver.resolve(name);
    return Handlebars.compile(raw);
  }
}