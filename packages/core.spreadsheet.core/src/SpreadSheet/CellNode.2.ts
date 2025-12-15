import { IGraphNode } from '../../../core-graph/dist/CycleDetector';
import { ValueType } from './CellNode.js';

interface CellNode extends IGraphNode {
  id: string; // "A1"
  formula: Expression; // raw text "=A1+B1"
  ast: ExprNode; // parsed formula tree
  value: ValueType;
}
