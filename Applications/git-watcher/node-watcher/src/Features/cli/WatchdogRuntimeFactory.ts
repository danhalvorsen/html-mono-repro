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