// packages/composite-tree-system/core-tools-code/Tests/tst.test.ts

import os from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Directory, File, Path } from "@monorepo/core-filesystem";
import {
  DuplicateDetector,
  RefactorApplication,
  TsMorphBarrelGenerator,
  TsMorphDeclarationCatalog,
  TsMorphDeclarationMover,
  TsMorphImportRewriter,
  TsMorphProjectLoader,
} from "../src/code.js";

interface TestFile {
  readonly relativePath: string;
  readonly content: string;
}

class TestLogger {
  public readonly infos: string[] = [];
  public readonly warns: string[] = [];
  public readonly errors: string[] = [];

  public info(message: string): void {
    this.infos.push(message);
  }

  public warn(message: string): void {
    this.warns.push(message);
  }

  public error(message: string): void {
    this.errors.push(message);
  }
}

class TestProjectBuilder {
  private readonly rootDirectory: Directory;

  public constructor(private readonly rootDir: Path) {
    this.rootDirectory = new Directory(rootDir);
  }

  public createTsConfig(): void {
    this.writeFile(
      "tsconfig.json",
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            strict: true,
            skipLibCheck: true,
          },
          include: ["src/**/*.ts"],
        },
        null,
        2,
      ),
    );
  }

  public writeFiles(files: readonly TestFile[]): void {
    for (const file of files) {
      this.writeFile(file.relativePath, file.content);
    }
  }

  public resolve(relativePath: string): string {
    return this.rootDir.join(relativePath).full;
  }

  public read(relativePath: string): string {
    return new File(this.rootDir.join(relativePath)).read();
  }

  public exists(relativePath: string): boolean {
    return this.rootDir.join(relativePath).exists();
  }

  public deleteRoot(): void {
    this.rootDirectory.delete(true);
  }

  private writeFile(relativePath: string, content: string): void {
    const filePath = this.rootDir.join(relativePath);
    const parent = new Directory(filePath.parent);

    if (!parent.exists()) {
      parent.create(true);
    }

    new File(filePath).write(content);
  }
}

interface RefactorFixture {
  readonly rootDir: Path;
  readonly project: TestProjectBuilder;
  readonly app: RefactorApplication;
  readonly logger: TestLogger;
}

function createTestApplication(): { readonly app: RefactorApplication; readonly logger: TestLogger } {
  const logger = new TestLogger();

  return {
    logger,
    app: new RefactorApplication(
      logger,
      new TsMorphProjectLoader(),
      new TsMorphDeclarationCatalog(),
      new DuplicateDetector(),
      new TsMorphDeclarationMover(),
      new TsMorphImportRewriter(),
      new TsMorphBarrelGenerator(),
    ),
  };
}

function createTempDirectory(testName: string): Path {
  const suffix = `${sanitize(testName)}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const rootDir = Path.from(os.tmpdir(), `core-tools-code-${suffix}`);
  new Directory(rootDir).create(true);
  return rootDir;
}

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function useRefactorFixture(): { readonly current: RefactorFixture } {
  const state = {} as { current: RefactorFixture };

  beforeEach((context) => {
    const rootDir = createTempDirectory(context.task.name);
    const project = new TestProjectBuilder(rootDir);
    project.createTsConfig();

    const application = createTestApplication();

    state.current = {
      rootDir,
      project,
      app: application.app,
      logger: application.logger,
    };
  });

  afterEach(() => {
    state.current.project.deleteRoot();
  });

  return state;
}

describe("RefactorApplication scan", () => {
  const fixture = useRefactorFixture();

  it("should detect duplicate class declarations", async () => {
    fixture.current.project.writeFiles([
      {
        relativePath: "src/a/QueryHandler.ts",
        content: `export class QueryHandler {}`,
      },
      {
        relativePath: "src/b/QueryHandler.ts",
        content: `export class QueryHandler {}`,
      },
    ]);

    const exitCode = await fixture.current.app.scan({
      project: fixture.current.project.resolve("tsconfig.json"),
      rootDir: fixture.current.project.resolve("src"),
      include: [],
    });

    expect(exitCode).toBe(2);
    expect(fixture.current.logger.warns.some(message => message.includes("Duplicate: QueryHandler"))).toBe(true);
  });

  it("should return success when no duplicate declarations exist", async () => {
    fixture.current.project.writeFiles([
      {
        relativePath: "src/a/Customer.ts",
        content: `export class Customer {}`,
      },
      {
        relativePath: "src/b/Order.ts",
        content: `export class Order {}`,
      },
    ]);

    const exitCode = await fixture.current.app.scan({
      project: fixture.current.project.resolve("tsconfig.json"),
      rootDir: fixture.current.project.resolve("src"),
      include: [],
    });

    expect(exitCode).toBe(0);
    expect(fixture.current.logger.infos).toContain("No duplicate declarations detected.");
  });
});

describe("RefactorApplication split", () => {
  const fixture = useRefactorFixture();

  it("should split multiple declarations into dedicated files and generate barrel", async () => {
    fixture.current.project.writeFiles([
      {
        relativePath: "src/domain/Models.ts",
        content: [
          `import { Base } from "./Base.js";`,
          ``,
          `export class Customer extends Base {}`,
          `export interface IOrder { readonly id: string; }`,
        ].join("\n"),
      },
      {
        relativePath: "src/domain/Base.ts",
        content: `export class Base {}`,
      },
    ]);

    const exitCode = await fixture.current.app.split({
      project: fixture.current.project.resolve("tsconfig.json"),
      rootDir: fixture.current.project.resolve("src/domain"),
      include: [],
      barrel: true,
      dryRun: false,
    });

    expect(exitCode).toBe(0);
    expect(fixture.current.project.exists("src/domain/Customer.ts")).toBe(true);
    expect(fixture.current.project.exists("src/domain/IOrder.ts")).toBe(true);

    const customerFile = fixture.current.project.read("src/domain/Customer.ts");
    const interfaceFile = fixture.current.project.read("src/domain/IOrder.ts");
    const barrel = fixture.current.project.read("src/domain/index.ts");

    expect(customerFile).toContain(`export class Customer extends Base {}`);
    expect(interfaceFile).toContain(`export interface IOrder { readonly id: string; }`);
    expect(barrel).toContain(`export * from "./Base.js";`);
    expect(barrel).toContain(`export * from "./Customer.js";`);
    expect(barrel).toContain(`export * from "./IOrder.js";`);
  });

  it("should rewrite named imports after move", async () => {
    fixture.current.project.writeFiles([
      {
        relativePath: "src/domain/Contracts.ts",
        content: [
          `export class Customer {}`,
          `export interface IOrder { readonly id: string; }`,
        ].join("\n"),
      },
      {
        relativePath: "src/app/UseCase.ts",
        content: [
          `import { Customer, IOrder } from "../domain/Contracts.js";`,
          ``,
          `export class UseCase {`,
          `  public execute(input: IOrder): Customer {`,
          `    return new Customer();`,
          `  }`,
          `}`,
        ].join("\n"),
      },
    ]);

    await fixture.current.app.split({
      project: fixture.current.project.resolve("tsconfig.json"),
      rootDir: fixture.current.project.resolve("src/domain"),
      include: [],
      barrel: false,
      dryRun: false,
    });

    const useCase = fixture.current.project.read("src/app/UseCase.ts");

    expect(useCase).toContain(`import { Customer } from "../domain/Customer.js";`);
    expect(useCase).toContain(`import { IOrder } from "../domain/IOrder.js";`);
    expect(useCase).not.toContain(`../domain/Contracts.js`);
  });

  it("should support dry-run without persisting split files", async () => {
    fixture.current.project.writeFiles([
      {
        relativePath: "src/domain/Models.ts",
        content: [
          `export class Customer {}`,
          `export interface IOrder { readonly id: string; }`,
        ].join("\n"),
      },
    ]);

    await fixture.current.app.split({
      project: fixture.current.project.resolve("tsconfig.json"),
      rootDir: fixture.current.project.resolve("src/domain"),
      include: [],
      barrel: false,
      dryRun: true,
    });

    expect(fixture.current.project.exists("src/domain/Customer.ts")).toBe(false);
    expect(fixture.current.project.exists("src/domain/IOrder.ts")).toBe(false);
    expect(fixture.current.project.exists("src/domain/Models.ts")).toBe(true);
  });
});