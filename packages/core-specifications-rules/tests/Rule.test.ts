// packages/core-specifications-rules/tests/Rule.test.ts

import { describe, expect, it } from "vitest";
import { CrossPlatformTemplate } from "@monorepo/core-template";
import type { IRuleMessageFactory } from "../src/IRuleMessageFactory.js";
import type { IValidationMessage } from "../src/IValidationMessage.js";
import { Rule } from "../src/Rule.js";
import { ValidationMessage } from "../src/ValidationMessage.js";

interface ITestModel {
  readonly value: number;
}

interface ITestMessageModel extends Record<string, unknown> {
  readonly ruleName: string;
  readonly candidate: ITestModel;
  readonly value: number;
}

class TestRuleMessageFactory
  implements IRuleMessageFactory<ITestModel, ITestMessageModel>
{
  public createAdapter(
    ruleName: string,
    model: ITestModel,
    messageModel: ITestMessageModel,
  ): IValidationMessage<ITestMessageModel> {
    return new ValidationMessage(
      "RULE_FAILED",
      new CrossPlatformTemplate("Rule ${ruleName} failed for value ${value}"),
      {
        ruleName,
        candidate: model,
        value: messageModel.value,
      },
    );
  }
}

class GreaterThanFiveRule extends Rule<ITestModel, ITestMessageModel> {
  public constructor() {
    super("GreaterThanFive", new TestRuleMessageFactory());
  }

  protected evaluate(model: ITestModel): boolean {
    return model.value > 5;
  }

  protected createMessageModel(model: ITestModel): ITestMessageModel {
    return {
      ruleName: this.name,
      candidate: model,
      value: model.value,
    };
  }
}

describe("Rule", () => {
  it("should return success when evaluate returns true", () => {
    const sut = new GreaterThanFiveRule();

    const result = sut.check({ value: 10 });

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should return failure when evaluate returns false", () => {
    const sut = new GreaterThanFiveRule();

    const result = sut.check({ value: 1 });

    expect(result.isSuccess).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.renderErrors()).toEqual([
      "Rule GreaterThanFive failed for value 1",
    ]);
  });
});