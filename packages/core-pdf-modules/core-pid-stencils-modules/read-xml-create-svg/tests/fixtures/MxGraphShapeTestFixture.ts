import {
  DomElementReader,
  MxGraphRootNameNormalizer,
  MxGraphShapeParser,
  MxGraphShapeToSvgShapeConverter,
  MxGraphToSvgShapeApplication,
  SvgFileSerializer,
  SvgPathDataConverter,
  SvgShapeFileNameFactory,
  SvgShapeSerializer,
  XmlEscaper
} from "../../src/index.js";
import type {
  IFileContentReader,
  IFileContentWriter,
  IOutputDirectoryCleaner,
  MxGraphShape,
  SvgShape
} from "../../src/index.js";

export interface ApplicationTestHarness {
  readonly application: MxGraphToSvgShapeApplication;
  readonly writer: InMemoryFileContentWriter;
  readonly outputDirectoryCleaner: InMemoryOutputDirectoryCleaner;
}

export class MxGraphShapeTestFixture {
  public readonly inputPath = "input/feeders.xml";
  public readonly outputPath = "output/feeders.svg-shapes.xml";
  public readonly rootName = "pid.feeders";
  public readonly sourceName = "mxGraph.pid.feeders";

  public createParser(): MxGraphShapeParser {
    return new MxGraphShapeParser(
      new DomElementReader(),
      new MxGraphRootNameNormalizer()
    );
  }

  public createPathDataConverter(): SvgPathDataConverter {
    return new SvgPathDataConverter();
  }

  public createConverter(): MxGraphShapeToSvgShapeConverter {
    return new MxGraphShapeToSvgShapeConverter(this.createPathDataConverter());
  }

  public createSerializer(): SvgShapeSerializer {
    return new SvgShapeSerializer(new XmlEscaper());
  }

  public createSvgFileSerializer(): SvgFileSerializer {
    return new SvgFileSerializer(new XmlEscaper());
  }

  public createFileNameFactory(): SvgShapeFileNameFactory {
    return new SvgShapeFileNameFactory();
  }

  public createEscaper(): XmlEscaper {
    return new XmlEscaper();
  }

  public createApplicationHarness(
    xml: string = this.createSampleXml()
  ): ApplicationTestHarness {
    const reader = new InMemoryFileContentReader(
      new Map<string, string>([[this.inputPath, xml]])
    );

    const writer = new InMemoryFileContentWriter();
    const outputDirectoryCleaner = new InMemoryOutputDirectoryCleaner(writer);

    return {
      application: new MxGraphToSvgShapeApplication(
        reader,
        writer,
        outputDirectoryCleaner,
        this.createParser(),
        this.createConverter(),
        this.createSerializer(),
        this.createSvgFileSerializer(),
        this.createFileNameFactory()
      ),
      writer,
      outputDirectoryCleaner
    };
  }

  public parseSampleShapes(): readonly MxGraphShape[] {
    return this.createParser().parse(this.createSampleXml());
  }

  public getSampleShapeByName(name: string): MxGraphShape {
    const shape = this.parseSampleShapes().find(
      (candidate) => candidate.name === name
    );

    if (!shape) {
      throw new Error(`Shape was not found in sample XML: ${name}`);
    }

    return shape;
  }

  public convertSampleShapeByName(name: string): SvgShape {
    return this.createConverter().convert(
      this.getSampleShapeByName(name),
      this.rootName
    );
  }

  public createSampleXml(): string {
    return `<shapes name="mxGraph.pid.feeders">
  <shape aspect="variable" h="100" name="Feeder (Rotary Table)" strokewidth="inherit" w="104.65">
    <connections>
      <constraint name="N" perimeter="0" x="0.5" y="0"/>
    </connections>
    <background>
      <path>
        <move x="2.33" y="0"/>
        <line x="102.33" y="0"/>
        <move x="52.33" y="0"/>
        <line x="52.33" y="100"/>
        <move x="62.33" y="40"/>
        <arc large-arc-flag="1" rx="50" ry="20" sweep-flag="1" x="42.33" x-axis-rotation="0" y="40"/>
        <move x="36.33" y="37"/>
        <line x="42.33" y="40"/>
        <line x="36.33" y="43"/>
      </path>
    </background>
    <foreground>
      <stroke/>
    </foreground>
  </shape>
  <shape aspect="variable" h="100" name="Proportional Feeder" strokewidth="inherit" w="100">
    <connections>
      <constraint name="N" perimeter="0" x="0.5" y="0"/>
      <constraint name="S" perimeter="0" x="0.5" y="1"/>
    </connections>
    <background>
      <ellipse h="100" w="100" x="0" y="0"/>
    </background>
    <foreground>
      <fillstroke/>
      <linejoin join="round"/>
      <path>
        <move x="10" y="20"/>
        <line x="90" y="20"/>
        <line x="10" y="80"/>
        <line x="90" y="80"/>
      </path>
      <stroke/>
    </foreground>
  </shape>
</shapes>`;
  }
}

export class InMemoryFileContentReader implements IFileContentReader {
  public constructor(
    private readonly contentByPath: ReadonlyMap<string, string>
  ) {}

  public async read(path: string): Promise<string> {
    const content = this.contentByPath.get(path);

    if (content === undefined) {
      throw new Error(`No in-memory content exists for path: ${path}`);
    }

    return content;
  }
}

export class InMemoryFileContentWriter implements IFileContentWriter {
  private readonly contentByPath = new Map<string, string>();

  public async write(path: string, content: string): Promise<void> {
    this.contentByPath.set(path, content);
  }

  public getContent(path: string): string {
    const content = this.contentByPath.get(path);

    if (content === undefined) {
      throw new Error(`No in-memory output exists for path: ${path}`);
    }

    return content;
  }

  public setContent(path: string, content: string): void {
    this.contentByPath.set(path, content);
  }

  public getPaths(): readonly string[] {
    return [...this.contentByPath.keys()];
  }

  public deleteUnderDirectory(directoryPath: string): void {
    const normalizedDirectoryPath = directoryPath.replaceAll("\\", "/");

    for (const path of this.contentByPath.keys()) {
      const normalizedPath = path.replaceAll("\\", "/");

      if (normalizedPath.startsWith(`${normalizedDirectoryPath}/`)) {
        this.contentByPath.delete(path);
      }
    }
  }
}

export class InMemoryOutputDirectoryCleaner implements IOutputDirectoryCleaner {
  private readonly cleanedDirectories: string[] = [];

  public constructor(private readonly writer: InMemoryFileContentWriter) {}

  public async clean(directoryPath: string): Promise<void> {
    this.cleanedDirectories.push(directoryPath);
    this.writer.deleteUnderDirectory(directoryPath);
  }

  public getCleanedDirectories(): readonly string[] {
    return this.cleanedDirectories;
  }
}