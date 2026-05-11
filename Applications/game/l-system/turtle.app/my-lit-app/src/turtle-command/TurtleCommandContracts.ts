export const TurtleCommandEventName = {
  CommandsChanged: "turtle-commands-changed",
} as const;

export type TurtleCommandEventName =
  (typeof TurtleCommandEventName)[keyof typeof TurtleCommandEventName];

export type TurtleCommandsChangedEventDetail = {
  readonly value: string;
};

export type TurtleCommandDiagnostic = {
  readonly lineNumber: number;
  readonly message: string;
  readonly source: string;
};

export type TurtleCommand =
  | ForwardCommand
  | TurnLeftCommand
  | TurnRightCommand
  | PenUpCommand
  | PenDownCommand
  | PushStateCommand
  | PopStateCommand
  | ResetCommand
  | ClearCommand
  | SetStrokeCommand
  | SetFillCommand;

export type TurtleCommandBase = {
  readonly lineNumber: number;
  readonly source: string;
};

export type ForwardCommand = TurtleCommandBase & {
  readonly kind: "forward";
  readonly distance: number;
};

export type TurnLeftCommand = TurtleCommandBase & {
  readonly kind: "turnLeft";
  readonly degrees: number;
};

export type TurnRightCommand = TurtleCommandBase & {
  readonly kind: "turnRight";
  readonly degrees: number;
};

export type PenUpCommand = TurtleCommandBase & {
  readonly kind: "penUp";
};

export type PenDownCommand = TurtleCommandBase & {
  readonly kind: "penDown";
};

export type PushStateCommand = TurtleCommandBase & {
  readonly kind: "pushState";
};

export type PopStateCommand = TurtleCommandBase & {
  readonly kind: "popState";
};

export type ResetCommand = TurtleCommandBase & {
  readonly kind: "reset";
};

export type ClearCommand = TurtleCommandBase & {
  readonly kind: "clear";
};

export type SetStrokeCommand = TurtleCommandBase & {
  readonly kind: "setStroke";
  readonly color: string;
  readonly width: number;
};

export type SetFillCommand = TurtleCommandBase & {
  readonly kind: "setFill";
  readonly color: string;
};

export type TurtleCommandParseResult = {
  readonly commands: readonly TurtleCommand[];
  readonly diagnostics: readonly TurtleCommandDiagnostic[];
};

export type TurtleSvgSceneResult = {
  readonly svg: string;
  readonly primitiveCount: number;
  readonly diagnostics: readonly TurtleCommandDiagnostic[];
};

export const DefaultTurtleCommandSource = [
  "# Turtle commands",
  "# aliases: fd, lt, rt, pu, pd, push, pop",
  "stroke #0f172a 2",
  "forward 80",
  "left 90",
  "forward 80",
  "left 90",
  "forward 80",
  "left 90",
  "forward 80",
  "",
  "# branch",
  "push",
  "left 45",
  "forward 55",
  "pop",
  "right 45",
  "forward 55",
].join("\n");