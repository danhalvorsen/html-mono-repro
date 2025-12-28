import { CliParser } from '../parser/CliParser.js';
import { CommandRegistry } from '../registry/CommandRegistry.js';
import { CliCommand } from '../command/CliCommand.js';
import { CliQuery } from '../command/CliQuery.js';
import type { CliActionDefinition, CliInvocationContext, CliCommandHandler, CliQueryHandler } from '../types.js';

export class UnknownCommandError extends Error {
  constructor(command?: string) {
    super(command ? `Unknown command "${command}"` : 'No command provided');
  }
}

export interface CliExecutionResult<TPayload, TResult> {
  definition: CliActionDefinition<TPayload, TResult>;
  invocation: CliInvocationContext;
  payload: TPayload;
  result: Awaited<TResult>;
}

export class CliRunner {
  constructor(private readonly registry: CommandRegistry, private readonly parser = new CliParser()) {}

  async execute(rawInput: string | string[]): Promise<CliExecutionResult<unknown, unknown>> {
    const split = this.parser.split(rawInput);
    if (!split.command) {
      throw new UnknownCommandError();
    }

    const definition = this.registry.get(split.command);
    if (!definition) {
      throw new UnknownCommandError(split.command);
    }

    const parsed = this.parser.parseOptions(split.args, definition.optionSchema);
    const invocation: CliInvocationContext = {
      command: split.command,
      args: split.args,
      ...parsed,
    };

    const payload = definition.buildPayload(invocation);

    const handlerResult =
      definition.type === 'query'
        ? (definition.handler as CliQueryHandler<unknown, unknown>).handle({
            commandName: definition.name,
            payload,
          })
        : (definition.handler as CliCommandHandler<unknown, unknown>).handle({
            commandName: definition.name,
            payload,
          });

    const result = await handlerResult;

    return {
      definition,
      invocation,
      payload,
      result,
    };
  }

  executeArgs(args: string[]): Promise<CliExecutionResult<unknown, unknown>> {
    return this.execute(args);
  }

  listActions(): CliActionDefinition<unknown, unknown>[] {
    return this.registry.list();
  }
}
