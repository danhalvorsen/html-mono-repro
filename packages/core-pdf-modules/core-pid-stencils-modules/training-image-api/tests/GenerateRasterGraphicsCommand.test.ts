import { describe, expect, it } from "vitest";
import { GenerateRasterGraphicsCommand } from "../src/Commands/GenerateRasterGraphicsCommand.js";

describe("GenerateRasterGraphicsCommand", () => {
  it("should use png as default format", () => {
    const command = new GenerateRasterGraphicsCommand("valves", "ball-valve");

    expect(command.formats).toEqual(["png"]);
  });

  it("should use deterministic default resolutions", () => {
    const command = new GenerateRasterGraphicsCommand("valves", "ball-valve");

    expect(command.resolutions).toEqual([
      [128, 128],
      [256, 256],
      [512, 512],
      [1024, 1024],
    ]);
  });

  it("should use 36 degrees as default rotation step", () => {
    const command = new GenerateRasterGraphicsCommand("valves", "ball-valve");

    expect(command.stepDegrees).toBe(36);
  });

  it("should expose itself as the command message", () => {
    const command = new GenerateRasterGraphicsCommand("valves", "ball-valve");

    expect(command.message).toBe(command);
  });
});