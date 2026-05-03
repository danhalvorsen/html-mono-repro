import { Specification } from "@monorepo/core-specifications";
import type { IPidFragment } from "../pid-domain/IPidFragment.js";

export class PidFragmentPageNumberSpecification extends Specification<IPidFragment> {
  public constructor(private readonly expectedPageNumber: number) {
    super();

    if (!Number.isInteger(expectedPageNumber) || expectedPageNumber < 1) {
      throw new Error("expectedPageNumber must be an integer >= 1.");
    }
  }

  public override isSatisfiedBy(candidate: IPidFragment): boolean {
    return candidate.pageNumber === this.expectedPageNumber;
  }
}