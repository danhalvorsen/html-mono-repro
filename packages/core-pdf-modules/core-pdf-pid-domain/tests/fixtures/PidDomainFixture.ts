import {
  FragmentKinds,
  type IBoundingBox,
  type IPdfTextFragment,
} from "@monorepo/core-pdf-domain";
import {
  PidEquipmentTagFragment,
  PidFragmentKinds,
  PidInstrumentTagFragment,
  PidLineNumberFragment,
  PidTagCandidateFragment,
} from "../../src/index.js";

export class PidDomainFixture {
  public createBoundingBox(overrides: Partial<IBoundingBox> = {}): IBoundingBox {
    return {
      position: {
        x: overrides.position?.x ?? 100,
        y: overrides.position?.y ?? 200,
      },
      width: overrides.width ?? 80,
      height: overrides.height ?? 12,
    };
  }

  public createTextFragment(
    text: string = "P-101",
    overrides: Partial<IPdfTextFragment> = {},
  ): IPdfTextFragment {
    return {
      kind: FragmentKinds.Text,
      pageNumber: overrides.pageNumber ?? 1,
      boundingBox: overrides.boundingBox ?? this.createBoundingBox(),
      text,
      fontName: overrides.fontName ?? "Arial",
      fontSize: overrides.fontSize ?? 8,
    };
  }

  public createTagCandidate(
    text: string = "P-101",
    confidence: number = 0.95,
  ): PidTagCandidateFragment {
    const source = this.createTextFragment(text);

    return new PidTagCandidateFragment({
      text,
      confidence,
      pageNumber: source.pageNumber,
      boundingBox: source.boundingBox,
      sourceFragments: [source],
    });
  }

  public createEquipmentTag(text: string = "P-101"): PidEquipmentTagFragment {
    const source = this.createTextFragment(text);

    return new PidEquipmentTagFragment({
      text,
      pageNumber: source.pageNumber,
      boundingBox: source.boundingBox,
      sourceFragments: [source],
    });
  }

  public createInstrumentTag(text: string = "PT-101"): PidInstrumentTagFragment {
    const source = this.createTextFragment(text);

    return new PidInstrumentTagFragment({
      text,
      pageNumber: source.pageNumber,
      boundingBox: source.boundingBox,
      sourceFragments: [source],
    });
  }

  public createLineNumber(text: string = "10-PL-1001-A1"): PidLineNumberFragment {
    const source = this.createTextFragment(text);

    return new PidLineNumberFragment({
      text,
      pageNumber: source.pageNumber,
      boundingBox: source.boundingBox,
      sourceFragments: [source],
    });
  }

  public readonly kinds = PidFragmentKinds;
}