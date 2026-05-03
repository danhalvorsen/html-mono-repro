import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidInstrumentTagFragment } from "./IPidInstrumentTagFragment.js";
import { PidFragmentKinds } from "./PidFragmentKind.js";
import { PidTagFragmentBase } from "./PidTagFragmentBase.js";
import type { IPidTagTextNormalizer } from "./PidTagTextNormalizer.js";

export class PidInstrumentTagFragment
  extends PidTagFragmentBase<typeof PidFragmentKinds.InstrumentTag>
  implements IPidInstrumentTagFragment {
  public constructor(params: {
    readonly text: string;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
    readonly confidence?: number;
    readonly textNormalizer?: IPidTagTextNormalizer;
  }) {
    super({
      pidKind: PidFragmentKinds.InstrumentTag,
      ...params,
    });
  }
}