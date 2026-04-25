// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/soundTestFeature.ts

import { html, type TemplateResult } from "lit";
import type { IViewFeature } from "../../infrastructure/IViewFeature";

// 👇 THIS IS THE MISSING LINK
import "./sound-test.component";

export class SoundTestFeature implements IViewFeature {
  public readonly id = "sound-test";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Sound Test</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    return `<sound-test></sound-test>`;
  }

  public async attach(): Promise<void> {
    // no-op
  }
}