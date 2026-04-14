import type { IPdfJsTextItemLike } from "./IPdfJsTextItemLike.js";
import type { IPdfJsViewportLike } from "./IPdfJsViewportLike.js";
import type { PdfTextItemBoundingBox } from "./PdfTextItemBoundingBox.js";

export interface IPdfTextBoundingBoxIdentifier {
  identify(
    item: IPdfJsTextItemLike,
    viewport: IPdfJsViewportLike,
  ): PdfTextItemBoundingBox;

  identifyMany(
    items: readonly IPdfJsTextItemLike[],
    viewport: IPdfJsViewportLike,
  ): readonly PdfTextItemBoundingBox[];
}
