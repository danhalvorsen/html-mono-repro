import { describe, expect, it } from 'vitest';
import * as api from '../src/index.js';

describe('package exports', () => {
  it('exposes command and query symbols from root entrypoint', () => {
    expect(typeof api.FooCommand).toBe('function');
    expect(typeof api.FooCommandHandler).toBe('function');
    expect(typeof api.BlaQuery).toBe('function');
    expect(typeof api.BlaQueryHandler).toBe('function');
  });
});
