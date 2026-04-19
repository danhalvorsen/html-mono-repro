import type { TemplateResult, nothing } from "lit";


export interface IWebCardTemplates {
  readonly headerTemplate: TemplateResult | typeof nothing;
  readonly mainTemplate: TemplateResult | typeof nothing;
  readonly footerTemplate: TemplateResult | typeof nothing;
}
