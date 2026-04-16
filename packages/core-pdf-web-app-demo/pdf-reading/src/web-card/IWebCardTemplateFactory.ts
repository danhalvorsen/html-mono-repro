import type { TemplateResult, nothing } from "lit";


export interface IWebCardTemplateFactory {
  createHeader(): TemplateResult | typeof nothing;
  createMain(): TemplateResult | typeof nothing;
  createFooter(): TemplateResult | typeof nothing;
}
