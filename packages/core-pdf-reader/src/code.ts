
export interface IReadPdfFragments<TFragment> {
  read(pdfBinary: Uint8Array): Promise<readonly TFragment[]>;
  readJson(pdfBinary: Uint8Array): Promise<string>;
}

export interface IReadPdfMetadata<TMetadata> {
  read(pdfBinary: Uint8Array): Promise<TMetadata>;
}

export interface IPdfReader<TFragment, TMetadata> {
  readFragments(pdfBinary: Uint8Array): Promise<readonly TFragment[]>;
  readFragmentsAsJson(pdfBinary: Uint8Array): Promise<string>;
  readMetadata(pdfBinary: Uint8Array): Promise<TMetadata>;
}

export interface IPdfReaderFactory<TFragment, TMetadata> {
  create(): IPdfReader<TFragment, TMetadata>;
}

/* =================================================================================================
   Shared validation
   ================================================================================================= */

export abstract class GuardedReader {
  protected ensureBinary(pdfBinary: Uint8Array, name: string): void {
    if (!(pdfBinary instanceof Uint8Array)) {
      throw new Error(`${name} must be a Uint8Array.`);
    }

    if (pdfBinary.byteLength === 0) {
      throw new Error(`${name} must not be empty.`);
    }
  }
}

/* =================================================================================================
   Reader
   ================================================================================================= */

export class PdfReader<TFragment, TMetadata>
  extends GuardedReader
  implements IPdfReader<TFragment, TMetadata>
{
  private readonly fragmentReader: IReadPdfFragments<TFragment>;
  private readonly metadataReader: IReadPdfMetadata<TMetadata>;

  public constructor(
    fragmentReader: IReadPdfFragments<TFragment>,
    metadataReader: IReadPdfMetadata<TMetadata>,
  ) {
    super();
    this.fragmentReader = fragmentReader;
    this.metadataReader = metadataReader;
  }

  public async readFragments(
    pdfBinary: Uint8Array,
  ): Promise<readonly TFragment[]> {
    this.ensureBinary(pdfBinary, "pdfBinary");
    return this.fragmentReader.read(pdfBinary);
  }

  public async readFragmentsAsJson(pdfBinary: Uint8Array): Promise<string> {
    this.ensureBinary(pdfBinary, "pdfBinary");
    return this.fragmentReader.readJson(pdfBinary);
  }

  public async readMetadata(pdfBinary: Uint8Array): Promise<TMetadata> {
    this.ensureBinary(pdfBinary, "pdfBinary");
    return this.metadataReader.read(pdfBinary);
  }
}

/* =================================================================================================
   Factory
   ================================================================================================= */

export class PdfReaderFactory<TFragment, TMetadata>
  implements IPdfReaderFactory<TFragment, TMetadata>
{
  private readonly fragmentReaderFactory: () => IReadPdfFragments<TFragment>;
  private readonly metadataReaderFactory: () => IReadPdfMetadata<TMetadata>;

  public constructor(
    fragmentReaderFactory: () => IReadPdfFragments<TFragment>,
    metadataReaderFactory: () => IReadPdfMetadata<TMetadata>,
  ) {
    this.fragmentReaderFactory = fragmentReaderFactory;
    this.metadataReaderFactory = metadataReaderFactory;
  }

  public create(): IPdfReader<TFragment, TMetadata> {
    return new PdfReader(
      this.fragmentReaderFactory(),
      this.metadataReaderFactory(),
    );
  }
}