// packages/core-design-patterns-mediator/tests/PipelineBuilder.test.ts

import { describe, expect, it } from 'vitest';
import { PIPELINE_RESULT } from '../src/index.js';
import { PipelineBuilderFixture } from './fixtures/PipelineBuilderFixture.js';

describe('PipelineBuilder', () => {
  it('should build a pipeline that executes behaviors before handler', async () => {
    const fixture = new PipelineBuilderFixture();
    const ctx = fixture.ctx();
    const msg = fixture.msg('A');

    const foo = fixture.behavior_ok<typeof msg>();
    const bla = fixture.behavior_ok<typeof msg>();
    const handler = fixture.handler_value<typeof msg, string>('done');

    const pipeline = fixture
      .builder<typeof msg, string>()
      .withBehavior(foo)
      .withBehavior(bla)
      .withHandler(handler)
      .build();

    const result = await pipeline.execute(ctx, msg);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('done');
    expect(foo.calls).toEqual([{ msgName: 'A' }]);
    expect(bla.calls).toEqual([{ msgName: 'A' }]);
    expect(handler.calls).toEqual([{ msgName: 'A' }]);
    expect(ctx.get<string>(PIPELINE_RESULT)).toBe('done');
  });

  it('should stop at first failing behavior and should not execute handler', async () => {
    const fixture = new PipelineBuilderFixture();
    const ctx = fixture.ctx();
    const msg = fixture.msg('B');

    const okBehavior = fixture.behavior_ok<typeof msg>();
    const failBehavior = fixture.behavior_fail<typeof msg>('boom');
    const handler = fixture.handler_value<typeof msg, string>('done');

    const pipeline = fixture
      .builder<typeof msg, string>()
      .withBehavior(okBehavior)
      .withBehavior(failBehavior)
      .withHandler(handler)
      .build();

    const result = await pipeline.execute(ctx, msg);

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().behavior).toBe('err');
    expect(okBehavior.calls).toEqual([{ msgName: 'B' }]);
    expect(failBehavior.calls).toEqual([{ msgName: 'B' }]);
    expect(handler.calls).toEqual([]);
    expect(ctx.get<string>(PIPELINE_RESULT)).toBeUndefined();
  });

  it('should support pipeline with handler only', async () => {
    const fixture = new PipelineBuilderFixture();
    const ctx = fixture.ctx();
    const msg = fixture.msg('C');

    const handler = fixture.handler_from<typeof msg, string>(
      (message) => `handled:${message.name}`,
    );

    const pipeline = fixture
      .builder<typeof msg, string>()
      .withHandler(handler)
      .build();

    const result = await pipeline.execute(ctx, msg);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('handled:C');
    expect(handler.calls).toEqual([{ msgName: 'C' }]);
    expect(ctx.get<string>(PIPELINE_RESULT)).toBe('handled:C');
  });

  it('should throw when build is called without handler', () => {
    const fixture = new PipelineBuilderFixture();

    const act = () =>
      fixture
        .builder()
        .withBehavior(fixture.behavior_ok())
        .build();

    expect(act).toThrowError('PipelineBuilder: handler is required.');
  });

  it('should preserve behavior registration order', async () => {
    const fixture = new PipelineBuilderFixture();
    const ctx = fixture.ctx();
    const msg = fixture.msg('D');
    const order: string[] = [];

    const first = fixture.handler_from<typeof msg, void>(() => {
      order.push('first');
    });

    const second = fixture.handler_from<typeof msg, void>(() => {
      order.push('second');
    });

    const handler = fixture.handler_from<typeof msg, string>(() => {
      order.push('handler');
      return 'ok';
    });

    const firstBehavior = {
      execute: async () => {
        order.push('first');
        return fixture.behavior_ok<typeof msg>().execute(ctx, msg);
      },
    };

    const secondBehavior = {
      execute: async () => {
        order.push('second');
        return fixture.behavior_ok<typeof msg>().execute(ctx, msg);
      },
    };

    const pipeline = fixture
      .builder<typeof msg, string>()
      .withBehavior(firstBehavior)
      .withBehavior(secondBehavior)
      .withHandler(handler)
      .build();

    const result = await pipeline.execute(ctx, msg);

    expect(result.isOk()).toBe(true);
    expect(order).toEqual(['first', 'second', 'handler']);
  });
});