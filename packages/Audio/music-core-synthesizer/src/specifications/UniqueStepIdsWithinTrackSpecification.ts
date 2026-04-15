import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class UniqueStepIdsWithinTrackSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    return candidate.project.patterns.every((pattern) =>
      pattern.tracks.every((track) => {
        const stepIds = track.hits.map((step) => step.id);
        return new Set(stepIds).size === stepIds.length;
      }),
    );
  }
}
