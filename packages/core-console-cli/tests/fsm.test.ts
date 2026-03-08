// ============================================================================
// packages/core-console-cli/tests/fixtures/TokenizerFixture.ts
// ============================================================================

import { CharInput, CliInputTokenizer, EndInput, QuoteCharacter, TokenizerCharacterClassifier, TokenizerContext, TokenizerContextFactory, TokenizerContextMutator, TokenizerDefinitionFactory, TokenizerInputFactory } from 'core-console-cli/src/fsm.js';
import { describe, expect, it } from 'vitest';
 
export class TokenizerFixture {
  public readonly classifier: TokenizerCharacterClassifier;
  public readonly contextFactory: TokenizerContextFactory;
  public readonly mutator: TokenizerContextMutator;
  public readonly inputFactory: TokenizerInputFactory;
  public readonly definitionFactory: TokenizerDefinitionFactory;
  public readonly tokenizer: CliInputTokenizer;

  public constructor() {
    this.classifier = new TokenizerCharacterClassifier();
    this.contextFactory = new TokenizerContextFactory();
    this.mutator = new TokenizerContextMutator();
    this.inputFactory = new TokenizerInputFactory();
    this.definitionFactory = new TokenizerDefinitionFactory(
      this.classifier,
      this.mutator,
    );
    this.tokenizer = new CliInputTokenizer(
      this.definitionFactory,
      this.contextFactory,
      this.inputFactory,
    );
  }

  public createContext(): TokenizerContext {
    return this.contextFactory.create();
  }

  public createChar(value: string): CharInput {
    return this.inputFactory.createChar(value);
  }

  public createEnd(): EndInput {
    return this.inputFactory.createEnd();
  }

  public openQuote(
    context: TokenizerContext,
    quote: QuoteCharacter,
  ): TokenizerContext {
    return this.mutator.openQuote(context, quote);
  }

  public append(
    context: TokenizerContext,
    value: string,
  ): TokenizerContext {
    let current = context;

    for (const char of value) {
      current = this.mutator.append(current, char);
    }

    return current;
  }

  public async tokenize(input: string): Promise<string[]> {
    return this.tokenizer.tokenize(input);
  }
}

export function createTokenizerFixture(): TokenizerFixture {
  return new TokenizerFixture();
}

// ============================================================================
// packages/core-console-cli/tests/parser/TokenizerCharacterClassifier.test.ts
// ============================================================================

describe('TokenizerCharacterClassifier', () => {
  it('should classify escape characters', () => {
    const fixture = createTokenizerFixture();

    expect(fixture.classifier.isEscape('\\')).toBe(true);
    expect(fixture.classifier.isEscape('a')).toBe(false);
  });

  it('should classify whitespace', () => {
    const fixture = createTokenizerFixture();

    expect(fixture.classifier.isWhitespace(' ')).toBe(true);
    expect(fixture.classifier.isWhitespace('\t')).toBe(true);
    expect(fixture.classifier.isWhitespace('x')).toBe(false);
  });

  it('should classify quote characters', () => {
    const fixture = createTokenizerFixture();

    expect(fixture.classifier.isQuote('"')).toBe(true);
    expect(fixture.classifier.isQuote("'")).toBe(true);
    expect(fixture.classifier.isQuote('x')).toBe(false);
  });
});

// ============================================================================
// packages/core-console-cli/tests/parser/TokenizerContextFactory.test.ts
// ============================================================================

describe('TokenizerContextFactory', () => {
  it('should create an empty context', () => {
    const fixture = createTokenizerFixture();

    const context = fixture.createContext();

    expect(context).toEqual({
      tokens: [],
      buffer: '',
      activeQuote: undefined,
      returnState: undefined,
    });
  });
});

// ============================================================================
// packages/core-console-cli/tests/parser/TokenizerContextMutator.test.ts
// ============================================================================

describe('TokenizerContextMutator', () => {
  it('should append characters to the buffer', () => {
    const fixture = createTokenizerFixture();

    const context = fixture.append(fixture.createContext(), 'abc');

    expect(context.buffer).toBe('abc');
    expect(context.tokens).toEqual([]);
  });

  it('should flush buffer into tokens', () => {
    const fixture = createTokenizerFixture();

    const appended = fixture.append(fixture.createContext(), 'hello');
    const flushed = fixture.mutator.flush(appended);

    expect(flushed.buffer).toBe('');
    expect(flushed.tokens).toEqual(['hello']);
  });

  it('should not add an empty token on flush', () => {
    const fixture = createTokenizerFixture();

    const flushed = fixture.mutator.flush(fixture.createContext());

    expect(flushed.buffer).toBe('');
    expect(flushed.tokens).toEqual([]);
  });

  it('should open and close quotes', () => {
    const fixture = createTokenizerFixture();

    const opened = fixture.openQuote(fixture.createContext(), '"');
    const closed = fixture.mutator.closeQuote(opened);

    expect(opened.activeQuote).toBe('"');
    expect(closed.activeQuote).toBeUndefined();
  });

  it('should set and clear return state', () => {
    const fixture = createTokenizerFixture();

    const withState = fixture.mutator.setReturnState(
      fixture.createContext(),
      'quoted',
    );
    const cleared = fixture.mutator.clearReturnState(withState);

    expect(withState.returnState).toBe('quoted');
    expect(cleared.returnState).toBeUndefined();
  });
});

// ============================================================================
// packages/core-console-cli/tests/parser/TokenizerInputFactory.test.ts
// ============================================================================

describe('TokenizerInputFactory', () => {
  it('should create char input', () => {
    const fixture = createTokenizerFixture();

    const input = fixture.createChar('a');

    expect(input).toEqual({
      type: 'char',
      payload: { value: 'a' },
    });
  });

  it('should create end input', () => {
    const fixture = createTokenizerFixture();

    const input = fixture.createEnd();

    expect(input).toEqual({
      type: 'end',
      payload: {},
    });
  });
});

// ============================================================================
// packages/core-console-cli/tests/parser/CliInputTokenizer.test.ts
// ============================================================================

describe('CliInputTokenizer', () => {
  it('should return empty tokens for empty input', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize('');

    expect(result).toEqual([]);
  });

  it('should tokenize a plain command line', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize('create --name dan --count 2');

    expect(result).toEqual(['create', '--name', 'dan', '--count', '2']);
  });

  it('should keep double quoted text together', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize('create --name "Dan Edvard"');

    expect(result).toEqual(['create', '--name', 'Dan Edvard']);
  });

  it('should keep single quoted text together', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(`create --name 'Dan Edvard'`);

    expect(result).toEqual(['create', '--name', 'Dan Edvard']);
  });

  it('should preserve whitespace inside quotes', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(`cmd "a b c" tail`);

    expect(result).toEqual(['cmd', 'a b c', 'tail']);
  });

  it('should support escaped whitespace outside quotes', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(String.raw`cmd file\ name.txt`);

    expect(result).toEqual(['cmd', 'file name.txt']);
  });

  it('should support escaped quote characters inside quotes', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(String.raw`cmd "Dan \"The Man\""`);

    expect(result).toEqual(['cmd', 'Dan "The Man"']);
  });

  it('should support escaped single quote characters inside single quotes', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(String.raw`cmd 'it\'s fine'`);

    expect(result).toEqual(['cmd', `it's fine`]);
  });

  it('should flush the final token on end input', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize('single');

    expect(result).toEqual(['single']);
  });

  it('should flush quoted content when input ends', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(`cmd "unfinished quote`);

    expect(result).toEqual(['cmd', 'unfinished quote']);
  });

  it('should flush escaped final content when input ends after escape state', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(String.raw`cmd abc\ `);

    expect(result).toEqual(['cmd', 'abc ']);
  });

  it('should ignore repeated whitespace between tokens', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize('cmd    alpha     beta');

    expect(result).toEqual(['cmd', 'alpha', 'beta']);
  });

  it('should handle path-like input with escaped spaces', async () => {
    const fixture = createTokenizerFixture();

    const result = await fixture.tokenize(
      String.raw`copy C:\temp\my\ file.txt "D:\target folder\out.txt"`,
    );

    expect(result).toEqual([
      'copy',
      'C:tempmy file.txt',
      'D:\\target folder\\out.txt',
    ]);
  });
});

// ============================================================================
// packages/core-console-cli/tests/parser/exports.smoke.test.ts
// ============================================================================

describe('parser exports', () => {
  it('should construct tokenizer collaborators', () => {
    const fixture = createTokenizerFixture();

    expect(fixture.classifier).toBeInstanceOf(TokenizerCharacterClassifier);
    expect(fixture.contextFactory).toBeInstanceOf(TokenizerContextFactory);
    expect(fixture.mutator).toBeInstanceOf(TokenizerContextMutator);
    expect(fixture.inputFactory).toBeInstanceOf(TokenizerInputFactory);
    expect(fixture.definitionFactory).toBeInstanceOf(TokenizerDefinitionFactory);
    expect(fixture.tokenizer).toBeInstanceOf(CliInputTokenizer);
  });
});