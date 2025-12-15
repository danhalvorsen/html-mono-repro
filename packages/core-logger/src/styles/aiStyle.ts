import chalk from "chalk";
import { LogStyleBase, LogLevel } from "./logStyle.js";
import { DeepSeekRequestBuilder } from "../utils/deepseekRequestBuilder.js";
import { LogBuffer } from "./logBuffer.js";

export class AiStyle extends LogStyleBase {
  format(level: LogLevel, msg: string, category: string): string {
    const placeholder = chalk.gray("… AI resolving …");

    const id = LogBuffer.allocate(placeholder);

    // Background async work (not blocking, not Promise-returning)
    void this.runAsyncAI(id, msg, category);

    // Must return string IMMEDIATELY
    return `[${category}] ${msg}\n${placeholder}`;
  }

  private async runAsyncAI(id: number, msg: string, category: string) {
    try {
      const response = await DeepSeekRequestBuilder
        .create()
        .setPrompt(`Explain this error and propose a fix:\n${msg}`)
        .execute();

      LogBuffer.update(id, chalk.greenBright(`[AI] ${response}`));
    } catch (err) {
      LogBuffer.update(id, chalk.red(`[AI ERROR] ${String(err)}`));
    }
  }
}
