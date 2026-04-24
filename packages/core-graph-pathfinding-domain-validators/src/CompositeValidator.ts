import { ValidationGuard } from "./ValidationGuard.js";
import { type  IValidationRule } from "./IValidationRule.js";
import { type IValidator } from "./IValidator.js";
 
export class CompositeValidator<TContext> implements IValidator<TContext> {
  private readonly rulesInternal: readonly IValidationRule<TContext>[];

  public constructor(rules: readonly IValidationRule<TContext>[]) {
    ValidationGuard.againstNullOrUndefined(rules, "rules");
    this.rulesInternal = Object.freeze([...rules]);
    Object.freeze(this);
  }

  public validate(context: TContext): void {
    ValidationGuard.againstNullOrUndefined(context, "context");

    for (const rule of this.rulesInternal) {
      rule.validate(context);
    }
  }
}