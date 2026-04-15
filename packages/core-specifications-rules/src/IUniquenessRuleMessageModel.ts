export interface IUniquenessRuleMessageModel<TCandidate extends object = Record<string, unknown>>
  extends Record<string, unknown> {
  readonly ruleName: string;
  readonly candidate: TCandidate;
  readonly propertyName: string;
  readonly propertyValue: unknown;
  readonly duplicateCount?: number;
  readonly scopeName?: string;
  readonly scopePath?: string;
}
