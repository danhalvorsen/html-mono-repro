import { describe, it, expect } from 'vitest';
import { FormulaTokenizer } from '../src/parsing/FormulaTokenizer.js';

describe('FormulaTokenizer', () => {
  const tokenizer = new FormulaTokenizer();

  it('tokenizes a simple numeric expression', () => {
    const tokens = tokenizer.tokenize('=1 + 2');
    const kinds = tokens.map(t => t.kind);
    expect(kinds).toContain('Equals');
    expect(kinds).toContain('Number');
    expect(kinds).toContain('Operator');
  });
});
