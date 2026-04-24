import { FragmentKinds, type IBoundingBox, type IPdfFragment } from "@monorepo/core-pdf-domain";

export abstract class GuardedAdapter {
  protected ensureBinary(pdfBinary: Uint8Array, name: string): void {
    if (!(pdfBinary instanceof Uint8Array)) {
      throw new Error(`${name} must be a Uint8Array.`);
    }

    if (pdfBinary.byteLength === 0) {
      throw new Error(`${name} must not be empty.`);
    }
  }

  protected ensurePositivePageNumber(pageNumber: number, name: string): void {
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new Error(`${name} must be an integer greater than or equal to one.`);
    }
  }

  protected ensureFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be finite.`);
    }
  }

  protected ensureBoundingBox(box: IBoundingBox, name: string): void {
    if (box === null || box === undefined) {
      throw new Error(`${name} is required.`);
    }

    this.ensureFinite(box.position.x, `${name}.position.x`);
    this.ensureFinite(box.position.y, `${name}.position.y`);
    this.ensureFinite(box.width, `${name}.width`);
    this.ensureFinite(box.height, `${name}.height`);

    if (box.width <= 0) {
      throw new Error(`${name}.width must be greater than zero.`);
    }

    if (box.height <= 0) {
      throw new Error(`${name}.height must be greater than zero.`);
    }
  }

  protected ensureFragment(fragment: IPdfFragment, index: number): void {
    if (fragment === null || fragment === undefined) {
      throw new Error(`fragments[${index}] is required.`);
    }

    switch (fragment.kind) {
      case FragmentKinds.Text:
      case FragmentKinds.Image:
      case FragmentKinds.Rectangle:
        break;

      default:
        throw new Error(`fragments[${index}].kind is unsupported.`);
    }

    this.ensurePositivePageNumber(
      fragment.pageNumber,
      `fragments[${index}].pageNumber`,
    );

    this.ensureBoundingBox(
      fragment.boundingBox,
      `fragments[${index}].boundingBox`,
    );
  }

  protected ensurePageInRange(pageNumber: number, pageCount: number): void {
    this.ensurePositivePageNumber(pageNumber, "pageNumber");

    if (pageNumber > pageCount) {
      throw new Error(`pageNumber '${pageNumber}' is outside the document page range.`);
    }
  }

  protected toFiniteNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }
}
