import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class ActivePatternExistsSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    const activePatternId = candidate.project.activePatternId;

    return candidate.project.patterns.some(
      (pattern) => pattern.id === activePatternId,
    );
  }
}
