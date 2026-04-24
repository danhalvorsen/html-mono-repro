import {
  FragmentKinds,
} from "@monorepo/core-pdf-domain";
import type {
  IPdfImageFragment,
  IPdfRectangleFragment,
  IPdfTextFragment,
  PdfFragment,
} from "@monorepo/core-pdf-domain";
import { GuardedAdapter } from "./GuardedAdapter.js";
import { IPdfJsonProjector } from "./IPdfJsonProjector.js";

/* =================================================================================================
   JSON projector
   ================================================================================================= */

export class PdfFragmentJsonProjector
  extends GuardedAdapter
  implements IPdfJsonProjector
{
  public toJson(fragments: readonly PdfFragment[]): string {
    const normalized = fragments.map((fragment, index) => {
      this.ensureFragment(fragment, index);

      switch (fragment.kind) {
        case FragmentKinds.Image:
          return this.mapImageFragment(fragment);

        case FragmentKinds.Text:
          return this.mapTextFragment(fragment);

        case FragmentKinds.Rectangle:
          return this.mapRectangleFragment(fragment);
      }
    });

    return JSON.stringify(normalized);
  }

  private mapImageFragment(fragment: IPdfImageFragment): object {
    return {
      kind: fragment.kind,
      pageNumber: fragment.pageNumber,
      boundingBox: {
        position: {
          x: fragment.boundingBox.position.x,
          y: fragment.boundingBox.position.y,
        },
        width: fragment.boundingBox.width,
        height: fragment.boundingBox.height,
      },
      ...(fragment.name !== undefined && { name: fragment.name }),
      ...(fragment.mimeType !== undefined && { mimeType: fragment.mimeType }),
      ...(fragment.bytes !== undefined && {
        bytesBase64: Buffer.from(fragment.bytes).toString("base64"),
      }),
    };
  }

  private mapTextFragment(fragment: IPdfTextFragment): object {
    return {
      kind: fragment.kind,
      pageNumber: fragment.pageNumber,
      boundingBox: {
        position: {
          x: fragment.boundingBox.position.x,
          y: fragment.boundingBox.position.y,
        },
        width: fragment.boundingBox.width,
        height: fragment.boundingBox.height,
      },
      text: fragment.text,
      ...(fragment.fontName !== undefined && { fontName: fragment.fontName }),
      ...(fragment.fontFamily !== undefined && {
        fontFamily: fragment.fontFamily,
      }),
      ...(fragment.fontSize !== undefined && { fontSize: fragment.fontSize }),
    };
  }

  private mapRectangleFragment(fragment: IPdfRectangleFragment): object {
    return {
      kind: fragment.kind,
      pageNumber: fragment.pageNumber,
      boundingBox: {
        position: {
          x: fragment.boundingBox.position.x,
          y: fragment.boundingBox.position.y,
        },
        width: fragment.boundingBox.width,
        height: fragment.boundingBox.height,
      },
    };
  }
}
