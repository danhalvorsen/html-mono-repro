import type { IPdfImageFragment } from "./IPdfImageFragment.js";
import type { IFragment } from "./IFragment.js";
import type { IPdfRectangleFragment } from "./IPdfRectangleFragment.js";
import type { IPdfTextFragment } from "./IPdfTextFragment.js";
import type { FragmentKind } from "./PdfFragmentKind.js";
import { IBoundingBox } from "../../core/IBoundingBox.js";
import { Specification  } from "@monorepo/core-specifications";  
export interface IPdfFragment extends IFragment {
  readonly kind: FragmentKind;
}

export type PdfFragment =
  | IPdfTextFragment
  | IPdfImageFragment
  | IPdfRectangleFragment;

export type AnyPdfFragmentBase = IPdfFragment;

export abstract class PdfFragmentBase implements IPdfFragment {
  kind!: FragmentKind;
  pageNumber!: number;
  boundingBox!: IBoundingBox;
}

export class PdfFragmentSpecification extends Specification<PdfFragmentBase> {
  override isSatisfiedBy(candidate: PdfFragmentBase): boolean {
    throw new Error("Method not implemented.");
  }
}

