// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { RectangleGameObject } from '@monorepo/game-objects';

describe('RectangleGameObject integration', () => {
  it('rotates the attached child RectangleGameObject when the parent rotates', async () => {
    const parent = document.createElement('rectangle-game-object') as RectangleGameObject;
    parent.caveGameObject = {
      getGeneratedCurves: () => ({
        reference: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
          { x: 30, y: 30 }
        ],
        upper: [],
        lower: []
      })
    };

    document.body.appendChild(parent);
    await parent.updateComplete;

    parent.onTime(1);
    await parent.updateComplete;

    const rotatingLayer = parent.shadowRoot?.querySelector('div[style*="rotate("]') as HTMLDivElement | null;
    expect(rotatingLayer).not.toBeNull();

    const transformStyle = rotatingLayer?.getAttribute('style') ?? '';
    expect(transformStyle).toContain('rotate(');
    expect(transformStyle).not.toContain('rotate(0rad)');
  });
});
