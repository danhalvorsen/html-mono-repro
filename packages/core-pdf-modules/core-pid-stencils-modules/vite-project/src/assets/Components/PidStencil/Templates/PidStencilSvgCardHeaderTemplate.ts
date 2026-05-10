import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../../Templating/IComponentTemplate.js";
import type { PidStencilSvgViewModel } from "../PidStencilSvgViewModel.js";

export class PidStencilSvgCardHeaderTemplate
  implements IComponentTemplate<PidStencilSvgViewModel>
{
  public render(model: PidStencilSvgViewModel): TemplateResult {
    return html`
      <h3 class="pid-stencil-card__title">${model.label}</h3>
    `;
  }
}