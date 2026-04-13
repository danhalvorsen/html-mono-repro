import { describe, expect, it } from "vitest";
import { PropertyTemplates } from "@monorepo/core-template";
import { Specification } from "@monorepo/core-specifications";
import type { IRuleMessageFactory } from "../src/IRuleMessageFactory.js";
import type { IValidationMessage } from "../src/IValidationMessage.js";
import type { IPropertyRuleMessageModel } from "../src/IPropertyRuleMessageModel.js";
import { SpecificationRule } from "../src/SpecificationRule.js";
import { ValidationMessage } from "../src/ValidationMessage.js";

interface IUserCandidate {
  readonly age: number;
}

class AdultSpecification extends Specification<IUserCandidate> {
  public isSatisfiedBy(model: IUserCandidate): boolean {
    return model.age >= 18;
  }
}

class AdultRuleMessageFactory
  implements IRuleMessageFactory<IUserCandidate, IPropertyRuleMessageModel<IUserCandidate>>
{
  public createAdapter(
    ruleName: string,
    model: IUserCandidate,
    _messageModel: IPropertyRuleMessageModel<IUserCandidate>,
  ): IValidationMessage<IPropertyRuleMessageModel<IUserCandidate>> {
    return new ValidationMessage(
      "USER_NOT_ADULT",
      PropertyTemplates.comparison<IUserCandidate>(),
      {
        ruleName,
        candidate: model,
        propertyName: "age",
        propertyPath: "user.age",
        propertyValue: model.age,
        comparisonValue: 18,
      },
    );
  }
}

describe("SpecificationRule property message model", () => {
  it("renders a shared property-oriented validation message", () => {
    const rule = new SpecificationRule(
      "AdultSpecification",
      new AdultSpecification(),
      new AdultRuleMessageFactory(),
    );

    const result = rule.check({ age: 15 });

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule AdultSpecification failed: property age with value '15' must satisfy comparison value '18'",
    ]);
  });

  it("returns success when the underlying specification is satisfied", () => {
    const rule = new SpecificationRule(
      "AdultSpecification",
      new AdultSpecification(),
      new AdultRuleMessageFactory(),
    );

    const result = rule.check({ age: 18 });

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
