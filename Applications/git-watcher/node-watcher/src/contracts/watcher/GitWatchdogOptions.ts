export interface GitWatchdogOptions {
  readonly repositoryPath: string;
  readonly includeObjectDirectories?: boolean;
  readonly ignoredRelativePaths?: readonly string[];
  readonly graphOutputJsonPath?: string;
}