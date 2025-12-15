import { describe, it, expect } from 'vitest';
import { FooCard } from '../src/card.js'
describe('FooCard', () => {
  it('should render HTML with title and description', () => {
    const card = new FooCard('Test Title');
    const html = card.render();

    expect(html).toContain('<div class="foo-card">');
    expect(html).toContain('<h1>Test Title</h1>');
    expect(html).toContain('<p>Test Description</p>');
  });
});
