// src/styles/defaultStyle.ts
import chalk from "chalk";
import { boxText } from "../utils/textFormatting.js";
import { LogLevel, LogStyleBase } from "./logStyle.js";

export class DefaultStyle extends LogStyleBase {
  format(level: LogLevel, msg: string, category: string): string {
    const content =
      chalk.gray(`[${category}]`) +
      "\n" +
      chalk.white(msg);

    return boxText(content, { borderChar: "─" });
  }
}
