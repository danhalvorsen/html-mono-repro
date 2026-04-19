/* =================================================================================================
   PdfMetadataBase
   ================================================================================================= */

import { IPdfMetadata } from "./IPdfMetadata.js";

export abstract class PdfMetadataBase implements IPdfMetadata {
    public abstract readonly title?: string | undefined;
    public abstract readonly author?: string | undefined;
    public abstract readonly subject?: string | undefined;
    public abstract readonly keywords?: readonly string[] | undefined;
    public abstract readonly creator?: string | undefined;
    public abstract readonly producer?: string | undefined;
    public abstract readonly creationDateUtc?: string | undefined;
    public abstract readonly modificationDateUtc?: string | undefined;

    public toJSON(): IPdfMetadata {
        return Object.freeze({
            ...(this.title !== undefined && { title: this.title }),
            ...(this.author !== undefined && { author: this.author }),
            ...(this.subject !== undefined && { subject: this.subject }),
            ...(this.keywords !== undefined && { keywords: this.keywords }),
            ...(this.creator !== undefined && { creator: this.creator }),
            ...(this.producer !== undefined && { producer: this.producer }),
            ...(this.creationDateUtc !== undefined && { creationDateUtc: this.creationDateUtc }),
            ...(this.modificationDateUtc !== undefined && { modificationDateUtc: this.modificationDateUtc }),
        });
    }
}
