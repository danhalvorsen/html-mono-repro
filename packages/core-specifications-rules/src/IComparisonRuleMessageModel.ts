export interface IComparisonRuleMessageModel<TCandidate extends object = Record<string, unknown>>
  extends Record<string, unknown> {
  readonly ruleName: string;
  readonly candidate: TCandidate;
  readonly leftPropertyName: string;
  readonly leftPropertyValue: unknown;
  readonly rightPropertyName: string;
  readonly rightPropertyValue: unknown;
  readonly operator: string;
}
