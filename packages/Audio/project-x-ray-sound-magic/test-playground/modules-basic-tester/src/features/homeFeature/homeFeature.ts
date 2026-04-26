// src/features/homeFeature/homeFeature.ts

import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature";

export class HomeFeature implements IViewFeature {
  public readonly id = "home";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>Home</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./home.view.html?raw");
    return module.default;
  }
}