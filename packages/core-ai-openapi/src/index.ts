export interface OpenApiModuleInfo {
  readonly name: string;
  readonly version: string;
}

export const openApiModuleInfo: OpenApiModuleInfo = Object.freeze({
  name: "@monorepo/core-ai-openapi",
  version: "1.0.0",
});
