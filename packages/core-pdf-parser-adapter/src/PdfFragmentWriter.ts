import { IPdfRectangleFragment } from "@monorepo/core-pdf-domain";
import { PDFDocument, PdfLibDrawPage, rgb } from "./code.js";
import { GuardedAdapter } from "./GuardedAdapter.js";
import { IPdfFragmentWriter } from "./IPdfFragmentWriter.js";
import { IPdfFragment } from "@monorepo/core-pdf-domain";

/* =================================================================================================
   Fragment writer
   - first writable kind: rectangle
   - text/image kinds rejected explicitly
   ================================================================================================= */

export class PdfFragmentWriter extends GuardedAdapter implements IPdfFragmentWriter {
    public async write(
        pdfBinary: Uint8Array,
        fragments: readonly IPdfFragment[]
    ): Promise<Uint8Array> {
        this.ensureBinary(pdfBinary, "pdfBinary");

        if (!Array.isArray(fragments)) {
            throw new Error("fragments must be an array.");
        }

        for (let i = 0; i < fragments.length; i += 1) {
            this.ensureFragment(fragments[i]!, i);
        }

        const document = await PDFDocument.load(new Uint8Array(pdfBinary));
        const pages = document.getPages();

        for (let i = 0; i < fragments.length; i += 1) {
            const fragment = fragments[i]!;
            this.ensurePageInRange(fragment.pageNumber, pages.length);

            switch (fragment.kind) {
                case "rectangle":
                    this.drawRectangle(
                        pages[fragment.pageNumber - 1]!,
                        fragment as IPdfRectangleFragment
                    );
                    break;

                case "text":
                    throw new Error("Fragment kind 'text' is not supported for write operations.");

                case "image":
                    throw new Error("Fragment kind 'image' is not supported for write operations.");

                default:
                    throw new Error(`Unsupported fragment kind '${(fragment as { kind?: string; }).kind ?? "unknown"}'.`);
            }
        }

        return document.save();
    }

    private drawRectangle(page: PdfLibDrawPage, fragment: IPdfRectangleFragment): void {
        const box = fragment.boundingBox;
        this.ensureBoundingBox(box, "fragment.boundingBox");

        const x = box.position.x;
        const width = Math.max(box.width, 0.5);
        const height = Math.max(box.height, 0.5);

        // Coordinate transform: domain/top-left style to PDF bottom-left style.
        const y = page.height - box.position.y - box.height;

        page.drawRectangle({
            x,
            y,
            width,
            height,
            borderColor: rgb(1, 0, 0),
            borderWidth: 0.6,
            opacity: 0.15,
        });
    }
}
