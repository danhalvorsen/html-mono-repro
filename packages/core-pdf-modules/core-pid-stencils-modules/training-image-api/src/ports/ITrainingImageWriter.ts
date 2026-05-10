import type { GeneratedVariant } from "../domain/GeneratedVariant.js";
import type { OutputFormat } from "../domain/OutputFormat.js";

export interface ITrainingImageWriter {
  write(
    outputDirectory: string,
    variant: GeneratedVariant,
    outputFormat: OutputFormat,
  ): Promise<string>;
}