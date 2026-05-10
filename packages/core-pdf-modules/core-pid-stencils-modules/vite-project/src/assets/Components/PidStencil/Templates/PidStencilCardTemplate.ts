import { type TemplateResult } from "lit";
import type { IComponentTemplate } from "../../../../Templating/IComponentTemplate.js";
import type { IWebCardSectionTemplates } from "../../WebCard/IWebCardSectionTemplates.js";
import { WebCardTemplate } from "../../WebCard/WebCardTemplate.js";
import type { PidStencilViewModel } from "../PidStencilViewModel.js";
import { PidStencilCardFooterTemplate } from "./PidStencilCardFooterTemplate.js";
import { PidStencilCardHeaderTemplate } from "./PidStencilCardHeaderTemplate.js";
import { PidStencilCardMainTemplate } from "./PidStencilCardMainTemplate.js";

export class PidStencilCardTemplate
  implements IComponentTemplate<PidStencilViewModel>
{
  private readonly cardTemplate: IComponentTemplate<PidStencilViewModel>;

  public constructor(
    sectionTemplates: IWebCardSectionTemplates<PidStencilViewModel> = {
      header: new PidStencilCardHeaderTemplate(),
      main: new PidStencilCardMainTemplate(),
      footer: new PidStencilCardFooterTemplate(),
    },
  ) {
    this.cardTemplate = new WebCardTemplate(sectionTemplates);
  }

  public render(model: PidStencilViewModel): TemplateResult {
    return this.cardTemplate.render(model);
  }
}