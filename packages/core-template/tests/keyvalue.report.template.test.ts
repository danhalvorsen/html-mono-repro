import { describe, it, expect } from 'vitest';
import { KeyValueReportTemplate } from '../src/KeyValueReportTemplate.js';

const render = (input: Record<string, any>, sep?: string, br?: string) =>
  new KeyValueReportTemplate(sep, br).render(input);

describe('KeyValueReportTemplate', () => {
  it('renders flat object with default separator and line break', () => {
    expect(render({ status: 'ok', count: 3 })).toBe('status: ok\ncount: 3');
  });

  it('renders with custom separator and line break', () => {
    expect(render({ name: 'Alice', age: 30 }, ' = ', ' | ')).toBe('name = Alice | age = 30');
  });

  it('renders arrays as JSON strings', () => {
    const output = render({ items: ['a', 'b'] });
    expect(output).toMatch(/^items: \[\n\s+"a",\n\s+"b"\n\]/);
  });

  it('renders nested objects as JSON', () => {
    const out = render({ user: { name: 'Jane', roles: ['admin'] } });
    expect(out).toMatch(/"name": "Jane"/);
    expect(out).toMatch(/"roles": \[\n\s+"admin"\n\s+\]/);
  });

  it('handles circular references gracefully', () => {
    const circular: any = {}; circular.self = circular;
    const out = render({ circular });
    expect(out).toContain('[unserializable object]');
  });
});
