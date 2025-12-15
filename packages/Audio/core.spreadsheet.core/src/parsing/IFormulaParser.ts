import type { IFormulaToken } from './IFormulaToken.js';

// Basic expression node kinds; extend as needed.
export type FormulaAstKind =
  | 'Literal'
  | 'Binary'
  | 'Unary'
  | 'Call'
  | 'CellRef'
  | 'Range'
  | 'Error';

export interface IFormulaAstBase {
  kind: FormulaAstKind;
}

export interface ILiteralAst extends IFormulaAstBase {
  kind: 'Literal';
  value: number | string | boolean | null;
}

export interface ICellRefAst extends IFormulaAstBase {
  kind: 'CellRef';
  ref: string; // e.g. "A1", "B2"
}

export interface IBinaryAst extends IFormulaAstBase {
  kind: 'Binary';
  operator: string;
  left: IFormulaAst;
  right: IFormulaAst;
}

// Add other node shapes (Unary, Call, Range, Error) as needed.

export type IFormulaAst = ILiteralAst | ICellRefAst | IBinaryAst /* | ...other nodes... */;

// Parser contract: convert tokens to AST.
export interface IFormulaParser {
  parse(tokens: readonly IFormulaToken[]): IFormulaAst;

  /**
   * Legacy method to satisfy existing type names used elsewhere.
   * Prefer `parse`.
   */
  FormulaParser(tokens: readonly IFormulaToken[]): IFormulaAst;
}