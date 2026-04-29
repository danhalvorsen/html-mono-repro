import type {IGraphNode } from '@monorepo/core-graph';
import type{ INodeIdentitySelector } from './INodeIdentitySelector.js';
import { Guard } from './Guard.js';

export class GraphNodeIdSelector implements INodeIdentitySelector<IGraphNode> {
    public selectId(node: IGraphNode): string {
        Guard.againstNullOrUndefined(node, "node");
        Guard.againstNullOrWhiteSpace(node.id, "node.id");
        return node.id;
    }
}
