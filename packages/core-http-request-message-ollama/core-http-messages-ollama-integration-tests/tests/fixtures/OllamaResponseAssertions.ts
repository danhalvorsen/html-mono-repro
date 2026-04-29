import type { IHttpResponseMessage } from "@monorepo/core-http-messages";

export interface OllamaModelInfo {
  readonly name: string;
}

export class OllamaResponseAssertions {
  public assertOkJson(response: IHttpResponseMessage): void {
    if (response.statusCode !== 200) {
      throw new Error(
        [
          `Expected HTTP 200 from Ollama. Actual: ${response.statusCode}.`,
          "Response body:",
          this.stringifyBody(response.body)
        ].join("\n")
      );
    }

    if (!response.isJson()) {
      throw new Error(
        [
          "Expected Ollama response content-type to be application/json.",
          "Response body:",
          this.stringifyBody(response.body)
        ].join("\n")
      );
    }
  }

  public readModels(response: IHttpResponseMessage): readonly OllamaModelInfo[] {
    this.assertOkJson(response);

    const body = this.requireRecord(response.body);
    const models = body.models;

    if (!Array.isArray(models)) {
      throw new Error("Expected /api/tags response body to contain array property 'models'.");
    }

    return models.map((value) => {
      const model = this.requireRecord(value);
      const name = model.name;

      if (typeof name !== "string" || name.length === 0) {
        throw new Error("Expected each model to contain non-empty string property 'name'.");
      }

      return { name };
    });
  }

  public assertModelInstalled(
    models: readonly OllamaModelInfo[],
    modelName: string
  ): void {
    const installed = models.some((model) => model.name === modelName);

    if (!installed) {
      throw new Error(
        [
          `Ollama model '${modelName}' is not installed.`,
          `Installed models: ${models.map((model) => model.name).join(", ")}`,
          `Fix: ollama pull ${modelName}`
        ].join("\n")
      );
    }
  }

  public parseGeneratedJson(responseText: string): Record<string, unknown> {
    const parsed = JSON.parse(responseText);
    return this.requireRecord(parsed);
  }

  public stringifyBody(body: unknown): string {
    if (typeof body === "string") {
      return body;
    }

    return JSON.stringify(body, null, 2);
  }

  private requireRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("Expected JSON object.");
    }

    return value as Record<string, unknown>;
  }
}
