import type { ICliUsageTextProvider } from "./CliTypes.js";

export class WatcherCliUsageTextProvider implements ICliUsageTextProvider {
  public getUsageText(): string {
    return [
      "Usage: node-watcher [repository-path] [options]",
      "",
      "Options:",
      "  --repo <path>         Repository path to inspect (overrides positional path)",
      "  --config <path>       Path to JSON config file (default: watcher.config.json)",
      "  --include-objects     Include .git/objects directories",
      "  --ignore <path>       Ignore relative path under the resolved .git dir (repeatable)",
      "  --graph-json <path>   Graph JSON output path (default: git-history-graph.json)",
      "  -h, --help            Show this help",
    ].join("\n");
  }
}
