import { ICompositePdfEngine } from "./ICompositePdfEngine.js";
import { IPdfMetadata } from "./IPdfMetadata.js";
import { IPdfPageText } from "./IPdfPageText.js";
import { IPdfStructuredExtractionRequest } from "./IPdfStructuredExtractionRequest.js";
import { IPdfStructuredExtractionResult } from "./IPdfStructuredExtractionResult.js";
import { IPdfTextFragment } from "./IPdfTextFragment.js";

/* =================================================================================================
   PdfCompositeEngineBase
   ================================================================================================= */

export abstract class PdfCompositeEngineBase implements ICompositePdfEngine {
    public abstract readonly name: string;
    public abstract readMetadata(binary: Uint8Array): Promise<IPdfMetadata>;
    public abstract readPageCount(binary: Uint8Array): Promise<number>;
    public abstract readTextFragments(binary: Uint8Array): Promise<readonly IPdfTextFragment[]>;

    public async readPages(binary: Uint8Array): Promise<readonly IPdfPageText[]> {
        const fragments = await this.readTextFragments(binary);
        const groups = new Map<number, IPdfTextFragment[]>();

        for (const fragment of fragments) {
            const list = groups.get(fragment.pageNumber);
            if (list === undefined) {
                groups.set(fragment.pageNumber, [fragment]);
            } else {
                list.push(fragment);
            }
        }

        const result: IPdfPageText[] = [];

        for (const [pageNumber, pageFragments] of [...groups.entries()].sort((left, right) => left[0] - right[0])) {
            result.push(
                Object.freeze({
                    pageNumber,
                    text: this.buildPageText(pageFragments),
                })
            );
        }

        return Object.freeze(result);
    }

    public async extractStructured<TValue>(
        binary: Uint8Array,
        request: IPdfStructuredExtractionRequest
    ): Promise<IPdfStructuredExtractionResult<TValue>> {
        const pages = await this.readPages(binary);

        const value = Object.freeze({
            schemaName: request.schemaName,
            pageCount: pages.length,
            fullText: pages.map(page => page.text).join("\n\n"),
        }) as TValue;

        return Object.freeze({
            schemaName: request.schemaName,
            value,
        });
    }

    protected buildPageText(fragments: readonly IPdfTextFragment[]): string {
        return fragments
            .slice()
            .sort((left, right) => {
                const deltaY = right.boundingBox.position.y - left.boundingBox.position.y;
                if (Math.abs(deltaY) > 2) {
                    return deltaY;
                }

                return left.boundingBox.position.x - right.boundingBox.position.x;
            })
            .map(fragment => fragment.text)
            .join(" ");
    }
}
