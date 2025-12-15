// src/styles/minimalStyle.ts
import chalk from "chalk";
import { LogStyleBase, LogLevel } from "./logStyle.js";

export class MinimalStyle extends LogStyleBase {
  format(level: LogLevel, msg: string, category: string): string {
    const color =
      level === "info"  ? chalk.greenBright :
      level === "warn"  ? chalk.yellowBright :
      level === "error" ? chalk.redBright :
                          chalk.blueBright;

    return `${chalk.gray(category)} ${color(level.toUpperCase())}: ${msg}`;
  }
}
