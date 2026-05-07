import type { ICommandBase } from "@monorepo/core-design-patterns-cqrs-no-json";
import type { TrainingImageGenerationConfig } from "../domain/GenerationConfig.js";
import type { TrainingImageGenerationSelection } from "../domain/GenerationSelection.js";

export const CommandMessageType = {
  GenerateTrainingImages: "GenerateTrainingImages",
  GenerateRasterGraphicsCommand: "GenerateRasterGraphicsCommand",
} as const;

export type CommandMessageType =
  typeof CommandMessageType[keyof typeof CommandMessageType];

export interface GenerateTrainingImagesCommandMessage extends ICommandBase {
  readonly type: typeof CommandMessageType.GenerateTrainingImages;
  readonly selection: TrainingImageGenerationSelection;
  readonly config: TrainingImageGenerationConfig;
}

export type RasterGraphicsFormat = "png" | "jpg" | "webp";
export type RasterGraphicsResolution = [number, number];

export interface GenerateRasterGraphicsCommandMessage extends ICommandBase {
  readonly type: typeof CommandMessageType.GenerateRasterGraphicsCommand;
  readonly category: string;
  readonly itemName: string;
  readonly formats: readonly RasterGraphicsFormat[];
  readonly stepDegrees: number;
  readonly resolutions: readonly RasterGraphicsResolution[];
}

export type CommandMessage =
  | GenerateTrainingImagesCommandMessage
  | GenerateRasterGraphicsCommandMessage;