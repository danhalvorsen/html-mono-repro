import { describe, expect, it } from "vitest";

import { OllamaIntegrationFixture } from "./fixtures/OllamaIntegrationFixture.js";

describe("integration: Ollama /api/generate", () => {
  it("should send a generate request through the core HTTP client and assert structured extraction response", async () => {
    const fixture = new OllamaIntegrationFixture();
    const client = fixture.createHttpClient();

    const models = await fixture.readInstalledModels(client);

    fixture.assertions.assertModelInstalled(
      models,
      fixture.configuration.modelName
    );

    const response = await fixture.sendGenerateRequest(client);

    if (response.statusCode !== 200) {
      console.error({
        statusCode: response.statusCode,
        body: response.body
      });
    }

    const generatedText = fixture.readGenerateText(response);
    const generatedJson = fixture.assertions.parseGeneratedJson(generatedText);

    console.log({
      modelName: fixture.configuration.modelName,
      generatedText
    });

    expect(response.statusCode).toBe(200);
    expect(response.isJson()).toBe(true);

    expect(generatedJson).toMatchObject({
      teamName: "Paris",
      country: "France",
      teamId: "52747",
      phase: "TOURNAMENT"
    });
  });
});
