import { describe, it, expect } from "vitest";
import { DefaultStyle } from "../src/styles/defaultStyle.js";

describe("DefaultStyle", () => {
  it("formats a simple message", async () => {
    const style = new DefaultStyle();

    const formatted = await style.format(
      "info",
      "Hello World",
      "TestCategory"
    );

    expect(formatted).toContain("TestCategory");
    expect(formatted).toContain("Hello World");
    expect(formatted).toMatch(/─/); // border char
  });

  it("supports long messages", async () => {
    const style = new DefaultStyle();

    const message = "A".repeat(80);
    const formatted = await style.format("debug", message, "LongTest");

    expect(formatted.length).toBeGreaterThan(80);
    expect(formatted).toContain(message);
  });
});
