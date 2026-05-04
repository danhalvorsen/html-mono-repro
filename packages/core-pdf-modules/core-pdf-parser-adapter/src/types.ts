import type { IPoint, IPdfImageFragment, IPdfTextFragment, IPdfRectangleFragment } from "@monorepo/core-pdf-domain";

export type IPdfTextFragmentNode = IPdfTextFragment & { readonly kind: "text" };
export type IPdfImageFragmentNode = IPdfImageFragment & { readonly kind: "image" };

