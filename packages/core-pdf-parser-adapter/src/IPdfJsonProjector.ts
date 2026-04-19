import type { IPdfFragment } from "@monorepo/core-pdf-domain"

export interface IPdfJsonProjector {
    toJson(fragments: readonly IPdfFragment[]): string;
}
