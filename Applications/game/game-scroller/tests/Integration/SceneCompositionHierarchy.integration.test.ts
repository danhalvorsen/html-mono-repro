// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { SceneCompositionFixture } from '../fixtures/SceneCompositionFixture.js';

describe('Scene composition hierarchy integration (JSDOM)', () => {
  const fixture = new SceneCompositionFixture();

  it('propagates parent-child translation through the hierarchy', () => {
    const { graph, root, group, leaf } = fixture.createHierarchy();

    root.translate(10, 20);
    group.translate(5, 7);
    leaf.translate(2, 3);

    graph.update();

    expect(fixture.readTranslation(leaf)).toEqual({ x: 17, y: 30 });
  });

  it('propagates parent rotation to descendants while preserving hierarchy offsets', () => {
    const { graph, root, group, leaf } = fixture.createHierarchy();

    root.rotate(Math.PI / 2);
    group.translate(10, 0);
    leaf.translate(5, 0);

    graph.update();

    const translation = fixture.readTranslation(leaf);
    expect(translation.x).toBeCloseTo(0, 6);
    expect(translation.y).toBeCloseTo(15, 6);
  });
});

