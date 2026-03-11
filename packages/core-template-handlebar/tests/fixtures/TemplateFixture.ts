// packages/core-template-handlebar/tests/fixtures/TemplateFixture.ts

import Handlebars from "handlebars";
import { fileURLToPath } from "node:url";
import { Directory, File, Path } from "@monorepo/core-filesystem";

export class TemplateFixture {
  public readonly root: Directory;
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor() {
    const templatesAbsolutePath = fileURLToPath(
      new URL("../../templates/", import.meta.url),
    );

    this.root = new Directory(Path.from(templatesAbsolutePath));

    this.context = Object.freeze({
      name: "demo-package",
      scope: "@monorepo",
      version: "1.0.0",
      module: "NodeNext",
      target: "ES2022",
      environment: "node",
    });
  }

  public listTemplateFiles(): File[] {
    return this.root
      .listFiles()
      .filter((file: { path: { extension: string; }; }) => file.path.extension === ".hbs");
  }

  public loadRaw(file: File): string {
    return file.read();
  }

  public compile(raw: string): HandlebarsTemplateDelegate<Record<string, unknown>> {
    return Handlebars.compile(raw);
  }

  public render(raw: string): string {
    return this.compile(raw)(this.context);
  }

  public hasUnresolvedPlaceholders(output: string): boolean {
    return /{{.*?}}/g.test(output);
  }
}