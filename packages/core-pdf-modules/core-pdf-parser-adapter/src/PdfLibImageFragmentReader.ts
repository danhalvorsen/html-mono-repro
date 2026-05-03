import { FragmentKinds, type IPdfImageFragment } from "@monorepo/core-pdf-domain";
import { PDFDocument, PDFName, PDFRawStream } from "./code.js";
import { GuardedAdapter } from "./GuardedAdapter.js";

export class PdfLibImageFragmentReader extends GuardedAdapter {
    public async read(pdfBinary: Uint8Array): Promise<readonly IPdfImageFragment[]> {
        this.ensureBinary(pdfBinary, "pdfBinary");

        const document = await PDFDocument.load(new Uint8Array(pdfBinary));
        const result: IPdfImageFragment[] = [];
        const pageCount = document.getPageCount();

        for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
            const page = document.getPage(pageIndex);
            const resources = page.node.Resources();

            if (resources === undefined) {
                continue;
            }

            const xObjectRef = resources.get(PDFName.of("XObject"));
            if (xObjectRef === undefined) {
                continue;
            }

            const xObjectDictionary = document.context.lookup(xObjectRef);

            for (const [nameKey] of xObjectDictionary.entries()) {
                const object = xObjectDictionary.lookup(nameKey);

                if (!(object instanceof PDFRawStream)) {
                    continue;
                }

                const subtype = object.dict.get(PDFName.of("Subtype"));
                if (String(subtype) !== "/Image") {
                    continue;
                }

                const mimeType = this.mapMimeType(object.dict.get(PDFName.of("Filter")));
                if (mimeType === undefined) {
                    continue;
                }

                const bytes = object.getContents();
                if (!(bytes instanceof Uint8Array) || bytes.length === 0) {
                    continue;
                }

                const fragment: IPdfImageFragment = {
                    kind: FragmentKinds.Image,
                    pageNumber: pageIndex + 1,
                    boundingBox: {
                        position: { x: 0, y: 0 },
                        width: 1,
                        height: 1,
                    },
                    name: this.normalizeName(nameKey),
                    mimeType,
                    bytes,
                };

                result.push(fragment);
            }
        }

        return Object.freeze(result);
    }

    private normalizeName(nameKey: unknown): string {
        return String(nameKey).replace(/^\//, "");
    }

    private mapMimeType(filterValue: unknown): "image/jpeg" | "image/jp2" | undefined {
        const normalized = String(filterValue);

        if (normalized.includes("/DCTDecode")) {
            return "image/jpeg";
        }

        if (normalized.includes("/JPXDecode")) {
            return "image/jp2";
        }

        return undefined;
    }
}
