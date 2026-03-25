// packages/core-typescript-refactoring/src/code.ts

import type { ICommandBase } from "@monorepo/core-design-patterns-cqrs";
import {
  CliRunner,
  CliTypeRegistrar,
  CommandRegistry,
  type CliCommand,
  type CliCommandHandler,
  type CliInvocationContext,
  type CliOptionSchema,
  type ICommandClass,
  type IPayloadFactory,
} from "@monorepo/core-console-cli";

import ts from "typescript";

// ============================================================================
// Refactoring Contracts
// ============================================================================

export interface IDeclarationSplitRequest {
  readonly sourceFilePath: Path;
  readonly outputDirectoryPath: Path;
}

export interface IDeclarationSplitResultEntry {
  readonly declarationName: string;
  readonly filePath: Path;
}

export interface IDeclarationSplitResult {
  getEntries(): ReadonlyArray<IDeclarationSplitResultEntry>;
}

export interface ITypeScriptRefactoringOperation {
  split(request: IDeclarationSplitRequest): IDeclarationSplitResult;
}

export interface IDeclarationKindPolicy {
  shouldExtract(node: ts.Node): boolean;
}

export interface IDeclarationNodeInfo {
  readonly name: string;
  readonly node: ts.ClassDeclaration | ts.InterfaceDeclaration;
}

export interface IDeclarationNodeCollector {
  collect(sourceFile: ts.SourceFile): ReadonlyArray<IDeclarationNodeInfo>;
}

export interface IImportSectionExtractor {
  extract(sourceFile: ts.SourceFile): string;
}

export interface IDeclarationSourceRenderer {
  render(sourceFile: ts.SourceFile, declaration: IDeclarationNodeInfo): string;
}

export interface IDeclarationOutputPathFactory {
  create(outputDirectoryPath: Path, declarationName: string): Path;
}

export interface ITypeScriptSourceFileFactory {
  create(filePath: Path, content: string): ts.SourceFile;
}

// ============================================================================
// Refactoring Model
// ============================================================================

export class TypeScriptRefactoringError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "TypeScriptRefactoringError";
  }
}

export class DeclarationSplitRequest implements IDeclarationSplitRequest {
  public constructor(
    public readonly sourceFilePath: Path,
    public readonly outputDirectoryPath: Path,
  ) {}
}

export class DeclarationSplitResultEntry implements IDeclarationSplitResultEntry {
  public constructor(
    public readonly declarationName: string,
    public readonly filePath: Path,
  ) {}
}

export class DeclarationSplitResult implements IDeclarationSplitResult {
  private readonly entries: ReadonlyArray<IDeclarationSplitResultEntry>;

  public constructor(entries: ReadonlyArray<IDeclarationSplitResultEntry>) {
    this.entries = [...entries];
  }

  public getEntries(): ReadonlyArray<IDeclarationSplitResultEntry> {
    return this.entries;
  }
}

export class DeclarationNodeInfo implements IDeclarationNodeInfo {
  public constructor(
    public readonly name: string,
    public readonly node: ts.ClassDeclaration | ts.InterfaceDeclaration,
  ) {}
}

// ============================================================================
// Refactoring Implementation
// ============================================================================

export class ClassAndInterfaceDeclarationKindPolicy implements IDeclarationKindPolicy {
  public shouldExtract(node: ts.Node): boolean {
    return ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node);
  }
}

export class TypeScriptDeclarationNodeCollector implements IDeclarationNodeCollector {
  public constructor(
    private readonly declarationKindPolicy: IDeclarationKindPolicy,
  ) {}

  public collect(sourceFile: ts.SourceFile): ReadonlyArray<IDeclarationNodeInfo> {
    const declarations: DeclarationNodeInfo[] = [];
    const knownNames = new Set<string>();

    for (const statement of sourceFile.statements) {
      if (!this.declarationKindPolicy.shouldExtract(statement)) {
        continue;
      }

      if (ts.isClassDeclaration(statement)) {
        if (!statement.name) {
          throw new TypeScriptRefactoringError(
            "Anonymous class declarations are not supported.",
          );
        }

        this.ensureUniqueName(statement.name.text, knownNames);
        declarations.push(new DeclarationNodeInfo(statement.name.text, statement));
        continue;
      }

      if (ts.isInterfaceDeclaration(statement)) {
        this.ensureUniqueName(statement.name.text, knownNames);
        declarations.push(new DeclarationNodeInfo(statement.name.text, statement));
      }
    }

    return declarations;
  }

  private ensureUniqueName(name: string, knownNames: Set<string>): void {
    if (knownNames.has(name)) {
      throw new TypeScriptRefactoringError(
        `Duplicate top-level declaration name detected: '${name}'.`,
      );
    }

    knownNames.add(name);
  }
}

export class TypeScriptImportSectionExtractor implements IImportSectionExtractor {
  public extract(sourceFile: ts.SourceFile): string {
    const imports = sourceFile.statements.filter((statement) =>
      ts.isImportDeclaration(statement),
    );

    if (imports.length === 0) {
      return "";
    }

    const renderedImports = imports
      .map((importDeclaration) => importDeclaration.getText(sourceFile).trimEnd())
      .join("\n");

    return `${renderedImports}\n\n`;
  }
}

export class TypeScriptDeclarationSourceRenderer implements IDeclarationSourceRenderer {
  public constructor(
    private readonly importSectionExtractor: IImportSectionExtractor,
  ) {}

  public render(sourceFile: ts.SourceFile, declaration: IDeclarationNodeInfo): string {
    const importSection = this.importSectionExtractor.extract(sourceFile);
    const declarationSource = declaration.node.getText(sourceFile).trimEnd();

    return `${importSection}${declarationSource}\n`;
  }
}

export class DeclarationOutputPathFactory implements IDeclarationOutputPathFactory {
  public create(outputDirectoryPath: Path, declarationName: string): Path {
    return outputDirectoryPath.join(`${declarationName}.ts`);
  }
}

export class TypeScriptSourceFileFactory implements ITypeScriptSourceFileFactory {
  public create(filePath: Path, content: string): ts.SourceFile {
    return ts.createSourceFile(
      filePath.full,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
  }
}

export class TypeScriptDeclarationSplitOperation implements ITypeScriptRefactoringOperation {
  public constructor(
    private readonly fileSystemModule: CoreFileSystemModule,
    private readonly sourceFileFactory: ITypeScriptSourceFileFactory,
    private readonly declarationNodeCollector: IDeclarationNodeCollector,
    private readonly declarationSourceRenderer: IDeclarationSourceRenderer,
    private readonly declarationOutputPathFactory: IDeclarationOutputPathFactory,
  ) {}

  public split(request: IDeclarationSplitRequest): IDeclarationSplitResult {
    const sourceFile = this.fileSystemModule.createFile(request.sourceFilePath);
    const outputDirectory = this.fileSystemModule.createDirectory(request.outputDirectoryPath);

    if (!sourceFile.exists()) {
      throw new TypeScriptRefactoringError(
        `Source file does not exist: '${request.sourceFilePath.full}'.`,
      );
    }

    if (request.sourceFilePath.extension !== ".ts") {
      throw new TypeScriptRefactoringError(
        `Only '.ts' source files are supported. Actual extension: '${request.sourceFilePath.extension}'.`,
      );
    }

    if (!outputDirectory.exists()) {
      outputDirectory.create(true);
    }

    const content = sourceFile.read("utf-8");
    const parsedSourceFile = this.sourceFileFactory.create(request.sourceFilePath, content);
    const declarations = this.declarationNodeCollector.collect(parsedSourceFile);

    if (declarations.length === 0) {
      throw new TypeScriptRefactoringError(
        `No top-level class or interface declarations were found in '${request.sourceFilePath.full}'.`,
      );
    }

    const resultEntries: DeclarationSplitResultEntry[] = [];

    for (const declaration of declarations) {
      const outputPath = this.declarationOutputPathFactory.create(
        request.outputDirectoryPath,
        declaration.name,
      );

      const outputFile = this.fileSystemModule.createFile(outputPath);
      const outputContent = this.declarationSourceRenderer.render(
        parsedSourceFile,
        declaration,
      );

      outputFile.write(outputContent, "utf-8");
      resultEntries.push(new DeclarationSplitResultEntry(declaration.name, outputPath));
    }

    return new DeclarationSplitResult(resultEntries);
  }
}

// ============================================================================
// CLI Command Model
// ============================================================================

export class SplitDeclarationsCliCommandPayload implements ICommandBase {
  public static readonly cli = {
    name: "split-declarations",
    type: "command",
    description: "Split top-level TypeScript classes and interfaces into separate files.",
    aliases: ["split-ts"],
    optionSchema: {} satisfies CliOptionSchema,
  } as const;

  public constructor(
    public readonly sourceFilePath: string,
    public readonly outputDirectoryPath: string,
  ) {}
}

export class SplitDeclarationsCliCommandPayloadFactory
  implements IPayloadFactory<SplitDeclarationsCliCommandPayload> {
  public create(invocation: CliInvocationContext): SplitDeclarationsCliCommandPayload {
    const sourceFilePath = invocation.positionals[0];
    const outputDirectoryPath = invocation.positionals[1];

    if (!sourceFilePath || !outputDirectoryPath) {
      throw new TypeScriptRefactoringError(
        "Expected: split-declarations <source-file.ts> <output-directory>.",
      );
    }

    return new SplitDeclarationsCliCommandPayload(
      String(sourceFilePath),
      String(outputDirectoryPath),
    );
  }
}

export class SplitDeclarationsCliCommandHandler
  implements CliCommandHandler<SplitDeclarationsCliCommandPayload, IDeclarationSplitResult> {
  public constructor(
    private readonly operation: ITypeScriptRefactoringOperation,
  ) {}

  public handle(
    command: CliCommand<SplitDeclarationsCliCommandPayload>,
  ): IDeclarationSplitResult {
    const payload = command.payload;

    return this.operation.split(
      new DeclarationSplitRequest(
        new Path(payload.sourceFilePath),
        new Path(payload.outputDirectoryPath),
      ),
    );
  }
}

// ============================================================================
// CLI Output
// ============================================================================

export interface ICliResultWriter {
  write(result: IDeclarationSplitResult): void;
}

export class ConsoleDeclarationSplitResultWriter implements ICliResultWriter {
  public write(result: IDeclarationSplitResult): void {
    for (const entry of result.getEntries()) {
      console.log(`${entry.declarationName} -> ${entry.filePath.full}`);
    }
  }
}

// ============================================================================
// Composition Root
// ============================================================================

export class CoreTypeScriptRefactoringModule {
  private readonly fileSystemModule: CoreFileSystemModule;

  public constructor(fileSystemModule?: CoreFileSystemModule) {
    this.fileSystemModule = fileSystemModule ?? new CoreFileSystemModule();
  }

  public createDeclarationSplitOperation(): ITypeScriptRefactoringOperation {
    const declarationKindPolicy = new ClassAndInterfaceDeclarationKindPolicy();
    const declarationNodeCollector = new TypeScriptDeclarationNodeCollector(
      declarationKindPolicy,
    );
    const importSectionExtractor = new TypeScriptImportSectionExtractor();
    const declarationSourceRenderer = new TypeScriptDeclarationSourceRenderer(
      importSectionExtractor,
    );
    const declarationOutputPathFactory = new DeclarationOutputPathFactory();
    const sourceFileFactory = new TypeScriptSourceFileFactory();

    return new TypeScriptDeclarationSplitOperation(
      this.fileSystemModule,
      sourceFileFactory,
      declarationNodeCollector,
      declarationSourceRenderer,
      declarationOutputPathFactory,
    );
  }
}

export class TypeScriptRefactoringCliCompositionRoot {
  private readonly registry: CommandRegistry;
  private readonly registrar: CliTypeRegistrar;
  private readonly refactoringModule: CoreTypeScriptRefactoringModule;
  private readonly resultWriter: ICliResultWriter;

  public constructor() {
    this.registry = new CommandRegistry();
    this.registrar = new CliTypeRegistrar(this.registry);
    this.refactoringModule = new CoreTypeScriptRefactoringModule();
    this.resultWriter = new ConsoleDeclarationSplitResultWriter();
  }

  public composeRunner(): CliRunner {
    const operation = this.refactoringModule.createDeclarationSplitOperation();
    const payloadFactory = new SplitDeclarationsCliCommandPayloadFactory();
    const handler = new SplitDeclarationsCliCommandHandler(operation);

    this.registrar.registerCommand(
      SplitDeclarationsCliCommandPayload as ICommandClass<SplitDeclarationsCliCommandPayload>,
      payloadFactory,
      handler,
    );

    return new CliRunner(this.registry);
  }

  public getResultWriter(): ICliResultWriter {
    return this.resultWriter;
  }
}

// ============================================================================
// Application
// ============================================================================

export class TypeScriptRefactoringCliApplication {
  public constructor(
    private readonly runner: CliRunner,
    private readonly resultWriter: ICliResultWriter,
  ) {}

  public async run(argv: readonly string[]): Promise<void> {
    const executionResult = await this.runner.executeArgs([...argv]);
    const result = executionResult.result as IDeclarationSplitResult;
    this.resultWriter.write(result);
  }
}