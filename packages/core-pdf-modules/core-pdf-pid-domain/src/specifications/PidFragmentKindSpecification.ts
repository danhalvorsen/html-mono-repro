import { Specification } from "@monorepo/core-specifications";
import type { IPidFragment } from "../pid-domain/IPidFragment.js";
import type { PidFragmentKind } from "../pid-domain/PidFragmentKind.js";

export class PidFragmentKindSpecification extends Specification<IPidFragment> {
  public constructor(private readonly expectedKind: PidFragmentKind) {
    super();
  }

  public override isSatisfiedBy(candidate: IPidFragment): boolean {
    return candidate.pidKind === this.expectedKind;
  }
}