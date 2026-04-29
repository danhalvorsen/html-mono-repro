// SimpleGraphVisualizationCompositionRoot: sets up the viewer app
// import { CenterCircleSceneFactory } from '../rendering/CenterCircleSceneFactory';
// import { CenterCircleGraphConnectorGeometry } from '../rendering/CenterCircleGraphConnectorGeometry';
// import { JgfApplicationGraphFactory } from './JgfApplicationGraphFactory';

import { JgfGraphParser } from '../jgf/JgfGraphParser';
import { JgfGraphValidator } from '../jgf/JgfGraphValidator';
import { JgfApplicationGraphFactory } from './JgfApplicationGraphFactory';
import { CenterCircleSceneFactory } from '../rendering/CenterCircleSceneFactory';
import { CenterCircleGraphConnectorGeometry } from '../rendering/CenterCircleGraphConnectorGeometry';

// import type { JgfDocument } from '../jgf/JgfGraphDocument';
import type { IGraphSvgSceneFactory } from '@monorepo/core-graph-visualisation';

export function createSimpleGraphVisualizationApp(jgfJson: string, layoutFactory: IGraphSvgSceneFactory) {
  const jgfDoc = JgfGraphParser.parse(jgfJson);
  if (!JgfGraphValidator.validate(jgfDoc)) throw new Error('Invalid JGF');
  const graph = JgfApplicationGraphFactory.fromJgf(jgfDoc);
  const sceneFactory = new CenterCircleSceneFactory(layoutFactory);
  const connectorGeometry = new CenterCircleGraphConnectorGeometry();
  return { graph, sceneFactory, connectorGeometry };
}
