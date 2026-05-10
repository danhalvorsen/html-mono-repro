import { join } from "node:path";
import type { SvgShapeDocument } from "../domain/SvgShape.js";
import type { IFileContentReader } from "../ports/IFileContentReader.js";
import type { IFileContentWriter } from "../ports/IFileContentWriter.js";
import type { IMxGraphShapeParser } from "../ports/IMxGraphShapeParser.js";
import type { IOutputDirectoryCleaner } from "../ports/IOutputDirectoryCleaner.js";
import type { ISvgFileSerializer } from "../ports/ISvgFileSerializer.js";
import type { ISvgShapeConverter } from "../ports/ISvgShapeConverter.js";
import type { ISvgShapeFileNameFactory } from "../ports/ISvgShapeFileNameFactory.js";
import type { ISvgShapeSerializer } from "../ports/ISvgShapeSerializer.js";

export interface ConvertFileRequest {
  readonly inputPath: string;
  readonly outputPath: string;
}

export interface ExportSvgFilesRequest {
  readonly inputPath: string;
  readonly outputDirectory: string;
}

export class MxGraphToSvgShapeApplication {
  public constructor(
    private readonly reader: IFileContentReader,
    private readonly writer: IFileContentWriter,
    private readonly outputDirectoryCleaner: IOutputDirectoryCleaner,
    private readonly parser: IMxGraphShapeParser,
    private readonly converter: ISvgShapeConverter,
    private readonly serializer: ISvgShapeSerializer,
    private readonly svgFileSerializer: ISvgFileSerializer,
    private readonly fileNameFactory: ISvgShapeFileNameFactory
  ) {}

  public async convertFile(request: ConvertFileRequest): Promise<void> {
    const input = await this.reader.read(request.inputPath);
    const sourceDocument = this.parser.parseDocument(input);

    const document: SvgShapeDocument = {
      name: sourceDocument.sourceName,
      rootName: sourceDocument.rootName,
      shapes: sourceDocument.shapes.map((shape) =>
        this.converter.convert(shape, sourceDocument.rootName)
      )
    };

    await this.writer.write(
      request.outputPath,
      this.serializer.serialize(document)
    );
  }

  public async exportSvgFiles(request: ExportSvgFilesRequest): Promise<void> {
    await this.outputDirectoryCleaner.clean(request.outputDirectory);

    const input = await this.reader.read(request.inputPath);
    const sourceDocument = this.parser.parseDocument(input);

    const shapes = sourceDocument.shapes.map((shape) =>
      this.converter.convert(shape, sourceDocument.rootName)
    );

    for (const shape of shapes) {
      await this.writer.write(
        join(request.outputDirectory, this.fileNameFactory.create(shape)),
        this.svgFileSerializer.serialize(shape)
      );
    }
  }
}