import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../../Templating/IComponentTemplate.js";
import type { PidStencilViewModel } from "../PidStencilViewModel.js";

export class PidStencilCardMainTemplate
  implements IComponentTemplate<PidStencilViewModel>
{
  public render(model: PidStencilViewModel): TemplateResult {
    return html`
      <div
        class="pid-stencil-card__preview"
        data-stencil-id=${model.id}
        aria-label=${model.label}
      ></div>
    `;
  }
}