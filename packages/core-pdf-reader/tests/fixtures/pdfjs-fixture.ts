// packages/core-pdf-reader/tests/fixtures/pdfjs-fixture.ts

import type {
  IPdfJsDocumentProxy,
  IPdfJsPageProxy,
  IPdfJsViewport,
} from "../../src/engine/PdfJsDocumentFactory.js";

export interface ITestTextItemInput {
  readonly str: string;
  readonly transform?: readonly number[];
  readonly width?: number;
  readonly height?: number;
}

export interface ICreatePageProxyInput {
  readonly pageNumber?: number;
  readonly items?: readonly unknown[];
  readonly viewport?: IPdfJsViewport;
}

export interface ICreateDocumentProxyInput {
  readonly numPages?: number;
  readonly metadataInfo?: object;
  readonly pages?: ReadonlyMap<number, IPdfJsPageProxy>;
}

export class PdfJsTestFixture {
  public createViewport(overrides?: Partial<IPdfJsViewport>): IPdfJsViewport {
    return Object.freeze({
      width: 1000,
      height: 1000,
      scale: 1,
      transform: [1, 0, 0, 1, 0, 0],
      ...overrides,
    });
  }

  public createTextItem(input: ITestTextItemInput): unknown {
    return Object.freeze({
      str: input.str,
      transform: input.transform ?? [1, 0, 0, 1, 0, 0],
      width: input.width ?? 10,
      height: input.height ?? 12,
    });
  }

  public createPageProxy(input?: ICreatePageProxyInput): IPdfJsPageProxy {
    const pageNumber = input?.pageNumber ?? 1;
    const items = input?.items ?? [];
    const viewport = input?.viewport ?? this.createViewport();

    return {
      pageNumber,
      async getTextContent(): Promise<{ items: readonly unknown[] }> {
        return { items };
      },
      getViewport(parameters: { scale: number }): IPdfJsViewport {
        return Object.freeze({
          ...viewport,
          scale: parameters.scale,
          transform: [parameters.scale, 0, 0, parameters.scale, 0, 0],
        });
      },
    };
  }

  public createDocumentProxy(
    input?: ICreateDocumentProxyInput,
  ): IPdfJsDocumentProxy {
    const numPages = input?.numPages ?? 1;
    const metadataInfo = input?.metadataInfo ?? {};
    const pages =
      input?.pages ??
      new Map<number, IPdfJsPageProxy>([
        [1, this.createPageProxy({ pageNumber: 1 })],
      ]);

    return {
      numPages,
      async getPage(pageNumber: number): Promise<IPdfJsPageProxy> {
        const page = pages.get(pageNumber);
        if (page === undefined) {
          throw new RangeError(
            `Page '${pageNumber}' was not configured in test fixture.`,
          );
        }

        return page;
      },
      async getMetadata(): Promise<{ info?: object }> {
        return { info: metadataInfo };
      },
    };
  }
}
