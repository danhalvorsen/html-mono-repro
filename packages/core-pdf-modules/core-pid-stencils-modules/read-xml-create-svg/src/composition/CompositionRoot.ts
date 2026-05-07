import { MxGraphToSvgShapeApplication } from "../application/MxGraphToSvgShapeApplication.js";
import { MxGraphShapeToSvgShapeConverter } from "../conversion/MxGraphShapeToSvgShapeConverter.js";
import { SvgPathDataConverter } from "../conversion/SvgPathDataConverter.js";
import { FileSystemContentReader } from "../infrastructure/FileSystemContentReader.js";
import { FileSystemContentWriter } from "../infrastructure/FileSystemContentWriter.js";
import { FileSystemOutputDirectoryCleaner } from "../infrastructure/FileSystemOutputDirectoryCleaner.js";
import { MxGraphRootNameNormalizer } from "../naming/MxGraphRootNameNormalizer.js";
import { SvgShapeFileNameFactory } from "../naming/SvgShapeFileNameFactory.js";
import { DomElementReader } from "../parsing/DomElementReader.js";
import { MxGraphShapeParser } from "../parsing/MxGraphShapeParser.js";
import { SvgFileSerializer } from "../serialization/SvgFileSerializer.js";
import { SvgShapeSerializer } from "../serialization/SvgShapeSerializer.js";
import { XmlEscaper } from "../serialization/XmlEscaper.js";

export class CompositionRoot {
  public createApplication(): MxGraphToSvgShapeApplication {
    const escaper = new XmlEscaper();

    return new MxGraphToSvgShapeApplication(
      new FileSystemContentReader(),
      new FileSystemContentWriter(),
      new FileSystemOutputDirectoryCleaner(),
      new MxGraphShapeParser(
        new DomElementReader(),
        new MxGraphRootNameNormalizer()
      ),
      new MxGraphShapeToSvgShapeConverter(new SvgPathDataConverter()),
      new SvgShapeSerializer(escaper),
      new SvgFileSerializer(escaper),
      new SvgShapeFileNameFactory()
    );
  }
}