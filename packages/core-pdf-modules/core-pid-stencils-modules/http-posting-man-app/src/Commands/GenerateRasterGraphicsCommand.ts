import type { ICommand } from "@monorepo/core-design-patterns-cqrs-no-json";

export type RasterGraphicsFormat = "png" | "jpg" | "webp";
export type RasterGraphicsResolution = [number, number];

export class GenerateRasterGraphicsCommand
  implements ICommand<GenerateRasterGraphicsCommand>
{
  public readonly message: GenerateRasterGraphicsCommand = this;

  public readonly category: string;
  public readonly itemName: string;
  public readonly formats: readonly RasterGraphicsFormat[];
  public readonly stepDegrees: number;
  public readonly resolutions: readonly RasterGraphicsResolution[];

  public constructor(
    category: string,
    itemName: string,
    formats: readonly RasterGraphicsFormat[] = ["png"],
    stepDegrees: number = 36,
    resolutions: readonly RasterGraphicsResolution[] = [
      [128, 128],
      [256, 256],
      [512, 512],
      [1024, 1024],
    ],
  ) {
    this.category = category;
    this.itemName = itemName;
    this.formats = formats;
    this.stepDegrees = stepDegrees;
    this.resolutions = resolutions;
  }
}

export interface GenerateRasterGraphicsCommandPayload {
  readonly category: string;
  readonly itemName: string;
  readonly formats: readonly RasterGraphicsFormat[];
  readonly stepDegrees: number;
  readonly resolutions: readonly RasterGraphicsResolution[];
}

export function createGenerateRasterGraphicsCommandPayload(
  command: GenerateRasterGraphicsCommand,
): GenerateRasterGraphicsCommandPayload {
  return {
    category: command.category,
    itemName: command.itemName,
    formats: command.formats,
    stepDegrees: command.stepDegrees,
    resolutions: command.resolutions,
  };
}