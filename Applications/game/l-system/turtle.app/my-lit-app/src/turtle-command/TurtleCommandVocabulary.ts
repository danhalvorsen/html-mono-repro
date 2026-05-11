export const TurtleCommandKind = {
  Forward: "forward",
  TurnLeft: "turnLeft",
  TurnRight: "turnRight",
  PenUp: "penUp",
  PenDown: "penDown",
  PushState: "pushState",
  PopState: "popState",
  Reset: "reset",
  Clear: "clear",
  SetStroke: "setStroke",
  SetFill: "setFill",
} as const;

export type TurtleCommandKind =
  (typeof TurtleCommandKind)[keyof typeof TurtleCommandKind];

export const TurtleCommandKeyword = {
  Help: "help",
  HelpSymbol: "?",

  Forward: "forward",
  ForwardShort: "fd",
  Move: "move",

  Back: "back",
  Backward: "backward",
  BackShort: "bk",

  Left: "left",
  LeftShort: "lt",
  TurnLeft: "turnleft",

  Right: "right",
  RightShort: "rt",
  TurnRight: "turnright",

  PenUp: "penup",
  PenUpShort: "pu",

  PenDown: "pendown",
  PenDownShort: "pd",

  Push: "push",
  PushSymbol: "[",

  Pop: "pop",
  PopSymbol: "]",

  Reset: "reset",
  Clear: "clear",

  Stroke: "stroke",
  Fill: "fill",
} as const;

export type TurtleCommandKeyword =
  (typeof TurtleCommandKeyword)[keyof typeof TurtleCommandKeyword];

export const TurtleCommandHelpCategory = {
  Movement: "Movement",
  Pen: "Pen",
  StateStack: "State stack",
  Style: "Style",
  Canvas: "Canvas",
  Help: "Help",
} as const;

export type TurtleCommandHelpCategory =
  (typeof TurtleCommandHelpCategory)[keyof typeof TurtleCommandHelpCategory];

export const TurtleCommandParameterName = {
  Distance: "distance",
  Degrees: "degrees",
} as const;

export type TurtleCommandParameterName =
  (typeof TurtleCommandParameterName)[keyof typeof TurtleCommandParameterName];

export const TurtleCommandHelpLine = {
  Title: "Available turtle commands:",
  Forward: "forward <distance>     alias: fd, move",
  Back: "back <distance>        alias: backward, bk",
  Left: "left <degrees>         alias: lt, turnleft",
  Right: "right <degrees>        alias: rt, turnright",
  PenUp: "penup                  alias: pu",
  PenDown: "pendown                alias: pd",
  Push: "push                   alias: [",
  Pop: "pop                    alias: ]",
  Stroke: "stroke <color> <width>",
  Fill: "fill <color>",
  Clear: "clear",
  Reset: "reset",
  Help: "help                   alias: ?",
} as const;

export const TurtleCommandDiagnosticMessage = {
  UnknownCommand: (keyword: string): string =>
    `Unknown turtle command '${keyword}'.`,

  RequiresFiniteParameter: (
    command: string,
    parameterName: TurtleCommandParameterName,
  ): string =>
    `Command '${command}' requires a finite ${parameterName}.`,

  InvalidStroke:
    "Command 'stroke' requires: stroke <color> <positive-width>.",

  InvalidFill:
    "Command 'fill' requires: fill <color>.",
} as const;

export const TurtleCommandToken = {
  LineFeed: "\n",
  WindowsLineFeed: "\r\n",
  Empty: "",
  WhitespacePattern: /\s+/u,
  CommentPrefix: "#",
} as const;