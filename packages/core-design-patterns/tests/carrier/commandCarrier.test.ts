import { describe, expect, it, vi } from 'vitest';
import {
  CommandBase,
  CommandHandler,
} from '../../src/carrier/commandCarrier.js';

class TestCommand extends CommandBase<string> {
  protected readonly handler: CommandHandler<TestCommand, string>;

  constructor(handler: CommandHandler<TestCommand, string>) {
    super();
    this.handler = handler;
  }
}

describe('CommandBase', () => {
  it('calls the handler with the command instance and returns its result', async () => {
    const handler = vi.fn<CommandHandler<TestCommand, string>>(async (cmd) => {
      expect(cmd).toBeInstanceOf(TestCommand);
      return 'ok';
    });

    const command = new TestCommand(handler);

    const result = await command.execute();

    expect(result).toBe('ok');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(command);
  });

  it('propagates handler errors', async () => {
    const handler = vi.fn<CommandHandler<TestCommand, string>>(async () => {
      throw new Error('boom');
    });
    const command = new TestCommand(handler);

    await expect(command.execute()).rejects.toThrow('boom');
    expect(handler).toHaveBeenCalledOnce();
  });
});
