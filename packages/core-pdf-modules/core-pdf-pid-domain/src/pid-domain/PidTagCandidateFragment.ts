import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidTagCandidateFragment } from "./IPidTagCandidateFragment.js";
import { PidFragmentKinds } from "./PidFragmentKind.js";
import { PidTagFragmentBase } from "./PidTagFragmentBase.js";
import type { IPidTagTextNormalizer } from "./PidTagTextNormalizer.js";

export class PidTagCandidateFragment
  extends PidTagFragmentBase<typeof PidFragmentKinds.TagCandidate>
  implements IPidTagCandidateFragment {
  public constructor(params: {
    readonly text: string;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
    readonly confidence?: number;
    readonly textNormalizer?: IPidTagTextNormalizer;
  }) {
    super({
      pidKind: PidFragmentKinds.TagCandidate,
      ...params,
    });
  }
}