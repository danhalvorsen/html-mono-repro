import { IPdfMetadata } from "@monorepo/core-pdf-domain";


export class PdfMetadataMapper {
    public map(info: Record<string, unknown>): IPdfMetadata {
        return Object.freeze({
            ...(typeof info["Title"] === "string" && { title: info["Title"] }),
            ...(typeof info["Author"] === "string" && { author: info["Author"] }),
            ...(typeof info["Subject"] === "string" && { subject: info["Subject"] }),
            ...(typeof info["Creator"] === "string" && { creator: info["Creator"] }),
            ...(typeof info["Producer"] === "string" && { producer: info["Producer"] }),
            ...(typeof info["CreationDate"] === "string" && { creationDateUtc: info["CreationDate"] }),
            ...(typeof info["ModDate"] === "string" && { modificationDateUtc: info["ModDate"] }),
        });
    }
}
