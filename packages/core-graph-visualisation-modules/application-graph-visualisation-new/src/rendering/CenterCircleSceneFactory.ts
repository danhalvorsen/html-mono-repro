// CenterCircleSceneFactory: always renders nodes as circles, edges center-to-center
// Assumes IGraphSvgSceneFactory, IGraph, etc. are available from @monorepo/core-graph-visualisation

// import { IGraph, IGraphSvgSceneFactory, GraphSvgScene, GraphSvgNode, GraphSvgEdge } from '@monorepo/core-graph-visualisation';

class CenterCircleSceneFactory {
  private innerFactory: any;
  constructor(innerFactory: any) {
    this.innerFactory = innerFactory;
  }

  createScene(graph: any, options: any) {
    const scene = this.innerFactory.createScene(graph, options);
    const radius = 32;
    return {
      ...scene,
      nodes: scene.nodes.map((node: any) => ({
        ...node,
        representation: 'circle',
        circle: { radius },
        connectionPoints: []
      })),
      edges: scene.edges.map((edge: any) => ({
        ...edge,
        start: { ...edge.start, connector: 'center' },
        end: { ...edge.end, connector: 'center' },
        path: `M${edge.start.x},${edge.start.y} L${edge.end.x},${edge.end.y}`
      }))
    };
  }
}

export { CenterCircleSceneFactory };
