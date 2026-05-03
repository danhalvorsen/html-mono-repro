# add-core-pdf-pid-domain-code-and-tests.ps1
#
# Creates/overwrites source and test files for:
#   packages/core-pdf-modules/core-pdf-pid-domain
#
# Assumes package infrastructure already exists.
#
# Run:
#   cd C:\Users\danha\source\repos\HTML\MonoRepro
#   powershell -ExecutionPolicy Bypass -File .\add-core-pdf-pid-domain-code-and-tests.ps1
#
# Then:
#   pnpm --filter "@monorepo/core-pdf-pid-domain" test
#   pnpm --filter "@monorepo/core-pdf-pid-domain" build

param(
    [string] $ModuleRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-pdf-modules\core-pdf-pid-domain"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-DirectoryExists {
    param([string] $Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Directory not found: $Path"
    }
}

function Set-Utf8NoBomFile {
    param(
        [string] $Path,
        [string] $Content
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

Assert-DirectoryExists $ModuleRoot

$srcRoot = Join-Path $ModuleRoot "src"
$pidDomainRoot = Join-Path $srcRoot "pid-domain"
$specificationsRoot = Join-Path $srcRoot "specifications"
$testsRoot = Join-Path $ModuleRoot "tests"
$fixturesRoot = Join-Path $testsRoot "fixtures"

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidFragmentKind.ts") -Content @'
export const PidFragmentKinds = Object.freeze({
  TagCandidate: "pid-tag-candidate",
  EquipmentTag: "pid-equipment-tag",
  InstrumentTag: "pid-instrument-tag",
  LineNumber: "pid-line-number",
} as const);

export type PidFragmentKind =
  (typeof PidFragmentKinds)[keyof typeof PidFragmentKinds];
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "IPidFragment.ts") -Content @'
import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { PidFragmentKind } from "./PidFragmentKind.js";

export interface IPidFragment<TKind extends PidFragmentKind = PidFragmentKind> {
  readonly pidKind: TKind;
  readonly pageNumber: number;
  readonly boundingBox: IBoundingBox;
  readonly sourceFragments: readonly PdfFragment[];
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "IPidTagFragment.ts") -Content @'
import type { IPidFragment } from "./IPidFragment.js";
import type { PidFragmentKind } from "./PidFragmentKind.js";

export interface IPidTagFragment<TKind extends PidFragmentKind = PidFragmentKind>
  extends IPidFragment<TKind> {
  readonly text: string;
  readonly normalizedText: string;
  readonly confidence: number;
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "IPidTagCandidateFragment.ts") -Content @'
import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidTagCandidateFragment
  extends IPidTagFragment<typeof PidFragmentKinds.TagCandidate> {
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "IPidEquipmentTagFragment.ts") -Content @'
import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidEquipmentTagFragment
  extends IPidTagFragment<typeof PidFragmentKinds.EquipmentTag> {
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "IPidInstrumentTagFragment.ts") -Content @'
import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidInstrumentTagFragment
  extends IPidTagFragment<typeof PidFragmentKinds.InstrumentTag> {
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "IPidLineNumberFragment.ts") -Content @'
import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidLineNumberFragment
  extends IPidTagFragment<typeof PidFragmentKinds.LineNumber> {
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidFragment.ts") -Content @'
import type { IPidEquipmentTagFragment } from "./IPidEquipmentTagFragment.js";
import type { IPidInstrumentTagFragment } from "./IPidInstrumentTagFragment.js";
import type { IPidLineNumberFragment } from "./IPidLineNumberFragment.js";
import type { IPidTagCandidateFragment } from "./IPidTagCandidateFragment.js";

export type PidFragment =
  | IPidTagCandidateFragment
  | IPidEquipmentTagFragment
  | IPidInstrumentTagFragment
  | IPidLineNumberFragment;
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidTagTextNormalizer.ts") -Content @'
export interface IPidTagTextNormalizer {
  normalize(value: string): string;
}

export class PidTagTextNormalizer implements IPidTagTextNormalizer {
  public normalize(value: string): string {
    return value.trim().replace(/\s+/gu, " ").toUpperCase();
  }
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidFragmentBase.ts") -Content @'
import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidFragment } from "./IPidFragment.js";
import type { PidFragmentKind } from "./PidFragmentKind.js";

export abstract class PidFragmentBase<TKind extends PidFragmentKind>
  implements IPidFragment<TKind> {
  public readonly pidKind: TKind;
  public readonly pageNumber: number;
  public readonly boundingBox: IBoundingBox;
  public readonly sourceFragments: readonly PdfFragment[];

  protected constructor(params: {
    readonly pidKind: TKind;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
  }) {
    this.ensurePageNumber(params.pageNumber);
    this.ensureBoundingBox(params.boundingBox);
    this.ensureSourceFragments(params.sourceFragments);

    this.pidKind = params.pidKind;
    this.pageNumber = params.pageNumber;
    this.boundingBox = params.boundingBox;
    this.sourceFragments = Object.freeze([...params.sourceFragments]);
  }

  private ensurePageNumber(value: number): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error("pageNumber must be an integer >= 1.");
    }
  }

  private ensureBoundingBox(value: IBoundingBox): void {
    if (
      !Number.isFinite(value.position.x) ||
      !Number.isFinite(value.position.y) ||
      !Number.isFinite(value.width) ||
      !Number.isFinite(value.height)
    ) {
      throw new Error("boundingBox must contain finite numbers.");
    }

    if (value.width <= 0) {
      throw new Error("boundingBox.width must be greater than zero.");
    }

    if (value.height <= 0) {
      throw new Error("boundingBox.height must be greater than zero.");
    }
  }

  private ensureSourceFragments(value: readonly PdfFragment[]): void {
    if (value.length === 0) {
      throw new Error("sourceFragments must contain at least one fragment.");
    }
  }
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidTagFragmentBase.ts") -Content @'
import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidTagFragment } from "./IPidTagFragment.js";
import { PidFragmentBase } from "./PidFragmentBase.js";
import type { PidFragmentKind } from "./PidFragmentKind.js";
import { PidTagTextNormalizer, type IPidTagTextNormalizer } from "./PidTagTextNormalizer.js";

export abstract class PidTagFragmentBase<TKind extends PidFragmentKind>
  extends PidFragmentBase<TKind>
  implements IPidTagFragment<TKind> {
  public readonly text: string;
  public readonly normalizedText: string;
  public readonly confidence: number;

  protected constructor(params: {
    readonly pidKind: TKind;
    readonly text: string;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
    readonly confidence?: number;
    readonly textNormalizer?: IPidTagTextNormalizer;
  }) {
    super({
      pidKind: params.pidKind,
      pageNumber: params.pageNumber,
      boundingBox: params.boundingBox,
      sourceFragments: params.sourceFragments,
    });

    this.ensureText(params.text);

    const confidence = params.confidence ?? 1;
    this.ensureConfidence(confidence);

    const textNormalizer = params.textNormalizer ?? new PidTagTextNormalizer();

    this.text = params.text;
    this.normalizedText = textNormalizer.normalize(params.text);
    this.confidence = confidence;
  }

  private ensureText(value: string): void {
    if (value.trim().length === 0) {
      throw new Error("text must not be empty.");
    }
  }

  private ensureConfidence(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error("confidence must be a finite number between 0 and 1.");
    }
  }
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidTagCandidateFragment.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidEquipmentTagFragment.ts") -Content @'
import type { IBoundingBox, PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPidEquipmentTagFragment } from "./IPidEquipmentTagFragment.js";
import { PidFragmentKinds } from "./PidFragmentKind.js";
import { PidTagFragmentBase } from "./PidTagFragmentBase.js";
import type { IPidTagTextNormalizer } from "./PidTagTextNormalizer.js";

export class PidEquipmentTagFragment
  extends PidTagFragmentBase<typeof PidFragmentKinds.EquipmentTag>
  implements IPidEquipmentTagFragment {
  public constructor(params: {
    readonly text: string;
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly sourceFragments: readonly PdfFragment[];
    readonly confidence?: number;
    readonly textNormalizer?: IPidTagTextNormalizer;
  }) {
    super({
      pidKind: PidFragmentKinds.EquipmentTag,
      ...params,
    });
  }
}
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidInstrumentTagFragment.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $pidDomainRoot "PidLineNumberFragment.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $specificationsRoot "PidFragmentKindSpecification.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $specificationsRoot "PidFragmentPageNumberSpecification.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $specificationsRoot "PidTagTextContainsSpecification.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $specificationsRoot "PidTagTextMatchesSpecification.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $specificationsRoot "PidTagConfidenceAtLeastSpecification.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $srcRoot "index.ts") -Content @'
export { PidFragmentKinds } from "./pid-domain/PidFragmentKind.js";
export type { PidFragmentKind } from "./pid-domain/PidFragmentKind.js";

export type { IPidFragment } from "./pid-domain/IPidFragment.js";
export type { IPidTagFragment } from "./pid-domain/IPidTagFragment.js";
export type { IPidTagCandidateFragment } from "./pid-domain/IPidTagCandidateFragment.js";
export type { IPidEquipmentTagFragment } from "./pid-domain/IPidEquipmentTagFragment.js";
export type { IPidInstrumentTagFragment } from "./pid-domain/IPidInstrumentTagFragment.js";
export type { IPidLineNumberFragment } from "./pid-domain/IPidLineNumberFragment.js";
export type { PidFragment } from "./pid-domain/PidFragment.js";

export type { IPidTagTextNormalizer } from "./pid-domain/PidTagTextNormalizer.js";
export { PidTagTextNormalizer } from "./pid-domain/PidTagTextNormalizer.js";

export { PidFragmentBase } from "./pid-domain/PidFragmentBase.js";
export { PidTagFragmentBase } from "./pid-domain/PidTagFragmentBase.js";
export { PidTagCandidateFragment } from "./pid-domain/PidTagCandidateFragment.js";
export { PidEquipmentTagFragment } from "./pid-domain/PidEquipmentTagFragment.js";
export { PidInstrumentTagFragment } from "./pid-domain/PidInstrumentTagFragment.js";
export { PidLineNumberFragment } from "./pid-domain/PidLineNumberFragment.js";

export { PidFragmentKindSpecification } from "./specifications/PidFragmentKindSpecification.js";
export { PidFragmentPageNumberSpecification } from "./specifications/PidFragmentPageNumberSpecification.js";
export { PidTagTextContainsSpecification } from "./specifications/PidTagTextContainsSpecification.js";
export { PidTagTextMatchesSpecification } from "./specifications/PidTagTextMatchesSpecification.js";
export { PidTagConfidenceAtLeastSpecification } from "./specifications/PidTagConfidenceAtLeastSpecification.js";
'@

Set-Utf8NoBomFile -Path (Join-Path $fixturesRoot "PidDomainFixture.ts") -Content @'
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
'@

Set-Utf8NoBomFile -Path (Join-Path $testsRoot "PidTagCandidateFragment.test.ts") -Content @'
import "chai/register-should";
import { describe, it } from "vitest";
import { PidTagCandidateFragment } from "../src/index.js";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PidTagCandidateFragment", () => {
  const fixture = new PidDomainFixture();

  it("should create a normalized tag candidate when input is valid", () => {
    const candidate = fixture.createTagCandidate("  p-101  ");

    candidate.pidKind.should.equal(fixture.kinds.TagCandidate);
    candidate.text.should.equal("  p-101  ");
    candidate.normalizedText.should.equal("P-101");
    candidate.confidence.should.equal(0.95);
    candidate.pageNumber.should.equal(1);
    candidate.sourceFragments.length.should.equal(1);
  });

  it("should reject empty text", () => {
    (() => fixture.createTagCandidate(" ")).should.throw("text must not be empty.");
  });

  it("should reject invalid confidence", () => {
    (() => fixture.createTagCandidate("P-101", 1.1)).should.throw(
      "confidence must be a finite number between 0 and 1.",
    );
  });

  it("should reject invalid page number", () => {
    const source = fixture.createTextFragment("P-101");

    (() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: 0,
        boundingBox: source.boundingBox,
        sourceFragments: [source],
      }),
    ).should.throw("pageNumber must be an integer >= 1.");
  });

  it("should reject empty source fragments", () => {
    const source = fixture.createTextFragment("P-101");

    (() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: source.pageNumber,
        boundingBox: source.boundingBox,
        sourceFragments: [],
      }),
    ).should.throw("sourceFragments must contain at least one fragment.");
  });

  it("should reject invalid bounding box", () => {
    const source = fixture.createTextFragment("P-101");

    (() =>
      new PidTagCandidateFragment({
        text: "P-101",
        pageNumber: source.pageNumber,
        boundingBox: fixture.createBoundingBox({ width: 0 }),
        sourceFragments: [source],
      }),
    ).should.throw("boundingBox.width must be greater than zero.");
  });
});
'@

Set-Utf8NoBomFile -Path (Join-Path $testsRoot "PidSemanticFragments.test.ts") -Content @'
import "chai/register-should";
import { describe, it } from "vitest";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PID semantic fragments", () => {
  const fixture = new PidDomainFixture();

  it("should create an equipment tag fragment", () => {
    const fragment = fixture.createEquipmentTag("p-101");

    fragment.pidKind.should.equal(fixture.kinds.EquipmentTag);
    fragment.normalizedText.should.equal("P-101");
  });

  it("should create an instrument tag fragment", () => {
    const fragment = fixture.createInstrumentTag("pt-101");

    fragment.pidKind.should.equal(fixture.kinds.InstrumentTag);
    fragment.normalizedText.should.equal("PT-101");
  });

  it("should create a line number fragment", () => {
    const fragment = fixture.createLineNumber("10-pl-1001-a1");

    fragment.pidKind.should.equal(fixture.kinds.LineNumber);
    fragment.normalizedText.should.equal("10-PL-1001-A1");
  });
});
'@

Set-Utf8NoBomFile -Path (Join-Path $testsRoot "PidFragmentSpecifications.test.ts") -Content @'
import "chai/register-should";
import { describe, it } from "vitest";
import {
  PidFragmentKindSpecification,
  PidFragmentPageNumberSpecification,
  PidFragmentKinds,
  PidTagConfidenceAtLeastSpecification,
  PidTagTextContainsSpecification,
  PidTagTextMatchesSpecification,
} from "../src/index.js";
import { PidDomainFixture } from "./fixtures/PidDomainFixture.js";

describe("PID fragment specifications", () => {
  const fixture = new PidDomainFixture();

  it("should match PID fragment by kind", () => {
    const candidate = fixture.createEquipmentTag("P-101");
    const specification = new PidFragmentKindSpecification(PidFragmentKinds.EquipmentTag);

    specification.isSatisfiedBy(candidate).should.equal(true);
  });

  it("should reject PID fragment when kind does not match", () => {
    const candidate = fixture.createInstrumentTag("PT-101");
    const specification = new PidFragmentKindSpecification(PidFragmentKinds.EquipmentTag);

    specification.isSatisfiedBy(candidate).should.equal(false);
  });

  it("should match PID fragment by page number", () => {
    const candidate = fixture.createTagCandidate("P-101");
    const specification = new PidFragmentPageNumberSpecification(1);

    specification.isSatisfiedBy(candidate).should.equal(true);
  });

  it("should reject invalid expected page number", () => {
    (() => new PidFragmentPageNumberSpecification(0)).should.throw(
      "expectedPageNumber must be an integer >= 1.",
    );
  });

  it("should match tag text using normalized contains", () => {
    const candidate = fixture.createTagCandidate("  p-101  ");
    const specification = new PidTagTextContainsSpecification("p-");

    specification.isSatisfiedBy(candidate).should.equal(true);
  });

  it("should reject empty contains needle", () => {
    (() => new PidTagTextContainsSpecification(" ")).should.throw(
      "needle must not be empty.",
    );
  });

  it("should match tag text using regex", () => {
    const candidate = fixture.createTagCandidate("PT-101");
    const specification = new PidTagTextMatchesSpecification(/^PT-\d+$/u);

    specification.isSatisfiedBy(candidate).should.equal(true);
  });

  it("should match tag by minimum confidence", () => {
    const candidate = fixture.createTagCandidate("P-101", 0.8);
    const specification = new PidTagConfidenceAtLeastSpecification(0.75);

    specification.isSatisfiedBy(candidate).should.equal(true);
  });

  it("should reject invalid minimum confidence", () => {
    (() => new PidTagConfidenceAtLeastSpecification(1.1)).should.throw(
      "minimumConfidence must be a finite number between 0 and 1.",
    );
  });

  it("should support chained specification expressions", () => {
    const candidate = fixture.createTagCandidate("P-101", 0.9);

    const specification = new PidTagTextContainsSpecification("P-")
      .and(new PidTagConfidenceAtLeastSpecification(0.8))
      .and(new PidTagTextMatchesSpecification(/^P-\d+$/u));

    specification.isSatisfiedBy(candidate).should.equal(true);
  });

  it("should support negated specification expressions", () => {
    const candidate = fixture.createTagCandidate("P-101");
    const specification = new PidTagTextContainsSpecification("VALVE").not();

    specification.isSatisfiedBy(candidate).should.equal(true);
  });
});
'@

Write-Host "core-pdf-pid-domain source and tests written:"
Write-Host "  $ModuleRoot"
Write-Host ""
Write-Host "Run:"
Write-Host "  pnpm --filter `"@monorepo/core-pdf-pid-domain`" test"
Write-Host "  pnpm --filter `"@monorepo/core-pdf-pid-domain`" build"