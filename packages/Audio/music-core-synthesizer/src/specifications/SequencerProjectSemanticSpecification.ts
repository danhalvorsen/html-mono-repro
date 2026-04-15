import { Specification } from "@monorepo/core-specifications";

import type { ISpecification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";
import { ActivePatternExistsSpecification } from "./ActivePatternExistsSpecification.js";
import { CreatedAtBeforeUpdatedAtSpecification } from "./CreatedAtBeforeUpdatedAtSpecification.js";
import { MidiTrackMustNotReferenceSampleIdSpecification } from "./MidiTrackMustNotReferenceSampleIdSpecification.js";
import { ReferencedSamplesExistSpecification } from "./ReferencedSamplesExistSpecification.js";
import { SampleTrackRequiresSampleIdSpecification } from "./SampleTrackRequiresSampleIdSpecification.js";
import { SampleWindowStartBeforeEndSpecification } from "./SampleWindowStartBeforeEndSpecification.js";
import { StepsWithinPatternBoundsSpecification } from "./StepsWithinPatternBoundsSpecification.js";
import { UniquePatternIdsSpecification } from "./UniquePatternIdsSpecification.js";
import { UniqueSampleIdsSpecification } from "./UniqueSampleIdsSpecification.js";
import { UniqueStepIdsWithinTrackSpecification } from "./UniqueStepIdsWithinTrackSpecification.js";
import { UniqueStepIndexesWithinTrackSpecification } from "./UniqueStepIndexesWithinTrackSpecification.js";
import { UniqueTrackIdsWithinPatternSpecification } from "./UniqueTrackIdsWithinPatternSpecification.js";

export class SequencerProjectSemanticSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  private readonly inner: ISpecification<SequencerProjectDocumentDto>;

  public constructor() {
    super();
    this.inner = new ActivePatternExistsSpecification()
      .and(new UniquePatternIdsSpecification())
      .and(new UniqueSampleIdsSpecification())
      .and(new UniqueTrackIdsWithinPatternSpecification())
      .and(new ReferencedSamplesExistSpecification())
      .and(new SampleTrackRequiresSampleIdSpecification())
      .and(new MidiTrackMustNotReferenceSampleIdSpecification())
      .and(new StepsWithinPatternBoundsSpecification())
      .and(new UniqueStepIdsWithinTrackSpecification())
      .and(new UniqueStepIndexesWithinTrackSpecification())
      .and(new CreatedAtBeforeUpdatedAtSpecification())
      .and(new SampleWindowStartBeforeEndSpecification());
  }

  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    return this.inner.isSatisfiedBy(candidate);
  }
}
