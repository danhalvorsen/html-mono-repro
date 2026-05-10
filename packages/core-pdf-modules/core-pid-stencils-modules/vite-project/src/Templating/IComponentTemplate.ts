import type { TemplateResult } from "lit";

export interface IComponentTemplate<TModel> {
  render(model: TModel): TemplateResult;
}