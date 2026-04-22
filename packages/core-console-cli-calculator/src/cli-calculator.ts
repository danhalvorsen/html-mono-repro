import readline from "node:readline";
import { pathToFileURL } from "node:url";
 
import type { ICommandBase } from "@monorepo/core-design-patterns-cqrs";
import {
  CliRunner,
  CommandRegistry,
  CliParser,
  CliCommand,
  UnknownCommandError,
  type CliActionDefinition,
  type CliCommandHandler,
  type CliInvocationContext,
  type CliOptionSchema,
} from '@monorepo/core-console-cli';

interface CalculateCommandPayload extends ICommandBase {
  readonly expression: string;
}

interface IExpressionEvaluator {
  evaluate(expression: string): number;
}

interface IOperator {
  readonly symbol: string;
  execute(left: number, right: number): number;
}

interface ICommandDefinitionFactory<TPayload extends ICommandBase, TResult> {
  create(): CliActionDefinition<TPayload, TResult>;
}

interface IConsole {
  writeLine(message: string): void;
}

interface ILineReader {
  onLine(handler: (line: string) => Promise<void>): void;
  close(): void;
}

class AdditionOperator implements IOperator {
  public readonly symbol = "+";

  public execute(left: number, right: number): number {
    return left + right;
  }
}

class SubtractionOperator implements IOperator {
  public readonly symbol = "-";

  public execute(left: number, right: number): number {
    return left - right;
  }
}

class MultiplicationOperator implements IOperator {
  public readonly symbol = "*";

  public execute(left: number, right: number): number {
    return left * right;
  }
}

class DivisionOperator implements IOperator {
  public readonly symbol = "/";

  public execute(left: number, right: number): number {
    if (right === 0) {
      throw new Error("Division by zero");
    }

    return left / right;
  }
}

class OperatorRegistry {
  private readonly operators = new Map<string, IOperator>();

  public constructor(operators: readonly IOperator[]) {
    for (const operator of operators) {
      this.operators.set(operator.symbol, operator);
    }
  }

  public get(symbol: string): IOperator {
    const operator = this.operators.get(symbol);

    if (!operator) {
      throw new Error(`Unsupported operator "${symbol}"`);
    }

    return operator;
  }
}

class ArithmeticExpression {
  public constructor(
    public readonly left: number,
    public readonly operator: string,
    public readonly right: number,
  ) {}
}

class ArithmeticExpressionParser {
  private static readonly pattern =
    /^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*$/;

  public parse(expression: string): ArithmeticExpression {
    const match = ArithmeticExpressionParser.pattern.exec(expression);

    if (!match) {
      throw new Error(`Invalid expression "${expression}"`);
    }

    return new ArithmeticExpression(
      Number(match[1]),
      match[2],
      Number(match[3]),
    );
  }
}

class ArithmeticExpressionEvaluator implements IExpressionEvaluator {
  public constructor(
    private readonly parser: ArithmeticExpressionParser,
    private readonly operatorRegistry: OperatorRegistry,
  ) {}

  public evaluate(expression: string): number {
    const parsed = this.parser.parse(expression);
    const operator = this.operatorRegistry.get(parsed.operator);

    return operator.execute(parsed.left, parsed.right);
  }
}

class CalculateCommandHandler
  implements CliCommandHandler<CalculateCommandPayload, number>
{
  public constructor(
    private readonly evaluator: IExpressionEvaluator,
  ) {}

  public async handle(
    command: CliCommand<CalculateCommandPayload>,
  ): Promise<number> {
    return this.evaluator.evaluate(command.payload.expression);
  }
}

class CalculatePayloadFactory {
  public create(invocation: CliInvocationContext): CalculateCommandPayload {
    const expression = invocation.options["expression"];

    if (expression === undefined) {
      throw new Error("Missing --expression");
    }

    return {
      expression: String(expression),
    };
  }
}

class CalculateCommandDefinitionFactory
  implements ICommandDefinitionFactory<CalculateCommandPayload, number>
{
  public constructor(
    private readonly handler: CliCommandHandler<CalculateCommandPayload, number>,
    private readonly payloadFactory: CalculatePayloadFactory,
  ) {}

  public create(): CliActionDefinition<CalculateCommandPayload, number> {
    const optionSchema: CliOptionSchema = {
      expression: {
        type: "string",
        short: "e",
        description: "Arithmetic expression",
      },
    };

    return {
      name: "calc",
      type: "command",
      description: "Evaluate arithmetic expression",
      aliases: ["c"],
      optionSchema,
      buildPayload: (invocation: CliInvocationContext) =>
        this.payloadFactory.create(invocation),
      handler: this.handler,
    };
  }
}

class NodeConsole implements IConsole {
  public writeLine(message: string): void {
    console.log(message);
  }
}

class ReadlineLineReader implements ILineReader {
  private readonly readlineInterface: readline.Interface;

  public constructor() {
    this.readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  public onLine(handler: (line: string) => Promise<void>): void {
    this.readlineInterface.on("line", (line) => {
      void handler(line);
    });
  }

  public close(): void {
    this.readlineInterface.close();
  }
}

class CalculatorCliApplication {
  private readonly runner: CliRunner;

  public constructor() {
    const operatorRegistry = new OperatorRegistry([
      new AdditionOperator(),
      new SubtractionOperator(),
      new MultiplicationOperator(),
      new DivisionOperator(),
    ]);

    const expressionParser = new ArithmeticExpressionParser();
    const evaluator = new ArithmeticExpressionEvaluator(
      expressionParser,
      operatorRegistry,
    );

    const handler = new CalculateCommandHandler(evaluator);
    const payloadFactory = new CalculatePayloadFactory();
    const definitionFactory = new CalculateCommandDefinitionFactory(
      handler,
      payloadFactory,
    );

    const registry = new CommandRegistry();
    registry.register(definitionFactory.create());

    this.runner = new CliRunner(
      registry,
      new CliParser(),
    );
  }

  public async execute(input: string): Promise<number> {
    const result = await this.runner.execute(input);
    return Number(result.result);
  }
}

class CalculatorCliHost {
  public constructor(
    private readonly application: CalculatorCliApplication,
    private readonly consoleWriter: IConsole,
    private readonly lineReader: ILineReader,
  ) {}

  public start(): void {
    this.writeWelcome();

    this.lineReader.onLine(async (line) => {
      const normalized = line.trim();

      if (normalized.length === 0) {
        return;
      }

      if (normalized.toLowerCase() === "exit") {
        this.lineReader.close();
        return;
      }

      await this.handleLine(normalized);
    });
  }

  private writeWelcome(): void {
    this.consoleWriter.writeLine("core-console-cli calculator demo");
    this.consoleWriter.writeLine('Example: calc --expression "1 + 2"');
    this.consoleWriter.writeLine('Example: calc --expression "3 * 9"');
    this.consoleWriter.writeLine('Example: calc --expression "10 / 5"');
    this.consoleWriter.writeLine('Type "exit" to quit');
    this.consoleWriter.writeLine("");
  }

  private async handleLine(input: string): Promise<void> {
    try {
      const result = await this.application.execute(input);
      this.consoleWriter.writeLine(`= ${result}`);
    } catch (error) {
      this.consoleWriter.writeLine(this.formatError(error));
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof UnknownCommandError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}

class CompositionRoot {
  public createHost(): CalculatorCliHost {
    const application = new CalculatorCliApplication();
    const consoleWriter = new NodeConsole();
    const lineReader = new ReadlineLineReader();

    return new CalculatorCliHost(
      application,
      consoleWriter,
      lineReader,
    );
  }
}

export function evaluateExpression(expression: string): number {
  const operatorRegistry = new OperatorRegistry([
    new AdditionOperator(),
    new SubtractionOperator(),
    new MultiplicationOperator(),
    new DivisionOperator(),
  ]);

  const parser = new ArithmeticExpressionParser();
  const evaluator = new ArithmeticExpressionEvaluator(parser, operatorRegistry);

  return evaluator.evaluate(expression);
}

const entryArg = process.argv[1];
const isDirectExecution =
  typeof entryArg === "string" &&
  import.meta.url === pathToFileURL(entryArg).href;

if (isDirectExecution) {
  new CompositionRoot().createHost().start();
}