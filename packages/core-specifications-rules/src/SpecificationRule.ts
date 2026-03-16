// packages/core-specifications-rules/src/SpecificationRule.ts

import type { ISpecification } from "@monorepo/core-specifications";
import type { IRuleMessageFactory } from "./IRuleMessageFactory.js";
import { Rule } from "./Rule.js";

export interface ISpecificationRuleMessageModel<T> extends Record<string, unknown> {
  readonly ruleName: string;
  readonly candidate: T;
}

export class SpecificationRule<T>
  extends Rule<T, ISpecificationRuleMessageModel<T>>
{
  private readonly specification: ISpecification<T>;

  public constructor(
    name: string,
    specification: ISpecification<T>,
    messageFactory: IRuleMessageFactory<T, ISpecificationRuleMessageModel<T>>,
  ) {
    super(name, messageFactory);
    this.specification = specification;
  }

  protected evaluate(model: T): boolean {
    return this.specification.isSatisfiedBy(model);
  }

  protected createMessageModel(model: T): ISpecificationRuleMessageModel<T> {
    return {
      ruleName: this.name,
      candidate: model,
    };
  }
}