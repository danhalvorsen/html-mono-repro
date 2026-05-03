import { IPdfMetadata } from "@monorepo/core-pdf-domain";
import { PdfJsNativeDocument, PdfJsNativeTextItem, PdfJsNativeTextContent, PdfJsNativeViewport } from "./code.js";
import { ITextFragmentMapper } from "./ITextFragmentMapper.js";
import { GuardedAdapter } from "./GuardedAdapter.js";
import { IPdfParserPage } from "./IPdfParserPage.js";
import { IPdfParserDocument } from "./IPdfParserDocument.js";
import { PdfJsParserPage } from "./PdfJsParserPage.js";
import { PdfMetadataMapper } from "./PdfMetadataMapper.js";

export class PdfJsParserDocument extends GuardedAdapter implements IPdfParserDocument {
    public constructor(
        private readonly inner: PdfJsNativeDocument,
        private readonly metadataMapper: PdfMetadataMapper,
        private readonly textMapper: ITextFragmentMapper<PdfJsNativeTextItem, PdfJsNativeTextContent, PdfJsNativeViewport>
    ) {
        super();
    }

    public get pageCount(): number {
        return this.inner.numPages;
    }

    public async readMetadata(): Promise<IPdfMetadata> {
        const metadata = await this.inner.getMetadata();
        return this.metadataMapper.map(metadata.info ?? {});
    }

    public async getPage(pageNumber: number): Promise<IPdfParserPage> {
        this.ensurePageInRange(pageNumber, this.pageCount);
        const page = await this.inner.getPage(pageNumber);
        return new PdfJsParserPage(page, this.textMapper);
    }
}
