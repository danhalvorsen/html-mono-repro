import { pdfjs } from "./code.js";
import { PdfJsTextFragmentMapper } from "./PdfJsTextFragmentMapper.js";
import { GuardedAdapter } from "./GuardedAdapter.js";
import { IPdfParserAdapter } from "./IPdfParserAdapter.js";
import { IPdfParserDocument } from "./IPdfParserDocument.js";
import { PdfMetadataMapper } from "./PdfMetadataMapper.js";
import { PdfJsParserDocument } from "./PdfJsParserDocument.js";


export class PdfJsParserAdapter extends GuardedAdapter implements IPdfParserAdapter {
    public readonly name = "pdfjs";

    private readonly metadataMapper = new PdfMetadataMapper();
    private readonly textMapper = new PdfJsTextFragmentMapper();

    public async open(pdfBinary: Uint8Array): Promise<IPdfParserDocument> {
        this.ensureBinary(pdfBinary, "pdfBinary");

        const loadingTask = pdfjs.getDocument({
            data: new Uint8Array(pdfBinary),
            disableWorker: true,
            useWorkerFetch: false,
            isEvalSupported: false,
            isOffscreenCanvasSupported: false,
            isImageDecoderSupported: false,
            useSystemFonts: false,
        });

        const document = await loadingTask.promise;
        return new PdfJsParserDocument(document, this.metadataMapper, this.textMapper);
    }
}
