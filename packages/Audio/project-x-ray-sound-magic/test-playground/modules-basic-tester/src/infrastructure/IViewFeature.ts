// src/infrastructure/IViewFeature.ts

import type { TemplateResult } from "lit";

export interface IViewFeature {
  readonly id: string;

  renderNavigationTemplate(): TemplateResult;

  loadViewHtml(): Promise<string>;
}