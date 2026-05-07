import { describe, expect, it } from "vitest";
import { CommandLineOptions } from "../../src/create-products/CommandLineOptions.mjs";

class FakePathAdapter {
  public resolve(value: string): string {
    return `resolved:${value}`;
  }
}

describe("CommandLineOptions", () => {
  it("should use default input and output when arguments are empty", () => {
    const options = CommandLineOptions.fromArgv([], new FakePathAdapter());

    expect(options.inputDirectory).toBe("resolved:./data");
    expect(options.outputFile).toBe("resolved:./generated/products.json");
  });

  it("should read explicit input and output arguments", () => {
    const options = CommandLineOptions.fromArgv(
      ["--input", "./data/pid", "--output", "./out/products.json"],
      new FakePathAdapter(),
    );

    expect(options.inputDirectory).toBe("resolved:./data/pid");
    expect(options.outputFile).toBe("resolved:./out/products.json");
  });

  it("should reject missing option values", () => {
    expect(() =>
      CommandLineOptions.fromArgv(["--input"], new FakePathAdapter()),
    ).toThrow("Missing value for --input.");
  });
});
