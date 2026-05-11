import { ICommand } from "@monorepo/core-design-patterns-cqrs-no-json";

export type FooCommandResult = Readonly<{
  readonly value: number;
  readonly message: string;
  readonly handlerName: "FooCommandHandler";
}>;

export type FooCommandMessage = Readonly<{
  readonly value: number;
  readonly message: string;
  readonly handlerName: "FooCommandHandler";
}>;

export type FooCommandError = Readonly<{
  readonly code: "FOO_COMMAND_ERROR";
  readonly message: string;
}>;

export class FooCommand implements ICommand<FooCommandMessage> {
  public readonly message: FooCommandMessage;

  public constructor(
    public readonly value: number,
  ) {
    this.message = Object.freeze({
      value,
      message: `Foo:${value}`,
      handlerName: "FooCommandHandler",
    });
  }
}
