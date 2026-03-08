// packages/core-console-cli/tests/CliTypeRegistrar.test.ts

import { describe, expect, it } from 'vitest';
import type {
  ICommandBase,
  IQueryBase,
} from '@monorepo/core-design-patterns-cqrs';
import {
  CliInputTokenizer,
  CliParser,
  CliRunner,
  CliTypeRegistrar,
  CommandRegistry,
  createPayloadFactory,
  type CliInvocationContext,
} from '../src/index.js';

interface AddDigitCommandPayload extends ICommandBase {
  readonly digit: number;
}

interface SumDigitsCommandPayload extends ICommandBase {
  readonly left: number;
  readonly right: number;
}

interface GetDigitQueryPayload extends IQueryBase {
  readonly digit: number;
}

interface FindRangeQueryPayload extends IQueryBase {
  readonly start: number;
  readonly end: number;
  readonly includeEnd: boolean;
}

class AddDigitCommand implements AddDigitCommandPayload {
  public static readonly cli = {
    name: 'addDigit',
    type: 'command' as const,
    description: 'Adds a digit',
    aliases: ['add-digit'],
    optionSchema: {
      digit: { type: 'number', short: 'd' as const },
    },
  };

  public constructor(
    public readonly digit: number,
  ) {}
}

class SumDigitsCommand implements SumDigitsCommandPayload {
  public static readonly cli = {
    name: 'sumDigits',
    type: 'command' as const,
    description: 'Sums two digits',
    aliases: ['sum-digits'],
    optionSchema: {
      left: { type: 'number', short: 'l' as const },
      right: { type: 'number', short: 'r' as const },
    },
  };

  public constructor(
    public readonly left: number,
    public readonly right: number,
  ) {}
}

class GetDigitQuery implements GetDigitQueryPayload {
  public static readonly cli = {
    name: 'getDigit',
    type: 'query' as const,
    description: 'Gets one digit',
    aliases: ['get-digit'],
    optionSchema: {
      digit: { type: 'number', short: 'd' as const },
    },
  };

  public constructor(
    public readonly digit: number,
  ) {}
}

class FindRangeQuery implements FindRangeQueryPayload {
  public static readonly cli = {
    name: 'findRange',
    type: 'query' as const,
    description: 'Finds a numeric range',
    aliases: ['find-range'],
    optionSchema: {
      start: { type: 'number', short: 's' as const },
      end: { type: 'number', short: 'e' as const },
      includeEnd: { type: 'boolean', short: 'i' as const, default: false },
    },
  };

  public constructor(
    public readonly start: number,
    public readonly end: number,
    public readonly includeEnd: boolean,
  ) {}
}

final class CliTypeRegistrarFixture {
  public createRegistry(): CommandRegistry {
    return new CommandRegistry();
  }

  public createRegistrar(registry: CommandRegistry): CliTypeRegistrar {
    return new CliTypeRegistrar(registry);
  }

  public createRunner(registry: CommandRegistry): CliRunner {
    return new CliRunner(
      registry,
      new CliParser(new CliInputTokenizer()),
    );
  }

  public registerAddDigitCommand(
    registrar: CliTypeRegistrar,
    onHandle?: (command: AddDigitCommand) => unknown,
  ): void {
    registrar.registerCommand(
      AddDigitCommand,
      createPayloadFactory((invocation: CliInvocationContext) => {
        return new AddDigitCommand(invocation.options.digit as number);
      }),
      {
        handle: (command) => {
          const payload = command.payload as AddDigitCommand;
          return onHandle?.(payload) ?? payload.digit;
        },
      },
    );
  }

  public registerSumDigitsCommand(
    registrar: CliTypeRegistrar,
    onHandle?: (command: SumDigitsCommand) => unknown,
  ): void {
    registrar.registerCommand(
      SumDigitsCommand,
      createPayloadFactory((invocation: CliInvocationContext) => {
        return new SumDigitsCommand(
          invocation.options.left as number,
          invocation.options.right as number,
        );
      }),
      {
        handle: (command) => {
          const payload = command.payload as SumDigitsCommand;
          return onHandle?.(payload) ?? payload.left + payload.right;
        },
      },
    );
  }

  public registerGetDigitQuery(
    registrar: CliTypeRegistrar,
    onHandle?: (query: GetDigitQuery) => unknown,
  ): void {
    registrar.registerQuery(
      GetDigitQuery,
      createPayloadFactory((invocation: CliInvocationContext) => {
        return new GetDigitQuery(invocation.options.digit as number);
      }),
      {
        handle: (query) => {
          const payload = query.payload as GetDigitQuery;
          return onHandle?.(payload) ?? { value: payload.digit };
        },
      },
    );
  }

  public registerFindRangeQuery(
    registrar: CliTypeRegistrar,
    onHandle?: (query: FindRangeQuery) => unknown,
  ): void {
    registrar.registerQuery(
      FindRangeQuery,
      createPayloadFactory((invocation: CliInvocationContext) => {
        return new FindRangeQuery(
          invocation.options.start as number,
          invocation.options.end as number,
          invocation.options.includeEnd as boolean,
        );
      }),
      {
        handle: (query) => {
          const payload = query.payload as FindRangeQuery;
          return (
            onHandle?.(payload) ?? {
              start: payload.start,
              end: payload.end,
              includeEnd: payload.includeEnd,
            }
          );
        },
      },
    );
  }
}

describe('CliTypeRegistrar', () => {
  const fixture = new CliTypeRegistrarFixture();

  it('registers a command class and executes it through CliRunner', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerAddDigitCommand(registrar);

    const result = await runner.executeArgs(['addDigit', '--digit', '12']);

    expect(result.definition.name).toBe('addDigit');
    expect(result.definition.type).toBe('command');
    expect(result.invocation.command).toBe('addDigit');
    expect(result.payload).toEqual(new AddDigitCommand(12));
    expect(result.result).toBe(12);
  });

  it('registers a query class and executes it through CliRunner', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerGetDigitQuery(registrar);

    const result = await runner.executeArgs(['getDigit', '--digit', '21']);

    expect(result.definition.name).toBe('getDigit');
    expect(result.definition.type).toBe('query');
    expect(result.invocation.command).toBe('getDigit');
    expect(result.payload).toEqual(new GetDigitQuery(21));
    expect(result.result).toEqual({ value: 21 });
  });

  it('uses command aliases from class metadata', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerAddDigitCommand(registrar);

    const result = await runner.executeArgs(['add-digit', '--digit', '9']);

    expect(result.definition.name).toBe('addDigit');
    expect(result.payload).toEqual(new AddDigitCommand(9));
    expect(result.result).toBe(9);
  });

  it('uses query aliases from class metadata', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerGetDigitQuery(registrar);

    const result = await runner.executeArgs(['get-digit', '--digit', '7']);

    expect(result.definition.name).toBe('getDigit');
    expect(result.payload).toEqual(new GetDigitQuery(7));
    expect(result.result).toEqual({ value: 7 });
  });

  it('uses optionSchema from command class metadata', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerSumDigitsCommand(registrar);

    const result = await runner.executeArgs([
      'sumDigits',
      '--left',
      '10',
      '--right',
      '20',
    ]);

    expect(result.payload).toEqual(new SumDigitsCommand(10, 20));
    expect(result.result).toBe(30);
  });

  it('uses optionSchema from query class metadata including default values', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerFindRangeQuery(registrar);

    const result = await runner.executeArgs([
      'findRange',
      '--start',
      '1',
      '--end',
      '5',
    ]);

    expect(result.payload).toEqual(new FindRangeQuery(1, 5, false));
    expect(result.result).toEqual({
      start: 1,
      end: 5,
      includeEnd: false,
    });
  });

  it('supports short option names declared on the command class', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerSumDigitsCommand(registrar);

    const result = await runner.executeArgs([
      'sumDigits',
      '-l',
      '2',
      '-r',
      '3',
    ]);

    expect(result.payload).toEqual(new SumDigitsCommand(2, 3));
    expect(result.result).toBe(5);
  });

  it('supports short option names declared on the query class', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerFindRangeQuery(registrar);

    const result = await runner.executeArgs([
      'findRange',
      '-s',
      '10',
      '-e',
      '12',
      '-i',
    ]);

    expect(result.payload).toEqual(new FindRangeQuery(10, 12, true));
    expect(result.result).toEqual({
      start: 10,
      end: 12,
      includeEnd: true,
    });
  });

  it('passes the typed command payload instance to the command handler', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    let captured: AddDigitCommand | undefined;

    fixture.registerAddDigitCommand(registrar, (command) => {
      captured = command;
      return command.digit * 2;
    });

    const result = await runner.executeArgs(['addDigit', '--digit', '6']);

    expect(captured).toBeInstanceOf(AddDigitCommand);
    expect(captured).toEqual(new AddDigitCommand(6));
    expect(result.result).toBe(12);
  });

  it('passes the typed query payload instance to the query handler', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    let captured: FindRangeQuery | undefined;

    fixture.registerFindRangeQuery(registrar, (query) => {
      captured = query;
      return query.end - query.start;
    });

    const result = await runner.executeArgs([
      'findRange',
      '--start',
      '3',
      '--end',
      '8',
    ]);

    expect(captured).toBeInstanceOf(FindRangeQuery);
    expect(captured).toEqual(new FindRangeQuery(3, 8, false));
    expect(result.result).toBe(5);
  });

  it('registers multiple command and query classes in the same registry', async () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerAddDigitCommand(registrar);
    fixture.registerSumDigitsCommand(registrar);
    fixture.registerGetDigitQuery(registrar);
    fixture.registerFindRangeQuery(registrar);

    const commandResult = await runner.executeArgs([
      'sumDigits',
      '--left',
      '4',
      '--right',
      '5',
    ]);

    const queryResult = await runner.executeArgs([
      'findRange',
      '--start',
      '20',
      '--end',
      '25',
      '--includeEnd',
    ]);

    expect(commandResult.result).toBe(9);
    expect(queryResult.result).toEqual({
      start: 20,
      end: 25,
      includeEnd: true,
    });
  });

  it('exposes registered classes through CliRunner.listActions', () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);
    const runner = fixture.createRunner(registry);

    fixture.registerAddDigitCommand(registrar);
    fixture.registerGetDigitQuery(registrar);

    const actions = runner.listActions();

    expect(actions).toHaveLength(2);
    expect(actions.map((item) => item.name)).toEqual(['addDigit', 'getDigit']);
    expect(actions.map((item) => item.type)).toEqual(['command', 'query']);
  });

  it('throws when the same command class metadata key is registered twice', () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);

    fixture.registerAddDigitCommand(registrar);

    expect(() => fixture.registerAddDigitCommand(registrar)).toThrow(
      'CLI action already registered for "addDigit"',
    );
  });

  it('throws when the same alias key is registered twice', () => {
    const registry = fixture.createRegistry();
    const registrar = fixture.createRegistrar(registry);

    fixture.registerAddDigitCommand(registrar);

    expect(() => {
      registrar.registerCommand(
        class AnotherCommand implements ICommandBase {
          public static readonly cli = {
            name: 'anotherCommand',
            type: 'command' as const,
            description: 'Another command',
            aliases: ['add-digit'],
            optionSchema: {},
          };
        },
        createPayloadFactory(() => ({}) as ICommandBase),
        {
          handle: () => 'ok',
        },
      );
    }).toThrow('CLI action already registered for "add-digit"');
  });
});