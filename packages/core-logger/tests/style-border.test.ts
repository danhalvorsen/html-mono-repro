import { describe, it, expect } from "vitest";
import { BorderStyle } from "../src/styles/borderStyle.js"

describe("BorderStyle", () => {
  it("renders solid border", async () => {
    const style = new BorderStyle("solid");

    const output = await style.format(
      "info",
      "Message",
      "BorderTest"
    );

    expect(output).toContain("─"); // solid char
    expect(output).toContain("Message");
    expect(output).toContain("BorderTest");
  });

  it("renders dashed border", async () => {
    const style = new BorderStyle("dashed");

    const output = await style.format("warn", "Warning", "DashTest");

    expect(output).toContain("-"); // dashed
  });

  it("renders dotted border", async () => {
    const style = new BorderStyle("dotted");

    const output = await style.format("debug", "Dot", "DotTest");

    expect(output).toContain("·"); // dotted
  });
});
