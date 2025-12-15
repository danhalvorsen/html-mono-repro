import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const stripBom = (text: string) => text.replace(/^\uFEFF/, "");

const packageJsonSchema = z
  .object({
    name: z.literal("absolute.consistently.tests"),
    version: z.literal("1.0.0"),
    type: z.literal("module"),
    main: z.literal("dist/index.js"),
    types: z.literal("dist/index.d.ts"),
    scripts: z.object({
      build: z.literal("tsc -p tsconfig.json"),
      lint: z.literal("eslint ."),
      "lint:fix": z.literal("eslint . --fix"),
      test: z.literal("vitest run")
    }),
    dependencies: z.object({
      "@my-graphics/core-filesystem": z.literal("workspace:*"),
      "@my-graphics/core-logger": z.literal("workspace:*"),
      "core-reactive": z.literal("workspace:*"),
      "@my-graphics/core-template": z.literal("workspace:*"),
      zod: z.literal("^3.23.8"),
      "zod-package-json": z.literal("^1.0.0")
    }),
    devDependencies: z.object({
      vitest: z.literal("^4.0.14")
    }),
    exports: z.object({
      ".": z.object({
        import: z.literal("./dist/index.js"),
        types: z.literal("./dist/index.d.ts")
      })
    })
  })
  .strict();

const tsconfigSchema = z
  .object({
    extends: z.literal("../../tsconfig.node.json"),
    compilerOptions: z.object({
      rootDir: z.literal("src"),
      outDir: z.literal("dist")
    }),
    include: z.tuple([z.literal("src")])
  })
  .strict();

const tsconfigTestSchema = z
  .object({
    extends: z.literal("./tsconfig.json"),
    compilerOptions: z.object({
      noEmit: z.literal(true),
      types: z.tuple([z.literal("vitest/globals")])
    }),
    include: z.tuple([z.literal("test"), z.literal("tests")])
  })
  .strict();

const vitestConfigSchema = z
  .object({
    test: z.object({
      include: z.tuple([z.literal("tests/**/*.test.ts")]),
      globals: z.literal(true),
      environment: z.literal("node")
    }),
    resolve: z.object({
      alias: z.object({
        "@my-graphics/core-filesystem": z.string(),
        "@my-graphics/core-logger": z.string()
      }),
      preserveSymlinks: z.literal(true)
    })
  })
  .strict();

describe("Configuration integrity", () => {
  it("package.json matches the expected reference", () => {
    const raw = stripBom(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
    const parsed = JSON.parse(raw);
    expect(packageJsonSchema.parse(parsed)).toBeTruthy();
  });

  it("tsconfig.json matches the expected reference", () => {
    const raw = stripBom(fs.readFileSync(path.join(root, "tsconfig.json"), "utf-8"));
    const parsed = JSON.parse(raw);
    expect(tsconfigSchema.parse(parsed)).toBeTruthy();
  });

  it("tsconfig.test.json matches the expected reference", () => {
    const raw = stripBom(fs.readFileSync(path.join(root, "tsconfig.test.json"), "utf-8"));
    const parsed = JSON.parse(raw);
    expect(tsconfigTestSchema.parse(parsed)).toBeTruthy();
  });

  it("vitest.config.ts matches the expected reference", async () => {
    const imported = await import(path.join(root, "vitest.config.ts"));
    const config = imported.default ?? imported;

    const expectedAliases = {
      "@my-graphics/core-filesystem": path.resolve(
        root,
        "../core-filesystem/src/index.ts"
      ),
      "@my-graphics/core-logger": path.resolve(root, "../core-logger/src/LoggerProvider.ts")
    };

    const parsed = vitestConfigSchema.parse({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          "@my-graphics/core-filesystem": config.resolve.alias["@my-graphics/core-filesystem"],
          "@my-graphics/core-logger": config.resolve.alias["@my-graphics/core-logger"]
        }
      }
    });

    expect(parsed.resolve.alias).toStrictEqual(expectedAliases);
  });
});
