// packages/core-template-handlebar/tests/TemplateIntegration.test.ts

import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { Directory, File, Path } from "@monorepo/core-filesystem";
import { HandlebarTemplateResolver } from "../src/HandlebarTemplateResolver.js";
import { HandlebarsTemplateEngine } from "../src/HandlebarsTemplateEngine.js";
import { TemplateRenderer } from "../src/TemplateRenderer.js";
import { Scaffolder } from "../src/Scaffolder.js";
import { FilesystemWriter } from "../src/FilesystemWriter.js";
import { ScaffoldingBlueprint } from "../src/ScaffoldingBlueprint.js";
import { TemplateFileDescriptor } from "../src/TemplateFileDescriptor.js";

function createTemplatesRoot(): Directory {
  const templatesAbsolutePath = fileURLToPath(
    new URL("../templates/", import.meta.url),
  );

  return new Directory(Path.from(templatesAbsolutePath));
}

function createOutputRoot(): Directory {
  const outputAbsolutePath = fileURLToPath(
    new URL("./.tmp-output/", import.meta.url),
  );

  return new Directory(Path.from(outputAbsolutePath));
}

describe("@monorepo/core-template-handlebar integration", () => {
  it("should resolve, compile, and render package.hbs from templates folder", () => {
    const templatesRoot = createTemplatesRoot();
    const resolver = new HandlebarTemplateResolver(templatesRoot);
    const engine = new HandlebarsTemplateEngine(resolver);
    const renderer = new TemplateRenderer(engine);

    const output = renderer.render("package", {
      scope: "@monorepo",
      name: "core-template-handlebar-demo",
      version: "1.2.3",
    });

    expect(output).toContain('"name": "@monorepo/core-template-handlebar-demo"');
    expect(output).toContain('"version": "1.2.3"');
    expect(output.includes("{{")).toBe(false);
    expect(output.includes("}}")).toBe(false);
  });

  it("should scaffold real files from templates folder to disk", () => {
    const templatesRoot = createTemplatesRoot();
    const outputRoot = createOutputRoot();

    if (!outputRoot.exists()) {
      outputRoot.create();
    }

    const resolver = new HandlebarTemplateResolver(templatesRoot);
    const engine = new HandlebarsTemplateEngine(resolver);
    const renderer = new TemplateRenderer(engine);
    const writer = new FilesystemWriter();
    const scaffolder = new Scaffolder(renderer, writer);

    const packageOutputFile = new File(outputRoot.path.join("package.json"));
    const tsconfigOutputFile = new File(outputRoot.path.join("tsconfig.json"));

    const blueprint = new ScaffoldingBlueprint(
      {
        scope: "@monorepo",
        name: "demo-package",
        version: "1.0.0",
        module: "NodeNext",
        target: "ES2022",
      },
      [
        new TemplateFileDescriptor("package", packageOutputFile),
        new TemplateFileDescriptor("tsconfig", tsconfigOutputFile),
      ],
    );

    scaffolder.scaffold(blueprint);

    expect(packageOutputFile.exists()).toBe(true);
    expect(tsconfigOutputFile.exists()).toBe(true);

    const packageContent = packageOutputFile.read();
    const tsconfigContent = tsconfigOutputFile.read();

    expect(packageContent).toContain('"name": "@monorepo/demo-package"');
    expect(packageContent).toContain('"version": "1.0.0"');

    expect(tsconfigContent).toContain('"module": "NodeNext"');
    expect(tsconfigContent).toContain('"target": "ES2022"');
  });
});