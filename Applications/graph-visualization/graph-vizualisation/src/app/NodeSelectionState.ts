export interface INodeSelectionState {
  readonly selectedNodeId: string;
  select(nodeId: string): void;
}

export class NodeSelectionState implements INodeSelectionState {
  private selectedNodeIdInternal = "none";

  get selectedNodeId(): string {
    return this.selectedNodeIdInternal;
  }

  select(nodeId: string): void {
    this.selectedNodeIdInternal = nodeId;
  }
}
