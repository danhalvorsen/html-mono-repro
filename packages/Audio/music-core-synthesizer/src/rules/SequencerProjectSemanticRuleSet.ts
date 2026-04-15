import { CrossPlatformTemplate, PropertyTemplates } from "@monorepo/core-template";
import type {
  IComparisonRuleMessageModel,
  IPropertyRuleMessageModel,
  IRangeRuleMessageModel,
  IReferenceRuleMessageModel,
  IRule,
  IRuleMessageFactory,
  IRuleSet,
  IUniquenessRuleMessageModel,
  IValidationMessage,
} from "@monorepo/core-specifications-rules";
import {
  ValidationMessage,
  ValidationResult,
  SpecificationRule,
} from "@monorepo/core-specifications-rules";

import type { SequencerProjectDocumentDto } from "../dto.js";
import { ActivePatternExistsSpecification } from "../specifications/ActivePatternExistsSpecification.js";
import { CreatedAtBeforeUpdatedAtSpecification } from "../specifications/CreatedAtBeforeUpdatedAtSpecification.js";
import { MidiTrackMustNotReferenceSampleIdSpecification } from "../specifications/MidiTrackMustNotReferenceSampleIdSpecification.js";
import { ReferencedSamplesExistSpecification } from "../specifications/ReferencedSamplesExistSpecification.js";
import { SampleTrackRequiresSampleIdSpecification } from "../specifications/SampleTrackRequiresSampleIdSpecification.js";
import { SampleWindowStartBeforeEndSpecification } from "../specifications/SampleWindowStartBeforeEndSpecification.js";
import { StepsWithinPatternBoundsSpecification } from "../specifications/StepsWithinPatternBoundsSpecification.js";
import { UniquePatternIdsSpecification } from "../specifications/UniquePatternIdsSpecification.js";
import { UniqueSampleIdsSpecification } from "../specifications/UniqueSampleIdsSpecification.js";
import { UniqueStepIdsWithinTrackSpecification } from "../specifications/UniqueStepIdsWithinTrackSpecification.js";
import { UniqueStepIndexesWithinTrackSpecification } from "../specifications/UniqueStepIndexesWithinTrackSpecification.js";
import { UniqueTrackIdsWithinPatternSpecification } from "../specifications/UniqueTrackIdsWithinPatternSpecification.js";

type ProjectDto = SequencerProjectDocumentDto["project"];
type PatternDto = ProjectDto["patterns"][number];
type TrackDto = PatternDto["tracks"][number];
type StepDto = TrackDto["hits"][number];
type SampleWindowDto =
  | TrackDto["defaults"]["sampleWindow"]
  | StepDto["sampleWindow"];

class ActivePatternExistsMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IReferenceRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IReferenceRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IReferenceRuleMessageModel<SequencerProjectDocumentDto>> {
    return new ValidationMessage(
      "ACTIVE_PATTERN_NOT_FOUND",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: ${referenceType} '${referenceId}' was not found at ${referencePath}",
      ),
      {
        ruleName,
        candidate: model,
        referenceType: "pattern",
        referenceId: model.project.activePatternId,
        referencePath: "project.activePatternId",
      },
    );
  }
}

class UniquePatternIdsMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IUniquenessRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IUniquenessRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IUniquenessRuleMessageModel<SequencerProjectDocumentDto>> {
    const duplicateId = findFirstDuplicate(
      model.project.patterns.map((pattern) => pattern.id),
    );

    return new ValidationMessage(
      "DUPLICATE_PATTERN_ID",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: duplicate ${propertyName} '${propertyValue}' found in ${scopeName}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "pattern.id",
        propertyValue: duplicateId ?? "[unknown duplicate]",
        scopeName: "project.patterns",
      },
    );
  }
}

class UniqueSampleIdsMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IUniquenessRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IUniquenessRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IUniquenessRuleMessageModel<SequencerProjectDocumentDto>> {
    const duplicateId = findFirstDuplicate(
      model.project.components.samples.map((sample) => sample.id),
    );

    return new ValidationMessage(
      "DUPLICATE_SAMPLE_ID",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: duplicate ${propertyName} '${propertyValue}' found in ${scopeName}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "sample.id",
        propertyValue: duplicateId ?? "[unknown duplicate]",
        scopeName: "project.components.samples",
      },
    );
  }
}

class UniqueTrackIdsWithinPatternMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IUniquenessRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IUniquenessRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IUniquenessRuleMessageModel<SequencerProjectDocumentDto>> {
    const duplicate = findFirstPatternTrackIdDuplicate(model.project.patterns);

    return new ValidationMessage(
      "DUPLICATE_TRACK_ID",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: duplicate ${propertyName} '${propertyValue}' found in ${scopeName}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "track.id",
        propertyValue: duplicate?.duplicateId ?? "[unknown duplicate]",
        scopeName: duplicate?.scopeName ?? "pattern.tracks",
      },
    );
  }
}

class ReferencedSamplesExistMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IReferenceRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IReferenceRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IReferenceRuleMessageModel<SequencerProjectDocumentDto>> {
    const missingReference = findMissingSampleReference(model.project);

    return new ValidationMessage(
      "MISSING_SAMPLE_REFERENCE",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: ${referenceType} '${referenceId}' was not found at ${referencePath}",
      ),
      {
        ruleName,
        candidate: model,
        referenceType: "sample",
        referenceId: missingReference?.referenceId ?? "[unknown reference]",
        referencePath: missingReference?.referencePath ?? "project.patterns[].tracks[].sampleId",
        ...withOptional("ownerName", missingReference?.ownerName),
      },
    );
  }
}

class SampleTrackRequiresSampleIdMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IPropertyRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IPropertyRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IPropertyRuleMessageModel<SequencerProjectDocumentDto>> {
    const violation = findSampleTrackMissingSampleId(model.project.patterns);

    return new ValidationMessage(
      "SAMPLE_ID_REQUIRED",
      PropertyTemplates.required<SequencerProjectDocumentDto>(),
      {
        ruleName,
        candidate: model,
        propertyName: "sampleId",
        ...withOptional("propertyPath", violation?.propertyPath),
      },
    );
  }
}

class MidiTrackMustNotReferenceSampleIdMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IPropertyRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IPropertyRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IPropertyRuleMessageModel<SequencerProjectDocumentDto>> {
    const violation = findMidiTrackWithSampleId(model.project.patterns);

    return new ValidationMessage(
      "MIDI_TRACK_HAS_SAMPLE_ID",
      PropertyTemplates.invalid<SequencerProjectDocumentDto>(),
      {
        ruleName,
        candidate: model,
        propertyName: "sampleId",
        ...withOptional("propertyPath", violation?.propertyPath),
        ...withOptional("propertyValue", violation?.propertyValue),
      },
    );
  }
}

class StepsWithinPatternBoundsMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IRangeRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IRangeRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IRangeRuleMessageModel<SequencerProjectDocumentDto>> {
    const violation = findStepOutsidePatternBounds(model.project.patterns);

    return new ValidationMessage(
      "STEP_OUT_OF_BOUNDS",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: property ${propertyName} with value '${propertyValue}' must be between ${minValue} and ${maxValue}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "step",
        ...withOptional("propertyPath", violation?.propertyPath),
        propertyValue: violation?.propertyValue ?? "[unknown step]",
        minValue: 1,
        maxValue: violation?.maxValue ?? "[unknown max]",
      },
    );
  }
}

class UniqueStepIdsWithinTrackMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IUniquenessRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IUniquenessRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IUniquenessRuleMessageModel<SequencerProjectDocumentDto>> {
    const duplicate = findFirstTrackStepIdDuplicate(model.project.patterns);

    return new ValidationMessage(
      "DUPLICATE_STEP_ID",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: duplicate ${propertyName} '${propertyValue}' found in ${scopeName}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "step.id",
        propertyValue: duplicate?.duplicateId ?? "[unknown duplicate]",
        scopeName: duplicate?.scopeName ?? "track.hits",
      },
    );
  }
}

class UniqueStepIndexesWithinTrackMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IUniquenessRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IUniquenessRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IUniquenessRuleMessageModel<SequencerProjectDocumentDto>> {
    const duplicate = findFirstTrackStepIndexDuplicate(model.project.patterns);

    return new ValidationMessage(
      "DUPLICATE_STEP_INDEX",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: duplicate ${propertyName} '${propertyValue}' found in ${scopeName}",
      ),
      {
        ruleName,
        candidate: model,
        propertyName: "step.step",
        propertyValue: duplicate?.duplicateId ?? "[unknown duplicate]",
        scopeName: duplicate?.scopeName ?? "track.hits",
      },
    );
  }
}

class CreatedAtBeforeUpdatedAtMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IComparisonRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IComparisonRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IComparisonRuleMessageModel<SequencerProjectDocumentDto>> {
    return new ValidationMessage(
      "CREATED_AFTER_UPDATED",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: ${leftPropertyName} '${leftPropertyValue}' must be <= ${rightPropertyName} '${rightPropertyValue}'",
      ),
      {
        ruleName,
        candidate: model,
        leftPropertyName: "createdAt",
        leftPropertyValue: model.project.createdAt ?? "[createdAt missing]",
        rightPropertyName: "updatedAt",
        rightPropertyValue: model.project.updatedAt ?? "[updatedAt missing]",
        operator: "<=",
      },
    );
  }
}

class SampleWindowStartBeforeEndMessageFactory
  implements IRuleMessageFactory<SequencerProjectDocumentDto, IComparisonRuleMessageModel<SequencerProjectDocumentDto>>
{
  public createAdapter(
    ruleName: string,
    model: SequencerProjectDocumentDto,
    _messageModel: IComparisonRuleMessageModel<SequencerProjectDocumentDto>,
  ): IValidationMessage<IComparisonRuleMessageModel<SequencerProjectDocumentDto>> {
    const violation = findInvalidSampleWindow(model.project.patterns);

    return new ValidationMessage(
      "INVALID_SAMPLE_WINDOW",
      new CrossPlatformTemplate(
        "Rule ${ruleName} failed: ${leftPropertyName} '${leftPropertyValue}' must be <= ${rightPropertyName} '${rightPropertyValue}'",
      ),
      {
        ruleName,
        candidate: model,
        leftPropertyName: `${violation?.propertyPath ?? "sampleWindow"}.start`,
        leftPropertyValue: violation?.start ?? "[unknown start]",
        rightPropertyName: `${violation?.propertyPath ?? "sampleWindow"}.end`,
        rightPropertyValue: violation?.end ?? "[unknown end]",
        operator: "<=",
      },
    );
  }
}

export class SequencerProjectSemanticRuleSet
  implements IRuleSet<SequencerProjectDocumentDto>
{
  public readonly rules: IRule<SequencerProjectDocumentDto>[];

  public constructor() {
    this.rules = [
      new SpecificationRule(
        "ActivePatternExists",
        new ActivePatternExistsSpecification(),
        new ActivePatternExistsMessageFactory(),
      ),
      new SpecificationRule(
        "UniquePatternIds",
        new UniquePatternIdsSpecification(),
        new UniquePatternIdsMessageFactory(),
      ),
      new SpecificationRule(
        "UniqueSampleIds",
        new UniqueSampleIdsSpecification(),
        new UniqueSampleIdsMessageFactory(),
      ),
      new SpecificationRule(
        "UniqueTrackIdsWithinPattern",
        new UniqueTrackIdsWithinPatternSpecification(),
        new UniqueTrackIdsWithinPatternMessageFactory(),
      ),
      new SpecificationRule(
        "ReferencedSamplesExist",
        new ReferencedSamplesExistSpecification(),
        new ReferencedSamplesExistMessageFactory(),
      ),
      new SpecificationRule(
        "SampleTrackRequiresSampleId",
        new SampleTrackRequiresSampleIdSpecification(),
        new SampleTrackRequiresSampleIdMessageFactory(),
      ),
      new SpecificationRule(
        "MidiTrackMustNotReferenceSampleId",
        new MidiTrackMustNotReferenceSampleIdSpecification(),
        new MidiTrackMustNotReferenceSampleIdMessageFactory(),
      ),
      new SpecificationRule(
        "StepsWithinPatternBounds",
        new StepsWithinPatternBoundsSpecification(),
        new StepsWithinPatternBoundsMessageFactory(),
      ),
      new SpecificationRule(
        "UniqueStepIdsWithinTrack",
        new UniqueStepIdsWithinTrackSpecification(),
        new UniqueStepIdsWithinTrackMessageFactory(),
      ),
      new SpecificationRule(
        "UniqueStepIndexesWithinTrack",
        new UniqueStepIndexesWithinTrackSpecification(),
        new UniqueStepIndexesWithinTrackMessageFactory(),
      ),
      new SpecificationRule(
        "CreatedAtBeforeUpdatedAt",
        new CreatedAtBeforeUpdatedAtSpecification(),
        new CreatedAtBeforeUpdatedAtMessageFactory(),
      ),
      new SpecificationRule(
        "SampleWindowStartBeforeEnd",
        new SampleWindowStartBeforeEndSpecification(),
        new SampleWindowStartBeforeEndMessageFactory(),
      ),
    ];
  }

  public evaluate(model: SequencerProjectDocumentDto): ValidationResult {
    return this.rules.reduce(
      (result, rule) => result.merge(rule.check(model)),
      ValidationResult.ok(),
    );
  }
}

function findFirstDuplicate<T>(values: readonly T[]): T | undefined {
  const seen = new Set<T>();

  for (const value of values) {
    if (seen.has(value)) {
      return value;
    }

    seen.add(value);
  }

  return undefined;
}

function withOptional<TKey extends string, TValue>(
  key: TKey,
  value: TValue | undefined,
): Record<TKey, TValue> | Record<string, never> {
  if (value === undefined) {
    return {};
  }

  return { [key]: value } as Record<TKey, TValue>;
}

function findFirstPatternTrackIdDuplicate(
  patterns: readonly PatternDto[],
): { duplicateId: string; scopeName: string } | undefined {
  for (const pattern of patterns) {
    const duplicateId = findFirstDuplicate(pattern.tracks.map((track) => track.id));

    if (duplicateId !== undefined) {
      return {
        duplicateId,
        scopeName: `pattern '${pattern.id}'`,
      };
    }
  }

  return undefined;
}

function findMissingSampleReference(
  project: ProjectDto,
): { referenceId: string; referencePath: string; ownerName: string } | undefined {
  const sampleIds = new Set(project.components.samples.map((sample) => sample.id));

  for (const pattern of project.patterns) {
    for (const track of pattern.tracks) {
      if (track.sampleId !== undefined && !sampleIds.has(track.sampleId)) {
        return {
          referenceId: track.sampleId,
          referencePath: `project.patterns['${pattern.id}'].tracks['${track.id}'].sampleId`,
          ownerName: track.id,
        };
      }
    }
  }

  return undefined;
}

function findSampleTrackMissingSampleId(
  patterns: readonly PatternDto[],
): { propertyPath: string } | undefined {
  for (const pattern of patterns) {
    for (const track of pattern.tracks) {
      if (track.kind === "sample" && track.sampleId === undefined) {
        return {
          propertyPath: `project.patterns['${pattern.id}'].tracks['${track.id}'].sampleId`,
        };
      }
    }
  }

  return undefined;
}

function findMidiTrackWithSampleId(
  patterns: readonly PatternDto[],
): { propertyPath: string; propertyValue: string } | undefined {
  for (const pattern of patterns) {
    for (const track of pattern.tracks) {
      if (track.kind === "midi" && track.sampleId !== undefined) {
        return {
          propertyPath: `project.patterns['${pattern.id}'].tracks['${track.id}'].sampleId`,
          propertyValue: track.sampleId,
        };
      }
    }
  }

  return undefined;
}

function findStepOutsidePatternBounds(
  patterns: readonly PatternDto[],
): { propertyPath: string; propertyValue: number; maxValue: number } | undefined {
  for (const pattern of patterns) {
    for (const track of pattern.tracks) {
      for (const step of track.hits) {
        if (step.step > pattern.stepCount) {
          return {
            propertyPath: `project.patterns['${pattern.id}'].tracks['${track.id}'].hits['${step.id}'].step`,
            propertyValue: step.step,
            maxValue: pattern.stepCount,
          };
        }
      }
    }
  }

  return undefined;
}

function findFirstTrackStepIdDuplicate(
  patterns: readonly PatternDto[],
): { duplicateId: string; scopeName: string } | undefined {
  for (const pattern of patterns) {
    for (const track of pattern.tracks) {
      const duplicateId = findFirstDuplicate(track.hits.map((step) => step.id));

      if (duplicateId !== undefined) {
        return {
          duplicateId,
          scopeName: `track '${track.id}' in pattern '${pattern.id}'`,
        };
      }
    }
  }

  return undefined;
}

function findFirstTrackStepIndexDuplicate(
  patterns: readonly PatternDto[],
): { duplicateId: number; scopeName: string } | undefined {
  for (const pattern of patterns) {
    for (const track of pattern.tracks) {
      const duplicateId = findFirstDuplicate(track.hits.map((step) => step.step));

      if (duplicateId !== undefined) {
        return {
          duplicateId,
          scopeName: `track '${track.id}' in pattern '${pattern.id}'`,
        };
      }
    }
  }

  return undefined;
}

function findInvalidSampleWindow(
  patterns: readonly PatternDto[],
): { propertyPath: string; start: number; end: number } | undefined {
  for (const pattern of patterns) {
    for (const track of pattern.tracks) {
      const trackWindow = track.defaults.sampleWindow;

      if (isInvalidSampleWindow(trackWindow)) {
        return {
          propertyPath: `project.patterns['${pattern.id}'].tracks['${track.id}'].defaults.sampleWindow`,
          start: trackWindow.start,
          end: trackWindow.end,
        };
      }

      for (const step of track.hits) {
        if (isInvalidSampleWindow(step.sampleWindow)) {
          return {
            propertyPath: `project.patterns['${pattern.id}'].tracks['${track.id}'].hits['${step.id}'].sampleWindow`,
            start: step.sampleWindow.start,
            end: step.sampleWindow.end,
          };
        }
      }
    }
  }

  return undefined;
}

function isInvalidSampleWindow(
  sampleWindow: SampleWindowDto | undefined,
): sampleWindow is Exclude<SampleWindowDto, undefined> {
  return sampleWindow !== undefined && sampleWindow.start > sampleWindow.end;
}
