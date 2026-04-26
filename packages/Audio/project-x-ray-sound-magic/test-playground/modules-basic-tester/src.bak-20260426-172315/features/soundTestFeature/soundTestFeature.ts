// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature";

import "./sound-test.component";

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