import type { IComponentTemplate } from "../../../Templating/IComponentTemplate.js";

export interface IWebCardSectionTemplates<TModel> {
  readonly header: IComponentTemplate<TModel>;
  readonly main: IComponentTemplate<TModel>;
  readonly footer: IComponentTemplate<TModel>;
}