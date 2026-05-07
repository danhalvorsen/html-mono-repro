import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../../Templating/IComponentTemplate.js";
import type { PidStencilViewModel } from "../PidStencilViewModel.js";

export class PidStencilCardHeaderTemplate
  implements IComponentTemplate<PidStencilViewModel>
{
  public render(model: PidStencilViewModel): TemplateResult {
    return html`
      <h3 class="pid-stencil-card__title">${model.label}</h3>
    `;
  }
}