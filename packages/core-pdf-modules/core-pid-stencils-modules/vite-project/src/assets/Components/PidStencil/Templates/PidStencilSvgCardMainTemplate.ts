import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../../Templating/IComponentTemplate.js";
import type { PidStencilSvgViewModel } from "../PidStencilSvgViewModel.js";

export class PidStencilSvgCardMainTemplate
  implements IComponentTemplate<PidStencilSvgViewModel>
{
  public render(model: PidStencilSvgViewModel): TemplateResult {
    return html`
      <img
        class="pid-stencil-card__image"
        src=${model.url}
        alt=${model.label}
        loading="lazy"
      />
    `;
  }
}