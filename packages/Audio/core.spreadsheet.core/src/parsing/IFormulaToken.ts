// Token kinds supported by the spreadsheet formula language.
export type FormulaTokenKind =
  | 'Number'
  | 'Identifier'   // function or named range, e.g. SUM, MyRange
  | 'CellRef'      // A1, B2, $A$1, A1:B2
  | 'Operator'     // + - * / ^ etc
  | 'ParenOpen'    // (
  | 'ParenClose'   // )
  | 'Comma'        // ,
  | 'Equals'       // initial '='
  | 'Whitespace'
  | 'Unknown';

// A single lexical token in a formula.
export interface IFormulaToken {
  kind: FormulaTokenKind;
  lexeme: string;       // original text
  start: number;        // start index in input
  end: number;          // end index (exclusive)
}

// Contract for tokenizers (SOLID: small, focused interface)
export interface IFormulaTokenizer {
  tokenize(input: string): ReadonlyArray<IFormulaToken>;

  /**
   * Legacy method kept only for backwards compatibility with
   * existing interface signatures. Prefer `tokenize`.
   */
  FormulaTokenizer(input: string): ReadonlyArray<IFormulaToken>;
}