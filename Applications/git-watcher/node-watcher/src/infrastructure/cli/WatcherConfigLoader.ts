import { promises as fs } from "node:fs";
import type { IWatcherConfigLoader } from "../../contracts/cli/IWatcherConfigLoader.js";
import type { WatcherConfigFile } from "../../contracts/cli/CliTypes.js";

export class WatcherConfigLoader implements IWatcherConfigLoader {
  public async load(configPath: string): Promise<WatcherConfigFile | null> {
    try {
      const content = await fs.readFile(configPath, "utf8");
      const parsed = JSON.parse(content) as unknown;

      if (parsed === null || typeof parsed !== "object") {
        throw new Error("Config root must be an object.");
      }

      return parsed as WatcherConfigFile;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }
}