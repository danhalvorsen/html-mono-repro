import { describe, expect, it } from "vitest";
import { PropertyTemplates } from "../src/PropertyTemplates.js";

interface IExampleCandidate {
  readonly age: number;
}

describe("PropertyTemplates", () => {
  it("renders the required template with shared placeholders", () => {
    const template = PropertyTemplates.required<IExampleCandidate>();

    const result = template.render({
      ruleName: "AgeRequired",
      candidate: { age: 0 },
      propertyName: "age",
    });

    expect(result).toBe("Rule AgeRequired failed: property age is required");
  });

  it("renders the comparison template with property and comparison values", () => {
    const template = PropertyTemplates.comparison<IExampleCandidate>();

    const result = template.render({
      ruleName: "AdultAge",
      candidate: { age: 15 },
      propertyName: "age",
      propertyValue: 15,
      comparisonValue: 18,
    });

    expect(result).toBe(
      "Rule AdultAge failed: property age with value '15' must satisfy comparison value '18'",
    );
  });

  it("renders a custom template using the shared property placeholders", () => {
    const template = PropertyTemplates.custom<IExampleCandidate>(
      "Rule ${ruleName} failed for ${propertyName} at ${propertyPath} with value '${propertyValue}'",
    );

    const result = template.render({
      ruleName: "TrackStepBounds",
      candidate: { age: 1 },
      propertyName: "step",
      propertyPath: "project.patterns[0].tracks[0].steps[4].step",
      propertyValue: 17,
    });

    expect(result).toBe(
      "Rule TrackStepBounds failed for step at project.patterns[0].tracks[0].steps[4].step with value '17'",
    );
  });
});
