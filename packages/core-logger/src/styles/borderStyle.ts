import chalk from "chalk";
import { LogStyleBase, LogLevel } from "./logStyle.js";

export class BorderStyle extends LogStyleBase {
  constructor(private borderType: "solid" | "dashed" | "dotted" = "solid") {
    super();
  }

  format(level: LogLevel, msg: string, category: string): string {
    const border =
      this.borderType === "solid" ? "─" :
      this.borderType === "dashed" ? "-" :
                                     "·";

    const text = `[${category}] ${level.toUpperCase()} → ${msg}`;
    const line = border.repeat(text.length);

    return (
      chalk.cyanBright(line) +
      "\n" +
      chalk.white(text) +
      "\n" +
      chalk.cyanBright(line)
    );
  }
}
