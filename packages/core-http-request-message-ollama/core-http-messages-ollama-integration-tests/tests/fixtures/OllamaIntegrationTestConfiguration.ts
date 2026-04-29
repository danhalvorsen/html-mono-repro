export interface OllamaIntegrationTestConfiguration {
  readonly baseUrl: string;
  readonly modelName: string;
}

export class OllamaIntegrationTestConfigurationFactory {
  private static readonly DefaultBaseUrl = "http://127.0.0.1:11434";

  // Smaller and safer default for integration tests.
  // Override with qwen3-coder-next:latest when you specifically want that model.
  private static readonly DefaultModelName = "qwen2.5-coder:7b";

  public create(): OllamaIntegrationTestConfiguration {
    return {
      baseUrl:
        process.env.OLLAMA_BASE_URL ??
        OllamaIntegrationTestConfigurationFactory.DefaultBaseUrl,
      modelName:
        process.env.OLLAMA_TEST_MODEL ??
        OllamaIntegrationTestConfigurationFactory.DefaultModelName
    };
  }
}
