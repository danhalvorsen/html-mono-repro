import { describe, expect, it } from "vitest";

import { RuleBasedSemanticValidator } from "../src/RuleBasedSemanticValidator.js";
import { SemanticValidationError } from "../../music-core-synthesizer-schema/src/SemanticValidationError.js";
import { SequencerProjectSemanticRuleSet } from "../src/rules/SequencerProjectSemanticRuleSet.js";
import {
  PatternBuilder,
  ProjectBuilder,
  ProjectComponentsBuilder,
  SampleComponentBuilder,
  SequencerProjectDocumentBuilder,
  StepBuilder,
  TrackBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("SequencerProjectSemanticRuleSet", () => {
  it("Given a semantically valid project When evaluate Then success is returned", () => {
    const sut = new SequencerProjectSemanticRuleSet();
    const model = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withActivePatternId("pattern-2")
          .withComponents(
            new ProjectComponentsBuilder().withSamples([
              new SampleComponentBuilder().withId("sample-2").build(),
            ]),
          )
          .withPatterns([
            new PatternBuilder().withId("pattern-1").build(),
            new PatternBuilder()
              .withId("pattern-2")
              .withTracks([
                new TrackBuilder()
                  .withSampleId("sample-2")
                  .withHits([new StepBuilder().withStep(1).build()])
                  .build(),
              ])
              .build(),
          ]),
      )
      .build();

    const result = sut.evaluate(model);

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("Given multiple semantic failures When evaluate Then readable rule errors are returned", () => {
    const sut = new SequencerProjectSemanticRuleSet();
    const model = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withActivePatternId("missing-pattern")
          .withComponents(
            new ProjectComponentsBuilder().withSamples([
              new SampleComponentBuilder().withId("sample-1").build(),
            ]),
          )
          .withPatterns([
            new PatternBuilder()
              .withId("pattern-1")
              .withStepCount(4)
              .withTracks([
                new TrackBuilder()
                  .withKind("midi")
                  .withSampleId("missing-sample")
                  .withHits([new StepBuilder().withStep(5).build()])
                  .build(),
              ])
              .build(),
          ]),
      )
      .build();

    const result = sut.evaluate(model);

    expect(result.isSuccess).toBe(false);
    expect(result.errors).toHaveLength(4);
    expect(result.renderErrors()).toEqual([
      "Rule ActivePatternExists failed: pattern 'missing-pattern' was not found at project.activePatternId",
      "Rule ReferencedSamplesExist failed: sample 'missing-sample' was not found at project.patterns['pattern-1'].tracks['track-1'].sampleId",
      "Rule MidiTrackMustNotReferenceSampleId failed: property sampleId with value 'missing-sample' is invalid",
      "Rule StepsWithinPatternBounds failed: property step with value '5' must be between 1 and 4",
    ]);
  });
});

describe("RuleBasedSemanticValidator", () => {
  it("Given semantic rule failures When validate Then SemanticValidationError is thrown with readable messages", () => {
    const sut = new RuleBasedSemanticValidator(
      new SequencerProjectSemanticRuleSet(),
    );
    const model = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withActivePatternId("missing-pattern"),
      )
      .build();

    try {
      sut.validate(model);
      expect.unreachable("Expected semantic validation to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SemanticValidationError);
      expect((error as SemanticValidationError).validationErrors).toEqual([
        "Rule ActivePatternExists failed: pattern 'missing-pattern' was not found at project.activePatternId",
      ]);
    }
  });
});
