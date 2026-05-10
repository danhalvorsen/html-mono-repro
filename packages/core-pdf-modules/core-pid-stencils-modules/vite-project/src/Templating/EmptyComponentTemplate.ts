import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "./IComponentTemplate.js";

export class EmptyComponentTemplate<TModel>
  implements IComponentTemplate<TModel>
{
  public render(_: TModel): TemplateResult {
    return html``;
  }
}