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
import { GitWatchdogFactory } from "../Features/watchdog/index.js";
import { WatchdogRuntimeFactory } from "../Features/cli/WatchdogRuntimeFactory.js";
import { NodeWatcherCliApplication } from "../Features/cli/NodeWatcherCliApplication.js";
import { WatcherCliOptionsParser } from "../Features/cli/WatcherCliOptionsParser.js";
import { WatcherCliUsageTextProvider } from "../Features/cli/WatcherCliUsageTextProvider.js";
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
