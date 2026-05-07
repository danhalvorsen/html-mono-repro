import type { MxGraphPathCommand } from "../domain/MxGraphShape.js";

export class SvgPathDataConverter {
  public convert(commands: readonly MxGraphPathCommand[]): string {
    return commands.map((command) => this.convertCommand(command)).join(" ");
  }

  private convertCommand(command: MxGraphPathCommand): string {
    switch (command.kind) {
      case "move":
        return `M ${this.format(command.x)} ${this.format(command.y)}`;

      case "line":
        return `L ${this.format(command.x)} ${this.format(command.y)}`;

      case "arc":
        return [
          "A",
          this.format(command.rx),
          this.format(command.ry),
          this.format(command.xAxisRotation),
          this.format(command.largeArcFlag),
          this.format(command.sweepFlag),
          this.format(command.x),
          this.format(command.y)
        ].join(" ");

      case "close":
        return "Z";
    }
  }

  private format(value: number): string {
    return value.toString();
  }
}