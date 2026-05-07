import type { ICommand } from "@monorepo/core-design-patterns-cqrs-no-json";
import { GenerateRasterGraphicsCommand } from "../Commands/GenerateRasterGraphicsCommand.js";
import { GenerateRasterGraphicsCommandHandler } from "../application/Handlers/GenerateRasterGraphicsCommandHandler.js";
import type { GenerateRasterGraphicsCommandMessage } from "../messages/CommandMessages.js";
import type { ICommandMessageHandler } from "./MessageHandlers.js";

export class GenerateRasterGraphicsCommandMessageHandler
  implements ICommandMessageHandler<GenerateRasterGraphicsCommandMessage>
{
  public constructor(
    private readonly handler: GenerateRasterGraphicsCommandHandler,
  ) {}

  public async Handle(
    command: ICommand<GenerateRasterGraphicsCommandMessage>,
  ): Promise<unknown> {
    const message = command.message;

    return await this.handler.handle(
      new GenerateRasterGraphicsCommand(
        message.category,
        message.itemName,
        message.formats,
        message.stepDegrees,
        message.resolutions,
      ),
    );
  }
}