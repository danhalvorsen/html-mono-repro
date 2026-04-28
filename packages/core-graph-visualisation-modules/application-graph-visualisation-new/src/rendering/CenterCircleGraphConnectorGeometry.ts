// CenterCircleGraphConnectorGeometry: always connects edges to node center
// import { IGraphConnectorGeometry } from '@monorepo/core-graph-visualisation';

export class CenterCircleGraphConnectorGeometry /* implements IGraphConnectorGeometry */ {
  createEdgeConnector(from: any) {
    return from.center;
  }
  createStraightPath(from: any, to: any) {
    return `M${from.x},${from.y} L${to.x},${to.y}`;
  }
  createConnectionPointConnector(..._args: any[]) {
    return 'center';
  }
  repositionConnectionPoint(..._args: any[]) {
    return 'center';
  }
}
