import type { IFormulaToken } from './IFormulaToken.js';
import type { IFormulaAst, IFormulaParser, ILiteralAst } from './IFormulaParser.js';

// Minimal, extensible parser implementation.
// SRP: only tokens -> AST here.
export class FormulaParser implements IFormulaParser {
  // Main API
  public parse(tokens: readonly IFormulaToken[]): IFormulaAst {
    // Very small example: parse a single literal number or identifier.
    // Extend to full Pratt/recursive-descent parser as needed.
    const filtered = tokens.filter(t => t.kind !== 'Whitespace' && t.kind !== 'Equals');

    if (filtered.length === 0) {
      // fallback AST; you might want an Error node instead
      const ast: ILiteralAst = {
        kind: 'Literal',
        value: null,
      };
      return ast;
    }

    const first = filtered[0];

    const literal: ILiteralAst = {
      kind: 'Literal',
      value:
        first.kind === 'Number'
          ? Number(first.lexeme)
          : first.lexeme,
    };

    return literal;
  }

  // Legacy method for interface compatibility; delegate to parse()
  public FormulaParser(tokens: readonly IFormulaToken[]): IFormulaAst {
    return this.parse(tokens);
  }
}
