import { describe, expect, test } from "vitest";
import { WatcherCliOptionsParser } from "../../src/index.js";

describe("parseCliOptions", () => {
  const parser = new WatcherCliOptionsParser();

  test("uses defaults when no args are provided", () => {
    const options = parser.parse([]);

    expect(options.repositoryPath).toBe(process.cwd());
    expect(options.includeObjectDirectories).toBe(false);
    expect(options.ignoredRelativePaths).toEqual([]);
    expect(options.graphOutputJsonPath).toBe("git-history-graph.json");
    expect(options.configPath).toBe("watcher.config.json");
    expect(options.showHelp).toBe(false);
  });

  test("accepts positional repository path", () => {
    const options = parser.parse(["./demo"]);
    expect(options.repositoryPath).toBe("./demo");
    expect(options.hasExplicitRepositoryPath).toBe(true);
  });

  test("lets --repo override earlier positional repository path", () => {
    const options = parser.parse(["./demo", "--repo", "./override"]);
    expect(options.repositoryPath).toBe("./override");
    expect(options.hasExplicitRepositoryPath).toBe(true);
  });

  test("parses include-objects, repeated ignore and graph-json", () => {
    const options = parser.parse([
      "--include-objects",
      "--ignore",
      "index.lock",
      "--ignore",
      "refs/heads/main.lock",
      "--graph-json",
      "out-{timestamp}.json",
    ]);

    expect(options.includeObjectDirectories).toBe(true);
    expect(options.hasExplicitIncludeObjects).toBe(true);
    expect(options.ignoredRelativePaths).toEqual(["index.lock", "refs/heads/main.lock"]);
    expect(options.hasExplicitIgnores).toBe(true);
    expect(options.graphOutputJsonPath).toBe("out-{timestamp}.json");
    expect(options.hasExplicitGraphOutputJsonPath).toBe(true);
  });

  test("throws for unknown arguments", () => {
    expect(() => parser.parse(["--unknown"])).toThrow("Unknown argument '--unknown'.");
  });

  test("throws when --repo has no value", () => {
    expect(() => parser.parse(["--repo"])).toThrow("Missing value for '--repo'.");
  });
});
