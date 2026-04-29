import { DagGraph, type IDagGraph } from "@monorepo/core-graph";
import { GraphJsonDeserializer } from "@monorepo/core-graph-json";
import domainGraphData from "../data/graphs/domain-graph.json";
import webComponentHierarchyGraphData from "../data/graphs/web-component-hierarchy-graph.json";
import reactiveControllerOwnershipGraphData from "../data/graphs/reactive-controller-ownership-graph.json";
import applicationArchitectureGraphData from "../data/graphs/application-architecture-graph.json";
import hierarchicalOrganizationGraphData from "../data/graphs/hierarchical-organization-graph.json";
import championsLeaguePlayersGraphData from "../data/graphs/champions-league-players.jgf.json";

interface JgfGraphData {
  readonly graph: {
    readonly nodes: readonly JgfNodeData[];
    readonly edges: readonly JgfEdgeData[];
  };
}

interface JgfNodeData {
  readonly id: string;
  readonly metadata?: unknown;
}

interface JgfEdgeData {
  readonly source: string;
  readonly target: string;
}

interface GraphJsonData {
  readonly nodes: readonly {
    readonly id: string;
    readonly payload: unknown;
  }[];
  readonly edges: readonly {
    readonly sourceId: string;
    readonly targetId: string;
  }[];
}

export interface IApplicationGraphFactory {
  createDomainGraph(): IDagGraph;
  createWebComponentHierarchyGraph(): IDagGraph;
  createReactiveControllerOwnershipGraph(): IDagGraph;
  createApplicationArchitectureGraph(): IDagGraph;
  createHierarchicalOrganizationGraph(): IDagGraph;
  createChampionsLeaguePlayersGraph(): IDagGraph;
  createGraph(): IDagGraph;
}

export class ApplicationGraphFactory implements IApplicationGraphFactory {
  private readonly deserializer: GraphJsonDeserializer;

  constructor() {
    this.deserializer = new GraphJsonDeserializer(() => new DagGraph());
  }

  createDomainGraph(): IDagGraph {
    return this.deserializeGraphJson(domainGraphData);
  }

  createWebComponentHierarchyGraph(): IDagGraph {
    return this.deserializeGraphJson(webComponentHierarchyGraphData);
  }

  createReactiveControllerOwnershipGraph(): IDagGraph {
    return this.deserializeGraphJson(reactiveControllerOwnershipGraphData);
  }

  createApplicationArchitectureGraph(): IDagGraph {
    return this.deserializeGraphJson(applicationArchitectureGraphData);
  }

  createHierarchicalOrganizationGraph(): IDagGraph {
    return this.deserializeGraphJson(hierarchicalOrganizationGraphData);
  }

  createChampionsLeaguePlayersGraph(): IDagGraph {
    return this.deserializeGraphJson(this.toGraphJson(championsLeaguePlayersGraphData));
  }

  createGraph(): IDagGraph {
    return this.createDomainGraph();
  }

  private deserializeGraphJson(graphData: GraphJsonData): IDagGraph {
    return this.deserializer.deserialize(JSON.stringify(graphData)) as IDagGraph;
  }

  private toGraphJson(jgfData: JgfGraphData): GraphJsonData {
    return {
      nodes: jgfData.graph.nodes.map((node) => ({
        id: node.id,
        payload: node.metadata ?? null,
      })),
      edges: jgfData.graph.edges.map((edge) => ({
        sourceId: edge.source,
        targetId: edge.target,
      })),
    };
  }
}