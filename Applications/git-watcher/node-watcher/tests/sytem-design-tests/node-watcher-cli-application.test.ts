import { beforeEach, describe, expect, test, vi } from "vitest";
import type {
  CliOptions,
  IGraphOutputPathResolver,
  IWatchdogRuntime,
  IWatchdogRuntimeFactory,
  IWatcherCliOptionsParser,
  IWatcherConfigLoader,
  WatchdogRuntimeOptions,
  WatcherConfigFile,
} from "../../src/contracts/cli/index.js";
import { NodeWatcherCliApplication } from "../../src/Features/cli/NodeWatcherCliApplication.js";

function createCliOptions(overrides: Partial<CliOptions> = {}): CliOptions {
  return {
    repositoryPath: process.cwd(),
    includeObjectDirectories: false,
    ignoredRelativePaths: [],
    graphOutputJsonPath: "git-history-graph.json",
    showHelp: false,
    configPath: "watcher.config.json",
    hasExplicitRepositoryPath: false,
    hasExplicitIncludeObjects: false,
    hasExplicitIgnores: false,
    hasExplicitGraphOutputJsonPath: false,
    ...overrides,
  };
}

function createRuntimeFactoryRecorder(): {
  factory: IWatchdogRuntimeFactory;
  createdOptions: WatchdogRuntimeOptions[];
} {
  const createdOptions: WatchdogRuntimeOptions[] = [];

  const factory: IWatchdogRuntimeFactory = {
    create: (options): IWatchdogRuntime => {
      createdOptions.push(options);
      return {
        start: async () => {},
        stop: async () => {},
      };
    },
  };

  return { factory, createdOptions };
}

describe("NodeWatcherCliApplication", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("starts one watcher per config project", async () => {
    const optionsParser: IWatcherCliOptionsParser = {
      parse: () => createCliOptions(),
    };
    const fileConfig: WatcherConfigFile = {
      includeObjectDirectories: false,
      ignoredRelativePaths: ["index.lock"],
      graphOutputJsonPath: "graph-{timestamp}.json",
      projects: [
        {
          gitPath: "C:/repo/demo1/.git",
          ignoredRelativePaths: ["HEAD.lock"],
          graphOutputJsonPath: "demo1-{timestamp}.json",
        },
        {
          gitPath: "C:/repo/demo2/.git",
          includeObjectDirectories: true,
        },
      ],
    };
    const configLoader: IWatcherConfigLoader = {
      load: async () => fileConfig,
    };
    const graphResolver: IGraphOutputPathResolver = {
      resolve: (templateOrPath) => `resolved:${templateOrPath}`,
    };
    const { factory, createdOptions } = createRuntimeFactoryRecorder();
    const processOnSpy = vi.spyOn(process, "on").mockImplementation(
      ((_event: NodeJS.Signals, _listener: () => void) => process) as typeof process.on,
    );

    const app = new NodeWatcherCliApplication(
      factory,
      optionsParser,
      configLoader,
      graphResolver,
    );

    await app.run([]);

    expect(processOnSpy).toHaveBeenCalled();
    expect(createdOptions).toEqual([
      {
        repositoryPath: "C:/repo/demo1/.git",
        includeObjectDirectories: false,
        ignoredRelativePaths: ["HEAD.lock"],
        graphOutputJsonPath: "resolved:demo1-{timestamp}.json",
      },
      {
        repositoryPath: "C:/repo/demo2/.git",
        includeObjectDirectories: true,
        ignoredRelativePaths: ["index.lock"],
        graphOutputJsonPath: "resolved:graph-{timestamp}.json",
      },
    ]);
  });

  test("keeps backward compatibility for single-project config fields", async () => {
    const optionsParser: IWatcherCliOptionsParser = {
      parse: () => createCliOptions(),
    };
    const configLoader: IWatcherConfigLoader = {
      load: async () => ({
        gitPath: "C:/repo/demo1/.git",
        includeObjectDirectories: true,
        ignoredRelativePaths: ["index.lock"],
        graphOutputJsonPath: "single-{timestamp}.json",
      }),
    };
    const graphResolver: IGraphOutputPathResolver = {
      resolve: (templateOrPath) => `resolved:${templateOrPath}`,
    };
    const { factory, createdOptions } = createRuntimeFactoryRecorder();
    vi.spyOn(process, "on").mockImplementation(
      ((_event: NodeJS.Signals, _listener: () => void) => process) as typeof process.on,
    );

    const app = new NodeWatcherCliApplication(
      factory,
      optionsParser,
      configLoader,
      graphResolver,
    );

    await app.run([]);

    expect(createdOptions).toEqual([
      {
        repositoryPath: "C:/repo/demo1/.git",
        includeObjectDirectories: true,
        ignoredRelativePaths: ["index.lock"],
        graphOutputJsonPath: "resolved:single-{timestamp}.json",
      },
    ]);
  });

  test("explicit --repo runs a single watcher even when config has projects", async () => {
    const optionsParser: IWatcherCliOptionsParser = {
      parse: () =>
        createCliOptions({
          repositoryPath: "C:/repo/override/.git",
          hasExplicitRepositoryPath: true,
        }),
    };
    const configLoader: IWatcherConfigLoader = {
      load: async () => ({
        includeObjectDirectories: true,
        ignoredRelativePaths: ["index.lock"],
        graphOutputJsonPath: "global-{timestamp}.json",
        projects: [
          { gitPath: "C:/repo/demo1/.git" },
          { gitPath: "C:/repo/demo2/.git" },
        ],
      }),
    };
    const graphResolver: IGraphOutputPathResolver = {
      resolve: (templateOrPath) => `resolved:${templateOrPath}`,
    };
    const { factory, createdOptions } = createRuntimeFactoryRecorder();
    vi.spyOn(process, "on").mockImplementation(
      ((_event: NodeJS.Signals, _listener: () => void) => process) as typeof process.on,
    );

    const app = new NodeWatcherCliApplication(
      factory,
      optionsParser,
      configLoader,
      graphResolver,
    );

    await app.run([]);

    expect(createdOptions).toEqual([
      {
        repositoryPath: "C:/repo/override/.git",
        includeObjectDirectories: true,
        ignoredRelativePaths: ["index.lock"],
        graphOutputJsonPath: "resolved:global-{timestamp}.json",
      },
    ]);
  });
});
