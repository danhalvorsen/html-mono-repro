// packages/core-console-cli/tests/CliConfiguration.test.ts

import { describe, expect, it } from 'vitest';
import {
  CliCommand,
  CliParser,
  CliQuery,
  CliRunner,
  CommandRegistry,
  NodeOptionSchemaMapper,
  OptionValueNormalizer,
  UnknownCommandError,
  type CliActionDefinition,
  type CliInvocationContext,
  type CliOptionSchema,
} from '../src/index.js';
import type { ICommandBase, IQueryBase } from '@monorepo/core-design-patterns-cqrs';

interface CreateUserCommandPayload extends ICommandBase {
  readonly userName: string;
  readonly age: number;
  readonly enabled: boolean;
}

interface DeleteUserCommandPayload extends ICommandBase {
  readonly userId: number;
  readonly hardDelete: boolean;
}

interface GetUserByIdQueryPayload extends IQueryBase {
  readonly userId: number;
  readonly includeHistory: boolean;
}

interface SearchUsersQueryPayload extends IQueryBase {
  readonly term: string;
  readonly page: number;
  readonly pageSize: number;
}

class CliTestFixture {
  public createParser(): CliParser {
    return new CliParser();
  }

  public createRunner(registry: CommandRegistry): CliRunner {
    return new CliRunner(registry, this.createParser());
  }

  public createRegistry(): CommandRegistry {
    return new CommandRegistry();
  }

  public createCreateUserCommand(): CliActionDefinition<CreateUserCommandPayload, unknown> {
    return {
      name: 'createUser',
      type: 'command',
      description: 'Create user',
      aliases: ['user-create'],
      optionSchema: {
        userName: { type: 'string', short: 'u' },
        age: { type: 'number', short: 'a' },
        enabled: { type: 'boolean', short: 'e', default: false },
      },
      buildPayload: (invocation: CliInvocationContext): CreateUserCommandPayload => ({
        userName: invocation.options.userName as string,
        age: invocation.options.age as number,
        enabled: invocation.options.enabled as boolean,
      }),
      handler: {
        handle: (command) => ({
          kind: 'command',
          commandName: command.commandName,
          payload: command.payload,
        }),
      },
    };
  }

  public createDeleteUserCommand(): CliActionDefinition<DeleteUserCommandPayload, unknown> {
    return {
      name: 'deleteUser',
      type: 'command',
      description: 'Delete user',
      aliases: ['user-delete'],
      optionSchema: {
        userId: { type: 'number', short: 'i' },
        hardDelete: { type: 'boolean', short: 'h', default: false },
      },
      buildPayload: (invocation: CliInvocationContext): DeleteUserCommandPayload => ({
        userId: invocation.options.userId as number,
        hardDelete: invocation.options.hardDelete as boolean,
      }),
      handler: {
        handle: (command) => ({
          kind: 'command',
          commandName: command.commandName,
          payload: command.payload,
        }),
      },
    };
  }

  public createGetUserByIdQuery(): CliActionDefinition<GetUserByIdQueryPayload, unknown> {
    return {
      name: 'getUserById',
      type: 'query',
      description: 'Get user by id',
      aliases: ['user-get'],
      optionSchema: {
        userId: { type: 'number', short: 'i' },
        includeHistory: { type: 'boolean', short: 'h', default: false },
      },
      buildPayload: (invocation: CliInvocationContext): GetUserByIdQueryPayload => ({
        userId: invocation.options.userId as number,
        includeHistory: invocation.options.includeHistory as boolean,
      }),
      handler: {
        handle: (query) => ({
          kind: 'query',
          commandName: query.commandName,
          payload: query.payload,
        }),
      },
    };
  }

  public createSearchUsersQuery(): CliActionDefinition<SearchUsersQueryPayload, unknown> {
    return {
      name: 'searchUsers',
      type: 'query',
      description: 'Search users',
      aliases: ['users-search'],
      optionSchema: {
        term: { type: 'string', short: 't' },
        page: { type: 'number', short: 'p', default: 1 },
        pageSize: { type: 'number', short: 's', default: 25 },
      },
      buildPayload: (invocation: CliInvocationContext): SearchUsersQueryPayload => ({
        term: invocation.options.term as string,
        page: invocation.options.page as number,
        pageSize: invocation.options.pageSize as number,
      }),
      handler: {
        handle: (query) => ({
          kind: 'query',
          commandName: query.commandName,
          payload: query.payload,
        }),
      },
    };
  }
}

describe('NodeOptionSchemaMapper', () => {
  const sut = new NodeOptionSchemaMapper();

  it('maps string number and boolean option configuration', () => {
    const schema: CliOptionSchema = {
      name: { type: 'string', short: 'n', default: 'dan' },
      age: { type: 'number', short: 'a', default: 48 },
      enabled: { type: 'boolean', short: 'e', default: true },
    };

    const result = sut.map(schema);

    expect(result).toEqual({
      name: {
        type: 'string',
        multiple: false,
        short: 'n',
        default: 'dan',
      },
      age: {
        type: 'string',
        multiple: false,
        short: 'a',
        default: '48',
      },
      enabled: {
        type: 'boolean',
        multiple: false,
        short: 'e',
        default: true,
      },
    });
  });

  it('maps multiple option configuration', () => {
    const schema: CliOptionSchema = {
      ids: { type: 'number', multiple: true, short: 'i', default: 10 },
      tags: { type: 'string', multiple: true, short: 't', default: 'foo' },
      flags: { type: 'boolean', multiple: true, short: 'f', default: true },
    };

    const result = sut.map(schema);

    expect(result).toEqual({
      ids: {
        type: 'string',
        multiple: true,
        short: 'i',
        default: ['10'],
      },
      tags: {
        type: 'string',
        multiple: true,
        short: 't',
        default: ['foo'],
      },
      flags: {
        type: 'boolean',
        multiple: true,
        short: 'f',
        default: [true],
      },
    });
  });
});

describe('OptionValueNormalizer', () => {
  const sut = new OptionValueNormalizer();

  it('normalizes numeric option values to numbers', () => {
    const schema: CliOptionSchema = {
      age: { type: 'number' },
      name: { type: 'string' },
      enabled: { type: 'boolean' },
    };

    const result = sut.normalize(schema, {
      age: '48',
      name: 'dan',
      enabled: true,
    });

    expect(result).toEqual({
      age: 48,
      name: 'dan',
      enabled: true,
    });
  });

  it('normalizes numeric multiple values to number array', () => {
    const schema: CliOptionSchema = {
      ids: { type: 'number', multiple: true },
    };

    const result = sut.normalize(schema, {
      ids: ['1', '2', '3'],
    });

    expect(result).toEqual({
      ids: [1, 2, 3],
    });
  });

  it('throws when numeric value is invalid', () => {
    const schema: CliOptionSchema = {
      age: { type: 'number' },
    };

    expect(() =>
      sut.normalize(schema, {
        age: 'abc',
      }),
    ).toThrow('Invalid value for --age');
  });
});

describe('CliParser configuration', () => {
  const fixture = new CliTestFixture();

  it('parses command options for command configuration', () => {
    const sut = fixture.createParser();

    const result = sut.parseOptions(
      ['--userName', 'dan', '--age', '48', '--enabled'],
      {
        userName: { type: 'string', short: 'u' },
        age: { type: 'number', short: 'a' },
        enabled: { type: 'boolean', short: 'e', default: false },
      },
    );

    expect(result).toEqual({
      options: {
        userName: 'dan',
        age: 48,
        enabled: true,
      },
      positionals: [],
    });
  });

  it('parses query options for query configuration', () => {
    const sut = fixture.createParser();

    const result = sut.parseOptions(
      ['--term', 'architect', '--page', '2', '--pageSize', '50'],
      {
        term: { type: 'string', short: 't' },
        page: { type: 'number', short: 'p', default: 1 },
        pageSize: { type: 'number', short: 's', default: 25 },
      },
    );

    expect(result).toEqual({
      options: {
        term: 'architect',
        page: 2,
        pageSize: 50,
      },
      positionals: [],
    });
  });

  it('supports short option configuration', () => {
    const sut = fixture.createParser();

    const result = sut.parseOptions(['-u', 'dan', '-a', '48', '-e'], {
      userName: { type: 'string', short: 'u' },
      age: { type: 'number', short: 'a' },
      enabled: { type: 'boolean', short: 'e', default: false },
    });

    expect(result).toEqual({
      options: {
        userName: 'dan',
        age: 48,
        enabled: true,
      },
      positionals: [],
    });
  });

  it('applies configured default values', () => {
    const sut = fixture.createParser();

    const result = sut.parseOptions([], {
      page: { type: 'number', default: 1 },
      pageSize: { type: 'number', default: 25 },
      includeHistory: { type: 'boolean', default: false },
    });

    expect(result).toEqual({
      options: {
        page: 1,
        pageSize: 25,
        includeHistory: false,
      },
      positionals: [],
    });
  });

  it('keeps declared positionals', () => {
    const sut = fixture.createParser();

    const result = sut.parseOptions(['--page', '2', 'alpha', 'beta'], {
      page: { type: 'number' },
    });

    expect(result).toEqual({
      options: {
        page: 2,
      },
      positionals: ['alpha', 'beta'],
    });
  });
});

describe('CommandRegistry configuration', () => {
  const fixture = new CliTestFixture();

  it('registers command types', () => {
    const sut = fixture.createRegistry();
    const createUser = fixture.createCreateUserCommand();
    const deleteUser = fixture.createDeleteUserCommand();

    sut.register(createUser);
    sut.register(deleteUser);

    expect(sut.get('createUser')).toBe(createUser);
    expect(sut.get('deleteUser')).toBe(deleteUser);
  });

  it('registers query types', () => {
    const sut = fixture.createRegistry();
    const getUserById = fixture.createGetUserByIdQuery();
    const searchUsers = fixture.createSearchUsersQuery();

    sut.register(getUserById);
    sut.register(searchUsers);

    expect(sut.get('getUserById')).toBe(getUserById);
    expect(sut.get('searchUsers')).toBe(searchUsers);
  });

  it('registers aliases for command and query types', () => {
    const sut = fixture.createRegistry();

    const createUser = fixture.createCreateUserCommand();
    const getUserById = fixture.createGetUserByIdQuery();

    sut.register(createUser);
    sut.register(getUserById);

    expect(sut.get('user-create')).toBe(createUser);
    expect(sut.get('user-get')).toBe(getUserById);
  });

  it('throws when a key is already configured', () => {
    const sut = fixture.createRegistry();

    sut.register(fixture.createCreateUserCommand());

    expect(() => sut.register(fixture.createCreateUserCommand())).toThrow(
      'CLI action already registered for "createUser"',
    );
  });
});

describe('CliRunner module behavior', () => {
  const fixture = new CliTestFixture();

  it('executes createUser command and builds typed payload', async () => {
    const registry = fixture.createRegistry();
    registry.register(fixture.createCreateUserCommand());

    const sut = fixture.createRunner(registry);

    const result = await sut.executeArgs([
      'createUser',
      '--userName',
      'dan',
      '--age',
      '48',
      '--enabled',
    ]);

    expect(result.definition.name).toBe('createUser');
    expect(result.definition.type).toBe('command');
    expect(result.invocation.command).toBe('createUser');
    expect(result.payload).toEqual<CreateUserCommandPayload>({
      userName: 'dan',
      age: 48,
      enabled: true,
    });
    expect(result.result).toEqual({
      kind: 'command',
      commandName: 'createUser',
      payload: {
        userName: 'dan',
        age: 48,
        enabled: true,
      },
    });
  });

  it('executes deleteUser command and builds typed payload', async () => {
    const registry = fixture.createRegistry();
    registry.register(fixture.createDeleteUserCommand());

    const sut = fixture.createRunner(registry);

    const result = await sut.executeArgs([
      'deleteUser',
      '--userId',
      '42',
      '--hardDelete',
    ]);

    expect(result.definition.name).toBe('deleteUser');
    expect(result.definition.type).toBe('command');
    expect(result.payload).toEqual<DeleteUserCommandPayload>({
      userId: 42,
      hardDelete: true,
    });
    expect(result.result).toEqual({
      kind: 'command',
      commandName: 'deleteUser',
      payload: {
        userId: 42,
        hardDelete: true,
      },
    });
  });

  it('executes getUserById query and builds typed payload', async () => {
    const registry = fixture.createRegistry();
    registry.register(fixture.createGetUserByIdQuery());

    const sut = fixture.createRunner(registry);

    const result = await sut.executeArgs([
      'getUserById',
      '--userId',
      '12',
      '--includeHistory',
    ]);

    expect(result.definition.name).toBe('getUserById');
    expect(result.definition.type).toBe('query');
    expect(result.invocation.command).toBe('getUserById');
    expect(result.payload).toEqual<GetUserByIdQueryPayload>({
      userId: 12,
      includeHistory: true,
    });
    expect(result.result).toEqual({
      kind: 'query',
      commandName: 'getUserById',
      payload: {
        userId: 12,
        includeHistory: true,
      },
    });
  });

  it('executes searchUsers query and applies configured defaults', async () => {
    const registry = fixture.createRegistry();
    registry.register(fixture.createSearchUsersQuery());

    const sut = fixture.createRunner(registry);

    const result = await sut.executeArgs([
      'searchUsers',
      '--term',
      'architect',
    ]);

    expect(result.definition.name).toBe('searchUsers');
    expect(result.definition.type).toBe('query');
    expect(result.payload).toEqual<SearchUsersQueryPayload>({
      term: 'architect',
      page: 1,
      pageSize: 25,
    });
    expect(result.result).toEqual({
      kind: 'query',
      commandName: 'searchUsers',
      payload: {
        term: 'architect',
        page: 1,
        pageSize: 25,
      },
    });
  });

  it('executes configured command alias', async () => {
    const registry = fixture.createRegistry();
    registry.register(fixture.createCreateUserCommand());

    const sut = fixture.createRunner(registry);

    const result = await sut.executeArgs([
      'user-create',
      '--userName',
      'ada',
      '--age',
      '33',
    ]);

    expect(result.definition.name).toBe('createUser');
    expect(result.payload).toEqual<CreateUserCommandPayload>({
      userName: 'ada',
      age: 33,
      enabled: false,
    });
  });

  it('executes configured query alias', async () => {
    const registry = fixture.createRegistry();
    registry.register(fixture.createGetUserByIdQuery());

    const sut = fixture.createRunner(registry);

    const result = await sut.executeArgs([
      'user-get',
      '--userId',
      '99',
    ]);

    expect(result.definition.name).toBe('getUserById');
    expect(result.payload).toEqual<GetUserByIdQueryPayload>({
      userId: 99,
      includeHistory: false,
    });
  });

  it('supports raw input string through tokenizer parser and runner', async () => {
    const registry = fixture.createRegistry();
    registry.register(fixture.createCreateUserCommand());

    const sut = fixture.createRunner(registry);

    const result = await sut.execute(
      'createUser --userName "Dan Edvard" --age 48 --enabled',
    );

    expect(result.payload).toEqual<CreateUserCommandPayload>({
      userName: 'Dan Edvard',
      age: 48,
      enabled: true,
    });
  });

  it('creates CliCommand json payload', () => {
    const command = new CliCommand<CreateUserCommandPayload>('createUser', {
      userName: 'dan',
      age: 48,
      enabled: true,
    });

    expect(command.commandName).toBe('createUser');
    expect(command.json).toBe(
      JSON.stringify({
        userName: 'dan',
        age: 48,
        enabled: true,
      }),
    );
  });

  it('creates CliQuery json payload', () => {
    const query = new CliQuery<GetUserByIdQueryPayload>('getUserById', {
      userId: 12,
      includeHistory: true,
    });

    expect(query.commandName).toBe('getUserById');
    expect(query.json).toBe(
      JSON.stringify({
        userId: 12,
        includeHistory: true,
      }),
    );
  });

  it('throws UnknownCommandError when command is missing', async () => {
    const sut = fixture.createRunner(fixture.createRegistry());

    await expect(sut.executeArgs([])).rejects.toBeInstanceOf(UnknownCommandError);
    await expect(sut.executeArgs([])).rejects.toThrow('No command provided');
  });

  it('throws UnknownCommandError when configured command is missing', async () => {
    const sut = fixture.createRunner(fixture.createRegistry());

    await expect(sut.executeArgs(['missingCommand'])).rejects.toBeInstanceOf(
      UnknownCommandError,
    );
    await expect(sut.executeArgs(['missingCommand'])).rejects.toThrow(
      'Unknown command "missingCommand"',
    );
  });

  it('shows fooCommand style behavior with number payload', async () => {
    interface FooCommandPayload extends ICommandBase {
      readonly digit: number;
    }

    const registry = fixture.createRegistry();

    registry.register({
      name: 'fooCommand',
      type: 'command',
      description: 'Foo command',
      optionSchema: {
        digit: { type: 'number', short: 'd' },
      },
      buildPayload: (invocation): FooCommandPayload => ({
        digit: invocation.options.digit as number,
      }),
      handler: {
        handle: (command) => command.payload,
      },
    });

    const sut = fixture.createRunner(registry);

    const result = await sut.executeArgs(['fooCommand', '--digit', '12']);

    expect(result.definition.name).toBe('fooCommand');
    expect(result.definition.type).toBe('command');
    expect(result.payload).toEqual<FooCommandPayload>({
      digit: 12,
    });
    expect(result.result).toEqual({
      digit: 12,
    });
  });
});