import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

import type { IReaderConfiguration } from "../IReaderConfiguration.js";
import type { IPdfImageFragment } from "../IPdfImageFragment.js";

interface IPdfJsImage {
  readonly width?: number;
  readonly height?: number;
  readonly mimeType?: string;
  readonly data?: ArrayLike<number>;
  readonly src?: Uint8Array | ArrayBuffer;
}

interface IPdfJsObjectStore {
  get(name: string): Promise<IPdfJsImage | undefined> | IPdfJsImage | undefined;
}

interface IPdfJsOperatorList {
  readonly fnArray: readonly number[];
  readonly argsArray: readonly unknown[];
}

interface IPdfJsPage {
  readonly objs?: IPdfJsObjectStore;
  readonly commonObjs?: IPdfJsObjectStore;
  getOperatorList(): Promise<IPdfJsOperatorList>;
}

interface IPdfJsDocument {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<IPdfJsPage>;
}

interface IPdfJsOps {
  readonly paintImageXObject?: number;
  readonly paintJpegXObject?: number;
  readonly paintInlineImageXObject?: number;
}

export class PdfImageExtractor {
  public constructor(
    private readonly configuration: IReaderConfiguration,
  ) {}

  public async readImageFragments(binary: Uint8Array): Promise<readonly IPdfImageFragment[]> {
    if (!this.configuration.saveReadImages) {
      return Object.freeze([]);
    }

    const ops = this.resolveOps();
    if (ops.length === 0) {
      return Object.freeze([]);
    }

    const document = await this.loadDocument(binary);
    const result: IPdfImageFragment[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const operatorList = await page.getOperatorList();

      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const fn = operatorList.fnArray[i];
        if (typeof fn !== "number" || !ops.includes(fn)) {
          continue;
        }

        const args = operatorList.argsArray[i];
        const name = this.resolveNameArg(args);
        const image = await this.tryResolveImage(page, name);
        if (image === undefined) {
          continue;
        }

        const bytes = this.resolveBytes(image);
        if (bytes === undefined || bytes.length === 0) {
          continue;
        }

        result.push(
          Object.freeze({
            pageNumber,
            boundingBox: {
              position: { x: 0, y: 0 },
              width: image.width ?? 0,
              height: image.height ?? 0,
            },
            ...(name !== undefined && { name }),
            ...(image.mimeType !== undefined && { mimeType: image.mimeType }),
            bytes,
          }),
        );
      }
    }

    return Object.freeze(result);
  }

  private resolveBytes(image: IPdfJsImage): Uint8Array | undefined {
    const source = image.src;
    if (source instanceof Uint8Array) {
      return source;
    }
    if (source instanceof ArrayBuffer) {
      return new Uint8Array(source);
    }

    const data = image.data;
    if (data !== undefined && data.length > 0) {
      return Uint8Array.from(data);
    }

    return undefined;
  }

  private resolveOps(): readonly number[] {
    const table = (pdfjs as unknown as { OPS?: IPdfJsOps }).OPS;
    if (table === undefined) {
      return Object.freeze([]);
    }

    const values = [
      table.paintImageXObject,
      table.paintJpegXObject,
      table.paintInlineImageXObject,
    ].filter((v): v is number => typeof v === "number");

    return Object.freeze(values);
  }

  private resolveNameArg(args: unknown): string | undefined {
    if (!Array.isArray(args)) {
      return undefined;
    }

    const candidate = args[0];
    return typeof candidate === "string" ? candidate : undefined;
  }

  private async loadDocument(binary: Uint8Array): Promise<IPdfJsDocument> {
    const task = pdfjs.getDocument({
      data: binary,
      disableWorker: true,
      useWorkerFetch: false,
      isEvalSupported: false,
      isOffscreenCanvasSupported: false,
      isImageDecoderSupported: false,
      useSystemFonts: false,
    } as unknown as Parameters<typeof pdfjs.getDocument>[0]);

    return (await task.promise) as unknown as IPdfJsDocument;
  }

  private async tryResolveImage(page: IPdfJsPage, name: string | undefined): Promise<IPdfJsImage | undefined> {
    if (name === undefined) {
      return undefined;
    }

    const imageFromPage = await this.tryGet(page.objs, name);
    if (imageFromPage !== undefined) {
      return imageFromPage;
    }

    return this.tryGet(page.commonObjs, name);
  }

  private async tryGet(
    store: IPdfJsObjectStore | undefined,
    name: string,
  ): Promise<IPdfJsImage | undefined> {
    if (store === undefined || typeof store.get !== "function") {
      return undefined;
    }

    try {
      const value = await Promise.resolve(store.get(name));
      return typeof value === "object" && value !== null
        ? value
        : undefined;
    } catch {
      return undefined;
    }
  }
}