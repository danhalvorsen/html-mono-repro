import type { GitWatchdogOptions } from "./GitWatchdogOptions.js";
import type { IGitWatchdog } from "./IGitWatchdog.js";

export interface IGitWatchdogFactory {
  create(options: GitWatchdogOptions): IGitWatchdog;
}