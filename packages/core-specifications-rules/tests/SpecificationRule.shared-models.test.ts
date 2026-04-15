import { describe, expect, it } from "vitest";
import { CrossPlatformTemplate } from "@monorepo/core-template";
import { Specification } from "@monorepo/core-specifications";
import type { IAggregateRuleMessageModel } from "../src/IAggregateRuleMessageModel.js";
import type { IComparisonRuleMessageModel } from "../src/IComparisonRuleMessageModel.js";
import type { IRangeRuleMessageModel } from "../src/IRangeRuleMessageModel.js";
import type { IReferenceRuleMessageModel } from "../src/IReferenceRuleMessageModel.js";
import type { IRuleMessageFactory } from "../src/IRuleMessageFactory.js";
import type { IUniquenessRuleMessageModel } from "../src/IUniquenessRuleMessageModel.js";
import type { IValidationMessage } from "../src/IValidationMessage.js";
import { SpecificationRule } from "../src/SpecificationRule.js";
import { ValidationMessage } from "../src/ValidationMessage.js";

interface ITrackCandidate {
  readonly sampleId: string;
  readonly trackId: string;
  readonly startStep: number;
  readonly endStep: number;
}

class MissingReferenceSpecification extends Specification<ITrackCandidate> {
  public isSatisfiedBy(_model: ITrackCandidate): boolean {
    return false;
  }
}

class DuplicateTrackIdSpecification extends Specification<ITrackCandidate> {
  public isSatisfiedBy(_model: ITrackCandidate): boolean {
    return false;
  }
}

class StepOrderSpecification extends Specification<ITrackCandidate> {
  public isSatisfiedBy(_model: ITrackCandidate): boolean {
    return false;
  }
}

class AggregateFailureSpecification extends Specification<ITrackCandidate> {
  public isSatisfiedBy(_model: ITrackCandidate): boolean {
    return false;
  }
}

class StepWithinRangeSpecification extends Specification<ITrackCandidate> {
  public isSatisfiedBy(_model: ITrackCandidate): boolean {
    return false;
  }
}

class ValidReferenceSpecification extends Specification<ITrackCandidate> {
  public isSatisfiedBy(_model: ITrackCandidate): boolean {
    return true;
  }
}

class MissingReferenceMessageFactory
  implements IRuleMessageFactory<ITrackCandidate, IReferenceRuleMessageModel<ITrackCandidate>>
{
  public createAdapter(
    ruleName: string,
    model: ITrackCandidate,
    _messageModel: IReferenceRuleMessageModel<ITrackCandidate>,
  ): IValidationMessage<IReferenceRuleMessageModel<ITrackCandidate>> {
    return new ValidationMessage(
      "MISSING_REFERENCE",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: ${referenceType} '${referenceId}' was not found at ${referencePath}",
      ),
      {
        ruleName,
        candidate: model,
        referenceType: "sample",
        referenceId: model.sampleId,
        referencePath: "track.sampleId",
        ownerName: model.trackId,
      },
    );
  }
}

class DuplicateTrackIdMessageFactory
  implements IRuleMessageFactory<ITrackCandidate, IUniquenessRuleMessageModel<ITrackCandidate>>
{
  public createAdapter(
    ruleName: string,
    model: ITrackCandidate,
    _messageModel: IUniquenessRuleMessageModel<ITrackCandidate>,
  ): IValidationMessage<IUniquenessRuleMessageModel<ITrackCandidate>> {
    return new ValidationMessage(
      "DUPLICATE_TRACK_ID",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: duplicate ${propertyName} '${propertyValue}' found in ${scopeName}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "trackId",
        propertyValue: model.trackId,
        duplicateCount: 2,
        scopeName: "pattern p-1",
        scopePath: "project.patterns[0].tracks",
      },
    );
  }
}

class StepOrderMessageFactory
  implements IRuleMessageFactory<ITrackCandidate, IComparisonRuleMessageModel<ITrackCandidate>>
{
  public createAdapter(
    ruleName: string,
    model: ITrackCandidate,
    _messageModel: IComparisonRuleMessageModel<ITrackCandidate>,
  ): IValidationMessage<IComparisonRuleMessageModel<ITrackCandidate>> {
    return new ValidationMessage(
      "INVALID_STEP_ORDER",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: ${leftPropertyName} '${leftPropertyValue}' must be <= ${rightPropertyName} '${rightPropertyValue}'",
      ),
      {
        ruleName,
        candidate: model,
        leftPropertyName: "startStep",
        leftPropertyValue: model.startStep,
        rightPropertyName: "endStep",
        rightPropertyValue: model.endStep,
        operator: "<=",
      },
    );
  }
}

class AggregateMessageFactory
  implements IRuleMessageFactory<ITrackCandidate, IAggregateRuleMessageModel<ITrackCandidate>>
{
  public createAdapter(
    ruleName: string,
    model: ITrackCandidate,
    _messageModel: IAggregateRuleMessageModel<ITrackCandidate>,
  ): IValidationMessage<IAggregateRuleMessageModel<ITrackCandidate>> {
    return new ValidationMessage(
      "INVALID_TRACK_STATE",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: ${summary} (${details})",
      ),
      {
        ruleName,
        candidate: model,
        summary: "track state is inconsistent",
        details: "sample reference is missing and step order is invalid",
        path: "project.patterns[0].tracks[0]",
      },
    );
  }
}

class RangeMessageFactory
  implements IRuleMessageFactory<ITrackCandidate, IRangeRuleMessageModel<ITrackCandidate>>
{
  public createAdapter(
    ruleName: string,
    model: ITrackCandidate,
    _messageModel: IRangeRuleMessageModel<ITrackCandidate>,
  ): IValidationMessage<IRangeRuleMessageModel<ITrackCandidate>> {
    return new ValidationMessage(
      "STEP_OUT_OF_RANGE",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: property ${propertyName} with value '${propertyValue}' must be between ${minValue} and ${maxValue}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "startStep",
        propertyPath: "track.startStep",
        propertyValue: model.startStep,
        minValue: 0,
        maxValue: 15,
      },
    );
  }
}

describe("SpecificationRule shared message models", () => {
  const candidate: ITrackCandidate = {
    sampleId: "sample-404",
    trackId: "track-1",
    startStep: 16,
    endStep: 8,
  };

  it("renders a reference-oriented validation message", () => {
    const rule = new SpecificationRule(
      "ReferencedSampleExists",
      new MissingReferenceSpecification(),
      new MissingReferenceMessageFactory(),
    );

    const result = rule.check(candidate);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule ReferencedSampleExists failed: sample 'sample-404' was not found at track.sampleId",
    ]);
  });

  it("renders a uniqueness-oriented validation message", () => {
    const rule = new SpecificationRule(
      "UniqueTrackIdsWithinPattern",
      new DuplicateTrackIdSpecification(),
      new DuplicateTrackIdMessageFactory(),
    );

    const result = rule.check(candidate);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule UniqueTrackIdsWithinPattern failed: duplicate trackId 'track-1' found in pattern p-1",
    ]);
  });

  it("renders a comparison-oriented validation message", () => {
    const rule = new SpecificationRule(
      "StepOrder",
      new StepOrderSpecification(),
      new StepOrderMessageFactory(),
    );

    const result = rule.check(candidate);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule StepOrder failed: startStep '16' must be <= endStep '8'",
    ]);
  });

  it("renders an aggregate validation message", () => {
    const rule = new SpecificationRule(
      "TrackSemanticIntegrity",
      new AggregateFailureSpecification(),
      new AggregateMessageFactory(),
    );

    const result = rule.check(candidate);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule TrackSemanticIntegrity failed: track state is inconsistent (sample reference is missing and step order is invalid)",
    ]);
  });

  it("renders a range-oriented validation message", () => {
    const rule = new SpecificationRule(
      "StepWithinRange",
      new StepWithinRangeSpecification(),
      new RangeMessageFactory(),
    );

    const result = rule.check(candidate);

    expect(result.isSuccess).toBe(false);
    expect(result.renderErrors()).toEqual([
      "Rule StepWithinRange failed: property startStep with value '16' must be between 0 and 15",
    ]);
  });

  it("returns success when the underlying specification succeeds", () => {
    const rule = new SpecificationRule(
      "ReferencedSampleExists",
      new ValidReferenceSpecification(),
      new MissingReferenceMessageFactory(),
    );

    const result = rule.check(candidate);

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
