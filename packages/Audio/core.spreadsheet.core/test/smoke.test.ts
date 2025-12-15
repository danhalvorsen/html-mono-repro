import { describe, it, expect } from 'vitest';

// Import from the package public entrypoint
import { FormulaTokenizer, FormulaParser } from '../src/index.js';

describe('core.spreadsheet.core smoke', () => {
  it('can tokenize and parse a simple formula', () => {
    const tokenizer = new FormulaTokenizer();
    const parser = new FormulaParser();

    const tokens = tokenizer.tokenize('=1+2');
    expect(tokens.length).toBeGreaterThan(0);

    const ast = parser.parse(tokens);
    expect(ast).toBeDefined();
  });
});
