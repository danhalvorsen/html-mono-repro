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

export interface WatcherProjectConfig {
  readonly gitPath?: string;
  readonly repositoryPath?: string;
  readonly includeObjectDirectories?: boolean;
  readonly ignoredRelativePaths?: readonly string[];
  readonly graphOutputJsonPath?: string;
}

export interface WatcherConfigFile extends WatcherProjectConfig {
  readonly projects?: readonly WatcherProjectConfig[];
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
