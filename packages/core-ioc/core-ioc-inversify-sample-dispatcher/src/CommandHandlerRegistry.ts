import type {
  ServiceKey,
} from "@monorepo/core-ioc-inversify/new";
import {
  IocResolutionError,
} from "@monorepo/core-ioc-inversify/new";

export type RequestConstructor<TRequest extends object = object> =
  abstract new (...args: any[]) => TRequest;

export type CommandHandlerRegistration = Readonly<{
  readonly CommandType: RequestConstructor;
  readonly HandlerType: ServiceKey<object>;
}>;

export class CommandHandlerRegistry {
  private readonly handlerByCommandType: ReadonlyMap<Function, ServiceKey<object>>;

  public constructor(
    registrations: readonly CommandHandlerRegistration[],
  ) {
    this.handlerByCommandType = new Map(
      registrations.map((registration) => [
        registration.CommandType,
        registration.HandlerType,
      ]),
    );
  }

  public Resolve(command: object): ServiceKey<object> {
    const handlerType = this.handlerByCommandType.get(command.constructor);

    if (handlerType === undefined) {
      throw new IocResolutionError(
        `Command dispatch failed. No command handler is registered for command='${command.constructor.name}'.`,
      );
    }

    return handlerType;
  }
}