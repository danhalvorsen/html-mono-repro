import { LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { EmptyComponentTemplate } from "../../Templating/EmptyComponentTemplate.js";
import type { IComponentTemplate } from "../../Templating/IComponentTemplate.js";

export abstract class BaseTemplateElement<TModel> extends LitElement {
  @property({ attribute: false })
  public template: IComponentTemplate<TModel> =
    new EmptyComponentTemplate<TModel>();

  protected abstract createTemplateModel(): TModel;

  protected override render(): TemplateResult {
    return this.template.render(this.createTemplateModel());
  }
}