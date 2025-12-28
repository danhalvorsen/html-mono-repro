import type { CliOptionSchema, CliParsedOptions } from './parser/CliParser.js';

export type CliActionType = 'command' | 'query';

export interface CliInvocationContext extends CliParsedOptions {
  command?: string;
  args: string[];
}

export interface CliCommandHandler<TPayload, TResult> {
  handle(command: { commandName: string; payload: TPayload }): Promise<TResult>;
}

export interface CliQueryHandler<TPayload, TResult> {
  handle(query: { commandName: string; payload: TPayload }): Promise<TResult>;
}

export interface CliActionDefinition<TPayload, TResult> {
  name: string;
  type: CliActionType;
  description: string;
  aliases?: string[];
  optionSchema?: CliOptionSchema;
  buildPayload: (invocation: CliInvocationContext) => TPayload;
  handler: CliCommandHandler<TPayload, TResult> | CliQueryHandler<TPayload, TResult>;
}
