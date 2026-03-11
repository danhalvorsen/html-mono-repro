// packages/composite-tree-system/Tree/Samples/core-composite-tree-web-audio/src/Runtime/WebAudioSignalGraphBuilder.ts

import type { IWebAudioNode } from "../../contracts.js";
import { type IDagGraph, type IGraphNode,  Association, DagGraph } from '@monorepo/core-graph';

import { GainNodeModel } from "../../Models/GainNodeModel.js";
import { MixerNodeModel } from "../../Models/MixerNodeModel.js";
import { OscillatorNodeModel } from "../../Models/OscillatorNodeModel.js";

export interface IWebAudioSignalGraphBuildResult {
  readonly graph: IDagGraph;
  readonly nodeMap: ReadonlyMap<IWebAudioNode, IGraphNode>;
  readonly reverseNodeMap: ReadonlyMap<IGraphNode, IWebAudioNode>;
  readonly routes: readonly Association<IWebAudioNode, IWebAudioNode>[];
}

export class WebAudioSignalGraphBuilder {
  public build(root: IWebAudioNode): IWebAudioSignalGraphBuildResult {
    const graph = new DagGraph();

    const nodeMap = new Map<IWebAudioNode, IGraphNode>();
    const reverseNodeMap = new Map<IGraphNode, IWebAudioNode>();
    const routes: Association<IWebAudioNode, IWebAudioNode>[] = [];

    this.registerTree(root, graph, nodeMap, reverseNodeMap);
    this.routeTree(root, graph, nodeMap, routes);

    return {
      graph,
      nodeMap,
      reverseNodeMap,
      routes,
    };
  }

  private registerTree(
    node: IWebAudioNode,
    graph: DagGraph,
    nodeMap: Map<IWebAudioNode, IGraphNode>,
    reverseNodeMap: Map<IGraphNode, IWebAudioNode>,
  ): void {
    const graphNode = graph.addNode(node.id, node);

    nodeMap.set(node, graphNode);
    reverseNodeMap.set(graphNode, node);

    for (const child of node.children) {
      this.registerTree(child, graph, nodeMap, reverseNodeMap);
    }
  }

  private routeTree(
    node: IWebAudioNode,
    graph: DagGraph,
    nodeMap: ReadonlyMap<IWebAudioNode, IGraphNode>,
    routes: Association<IWebAudioNode, IWebAudioNode>[],
  ): void {
    if (node instanceof OscillatorNodeModel) {
      return;
    }

    if (node instanceof GainNodeModel) {
      this.routeGain(node, graph, nodeMap, routes);
      return;
    }

    if (node instanceof MixerNodeModel) {
      this.routeMixer(node, graph, nodeMap, routes);
      return;
    }

    throw new Error(`Unsupported web-audio node '${node.constructor.name}'.`);
  }

  private routeGain(
    gain: GainNodeModel,
    graph: DagGraph,
    nodeMap: ReadonlyMap<IWebAudioNode, IGraphNode>,
    routes: Association<IWebAudioNode, IWebAudioNode>[],
  ): void {
    if (gain.children.length !== 1) {
      throw new Error(`Gain '${gain.id}' must contain exactly one child.`);
    }

    const child = gain.children[0];

    this.routeTree(child, graph, nodeMap, routes);
    this.connect(child, gain, graph, nodeMap, routes);
  }

  private routeMixer(
    mixer: MixerNodeModel,
    graph: DagGraph,
    nodeMap: ReadonlyMap<IWebAudioNode, IGraphNode>,
    routes: Association<IWebAudioNode, IWebAudioNode>[],
  ): void {
    for (const child of mixer.children) {
      this.routeTree(child, graph, nodeMap, routes);
      this.connect(child, mixer, graph, nodeMap, routes);
    }
  }

  private connect(
    source: IWebAudioNode,
    target: IWebAudioNode,
    graph: DagGraph,
    nodeMap: ReadonlyMap<IWebAudioNode, IGraphNode>,
    routes: Association<IWebAudioNode, IWebAudioNode>[],
  ): void {
    const sourceGraphNode = nodeMap.get(source);
    const targetGraphNode = nodeMap.get(target);

    if (sourceGraphNode === undefined) {
      throw new Error(`Missing graph node for source '${source.id}'.`);
    }

    if (targetGraphNode === undefined) {
      throw new Error(`Missing graph node for target '${target.id}'.`);
    }

    graph.addEdge(sourceGraphNode, targetGraphNode);
    routes.push(new Association(source, target));
  }
}