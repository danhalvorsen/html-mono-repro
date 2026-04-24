import type { ISemanticRuleSet } from "./RuleBasedSemanticValidator.js";

export class SequencerProjectSemanticRuleSet<T> implements ISemanticRuleSet<T> {
  public readonly rules: readonly [] = [];

  public evaluate(_model: T): {
    readonly isSuccess: true;
    renderErrors(): readonly string[];
  } {
    return {
      isSuccess: true,
      renderErrors: (): readonly string[] => [],
    };
  }
}
