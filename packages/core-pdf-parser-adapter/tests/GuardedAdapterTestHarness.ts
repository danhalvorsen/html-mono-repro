import { IBoundingBox } from "core-pdf-domain/src/core/IBoundingBox.js";
import { GuardedAdapter } from "../src/GuardedAdapter.js";
import { IPdfFragment } from "../src/types.js";

export class GuardedAdapterTestHarness extends GuardedAdapter {
  public ensureBinaryPublic(pdfBinary: Uint8Array, name: string): void {
    this.ensureBinary(pdfBinary, name);
  }

  public ensurePositivePageNumberPublic(
    pageNumber: number,
    name: string,
  ): void {
    this.ensurePositivePageNumber(pageNumber, name);
  }

  public ensureFinitePublic(value: number, name: string): void {
    this.ensureFinite(value, name);
  }

  public ensureBoundingBoxPublic(box: IBoundingBox, name: string): void {
    this.ensureBoundingBox(box, name);
  }

  public ensureFragmentPublic(fragment: IPdfFragment, index: number): void {
    this.ensureFragment(fragment, index);
  }

  public ensurePageInRangePublic(pageNumber: number, pageCount: number): void {
    this.ensurePageInRange(pageNumber, pageCount);
  }

  public toFiniteNumberPublic(value: unknown): number {
    return this.toFiniteNumber(value);
  }
}
