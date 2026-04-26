import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature.js";

import "./sound-test.component.js";

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Sound Test</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./soundTestFeature.view.html?raw");
    return module.default;
  }
}
