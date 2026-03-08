// packages/core-console-cli/tests/testing.test.ts

import { describe, expect, it } from 'vitest';
import type { ICommandBase, IQueryBase } from '@monorepo/core-design-patterns-cqrs'; 
import { CliCommandHandler, CliCommand, CliQueryHandler, CliQuery, CliInputTokenizer, CliParser, CommandRegistry, CliRunner, CliOptionSchema, CliActionDefinition, CliInvocationContext, UnknownCommandError } from 'core-console-cli/src/code.js';

export interface TestCommandPayload extends ICommandBase {
  readonly name: string;
  readonly count: number;
  readonly force: boolean;
  readonly tags: readonly string[];
  readonly path?: string;
}

export interface TestQueryPayload extends IQueryBase {
  readonly id: number;
  readonly verbose: boolean;
}

export interface CommandHandlerResult {
  readonly ok: true;
  readonly json: string;
}

export interface QueryHandlerResult {
  readonly found: true;
  readonly id: number;
}

export class RecordingCommandHandler
  implements CliCommandHandler<TestCommandPayload, CommandHandlerResult>
{
  public lastCommand?: CliCommand<TestCommandPayload>;

  public async handle(
    command: CliCommand<TestCommandPayload>,
  ): Promise<CommandHandlerResult> {
    this.lastCommand = command;

    return {
      ok: true,
      json: command.json,
    };
  }
}

export class RecordingQueryHandler
  implements CliQueryHandler<TestQueryPayload, QueryHandlerResult>
{
  public lastQuery?: CliQuery<TestQueryPayload>;

  public async handle(
    query: CliQuery<TestQueryPayload>,
  ): Promise<QueryHandlerResult> {
    this.lastQuery = query;

    return {
      found: true,
      id: query.payload.id,
    };
  }
}

export class CliTestFixture {
  public readonly tokenizer: CliInputTokenizer;
  public readonly parser: CliParser;
  public readonly registry: CommandRegistry;
  public readonly runner: CliRunner;
  public readonly commandHandler: RecordingCommandHandler;
  public readonly queryHandler: RecordingQueryHandler;

  public constructor() {
    this.tokenizer = new CliInputTokenizer();
    this.parser = new CliParser(this.tokenizer);
    this.registry = new CommandRegistry();
    this.commandHandler = new RecordingCommandHandler();
    this.queryHandler = new RecordingQueryHandler();
    this.runner = new CliRunner(this.registry, this.parser);
  }

  public createCommandSchema(): CliOptionSchema {
    return {
      name: { type: 'string', short: 'n' },
      count: { type: 'number', short: 'c', default: 1 },
      force: { type: 'boolean', short: 'f', default: false },
      tag: { type: 'string', short: 't', multiple: true },
      path: { type: 'string', short: 'p' },
    };
  }

  public createQuerySchema(): CliOptionSchema {
    return {
      id: { type: 'number', short: 'i' },
      verbose: { type: 'boolean', short: 'v', default: false },
    };
  }

  public createCommandDefinition(): CliActionDefinition<TestCommandPayload, CommandHandlerResult> {
    return {
      name: 'create',
      type: 'command',
      description: 'Creates a resource',
      aliases: ['c'],
      optionSchema: this.createCommandSchema(),
      buildPayload: (invocation: CliInvocationContext): TestCommandPayload => ({
        name: this.readRequiredString(invocation, 'name'),
        count: this.readNumber(invocation, 'count', 0),
        force: this.readBoolean(invocation, 'force', false),
        tags: this.readStringList(invocation, 'tag'),
        path: this.readOptionalString(invocation, 'path'),
      }),
      handler: this.commandHandler,
    };
  }

  public createQueryDefinition(): CliActionDefinition<TestQueryPayload, QueryHandlerResult> {
    return {
      name: 'get',
      type: 'query',
      description: 'Reads a resource',
      aliases: ['g'],
      optionSchema: this.createQuerySchema(),
      buildPayload: (invocation: CliInvocationContext): TestQueryPayload => ({
        id: this.readNumber(invocation, 'id', 0),
        verbose: this.readBoolean(invocation, 'verbose', false),
      }),
      handler: this.queryHandler,
    };
  }

  public registerDefaults(): this {
    this.registry.register(this.createCommandDefinition());
    this.registry.register(this.createQueryDefinition());
    return this;
  }

  private readRequiredString(invocation: CliInvocationContext, key: string): string {
    const value = invocation.options[key];
    return String(value ?? '');
  }

  private readOptionalString(invocation: CliInvocationContext, key: string): string | undefined {
    const value = invocation.options[key];
    return value === undefined ? undefined : String(value);
  }

  private readNumber(invocation: CliInvocationContext, key: string, fallback: number): number {
    const value = invocation.options[key];
    return value === undefined ? fallback : Number(value);
  }

  private readBoolean(invocation: CliInvocationContext, key: string, fallback: boolean): boolean {
    const value = invocation.options[key];
    return value === undefined ? fallback : Boolean(value);
  }

  private readStringList(invocation: CliInvocationContext, key: string): readonly string[] {
    const value = invocation.options[key];

    if (value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    return [String(value)];
  }
}

export function createCliTestFixture(): CliTestFixture {
  return new CliTestFixture();
}

interface CommandPayload extends ICommandBase {
  readonly name: string;
  readonly count: number;
}

interface QueryPayload extends IQueryBase {
  readonly id: number;
  readonly verbose: boolean;
}

describe('CliCommand', () => {
  it('should expose commandName and payload', () => {
    const payload: CommandPayload = {
      name: 'alpha',
      count: 2,
    };

    const command = new CliCommand<CommandPayload>('create', payload);

    expect(command.commandName).toBe('create');
    expect(command.payload).toEqual(payload);
  });

  it('should serialize payload as json', () => {
    const command = new CliCommand<CommandPayload>('create', {
      name: 'alpha',
      count: 2,
    });

    expect(command.json).toBe('{"name":"alpha","count":2}');
  });
});

describe('CliQuery', () => {
  it('should expose commandName and payload', () => {
    const payload: QueryPayload = {
      id: 7,
      verbose: true,
    };

    const query = new CliQuery<QueryPayload>('get', payload);

    expect(query.commandName).toBe('get');
    expect(query.payload).toEqual(payload);
  });

  it('should serialize payload as json', () => {
    const query = new CliQuery<QueryPayload>('get', {
      id: 7,
      verbose: true,
    });

    expect(query.json).toBe('{"id":7,"verbose":true}');
  });
});

describe('CliInputTokenizer', () => {
  it('should split a plain command line into tokens', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.tokenizer.tokenize('create --name dan --count 2');

    expect(result).toEqual(['create', '--name', 'dan', '--count', '2']);
  });

  it('should keep quoted segments together', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.tokenizer.tokenize('create --name "Dan Edvard" --path "c:\\temp folder"');

    expect(result).toEqual(['create', '--name', 'Dan Edvard', '--path', 'c:temp folder']);
  });

  it('should support single quoted segments', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.tokenizer.tokenize(`create --name 'Dan Edvard'`);

    expect(result).toEqual(['create', '--name', 'Dan Edvard']);
  });

  it('should support escaped whitespace outside quotes', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.tokenizer.tokenize(String.raw`create --path c:\temp\my\ file.txt`);

    expect(result).toEqual(['create', '--path', 'c:tempmy file.txt']);
  });

  it('should return empty collection for empty input', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.tokenizer.tokenize('');

    expect(result).toEqual([]);
  });
});

describe('CliParser', () => {
  it('should split a string input into command and args', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.parser.split('create --name dan --count 2');

    expect(result).toEqual({
      command: 'create',
      args: ['--name', 'dan', '--count', '2'],
    });
  });

  it('should split an argv array into command and args', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.parser.split(['create', '--name', 'dan', '', '--count', '2']);

    expect(result).toEqual({
      command: 'create',
      args: ['--name', 'dan', '--count', '2'],
    });
  });

  it('should parse string, boolean and number options', () => {
    const fixture = createCliTestFixture();

    const result = fixture.parser.parseOptions(
      ['--name', 'dan', '--count', '3', '--force'],
      fixture.createCommandSchema(),
    );

    expect(result.options.name).toBe('dan');
    expect(result.options.count).toBe(3);
    expect(result.options.force).toBe(true);
    expect(result.positionals).toEqual([]);
  });

  it('should parse multiple option values', () => {
    const fixture = createCliTestFixture();

    const result = fixture.parser.parseOptions(
      ['--tag', 'a', '--tag', 'b', '--tag', 'c'],
      fixture.createCommandSchema(),
    );

    expect(result.options.tag).toEqual(['a', 'b', 'c']);
  });

  it('should apply default option values', () => {
    const fixture = createCliTestFixture();

    const result = fixture.parser.parseOptions([], fixture.createCommandSchema());

    expect(result.options.count).toBe(1);
    expect(result.options.force).toBe(false);
  });

  it('should collect positionals', () => {
    const fixture = createCliTestFixture();

    const result = fixture.parser.parseOptions(
      ['alpha', '--name', 'dan', 'beta'],
      fixture.createCommandSchema(),
    );

    expect(result.positionals).toEqual(['alpha', 'beta']);
  });

  it('should parse a full raw input', async () => {
    const fixture = createCliTestFixture();

    const result = await fixture.parser.parse(
      'create --name "Dan Edvard" --count 4 --force',
      fixture.createCommandSchema(),
    );

    expect(result.command).toBe('create');
    expect(result.args).toEqual(['--name', 'Dan Edvard', '--count', '4', '--force']);
    expect(result.options.name).toBe('Dan Edvard');
    expect(result.options.count).toBe(4);
    expect(result.options.force).toBe(true);
  });

  it('should throw for invalid numeric values', () => {
    const fixture = createCliTestFixture();

    expect(() =>
      fixture.parser.parseOptions(['--count', 'NaN-value'], fixture.createCommandSchema()),
    ).toThrowError('Invalid value for --count: expected a number, got "NaN-value"');
  });
});

describe('CommandRegistry', () => {
  it('should register and resolve a definition by name', () => {
    const fixture = createCliTestFixture();
    const definition = fixture.createCommandDefinition();

    fixture.registry.register(definition);

    expect(fixture.registry.get('create')).toBe(definition);
  });

  it('should register and resolve aliases', () => {
    const fixture = createCliTestFixture();
    const definition = fixture.createCommandDefinition();

    fixture.registry.register(definition);

    expect(fixture.registry.get('c')).toBe(definition);
  });

  it('should return undefined when command is missing', () => {
    const fixture = createCliTestFixture();

    expect(fixture.registry.get('missing')).toBeUndefined();
  });

  it('should return unique definitions from list', () => {
    const fixture = createCliTestFixture().registerDefaults();

    const result = fixture.registry.list();

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.name)).toEqual(['create', 'get']);
  });

  it('should throw when name is registered twice', () => {
    const fixture = createCliTestFixture();
    const definition = fixture.createCommandDefinition();

    fixture.registry.register(definition);

    expect(() => fixture.registry.register(definition)).toThrowError(
      'CLI action already registered for "create"',
    );
  });

  it('should throw when alias collides with another action name', () => {
    const fixture = createCliTestFixture();

    fixture.registry.register({
      ...fixture.createCommandDefinition(),
      aliases: ['shared'],
    });

    expect(() =>
      fixture.registry.register({
        ...fixture.createQueryDefinition(),
        name: 'shared',
        aliases: [],
      }),
    ).toThrowError('CLI action already registered for "shared"');
  });
});

describe('CliRunner', () => {
  it('should throw UnknownCommandError when no command is provided', async () => {
    const fixture = createCliTestFixture();

    await expect(fixture.runner.execute('')).rejects.toBeInstanceOf(UnknownCommandError);
    await expect(fixture.runner.execute('')).rejects.toThrowError('No command provided');
  });

  it('should throw UnknownCommandError when command is not registered', async () => {
    const fixture = createCliTestFixture();

    await expect(fixture.runner.execute('missing --id 1')).rejects.toBeInstanceOf(UnknownCommandError);
    await expect(fixture.runner.execute('missing --id 1')).rejects.toThrowError(
      'Unknown command "missing"',
    );
  });

  it('should execute a command handler', async () => {
    const fixture = createCliTestFixture().registerDefaults();

    const result = await fixture.runner.execute(
      'create --name "Dan Edvard" --count 4 --force --tag a --tag b --path /tmp/file.txt',
    );

    expect(result.definition.name).toBe('create');
    expect(result.invocation.command).toBe('create');
    expect(result.invocation.options.name).toBe('Dan Edvard');
    expect(result.invocation.options.count).toBe(4);
    expect(result.invocation.options.force).toBe(true);
    expect(result.invocation.options.tag).toEqual(['a', 'b']);
    expect(result.payload).toEqual({
      name: 'Dan Edvard',
      count: 4,
      force: true,
      tags: ['a', 'b'],
      path: '/tmp/file.txt',
    });
    expect(result.result).toEqual({
      ok: true,
      json: '{"name":"Dan Edvard","count":4,"force":true,"tags":["a","b"],"path":"/tmp/file.txt"}',
    });

    expect(fixture.commandHandler.lastCommand).toBeInstanceOf(CliCommand);
    expect(fixture.commandHandler.lastCommand?.commandName).toBe('create');
    expect(fixture.commandHandler.lastCommand?.payload).toEqual(result.payload);
  });

  it('should execute a query handler', async () => {
    const fixture = createCliTestFixture().registerDefaults();

    const result = await fixture.runner.execute('get --id 42 --verbose');

    expect(result.definition.name).toBe('get');
    expect(result.invocation.command).toBe('get');
    expect(result.payload).toEqual({
      id: 42,
      verbose: true,
    });
    expect(result.result).toEqual({
      found: true,
      id: 42,
    });

    expect(fixture.queryHandler.lastQuery).toBeInstanceOf(CliQuery);
    expect(fixture.queryHandler.lastQuery?.commandName).toBe('get');
    expect(fixture.queryHandler.lastQuery?.payload).toEqual(result.payload);
  });

  it('should execute command aliases', async () => {
    const fixture = createCliTestFixture().registerDefaults();

    const result = await fixture.runner.execute('c --name dan --count 2');

    expect(result.definition.name).toBe('create');
    expect(result.invocation.command).toBe('c');
    expect(result.payload).toEqual({
      name: 'dan',
      count: 2,
      force: false,
      tags: [],
      path: undefined,
    });
  });

  it('should execute query aliases through executeArgs', async () => {
    const fixture = createCliTestFixture().registerDefaults();

    const result = await fixture.runner.executeArgs(['g', '--id', '9']);

    expect(result.definition.name).toBe('get');
    expect(result.invocation.command).toBe('g');
    expect(result.payload).toEqual({
      id: 9,
      verbose: false,
    });
  });

  it('should list registered actions', () => {
    const fixture = createCliTestFixture().registerDefaults();

    const result = fixture.runner.listActions();

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.name)).toEqual(['create', 'get']);
  });
});

describe('core-console-cli exports', () => {
  it('should export the public api', () => {
    expect(CliCommand).toBeTypeOf('function');
    expect(CliQuery).toBeTypeOf('function');
    expect(CliInputTokenizer).toBeTypeOf('function');
    expect(CliParser).toBeTypeOf('function');
    expect(CommandRegistry).toBeTypeOf('function');
    expect(CliRunner).toBeTypeOf('function');
    expect(UnknownCommandError).toBeTypeOf('function');
  });
});