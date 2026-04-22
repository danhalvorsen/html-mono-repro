import type { IWatchdogRuntime } from "./IWatchdogRuntime.js";
import type { WatchdogRuntimeOptions } from "./WatchdogRuntimeOptions.js";

export interface IWatchdogRuntimeFactory {
  create(options: WatchdogRuntimeOptions): IWatchdogRuntime;
}