import type { WatcherConfigFile } from "./CliTypes.js";

export interface IWatcherConfigLoader {
  load(configPath: string): Promise<WatcherConfigFile | null>;
}