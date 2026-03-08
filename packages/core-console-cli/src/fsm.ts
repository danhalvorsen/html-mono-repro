// ============================================================================
// packages/core-console-cli/src/fsm.ts
// ============================================================================

import {
  FsmBuilder,
  FsmEngine,
  IgnoreUnhandledInput,
  type FsmDefinition,
  type IInput,
} from '@monorepo/core-fsm';

export type TokenizerState =
  | 'default'
  | 'quoted-single'
  | 'quoted-double'
  | 'escaping-default'
  | 'escaping-single'
  | 'escaping-double';

export interface ValueInput extends IInput<'value', { readonly value: string }> {
  readonly type: 'value';
  readonly payload: { readonly value: string };
}

export interface WhitespaceInput extends IInput<'whitespace', Record<string, never>> {
  readonly type: 'whitespace';
  readonly payload: Record<string, never>;
}

export interface EscapeInput extends IInput<'escape', Record<string, never>> {
  readonly type: 'escape';
  readonly payload: Record<string, never>;
}

export interface SingleQuoteInput extends IInput<'single-quote', Record<string, never>> {
  readonly type: 'single-quote';
  readonly payload: Record<string, never>;
}

export interface DoubleQuoteInput extends IInput<'double-quote', Record<string, never>> {
  readonly type: 'double-quote';
  readonly payload: Record<string, never>;
}

export interface EndInput extends IInput<'end', Record<string, never>> {
  readonly type: 'end';
  readonly payload: Record<string, never>;
}

export type TokenizerInput =
  | ValueInput
  | WhitespaceInput
  | EscapeInput
  | SingleQuoteInput
  | DoubleQuoteInput
  | EndInput;

export interface TokenizerContext {
  readonly tokens: readonly string[];
  readonly buffer: string;
}

export interface IInputTokenizer {
  tokenize(input: string): Promise<string[]>;
}

export class TokenizerContextFactory {
  public create(): TokenizerContext {
    return {
      tokens: Object.freeze([]),
      buffer: '',
    };
  }
}

export class TokenizerContextMutator {
  public append(context: TokenizerContext, value: string): TokenizerContext {
    return {
      ...context,
      buffer: context.buffer + value,
    };
  }

  public flush(context: TokenizerContext): TokenizerContext {
    if (context.buffer.length === 0) {
      return context;
    }

    return {
      ...context,
      tokens: Object.freeze([...context.tokens, context.buffer]),
      buffer: '',
    };
  }
}

export class TokenizerInputFactory {
  public createValue(value: string): ValueInput {
    return {
      type: 'value',
      payload: { value },
    };
  }

  public createWhitespace(): WhitespaceInput {
    return {
      type: 'whitespace',
      payload: {},
    };
  }

  public createEscape(): EscapeInput {
    return {
      type: 'escape',
      payload: {},
    };
  }

  public createSingleQuote(): SingleQuoteInput {
    return {
      type: 'single-quote',
      payload: {},
    };
  }

  public createDoubleQuote(): DoubleQuoteInput {
    return {
      type: 'double-quote',
      payload: {},
    };
  }

  public createEnd(): EndInput {
    return {
      type: 'end',
      payload: {},
    };
  }
}

export class TokenizerCharacterClassifier {
  private static readonly WHITESPACE = /\s/;

  public classify(char: string, inputFactory: TokenizerInputFactory): TokenizerInput {
    if (char === '\\') {
      return inputFactory.createEscape();
    }

    if (char === "'") {
      return inputFactory.createSingleQuote();
    }

    if (char === '"') {
      return inputFactory.createDoubleQuote();
    }

    if (TokenizerCharacterClassifier.WHITESPACE.test(char)) {
      return inputFactory.createWhitespace();
    }

    return inputFactory.createValue(char);
  }
}

export class TokenizerDefinitionFactory {
  public constructor(
    private readonly mutator: TokenizerContextMutator = new TokenizerContextMutator(),
  ) {}

  public create(): FsmDefinition<
    TokenizerState,
    TokenizerContext,
    TokenizerInput,
    never
  > {
    const builder = new FsmBuilder<
      TokenizerState,
      TokenizerContext,
      TokenizerInput,
      never
    >();

    builder.initial('default');

    this.configureDefaultState(builder);
    this.configureQuotedSingleState(builder);
    this.configureQuotedDoubleState(builder);
    this.configureEscapingDefaultState(builder);
    this.configureEscapingSingleState(builder);
    this.configureEscapingDoubleState(builder);

    return builder.build();
  }

  private configureDefaultState(
    builder: FsmBuilder<TokenizerState, TokenizerContext, TokenizerInput, never>,
  ): void {
    builder
      .from('default')
      .on('value')
      .withAction(({ context, input }) => this.mutator.append(context, input.payload.value))
      .to('default');

    builder
      .from('default')
      .on('whitespace')
      .withAction(({ context }) => this.mutator.flush(context))
      .to('default');

    builder
      .from('default')
      .on('escape')
      .to('escaping-default');

    builder
      .from('default')
      .on('single-quote')
      .to('quoted-single');

    builder
      .from('default')
      .on('double-quote')
      .to('quoted-double');

    builder
      .from('default')
      .on('end')
      .withAction(({ context }) => this.mutator.flush(context))
      .to('default');
  }

  private configureQuotedSingleState(
    builder: FsmBuilder<TokenizerState, TokenizerContext, TokenizerInput, never>,
  ): void {
    builder
      .from('quoted-single')
      .on('value')
      .withAction(({ context, input }) => this.mutator.append(context, input.payload.value))
      .to('quoted-single');

    builder
      .from('quoted-single')
      .on('whitespace')
      .withAction(({ context }) => this.mutator.append(context, ' '))
      .to('quoted-single');

    builder
      .from('quoted-single')
      .on('escape')
      .to('escaping-single');

    builder
      .from('quoted-single')
      .on('single-quote')
      .to('default');

    builder
      .from('quoted-single')
      .on('double-quote')
      .withAction(({ context }) => this.mutator.append(context, '"'))
      .to('quoted-single');

    builder
      .from('quoted-single')
      .on('end')
      .withAction(({ context }) => this.mutator.flush(context))
      .to('default');
  }

  private configureQuotedDoubleState(
    builder: FsmBuilder<TokenizerState, TokenizerContext, TokenizerInput, never>,
  ): void {
    builder
      .from('quoted-double')
      .on('value')
      .withAction(({ context, input }) => this.mutator.append(context, input.payload.value))
      .to('quoted-double');

    builder
      .from('quoted-double')
      .on('whitespace')
      .withAction(({ context }) => this.mutator.append(context, ' '))
      .to('quoted-double');

    builder
      .from('quoted-double')
      .on('escape')
      .to('escaping-double');

    builder
      .from('quoted-double')
      .on('double-quote')
      .to('default');

    builder
      .from('quoted-double')
      .on('single-quote')
      .withAction(({ context }) => this.mutator.append(context, "'"))
      .to('quoted-double');

    builder
      .from('quoted-double')
      .on('end')
      .withAction(({ context }) => this.mutator.flush(context))
      .to('default');
  }

  private configureEscapingDefaultState(
    builder: FsmBuilder<TokenizerState, TokenizerContext, TokenizerInput, never>,
  ): void {
    builder
      .from('escaping-default')
      .on('value')
      .withAction(({ context, input }) => this.mutator.append(context, input.payload.value))
      .to('default');

    builder
      .from('escaping-default')
      .on('whitespace')
      .withAction(({ context }) => this.mutator.append(context, ' '))
      .to('default');

    builder
      .from('escaping-default')
      .on('escape')
      .withAction(({ context }) => this.mutator.append(context, '\\'))
      .to('default');

    builder
      .from('escaping-default')
      .on('single-quote')
      .withAction(({ context }) => this.mutator.append(context, "'"))
      .to('default');

    builder
      .from('escaping-default')
      .on('double-quote')
      .withAction(({ context }) => this.mutator.append(context, '"'))
      .to('default');

    builder
      .from('escaping-default')
      .on('end')
      .withAction(({ context }) => this.mutator.flush(context))
      .to('default');
  }

  private configureEscapingSingleState(
    builder: FsmBuilder<TokenizerState, TokenizerContext, TokenizerInput, never>,
  ): void {
    builder
      .from('escaping-single')
      .on('value')
      .withAction(({ context, input }) => this.mutator.append(context, input.payload.value))
      .to('quoted-single');

    builder
      .from('escaping-single')
      .on('whitespace')
      .withAction(({ context }) => this.mutator.append(context, ' '))
      .to('quoted-single');

    builder
      .from('escaping-single')
      .on('escape')
      .withAction(({ context }) => this.mutator.append(context, '\\'))
      .to('quoted-single');

    builder
      .from('escaping-single')
      .on('single-quote')
      .withAction(({ context }) => this.mutator.append(context, "'"))
      .to('quoted-single');

    builder
      .from('escaping-single')
      .on('double-quote')
      .withAction(({ context }) => this.mutator.append(context, '"'))
      .to('quoted-single');

    builder
      .from('escaping-single')
      .on('end')
      .withAction(({ context }) => this.mutator.flush(context))
      .to('default');
  }

  private configureEscapingDoubleState(
    builder: FsmBuilder<TokenizerState, TokenizerContext, TokenizerInput, never>,
  ): void {
    builder
      .from('escaping-double')
      .on('value')
      .withAction(({ context, input }) => this.mutator.append(context, input.payload.value))
      .to('quoted-double');

    builder
      .from('escaping-double')
      .on('whitespace')
      .withAction(({ context }) => this.mutator.append(context, ' '))
      .to('quoted-double');

    builder
      .from('escaping-double')
      .on('escape')
      .withAction(({ context }) => this.mutator.append(context, '\\'))
      .to('quoted-double');

    builder
      .from('escaping-double')
      .on('single-quote')
      .withAction(({ context }) => this.mutator.append(context, "'"))
      .to('quoted-double');

    builder
      .from('escaping-double')
      .on('double-quote')
      .withAction(({ context }) => this.mutator.append(context, '"'))
      .to('quoted-double');

    builder
      .from('escaping-double')
      .on('end')
      .withAction(({ context }) => this.mutator.flush(context))
      .to('default');
  }
}

export class CliInputTokenizer implements IInputTokenizer {
  public constructor(
    private readonly definitionFactory: TokenizerDefinitionFactory = new TokenizerDefinitionFactory(),
    private readonly contextFactory: TokenizerContextFactory = new TokenizerContextFactory(),
    private readonly inputFactory: TokenizerInputFactory = new TokenizerInputFactory(),
    private readonly classifier: TokenizerCharacterClassifier = new TokenizerCharacterClassifier(),
  ) {}

  public async tokenize(input: string): Promise<string[]> {
    const engine = this.createEngine();

    for (const char of input) {
      await engine.dispatch(this.classifier.classify(char, this.inputFactory));
    }

    await engine.dispatch(this.inputFactory.createEnd());

    return [...engine.context.tokens];
  }

  private createEngine(): FsmEngine<
    TokenizerState,
    TokenizerContext,
    TokenizerInput,
    never
  > {
    return new FsmEngine({
      definition: this.definitionFactory.create(),
      context: this.contextFactory.create(),
      unhandledInputPolicy: new IgnoreUnhandledInput(),
    });
  }
}