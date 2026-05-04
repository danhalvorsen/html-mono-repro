import { Specification } from "@monorepo/core-specifications";
import type { IPidTagFragment } from "../pid-domain/IPidTagFragment.js";
import { PidTagTextNormalizer, type IPidTagTextNormalizer } from "../pid-domain/PidTagTextNormalizer.js";

export class PidTagTextContainsSpecification extends Specification<IPidTagFragment> {
  private readonly normalizedNeedle: string;

  public constructor(
    needle: string,
    textNormalizer: IPidTagTextNormalizer = new PidTagTextNormalizer(),
  ) {
    super();

    if (needle.trim().length === 0) {
      throw new Error("needle must not be empty.");
    }

    this.normalizedNeedle = textNormalizer.normalize(needle);
  }

  public override isSatisfiedBy(candidate: IPidTagFragment): boolean {
    return candidate.normalizedText.includes(this.normalizedNeedle);
  }
}