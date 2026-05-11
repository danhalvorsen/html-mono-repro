import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

type SourceFile = {
  readonly AbsolutePath: string;
  readonly RelativePath: string;
  readonly Content: string;
};

function collectSourceFiles(rootPath: string): readonly SourceFile[] {
  const files: SourceFile[] = [];

  function visit(directory: string): void {
    for (const entry of readdirSync(directory)) {
      const absolutePath = join(directory, entry);
      const stat = statSync(absolutePath);

      if (stat.isDirectory()) {
        visit(absolutePath);
        continue;
      }

      if (!absolutePath.endsWith(".ts")) {
        continue;
      }

      files.push({
        AbsolutePath: absolutePath,
        RelativePath: relative(rootPath, absolutePath).split(sep).join("/"),
        Content: readFileSync(absolutePath, "utf8"),
      });
    }
  }

  visit(rootPath);

  return files;
}

describe("Slice 4 architecture boundary", () => {
  it("keeps Inversify and reflect-metadata imports inside src/new/inversify only", () => {
    const rootPath = join(process.cwd(), "src", "new");
    const files = collectSourceFiles(rootPath);

    const illegalFiles = files
      .filter((file) => !file.RelativePath.startsWith("inversify/"))
      .filter(
        (file) =>
          file.Content.includes('"inversify"') ||
          file.Content.includes("'inversify'") ||
          file.Content.includes('"reflect-metadata"') ||
          file.Content.includes("'reflect-metadata'"),
      )
      .map((file) => file.RelativePath);

    expect(illegalFiles).toEqual([]);
  });

  it("keeps public facade index free of engine exports", () => {
    const indexPath = join(process.cwd(), "src", "new", "index.ts");
    const content = readFileSync(indexPath, "utf8");

    expect(content).not.toContain("./inversify/index.js");
    expect(content).not.toContain("InversifyContainerAdapter");
    expect(content).not.toContain("InversifyDescriptorBinder");
    expect(content).not.toContain("InversifyServiceProvider");
    expect(content).not.toContain("InversifyServiceScope");
  });

  it("allows the default builder to compose the internal adapter without exporting it", () => {
    const builderPath = join(process.cwd(), "src", "new", "CreateDefaultContainerBuilder.ts");
    const content = readFileSync(builderPath, "utf8");

    expect(content).toContain("./inversify/InversifyContainerAdapter.js");

    const publicIndexPath = join(process.cwd(), "src", "new", "index.ts");
    const publicIndex = readFileSync(publicIndexPath, "utf8");

    expect(publicIndex).toContain("CreateDefaultContainerBuilder");
    expect(publicIndex).not.toContain("./inversify/InversifyContainerAdapter.js");
  });

  it("does not expose legacy decorators or token concepts from the public facade", () => {
    const publicIndexPath = join(process.cwd(), "src", "new", "index.ts");
    const publicIndex = readFileSync(publicIndexPath, "utf8");

    expect(publicIndex).not.toContain("Injectable");
    expect(publicIndex).not.toContain("InjectionDecorators");
    expect(publicIndex).not.toContain("Inject");
    expect(publicIndex).not.toContain("Optional");
    expect(publicIndex).not.toContain("TokenHasher");
    expect(publicIndex).not.toMatch(/\bexport\s+\{\s*Token\b/u);
    expect(publicIndex).not.toMatch(/\bexport\s+\{\s*ContainerAdapter\b/u);
    expect(publicIndex).not.toContain("InversifyContainerAdapter");
  });

  it("does not expose legacy decorators or token concepts from non-adapter facade modules", () => {
    const rootPath = join(process.cwd(), "src", "new");
    const files = collectSourceFiles(rootPath);

    const illegalFiles = files
      .filter((file) => !file.RelativePath.startsWith("inversify/"))
      .filter(
        (file) =>
          file.Content.includes("Injectable") ||
          file.Content.includes("InjectionDecorators") ||
          file.Content.includes("TokenHasher"),
      )
      .map((file) => file.RelativePath);

    expect(illegalFiles).toEqual([]);
  });
});