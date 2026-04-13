export interface IRangeRuleMessageModel<TCandidate extends object = Record<string, unknown>>
  extends Record<string, unknown> {
  readonly ruleName: string;
  readonly candidate: TCandidate;
  readonly propertyName: string;
  readonly propertyPath?: string;
  readonly propertyValue: unknown;
  readonly minValue?: unknown;
  readonly maxValue?: unknown;
}
