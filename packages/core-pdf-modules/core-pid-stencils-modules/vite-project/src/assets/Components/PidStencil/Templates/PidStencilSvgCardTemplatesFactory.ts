import type { IWebCardSectionTemplates } from "../../WebCard/IWebCardSectionTemplates.js";
import type { PidStencilSvgViewModel } from "../PidStencilSvgViewModel.js";
import { PidStencilSvgCardFooterTemplate } from "./PidStencilSvgCardFooterTemplate.js";
import { PidStencilSvgCardHeaderTemplate } from "./PidStencilSvgCardHeaderTemplate.js";
import { PidStencilSvgCardMainTemplate } from "./PidStencilSvgCardMainTemplate.js";

export class PidStencilSvgCardTemplatesFactory {
  public create(): IWebCardSectionTemplates<PidStencilSvgViewModel> {
    return {
      header: new PidStencilSvgCardHeaderTemplate(),
      main: new PidStencilSvgCardMainTemplate(),
      footer: new PidStencilSvgCardFooterTemplate(),
    };
  }
}