import chalk from "chalk";
import { LogStyleBase, LogLevel } from "./logStyle.js";

export class CircleStyle extends LogStyleBase {
  format(level: LogLevel, msg: string, category: string): string {
    const icon =
      level === "info"  ? "○" :
      level === "warn"  ? "◔" :
      level === "error" ? "●" :
                          "◑";

    return `${chalk.magenta(icon + " " + category)} ${chalk.white(msg)}`;
  }
} 