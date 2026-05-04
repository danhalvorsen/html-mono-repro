/* =================================================================================================
   packages/core-pdf-writer/src/index.ts
   packages/core-pdf-writer/src/IPdfWriter.ts
   packages/core-pdf-writer/src/IPdfWriterFactory.ts
   packages/core-pdf-writer/src/IWritePdfFragments.ts
   packages/core-pdf-writer/src/GuardedWriter.ts
   packages/core-pdf-writer/src/PdfWriter.ts
   packages/core-pdf-writer/src/PdfWriterFactory.ts

   Slim writer module only.
   Owns only writer-facing orchestration and writer-local ports.
   No parser-adapter ownership.
   No pdf-domain ownership.
   No vendor ownership.
   No file-system ownership.
   ================================================================================================= */

/* =================================================================================================
   Writer-owned ports
   ================================================================================================= */

export interface IWritePdfFragments<TFragment> {
  write(
    pdfBinary: Uint8Array,
    fragments: readonly TFragment[],
  ): Promise<Uint8Array>;
}

export interface IPdfWriter<TFragment> {
  write(
    pdfBinary: Uint8Array,
    fragments: readonly TFragment[],
  ): Promise<Uint8Array>;
}

export interface IPdfWriterFactory<TFragment> {
  create(): IPdfWriter<TFragment>;
}

/* =================================================================================================
   Shared validation
   ================================================================================================= */

export abstract class GuardedWriter {
  protected ensureBinary(pdfBinary: Uint8Array, name: string): void {
    if (!(pdfBinary instanceof Uint8Array)) {
      throw new Error(`${name} must be a Uint8Array.`);
    }

    if (pdfBinary.byteLength === 0) {
      throw new Error(`${name} must not be empty.`);
    }
  }

  protected ensureFragments<TFragment>(
    fragments: readonly TFragment[],
    name: string,
  ): void {
    if (!Array.isArray(fragments)) {
      throw new Error(`${name} must be an array.`);
    }

    for (let index = 0; index < fragments.length; index += 1) {
      if (fragments[index] === null || fragments[index] === undefined) {
        throw new Error(`${name}[${index}] is required.`);
      }
    }
  }
}

/* =================================================================================================
   Writer
   ================================================================================================= */

export class PdfWriter<TFragment>
  extends GuardedWriter
  implements IPdfWriter<TFragment>
{
  private readonly fragmentWriter: IWritePdfFragments<TFragment>;

  public constructor(fragmentWriter: IWritePdfFragments<TFragment>) {
    super();
    this.fragmentWriter = fragmentWriter;
  }

  public async write(
    pdfBinary: Uint8Array,
    fragments: readonly TFragment[],
  ): Promise<Uint8Array> {
    this.ensureBinary(pdfBinary, "pdfBinary");
    this.ensureFragments(fragments, "fragments");

    return this.fragmentWriter.write(pdfBinary, fragments);
  }
}

/* =================================================================================================
   Factory
   ================================================================================================= */

export class PdfWriterFactory<TFragment>
  implements IPdfWriterFactory<TFragment>
{
  private readonly fragmentWriterFactory: () => IWritePdfFragments<TFragment>;

  public constructor(
    fragmentWriterFactory: () => IWritePdfFragments<TFragment>,
  ) {
    this.fragmentWriterFactory = fragmentWriterFactory;
  }

  public create(): IPdfWriter<TFragment> {
    return new PdfWriter(this.fragmentWriterFactory());
  }
}

/* =================================================================================================
   Barrel
   ================================================================================================= */

export {
  PdfWriter as CorePdfWriter,
  PdfWriterFactory as CorePdfWriterFactory,
};