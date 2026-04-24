import { parseArgs } from "node:util";
import type { CliOptionSchema, CliParseResult, CliParserLike } from "./CliTypes.js";

export class FallbackCliParser implements CliParserLike {
  public parseOptions(args: string[], schema: CliOptionSchema): CliParseResult {
    const options: Record<string, {
      type: "string" | "boolean";
      multiple: boolean;
      short?: string;
    }> = {};

    for (const [name, definition] of Object.entries(schema)) {
      options[name] = {
        type: definition.type === "number" ? "string" : definition.type,
        multiple: definition.multiple ?? false,
        ...(definition.short !== undefined ? { short: definition.short } : {}),
      };
    }

    const parsed = parseArgs({
      args,
      options,
      strict: false,
      allowPositionals: true,
    });

    const values: Record<string, unknown> = { ...parsed.values };

    for (const [name, definition] of Object.entries(schema)) {
      if (definition.type !== "number") {
        continue;
      }

      const current = values[name];

      if (current === undefined) {
        continue;
      }

      values[name] = Array.isArray(current)
        ? current.map((entry) => Number(entry))
        : Number(current);
    }

    return {
      options: values,
      positionals: parsed.positionals,
    };
  }
}
