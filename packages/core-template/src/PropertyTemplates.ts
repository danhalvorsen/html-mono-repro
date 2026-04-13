import { CrossPlatformTemplate } from "./CrossPlatformTemplate.js";
import type { IPropertyTemplateModel } from "./IPropertyTemplateModel.js";

export const PropertyTemplates = {
  custom<TCandidate extends object = Record<string, unknown>>(raw: string) {
    return new CrossPlatformTemplate<IPropertyTemplateModel<TCandidate>>(raw);
  },

  required<TCandidate extends object = Record<string, unknown>>() {
    return new CrossPlatformTemplate<IPropertyTemplateModel<TCandidate>>(
      "Rule ${ruleName} failed: property ${propertyName} is required",
    );
  },

  invalid<TCandidate extends object = Record<string, unknown>>() {
    return new CrossPlatformTemplate<IPropertyTemplateModel<TCandidate>>(
      "Rule ${ruleName} failed: property ${propertyName} with value '${propertyValue}' is invalid",
    );
  },

  comparison<TCandidate extends object = Record<string, unknown>>() {
    return new CrossPlatformTemplate<IPropertyTemplateModel<TCandidate>>(
      "Rule ${ruleName} failed: property ${propertyName} with value '${propertyValue}' must satisfy comparison value '${comparisonValue}'",
    );
  },

  pathAware<TCandidate extends object = Record<string, unknown>>() {
    return new CrossPlatformTemplate<IPropertyTemplateModel<TCandidate>>(
      "Rule ${ruleName} failed at ${propertyPath}: property ${propertyName} with value '${propertyValue}' is invalid",
    );
  },
};
