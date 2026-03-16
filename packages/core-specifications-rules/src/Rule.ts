// packages/core-specifications-rules/src/Rule.ts

import type { IRule } from "./IRule.js";
import type { IRuleMessageFactory } from "./IRuleMessageFactory.js";
import { ValidationResult } from "./ValidationResult.js";

export abstract class Rule<T, TMessageModel extends object> implements IRule<T> {
  public readonly name: string;
  private readonly messageFactory: IRuleMessageFactory<T, TMessageModel>;

  protected constructor(
    name: string,
    messageFactory: IRuleMessageFactory<T, TMessageModel>,
  ) {
    this.name = name;
    this.messageFactory = messageFactory;
  }

  protected abstract evaluate(model: T): boolean;

  protected abstract createMessageModel(model: T): TMessageModel;

  public check(model: T): ValidationResult {
    if (this.evaluate(model)) {
      return ValidationResult.ok();
    }

    return ValidationResult.fail(
      this.messageFactory.createAdapter(
        this.name,
        model,
        this.createMessageModel(model),
      ),
    );
  }
}