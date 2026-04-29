import { describe, expect, it } from "vitest";

import { OllamaIntegrationFixture } from "./fixtures/OllamaIntegrationFixture.js";

describe("integration: Ollama /api/tags", () => {
  it("should send an HTTP request through the core HTTP client and receive installed models", async () => {
    const fixture = new OllamaIntegrationFixture();
    const client = fixture.createHttpClient();

    const response = await fixture.sendTagsRequest(client);
    const models = fixture.assertions.readModels(response);

    console.table(models);

    expect(response.statusCode).toBe(200);
    expect(response.isJson()).toBe(true);
    expect(models.length).toBeGreaterThan(0);
  });

  it("should contain the configured integration-test model", async () => {
    const fixture = new OllamaIntegrationFixture();
    const client = fixture.createHttpClient();

    const models = await fixture.readInstalledModels(client);

    fixture.assertions.assertModelInstalled(
      models,
      fixture.configuration.modelName
    );

    expect(models.map((model) => model.name)).toContain(
      fixture.configuration.modelName
    );
  });
});
