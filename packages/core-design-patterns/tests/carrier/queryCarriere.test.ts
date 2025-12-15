import { describe, expect, it, vi } from 'vitest';
import { QueryBase, QueryHandler } from '../../src/carrier/queryCarriere.js';

class TestQuery extends QueryBase<number> {
  protected readonly handler: QueryHandler<TestQuery, number>;

  constructor(handler: QueryHandler<TestQuery, number>) {
    super();
    this.handler = handler;
  }
}

describe('QueryBase', () => {
  it('calls the handler with the query instance and returns its result', async () => {
    const handler = vi.fn<QueryHandler<TestQuery, number>>(async (query) => {
      expect(query).toBeInstanceOf(TestQuery);
      return 42;
    });

    const query = new TestQuery(handler);

    const result = await query.execute();

    expect(result).toBe(42);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(query);
  });

  it('propagates handler errors', async () => {
    const handler = vi.fn<QueryHandler<TestQuery, number>>(async () => {
      throw new Error('boom');
    });
    const query = new TestQuery(handler);

    await expect(query.execute()).rejects.toThrow('boom');
    expect(handler).toHaveBeenCalledOnce();
  });
});
