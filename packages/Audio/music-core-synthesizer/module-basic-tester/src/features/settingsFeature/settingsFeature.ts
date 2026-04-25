// src/features/settingsFeature/settingsFeature.ts

import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature";

export class SettingsFeature implements IViewFeature {
  public readonly id = "settings";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Settings</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./settings.view.html?raw");
    return module.default;
  }
}