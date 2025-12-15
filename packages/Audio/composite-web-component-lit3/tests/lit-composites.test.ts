import { describe, it, expect } from 'vitest';
import '../src/lit-composites'; // registers <cw-leaf> and <cw-composite>

describe('composite-web-component-lit3 - Lit wrappers', () => {
  it('cw-leaf exposes underlying model and operation() matches name', async () => {
    const leaf = document.createElement('cw-leaf') as any;
    leaf.name = 'foo';
    document.body.appendChild(leaf);
    await leaf.updateComplete;
    const model = leaf.getModel?.();
    expect(model).toBeTruthy();
    expect(typeof model.operation).toBe('function');
    expect(model.operation()).toBe('Leaf(foo)');
    leaf.remove();
  });

  it('cw-composite aggregates slotted cw-leaf children into model', async () => {
    const composite = document.createElement('cw-composite') as any;
    composite.name = 'root';
    // create two leaves and append them as children (they become slotted)
    const a = document.createElement('cw-leaf') as any;
    a.name = 'a';
    const b = document.createElement('cw-leaf') as any;
    b.name = 'b';

    composite.appendChild(a);
    composite.appendChild(b);
    document.body.appendChild(composite);

    // wait for Lit updates on children and composite
    await Promise.all([a.updateComplete, b.updateComplete, composite.updateComplete]);

    const model = composite.getModel?.();
    expect(model).toBeTruthy();
    const op = model.operation();
    expect(op).toContain('Composite(root)');
    expect(op).toContain('Leaf(a)');
    expect(op).toContain('Leaf(b)');

    composite.remove();
  });

  it('AddController does not throw when given a ReactiveController-like object', async () => {
    const leaf = document.createElement('cw-leaf') as any;
    document.body.appendChild(leaf);
    await leaf.updateComplete;

    const dummyController = {
      hostConnected() {},
      hostDisconnected() {},
      hostUpdate() {},
    };
    expect(() => leaf.AddController(dummyController)).not.toThrow();
    leaf.remove();
  });

  it('incoming property renders incoming hint in cw-leaf', async () => {
    const leaf = document.createElement('cw-leaf') as any;
    leaf.name = 'viz';
    document.body.appendChild(leaf);
    await leaf.updateComplete;

    leaf.incoming = { some: 'data' };
    await leaf.updateComplete;

    const hint = leaf.shadowRoot?.querySelector?.('.incoming');
    expect(hint).toBeTruthy();
    leaf.remove();
  });
});
