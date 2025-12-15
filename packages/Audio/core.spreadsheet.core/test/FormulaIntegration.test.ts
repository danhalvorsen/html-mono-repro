import { describe, it, expect } from 'vitest';

// Use the same entry point a consumer would use
import { FormulaTokenizer, FormulaParser } from '../src/index.js';

describe('Spreadsheet formula (integration examples)', () => {
  it('tokenizes and parses "=1 + 2" in a simple way', () => {
    const tokenizer = new FormulaTokenizer();
    const parser = new FormulaParser();

    const input = '=1 + 2';

    // 1) Tokenize
    const tokens = tokenizer.tokenize(input);

    // Educational: inspect the tokens in a very simple way
    const kinds = tokens.map(t => t.kind);
    expect(kinds).toContain('Equals');
    expect(kinds).toContain('Number');
    expect(kinds).toContain('Operator');

    // 2) Parse – current parser returns a single Literal from the first non-whitespace token
    const ast = parser.parse(tokens);

    // Document current behaviour: first numeric token becomes Literal(1)
    expect(ast.kind).toBe('Literal');
    if (ast.kind === 'Literal') {
      expect(ast.value).toBe(1);
    }
  });
});
