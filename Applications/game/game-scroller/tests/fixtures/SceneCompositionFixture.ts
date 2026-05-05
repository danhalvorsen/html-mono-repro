import { SceneGraph, SceneNode, ShapeNode } from '@monorepo/core-scene-graph';

export type Translation2 = {
  readonly x: number;
  readonly y: number;
};

export class SceneCompositionFixture {
  public createHierarchy() {
    const root = new SceneNode('root');
    const group = new SceneNode('group');
    const leaf = new ShapeNode('leaf', { kind: 'rect' });

    root.add(group);
    group.add(leaf);

    const graph = new SceneGraph(root);
    return { graph, root, group, leaf };
  }

  public readTranslation(node: { world: { toFloat32Array(): Float32Array } }): Translation2 {
    const values = node.world.toFloat32Array();
    return {
      x: values[2] ?? 0,
      y: values[5] ?? 0
    };
  }
}

