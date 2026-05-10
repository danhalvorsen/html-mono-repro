import { describe, expect, it } from "vitest";
import { CreateProductsCommand } from "../../src/create-products/CreateProductsCommand.mjs";

class FakeCatalogFactory {
  public async create(inputDirectory: string): Promise<unknown> {
    return {
      categoryCount: 1,
      productCount: 2,
      inputDirectory,
      categories: [],
    };
  }
}

class FakeWriter {
  public written: { outputFile: string; catalog: unknown } | undefined;

  public async write(outputFile: string, catalog: unknown): Promise<void> {
    this.written = { outputFile, catalog };
  }
}

class FakeLogger {
  public readonly messages: string[] = [];

  public info(message: string): void {
    this.messages.push(message);
  }
}

describe("CreateProductsCommand", () => {
  it("should create catalog, write output, and log summary", async () => {
    const writer = new FakeWriter();
    const logger = new FakeLogger();

    const command = new CreateProductsCommand(
      new FakeCatalogFactory(),
      writer,
      logger,
    );

    await command.execute({
      inputDirectory: "input-dir",
      outputFile: "output-file",
    });

    expect(writer.written).toEqual({
      outputFile: "output-file",
      catalog: {
        categoryCount: 1,
        productCount: 2,
        inputDirectory: "input-dir",
        categories: [],
      },
    });

    expect(logger.messages).toEqual([
      "Created 2 products from 1 XML files.",
      "Output: output-file",
    ]);
  });
});
