import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface CommandLineOptionReader {
  read(argv: readonly string[], name: string): string | undefined;
}

interface Logger {
  info(message: string): void;
}

interface XmlFile {
  readonly fullPath: string;
  readonly sourceFile: string;
  readonly categoryType: string;
}

interface ShapeDefinition {
  readonly sourceFile: string;
  readonly categoryType: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly body: string;
}

interface SvgWriteResult {
  readonly fileName: string;
  readonly fullPath: string;
}

class CommandLineOptions {
  public constructor(
    public readonly inputDirectory: string,
    public readonly outputDirectory: string,
  ) {}

  public static fromArgv(argv: readonly string[], reader: CommandLineOptionReader): CommandLineOptions {
    return new CommandLineOptions(
      path.resolve(process.cwd(), reader.read(argv, "--input") ?? "./data"),
      path.resolve(process.cwd(), reader.read(argv, "--output") ?? "./generated/svgs"),
    );
  }
}

class DefaultCommandLineOptionReader implements CommandLineOptionReader {
  public read(argv: readonly string[], name: string): string | undefined {
    const index = argv.indexOf(name);

    if (index < 0) {
      return undefined;
    }

    const value = argv[index + 1];

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${name}.`);
    }

    return value;
  }
}

class ConsoleLogger implements Logger {
  public info(message: string): void {
    console.log(message);
  }
}

class XmlEntityCodec {
  public decode(value: string): string {
    return value
      .replaceAll("&quot;", '"')
      .replaceAll("&apos;", "'")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&");
  }

  public encode(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}

class XmlAttributeReader {
  public constructor(private readonly codec: XmlEntityCodec) {}

  public read(attributes: string, name: string): string | undefined {
    const expression = new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "iu");
    const match = attributes.match(expression);

    if (match === null || match[1] === undefined) {
      return undefined;
    }

    return this.codec.decode(match[1]);
  }

  public readNumber(attributes: string, name: string, fallback: number): number {
    const value = this.read(attributes, name);

    if (value === undefined) {
      return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}

class SvgFileNameFactory {
  public create(categoryType: string, shapeName: string): string {
    return `${this.toKebabCase(categoryType)}.${this.toKebabCase(shapeName)}.svg`;
  }

  private toKebabCase(value: string): string {
    return value
      .replace(/([a-z0-9])([A-Z])/gu, "$1-$2")
      .replace(/[^a-zA-Z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "")
      .replace(/-+/gu, "-")
      .toLowerCase();
  }
}

class XmlFileFinder {
  public async findXmlFiles(inputDirectory: string): Promise<XmlFile[]> {
    const files = await this.findRecursive(inputDirectory);

    return files
      .sort((left, right) => left.localeCompare(right))
      .map((fullPath) => {
        const sourceFile = path.relative(inputDirectory, fullPath).replaceAll("\\", "/");
        const categoryType = path.basename(sourceFile, ".xml").replaceAll("_", "-");

        return {
          fullPath,
          sourceFile,
          categoryType,
        };
      });
  }

  private async findRecursive(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        files.push(...await this.findRecursive(fullPath));
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".xml")) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

class ShapeDefinitionParser {
  public constructor(private readonly attributeReader: XmlAttributeReader) {}

  public parse(xmlFile: XmlFile, xml: string): ShapeDefinition[] {
    const shapeBlocks = [...xml.matchAll(/<shape\b([^>]*)>([\s\S]*?)<\/shape>/giu)];
    const shapes: ShapeDefinition[] = [];

    for (const shapeBlock of shapeBlocks) {
      const attributes = shapeBlock[1] ?? "";
      const body = shapeBlock[2] ?? "";
      const name = this.attributeReader.read(attributes, "name");

      if (name === undefined || name.trim().length === 0) {
        continue;
      }

      shapes.push({
        sourceFile: xmlFile.sourceFile,
        categoryType: xmlFile.categoryType,
        name,
        width: this.attributeReader.readNumber(attributes, "w", 100),
        height: this.attributeReader.readNumber(attributes, "h", 100),
        body,
      });
    }

    return shapes;
  }
}

class MxGraphShapeToSvgConverter {
  public constructor(
    private readonly attributeReader: XmlAttributeReader,
    private readonly codec: XmlEntityCodec,
  ) {}

  public convert(shape: ShapeDefinition): string {
    const elements = [
      ...this.convertPaths(shape.body),
      ...this.convertRectangles(shape.body),
      ...this.convertRoundRectangles(shape.body),
      ...this.convertEllipses(shape.body),
      ...this.convertTexts(shape.body),
    ];

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${shape.width} ${shape.height}" width="${shape.width}" height="${shape.height}" role="img" aria-label="${this.codec.encode(shape.name)}">`,
      `  <title>${this.codec.encode(shape.name)}</title>`,
      `  <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`,
      ...elements.map((element) => `    ${element}`),
      "  </g>",
      "</svg>",
      "",
    ].join("\n");
  }

  private convertPaths(body: string): string[] {
    return [...body.matchAll(/<path\b[^>]*>([\s\S]*?)<\/path>/giu)]
      .map((match) => this.convertPathBody(match[1] ?? ""))
      .filter((pathData) => pathData.length > 0)
      .map((pathData) => `<path d="${pathData}" />`);
  }

  private convertPathBody(pathBody: string): string {
    const commands: string[] = [];

    for (const match of pathBody.matchAll(/<(move|line|quad|curve|arc|close)\b([^>]*)\/>/giu)) {
      const command = match[1]?.toLowerCase();
      const attributes = match[2] ?? "";

      if (command === "move") {
        commands.push(`M ${this.number(attributes, "x")} ${this.number(attributes, "y")}`);
        continue;
      }

      if (command === "line") {
        commands.push(`L ${this.number(attributes, "x")} ${this.number(attributes, "y")}`);
        continue;
      }

      if (command === "quad") {
        commands.push(`Q ${this.number(attributes, "x1")} ${this.number(attributes, "y1")} ${this.number(attributes, "x")} ${this.number(attributes, "y")}`);
        continue;
      }

      if (command === "curve") {
        commands.push(`C ${this.number(attributes, "x1")} ${this.number(attributes, "y1")} ${this.number(attributes, "x2")} ${this.number(attributes, "y2")} ${this.number(attributes, "x")} ${this.number(attributes, "y")}`);
        continue;
      }

      if (command === "arc") {
        commands.push(`A ${this.number(attributes, "rx")} ${this.number(attributes, "ry")} ${this.number(attributes, "x-axis-rotation", 0)} ${this.number(attributes, "large-arc-flag", 0)} ${this.number(attributes, "sweep-flag", 0)} ${this.number(attributes, "x")} ${this.number(attributes, "y")}`);
        continue;
      }

      if (command === "close") {
        commands.push("Z");
      }
    }

    return commands.join(" ");
  }

  private convertRectangles(body: string): string[] {
    return [...body.matchAll(/<rect\b([^>]*)\/>/giu)].map((match) => {
      const attributes = match[1] ?? "";

      return `<rect x="${this.number(attributes, "x")}" y="${this.number(attributes, "y")}" width="${this.number(attributes, "w")}" height="${this.number(attributes, "h")}" />`;
    });
  }

  private convertRoundRectangles(body: string): string[] {
    return [...body.matchAll(/<roundrect\b([^>]*)\/>/giu)].map((match) => {
      const attributes = match[1] ?? "";
      const width = this.number(attributes, "w");
      const height = this.number(attributes, "h");
      const radius = Math.min(width, height) * 0.1;

      return `<rect x="${this.number(attributes, "x")}" y="${this.number(attributes, "y")}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" />`;
    });
  }

  private convertEllipses(body: string): string[] {
    return [...body.matchAll(/<ellipse\b([^>]*)\/>/giu)].map((match) => {
      const attributes = match[1] ?? "";
      const x = this.number(attributes, "x");
      const y = this.number(attributes, "y");
      const width = this.number(attributes, "w");
      const height = this.number(attributes, "h");

      return `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height / 2}" />`;
    });
  }

  private convertTexts(body: string): string[] {
    return [...body.matchAll(/<text\b([^>]*)\/>/giu)].map((match) => {
      const attributes = match[1] ?? "";
      const value = this.attributeReader.read(attributes, "str") ?? "";
      const x = this.number(attributes, "x");
      const y = this.number(attributes, "y");
      const anchor = this.attributeReader.read(attributes, "align") === "center" ? "middle" : "start";

      return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="currentColor" stroke="none" font-size="14">${this.codec.encode(value)}</text>`;
    });
  }

  private number(attributes: string, name: string, fallback = 0): number {
    return this.attributeReader.readNumber(attributes, name, fallback);
  }
}

class SvgFileWriter {
  public constructor(private readonly fileNameFactory: SvgFileNameFactory) {}

  public async write(outputDirectory: string, shape: ShapeDefinition, svg: string): Promise<SvgWriteResult> {
    await mkdir(outputDirectory, { recursive: true });

    const fileName = this.fileNameFactory.create(shape.categoryType, shape.name);
    const fullPath = path.join(outputDirectory, fileName);

    await writeFile(fullPath, svg, "utf8");

    return {
      fileName,
      fullPath,
    };
  }
}

class CreateSvgFilesCommand {
  public constructor(
    private readonly fileFinder: XmlFileFinder,
    private readonly parser: ShapeDefinitionParser,
    private readonly converter: MxGraphShapeToSvgConverter,
    private readonly writer: SvgFileWriter,
    private readonly logger: Logger,
  ) {}

  public async execute(options: CommandLineOptions): Promise<void> {
    const xmlFiles = await this.fileFinder.findXmlFiles(options.inputDirectory);

    if (xmlFiles.length === 0) {
      throw new Error(`No XML files found under: ${options.inputDirectory}`);
    }

    let createdCount = 0;

    for (const xmlFile of xmlFiles) {
      const xml = await readFile(xmlFile.fullPath, "utf8");
      const shapes = this.parser.parse(xmlFile, xml);

      for (const shape of shapes) {
        const svg = this.converter.convert(shape);
        await this.writer.write(options.outputDirectory, shape, svg);
        createdCount += 1;
      }
    }

    this.logger.info(`Created ${createdCount} SVG files.`);
    this.logger.info(`SVG folder: ${options.outputDirectory}`);
  }
}

async function main(): Promise<void> {
  const options = CommandLineOptions.fromArgv(
    process.argv.slice(2),
    new DefaultCommandLineOptionReader(),
  );

  const codec = new XmlEntityCodec();
  const attributeReader = new XmlAttributeReader(codec);

  const command = new CreateSvgFilesCommand(
    new XmlFileFinder(),
    new ShapeDefinitionParser(attributeReader),
    new MxGraphShapeToSvgConverter(attributeReader, codec),
    new SvgFileWriter(new SvgFileNameFactory()),
    new ConsoleLogger(),
  );

  await command.execute(options);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});