import type { OutputFormat } from "./OutputFormat.js";

export interface RotationGenerationConfig {
  readonly angleStepDegrees: number;
  readonly includeOriginal: boolean;
}

export interface NoiseStrategyConfig {
  readonly name: string;
  readonly parameters: Record<string, unknown>;
}

export interface NoiseGenerationConfig {
  readonly enabled: boolean;
  readonly strategies: readonly NoiseStrategyConfig[];
}

export interface TrainingImageGenerationConfig {
  readonly sourceDirectory: string;
  readonly outputDirectory: string;
  readonly outputFormats: readonly OutputFormat[];
  readonly rotation: RotationGenerationConfig;
  readonly noise: NoiseGenerationConfig;
}