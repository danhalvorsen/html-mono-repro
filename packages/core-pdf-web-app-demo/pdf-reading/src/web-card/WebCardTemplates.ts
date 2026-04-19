import { nothing, type TemplateResult } from "lit";
import type { IWebCardTemplates } from "./IWebCardTemplates";

export class WebCardTemplates {
  public readonly headerTemplate: TemplateResult | typeof nothing;
  public readonly mainTemplate: TemplateResult | typeof nothing;
  public readonly footerTemplate: TemplateResult | typeof nothing;
  static empty: IWebCardTemplates;

  public constructor(
    headerTemplate: TemplateResult | typeof nothing,
    mainTemplate: TemplateResult | typeof nothing,
    footerTemplate: TemplateResult | typeof nothing
  ) {
    this.headerTemplate = headerTemplate;
    this.mainTemplate = mainTemplate;
    this.footerTemplate = footerTemplate;
  }
}