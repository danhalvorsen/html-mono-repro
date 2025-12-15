import { IGraphNode } from '../../../core-graph/dist/CycleDetector';

interface CellNode extends IGraphNode {
  id: string; // "A1"
  formula: string; // raw text "=A1+B1"
  ast: ExprNode; // parsed formula tree
  value: unknown; // computed result
}
