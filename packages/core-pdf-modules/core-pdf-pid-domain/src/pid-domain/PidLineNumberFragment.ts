import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidLineNumberFragment } from "./IPidLineNumberFragment.js";
import { PidFragmentKinds } from "./PidFragmentKind.js";
import { PidTagFragmentBase } from "./PidTagFragmentBase.js";
import type { IPidTagTextNormalizer } from "./PidTagTextNormalizer.js";

export class PidLineNumberFragment
  extends PidTagFragmentBase<typeof PidFragmentKinds.LineNumber>
  implements IPidLineNumberFragment {
  public constructor(params: {
    readonly text: string;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
    readonly confidence?: number;
    readonly textNormalizer?: IPidTagTextNormalizer;
  }) {
    super({
      pidKind: PidFragmentKinds.LineNumber,
      ...params,
    });
  }
}