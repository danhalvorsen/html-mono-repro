import type { IHtmlImageElementFactory } from "./IHtmlImageElementFactory.js";

export class BrowserHtmlImageElementFactory implements IHtmlImageElementFactory {
  public create(): HTMLImageElement {
    if (typeof Image === "undefined") {
      throw new Error("Browser Image constructor is not available.");
    }

    return new Image();
  }
}