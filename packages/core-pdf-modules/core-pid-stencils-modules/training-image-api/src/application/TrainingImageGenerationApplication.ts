import type { GeneratedVariant } from "../domain/GeneratedVariant.js";
import type { TrainingImageGenerationConfig } from "../domain/GenerationConfig.js";
import type { TrainingImageGenerationSelection } from "../domain/GenerationSelection.js";
import type { GenerationStatus } from "../domain/GenerationStatus.js";
import type { SvgSourceFile } from "../domain/SvgSourceFile.js";
import type { ISvgSourceRepository } from "../ports/ISvgSourceRepository.js";
import type { ITrainingImageWriter } from "../ports/ITrainingImageWriter.js";
import { GenerationStatusStore } from "./GenerationStatusStore.js";
import { RotationAngleFactory } from "./RotationAngleFactory.js";
import { SvgRotationService } from "./SvgRotationService.js";
import type { ISvgSourceFileSelectionFilter } from "./SvgSourceFileSelectionFilter.js";

export interface GenerateTrainingImagesResult {
  readonly status: GenerationStatus;
}

export class TrainingImageGenerationApplication {
  private readonly sourceRepository: ISvgSourceRepository;
  private readonly angleFactory: RotationAngleFactory;
  private readonly rotationService: SvgRotationService;
  private readonly imageWriter: ITrainingImageWriter;
  private readonly statusStore: GenerationStatusStore;
  private readonly selectionFilter: ISvgSourceFileSelectionFilter;

  public constructor(
    sourceRepository: ISvgSourceRepository,
    angleFactory: RotationAngleFactory,
    rotationService: SvgRotationService,
    imageWriter: ITrainingImageWriter,
    statusStore: GenerationStatusStore,
    selectionFilter: ISvgSourceFileSelectionFilter,
  ) {
    this.sourceRepository = sourceRepository;
    this.angleFactory = angleFactory;
    this.rotationService = rotationService;
    this.imageWriter = imageWriter;
    this.statusStore = statusStore;
    this.selectionFilter = selectionFilter;
  }

  public async listSvgFiles(sourceDirectory: string): Promise<readonly SvgSourceFile[]> {
    return this.sourceRepository.list(sourceDirectory);
  }

  public getStatus(): GenerationStatus {
    return this.statusStore.get();
  }

  public async generate(
    config: TrainingImageGenerationConfig,
    selection: TrainingImageGenerationSelection,
  ): Promise<GenerateTrainingImagesResult> {
    const sourceFiles = this.selectionFilter.filter(
      await this.sourceRepository.list(config.sourceDirectory),
      selection,
    );

    const angles = this.angleFactory.create(
      config.rotation.angleStepDegrees,
      config.rotation.includeOriginal,
    );

    this.statusStore.start(sourceFiles.length);

    for (const sourceFile of sourceFiles) {
      try {
        const sourceSvg = await this.sourceRepository.read(sourceFile);

        for (const angle of angles) {
          const variant: GeneratedVariant = {
            sourceFileName: sourceFile.fileName,
            category: sourceFile.category,
            itemName: sourceFile.itemName,
            angleDegrees: angle,
            svgText: this.rotationService.rotate(sourceSvg, angle),
          };

          for (const format of config.outputFormats) {
            await this.imageWriter.write(config.outputDirectory, variant, format);
            this.statusStore.incrementGeneratedFiles();
          }
        }
      }
      catch (error) {
        this.statusStore.addError({
          sourceFile: sourceFile.relativePath,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.statusStore.complete();

    return {
      status: this.statusStore.get(),
    };
  }
}