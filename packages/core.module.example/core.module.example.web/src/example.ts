import type { ExampleResponse, ExampleType } from "./types/index.js";

export function buildExampleResponse(data: readonly ExampleType[]): ExampleResponse {
  return {
    success: true,
    data: [...data],
  };
}
