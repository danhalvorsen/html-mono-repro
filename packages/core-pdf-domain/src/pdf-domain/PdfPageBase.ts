import { IPdfPage } from "./IPdfPage.js";
import { IPdfPageText } from "./IPdfPageText.js";
import { IPdfTextFragment } from "./IPdfTextFragment.js";

/* =================================================================================================
   PdfPageBase
   ================================================================================================= */

export abstract class PdfPageBase implements IPdfPage {
    public abstract readonly pageNumber: number;
    public abstract readTextFragments(): Promise<readonly IPdfTextFragment[]>;

    public async readText(): Promise<IPdfPageText> {
        const fragments = await this.readTextFragments();
        const text = this.buildText(fragments);

        return Object.freeze({
            pageNumber: this.pageNumber,
            text,
        });
    }

    protected buildText(fragments: readonly IPdfTextFragment[]): string {
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
