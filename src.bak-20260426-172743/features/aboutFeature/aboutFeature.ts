import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature.js";

export class AboutFeature implements IViewFeature {
  public readonly id = "about";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>About</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./about.view.html?raw");
    return module.default;
  }
}
