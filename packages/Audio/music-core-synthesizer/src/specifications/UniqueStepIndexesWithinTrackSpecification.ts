import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class UniqueStepIndexesWithinTrackSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    return candidate.project.patterns.every((pattern) =>
      pattern.tracks.every((track) => {
        const stepIndexes = track.hits.map((step) => step.step);
        return new Set(stepIndexes).size === stepIndexes.length;
      }),
    );
  }
}
