import { html, type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../../Templating/IComponentTemplate.js";
import type { PidStencilSvgViewModel } from "../PidStencilSvgViewModel.js";

export class PidStencilSvgCardFooterTemplate
  implements IComponentTemplate<PidStencilSvgViewModel>
{
  public render(model: PidStencilSvgViewModel): TemplateResult {
    return html`
      <small>
        <strong>${model.groupId}</strong><br />
        ${model.fileName}
      </small>
    `;
  }
}