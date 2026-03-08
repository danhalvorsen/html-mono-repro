// ============================================================================
// packages/core-console-cli/src/code.ts
// ============================================================================

import type {
  ICommand,
  ICommandBase,
  IQuery,
  IQueryBase,
} from '@monorepo/core-design-patterns-cqrs';
import { parseArgs } from 'node:util';
import { CliInputTokenizer, type IInputTokenizer } from './fsm.js';

export class CliCommand<TPayload extends ICommandBase> implements ICommand<TPayload> {
  public constructor(
    public readonly commandName: string,
    public readonly payload: TPayload,
  ) {}

  public get json(): string {
    return JSON.stringify(this.payload);
  }
}

export class CliQuery<TPayload extends IQueryBase> implements IQuery<TPayload> {
  public constructor(
    public readonly commandName: string,
    public readonly payload: TPayload,
  ) {}

  public get json(): string {
    return JSON.stringify(this.payload);
  }
}

export type CliOptionType = 'string' | 'boolean' | 'number';
export type CliOptionValue = string | boolean | number;
export type CliOptionParsedValue = CliOptionValue | CliOptionValue[] | undefined;

type NodeOptionType = 'string' | 'boolean';

interface NodeOptionConfig {
  readonly type: NodeOptionType;
  readonly multiple: boolean;
  readonly short?: string;
  readonly default?: string | boolean | string[] | boolean[];
}

type NodeOptionsConfig = Record<string, NodeOptionConfig>;

export interface CliOptionDefinition {
  readonly type: CliOptionType;
  readonly short?: string;
  readonly multiple?: boolean;
  readonly default?: CliOptionValue;
  readonly description?: string;
}

export type CliOptionSchema = Record<string, CliOptionDefinition>;

export interface CliSplit {
  readonly command?: string;
  readonly args: string[];
}

export interface CliParsedOptions {
  readonly options: Record<string, CliOptionParsedValue>;
  readonly positionals: string[];
}

export interface CliParsedInvocation extends CliParsedOptions {
  readonly command?: string;
  readonly args: string[];
}

export interface INodeOptionSchemaMapper {
  map(schema: CliOptionSchema): NodeOptionsConfig;
}

export interface IOptionValueNormalizer {
  normalize(
    schema: CliOptionSchema,
    values: Record<string, CliOptionParsedValue>,
  ): Record<string, CliOptionParsedValue>;
}

// packages/core-console-cli/src/code.ts

export class NodeOptionSchemaMapper implements INodeOptionSchemaMapper {
  public map(schema: CliOptionSchema): NodeOptionsConfig {
    const options: NodeOptionsConfig = {};

    for (const [name, definition] of Object.entries(schema)) {
      options[name] = this.createOption(definition);
    }

    return options;
  }

  private createOption(definition: CliOptionDefinition): NodeOptionConfig {
    const option: NodeOptionConfig = {
      type: this.mapType(definition.type),
      multiple: definition.multiple ?? false,
    };

    if (definition.short !== undefined) {
      option.short = definition.short;
    }

    const defaultValue = this.mapDefault(definition);
    if (defaultValue !== undefined) {
      option.default = defaultValue;
    }

    return option;
  }

  private mapType(type: CliOptionType): NodeOptionType {
    return type === 'number' ? 'string' : type;
  }

  private mapDefault(
    definition: CliOptionDefinition,
  ): NodeOptionConfig['default'] | undefined {
    if (definition.default === undefined) {
      return undefined;
    }

    if (definition.type === 'number') {
      const value = String(definition.default);
      return definition.multiple ? [value] : value;
    }

    if (definition.type === 'string') {
      const value = String(definition.default);
      return definition.multiple ? [value] : value;
    }

    const value = Boolean(definition.default);
    return definition.multiple ? [value] : value;
  }
}

export class OptionValueNormalizer implements IOptionValueNormalizer {
  public normalize(
    schema: CliOptionSchema,
    values: Record<string, CliOptionParsedValue>,
  ): Record<string, CliOptionParsedValue> {
    const normalized: Record<string, CliOptionParsedValue> = { ...values };

    for (const [name, definition] of Object.entries(schema)) {
      if (definition.type !== 'number') {
        continue;
      }

      const value = normalized[name];
      if (value === undefined) {
        continue;
      }

      normalized[name] = Array.isArray(value)
        ? value.map((item) => this.toNumber(item, name))
        : this.toNumber(value, name);
    }

    return normalized;
  }

  private toNumber(value: unknown, optionName: string): number {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      throw new Error(
        `Invalid value for --${optionName}: expected a number, got ${JSON.stringify(value)}`,
      );
    }

    return numericValue;
  }
}

export class CliParser {
  public constructor(
    private readonly tokenizer: IInputTokenizer = new CliInputTokenizer(),
    private readonly optionSchemaMapper: INodeOptionSchemaMapper = new NodeOptionSchemaMapper(),
    private readonly optionValueNormalizer: IOptionValueNormalizer = new OptionValueNormalizer(),
  ) {}

  public async split(rawInput: string | string[]): Promise<CliSplit> {
    const tokens = await this.normalizeInput(rawInput);
    const args = [...tokens];
    const command = args.shift();

    return {
      command,
      args,
    };
  }

  public parseOptions(args: string[], schema: CliOptionSchema = {}): CliParsedOptions {
    const { values, positionals } = parseArgs({
      args,
      options: this.optionSchemaMapper.map(schema),
      strict: false,
      allowPositionals: true,
    });

    return {
      options: this.optionValueNormalizer.normalize(schema, { ...values }),
      positionals,
    };
  }

  public async parse(
    rawInput: string | string[],
    schema: CliOptionSchema = {},
  ): Promise<CliParsedInvocation> {
    const split = await this.split(rawInput);
    const parsed = this.parseOptions(split.args, schema);

    return {
      command: split.command,
      args: split.args,
      ...parsed,
    };
  }

  private async normalizeInput(rawInput: string | string[]): Promise<string[]> {
    if (Array.isArray(rawInput)) {
      return rawInput.filter((token) => token.length > 0);
    }

    return this.tokenizer.tokenize(rawInput);
  }
}

export type CliActionType = 'command' | 'query';

export interface CliInvocationContext extends CliParsedOptions {
  readonly command?: string;
  readonly args: string[];
}

export interface ICommandHandler<TCommand, TResult> {
  handle(command: TCommand): Promise<TResult> | TResult;
}

export interface IQueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<TResult> | TResult;
}

export type CliCommandHandler<TPayload extends ICommandBase, TResult> =
  ICommandHandler<CliCommand<TPayload>, TResult>;

export type CliQueryHandler<TPayload extends IQueryBase, TResult> =
  IQueryHandler<CliQuery<TPayload>, TResult>;

export interface CliActionDefinition<TPayload extends ICommandBase | IQueryBase, TResult> {
  readonly name: string;
  readonly type: CliActionType;
  readonly description: string;
  readonly aliases?: string[];
  readonly optionSchema?: CliOptionSchema;
  readonly buildPayload: (invocation: CliInvocationContext) => TPayload;
  readonly handler: CliCommandHandler<TPayload, TResult> | CliQueryHandler<TPayload, TResult>;
}

export class CommandRegistry {
  private readonly commands = new Map<
    string,
    CliActionDefinition<ICommandBase | IQueryBase, unknown>
  >();

  public register(definition: CliActionDefinition<ICommandBase | IQueryBase, unknown>): void {
    this.record(definition.name, definition);

    for (const alias of definition.aliases ?? []) {
      this.record(alias, definition);
    }
  }

  public get(name?: string): CliActionDefinition<ICommandBase | IQueryBase, unknown> | undefined {
    if (!name) {
      return undefined;
    }

    return this.commands.get(name);
  }

  public list(): CliActionDefinition<ICommandBase | IQueryBase, unknown>[] {
    const uniqueDefinitions = new Set<CliActionDefinition<ICommandBase | IQueryBase, unknown>>();

    for (const definition of this.commands.values()) {
      uniqueDefinitions.add(definition);
    }

    return [...uniqueDefinitions];
  }

  private record(
    key: string,
    definition: CliActionDefinition<ICommandBase | IQueryBase, unknown>,
  ): void {
    if (this.commands.has(key)) {
      throw new Error(`CLI action already registered for "${key}"`);
    }

    this.commands.set(key, definition);
  }
}

export class UnknownCommandError extends Error {
  public constructor(command?: string) {
    super(command ? `Unknown command "${command}"` : 'No command provided');
    this.name = 'UnknownCommandError';
  }
}

export interface CliExecutionResult<TPayload extends ICommandBase | IQueryBase, TResult> {
  readonly definition: CliActionDefinition<TPayload, TResult>;
  readonly invocation: CliInvocationContext;
  readonly payload: TPayload;
  readonly result: Awaited<TResult>;
}

export class CliRunner {
  public constructor(
    private readonly registry: CommandRegistry,
    private readonly parser: CliParser = new CliParser(),
  ) {}

  public async execute(
    rawInput: string | string[],
  ): Promise<CliExecutionResult<ICommandBase | IQueryBase, unknown>> {
    const split = await this.parser.split(rawInput);

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

    const result =
      definition.type === 'query'
        ? await (definition.handler as CliQueryHandler<IQueryBase, unknown>).handle(
            new CliQuery(definition.name, payload as IQueryBase),
          )
        : await (definition.handler as CliCommandHandler<ICommandBase, unknown>).handle(
            new CliCommand(definition.name, payload as ICommandBase),
          );

    return {
      definition,
      invocation,
      payload,
      result,
    };
  }

  public executeArgs(
    args: string[],
  ): Promise<CliExecutionResult<ICommandBase | IQueryBase, unknown>> {
    return this.execute(args);
  }

  public listActions(): CliActionDefinition<ICommandBase | IQueryBase, unknown>[] {
    return this.registry.list();
  }
}