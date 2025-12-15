import chalk from "chalk";
import { LogStyleBase, LogLevel } from "./logStyle.js";

export class FlexStyle extends LogStyleBase {
  format(level: LogLevel, msg: string, category: string): string {
    return chalk.blueBright(`[${category}]`) +
           " → " +
           chalk.white(msg);
  }
}
