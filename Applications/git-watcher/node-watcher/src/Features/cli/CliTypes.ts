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

export interface IWatcherCliOptionsParser {
  parse(argumentsVector: readonly string[]): CliOptions;
}

export interface IWatcherConfigLoader {
  load(configPath: string): Promise<WatcherConfigFile | null>;
}

export interface IGraphOutputPathResolver {
  resolve(templateOrPath: string): string;
}

export interface ICliUsageTextProvider {
  getUsageText(): string;
}

export interface IWatchdogRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface IWatchdogRuntimeFactory {
  create(options: WatchdogRuntimeOptions): IWatchdogRuntime;
}

export interface WatchdogRuntimeOptions {
  readonly repositoryPath: string;
  readonly includeObjectDirectories: boolean;
  readonly ignoredRelativePaths: readonly string[];
  readonly graphOutputJsonPath: string;
}
