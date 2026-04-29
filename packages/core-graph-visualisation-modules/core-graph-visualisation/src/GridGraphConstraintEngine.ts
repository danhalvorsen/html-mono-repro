import type { IGraph } from "@monorepo/core-graph";

import type {
  BoxConstraints,
  GraphCanvasConstraints,
  GraphConstraintModel,
  GraphEdgeConstraint,
  GraphNodeAnchor,
  IGraphConstraintEngine,
} from "./GraphConstraints.js";

export class GridGraphConstraintEngine implements IGraphConstraintEngine {
  createConstraints(
    graph: IGraph,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): GraphConstraintModel {
    this.validateCanvas(canvas);
    this.validateBox(box, canvas);

    return {
      canvas,
      box,
      nodeAnchors: this.createNodeAnchors(graph, canvas, box),
      edgeConstraints: this.createEdgeConstraints(graph),
    };
  }

  private createNodeAnchors(
    graph: IGraph,
    canvas: GraphCanvasConstraints,
    box: BoxConstraints,
  ): readonly GraphNodeAnchor[] {
    if (graph.nodes.length === 0) {
      return [];
    }

    const columnCount = Math.max(1, Math.ceil(Math.sqrt(graph.nodes.length)));
    const rowCount = Math.max(1, Math.ceil(graph.nodes.length / columnCount));
    const halfBoxWidth = box.width / 2;
    const halfBoxHeight = box.height / 2;
    const minimumX = -((canvas.width / 2) - canvas.padding - halfBoxWidth);
    const maximumX = (canvas.width / 2) - canvas.padding - halfBoxWidth;
    const minimumY = -((canvas.height / 2) - canvas.padding - halfBoxHeight);
    const maximumY = (canvas.height / 2) - canvas.padding - halfBoxHeight;
    const contentWidth = maximumX - minimumX;
    const contentHeight = maximumY - minimumY;
    const horizontalStep = columnCount === 1 ? 0 : contentWidth / (columnCount - 1);
    const verticalStep = rowCount === 1 ? 0 : contentHeight / (rowCount - 1);

    return graph.nodes.map((node, index) => {
      const column = index % columnCount;
      const row = Math.floor(index / columnCount);

      return {
        id: node.id,
        payload: node.payload,
        centerX: minimumX + (column * horizontalStep),
        centerY: maximumY - (row * verticalStep),
      };
    });
  }

  private createEdgeConstraints(graph: IGraph): readonly GraphEdgeConstraint[] {
    return graph.edges.map((edge) => ({
      sourceNodeId: edge.source.id,
      targetNodeId: edge.target.id,
    }));
  }

  private validateCanvas(canvas: GraphCanvasConstraints): void {
    if (canvas.width <= 0) {
      throw new Error("Graph canvas width must be greater than zero.");
    }

    if (canvas.height <= 0) {
      throw new Error("Graph canvas height must be greater than zero.");
    }

    if (canvas.padding < 0) {
      throw new Error("Graph canvas padding must be zero or greater.");
    }

    if ((canvas.padding * 2) >= canvas.width) {
      throw new Error("Graph canvas padding must leave horizontal render space.");
    }

    if ((canvas.padding * 2) >= canvas.height) {
      throw new Error("Graph canvas padding must leave vertical render space.");
    }
  }

  private validateBox(
    box: BoxConstraints,
    canvas: GraphCanvasConstraints,
  ): void {
    if (box.width <= 0) {
      throw new Error("Graph box width must be greater than zero.");
    }

    if (box.height <= 0) {
      throw new Error("Graph box height must be greater than zero.");
    }

    if (box.width > (canvas.width - (canvas.padding * 2))) {
      throw new Error("Graph box width must fit inside the canvas content area.");
    }

    if (box.height > (canvas.height - (canvas.padding * 2))) {
      throw new Error("Graph box height must fit inside the canvas content area.");
    }
  }
}
