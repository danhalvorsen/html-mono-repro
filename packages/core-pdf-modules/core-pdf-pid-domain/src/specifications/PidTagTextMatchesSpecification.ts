import { Specification } from "@monorepo/core-specifications";
import type { IPidTagFragment } from "../pid-domain/IPidTagFragment.js";

export class PidTagTextMatchesSpecification extends Specification<IPidTagFragment> {
  public constructor(private readonly pattern: RegExp) {
    super();
  }

  public override isSatisfiedBy(candidate: IPidTagFragment): boolean {
    return this.pattern.test(candidate.normalizedText);
  }
}