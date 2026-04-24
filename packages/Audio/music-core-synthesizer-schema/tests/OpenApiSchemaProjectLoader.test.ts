// packages/Audio/music-core-synthesizer/tests/OpenApiSchemaProjectLoader.test.ts

import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  OpenApiSchemaProjectLoader,
  SchemaValidationError,
} from "../src/index.js";
import { SpyFactory } from "../../music-core-synthesizer/tests/fixture/SpyFactory.js";
import {
  ProjectComponentsBuilder,
  ProjectBuilder,
  SampleComponentBuilder,
  SequencerProjectDocumentBuilder,
} from "../../music-core-synthesizer/tests/fixture/SequencerProjectDocumentBuilder.js";

async function readSchema(): Promise<string> {
  return readFile(
    path.resolve(import.meta.dirname, "../../music-core-synthesizer/src/state.yml"),
    "utf8",
  );
}

async function readFixture(fileName: string): Promise<string> {
  return readFile(
    path.resolve(
      import.meta.dirname,
      "../../music-core-synthesizer/tests/fixture",
      fileName,
    ),
    "utf8",
  );
}

describe("OpenApiSchemaProjectLoader", () => {
  it("Given valid fixture When load Then factory is invoked with validated document", async () => {
    const schemaYaml = await readSchema();
    const json = await readFixture("valid-project.json");

    const factory = new SpyFactory();
    const loader = OpenApiSchemaProjectLoader.create(schemaYaml, factory);

    const result = await loader.load(json);

    expect(factory.received).not.toBeNull();
    expect(result).toBe(factory.received);
    expect(factory.received?.version).toBe("1.0.0");
    expect(factory.received?.project.projectId).toBe("project-1");
  });

  it("Given invalid fixture missing projectId When load Then SchemaValidationError is thrown", async () => {
    const schemaYaml = await readSchema();
    const json = await readFixture("invalid-missing-project-id.json");

    const factory = new SpyFactory();
    const loader = OpenApiSchemaProjectLoader.create(schemaYaml, factory);

    await expect(loader.load(json)).rejects.toBeInstanceOf(
      SchemaValidationError,
    );

    expect(factory.received).toBeNull();
  });

  it("Given invalid fixture with additional property When load Then SchemaValidationError is thrown", async () => {
    const schemaYaml = await readSchema();
    const json = await readFixture("invalid-additional-property.json");

    const factory = new SpyFactory();
    const loader = OpenApiSchemaProjectLoader.create(schemaYaml, factory);

    await expect(loader.load(json)).rejects.toBeInstanceOf(
      SchemaValidationError,
    );

    expect(factory.received).toBeNull();
  });

  it("Given valid fixture with non power of two stepCount When load Then factory is invoked with validated document", async () => {
  const schemaYaml = await readSchema();
  const json = await readFixture("valid-non-power-of-two-step-count.json");

  const factory = new SpyFactory();
  const loader = OpenApiSchemaProjectLoader.create(schemaYaml, factory);

  const result = await loader.load(json);

  expect(factory.received).not.toBeNull();
  expect(result).toBe(factory.received);
  expect(factory.received?.project.patterns[0]?.stepCount).toBe(12);
});
});
