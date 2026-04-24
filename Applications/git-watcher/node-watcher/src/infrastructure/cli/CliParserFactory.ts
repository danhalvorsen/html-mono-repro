import { createRequire } from "node:module";
import type { CliParserLike } from "../../contracts/cli/CliTypes.js";
import { FallbackCliParser } from "./FallbackCliParser.js";

export class CliParserFactory {
  public create(): CliParserLike {
    const require = createRequire(import.meta.url);

    try {
      const coreConsoleCli = require("../../../../packages/core-console-cli/dist/code.js") as {
        CliParser: new () => CliParserLike;
      };

      return new coreConsoleCli.CliParser();
    } catch {
      return new FallbackCliParser();
    }
  }
}