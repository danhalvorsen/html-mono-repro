import { describe, expect, it } from 'vitest';
import { BlaQuery, BlaQueryHandler } from '../../src/commandHandling/index.js';

describe('BlaQueryHandler', () => {
  it('uppercases value and returns canonical result payload', async () => {
    const handler = new BlaQueryHandler();
    const query = new BlaQuery('abc');

    expect(query.message).toEqual({
      value: 'abc',
      message: 'Bla:abc',
      handlerName: 'BlaQueryHandler',
    });

    const result = await handler.Handle(query);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({
      value: 'ABC',
      message: 'Bla:abc',
      handlerName: 'BlaQueryHandler',
    });
  });
});
