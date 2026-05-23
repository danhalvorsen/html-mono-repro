import type { IHtmlImageElementFactory } from "./IHtmlImageElementFactory.js";

export type BrowserImageDataLoaderOptions = Readonly<{
  readonly document: Document;
  readonly imageFactory?: IHtmlImageElementFactory;
  readonly crossOrigin?: "" | "anonymous" | "use-credentials";
}>;