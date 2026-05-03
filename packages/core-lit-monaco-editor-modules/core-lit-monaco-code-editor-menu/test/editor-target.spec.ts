import { describe, expect, it } from "vitest";
import {
  countCodeLines,
  readCodeFromTarget,
  writeCodeToTarget,
  type EditorReadableTarget,
  type EditorWritableTarget,
} from "../src/editor-target.js";

describe("editor-target", () => {
  it("should read source via getValue when available", () => {
    const target: EditorReadableTarget = {
      getValue: () => "console.log('x');",
    };

    expect(readCodeFromTarget(target)).toBe("console.log('x');");
  });

  it("should write source through setValue when available", () => {
    let persisted = "";
    const target: EditorWritableTarget = {
      setValue: (value: string) => {
        persisted = value;
      },
    };

    const written = writeCodeToTarget(target, "const a = 1;");

    expect(written).toBe(true);
    expect(persisted).toBe("const a = 1;");
  });

  it("should count lines deterministically", () => {
    expect(countCodeLines("a\nb\nc")).toBe(3);
    expect(countCodeLines("")).toBe(1);
  });
});
