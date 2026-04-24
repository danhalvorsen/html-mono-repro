import { beforeEach, describe, expect, test, vi } from "vitest";
import type {
  CliOptions,
  IGraphOutputPathResolver,
  IWatchdogRuntime,
  IWatchdogRuntimeFactory,
  IWatcherCliOptionsParser,
  IWatcherConfigLoader,
  WatchdogRuntimeOptions,
} from "../../src/contracts/cli/index.js";
import { NodeWatcherCliApplication } from "../../src/Features/cli/NodeWatcherCliApplication.js";

function defaultCliOptions(): CliOptions {
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
  };
}

function runtimeFactoryRecorder(): {
  factory: IWatchdogRuntimeFactory;
  created: WatchdogRuntimeOptions[];
} {
  const created: WatchdogRuntimeOptions[] = [];
  const factory: IWatchdogRuntimeFactory = {
    create: (options): IWatchdogRuntime => {
      created.push(options);
      return {
        start: async () => {},
        stop: async () => {},
      };
    },
  };
  return { factory, created };
}

describe("NodeWatcherCliApplication multi-project", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  test("creates one runtime per configured project with project overrides", async () => {
    const optionsParser: IWatcherCliOptionsParser = {
      parse: () => defaultCliOptions(),
    };
    const configLoader: IWatcherConfigLoader = {
      load: async () => ({
        includeObjectDirectories: false,
        ignoredRelativePaths: ["index.lock"],
        graphOutputJsonPath: "graph-{timestamp}.json",
        projects: [
          {
            gitPath: "C:/repos/a/.git",
            includeObjectDirectories: true,
            ignoredRelativePaths: ["HEAD.lock"],
            graphOutputJsonPath: "a-{timestamp}.json",
          },
          {
            gitPath: "C:/repos/b/.git",
          },
        ],
      }),
    };
    const graphResolver: IGraphOutputPathResolver = {
      resolve: (value) => `resolved:${value}`,
    };
    const { factory, created } = runtimeFactoryRecorder();
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

    expect(created).toEqual([
      {
        repositoryPath: "C:/repos/a/.git",
        includeObjectDirectories: true,
        ignoredRelativePaths: ["HEAD.lock"],
        graphOutputJsonPath: "resolved:a-{timestamp}.json",
      },
      {
        repositoryPath: "C:/repos/b/.git",
        includeObjectDirectories: false,
        ignoredRelativePaths: ["index.lock"],
        graphOutputJsonPath: "resolved:graph-{timestamp}.json",
      },
    ]);
  });

  test("fails when projects is present but empty", async () => {
    const optionsParser: IWatcherCliOptionsParser = {
      parse: () => defaultCliOptions(),
    };
    const configLoader: IWatcherConfigLoader = {
      load: async () => ({
        projects: [],
      }),
    };
    const graphResolver: IGraphOutputPathResolver = {
      resolve: (value) => value,
    };
    const { factory, created } = runtimeFactoryRecorder();
    vi.spyOn(process, "on").mockImplementation(
      ((_event: NodeJS.Signals, _listener: () => void) => process) as typeof process.on,
    );

    const app = new NodeWatcherCliApplication(
      factory,
      optionsParser,
      configLoader,
      graphResolver,
    );

    await expect(app.run([])).rejects.toThrow(
      "Invalid config: 'projects' must contain at least one project.",
    );

    expect(created).toEqual([]);
  });
});
