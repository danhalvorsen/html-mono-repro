import type {
  TurtleCommand,
  TurtleCommandDiagnostic,
  TurtleCommandParseResult,
} from "./TurtleCommandContracts.js";
import {
  TurtleCommandDiagnosticMessage,
  TurtleCommandHelpCategory,
  TurtleCommandHelpLine,
  TurtleCommandKeyword,
  TurtleCommandKind,
  TurtleCommandParameterName,
  TurtleCommandToken,
  type TurtleCommandHelpCategory as TurtleCommandHelpCategoryValue,
  type TurtleCommandKeyword as TurtleCommandKeywordValue,
  type TurtleCommandParameterName as TurtleCommandParameterNameValue,
} from "./TurtleCommandVocabulary.js";

export interface ITurtleCommandParser {
  parse(source: string): TurtleCommandParseResult;
}

type TurtleCommandLineParseResult = {
  readonly command?: TurtleCommand;
  readonly diagnostic?: TurtleCommandDiagnostic;
};

type TurtleCommandLineContext = {
  readonly lineNumber: number;
  readonly source: string;
  readonly tokens: readonly string[];
  readonly keyword: string;
};

interface ITurtleCommandLineParser {
  readonly keywords: readonly TurtleCommandKeywordValue[];
  readonly category: TurtleCommandHelpCategoryValue;

  parse(context: TurtleCommandLineContext): TurtleCommandLineParseResult;

  help(): string;
}

interface ITurtleCommandParserRegistry {
  readonly parsers: readonly ITurtleCommandLineParser[];

  resolve(keyword: string): ITurtleCommandLineParser | undefined;
}

interface ITurtleCommandSourceTokenizer {
  tokenize(source: string): readonly TurtleCommandLineContext[];
}

interface INumberParser {
  parseFinite(value: string | undefined): number | undefined;
}

interface ITurtleHelpTextProvider {
  getHelpText(): string;
}

class TurtleCommandSourceTokenizer implements ITurtleCommandSourceTokenizer {
  public tokenize(source: string): readonly TurtleCommandLineContext[] {
    return source
      .replaceAll(
        TurtleCommandToken.WindowsLineFeed,
        TurtleCommandToken.LineFeed,
      )
      .split(TurtleCommandToken.LineFeed)
      .map((rawLine, index) => this.tokenizeLine(rawLine, index + 1))
      .filter((line): line is TurtleCommandLineContext => line !== undefined);
  }

  private tokenizeLine(
    rawLine: string,
    lineNumber: number,
  ): TurtleCommandLineContext | undefined {
    const line = this.stripFullLineComment(rawLine).trim();

    if (line.length === 0) {
      return undefined;
    }

    const tokens = line.split(TurtleCommandToken.WhitespacePattern);
    const keyword = tokens[0]?.toLowerCase();

    if (keyword === undefined) {
      return undefined;
    }

    return {
      lineNumber,
      source: rawLine,
      tokens,
      keyword,
    };
  }

  private stripFullLineComment(line: string): string {
    return line.trimStart().startsWith(TurtleCommandToken.CommentPrefix)
      ? TurtleCommandToken.Empty
      : line;
  }
}

class NumberParser implements INumberParser {
  public parseFinite(value: string | undefined): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }
}

class TurtleCommandParserRegistry implements ITurtleCommandParserRegistry {
  private readonly parsersByKeyword: ReadonlyMap<
    TurtleCommandKeywordValue,
    ITurtleCommandLineParser
  >;

  public constructor(
    public readonly parsers: readonly ITurtleCommandLineParser[],
  ) {
    this.parsersByKeyword = this.createParserMap(parsers);
  }

  public resolve(keyword: string): ITurtleCommandLineParser | undefined {
    return this.parsersByKeyword.get(keyword as TurtleCommandKeywordValue);
  }

  private createParserMap(
    parsers: readonly ITurtleCommandLineParser[],
  ): ReadonlyMap<TurtleCommandKeywordValue, ITurtleCommandLineParser> {
    const map = new Map<TurtleCommandKeywordValue, ITurtleCommandLineParser>();

    for (const parser of parsers) {
      for (const keyword of parser.keywords) {
        if (map.has(keyword)) {
          throw new Error(
            `Duplicate turtle command keyword registration: '${keyword}'.`,
          );
        }

        map.set(keyword, parser);
      }
    }

    return map;
  }
}

class TurtleHelpTextProvider implements ITurtleHelpTextProvider {
  public constructor(
    private readonly commandParsers: readonly ITurtleCommandLineParser[],
  ) {}

  public getHelpText(): string {
    const categories = this.groupByCategory(this.commandParsers);

    return [
      TurtleCommandHelpLine.Title,
      TurtleCommandToken.Empty,
      ...Array.from(categories.entries()).flatMap(([category, parsers]) => [
        `${category}:`,
        ...parsers.map((parser) => `  ${parser.help()}`),
        TurtleCommandToken.Empty,
      ]),
    ].join(TurtleCommandToken.LineFeed).trimEnd();
  }

  private groupByCategory(
    parsers: readonly ITurtleCommandLineParser[],
  ): ReadonlyMap<TurtleCommandHelpCategoryValue, readonly ITurtleCommandLineParser[]> {
    const grouped = new Map<
      TurtleCommandHelpCategoryValue,
      ITurtleCommandLineParser[]
    >();

    for (const parser of parsers) {
      const existing = grouped.get(parser.category) ?? [];
      existing.push(parser);
      grouped.set(parser.category, existing);
    }

    return grouped;
  }
}

abstract class NumberCommandParser implements ITurtleCommandLineParser {
  public abstract readonly keywords: readonly TurtleCommandKeywordValue[];
  public abstract readonly category: TurtleCommandHelpCategoryValue;

  protected constructor(
    private readonly numberParser: INumberParser,
    private readonly parameterName: TurtleCommandParameterNameValue,
  ) {}

  public parse(context: TurtleCommandLineContext): TurtleCommandLineParseResult {
    const value = this.numberParser.parseFinite(context.tokens[1]);

    if (value === undefined) {
      return {
        diagnostic: {
          lineNumber: context.lineNumber,
          source: context.source,
          message: TurtleCommandDiagnosticMessage.RequiresFiniteParameter(
            context.tokens[0] ?? context.keyword,
            this.parameterName,
          ),
        },
      };
    }

    return {
      command: this.createCommand(context, value),
    };
  }

  public abstract help(): string;

  protected abstract createCommand(
    context: TurtleCommandLineContext,
    value: number,
  ): TurtleCommand;
}

class ForwardCommandParser extends NumberCommandParser {
  public readonly keywords = [
    TurtleCommandKeyword.Forward,
    TurtleCommandKeyword.ForwardShort,
    TurtleCommandKeyword.Move,
  ] as const;

  public readonly category = TurtleCommandHelpCategory.Movement;

  public help(): string {
    return TurtleCommandHelpLine.Forward;
  }

  protected createCommand(
    context: TurtleCommandLineContext,
    distance: number,
  ): TurtleCommand {
    return {
      kind: TurtleCommandKind.Forward,
      distance,
      lineNumber: context.lineNumber,
      source: context.source,
    };
  }
}

class BackCommandParser extends NumberCommandParser {
  public readonly keywords = [
    TurtleCommandKeyword.Back,
    TurtleCommandKeyword.Backward,
    TurtleCommandKeyword.BackShort,
  ] as const;

  public readonly category = TurtleCommandHelpCategory.Movement;

  public help(): string {
    return TurtleCommandHelpLine.Back;
  }

  protected createCommand(
    context: TurtleCommandLineContext,
    distance: number,
  ): TurtleCommand {
    return {
      kind: TurtleCommandKind.Forward,
      distance: -distance,
      lineNumber: context.lineNumber,
      source: context.source,
    };
  }
}

class TurnLeftCommandParser extends NumberCommandParser {
  public readonly keywords = [
    TurtleCommandKeyword.Left,
    TurtleCommandKeyword.LeftShort,
    TurtleCommandKeyword.TurnLeft,
  ] as const;

  public readonly category = TurtleCommandHelpCategory.Movement;

  public help(): string {
    return TurtleCommandHelpLine.Left;
  }

  protected createCommand(
    context: TurtleCommandLineContext,
    degrees: number,
  ): TurtleCommand {
    return {
      kind: TurtleCommandKind.TurnLeft,
      degrees,
      lineNumber: context.lineNumber,
      source: context.source,
    };
  }
}

class TurnRightCommandParser extends NumberCommandParser {
  public readonly keywords = [
    TurtleCommandKeyword.Right,
    TurtleCommandKeyword.RightShort,
    TurtleCommandKeyword.TurnRight,
  ] as const;

  public readonly category = TurtleCommandHelpCategory.Movement;

  public help(): string {
    return TurtleCommandHelpLine.Right;
  }

  protected createCommand(
    context: TurtleCommandLineContext,
    degrees: number,
  ): TurtleCommand {
    return {
      kind: TurtleCommandKind.TurnRight,
      degrees,
      lineNumber: context.lineNumber,
      source: context.source,
    };
  }
}

class SimpleCommandParser implements ITurtleCommandLineParser {
  public constructor(
    public readonly keywords: readonly TurtleCommandKeywordValue[],
    private readonly commandKind:
      | typeof TurtleCommandKind.PenUp
      | typeof TurtleCommandKind.PenDown
      | typeof TurtleCommandKind.PushState
      | typeof TurtleCommandKind.PopState
      | typeof TurtleCommandKind.Reset
      | typeof TurtleCommandKind.Clear,
    public readonly category: TurtleCommandHelpCategoryValue,
    private readonly helpLine: string,
  ) {}

  public parse(context: TurtleCommandLineContext): TurtleCommandLineParseResult {
    return {
      command: {
        kind: this.commandKind,
        lineNumber: context.lineNumber,
        source: context.source,
      },
    };
  }

  public help(): string {
    return this.helpLine;
  }
}

class StrokeCommandParser implements ITurtleCommandLineParser {
  public readonly keywords = [TurtleCommandKeyword.Stroke] as const;
  public readonly category = TurtleCommandHelpCategory.Style;

  public constructor(private readonly numberParser: INumberParser) {}

  public parse(context: TurtleCommandLineContext): TurtleCommandLineParseResult {
    const color = context.tokens[1];
    const width = this.numberParser.parseFinite(context.tokens[2]);

    if (color === undefined || width === undefined || width <= 0) {
      return {
        diagnostic: {
          lineNumber: context.lineNumber,
          source: context.source,
          message: TurtleCommandDiagnosticMessage.InvalidStroke,
        },
      };
    }

    return {
      command: {
        kind: TurtleCommandKind.SetStroke,
        color,
        width,
        lineNumber: context.lineNumber,
        source: context.source,
      },
    };
  }

  public help(): string {
    return TurtleCommandHelpLine.Stroke;
  }
}

class FillCommandParser implements ITurtleCommandLineParser {
  public readonly keywords = [TurtleCommandKeyword.Fill] as const;
  public readonly category = TurtleCommandHelpCategory.Style;

  public parse(context: TurtleCommandLineContext): TurtleCommandLineParseResult {
    const color = context.tokens[1];

    if (color === undefined) {
      return {
        diagnostic: {
          lineNumber: context.lineNumber,
          source: context.source,
          message: TurtleCommandDiagnosticMessage.InvalidFill,
        },
      };
    }

    return {
      command: {
        kind: TurtleCommandKind.SetFill,
        color,
        lineNumber: context.lineNumber,
        source: context.source,
      },
    };
  }

  public help(): string {
    return TurtleCommandHelpLine.Fill;
  }
}

class HelpCommandParser implements ITurtleCommandLineParser {
  public readonly keywords = [
    TurtleCommandKeyword.Help,
    TurtleCommandKeyword.HelpSymbol,
  ] as const;

  public readonly category = TurtleCommandHelpCategory.Help;

  public constructor(private readonly helpTextProvider: ITurtleHelpTextProvider) {}

  public parse(context: TurtleCommandLineContext): TurtleCommandLineParseResult {
    return {
      diagnostic: {
        lineNumber: context.lineNumber,
        source: context.source,
        message: this.helpTextProvider.getHelpText(),
      },
    };
  }

  public help(): string {
    return TurtleCommandHelpLine.Help;
  }
}

class UnknownCommandDiagnosticFactory {
  public create(context: TurtleCommandLineContext): TurtleCommandDiagnostic {
    return {
      lineNumber: context.lineNumber,
      source: context.source,
      message: TurtleCommandDiagnosticMessage.UnknownCommand(context.keyword),
    };
  }
}

class DefaultTurtleCommandParserRegistryFactory {
  public create(): ITurtleCommandParserRegistry {
    const numberParser = new NumberParser();

    const commandParsers: readonly ITurtleCommandLineParser[] = [
      new ForwardCommandParser(numberParser, TurtleCommandParameterName.Distance),
      new BackCommandParser(numberParser, TurtleCommandParameterName.Distance),
      new TurnLeftCommandParser(numberParser, TurtleCommandParameterName.Degrees),
      new TurnRightCommandParser(numberParser, TurtleCommandParameterName.Degrees),

      new SimpleCommandParser(
        [TurtleCommandKeyword.PenUp, TurtleCommandKeyword.PenUpShort],
        TurtleCommandKind.PenUp,
        TurtleCommandHelpCategory.Pen,
        TurtleCommandHelpLine.PenUp,
      ),
      new SimpleCommandParser(
        [TurtleCommandKeyword.PenDown, TurtleCommandKeyword.PenDownShort],
        TurtleCommandKind.PenDown,
        TurtleCommandHelpCategory.Pen,
        TurtleCommandHelpLine.PenDown,
      ),
      new SimpleCommandParser(
        [TurtleCommandKeyword.Push, TurtleCommandKeyword.PushSymbol],
        TurtleCommandKind.PushState,
        TurtleCommandHelpCategory.StateStack,
        TurtleCommandHelpLine.Push,
      ),
      new SimpleCommandParser(
        [TurtleCommandKeyword.Pop, TurtleCommandKeyword.PopSymbol],
        TurtleCommandKind.PopState,
        TurtleCommandHelpCategory.StateStack,
        TurtleCommandHelpLine.Pop,
      ),
      new SimpleCommandParser(
        [TurtleCommandKeyword.Clear],
        TurtleCommandKind.Clear,
        TurtleCommandHelpCategory.Canvas,
        TurtleCommandHelpLine.Clear,
      ),
      new SimpleCommandParser(
        [TurtleCommandKeyword.Reset],
        TurtleCommandKind.Reset,
        TurtleCommandHelpCategory.Canvas,
        TurtleCommandHelpLine.Reset,
      ),

      new StrokeCommandParser(numberParser),
      new FillCommandParser(),
    ];

    const helpTextProvider = new TurtleHelpTextProvider(commandParsers);

    return new TurtleCommandParserRegistry([
      ...commandParsers,
      new HelpCommandParser(helpTextProvider),
    ]);
  }
}

export class TurtleCommandParser implements ITurtleCommandParser {
  private readonly unknownCommandDiagnosticFactory =
    new UnknownCommandDiagnosticFactory();

  public constructor(
    private readonly tokenizer: ITurtleCommandSourceTokenizer =
      new TurtleCommandSourceTokenizer(),
    private readonly registry: ITurtleCommandParserRegistry =
      new DefaultTurtleCommandParserRegistryFactory().create(),
  ) {}

  public parse(source: string): TurtleCommandParseResult {
    const commands: TurtleCommand[] = [];
    const diagnostics: TurtleCommandDiagnostic[] = [];

    for (const context of this.tokenizer.tokenize(source)) {
      const parser = this.registry.resolve(context.keyword);

      if (parser === undefined) {
        diagnostics.push(this.unknownCommandDiagnosticFactory.create(context));
        continue;
      }

      const result = parser.parse(context);

      if (result.command !== undefined) {
        commands.push(result.command);
      }

      if (result.diagnostic !== undefined) {
        diagnostics.push(result.diagnostic);
      }
    }

    return {
      commands,
      diagnostics,
    };
  }
}