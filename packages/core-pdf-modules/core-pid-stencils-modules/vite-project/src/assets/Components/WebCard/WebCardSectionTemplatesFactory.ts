import { EmptyComponentTemplate } from "../../../Templating/EmptyComponentTemplate.js";
import type { IWebCardSectionTemplates } from "./IWebCardSectionTemplates.js";

export class WebCardSectionTemplatesFactory {
  public createEmpty<TModel>(): IWebCardSectionTemplates<TModel> {
    return {
      header: new EmptyComponentTemplate<TModel>(),
      main: new EmptyComponentTemplate<TModel>(),
      footer: new EmptyComponentTemplate<TModel>(),
    };
  }
}