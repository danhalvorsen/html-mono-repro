import { GenerateRasterGraphicsCommandMessageHandler } from "../cqrs/GenerateRasterGraphicsCommandMessageHandler.js";
import { GenerateRasterGraphicsCommandHandler } from "../application/Handlers/GenerateRasterGraphicsCommandHandler.js";
import { PngHandler } from "../application/Png/PngHandler.js";
import { ServerConfig } from "../Config/ServerConfig.js";
import { StaticApiCatalogProvider } from "../application/ApiCatalogProvider.js";
import { RotationAngleFactory } from "../application/RotationAngleFactory.js";
import { SvgRotationService } from "../application/SvgRotationService.js";
import { SvgSourceFileNameParser } from "../application/SvgSourceFileNameParser.js";
import { SvgSourceFileSelectionFilter } from "../application/SvgSourceFileSelectionFilter.js";
import { TrainingImageGenerationApplication } from "../application/TrainingImageGenerationApplication.js";
import { GenerationStatusStore } from "../application/GenerationStatusStore.js";
import { CommandDispatcher, QueryDispatcher } from "../cqrs/Dispatchers.js";
import {
  GenerateTrainingImagesCommandHandler,
  GetApiCatalogQueryHandler,
  GetGenerationStatusQueryHandler,
  ListSvgFilesQueryHandler,
} from "../cqrs/Handlers.js";
import { FileSystemSvgSourceRepository } from "../infrastructure/FileSystemSvgSourceRepository.js";
import { FileSystemTrainingImageWriter } from "../infrastructure/FileSystemTrainingImageWriter.js";
import { RasterGraphicsNoiceStrategyRegistry } from "../infrastructure/RasterGraphicsNoiceStrategyRegistry.js";
import {
  NullRasterGraphicsNoiceStrategy,
  RandomLinesRasterGraphicsNoiceStrategy,
} from "../infrastructure/SharpRasterGraphicsNoiceStrategies.js";

export interface ApiComposition {
  readonly commandDispatcher: CommandDispatcher;
  readonly queryDispatcher: QueryDispatcher;
}

export class CompositionRoot {
  public create(): ApiComposition {
    const noiceRegistry = new RasterGraphicsNoiceStrategyRegistry([
      new NullRasterGraphicsNoiceStrategy(),
      new RandomLinesRasterGraphicsNoiceStrategy(),
    ]);

    const sourceRepository = new FileSystemSvgSourceRepository(
      new SvgSourceFileNameParser(),
    );

    const imageWriter = new FileSystemTrainingImageWriter(noiceRegistry);

    const application = new TrainingImageGenerationApplication(
      sourceRepository,
      new RotationAngleFactory(),
      new SvgRotationService(),
      imageWriter,
      new GenerationStatusStore(),
      new SvgSourceFileSelectionFilter(),
    );

    const generateRasterGraphicsCommandHandler =
      new GenerateRasterGraphicsCommandHandler(
        new ServerConfig({
          sourceRoot: "../read-xml-create-svg/generated/svgs",
          outputRoot: "./generated/raster-graphics",
        }),
        new PngHandler(),
      );

    const generateRasterGraphicsCommandMessageHandler =
      new GenerateRasterGraphicsCommandMessageHandler(
        generateRasterGraphicsCommandHandler,
      );
    const generateHandler = new GenerateTrainingImagesCommandHandler(
      application,
      imageWriter,
    );

    const listHandler = new ListSvgFilesQueryHandler(application);
    const statusHandler = new GetGenerationStatusQueryHandler(application);
    const catalogHandler = new GetApiCatalogQueryHandler(
      new StaticApiCatalogProvider(),
    );

    return {
      commandDispatcher: new CommandDispatcher(
        generateHandler,
        generateRasterGraphicsCommandMessageHandler,
      ),
      queryDispatcher: new QueryDispatcher(
        listHandler,
        statusHandler,
        catalogHandler,
      ),
    };
  }
}