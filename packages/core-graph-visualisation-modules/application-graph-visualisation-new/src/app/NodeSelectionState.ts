export interface INodeSelectionState {
  readonly selectedNodeId: string;
  select(nodeId: string): void;
  setDefaultConnectorRole(nodeId: string, connectorRole: string): void;
  getDefaultConnectorRole(nodeId: string): string | undefined;
}

export class NodeSelectionState implements INodeSelectionState {
  private selectedNodeIdInternal = "none";
  private defaultConnectorByNodeId = new Map<string, string>();

  get selectedNodeId(): string {
    return this.selectedNodeIdInternal;
  }

  select(nodeId: string): void {
    if (this.selectedNodeIdInternal !== nodeId) {
      this.defaultConnectorByNodeId.delete(this.selectedNodeIdInternal);
    }

    this.selectedNodeIdInternal = nodeId;
  }

  setDefaultConnectorRole(nodeId: string, connectorRole: string): void {
    this.selectedNodeIdInternal = nodeId;
    this.defaultConnectorByNodeId.set(nodeId, connectorRole);
  }

  getDefaultConnectorRole(nodeId: string): string | undefined {
    return this.defaultConnectorByNodeId.get(nodeId);
  }
}
