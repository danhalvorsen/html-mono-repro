import { GuardedAdapter } from "./GuardedAdapter.js";
import { IPdfJsonProjector } from "./IPdfJsonProjector.js";
import { IPdfParserAdapter } from "./IPdfParserAdapter.js";
import { IPdfFragmentReader } from "./IPdfFragmentReader.js";
import { PdfJsParserAdapterFactory } from "./PdfJsParserAdapterFactory.js";
import { PdfLibImageFragmentReader } from "./PdfLibImageFragmentReader.js";
import { PdfFragmentJsonProjector } from "./PdfFragmentJsonProjector.js";
import type { PdfFragment } from "@monorepo/core-pdf-domain"

/* =================================================================================================
   Fragment reader facade
   ================================================================================================= */

export class PdfFragmentReader extends GuardedAdapter implements IPdfFragmentReader {
    private readonly parserAdapter: IPdfParserAdapter;
    private readonly imageReader: PdfLibImageFragmentReader;
    private readonly jsonProjector: IPdfJsonProjector;

    public constructor(
        parserAdapter: IPdfParserAdapter = new PdfJsParserAdapterFactory().create(),
        imageReader: PdfLibImageFragmentReader = new PdfLibImageFragmentReader(),
        jsonProjector: IPdfJsonProjector = new PdfFragmentJsonProjector()
    ) {
        super();
        this.parserAdapter = parserAdapter;
        this.imageReader = imageReader;
        this.jsonProjector = jsonProjector;
    }

    public async read(pdfBinary: Uint8Array): Promise<readonly PdfFragment[]> {
        this.ensureBinary(pdfBinary, "pdfBinary");

        const document = await this.parserAdapter.open(pdfBinary);
        const textFragments: PdfFragment[] = [];
        let index = 0;

        for (let pageNumber = 1; pageNumber <= document.pageCount; pageNumber += 1) {
            const page = await document.getPage(pageNumber);
            const pageFragments = await page.readFragments(index);

            for (const fragment of pageFragments) {
                textFragments.push(fragment);
            }

            index += pageFragments.length;
        }

        const imageFragments = await this.imageReader.read(pdfBinary);
        const all = [...textFragments, ...imageFragments];

        all.sort((left, right) => {
            if (left.pageNumber !== right.pageNumber) {
                return left.pageNumber - right.pageNumber;
            }

            const leftId = "id" in left.boundingBox ? (left.boundingBox as { id?: string; }).id ?? "" : "";
            const rightId = "id" in right.boundingBox ? (right.boundingBox as { id?: string; }).id ?? "" : "";

            return leftId.localeCompare(rightId);
        });

        return Object.freeze(all);
    }

    public async readJson(pdfBinary: Uint8Array): Promise<string> {
        const fragments = await this.read(pdfBinary);
        return this.jsonProjector.toJson(fragments);
    }
}
