import { Specification } from "@monorepo/core-specifications";
import type { IPidTagFragment } from "../pid-domain/IPidTagFragment.js";

export class PidTagConfidenceAtLeastSpecification extends Specification<IPidTagFragment> {
  public constructor(private readonly minimumConfidence: number) {
    super();

    if (
      !Number.isFinite(minimumConfidence) ||
      minimumConfidence < 0 ||
      minimumConfidence > 1
    ) {
      throw new Error("minimumConfidence must be a finite number between 0 and 1.");
    }
  }

  public override isSatisfiedBy(candidate: IPidTagFragment): boolean {
    return candidate.confidence >= this.minimumConfidence;
  }
}