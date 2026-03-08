#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { Project, SourceFile, Node, SyntaxKind, ImportDeclarationStructure, StructureKind } from "ts-morph";

type DeclarationKind = "class" | "interface";

type CliCommand =
  | {
      kind: "scan";
      project: string;
      rootDir: string;
      include: readonly string[];
    }
  | {
      kind: "split";
      project: string;
      rootDir: string;
      include: readonly string[];
      outDir?: string;
      barrel: boolean;
      dryRun: boolean;
    };

interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

interface DeclarationRecord {
  readonly name: string;
  readonly kind: DeclarationKind;
  readonly sourceFilePath: string;
  readonly isExported: boolean;
}

interface DuplicateRecord {
  readonly name: string;
  readonly declarations: readonly DeclarationRecord[];
}

interface MovedDeclarationRecord {
  readonly name: string;
  readonly kind: DeclarationKind;
  readonly sourceFilePath: string;
  readonly targetFilePath: string;
}

interface RefactorReport {
  readonly duplicates: readonly DuplicateRecord[];
  readonly moved: readonly MovedDeclarationRecord[];
}

interface IProjectLoader {
  load(tsConfigFilePath: string): Project;
}

interface IDeclarationCatalog {
  collect(project: Project, include: readonly string[], rootDir: string): readonly DeclarationRecord[];
}

interface IDuplicateDetector {
  detect(declarations: readonly DeclarationRecord[]): readonly DuplicateRecord[];
}

interface IDeclarationMover {
  move(project: Project, options: SplitOperation): Promise<readonly MovedDeclarationRecord[]>;
}

interface IImportRewriter {
  rewrite(project: Project, moved: readonly MovedDeclarationRecord[]): void;
}

interface IBarrelGenerator {
  generate(project: Project, rootDir: string): void;
}

interface SplitOperation {
  readonly rootDir: string;
  readonly include: readonly string[];
  readonly outDir?: string;
  readonly barrel: boolean;
  readonly dryRun: boolean;
}

class ConsoleLogger implements ILogger {
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

class NodeFileSystem implements IFileSystem {
  public async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async ensureDirectory(directoryPath: string): Promise<void> {
    await fs.mkdir(directoryPath, { recursive: true });
  }

  public async readDirectory(directoryPath: string): Promise<readonly string[]> {
    return await fs.readdir(directoryPath);
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    await this.ensureDirectory(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf8");
  }

  public normalize(filePath: string): string {
    return path.normalize(filePath);
  }

  public join(...parts: readonly string[]): string {
    return path.join(...parts);
  }

  public relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  public dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  public basename(filePath: string): string {
    return path.basename(filePath);
  }

  public basenameWithoutExtension(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }
}

class TsMorphProjectLoader implements IProjectLoader {
  public load(tsConfigFilePath: string): Project {
    return new Project({
      tsConfigFilePath,
      skipAddingFilesFromTsConfig: false,
      manipulationSettings: {
        quoteKind: '"',
        usePrefixAndSuffixTextForRename: false,
      },
    });
  }
}

class TsMorphDeclarationCatalog implements IDeclarationCatalog {
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

    return records.sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) {
        return byName;
      }

      return a.sourceFilePath.localeCompare(b.sourceFilePath);
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

class DuplicateDetector implements IDuplicateDetector {
  public detect(declarations: readonly DeclarationRecord[]): readonly DuplicateRecord[] {
    const byName = new Map<string, DeclarationRecord[]>();

    for (const declaration of declarations) {
      const list = byName.get(declaration.name) ?? [];
      list.push(declaration);
      byName.set(declaration.name, list);
    }

    return [...byName.entries()]
      .filter(([, values]) => values.length > 1)
      .map(([name, values]) => ({
        name,
        declarations: values.sort((a, b) => a.sourceFilePath.localeCompare(b.sourceFilePath)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

class TsMorphDeclarationMover implements IDeclarationMover {
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

        const targetFile = project.getSourceFile(targetFilePath) ?? project.createSourceFile(targetFilePath, "", { overwrite: false });
        this.copyReferencedImports(sourceFile, targetFile, entry.node);
        this.copyStatementLeadingTrivia(entry.node, targetFile);
        this.copyDeclaration(entry.kind, entry.node, targetFile);
        entry.node.remove();

        moved.push({
          name,
          kind: entry.kind,
          sourceFilePath: sourceFile.getFilePath(),
          targetFilePath,
        });
      }

      this.cleanupSourceFile(sourceFile);
    }

    if (!options.dryRun) {
      await project.save();
    }

    return moved.sort((a, b) => a.targetFilePath.localeCompare(b.targetFilePath));
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
      const namedImports = importDeclaration.getNamedImports();

      const usedNamedImports = namedImports
        .filter(item => usedNames.has(item.getName()) || (item.getAliasNode() ? usedNames.has(item.getAliasNode()!.getText()) : false))
        .map(item => ({ name: item.getName(), alias: item.getAliasNode()?.getText() }));

      const usesDefault = !!defaultImport && usedNames.has(defaultImport);
      const usesNamespace = !!namespaceImport && usedNames.has(namespaceImport);

      if (!usesDefault && !usesNamespace && usedNamedImports.length === 0 && !importDeclaration.isModuleSpecifierRelative()) {
        continue;
      }

      if (!usesDefault && !usesNamespace && usedNamedImports.length === 0) {
        continue;
      }

      const moduleSpecifier = this.getRelativeModuleSpecifier(targetFile.getFilePath(), sourceFile.getFilePath(), importDeclaration.getModuleSpecifierValue());
      const structure: ImportDeclarationStructure = {
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier,
        defaultImport: usesDefault ? defaultImport : undefined,
        namespaceImport: usesNamespace ? namespaceImport : undefined,
        namedImports: usedNamedImports,
      };

      this.upsertImport(targetFile, structure);
    }
  }

  private getRelativeModuleSpecifier(targetFilePath: string, sourceFilePath: string, existingModuleSpecifier: string): string {
    if (!existingModuleSpecifier.startsWith(".")) {
      return existingModuleSpecifier;
    }

    const sourceDirectory = path.dirname(sourceFilePath);
    const resolvedImportedPath = path.resolve(sourceDirectory, existingModuleSpecifier);
    const targetDirectory = path.dirname(targetFilePath);
    let relative = path.relative(targetDirectory, resolvedImportedPath).replace(/\\/g, "/");

    if (!relative.startsWith(".")) {
      relative = `./${relative}`;
    }

    return relative;
  }

  private upsertImport(targetFile: SourceFile, structure: ImportDeclarationStructure): void {
    const existing = targetFile.getImportDeclarations().find(item => item.getModuleSpecifierValue() === structure.moduleSpecifier);
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

    const existingNamed = new Set(existing.getNamedImports().map(item => item.getName()));
    for (const namedImport of structure.namedImports ?? []) {
      const name = typeof namedImport === "string" ? namedImport : namedImport.name;
      if (existingNamed.has(name)) {
        continue;
      }

      existing.addNamedImport(namedImport as any);
    }
  }

  private copyStatementLeadingTrivia(node: Node, targetFile: SourceFile): void {
    const ranges = node.getLeadingCommentRanges();
    for (const range of ranges) {
      const text = range.getText();
      if (text.trim().length > 0) {
        targetFile.addStatements(text);
      }
    }
  }

  private copyDeclaration(kind: DeclarationKind, node: Node, targetFile: SourceFile): void {
    const text = node.getText();
    if (kind === "class") {
      targetFile.addStatements(text);
      return;
    }

    if (kind === "interface") {
      targetFile.addStatements(text);
      return;
    }
  }

  private cleanupSourceFile(sourceFile: SourceFile): void {
    for (const importDeclaration of sourceFile.getImportDeclarations()) {
      const defaultImport = importDeclaration.getDefaultImport();
      const namespaceImport = importDeclaration.getNamespaceImport();
      const namedImports = importDeclaration.getNamedImports();

      const hasUsage =
        (defaultImport && defaultImport.findReferencesAsNodes().length > 1) ||
        (namespaceImport && namespaceImport.findReferencesAsNodes().length > 1) ||
        namedImports.some(item => item.findReferencesAsNodes().length > 1);

      if (!hasUsage) {
        importDeclaration.remove();
      }
    }

    if (
      sourceFile.getClasses().length === 0 &&
      sourceFile.getInterfaces().length === 0 &&
      sourceFile.getEnums().length === 0 &&
      sourceFile.getFunctions().length === 0 &&
      sourceFile.getTypeAliases().length === 0 &&
      sourceFile.getVariableStatements().length === 0
    ) {
      sourceFile.deleteImmediatelySync();
    }
  }
}

class TsMorphImportRewriter implements IImportRewriter {
  public rewrite(project: Project, moved: readonly MovedDeclarationRecord[]): void {
    if (moved.length === 0) {
      return;
    }

    const movedByName = new Map<string, MovedDeclarationRecord>();
    for (const move of moved) {
      movedByName.set(move.name, move);
    }

    for (const sourceFile of project.getSourceFiles().filter(file => !file.isDeclarationFile())) {
      for (const importDeclaration of sourceFile.getImportDeclarations()) {
        const moduleSpecifier = importDeclaration.getModuleSpecifierSourceFile();
        if (!moduleSpecifier) {
          continue;
        }

        const retainedNamedImports = [] as ReturnType<typeof importDeclaration.getNamedImports>;
        const movedNamedImports = [] as string[];

        for (const namedImport of importDeclaration.getNamedImports()) {
          const name = namedImport.getName();
          const move = movedByName.get(name);

          if (!move) {
            retainedNamedImports.push(namedImport);
            continue;
          }

          if (path.resolve(moduleSpecifier.getFilePath()) !== path.resolve(move.sourceFilePath)) {
            retainedNamedImports.push(namedImport);
            continue;
          }

          movedNamedImports.push(name);
        }

        if (movedNamedImports.length === 0) {
          continue;
        }

        for (const movedImportName of movedNamedImports) {
          const move = movedByName.get(movedImportName)!;
          const nextModuleSpecifier = this.toModuleSpecifier(sourceFile.getFilePath(), move.targetFilePath);
          this.addNamedImport(sourceFile, nextModuleSpecifier, movedImportName);
        }

        for (const namedImport of importDeclaration.getNamedImports()) {
          if (movedNamedImports.includes(namedImport.getName())) {
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

  private addNamedImport(sourceFile: SourceFile, moduleSpecifier: string, importName: string): void {
    const existing = sourceFile.getImportDeclarations().find(item => item.getModuleSpecifierValue() === moduleSpecifier);
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

class TsMorphBarrelGenerator implements IBarrelGenerator {
  public generate(project: Project, rootDir: string): void {
    const filesByDirectory = new Map<string, SourceFile[]>();

    for (const sourceFile of project.getSourceFiles().filter(file => !file.isDeclarationFile())) {
      const filePath = path.resolve(sourceFile.getFilePath());
      if (!filePath.startsWith(path.resolve(rootDir))) {
        continue;
      }

      const directory = sourceFile.getDirectoryPath();
      const list = filesByDirectory.get(directory) ?? [];
      list.push(sourceFile);
      filesByDirectory.set(directory, list);
    }

    for (const [directory, files] of filesByDirectory.entries()) {
      const barrelPath = path.join(directory, "index.ts");
      const barrel = project.getSourceFile(barrelPath) ?? project.createSourceFile(barrelPath, "", { overwrite: true });
      barrel.replaceWithText("");

      const entries = files
        .map(file => path.basename(file.getFilePath()))
        .filter(name => name !== "index.ts")
        .map(name => name.replace(/\.ts$/i, ""))
        .sort((a, b) => a.localeCompare(b));

      for (const entry of entries) {
        barrel.addExportDeclaration({ moduleSpecifier: `./${entry}.js` });
      }
    }
  }
}

class RefactorApplication {
  public constructor(
    private readonly logger: ILogger,
    private readonly projectLoader: IProjectLoader,
    private readonly declarationCatalog: IDeclarationCatalog,
    private readonly duplicateDetector: IDuplicateDetector,
    private readonly declarationMover: IDeclarationMover,
    private readonly importRewriter: IImportRewriter,
    private readonly barrelGenerator: IBarrelGenerator,
  ) {}

  public async execute(command: CliCommand): Promise<number> {
    const project = this.projectLoader.load(command.project);
    const declarations = this.declarationCatalog.collect(project, command.include, command.rootDir);
    const duplicates = this.duplicateDetector.detect(declarations);

    this.writeDuplicates(duplicates);

    if (command.kind === "scan") {
      return duplicates.length === 0 ? 0 : 2;
    }

    const moved = await this.declarationMover.move(project, {
      rootDir: command.rootDir,
      include: command.include,
      outDir: command.outDir,
      barrel: command.barrel,
      dryRun: command.dryRun,
    });

    this.importRewriter.rewrite(project, moved);

    if (command.barrel) {
      this.barrelGenerator.generate(project, command.outDir ? path.resolve(command.rootDir, command.outDir) : command.rootDir);
    }

    if (!command.dryRun) {
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

function parseCommand(argv: readonly string[]): CliCommand {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  const positional: string[] = [];

  for (let index = 0; index < argv.length; index++) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      positional.push(current);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags.add(current);
      continue;
    }

    values.set(current, next);
    index++;
  }

  const kind = (positional[0] ?? "scan") as "scan" | "split";
  const project = requireValue(values, "--project");
  const rootDir = path.resolve(requireValue(values, "--rootDir"));
  const include = splitCsv(values.get("--include"));

  if (kind === "scan") {
    return {
      kind,
      project,
      rootDir,
      include,
    };
  }

  return {
    kind,
    project,
    rootDir,
    include,
    outDir: values.get("--outDir"),
    barrel: flags.has("--barrel"),
    dryRun: flags.has("--dryRun"),
  };
}

function requireValue(values: ReadonlyMap<string, string>, key: string): string {
  const value = values.get(key);
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required argument ${key}.`);
  }

  return value;
}

function splitCsv(value: string | undefined): readonly string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

async function main(): Promise<number> {
  const command = parseCommand(process.argv.slice(2));

  const app = new RefactorApplication(
    new ConsoleLogger(),
    new TsMorphProjectLoader(),
    new TsMorphDeclarationCatalog(),
    new DuplicateDetector(),
    new TsMorphDeclarationMover(),
    new TsMorphImportRewriter(),
    new TsMorphBarrelGenerator(),
  );

  return await app.execute(command);
}

void main()
  .then(exitCode => {
    process.exitCode = exitCode;
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
