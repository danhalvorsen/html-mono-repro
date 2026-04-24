import { CliParserFactory } from "../../infrastructure/cli/CliParserFactory.js";
import type {
  CliOptionSchema,
  CliOptions,
} from "../../contracts/cli/CliTypes.js";
import type { IWatcherCliOptionsParser } from "../../contracts/cli/IWatcherCliOptionsParser.js";

export class WatcherCliOptionsParser implements IWatcherCliOptionsParser {
  private readonly optionSchema: CliOptionSchema = {
    help: { type: "boolean", short: "h" },
    repo: { type: "string" },
    config: { type: "string" },
    "include-objects": { type: "boolean" },
    ignore: { type: "string", multiple: true },
    "graph-json": { type: "string" },
  };

  public constructor(
    private readonly cliParserFactory: CliParserFactory = new CliParserFactory(),
  ) {}

  public parse(argumentsVector: readonly string[]): CliOptions {
    this.assertOptionHasValue(argumentsVector, "--repo");
    this.assertOptionHasValue(argumentsVector, "--ignore");
    this.assertOptionHasValue(argumentsVector, "--config");
    this.assertOptionHasValue(argumentsVector, "--graph-json");

    const parsed = this.cliParserFactory
      .create()
      .parseOptions([...argumentsVector], this.optionSchema);

    let repositoryPath: string | null = null;
    let hasExplicitRepositoryPath = false;

    for (let index = 0; index < argumentsVector.length; index += 1) {
      const current = argumentsVector[index];

      if (current === undefined) {
        continue;
      }

      if (current === "--repo") {
        repositoryPath = argumentsVector[index + 1] ?? null;
        hasExplicitRepositoryPath = true;
        index += 1;
        continue;
      }

      if (
        current === "--ignore" ||
        current === "--config" ||
        current === "--graph-json"
      ) {
        index += 1;
        continue;
      }

      if (
        current === "--help" ||
        current === "-h" ||
        current === "--include-objects"
      ) {
        continue;
      }

      if (current.startsWith("-")) {
        throw new Error(`Unknown argument '${current}'.`);
      }

      if (repositoryPath !== null) {
        throw new Error(
          `Repository path was already set to '${repositoryPath}'. Unexpected value '${current}'.`,
        );
      }

      repositoryPath = current;
      hasExplicitRepositoryPath = true;
    }

    const includeObjectDirectories = parsed.options["include-objects"] === true;
    const ignoredRelativePaths = this.optionAsStringArray(parsed.options.ignore, "ignore");
    const graphOutputJsonPath =
      this.optionAsString(parsed.options["graph-json"], "graph-json") ??
      "git-history-graph.json";
    const showHelp = parsed.options.help === true;
    const configPath =
      this.optionAsString(parsed.options.config, "config") ??
      "watcher.config.json";

    return {
      repositoryPath: repositoryPath ?? process.cwd(),
      includeObjectDirectories,
      ignoredRelativePaths,
      graphOutputJsonPath,
      showHelp,
      configPath,
      hasExplicitRepositoryPath,
      hasExplicitIncludeObjects: parsed.options["include-objects"] !== undefined,
      hasExplicitIgnores: parsed.options.ignore !== undefined,
      hasExplicitGraphOutputJsonPath: parsed.options["graph-json"] !== undefined,
    };
  }

  private assertOptionHasValue(
    argumentsVector: readonly string[],
    optionName: string,
  ): void {
    for (let index = 0; index < argumentsVector.length; index += 1) {
      if (
        argumentsVector[index] === optionName &&
        argumentsVector[index + 1] === undefined
      ) {
        throw new Error(`Missing value for '${optionName}'.`);
      }
    }
  }

  private optionAsString(value: unknown, optionName: string): string | null {
    if (value === undefined) {
      return null;
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid value for '--${optionName}'. Expected string.`);
    }

    return value;
  }

  private optionAsStringArray(value: unknown, optionName: string): string[] {
    if (value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      if (!value.every((entry) => typeof entry === "string")) {
        throw new Error(
          `Invalid value for '--${optionName}'. Expected string values.`,
        );
      }

      return [...value];
    }

    if (typeof value === "string") {
      return [value];
    }

    throw new Error(`Invalid value for '--${optionName}'. Expected string values.`);
  }
}