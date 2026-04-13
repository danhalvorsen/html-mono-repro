export interface IReferenceRuleMessageModel<TCandidate extends object = Record<string, unknown>>
  extends Record<string, unknown> {
  readonly ruleName: string;
  readonly candidate: TCandidate;
  readonly referenceType: string;
  readonly referenceId: string | number;
  readonly referencePath?: string;
  readonly ownerName?: string;
}
