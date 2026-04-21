import { pathToFileURL } from "node:url";
import { GraphOutputPathResolver } from "./GraphOutputPathResolver.js";
import { WatcherCliOptionsParser } from "./WatcherCliOptionsParser.js";
import { WatcherConfigLoader } from "./WatcherConfigLoader.js";
import { WatcherCliUsageTextProvider } from "./WatcherCliUsageTextProvider.js";
import type {
  CliOptions,
  ICliUsageTextProvider,
  IGraphOutputPathResolver,
  IWatcherCliOptionsParser,
  IWatcherConfigLoader,
  IWatchdogRuntimeFactory,
  WatcherConfigFile,
} from "./CliTypes.js";

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
