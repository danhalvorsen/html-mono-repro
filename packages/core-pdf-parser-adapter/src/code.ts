
export declare const pdfjs: {
  getDocument(options: {
    data: Uint8Array;
    disableWorker?: boolean;
    useWorkerFetch?: boolean;
    isEvalSupported?: boolean;
    isOffscreenCanvasSupported?: boolean;
    isImageDecoderSupported?: boolean;
    useSystemFonts?: boolean;
  }): {
    readonly promise: Promise<PdfJsNativeDocument>;
  };
};

export declare const PDFDocument: {
  load(binary: Uint8Array): Promise<PdfLibNativeDocument>;
};

export declare const PDFName: {
  of(name: string): unknown;
};

export declare function rgb(red: number, green: number, blue: number): unknown;

export declare class PDFRawStream {
  public readonly dict: {
    get(key: unknown): unknown;
  };

  public getContents(): Uint8Array;
}

/* =================================================================================================
   Internal vendor-native shapes
   ================================================================================================= */

export type PdfJsNativeTextStyle = {
  readonly fontFamily?: string;
};

export type PdfJsNativeTextContent = {
  readonly items: readonly unknown[];
  readonly styles?: Readonly<Record<string, PdfJsNativeTextStyle>>;
};

export type PdfJsNativeViewport = {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly transform: readonly number[];
};

export type PdfJsNativePage = {
  readonly pageNumber: number;
  getTextContent(): Promise<PdfJsNativeTextContent>;
  getViewport(parameters: { scale: number }): PdfJsNativeViewport;
};

export type PdfJsNativeDocument = {
  readonly numPages: number;
  getPage(pageNumber: number): Promise<PdfJsNativePage>;
  getMetadata(): Promise<{ info?: Record<string, unknown> }>;
};

export type PdfJsNativeTextItem = {
  readonly str: string;
  readonly transform: readonly number[];
  readonly width?: number;
  readonly height?: number;
  readonly fontName?: unknown;
  readonly fontInformation?: unknown;
};

export type PdfLibDrawPage = {
  readonly width: number;
  readonly height: number;
  drawRectangle(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderColor?: unknown;
    borderWidth?: number;
    opacity?: number;
  }): void;
};

type PdfLibNativeDocument = {
  getPageCount(): number;
  getPages(): readonly PdfLibDrawPage[];
  getPage(index: number): {
    node: {
      Resources(): {
        get(name: unknown): unknown;
      } | undefined;
    };
  };
  context: {
    lookup(reference: unknown): {
      entries(): Iterable<[unknown, unknown]>;
      lookup(key: unknown): unknown;
    };
  };
  save(): Promise<Uint8Array>;
};

/* =================================================================================================
   Public surface
   ================================================================================================= */

export {
  PdfFragmentJsonProjector,
} from "./PdfFragmentJsonProjector.js";
export {
  PdfFragmentReader,
} from "./PdfFragmentReader.js";
export {
  PdfFragmentWriter,
} from "./PdfFragmentWriter.js";
export {
  PdfJsParserAdapter,
} from "./PdfJsParserAdapter.js";
export {
  PdfJsParserAdapterFactory,
} from "./PdfJsParserAdapterFactory.js";