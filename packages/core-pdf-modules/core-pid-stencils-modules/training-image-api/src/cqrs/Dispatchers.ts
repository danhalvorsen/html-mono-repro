import { Command, Query } from "@monorepo/core-design-patterns-cqrs-no-json";
import {
  CommandMessageType,
  type CommandMessage,
  type GenerateRasterGraphicsCommandMessage,
  type GenerateTrainingImagesCommandMessage,
} from "../messages/CommandMessages.js";
import {
  QueryMessageType,
  type GetApiCatalogQueryMessage,
  type GetGenerationStatusQueryMessage,
  type ListSvgFilesQueryMessage,
  type QueryMessage,
} from "../messages/QueryMessages.js";
import type {
  ICommandMessageHandler,
  IQueryMessageHandler,
} from "./MessageHandlers.js";

export interface ApiDispatchResponse {
  readonly ok: boolean;
  readonly data?: unknown;
  readonly error?: string;
}

export class CommandDispatcher {
  private readonly generateTrainingImagesHandler:
    ICommandMessageHandler<GenerateTrainingImagesCommandMessage>;

  private readonly generateRasterGraphicsHandler:
    | ICommandMessageHandler<GenerateRasterGraphicsCommandMessage>
    | undefined;

  public constructor(
    generateTrainingImagesHandler:
      ICommandMessageHandler<GenerateTrainingImagesCommandMessage>,
    generateRasterGraphicsHandler?:
      ICommandMessageHandler<GenerateRasterGraphicsCommandMessage>,
  ) {
    this.generateTrainingImagesHandler = generateTrainingImagesHandler;
    this.generateRasterGraphicsHandler = generateRasterGraphicsHandler;
  }

  public async dispatch(message: CommandMessage): Promise<ApiDispatchResponse> {
    console.info("[training-image-api] command-dispatch", {
      type: message.type,
    });

    try {
      if (message.type === CommandMessageType.GenerateTrainingImages) {
        return {
          ok: true,
          data: await this.generateTrainingImagesHandler.Handle(
            new Command(message),
          ),
        };
      }

      if (message.type === CommandMessageType.GenerateRasterGraphicsCommand) {
        if (this.generateRasterGraphicsHandler === undefined) {
          return {
            ok: false,
            error: `Unsupported command type: ${message.type}`,
          };
        }

        return {
          ok: true,
          data: await this.generateRasterGraphicsHandler.Handle(
            new Command(message),
          ),
        };
      }

      return {
        ok: false,
        error: `Unsupported command type: ${(message as { readonly type?: string }).type}`,
      };
    }
    catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export class QueryDispatcher {
  private readonly listSvgFilesHandler:
    IQueryMessageHandler<ListSvgFilesQueryMessage>;

  private readonly getGenerationStatusHandler:
    IQueryMessageHandler<GetGenerationStatusQueryMessage>;

  private readonly getApiCatalogHandler:
    IQueryMessageHandler<GetApiCatalogQueryMessage>;

  public constructor(
    listSvgFilesHandler: IQueryMessageHandler<ListSvgFilesQueryMessage>,
    getGenerationStatusHandler: IQueryMessageHandler<GetGenerationStatusQueryMessage>,
    getApiCatalogHandler: IQueryMessageHandler<GetApiCatalogQueryMessage>,
  ) {
    this.listSvgFilesHandler = listSvgFilesHandler;
    this.getGenerationStatusHandler = getGenerationStatusHandler;
    this.getApiCatalogHandler = getApiCatalogHandler;
  }

  public async dispatch(message: QueryMessage): Promise<ApiDispatchResponse> {
    console.info("[training-image-api] query-dispatch", {
      type: message.type,
    });

    try {
      if (message.type === QueryMessageType.ListSvgFiles) {
        return {
          ok: true,
          data: await this.listSvgFilesHandler.Handle(new Query(message)),
        };
      }

      if (message.type === QueryMessageType.GetGenerationStatus) {
        return {
          ok: true,
          data: await this.getGenerationStatusHandler.Handle(new Query(message)),
        };
      }

      if (message.type === QueryMessageType.GetApiCatalog) {
        return {
          ok: true,
          data: await this.getApiCatalogHandler.Handle(new Query(message)),
        };
      }

      return {
        ok: false,
        error: `Unsupported query type: ${(message as { readonly type?: string }).type}`,
      };
    }
    catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}