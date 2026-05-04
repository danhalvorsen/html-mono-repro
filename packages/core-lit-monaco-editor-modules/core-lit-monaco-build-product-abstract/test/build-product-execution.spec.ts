import { describe, expect, it } from "vitest";
import { buildExecutionProductFromSource } from "../src/build-product-execution.js";

describe("buildExecutionProductFromSource", () => {
  it("should create a success product with console output for executable code", () => {
    const source = `
      function greet(name: string): string {
        return \`Hello, \${name}!\`;
      }

      console.log(greet("Lit3"));
    `;

    const result = buildExecutionProductFromSource(source, {
      executedAtIso: "2026-05-01T00:00:00.000Z",
      durationMs: 7,
    });

    expect(result.status).toBe("success");
    expect(result.executedAtIso).toBe("2026-05-01T00:00:00.000Z");
    expect(result.durationMs).toBe(7);
    expect(result.greetingResult).toBe("Hello, Lit3!");
    expect(result.consoleLines).toContain("Hello, Lit3!");
  });

  it("should report runtime failures in console output", () => {
    const source = `throw new Error("boom")`;
    const result = buildExecutionProductFromSource(source);

    expect(result.consoleLines.some((line) => line.includes("[runtime error] boom"))).toBe(true);
  });
});
