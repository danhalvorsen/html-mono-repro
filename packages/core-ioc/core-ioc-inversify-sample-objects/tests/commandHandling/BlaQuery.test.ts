import { describe, expect, it } from 'vitest';
import { BlaQuery } from '../../src/commandHandling/BlaQuery.js';

describe('BlaQuery', () => {
  it('creates canonical message payload', () => {
    const query = new BlaQuery('xyz');

    expect(query.value).toBe('xyz');
    expect(query.message).toEqual({
      value: 'xyz',
      message: 'Bla:xyz',
      handlerName: 'BlaQueryHandler',
    });
  });

  it('freezes message payload', () => {
    const query = new BlaQuery('a');

    expect(Object.isFrozen(query.message)).toBe(true);
  });
});
