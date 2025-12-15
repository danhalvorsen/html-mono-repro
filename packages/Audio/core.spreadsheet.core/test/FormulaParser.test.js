import { describe, it, expect } from 'vitest';
import { FormulaTokenizer } from '../src/parsing/FormulaTokenizer.js';
import { FormulaParser } from '../src/parsing/FormulaParser.js';
describe('FormulaParser', () => {
    const tokenizer = new FormulaTokenizer();
    const parser = new FormulaParser();
    it('parses a simple number literal', () => {
        const ast = parser.parse(tokenizer.tokenize('=42'));
        expect(ast.kind).toBe('Literal');
    });
    it('legacy FormulaParser delegates to parse', () => {
        const tokens = tokenizer.tokenize('=7');
        const a = parser.parse(tokens);
        const b = parser.FormulaParser(tokens);
        expect(b).toEqual(a);
    });
});
//# sourceMappingURL=FormulaParser.test.js.map