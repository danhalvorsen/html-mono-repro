import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { GeneratedVariant } from "../domain/GeneratedVariant.js";
import { OutputFormat, type OutputFormat as OutputFormatType } from "../domain/OutputFormat.js";
import type { NoiseGenerationConfig } from "../domain/GenerationConfig.js";
import type { ITrainingImageWriter } from "../ports/ITrainingImageWriter.js";
import type { IRasterGraphicsNoiceStrategyRegistry } from "../ports/IRasterGraphicsNoiceStrategyRegistry.js";

export class FileSystemTrainingImageWriter implements ITrainingImageWriter {
  private noise: NoiseGenerationConfig = {
    enabled: false,
    strategies: [],
  };

  public constructor(private readonly noiceRegistry: IRasterGraphicsNoiceStrategyRegistry) {}

  public configureNoise(noise: NoiseGenerationConfig): void {
    this.noise = noise;
  }

  public async write(
    outputDirectory: string,
    variant: GeneratedVariant,
    outputFormat: OutputFormatType,
  ): Promise<string> {
    const folder = path.join(outputDirectory, variant.category, variant.itemName);
    await mkdir(folder, { recursive: true });

    const baseName = variant.angleDegrees === 0
      ? variant.itemName
      : `${variant.itemName}-${variant.angleDegrees}`;

    const outputFile = path.join(folder, `${baseName}.${outputFormat}`);

    if (outputFormat === OutputFormat.Svg) {
      await writeFile(outputFile, variant.svgText, "utf8");
      return outputFile;
    }

    if (outputFormat === OutputFormat.Png) {
      const png = await this.renderPng(variant.svgText);
      await writeFile(outputFile, png);
      return outputFile;
    }

    throw new Error(`Output format is not implemented yet: ${outputFormat}`);
  }

  private async renderPng(svgText: string): Promise<Buffer> {
    const image = sharp(Buffer.from(svgText));
    const metadata = await image.metadata();
    const width = metadata.width ?? 512;
    const height = metadata.height ?? 512;

    let buffer = await image.png().toBuffer();

    if (!this.noise.enabled) {
      return buffer;
    }

    for (const strategyConfig of this.noise.strategies) {
      const strategy = this.noiceRegistry.get(strategyConfig.name);

      buffer = await strategy.apply({
        image: buffer,
        width,
        height,
        parameters: strategyConfig.parameters,
      });
    }

    return buffer;
  }
}