import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { RasterGraphicsResolution } from "../../Commands/GenerateRasterGraphicsCommand.js";

export interface GeneratePngRequest {
  readonly category: string;
  readonly itemName: string;
  readonly sourceSvgFile: string;
  readonly outputRoot: string;
  readonly stepDegrees: number;
  readonly resolutions: readonly RasterGraphicsResolution[];
}

export class PngHandler {
  public async handle(request: GeneratePngRequest): Promise<number> {
    const outputFolder = path.join(
      request.outputRoot,
      request.category,
      request.itemName,
    );

    await mkdir(outputFolder, { recursive: true });

    let filesGenerated = 0;

    for (const angleDegrees of this.createAngles(request.stepDegrees)) {
      for (const [width, height] of request.resolutions) {
        const outputPath = path.join(
          outputFolder,
          this.createFileName(request.itemName, angleDegrees, width, height),
        );

        await sharp(request.sourceSvgFile)
          .rotate(angleDegrees, {
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .resize({
            width,
            height,
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toFile(outputPath);

        filesGenerated++;
      }
    }

    return filesGenerated;
  }

  private createAngles(stepDegrees: number): number[] {
    const angles: number[] = [];

    for (let angle = 0; angle < 360; angle += stepDegrees) {
      angles.push(angle);
    }

    return angles;
  }

  private createFileName(
    itemName: string,
    angleDegrees: number,
    width: number,
    height: number,
  ): string {
    const rotationSuffix = angleDegrees === 0 ? "" : `-${angleDegrees}`;

    return `${itemName}${rotationSuffix}-${width}x${height}.png`;
  }
}