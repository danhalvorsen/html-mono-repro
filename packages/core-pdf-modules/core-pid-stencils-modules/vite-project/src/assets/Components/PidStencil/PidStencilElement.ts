import { customElement, property } from "lit/decorators.js";
import { BaseTemplateElement } from "../BaseTemplateElement.js";
import type { PidStencilViewModel } from "./PidStencilViewModel.js";

@customElement("pid-stencil")
export class PidStencilElement extends BaseTemplateElement<PidStencilViewModel> {
  @property()
  public id = "";

  @property()
  public label = "";

  protected override createTemplateModel(): PidStencilViewModel {
    return {
      id: this.id,
      label: this.label,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pid-stencil": PidStencilElement;
  }
}