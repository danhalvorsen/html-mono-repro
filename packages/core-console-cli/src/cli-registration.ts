// packages/core-console-cli/src/cli-registration.ts

import type {
  ICommandBase,
  IQueryBase,
} from '@monorepo/core-design-patterns-cqrs';
import {
  CommandRegistry,
  type CliActionDefinition,
  type CliActionType,
  type CliCommandHandler,
  type CliInvocationContext,
  type CliOptionSchema,
  type CliQueryHandler,
} from './code.js';

export interface ICliTypeMetadata {
  readonly name: string;
  readonly type: CliActionType;
  readonly description: string;
  readonly aliases?: readonly string[];
  readonly optionSchema?: CliOptionSchema;
}

export interface ICommandClass<TPayload extends ICommandBase> {
  new (...args: never[]): TPayload;
  readonly cli: ICliTypeMetadata & { readonly type: 'command' };
}

export interface IQueryClass<TPayload extends IQueryBase> {
  new (...args: never[]): TPayload;
  readonly cli: ICliTypeMetadata & { readonly type: 'query' };
}

export interface IPayloadFactory<TPayload> {
  create(invocation: CliInvocationContext): TPayload;
}

export interface ICliTypeRegistrar {
  registerCommand<TPayload extends ICommandBase, TResult>(
    commandClass: ICommandClass<TPayload>,
    payloadFactory: IPayloadFactory<TPayload>,
    handler: CliCommandHandler<TPayload, TResult>,
  ): void;

  registerQuery<TPayload extends IQueryBase, TResult>(
    queryClass: IQueryClass<TPayload>,
    payloadFactory: IPayloadFactory<TPayload>,
    handler: CliQueryHandler<TPayload, TResult>,
  ): void;
}

export class CliTypeRegistrar implements ICliTypeRegistrar {
  public constructor(
    private readonly registry: CommandRegistry,
  ) {}

  public registerCommand<TPayload extends ICommandBase, TResult>(
    commandClass: ICommandClass<TPayload>,
    payloadFactory: IPayloadFactory<TPayload>,
    handler: CliCommandHandler<TPayload, TResult>,
  ): void {
    const definition: CliActionDefinition<TPayload, TResult> = {
      name: commandClass.cli.name,
      type: 'command',
      description: commandClass.cli.description,
      aliases: commandClass.cli.aliases ? [...commandClass.cli.aliases] : undefined,
      optionSchema: commandClass.cli.optionSchema,
      buildPayload: (invocation) => payloadFactory.create(invocation),
      handler,
    };

    this.registry.register(definition);
  }

  public registerQuery<TPayload extends IQueryBase, TResult>(
    queryClass: IQueryClass<TPayload>,
    payloadFactory: IPayloadFactory<TPayload>,
    handler: CliQueryHandler<TPayload, TResult>,
  ): void {
    const definition: CliActionDefinition<TPayload, TResult> = {
      name: queryClass.cli.name,
      type: 'query',
      description: queryClass.cli.description,
      aliases: queryClass.cli.aliases ? [...queryClass.cli.aliases] : undefined,
      optionSchema: queryClass.cli.optionSchema,
      buildPayload: (invocation) => payloadFactory.create(invocation),
      handler,
    };

    this.registry.register(definition);
  }
}

export class DelegatePayloadFactory<TPayload> implements IPayloadFactory<TPayload> {
  public constructor(
    private readonly factory: (invocation: CliInvocationContext) => TPayload,
  ) {}

  public create(invocation: CliInvocationContext): TPayload {
    return this.factory(invocation);
  }
}

export function createPayloadFactory<TPayload>(
  factory: (invocation: CliInvocationContext) => TPayload,
): IPayloadFactory<TPayload> {
  return new DelegatePayloadFactory(factory);
}