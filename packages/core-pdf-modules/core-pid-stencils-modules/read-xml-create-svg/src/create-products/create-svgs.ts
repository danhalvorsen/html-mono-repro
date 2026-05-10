import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface Logger {
  info(message: string): void;
}

interface SvgOutput {
  readonly fullPath: string;
  readonly relativePathFromPackageRoot: string;
}

interface SvgFileReference {
  readonly fileName: string;
  readonly fullPath: string;
  readonly relativePathFromPackageRoot: string;
}

interface ProductReportItem {
  readonly type: string;
  readonly name: string;
  readonly productId: string;
  readonly filenameBase: string;
  readonly sourceFile: string;
  svg?: SvgFileReference;
}

interface ProductReportCategory {
  readonly category: string;
  readonly type: string;
  readonly sourceFile: string;
  readonly products: ProductReportItem[];
  svgOutput?: SvgOutput;
}

interface ProductCatalogReport {
  readonly schemaVersion: number;
  readonly inputDirectory: string;
  readonly reportFile?: string;
  readonly categoryCount: number;
  readonly productCount: number;
  categories: ProductReportCategory[];
  svgOutput?: SvgOutput;
  svgCount?: number;
  updatedAtUtc?: string;
}

interface ShapeStencil {
  readonly name: string;
  readonly sourceFile: string;
  readonly width: number;
  readonly height: number;
  readonly body: string;
}

class CommandLineOptions {
  public constructor(
    public readonly productFile: string,
    public readonly dataDirectory: string,
    public readonly outputDirectory: string,
  ) {
    if (productFile.trim().length === 0) {
      throw new Error("productFile is required.");
    }

    if (dataDirectory.trim().length === 0) {
      throw new Error("dataDirectory is required.");
    }

    if (outputDirectory.trim().length === 0) {
      throw new Error("outputDirectory is required.");
    }
  }

  public static fromArgv(argv: readonly string[]): CommandLineOptions {
    return new CommandLineOptions(
      path.resolve(process.cwd(), CommandLineOptions.readOption(argv, "--products") ?? "./generated/products.json"),
      path.resolve(process.cwd(), CommandLineOptions.readOption(argv, "--data") ?? "./data"),
      path.resolve(process.cwd(), CommandLineOptions.readOption(argv, "--output") ?? "./generated/svgs"),
    );
  }

  private static readOption(argv: readonly string[], name: string): string | undefined {
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

  public readNumber(attributes: string, name: string, fallback = 0): number {
    const value = this.read(attributes, name);

    if (value === undefined) {
      return fallback;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
}

class ShapeStencilRepository {
  private readonly xmlByFile = new Map<string, string>();

  public constructor(
    private readonly dataDirectory: string,
    private readonly attributeReader: XmlAttributeReader,
  ) {}

  public async find(product: ProductReportItem): Promise<ShapeStencil> {
    const sourceFile = product.sourceFile;

    if (sourceFile.trim().length === 0) {
      throw new Error(`Product is missing sourceFile: ${product.name}`);
    }

    const xml = await this.readSourceXml(sourceFile);
    const shapeBlocks = [...xml.matchAll(/<shape\b([^>]*)>([\s\S]*?)<\/shape>/giu)];

    for (const shapeBlock of shapeBlocks) {
      const attributes = shapeBlock[1] ?? "";
      const body = shapeBlock[2] ?? "";
      const name = this.attributeReader.read(attributes, "name");

      if (name === product.name) {
        return {
          name,
          sourceFile,
          width: this.attributeReader.readNumber(attributes, "w", 100),
          height: this.attributeReader.readNumber(attributes, "h", 100),
          body,
        };
      }
    }

    throw new Error(`Shape not found. sourceFile='${sourceFile}', name='${product.name}'.`);
  }

  private async readSourceXml(sourceFile: string): Promise<string> {
    const cachedXml = this.xmlByFile.get(sourceFile);

    if (cachedXml !== undefined) {
      return cachedXml;
    }

    const fullPath = path.join(this.dataDirectory, sourceFile);
    const xml = await readFile(fullPath, "utf8");

    this.xmlByFile.set(sourceFile, xml);

    return xml;
  }
}

class MxGraphShapeToSvgConverter {
  public constructor(
    private readonly attributeReader: XmlAttributeReader,
    private readonly codec: XmlEntityCodec,
  ) {}

  public convert(shape: ShapeStencil): string {
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
      .map((match) => this.convertPath(match[1] ?? ""))
      .filter((pathData) => pathData.length > 0)
      .map((pathData) => `<path d="${pathData}" />`);
  }

  private convertPath(pathBody: string): string {
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
  public async write(outputDirectory: string, product: ProductReportItem, svg: string): Promise<SvgFileReference> {
    await mkdir(outputDirectory, { recursive: true });

    const fileName = `${this.safeFilename(product.filenameBase)}.svg`;
    const fullPath = path.join(outputDirectory, fileName);

    await writeFile(fullPath, svg, "utf8");

    return {
      fileName,
      fullPath,
      relativePathFromPackageRoot: path.relative(process.cwd(), fullPath).replaceAll("\\", "/"),
    };
  }

  private safeFilename(filenameBase: string): string {
    if (filenameBase.trim().length === 0) {
      throw new Error("Product is missing filenameBase.");
    }

    return filenameBase
      .replace(/[^a-zA-Z0-9.-]+/gu, "-")
      .replace(/^-+|-+$/gu, "")
      .toLowerCase();
  }
}

class ProductReportWriter {
  public async write(productFile: string, catalog: ProductCatalogReport): Promise<void> {
    await writeFile(productFile, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  }
}

class CreateSvgsCommand {
  public constructor(
    private readonly repository: ShapeStencilRepository,
    private readonly converter: MxGraphShapeToSvgConverter,
    private readonly svgWriter: SvgFileWriter,
    private readonly reportWriter: ProductReportWriter,
    private readonly logger: Logger,
  ) {}

  public async execute(options: CommandLineOptions): Promise<void> {
    const catalog = JSON.parse(await readFile(options.productFile, "utf8")) as ProductCatalogReport;

    if (!Array.isArray(catalog.categories)) {
      throw new Error(`Invalid products report. Missing categories array: ${options.productFile}`);
    }

    const svgOutput: SvgOutput = {
      fullPath: options.outputDirectory,
      relativePathFromPackageRoot: path.relative(process.cwd(), options.outputDirectory).replaceAll("\\", "/"),
    };

    let createdCount = 0;

    for (const category of catalog.categories) {
      if (!Array.isArray(category.products)) {
        continue;
      }

      category.svgOutput = svgOutput;

      for (const product of category.products) {
        const shape = await this.repository.find(product);
        const svg = this.converter.convert(shape);

        product.svg = await this.svgWriter.write(options.outputDirectory, product, svg);
        createdCount += 1;
      }
    }

    catalog.svgOutput = svgOutput;
    catalog.svgCount = createdCount;
    catalog.updatedAtUtc = new Date().toISOString();

    await this.reportWriter.write(options.productFile, catalog);

    this.logger.info(`Created ${createdCount} SVG files.`);
    this.logger.info(`SVG output: ${svgOutput.fullPath}`);
    this.logger.info(`Updated report: ${options.productFile}`);
  }
}

async function main(): Promise<void> {
  const options = CommandLineOptions.fromArgv(process.argv.slice(2));
  const codec = new XmlEntityCodec();
  const attributeReader = new XmlAttributeReader(codec);

  const command = new CreateSvgsCommand(
    new ShapeStencilRepository(options.dataDirectory, attributeReader),
    new MxGraphShapeToSvgConverter(attributeReader, codec),
    new SvgFileWriter(),
    new ProductReportWriter(),
    new ConsoleLogger(),
  );

  await command.execute(options);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});