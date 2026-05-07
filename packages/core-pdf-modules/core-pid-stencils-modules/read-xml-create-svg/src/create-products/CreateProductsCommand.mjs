export class CreateProductsCommand {
  #catalogFactory;
  #writer;
  #logger;

  constructor(catalogFactory, writer, logger) {
    this.#catalogFactory = catalogFactory;
    this.#writer = writer;
    this.#logger = logger;
  }

  async execute(options) {
    const catalog = await this.#catalogFactory.create(options.inputDirectory);
    await this.#writer.write(options.outputFile, catalog);

    this.#logger.info(`Created ${catalog.productCount} products from ${catalog.categoryCount} XML files.`);
    this.#logger.info(`Output: ${options.outputFile}`);
  }
}