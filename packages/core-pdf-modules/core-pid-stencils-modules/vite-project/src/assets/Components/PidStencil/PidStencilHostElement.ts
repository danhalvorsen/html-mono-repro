import { LitElement, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "./PidStencilElement.js";
import { PidStencilCardTemplate } from "./Templates/PidStencilCardTemplate.js";

@customElement("pid-stencil-host")
export class PidStencilHostElement extends LitElement {
  private readonly stencilTemplate = new PidStencilCardTemplate();

  protected override render(): TemplateResult {
    return html`
      <pid-stencil
        .template=${this.stencilTemplate}
        id="pid-valve"
        label="Valve"
      ></pid-stencil>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pid-stencil-host": PidStencilHostElement;
  }
}