import { describe, it, expect } from 'vitest';
import {
  CliParser,
  CliRunner,
  CommandRegistry,
  type CliActionDefinition,
  type CliCommandHandler,
} from '../src/index.js';

describe('CliParser', () => {
  const parser = new CliParser();

  it('splits the command from arguments and honors quotes', () => {
    const split = parser.split('validate-tsconfig "path with spaces" --verbose');
    expect(split.command).toBe('validate-tsconfig');
    expect(split.args).toEqual(['path with spaces', '--verbose']);
  });

  it('parses options using the supplied schema', () => {
    const parsed = parser.parse(['compute-fp', '--file', 'tsconfig.json']);
    expect(parsed.options.file).toBe('tsconfig.json');
  });
});

describe('CliRunner', () => {
  it('executes registered commands and returns handler output', async () => {
    const registry = new CommandRegistry();

    class EchoHandler implements CliCommandHandler<{ text: string }, string> {
      async handle(command: { commandName: string; payload: { text: string } }): Promise<string> {
        return `${command.commandName}:${command.payload.text}`;
      }
    }

    const definition: CliActionDefinition<{ text: string }, string> = {
      name: 'echo',
      description: 'Echo command',
      type: 'command',
      optionSchema: {
        text: { type: 'string', short: 't' },
      },
      buildPayload: (invocation) => ({
        text: (invocation.options.text as string) ?? invocation.positionals[0] ?? '',
      }),
      handler: new EchoHandler(),
    };

    registry.register(definition);
    const runner = new CliRunner(registry);
    const execution = await runner.executeArgs(['echo', '--text', 'hello']);

    expect(execution.result).toBe('echo:hello');
  });
});
