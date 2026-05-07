import { CommandLineOptions } from "./CommandLineOptions.mjs";
import { ConsoleLogger } from "./ConsoleLogger.mjs";
import { CreateProductsCommand } from "./CreateProductsCommand.mjs";
import { NodePathAdapter } from "./NodePathAdapter.mjs";
import { ProductCatalogFactory } from "./ProductCatalogFactory.mjs";
import { ProductCatalogWriter } from "./ProductCatalogWriter.mjs";
import { ShapeXmlParser } from "./ShapeXmlParser.mjs";
import { SystemClock } from "./SystemClock.mjs";
import { XmlEntityDecoder } from "./XmlEntityDecoder.mjs";
import { XmlFileFinder } from "./XmlFileFinder.mjs";

export class CreateProductsCompositionRoot {
  create(argv) {
    const options = CommandLineOptions.fromArgv(argv, new NodePathAdapter());

    const command = new CreateProductsCommand(
      new ProductCatalogFactory(
        new XmlFileFinder(),
        new ShapeXmlParser(new XmlEntityDecoder()),
        new SystemClock(),
      ),
      new ProductCatalogWriter(),
      new ConsoleLogger(),
    );

    return { command, options };
  }
}