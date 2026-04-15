import type { IPropertyTemplateModel } from "@monorepo/core-template";

export interface IPropertyRuleMessageModel<TCandidate extends object = Record<string, unknown>>
  extends IPropertyTemplateModel<TCandidate> {}
