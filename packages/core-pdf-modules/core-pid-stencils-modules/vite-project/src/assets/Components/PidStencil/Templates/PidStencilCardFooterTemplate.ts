import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../../Templating/IComponentTemplate.js";
import type { PidStencilViewModel } from "../PidStencilViewModel.js";

export class PidStencilCardFooterTemplate
  implements IComponentTemplate<PidStencilViewModel>
{
  public render(model: PidStencilViewModel): TemplateResult {
    return html`
      <small class="pid-stencil-card__id">${model.id}</small>
    `;
  }
}