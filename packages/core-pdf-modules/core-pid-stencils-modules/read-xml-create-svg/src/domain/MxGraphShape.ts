export interface MxGraphShape {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly aspect: string;
  readonly strokeWidth: string;
  readonly connections: readonly MxGraphConnection[];
  readonly background: readonly MxGraphDrawable[];
  readonly foreground: readonly MxGraphDrawable[];
}

export interface MxGraphConnection {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly perimeter: string;
}

export type MxGraphDrawable =
  | MxGraphPath
  | MxGraphEllipse
  | MxGraphStroke
  | MxGraphFillStroke
  | MxGraphLineJoin;

export interface MxGraphPath {
  readonly kind: "path";
  readonly commands: readonly MxGraphPathCommand[];
}

export interface MxGraphEllipse {
  readonly kind: "ellipse";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface MxGraphStroke {
  readonly kind: "stroke";
}

export interface MxGraphFillStroke {
  readonly kind: "fillstroke";
}

export interface MxGraphLineJoin {
  readonly kind: "linejoin";
  readonly join: string;
}

export type MxGraphPathCommand =
  | MxGraphMoveCommand
  | MxGraphLineCommand
  | MxGraphArcCommand
  | MxGraphCloseCommand;

export interface MxGraphMoveCommand {
  readonly kind: "move";
  readonly x: number;
  readonly y: number;
}

export interface MxGraphLineCommand {
  readonly kind: "line";
  readonly x: number;
  readonly y: number;
}

export interface MxGraphArcCommand {
  readonly kind: "arc";
  readonly rx: number;
  readonly ry: number;
  readonly xAxisRotation: number;
  readonly largeArcFlag: number;
  readonly sweepFlag: number;
  readonly x: number;
  readonly y: number;
}

export interface MxGraphCloseCommand {
  readonly kind: "close";
}