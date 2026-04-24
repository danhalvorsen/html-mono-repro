import { pathToFileURL } from "node:url";
import type {
  CliOptions,
  ICliUsageTextProvider,
  IGraphOutputPathResolver,
  IWatcherCliOptionsParser,
  IWatcherConfigLoader,
  IWatchdogRuntimeFactory,
  WatchdogRuntimeOptions,
  WatcherConfigFile,
  WatcherProjectConfig,
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

    const runtimeOptions = this.resolveRuntimeOptions(options, fileConfig);
    const watchdogs = runtimeOptions.map((runtime) =>
      this.watchdogFactory.create(runtime),
    );

    const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
      console.log(`Received ${signal}. Stopping watcher...`);
      await Promise.allSettled(watchdogs.map((watchdog) => watchdog.stop()));
      process.exit(0);
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    try {
      await Promise.all(watchdogs.map((watchdog) => watchdog.start()));
    } catch (error) {
      await Promise.allSettled(watchdogs.map((watchdog) => watchdog.stop()));
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to start watcher: ${message}`);
      process.exitCode = 1;
    }
  }

  private resolveRuntimeOptions(
    options: CliOptions,
    fileConfig: WatcherConfigFile | null,
  ): readonly WatchdogRuntimeOptions[] {
    if (options.hasExplicitRepositoryPath) {
      return [
        {
          repositoryPath: options.repositoryPath,
          includeObjectDirectories: options.hasExplicitIncludeObjects
            ? options.includeObjectDirectories
            : (fileConfig?.includeObjectDirectories ?? false),
          ignoredRelativePaths: options.hasExplicitIgnores
            ? options.ignoredRelativePaths
            : (fileConfig?.ignoredRelativePaths ?? []),
          graphOutputJsonPath: this.graphOutputPathResolver.resolve(
            options.hasExplicitGraphOutputJsonPath
              ? options.graphOutputJsonPath
              : (fileConfig?.graphOutputJsonPath ?? "git-history-graph-{timestamp}.json"),
          ),
        },
      ];
    }

    const configuredProjects = this.resolveProjectsFromConfig(fileConfig);

    if (configuredProjects.length === 0) {
      return [
        {
          repositoryPath: process.cwd(),
          includeObjectDirectories: options.hasExplicitIncludeObjects
            ? options.includeObjectDirectories
            : false,
          ignoredRelativePaths: options.hasExplicitIgnores ? options.ignoredRelativePaths : [],
          graphOutputJsonPath: this.graphOutputPathResolver.resolve(
            options.hasExplicitGraphOutputJsonPath
              ? options.graphOutputJsonPath
              : "git-history-graph-{timestamp}.json",
          ),
        },
      ];
    }

    return configuredProjects.map((project) => {
      const repositoryPath = project.gitPath ?? project.repositoryPath;
      if (repositoryPath === undefined) {
        throw new Error(
          "Invalid config: each entry in 'projects' must include 'gitPath' or 'repositoryPath'.",
        );
      }

      const includeObjectDirectories = options.hasExplicitIncludeObjects
        ? options.includeObjectDirectories
        : (project.includeObjectDirectories ?? fileConfig?.includeObjectDirectories ?? false);

      const ignoredRelativePaths = options.hasExplicitIgnores
        ? options.ignoredRelativePaths
        : (project.ignoredRelativePaths ?? fileConfig?.ignoredRelativePaths ?? []);

      const graphOutputJsonPathTemplate = options.hasExplicitGraphOutputJsonPath
        ? options.graphOutputJsonPath
        : (project.graphOutputJsonPath ??
          fileConfig?.graphOutputJsonPath ??
          "git-history-graph-{timestamp}.json");

      return {
        repositoryPath,
        includeObjectDirectories,
        ignoredRelativePaths,
        graphOutputJsonPath: this.graphOutputPathResolver.resolve(graphOutputJsonPathTemplate),
      };
    });
  }

  private resolveProjectsFromConfig(
    fileConfig: WatcherConfigFile | null,
  ): readonly WatcherProjectConfig[] {
    if (fileConfig === null) {
      return [];
    }

    if (fileConfig.projects !== undefined) {
      if (fileConfig.projects.length === 0) {
        throw new Error("Invalid config: 'projects' must contain at least one project.");
      }

      return fileConfig.projects;
    }

    if (fileConfig.gitPath !== undefined || fileConfig.repositoryPath !== undefined) {
      return [fileConfig];
    }

    return [];
  }
}
