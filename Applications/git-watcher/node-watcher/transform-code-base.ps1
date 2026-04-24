# refactor-node-watcher.ps1
# First-pass automated extraction of src/index.ts into:
# - contracts
# - domain
# - infrastructure
# - features
# - composition
#
# Safe behavior:
# - creates backups
# - idempotent writes
# - preserves current monolith as src/index.legacy.ts
# - keeps runtime entrypoint in src/index.ts
#
# Usage:
#   .\refactor-node-watcher.ps1
#   .\refactor-node-watcher.ps1 -ProjectRoot "C:\repo\Applications\git-watcher\node-watcher"
#   .\refactor-node-watcher.ps1 -ProjectRoot . -Force

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectRoot = ".",

    [Parameter(Mandatory = $false)]
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)
    return [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Path).Path)
}

function Ensure-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-FileIfChanged {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $directory = Split-Path -Parent $Path
    Ensure-Directory -Path $directory

    $normalizedContent = $Content -replace "`r?`n", "`r`n"

    if (Test-Path -LiteralPath $Path) {
        $existing = [System.IO.File]::ReadAllText($Path)
        if ($existing -eq $normalizedContent) {
            Write-Host "UNCHANGED $Path"
            return
        }
    }

    [System.IO.File]::WriteAllText($Path, $normalizedContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "WROTE     $Path"
}

function Backup-File {
    param(
        [Parameter(Mandatory = $true)][string]$SourceFile,
        [Parameter(Mandatory = $true)][string]$BackupRoot
    )

    if (-not (Test-Path -LiteralPath $SourceFile)) {
        return
    }

    Ensure-Directory -Path $BackupRoot

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $fileName = Split-Path -Leaf $SourceFile
    $backupFile = Join-Path $BackupRoot "$fileName.$timestamp.bak"

    Copy-Item -LiteralPath $SourceFile -Destination $backupFile -Force
    Write-Host "BACKUP    $SourceFile -> $backupFile"
}

function Copy-FileIfMissing {
    param(
        [Parameter(Mandatory = $true)][string]$SourceFile,
        [Parameter(Mandatory = $true)][string]$DestinationFile
    )

    if (-not (Test-Path -LiteralPath $SourceFile)) {
        return
    }

    if (Test-Path -LiteralPath $DestinationFile) {
        Write-Host "EXISTS    $DestinationFile"
        return
    }

    $directory = Split-Path -Parent $DestinationFile
    Ensure-Directory -Path $directory
    Copy-Item -LiteralPath $SourceFile -Destination $DestinationFile -Force
    Write-Host "COPIED    $SourceFile -> $DestinationFile"
}

function Assert-FileExists {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Required file was not found: $Path"
    }
}

$projectRootResolved = [System.IO.Path]::GetFullPath($ProjectRoot)
$srcRoot = Join-Path $projectRootResolved "src"
$backupRoot = Join-Path $projectRootResolved ".refactor-backup"

Assert-FileExists -Path $srcRoot
Assert-FileExists -Path (Join-Path $srcRoot "index.ts")

if (-not $Force.IsPresent) {
    Write-Host "ProjectRoot : $projectRootResolved"
    Write-Host "This script will:"
    Write-Host " - backup src/index.ts"
    Write-Host " - preserve monolith as src/index.legacy.ts"
    Write-Host " - write new contracts/domain/infrastructure/features/composition files"
    Write-Host " - replace src/index.ts with a barrel + CLI entrypoint"
    Write-Host ""
    Write-Host "Re-run with -Force to apply." -ForegroundColor Yellow
    exit 0
}

Backup-File -SourceFile (Join-Path $srcRoot "index.ts") -BackupRoot $backupRoot
Copy-FileIfMissing -SourceFile (Join-Path $srcRoot "index.ts") -DestinationFile (Join-Path $srcRoot "index.legacy.ts")

$files = @{}

$files["src/contracts/logging/ILogger.ts"] = @'
export interface ILogger {
  info(template: string, params?: Record<string, unknown>): void;
  warn(template: string, params?: Record<string, unknown>): void;
  error(template: string, params?: Record<string, unknown>): void;
  debug(template: string, params?: Record<string, unknown>): void;
}
'@

$files["src/contracts/time/IClock.ts"] = @'
export interface IClock {
  nowIsoUtc(): string;
}
'@

$files["src/contracts/io/IFileSystem.ts"] = @'
import type { FSWatcher } from "node:fs";

export interface IFileSystemEntry {
  readonly absolutePath: string;
  readonly isDirectory: boolean;
}

export interface IFileSystem {
  readUtf8File(filePath: string): Promise<string>;
  writeUtf8File(filePath: string, content: string): Promise<void>;
  pathExists(targetPath: string): Promise<boolean>;
  getEntry(targetPath: string): Promise<IFileSystemEntry | null>;
  readDirectory(directoryPath: string): Promise<readonly IFileSystemEntry[]>;
  createWatcher(
    directoryPath: string,
    onEvent: (eventType: string, fileName: string | null) => void,
    onError: (error: unknown) => void,
  ): FSWatcher;
}
'@

$files["src/contracts/io/IPathService.ts"] = @'
export interface IPathService {
  resolve(...segments: readonly string[]): string;
  dirname(value: string): string;
  basename(value: string): string;
  relative(from: string, to: string): string;
  normalize(value: string): string;
  join(...segments: readonly string[]): string;
}
'@

$files["src/contracts/watcher/GitWatchdogOptions.ts"] = @'
export interface GitWatchdogOptions {
  readonly repositoryPath: string;
  readonly includeObjectDirectories?: boolean;
  readonly ignoredRelativePaths?: readonly string[];
  readonly graphOutputJsonPath?: string;
}
'@

$files["src/contracts/watcher/IGitWatchdog.ts"] = @'
export interface IGitWatchdog {
  start(): Promise<void>;
  stop(): Promise<void>;
}
'@

$files["src/contracts/watcher/IGitWatchdogFactory.ts"] = @'
import type { GitWatchdogOptions } from "./GitWatchdogOptions.js";
import type { IGitWatchdog } from "./IGitWatchdog.js";

export interface IGitWatchdogFactory {
  create(options: GitWatchdogOptions): IGitWatchdog;
}
'@

$files["src/contracts/cli/CliTypes.ts"] = @'
export interface CliOptions {
  readonly repositoryPath: string;
  readonly includeObjectDirectories: boolean;
  readonly ignoredRelativePaths: readonly string[];
  readonly graphOutputJsonPath: string;
  readonly showHelp: boolean;
  readonly configPath: string;
  readonly hasExplicitRepositoryPath: boolean;
  readonly hasExplicitIncludeObjects: boolean;
  readonly hasExplicitIgnores: boolean;
  readonly hasExplicitGraphOutputJsonPath: boolean;
}

export interface WatcherConfigFile {
  readonly gitPath?: string;
  readonly repositoryPath?: string;
  readonly includeObjectDirectories?: boolean;
  readonly ignoredRelativePaths?: readonly string[];
  readonly graphOutputJsonPath?: string;
}

export interface CliOptionDefinition {
  readonly type: "string" | "boolean" | "number";
  readonly short?: string;
  readonly multiple?: boolean;
}

export type CliOptionSchema = Record<string, CliOptionDefinition>;

export interface CliParseResult {
  readonly options: Record<string, unknown>;
  readonly positionals: string[];
}

export interface CliParserLike {
  parseOptions(args: string[], schema: CliOptionSchema): CliParseResult;
}
'@

$files["src/contracts/cli/IWatcherCliOptionsParser.ts"] = @'
import type { CliOptions } from "./CliTypes.js";

export interface IWatcherCliOptionsParser {
  parse(argumentsVector: readonly string[]): CliOptions;
}
'@

$files["src/contracts/cli/IWatcherConfigLoader.ts"] = @'
import type { WatcherConfigFile } from "./CliTypes.js";

export interface IWatcherConfigLoader {
  load(configPath: string): Promise<WatcherConfigFile | null>;
}
'@

$files["src/contracts/cli/IGraphOutputPathResolver.ts"] = @'
export interface IGraphOutputPathResolver {
  resolve(templateOrPath: string): string;
}
'@

$files["src/contracts/cli/ICliUsageTextProvider.ts"] = @'
export interface ICliUsageTextProvider {
  getUsageText(): string;
}
'@

$files["src/contracts/cli/IWatchdogRuntime.ts"] = @'
export interface IWatchdogRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
}
'@

$files["src/contracts/cli/WatchdogRuntimeOptions.ts"] = @'
export interface WatchdogRuntimeOptions {
  readonly repositoryPath: string;
  readonly includeObjectDirectories: boolean;
  readonly ignoredRelativePaths: readonly string[];
  readonly graphOutputJsonPath: string;
}
'@

$files["src/contracts/cli/IWatchdogRuntimeFactory.ts"] = @'
import type { IWatchdogRuntime } from "./IWatchdogRuntime.js";
import type { WatchdogRuntimeOptions } from "./WatchdogRuntimeOptions.js";

export interface IWatchdogRuntimeFactory {
  create(options: WatchdogRuntimeOptions): IWatchdogRuntime;
}
'@

$files["src/contracts/cli/index.ts"] = @'
export type {
  CliOptions,
  WatcherConfigFile,
  CliOptionDefinition,
  CliOptionSchema,
  CliParseResult,
  CliParserLike,
} from "./CliTypes.js";
export type { IWatcherCliOptionsParser } from "./IWatcherCliOptionsParser.js";
export type { IWatcherConfigLoader } from "./IWatcherConfigLoader.js";
export type { IGraphOutputPathResolver } from "./IGraphOutputPathResolver.js";
export type { ICliUsageTextProvider } from "./ICliUsageTextProvider.js";
export type { IWatchdogRuntime } from "./IWatchdogRuntime.js";
export type { WatchdogRuntimeOptions } from "./WatchdogRuntimeOptions.js";
export type { IWatchdogRuntimeFactory } from "./IWatchdogRuntimeFactory.js";
'@

$files["src/contracts/watcher/index.ts"] = @'
export type { GitWatchdogOptions } from "./GitWatchdogOptions.js";
export type { IGitWatchdog } from "./IGitWatchdog.js";
export type { IGitWatchdogFactory } from "./IGitWatchdogFactory.js";
'@

$files["src/domain/git/GitFileChangeKind.ts"] = @'
export const GitFileChangeKinds = {
  Created: "created",
  Changed: "changed",
  Deleted: "deleted",
  Unknown: "unknown",
} as const;

export type GitFileChangeKind =
  (typeof GitFileChangeKinds)[keyof typeof GitFileChangeKinds];
'@

$files["src/domain/git/GitSemanticEventKind.ts"] = @'
export const GitSemanticEventKinds = {
  HeadChanged: "head_changed",
  IndexUpdated: "index_updated",
  BranchRefMoved: "branch_ref_moved",
  TagRefMoved: "tag_ref_moved",
  ObjectStored: "object_stored",
  HeadReflogUpdated: "head_reflog_updated",
  BranchReflogUpdated: "branch_reflog_updated",
  Other: "other",
} as const;

export type GitSemanticEventKind =
  (typeof GitSemanticEventKinds)[keyof typeof GitSemanticEventKinds];
'@

$files["src/domain/git/GitFileChange.ts"] = @'
import type { GitFileChangeKind } from "./GitFileChangeKind.js";

export interface GitFileChange {
  readonly timestampUtc: string;
  readonly gitDirectoryPath: string;
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly kind: GitFileChangeKind;
  readonly watcherEventType: string;
}
'@

$files["src/domain/git/GitSemanticEvent.ts"] = @'
import type { GitSemanticEventKind } from "./GitSemanticEventKind.js";

export interface GitSemanticEvent {
  readonly timestampUtc: string;
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly kind: GitSemanticEventKind;
  readonly description: string;
}
'@

$files["src/domain/git/GitPath.ts"] = @'
export class GitPath {
  public static readonly Head = "HEAD";
  public static readonly Index = "index";
  public static readonly CommitEditMessage = "COMMIT_EDITMSG";
  public static readonly MergeMessage = "MERGE_MSG";
  public static readonly SquashMessage = "SQUASH_MSG";
  public static readonly LogsHead = "logs/HEAD";
  public static readonly RefsHeadsPrefix = "refs/heads/";
  public static readonly RefsTagsPrefix = "refs/tags/";
  public static readonly LogsRefsHeadsPrefix = "logs/refs/heads/";
  public static readonly ObjectsPrefix = "objects/";
  public static readonly LockSuffix = ".lock";

  private constructor() {}
}
'@

$files["src/domain/git/TransientGitPathPolicy.ts"] = @'
import { GitPath } from "./GitPath.js";

export interface ITransientGitPathPolicy {
  isTransient(relativePath: string): boolean;
}

export class TransientGitPathPolicy implements ITransientGitPathPolicy {
  public isTransient(relativePath: string): boolean {
    if (relativePath.endsWith(GitPath.LockSuffix)) {
      return true;
    }

    return (
      relativePath === GitPath.CommitEditMessage ||
      relativePath === GitPath.MergeMessage ||
      relativePath === GitPath.SquashMessage
    );
  }
}
'@

$files["src/domain/git/index.ts"] = @'
export { GitFileChangeKinds, type GitFileChangeKind } from "./GitFileChangeKind.js";
export type { GitFileChange } from "./GitFileChange.js";
export { GitSemanticEventKinds, type GitSemanticEventKind } from "./GitSemanticEventKind.js";
export type { GitSemanticEvent } from "./GitSemanticEvent.js";
export { GitPath } from "./GitPath.js";
export {
  TransientGitPathPolicy,
  type ITransientGitPathPolicy,
} from "./TransientGitPathPolicy.js";
'@

$files["src/infrastructure/time/SystemClock.ts"] = @'
import type { IClock } from "../../contracts/time/IClock.js";

export class SystemClock implements IClock {
  public nowIsoUtc(): string {
    return new Date().toISOString();
  }
}
'@

$files["src/infrastructure/logging/CoreLoggerAdapter.ts"] = @'
import { DevLogger } from "@monorepo/core-logger-nodejs";
import type { ILogger } from "../../contracts/logging/ILogger.js";

export class CoreLoggerAdapter implements ILogger {
  private readonly logger = new DevLogger("git-watcher");

  public info(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.info(template);
      return;
    }

    this.logger.info(template, params);
  }

  public warn(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.warn(template);
      return;
    }

    this.logger.warn(template, params);
  }

  public error(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.error(template);
      return;
    }

    this.logger.error(template, params);
  }

  public debug(template: string, params?: Record<string, unknown>): void {
    if (params === undefined) {
      this.logger.debug(template);
      return;
    }

    this.logger.debug(template, params);
  }
}
'@

$files["src/infrastructure/io/NodePathService.ts"] = @'
import * as path from "node:path";
import type { IPathService } from "../../contracts/io/IPathService.js";

export class NodePathService implements IPathService {
  public resolve(...segments: readonly string[]): string {
    return path.resolve(...segments);
  }

  public dirname(value: string): string {
    return path.dirname(value);
  }

  public basename(value: string): string {
    return path.basename(value);
  }

  public relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  public normalize(value: string): string {
    return path.normalize(value);
  }

  public join(...segments: readonly string[]): string {
    return path.join(...segments);
  }
}
'@

$files["src/infrastructure/io/NodeFileSystem.ts"] = @'
import { watch, type FSWatcher, promises as fs } from "node:fs";
import * as path from "node:path";
import {
  NodeFileSystem as CoreNodeFileSystem,
} from "@monorepo/core-filesystem";
import type {
  IFileSystem,
  IFileSystemEntry,
} from "../../contracts/io/IFileSystem.js";

export class NodeFileSystem implements IFileSystem {
  public constructor(
    private readonly fileSystem: CoreNodeFileSystem = new CoreNodeFileSystem(),
  ) {}

  public async readUtf8File(filePath: string): Promise<string> {
    return this.fileSystem.readFile(filePath, "utf8");
  }

  public async writeUtf8File(filePath: string, content: string): Promise<void> {
    this.fileSystem.writeFile(filePath, content, "utf8");
  }

  public async pathExists(targetPath: string): Promise<boolean> {
    return this.fileSystem.exists(targetPath);
  }

  public async getEntry(targetPath: string): Promise<IFileSystemEntry | null> {
    if (!this.fileSystem.exists(targetPath)) {
      return null;
    }

    try {
      this.fileSystem.readdir(targetPath);
      return { absolutePath: targetPath, isDirectory: true };
    } catch {
      try {
        await fs.access(targetPath);
        return { absolutePath: targetPath, isDirectory: false };
      } catch {
        return null;
      }
    }
  }

  public async readDirectory(directoryPath: string): Promise<readonly IFileSystemEntry[]> {
    const entries = this.fileSystem.readdir(directoryPath);

    return entries.map((entry) => ({
      absolutePath: path.join(directoryPath, entry.name),
      isDirectory: entry.isDirectory,
    }));
  }

  public createWatcher(
    directoryPath: string,
    onEvent: (eventType: string, fileName: string | null) => void,
    onError: (error: unknown) => void,
  ): FSWatcher {
    const watcher = watch(directoryPath, { persistent: true }, (eventType, fileName) => {
      onEvent(eventType, fileName?.toString() ?? null);
    });

    watcher.on("error", onError);
    return watcher;
  }
}
'@

$files["src/infrastructure/cli/FallbackCliParser.ts"] = @'
import { parseArgs } from "node:util";
import type {
  CliOptionSchema,
  CliParseResult,
  CliParserLike,
} from "../../contracts/cli/CliTypes.js";

export class FallbackCliParser implements CliParserLike {
  public parseOptions(args: string[], schema: CliOptionSchema): CliParseResult {
    const options: Record<string, {
      type: "string" | "boolean";
      multiple: boolean;
      short?: string;
    }> = {};

    for (const [name, definition] of Object.entries(schema)) {
      options[name] = {
        type: definition.type === "number" ? "string" : definition.type,
        multiple: definition.multiple ?? false,
        ...(definition.short !== undefined ? { short: definition.short } : {}),
      };
    }

    const parsed = parseArgs({
      args,
      options,
      strict: false,
      allowPositionals: true,
    });

    const values: Record<string, unknown> = { ...parsed.values };

    for (const [name, definition] of Object.entries(schema)) {
      if (definition.type !== "number") {
        continue;
      }

      const current = values[name];

      if (current === undefined) {
        continue;
      }

      values[name] = Array.isArray(current)
        ? current.map((entry) => Number(entry))
        : Number(current);
    }

    return {
      options: values,
      positionals: parsed.positionals,
    };
  }
}
'@

$files["src/infrastructure/cli/CliParserFactory.ts"] = @'
import { createRequire } from "node:module";
import type { CliParserLike } from "../../contracts/cli/CliTypes.js";
import { FallbackCliParser } from "./FallbackCliParser.js";

export class CliParserFactory {
  public create(): CliParserLike {
    const require = createRequire(import.meta.url);

    try {
      const coreConsoleCli = require("../../../../packages/core-console-cli/dist/code.js") as {
        CliParser: new () => CliParserLike;
      };

      return new coreConsoleCli.CliParser();
    } catch {
      return new FallbackCliParser();
    }
  }
}
'@

$files["src/infrastructure/cli/WatcherConfigLoader.ts"] = @'
import { promises as fs } from "node:fs";
import type { IWatcherConfigLoader } from "../../contracts/cli/IWatcherConfigLoader.js";
import type { WatcherConfigFile } from "../../contracts/cli/CliTypes.js";

export class WatcherConfigLoader implements IWatcherConfigLoader {
  public async load(configPath: string): Promise<WatcherConfigFile | null> {
    try {
      const content = await fs.readFile(configPath, "utf8");
      const parsed = JSON.parse(content) as unknown;

      if (parsed === null || typeof parsed !== "object") {
        throw new Error("Config root must be an object.");
      }

      return parsed as WatcherConfigFile;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }
}
'@

$files["src/infrastructure/cli/GraphOutputPathResolver.ts"] = @'
import type { IGraphOutputPathResolver } from "../../contracts/cli/IGraphOutputPathResolver.js";

export class GraphOutputPathResolver implements IGraphOutputPathResolver {
  public resolve(templateOrPath: string): string {
    const timestamp = this.createTimestampForFileName(new Date());
    return templateOrPath.replaceAll("{timestamp}", timestamp);
  }

  private createTimestampForFileName(clock: Date): string {
    const year = String(clock.getFullYear());
    const month = String(clock.getMonth() + 1).padStart(2, "0");
    const day = String(clock.getDate()).padStart(2, "0");
    const hour = String(clock.getHours()).padStart(2, "0");
    const minute = String(clock.getMinutes()).padStart(2, "0");
    const second = String(clock.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}-${hour}${minute}${second}`;
  }
}
'@

$files["src/features/cli/WatcherCliUsageTextProvider.ts"] = @'
import type { ICliUsageTextProvider } from "../../contracts/cli/ICliUsageTextProvider.js";

export class WatcherCliUsageTextProvider implements ICliUsageTextProvider {
  public getUsageText(): string {
    return [
      "Usage: node-watcher [repository-path] [options]",
      "",
      "Options:",
      "  --repo <path>         Repository path to inspect (overrides positional path)",
      "  --config <path>       Path to JSON config file (default: watcher.config.json)",
      "  --include-objects     Include .git/objects directories",
      "  --ignore <path>       Ignore relative path under the resolved .git dir (repeatable)",
      "  --graph-json <path>   Graph JSON output path (default: git-history-graph.json)",
      "  -h, --help            Show this help",
    ].join("\n");
  }
}
'@

$files["src/features/cli/WatcherCliOptionsParser.ts"] = @'
import { CliParserFactory } from "../../infrastructure/cli/CliParserFactory.js";
import type {
  CliOptionSchema,
  CliOptions,
} from "../../contracts/cli/CliTypes.js";
import type { IWatcherCliOptionsParser } from "../../contracts/cli/IWatcherCliOptionsParser.js";

export class WatcherCliOptionsParser implements IWatcherCliOptionsParser {
  private readonly optionSchema: CliOptionSchema = {
    help: { type: "boolean", short: "h" },
    repo: { type: "string" },
    config: { type: "string" },
    "include-objects": { type: "boolean" },
    ignore: { type: "string", multiple: true },
    "graph-json": { type: "string" },
  };

  public constructor(
    private readonly cliParserFactory: CliParserFactory = new CliParserFactory(),
  ) {}

  public parse(argumentsVector: readonly string[]): CliOptions {
    this.assertOptionHasValue(argumentsVector, "--repo");
    this.assertOptionHasValue(argumentsVector, "--ignore");
    this.assertOptionHasValue(argumentsVector, "--config");
    this.assertOptionHasValue(argumentsVector, "--graph-json");

    const parsed = this.cliParserFactory
      .create()
      .parseOptions([...argumentsVector], this.optionSchema);

    let repositoryPath: string | null = null;
    let hasExplicitRepositoryPath = false;

    for (let index = 0; index < argumentsVector.length; index += 1) {
      const current = argumentsVector[index];

      if (current === undefined) {
        continue;
      }

      if (current === "--repo") {
        repositoryPath = argumentsVector[index + 1] ?? null;
        hasExplicitRepositoryPath = true;
        index += 1;
        continue;
      }

      if (
        current === "--ignore" ||
        current === "--config" ||
        current === "--graph-json"
      ) {
        index += 1;
        continue;
      }

      if (
        current === "--help" ||
        current === "-h" ||
        current === "--include-objects"
      ) {
        continue;
      }

      if (current.StartsWith("-")) {
        throw new Error(`Unknown argument '${current}'.`);
      }

      if (repositoryPath !== null) {
        throw new Error(
          `Repository path was already set to '${repositoryPath}'. Unexpected value '${current}'.`,
        );
      }

      repositoryPath = current;
      hasExplicitRepositoryPath = true;
    }

    const includeObjectDirectories = parsed.options["include-objects"] === true;
    const ignoredRelativePaths = this.optionAsStringArray(parsed.options.ignore, "ignore");
    const graphOutputJsonPath =
      this.optionAsString(parsed.options["graph-json"], "graph-json") ??
      "git-history-graph.json";
    const showHelp = parsed.options.help === true;
    const configPath =
      this.optionAsString(parsed.options.config, "config") ??
      "watcher.config.json";

    return {
      repositoryPath: repositoryPath ?? process.cwd(),
      includeObjectDirectories,
      ignoredRelativePaths,
      graphOutputJsonPath,
      showHelp,
      configPath,
      hasExplicitRepositoryPath,
      hasExplicitIncludeObjects: parsed.options["include-objects"] !== undefined,
      hasExplicitIgnores: parsed.options.ignore !== undefined,
      hasExplicitGraphOutputJsonPath: parsed.options["graph-json"] !== undefined,
    };
  }

  private assertOptionHasValue(
    argumentsVector: readonly string[],
    optionName: string,
  ): void {
    for (let index = 0; index < argumentsVector.length; index += 1) {
      if (
        argumentsVector[index] === optionName &&
        argumentsVector[index + 1] === undefined
      ) {
        throw new Error(`Missing value for '${optionName}'.`);
      }
    }
  }

  private optionAsString(value: unknown, optionName: string): string | null {
    if (value === undefined) {
      return null;
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid value for '--${optionName}'. Expected string.`);
    }

    return value;
  }

  private optionAsStringArray(value: unknown, optionName: string): string[] {
    if (value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      if (!value.every((entry) => typeof entry === "string")) {
        throw new Error(
          `Invalid value for '--${optionName}'. Expected string values.`,
        );
      }

      return [...value];
    }

    if (typeof value === "string") {
      return [value];
    }

    throw new Error(`Invalid value for '--${optionName}'. Expected string values.`);
  }
}
'@

# fix TS method typo from PowerShell-style StartsWith
$files["src/features/cli/WatcherCliOptionsParser.ts"] = $files["src/features/cli/WatcherCliOptionsParser.ts"] -replace '\.StartsWith\("-"\)', '.startsWith("-")'

$files["src/features/cli/WatchdogRuntimeFactory.ts"] = @'
import type {
  IWatchdogRuntime,
  IWatchdogRuntimeFactory,
  WatchdogRuntimeOptions,
} from "../../contracts/cli/index.js";
import type { IGitWatchdogFactory } from "../../contracts/watcher/IGitWatchdogFactory.js";

class GitWatchdogRuntime implements IWatchdogRuntime {
  public constructor(
    private readonly inner: import("../../contracts/watcher/IGitWatchdog.js").IGitWatchdog,
  ) {}

  public async start(): Promise<void> {
    await this.inner.start();
  }

  public async stop(): Promise<void> {
    await this.inner.stop();
  }
}

export class WatchdogRuntimeFactory implements IWatchdogRuntimeFactory {
  public constructor(private readonly watchdogFactory: IGitWatchdogFactory) {}

  public create(options: WatchdogRuntimeOptions): IWatchdogRuntime {
    return new GitWatchdogRuntime(
      this.watchdogFactory.create({
        repositoryPath: options.repositoryPath,
        includeObjectDirectories: options.includeObjectDirectories,
        ignoredRelativePaths: options.ignoredRelativePaths,
        graphOutputJsonPath: options.graphOutputJsonPath,
      }),
    );
  }
}
'@

$files["src/features/cli/NodeWatcherCliApplication.ts"] = @'
import { pathToFileURL } from "node:url";
import type {
  CliOptions,
  ICliUsageTextProvider,
  IGraphOutputPathResolver,
  IWatcherCliOptionsParser,
  IWatcherConfigLoader,
  IWatchdogRuntimeFactory,
  WatcherConfigFile,
} from "../../contracts/cli/index.js";
import { GraphOutputPathResolver } from "../../infrastructure/cli/GraphOutputPathResolver.js";
import { WatcherConfigLoader } from "../../infrastructure/cli/WatcherConfigLoader.js";
import { WatcherCliOptionsParser } from "./WatcherCliOptionsParser.js";
import { WatcherCliUsageTextProvider } from "./WatcherCliUsageTextProvider.js";

export class NodeWatcherCliApplication {
  public constructor(
    private readonly watchdogFactory: IWatchdogRuntimeFactory,
    private readonly optionsParser: IWatcherCliOptionsParser = new WatcherCliOptionsParser(),
    private readonly configLoader: IWatcherConfigLoader = new WatcherConfigLoader(),
    private readonly graphOutputPathResolver: IGraphOutputPathResolver = new GraphOutputPathResolver(),
    private readonly usageTextProvider: ICliUsageTextProvider = new WatcherCliUsageTextProvider(),
  ) {}

  public isExecutedDirectly(entryPointPath: string | undefined): boolean {
    if (entryPointPath === undefined) {
      return false;
    }

    return pathToFileURL(entryPointPath).href === import.meta.url;
  }

  public async run(argumentsVector: readonly string[]): Promise<void> {
    let options: CliOptions;

    try {
      options = this.optionsParser.parse(argumentsVector);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      console.error("");
      console.error(this.usageTextProvider.getUsageText());
      process.exitCode = 1;
      return;
    }

    if (options.showHelp) {
      console.log(this.usageTextProvider.getUsageText());
      return;
    }

    let fileConfig: WatcherConfigFile | null = null;

    try {
      fileConfig = await this.configLoader.load(options.configPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to load config '${options.configPath}': ${message}`);
      process.exitCode = 1;
      return;
    }

    const configuredRepositoryPath =
      fileConfig?.gitPath ?? fileConfig?.repositoryPath ?? process.cwd();

    const repositoryPath = options.hasExplicitRepositoryPath
      ? options.repositoryPath
      : configuredRepositoryPath;

    const includeObjectDirectories = options.hasExplicitIncludeObjects
      ? options.includeObjectDirectories
      : (fileConfig?.includeObjectDirectories ?? false);

    const ignoredRelativePaths = options.hasExplicitIgnores
      ? options.ignoredRelativePaths
      : (fileConfig?.ignoredRelativePaths ?? []);

    const graphOutputJsonPathTemplate = options.hasExplicitGraphOutputJsonPath
      ? options.graphOutputJsonPath
      : (fileConfig?.graphOutputJsonPath ?? "git-history-graph-{timestamp}.json");

    const graphOutputJsonPath =
      this.graphOutputPathResolver.resolve(graphOutputJsonPathTemplate);

    const watchdog = this.watchdogFactory.create({
      repositoryPath,
      includeObjectDirectories,
      ignoredRelativePaths,
      graphOutputJsonPath,
    });

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
      console.log(`Received ${signal}. Stopping watcher...`);
      await watchdog.stop();
      process.exit(0);
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    try {
      await watchdog.start();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to start watcher: ${message}`);
      process.exitCode = 1;
    }
  }
}
'@

$files["src/features/cli/index.ts"] = @'
export { NodeWatcherCliApplication } from "./NodeWatcherCliApplication.js";
export { WatcherCliOptionsParser } from "./WatcherCliOptionsParser.js";
export { WatcherCliUsageTextProvider } from "./WatcherCliUsageTextProvider.js";
export { WatchdogRuntimeFactory } from "./WatchdogRuntimeFactory.js";
'@

$files["src/features/watchdog/index.ts"] = @'
export {
  GitDirectoryResolver,
  GitFileChangeClassifier,
  ConsoleGitFileChangeSink,
  ConsoleGitSemanticEventSink,
  GitWatchdog,
  GitWatchdogFactory,
} from "../../index.legacy.js";
'@

$files["src/features/history-graph/index.ts"] = @'
export {
  GitSemanticEventGraph,
  GitHistoryGraphMaintainer,
} from "../../index.legacy.js";
'@

$files["src/features/semantic-events/index.ts"] = @'
export {
  GitSemanticEventClassifier,
  type IGitSemanticEventFactory,
  type IGitSemanticEventRule,
} from "../../Features/semantic-events/GitSemanticEventClassifier.js";

export type { ITransientGitPathPolicy } from "../../domain/git/TransientGitPathPolicy.js";
'@

$files["src/composition/NodeWatcherCompositionRoot.ts"] = @'
import type { ILogger } from "../contracts/logging/ILogger.js";
import type { IClock } from "../contracts/time/IClock.js";
import type { IFileSystem } from "../contracts/io/IFileSystem.js";
import type { IPathService } from "../contracts/io/IPathService.js";
import type { IGitWatchdogFactory } from "../contracts/watcher/IGitWatchdogFactory.js";
import type { IWatchdogRuntimeFactory } from "../contracts/cli/IWatchdogRuntimeFactory.js";
import { CoreLoggerAdapter } from "../infrastructure/logging/CoreLoggerAdapter.js";
import { SystemClock } from "../infrastructure/time/SystemClock.js";
import { NodeFileSystem } from "../infrastructure/io/NodeFileSystem.js";
import { NodePathService } from "../infrastructure/io/NodePathService.js";
import { GitWatchdogFactory } from "../features/watchdog/index.js";
import { WatchdogRuntimeFactory } from "../features/cli/WatchdogRuntimeFactory.js";
import { NodeWatcherCliApplication } from "../features/cli/NodeWatcherCliApplication.js";
import { WatcherCliOptionsParser } from "../features/cli/WatcherCliOptionsParser.js";
import { WatcherCliUsageTextProvider } from "../features/cli/WatcherCliUsageTextProvider.js";
import { WatcherConfigLoader } from "../infrastructure/cli/WatcherConfigLoader.js";
import { GraphOutputPathResolver } from "../infrastructure/cli/GraphOutputPathResolver.js";

export class NodeWatcherCompositionRoot {
  public createLogger(): ILogger {
    return new CoreLoggerAdapter();
  }

  public createClock(): IClock {
    return new SystemClock();
  }

  public createFileSystem(): IFileSystem {
    return new NodeFileSystem();
  }

  public createPathService(): IPathService {
    return new NodePathService();
  }

  public createGitWatchdogFactory(): IGitWatchdogFactory {
    return new GitWatchdogFactory(
      this.createFileSystem(),
      this.createPathService(),
      this.createClock(),
      this.createLogger(),
    );
  }

  public createWatchdogRuntimeFactory(): IWatchdogRuntimeFactory {
    return new WatchdogRuntimeFactory(this.createGitWatchdogFactory());
  }

  public createCliApplication(): NodeWatcherCliApplication {
    return new NodeWatcherCliApplication(
      this.createWatchdogRuntimeFactory(),
      new WatcherCliOptionsParser(),
      new WatcherConfigLoader(),
      new GraphOutputPathResolver(),
      new WatcherCliUsageTextProvider(),
    );
  }
}
'@

$files["src/index.ts"] = @'
import { pathToFileURL } from "node:url";
import { NodeWatcherCompositionRoot } from "./composition/NodeWatcherCompositionRoot.js";

export type { ILogger } from "./contracts/logging/ILogger.js";
export type { IClock } from "./contracts/time/IClock.js";
export type {
  IFileSystem,
  IFileSystemEntry,
} from "./contracts/io/IFileSystem.js";
export type { IPathService } from "./contracts/io/IPathService.js";
export type { GitWatchdogOptions } from "./contracts/watcher/GitWatchdogOptions.js";
export type { IGitWatchdog } from "./contracts/watcher/IGitWatchdog.js";
export type { IGitWatchdogFactory } from "./contracts/watcher/IGitWatchdogFactory.js";
export type {
  CliOptions,
  WatcherConfigFile,
  CliOptionDefinition,
  CliOptionSchema,
  CliParseResult,
  CliParserLike,
} from "./contracts/cli/CliTypes.js";
export type { IWatcherCliOptionsParser } from "./contracts/cli/IWatcherCliOptionsParser.js";
export type { IWatcherConfigLoader } from "./contracts/cli/IWatcherConfigLoader.js";
export type { IGraphOutputPathResolver } from "./contracts/cli/IGraphOutputPathResolver.js";
export type { ICliUsageTextProvider } from "./contracts/cli/ICliUsageTextProvider.js";
export type { IWatchdogRuntime } from "./contracts/cli/IWatchdogRuntime.js";
export type { IWatchdogRuntimeFactory } from "./contracts/cli/IWatchdogRuntimeFactory.js";
export type { WatchdogRuntimeOptions } from "./contracts/cli/WatchdogRuntimeOptions.js";

export * from "./domain/git/index.js";
export * from "./infrastructure/time/SystemClock.js";
export * from "./infrastructure/logging/CoreLoggerAdapter.js";
export * from "./infrastructure/io/NodeFileSystem.js";
export * from "./infrastructure/io/NodePathService.js";
export * from "./infrastructure/cli/FallbackCliParser.js";
export * from "./infrastructure/cli/CliParserFactory.js";
export * from "./infrastructure/cli/WatcherConfigLoader.js";
export * from "./infrastructure/cli/GraphOutputPathResolver.js";
export * from "./features/semantic-events/index.js";
export * from "./features/history-graph/index.js";
export * from "./features/watchdog/index.js";
export * from "./features/cli/index.js";
export * from "./composition/NodeWatcherCompositionRoot.js";

export * from "./index.legacy.js";

const entryPointPath = process.argv[1];

if (entryPointPath !== undefined && pathToFileURL(entryPointPath).href === import.meta.url) {
  const application = new NodeWatcherCompositionRoot().createCliApplication();
  void application.run(process.argv.slice(2));
}
'@

foreach ($relativePath in $files.Keys) {
    $absolutePath = Join-Path $projectRootResolved $relativePath
    Write-FileIfChanged -Path $absolutePath -Content $files[$relativePath]
}

Write-Host ""
Write-Host "Refactor script completed." -ForegroundColor Green
Write-Host "Preserved monolith : src/index.legacy.ts"
Write-Host "New public entry   : src/index.ts"
Write-Host "Next step          : run your build and fix any remaining path/casing issues."