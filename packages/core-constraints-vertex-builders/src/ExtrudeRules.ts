import { IRule } from "../../core-specifications-rules/dist/IRule.js";
import { SpecificationRule } from "../../core-specifications-rules/dist/SpecificationRule.js";
import { ValidationResult } from "../../core-specifications-rules/dist/ValidationResult.js";
import { SimpleMessageFactory, IExtrudeBuildModel, GeometryRefExistsSpecification, ExtrudeDepthIsPositiveSpecification } from "./code.js";


export class ExtrudeRules {
  private readonly messageFactory = new SimpleMessageFactory<IExtrudeBuildModel>();

  public readonly rules: readonly IRule<IExtrudeBuildModel>[] = [
    new SpecificationRule(
      "GeometryRefExists",
      new GeometryRefExistsSpecification(),
      this.createFactory()
    ),
    new SpecificationRule(
      "ExtrudeDepthIsPositive",
      new ExtrudeDepthIsPositiveSpecification(),
      this.createFactory()
    ),
  ];

  private createFactory() {
    return {
      createAdapter: (ruleName: string) => ({
        code: ruleName,
        template: { render: () => this.messageFactory.create(ruleName) },
        model: {},
        render() {
          return `[${ruleName}] validation failed`;
        },
      }),
    };
  }

  public validate(model: IExtrudeBuildModel): ValidationResult {
    return this.rules.reduce(
      (acc, rule) => acc.merge(rule.check(model)),
      ValidationResult.ok()
    );
  }
}
