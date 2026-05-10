import type { ICommand, IQuery } from "@monorepo/core-design-patterns-cqrs-no-json";
import type { IApiCatalogProvider } from "../application/ApiCatalogProvider.js";
import type { TrainingImageGenerationApplication } from "../application/TrainingImageGenerationApplication.js";
import { TrainingImageGenerationSelectionValidator } from "../domain/GenerationSelection.js";
import type { FileSystemTrainingImageWriter } from "../infrastructure/FileSystemTrainingImageWriter.js";
import type { GenerateTrainingImagesCommandMessage } from "../messages/CommandMessages.js";
import type {
  GetApiCatalogQueryMessage,
  GetGenerationStatusQueryMessage,
  ListSvgFilesQueryMessage,
} from "../messages/QueryMessages.js";
import type {
  ICommandMessageHandler,
  IQueryMessageHandler,
} from "./MessageHandlers.js";

export class GenerateTrainingImagesCommandHandler
  implements ICommandMessageHandler<GenerateTrainingImagesCommandMessage>
{
  private readonly application: TrainingImageGenerationApplication;
  private readonly writer: FileSystemTrainingImageWriter;
  private readonly selectionValidator: TrainingImageGenerationSelectionValidator;

  public constructor(
    application: TrainingImageGenerationApplication,
    writer: FileSystemTrainingImageWriter,
  ) {
    this.application = application;
    this.writer = writer;
    this.selectionValidator = new TrainingImageGenerationSelectionValidator();
  }

  public async Handle(
    command: ICommand<GenerateTrainingImagesCommandMessage>,
  ): Promise<unknown> {
    this.selectionValidator.assertValid(command.message.selection);
    this.writer.configureNoise(command.message.config.noise);

    return this.application.generate(
      command.message.config,
      command.message.selection,
    );
  }
}

export class ListSvgFilesQueryHandler
  implements IQueryMessageHandler<ListSvgFilesQueryMessage>
{
  private readonly application: TrainingImageGenerationApplication;

  public constructor(application: TrainingImageGenerationApplication) {
    this.application = application;
  }

  public async Handle(query: IQuery<ListSvgFilesQueryMessage>): Promise<unknown> {
    return this.application.listSvgFiles(query.message.sourceDirectory);
  }
}

export class GetGenerationStatusQueryHandler
  implements IQueryMessageHandler<GetGenerationStatusQueryMessage>
{
  private readonly application: TrainingImageGenerationApplication;

  public constructor(application: TrainingImageGenerationApplication) {
    this.application = application;
  }

  public async Handle(_: IQuery<GetGenerationStatusQueryMessage>): Promise<unknown> {
    return this.application.getStatus();
  }
}

export class GetApiCatalogQueryHandler
  implements IQueryMessageHandler<GetApiCatalogQueryMessage>
{
  private readonly catalogProvider: IApiCatalogProvider;

  public constructor(catalogProvider: IApiCatalogProvider) {
    this.catalogProvider = catalogProvider;
  }

  public async Handle(_: IQuery<GetApiCatalogQueryMessage>): Promise<unknown> {
    return this.catalogProvider.getCatalog();
  }
}