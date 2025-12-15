import Handlebars from "handlebars";
import { Directory, Path, File } from "@my-graphics/core-filesystem";

export class TemplateFixture {
  /** Root directory where all .hbs templates live */
  readonly root: Directory;

  /** Default context used when rendering templates */
  readonly context: Record<string, unknown>;

  constructor() {
    this.root = new Directory(
      Path.from(process.cwd(), "templates")
    );

    // Minimal, valid context for all template types
    this.context = {
      name: "demo-package",
      scope: "@my-graphics",
      version: "1.0.0",
      module: "NodeNext",
      target: "ES2022",
      environment: "node"
    };
  }

  /**
   * Returns all .hbs template files inside the templates directory.
   */
  listTemplateFiles(): File[] {
    return this.root
      .listFiles()
      .filter(file => file.path.extension === ".hbs");
  }

  /**
   * Reads a template file into raw text.
   */
  loadRaw(file: File): string {
    return file.read();
  }

  /**
   * Compiles a raw handlebars template into a render function.
   */
  compile(raw: string): HandlebarsTemplateDelegate<any> {
    return Handlebars.compile(raw);
  }

  /**
   * Renders a raw template string using the fixture's default context.
   */
  render(raw: string): string {
    return this.compile(raw)(this.context);
  }

  /**
   * Checks whether output still contains unresolved MUSTACHE placeholders.
   */
  hasUnresolvedPlaceholders(output: string): boolean {
    return /{{.*?}}/g.test(output);
  }
}
