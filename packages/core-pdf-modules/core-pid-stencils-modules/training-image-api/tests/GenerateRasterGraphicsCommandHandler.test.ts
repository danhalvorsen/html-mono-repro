import { describe, expect, it } from "vitest";
import { GenerateRasterGraphicsCommand } from "../src/Commands/GenerateRasterGraphicsCommand.js";
import { ServerConfig } from "../src/Config/ServerConfig.js";
import { GenerateRasterGraphicsCommandHandler } from "../src/application/Handlers/GenerateRasterGraphicsCommandHandler.js";

type PngRequest = {
  readonly category: string;
  readonly itemName: string;
  readonly sourceSvgFile: string;
  readonly outputRoot: string;
  readonly stepDegrees: number;
  readonly resolutions: readonly [number, number][];
};

class CountingPngHandler {
  public readonly calls: PngRequest[] = [];

  public async handle(request: PngRequest): Promise<number> {
    this.calls.push(request);
    return 3;
  }
}

describe("GenerateRasterGraphicsCommandHandler", () => {
  it("should dispatch png generation when png format is requested", async () => {
    const pngHandler = new CountingPngHandler();

    const handler = new GenerateRasterGraphicsCommandHandler(
      new ServerConfig({
        sourceRoot: "source-svg",
        outputRoot: "generated-output",
      }),
      pngHandler as ConstructorParameters<
        typeof GenerateRasterGraphicsCommandHandler
      >[1],
    );

    const command = new GenerateRasterGraphicsCommand(
      "valves",
      "ball-valve",
      ["png"],
      90,
      [[128, 128]],
    );

    const result = await handler.handle(command);

    expect(result.sourceFilesFound).toBe(1);
    expect(result.filesGenerated).toBe(3);
    expect(result.errors).toEqual([]);

    expect(pngHandler.calls).toHaveLength(1);
    expect(pngHandler.calls[0]?.category).toBe("valves");
    expect(pngHandler.calls[0]?.itemName).toBe("ball-valve");
    expect(pngHandler.calls[0]?.sourceSvgFile).toContain("source-svg");
    expect(pngHandler.calls[0]?.sourceSvgFile).toContain("valves-ball-valve.svg");
    expect(pngHandler.calls[0]?.outputRoot).toBe("generated-output");
    expect(pngHandler.calls[0]?.stepDegrees).toBe(90);
    expect(pngHandler.calls[0]?.resolutions).toEqual([[128, 128]]);
  });

  it("should not call png handler when png format is not requested", async () => {
    const pngHandler = new CountingPngHandler();

    const handler = new GenerateRasterGraphicsCommandHandler(
      new ServerConfig({
        sourceRoot: "source-svg",
        outputRoot: "generated-output",
      }),
      pngHandler as ConstructorParameters<
        typeof GenerateRasterGraphicsCommandHandler
      >[1],
    );

    const command = new GenerateRasterGraphicsCommand(
      "valves",
      "ball-valve",
      ["webp"],
      90,
      [[128, 128]],
    );

    const result = await handler.handle(command);

    expect(result.sourceFilesFound).toBe(1);
    expect(result.filesGenerated).toBe(0);
    expect(result.errors).toEqual([]);
    expect(pngHandler.calls).toHaveLength(0);
  });
});