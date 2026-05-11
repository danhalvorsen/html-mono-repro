import { Ok, type Result } from "@monorepo/core-design-patterns";
import { CommandHandler, type ICommand } from "@monorepo/core-design-patterns-cqrs-no-json";
import {
  type FooCommandError,
  type FooCommandMessage,
  type FooCommandResult,
} from "./FooCommand.js";

export abstract class FooCommandHandlerContract extends CommandHandler<
  FooCommandMessage,
  FooCommandResult,
  FooCommandError
> {}

export class FooCommandHandler extends FooCommandHandlerContract {
  public async Handle(
    command: ICommand<FooCommandMessage>,
  ): Promise<Result<FooCommandResult, FooCommandError>> {
    return Ok(Object.freeze({
      value: command.message.value + 1,
      message: command.message.message,
      handlerName: "FooCommandHandler",
    }));
  }
}
