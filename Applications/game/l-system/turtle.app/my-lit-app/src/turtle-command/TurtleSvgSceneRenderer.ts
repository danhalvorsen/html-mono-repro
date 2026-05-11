import { DefaultTurtleFactory } from "@monorepo/game-turtle-abstract";
import {
  DefaultSvgPrimitiveAdapterRegistry,
  DefaultSvgTurtleRenderer,
  SvgCirclePrimitiveAdapter,
  SvgLinePrimitiveAdapter,
  SvgPolygonPrimitiveAdapter,
  SvgPolylinePrimitiveAdapter,
} from "@monorepo/game-turtle-svg";
import { CenteredSvgMapperPipeline } from "./CenteredSvgMapperPipeline.js";
import { TurtleMarkerFactory } from "./TurtleMarkerFactory.js";
import type {
  TurtleCommand,
  TurtleCommandDiagnostic,
  TurtleSvgSceneResult,
} from "./TurtleCommandContracts.js";
import {
  DefaultTurtleCommandSource,
} from "./TurtleCommandContracts.js";
import {
  TurtleCommandParser,
  type ITurtleCommandParser,
} from "./TurtleCommandParser.js";

export type TurtleSvgSceneRenderOptions = {
  readonly width: number;
  readonly height: number;
  readonly viewBox?: string;
};

export interface ITurtleSvgSceneRenderer {
  renderCommands(
    source: string,
    options: TurtleSvgSceneRenderOptions,
  ): TurtleSvgSceneResult;
}

export class TurtleSvgSceneRenderer implements ITurtleSvgSceneRenderer {
  public constructor(
    private readonly parser: ITurtleCommandParser = new TurtleCommandParser(),
    private readonly turtleFactory: DefaultTurtleFactory = new DefaultTurtleFactory(),
    private readonly markerFactory: TurtleMarkerFactory = new TurtleMarkerFactory(),
  ) {}

  public renderCommands(
    source: string = DefaultTurtleCommandSource,
    options: TurtleSvgSceneRenderOptions,
  ): TurtleSvgSceneResult {
    const parseResult = this.parser.parse(source);
    const turtle = this.turtleFactory.create3D();
    const diagnostics: TurtleCommandDiagnostic[] = [...parseResult.diagnostics];

    for (const command of parseResult.commands) {
      try {
        this.executeCommand(turtle, command);
      } catch (error) {
        diagnostics.push({
          lineNumber: command.lineNumber,
          source: command.source,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const primitives = turtle.primitives();
    const marker = this.markerFactory.createMarker(turtle.snapshot());
    const renderPrimitives = [...primitives, marker];

    const renderer = new DefaultSvgTurtleRenderer({
      adapterRegistry: new DefaultSvgPrimitiveAdapterRegistry([
        new SvgLinePrimitiveAdapter(),
        new SvgPolylinePrimitiveAdapter(),
        new SvgCirclePrimitiveAdapter(),
        new SvgPolygonPrimitiveAdapter(),
      ]),
      mapperPipeline: new CenteredSvgMapperPipeline({
        width: options.width,
        height: options.height,
      }),
    });

    const svgOptions =
      options.viewBox === undefined
        ? {
            width: options.width,
            height: options.height,
          }
        : {
            width: options.width,
            height: options.height,
            viewBox: options.viewBox,
          };

    return {
      svg: renderer.render(renderPrimitives, svgOptions),
      primitiveCount: primitives.length,
      diagnostics,
    };
  }

  private executeCommand(
    turtle: ReturnType<DefaultTurtleFactory["create3D"]>,
    command: TurtleCommand,
  ): void {
    switch (command.kind) {
      case "forward":
        turtle.forward(command.distance);
        return;

      case "turnLeft":
        turtle.turnLeft(command.degrees);
        return;

      case "turnRight":
        turtle.turnRight(command.degrees);
        return;

      case "penUp":
        turtle.penUp();
        return;

      case "penDown":
        turtle.penDown();
        return;

      case "pushState":
        turtle.pushState();
        return;

      case "popState":
        turtle.popState();
        return;

      case "reset":
        turtle.reset();
        return;

      case "clear":
        turtle.clear();
        return;

      case "setStroke":
        turtle.setStroke({
          color: command.color,
          width: command.width,
        });
        return;

      case "setFill":
        turtle.setFill({
          color: command.color,
        });
        return;

      default:
        this.assertNever(command);
    }
  }

  private assertNever(value: never): never {
    throw new Error(`Unsupported command: ${JSON.stringify(value)}`);
  }
}