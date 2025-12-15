// Old (broken) import:
// import { IGraphNode } from "../../../core-graph/src/IGraphNode.js";

// Local temporary stub; align with real core-graph type later.
export interface IGraphNode {
  id: string;
  // ...other graph node props...
}

// If you referenced ExprNode / Expression earlier, keep/define them here to avoid name errors:
export interface ExprNode {
  // ...AST node props...
}

export interface Expression {
  // ...expression model props...
}

export const VALUE_NUMBER   = Symbol("number");
export const VALUE_STRING   = Symbol("string");
export const VALUE_BOOLEAN  = Symbol("boolean");
export const VALUE_DATE     = Symbol("date");
export const VALUE_NULL     = Symbol("null");

export const enum ValueKind {
  Number,
  String,
  Boolean,
  Date,
  Null,
}
 
export interface ValueType {
  kind: ValueKind;
  value: number | string | boolean | Date | null;
}

export const V = {
  num: (n: number): ValueType => ({ kind: ValueKind.Number, value: n }),
  str: (s: string): ValueType => ({ kind: ValueKind.String, value: s }),
  bool: (b: boolean): ValueType => ({ kind: ValueKind.Boolean, value: b }),
  date: (d: Date): ValueType => ({ kind: ValueKind.Date, value: d }),
  nul: (): ValueType => ({ kind: ValueKind.Null, value: null }),
};
 
export interface StringValue {
  kind: typeof VALUE_STRING;
  value: string;
}

export interface BooleanValue {
  kind: typeof VALUE_BOOLEAN;
  value: boolean;
}

export interface DateValue {
  kind: typeof VALUE_DATE;
  value: Date;
}

export interface CellNode extends IGraphNode {
  id: string;        // "A1"
  formula?: Expression ;   // raw text "=A1+B1"
  ast?: ExprNode;     // parsed formula tree
  value: unknown;    // computed result
}