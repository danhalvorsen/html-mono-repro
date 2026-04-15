export interface IAggregateRuleMessageModel<TCandidate extends object = Record<string, unknown>>
  extends Record<string, unknown> {
  readonly ruleName: string;
  readonly candidate: TCandidate;
  readonly summary: string;
  readonly details?: string;
  readonly path?: string;
}
