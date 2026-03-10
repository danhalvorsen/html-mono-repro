// packages/core-template-handlebar/tests/Scaffolder.test.ts

import { describe, expect, it } from "vitest";
import { File, Path } from "@monorepo/core-filesystem";
import { Scaffolder } from "../src/Scaffolder.js";
import type { ITemplateRenderer } from "../src/ITemplateRenderer.js";
import type { IFileWriter } from "../src/IFileWriter.js";
import { ScaffoldingBlueprint } from "../src/ScaffoldingBlueprint.js";
import { TemplateFileDescriptor } from "../src/TemplateFileDescriptor.js";

class TemplateRendererFake implements ITemplateRenderer {
  public readonly calls: Array<{
    templateName: string;
    context: object;
  }> = [];

  public render(templateName: string, context: object): string {
    this.calls.push({ templateName, context });
    return `rendered:${templateName}`;
  }
}

class FileWriterSpy implements IFileWriter {
  public readonly writes: Array<{
    file: File;
    content: string;
  }> = [];

  public write(file: File, content: string): void {
    this.writes.push({ file, content });
  }
}

describe("Scaffolder", () => {
  it("should render each template and write each output file", () => {
    const renderer = new TemplateRendererFake();
    const writer = new FileWriterSpy();
    const sut = new Scaffolder(renderer, writer);

    const context = {
      scope: "@monorepo",
      name: "demo-package",
      version: "1.0.0",
    };

    const packageOutputFile = new File(Path.from("dist/package.json"));
    const tsconfigOutputFile = new File(Path.from("dist/tsconfig.json"));

    const blueprint = new ScaffoldingBlueprint(context, [
      new TemplateFileDescriptor("package", packageOutputFile),
      new TemplateFileDescriptor("tsconfig", tsconfigOutputFile),
    ]);

    sut.scaffold(blueprint);

    expect(renderer.calls).toHaveLength(2);
    expect(renderer.calls[0]).toEqual({
      templateName: "package",
      context,
    });
    expect(renderer.calls[1]).toEqual({
      templateName: "tsconfig",
      context,
    });

    expect(writer.writes).toHaveLength(2);
    expect(writer.writes[0]).toEqual({
      file: packageOutputFile,
      content: "rendered:package",
    });
    expect(writer.writes[1]).toEqual({
      file: tsconfigOutputFile,
      content: "rendered:tsconfig",
    });
  });

  it("should do nothing when blueprint has no files", () => {
    const renderer = new TemplateRendererFake();
    const writer = new FileWriterSpy();
    const sut = new Scaffolder(renderer, writer);

    const blueprint = new ScaffoldingBlueprint(
      { name: "demo-package" },
      [],
    );

    sut.scaffold(blueprint);

    expect(renderer.calls).toHaveLength(0);
    expect(writer.writes).toHaveLength(0);
  });

  it("should preserve file order when rendering and writing", () => {
    const renderer = new TemplateRendererFake();
    const writer = new FileWriterSpy();
    const sut = new Scaffolder(renderer, writer);

    const context = { name: "ordered-demo" };

    const firstFile = new File(Path.from("dist/01-package.json"));
    const secondFile = new File(Path.from("dist/02-tsconfig.json"));
    const thirdFile = new File(Path.from("dist/03-vitest.config.ts"));

    const blueprint = new ScaffoldingBlueprint(context, [
      new TemplateFileDescriptor("package", firstFile),
      new TemplateFileDescriptor("tsconfig", secondFile),
      new TemplateFileDescriptor("vitest.config", thirdFile),
    ]);

    sut.scaffold(blueprint);

    expect(renderer.calls.map((x) => x.templateName)).toEqual([
      "package",
      "tsconfig",
      "vitest.config",
    ]);

    expect(writer.writes.map((x) => x.file)).toEqual([
      firstFile,
      secondFile,
      thirdFile,
    ]);

    expect(writer.writes.map((x) => x.content)).toEqual([
      "rendered:package",
      "rendered:tsconfig",
      "rendered:vitest.config",
    ]);
  });
});