import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class UniqueTrackIdsWithinPatternSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    return candidate.project.patterns.every((pattern) => {
      const trackIds = pattern.tracks.map((track) => track.id);
      return new Set(trackIds).size === trackIds.length;
    });
  }
}
