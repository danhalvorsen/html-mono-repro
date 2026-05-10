import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { should } from "chai";
import { afterEach, beforeEach, describe, it } from "vitest";
import { JsonMessageKind } from "../src/config/PostingConfiguration.js";
import { JsonMessageReferenceResolver } from "../src/config/JsonMessageReferenceResolver.js";
import { PostingConfigurationReader } from "../src/config/PostingConfigurationReader.js";

should();

describe("PostingConfigurationReader", () => {
  let tempDirectory = "";

  beforeEach(async () => {
    tempDirectory = await mkdtemp(path.join(os.tmpdir(), "posting-"));
  });

  afterEach(async () => {
    await rm(tempDirectory, { recursive: true, force: true });
  });

  it("should load named command and query message references from JSON", async () => {
    const configPath = path.join(tempDirectory, "posting.config.json");

    await writeFile(
      configPath,
      JSON.stringify({
        baseUrl: "http://localhost:3000",
        commands: [
          {
            name: "generate",
            shortcuts: ["g"],
            path: "./examples/generate.command.json",
          },
        ],
        queries: [
          {
            name: "status",
            shortcuts: ["s"],
            path: "./examples/status.query.json",
          },
        ],
      }),
      "utf8",
    );

    const loaded = await new PostingConfigurationReader().read(configPath);

    loaded.configuration.baseUrl.should.equal("http://localhost:3000");
    loaded.configuration.commands[0]!.name.should.equal("generate");
    loaded.configuration.queries[0]!.name.should.equal("status");
  });

  it("should resolve configured command message paths relative to the config file", async () => {
    const configPath = path.join(tempDirectory, "posting.config.json");

    await writeFile(
      configPath,
      JSON.stringify({
        baseUrl: "http://localhost:3000",
        commands: [
          {
            name: "generate",
            shortcuts: ["g"],
            path: "./examples/generate.command.json",
          },
        ],
        queries: [],
      }),
      "utf8",
    );

    const loaded = await new PostingConfigurationReader().read(configPath);
    const resolved = new JsonMessageReferenceResolver().resolve(
      loaded,
      JsonMessageKind.Command,
      "generate",
    );

    resolved.kind.should.equal(JsonMessageKind.Command);
    resolved.baseUrl.should.equal("http://localhost:3000");
    resolved.messageFilePath.should.equal(
      path.join(tempDirectory, "examples", "generate.command.json"),
    );
  });

  it("should resolve quick names across commands and queries", async () => {
    const configPath = path.join(tempDirectory, "posting.config.json");

    await writeFile(
      configPath,
      JSON.stringify({
        baseUrl: "http://localhost:3000",
        commands: [
          {
            name: "generate",
            shortcuts: ["g"],
            path: "./examples/generate.command.json",
          },
        ],
        queries: [
          {
            name: "list-svg-files",
            shortcuts: ["list", "l"],
            path: "./examples/list-svg-files.query.json",
          },
        ],
      }),
      "utf8",
    );

    const loaded = await new PostingConfigurationReader().read(configPath);
    const resolved = new JsonMessageReferenceResolver().resolveQuick(
      loaded,
      "list",
    );

    resolved.kind.should.equal(JsonMessageKind.Query);
    resolved.name.should.equal("list-svg-files");
    resolved.messageFilePath.should.equal(
      path.join(tempDirectory, "examples", "list-svg-files.query.json"),
    );
  });
});