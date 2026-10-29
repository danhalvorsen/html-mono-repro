import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  Node,
  type ImportDeclarationStructure,
  Project,
  QuoteKind,
  SourceFile,
  StructureKind,
  SyntaxKind,
} from "ts-morph";
import {
  CliRunner,
  CliTypeRegistrar,
  CommandRegistry,
  createPayloadFactory,
  type CliInvocationContext,
  type CliOptionSchema,
  type ICommandClass,
} from "@monorepo/core-console-cli";

type DeclarationKind = "class" | "interface";

export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface DeclarationRecord {
  readonly name: string;
  readonly kind: DeclarationKind;
  readonly sourceFilePath: string;
  readonly isExported: boolean;
}

export interface DuplicateRecord {
  readonly name: string;
  readonly declarations: readonly DeclarationRecord[];
}

export interface MovedDeclarationRecord {
  readonly name: string;
  readonly kind: DeclarationKind;
  readonly sourceFilePath: string;
  readonly targetFilePath: string;
}

export interface IProjectLoader {
  load(tsConfigFilePath: string): Project;
}

export interface IDeclarationCatalog {
  collect(project: Project, include: readonly string[], rootDir: string): readonly DeclarationRecord[];
}

export interface IDuplicateDetector {
  detect(declarations: readonly DeclarationRecord[]): readonly DuplicateRecord[];
}

export interface IDeclarationMover {
  move(project: Project, options: SplitOperation): Promise<readonly MovedDeclarationRecord[]>;
}

export interface IImportRewriter {
  rewrite(project: Project, moved: readonly MovedDeclarationRecord[]): void;
}

export interface IBarrelGenerator {
  generate(project: Project, rootDir: string): void;
}

export interface SplitOperation {
  readonly rootDir: string;
  readonly include: readonly string[];
  readonly outDir?: string;
  readonly barrel: boolean;
  readonly dryRun: boolean;
}

export interface IScanPayload {
  readonly project: string;
  readonly rootDir: string;
  readonly include: readonly string[];
}

export interface ISplitPayload extends IScanPayload {
  readonly outDir?: string;
  readonly barrel: boolean;
  readonly dryRun: boolean;
}

const scanOptionSchema = {
  project: { type: "string", short: "p" },
  rootDir: { type: "string", short: "r" },
  include: { type: "string", multiple: true },
} as const satisfies CliOptionSchema;

const splitOptionSchema = {
  project: { type: "string", short: "p" },
  rootDir: { type: "string", short: "r" },
  include: { type: "string", multiple: true },
  outDir: { type: "string" },
  barrel: { type: "boolean" },
  dryRun: { type: "boolean" },
} as const satisfies CliOptionSchema;

export class ScanCommand implements IScanPayload {
  public static readonly cli: ICommandClass<ScanCommand>["cli"] = {
    name: "scan",
    type: "command",
    description: "Scan TypeScript declarations for duplicate class and interface names.",
    optionSchema: scanOptionSchema,
  };

  public constructor(
    public readonly project: string,
    public readonly rootDir: string,
    public readonly include: readonly string[],
  ) {}
}

export class SplitCommand implements ISplitPayload {
  public static readonly cli: ICommandClass<SplitCommand>["cli"] = {
    name: "split",
    type: "command",
    description: "Split source files so each class or interface is moved to its own file.",
    optionSchema: splitOptionSchema,
  };

  public constructor(
    public readonly project: string,
    public readonly rootDir: string,
    public readonly include: readonly string[],
    public readonly outDir: string | undefined,
    public readonly barrel: boolean,
    public readonly dryRun: boolean,
  ) {}
}

export class ConsoleLogger implements ILogger {
  public info(message: string): void {
    console.log(`[info] ${message}`);
  }

  public warn(message: string): void {
    console.warn(`[warn] ${message}`);
  }

  public error(message: string): void {
    console.error(`[error] ${message}`);
  }
}

export class TsMorphProjectLoader implements IProjectLoader {
  public load(tsConfigFilePath: string): Project {
    return new Project({
      tsConfigFilePath,
      skipAddingFilesFromTsConfig: false,
      manipulationSettings: {
        quoteKind: QuoteKind.Double,
        usePrefixAndSuffixTextForRename: false,
      },
    });
  }
}

export class TsMorphDeclarationCatalog implements IDeclarationCatalog {
  public collect(project: Project, include: readonly string[], rootDir: string): readonly DeclarationRecord[] {
    const files = this.getIncludedFiles(project, include, rootDir);
    const records: DeclarationRecord[] = [];

    for (const sourceFile of files) {
      for (const classDeclaration of sourceFile.getClasses()) {
        const name = classDeclaration.getName();
        if (!name) {
          continue;
        }

        records.push({
          name,
          kind: "class",
          sourceFilePath: sourceFile.getFilePath(),
          isExported: classDeclaration.isExported(),
        });
      }

      for (const interfaceDeclaration of sourceFile.getInterfaces()) {
        const name = interfaceDeclaration.getName();
        if (!name) {
          continue;
        }

        records.push({
          name,
          kind: "interface",
          sourceFilePath: sourceFile.getFilePath(),
          isExported: interfaceDeclaration.isExported(),
        });
      }
    }

    return records.sort((left, right) => {
      const byName = left.name.localeCompare(right.name);
      return byName !== 0 ? byName : left.sourceFilePath.localeCompare(right.sourceFilePath);
    });
  }

  private getIncludedFiles(project: Project, include: readonly string[], rootDir: string): readonly SourceFile[] {
    const normalizedRoot = path.resolve(rootDir);
    const sourceFiles = project.getSourceFiles().filter(file => !file.isDeclarationFile());

    if (include.length === 0) {
      return sourceFiles.filter(file => path.resolve(file.getDirectoryPath()).startsWith(normalizedRoot));
    }

    const normalizedInclude = include.map(item => path.resolve(rootDir, item));

    return sourceFiles.filter(file => {
      const filePath = path.resolve(file.getFilePath());
      return normalizedInclude.some(prefix => filePath.startsWith(prefix));
    });
  }
}

export class DuplicateDetector implements IDuplicateDetector {
  public detect(declarations: readonly DeclarationRecord[]): readonly DuplicateRecord[] {
    const declarationsByName = new Map<string, DeclarationRecord[]>();

    for (const declaration of declarations) {
      const list = declarationsByName.get(declaration.name) ?? [];
      list.push(declaration);
      declarationsByName.set(declaration.name, list);
    }

    return [...declarationsByName.entries()]
      .filter(([, values]) => values.length > 1)
      .map(([name, values]) => ({
        name,
        declarations: values.sort((left, right) => left.sourceFilePath.localeCompare(right.sourceFilePath)),
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }
}

export class TsMorphDeclarationMover implements IDeclarationMover {
  public async move(project: Project, options: SplitOperation): Promise<readonly MovedDeclarationRecord[]> {
    const files = project
      .getSourceFiles()
      .filter(file => !file.isDeclarationFile())
      .filter(file => this.isIncluded(file, options.rootDir, options.include));

    const moved: MovedDeclarationRecord[] = [];

    for (const sourceFile of files) {
      const declarations = [
        ...sourceFile.getClasses().map(node => ({ kind: "class" as const, node })),
        ...sourceFile.getInterfaces().map(node => ({ kind: "interface" as const, node })),
      ];

      if (declarations.length <= 1) {
        continue;
      }

      for (const entry of declarations) {
        const name = entry.node.getName();
        if (!name) {
          continue;
        }

        const targetDirectory = options.outDir
          ? path.resolve(options.rootDir, options.outDir)
          : sourceFile.getDirectoryPath();

        const targetFilePath = path.join(targetDirectory, `${name}.ts`);

        if (path.resolve(sourceFile.getFilePath()) === path.resolve(targetFilePath)) {
          continue;
        }

        const targetFile =
          project.getSourceFile(targetFilePath) ??
          project.createSourceFile(targetFilePath, "", { overwrite: false });

        this.copyReferencedImports(sourceFile, targetFile, entry.node);
        this.copyLeadingComments(entry.node, targetFile);
        targetFile.addStatements(entry.node.getText());
        entry.node.remove();

        moved.push({
          name,
          kind: entry.kind,
          sourceFilePath: sourceFile.getFilePath(),
          targetFilePath,
        });
      }

      this.cleanupSourceFile(sourceFile, options);
    }

    if (!options.dryRun) {
      await project.save();
    }

    return moved.sort((left, right) => left.targetFilePath.localeCompare(right.targetFilePath));
  }

  private isIncluded(sourceFile: SourceFile, rootDir: string, include: readonly string[]): boolean {
    const fullPath = path.resolve(sourceFile.getFilePath());

    if (include.length === 0) {
      return fullPath.startsWith(path.resolve(rootDir));
    }

    return include
      .map(item => path.resolve(rootDir, item))
      .some(prefix => fullPath.startsWith(prefix));
  }

  private copyReferencedImports(sourceFile: SourceFile, targetFile: SourceFile, declaration: Node): void {
    const usedNames = new Set<string>();

    declaration.forEachDescendant(descendant => {
      if (Node.isIdentifier(descendant)) {
        usedNames.add(descendant.getText());
      }
    });

    for (const importDeclaration of sourceFile.getImportDeclarations()) {
      const defaultImport = importDeclaration.getDefaultImport()?.getText();
      const namespaceImport = importDeclaration.getNamespaceImport()?.getText();

      const namedImports = importDeclaration.getNamedImports()
        .filter(item => {
          const alias = item.getAliasNode()?.getText();
          return usedNames.has(item.getName()) || (alias !== undefined && usedNames.has(alias));
        })
        .map(item => ({
          name: item.getName(),
          alias: item.getAliasNode()?.getText(),
        }));

      const usesDefault = defaultImport !== undefined && usedNames.has(defaultImport);
      const usesNamespace = namespaceImport !== undefined && usedNames.has(namespaceImport);

      if (!usesDefault && !usesNamespace && namedImports.length === 0) {
        continue;
      }

      const moduleSpecifier = this.toTargetModuleSpecifier(
        targetFile.getFilePath(),
        sourceFile.getFilePath(),
        importDeclaration.getModuleSpecifierValue(),
      );

      const structure: ImportDeclarationStructure = {
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier,
        defaultImport: usesDefault ? defaultImport : undefined,
        namespaceImport: usesNamespace ? namespaceImport : undefined,
        namedImports,
      };

      this.upsertImport(targetFile, structure);
    }
  }

  private toTargetModuleSpecifier(targetFilePath: string, sourceFilePath: string, currentSpecifier: string): string {
    if (!currentSpecifier.startsWith(".")) {
      return currentSpecifier;
    }

    const sourceDirectory = path.dirname(sourceFilePath);
    const targetDirectory = path.dirname(targetFilePath);
    const resolved = path.resolve(sourceDirectory, currentSpecifier);

    let relative = path.relative(targetDirectory, resolved).replace(/\\/g, "/");

    if (!relative.startsWith(".")) {
      relative = `./${relative}`;
    }

    return relative;
  }

  private upsertImport(targetFile: SourceFile, structure: ImportDeclarationStructure): void {
    const existing = targetFile
      .getImportDeclarations()
      .find(item => item.getModuleSpecifierValue() === structure.moduleSpecifier);

    if (!existing) {
      targetFile.addImportDeclaration(structure);
      return;
    }

    if (structure.defaultImport && !existing.getDefaultImport()) {
      existing.setDefaultImport(structure.defaultImport);
    }

    if (structure.namespaceImport && !existing.getNamespaceImport()) {
      existing.setNamespaceImport(structure.namespaceImport);
    }

    const existingNames = new Set(existing.getNamedImports().map(item => item.getName()));
    const namedImports = Array.isArray(structure.namedImports) ? structure.namedImports : [];

    for (const namedImport of namedImports) {
      const name = typeof namedImport === "string" ? namedImport : namedImport.name;
      if (!existingNames.has(name)) {
        existing.addNamedImport(namedImport);
      }
    }
  }

  private copyLeadingComments(node: Node, targetFile: SourceFile): void {
    for (const range of node.getLeadingCommentRanges()) {
      const text = range.getText();
      if (text.trim().length > 0) {
        targetFile.addStatements(text);
      }
    }
  }

  private cleanupSourceFile(sourceFile: SourceFile, options: SplitOperation): void {
    for (const importDeclaration of sourceFile.getImportDeclarations()) {
      const defaultImport = importDeclaration.getDefaultImport();
      const namespaceImport = importDeclaration.getNamespaceImport();
      const namedImports = importDeclaration.getNamedImports();

      const hasUsage =
        (defaultImport !== undefined && defaultImport.findReferencesAsNodes().length > 1) ||
        (namespaceImport !== undefined && namespaceImport.findReferencesAsNodes().length > 1) ||
        namedImports.some(item => {
          const aliasNode = item.getAliasNode();
          if (aliasNode !== undefined) {
            return aliasNode.findReferencesAsNodes().length > 1;
          }

          return item.getNameNode().asKindOrThrow(SyntaxKind.Identifier).findReferencesAsNodes().length > 1;
        });

      if (!hasUsage) {
        importDeclaration.remove();
      }
    }

    const isEmpty =
      sourceFile.getClasses().length === 0 &&
      sourceFile.getInterfaces().length === 0 &&
      sourceFile.getEnums().length === 0 &&
      sourceFile.getFunctions().length === 0 &&
      sourceFile.getTypeAliases().length === 0 &&
      sourceFile.getVariableStatements().length === 0;

    if (!isEmpty) {
      return;
    }

    if (options.dryRun) {
      return;
    }

    sourceFile.deleteImmediatelySync();
  }
}

export class TsMorphImportRewriter implements IImportRewriter {
  public rewrite(project: Project, moved: readonly MovedDeclarationRecord[]): void {
    if (moved.length === 0) {
      return;
    }

    const movesBySourceFile = new Map<string, MovedDeclarationRecord[]>();

    for (const move of moved) {
      const key = path.resolve(move.sourceFilePath);
      const list = movesBySourceFile.get(key) ?? [];
      list.push(move);
      movesBySourceFile.set(key, list);
    }

    for (const sourceFile of project.getSourceFiles().filter((file): boolean => !file.isDeclarationFile())) {
      for (const importDeclaration of [...sourceFile.getImportDeclarations()]) {
        const importedSourceFilePath = this.tryResolveImportedSourceFilePath(
          sourceFile.getFilePath(),
          importDeclaration.getModuleSpecifierValue(),
        );

        if (!importedSourceFilePath) {
          continue;
        }

        const candidateMoves = movesBySourceFile.get(importedSourceFilePath);
        if (!candidateMoves || candidateMoves.length === 0) {
          continue;
        }

        const movedNames: string[] = [];

        for (const namedImport of importDeclaration.getNamedImports()) {
          const move = candidateMoves.find(item => item.name === namedImport.getName());
          if (!move) {
            continue;
          }

          movedNames.push(move.name);
          const nextModuleSpecifier = this.toModuleSpecifier(sourceFile.getFilePath(), move.targetFilePath);
          this.addNamedImport(sourceFile, nextModuleSpecifier, move.name);
        }

        if (movedNames.length === 0) {
          continue;
        }

        for (const namedImport of [...importDeclaration.getNamedImports()]) {
          if (movedNames.includes(namedImport.getName())) {
            namedImport.remove();
          }
        }

        if (
          !importDeclaration.getDefaultImport() &&
          !importDeclaration.getNamespaceImport() &&
          importDeclaration.getNamedImports().length === 0
        ) {
          importDeclaration.remove();
        }
      }
    }
  }

  private tryResolveImportedSourceFilePath(
    importingFilePath: string,
    moduleSpecifier: string,
  ): string | undefined {
    if (!moduleSpecifier.startsWith(".")) {
      return undefined;
    }

    const importingDirectory = path.dirname(importingFilePath);
    const resolved = path.resolve(importingDirectory, moduleSpecifier);

    if (resolved.endsWith(".js")) {
      return path.resolve(`${resolved.slice(0, -3)}.ts`);
    }

    if (resolved.endsWith(".ts")) {
      return path.resolve(resolved);
    }

    return path.resolve(`${resolved}.ts`);
  }

  private addNamedImport(sourceFile: SourceFile, moduleSpecifier: string, importName: string): void {
    const existing = sourceFile
      .getImportDeclarations()
      .find(item => item.getModuleSpecifierValue() === moduleSpecifier);

    if (!existing) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: [importName],
      });
      return;
    }

    if (!existing.getNamedImports().some(item => item.getName() === importName)) {
      existing.addNamedImport(importName);
    }
  }

  private toModuleSpecifier(fromFilePath: string, toFilePath: string): string {
    let relative = path.relative(path.dirname(fromFilePath), toFilePath).replace(/\\/g, "/");
    relative = relative.replace(/\.ts$/i, ".js");

    if (!relative.startsWith(".")) {
      relative = `./${relative}`;
    }

    return relative;
  }
}

export class TsMorphBarrelGenerator implements IBarrelGenerator {
  public generate(project: Project, rootDir: string): void {
    const filesByDirectory = new Map<string, SourceFile[]>();
    const normalizedRootDir = path.resolve(rootDir);

    for (const sourceFile of project.getSourceFiles().filter(file => !file.isDeclarationFile())) {
      const filePath = path.resolve(sourceFile.getFilePath());
      if (!filePath.startsWith(normalizedRootDir)) {
        continue;
      }

      const directory = sourceFile.getDirectoryPath();
      const list = filesByDirectory.get(directory) ?? [];
      list.push(sourceFile);
      filesByDirectory.set(directory, list);
    }

    for (const [directory, files] of filesByDirectory.entries()) {
      const barrelPath = path.join(directory, "index.ts");
      const barrel =
        project.getSourceFile(barrelPath) ??
        project.createSourceFile(barrelPath, "", { overwrite: true });

      barrel.replaceWithText("");

      const entries = files
        .map(file => path.basename(file.getFilePath()))
        .filter(name => name !== "index.ts")
        .map(name => name.replace(/\.ts$/i, ""))
        .sort((left, right) => left.localeCompare(right));

      for (const entry of entries) {
        barrel.addExportDeclaration({
          moduleSpecifier: `./${entry}.js`,
        });
      }
    }
  }
}

export class RefactorApplication {
  public constructor(
    private readonly logger: ILogger,
    private readonly projectLoader: IProjectLoader,
    private readonly declarationCatalog: IDeclarationCatalog,
    private readonly duplicateDetector: IDuplicateDetector,
    private readonly declarationMover: IDeclarationMover,
    private readonly importRewriter: IImportRewriter,
    private readonly barrelGenerator: IBarrelGenerator,
  ) {}

  public async scan(payload: IScanPayload): Promise<number> {
    const project = this.projectLoader.load(payload.project);
    const declarations = this.declarationCatalog.collect(project, payload.include, payload.rootDir);
    const duplicates = this.duplicateDetector.detect(declarations);

    this.writeDuplicates(duplicates);
    return duplicates.length === 0 ? 0 : 2;
  }

  public async split(payload: ISplitPayload): Promise<number> {
    const project = this.projectLoader.load(payload.project);
    const declarations = this.declarationCatalog.collect(project, payload.include, payload.rootDir);
    const duplicates = this.duplicateDetector.detect(declarations);

    this.writeDuplicates(duplicates);

    const moved = await this.declarationMover.move(project, {
      rootDir: payload.rootDir,
      include: payload.include,
      outDir: payload.outDir,
      barrel: payload.barrel,
      dryRun: payload.dryRun,
    });

    this.importRewriter.rewrite(project, moved);

    if (payload.barrel) {
      this.barrelGenerator.generate(
        project,
        payload.outDir ? path.resolve(payload.rootDir, payload.outDir) : payload.rootDir,
      );
    }

    if (!payload.dryRun) {
      await project.save();
    }

    this.writeMoved(moved);

    return duplicates.length === 0 ? 0 : 2;
  }

  private writeDuplicates(duplicates: readonly DuplicateRecord[]): void {
    if (duplicates.length === 0) {
      this.logger.info("No duplicate declarations detected.");
      return;
    }

    this.logger.warn(`Detected ${duplicates.length} duplicate declaration groups.`);

    for (const duplicate of duplicates) {
      this.logger.warn(`Duplicate: ${duplicate.name}`);
      for (const declaration of duplicate.declarations) {
        this.logger.warn(`  - ${declaration.kind} ${declaration.sourceFilePath}`);
      }
    }
  }

  private writeMoved(moved: readonly MovedDeclarationRecord[]): void {
    if (moved.length === 0) {
      this.logger.info("No declarations moved.");
      return;
    }

    this.logger.info(`Moved ${moved.length} declarations.`);

    for (const move of moved) {
      this.logger.info(`${move.kind} ${move.name}: ${move.sourceFilePath} -> ${move.targetFilePath}`);
    }
  }
}

export interface IStringOptionReader {
  getRequired(invocation: CliInvocationContext, name: string): string;
  getOptional(invocation: CliInvocationContext, name: string): string | undefined;
  getMany(invocation: CliInvocationContext, name: string): readonly string[];
}

export interface IBooleanOptionReader {
  get(invocation: CliInvocationContext, name: string): boolean;
}

export class CliStringOptionReader implements IStringOptionReader {
  public getRequired(invocation: CliInvocationContext, name: string): string {
    const value = invocation.options[name];

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Missing required option --${name}`);
    }

    return value;
  }

  public getOptional(invocation: CliInvocationContext, name: string): string | undefined {
    const value = invocation.options[name];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  }

  public getMany(invocation: CliInvocationContext, name: string): readonly string[] {
    const value = invocation.options[name];

    if (value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map(item => String(item));
    }

    return [String(value)];
  }
}

export class CliBooleanOptionReader implements IBooleanOptionReader {
  public get(invocation: CliInvocationContext, name: string): boolean {
    return invocation.options[name] === true;
  }
}

export interface IMainApplication {
  run(args: readonly string[]): Promise<number>;
}

export class RefactorCliApplication implements IMainApplication {
  public constructor(
    private readonly registry: CommandRegistry,
    private readonly registrar: CliTypeRegistrar,
    private readonly refactorApplication: RefactorApplication,
    private readonly stringOptionReader: IStringOptionReader,
    private readonly booleanOptionReader: IBooleanOptionReader,
  ) {
    this.registerCommands();
  }

  public async run(args: readonly string[]): Promise<number> {
    const runner = new CliRunner(this.registry);
    const result = await runner.executeArgs([...args]);
    return typeof result.result === "number" ? result.result : 0;
  }

  private registerCommands(): void {
    this.registrar.registerCommand(
      ScanCommand,
      createPayloadFactory(invocation => new ScanCommand(
        this.stringOptionReader.getRequired(invocation, "project"),
        path.resolve(this.stringOptionReader.getRequired(invocation, "rootDir")),
        this.stringOptionReader.getMany(invocation, "include"),
      )),
      {
        handle: async command => this.refactorApplication.scan(command.payload),
      },
    );

    this.registrar.registerCommand(
      SplitCommand,
      createPayloadFactory(invocation => new SplitCommand(
        this.stringOptionReader.getRequired(invocation, "project"),
        path.resolve(this.stringOptionReader.getRequired(invocation, "rootDir")),
        this.stringOptionReader.getMany(invocation, "include"),
        this.stringOptionReader.getOptional(invocation, "outDir"),
        this.booleanOptionReader.get(invocation, "barrel"),
        this.booleanOptionReader.get(invocation, "dryRun"),
      )),
      {
        handle: async command => this.refactorApplication.split(command.payload),
      },
    );
  }
}

export interface IProcessContext {
  readonly args: readonly string[];
  readonly entryFilePath?: string;
  setExitCode(code: number): void;
}

export class NodeProcessContext implements IProcessContext {
  public get args(): readonly string[] {
    return process.argv.slice(2);
  }

  public get entryFilePath(): string | undefined {
    return process.argv[1];
  }

  public setExitCode(code: number): void {
    process.exitCode = code;
  }
}

export interface IErrorReporter {
  report(error: unknown): void;
}

export class ConsoleErrorReporter implements IErrorReporter {
  public report(error: unknown): void {
    console.error(error);
  }
}

export interface IEntryPointGuard {
  isDirectExecution(moduleUrl: string): boolean;
}

export class NodeEntryPointGuard implements IEntryPointGuard {
  public constructor(
    private readonly processContext: IProcessContext,
  ) {}

  public isDirectExecution(moduleUrl: string): boolean {
    const entryFilePath = this.processContext.entryFilePath;

    if (!entryFilePath) {
      return false;
    }

    return moduleUrl === pathToFileURL(entryFilePath).href;
  }
}

export class CliCompositionRoot {
  public createRefactorApplication(logger: ILogger = new ConsoleLogger()): RefactorApplication {
    return new RefactorApplication(
      logger,
      new TsMorphProjectLoader(),
      new TsMorphDeclarationCatalog(),
      new DuplicateDetector(),
      new TsMorphDeclarationMover(),
      new TsMorphImportRewriter(),
      new TsMorphBarrelGenerator(),
    );
  }

  public createCliApplication(logger: ILogger = new ConsoleLogger()): IMainApplication {
    const registry = new CommandRegistry();
    const registrar = new CliTypeRegistrar(registry);

    return new RefactorCliApplication(
      registry,
      registrar,
      this.createRefactorApplication(logger),
      new CliStringOptionReader(),
      new CliBooleanOptionReader(),
    );
  }
}

export class CliModuleBootstrapper {
  public constructor(
    private readonly moduleUrl: string,
    private readonly entryPointGuard: IEntryPointGuard,
    private readonly application: IMainApplication,
    private readonly processContext: IProcessContext,
    private readonly errorReporter: IErrorReporter,
  ) {}

  public async run(): Promise<void> {
    if (!this.entryPointGuard.isDirectExecution(this.moduleUrl)) {
      return;
    }

    try {
      const exitCode = await this.application.run(this.processContext.args);
      this.processContext.setExitCode(exitCode);
    } catch (error) {
      this.errorReporter.report(error);
      this.processContext.setExitCode(1);
    }
  }
}

export function createRefactorApplication(logger: ILogger = new ConsoleLogger()): RefactorApplication {
  return new CliCompositionRoot().createRefactorApplication(logger);
}

export function createCliApplication(logger: ILogger = new ConsoleLogger()): IMainApplication {
  return new CliCompositionRoot().createCliApplication(logger);
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<number> {
  const application = createCliApplication();
  return await application.run(args);
}

const processContext = new NodeProcessContext();

const bootstrapper = new CliModuleBootstrapper(
  import.meta.url,
  new NodeEntryPointGuard(processContext),
  createCliApplication(),
  processContext,
  new ConsoleErrorReporter(),
);

void bootstrapper.run();