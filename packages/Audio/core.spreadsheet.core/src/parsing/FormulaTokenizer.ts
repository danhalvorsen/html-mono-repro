import type { IFormulaToken, IFormulaTokenizer, FormulaTokenKind } from './IFormulaToken.js';

// Concrete implementation of the tokenizer.
// SRP: only string -> tokens here.
export class FormulaTokenizer implements IFormulaTokenizer {
  // Public API used by new callers.
  public tokenize(input: string): ReadonlyArray<IFormulaToken> {
    const tokens: IFormulaToken[] = [];
    let i = 0;

    const push = (kind: FormulaTokenKind, start: number, end: number) => {
      tokens.push({
        kind,
        lexeme: input.slice(start, end),
        start,
        end,
      });
    };

    while (i < input.length) {
      const ch = input[i];

      const start = i;

      // Simple examples; extend for your full grammar:

      // Whitespace
      if (/\s/.test(ch)) {
        while (i < input.length && /\s/.test(input[i])) i++;
        push('Whitespace', start, i);
        continue;
      }

      // Initial '='
      if (ch === '=' && start === 0) {
        i++;
        push('Equals', start, i);
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        while (i < input.length && /[0-9.]/.test(input[i])) i++;
        push('Number', start, i);
        continue;
      }

      // Identifiers (functions, names)
      if (/[A-Za-z_]/.test(ch)) {
        while (i < input.length && /[A-Za-z0-9_]/.test(input[i])) i++;
        push('Identifier', start, i);
        continue;
      }

      // Single-char operators and punctuation
      if ('+-*/^'.includes(ch)) {
        i++;
        push('Operator', start, i);
        continue;
      }

      if (ch === '(') {
        i++;
        push('ParenOpen', start, i);
        continue;
      }

      if (ch === ')') {
        i++;
        push('ParenClose', start, i);
        continue;
      }

      if (ch === ',') {
        i++;
        push('Comma', start, i);
        continue;
      }

      // Fallback: Unknown
      i++;
      push('Unknown', start, i);
    }

    return tokens;
  }

  // Legacy method – delegates to tokenize() to keep interface compatibility.
  public FormulaTokenizer(input: string): ReadonlyArray<IFormulaToken> {
    return this.tokenize(input);
  }
}
