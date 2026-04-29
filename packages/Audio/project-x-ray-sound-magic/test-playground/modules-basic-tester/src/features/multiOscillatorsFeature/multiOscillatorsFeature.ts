import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature.js";

export class MultiOscillatorsFeature implements IViewFeature {
  public readonly id = "multi-oscillators";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Multi Oscillators</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./multiOscillatorsFeature.view.html?raw");
    return module.default;
  }
}
