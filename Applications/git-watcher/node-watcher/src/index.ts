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
  WatcherProjectConfig,
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
export * from "./Features/cli/index.js";
export * from "./Features/watchdog/index.js";
export * from "./composition/NodeWatcherCompositionRoot.js";

const entryPointPath = process.argv[1];

if (entryPointPath !== undefined && pathToFileURL(entryPointPath).href === import.meta.url) {
  const application = new NodeWatcherCompositionRoot().createCliApplication();
  void application.run(process.argv.slice(2));
}
