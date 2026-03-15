// src/types/index.ts

export interface ExampleType {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
}

export interface ExampleResponse {
  readonly success: boolean;
  readonly data: readonly ExampleType[];
}