import { describe, expect, it } from 'vitest';
import { Ok } from '@monorepo/core-design-patterns';
import type { ICommand, IQuery } from '@monorepo/core-design-patterns-cqrs-no-json';
import {
  BlaQuery,
  type BlaQueryMessage,
  BlaQueryHandlerContract,
  FooCommand,
  type FooCommandMessage,
  FooCommandHandlerContract,
} from '../../src/commandHandling/index.js';

describe('Contracts', () => {
  it('FooCommandHandlerContract can be implemented', async () => {
    class LocalHandler extends FooCommandHandlerContract {
      public async Handle(command: ICommand<FooCommandMessage>) {
        return Ok({
          value: command.message.value,
          message: 'ok',
          handlerName: 'FooCommandHandler' as const,
        });
      }
    }

    const handler = new LocalHandler();
    const result = await handler.Handle(new FooCommand(3));

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(3);
    expect(result.unwrap().handlerName).toBe('FooCommandHandler');
  });

  it('BlaQueryHandlerContract can be implemented', async () => {
    class LocalHandler extends BlaQueryHandlerContract {
      public async Handle(query: IQuery<BlaQueryMessage>) {
        return Ok({
          value: query.message.value,
          message: 'ok',
          handlerName: 'BlaQueryHandler' as const,
        });
      }
    }

    const handler = new LocalHandler();
    const result = await handler.Handle(new BlaQuery('z'));

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe('z');
    expect(result.unwrap().handlerName).toBe('BlaQueryHandler');
  });
});
